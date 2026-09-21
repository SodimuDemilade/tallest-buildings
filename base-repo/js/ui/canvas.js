// Canvas rendering — silhouette drawing and main render loop
import { state, ALL_BUILDINGS, getColor } from '../state.js';
import { $ } from '../utils.js';

let canvasRect = null;
export let buildingRects = [];
const canvas = null;
let ctx = null;

export function getCanvasContext() {
  return ctx;
}

export function getCanvasRect() {
  return canvasRect;
}

export function resizeCanvas() {
  const cvs = $('#skyline');
  const wrapper = $('#canvas-wrapper');
  const rect = wrapper.getBoundingClientRect();
  cvs.width = rect.width;
  cvs.height = rect.height;
  canvasRect = { width: rect.width, height: rect.height };
  ctx = cvs.getContext('2d');
}

export function drawBuildingSilhouette(c, x, y, w, h, color, alpha, isMini) {
  c.save();
  c.globalAlpha = alpha;

  if (!isMini && h > 10) {
    c.shadowColor = 'rgba(0,0,0,0.25)';
    c.shadowBlur = 6;
    c.shadowOffsetX = 2;
    c.shadowOffsetY = 3;
  }

  c.fillStyle = color;
  c.fillRect(x, y, w, h);

  c.shadowColor = 'transparent';
  c.shadowBlur = 0;
  c.shadowOffsetX = 0;
  c.shadowOffsetY = 0;

  // Crown
  if (!isMini && h > 30) {
    const cw = w * 0.25;
    const ch = Math.min(10, h * 0.04);
    c.fillStyle = color;
    c.fillRect(x + (w - cw) / 2, y - ch, cw, ch);
    const tw = cw * 0.3;
    c.fillRect(x + (w - tw) / 2, y - ch - 3, tw, 3);
  }

  // Windows
  if (!isMini && w > 12 && h > 25) {
    c.globalAlpha = alpha * 0.18;
    c.fillStyle = '#ffffff';
    const rows = Math.min(Math.floor(h / 4), 70);
    const cols = Math.max(2, Math.floor(w / 4));
    const winW = Math.max(1, w * 0.05);
    const winH = Math.max(1, h / rows * 0.3);
    const gapX = (w - cols * winW) / (cols + 1);
    const gapY = h / rows;
    for (let r = 0; r < rows; r++) {
      for (let cl = 0; cl < cols; cl++) {
        c.fillRect(x + gapX + cl * (winW + gapX), y + gapY * r + gapY * 0.35, winW, winH);
      }
    }
  }

  c.restore();
}

