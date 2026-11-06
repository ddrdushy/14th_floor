#!/usr/bin/env python3
"""Floor 14: the detective's office above a Brickfields mamak, built procedurally in Blender (bpy).

Everything here is made from code: geometry, procedural Cycles materials, the KL skyline outside and four
lighting rigs (morning, afternoon, evening, night). It produces the office art the game streams in:

  * phone plates (2.5D): per time of day, a portrait and a landscape Cycles render from the game's
    `officeTall` and `office` camera views, plus an "fx" image (lamp / neon / lightning contributions,
    so the browser can switch the lamp, flicker the neon and flash lightning) and, per orientation, an
    "aux" image (linear depth for parallax and an object-id map for the window, hover glow and the ceiling).
  * desktop GLB: the room with lighting baked per time of day into two texture atlases, interactive objects
    as separate named nodes, meshopt-compressed with gltfpack.

Run (Blender 5.x as a Python module, `pip install bpy`):
    python3 tools/office/build_office.py scene              # build and save work/office.blend
    python3 tools/office/build_office.py plates [--tod night] [--orient portrait] [--quick]
    python3 tools/office/build_office.py bake   [--tod night] [--quick]
    python3 tools/office/build_office.py glb
    python3 tools/office/build_office.py preview --tod night --orient landscape --res 0.25 --samples 32

Coordinates are written in the game's three.js space (Y up, the back wall at z = -4) and converted with T().
The room layout mirrors src/three/OfficeScene.js so the clickable things line up.
"""
import argparse
import json
import math
import os
import random
import subprocess
import sys
import time

import bpy
import bmesh
from mathutils import Matrix, Vector

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.normpath(os.path.join(HERE, '..', '..'))
IMG = os.path.join(REPO, 'public', 'assets', 'img')
TEX = os.path.join(HERE, 'tex')  # photo textures (Google Flow), 1024 px, see prep_textures()
TEX_WORK = None  # set in main(): <work>/tex, derived textures

# ---------------------------------------------------------------- mirrored from src/three/OfficeScene.js
WIN = dict(x=-1.0, y=1.68, w=2.2, h=1.7)
BOARD = dict(x=1.75, y=1.74, w=2.1, h=1.4)
DESK = dict(x=-0.5, z=-3.15, top=0.8, w=2.0, d=0.95)
BACK = -4.0
WALL_T = 0.22  # thickness of the back wall; the glass sits in the reveal
VIEWS = {
    'title': dict(pos=(WIN['x'], 1.6, -1.45), look=(WIN['x'], 1.7, BACK)),
    'office': dict(pos=(0.4, 1.72, -0.4), look=(0.3, 1.26, BACK)),
    'officeTall': dict(pos=(-0.45, 1.76, -0.1), look=(-0.4, 0.95, BACK)),
}
# plates: (view, width, height, vertical fov the game uses at that aspect). Rendered with a little overscan
# so parallax never shows an edge; the game crops it back (src/three/officePlates.js reads plates.json).
PLATES = {
    'portrait': dict(view='officeTall', w=1080, h=1920, fov=68.0),
    'landscape': dict(view='office', w=1920, h=1080, fov=50.0),
}
OVERSCAN = 1.06
TODS = ['morning', 'afternoon', 'evening', 'night']
# object ids written to the aux map (G channel = id * 16)
IDS = dict(none=0, glass=1, phone=2, board=3, folder=4, lighter=5, cup=6, lamp=7, ceiling=8, screen=9, shade=10, wall=11, floor=12, desk=13)
# camera depth range encoded in the aux map (linear, metres)
DEPTH_NEAR, DEPTH_FAR = 0.3, 7.0


def T(x, y, z):
    """three.js (Y up, -Z forward) -> Blender (Z up)."""
    return Vector((x, -z, y))


def hsh(n):
    x = math.sin(n * 127.1 + 311.7) * 43758.5453
    return x - math.floor(x)


# ================================================================== photo textures
def prep_textures(work):
    """Derived textures from tools/office/tex: the leather pad re-cut to the desk inset's 2.5:1 shape (borders
    kept, centre stretched 1.6x across). Everything else is used as it is, tiled in the shaders."""
    global TEX_WORK
    from PIL import Image
    TEX_WORK = os.path.join(work, 'tex')
    os.makedirs(TEX_WORK, exist_ok=True)
    out = os.path.join(TEX_WORK, 'leather_pad.png')
    src = os.path.join(TEX, 'leather_green.jpg')
    if os.path.exists(src) and (not os.path.exists(out) or os.path.getmtime(out) < os.path.getmtime(src)):
        im = Image.open(src).convert('RGB')
        b = 24  # stitched border
        top = im.crop((0, 0, 1024, b))
        body = im.crop((0, 409, 1024, 1024))
        cw = int((1024 - 2 * b) * 1.6)
        def row(strip):
            h = strip.height
            mid = strip.crop((b, 0, 1024 - b, h)).resize((cw, h), Image.LANCZOS)
            r = Image.new('RGB', (cw + 2 * b, h))
            r.paste(strip.crop((0, 0, b, h)), (0, 0))
            r.paste(mid, (b, 0))
            r.paste(strip.crop((1024 - b, 0, 1024, h)), (cw + b, 0))
            return r
        t, bd = row(top), row(body)
        pad = Image.new('RGB', (t.width, t.height + bd.height))
        pad.paste(t, (0, 0))
        pad.paste(bd, (0, t.height))
        pad.save(out)
    return TEX_WORK


def tex(name):
    if name == 'leather_pad':
        return os.path.join(TEX_WORK or os.path.join(HERE, 'work', 'tex'), 'leather_pad.png')
    return os.path.join(TEX, name + '.jpg')


def has_tex(name):
    return os.path.exists(tex(name))


def hex_ratio(target, source):
    """Per-channel linear multiplier that moves a texture's mean colour (source hex) to the look we want (target hex)."""
    a, b = C(target), C(source)
    return tuple(min(4.0, x / max(y, 1e-4)) for x, y in zip(a, b))


# ================================================================== materials
class M:
    """A tiny node-graph builder for procedural Cycles materials."""

    def __init__(self, name):
        self.mat = bpy.data.materials.new(name)
        self.nt = self.mat.node_tree
        self.nt.nodes.clear()
        self.L = self.nt.links
        self.out = self.node('ShaderNodeOutputMaterial')
        self._pos = None
        self._obj = None

    def node(self, t, inputs=None, **props):
        n = self.nt.nodes.new(t)
        for k, v in props.items():
            setattr(n, k, v)
        for k, v in (inputs or {}).items():
            self.set(n.inputs[k], v)
        return n

    def set(self, sock, v):
        if isinstance(v, bpy.types.NodeSocket):
            self.L.new(v, sock)
        elif isinstance(v, bpy.types.Node):
            self.L.new(v.outputs[0], sock)
        else:
            if sock.type == 'RGBA' and len(v) == 3:
                v = (*v, 1.0)
            if sock.type == 'VECTOR' and isinstance(v, (int, float)):
                v = (v, v, v)
            sock.default_value = v

    # coordinates
    def pos(self):
        if not self._pos:
            self._pos = self.node('ShaderNodeNewGeometry').outputs['Position']
        return self._pos

    def obj(self):
        if not self._obj:
            self._obj = self.node('ShaderNodeTexCoord').outputs['Object']
        return self._obj

    def uv(self):
        return self.node('ShaderNodeTexCoord').outputs['UV']

    def mapping(self, v, scale=(1, 1, 1), loc=(0, 0, 0), rot=(0, 0, 0)):
        return self.node('ShaderNodeMapping', {'Vector': v, 'Scale': scale, 'Location': loc, 'Rotation': rot}).outputs[0]

    def sep(self, v):
        n = self.node('ShaderNodeSeparateXYZ', {'Vector': v})
        return n.outputs[0], n.outputs[1], n.outputs[2]

    def comb(self, x, y, z):
        return self.node('ShaderNodeCombineXYZ', {'X': x, 'Y': y, 'Z': z}).outputs[0]

    # textures
    def noise(self, v, scale, detail=4.0, rough=0.5, dist=0.0, color=False):
        n = self.node('ShaderNodeTexNoise', {'Vector': v, 'Scale': scale, 'Detail': detail, 'Roughness': rough, 'Distortion': dist})
        return n.outputs['Color'] if color else n.outputs['Fac']

    def voronoi(self, v, scale, rand=1.0, out='Distance', feature='F1'):
        n = self.node('ShaderNodeTexVoronoi', {'Vector': v, 'Scale': scale, 'Randomness': rand}, feature=feature)
        return n.outputs[out]

    def white(self, v):
        return self.node('ShaderNodeTexWhiteNoise', {'Vector': v}).outputs['Value']

    def wave(self, v, scale, dist=4.0, detail=3.0, kind='BANDS', direction='X', profile='SIN'):
        n = self.node('ShaderNodeTexWave', {'Vector': v, 'Scale': scale, 'Distortion': dist, 'Detail': detail}, wave_type=kind, wave_profile=profile)
        if kind == 'BANDS':
            n.bands_direction = direction
        else:
            n.rings_direction = direction
        return n.outputs['Fac']

    def image(self, path, v=None, extension='CLIP', colorspace='sRGB', projection='FLAT', blend=0.0, interp='Linear'):
        img = bpy.data.images.load(path, check_existing=True)
        img.colorspace_settings.name = colorspace
        n = self.node('ShaderNodeTexImage', extension=extension, projection=projection, interpolation=interp)
        if projection == 'BOX':
            n.projection_blend = blend
        n.image = img
        if v is not None:
            self.set(n.inputs['Vector'], v)
        return n

    # math
    def math(self, op, a, b=0.0, clamp=False):
        return self.node('ShaderNodeMath', {0: a, 1: b}, operation=op, use_clamp=clamp).outputs[0]

    def vmath(self, op, a, b=(0, 0, 0), scale=None):
        n = self.node('ShaderNodeVectorMath', {0: a, 1: b}, operation=op)
        if scale is not None:
            self.set(n.inputs[3], scale)
        return n.outputs['Value'] if op in ('LENGTH', 'DOT_PRODUCT', 'DISTANCE') else n.outputs['Vector']

    def mr(self, x, a, b, c=0.0, d=1.0, clamp=True, interp='LINEAR'):
        return self.node('ShaderNodeMapRange', {'Value': x, 'From Min': a, 'From Max': b, 'To Min': c, 'To Max': d}, clamp=clamp, interpolation_type=interp).outputs[0]

    def mixc(self, f, a, b, blend='MIX'):
        n = self.node('ShaderNodeMix', data_type='RGBA', blend_type=blend, clamp_result=False)
        self.set(n.inputs[0], f)
        self.set(n.inputs[6], a)
        self.set(n.inputs[7], b)
        return n.outputs[2]

    def mixf(self, f, a, b):
        n = self.node('ShaderNodeMix', data_type='FLOAT')
        self.set(n.inputs[0], f)
        self.set(n.inputs[2], a)
        self.set(n.inputs[3], b)
        return n.outputs[0]

    def ramp(self, f, stops, interp='LINEAR'):
        n = self.node('ShaderNodeValToRGB')
        self.set(n.inputs[0], f)
        cr = n.color_ramp
        cr.interpolation = interp
        while len(cr.elements) > 1:
            cr.elements.remove(cr.elements[-1])
        for i, (p, c) in enumerate(stops):
            e = cr.elements[0] if i == 0 else cr.elements.new(p)
            e.position = p
            e.color = (*c, 1.0) if len(c) == 3 else c
        return n.outputs['Color']

    def bump(self, h, strength=0.1, distance=0.01, normal=None):
        n = self.node('ShaderNodeBump', {'Height': h, 'Strength': strength, 'Distance': distance})
        if normal is not None:
            self.set(n.inputs['Normal'], normal)
        return n.outputs[0]

    def edges(self, radius=0.004, lo=0.02, hi=0.25):
        """1 on worn edges: the 'wear' attribute written on bevelled faces at build time (cheap: no bevel rays)."""
        a = self.node('ShaderNodeAttribute', attribute_name='wear', attribute_type='GEOMETRY').outputs['Fac']
        n = self.noise(self.obj(), 40, 4)
        return self.mr(self.math('MULTIPLY', a, self.mr(n, 0.35, 0.65, 0.2, 1.2)), 0.25, 0.9)

    def ao(self, dist=0.05, only_local=False):
        """Cavity proxy: the inverse of the wear attribute (flat faces read as 'open'); real occlusion comes from GI."""
        a = self.node('ShaderNodeAttribute', attribute_name='wear', attribute_type='GEOMETRY').outputs['Fac']
        return self.mr(a, 0.0, 1.0, 1.0, 0.85)

    def objrand(self, k=1.0):
        return self.math('MULTIPLY', self.node('ShaderNodeObjectInfo').outputs['Random'], k)

    def lum(self, c):
        return self.node('ShaderNodeRGBToBW', {'Color': c}).outputs[0]

    def bombed(self, path, P, size, extension='REPEAT', projection='FLAT', blend=0.0, seed=0.0):
        """The same photo texture sampled twice (different scale, offset and a quarter turn) and blended by a
        large noise, so no tile repeat reads. P is a metric coordinate; size is the tile size in metres."""
        a = self.image(path, self.mapping(P, scale=(1 / size,) * 3, loc=(seed, seed * 0.7, seed * 0.3)), extension, projection=projection, blend=blend).outputs['Color']
        b = self.image(path, self.mapping(P, scale=(1 / (size * 1.37),) * 3, loc=(0.37 + seed, 0.61, 0.23), rot=(0, 0, 1.5708) if projection == 'FLAT' else (0.0, 0.0, 0.0)), extension, projection=projection, blend=blend).outputs['Color']
        k = self.mr(self.noise(P, 0.45 / size, 3, 0.5), 0.38, 0.62)
        return self.mixc(k, a, b)

    def room_grime(self, P, kind='wall'):
        """Fake occlusion where surfaces meet: room corners, the ceiling line, along the skirting (0..1)."""
        x, y, z = self.sep(P)
        ax = self.math('ABSOLUTE', x)
        to_side = self.math('SUBTRACT', 3.0, ax)                     # distance to a side wall
        to_back = self.math('SUBTRACT', 4.0, y)                      # Blender y = -three z: back wall at y = 4
        to_front = self.math('ADD', y, 2.0)
        n = self.node('ShaderNodeNewGeometry').outputs['Normal']
        nx = self.math('ABSOLUTE', self.sep(n)[0])
        if kind == 'wall':
            corner = self.mixf(self.math('GREATER_THAN', nx, 0.5), to_side, self.math('MINIMUM', to_back, to_front))
            edge = self.math('MINIMUM', self.math('MINIMUM', corner, self.math('SUBTRACT', 3.0, z)), self.math('MAXIMUM', z, 0.0))
        else:  # floor / ceiling: distance to the nearest wall
            edge = self.math('MINIMUM', to_side, self.math('MINIMUM', to_back, to_front))
        g = self.mr(edge, 0.0, 0.45, 1.0, 0.0, interp='SMOOTHSTEP')
        return self.math('MULTIPLY', g, self.mr(self.noise(P, 3.0, 4), 0.25, 0.75, 0.6, 1.0))

    def up(self):
        """1 on faces pointing up (dust)."""
        n = self.node('ShaderNodeNewGeometry').outputs['Normal']
        return self.mr(self.sep(n)[2], 0.55, 0.95)

    def bsdf(self, **kw):
        names = {'base': 'Base Color', 'rough': 'Roughness', 'metal': 'Metallic', 'normal': 'Normal', 'spec': 'Specular IOR Level',
                 'coat': 'Coat Weight', 'coat_rough': 'Coat Roughness', 'coat_normal': 'Coat Normal', 'sheen': 'Sheen Weight', 'sheen_tint': 'Sheen Tint',
                 'trans': 'Transmission Weight', 'emit': 'Emission Color', 'emit_str': 'Emission Strength', 'alpha': 'Alpha', 'ior': 'IOR',
                 'sss': 'Subsurface Weight', 'sss_radius': 'Subsurface Radius', 'sss_scale': 'Subsurface Scale', 'thin': 'Thin Wall',
                 'aniso': 'Anisotropic', 'rough_diffuse': 'Diffuse Roughness'}
        p = self.node('ShaderNodeBsdfPrincipled')
        for k, v in kw.items():
            self.set(p.inputs[names[k]], v)
        return p

    def emission(self, color, strength):
        return self.node('ShaderNodeEmission', {'Color': color, 'Strength': strength})

    def done(self, shader, volume=None):
        self.set(self.out.inputs['Surface'], shader)
        if volume is not None:
            self.set(self.out.inputs['Volume'], volume)
        return self.mat


def C(hexs, k=1.0):
    """sRGB hex -> linear RGB tuple, times k."""
    hexs = hexs.lstrip('#')
    out = []
    for i in range(3):
        c = int(hexs[i * 2:i * 2 + 2], 16) / 255
        c = c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
        out.append(c * k)
    return tuple(out)


MATS = {}


def mat(name):
    return MATS[name]


