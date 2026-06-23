/* ═══════════════════════════════════════════════════
   NEXUSCHAT — CHAT UI & CONVERSATION MANAGEMENT
═══════════════════════════════════════════════════ */

window.appState = {
  activeSection: 'chats',
  conversationSearch: '',
  emojiCategory: 'smileys',
  attachment: null,
  recording: false,
  voiceSeconds: 0,
  voiceTimer: null,
  callTimer: null,
};

const emojiLibrary = {
  smileys: ['😄','😃','😊','😉','😍','😎','🤩','😁','😇','🙂','🙃','😌','🤗','😏','🤔','😬'],
  gestures: ['👍','👋','🙏','👏','✌️','🤘','🤙','👌','👀','🤝','🙌','🤟','🫶','💪','✍️','🫠'],
  objects: ['💡','📎','📌','📁','📂','📅','📌','🎁','⚙️','📷','📱','🖥️','🔒','🗂️','📝','🧠'],
  symbols: ['❤️','🔥','✨','🎉','✅','❌','⭐','💬','🚀','🛠️','🌟','🧩','🎯','📌','🕒','🔔'],
};

window.getCurrentUser = function() {
  return Store.getCurrentUser();
};

window.getCurrentConversationId = function() {
  return Store.getActiveConv();
};

window.renderConversationArea = function() {
  if (!getCurrentUser()) return;
  if (window.appState.activeSection === 'contacts') {
    renderContactList();
  } else if (window.appState.activeSection === 'archived') {
    renderArchivedList();
  } else {
    renderConversationList();
  }
};

window.renderConversationList = function() {
  const currentUser = getCurrentUser();
  const container = document.getElementById('conversation-list');
  if (!container) return;
  const conversations = Store.getConversations(currentUser.id)
    .filter(conv => !conv.archived)
    .filter(conv => {
      if (!window.appState.conversationSearch) return true;
      const query = window.appState.conversationSearch;
      return conv.other.name.toLowerCase().includes(query) ||
             conv.other.username.toLowerCase().includes(query) ||
             conv.lastMsg?.text?.toLowerCase().includes(query) ||
             (conv.other.email || '').toLowerCase().includes(query);
    });

  container.innerHTML = conversations.length ? conversations.map(conv => {
    const unread = conv.unread > 0 ? `<span class="unread-badge">${conv.unread}</span>` : '';
    const preview = conv.lastMsg?.text ? conv.lastMsg.text : 'No messages yet';
    const time = conv.lastMsg ? Store.formatTime(conv.lastMsg.ts) : '';
    const pinnedClass = conv.pinned ? 'pinned' : '';
    const active = conv.id === getCurrentConversationId() ? 'active' : '';
    return `
      <button class="conv-item ${active} ${pinnedClass}" onclick="selectConversation('${conv.id}')">
        <div class="avatar-wrap"><img class="avatar" src="${conv.other.avatar}" alt="${conv.other.name}" /></div>
        <div class="conv-info">
          <div class="conv-name-row">
            <span class="conv-name">${conv.other.name}</span>
            <span class="conv-time">${time}</span>
          </div>
          <div class="conv-preview-row">
            <span class="conv-preview ${conv.unread ? 'unread' : ''}">${escapeHtml(preview)}</span>
            ${unread}
          </div>
        </div>
      </button>
    `;
  }).join('') : '<div class="section-empty">No chats found. Start a new conversation from the search modal.</div>';
};

window.renderContactList = function() {
  const container = document.getElementById('conversation-list');
  if (!container) return;
  const contacts = Store.searchUsers(window.appState.conversationSearch);
  container.innerHTML = contacts.length ? contacts.map(user => {
    return `
      <div class="conv-item" onclick="startChatWithUser(${user.id})">
        <div class="avatar-wrap"><img class="avatar" src="${user.avatar}" alt="${user.name}" /></div>
        <div class="conv-info">
          <div class="conv-name-row">
            <span class="conv-name">${user.name}</span>
            <span class="conv-time">${user.statusText || user.status}</span>
          </div>
          <div class="conv-preview-row">
            <span class="conv-preview">@${user.username}</span>
            <button class="start-chat-btn">Chat</button>
          </div>
        </div>
      </div>
    `;
  }).join('') : '<div class="section-empty">No contacts match your search.</div>';
};

