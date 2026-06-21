/* ═══════════════════════════════════════════════════
   NEXUSCHAT — STORE.JS
   In-memory data store + localStorage persistence
   Simulates a backend with realistic demo data
═══════════════════════════════════════════════════ */

const Store = (() => {
  'use strict';

  // ── Avatar helper: generate gradient avatars ──────
  function makeAvatar(name, color1, color2) {
    const c = document.createElement('canvas');
    c.width = 100; c.height = 100;
    const ctx = c.getContext('2d');
    const gr = ctx.createLinearGradient(0, 0, 100, 100);
    gr.addColorStop(0, color1); gr.addColorStop(1, color2);
    ctx.fillStyle = gr;
    ctx.beginPath(); ctx.arc(50, 50, 50, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = 'white';
    ctx.font = 'bold 36px Syne, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(name.charAt(0).toUpperCase(), 50, 51);
    return c.toDataURL();
  }

  // ── Initial demo user data ─────────────────────────
  const DEMO_USERS = [
    {
      id: 1001, username: 'alex', name: 'Alex Morgan',
      email: 'alex@nexus.io', passwordHash: '',
      avatarColor: ['#6C63FF','#3ECF8E'],
      bio: 'Product designer & coffee enthusiast ☕', status: 'online',
      statusText: 'Available', phone: '+1 (555) 001-0001',
      lastSeen: Date.now(), joinedAt: Date.now() - 86400000 * 30,
      settings: { notifications: true, readReceipts: true, typing: true, darkMode: true }
    },
    {
      id: 1002, username: 'sarah', name: 'Sarah Chen',
      email: 'sarah@nexus.io', passwordHash: '',
      avatarColor: ['#FF6B9D','#C44DFF'],
      bio: 'Software engineer | Open source lover 🛠️', status: 'online',
      statusText: 'Coding away...', phone: '+1 (555) 002-0002',
      lastSeen: Date.now(), joinedAt: Date.now() - 86400000 * 25,
      settings: { notifications: true, readReceipts: true, typing: true, darkMode: true }
    },
    {
      id: 1003, username: 'john', name: 'John Reeves',
      email: 'john@nexus.io', passwordHash: '',
      avatarColor: ['#FF9A3C','#FF6B3C'],
      bio: 'Founder @ StartupXYZ | Building the future 🚀', status: 'away',
      statusText: 'In a meeting', phone: '+1 (555) 003-0003',
      lastSeen: Date.now() - 1800000, joinedAt: Date.now() - 86400000 * 20,
      settings: { notifications: false, readReceipts: true, typing: true, darkMode: false }
    },
    {
      id: 1004, username: 'emma', name: 'Emma Wilson',
      email: 'emma@nexus.io', passwordHash: '',
      avatarColor: ['#3ECFCF','#3E8ECF'],
      bio: 'UX researcher | Making things simpler 🎨', status: 'offline',
      statusText: 'Last seen 2h ago', phone: '+1 (555) 004-0004',
      lastSeen: Date.now() - 7200000, joinedAt: Date.now() - 86400000 * 15,
      settings: { notifications: true, readReceipts: false, typing: true, darkMode: true }
    }
  ];

  const DEMO_MESSAGES = {
    // Alex <-> Sarah
    'conv_1001_1002': [
      { id: 'm1', from: 1002, to: 1001, text: 'Hey! Did you finish the new design mockups?', ts: Date.now() - 86400000, read: true, reactions: [] },
      { id: 'm2', from: 1001, to: 1002, text: 'Almost! Just tweaking the typography on the dashboard. The glassmorphism effect looks really clean 🎨', ts: Date.now() - 86400000 + 60000, read: true, reactions: [{emoji:'🔥', users:[1002]}] },
      { id: 'm3', from: 1002, to: 1001, text: 'Can\'t wait to see it! Also the client loved our last iteration', ts: Date.now() - 86400000 + 120000, read: true, reactions: [] },
      { id: 'm4', from: 1001, to: 1002, text: 'That\'s great news 🎉 I\'ll send the files over tonight', ts: Date.now() - 3600000, read: true, reactions: [{emoji:'❤️', users:[1002]}] },
      { id: 'm5', from: 1002, to: 1001, text: 'Perfect! Also are you coming to the team lunch tomorrow?', ts: Date.now() - 1800000, read: false, reactions: [] },
    ],
    // Alex <-> John
    'conv_1001_1003': [
      { id: 'm10', from: 1003, to: 1001, text: 'Hey Alex, I need some design help for the pitch deck', ts: Date.now() - 172800000, read: true, reactions: [] },
      { id: 'm11', from: 1001, to: 1003, text: 'Sure! What\'s the timeline?', ts: Date.now() - 172800000 + 300000, read: true, reactions: [] },
      { id: 'm12', from: 1003, to: 1001, text: 'We\'re presenting to investors next Thursday. 12 slides, focusing on market opportunity and traction', ts: Date.now() - 172800000 + 600000, read: true, reactions: [] },
      { id: 'm13', from: 1001, to: 1003, text: 'I can do that. Send me the content and I\'ll have a draft by Monday 💪', ts: Date.now() - 86400000, read: true, reactions: [{emoji:'🙌', users:[1003]}] },
      { id: 'm14', from: 1003, to: 1001, text: 'You\'re a lifesaver! Sending content now', ts: Date.now() - 86400000 + 180000, read: true, reactions: [] },
    ],
    // Alex <-> Emma
    'conv_1001_1004': [
      { id: 'm20', from: 1004, to: 1001, text: 'Hi! Saw your work on Dribbble — absolutely stunning!', ts: Date.now() - 259200000, read: true, reactions: [] },
      { id: 'm21', from: 1001, to: 1004, text: 'Thank you so much Emma! I love your UX research articles too 😊', ts: Date.now() - 259200000 + 900000, read: true, reactions: [] },
      { id: 'm22', from: 1004, to: 1001, text: 'We should collaborate sometime. I\'m working on a fintech app and could use a designer with your eye', ts: Date.now() - 172800000, read: true, reactions: [{emoji:'💡', users:[1001]}] },
      { id: 'm23', from: 1001, to: 1004, text: 'That sounds amazing! DM me the details', ts: Date.now() - 86400000, read: true, reactions: [] },
    ],
    // Sarah <-> John
    'conv_1002_1003': [
      { id: 'm30', from: 1002, to: 1003, text: 'John, the API endpoints are ready for testing', ts: Date.now() - 43200000, read: true, reactions: [] },
      { id: 'm31', from: 1003, to: 1002, text: 'Amazing! Our backend team will start integration today', ts: Date.now() - 43200000 + 1800000, read: true, reactions: [{emoji:'🚀', users:[1002]}] },
      { id: 'm32', from: 1002, to: 1003, text: 'I\'ve documented everything in Notion. Auth uses JWT with 1hr expiry', ts: Date.now() - 21600000, read: true, reactions: [] },
    ],
  };

  // ── State ──────────────────────────────────────────
  let state = {
    users: [],
    messages: {},
    currentUser: null,
    sessionToken: null,
    activeConversationId: null,
    typingTimers: {},
    csrfToken: NexusCrypto.generateCSRFToken(),
  };

  // ── Init ───────────────────────────────────────────
  async function init() {
    // Load or seed users
    let storedUsers = _load('nexus_users');
    if (!storedUsers || storedUsers.length === 0) {
      // Seed demo users with hashed passwords
      const seeded = [];
      for (const u of DEMO_USERS) {
        const hash = await NexusCrypto.hashPassword('demo1234');
        // Generate avatar
        const avatar = makeAvatar(u.name, u.avatarColor[0], u.avatarColor[1]);
        seeded.push({ ...u, passwordHash: hash, avatar });
      }
      _save('nexus_users', seeded);
      storedUsers = seeded;
    } else {
      // Ensure avatars exist for demo users
      for (const u of storedUsers) {
        if (!u.avatar) {
          const dc = DEMO_USERS.find(d => d.id === u.id);
          if (dc) u.avatar = makeAvatar(u.name, dc.avatarColor[0], dc.avatarColor[1]);
        }
      }
      _save('nexus_users', storedUsers);
    }
    state.users = storedUsers;

    // Load messages
    let storedMsgs = _load('nexus_messages');
    if (!storedMsgs) {
      storedMsgs = DEMO_MESSAGES;
      _save('nexus_messages', storedMsgs);
    }
    state.messages = storedMsgs;

    // Restore session
    const session = _load('nexus_session');
    if (session && session.token && session.userId) {
      const user = getUserById(session.userId);
      if (user) {
        state.currentUser = user;
        state.sessionToken = session.token;
        return true; // auto-login
      }
    }
    return false;
  }

  // ── Auth ───────────────────────────────────────────
  async function login(email, password) {
    const emailClean = NexusCrypto.sanitizeInput(email.trim().toLowerCase());
    if (!NexusCrypto.validateEmail(emailClean)) throw new Error('Invalid email format');
    const user = state.users.find(u => u.email.toLowerCase() === emailClean);
    if (!user) throw new Error('No account found with this email');
    const valid = await NexusCrypto.verifyPassword(password, user.passwordHash);
    if (!valid) throw new Error('Incorrect password');
    // Create session
    state.currentUser = user;
    state.sessionToken = NexusCrypto.generateSessionToken();
    user.status = 'online';
    user.lastSeen = Date.now();
    _save('nexus_session', { token: state.sessionToken, userId: user.id, created: Date.now() });
    _save('nexus_users', state.users);
    return user;
  }

  async function register(name, username, email, password) {
    const nameClean = NexusCrypto.sanitizeInput(name.trim());
    const usernameClean = NexusCrypto.sanitizeKey(username.trim().toLowerCase());
    const emailClean = NexusCrypto.sanitizeInput(email.trim().toLowerCase());
    if (!nameClean || nameClean.length < 2) throw new Error('Name must be at least 2 characters');
    if (!usernameClean || usernameClean.length < 3) throw new Error('Username must be at least 3 characters');
    if (!NexusCrypto.validateEmail(emailClean)) throw new Error('Invalid email address');
    if (password.length < 8) throw new Error('Password must be at least 8 characters');
    if (state.users.find(u => u.email.toLowerCase() === emailClean)) throw new Error('An account with this email already exists');
    if (state.users.find(u => u.username.toLowerCase() === usernameClean)) throw new Error('Username is already taken');
    // Generate ID
    const id = Math.max(...state.users.map(u => u.id), 1004) + 1;
    const hash = await NexusCrypto.hashPassword(password);
    const colors = [['#6C63FF','#3ECF8E'],['#FF6B9D','#C44DFF'],['#FF9A3C','#FF6B3C'],['#3ECFCF','#3E8ECF']];
    const clr = colors[Math.floor(Math.random() * colors.length)];
    const avatar = makeAvatar(nameClean, clr[0], clr[1]);
    const newUser = {
      id, username: usernameClean, name: nameClean, email: emailClean,
      passwordHash: hash, avatar, avatarColor: clr,
      bio: '', status: 'online', statusText: 'Hey there! I\'m on NexusChat',
      phone: '', lastSeen: Date.now(), joinedAt: Date.now(),
      settings: { notifications: true, readReceipts: true, typing: true, darkMode: true }
    };
    state.users.push(newUser);
    _save('nexus_users', state.users);
    // Auto-login
    state.currentUser = newUser;
    state.sessionToken = NexusCrypto.generateSessionToken();
    _save('nexus_session', { token: state.sessionToken, userId: id, created: Date.now() });
    return newUser;
  }

  function logout() {
    if (state.currentUser) {
      state.currentUser.status = 'offline';
      state.currentUser.lastSeen = Date.now();
      _save('nexus_users', state.users);
    }
    state.currentUser = null;
    state.sessionToken = null;
    state.activeConversationId = null;
    localStorage.removeItem('nexus_session');
  }

  // ── Users ──────────────────────────────────────────
  function getCurrentUser() { return state.currentUser; }
  function getUserById(id) { return state.users.find(u => u.id === id) || null; }
  function getUserByUsername(username) { return state.users.find(u => u.username.toLowerCase() === username.toLowerCase()) || null; }
  function searchUsers(query) {
    const q = NexusCrypto.sanitizeInput(query.trim().toLowerCase());
    if (!q) {
      return state.users.filter(u => u.id !== state.currentUser?.id);
    }
    return state.users.filter(u => {
      if (u.id === state.currentUser?.id) return false;
      return u.name.toLowerCase().includes(q) ||
             u.username.toLowerCase().includes(q) ||
             String(u.id).includes(q) ||
             u.email.toLowerCase().includes(q);
    });
  }
  function updateUser(id, data) {
    const user = getUserById(id);
    if (!user) throw new Error('User not found');
    const allowed = ['name','bio','statusText','phone','avatar','settings','status'];
    for (const k of allowed) {
      if (data[k] !== undefined) user[k] = data[k];
    }
    if (data.name && data.name !== user.name) {
      // Regenerate avatar if name changed and no custom avatar set
      const dc = DEMO_USERS.find(d => d.id === id);
      const clr = dc ? dc.avatarColor : user.avatarColor || ['#6C63FF','#3ECF8E'];
      if (!data.avatar) user.avatar = makeAvatar(data.name, clr[0], clr[1]);
    }
    _save('nexus_users', state.users);
    return user;
  }

  // ── Conversations ──────────────────────────────────
  function getConvId(uid1, uid2) {
    return uid1 < uid2 ? `conv_${uid1}_${uid2}` : `conv_${uid2}_${uid1}`;
  }

  function getConversations(userId) {
    // Find all convs involving this user
    const convs = [];
    for (const [convId, msgs] of Object.entries(state.messages)) {
      if (!convId.includes(String(userId))) continue;
      if (!msgs.length) continue;
      const parts = convId.replace('conv_', '').split('_');
      const otherId = parseInt(parts.find(p => parseInt(p) !== userId));
      const other = getUserById(otherId);
      if (!other) continue;
      const last = msgs[msgs.length - 1];
      const unread = msgs.filter(m => m.to === userId && !m.read).length;
      convs.push({
        id: convId, otherId, other, lastMsg: last, unread,
        pinned: _getPinned().includes(convId),
        archived: _getArchived().includes(convId),
        muted: _getMuted().includes(convId),
      });
    }
    // Sort: pinned first, then by last message time
    return convs.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.lastMsg?.ts || 0) - (a.lastMsg?.ts || 0);
    });
  }

  function getMessages(convId) {
    return state.messages[convId] || [];
  }

  function addMessage(convId, msg) {
    if (!state.messages[convId]) state.messages[convId] = [];
    const fullMsg = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2,6),
      ...msg,
      ts: Date.now(),
      read: false,
      reactions: [],
      edited: false,
    };
    state.messages[convId].push(fullMsg);
    _save('nexus_messages', state.messages);
    return fullMsg;
  }

  function editMessage(convId, msgId, newText) {
    const msgs = state.messages[convId];
    if (!msgs) return null;
    const msg = msgs.find(m => m.id === msgId);
    if (!msg) return null;
    msg.text = NexusCrypto.sanitizeInput(newText);
    msg.edited = true;
    msg.editedAt = Date.now();
    _save('nexus_messages', state.messages);
    return msg;
  }

  function deleteMessage(convId, msgId) {
    const msgs = state.messages[convId];
    if (!msgs) return false;
    const idx = msgs.findIndex(m => m.id === msgId);
    if (idx === -1) return false;
    msgs[idx] = { ...msgs[idx], deleted: true, text: 'This message was deleted', image: null };
    _save('nexus_messages', state.messages);
    return true;
  }

  function markRead(convId, userId) {
    const msgs = state.messages[convId];
    if (!msgs) return;
    msgs.forEach(m => { if (m.to === userId && !m.read) m.read = true; });
    _save('nexus_messages', state.messages);
  }

  function addReaction(convId, msgId, emoji, userId) {
    const msgs = state.messages[convId];
    if (!msgs) return null;
    const msg = msgs.find(m => m.id === msgId);
    if (!msg) return null;
    if (!msg.reactions) msg.reactions = [];
    const existing = msg.reactions.find(r => r.emoji === emoji);
    if (existing) {
      if (existing.users.includes(userId)) {
        existing.users = existing.users.filter(u => u !== userId);
        if (existing.users.length === 0) msg.reactions = msg.reactions.filter(r => r.emoji !== emoji);
      } else {
        existing.users.push(userId);
      }
    } else {
      msg.reactions.push({ emoji, users: [userId] });
    }
    _save('nexus_messages', state.messages);
    return msg;
  }

  function clearMessages(convId) {
    state.messages[convId] = [];
    _save('nexus_messages', state.messages);
  }

  // ── Pin / Archive / Mute ───────────────────────────
  function _getPinned()   { return _load('nexus_pinned')   || []; }
  function _getArchived() { return _load('nexus_archived') || []; }
  function _getMuted()    { return _load('nexus_muted')    || []; }

  function togglePin(convId) {
    let pinned = _getPinned();
    pinned = pinned.includes(convId) ? pinned.filter(c => c !== convId) : [...pinned, convId];
    _save('nexus_pinned', pinned);
  }
  function toggleArchive(convId) {
    let archived = _getArchived();
    archived = archived.includes(convId) ? archived.filter(c => c !== convId) : [...archived, convId];
    _save('nexus_archived', archived);
  }
  function toggleMute(convId) {
    let muted = _getMuted();
    muted = muted.includes(convId) ? muted.filter(c => c !== convId) : [...muted, convId];
    _save('nexus_muted', muted);
  }

  // ── Blocked users ──────────────────────────────────
  function getBlocked() { return _load('nexus_blocked') || []; }
  function toggleBlock(userId) {
    let blocked = getBlocked();
    blocked = blocked.includes(userId) ? blocked.filter(u => u !== userId) : [...blocked, userId];
    _save('nexus_blocked', blocked);
    return blocked.includes(userId);
  }
  function isBlocked(userId) { return getBlocked().includes(userId); }

  // ── Favorites ──────────────────────────────────────
  function getFavorites() { return _load('nexus_favorites') || []; }
  function toggleFavorite(userId) {
    let favs = getFavorites();
    favs = favs.includes(userId) ? favs.filter(u => u !== userId) : [...favs, userId];
    _save('nexus_favorites', favs);
    return favs.includes(userId);
  }
  function isFavorite(userId) { return getFavorites().includes(userId); }

  // ── Helpers ────────────────────────────────────────
  function _save(key, data) {
    try { localStorage.setItem(key, JSON.stringify(data)); } catch(e) { console.warn('Storage full'); }
  }
  function _load(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function formatTime(ts) {
    const d = new Date(ts), now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / 86400000);
    if (diffDays === 0) return d.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([],{weekday:'short'});
    return d.toLocaleDateString([],{month:'short',day:'numeric'});
  }

  function formatFullTime(ts) {
    return new Date(ts).toLocaleString([], {weekday:'short',month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
  }

  function formatDateSep(ts) {
    const d = new Date(ts), now = new Date();
    const diffDays = Math.floor((now - d) / 86400000);
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return d.toLocaleDateString([],{weekday:'long'});
    return d.toLocaleDateString([],{month:'long',day:'numeric',year:'numeric'});
  }

  function getConvId_public(uid1, uid2) { return getConvId(uid1, uid2); }

  // ── Active conversation tracking ───────────────────
  function setActiveConv(convId) { state.activeConversationId = convId; }
  function getActiveConv() { return state.activeConversationId; }

  return {
    init, login, register, logout,
    getCurrentUser, getUserById, getUserByUsername, searchUsers, updateUser,
    getConversations, getConvId: getConvId_public,
    getMessages, addMessage, editMessage, deleteMessage, markRead,
    addReaction, clearMessages,
    togglePin, toggleArchive, toggleMute,
    getBlocked, toggleBlock, isBlocked,
    getFavorites, toggleFavorite, isFavorite,
    formatTime, formatFullTime, formatDateSep,
    setActiveConv, getActiveConv,
  };
})();
