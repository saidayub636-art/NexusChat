/* ═══════════════════════════════════════════════════
   NEXUSCHAT — UI HELPERS & MODAL MANAGEMENT
═══════════════════════════════════════════════════ */

window.$ = (selector, root = document) => root.querySelector(selector);
window.$$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

window.showElement = function(el) {
  if (!el) return;
  el.classList.remove('hidden');
};

window.hideElement = function(el) {
  if (!el) return;
  el.classList.add('hidden');
};

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('hidden');
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('hidden');
};

window.showToast = function(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`.trim();
  toast.innerHTML = `<span class="toast-dot"></span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.style.animation = 'toastOut 0.25s ease forwards';
  }, 3000);
  toast.addEventListener('animationend', () => toast.remove());
};

window.toggleTheme = function() {
  const html = document.documentElement;
  const next = html.dataset.theme === 'light' ? 'dark' : 'light';
  html.dataset.theme = next;
  localStorage.setItem('nexus_theme', next);
};

window.applySavedTheme = function() {
  const saved = localStorage.getItem('nexus_theme') || 'dark';
  document.documentElement.dataset.theme = saved;
};

window.hideAllModals = function() {
  document.querySelectorAll('.modal-overlay').forEach(modal => modal.classList.add('hidden'));
};

window.setActiveSection = function(section) {
  const buttons = document.querySelectorAll('.sec-tab');
  buttons.forEach(btn => btn.classList.toggle('active', btn.dataset.section === section));
  if (window.appState) {
    window.appState.activeSection = section;
  }
  window.renderConversationArea();
};

window.filterConversations = function(query) {
  if (window.appState) {
    window.appState.conversationSearch = query.trim().toLowerCase();
  }
  window.renderConversationArea();
};

window.closeActiveMenus = function() {
  document.getElementById('chat-menu')?.classList.add('hidden');
  document.querySelectorAll('.emoji-picker').forEach(el => el.classList.add('hidden'));
};
