// Modal management
import { $ } from '../utils.js';

export function openModal(id) {
  document.getElementById(id).classList.remove('hidden');
}

export function closeModal(id) {
  document.getElementById(id).classList.add('hidden');
}

export function initModals() {
  $('#btn-help').addEventListener('click', () => openModal('modal-help'));
  $('#btn-settings').addEventListener('click', () => openModal('modal-settings'));
  document.querySelectorAll('.modal-close').forEach(btn =>
    btn.addEventListener('click', () => closeModal(btn.getAttribute('data-close')))
  );
  document.querySelectorAll('.modal-overlay').forEach(o =>
    o.addEventListener('click', e => { if (e.target === o) o.classList.add('hidden'); })
  );
}
