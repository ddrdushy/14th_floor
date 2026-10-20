// Shared runtime handles so screens can steer the background and the score.
//   app.scene  the 3D office (three.js)
//   app.music  music manager: app.music.play('office'), app.music.stop(); see core/music.js
import { music } from './music.js';

export const app = {
  scene: null,
  music,
};