def build_materials():
    # ---- painted plaster: sage-grey gloss paint gone chalky; grime low on the wall, smoke and damp at the top
    def paint(name, base, dark_floor=True, damp=0.5, photo=False, kind='wall'):
        m = M(name)
        P = m.pos()
        x, y, z = m.sep(P)
        big = m.noise(P, 0.9, 5, 0.6)
        fine = m.noise(P, 26, 8, 0.65)
        b1, b2 = C(base, 0.88), C(base, 1.04)
        crack = None
        if photo and has_tex('wall_sage'):
            # the plaster photo, 1.5 m a tile, box-projected in world space and bombed so it never repeats
            t = m.bombed(tex('wall_sage'), P, 1.5, projection='BOX', blend=0.25)
            col = m.mixc(1.0, t, hex_ratio(base, '#a5b1a0'), 'MULTIPLY')
            col = m.mixc(m.mr(big, 0.3, 0.7, 0.0, 0.25), col, C(base, 0.82))
            crack = m.lum(t)
        else:
            col = m.mixc(m.mr(big, 0.3, 0.7), b1, b2)
            col = m.mixc(m.mr(fine, 0.35, 0.7, 0.0, 0.12), col, C('#6b6656'))
        # damp tide-marks and mildew near the ceiling, worst in the corners and round the window head
        streak = m.noise(m.mapping(P, scale=(9, 9, 0.6)), 3.0, 6, 0.6)
        tide = m.mr(m.math('ADD', z, m.math('MULTIPLY', streak, 0.6)), 2.25, 2.95)
        mould = m.mr(m.noise(P, 5.5, 10, 0.75), 0.52, 0.7)
        col = m.mixc(m.math('MULTIPLY', tide, damp * 0.3), col, C('#8a7a52'))
        col = m.mixc(m.math('MULTIPLY', m.math('MULTIPLY', tide, mould), damp * 0.35), col, C('#4f4a36'))
        if dark_floor:
            low = m.mr(m.math('ADD', z, m.math('MULTIPLY', m.noise(P, 4, 6), 0.25)), 0.75, 1.25, 1, 0)
            col = m.mixc(m.math('MULTIPLY', low, 0.35), col, C('#4a4234'))
        # drip streaks running down from the window corners and the air-conditioner
        drip = m.noise(m.mapping(P, scale=(40, 40, 0.8)), 2.0, 4, 0.5)
        dripmask = m.math('MULTIPLY', m.mr(drip, 0.58, 0.72), m.mr(z, 0.9, 2.6, 0.4, 1.0))
        col = m.mixc(m.math('MULTIPLY', dripmask, 0.35 * damp), col, C('#5e5540'))
        if photo:
            col = m.mixc(m.math('MULTIPLY', m.room_grime(P, kind), 0.55), col, C(base, 0.3))
        nrm = m.bump(m.noise(P, 140, 3, 0.5), 0.12, 0.002)
        nrm = m.bump(m.noise(P, 2.2, 3, 0.5), 0.06, 0.02, nrm)
        if crack is not None:
            nrm = m.bump(crack, 0.25, 0.002, nrm)
        rough = m.mr(fine, 0.3, 0.7, 0.72, 0.92)
        return m.done(m.bsdf(base=col, rough=rough, normal=nrm, spec=0.4))

    MATS['wall'] = paint('wall', '#8c9e8e', damp=0.8, photo=True)
    MATS['reveal'] = paint('reveal', '#a3ad9c', damp=1.0, photo=True)
    MATS['ceiling'] = paint('ceiling', '#cfc8b2', dark_floor=False, damp=0.6, photo=True, kind='ceiling')
    MATS['door_paint'] = paint('door_paint', '#5d6b58', dark_floor=False, damp=0.2)

    # ---- timber: grain along object X, pores, varnish worn on edges and where hands go
    def wood(name, dark, mid, light, rough=0.38, wear=0.85, varnish=True, scale=1.0, grain_axis='X', coat=0.6, photo=True, tone=1.0):
        m = M(name)
        o = m.obj()
        st = (0.35, 9, 9) if grain_axis == 'X' else ((9, 0.35, 9) if grain_axis == 'Y' else (9, 9, 0.35))
        g = m.mapping(o, scale=tuple(s * scale for s in st))
        n = m.noise(g, 1.8, 8, 0.62, dist=2.2)
        rings = m.wave(m.mapping(o, scale=tuple(s * scale * 0.5 for s in st)), 2.2, dist=9, detail=4, kind='BANDS', direction='X' if grain_axis == 'X' else ('Y' if grain_axis == 'Y' else 'Z'))
        f = m.math('ADD', m.math('MULTIPLY', n, 0.65), m.math('MULTIPLY', rings, 0.35))
        pores = m.noise(m.mapping(o, scale=tuple(s * scale * 22 for s in st)), 4.0, 2, 0.5)
        if photo and has_tex('desk_mahogany'):
            # the mahogany photo laid along the grain axis (0.9 m a tile, mirrored so seams never show); each
            # piece of timber gets its own random offset; across the grain = the sum of the other two axes
            ox, oy, oz = m.sep(o)
            along = {'X': ox, 'Y': oy, 'Z': oz}[grain_axis]
            others = [c for k, c in (('X', ox), ('Y', oy), ('Z', oz)) if k != grain_axis]
            across = m.math('ADD', others[0], others[1])
            r = m.objrand(17.0)
            uvw = m.comb(m.math('ADD', m.math('DIVIDE', along, 0.9 / scale), r), m.math('ADD', m.math('DIVIDE', across, 0.9 / scale), m.math('MULTIPLY', r, 0.61)), 0.0)
            ta = m.image(tex('desk_mahogany'), uvw, 'MIRROR').outputs['Color']
            tb = m.image(tex('desk_mahogany'), m.mapping(uvw, scale=(0.73, 0.73, 1), loc=(0.41, 0.17, 0)), 'MIRROR').outputs['Color']
            t = m.mixc(m.mr(m.noise(o, 1.1, 3), 0.4, 0.6), ta, tb)
            col = m.mixc(1.0, t, tuple(k * tone for k in hex_ratio(mid, '#652f17')), 'MULTIPLY')
            f = m.math('ADD', m.math('MULTIPLY', m.lum(t), 1.6), m.math('MULTIPLY', n, 0.3))
        else:
            col = m.ramp(f, [(0.25, C(dark)), (0.5, C(mid)), (0.78, C(light))])
        col = m.mixc(m.mr(pores, 0.55, 0.75, 0, 0.35), col, C(dark, 0.5))
        e = m.edges(0.006)
        blot = m.mr(m.noise(o, 3.5, 6, 0.6), 0.5, 0.75)
        worn = m.math('MAXIMUM', m.math('MULTIPLY', e, wear), m.math('MULTIPLY', blot, wear * 0.2))
        col = m.mixc(m.math('MULTIPLY', worn, 0.6), col, m.mixc(1.0, col, (1.6, 1.45, 1.3), 'MULTIPLY'))
        col = m.mixc(m.math('MULTIPLY', m.mr(m.ao(0.03), 0.4, 1.0, 1.0, 0.0), 0.5), col, C(dark, 0.45))
        r = m.mixf(worn, rough, min(0.85, rough + 0.35))
        r = m.math('ADD', r, m.math('MULTIPLY', m.noise(o, 30, 4), 0.12))
        nrm = m.bump(m.math('ADD', pores, m.math('MULTIPLY', n, 0.3)), 0.06, 0.001)
        if varnish:
            return m.done(m.bsdf(base=col, rough=r, normal=nrm, coat=m.mixf(worn, coat, 0.1), coat_rough=0.12, spec=0.5))
        return m.done(m.bsdf(base=col, rough=r, normal=nrm, spec=0.4))

    MATS['desk'] = wood('desk', '#1e0c06', '#4a2010', '#6a3418', rough=0.3)
    MATS['desk_side'] = wood('desk_side', '#1a0a05', '#3e1a0d', '#5a2c15', rough=0.4, grain_axis='Z')
    MATS['panel'] = wood('panel', '#120905', '#24140b', '#362012', rough=0.45, grain_axis='Z', wear=0.4)
    MATS['rail'] = wood('rail', '#120905', '#24140b', '#3a2414', rough=0.4)
    MATS['frame_wood'] = wood('frame_wood', '#160b06', '#2e1a0e', '#452a16', rough=0.4)
    MATS['chair_wood'] = wood('chair_wood', '#160b05', '#2c170b', '#432612', rough=0.35, grain_axis='Z')
    MATS['radio_wood'] = wood('radio_wood', '#30180c', '#62361b', '#83512b', rough=0.3, scale=2.0)
    MATS['shelf'] = wood('shelf', '#2a1a10', '#4b3220', '#6a4a30', rough=0.6, varnish=False, photo=False)

    # ---- timber floorboards, 12 cm wide and 1.35 m long, running toward the window. Each board shows one
    # plank of the teak photo (10 planks across it, so the photo is 1.2 m square): a random plank, a random
    # place along it, flipped at random, and its own tone. Worn grey on the walking line, dust at the skirting.
    m = M('floor')
    P = m.pos()
    x, y, z = m.sep(P)
    BW, BL = 0.12, 1.35
    row = m.math('FLOOR', m.math('DIVIDE', x, BW))
    shift = m.math('MULTIPLY', m.white(m.comb(row, 3.1, 0.0)), BL)
    along = m.math('ADD', y, shift)
    col_i = m.math('FLOOR', m.math('DIVIDE', along, BL))
    uL = m.math('FRACT', m.math('DIVIDE', x, BW))
    vL = m.math('FRACT', m.math('DIVIDE', along, BL))
    bid = m.comb(row, col_i, 0.0)
    r1 = m.white(bid)
    r2 = m.white(m.vmath('ADD', bid, (5.3, 1.7, 0.0)))
    r3 = m.white(m.vmath('ADD', bid, (2.2, 8.1, 0.0)))
    flip = m.math('GREATER_THAN', r3, 0.5)
    uF = m.mixf(flip, uL, m.math('SUBTRACT', 1.0, uL))
    vF = m.mixf(flip, vL, m.math('SUBTRACT', 1.0, vL))
    gap = m.math('SUBTRACT', 1.0, m.math('MULTIPLY', m.math('MULTIPLY', m.mr(uL, 0.0, 0.035), m.mr(uL, 0.965, 1.0, 1.0, 0.0)),
                                                       m.math('MULTIPLY', m.mr(vL, 0.0, 0.0025), m.mr(vL, 0.9975, 1.0, 1.0, 0.0))))
    tone = m.math('ADD', 0.82, m.math('MULTIPLY', r2, 0.36))
    if has_tex('floor_teak'):
        k = m.math('FLOOR', m.math('MULTIPLY', r1, 9.999))
        tu = m.math('SUBTRACT', m.math('DIVIDE', m.math('ADD', k, m.math('ADD', 0.1, m.math('MULTIPLY', uF, 0.8))), 10.0), 0.002)
        tv = m.math('ADD', m.math('MULTIPLY', vF, BL / 1.2), m.math('MULTIPLY', r2, 3.0))
        t = m.image(tex('floor_teak'), m.comb(tu, tv, 0.0), 'MIRROR').outputs['Color']
        col = m.mixc(1.0, t, hex_ratio('#3a2414', '#524b45'), 'MULTIPLY')
        col = m.mixc(1.0, col, m.comb(tone, tone, tone), 'MULTIPLY')
        grain = m.lum(t)
    else:
        grain = m.noise(m.mapping(m.comb(y, x, 0.0), scale=(0.5, 14, 14)), 2.0, 8, 0.6, dist=2.5)
        col = m.ramp(m.math('ADD', m.math('MULTIPLY', grain, 0.6), m.math('MULTIPLY', r2, 0.5)), [(0.35, C('#140b06')), (0.62, C('#2a180d')), (0.85, C('#3d2514'))])
    walk = m.math('ADD', m.math('MULTIPLY', m.noise(P, 1.2, 4), 0.6), m.mr(m.vmath('DISTANCE', P, T(-0.2, 0, -1.8)), 0.4, 2.0, 0.6, 0.0))
    worn = m.mr(walk, 0.5, 0.95)
    col = m.mixc(m.math('MULTIPLY', worn, 0.4), col, C('#4a3d30'))
    col = m.mixc(m.mr(m.noise(P, 9, 8, 0.7), 0.55, 0.75, 0, 0.4), col, C('#24170e'))
    col = m.mixc(m.math('MULTIPLY', m.room_grime(P, 'floor'), 0.6), col, C('#1a140e'))
    col = m.mixc(gap, col, C('#0b0704'))
    r = m.mixf(worn, 0.24, 0.6)
    r = m.math('ADD', r, m.math('MULTIPLY', m.noise(P, 40, 4), 0.1))
    r = m.math('ADD', r, m.math('MULTIPLY', m.room_grime(P, 'floor'), 0.3))
    nrm = m.bump(m.math('SUBTRACT', 1.0, gap), 0.25, 0.002)
    nrm = m.bump(grain, 0.08, 0.001, nrm)
    MATS['floor'] = m.done(m.bsdf(base=col, rough=r, normal=nrm, coat=m.mixf(worn, 0.45, 0.0), coat_rough=0.15))

    # ---- green leather writing inset, rubbed pale where wrists rest
    m = M('leather')
    o = m.obj()
    grainl = m.voronoi(o, 520, out='Distance')
    if has_tex('leather_green'):
        # the leather pad photo, re-cut to the inset's shape (prep_textures); v = 0 is the edge nearest the chair
        t = m.image(tex('leather_pad'), m.uv(), 'EXTEND').outputs['Color']
        col = m.mixc(1.0, t, (0.75, 0.9, 0.72), 'MULTIPLY')
        rub = m.mr(m.lum(t), 0.04, 0.12)
    else:
        rub = m.mr(m.noise(o, 2.5, 5), 0.45, 0.7)
        col = m.mixc(rub, C('#16301f'), C('#3b4e33'))
        col = m.mixc(m.mr(m.noise(o, 12, 6), 0.55, 0.7, 0, 0.4), col, C('#0e1a12'))
    MATS['leather'] = m.done(m.bsdf(base=col, rough=m.mixf(rub, 0.45, 0.78), normal=m.bump(grainl, 0.15, 0.0005), sheen=0.15))

    # ---- metals
    def metal(name, color, rough=0.3, tarnish=None, fingerprints=0.15):
        m = M(name)
        o = m.obj()
        r = m.math('ADD', rough, m.math('MULTIPLY', m.mr(m.noise(o, 60, 6), 0.4, 0.7), fingerprints))
        col = C(color)
        if tarnish:
            t = m.math('MULTIPLY', m.mr(m.ao(0.02), 0.3, 1.0, 1.0, 0.0), 1.0)
            t = m.math('MAXIMUM', t, m.mr(m.noise(o, 18, 6), 0.55, 0.75, 0, 0.5))
            col = m.mixc(t, col, C(tarnish))
        scratches = m.noise(m.mapping(o, scale=(200, 3, 3), rot=(0, 0, 0.6)), 3, 2)
        r = m.math('ADD', r, m.math('MULTIPLY', m.mr(scratches, 0.6, 0.7), 0.1))
        return m.done(m.bsdf(base=col, metal=1.0, rough=r))

    MATS['brass'] = metal('brass', '#c99e55', 0.24, tarnish='#4a3a1c')
    MATS['chrome'] = metal('chrome', '#e3e6ea', 0.12, fingerprints=0.2)
    MATS['steel'] = metal('steel', '#9aa0a6', 0.35)
    MATS['iron'] = metal('iron', '#3a3b3d', 0.5, tarnish='#20160f')
    MATS['alu'] = metal('alu', '#c9cdd1', 0.32, fingerprints=0.05)

    def painted_metal(name, color, rough=0.45, chips=0.6, dust=0.5):
        m = M(name)
        o = m.obj()
        e = m.edges(0.005, 0.02, 0.2)
        chipn = m.mr(m.noise(o, 22, 8, 0.7), 0.5, 0.62)
        chip = m.math('MULTIPLY', e, chipn)
        chip = m.math('MAXIMUM', chip, m.math('MULTIPLY', m.mr(m.noise(o, 60, 8, 0.7), 0.68, 0.72), chips * 0.5))
        col = m.mixc(m.mr(m.noise(o, 3, 4), 0.3, 0.7), C(color, 0.85), C(color, 1.08))
        col = m.mixc(m.math('MULTIPLY', m.mr(m.ao(0.04), 0.3, 1.0, 1.0, 0.0), 0.6), col, C('#1d1a14'))
        dustm = m.math('MULTIPLY', m.up(), dust)
        col = m.mixc(m.math('MULTIPLY', dustm, m.mr(m.noise(o, 8, 6), 0.3, 0.7, 0.4, 0.9)), col, C('#8d8778'))
        r = m.mixf(dustm, rough, 0.9)
        metalc = m.mixc(chip, col, C('#6c6a66'))
        metalness = m.mixf(m.math('MULTIPLY', chip, chips), 0.0, 1.0)
        r = m.mixf(m.math('MULTIPLY', chip, chips), r, 0.35)
        return m.done(m.bsdf(base=metalc, rough=r, metal=metalness, normal=m.bump(m.noise(o, 90, 3), 0.05, 0.001)))

    MATS['cabinet'] = painted_metal('cabinet', '#4d5a44', 0.42)
    MATS['window_frame'] = painted_metal('window_frame', '#1f2a2a', 0.5, chips=0.8)
    MATS['fan_metal'] = painted_metal('fan_metal', '#2a2c2c', 0.45, chips=0.3)
    MATS['ac_plastic'] = painted_metal('ac_plastic', '#d8d4c2', 0.4, chips=0.0, dust=0.15)
    MATS['black_plastic'] = painted_metal('black_plastic', '#151618', 0.38, chips=0.0, dust=0.3)
    MATS['radio_plastic'] = painted_metal('radio_plastic', '#cbbd9a', 0.35, chips=0.1, dust=0.4)

    # ---- glass, ceramics, liquids
    m = M('glass')
    o = m.obj()
    dirt = m.mr(m.noise(m.mapping(o, scale=(3, 3, 0.6)), 4, 6), 0.5, 0.8, 0.0, 0.18)
    tr = m.node('ShaderNodeBsdfTransparent', {'Color': (0.92, 0.95, 0.94)})
    gl = m.node('ShaderNodeBsdfGlossy', {'Roughness': m.math('ADD', 0.02, m.math('MULTIPLY', dirt, 0.4)), 'Color': (1, 1, 1)})
    fr = m.node('ShaderNodeFresnel', {'IOR': 1.5}).outputs[0]
    mix1 = m.node('ShaderNodeMixShader', {0: m.math('ADD', m.math('MULTIPLY', fr, 0.7), 0.04), 1: tr, 2: gl})
    dif = m.node('ShaderNodeBsdfDiffuse', {'Color': (0.5, 0.5, 0.45)})
    MATS['glass'] = m.done(m.node('ShaderNodeMixShader', {0: dirt, 1: mix1, 2: dif}))

    m = M('shade_glass')  # the green banker's lamp shade: cased glass, green outside, white opal inside
    geo = m.node('ShaderNodeNewGeometry')
    back = geo.outputs['Backfacing']
    outside = m.bsdf(base=C('#0d4a26'), rough=0.08, coat=1.0, coat_rough=0.03, sss=0.0)
    inside = m.bsdf(base=C('#f3eedd'), rough=0.3, emit=C('#ffd9a0'), emit_str=0.0)
    tl = m.node('ShaderNodeBsdfTranslucent', {'Color': C('#2a9a52')})
    outer = m.node('ShaderNodeMixShader', {0: 0.22, 1: outside, 2: tl})
    MATS['shade_glass'] = m.done(m.node('ShaderNodeMixShader', {0: back, 1: outer, 2: inside}))

    m = M('ceramic')
    o = m.obj()
    crackle = m.voronoi(o, 90, out='Distance', feature='DISTANCE_TO_EDGE')
    col = m.mixc(m.mr(crackle, 0.0, 0.03, 0.25, 0.0), C('#efe9dc'), C('#b8a986'))
    MATS['ceramic'] = m.done(m.bsdf(base=col, rough=0.12, coat=0.6, coat_rough=0.05, sss=0.05, sss_radius=(0.5, 0.4, 0.3)))
    m = M('ceramic_green')
    MATS['ceramic_green'] = m.done(m.bsdf(base=C('#1f6b40'), rough=0.12, coat=0.6, coat_rough=0.05))
    m = M('kopi')
    MATS['kopi'] = m.done(m.bsdf(base=C('#1d0d05'), rough=0.06, coat=0.3, spec=0.6))
    m = M('ash_glass')
    gl = m.node('ShaderNodeBsdfGlass', {'Color': C('#c9d4cc'), 'Roughness': 0.06, 'IOR': 1.5})
    MATS['ash_glass'] = m.done(gl)
    m = M('ash')
    o = m.obj()
    MATS['ash'] = m.done(m.bsdf(base=m.mixc(m.noise(o, 80, 6), C('#3a3835'), C('#8d8a84')), rough=0.95, normal=m.bump(m.noise(o, 200, 4), 0.4, 0.001)))
    m = M('cig')
    o = m.obj()
    x, y, z = m.sep(o)
    MATS['cig'] = m.done(m.bsdf(base=m.mixc(m.mr(z, -0.004, 0.004), C('#c98a46'), C('#efe9de')), rough=0.7))

    # ---- paper, card, cork, fabric
    def paper(name, base, stains=0.0, ink=0.0, age=0.3):
        m = M(name)
        o = m.obj()
        uvx = m.pos()
        col = m.mixc(m.mr(m.noise(o, 6, 5), 0.3, 0.7), C(base, 0.92), C(base, 1.02))
        col = m.mixc(m.math('MULTIPLY', m.mr(m.noise(o, 1.5, 4), 0.4, 0.8), age), col, C('#b8995e'))
        if ink > 0:
            # typed lines: rows of short dark dashes (never legible)
            x, y, z = m.sep(o)
            rows = m.math('SINE', m.math('MULTIPLY', y, 900.0))
            rowmask = m.mr(rows, 0.55, 0.85)
            words = m.mr(m.noise(m.mapping(o, scale=(90, 4, 4)), 2.0, 2), 0.45, 0.5)
            band = m.math('MULTIPLY', m.mr(m.math('ABSOLUTE', x), 0.06, 0.07, 1, 0), m.mr(m.math('ABSOLUTE', y), 0.1, 0.11, 1, 0))
            col = m.mixc(m.math('MULTIPLY', m.math('MULTIPLY', m.math('MULTIPLY', rowmask, words), band), ink), col, C('#2a2a30'))
        if stains > 0:
            # kopi rings: coffee dries darkest at the rim
            for i in range(2):
                cx, cy = (hsh(i + 3) - 0.5) * 0.12, (hsh(i + 7) - 0.5) * 0.16
                d = m.vmath('DISTANCE', o, (cx, cy, 0.0))
                d = m.math('ADD', d, m.math('MULTIPLY', m.noise(o, 60, 3), 0.004))
                rr = 0.034 + hsh(i) * 0.008
                ring = m.mr(m.math('ABSOLUTE', m.math('SUBTRACT', d, rr)), 0.0, 0.0035, 1, 0)
                fill = m.mr(d, rr - 0.004, rr, 0.35, 0.0)
                st = m.math('MULTIPLY', m.math('MAXIMUM', ring, fill), stains * (0.7 if i else 1.0))
                col = m.mixc(st, col, C('#7a4a22'))
        return m.done(m.bsdf(base=col, rough=0.85, normal=m.bump(m.noise(o, 25, 4), 0.05, 0.002), sss=0.02))

    MATS['paper'] = paper('paper', '#ece5d2', age=0.2)
    MATS['paper_typed'] = paper('paper_typed', '#ebe4cf', ink=1.0, age=0.3)
    MATS['paper_stained'] = paper('paper_stained', '#e8dfc8', stains=1.0, ink=1.0, age=0.4)
    MATS['newsprint'] = paper('newsprint', '#d4cdb8', ink=0.8, age=0.6)
    MATS['manila'] = paper('manila', '#c9ab6c', age=0.5)
    MATS['card_white'] = paper('card_white', '#f1ede2', age=0.1)

    m = M('cork')
    o = m.pos()
    sp = m.voronoi(o, 260, out='Distance')
    n = m.noise(o, 40, 6)
    col = m.mixc(m.mr(sp, 0.0, 0.4), C('#3a2410'), C('#6e4a26'))
    col = m.mixc(m.mr(n, 0.4, 0.7, 0, 0.4), col, C('#82603a'))
    holes = m.mr(m.noise(o, 90, 2), 0.72, 0.74)
    col = m.mixc(holes, col, C('#2a1a0c'))
    MATS['cork'] = m.done(m.bsdf(base=col, rough=0.95, normal=m.bump(sp, 0.35, 0.002)))

    def fabric(name, color, color2=None, sheen=0.5, weave=600, rough=0.9):
        m = M(name)
        o = m.obj()
        x, y, z = m.sep(o)
        wv = m.math('MULTIPLY', m.math('SINE', m.math('MULTIPLY', x, weave)), m.math('SINE', m.math('MULTIPLY', z, weave)))
        n = m.noise(o, 8, 6)
        col = m.mixc(m.mr(n, 0.3, 0.7), C(color, 0.8), C(color2 or color, 1.08))
        col = m.mixc(m.math('MULTIPLY', m.mr(m.ao(0.06), 0.3, 1.0, 1.0, 0.0), 0.7), col, C(color, 0.35))
        return m.done(m.bsdf(base=col, rough=rough, sheen=sheen, sheen_tint=(1, 1, 1), normal=m.bump(wv, 0.15, 0.0008)))

    MATS['coat'] = fabric('coat', '#5e4c32', '#6a5638')
    MATS['coat_dark'] = fabric('coat_dark', '#3e3120')
    MATS['felt'] = fabric('felt', '#2e2925', weave=300)
    MATS['hatband'] = fabric('hatband', '#0e0d0c')
    MATS['speaker'] = fabric('speaker', '#6e5a3c', weave=900)
    MATS['binder_red'] = fabric('binder_red', '#6a1e1a', sheen=0.1, weave=200, rough=0.6)
    MATS['binder_blue'] = fabric('binder_blue', '#1f2c46', sheen=0.1, weave=200, rough=0.6)
    MATS['binder_black'] = fabric('binder_black', '#1a1a1c', sheen=0.1, weave=200, rough=0.6)
    MATS['binder_green'] = fabric('binder_green', '#24402c', sheen=0.1, weave=200, rough=0.6)
    MATS['umbrella'] = fabric('umbrella', '#141518', sheen=0.3, weave=500, rough=0.5)
    MATS['cable'] = fabric('cable', '#121212', sheen=0.1, rough=0.5)

    # rug: a worn, faded runner from Jalan Masjid India: deep red field, navy border, the pile rubbed thin
    m = M('rug')
    o = m.obj()
    x, y, z = m.sep(o)
    ax, ay = m.math('ABSOLUTE', x), m.math('ABSOLUTE', y)
    border = m.math('MAXIMUM', m.mr(ax, 1.2, 1.215), m.mr(ay, 0.8, 0.815))
    guard = m.math('MULTIPLY', m.math('MAXIMUM', m.mr(ax, 1.27, 1.28), m.mr(ay, 0.87, 0.88)), 1.0)
    diamond = m.math('ADD', m.math('MULTIPLY', ax, 0.55), ay)
    med = m.math('MULTIPLY', m.mr(diamond, 0.3, 0.5, 1, 0), 0.6)
    medring = m.mr(m.math('ABSOLUTE', m.math('SUBTRACT', diamond, 0.5)), 0.015, 0.025, 1, 0)
    field_n = m.noise(m.mapping(o, scale=(6, 6, 6)), 3.0, 4, 0.5)
    col = m.mixc(m.mr(field_n, 0.3, 0.7), C('#3e0e0a'), C('#5a1a12'))
    col = m.mixc(border, col, C('#1a2440'))
    col = m.mixc(guard, col, C('#5a1410'))
    fade = m.math('ADD', m.mr(m.noise(o, 1.2, 4), 0.4, 0.75, 0.0, 0.25), m.mr(m.vmath('LENGTH', m.comb(x, m.math('MULTIPLY', y, 1.4), 0)), 0.2, 0.9, 0.12, 0.0))
    col = m.mixc(fade, col, C('#6a5a4e'))
    pile = m.noise(o, 420, 3)
    col = m.mixc(m.mr(pile, 0.3, 0.7, 0.0, 0.35), col, C('#1a0806'))
    MATS['rug'] = m.done(m.bsdf(base=col, rough=0.95, sheen=0.1, normal=m.bump(pile, 0.25, 0.002)))

    # ---- cardboard archive box and a worn leather briefcase (floor clutter)
    m = M('cardboard')
    o = m.obj()
    ox, oy, oz = m.sep(o)
    flute = m.math('SINE', m.math('MULTIPLY', m.math('ADD', ox, oy), 900.0))
    col = m.mixc(m.mr(m.noise(o, 6, 6), 0.3, 0.7), C('#7e6040'), C('#8e6e48'))
    col = m.mixc(m.mr(m.noise(o, 2.0, 5), 0.6, 0.75, 0, 0.25), col, C('#5e4428'))
    col = m.mixc(m.math('MULTIPLY', m.edges(), 0.5), col, C('#c2a070'))
    MATS['cardboard'] = m.done(m.bsdf(base=col, rough=0.9, normal=m.bump(flute, 0.03, 0.0005)))
    m = M('briefcase')
    o = m.obj()
    col = m.mixc(m.mr(m.noise(o, 4, 6), 0.3, 0.7), C('#1c100a'), C('#24150c'))
    col = m.mixc(m.math('MULTIPLY', m.edges(), 0.25), col, C('#6a4630'))
    MATS['briefcase'] = m.done(m.bsdf(base=col, rough=m.mixf(m.math('MULTIPLY', m.edges(), 0.4), 0.42, 0.7), normal=m.bump(m.voronoi(o, 300), 0.12, 0.0006), coat=0.2, coat_rough=0.3))

    # ---- emitters and screens
    m = M('bulb')
    MATS['bulb'] = m.done(m.emission(C('#ffd6a0'), 18.0))
    m = M('tube_light')
    MATS['tube_light'] = m.done(m.emission(C('#ffe2b8'), 6.0))
    m = M('screen_off')
    MATS['screen_off'] = m.done(m.bsdf(base=(0.005, 0.006, 0.007), rough=0.05, coat=1.0, coat_rough=0.02))
    m = M('rubber')
    MATS['rubber'] = m.done(m.bsdf(base=C('#1a1a1a'), rough=0.7))
    m = M('plant')
    o = m.obj()
    col = m.mixc(m.noise(o, 20, 4), C('#1f4a1e'), C('#4f7a2a'))
    MATS['plant'] = m.done(m.bsdf(base=col, rough=0.45, sss=0.2, sss_radius=(0.2, 0.5, 0.1), coat=0.3))
    m = M('terracotta')
    o = m.obj()
    MATS['terracotta'] = m.done(m.bsdf(base=m.mixc(m.noise(o, 12, 6), C('#7a3a1e'), C('#a0552e')), rough=0.85, normal=m.bump(m.noise(o, 80, 3), 0.2, 0.001)))
    m = M('soil')
    MATS['soil'] = m.done(m.bsdf(base=C('#1e140c'), rough=1.0))
    m = M('clock_face')
    o = m.obj()
    x, y, z = m.sep(o)
    ang = m.node('ShaderNodeMath', {0: y, 1: x}, operation='ARCTAN2').outputs[0]
    r = m.vmath('LENGTH', o)
    ticks = m.math('MULTIPLY', m.mr(m.math('COSINE', m.math('MULTIPLY', ang, 60)), 0.92, 0.96), m.mr(r, 0.118, 0.122, 0, 1))
    ticks = m.math('MULTIPLY', ticks, m.mr(r, 0.135, 0.14, 1, 0))
    hours = m.math('MULTIPLY', m.mr(m.math('COSINE', m.math('MULTIPLY', ang, 12)), 0.985, 0.995), m.mr(r, 0.1, 0.104, 0, 1))
    hours = m.math('MULTIPLY', hours, m.mr(r, 0.138, 0.142, 1, 0))
    col = m.mixc(m.math('MAXIMUM', ticks, hours), m.mixc(m.mr(r, 0.05, 0.15, 0, 0.3), C('#efe7d2'), C('#c9b98f')), C('#151515'))
    MATS['clock_face'] = m.done(m.bsdf(base=col, rough=0.5, coat=0.8, coat_rough=0.05))

    # images from the game's own art: the calendar photo and a framed photograph
    def picture(name, file, rough=0.6, coat=0.0, aged=0.25):
        m = M(name)
        tex = m.image(os.path.join(IMG, file), m.uv())
        col = m.mixc(aged, tex.outputs['Color'], C('#a08a5a'), 'MULTIPLY')
        col = m.mixc(aged * 0.5, col, C('#d8c8a0'))
        return m.done(m.bsdf(base=col, rough=rough, coat=coat, coat_rough=0.05))

    MATS['calendar_photo'] = picture('calendar_photo', 'c2_intro_03_highway.jpg', 0.5, 0.3, 0.15)
    MATS['photo'] = picture('photo', 'c3_intro_05_chulia.jpg', 0.3, 0.6, 0.35)

    m = M('calendar_grid')  # a month grid in faded red and black, no words
    o = m.uv()
    u, v, _ = m.sep(o)
    cu = m.math('FRACT', m.math('MULTIPLY', u, 7))
    cv = m.math('FRACT', m.math('MULTIPLY', v, 5))
    lines = m.math('MAXIMUM', m.mr(cu, 0.0, 0.04, 1, 0), m.mr(cv, 0.0, 0.05, 1, 0))
    digit = m.math('MULTIPLY', m.mr(m.vmath('DISTANCE', m.comb(cu, cv, 0), (0.25, 0.72, 0)), 0.06, 0.1, 1, 0), 1.0)
    sunday = m.mr(u, 0.0, 0.143, 1, 0)
    ink = m.mixc(sunday, C('#202020'), C('#a01e1e'))
    col = m.mixc(m.math('MAXIMUM', m.math('MULTIPLY', lines, 0.5), digit), C('#f2ede0'), ink)
    MATS['calendar_grid'] = m.done(m.bsdf(base=col, rough=0.8))

    # the outside: facades, distant towers and their lit windows
    build_city_materials()

    # one flat override material for the id render: emission = object pass index
    m = M('id_override')
    oi = m.node('ShaderNodeObjectInfo').outputs['Object Index']
    MATS['id_override'] = m.done(m.emission(m.comb(oi, oi, oi), 1.0))
    no_emission_sampling()
    for mm in MATS.values():
        mm.use_fake_user = True


