"""Desktop office: the Blender room baked per time of day into two texture atlases and exported as a GLB.

Choice: four full bakes (one per time of day), not one bake plus runtime tinting. The four rigs differ in
direction and colour of light (morning sun from the right, the afternoon's slatted stripes on the desk, the
evening's amber streaks, the lamp-and-neon night), which a tint cannot fake. Each bake is COMBINED
(diffuse + glossy from the office camera + emission), converted to display space through the same AgX
look as the 2.5D plates, so both tiers look the same. The lamp and the lightning are baked once on their
own and stored per time of day as display-space deltas (fx atlases), so the game can switch the lamp and
flash lightning on top of any bake.

Atlases: "room" (walls, floor, ceiling, window, furniture) and "desk" (the desk top and everything on it,
at a much higher texel density). 2048 px for the high tier, 1024 px copies for the mid tier.
"""
import json
import math
import os
import subprocess
import time

import bpy
import bmesh
import numpy as np
from mathutils import Vector

ATLAS_SIZE = {'room': 2048, 'desk': 2048}
FX_SIZE = 1024
EXCLUDE = ('wall_outside', 'wall_front', 'photo_frame', 'clock_glass')
# relative texel density per object (by name prefix); everything else 1.0
DENSITY = [('ceiling', 0.35), ('batten', 0.3), ('wall_left', 0.25), ('wall_right', 0.6), ('floor', 0.7), ('rug', 0.7), ('wainscot_side', 0.3),
           ('chair_rail_side', 0.3), ('door', 0.6), ('switch', 0.5), ('socket', 0.5), ('conduit', 0.5), ('basket', 0.6), ('crumple', 0.6),
           ('pedestal', 0.8), ('plinth', 0.5), ('modesty', 0.5), ('cabinet', 0.8), ('chair', 0.8), ('fan_', 0.8), ('blind', 1.3),
           ('wf_', 1.2), ('clock', 1.4), ('binder', 1.0), ('licence', 1.2), ('calendar', 1.6), ('radio', 1.8), ('pendant', 0.5)]
PICKS = ('phone', 'folder', 'lighter', 'cup', 'lamp', 'board')
DESK_BOX = dict(x=(-1.55, 0.55), y=(0.76, 1.6), z=(-3.7, -2.6))  # three.js space: the desk top and what's on it


def three_pos(ob):
    """World bounding-box centre in three.js coordinates."""
    cs = [ob.matrix_world @ Vector(c) for c in ob.bound_box]
    c = sum(cs, Vector()) / 8
    return Vector((c.x, c.z, -c.y))


def atlas_of(ob):
    if ob.get('pick') == 'board':
        return 'room'
    if ob.get('pick'):
        return 'desk'
    if ob.name.startswith(('desk_top', 'desk_leather')):
        return 'desk'
    p = three_pos(ob)
    if DESK_BOX['x'][0] < p.x < DESK_BOX['x'][1] and DESK_BOX['y'][0] < p.y < DESK_BOX['y'][1] and DESK_BOX['z'][0] < p.z < DESK_BOX['z'][1]:
        return 'desk'
    return 'room'


def density(ob):
    for pre, k in DENSITY:
        if ob.name.startswith(pre):
            return k
    return 1.0


def prepare(B):
    """Mesh-ify curves, pick the objects to export, lay out the two atlases. Returns {atlas: [objects]}."""
    sc = bpy.context.scene
    for c in ('city', 'lights'):
        pass
    room = [o for o in B.COLL['room'].all_objects] + list(B.COLL['fan_blades'].all_objects) + list(B.COLL['clock_hands'].all_objects)
    out = []
    dg = bpy.context.evaluated_depsgraph_get()
    for o in room:
        if o.name.startswith(EXCLUDE) or o.hide_render:
            continue
        if o.type == 'CURVE':
            me = bpy.data.meshes.new_from_object(o.evaluated_get(dg))
            mo = bpy.data.objects.new(o.name + '_m', me)
            mo.matrix_world = o.matrix_world
            for k in o.keys():
                mo[k] = o[k]
            mo.pass_index = o.pass_index
            o.users_collection[0].objects.link(mo)
            o.hide_render = True
            o.hide_viewport = True
            out.append(mo)
        elif o.type == 'MESH':
            out.append(o)
    groups = {'room': [], 'desk': []}
    for o in out:
        groups[atlas_of(o)].append(o)
    for name, objs in groups.items():
        lay_out_atlas(objs)
        print(f'atlas {name}: {len(objs)} objects', flush=True)
    return groups


