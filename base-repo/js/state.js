// State management and localStorage persistence
import { BUILDINGS, cleanData, REGION_COLORS } from './data.js';

export const ALL_BUILDINGS = cleanData(BUILDINGS);

export const state = {
  filtered: [...ALL_BUILDINGS],
  selected: null,
  hovered: null,
  settings: {
    ground: 'bottom',
    colorMode: 'region',
    labels: 'on',
    grid: 'on',
    animSpeed: 'normal',
    tooltipStyle: 'card',
  },
  filters: {
    region: 'all',
    era: 'all',
    sort: 'height-desc',
    count: 30,
    search: '',
  },
  showHeightStack: false,
  animProgress: 1,
  navIndex: -1,
};

export function saveState() {
  try {
    localStorage.setItem('tb_settings', JSON.stringify(state.settings));
    localStorage.setItem('tb_filters', JSON.stringify(state.filters));
    localStorage.setItem('tb_heightStack', JSON.stringify(state.showHeightStack));
    localStorage.setItem('tb_selectedRank', state.selected ? state.selected.rank : null);
  } catch(e) {}
}

export function loadState() {
  try {
    const s = localStorage.getItem('tb_settings');
    if (s) state.settings = { ...state.settings, ...JSON.parse(s) };
    const f = localStorage.getItem('tb_filters');
    if (f) state.filters = { ...state.filters, ...JSON.parse(f) };
    const hs = localStorage.getItem('tb_heightStack');
    if (hs !== null) state.showHeightStack = JSON.parse(hs);
    const sr = localStorage.getItem('tb_selectedRank');
    if (sr && sr !== 'null') {
      const found = ALL_BUILDINGS.find(b => b.rank === parseInt(sr));
      if (found) state.selected = found;
    }
  } catch(e) {}
}

export function getColor(building) {
  const mode = state.settings.colorMode;
  if (mode === 'region') return REGION_COLORS[building.region] || '#4a4640';
  if (mode === 'height') {
    const t = (building.height - 350) / (828 - 350);
    return `hsl(${200 - t * 20}, ${60 + t * 20}%, ${30 + t * 15}%)`;
  }
  return '#3a3830';
}