CITY = {}  # per-time-of-day knobs driven through value nodes on the city materials


def city_value(name, default):
    if name not in CITY:
        CITY[name] = []
    return default


def build_city_materials():
    """Facades and towers. Haze and window lights are driven by named Value nodes (set_city())."""

    def knob(m, name, default):
        n = m.node('ShaderNodeValue')
        n.outputs[0].default_value = default
        n.label = name
        CITY.setdefault(name, []).append(n)
        return n.outputs[0]

    def haze_mix(m, shader, P):
        d = m.vmath('DISTANCE', P, T(-1, 1.7, -4))
        dist = knob(m, 'haze_dist', 1500.0)
        f = m.math('SUBTRACT', 1.0, m.math('EXPONENT', m.math('DIVIDE', m.math('MULTIPLY', d, -1.0), dist)))
        hz = m.node('ShaderNodeRGB')
        hz.label = 'haze_color'
        CITY.setdefault('haze_color', []).append(hz)
        em = m.emission(hz.outputs[0], knob(m, 'haze_strength', 1.0))
        return m.node('ShaderNodeMixShader', {0: m.math('MULTIPLY', f, knob(m, 'haze_amount', 1.0)), 1: shader, 2: em})

    def windows(m, P, floor_h, bay_w, lit_frac_knob, warm, sill=0.3, head=0.25, gap=0.35, lit_mul=1.0):
        x, y, z = m.sep(P)
        u = m.math('ADD', x, m.math('MULTIPLY', y, 0.7))
        cu = m.math('DIVIDE', u, bay_w)
        cz = m.math('DIVIDE', z, floor_h)
        fu = m.math('FRACT', cu)
        fz = m.math('FRACT', cz)
        win = m.math('MULTIPLY', m.mr(fu, gap * 0.5, gap * 0.5 + 0.03), m.mr(fu, 1 - gap * 0.5 - 0.03, 1 - gap * 0.5, 1, 0))
        win = m.math('MULTIPLY', win, m.math('MULTIPLY', m.mr(fz, sill, sill + 0.03), m.mr(fz, 1 - head - 0.03, 1 - head, 1, 0)))
        cell = m.comb(m.math('FLOOR', cu), m.math('FLOOR', cz), 0.0)
        rnd = m.white(cell)
        lit = m.math('MULTIPLY', win, m.math('LESS_THAN', rnd, lit_frac_knob))
        hue = m.white(m.vmath('ADD', cell, (7.3, 1.1, 0)))
        col = m.mixc(m.mr(hue, 0.0, 0.7), C('#ff9a40'), C(warm))
        col = m.mixc(m.mr(hue, 0.7, 0.72), col, C('#cfe0ff'))
        col = m.mixc(m.mr(hue, 0.93, 0.95), col, C('#8fd8ff'))
        # curtains and blinds: the lower part of many windows glows dimmer
        curtain = m.mr(fz, sill + 0.05, 1 - head, 1.0, 0.35)
        curtain = m.mixf(m.math('GREATER_THAN', m.white(m.vmath('ADD', cell, (1.7, 4.4, 0))), 0.5), 1.0, curtain)
        bright = m.math('MULTIPLY', m.math('MULTIPLY', lit, curtain), m.math('ADD', 0.25, m.math('MULTIPLY', m.white(m.vmath('ADD', cell, (3.1, 9.7, 0))), 0.9)))
        return win, col, m.math('MULTIPLY', bright, lit_mul)

    # near shophouses across the road: the shophouse photo on each front (per-shop props fw / fh = width and
    # height, set in build_city). The photo's top is the roofline; its two upper floors repeat downward on taller
    # shops; the bottom 3.4 m shows its shopfront. Each shop gets its own hue, value and a mirror. At night some
    # windows glow through their shutters.
    m = M('facade_near')
    P = m.pos()
    o = m.obj()
    ox, oy, oz = m.sep(o)
    fw = m.node('ShaderNodeAttribute', attribute_name='fw', attribute_type='OBJECT').outputs['Fac']
    fh = m.node('ShaderNodeAttribute', attribute_name='fh', attribute_type='OBJECT').outputs['Fac']
    rnd = m.node('ShaderNodeObjectInfo').outputs['Random']
    wet = knob(m, 'wet', 0.6)
    if has_tex('facade_shophouse'):
        u = m.math('ADD', m.math('DIVIDE', ox, fw), 0.5)
        u = m.mixf(m.math('GREATER_THAN', rnd, 0.5), u, m.math('SUBTRACT', 1.0, u))
        imgh = m.math('MULTIPLY', fw, 1.3)                       # the photo is stretched 1.3x tall: 2.9 m floors
        v = m.math('SUBTRACT', 0.97, m.math('DIVIDE', m.math('SUBTRACT', fh, oz), imgh))
        wrapped = m.math('ADD', 0.258, m.node('ShaderNodeMath', {0: m.math('SUBTRACT', v, 0.258), 1: 0.347}, operation='FLOORED_MODULO').outputs[0])
        v = m.mixf(m.math('LESS_THAN', v, 0.258), v, wrapped)
        v = m.mixf(m.math('LESS_THAN', oz, 3.4), v, m.math('MULTIPLY', m.math('DIVIDE', oz, 3.4), 0.25))
        t = m.image(tex('facade_shophouse'), m.comb(u, v, 0.0), 'EXTEND').outputs['Color']
        hs = m.node('ShaderNodeHueSaturation', {'Hue': m.math('ADD', 0.42, m.math('MULTIPLY', rnd, 0.2)), 'Saturation': m.math('ADD', 0.75, m.math('MULTIPLY', rnd, 0.5)),
                                                'Value': m.math('ADD', 0.72, m.math('MULTIPLY', m.white(m.comb(rnd, 2.0, 0.0)), 0.3)), 'Fac': 1.0, 'Color': t}).outputs[0]
        nz = m.sep(m.node('ShaderNodeNewGeometry').outputs['Normal'])[2]
        roof = m.mixc(m.noise(P, 1.5, 6), C('#4a4038'), C('#6a5a4a'))
        col = m.mixc(m.math('GREATER_THAN', nz, 0.6), hs, roof)
        # window glow: the photo's six window openings, a random few lit per shop per floor
        win_u = m.math('MAXIMUM', m.math('MAXIMUM', m.math('MULTIPLY', m.mr(u, 0.142, 0.15), m.mr(u, 0.255, 0.262, 1, 0)),
                                                     m.math('MULTIPLY', m.mr(u, 0.444, 0.452), m.mr(u, 0.558, 0.566, 1, 0))),
                           m.math('MULTIPLY', m.mr(u, 0.75, 0.758), m.mr(u, 0.865, 0.872, 1, 0)))
        win_v = m.math('MAXIMUM', m.math('MULTIPLY', m.mr(v, 0.61, 0.62), m.mr(v, 0.77, 0.78, 1, 0)), m.math('MULTIPLY', m.mr(v, 0.258, 0.268), m.mr(v, 0.426, 0.436, 1, 0)))
        win = m.math('MULTIPLY', m.math('MULTIPLY', win_u, win_v), m.math('LESS_THAN', nz, 0.6))
        cell = m.comb(m.math('FLOOR', m.math('MULTIPLY', u, 3.0)), m.math('FLOOR', m.math('DIVIDE', oz, 2.9)), m.math('MULTIPLY', rnd, 97.0))
        lit = m.math('MULTIPLY', win, m.math('LESS_THAN', m.white(cell), knob(m, 'near_lit', 0.3)))
        leak = m.math('ADD', 0.25, m.math('MULTIPLY', m.lum(t), 2.5))    # light through the shutter slats
        hue = m.white(m.vmath('ADD', cell, (7.3, 1.1, 0)))
        wcol = m.mixc(m.mr(hue, 0.0, 0.8), C('#ff9a40'), C('#ffc77a'))
        wcol = m.mixc(m.mr(hue, 0.8, 0.82), wcol, C('#cfe0ff'))
        bright = m.math('MULTIPLY', m.math('MULTIPLY', lit, leak), m.math('ADD', 0.4, m.math('MULTIPLY', m.white(m.vmath('ADD', cell, (3.1, 9.7, 0))), 0.8)))
        # at night the street lamps and shop lights below wash the lower floors warm
        wash = m.math('MULTIPLY', knob(m, 'street_wash', 0.0), m.math('EXPONENT', m.math('DIVIDE', oz, -3.5)))
        glow = m.mixc(1.0, hs, C('#ffb070'), 'MULTIPLY')
        emit = m.vmath('ADD', m.vmath('SCALE', wcol, scale=m.math('MULTIPLY', bright, knob(m, 'near_emit', 3.0))), m.vmath('SCALE', glow, scale=m.math('MULTIPLY', wash, 0.5)))
        sh = m.bsdf(base=col, rough=m.mixf(wet, 0.8, 0.45), emit=emit, emit_str=1.0)
    else:
        base = m.ramp(m.white(m.vmath('SNAP', P, (5.0, 5.0, 100.0))), [(0.0, C('#d8cfb4')), (0.2, C('#9fb8b0')), (0.4, C('#d6a98c')), (0.55, C('#e2d27e')), (0.7, C('#a9b9cf')), (0.85, C('#c9c4bc')), (1.0, C('#8faa8a'))], interp='CONSTANT')
        win, wcol, bright = windows(m, P, 3.6, 1.6, knob(m, 'near_lit', 0.3), '#ffc77a', sill=0.36, head=0.3, gap=0.5)
        col = m.mixc(win, base, m.mixc(0.5, C('#1a2028'), C('#2a3440')))
        sh = m.bsdf(base=col, rough=m.mixf(win, m.mixf(wet, 0.8, 0.35), 0.05), emit=wcol, emit_str=m.math('MULTIPLY', bright, knob(m, 'near_emit', 3.0)))
    MATS['facade_near'] = m.done(haze_mix(m, sh, P))

    m = M('roof_near')
    P = m.pos()
    sh = m.bsdf(base=m.mixc(m.noise(P, 1.5, 6), C('#5a3a2a'), C('#7a5038')), rough=0.6)
    MATS['roof_near'] = m.done(haze_mix(m, sh, P))

    m = M('tower')
    P = m.pos()
    win, wcol, bright = windows(m, P, 3.6, 1.5, knob(m, 'tower_lit', 0.3), '#ffd9a0', sill=0.22, head=0.2, gap=0.25)
    col = m.mixc(m.white(m.vmath('SNAP', P, (40.0, 40.0, 1000.0))), C('#3a4450'), C('#6a7480'))
    col = m.mixc(win, col, C('#202a36'))
    sh = m.bsdf(base=col, rough=m.mixf(win, 0.6, 0.12), metal=m.mixf(win, 0.0, 0.6), emit=wcol, emit_str=m.math('MULTIPLY', bright, knob(m, 'tower_emit', 2.0)))
    MATS['tower'] = m.done(haze_mix(m, sh, P))

    m = M('landmark')  # the twin towers and the telecom tower: steel and glass, lit up at night
    P = m.pos()
    x, y, z = m.sep(P)
    bands = m.mr(m.math('FRACT', m.math('DIVIDE', z, 4.2)), 0.65, 0.75)
    col = m.mixc(bands, C('#9aa4ae'), C('#4a5560'))
    glow = m.math('MULTIPLY', m.math('ADD', 0.35, m.math('MULTIPLY', bands, 0.65)), knob(m, 'landmark_emit', 0.0))
    sh = m.bsdf(base=col, metal=0.7, rough=0.25, emit=C('#dfe6ff'), emit_str=glow)
    MATS['landmark'] = m.done(haze_mix(m, sh, P))

    m = M('sign')  # shop signboards: coloured lightboxes with blocky, unreadable glyph shapes
    P = m.pos()
    o = m.obj()
    x, y, z = m.sep(o)
    hue = m.white(m.vmath('SNAP', P, (5.0, 5.0, 50.0)))
    col = m.ramp(hue, [(0.0, C('#d82a2a')), (0.3, C('#e8c020')), (0.55, C('#1e8a4a')), (0.8, C('#2050c0')), (1.0, C('#e8e2d0'))], interp='CONSTANT')
    glyph = m.mr(m.noise(m.mapping(o, scale=(9, 9, 3)), 3.0, 0), 0.5, 0.52)
    col = m.mixc(m.math('MULTIPLY', glyph, 0.8), col, C('#f6f1e4'))
    sh = m.bsdf(base=col, rough=0.4, emit=col, emit_str=knob(m, 'sign_emit', 0.0))
    MATS['sign'] = m.done(haze_mix(m, sh, P))

    m = M('neon_green')
    MATS['neon_green'] = m.done(m.emission(C('#2affb0'), knob(m, 'neon', 8.0)))
    m = M('neon_red')
    MATS['neon_red'] = m.done(m.emission(C('#ff2a50'), knob(m, 'neon', 8.0)))

    m = M('ground')
    P = m.pos()
    sh = m.bsdf(base=C('#2a2a2a'), rough=0.2)
    MATS['ground'] = m.done(haze_mix(m, sh, P))