def join_for_bake(groups):
    """Cycles bakes selected objects one by one (a scene sync each): bake one joined copy per atlas instead.
    The copies carry the same atlas UVs, so the bake fits the originals that get exported."""
    joined = {}
    for name, objs in groups.items():
        copies = []
        for o in objs:
            c = o.copy()
            c.data = o.data.copy()
            o.users_collection[0].objects.link(c)
            copies.append(c)
            o.hide_render = True
        bpy.ops.object.select_all(action='DESELECT')
        for c in copies:
            c.select_set(True)
        bpy.context.view_layer.objects.active = copies[0]
        bpy.ops.object.join()
        j = bpy.context.view_layer.objects.active
        j.name = f'bake_{name}'
        j.hide_render = False
        joined[name] = [j]
    return joined


def unjoin(groups, joined):
    for name, objs in groups.items():
        for o in objs:
            o.hide_render = False
        for j in joined[name]:
            bpy.data.objects.remove(j, do_unlink=True)


def lay_out_atlas(objs):
    # one shared UV space: smart-project each object, weight by importance, pack together
    for o in objs:
        me = o.data
        if me.users > 1:
            o.data = me.copy()
        uv = o.data.uv_layers.get('atlas') or o.data.uv_layers.new(name='atlas')
        o.data.uv_layers.active = uv
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.smart_project(angle_limit=math.radians(60), island_margin=0.0, area_weight=0.0, correct_aspect=True, scale_to_bounds=False)
    bpy.ops.uv.average_islands_scale()
    bpy.ops.object.mode_set(mode='OBJECT')
    for o in objs:
        k = density(o)
        if abs(k - 1) < 1e-3:
            continue
        uvl = o.data.uv_layers['atlas'].data
        a = np.empty(len(uvl) * 2, dtype=np.float32)
        uvl.foreach_get('uv', a)
        uvl.foreach_set('uv', a * k)
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.select_all(action='SELECT')
    bpy.ops.uv.select_all(action='SELECT')
    bpy.ops.uv.pack_islands(udim_source='CLOSEST_UDIM', rotate=True, scale=True, margin_method='FRACTION', margin=0.004, shape_method='CONCAVE')
    bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='DESELECT')


def set_bake_target(objs, img):
    for o in objs:
        for slot in o.material_slots:
            m = slot.material
            if not m:
                continue
            nt = m.node_tree
            n = nt.nodes.get('__bake__') or nt.nodes.new('ShaderNodeTexImage')
            n.name = '__bake__'
            n.image = img
            nt.nodes.active = n


def bake(objs, img, kind, samples, view_cam=None):
    sc = bpy.context.scene
    set_bake_target(objs, img)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0]
    sc.cycles.samples = samples
    b = sc.render.bake
    b.margin = 6
    b.margin_type = 'EXTEND'
    b.use_clear = True
    b.target = 'IMAGE_TEXTURES'
    if view_cam is not None:
        sc.camera = view_cam
        b.view_from = 'ACTIVE_CAMERA'
    else:
        b.view_from = 'ABOVE_SURFACE'
    if kind == 'COMBINED':
        b.use_pass_direct = b.use_pass_indirect = True
        b.use_pass_diffuse = b.use_pass_glossy = b.use_pass_transmission = b.use_pass_emit = True
        bpy.ops.object.bake(type='COMBINED', pass_filter={'DIRECT', 'INDIRECT', 'DIFFUSE', 'GLOSSY', 'TRANSMISSION', 'EMIT'}, use_clear=True, margin=6)
    elif kind == 'ALBEDO':
        bpy.ops.object.bake(type='DIFFUSE', pass_filter={'COLOR'}, use_clear=True, margin=6)
    elif kind == 'NORMAL':
        bpy.ops.object.bake(type='NORMAL', normal_space='OBJECT', use_clear=True, margin=6)


