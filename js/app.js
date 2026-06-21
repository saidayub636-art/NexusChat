/* ═══════════════════════════════════════════════════
   NEXUSCHAT — APPLICATION INITIALIZATION
═══════════════════════════════════════════════════ */

window.initializeApp = async function() {
  await Store.init();
  window.applySavedTheme();
  window.attachAuthEvents();
  window.setActiveSection(window.appState.activeSection);
  window.renderEmojiGrid(window.appState.emojiCategory);

  if (Store.getCurrentUser()) {
    window.showAppScreen();
    window.initApp();
  } else {
    window.showAuthScreen();
    window.setAuthTab('login');
  }

  document.addEventListener('click', (event) => {
    const chatMenu = document.getElementById('chat-menu');
    if (chatMenu && !chatMenu.contains(event.target) && event.target.id !== 'chat-more-btn') {
      chatMenu.classList.add('hidden');
    }
    const emojiPicker = document.getElementById('emoji-picker');
    if (emojiPicker && !emojiPicker.contains(event.target) && event.target.id !== 'emoji-btn') {
      emojiPicker.classList.add('hidden');
    }
    if (event.target.classList.contains('modal-overlay')) {
      event.target.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.hideAllModals();
      document.getElementById('chat-menu')?.classList.add('hidden');
      document.getElementById('emoji-picker')?.classList.add('hidden');
    }
  });

  const messageInput = document.getElementById('message-input');
  if (messageInput) {
    messageInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        window.sendMessage();
      }
    });
  }

  const searchInput = document.getElementById('conv-search');
  if (searchInput) {
    searchInput.addEventListener('input', (event) => {
      window.filterConversations(event.target.value);
    });
  }
};

window.initApp = function() {
  window.clearAuthForms();
  window.renderCurrentUser();
  window.renderConversationArea();
  if (Store.getActiveConv()) {
    renderChatHeader(Store.getActiveConv());
    renderMessages(Store.getActiveConv());
  }
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.initializeApp();
  });
} else {
  window.initializeApp();
}