def no_emission_sampling():
    for name in ('facade_near', 'roof_near', 'tower', 'landmark', 'sign', 'neon_green', 'neon_red', 'ground', 'bulb', 'tube_light', 'shade_glass'):
        MATS[name].cycles.emission_sampling = 'NONE'


def set_city(**kw):
    for k, v in kw.items():
        for n in CITY.get(k, []):
            if k == 'haze_color':
                n.outputs[0].default_value = (*v, 1.0)
            else:
                n.outputs[0].default_value = v


# ================================================================== geometry
COLL = {}
OBJECTS = {}


def coll(name):
    if name not in COLL:
        c = bpy.data.collections.new(name)
        bpy.context.scene.collection.children.link(c)
        COLL[name] = c
    return COLL[name]


def mark_wear(bm, faces):
    """Per-vertex 'wear' = 1 on bevel faces: edge chips, rubbed varnish (read by M.edges)."""
    lay = bm.verts.layers.float.get('wear') or bm.verts.layers.float.new('wear')
    for f in faces:
        for v in f.verts:
            v[lay] = 1.0


def finish_bm(bm, smooth_angle=0.6, smooth=True):
    for f in bm.faces:
        f.smooth = smooth
    if smooth:
        for e in bm.edges:
            if e.is_manifold and e.calc_face_angle(0) > smooth_angle:
                e.smooth = False
            elif not e.is_manifold:
                e.smooth = False


def make_obj(name, bm, material, loc=(0, 0, 0), rot_y=0.0, collection='room', pass_index=0, smooth=True, smooth_angle=0.6, mats=None):
    finish_bm(bm, smooth_angle, smooth)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    if mats:
        for mm in mats:
            me.materials.append(mm)
    elif material is not None:
        me.materials.append(material)
    ob = bpy.data.objects.new(name, me)
    ob.location = T(*loc)
    ob.rotation_euler = (0, 0, rot_y)
    ob.pass_index = pass_index
    coll(collection).objects.link(ob)
    OBJECTS[name] = ob
    return ob


def bm_box(w, h, d, bevel=0.004, segs=2, center=(0, 0, 0)):
    """A box w (x) by h (three y, up) by d (three z, depth), centred, in Blender-local axes."""
    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=Vector((w, d, h)), verts=bm.verts)
    bmesh.ops.translate(bm, vec=T(*center), verts=bm.verts)
    if bevel > 0:
        res = bmesh.ops.bevel(bm, geom=list(bm.edges), offset=min(bevel, min(w, h, d) * 0.45), segments=segs, profile=0.5, affect='EDGES', clamp_overlap=True)
        mark_wear(bm, res['faces'])
    return bm


def box(name, w, h, d, material, loc, rot_y=0.0, bevel=0.004, segs=2, **kw):
    return make_obj(name, bm_box(w, h, d, bevel, segs), material, loc, rot_y, **kw)


def bm_cyl(r1, r2, h, segs=24, center=(0, 0, 0), caps=True, axis='y', bevel=0.0):
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=caps, cap_tris=False, segments=segs, radius1=r1, radius2=r2, depth=h)
    if axis == 'x':
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'Y'))
    elif axis == 'z':
        bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(math.pi / 2, 3, 'X'))
    if bevel > 0:
        sharp = [e for e in bm.edges if e.is_manifold and e.calc_face_angle(0) > 0.8]
        res = bmesh.ops.bevel(bm, geom=sharp, offset=bevel, segments=2, profile=0.5, affect='EDGES', clamp_overlap=True)
        mark_wear(bm, res['faces'])
    bmesh.ops.translate(bm, vec=T(*center), verts=bm.verts)
    return bm


def cyl(name, r1, r2, h, material, loc, segs=24, axis='y', rot_y=0.0, bevel=0.0, **kw):
    return make_obj(name, bm_cyl(r1, r2, h, segs, axis=axis, bevel=bevel), material, loc, rot_y, **kw)


def bm_lathe(profile, segs=32, close=False):
    """Profile [(r, y)] spun round the vertical axis."""
    bm = bmesh.new()
    verts = [bm.verts.new((r, 0.0, y)) for r, y in profile]
    edges = [bm.edges.new((verts[i], verts[i + 1])) for i in range(len(verts) - 1)]
    bmesh.ops.spin(bm, geom=verts + edges, cent=(0, 0, 0), axis=(0, 0, 1), angle=2 * math.pi, steps=segs, use_duplicate=False)
    bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=1e-5)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def lathe(name, profile, material, loc, segs=32, **kw):
    return make_obj(name, bm_lathe(profile, segs), material, loc, smooth_angle=1.2, **kw)


def plane(name, w, h, material, loc, facing='z', rot_y=0.0, uv=True, **kw):
    """A w x h rectangle facing +z (three; a wall decal), +y (lying flat) or +x."""
    bm = bmesh.new()
    if facing == 'z':
        pts = [(-w / 2, -h / 2, 0), (w / 2, -h / 2, 0), (w / 2, h / 2, 0), (-w / 2, h / 2, 0)]
    elif facing == 'y':
        pts = [(-w / 2, 0, h / 2), (w / 2, 0, h / 2), (w / 2, 0, -h / 2), (-w / 2, 0, -h / 2)]
    elif facing == '-x':
        pts = [(0, -h / 2, -w / 2), (0, -h / 2, w / 2), (0, h / 2, w / 2), (0, h / 2, -w / 2)]
    else:  # +x
        pts = [(0, -h / 2, w / 2), (0, -h / 2, -w / 2), (0, h / 2, -w / 2), (0, h / 2, w / 2)]
    vs = [bm.verts.new(T(*p)) for p in pts]
    f = bm.faces.new(vs)
    if uv:
        lay = bm.loops.layers.uv.new('UVMap')
        for loop, uvv in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
            loop[lay].uv = uvv
    return make_obj(name, bm, material, loc, rot_y, smooth=False, **kw)


def tube(name, pts, radius, material, collection='room', res=6, pass_index=0):
    """A cable / thread along points (three coords)."""
    cu = bpy.data.curves.new(name, 'CURVE')
    cu.dimensions = '3D'
    cu.bevel_depth = radius
    cu.bevel_resolution = 1
    cu.resolution_u = res
    sp = cu.splines.new('BEZIER')
    sp.bezier_points.add(len(pts) - 1)
    for bp, p in zip(sp.bezier_points, pts):
        bp.co = T(*p)
        bp.handle_left_type = bp.handle_right_type = 'AUTO'
    cu.materials.append(material)
    ob = bpy.data.objects.new(name, cu)
    ob.pass_index = pass_index
    coll(collection).objects.link(ob)
    OBJECTS[name] = ob
    return ob


# ------------------------------------------------------------------ the room
def build_room():
    X0, X1, Z0, Z1, H = -3.0, 3.0, BACK, 2.0, 3.0
    wl, wr = WIN['x'] - WIN['w'] / 2, WIN['x'] + WIN['w'] / 2
    wb, wt = WIN['y'] - WIN['h'] / 2, WIN['y'] + WIN['h'] / 2

    bm = bmesh.new()
    v = lambda x, y, z: bm.verts.new(T(x, y, z))
    def quad(a, b, c, d):
        return bm.faces.new((v(*a), v(*b), v(*c), v(*d)))
    # floor and ceiling
    floor_bm = bmesh.new()
    vs = [floor_bm.verts.new(T(*p)) for p in [(X0, 0, Z1), (X1, 0, Z1), (X1, 0, Z0), (X0, 0, Z0)]]
    floor_bm.faces.new(vs)
    bmesh.ops.subdivide_edges(floor_bm, edges=floor_bm.edges[:], cuts=3, use_grid_fill=True)
    make_obj('floor', floor_bm, mat('floor'), pass_index=IDS['floor'], smooth=False)
    ceil_bm = bmesh.new()
    vs = [ceil_bm.verts.new(T(*p)) for p in [(X0, H, Z0), (X1, H, Z0), (X1, H, Z1), (X0, H, Z1)]]
    ceil_bm.faces.new(vs)
    make_obj('ceiling', ceil_bm, mat('ceiling'), pass_index=IDS['ceiling'], smooth=False)
    # ceiling battens (old board ceiling)
    for i, x in enumerate([-2.0, -1.0, 0.0, 1.0, 2.0]):
        box(f'batten_x{i}', 0.035, 0.012, 6.0, mat('ceiling'), (x, H - 0.01, -1.0), bevel=0.004, pass_index=IDS['ceiling'])
    for i, z in enumerate([-3.0, -2.0, -1.0, 0.0, 1.0]):
        box(f'batten_z{i}', 6.0, 0.012, 0.035, mat('ceiling'), (0, H - 0.01, z), bevel=0.004, pass_index=IDS['ceiling'])

    # back wall with the window opening, and its reveal
    BW = BACK - WALL_T
    wall = bmesh.new()
    def wq(pts, bmx=wall):
        bmx.faces.new([bmx.verts.new(T(*p)) for p in pts])
    wq([(X0, 0, BACK), (X1, 0, BACK), (X1, wb, BACK), (X0, wb, BACK)])
    wq([(X0, wt, BACK), (X1, wt, BACK), (X1, H, BACK), (X0, H, BACK)])
    wq([(X0, wb, BACK), (wl, wb, BACK), (wl, wt, BACK), (X0, wt, BACK)])
    wq([(wr, wb, BACK), (X1, wb, BACK), (X1, wt, BACK), (wr, wt, BACK)])
    bmesh.ops.remove_doubles(wall, verts=wall.verts, dist=1e-5)
    bmesh.ops.subdivide_edges(wall, edges=wall.edges[:], cuts=2, use_grid_fill=True)
    make_obj('wall_back', wall, mat('wall'), pass_index=IDS['wall'], smooth=False)
    rev = bmesh.new()
    wq([(wl, wb, BACK), (wl, wb, BW), (wl, wt, BW), (wl, wt, BACK)], rev)  # left jamb, faces +x
    wq([(wr, wb, BW), (wr, wb, BACK), (wr, wt, BACK), (wr, wt, BW)], rev)
    wq([(wl, wt, BACK), (wl, wt, BW), (wr, wt, BW), (wr, wt, BACK)], rev)  # head, faces down
    wq([(wl, wb, BW), (wl, wb, BACK), (wr, wb, BACK), (wr, wb, BW)], rev)  # sill, faces up
    bmesh.ops.recalc_face_normals(rev, faces=rev.faces)
    for f in rev.faces:
        c = f.calc_center_median()
        if (Vector(T(WIN['x'], WIN['y'], BACK - WALL_T / 2)) - c).dot(f.normal) < 0:
            f.normal_flip()
    make_obj('window_reveal', rev, mat('reveal'), pass_index=IDS['wall'], smooth=False)
    # outside face of the wall (only seen in reflections and by the bake rays)
    out = bmesh.new()
    for pts in [[(X0, -3, BW), (X0, wb, BW), (X1, wb, BW), (X1, -3, BW)], [(X0, wt, BW), (X0, H + 0.6, BW), (X1, H + 0.6, BW), (X1, wt, BW)],
                [(X0, wb, BW), (X0, wt, BW), (wl, wt, BW), (wl, wb, BW)], [(wr, wb, BW), (wr, wt, BW), (X1, wt, BW), (X1, wb, BW)]]:
        wq(pts, out)
    make_obj('wall_outside', out, mat('reveal'), collection='outside_wall', smooth=False)

    # side walls and the front wall behind the camera
    for side in (-1, 1):
        s = bmesh.new()
        x = side * 3.0
        pts = [(x, 0, Z0), (x, 0, Z1), (x, H, Z1), (x, H, Z0)]
        if side > 0:
            pts = pts[::-1]
        wq(pts, s)
        bmesh.ops.subdivide_edges(s, edges=s.edges[:], cuts=2, use_grid_fill=True)
        make_obj(f'wall_{"left" if side < 0 else "right"}', s, mat('wall'), pass_index=IDS['wall'], smooth=False)
    s = bmesh.new()
    wq([(X1, 0, Z1), (X0, 0, Z1), (X0, H, Z1), (X1, H, Z1)], s)
    make_obj('wall_front', s, mat('wall'), pass_index=IDS['wall'], smooth=False)

    # wainscot: framed timber panels to chair-rail height on the back and side walls
    box('wainscot_back', 6.0, 0.74, 0.02, mat('panel'), (0, 0.37, BACK + 0.01), bevel=0.0, pass_index=IDS['wall'])
    for i in range(10):
        x0 = -3.0 + i * 0.6
        if wl - 0.05 < x0 + 0.3 < wr + 0.05:
            pass
        box(f'wain_stile_{i}', 0.06, 0.66, 0.02, mat('panel'), (x0, 0.37, BACK + 0.025), bevel=0.006, pass_index=IDS['wall'])
        box(f'wain_raise_{i}', 0.44, 0.5, 0.012, mat('panel'), (x0 + 0.3, 0.38, BACK + 0.022), bevel=0.01, segs=3, pass_index=IDS['wall'])
    box('chair_rail_back', 6.0, 0.05, 0.045, mat('rail'), (0, 0.765, BACK + 0.025), bevel=0.008, segs=3, pass_index=IDS['wall'])
    box('skirting_back', 6.0, 0.11, 0.025, mat('rail'), (0, 0.055, BACK + 0.03), bevel=0.006, pass_index=IDS['wall'])
    for side in (-1, 1):
        box(f'wainscot_side{side}', 0.02, 0.74, 6.0, mat('panel'), (side * 2.99, 0.37, -1.0), bevel=0.0, pass_index=IDS['wall'])
        box(f'chair_rail_side{side}', 0.045, 0.05, 6.0, mat('rail'), (side * 2.975, 0.765, -1.0), bevel=0.008, segs=3, pass_index=IDS['wall'])
    # window sill board inside, and the timber window frame in the reveal
    box('sill_board', WIN['w'] + 0.3, 0.035, 0.19, mat('frame_wood'), (WIN['x'], wb - 0.0175, BACK + 0.03), bevel=0.006, segs=3)
    fz = BACK - WALL_T + 0.07
    frame = mat('window_frame')
    def bar(n, w, h, x, y, d=0.06):
        box(n, w, h, d, frame, (x, y, fz), bevel=0.006, pass_index=IDS['wall'])
    bar('wf_top', WIN['w'], 0.07, WIN['x'], wt - 0.035)
    bar('wf_bottom', WIN['w'], 0.08, WIN['x'], wb + 0.04)
    bar('wf_left', 0.07, WIN['h'], wl + 0.035, WIN['y'])
    bar('wf_right', 0.07, WIN['h'], wr - 0.035, WIN['y'])
    bar('wf_m1', 0.05, WIN['h'], WIN['x'] - WIN['w'] / 6, WIN['y'], 0.055)
    bar('wf_m2', 0.05, WIN['h'], WIN['x'] + WIN['w'] / 6, WIN['y'], 0.055)
    bar('wf_transom', WIN['w'], 0.045, WIN['x'], wb + WIN['h'] * 0.72, 0.055)
    # casement handles
    for i, xx in enumerate([WIN['x'] - WIN['w'] / 6 - 0.05, WIN['x'] + WIN['w'] / 6 + 0.05]):
        box(f'wf_handle{i}', 0.015, 0.11, 0.02, mat('brass'), (xx, WIN['y'] - 0.1, fz + 0.045), bevel=0.004)
    # the glass (id 1: rain is drawn on it in the browser)
    glass = plane('glass', WIN['w'], WIN['h'], mat('glass'), (WIN['x'], WIN['y'], fz - 0.005), pass_index=IDS['glass'], collection='glass')
    glass.visible_shadow = True

    # door on the right wall near the back corner: painted timber with a frosted, numbered glass panel
    dz, dw, dh = -3.05, 0.9, 2.1
    box('door', 0.045, dh, dw, mat('door_paint'), (2.985, dh / 2, dz), bevel=0.006)
    box('door_frame_l', 0.06, dh + 0.06, 0.07, mat('rail'), (2.97, (dh + 0.06) / 2, dz - dw / 2 - 0.035), bevel=0.008)
    box('door_frame_r', 0.06, dh + 0.06, 0.07, mat('rail'), (2.97, (dh + 0.06) / 2, dz + dw / 2 + 0.035), bevel=0.008)
    box('door_frame_t', 0.06, 0.07, dw + 0.14, mat('rail'), (2.97, dh + 0.035, dz), bevel=0.008)
    frost = M('frosted')
    fo = frost.obj()
    fr = frost.node('ShaderNodeBsdfTranslucent', {'Color': C('#d8dcc8')})
    gl = frost.node('ShaderNodeBsdfGlossy', {'Roughness': 0.35})
    MATS['frosted'] = frost.done(frost.node('ShaderNodeMixShader', {0: 0.3, 1: fr, 2: gl}))
    plane('door_glass', 0.55, 0.62, mat('frosted'), (2.96, 1.55, dz), facing='-x')
    box('door_knob', 0.05, 0.05, 0.05, mat('brass'), (2.94, 1.0, dz + 0.33), bevel=0.02, segs=3)
    # corridor light behind the frosted glass
    add_area_light('corridor', (3.3, 1.6, dz), (-1, 0, 0), C('#ffe6b0'), 18, size=(0.6, 0.7), group='rest')

    # light switch and socket by the door, conduit up the wall (old wiring, surface run)
    box('switch', 0.02, 0.12, 0.08, mat('ac_plastic'), (2.985, 1.35, -2.45), bevel=0.004)
    box('socket', 0.02, 0.09, 0.15, mat('ac_plastic'), (2.985, 0.3, -2.45), bevel=0.004)
    box('conduit', 0.02, 1.6, 0.025, mat('ac_plastic'), (2.988, 2.2, -2.45), bevel=0.004)

    # rug
    plane('rug', 2.8, 2.0, mat('rug'), (DESK['x'] + 0.2, 0.004, -2.35), facing='y', pass_index=IDS['floor'])
    box('rug_body', 2.8, 0.006, 2.0, mat('rug'), (DESK['x'] + 0.2, 0.003, -2.35), bevel=0.002, pass_index=IDS['floor'])


# ------------------------------------------------------------------ blinds
def build_blinds():
    """Three aluminium venetian blinds, one per window bay, at different heights and tilts."""
    wl = WIN['x'] - WIN['w'] / 2
    wb, wt = WIN['y'] - WIN['h'] / 2, WIN['y'] + WIN['h'] / 2
    bay = WIN['w'] / 3
    z = BACK - WALL_T + 0.135
    specs = [(0.62, -0.35), (0.25, 0.6), (0.48, -0.2)]  # (fraction of the bay height lowered, slat tilt)
    alu = mat('alu')
    for b, (lower, tilt) in enumerate(specs):
        cx = wl + bay * (b + 0.5)
        w = bay - 0.03
        top = wt - 0.06
        bottom = top - (wt - wb - 0.1) * lower
        box(f'blind{b}_head', w + 0.02, 0.035, 0.04, alu, (cx, top + 0.02, z), bevel=0.004)
        # the stack of raised slats under the head rail
        stack = 0.02 + 0.05 * (1 - lower)
        box(f'blind{b}_stack', w, stack, 0.026, alu, (cx, top - stack / 2, z), bevel=0.002)
        bm = bmesh.new()
        n = int((top - stack - bottom) / 0.021)
        for i in range(n):
            y = top - stack - 0.012 - i * 0.021
            sb = bm_box(w, 0.0016, 0.025, bevel=0.0)
            bmesh.ops.rotate(sb, verts=sb.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(tilt + (hsh(i + b * 50) - 0.5) * 0.08, 3, 'X'))
            bmesh.ops.translate(sb, vec=T(0, y, 0), verts=sb.verts)
            me = bpy.data.meshes.new('tmp')
            sb.to_mesh(me)
            sb.free()
            bm.from_mesh(me)
            bpy.data.meshes.remove(me)
        make_obj(f'blind{b}_slats', bm, alu, (cx, 0, z), smooth=False, pass_index=IDS['wall'])
        box(f'blind{b}_rail', w, 0.012, 0.03, alu, (cx, bottom, z), bevel=0.003)
        for k in (-0.38, 0.38):
            tube(f'blind{b}_ladder{k}', [(cx + k * w, top, z - 0.013), (cx + k * w, bottom, z - 0.013)], 0.0009, mat('card_white'))
            tube(f'blind{b}_ladderb{k}', [(cx + k * w, top, z + 0.013), (cx + k * w, bottom, z + 0.013)], 0.0009, mat('card_white'))
        # the pull cord, hanging past the slats with its tassel
        tube(f'blind{b}_cord', [(cx + w * 0.45, top, z + 0.02), (cx + w * 0.46, bottom - 0.25, z + 0.025)], 0.0012, mat('card_white'))
        cyl(f'blind{b}_tassel', 0.006, 0.004, 0.03, mat('black_plastic'), (cx + w * 0.46, bottom - 0.265, z + 0.025), segs=10)


