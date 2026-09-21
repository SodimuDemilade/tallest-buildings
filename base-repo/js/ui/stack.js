// Height stack overlay
import { state, saveState } from '../state.js';
import { $ } from '../utils.js';

export function updateHeightStack() {
  const heightStack = $('#height-stack');
  if (!state.showHeightStack) { heightStack.classList.add('hidden'); return; }
  heightStack.classList.remove('hidden');
  if (state.filtered.length < 2) {
    heightStack.innerHTML = '<div class="hs-title">Height Stack</div><div class="hs-detail">Not enough buildings</div>';
    return;
  }
  const tallest = state.filtered[0];
  const second = state.filtered[1];
  const others = state.filtered.slice(1);
  const avg = others.reduce((s, b) => s + b.height, 0) / others.length;
  heightStack.innerHTML = `
    <div class="hs-title">Height Stack Overlay</div>
    <div class="hs-value">${tallest.height}m</div>
    <div class="hs-detail">
      <strong>${tallest.name}</strong> dominates at ${tallest.height}m.<br>
      ${second.name} (${second.height}m) fits <strong>${(tallest.height / second.height).toFixed(2)}×</strong> inside it.<br>
      Average of displayed: <strong>${Math.round(avg)}m</strong>.<br>
      <strong>${Math.floor(tallest.height / avg)}</strong> average buildings would stack to match the tallest.
    </div>
  `;
}

export function toggleHeightStack() {
  state.showHeightStack = !state.showHeightStack;
  updateHeightStack();
  saveState();
  $('#status-text').textContent = state.showHeightStack ? 'Height stack: ON' : 'Height stack: OFF';
}
