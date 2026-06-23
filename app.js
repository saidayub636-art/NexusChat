/* ═══════════════════════════════════════════════════
   NEXUSCHAT — APPLICATION INITIALIZATION
═══════════════════════════════════════════════════ */

window.initializeApp = async function() {
  // Ensure appState is initialized
  if (!window.appState) {
    window.appState = {
      activeSection: 'chats',
      conversationSearch: '',
      emojiCategory: 'smileys',
      attachment: null,
      recording: false,
      voiceSeconds: 0,
      voiceTimer: null,
      callTimer: null,
      editingMessageId: null,
      replyingTo: null,
      forwardingMessageId: null,
    };
  }
  
  await Store.init();
  window.applySavedTheme();
  window.attachAuthEvents();

  if (Store.getCurrentUser()) {
    window.showAppScreen();
    window.initApp();
    window.startRealTimeSimulation();
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
    const contextMenu = document.getElementById('context-menu');
    if (contextMenu && !contextMenu.contains(event.target)) {
      contextMenu.classList.add('hidden');
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      window.hideAllModals();
      document.getElementById('chat-menu')?.classList.add('hidden');
      document.getElementById('emoji-picker')?.classList.add('hidden');
      document.getElementById('context-menu')?.classList.add('hidden');
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
  if (typeof window.renderCurrentUser === 'function') window.renderCurrentUser();
  if (typeof window.renderConversationArea === 'function') window.renderConversationArea();
  if (typeof window.renderEmojiGrid === 'function') window.renderEmojiGrid(window.appState.emojiCategory);
  
  if (Store.getActiveConv()) {
    if (typeof renderChatHeader === 'function') renderChatHeader(Store.getActiveConv());
    if (typeof renderMessages === 'function') renderMessages(Store.getActiveConv());
  }
};

// ─────────────────────────────────────────────────────
// REAL-TIME BEHAVIOR SIMULATION
// ─────────────────────────────────────────────────────

window.startRealTimeSimulation = function() {
  // Simulate user status changes (online/away/offline)
  const currentUser = Store.getCurrentUser();
  if (!currentUser) return;
  
  // Set current user to online
  Store.setUserStatus(currentUser.id, 'online', 'Available');
  
  // Simulate other users changing status
  setInterval(() => {
    const users = Store.searchUsers('');
    users.forEach(user => {
      const rand = Math.random();
      const status = rand < 0.6 ? 'online' : rand < 0.8 ? 'away' : 'offline';
      const statusText = {
        'online': ['Available', 'Chatting', 'Working', 'Browsing'][Math.floor(Math.random() * 4)],
        'away': 'Away',
        'offline': 'Last seen recently'
      }[status];
      Store.setUserStatus(user.id, status, statusText);
    });
    
    // Update chat header with new status
    const convId = Store.getActiveConv();
    if (convId) {
      renderChatHeader(convId);
    }
  }, 5000);
  
  // Update online status of current user periodically
  setInterval(() => {
    Store.simulateOnlineStatus();
  }, 3000);
};

// ─────────────────────────────────────────────────────
// ATTACHMENT & FILE HANDLING
// ─────────────────────────────────────────────────────

window.setupDragAndDrop = function() {
  const messagesContainer = document.getElementById('messages-container');
  if (!messagesContainer) return;
  
  messagesContainer.addEventListener('dragover', (e) => {
    e.preventDefault();
    messagesContainer.style.background = 'rgba(108,99,255,0.1)';
  });
  
  messagesContainer.addEventListener('dragleave', () => {
    messagesContainer.style.background = '';
  });
  
  messagesContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    messagesContainer.style.background = '';
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fileInput = document.getElementById('file-input');
      if (fileInput) {
        fileInput.files = files;
        window.handleFileUpload(fileInput);
      }
    }
  });
};

if (document.readyState === 'loading') {
  window.addEventListener('DOMContentLoaded', () => {
    window.initializeApp();
    window.setupDragAndDrop();
  });
} else {
  window.initializeApp();
  window.setupDragAndDrop();
}