# ------------------------------------------------------------------ desk and things on it
def build_desk():
    x, z, top, w, d = DESK['x'], DESK['z'], DESK['top'], DESK['w'], DESK['d']
    box('desk_top', w, 0.045, d, mat('desk'), (x, top - 0.0225, z), bevel=0.008, segs=3, pass_index=IDS['desk'])
    plane('desk_leather', w - 0.36, d - 0.3, mat('leather'), (x, top + 0.0024, z + 0.02), facing='y', pass_index=IDS['desk'])
    box('desk_leather_lip', w - 0.34, 0.002, d - 0.28, mat('leather'), (x, top + 0.0005, z + 0.02), bevel=0.0, pass_index=IDS['desk'])
    for side in (-1, 1):
        px = x + side * (w / 2 - 0.26)
        box(f'pedestal{side}', 0.48, top - 0.065, d - 0.06, mat('desk_side'), (px, (top - 0.065) / 2 + 0.02, z), bevel=0.006, pass_index=IDS['desk'])
        box(f'plinth{side}', 0.46, 0.04, d - 0.08, mat('rail'), (px, 0.02, z), bevel=0.004, pass_index=IDS['desk'])
        for i in range(3):
            dy = 0.14 + i * 0.22
            box(f'drawer{side}_{i}', 0.42, 0.19, 0.02, mat('desk'), (px, dy, z + d / 2 - 0.02), bevel=0.006, segs=3, pass_index=IDS['desk'])
            box(f'drawer_pull{side}_{i}', 0.1, 0.014, 0.018, mat('brass'), (px, dy + 0.03, z + d / 2 - 0.003), bevel=0.005, segs=2, pass_index=IDS['desk'])
            box(f'drawer_plate{side}_{i}', 0.05, 0.03, 0.002, mat('brass'), (px, dy - 0.04, z + d / 2 - 0.009), bevel=0.001, pass_index=IDS['desk'])
    box('modesty', w - 1.0, 0.5, 0.02, mat('desk_side'), (x, top - 0.3, z - d / 2 + 0.05), bevel=0.004, pass_index=IDS['desk'])
    box('apron', w - 1.0, 0.08, 0.02, mat('desk'), (x, top - 0.085, z + d / 2 - 0.03), bevel=0.005, pass_index=IDS['desk'])

    build_floor_clutter()
    build_lamp()
    build_folder()
    build_lighter()
    build_cup()
    build_phone()

    # notepad and pen, a stack of old files, kopi-stained papers, ashtray, newspaper
    plane('notepad', 0.15, 0.21, mat('paper_typed'), (x + 0.12, top + 0.012, z - 0.2), facing='y', rot_y=0.35)
    box('notepad_body', 0.15, 0.01, 0.21, mat('paper'), (x + 0.12, top + 0.006, z - 0.2), rot_y=0.35, bevel=0.002)
    cyl('pen', 0.0045, 0.0045, 0.14, mat('black_plastic'), (x + 0.2, top + 0.0055, z - 0.18), segs=12, axis='z', rot_y=0.9 + math.pi / 2)
    cyl('pen_clip', 0.0047, 0.0047, 0.02, mat('brass'), (x + 0.2 + 0.05 * math.cos(0.9 + math.pi / 2 - math.pi / 2), top + 0.0055, z - 0.18), segs=12, axis='z', rot_y=0.9 + math.pi / 2)
    for i in range(4):
        f = box(f'file_stack{i}', 0.36, 0.022, 0.27, mat('manila'), (x + 0.7 + (hsh(i) - 0.5) * 0.03, top + 0.012 + i * 0.024, z - 0.3), rot_y=(hsh(i + 4) - 0.5) * 0.2, bevel=0.003)
    for i in range(3):
        box(f'file_papers{i}', 0.34, 0.006, 0.25, mat('paper_typed'), (x + 0.71 + (hsh(i + 9) - 0.5) * 0.04, top + 0.026 + i * 0.024, z - 0.29), rot_y=(hsh(i + 14) - 0.5) * 0.25, bevel=0.001)
    # kopi-stained typed sheets fanned beside the folder
    for i, (dx, dz, r) in enumerate([(-0.95, 0.02, 0.4), (-0.88, 0.06, -0.15), (-0.32, 0.3, 0.6)]):
        plane(f'stained_sheet{i}', 0.21, 0.297, mat('paper_stained' if i != 1 else 'paper_typed'), (x + dx + 0.5, top + 0.003 + i * 0.0008, z + dz), facing='y', rot_y=r)
    # glass ashtray with stubbed-out cigarettes, behind the lighter
    ax, az = x - 0.38, z - 0.16
    lathe('ashtray', [(0.0, 0.0), (0.055, 0.0), (0.062, 0.008), (0.064, 0.026), (0.058, 0.028), (0.045, 0.012), (0.0, 0.012)], mat('ash_glass'), (ax, top, az), segs=28)
    cyl('ash_pile', 0.035, 0.028, 0.006, mat('ash'), (ax, top + 0.014, az), segs=16)
    for i in range(3):
        a = hsh(i + 30) * 6.28
        cyl(f'cig{i}', 0.0038, 0.0038, 0.045, mat('cig'), (ax + math.cos(a) * 0.025, top + 0.02, az + math.sin(a) * 0.025), segs=8, axis='x', rot_y=a)
    # folded newspaper on the right
    box('newspaper', 0.3, 0.012, 0.21, mat('newsprint'), (x + 0.55, top + 0.006, z + 0.28), rot_y=-0.25, bevel=0.004)
    # the lamp cable and the phone cable, falling off the back of the desk
    tube('lamp_cable', [(x - 0.72, top + 0.01, z - 0.16), (x - 0.75, top + 0.003, z - 0.42), (x - 0.78, top - 0.1, z - 0.5), (x - 0.8, 0.05, z - 0.55)], 0.003, mat('cable'))
    tube('phone_cable', [(x + 0.72, top + 0.01, z + 0.03), (x + 0.66, top + 0.004, z - 0.3), (x + 0.6, top - 0.2, z - 0.5), (x + 0.5, 0.02, z - 0.5)], 0.0022, mat('cable'))

    # a bentwood kopitiam chair pulled back from the desk
    cxp, czp = x + 1.15, z + 0.95
    lathe('chair_seat', [(0.0, 0.0), (0.2, 0.0), (0.21, 0.012), (0.205, 0.03), (0.0, 0.03)], mat('chair_wood'), (cxp, 0.44, czp), segs=32)
    make_obj('chair_ring', bm_cyl(0.17, 0.17, 0.02, 32, caps=False), mat('chair_wood'), (cxp, 0.2, czp))
    for i in range(4):
        a4 = i * math.pi / 2 + math.pi / 4
        tube(f'chair_leg{i}', [(cxp + math.cos(a4) * 0.15, 0.44, czp + math.sin(a4) * 0.15), (cxp + math.cos(a4) * 0.2, 0.2, czp + math.sin(a4) * 0.2), (cxp + math.cos(a4) * 0.23, 0.0, czp + math.sin(a4) * 0.23)], 0.014, mat('chair_wood'))
    back = 0.7  # the back faces away from the desk, toward the window
    pts = []
    for k in range(13):
        a = math.radians(-70 + k * 140 / 12) + back + math.pi / 2
        pts.append((cxp + math.cos(a) * 0.2, 0.47 + 0.42 * math.sin(math.radians(k * 180 / 12)), czp + math.sin(a) * 0.2))
    tube('chair_hoop', pts, 0.012, mat('chair_wood'))
    for k in (-0.35, 0.35):
        a = back + math.pi / 2 + k
        tube(f'chair_spindle{k}', [(cxp + math.cos(a) * 0.19, 0.46, czp + math.sin(a) * 0.19), (cxp + math.cos(a) * 0.2, 0.82, czp + math.sin(a) * 0.2)], 0.008, mat('chair_wood'))

    # rattan waste basket with crumpled paper
    lathe('basket', [(0.0, 0.0), (0.13, 0.0), (0.16, 0.32), (0.155, 0.32), (0.125, 0.008), (0.0, 0.008)], mat('shelf'), (x - 1.25, 0, z + 0.55), segs=24)
    for i in range(3):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.045)
        for vv in bm.verts:
            vv.co *= 0.75 + hsh(i * 31 + vv.index) * 0.5
        make_obj(f'crumple{i}', bm, mat('paper'), (x - 1.25 + (hsh(i) - 0.5) * 0.1, 0.3 + i * 0.01, z + 0.55 + (hsh(i + 5) - 0.5) * 0.1), smooth_angle=0.4)


PICK_NODES = {}


def pick_group(name, objs, pass_index):
    for o in objs:
        o.pass_index = pass_index
        o['pick'] = name
    PICK_NODES[name] = objs


def build_lamp():
    x, z, top = DESK['x'], DESK['z'], DESK['top']
    lx, lz, rot = x - 0.72, z - 0.12, 0.25
    objs = []
    def L(o):
        objs.append(o)
        return o
    def at(dx, dy, dz):
        c, s = math.cos(rot), math.sin(rot)
        return (lx + dx * c + dz * s, top + dy, lz - dx * s + dz * c)
    L(lathe('lamp_base', [(0.0, 0.0), (0.1, 0.0), (0.1, 0.008), (0.09, 0.02), (0.05, 0.028), (0.02, 0.032), (0.0, 0.032)], mat('brass'), at(0, 0, 0)))
    L(cyl('lamp_stem', 0.011, 0.011, 0.3, mat('brass'), at(0, 0.18, 0), segs=16))
    L(cyl('lamp_knuckle', 0.018, 0.018, 0.02, mat('brass'), at(0, 0.32, 0.0), segs=16, axis='x', rot_y=rot))
    L(box('lamp_yoke', 0.03, 0.012, 0.07, mat('brass'), at(0, 0.33, 0.035), rot_y=rot, bevel=0.003))
    # the shade: a half-cylinder of cased green glass, brass end caps
    bm = bmesh.new()
    segs = 24
    rr, half = 0.078, 0.2
    ring = []
    for i in range(segs + 1):
        a = math.pi * i / segs
        ring.append((math.cos(a) * rr, math.sin(a) * rr))
    vs_a = [bm.verts.new((-half, cy, cz)) for cy, cz in [(-p[0], p[1]) for p in ring]]
    vs_b = [bm.verts.new((half, cy, cz)) for cy, cz in [(-p[0], p[1]) for p in ring]]
    for i in range(segs):
        bm.faces.new((vs_a[i], vs_a[i + 1], vs_b[i + 1], vs_b[i]))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.004)
    shade_center = at(0, 0.335, 0.07)
    shade = L(make_obj('lamp_shade', bm, mat('shade_glass'), shade_center, rot_y=rot, smooth_angle=1.0))
    for s in (-1, 1):
        cb = bm_cyl(rr + 0.004, rr + 0.004, 0.012, 24, axis='x')
        bmesh.ops.bisect_plane(cb, geom=cb.verts[:] + cb.edges[:] + cb.faces[:], plane_co=(0, 0, 0), plane_no=(0, 0, -1), clear_inner=True)
        bmesh.ops.translate(cb, vec=Vector((s * (half + 0.006), 0, 0)), verts=cb.verts)
        L(make_obj(f'lamp_cap{s}', cb, mat('brass'), shade_center, rot_y=rot))
    bulb = cyl('lamp_bulb', 0.016, 0.016, 0.3, mat('bulb'), at(0, 0.32, 0.07), segs=12, axis='x', rot_y=rot)
    L(bulb)
    # pull chain
    tube('lamp_chain', [at(0.1, 0.30, 0.1), at(0.1, 0.22, 0.12)], 0.0015, mat('brass'))
    pick_group('lamp', objs, IDS['lamp'])
    shade.pass_index = IDS['shade']
    bulb.pass_index = IDS['shade']
    bulb.visible_shadow = False
    # the light itself: a small sphere under the shade
    bp = at(0, 0.305, 0.07)
    add_point_light('lamp_light', bp, C('#ffbf78'), 40.0, radius=0.02, group='lamp')
    return bp


def build_folder():
    x, z, top = DESK['x'], DESK['z'], DESK['top']
    fx, fz, rot = x - 0.1, z + 0.12, 0.12
    objs = [
        box('folder_back', 0.46, 0.004, 0.33, mat('manila'), (fx, top + 0.002, fz), rot_y=rot, bevel=0.0015),
        box('folder_pages', 0.43, 0.012, 0.31, mat('paper_typed'), (fx + 0.012, top + 0.01, fz - 0.006), rot_y=rot - 0.04, bevel=0.002),
        box('folder_photo', 0.12, 0.002, 0.09, mat('photo'), (fx + 0.2, top + 0.014, fz - 0.11), rot_y=rot - 0.3, bevel=0.0),
    ]
    cover = box('folder_cover', 0.46, 0.003, 0.33, mat('manila'), (fx, top + 0.0175, fz), rot_y=rot, bevel=0.0015)
    objs.append(cover)
    # paper clip
    objs.append(tube('folder_clip', [(fx - 0.2, top + 0.02, fz - 0.15), (fx - 0.2, top + 0.02, fz - 0.12), (fx - 0.19, top + 0.02, fz - 0.12), (fx - 0.19, top + 0.02, fz - 0.15)], 0.0012, mat('steel')))
    pick_group('folder', objs, IDS['folder'])


def build_lighter():
    x, z, top = DESK['x'], DESK['z'], DESK['top']
    lx, lz, rot = x - 0.42, z + 0.33, 0.55
    objs = [
        box('lighter_body', 0.038, 0.058, 0.013, mat('chrome'), (lx, top + 0.029, lz), rot_y=rot, bevel=0.004, segs=3),
        box('lighter_lid', 0.038, 0.022, 0.013, mat('chrome'), (lx, top + 0.0705, lz), rot_y=rot, bevel=0.004, segs=3),
        box('lighter_seam', 0.0385, 0.0012, 0.0135, mat('iron'), (lx, top + 0.059, lz), rot_y=rot, bevel=0.0),
    ]
    pick_group('lighter', objs, IDS['lighter'])


def build_cup():
    x, z, top = DESK['x'], DESK['z'], DESK['top']
    cx, cz, s = x + 0.36, z + 0.24, 1.25
    objs = []
    objs.append(lathe('cup_saucer', [(0, 0), (0.06 * s, 0), (0.075 * s, 0.008 * s), (0.078 * s, 0.012 * s), (0.07 * s, 0.011 * s), (0.04 * s, 0.006 * s), (0, 0.006 * s)], mat('ceramic'), (cx, top, cz)))
    prof = [(0.0, 0), (0.032, 0), (0.034, 0.004), (0.04, 0.03), (0.045, 0.07), (0.047, 0.074), (0.044, 0.074), (0.041, 0.04), (0.035, 0.008), (0.0, 0.008)]
    objs.append(lathe('cup', [(r * s, y * s + 0.008 * s) for r, y in prof], mat('ceramic'), (cx, top, cz)))
    objs.append(cyl('cup_band', 0.0447 * s, 0.0429 * s, 0.01 * s, mat('ceramic_green'), (cx, top + (0.008 + 0.054) * s, cz), segs=32, caps=False) if False else
                make_obj('cup_band', bm_cyl(0.0451 * s, 0.0436 * s, 0.009 * s, 32, caps=False), mat('ceramic_green'), (cx, top + (0.008 + 0.055) * s, cz)))
    kopi = cyl('cup_kopi', 0.041 * s, 0.041 * s, 0.002, mat('kopi'), (cx, top + 0.068 * s, cz), segs=28)
    objs.append(kopi)
    bm = bmesh.new()
    bmesh.ops.create_circle(bm, cap_ends=False, segments=16, radius=0.018 * s)
    me = bpy.data.meshes.new('tmp')
    # handle: a torus segment
    bm.free()
    tor = bmesh.new()
    R, r = 0.019 * s, 0.0055 * s
    rings, segs = 14, 8
    grid = []
    for i in range(rings + 1):
        a = -math.pi * 0.62 + math.pi * 1.24 * i / rings
        row = []
        for j in range(segs):
            b = 2 * math.pi * j / segs
            px = (R + r * math.cos(b)) * math.cos(a)
            pz = (R + r * math.cos(b)) * math.sin(a)
            py = r * math.sin(b)
            row.append(tor.verts.new((px, py, pz)))
        grid.append(row)
    for i in range(rings):
        for j in range(segs):
            tor.faces.new((grid[i][j], grid[i][(j + 1) % segs], grid[i + 1][(j + 1) % segs], grid[i + 1][j]))
    bmesh.ops.translate(tor, vec=Vector((0.05 * s, 0, 0.048 * s)), verts=tor.verts)
    objs.append(make_obj('cup_handle', tor, mat('ceramic'), (cx, top, cz), rot_y=0.4, smooth_angle=1.5))
    objs.append(box('cup_spoon', 0.09, 0.003, 0.012, mat('steel'), (cx - 0.035 * s, top + 0.015 * s, cz + 0.05 * s), rot_y=0.6, bevel=0.0012))
    pick_group('cup', objs, IDS['cup'])


def build_phone():
    x, z, top = DESK['x'], DESK['z'], DESK['top']
    px, pz, rot = x + 0.72, z + 0.08, -0.18
    objs = [
        box('phone_stand', 0.09, 0.02, 0.08, mat('black_plastic'), (px, top + 0.01, pz), rot_y=rot, bevel=0.004),
        box('phone_lip', 0.09, 0.03, 0.012, mat('black_plastic'), (px + 0.03 * math.sin(rot), top + 0.025, pz + 0.03 * math.cos(rot)), rot_y=rot, bevel=0.003),
    ]
    # the handset leans back on the stand: body and screen, tilted -0.32 about its own x
    tilt = -0.32
    bm = bm_box(0.08, 0.165, 0.009, bevel=0.004, segs=3, center=(0, 0.0825, 0))
    bmesh.ops.rotate(bm, verts=bm.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(tilt, 3, 'X'))
    off = Vector((0, 0.022, 0.02))
    body = make_obj('phone_body', bm, mat('black_plastic'), (px + 0.022 * math.sin(rot), top + 0.02, pz + 0.022 * math.cos(rot)), rot_y=rot)
    objs.append(body)
    sb = bmesh.new()
    pts = [(-0.036, 0.0065, 0.0052), (0.036, 0.0065, 0.0052), (0.036, 0.1585, 0.0052), (-0.036, 0.1585, 0.0052)]
    vs = [sb.verts.new(T(*p)) for p in pts]
    f = sb.faces.new(vs)
    lay = sb.loops.layers.uv.new('UVMap')
    for loop, uvv in zip(f.loops, [(0, 0), (1, 0), (1, 1), (0, 1)]):
        loop[lay].uv = uvv
    bmesh.ops.rotate(sb, verts=sb.verts, cent=(0, 0, 0), matrix=Matrix.Rotation(tilt, 3, 'X'))
    screen = make_obj('phone_screen', sb, mat('screen_off'), (px + 0.022 * math.sin(rot), top + 0.02, pz + 0.022 * math.cos(rot)), rot_y=rot, smooth=False)
    objs.append(screen)
    pick_group('phone', objs, IDS['phone'])
    screen.pass_index = IDS['screen']


