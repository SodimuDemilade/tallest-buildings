// Filter management
import { state, saveState, ALL_BUILDINGS } from '../state.js';
import { $ } from '../utils.js';
import { updateList } from './list.js';
import { updateHeightStack } from './stack.js';

export function populateRegionFilter() {
  const sel = $('#filter-region');
  const regions = [...new Set(ALL_BUILDINGS.map(b => b.region))];
  sel.innerHTML = '<option value="all">All Regions</option>';
  regions.forEach(r => {
    const opt = document.createElement('option');
    opt.value = r.toLowerCase().replace(/\s+/g, '-');
    opt.textContent = r;
    sel.appendChild(opt);
  });
}

export function applyFilters() {
  let data = [...ALL_BUILDINGS];
  if (state.filters.region !== 'all') {
    data = data.filter(b => b.region.toLowerCase().replace(/\s+/g, '-') === state.filters.region);
  }
  if (state.filters.era !== 'all') {
    const era = state.filters.era;
    data = data.filter(b => {
      if (era === 'pre-2000') return b.opened < 2000;
      if (era === '2000-2010') return b.opened >= 2000 && b.opened <= 2010;
      if (era === '2010-2015') return b.opened >= 2011 && b.opened <= 2015;
      if (era === '2015-2020') return b.opened >= 2016 && b.opened <= 2020;
      if (era === '2020+') return b.opened >= 2021;
      return true;
    });
  }
  if (state.filters.search) {
    const q = state.filters.search.toLowerCase();
    data = data.filter(b =>
        b.name.toLowerCase().includes(q) ||
        b.city.toLowerCase().includes(q) ||
        b.country.toLowerCase().includes(q)
    );
  }
  const { sort } = state.filters;
  if (sort === 'height-desc') data.sort((a,b) => b.height - a.height);
  else if (sort === 'height-asc') data.sort((a,b) => a.height - b.height);
  else if (sort === 'name') data.sort((a,b) => a.name.localeCompare(b.name));
  else if (sort === 'year') data.sort((a,b) => a.opened - b.opened);
  data = data.slice(0, state.filters.count);
  state.filtered = data;
  state.animProgress = 0;
  state.navIndex = -1;
  updateList();
  updateHeightStack();
  saveState();
}

export function resetFilters() {
  state.filters = { region: 'all', era: 'all', sort: 'height-desc', count: 30, search: '' };
  syncFiltersUI();
  applyFilters();
  $('#status-text').textContent = 'Filters reset';
}

export function syncFiltersUI() {
  $('#filter-region').value = state.filters.region;
  $('#filter-era').value = state.filters.era;
  $('#filter-sort').value = state.filters.sort;
  $('#filter-count').value = state.filters.count;
  $('#filter-search').value = state.filters.search;
}

export function navigateBuildings(dir) {
  if (state.filtered.length === 0) return;
  state.navIndex = Math.max(0, Math.min(state.filtered.length - 1, state.navIndex + dir));
  import('./detail.js').then(m => m.selectBuilding(state.filtered[state.navIndex]));
}

export function initFilterHandlers() {
  $('#filter-region').addEventListener('change', e => { state.filters.region = e.target.value; applyFilters(); });
  $('#filter-era').addEventListener('change', e => { state.filters.era = e.target.value; applyFilters(); });
  $('#filter-sort').addEventListener('change', e => { state.filters.sort = e.target.value; applyFilters(); });
  $('#filter-count').addEventListener('change', e => { state.filters.count = parseInt(e.target.value); applyFilters(); });
  $('#filter-search').addEventListener('input', (function() {
    let t;
    return e => { clearTimeout(t); t = setTimeout(() => { state.filters.search = e.target.value; applyFilters(); }, 200); };
  })());
  $('#btn-reset').addEventListener('click', resetFilters);
}