window.renderArchivedList = function() {
  const currentUser = getCurrentUser();
  const container = document.getElementById('conversation-list');
  if (!container) return;
  const archived = Store.getConversations(currentUser.id)
    .filter(conv => conv.archived)
    .filter(conv => {
      if (!window.appState.conversationSearch) return true;
      const query = window.appState.conversationSearch;
      return conv.other.name.toLowerCase().includes(query) || conv.other.username.toLowerCase().includes(query) || conv.lastMsg?.text?.toLowerCase().includes(query);
    });
  container.innerHTML = archived.length ? archived.map(conv => {
    const time = conv.lastMsg ? Store.formatTime(conv.lastMsg.ts) : '';
    return `
      <button class="conv-item ${conv.id === getCurrentConversationId() ? 'active' : ''}" onclick="selectConversation('${conv.id}')">
        <div class="avatar-wrap"><img class="avatar" src="${conv.other.avatar}" alt="${conv.other.name}" /></div>
        <div class="conv-info">
          <div class="conv-name-row">
            <span class="conv-name">${conv.other.name}</span>
            <span class="conv-time">${time}</span>
          </div>
          <div class="conv-preview-row">
            <span class="conv-preview">${escapeHtml(conv.lastMsg?.text || 'Archived conversation')}</span>
          </div>
        </div>
      </button>
    `;
  }).join('') : '<div class="section-empty">No archived conversations yet.</div>';
};

window.selectConversation = function(convId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  Store.setActiveConv(convId);
  document.getElementById('empty-state')?.classList.add('hidden');
  document.getElementById('conversation-view')?.classList.remove('hidden');
  renderConversationArea();
  renderChatHeader(convId);
  renderMessages(convId);
  renderInfoPanel(convId);
};

window.renderChatHeader = function(convId) {
  const other = getConversationOther(convId);
  if (!other) return;
  document.getElementById('chat-avatar').src = other.avatar;
  document.getElementById('chat-avatar').alt = other.name;
  document.getElementById('chat-header-name').textContent = other.name;
  document.getElementById('chat-header-status').textContent = other.statusText || other.status;
  document.getElementById('chat-status-dot').className = `status-dot ${other.status === 'online' ? 'online' : other.status === 'away' ? 'away' : ''}`.trim();
};

window.getConversationOther = function(convId) {
  const currentUser = getCurrentUser();
  if (!currentUser || !convId) return null;
  const parts = convId.replace('conv_', '').split('_').map(Number);
  const otherId = parts.find(id => id !== currentUser.id);
  return otherId ? Store.getUserById(otherId) : null;
};

window.renderMessages = function(convId) {
  const container = document.getElementById('messages-list');
  const currentUser = getCurrentUser();
  const messages = Store.getMessages(convId);
  if (!container || !currentUser) return;
  let lastDate = '';
  container.innerHTML = messages.length ? messages.map(msg => {
    const created = new Date(msg.ts);
    const dateLabel = Store.formatDateSep(msg.ts);
    const separator = dateLabel !== lastDate ? `<div class="date-separator"><span class="date-sep-text">${dateLabel}</span></div>` : '';
    lastDate = dateLabel;
    const isSent = msg.from === currentUser.id;
    const other = getConversationOther(convId);
    const bubble = buildMessageBubble(msg, isSent, other);
    return separator + bubble;
  }).join('') : '<div class="section-empty">No messages in this conversation yet. Send the first message.</div>';
  container.scrollTop = container.scrollHeight;
  Store.markRead(convId, currentUser.id);
};