export function renderCanvas() {
  if (!canvasRect || !ctx) return;
  const W = canvasRect.width;
  const H = canvasRect.height;
  const data = state.filtered;

  ctx.clearRect(0, 0, W, H);

  // Sky gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, H);
  skyGrad.addColorStop(0, '#6b8fad');
  skyGrad.addColorStop(0.3, '#92a8b8');
  skyGrad.addColorStop(0.6, '#b8b0a0');
  skyGrad.addColorStop(1, '#d8d0c2');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, W, H);

  // Clouds
  ctx.save();
  ctx.globalAlpha = 0.2;
  ctx.fillStyle = '#e8e4dc';
  [[0.12, 0.1, 70, 10], [0.16, 0.08, 50, 8], [0.55, 0.15, 90, 12], [0.78, 0.06, 60, 9], [0.9, 0.2, 45, 7]].forEach(([px, py, rx, ry]) => {
    ctx.beginPath();
    ctx.ellipse(W * px, H * py, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  if (data.length === 0) {
    ctx.fillStyle = '#4a4640';
    ctx.font = '18px "DM Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('No buildings match current filters', W / 2, H / 2);
    ctx.textAlign = 'left';
    buildingRects = [];
    return;
  }

  const tallest = Math.max(...data.map(b => b.height));
  const groundLevel = H - 20;
  const maxPx = groundLevel - 20;
  const scale = maxPx / tallest;

  // Grid lines
  if (state.settings.grid === 'on') {
    for (let m = 0; m <= 900; m += 100) {
      const y = groundLevel - m * scale;
      if (y < 0) continue;
      ctx.strokeStyle = 'rgba(255,255,255,0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '10px "IBM Plex Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(m + 'm', 6, y - 4);
    }
  }

  const padding = 40;
  const usableW = W - padding * 2;
  const spacing = Math.max(12, usableW / data.length);
  const totalW = data.length * spacing;
  const startX = (W - totalW) / 2;

  buildingRects = [];

  // Draw shortest first, tallest last
  const drawOrder = [...data].reverse();

  drawOrder.forEach((b) => {
    const bH = b.height * scale * Math.min(1, state.animProgress);
    const bW = Math.max(16, Math.min(50, spacing * 0.6));
    const idx = data.indexOf(b);
    const x = startX + idx * spacing + (spacing - bW) / 2;
    const y = groundLevel - bH;
    const color = getColor(b);
    const isHovered = state.hovered && state.hovered.rank === b.rank;
    const isSelected = state.selected && state.selected.rank === b.rank;
    const isDimmed = (state.hovered && !isHovered && !isSelected) || (state.selected && !isSelected && !isHovered);
    const alpha = isDimmed ? 0.3 : 1;

    drawBuildingSilhouette(ctx, x, y, bW, bH, color, alpha, false);

    if (isSelected) {
      ctx.save();
      ctx.strokeStyle = '#d4880f';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.strokeRect(x - 3, y - 6, bW + 6, bH + 8);
      ctx.setLineDash([]);
      ctx.restore();
    }
    if (isHovered && !isSelected) {
      ctx.save();
      ctx.strokeStyle = 'rgba(255,220,120,0.7)';
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 2, y - 2, bW + 4, bH + 4);
      ctx.restore();
    }

    // Height labels
    if (state.settings.labels === 'on' && bW > 14 && bH > 30 && !isDimmed) {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "IBM Plex Mono", monospace';
      ctx.textAlign = 'center';
      ctx.globalAlpha = 0.9;
      ctx.fillText(b.height + 'm', x + bW / 2, y - 7);
      ctx.restore();
    }

    buildingRects.push({ x, y, w: bW, h: bH, building: b });
  });

  // Ground
  ctx.fillStyle = '#8a8070';
  ctx.fillRect(0, groundLevel, W, 2);
  ctx.fillStyle = '#c8c0b2';
  ctx.fillRect(0, groundLevel + 2, W, H - groundLevel - 2);

  // Scale info
  ctx.fillStyle = '#6a6458';
  ctx.font = '10px "IBM Plex Mono", monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`${data.length} buildings · tallest ${tallest}m`, W - 14, H - 6);
  ctx.textAlign = 'left';

  if (state.showHeightStack) renderHeightStackOverlay(data, groundLevel, scale);
}

function renderHeightStackOverlay(data, groundLevel, scale) {
  if (data.length < 2) return;
  const tallest = data[0];
  const tallestRect = buildingRects.find(r => r.building.rank === tallest.rank);
  if (!tallestRect) return;

  ctx.save();
  const rx = tallestRect.x + tallestRect.w + 14;
  ctx.strokeStyle = 'rgba(212,136,15,0.7)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(rx, tallestRect.y);
  ctx.lineTo(rx, tallestRect.y + tallestRect.h);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = 'rgba(255,255,255,0.8)';
  ctx.font = '9px "IBM Plex Mono", monospace';
  ctx.textAlign = 'left';
  for (let m = 100; m <= tallest.height; m += 100) {
    const y = groundLevel - m * scale;
    if (y < 5) continue;
    ctx.fillRect(rx - 3, y, 7, 1);
    ctx.fillText(`${m}m`, rx + 6, y + 3);
  }
  ctx.restore();
}

export function hitTest(mx, my) {
  for (let i = buildingRects.length - 1; i >= 0; i--) {
    const r = buildingRects[i];
    if (mx >= r.x - 4 && mx <= r.x + r.w + 4 && my >= r.y - 8 && my <= r.y + r.h + 2) {
      return r;
    }
  }
  return null;
}
