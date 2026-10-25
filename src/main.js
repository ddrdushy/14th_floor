import '@fontsource/big-shoulders-display/600';
import '@fontsource/big-shoulders-display/700';
import '@fontsource/big-shoulders-display/800';
import '@fontsource/special-elite/400';
import '@fontsource/archivo/400';
import '@fontsource/archivo/600';
import '@fontsource/archivo/700';
import './styles/main.css';
import './styles/games.css';
import './styles/games-c.css';
import './styles/games-b.css';
import './styles/front.css';
import './styles/cases.css';
import './styles/howto.css';
import './styles/evidence.css';
import './styles/leaderboard.css';
import './styles/office.css';
import './styles/map.css';
import './styles/mobile.css';

import { register, go } from './core/router.js';
import { OfficeScene } from './three/OfficeScene.js';
import { app } from './core/app.js';
import { unlock, thunder } from './core/audio.js';
import { state } from './core/state.js';
import { openSettings } from './core/settings.js';
import { initNav } from './core/nav.js';
import { initTelemetry } from './core/telemetry.js';
import { initCloud } from './core/cloud.js';

register('title', () => import('./screens/title.js'));
register('profile', () => import('./screens/profile.js'));
register('intro', () => import('./screens/intro.js'));
register('office', () => import('./screens/office.js'));
register('map', () => import('./screens/map.js'));
register('puzzle', () => import('./screens/puzzle.js'));
register('board', () => import('./screens/board.js'));
register('deduce', () => import('./screens/deduce.js'));
register('outcome', () => import('./screens/outcome.js'));
register('closed', () => import('./screens/closed.js'));
register('archive', () => import('./screens/archive.js'));
register('opening', () => import('./screens/opening.js'));
register('lab', () => import('./screens/lab.js'));
register('leaderboard', () => import('./screens/leaderboard.js'));

app.scene = new OfficeScene(document.getElementById('bg3d'));
app.scene.onLightning = () => thunder(0.8 + Math.random() * 1.5);

// browsers only allow sound after a gesture: unlock effects and music on the first one
// On touch screens Chrome only grants user activation on the release (pointerup / touchend / click),
// not on pointerdown, so listen for all of them; unlocking is idempotent.
const firstGesture = () => { unlock(); app.music.unlock(); };
for (const ev of ['pointerup', 'touchend', 'click', 'keydown']) window.addEventListener(ev, firstGesture, { once: true, capture: true });
window.addEventListener('pointerdown', (e) => { if (e.pointerType === 'mouse') firstGesture(); }, { capture: true });

// global settings button (music, sound effects); hidden on the title screen, which has its own menu
const gear = document.createElement('button');
gear.className = 'gear-btn';
gear.type = 'button';
gear.setAttribute('aria-label', 'Settings');
gear.title = 'Settings';
gear.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10.3 2.6h3.4l.5 2.6c.6.2 1.2.5 1.7.9l2.5-.9 1.7 2.9-2 1.7c.1.6.1 1.3 0 1.9l2 1.7-1.7 2.9-2.5-.9c-.5.4-1.1.7-1.7.9l-.5 2.6h-3.4l-.5-2.6c-.6-.2-1.2-.5-1.7-.9l-2.5.9-1.7-2.9 2-1.7a6 6 0 0 1 0-1.9l-2-1.7 1.7-2.9 2.5.9c.5-.4 1.1-.7 1.7-.9z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="12" cy="12" r="2.8" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
gear.addEventListener('click', () => openSettings());
document.getElementById('app').append(gear);

// phone tab bar and Back gesture (drawn on small touch screens only, see styles/mobile.css)
initNav();

// anonymous progress for the leaderboard (quiet no-op without the backend; see core/telemetry.js)
initTelemetry();
initCloud();

// deep links for testing: ?screen=map&case=case01&level=l03
const q = new URLSearchParams(location.search);
const screen = q.get('screen');
if (screen && state().profile) go(screen, { caseId: q.get('case') || undefined, levelId: q.get('level'), game: q.get('game') });
else go('title');
