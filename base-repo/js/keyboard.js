// Keyboard shortcut handler + command palette
import { state, saveState } from './state.js';
import { $ } from './utils.js';
import { applyFilters, resetFilters, navigateBuildings } from './ui/filters.js';
import { openModal, closeModal } from './ui/modals.js';
import { closeDetailPanel } from './ui/detail.js';
import { toggleHeightStack } from './ui/stack.js';
import { exportImage } from './ui/export.js';

export function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
      if (e.key === 'Escape') e.target.blur();
      return;
    }
    const key = e.key.toLowerCase();
    const detailPanel = $('#detail-panel');

    if (key === 'h') {
      e.preventDefault();
      const m = $('#modal-help');
      m.classList.contains('hidden') ? openModal('modal-help') : closeModal('modal-help');
    } else if (key === 's' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      const m = $('#modal-settings');
      if (m.classList.contains('hidden')) { openModal('modal-settings'); }
      else closeModal('modal-settings');
    } else if (key === 'e' && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      exportImage();
    } else if (key === 'r') {
      e.preventDefault();
      resetFilters();
    } else if (key === 't') {
      e.preventDefault();
      toggleHeightStack();
    } else if (key === 'escape') {
      closeModal('modal-help');
      closeModal('modal-settings');
      if (!detailPanel.classList.contains('hidden')) closeDetailPanel();
    } else if (key === 'arrowup' || key === 'arrowdown') {
      e.preventDefault();
      navigateBuildings(key === 'arrowdown' ? 1 : -1);
    } else if (key >= '1' && key <= '9') {
      const counts = [3, 5, 10, 15, 20, 25, 30, 30, 30];
      const n = counts[parseInt(key) - 1];
      $('#filter-count').value = n;
      state.filters.count = n;
      applyFilters();
      $('#status-text').textContent = `Top ${n}`;
    } else if (key === '0') {
      $('#filter-count').value = '30';
      state.filters.count = 30;
      applyFilters();
      $('#status-text').textContent = 'Top 30';
    }
  });
}