# ------------------------------------------------------------------ the rest of the room
def build_props():
    # coat rack between the window and the board: trench coat, fedora, an umbrella dripping on the boards
    rx, rz = 0.42, BACK + 0.28
    cyl('rack_pole', 0.018, 0.022, 1.86, mat('chair_wood'), (rx, 0.93, rz), segs=16)
    lathe('rack_finial', [(0.0, 0.0), (0.025, 0.0), (0.03, 0.02), (0.02, 0.05), (0.0, 0.06)], mat('chair_wood'), (rx, 1.86, rz), segs=16)
    for i in range(3):
        box(f'rack_foot{i}', 0.36, 0.03, 0.035, mat('chair_wood'), (rx, 0.02, rz), rot_y=i * math.pi / 3, bevel=0.008)
    for i in range(4):
        a = i * math.pi / 2 + 0.4
        cyl(f'rack_hook{i}', 0.006, 0.004, 0.12, mat('brass'), (rx + math.cos(a) * 0.05, 1.72, rz + math.sin(a) * 0.05), segs=8, axis='x', rot_y=-a)
    # coat: a lathe body squashed flat with soft folds, plus sleeves and a collar
    prof = [(0.0, 1.8), (0.05, 1.79), (0.15, 1.73), (0.185, 1.64), (0.172, 1.42), (0.188, 1.12), (0.235, 0.82), (0.25, 0.71), (0.0, 0.70)]
    bm = bm_lathe(prof, 40)
    for vv in bm.verts:
        a = math.atan2(vv.co.y, vv.co.x)
        fold = 1.0 + 0.06 * math.sin(a * 7 + vv.co.z * 3) * (1.6 - vv.co.z)
        vv.co.x *= fold
        vv.co.y *= 0.42 * fold
    make_obj('coat', bm, mat('coat'), (rx + 0.04, 0, rz + 0.07), rot_y=0.15, smooth_angle=1.5)
    make_obj('coat_belt', bm_cyl(0.205, 0.205, 0.045, 32, caps=False), mat('coat_dark'), (rx + 0.04, 1.24, rz + 0.07), rot_y=0.15)
    OBJECTS['coat_belt'].scale = (1, 0.44, 1)
    for side in (-1, 1):
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=True, segments=14, radius1=0.05, radius2=0.042, depth=0.56)
        for vv in bm.verts:
            vv.co.y *= 0.8
        make_obj(f'coat_sleeve{side}', bm, mat('coat'), (rx + 0.04 + side * 0.19, 1.36, rz + 0.08), smooth_angle=1.5)
        OBJECTS[f'coat_sleeve{side}'].rotation_euler = (0, -side * 0.08, 0.15)
    build_coat_front(rx + 0.04, rz + 0.07, 0.15, prof)
    # fedora
    lathe('hat', [(0.0, 0.0), (0.15, 0.0), (0.152, 0.006), (0.14, 0.01), (0.086, 0.012), (0.08, 0.06), (0.07, 0.1), (0.04, 0.108), (0.0, 0.1)], mat('felt'), (rx - 0.005, 1.87, rz), segs=36)
    OBJECTS['hat'].rotation_euler = (0.1, 0, 0)
    make_obj('hat_band', bm_cyl(0.0868, 0.0848, 0.022, 36, caps=False), mat('hatband'), (rx - 0.005, 1.893, rz))
    OBJECTS['hat_band'].rotation_euler = (0.1, 0, 0)
    # umbrella leaning on the wall by the coat rack
    lathe('umbrella', [(0.0, 0.0), (0.012, 0.03), (0.035, 0.4), (0.045, 0.75), (0.02, 0.85), (0.0, 0.86)], mat('umbrella'), (rx + 0.26, 0.0, rz - 0.12), segs=8)
    OBJECTS['umbrella'].rotation_euler = (0.12, -0.1, 0)
    tube('umbrella_handle', [(rx + 0.33, 0.86, rz - 0.07), (rx + 0.34, 0.95, rz - 0.06), (rx + 0.38, 0.97, rz - 0.06), (rx + 0.39, 0.93, rz - 0.06)], 0.009, mat('chair_wood'))
    plane('puddle', 0.22, 0.14, mat('kopi'), (rx + 0.24, 0.002, rz - 0.02), facing='y')

    # wall clock above the coat rack: face, rim (the hands are drawn live by the game)
    cyl('clock_body', 0.155, 0.155, 0.035, mat('iron'), (0.42, 2.48, BACK + 0.0175), segs=40, axis='z', bevel=0.006)
    face = cyl('clock_face', 0.14, 0.14, 0.003, mat('clock_face'), (0.42, 2.48, BACK + 0.036), segs=40, axis='z')
    cyl('clock_glass', 0.142, 0.142, 0.002, mat('glass'), (0.42, 2.48, BACK + 0.04), segs=40, axis='z', collection='room')
    build_clock_hands()

    # left of the window: shelf of case binders, the framed licence, a calendar, the filing cabinet
    box('shelf_board', 0.78, 0.025, 0.24, mat('shelf'), (-2.58, 2.36, BACK + 0.12), bevel=0.004)
    for k in (-0.3, 0.3):
        box(f'shelf_bracket{k}', 0.02, 0.14, 0.18, mat('iron'), (-2.58 + k, 2.29, BACK + 0.09), bevel=0.003)
    xx = -2.94
    i = 0
    binders = ['binder_red', 'binder_blue', 'binder_black', 'binder_green', 'binder_black', 'binder_red', 'binder_blue', 'binder_black', 'binder_green']
    while xx < -2.26:
        wdt = 0.055 + hsh(i + 70) * 0.03
        hgt = 0.29 + hsh(i + 80) * 0.03
        lean = 0.0 if i < 8 else 0.25
        b = box(f'binder{i}', wdt, hgt, 0.22, mat(binders[i % len(binders)]), (xx + wdt / 2, 2.3725 + hgt / 2, BACK + 0.125), bevel=0.004)
        b.rotation_euler = (0, -lean, 0)
        plane(f'binder_label{i}', wdt * 0.6, 0.06, mat('card_white'), (xx + wdt / 2, 2.3725 + hgt * 0.62, BACK + 0.236), facing='z')
        OBJECTS[f'binder_label{i}'].rotation_euler = (0, -lean, 0)
        xx += wdt + 0.004
        i += 1
    # framed licence (its text is drawn live by the game on a decal)
    box('licence_frame', 0.46, 0.36, 0.025, mat('frame_wood'), (-2.52, 1.97, BACK + 0.0125), bevel=0.006)
    lic = plane('licence_paper', 0.4, 0.3, mat('card_white'), (-2.52, 1.97, BACK + 0.0265))
    # calendar: a photo of the city above a month grid, no words
    box('calendar_back', 0.3, 0.44, 0.004, mat('card_white'), (-2.46, 1.54, BACK + 0.004), bevel=0.0)
    plane('calendar_photo', 0.28, 0.17, mat('calendar_photo'), (-2.46, 1.66, BACK + 0.007))
    plane('calendar_grid', 0.28, 0.22, mat('calendar_grid'), (-2.46, 1.43, BACK + 0.007))
    cyl('calendar_nail', 0.004, 0.004, 0.02, mat('iron'), (-2.46, 1.78, BACK + 0.01), segs=8, axis='z')
    # a framed photograph above the cabinet, slightly crooked
    box('photo_frame', 0.24, 0.18, 0.02, mat('iron'), (-2.12 - 0.17, 2.0, BACK + 0.01), bevel=0.004)
    OBJECTS['photo_frame'].hide_render = True  # kept for the GLB only if space allows

    cab_x, cab_z = -2.6, BACK + 0.33
    box('cabinet_body', 0.5, 1.32, 0.6, mat('cabinet'), (cab_x, 0.66, cab_z), bevel=0.008, segs=3)
    for i in range(4):
        y = 0.17 + i * 0.31
        box(f'cabinet_drawer{i}', 0.45, 0.28, 0.02, mat('cabinet'), (cab_x, y, cab_z + 0.305), bevel=0.006, segs=2)
        box(f'cabinet_handle{i}', 0.12, 0.02, 0.028, mat('brass'), (cab_x, y - 0.04, cab_z + 0.322), bevel=0.006)
        box(f'cabinet_cardholder{i}', 0.09, 0.045, 0.006, mat('brass'), (cab_x, y + 0.06, cab_z + 0.317), bevel=0.0015)
        plane(f'cabinet_card{i}', 0.075, 0.032, mat('paper_typed'), (cab_x, y + 0.06, cab_z + 0.3205))
    # money plant on the cabinet, as in every office in KL
    lathe('pot', [(0.0, 0.0), (0.07, 0.0), (0.09, 0.14), (0.096, 0.15), (0.088, 0.15), (0.0, 0.13)], mat('terracotta'), (cab_x + 0.08, 1.32, cab_z), segs=24)
    cyl('soil', 0.085, 0.085, 0.005, mat('soil'), (cab_x + 0.08, 1.45, cab_z), segs=20)
    random.seed(4)
    for i in range(24):
        a = random.random() * 6.28
        rr = 0.04 + random.random() * 0.16
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=10, v_segments=6, radius=0.045)
        for vv in bm.verts:
            vv.co.z *= 0.18
            vv.co.x *= 1.1 if vv.co.x > 0 else 0.8
        ob = make_obj(f'leaf{i}', bm, mat('plant'), (cab_x + 0.08 + math.cos(a) * rr, 1.48 + random.random() * 0.12 - rr * 0.9, cab_z + math.sin(a) * rr), smooth_angle=3)
        ob.rotation_euler = (random.random() - 0.5, (random.random() - 0.5) * 1.2, a)
    for i in range(5):
        a = i * 1.3
        tube(f'vine{i}', [(cab_x + 0.08, 1.46, cab_z), (cab_x + 0.08 + math.cos(a) * 0.12, 1.42, cab_z + math.sin(a) * 0.12), (cab_x + 0.08 + math.cos(a) * 0.2, 1.2 - i * 0.05, cab_z + math.sin(a) * 0.16 + 0.05)], 0.003, mat('plant'))

    # transistor radio on the window sill, right of the window
    rxp, ryp, rzp = WIN['x'] + WIN['w'] / 2 - 0.3, WIN['y'] - WIN['h'] / 2 + 0.002, BACK + 0.06
    box('radio_case', 0.27, 0.16, 0.085, mat('radio_wood'), (rxp, ryp + 0.08, rzp), rot_y=0.1, bevel=0.012, segs=3)
    plane('radio_grille', 0.15, 0.11, mat('speaker'), (rxp - 0.05, ryp + 0.085, rzp + 0.0435), rot_y=0.1)
    box('radio_dial', 0.08, 0.05, 0.004, mat('radio_plastic'), (rxp + 0.075, ryp + 0.1, rzp + 0.043), rot_y=0.1, bevel=0.002)
    for k, dy in enumerate((0.05, 0.13)):
        cyl(f'radio_knob{k}', 0.012, 0.012, 0.012, mat('radio_plastic'), (rxp + 0.1, ryp + dy - 0.02, rzp + 0.046), segs=16, axis='z', bevel=0.002)
    tube('radio_aerial', [(rxp + 0.1, ryp + 0.16, rzp - 0.02), (rxp + 0.18, ryp + 0.55, rzp - 0.06)], 0.0018, mat('chrome'))
    tube('radio_cable', [(rxp - 0.12, ryp + 0.02, rzp - 0.03), (rxp - 0.2, ryp - 0.02, rzp + 0.02), (rxp - 0.3, ryp - 0.3, rzp + 0.1), (rxp - 0.25, 0.3, BACK + 0.04)], 0.0025, mat('cable'))

    # split air-conditioner above the window (old, yellowed), its drain pipe and the stain it left
    acx, acy = -0.45, 2.76
    box('ac_body', 0.84, 0.27, 0.2, mat('ac_plastic'), (acx, acy, BACK + 0.1), bevel=0.03, segs=4)
    box('ac_vent', 0.66, 0.035, 0.02, mat('black_plastic'), (acx, acy - 0.105, BACK + 0.19), bevel=0.008)
    for k in range(10):
        box(f'ac_grille{k}', 0.76, 0.004, 0.012, mat('ac_plastic'), (acx, acy + 0.12, BACK + 0.04 + k * 0.016), bevel=0.0)
    box('ac_led', 0.012, 0.006, 0.004, mat('neon_green'), (acx + 0.33, acy - 0.07, BACK + 0.201), bevel=0.0)
    tube('ac_drain', [(acx + 0.4, acy - 0.08, BACK + 0.05), (acx + 0.47, acy - 0.2, BACK + 0.03), (acx + 0.5, 2.0, BACK + 0.02), (acx + 0.52, 1.0, BACK + 0.02)], 0.008, mat('ac_plastic'))
    box('ac_trunking', 0.06, 0.04, 0.03, mat('ac_plastic'), (acx - 0.45, acy, BACK + 0.015), bevel=0.004)

    # ceiling fan: the motor and down-rod stay in the plates; the blades are drawn live (they turn)
    fan_y, fan_x, fan_z = 2.53, -0.2, -2.6
    cyl('fan_canopy', 0.07, 0.05, 0.05, mat('fan_metal'), (fan_x, 2.975, fan_z), segs=24, bevel=0.005)
    cyl('fan_rod', 0.012, 0.012, 0.42, mat('fan_metal'), (fan_x, 2.76, fan_z), segs=12)
    lathe('fan_motor', [(0.0, -0.07), (0.06, -0.07), (0.09, -0.04), (0.095, 0.0), (0.08, 0.04), (0.03, 0.06), (0.0, 0.06)], mat('fan_metal'), (fan_x, fan_y, fan_z), segs=32)
    bl = []
    for i in range(3):
        a = i * 2 * math.pi / 3
        b = box(f'fan_blade{i}', 0.62, 0.008, 0.12, mat('chair_wood'), (fan_x + math.cos(a) * 0.43, fan_y - 0.03, fan_z - math.sin(a) * 0.43), rot_y=a, bevel=0.004, collection='fan_blades')
        b.rotation_euler[0] = 0.0
        bl.append(b)
        bl.append(box(f'fan_iron{i}', 0.14, 0.01, 0.03, mat('fan_metal'), (fan_x + math.cos(a) * 0.13, fan_y - 0.025, fan_z - math.sin(a) * 0.13), rot_y=a, bevel=0.003, collection='fan_blades'))
    # bare pendant bulb near the door, off
    tube('pendant_cord', [(1.9, 3.0, -1.6), (1.9, 2.45, -1.6)], 0.003, mat('cable'))
    lathe('pendant_shade', [(0.0, 0.0), (0.02, 0.0), (0.03, -0.02), (0.13, -0.12), (0.125, -0.125), (0.0, -0.01)], mat('ac_plastic'), (1.9, 2.45, -1.6), segs=24)


def build_coat_front(cx, cz, rot, prof):
    """Notched lapels lying on the coat's front (they follow its squashed-ellipse surface), a turned-up collar,
    double-breasted buttons and a belt buckle."""
    def radius(y):
        pts = sorted((py, pr) for pr, py in prof if pr > 0)
        for (y0, r0), (y1, r1) in zip(pts, pts[1:]):
            if y0 <= y <= y1:
                return r0 + (r1 - r0) * (y - y0) / max(y1 - y0, 1e-6)
        return pts[-1][1] if y > pts[-1][0] else pts[0][1]

    def front(x, y, lift=0.0):
        r = radius(y) * (1.0 + 0.01)
        zz = 0.42 * math.sqrt(max(r * r - x * x, 0.0)) + lift
        return (x, y, zz)

    outline = [(0.03, 1.775), (0.095, 1.752), (0.128, 1.655), (0.104, 1.632), (0.138, 1.56), (0.02, 1.37), (0.004, 1.42), (0.012, 1.70)]
    for side in (-1, 1):
        bm = bmesh.new()
        pts = outline if side > 0 else [(-px, py) for px, py in reversed(outline)]
        # a fan of quads from the outline to the lapel's spine, so the lapel bends with the coat
        top = [bm.verts.new(T(*front(px, py, 0.007))) for px, py in pts]
        bm.faces.new(top)
        bmesh.ops.triangulate(bm, faces=bm.faces[:])
        bmesh.ops.subdivide_edges(bm, edges=bm.edges[:], cuts=2, use_grid_fill=False)
        for v in bm.verts:
            three = Vector((v.co.x, v.co.z, -v.co.y))
            fx, fy, fz = front(three.x, three.y, 0.007)
            v.co = T(fx, fy, fz)
        # face the lapel outward before giving it thickness (the mirrored side comes out inside-out otherwise,
        # which the GLB bake shows as black patches)
        for f in bm.faces:
            if f.normal.y > 0:  # Blender +Y = into the coat
                f.normal_flip()
        bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.006)
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
        res = bmesh.ops.bevel(bm, geom=[e for e in bm.edges if not e.is_manifold or e.calc_face_angle(0) > 1.0], offset=0.002, segments=1, affect='EDGES', clamp_overlap=True)
        mark_wear(bm, res['faces'])
        make_obj(f'coat_lapel{side}', bm, mat('coat'), (cx, 0, cz), rot_y=rot, smooth_angle=0.8)
    # collar: a band standing round the neck, open at the front
    bm = bmesh.new()
    rings = []
    for j, (yy, sc) in enumerate(((1.772, 1.18), (1.84, 1.05))):
        ring = []
        for k in range(15):
            a = math.radians(-60 + 300 * k / 14)  # open at the front (270 degrees)
            ring.append(bm.verts.new(T(math.cos(a) * 0.085 * sc, yy, -math.sin(a) * 0.085 * sc * 0.6)))
        rings.append(ring)
    for k in range(14):
        bm.faces.new((rings[0][k], rings[0][k + 1], rings[1][k + 1], rings[1][k]))
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=0.006)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces[:])
    make_obj('coat_collar', bm, mat('coat'), (cx, 0, cz), rot_y=rot, smooth_angle=1.2)
    for k, (bx, by) in enumerate(((-0.055, 1.33), (0.055, 1.33), (-0.05, 1.17), (0.05, 1.17))):
        fx, fy, fz = front(bx, by, 0.004)
        cyl(f'coat_button{k}', 0.011, 0.011, 0.006, mat('black_plastic'), (cx + fx * math.cos(rot) + fz * math.sin(rot), fy, cz - fx * math.sin(rot) + fz * math.cos(rot)), segs=12, axis='z', rot_y=rot)
    fx, fy, fz = front(0.0, 1.24, 0.012)
    box('coat_buckle', 0.04, 0.05, 0.006, mat('brass'), (cx + fz * math.sin(rot), 1.24, cz + fz * math.cos(rot)), rot_y=rot, bevel=0.002)


def build_floor_clutter():
    """What a working office leaves on the floor: an archive box of old files, a briefcase against the desk, a
    tied stack of newspapers, a dropped sheet and a crumpled page."""
    x, z = DESK['x'], DESK['z']
    # archive box, lid half off, files sticking up
    bx, bz, br = -1.32, -2.32, 0.32
    box('archive_box', 0.42, 0.28, 0.32, mat('cardboard'), (bx, 0.14, bz), rot_y=br, bevel=0.006)
    box('archive_lid', 0.44, 0.05, 0.34, mat('cardboard'), (bx - 0.05, 0.31, bz + 0.03), rot_y=br + 0.22, bevel=0.006)
    OBJECTS['archive_lid'].rotation_euler = (0.12, -0.08, br + 0.22)
    for k in range(4):
        f = box(f'archive_file{k}', 0.3, 0.012, 0.22, mat('manila' if k % 2 else 'paper_typed'), (bx + (hsh(k + 40) - 0.5) * 0.06, 0.29 + k * 0.004, bz + (k - 1.5) * 0.05), rot_y=br + (hsh(k + 41) - 0.5) * 0.2, bevel=0.002)
        f.rotation_euler = (math.pi / 2 - 0.18, 0, br + (hsh(k + 41) - 0.5) * 0.2)
    plane('archive_label', 0.14, 0.07, mat('card_white'), (bx + math.sin(br) * 0.162, 0.17, bz + math.cos(br) * 0.162), rot_y=br)
    # briefcase standing against the right pedestal
    cx_, cz_, cr = x + 0.66, z + 0.62, -0.25
    box('briefcase', 0.44, 0.31, 0.1, mat('briefcase'), (cx_, 0.165, cz_), rot_y=cr, bevel=0.012, segs=3)
    OBJECTS['briefcase'].rotation_euler = (-0.12, 0, cr)
    tube('briefcase_handle', [(cx_ - 0.07, 0.33, cz_ - 0.02), (cx_ - 0.05, 0.37, cz_ - 0.025), (cx_ + 0.05, 0.37, cz_ - 0.035), (cx_ + 0.07, 0.33, cz_ - 0.04)], 0.008, mat('briefcase'))
    for k in (-0.13, 0.13):
        box(f'briefcase_latch{k}', 0.03, 0.022, 0.01, mat('brass'), (cx_ + k * math.cos(cr), 0.29, cz_ + 0.055 - k * math.sin(cr)), rot_y=cr, bevel=0.002)
    # newspapers tied with string, by the coat rack
    nx, nz = 0.95, -3.35
    for k in range(7):
        box(f'news_stack{k}', 0.42, 0.018, 0.3, mat('newsprint'), (nx + (hsh(k + 60) - 0.5) * 0.03, 0.009 + k * 0.019, nz + (hsh(k + 61) - 0.5) * 0.03), rot_y=0.3 + (hsh(k + 62) - 0.5) * 0.12, bevel=0.004)
    for k in (-0.08, 0.08):
        tube(f'news_string{k}', [(nx - 0.2, 0.0, nz + k), (nx - 0.21, 0.07, nz + k), (nx, 0.138, nz + k), (nx + 0.21, 0.07, nz + k), (nx + 0.2, 0.0, nz + k)], 0.0015, mat('card_white'))
    # a dropped sheet on the rug and a crumpled page by the chair
    plane('dropped_sheet', 0.21, 0.297, mat('paper_typed'), (x - 0.12, 0.0085, z + 1.12), facing='y', rot_y=0.9)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.04)
    for vv in bm.verts:
        vv.co *= 0.75 + hsh(77 + vv.index) * 0.5
    make_obj('crumple_floor', bm, mat('paper'), (x + 0.95, 0.035, z + 1.35), smooth_angle=0.4)
    # two cigarette ends that missed the ashtray's last trip to the bin
    for k in range(2):
        cyl(f'butt{k}', 0.004, 0.004, 0.028, mat('cig'), (x + 0.3 + k * 0.07, 0.005, z + 1.25 + k * 0.05), segs=8, axis='x', rot_y=k * 1.3 + 0.4)


def build_clock_hands():
    face = (0.42, 2.48, BACK + 0.0385)
    for name, ln, wd in (('clock_hour', 0.075, 0.011), ('clock_minute', 0.115, 0.007)):
        box(name, wd, ln, 0.0025, mat('iron'), (face[0], face[1] + ln / 2 - 0.015, face[2]), bevel=0.0, collection='clock_hands')


# ------------------------------------------------------------------ the board
def build_board():
    bx, by, bz = BOARD['x'], BOARD['y'], BACK + 0.03
    objs = [
        box('board_frame', BOARD['w'] + 0.12, BOARD['h'] + 0.12, 0.04, mat('frame_wood'), (bx, by, bz - 0.012), bevel=0.01, segs=3),
        box('board_cork', BOARD['w'], BOARD['h'], 0.006, mat('cork'), (bx, by, bz + 0.006), bevel=0.0),
    ]
    # brass picture light over the board
    pl = [
        make_obj('board_light_hood', bm_cyl(0.035, 0.035, 0.7, 24, axis='x'), mat('brass'), (bx, by + BOARD['h'] / 2 + 0.17, bz + 0.14)),
        cyl('board_light_arm', 0.008, 0.008, 0.22, mat('brass'), (bx, by + BOARD['h'] / 2 + 0.14, bz + 0.06), segs=10, axis='z'),
        box('board_light_tube', 0.62, 0.008, 0.02, mat('tube_light'), (bx, by + BOARD['h'] / 2 + 0.143, bz + 0.15), bevel=0.0),
    ]
    OBJECTS['board_light_arm'].rotation_euler = (0.5, 0, 0)
    pick_group('board', objs + pl, IDS['board'])
    add_area_light('board_light', (bx, by + BOARD['h'] / 2 + 0.13, bz + 0.2), (0, -1, -0.22), C('#ffd7a4'), 9.0, size=(0.6, 0.03), group='rest', spread=130)


