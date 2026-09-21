// Settings panel UI and persistence
import { state, saveState } from '../state.js';
import { $ } from '../utils.js';
import { syncFiltersUI, applyFilters } from './filters.js';

export function syncSettingsUI() {
  $('#set-ground').value = state.settings.ground;
  $('#set-color-mode').value = state.settings.colorMode;
  $('#set-labels').value = state.settings.labels;
  $('#set-grid').value = state.settings.grid;
  $('#set-anim').value = state.settings.animSpeed;
  $('#set-tooltip-style').value = state.settings.tooltipStyle;
}

export function initSettingsHandlers() {
  ['set-ground', 'set-color-mode', 'set-labels', 'set-grid', 'set-anim', 'set-tooltip-style'].forEach(id => {
    $(`#${id}`).addEventListener('change', (e) => {
      state.settings[id.replace('set-', '')] = e.target.value;
      saveState();
      $('#status-text').textContent = `Setting: ${id.replace('set-', '')} → ${e.target.options[e.target.selectedIndex].text}`;
    });
  });

  $('#btn-clear-data').addEventListener('click', () => {
    if (confirm('Clear all saved settings and state?')) {
      localStorage.removeItem('tb_settings');
      localStorage.removeItem('tb_filters');
      localStorage.removeItem('tb_heightStack');
      localStorage.removeItem('tb_selectedRank');
      state.settings = { ground: 'bottom', colorMode: 'region', labels: 'on', grid: 'on', animSpeed: 'normal', tooltipStyle: 'card' };
      state.filters = { region: 'all', era: 'all', sort: 'height-desc', count: 30, search: '' };
      state.showHeightStack = false;
      state.selected = null;
      syncSettingsUI();
      syncFiltersUI();
      applyFilters();
      $('#status-text').textContent = 'All saved data cleared';
    }
  });
}
