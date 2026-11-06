// The office's layout in metres (three.js space: Y up, the back wall at z = -4). Shared by the classic
// procedural office, the 2.5D plates, the baked GLB room and tools/office/build_office.py (keep in step).
export const WIN = { x: -1.0, y: 1.68, w: 2.2, h: 1.7 };
export const BOARD = { x: 1.75, y: 1.74, w: 2.1, h: 1.4 };
export const DESK = { x: -0.5, z: -3.15, top: 0.8, w: 2.0, d: 0.95 };
export const BACK = -4;
export const WALL_T = 0.22;
export const GLASS_Z = BACK - WALL_T + 0.065;

export const VIEWS = {
  title: { pos: [WIN.x, 1.6, -1.45], look: [WIN.x, 1.7, BACK] },
  office: { pos: [0.4, 1.72, -0.4], look: [0.3, 1.26, BACK] },
  officeTall: { pos: [-0.45, 1.76, -0.1], look: [-0.4, 0.95, BACK] },
  board: { pos: [BOARD.x, 1.62, -1.7], look: [BOARD.x, 1.6, BACK] },
  dim: { pos: [0.6, 1.72, 0.2], look: [-0.2, 1.4, BACK] },
};

export const PICK_ORDER = ['phone', 'board', 'folder', 'lighter', 'cup', 'lamp'];
export const PICK_LABELS = { board: 'Case board', phone: 'Phone', lighter: "Daniel's lighter", cup: 'Kopi', folder: 'Case file', lamp: 'Desk lamp' };

const { x: DX, z: DZ, top: TOP } = DESK;
/** Where each label floats, and a box (centre, size, yaw) the pointer can hit in 2.5D. */
export const PICKS = {
  phone: { anchor: [DX + 0.72, TOP + 0.2, DZ + 0.08], box: { c: [DX + 0.72, TOP + 0.08, DZ + 0.06], s: [0.12, 0.18, 0.12], yaw: -0.18 } },
  board: { anchor: [BOARD.x, BOARD.y + BOARD.h / 2 + 0.06, BACK + 0.1], box: { c: [BOARD.x, BOARD.y, BACK + 0.05], s: [BOARD.w + 0.12, BOARD.h + 0.12, 0.08], yaw: 0 } },
  folder: { anchor: [DX - 0.1, TOP + 0.06, DZ + 0.12], box: { c: [DX - 0.1, TOP + 0.01, DZ + 0.12], s: [0.48, 0.05, 0.35], yaw: 0.12 } },
  lighter: { anchor: [DX - 0.42, TOP + 0.11, DZ + 0.33], box: { c: [DX - 0.42, TOP + 0.04, DZ + 0.33], s: [0.07, 0.09, 0.05], yaw: 0.55 } },
  cup: { anchor: [DX + 0.36, TOP + 0.15, DZ + 0.24], box: { c: [DX + 0.36, TOP + 0.05, DZ + 0.24], s: [0.19, 0.11, 0.19], yaw: 0 } },
  lamp: { anchor: [DX - 0.72 + 0.015, TOP + 0.43, DZ - 0.12 + 0.06], box: { c: [DX - 0.72 + 0.015, TOP + 0.2, DZ - 0.12 + 0.06], s: [0.42, 0.42, 0.2], yaw: 0.25 } },
};

/** The phone's screen (the handset leans back on its stand): group transform, as in the procedural scene. */
export const PHONE = { pos: [DX + 0.72, TOP, DZ + 0.08], yaw: -0.18, tilt: -0.32, tiltPos: [0, 0.02, 0.022], screen: [0, 0.0825, 0.0058], size: [0.072, 0.152] };
export const FOLDER = { pos: [DX - 0.1, TOP + 0.0195, DZ + 0.12], yaw: 0.12, size: [0.46, 0.33] };
export const LICENCE = { pos: [-2.52, 1.97, BACK + 0.028], size: [0.4, 0.3] };
export const CLOCK = { pos: [0.42, 2.48, BACK + 0.04] };
export const FAN = { pos: [-0.2, 2.53, -2.6] };
export const CUP = { pos: [DX + 0.36, TOP + 0.09, DZ + 0.24] };
export const LAMP_BULB = [DX - 0.72 + 0.017, TOP + 0.305, DZ - 0.12 + 0.068];

/** Vertical field of view the game uses for a screen aspect (wide screens 50, tall phones 68). */
export function fovFor(aspect) {
  if (aspect < 0.8) return 68;
  if (aspect < 1.6) return Math.min(68, (2 * Math.atan(Math.tan((25 * Math.PI) / 180) * (1.6 / aspect)) * 180) / Math.PI);
  return 50;
}

export const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