def img_array(img):
    w, h = img.size
    a = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(a)
    return a.reshape(h, w, 4)[::-1]


def new_image(name, size, float_buffer=True):
    old = bpy.data.images.get(name)
    if old:
        bpy.data.images.remove(old)
    img = bpy.data.images.new(name, size, size, alpha=False, float_buffer=float_buffer)
    img.colorspace_settings.name = 'Linear Rec.709' if float_buffer else 'sRGB'
    return img


def denoise(img, albedo, normal, work, name):
    """OIDN through the compositor: Image -> Denoise -> File Output (the scene render is 1 sample at 16 px)."""
    sc = bpy.context.scene
    srcs = {'img': img, 'alb': albedo, 'nrm': normal}
    for f in os.listdir(work):
        if f.startswith(f'dn_{name}_'):
            os.remove(os.path.join(work, f))
    tree = bpy.data.node_groups.new('dn_' + name, 'CompositorNodeTree')
    sc.compositing_node_group = tree
    nodes = {}
    for k in ('img', 'alb', 'nrm'):
        n = tree.nodes.new('CompositorNodeImage')
        n.image = srcs[k]
        nodes[k] = n
    dn = tree.nodes.new('CompositorNodeDenoise')
    tree.links.new(nodes['img'].outputs['Image'], dn.inputs['Image'])
    tree.links.new(nodes['alb'].outputs['Image'], dn.inputs['Albedo'])
    tree.links.new(nodes['nrm'].outputs['Image'], dn.inputs['Normal'])
    fo = tree.nodes.new('CompositorNodeOutputFile')
    fo.save_as_render = False
    fo.directory = work + '/'
    fo.file_name = f'dn_{name}_'
    fo.format.media_type = 'IMAGE'
    fo.format.file_format = 'OPEN_EXR'
    fo.format.color_depth = '32'
    fo.file_output_items.new('RGBA', 'out')
    tree.links.new(dn.outputs[0], fo.inputs['out'])
    s0 = sc.cycles.samples
    rx, ry = sc.render.resolution_x, sc.render.resolution_y
    sc.cycles.samples = 1
    sc.render.resolution_x = sc.render.resolution_y = 16
    hidden = {}
    for c in bpy.data.collections:
        hidden[c.name] = c.hide_render
        c.hide_render = True
    sc.render.filepath = os.path.join(work, f'dn_{name}_scene.png')
    bpy.ops.render.render(write_still=False)
    for c in bpy.data.collections:
        c.hide_render = hidden[c.name]
    sc.cycles.samples = s0
    sc.render.resolution_x, sc.render.resolution_y = rx, ry
    sc.compositing_node_group = None
    out = [f for f in os.listdir(work) if f.startswith(f'dn_{name}_') and f.endswith('_out.exr')]
    if not out:
        print(f'denoise {name}: no output, using the raw bake', flush=True)
        return img_array(img)[..., :3]
    im = bpy.data.images.load(os.path.join(work, out[0]), check_existing=False)
    a = img_array(im)[..., :3]
    bpy.data.images.remove(im)
    if a.shape[:2] != (img.size[1], img.size[0]):
        print('denoise: size mismatch, using raw', a.shape, img.size, flush=True)
        return img_array(img)[..., :3]
    return a


def lights_only(B, names, world=0.0):
    """Hide every light but `names`; returns a restore function."""
    saved = {n: o.hide_render for n, o in B.LIGHTS.items()}
    ws = B.WORLD['bg'].inputs['Strength'].default_value
    for n, o in B.LIGHTS.items():
        o.hide_render = n not in names
    B.WORLD['bg'].inputs['Strength'].default_value = world
    city = B.COLL['city'].hide_render

    def restore():
        for n, o in B.LIGHTS.items():
            o.hide_render = saved[n]
        B.WORLD['bg'].inputs['Strength'].default_value = ws
        B.COLL['city'].hide_render = city
    return restore