# ------------------------------------------------------------------ outside: KL from a Brickfields upper floor
def build_city():
    rnd = random.Random(14)
    street_y = -10.0  # the street is ~10 m below the office floor

    def tower(name, x, z, w, d, h, material='tower', y0=street_y, setback=None, col='city'):
        bm = bm_box(w, h, d, bevel=0.0)
        bmesh.ops.translate(bm, vec=T(0, h / 2, 0), verts=bm.verts)
        if setback:
            for (sh, sw) in setback:
                b2 = bm_box(w * sw, h * sh, d * sw, bevel=0.0)
                bmesh.ops.translate(b2, vec=T(0, h + h * sh / 2, 0), verts=b2.verts)
                me = bpy.data.meshes.new('tmp')
                b2.to_mesh(me)
                b2.free()
                bm.from_mesh(me)
                bpy.data.meshes.remove(me)
        return make_obj(name, bm, mat(material), (x, y0, z), collection=col, smooth=False)

    # across the road (~28 m): a row of two- and three-storey shophouses with signboards and rooftop clutter
    zf = -32.0
    x = -70.0
    i = 0
    while x < 60:
        w = rnd.choice([5.5, 6.0, 6.5, 7.0])
        h = rnd.choice([8.6, 9.0, 11.5, 12.4, 8.4])
        shop = tower(f'shop{i}', x + w / 2, zf, w - 0.05, 14.0, h, 'facade_near')
        shop['fw'], shop['fh'] = w - 0.05, h
        if rnd.random() < 0.3:
            box(f'shop_parapet{i}', w, 0.5, 0.25, mat('roof_near'), (x + w / 2, street_y + h + 0.25, zf + 7), bevel=0.0, collection='city', smooth=False)
        if rnd.random() < 0.35:
            sw, sh = w * rnd.uniform(0.5, 0.85), rnd.uniform(0.7, 1.2)
            box(f'shop_sign{i}', sw, sh, 0.2, mat('sign'), (x + w / 2, street_y + rnd.uniform(4.0, 6.0), zf + 7.3), bevel=0.0, collection='city', smooth=False)
        rnd.randint(0, 3)  # (the photo has its own air-conditioners; keep the random sequence stable)
        if rnd.random() < 0.4:
            cyl(f'shop_tank{i}', 0.6, 0.6, 1.2, mat('ac_plastic'), (x + w * 0.4, street_y + h + 0.6, zf + rnd.uniform(-3, 3)), segs=12, collection='city', smooth=False)
        x += w
        i += 1
    for k in range(int((x + 70) / 6)):
        pass
    # the street and the far ground
    plane('street', 400, 400, mat('ground'), (0, street_y, -150), facing='y', collection='city')

    # middle distance: flats and offices, mostly low enough to leave the skyline showing above them
    for j in range(80):
        dist = rnd.uniform(220, 1100)
        deg = rnd.uniform(-80, 50)
        ang = math.radians(deg)
        bx, bz = 0.4 + math.sin(ang) * dist, -0.4 - math.cos(ang) * dist
        central = -40 < deg < 0
        h = rnd.uniform(14, 45) if central else rnd.uniform(25, 120)
        if rnd.random() < 0.08:
            h *= 1.8
        w, d = rnd.uniform(14, 40), rnd.uniform(14, 40)
        tower(f'mid{j}', bx, bz, w, d, h, setback=[(0.12, 0.7)] if rnd.random() < 0.3 else None)
        if h > 60 and rnd.random() < 0.5:
            box(f'mid_beacon{j}', 1.2, 1.2, 1.2, mat('neon_red'), (bx, street_y + h + 1, bz), bevel=0.0, collection='city', smooth=False)
    # far: the city centre, 1.5-4 km
    for j in range(110):
        dist = rnd.uniform(1600, 4200)
        ang = math.radians(rnd.uniform(-65, 35))
        bx, bz = 0.4 + math.sin(ang) * dist, -0.4 - math.cos(ang) * dist
        h = rnd.uniform(50, 230)
        w = rnd.uniform(30, 70)
        tower(f'far{j}', bx, bz, w, w * rnd.uniform(0.6, 1.4), h, setback=[(0.1, 0.75), (0.06, 0.5)] if rnd.random() < 0.4 else None)
        if h > 150 and rnd.random() < 0.6:
            box(f'far_beacon{j}', 3, 3, 3, mat('neon_red'), (bx, street_y + h + 2, bz), bevel=0.0, collection='city', smooth=False)

    # twin towers (generic: eight-pointed, stepped, a sky bridge, spires) ~3 km NE-ish
    def twin(name, cx, cz, scale=1.0):
        H = 380 * scale
        bm = bmesh.new()
        tiers = [(0.0, 0.62, 23.0), (0.62, 0.72, 20.0), (0.72, 0.8, 17.0), (0.8, 0.86, 14.0), (0.86, 0.9, 11.0), (0.9, 0.93, 8.0)]
        for (a, b, r) in tiers:
            t = bmesh.new()
            n = 16
            pts = []
            for k in range(n):
                ang = 2 * math.pi * k / n
                rr = r * scale * (1.0 if k % 2 == 0 else 0.86)
                pts.append((math.cos(ang) * rr, math.sin(ang) * rr))
            bot = [t.verts.new((p[0], p[1], a * H)) for p in pts]
            topv = [t.verts.new((p[0], p[1], b * H)) for p in pts]
            for k in range(n):
                t.faces.new((bot[k], bot[(k + 1) % n], topv[(k + 1) % n], topv[k]))
            t.faces.new(topv)
            me = bpy.data.meshes.new('tmp')
            t.to_mesh(me)
            t.free()
            bm.from_mesh(me)
            bpy.data.meshes.remove(me)
        sp = bmesh.new()
        bmesh.ops.create_cone(sp, cap_ends=True, segments=8, radius1=2.5 * scale, radius2=0.2, depth=0.16 * H)
        bmesh.ops.translate(sp, vec=Vector((0, 0, 0.93 * H + 0.08 * H)), verts=sp.verts)
        me = bpy.data.meshes.new('tmp')
        sp.to_mesh(me)
        sp.free()
        bm.from_mesh(me)
        bpy.data.meshes.remove(me)
        return make_obj(name, bm, mat('landmark'), (cx, street_y, cz), collection='city', smooth=False)

    a = math.radians(-14)
    d = 2900
    tx, tz = 0.4 + math.sin(a) * d, -0.4 - math.cos(a) * d
    twin('twin_a', tx - 32, tz)
    twin('twin_b', tx + 32, tz + 8)
    box('twin_bridge', 40, 6, 5, mat('landmark'), (tx, street_y + 175, tz + 4), bevel=0.0, collection='city', smooth=False)
    # telecom tower on its hill (generic: shaft, pod, mast)
    a = math.radians(-30)
    d = 3300
    kx, kz = 0.4 + math.sin(a) * d, -0.4 - math.cos(a) * d
    hill = bmesh.new()
    bmesh.ops.create_uvsphere(hill, u_segments=24, v_segments=12, radius=1.0)
    bmesh.ops.scale(hill, vec=Vector((420, 300, 110)), verts=hill.verts)
    make_obj('kl_hill', hill, mat('tower'), (kx, street_y - 30, kz), collection='city', smooth=True)
    lathe('kl_tower', [(0.0, 0.0), (9, 0.0), (7, 60), (5, 200), (5, 250), (14, 262), (21, 275), (22, 285), (14, 300), (6, 305), (3, 330), (1.2, 400), (0.0, 420)],
          mat('landmark'), (kx, street_y + 70, kz), segs=24, collection='city')
    box('kl_beacon', 3, 3, 3, mat('neon_red'), (kx, street_y + 70 + 420, kz), bevel=0.0, collection='city', smooth=False)

    # the mamak's lightbox sign right under the window: just its top edge shows from up here
    box('mamak_sign', 3.2, 0.9, 0.25, mat('sign'), (WIN['x'] + 0.2, -0.9, BACK - WALL_T - 0.6), bevel=0.0, collection='city', smooth=False)
    box('mamak_neon_g', 2.4, 0.05, 0.05, mat('neon_green'), (WIN['x'] - 0.2, -0.35, BACK - WALL_T - 0.7), bevel=0.0, collection='city', smooth=False)
    box('mamak_neon_r', 1.0, 0.05, 0.05, mat('neon_red'), (WIN['x'] + 0.9, -0.3, BACK - WALL_T - 0.7), bevel=0.0, collection='city', smooth=False)


# ================================================================== lights
LIGHTS = {}


def light_group(ob, group):
    ob.lightgroup = group


def add_point_light(name, pos, color, power, radius=0.05, group='rest'):
    L = bpy.data.lights.new(name, 'POINT')
    L.color = color
    L.energy = power
    L.shadow_soft_size = radius
    ob = bpy.data.objects.new(name, L)
    ob.location = T(*pos)
    coll('lights').objects.link(ob)
    light_group(ob, group)
    LIGHTS[name] = ob
    return ob


def aim(ob, direction):
    d = T(*direction).normalized()
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def add_area_light(name, pos, direction, color, power, size=(1, 1), group='rest', spread=180, portal=False):
    L = bpy.data.lights.new(name, 'AREA')
    L.shape = 'RECTANGLE'
    L.size, L.size_y = size
    L.color = color
    L.energy = power
    L.spread = math.radians(spread)
    if portal:
        L.cycles.is_portal = True
    ob = bpy.data.objects.new(name, L)
    ob.visible_camera = False
    ob.visible_glossy = name in ('board_light', 'corridor')
    ob.location = T(*pos)
    aim(ob, direction)
    coll('lights').objects.link(ob)
    light_group(ob, group)
    LIGHTS[name] = ob
    return ob


def add_spot(name, pos, direction, color, power, angle=60, blend=0.4, radius=0.1, group='rest'):
    L = bpy.data.lights.new(name, 'SPOT')
    L.color = color
    L.energy = power
    L.spot_size = math.radians(angle)
    L.spot_blend = blend
    L.shadow_soft_size = radius
    ob = bpy.data.objects.new(name, L)
    ob.location = T(*pos)
    aim(ob, direction)
    coll('lights').objects.link(ob)
    light_group(ob, group)
    LIGHTS[name] = ob
    return ob


def add_sun(name, group='rest'):
    L = bpy.data.lights.new(name, 'SUN')
    ob = bpy.data.objects.new(name, L)
    coll('lights').objects.link(ob)
    light_group(ob, group)
    LIGHTS[name] = ob
    return ob


def build_lights():
    wb = WIN['y'] - WIN['h'] / 2
    add_sun('sun')
    # sky light through the window, as a portal so the interior converges
    add_area_light('window_portal', (WIN['x'], WIN['y'], BACK - WALL_T - 0.02), (0, 0, 1), (1, 1, 1), 1.0, size=(WIN['w'], WIN['h']), portal=True)
    # the mamak's neon under the window washes the sill, the reveal and the ceiling
    add_area_light('neon_g', (WIN['x'] - 0.3, wb - 1.0, BACK - WALL_T - 0.45), (0.0, 1.0, 0.25), C('#2affb0'), 200, size=(2.2, 0.15), group='neon', spread=120)
    add_area_light('neon_r', (WIN['x'] + 0.8, wb - 0.95, BACK - WALL_T - 0.5), (0.0, 1.0, 0.3), C('#ff2a50'), 120, size=(1.0, 0.12), group='neon', spread=120)
    # sodium street lamp below and in front: throws the window frame and blinds onto the ceiling
    add_spot('street', (WIN['x'] + 1.8, -4.0, BACK - 6.5), (-0.2, 1.0, 0.75), C('#ff9a3c'), 9000, angle=40, blend=0.5, radius=0.15, group='rest')
    # lightning: a broad cold flash high over the street (only its own light-group pass is kept)
    add_area_light('flash', (WIN['x'], 9.0, BACK - 14.0), (0.0, -0.45, 1.0), C('#cfdcff'), 2.5e5, size=(16, 16), group='flash')
    # soft city glow bouncing off low cloud (night): a dim warm fill through the window
    # daylight from the room's other opening (behind the camera): the window wall is backlit otherwise
    add_area_light('fill', (0.0, 2.3, 1.85), (0.0, -0.22, -1.0), C('#dfe8f2'), 0.0, size=(5.0, 1.6), group='rest', spread=150)
    add_area_light('city_glow', (WIN['x'], WIN['y'] + 2.0, BACK - 6.0), (0.0, -0.35, 1.0), C('#ff9e6a'), 0.0, size=(6, 3), group='rest')


# ================================================================== world / sky
def build_world():
    w = bpy.data.worlds.new('sky')
    bpy.context.scene.world = w
    nt = w.node_tree
    nt.nodes.clear()
    out = nt.nodes.new('ShaderNodeOutputWorld')
    tc = nt.nodes.new('ShaderNodeTexCoord')
    sep = nt.nodes.new('ShaderNodeSeparateXYZ')
    nt.links.new(tc.outputs['Generated'], sep.inputs[0])
    # gradient by elevation: horizon -> zenith
    ramp = nt.nodes.new('ShaderNodeValToRGB')
    mr = nt.nodes.new('ShaderNodeMapRange')
    mr.inputs['From Min'].default_value = -0.05
    mr.inputs['From Max'].default_value = 0.45
    nt.links.new(sep.outputs[2], mr.inputs['Value'])
    nt.links.new(mr.outputs[0], ramp.inputs[0])
    # cloud deck: noise over the horizontal plane
    div = nt.nodes.new('ShaderNodeVectorMath')
    div.operation = 'DIVIDE'
    mx = nt.nodes.new('ShaderNodeMath')
    mx.operation = 'MAXIMUM'
    mx.inputs[1].default_value = 0.04
    nt.links.new(sep.outputs[2], mx.inputs[0])
    comb = nt.nodes.new('ShaderNodeCombineXYZ')
    nt.links.new(mx.outputs[0], comb.inputs[0])
    nt.links.new(mx.outputs[0], comb.inputs[1])
    nt.links.new(mx.outputs[0], comb.inputs[2])
    nt.links.new(tc.outputs['Generated'], div.inputs[0])
    nt.links.new(comb.outputs[0], div.inputs[1])
    noise = nt.nodes.new('ShaderNodeTexNoise')
    noise.inputs['Scale'].default_value = 1.4
    noise.inputs['Detail'].default_value = 8
    noise.inputs['Roughness'].default_value = 0.6
    nt.links.new(div.outputs[0], noise.inputs['Vector'])
    cov = nt.nodes.new('ShaderNodeMapRange')
    cov.label = 'cloud_cover'
    cov.inputs['From Min'].default_value = 0.35
    cov.inputs['From Max'].default_value = 0.75
    nt.links.new(noise.outputs['Fac'], cov.inputs['Value'])
    cloud_col = nt.nodes.new('ShaderNodeRGB')
    cloud_col.label = 'cloud_color'
    mix = nt.nodes.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    nt.links.new(cov.outputs[0], mix.inputs[0])
    nt.links.new(ramp.outputs[0], mix.inputs[6])
    nt.links.new(cloud_col.outputs[0], mix.inputs[7])
    # below the horizon: dark ground haze
    bg = nt.nodes.new('ShaderNodeBackground')
    bg.label = 'sky_bg'
    nt.links.new(mix.outputs[2], bg.inputs['Color'])
    nt.links.new(bg.outputs[0], out.inputs['Surface'])
    WORLD.update(ramp=ramp, cover=cov, cloud=cloud_col, bg=bg)


WORLD = {}


def set_sky(horizon, mid, zenith, cloud, cover, strength):
    cr = WORLD['ramp'].color_ramp
    while len(cr.elements) > 1:
        cr.elements.remove(cr.elements[-1])
    cr.elements[0].position = 0.0
    cr.elements[0].color = (*horizon, 1)
    e = cr.elements.new(0.35)
    e.color = (*mid, 1)
    e = cr.elements.new(1.0)
    e.color = (*zenith, 1)
    WORLD['cloud'].outputs[0].default_value = (*cloud, 1)
    WORLD['cover'].inputs['To Max'].default_value = cover
    WORLD['bg'].inputs['Strength'].default_value = strength


# ================================================================== time of day rigs
def sun_dir(elev, azim):
    e, a = math.radians(elev), math.radians(azim)
    return (math.sin(a) * math.cos(e), -math.sin(e), math.cos(a) * math.cos(e))


RIGS = {
    # cool sun low through the haze, lamp off, the city pale
    'morning': dict(sun=dict(elev=26, azim=-24, color=C('#ffe6c8'), strength=17.0, angle=1.0),
                    sky=dict(horizon=C('#c9d4dc'), mid=C('#a8bfd2'), zenith=C('#6f93b8'), cloud=C('#d4d8dc'), cover=0.65, strength=1.6),
                    haze=dict(color=C('#c4cfd6'), dist=900, amount=1.0, strength=1.5),
                    lamp=False, board=False, neon=0.0, street=0.0, city=dict(near_lit=0.05, tower_lit=0.05, near_emit=0.5, tower_emit=0.3, landmark_emit=0.0, sign_emit=0.0, wet=0.7),
                    exposure=1.5, city_glow=0.0, corridor=8, fill=90.0, fill_color=C('#d8e4f0')),
    # hot tropical light, high and harsh, hard slat shadows on the desk
    'afternoon': dict(sun=dict(elev=42, azim=22, color=C('#fff0da'), strength=15.0, angle=0.6),
                      sky=dict(horizon=C('#d8e2ea'), mid=C('#9ec0de'), zenith=C('#4f84bf'), cloud=C('#f2f2f0'), cover=0.5, strength=2.2),
                      haze=dict(color=C('#d2dbe2'), dist=2200, amount=1.0, strength=2.0),
                      lamp=False, board=False, neon=0.0, street=0.0, city=dict(near_lit=0.02, tower_lit=0.02, near_emit=0.3, tower_emit=0.2, landmark_emit=0.0, sign_emit=0.0, wet=0.3),
                      exposure=1.2, city_glow=0.0, corridor=6, fill=150.0, fill_color=C('#f0ede4')),
    # amber dusk, the lamp on, the city's lights coming on
    'evening': dict(sun=dict(elev=17, azim=22, color=C('#ff8a3a'), strength=8.0, angle=1.0),
                    sky=dict(horizon=C('#ff9a5a'), mid=C('#c46a6a'), zenith=C('#3c3c6e'), cloud=C('#c0705a'), cover=0.55, strength=1.0),
                    haze=dict(color=C('#c97a5e'), dist=1600, amount=1.0, strength=1.0),
                    lamp=True, board=True, neon=0.6, street=0.3, city=dict(near_lit=0.22, tower_lit=0.25, near_emit=1.2, tower_emit=1.6, landmark_emit=0.8, sign_emit=1.0, wet=0.6),
                    exposure=1.0, city_glow=0.0, corridor=14, fill=35.0, fill_color=C('#ffc9a0')),
    # lamp, neon from the street, rain, the city lit
    'night': dict(sun=None,
                  sky=dict(horizon=C('#3a2a3a'), mid=C('#1a1a2c'), zenith=C('#06080e'), cloud=C('#4a3438'), cover=0.75, strength=0.5),
                  haze=dict(color=C('#3a2c34'), dist=2400, amount=1.0, strength=1.0),
                  lamp=True, board=True, neon=1.0, street=1.0, city=dict(near_lit=0.55, tower_lit=0.35, near_emit=4.5, tower_emit=2.4, landmark_emit=2.5, sign_emit=2.2, wet=0.9, street_wash=1.0),
                  exposure=0.9, city_glow=60.0, corridor=18),
}


def apply_rig(tod, lamp_override=None):
    r = RIGS[tod]
    sc = bpy.context.scene
    sun = LIGHTS['sun']
    if r['sun']:
        s = r['sun']
        aim(sun, sun_dir(s['elev'], s['azim']))
        sun.data.energy = s['strength']
        sun.data.color = s['color']
        sun.data.angle = math.radians(s['angle'])
        sun.hide_render = False
    else:
        sun.data.energy = 0.0
        sun.hide_render = True
    set_sky(**r['sky'])
    h = r['haze']
    set_city(haze_color=h['color'], haze_dist=h['dist'], haze_amount=h['amount'], haze_strength=h['strength'], neon=8.0 * max(r['neon'], 0.05), **{'street_wash': 0.0, **r['city']})
    lamp_on = r['lamp'] if lamp_override is None else lamp_override
    LIGHTS['lamp_light'].data.energy = 40.0 if lamp_on else 0.0
    MATS['bulb'].node_tree.nodes['Emission'].inputs['Strength'].default_value = 18.0 if lamp_on else 0.0
    shade_inside = [n for n in MATS['shade_glass'].node_tree.nodes if n.type == 'BSDF_PRINCIPLED'][1]
    shade_inside.inputs['Emission Strength'].default_value = 1.5 if lamp_on else 0.0
    LIGHTS['board_light'].data.energy = 9.0 if r['board'] else 0.0
    MATS['tube_light'].node_tree.nodes['Emission'].inputs['Strength'].default_value = 6.0 if r['board'] else 0.2
    LIGHTS['neon_g'].data.energy = 200 * r['neon']
    LIGHTS['neon_r'].data.energy = 120 * r['neon']
    LIGHTS['street'].data.energy = 9000 * r['street']
    LIGHTS['city_glow'].data.energy = r['city_glow']
    LIGHTS['corridor'].data.energy = r['corridor']
    LIGHTS['fill'].data.energy = r.get('fill', 0.0)
    LIGHTS['fill'].data.color = r.get('fill_color', C('#dfe8f2'))
    sc.view_settings.exposure = r['exposure']
    return lamp_on


