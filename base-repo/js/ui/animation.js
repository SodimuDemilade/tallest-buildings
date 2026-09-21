// Animation loop
import { state } from '../state.js';
import { renderCanvas } from './canvas.js';

let lastTime = 0;
let fps = 0;
let frameCount = 0;
let fpsTimer = 0;

function getAnimSpeed() {
  return { fast: 3, normal: 1, slow: 0.5, none: 100 }[state.settings.animSpeed] || 1;
}

export function startAnimation() {
  lastTime = performance.now();
  requestAnimationFrame(animate);
}

function animate(time) {
  const dt = Math.min((time - lastTime) / 1000, 0.1);
  lastTime = time;
  frameCount++;
  fpsTimer += dt;
  if (fpsTimer >= 1) {
    fps = Math.round(frameCount / fpsTimer);
    const el = document.getElementById('status-fps');
    if (el) el.textContent = fps + ' fps';
    frameCount = 0;
    fpsTimer = 0;
  }
  if (state.animProgress < 1) {
    state.animProgress = Math.min(1, state.animProgress + dt * getAnimSpeed() * 1.2);
  }
  renderCanvas();
  requestAnimationFrame(animate);
}
