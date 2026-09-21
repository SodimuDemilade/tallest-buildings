// Main entry point — wire stores + UI together
import { state, loadState, saveState, ALL_BUILDINGS } from './state.js';
import { $, debounce } from './utils.js';
import { initKeyboard } from './keyboard.js';
import { resizeCanvas, renderCanvas } from './ui/canvas.js';
import { startAnimation } from './ui/animation.js';
import { populateRegionFilter, applyFilters, syncFiltersUI, initFilterHandlers } from './ui/filters.js';
import { updateList } from './ui/list.js';
import { updateHeightStack } from './ui/stack.js';
import { initModals } from './ui/modals.js';
import { initDetailPanel } from './ui/detail.js';
import { initCanvasInteraction } from './ui/tooltip.js';
import { initExport } from './ui/export.js';
import { syncSettingsUI, initSettingsHandlers } from './ui/settings.js';
import { runSelfTests } from './tests.js';

function init() {
  populateRegionFilter();
  loadState();
  syncSettingsUI();
  syncFiltersUI();
  resizeCanvas();
  applyFilters();

  state.animProgress = 0;
  startAnimation();

  window.addEventListener('resize', debounce(() => {
    resizeCanvas();
    renderCanvas();
  }, 100));

  initKeyboard();
  initModals();
  initDetailPanel();
  initCanvasInteraction();
  initExport();
  initSettingsHandlers();
  initFilterHandlers();

  const el = document.getElementById('status-text');
  if (el) el.textContent = 'Ready — Press H for help';

  // Auto-run self-tests in test mode
  if (window.location.search.includes('test=1')) {
    setTimeout(runSelfTests, 300);
  }

  // Expose for manual invocation
  window.runSelfTests = runSelfTests;
}

init();