function buildMessageBubble(msg, isSent, other) {
  const senderName = isSent ? 'You' : other?.name || 'Unknown';
  const messageText = msg.text ? `<div>${escapeHtml(msg.text)}</div>` : '';
  const imageHtml = msg.image ? `<div class="bubble-image"><img src="${msg.image}" alt="Attachment" /></div>` : '';
  const editedTag = msg.edited ? '<span class="edited-tag">(edited)</span>' : '';
  const deletedContent = msg.deleted ? '<div class="deleted-message">This message was deleted</div>' : '';
  
  const reactionsHtml = Array.isArray(msg.reactions) && msg.reactions.length ? `
    <div class="reactions">${msg.reactions.map(reaction => `
      <span class="reaction-pill ${reaction.users.includes(Store.getCurrentUser().id) ? 'mine' : ''}" onclick="addReactionToMessage('${msg.id}', '${reaction.emoji}')">${reaction.emoji} ${reaction.users.length}</span>
    `).join('')}</div>
  ` : '';
  
  const replyHtml = msg.replyTo ? `
    <div class="reply-preview">Replying to previous message</div>
  ` : '';
  
  const bookmarkIcon = Store.isBookmarked(Store.getActiveConv(), msg.id) ? `<span class="bookmark-indicator">⭐</span>` : '';
  
  return `
    <div class="message-row ${isSent ? 'sent' : 'received'}" oncontextmenu="showMessageContextMenu('${msg.id}', event)">
      <div class="avatar-wrap">${isSent ? '' : `<img class="avatar" src="${other?.avatar || ''}" alt="${escapeHtml(other?.name || '')}" />`}</div>
      <div class="message-group">
        ${replyHtml}
        <div class="bubble">
          ${deletedContent}
          ${imageHtml}
          ${messageText}
          <div class="bubble-meta">
            <span>${escapeHtml(senderName)}</span>
            <span>${Store.formatTime(msg.ts)}</span>
            ${editedTag}
            ${bookmarkIcon}
          </div>
        </div>
        ${reactionsHtml}
      </div>
      <button class="message-actions-btn" onclick="showMessageContextMenu('${msg.id}', event)">⋮</button>
    </div>
  `;
}

window.sendMessage = function() {
  const currentUser = getCurrentUser();
  const convId = getCurrentConversationId();
  const input = document.getElementById('message-input');
  if (!currentUser || !convId || !input) return;
  const text = input.textContent.trim();
  if (!text && !window.appState.attachment) return;

  const other = getConversationOther(convId);
  if (!other) return;
  
  Store.addMessage(convId, {
    from: currentUser.id,
    to: other.id,
    text: text ? NexusCrypto.sanitizeInput(text) : '',
    image: window.appState.attachment?.type === 'image' ? window.appState.attachment.url : null,
    replyTo: window.appState.replyingTo || null,
  });
  
  input.innerHTML = '';
  window.appState.replyingTo = null;
  const preview = document.getElementById('message-reply-preview');
  if (preview) preview.classList.add('hidden');
  
  window.removeAttachment();
  window.renderMessages(convId);
  window.renderConversationArea();
  window.autoScrollToLatest();
  
  const sendBtn = document.getElementById('send-btn');
  if (sendBtn) sendBtn.classList.add('sending');
  setTimeout(() => sendBtn?.classList.remove('sending'), 400);
  
  window.simulateTypingIndicator();
};

window.openSearch = function() {
  openModal('search-modal');
  const input = document.getElementById('user-search-input');
  if (input) {
    input.value = '';
    input.focus();
  }
  renderSearchResults('');
};

window.renderSearchResults = function(query) {
  const resultsContainer = document.getElementById('search-results');
  if (!resultsContainer) return;
  const queryValue = query || document.getElementById('user-search-input')?.value || '';
  const users = Store.searchUsers(queryValue);
  if (!users.length) {
    resultsContainer.innerHTML = '<div class="search-hint">No matching users found. Try a different name or ID.</div>';
    return;
  }
  resultsContainer.innerHTML = users.map(user => `
    <div class="search-user-item" onclick="startChatWithUser(${user.id})">
      <div class="avatar-wrap"><img class="avatar" src="${user.avatar}" alt="${escapeHtml(user.name)}" /></div>
      <div class="user-details">
        <div class="name">${escapeHtml(user.name)}</div>
        <div class="sub">@${escapeHtml(user.username)} • ${escapeHtml(user.email)}</div>
      </div>
      <button class="start-chat-btn">Start Chat</button>
    </div>
  `).join('');
};

window.searchUsers = function(query) {
  renderSearchResults(query);
};

window.startChatWithUser = function(userId) {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  const other = Store.getUserById(userId);
  if (!other) return;
  const convId = Store.getConvId(currentUser.id, other.id);
  Store.setActiveConv(convId);
  closeModal('search-modal');
  document.getElementById('empty-state')?.classList.add('hidden');
  document.getElementById('conversation-view')?.classList.remove('hidden');
  window.setActiveSection('chats');
  renderConversationArea();
  renderChatHeader(convId);
  renderMessages(convId);
};

window.toggleEmojiPicker = function() {
  const picker = document.getElementById('emoji-picker');
  if (!picker) return;
  picker.classList.toggle('hidden');
  window.renderEmojiGrid(window.appState.emojiCategory);
};

