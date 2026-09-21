// Export PNG image and JSON data
import { state } from '../state.js';
import { $ } from '../utils.js';
import { ALL_BUILDINGS, getColor } from '../state.js';
import { drawBuildingSilhouette } from './canvas.js';

export function exportImage() {
  const ec = document.createElement('canvas');
  const W = 1280, H = 720;
  ec.width = W; ec.height = H;
  const c = ec.getContext('2d');
  const grad = c.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#6b8fad');
  grad.addColorStop(0.3, '#92a8b8');
  grad.addColorStop(0.6, '#b8b0a0');
  grad.addColorStop(1, '#d8d0c2');
  c.fillStyle = grad;
  c.fillRect(0, 0, W, H);

  c.fillStyle = '#ffffff';
  c.font = 'bold 20px "DM Serif Display", serif';
  c.fillText('Tallest Buildings Rank', 20, 35);
  c.font = '12px "DM Sans", sans-serif';
  c.fillStyle = '#ccc';
  c.fillText(`Top ${state.filtered.length}`, 20, 55);

  const data = state.filtered;
  if (data.length === 0) return;
  const tallest = Math.max(...data.map(b => b.height));
  const gl = H - 60;
  const maxPx = gl - 70;
  const s = maxPx / tallest;
  const padding = 40;
  const usable = W - padding * 2;
  const sp = usable / data.length;
  const sx = (W - usable) / 2;

  for (let m = 0; m <= 900; m += 100) {
    const y = gl - m * s;
    c.strokeStyle = 'rgba(255,255,255,0.12)';
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke();
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.font = '10px monospace';
    c.fillText(m + 'm', 6, y - 3);
  }

  [...data].reverse().forEach((b) => {
    const bH = b.height * s;
    const bW = Math.max(14, Math.min(50, sp * 0.6));
    const idx = data.indexOf(b);
    const x = sx + idx * sp + (sp - bW) / 2;
    const y = gl - bH;
    drawBuildingSilhouette(c, x, y, bW, bH, getColor(b), 1, false);
    if (bH > 30) {
      c.fillStyle = '#fff';
      c.font = '9px monospace';
      c.textAlign = 'center';
      c.fillText(b.height + 'm', x + bW / 2, y - 6);
      c.textAlign = 'left';
    }
  });

  c.fillStyle = '#8a8070';
  c.fillRect(0, gl, W, 2);
  c.fillStyle = '#c8c0b2';
  c.fillRect(0, gl + 2, W, H - gl - 2);

  c.fillStyle = '#888';
  c.font = '10px monospace';
  c.textAlign = 'right';
  c.fillText('tallest-buildings-rank', W - 10, H - 8);

  const link = document.createElement('a');
  link.download = 'tallest-buildings-rank.png';
  link.href = ec.toDataURL('image/png');
  link.click();
  $('#status-text').textContent = 'Exported PNG image';
}

export function exportData() {
  const d = state.filtered.map(b => ({
    rank: b.rank, name: b.name, city: b.city, country: b.country,
    region: b.region, height_m: b.height, floors: b.floors,
    opened: b.opened, type: b.type, spire_m: b.spire,
  }));
  const blob = new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.download = 'tallest-buildings-data.json';
  link.href = URL.createObjectURL(blob);
  link.click();
  URL.revokeObjectURL(link.href);
  $('#status-text').textContent = 'Exported JSON data';
}

export function initExport() {
  $('#btn-export').addEventListener('click', () => {
    const choice = prompt('Export as:\n1 = PNG image\n2 = JSON data\nEnter 1 or 2:');
    if (choice === '1') exportImage();
    else if (choice === '2') exportData();
  });
}
