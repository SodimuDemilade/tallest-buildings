// Building list rendering
import { state, ALL_BUILDINGS, getColor } from '../state.js';
import { $ } from '../utils.js';
import { drawBuildingSilhouette } from './canvas.js';
import { selectBuilding } from './detail.js';

export function updateList() {
  const data = state.filtered;
  const listEl = $('#building-list');
  const listCount = $('#list-count');
  listCount.textContent = `${data.length} building${data.length !== 1 ? 's' : ''}`;
  listEl.innerHTML = '';

  data.forEach((b, i) => {
    const card = document.createElement('div');
    card.className = 'building-card' + (state.selected && state.selected.rank === b.rank ? ' selected' : '');
    card.style.animationDelay = `${Math.min(i * 25, 300)}ms`;
    const miniW = 28, miniH = 50;
    const scale = (miniH - 4) / ALL_BUILDINGS[0].height;
    const bH = b.height * scale;
    const bW = Math.max(8, 28 * (b.height / ALL_BUILDINGS[0].height));
    card.innerHTML = `
      <span class="rank">#${b.rank}</span>
      <div class="mini-silhouette"><canvas width="${miniW}" height="${miniH}"></canvas></div>
      <div class="card-info">
        <div class="card-name">${b.name}</div>
        <div class="card-location">${b.city}, ${b.country}</div>
      </div>
      <span class="card-height">${b.height}m</span>
      <span class="card-year">${b.opened}</span>
    `;
    const mc = card.querySelector('canvas').getContext('2d');
    drawBuildingSilhouette(mc, (miniW - bW) / 2, miniH - bH, bW, bH, getColor(b), 1, true);
    card.addEventListener('click', () => selectBuilding(b));
    listEl.appendChild(card);
  });
}