window.filterEmojis = function(category) {
  window.appState.emojiCategory = category;
  document.querySelectorAll('.ec-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.category === category));
  window.renderEmojiGrid(category);
};

window.renderEmojiGrid = function(category) {
  const grid = document.getElementById('emoji-grid');
  if (!grid) return;
  const emojis = emojiLibrary[category] || emojiLibrary.smileys;
  grid.innerHTML = emojis.map(emoji => `<button class="emoji-btn" type="button" onclick="insertEmoji('${emoji}')">${emoji}</button>`).join('');
};

window.insertEmoji = function(emoji) {
  const input = document.getElementById('message-input');
  if (!input) return;
  input.focus();
  document.execCommand('insertText', false, emoji);
};

window.triggerFileUpload = function() {
  document.getElementById('file-input')?.click();
};

window.handleFileUpload = function(input) {
  const file = input.files?.[0];
  if (!file) return;
  window.appState.attachment = { name: file.name, type: file.type.startsWith('image/') ? 'image' : 'file', url: '', size: file.size };
  if (file.type.startsWith('image/')) {
    const reader = new FileReader();
    reader.onload = () => {
      window.appState.attachment.url = reader.result;
      document.getElementById('preview-img').src = reader.result;
      document.getElementById('attachment-preview')?.classList.remove('hidden');
      document.getElementById('preview-filename').textContent = file.name;
    };
    reader.readAsDataURL(file);
  } else {
    document.getElementById('preview-img').src = '';
    document.getElementById('attachment-preview')?.classList.remove('hidden');
    document.getElementById('preview-filename').textContent = file.name;
  }
};

window.removeAttachment = function() {
  window.appState.attachment = null;
  const preview = document.getElementById('attachment-preview');
  if (preview) preview.classList.add('hidden');
};

window.startVoice = function() {
  if (window.appState.recording) return;
  window.appState.recording = true;
  window.appState.voiceSeconds = 0;
  const voiceBtn = document.getElementById('voice-btn');
  voiceBtn?.classList.add('recording');
  window.showToast('Voice recording started', 'success');
  window.appState.voiceTimer = setInterval(() => {
    window.appState.voiceSeconds += 1;
  }, 1000);
};

window.stopVoice = function() {
  if (!window.appState.recording) return;
  window.appState.recording = false;
  clearInterval(window.appState.voiceTimer);
  window.appState.voiceTimer = null;
  document.getElementById('voice-btn')?.classList.remove('recording');
  window.showToast('Voice message saved to draft', 'success');
};

window.startCall = function(type) {
  const convId = getCurrentConversationId();
  const other = getConversationOther(convId);
  if (!convId || !other) return window.showToast('Please select a conversation first', 'error');
  const overlay = document.getElementById('call-overlay');
  if (!overlay) return;
  overlay.classList.remove('hidden');
  document.getElementById('call-avatar').src = other.avatar;
  document.getElementById('call-name').textContent = `${type === 'video' ? 'Video' : 'Voice'} call with ${other.name}`;
  document.getElementById('call-status').textContent = 'Connecting…';
  clearTimeout(window.appState.callTimer);
  window.appState.callTimer = setTimeout(() => {
    document.getElementById('call-status').textContent = 'Call in progress';
  }, 1200);
};

window.endCall = function() {
  document.getElementById('call-overlay')?.classList.add('hidden');
  clearTimeout(window.appState.callTimer);
  window.showToast('Call ended', 'success');
};

window.toggleChatInfo = function() {
  const panel = document.getElementById('info-panel');
  if (!panel) return;
  panel.classList.toggle('hidden');
};

window.toggleChatMenu = function() {
  document.getElementById('chat-menu')?.classList.toggle('hidden');
};

window.pinChat = function() {
  const convId = getCurrentConversationId();
  if (!convId) return window.showToast('No conversation selected', 'error');
  Store.togglePin(convId);
  window.renderConversationArea();
  window.toggleChatMenu();
  window.showToast('Conversation pinned/unpinned', 'success');
};

window.archiveChat = function() {
  const convId = getCurrentConversationId();
  if (!convId) return window.showToast('No conversation selected', 'error');
  Store.toggleArchive(convId);
  window.toggleChatMenu();
  window.showToast('Conversation archived', 'success');
  if (Store.getConversations(getCurrentUser().id).find(conv => conv.id === convId)?.archived) {
    window.closeConversation();
  }
};

window.muteChat = function() {
  const convId = getCurrentConversationId();
  if (!convId) return window.showToast('No conversation selected', 'error');
  Store.toggleMute(convId);
  window.toggleChatMenu();
  window.showToast('Conversation muted/unmuted', 'success');
};

window.blockUser = function() {
  const convId = getCurrentConversationId();
  const other = getConversationOther(convId);
  if (!other) return window.showToast('No conversation selected', 'error');
  const blocked = Store.toggleBlock(other.id);
  window.toggleChatMenu();
  window.showToast(blocked ? `${other.name} blocked` : `${other.name} unblocked`, 'success');
  window.closeConversation();
};

window.clearChat = function() {
  const convId = getCurrentConversationId();
  if (!convId) return window.showToast('No conversation selected', 'error');
  Store.clearMessages(convId);
  window.toggleChatMenu();
  window.renderMessages(convId);
  window.renderConversationArea();
  window.showToast('Conversation cleared', 'success');
};

window.closeConversation = function() {
  Store.setActiveConv(null);
  document.getElementById('conversation-view')?.classList.add('hidden');
  document.getElementById('empty-state')?.classList.remove('hidden');
  window.renderConversationArea();
};

window.openSettings = function() {
  openModal('settings-modal');
  window.renderSettings();
};

window.renderSettings = function() {
  const user = getCurrentUser();
  const container = document.getElementById('settings-content');
  if (!user || !container) return;
  const settings = user.settings || {};
  const theme = document.documentElement.dataset.theme;
  container.innerHTML = `
    <div class="settings-section">
      <h4>Chat Settings</h4>
      ${renderSettingsItem('notifications','Notifications','Receive new message alerts',settings.notifications,'notifications')}
      ${renderSettingsItem('readReceipts','Read receipts','Let others know when you read messages',settings.readReceipts,'readReceipts')}
      ${renderSettingsItem('typing','Typing indicators','Show when you are typing',settings.typing,'typing')}
      ${renderSettingsItem('darkMode','Dark mode','Use the dark interface theme',theme === 'dark','theme')}
    </div>
  `;
};

function renderSettingsItem(title, label, desc, active, key) {
  return `
    <div class="settings-item">
      <div class="settings-item-info">
        <div class="label">${label}</div>
        <div class="desc">${desc}</div>
      </div>
      <button class="toggle ${active ? 'on' : ''}" onclick="toggleSetting('${key}')" aria-label="Toggle ${label}"></button>
    </div>
  `;
}

window.toggleSetting = function(key) {
  const user = getCurrentUser();
  if (!user) return;
  if (key === 'theme') {
    window.toggleTheme();
  } else {
    const current = user.settings?.[key];
    user.settings[key] = !current;
    Store.updateUser(user.id, { settings: user.settings });
  }
  window.renderSettings();
};

window.openProfile = function() {
  const title = document.getElementById('profile-modal-title');
  if (title) title.textContent = 'My Profile';
  openModal('profile-modal');
  window.renderProfile();
};

window.openContactProfile = function() {
  const convId = getCurrentConversationId();
  const other = getConversationOther(convId);
  if (!other) return window.showToast('Select a conversation to view contact details', 'error');
  document.getElementById('profile-modal-title').textContent = other.name;
  openModal('profile-modal');
  window.renderContactProfile(other);
};

window.renderContactProfile = function(user) {
  const container = document.getElementById('profile-content');
  if (!container || !user) return;
  container.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar-wrap">
        <img class="profile-avatar" src="${user.avatar}" alt="${escapeHtml(user.name)}" />
      </div>
      <div class="profile-name">${escapeHtml(user.name)}</div>
      <div class="profile-id">@${escapeHtml(user.username)}</div>
    </div>
    <div class="profile-fields">
      <div class="field-row">
        <div class="field-label">Status</div>
        <div class="field-value">${escapeHtml(user.statusText || user.status)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Email</div>
        <div class="field-value">${escapeHtml(user.email)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Phone</div>
        <div class="field-value">${escapeHtml(user.phone || 'Not provided')}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Bio</div>
        <div class="field-value">${escapeHtml(user.bio || 'No bio available')}</div>
      </div>
    </div>
    <div class="profile-actions">
      <button class="btn-secondary" onclick="closeModal('profile-modal')">Close</button>
      <button class="btn-save" onclick="startChatWithUser(${user.id})">Message</button>
    </div>
  `;
};

window.switchSection = function(section, button) {
  window.setActiveSection(section);
};

window.renderProfile = function() {
  const user = getCurrentUser();
  const container = document.getElementById('profile-content');
  if (!user || !container) return;
  container.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar-wrap">
        <img class="profile-avatar" src="${user.avatar}" alt="${escapeHtml(user.name)}" />
      </div>
      <div class="profile-name">${escapeHtml(user.name)}</div>
      <div class="profile-id">@${escapeHtml(user.username)}</div>
    </div>
    <div class="profile-fields">
      <div class="field-row">
        <label class="field-label" for="profile-name-input">Full name</label>
        <input id="profile-name-input" class="field-input" value="${escapeHtml(user.name)}" />
      </div>
      <div class="field-row">
        <label class="field-label" for="profile-bio-input">Bio</label>
        <input id="profile-bio-input" class="field-input" value="${escapeHtml(user.bio || '')}" />
      </div>
      <div class="field-row">
        <label class="field-label" for="profile-status-input">Status</label>
        <input id="profile-status-input" class="field-input" value="${escapeHtml(user.statusText || '')}" />
      </div>
      <div class="field-row">
        <label class="field-label" for="profile-phone-input">Phone</label>
        <input id="profile-phone-input" class="field-input" value="${escapeHtml(user.phone || '')}" />
      </div>
    </div>
    <div class="profile-actions">
      <button class="btn-secondary" onclick="closeModal('profile-modal')">Close</button>
      <button class="btn-save" onclick="saveProfile()">Save changes</button>
    </div>
  `;
};

window.saveProfile = function() {
  const user = getCurrentUser();
  if (!user) return;
  const name = document.getElementById('profile-name-input')?.value.trim();
  const bio = document.getElementById('profile-bio-input')?.value.trim();
  const statusText = document.getElementById('profile-status-input')?.value.trim();
  const phone = document.getElementById('profile-phone-input')?.value.trim();

  if (!name) return window.showToast('Name cannot be empty', 'error');
  Store.updateUser(user.id, { name, bio, statusText, phone });
  window.showToast('Profile updated', 'success');
  window.renderProfile();
  window.renderConversationArea();
  window.showAppScreen();
};

window.renderInfoPanel = function(convId) {
  const container = document.getElementById('info-content');
  const other = getConversationOther(convId);
  const currentUser = getCurrentUser();
  if (!container || !other || !currentUser) return;
  const blocked = Store.isBlocked(other.id);
  const favorite = Store.isFavorite(other.id);
  container.innerHTML = `
    <div class="profile-hero">
      <div class="profile-avatar-wrap">
        <img class="profile-avatar" src="${other.avatar}" alt="${escapeHtml(other.name)}" />
      </div>
      <div class="profile-name">${escapeHtml(other.name)}</div>
      <div class="profile-id">@${escapeHtml(other.username)}</div>
    </div>
    <div class="profile-fields">
      <div class="field-row">
        <div class="field-label">Status</div>
        <div class="field-value">${escapeHtml(other.statusText || other.status)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Email</div>
        <div class="field-value">${escapeHtml(other.email)}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Phone</div>
        <div class="field-value">${escapeHtml(other.phone || 'Not set')}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Bio</div>
        <div class="field-value">${escapeHtml(other.bio || 'No bio available')}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Favorite</div>
        <div class="field-value">${favorite ? 'Yes' : 'No'}</div>
      </div>
      <div class="field-row">
        <div class="field-label">Blocked</div>
        <div class="field-value">${blocked ? 'Yes' : 'No'}</div>
      </div>
    </div>
  `;
};

window.handleLogout = function() {
  Store.logout();
  window.clearAuthForms();
  window.showAuthScreen();
  window.showToast('You have been signed out', 'success');
};

window.renderCurrentUser = function() {
  const user = getCurrentUser();
  if (!user) return;
  const avatar = document.getElementById('my-avatar');
  const displayName = document.getElementById('my-display-name');
  const idTag = document.getElementById('my-id-tag');
  if (avatar) {
    avatar.src = user.avatar;
    avatar.alt = user.name;
  }
  if (displayName) displayName.textContent = user.name;
  if (idTag) idTag.textContent = `@${user.username}`;
};

window.escapeHtml = function(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// ─────────────────────────────────────────────────────
// ADVANCED MESSAGING FEATURES
// ─────────────────────────────────────────────────────

window.showMessageContextMenu = function(msgId, e) {
  e.stopPropagation();
  const convId = getCurrentConversationId();
  const messages = Store.getMessages(convId);
  const msg = messages.find(m => m.id === msgId);
  if (!msg) return;
  
  const currentUser = getCurrentUser();
  const isSent = msg.from === currentUser.id;
  const isBookmarked = Store.isBookmarked(convId, msgId);
  
  const menu = `
    <div class="context-menu-item" onclick="editMessage('${msgId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      Edit
    </div>
    <div class="context-menu-item" onclick="replyToMessage('${msgId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 5H3M21 19H3M5 13h4V9h6v4h4"/></svg>
      Reply
    </div>
    <div class="context-menu-item" onclick="forwardMessage('${msgId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 4l4 4-4 4M2 12h20"/></svg>
      Forward
    </div>
    <div class="context-menu-item" onclick="toggleBookmark('${convId}', '${msgId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
      ${isBookmarked ? 'Remove bookmark' : 'Bookmark'}
    </div>
    ${isSent ? `<div class="context-menu-item danger" onclick="deleteMessage('${msgId}')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
      Delete
    </div>` : ''}
  `;
  
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu) {
    contextMenu.innerHTML = menu;
    contextMenu.style.display = 'block';
    contextMenu.style.left = e.clientX + 'px';
    contextMenu.style.top = e.clientY + 'px';
    contextMenu.classList.remove('hidden');
    setTimeout(() => {
      document.addEventListener('click', closeContextMenu);
    }, 0);
  }
};

function closeContextMenu() {
  const contextMenu = document.getElementById('context-menu');
  if (contextMenu) {
    contextMenu.classList.add('hidden');
    document.removeEventListener('click', closeContextMenu);
  }
}

window.editMessage = function(msgId) {
  const convId = getCurrentConversationId();
  const messages = Store.getMessages(convId);
  const msg = messages.find(m => m.id === msgId);
  if (!msg) return;
  
  const input = document.getElementById('message-input');
  if (input) {
    input.textContent = msg.text;
    window.appState.editingMessageId = msgId;
    input.focus();
    input.setAttribute('data-editing', msgId);
  }
  closeContextMenu();
};

window.sendMessageWithEdit = function() {
  const editingId = window.appState.editingMessageId;
  const currentUser = getCurrentUser();
  const convId = getCurrentConversationId();
  const input = document.getElementById('message-input');
  
  if (!currentUser || !convId || !input) return;
  
  const text = input.textContent.trim();
  if (!text) return;
  
  if (editingId) {
    Store.editMessage(convId, editingId, text);
    window.appState.editingMessageId = null;
    input.removeAttribute('data-editing');
    window.showToast('Message edited', 'success');
  } else {
    window.sendMessage();
    return;
  }
  
  input.innerHTML = '';
  window.removeAttachment();
  window.renderMessages(convId);
};

window.deleteMessage = function(msgId) {
  const convId = getCurrentConversationId();
  if (!convId || !confirm('Delete this message?')) return;
  
  Store.deleteMessage(convId, msgId);
  window.renderMessages(convId);
  window.showToast('Message deleted', 'success');
  closeContextMenu();
};

window.replyToMessage = function(msgId) {
  const convId = getCurrentConversationId();
  const messages = Store.getMessages(convId);
  const msg = messages.find(m => m.id === msgId);
  if (!msg) return;
  
  const other = getConversationOther(convId);
  const sender = msg.from === Store.getCurrentUser().id ? 'You' : other.name;
  
  window.appState.replyingTo = msgId;
  
  const preview = document.getElementById('message-reply-preview');
  if (preview) {
    document.getElementById('reply-author').textContent = sender;
    document.getElementById('reply-text').textContent = msg.text.substring(0, 100);
    preview.classList.remove('hidden');
  }
  
  const input = document.getElementById('message-input');
  if (input) input.focus();
  
  closeContextMenu();
};

window.cancelReply = function() {
  window.appState.replyingTo = null;
  const preview = document.getElementById('message-reply-preview');
  if (preview) preview.classList.add('hidden');
};

window.forwardMessage = function(msgId) {
  window.appState.forwardingMessageId = msgId;
  window.showToast('Select a conversation to forward this message', 'info');
  closeContextMenu();
};

window.toggleBookmark = function(convId, msgId) {
  const isBookmarked = Store.toggleBookmark(convId, msgId);
  window.showToast(isBookmarked ? 'Message bookmarked' : 'Bookmark removed', 'success');
  closeContextMenu();
};

window.addReactionToMessage = function(msgId, emoji) {
  const convId = getCurrentConversationId();
  const currentUser = getCurrentUser();
  if (!convId || !currentUser) return;
  
  Store.addReaction(convId, msgId, emoji);
  window.renderMessages(convId);
};

window.simulateTypingIndicator = function() {
  const convId = getCurrentConversationId();
  if (!convId) return;
  
  const currentUser = getCurrentUser();
  Store.setTyping(convId, currentUser.id, true);
  
  setTimeout(() => {
    Store.setTyping(convId, currentUser.id, false);
  }, 2000);
};

window.showTypingIndicator = function(userId) {
  const convId = getCurrentConversationId();
  const other = getConversationOther(convId);
  if (!other || userId !== other.id) return;
  
  const indicator = document.getElementById('typing-indicator');
  const avatar = document.getElementById('typing-avatar');
  const text = document.getElementById('typing-text');
  
  if (indicator && avatar && text) {
    avatar.src = other.avatar;
    text.textContent = `${other.name} is typing...`;
    indicator.classList.remove('hidden');
    
    setTimeout(() => {
      indicator.classList.add('hidden');
    }, 3000);
  }
};

window.searchMessages = function(query) {
  const convId = getCurrentConversationId();
  if (!convId) return [];
  
  const messages = Store.getMessages(convId);
  const q = query.toLowerCase();
  return messages.filter(msg => msg.text.toLowerCase().includes(q));
};

// ─────────────────────────────────────────────────────
// GROUP CHAT FEATURES
// ─────────────────────────────────────────────────────

window.openGroupCreation = function() {
  openModal('group-modal');
  window.renderGroupCreation();
};

window.renderGroupCreation = function() {
  const container = document.getElementById('group-content');
  if (!container) return;
  
  const users = Store.searchUsers('');
  const currentUser = getCurrentUser();
  
  container.innerHTML = `
    <div class="form-section">
      <label>Group Name</label>
      <input type="text" id="group-name-input" placeholder="Enter group name" />
    </div>
    <div class="form-section">
      <label>Description</label>
      <textarea id="group-desc-input" placeholder="Optional group description"></textarea>
    </div>
    <div class="form-section">
      <label>Add Members</label>
      <div class="members-list" id="members-list">
        ${users.map(u => `
          <div class="member-item">
            <label>
              <input type="checkbox" value="${u.id}" class="member-checkbox" />
              <span>${escapeHtml(u.name)}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal('group-modal')">Cancel</button>
      <button class="btn-primary" onclick="createNewGroup()">Create Group</button>
    </div>
  `;
};
          <div class="member-item">
            <label>
              <input type="checkbox" value="${u.id}" class="member-checkbox" />
              <span>${escapeHtml(u.name)}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </div>
    <div class="form-actions">
      <button class="btn-secondary" onclick="closeModal('group-modal')">Cancel</button>
      <button class="btn-primary" onclick="createNewGroup()">Create Group</button>
    </div>
  `;
};

window.createNewGroup = function() {
  const currentUser = getCurrentUser();
  if (!currentUser) return;
  
  const name = document.getElementById('group-name-input')?.value.trim();
  const desc = document.getElementById('group-desc-input')?.value.trim();
  
  if (!name) return window.showToast('Group name is required', 'error');
  
  const memberCheckboxes = document.querySelectorAll('.member-checkbox:checked');
  const members = Array.from(memberCheckboxes).map(cb => parseInt(cb.value));
  members.push(currentUser.id);
  
  if (members.length < 2) return window.showToast('Add at least one member', 'error');
  
  const group = Store.createGroupChat(name, members, currentUser.id);
  closeModal('group-modal');
  window.showToast('Group created successfully', 'success');
  window.renderConversationArea();
};

// ─────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────

window.showNotification = function(title, options = {}) {
  const container = document.getElementById('notifications-list');
  if (!container) return;
  
  const notification = document.createElement('div');
  notification.className = 'notification-item';
  notification.innerHTML = `
    <div class="notification-title">${title}</div>
    ${options.message ? `<div class="notification-message">${options.message}</div>` : ''}
  `;
  
  container.insertBefore(notification, container.firstChild);
  
  setTimeout(() => {
    notification.remove();
  }, 5000);
};

window.openNotifications = function() {
  const panel = document.getElementById('notifications-panel');
  if (panel) panel.classList.toggle('hidden');
};

window.closeNotifications = function() {
  const panel = document.getElementById('notifications-panel');
  if (panel) panel.classList.add('hidden');
};

window.openModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('hidden');
};

window.closeModal = function(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('hidden');
};