# ================================================================== scene / render setup
def setup_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    import addon_utils
    addon_utils.enable('cycles', default_set=True)
    sc = bpy.context.scene
    sc.render.engine = 'CYCLES'
    cy = sc.cycles
    cy.device = 'CPU'
    cy.samples = 128
    cy.use_adaptive_sampling = True
    cy.adaptive_threshold = 0.04
    cy.adaptive_min_samples = 16
    cy.use_denoising = True
    cy.denoiser = 'OPENIMAGEDENOISE'
    cy.denoising_input_passes = 'RGB_ALBEDO_NORMAL'
    cy.denoising_prefilter = 'ACCURATE'
    cy.max_bounces = 8
    cy.diffuse_bounces = 4
    cy.glossy_bounces = 3
    cy.transmission_bounces = 6
    cy.transparent_max_bounces = 12
    cy.volume_bounces = 0
    cy.caustics_reflective = False
    cy.caustics_refractive = False
    cy.sample_clamp_indirect = 6.0
    cy.blur_glossy = 1.0
    sc.render.threads_mode = 'AUTO'
    sc.view_settings.view_transform = 'AgX'
    sc.view_settings.look = 'AgX - Medium High Contrast'
    sc.render.film_transparent = False
    vl = sc.view_layers[0]
    for g in ('lamp', 'neon', 'flash', 'rest'):
        vl.lightgroups.add(name=g)
    vl.use_pass_z = True
    vl.cycles.denoising_store_passes = True
    return sc


def build_scene():
    sc = setup_scene()
    build_world()
    build_materials()
    build_room()
    build_blinds()
    build_lights()
    build_desk()
    build_props()
    build_board()
    build_city()
    # emissive meshes must sit in light groups too, or they leak into "Combined" only
    for ob in bpy.data.objects:
        if ob.type == 'MESH':
            ob.lightgroup = 'rest'
    for ob in COLL['city'].all_objects:
        ob.visible_shadow = False
    for n in ('lamp_bulb', 'lamp_shade'):
        OBJECTS[n].lightgroup = 'lamp'
    for n in ('mamak_neon_g', 'mamak_neon_r'):
        OBJECTS[n].lightgroup = 'neon'
    bpy.context.scene.world.lightgroup = 'rest'
    return sc


def camera_for(view, fov, w, h, overscan=1.0):
    v = VIEWS[view]
    cam_d = bpy.data.cameras.new('cam_' + view)
    cam_d.sensor_fit = 'VERTICAL'
    fov_os = 2 * math.atan(math.tan(math.radians(fov) / 2) * overscan)
    cam_d.angle = fov_os
    cam_d.clip_start = 0.05
    cam_d.clip_end = 10000
    cam = bpy.data.objects.new('cam_' + view, cam_d)
    bpy.context.scene.collection.objects.link(cam)
    pos, look = T(*v['pos']), T(*v['look'])
    cam.location = pos
    cam.rotation_euler = (look - pos).to_track_quat('-Z', 'Y').to_euler()
    bpy.context.scene.camera = cam
    sc = bpy.context.scene
    sc.render.resolution_x, sc.render.resolution_y = w, h
    sc.render.resolution_percentage = 100
    return cam, fov_os


def collection_visible(name, on):
    c = COLL.get(name) or bpy.data.collections.get(name)
    if c:
        c.hide_render = not on


def load_scene(path):
    bpy.ops.wm.open_mainfile(filepath=path)
    import addon_utils
    addon_utils.enable('cycles', default_set=True)
    COLL.clear()
    for c in bpy.data.collections:
        COLL[c.name] = c
    OBJECTS.clear()
    for o in bpy.data.objects:
        OBJECTS[o.name] = o
    LIGHTS.clear()
    for o in bpy.data.objects:
        if o.type == 'LIGHT':
            LIGHTS[o.name] = o
    MATS.clear()
    for m in bpy.data.materials:
        MATS[m.name] = m
    CITY.clear()
    for m in bpy.data.materials:
        if not m.node_tree:
            continue
        for n in m.node_tree.nodes:
            if n.label and n.type in ('VALUE', 'RGB'):
                CITY.setdefault(n.label, []).append(n)
    w = bpy.context.scene.world
    nt = w.node_tree
    WORLD.update(ramp=next(n for n in nt.nodes if n.type == 'VALTORGB'), cover=next(n for n in nt.nodes if n.label == 'cloud_cover'),
                 cloud=next(n for n in nt.nodes if n.label == 'cloud_color'), bg=next(n for n in nt.nodes if n.type == 'BACKGROUND'))
    PICK_NODES.clear()
    for o in bpy.data.objects:
        if 'pick' in o.keys():
            PICK_NODES.setdefault(o['pick'], []).append(o)
    return bpy.context.scene


# ================================================================== plates
def numpy_image(path):
    import numpy as np
    img = bpy.data.images.load(path)
    w, h = img.size
    a = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    bpy.data.images.remove(img)
    return a.reshape(h, w, 4)[::-1]  # top row first


def save_display(arr_linear, path, sc):
    """Linear RGB (h, w, 3, top row first) -> PNG through the scene's view transform (AgX look)."""
    import numpy as np
    h, w = arr_linear.shape[:2]
    img = bpy.data.images.new('tmp_save', w, h, alpha=False, float_buffer=True)
    rgba = np.ones((h, w, 4), dtype=np.float32)
    rgba[..., :3] = arr_linear
    img.pixels.foreach_set(rgba[::-1].ravel())
    img.file_format = 'PNG'
    sc.render.image_settings.file_format = 'PNG'
    sc.render.image_settings.color_mode = 'RGB'
    sc.render.image_settings.color_depth = '8'
    img.save_render(path, scene=sc)
    bpy.data.images.remove(img)
    from PIL import Image
    return np.asarray(Image.open(path).convert('RGB'), dtype=np.float32) / 255.0


def setup_compositor(sc, outdir, prefix):
    """Denoise the light-group passes and write linear EXRs: combined, lamp, neon, flash, depth."""
    tree = bpy.data.node_groups.new('comp_' + prefix, 'CompositorNodeTree')
    sc.compositing_node_group = tree
    rl = tree.nodes.new('CompositorNodeRLayers')
    fo = tree.nodes.new('CompositorNodeOutputFile')
    fo.directory = outdir
    fo.file_name = prefix + '_'
    fo.save_as_render = False
    fo.format.media_type = 'IMAGE'
    fo.format.file_format = 'OPEN_EXR'
    fo.format.color_depth = '32'
    for name in ('combined', 'lamp', 'neon', 'flash', 'depth'):
        fo.file_output_items.new('FLOAT' if name == 'depth' else 'RGBA', name)
    tree.links.new(rl.outputs['Image'], fo.inputs['combined'])
    tree.links.new(rl.outputs['Depth'], fo.inputs['depth'])
    for g in ('lamp', 'neon', 'flash'):
        dn = tree.nodes.new('CompositorNodeDenoise')
        tree.links.new(rl.outputs['Combined_' + g], dn.inputs['Image'])
        tree.links.new(rl.outputs['Denoising Albedo'], dn.inputs['Albedo'])
        tree.links.new(rl.outputs['Denoising Normal'], dn.inputs['Normal'])
        tree.links.new(dn.outputs[0], fo.inputs[g])
    return tree


def find_exr(outdir, prefix, name):
    for f in sorted(os.listdir(outdir)):
        if f.startswith(prefix + '_') and f.endswith(f'_{name}.exr'):
            return os.path.join(outdir, f)
    raise FileNotFoundError(f'{prefix} {name} in {outdir}')


def render_plate(sc, tod, orient, work, out, samples=None, res=1.0, quick=False):
    import numpy as np
    from PIL import Image
    spec = PLATES[orient]
    w, h = int(spec['w'] * res), int(spec['h'] * res)
    cam, fov_os = camera_for(spec['view'], spec['fov'], w, h, OVERSCAN)
    collection_visible('fan_blades', False)
    collection_visible('clock_hands', False)
    lamp_on = apply_rig(tod)
    if samples:
        sc.cycles.samples = samples
    # lightning flash is a light-group pass on top; keep it at a fixed strength
    LIGHTS['flash'].data.energy = 2.5e5
    LIGHTS['flash'].hide_render = False
    sc.view_layers[0].material_override = None
    rdir = os.path.join(work, 'renders')
    os.makedirs(rdir, exist_ok=True)
    prefix = f'{tod}_{orient}'
    for f in os.listdir(rdir):
        if f.startswith(prefix + '_'):
            os.remove(os.path.join(rdir, f))
    setup_compositor(sc, rdir + '/', prefix)
    sc.render.filepath = os.path.join(rdir, prefix + '_beauty.png')
    t0 = time.time()
    bpy.ops.render.render(write_still=True)
    t_render = time.time() - t0
    comb = numpy_image(find_exr(rdir, prefix, 'combined'))[..., :3]
    lamp = numpy_image(find_exr(rdir, prefix, 'lamp'))[..., :3]
    neon = numpy_image(find_exr(rdir, prefix, 'neon'))[..., :3]
    flash = numpy_image(find_exr(rdir, prefix, 'flash'))[..., :3]
    depth = numpy_image(find_exr(rdir, prefix, 'depth'))[..., 0]
    base = np.maximum(comb - flash, 0)
    disp = save_display(base, os.path.join(rdir, prefix + '_disp.png'), sc)
    # lamp delta: the other state of the lamp (on <-> off), in display space
    other = np.maximum(base - lamp, 0) if lamp_on else base + lamp * (1.0 if lamp.max() > 1e-4 else 0)
    if not lamp_on:
        # the beauty had the lamp off: render its contribution from a lamp-only pass is not available,
        # so estimate it from a quick lamp-on render below (handled by render_lamp_pass)
        other = None
    disp_neon_off = save_display(np.maximum(base - neon, 0), os.path.join(rdir, prefix + '_noneon.png'), sc)
    disp_flash = save_display(base + flash * 0.6, os.path.join(rdir, prefix + '_flash.png'), sc)
    if other is not None:
        disp_other = save_display(other, os.path.join(rdir, prefix + '_lampother.png'), sc)
    else:
        disp_other = render_lamp_on_pass(sc, base, rdir, prefix, samples=max(32, (samples or sc.cycles.samples) // 4))
    from bpy_extras.object_utils import world_to_camera_view
    pts = [world_to_camera_view(sc, cam, T(BOARD['x'] + sx * (BOARD['w'] / 2 - 0.12), BOARD['y'] + sy * (BOARD['h'] / 2 - 0.12), BACK + 0.036)) for sx in (-1, 1) for sy in (-1, 1)]
    board_uv = [round(min(p.x for p in pts), 4), round(1 - max(p.y for p in pts), 4), round(max(p.x for p in pts), 4), round(1 - min(p.y for p in pts), 4)]
    meta = dict(board=board_uv, tod=tod, orient=orient, w=w, h=h, fov=math.degrees(fov_os), fov_view=spec['fov'], overscan=OVERSCAN, view=spec['view'],
                pos=VIEWS[spec['view']]['pos'], look=VIEWS[spec['view']]['look'], lamp_default=bool(lamp_on), render_s=round(t_render, 1))
    return dict(disp=disp, other=disp_other, noneon=disp_neon_off, flash=disp_flash, depth=depth, meta=meta)


def render_lamp_on_pass(sc, base_linear, rdir, prefix, samples=48):
    """Day rigs render with the lamp off; render the lamp's light alone (all else dark) and add it."""
    import numpy as np
    saved = {}
    for name, ob in LIGHTS.items():
        saved[name] = ob.hide_render
        ob.hide_render = name != 'lamp_light'
    w = bpy.context.scene.world
    bgs = WORLD['bg'].inputs['Strength'].default_value
    WORLD['bg'].inputs['Strength'].default_value = 0.0
    LIGHTS['lamp_light'].data.energy = 40.0
    MATS['bulb'].node_tree.nodes['Emission'].inputs['Strength'].default_value = 18.0
    [n for n in MATS['shade_glass'].node_tree.nodes if n.type == 'BSDF_PRINCIPLED'][1].inputs['Emission Strength'].default_value = 1.5
    city_on = COLL['city'].hide_render
    COLL['city'].hide_render = True
    s0 = sc.cycles.samples
    sc.cycles.samples = samples
    tree = bpy.data.node_groups.new('comp_lamp_' + prefix, 'CompositorNodeTree')
    sc.compositing_node_group = tree
    rl = tree.nodes.new('CompositorNodeRLayers')
    fo = tree.nodes.new('CompositorNodeOutputFile')
    fo.directory = rdir + '/'
    fo.file_name = prefix + '_'
    fo.save_as_render = False
    fo.format.media_type = 'IMAGE'
    fo.format.file_format = 'OPEN_EXR'
    fo.format.color_depth = '32'
    fo.file_output_items.new('RGBA', 'lamponly')
    tree.links.new(rl.outputs['Image'], fo.inputs['lamponly'])
    sc.render.filepath = os.path.join(rdir, prefix + '_lamponly.png')
    bpy.ops.render.render(write_still=True)
    lamp = numpy_image(find_exr(rdir, prefix, 'lamponly'))[..., :3]
    for name, ob in LIGHTS.items():
        ob.hide_render = saved[name]
    WORLD['bg'].inputs['Strength'].default_value = bgs
    COLL['city'].hide_render = city_on
    sc.cycles.samples = s0
    LIGHTS['lamp_light'].data.energy = 0.0
    MATS['bulb'].node_tree.nodes['Emission'].inputs['Strength'].default_value = 0.0
    return save_display(base_linear + lamp, os.path.join(rdir, prefix + '_lampother.png'), sc)


def render_ids(sc, orient, work, res=0.5):
    """Object ids (exact, no AA) at half resolution; the glass is opaque here, so id 1 marks the window."""
    import numpy as np
    spec = PLATES[orient]
    w, h = int(spec['w'] * res), int(spec['h'] * res)
    camera_for(spec['view'], spec['fov'], w, h, OVERSCAN)
    collection_visible('fan_blades', False)
    collection_visible('clock_hands', False)
    vl = sc.view_layers[0]
    vl.material_override = MATS['id_override']
    s0, d0, f0 = sc.cycles.samples, sc.cycles.use_denoising, sc.cycles.filter_width
    sc.cycles.samples = 1
    sc.cycles.use_adaptive_sampling = False
    sc.cycles.use_denoising = False
    sc.cycles.filter_width = 0.01
    hidden = {n: o.hide_render for n, o in LIGHTS.items()}
    rdir = os.path.join(work, 'renders')
    os.makedirs(rdir, exist_ok=True)
    tree = bpy.data.node_groups.new('comp_ids_' + orient, 'CompositorNodeTree')
    sc.compositing_node_group = tree
    rl = tree.nodes.new('CompositorNodeRLayers')
    fo = tree.nodes.new('CompositorNodeOutputFile')
    fo.directory = rdir + '/'
    fo.file_name = 'ids_' + orient + '_'
    fo.save_as_render = False
    fo.format.media_type = 'IMAGE'
    fo.format.file_format = 'OPEN_EXR'
    fo.format.color_depth = '32'
    fo.file_output_items.new('RGBA', 'ids')
    fo.file_output_items.new('FLOAT', 'depth')
    tree.links.new(rl.outputs['Image'], fo.inputs['ids'])
    tree.links.new(rl.outputs['Depth'], fo.inputs['depth'])
    for f in os.listdir(rdir):
        if f.startswith('ids_' + orient + '_'):
            os.remove(os.path.join(rdir, f))
    # the city has no ids; it stays out so the glass reads as one region
    city_hidden = COLL['city'].hide_render
    COLL['city'].hide_render = True
    sc.render.filepath = os.path.join(rdir, 'ids_' + orient + '.png')
    bpy.ops.render.render(write_still=True)
    COLL['city'].hide_render = city_hidden
    ids = numpy_image(find_exr(rdir, 'ids_' + orient, 'ids'))[..., 0]
    vl.material_override = None
    sc.cycles.samples, sc.cycles.use_denoising, sc.cycles.filter_width = s0, d0, f0
    sc.cycles.use_adaptive_sampling = True
    return np.rint(ids).astype(np.uint8)


def write_plates(sc, tods, orients, work, out, quick=False):
    import numpy as np
    from PIL import Image
    os.makedirs(out, exist_ok=True)
    meta_path = os.path.join(out, 'plates.json')
    meta = json.load(open(meta_path)) if os.path.exists(meta_path) else {'plates': {}, 'ids': IDS, 'depth': [DEPTH_NEAR, DEPTH_FAR]}
    res = 0.5 if quick else 1.0
    for orient in orients:
        ids = render_ids(sc, orient, work, res * 0.5)
        for tod in tods:
            r = render_plate(sc, tod, orient, work, out, samples=(48 if quick else 72), res=res, quick=quick)
            m = r['meta']
            H, W = r['disp'].shape[:2]
            to8 = lambda a: (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
            Image.fromarray(to8(r['disp'])).save(os.path.join(out, f'plate_{tod}_{orient}.webp'), quality=90, method=6)
            # fx: R = lamp (other state minus base), G = neon (base minus neon off), B = lightning (flash minus base); signed lamp packed around 0.5
            lum = lambda a: a[..., 0] * 0.3 + a[..., 1] * 0.55 + a[..., 2] * 0.15
            lampd = lum(r['other']) - lum(r['disp'])
            neond = lum(r['disp']) - lum(r['noneon'])
            flashd = lum(r['flash']) - lum(r['disp'])
            sign = 1.0 if m['lamp_default'] is False else -1.0
            fx = np.stack([np.clip(lampd * sign, 0, 1), np.clip(neond * 2.0, 0, 1), np.clip(flashd, 0, 1)], -1)
            fxi = Image.fromarray(to8(fx)).resize((W // 2, H // 2), Image.BILINEAR)
            fxi.save(os.path.join(out, f'fx_{tod}_{orient}.webp'), quality=72, method=6)
            m['lamp_sign'] = sign
            meta['plates'][f'{tod}_{orient}'] = m
            if tod == tods[0]:
                d = r['depth']
                dn = np.clip((d - DEPTH_NEAR) / (DEPTH_FAR - DEPTH_NEAR), 0, 1)
                hh, ww = ids.shape
                dimg = Image.fromarray((dn * 255 + 0.5).astype(np.uint8)).resize((ww, hh), Image.BILINEAR)
                aux = np.zeros((hh, ww, 3), dtype=np.uint8)
                aux[..., 0] = np.where(ids == IDS['glass'], 255, np.asarray(dimg))
                aux[..., 1] = (np.minimum(ids, 15) * 16).astype(np.uint8)
                aux[..., 2] = np.where(ids == IDS['glass'], 255, 0).astype(np.uint8)
                Image.fromarray(aux).save(os.path.join(out, f'aux_{orient}.webp'), lossless=True, method=6)
            meta['version'] = int(time.time())
            json.dump(meta, open(meta_path, 'w'), indent=1)
            print(f'plate {tod} {orient}: {m["render_s"]}s', flush=True)


def preview(sc, tod, orient, res, samples, path, lamp=None):
    spec = PLATES[orient]
    camera_for(spec['view'], spec['fov'], int(spec['w'] * res), int(spec['h'] * res), OVERSCAN)
    collection_visible('fan_blades', True)
    collection_visible('clock_hands', True)
    apply_rig(tod, lamp)
    LIGHTS['flash'].hide_render = True
    sc.cycles.samples = samples
    sc.compositing_node_group = None
    sc.render.image_settings.file_format = 'JPEG'
    sc.render.image_settings.quality = 90
    sc.render.filepath = path
    t = time.time()
    bpy.ops.render.render(write_still=True)
    print(f'preview {path} {time.time() - t:.1f}s', flush=True)


# ================================================================== bake + GLB (desktop)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('stage', choices=['scene', 'plates', 'preview', 'bake', 'glb', 'backdrop', 'all'])
    ap.add_argument('--work', default=os.environ.get('OFFICE_WORK', os.path.join(REPO, 'tools', 'office', 'work')))
    ap.add_argument('--out', default=os.path.join(REPO, 'public', 'assets', 'office'))
    ap.add_argument('--tod', default=','.join(TODS))
    ap.add_argument('--orient', default='portrait,landscape')
    ap.add_argument('--res', type=float, default=0.25)
    ap.add_argument('--samples', type=int, default=32)
    ap.add_argument('--lamp', default=None)
    ap.add_argument('--quick', action='store_true')
    ap.add_argument('--path', default=None)
    a = ap.parse_args()
    os.makedirs(a.work, exist_ok=True)
    prep_textures(a.work)
    blend = os.path.join(a.work, 'office.blend')
    tods = a.tod.split(',')
    orients = a.orient.split(',')
    if a.stage in ('scene', 'all') or not os.path.exists(blend):
        t = time.time()
        build_scene()
        bpy.ops.wm.save_as_mainfile(filepath=blend, compress=True)
        print(f'scene built in {time.time() - t:.1f}s -> {blend}', flush=True)
        if a.stage == 'scene':
            return
    sc = load_scene(blend)
    if a.stage == 'preview':
        for tod in tods:
            for o in orients:
                preview(sc, tod, o, a.res, a.samples, a.path or os.path.join(a.work, f'preview_{tod}_{o}.jpg'), None if a.lamp is None else a.lamp == '1')
    if a.stage in ('plates', 'all'):
        write_plates(sc, tods, orients, a.work, a.out, a.quick)
    import bake_glb  # tools/office/bake_glb.py
    me = sys.modules[__name__]
    if a.stage in ('bake', 'all'):
        bake_glb.bake_all(sc, tods, a.work, a.out, a.quick, B=me)
    if a.stage in ('backdrop', 'all'):
        sc = load_scene(blend)
        bake_glb.render_backdrops(sc, tods, a.work, a.out, a.quick, B=me)
    if a.stage in ('glb', 'all'):
        bake_glb.export_glb(sc, a.work, a.out, B=me)


if __name__ == '__main__':
    sys.path.insert(0, HERE)
    main()