def emit_off(B, off=True):
    """Silence emissive materials (city windows, neon, bulb) for the lamp-only and flash-only bakes."""
    keep = {}
    for name in ('facade_near', 'tower', 'landmark', 'sign', 'neon_green', 'neon_red', 'bulb', 'tube_light'):
        for n in B.MATS[name].node_tree.nodes:
            if n.type == 'EMISSION':
                keep[(name, n.name)] = n.inputs['Strength'].default_value
                if off:
                    n.inputs['Strength'].default_value = 0.0
    return keep


def bake_all(sc, tods, work, out, quick=False, B=None, **_):
    t_all = time.time()
    bdir = os.path.join(work, 'bake')
    os.makedirs(bdir, exist_ok=True)
    os.makedirs(out, exist_ok=True)
    originals = prepare(B)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(work, 'office_baked.blend'), compress=True)
    groups = join_for_bake(originals)
    B.collection_visible('fan_blades', True)
    B.collection_visible('clock_hands', True)
    # the glass is transparent for the bakes (light comes through), as in the plates
    cam, _ = B.camera_for('office', 50.0, 1920, 1080, 1.0)
    samples = 12 if quick else 16
    sizes = {k: (v // 4 if quick else v) for k, v in ATLAS_SIZE.items()}
    sc.cycles.use_denoising = False
    sc.cycles.use_adaptive_sampling = False
    times = {}
    aux = {}
    # albedo and normals for the denoiser (once)
    for name, objs in groups.items():
        alb = new_image(f'alb_{name}', sizes[name])
        bake(objs, alb, 'ALBEDO', 4)
        nrm = new_image(f'nrm_{name}', sizes[name])
        bake(objs, nrm, 'NORMAL', 1)
        aux[name] = (alb, nrm)
    # lamp alone and lightning alone (linear, tod-independent)
    LIGHTS = B.LIGHTS
    extra = {}
    for what, names in (('lamp', ('lamp_light',)), ('flash', ('flash',))):
        restore = lights_only(B, names)
        keep = emit_off(B)
        if what == 'lamp':
            for n in B.MATS['bulb'].node_tree.nodes:
                if n.type == 'EMISSION':
                    n.inputs['Strength'].default_value = 18.0
            LIGHTS['lamp_light'].data.energy = 40.0
        else:
            LIGHTS['flash'].data.energy = 2.5e5
        B.COLL['city'].hide_render = True
        for name, objs in groups.items():
            img = new_image(f'{what}_{name}', sizes[name])
            t = time.time()
            bake(objs, img, 'COMBINED', max(8, samples // 2), cam)
            extra[(what, name)] = denoise(img, *aux[name], bdir, f'{what}_{name}')
            times[f'{what}_{name}'] = round(time.time() - t, 1)
            print(f'bake {what} {name}: {times[f"{what}_{name}"]}s', flush=True)
        for (mn, nn), v in keep.items():
            for n in B.MATS[mn].node_tree.nodes:
                if n.name == nn:
                    n.inputs['Strength'].default_value = v
        restore()
    from PIL import Image
    manifest_path = os.path.join(out, 'glb.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    manifest.setdefault('bakes', {})
    for tod in tods:
        lamp_on = B.apply_rig(tod)
        LIGHTS['flash'].hide_render = True
        for name, objs in groups.items():
            img = new_image(f'bake_{tod}_{name}', sizes[name])
            t = time.time()
            bake(objs, img, 'COMBINED', samples, cam)
            lin = denoise(img, *aux[name], bdir, f'{tod}_{name}')
            times[f'{tod}_{name}'] = round(time.time() - t, 1)
            print(f'bake {tod} {name}: {times[f"{tod}_{name}"]}s', flush=True)
            disp = B.save_display(lin, os.path.join(bdir, f'{tod}_{name}_disp.png'), sc)
            lamp = extra[('lamp', name)]
            other = np.maximum(lin - lamp, 0) if lamp_on else lin + lamp
            disp_other = B.save_display(other, os.path.join(bdir, f'{tod}_{name}_lamp.png'), sc)
            disp_flash = B.save_display(lin + extra[('flash', name)] * 0.6, os.path.join(bdir, f'{tod}_{name}_flash.png'), sc)
            lum = lambda a: a[..., 0] * 0.3 + a[..., 1] * 0.55 + a[..., 2] * 0.15
            sign = -1.0 if lamp_on else 1.0
            fx = np.stack([np.clip((lum(disp_other) - lum(disp)) * sign, 0, 1), np.zeros(disp.shape[:2]), np.clip(lum(disp_flash) - lum(disp), 0, 1)], -1)
            to8 = lambda a: (np.clip(a, 0, 1) * 255 + 0.5).astype(np.uint8)
            im = Image.fromarray(to8(disp))
            im.save(os.path.join(out, f'bake_{name}_{tod}.webp'), quality=82, method=6)
            im.resize((im.width // 2, im.height // 2), Image.LANCZOS).save(os.path.join(out, f'bake_{name}_{tod}_1k.webp'), quality=80, method=6)
            Image.fromarray(to8(fx)).resize((FX_SIZE if not quick else FX_SIZE // 4,) * 2, Image.BILINEAR).save(os.path.join(out, f'bakefx_{name}_{tod}.webp'), quality=75, method=6)
            bpy.data.images.remove(img)
            del lin, disp, other, disp_other, disp_flash, fx
        manifest['bakes'][tod] = dict(lamp_default=bool(lamp_on))
        manifest['bake_seconds'] = times
        manifest['version'] = int(time.time())
        json.dump(manifest, open(manifest_path, 'w'), indent=1)
    print(f'bakes done in {time.time() - t_all:.0f}s', flush=True)


def render_backdrops(sc, tods, work, out, quick=False, B=None, **_):
    """The view out of the window without the room, per time of day: the GLB's window glass samples it."""
    from PIL import Image
    pos, look = (-1.0, 1.65, -2.4), (-1.0, 1.65, -4.0)
    W, H = (512, 320) if quick else (1280, 800)
    cam_d = bpy.data.cameras.new('cam_backdrop')
    cam_d.sensor_fit = 'VERTICAL'
    cam_d.angle = math.radians(84)
    cam_d.clip_start = 0.5
    cam_d.clip_end = 10000
    cam = bpy.data.objects.new('cam_backdrop', cam_d)
    sc.collection.objects.link(cam)
    cam.location = B.T(*pos)
    cam.rotation_euler = (B.T(*look) - B.T(*pos)).to_track_quat('-Z', 'Y').to_euler()
    sc.camera = cam
    sc.render.resolution_x, sc.render.resolution_y = W, H
    hidden = {}
    for name in ('room', 'glass', 'fan_blades', 'clock_hands', 'outside_wall'):
        c = B.COLL.get(name)
        if c:
            hidden[name] = c.hide_render
            c.hide_render = True
    sc.compositing_node_group = None
    sc.cycles.use_denoising = True
    sc.cycles.use_adaptive_sampling = True
    sc.cycles.samples = 24 if quick else 64
    manifest_path = os.path.join(out, 'glb.json')
    manifest = json.load(open(manifest_path)) if os.path.exists(manifest_path) else {}
    for tod in tods:
        B.apply_rig(tod)
        B.LIGHTS['flash'].hide_render = True
        sc.render.image_settings.file_format = 'PNG'
        sc.render.image_settings.color_depth = '8'
        p = os.path.join(work, f'backdrop_{tod}.png')
        sc.render.filepath = p
        t = time.time()
        bpy.ops.render.render(write_still=True)
        Image.open(p).convert('RGB').save(os.path.join(out, f'backdrop_{tod}.webp'), quality=80, method=6)
        print(f'backdrop {tod}: {time.time() - t:.0f}s', flush=True)
    for name, v in hidden.items():
        B.COLL[name].hide_render = v
    manifest['backdrop'] = dict(pos=pos, look=look, fov=84, aspect=W / H)
    json.dump(manifest, open(manifest_path, 'w'), indent=1)


def export_glb(sc, work, out, B=None, **_):
    """Join by atlas and by pick, keep only the atlas UVs, export, then meshopt-compress with gltfpack."""
    path = os.path.join(work, 'office_baked.blend')
    B.load_scene(path)
    sc = bpy.context.scene
    room = [o for c in ('room', 'fan_blades', 'clock_hands', 'glass') for o in B.COLL[c].all_objects if o.type == 'MESH' and not o.hide_render and not o.name.startswith(EXCLUDE)]
    keep = []
    mats = {}

    dummy = bpy.data.images.new('atlas_dummy', 2, 2)

    def flat(name):
        # a texture on the atlas UVs, or the exporter leaves the UVs out; the game swaps in its own textures
        if name not in mats:
            m = bpy.data.materials.new('atlas_' + name)
            nt = m.node_tree
            bsdf = next(n for n in nt.nodes if n.type == 'BSDF_PRINCIPLED')
            tex = nt.nodes.new('ShaderNodeTexImage')
            tex.image = dummy
            uvn = nt.nodes.new('ShaderNodeUVMap')
            uvn.uv_map = 'UVMap' if name == 'glass' else 'atlas'
            nt.links.new(uvn.outputs[0], tex.inputs['Vector'])
            nt.links.new(tex.outputs['Color'], bsdf.inputs['Base Color'])
            mats[name] = m
        return mats[name]

    groups = {}
    for o in room:
        if o.data.uv_layers.get('atlas') is None and o.name != 'glass':
            continue
        if o.name == 'glass':
            key = 'glass'
        elif o.users_collection[0].name == 'fan_blades':
            key = 'fan'
        elif o.name in ('clock_hour', 'clock_minute'):
            key = o.name
        elif o.get('pick'):
            key = 'pick_' + o['pick']
        else:
            key = 'static_' + atlas_of(o)
        groups.setdefault(key, []).append(o)
    for o in bpy.data.objects:
        o.select_set(False)
    result = []
    for key, objs in groups.items():
        for o in objs:
            if o.data.users > 1:
                o.data = o.data.copy()
            me = o.data
            for uv in list(me.uv_layers):
                if uv.name != 'atlas' and key != 'glass':
                    me.uv_layers.remove(uv)
            atlas = 'glass' if key == 'glass' else atlas_of(o)
            me.materials.clear()
            me.materials.append(flat(atlas))
            for a in list(me.attributes):
                if a.name == 'wear':
                    me.attributes.remove(a)
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs:
            o.select_set(True)
        bpy.context.view_layer.objects.active = objs[0]
        if len(objs) > 1:
            bpy.ops.object.join()
        j = bpy.context.view_layer.objects.active
        j.name = key
        # pivots: the fan turns about its rod, the clock hands about the clock's centre
        if key == 'fan' or key.startswith('clock_'):
            piv = B.T(-0.2, 2.53, -2.6) if key == 'fan' else B.T(0.42, 2.48, -4 + 0.0385)
            bpy.ops.object.select_all(action='DESELECT')
            j.select_set(True)
            sc.cursor.location = piv
            bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
        result.append(j)
    bpy.ops.object.select_all(action='DESELECT')
    for o in result:
        o.select_set(True)
    raw = os.path.join(work, 'office_raw.glb')
    bpy.ops.export_scene.gltf(filepath=raw, export_format='GLB', use_selection=True, export_materials='EXPORT', export_image_format='JPEG',
                              export_texcoords=True, export_normals=False, export_attributes=False, export_yup=True, export_apply=True,
                              export_extras=False, export_cameras=False, export_lights=False)
    final = os.path.join(out, 'office.glb')
    gp = os.environ.get('GLTFPACK', 'gltfpack')
    cmd = [gp, '-i', raw, '-o', final, '-cc', '-kn', '-km', '-noq'] if False else [gp, '-i', raw, '-o', final, '-cc', '-kn', '-km', '-vtf']
    print(' '.join(cmd), flush=True)
    subprocess.run(cmd, check=True)
    print(f'glb: raw {os.path.getsize(raw) / 1e6:.2f} MB -> {os.path.getsize(final) / 1e6:.2f} MB', flush=True)
