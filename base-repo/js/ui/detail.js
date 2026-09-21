// Detail panel (slide-in)
import { state, ALL_BUILDINGS, getColor } from '../state.js';
import { $ } from '../utils.js';
import { drawBuildingSilhouette } from './canvas.js';
import { updateList } from './list.js';
import { saveState } from '../state.js';
import { REGION_COLORS } from '../data.js';

export function selectBuilding(building) {
  state.selected = building;
  showDetailPanel(building);
  updateList();
  saveState();
  $('#status-text').textContent = `Selected: ${building.name}`;
}

function showDetailPanel(b) {
  const detailPanel = $('#detail-panel');
  const detailContent = $('#detail-content');
  const ratio = (b.height / ALL_BUILDINGS[0].height * 100).toFixed(1);
  const yearsAgo = new Date().getFullYear() - b.opened;
  const color = REGION_COLORS[b.region] || '#888';
  const silW = 140, silH = 220;
  const maxH = ALL_BUILDINGS[0].height;
  const bH = (b.height / maxH) * (silH - 20);
  const bW = Math.max(24, silW * 0.5 * (b.height / maxH));
  const buildingsOver500 = ALL_BUILDINGS.filter(x => x.height > 500).length;

  detailContent.innerHTML = `
    <div class="detail-rank">Rank #${b.rank}</div>
    <div class="detail-name">${b.name}</div>
    <div class="detail-location">${b.city}, ${b.country}</div>
    <div class="detail-stats">
      <div class="stat-box"><div class="stat-label">Height</div><div class="stat-value amber">${b.height}m</div></div>
      <div class="stat-box"><div class="stat-label">Floors</div><div class="stat-value">${b.floors}</div></div>
      <div class="stat-box"><div class="stat-label">Opened</div><div class="stat-value">${b.opened}</div></div>
      <div class="stat-box"><div class="stat-label">vs Tallest</div><div class="stat-value">${ratio}%</div></div>
    </div>
    <div class="detail-divider"></div>
    <div class="detail-silhouette-wrap">
      <canvas id="detail-canvas" width="${silW}" height="${silH}"></canvas>
    </div>
    <div class="detail-fun">
      <p><strong>Region:</strong> <span style="color:${color}">${b.region}</span></p>
      <p><strong>Type:</strong> ${b.type || 'Supertall'}</p>
      ${b.spire > 0 ? `<p><strong>Spire height:</strong> ${b.spire}m</p>` : ''}
      <p style="margin-top:10px">
        At <strong>${b.height}m</strong>, this building equals approximately
        <strong>${Math.round(b.height * 3.281).toLocaleString()} feet</strong>.
        ${b.height > 500 ? `One of only <strong>${buildingsOver500} buildings</strong> exceeding 500m.` : ''}
      </p>
      <p style="margin-top:6px">
        ${b.opened >= 2020 ? '🏗️ A recent addition to the world\'s skyline.' :
          b.opened < 2000 ? '📜 One of the veteran supertalls, built before the 21st century boom.' :
          b.opened < 2015 ? '🏢 Built during the early-2010s global supertall wave.' :
          '✨ Part of the modern generation of megatall structures.'}
      </p>
      <p style="margin-top:6px">Opened <strong>${yearsAgo} year${yearsAgo !== 1 ? 's' : ''} ago</strong>. Currently ranked #${b.rank} tallest in the world.</p>
    </div>
  `;

  requestAnimationFrame(() => {
    const dc = document.getElementById('detail-canvas');
    if (dc) {
      const dctx = dc.getContext('2d');
      dctx.clearRect(0, 0, silW, silH);
      const bg = dctx.createLinearGradient(0, 0, 0, silH);
      bg.addColorStop(0, '#6b8fad');
      bg.addColorStop(1, '#d8d0c2');
      dctx.fillStyle = bg;
      dctx.fillRect(0, 0, silW, silH);
      drawBuildingSilhouette(dctx, (silW - bW) / 2, silH - bH, bW, bH, getColor(b), 1, false);
    }
  });

  detailPanel.classList.remove('hidden');
  requestAnimationFrame(() => detailPanel.classList.add('visible'));
}

export function closeDetailPanel() {
  const detailPanel = $('#detail-panel');
  detailPanel.classList.remove('visible');
  setTimeout(() => detailPanel.classList.add('hidden'), 300);
  state.selected = null;
  updateList();
  saveState();
}

export function initDetailPanel() {
  $('#detail-close').addEventListener('click', closeDetailPanel);
}
