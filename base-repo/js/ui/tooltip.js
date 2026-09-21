// Tooltip management
import { state, ALL_BUILDINGS, getColor } from '../state.js';
import { $ } from '../utils.js';
import { REGION_COLORS } from '../data.js';
import { hitTest, getCanvasRect, buildingRects } from './canvas.js';

export function initCanvasInteraction() {
  const canvas = $('#skyline');
  const tooltip = $('#tooltip');

  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    if (hit) {
      canvas.style.cursor = 'pointer';
      state.hovered = hit.building;
      showTooltip(e.clientX, e.clientY, hit.building);
    } else {
      canvas.style.cursor = 'default';
      state.hovered = null;
      hideTooltip();
    }
  });

  canvas.addEventListener('mouseleave', () => {
    state.hovered = null;
    hideTooltip();
  });

  canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const hit = hitTest(mx, my);
    if (hit) {
      import('./detail.js').then(m => m.selectBuilding(hit.building));
    }
  });

  function showTooltip(cx, cy, building) {
    const ratio = (building.height / ALL_BUILDINGS[0].height * 100).toFixed(1);
    if (state.settings.tooltipStyle === 'simple') {
      tooltip.innerHTML = `
        <div class="tt-name">${building.name}</div>
        <div class="tt-height">${building.height}m</div>
        <div class="tt-meta">${building.city}, ${building.country} · ${building.opened}</div>
      `;
    } else {
      tooltip.innerHTML = `
        <div class="tt-name">${building.name}</div>
        <div class="tt-height">${building.height}m · Rank #${building.rank}</div>
        <div class="tt-meta">${building.city}, ${building.country}</div>
        <div class="tt-meta">${building.floors} floors · Opened ${building.opened}</div>
        <div class="tt-meta" style="margin-top:4px;color:${REGION_COLORS[building.region] || '#888'}">
          ${building.region} · ${ratio}% of tallest
        </div>
      `;
    }
  }

  function hideTooltip() {
    tooltip.classList.add('hidden');
  }
}
