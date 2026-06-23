# NexusChat - Advanced Real-Time Chat Application

A production-level, modern chat application built with vanilla HTML, CSS, and JavaScript. No frameworks, no backend required—everything runs in the browser with localStorage persistence.

## 🎯 Features

### 📱 Core Messaging
- **Send/Receive Messages** - Real-time text messaging with timestamps
- **Message Status** - Sent, delivered, and read receipt tracking
- **Message Editing** - Edit sent messages with "edited" label
- **Message Deletion** - Delete messages for yourself or everyone (with time limit UI)
- **Message Reactions** - React to messages with emojis
- **Reply to Messages** - Quote and reply to specific messages (threaded UI)
- **Forward Messages** - Share messages across conversations
- **Pin Messages** - Important messages pinned in chat
- **Bookmark Messages** - Star/bookmark important messages for later
- **Message Search** - Search messages within conversations
- **Message Attachments** - Share images and files with preview

### 💬 Conversation Features
- **Create Conversations** - Start new one-on-one chats
- **Conversation List** - View all active conversations sorted by latest
- **Archive Conversations** - Move conversations to archive
- **Pin Conversations** - Pin favorites at the top
- **Mute Conversations** - Silence notifications for specific chats
- **Conversation Search** - Search by name, username, email, or message content
- **Unread Badges** - Visual indicators for unread messages
- **Last Message Preview** - See the last message in each conversation
- **Conversation Filtering** - Filter by all, archived, pinned, or unread

### 👥 Group Chat System
- **Create Groups** - Start group conversations with multiple members
- **Add/Remove Members** - Manage group participants
- **Group Descriptions** - Add context about the group
- **Group Avatars** - Custom group identifiers
- **Admin Controls** - Creator acts as group admin
- **Member Management** - View and manage group roster

### 👤 User Profiles
- **View Profiles** - See user information and status
- **Edit Profile** - Update name, bio, status, phone, avatar
- **Online Status** - See who's online, away, or offline with status text
- **Last Seen** - Track when users were last active
- **Auto-generated Avatars** - Gradient-based avatar generation
- **Contact Info** - Email, phone, and bio display
- **Favorites** - Mark users as favorites for quick access
- **Block Users** - Block specific users from contacting you

### 🎨 Real-Time UI Behaviors (Simulated)
- **Typing Indicators** - "User is typing..." notifications
- **Online Status Updates** - Live online/away/offline status changes
- **Auto-scroll** - Automatically scroll to latest messages
- **Smooth Animations** - Polished transitions and message animations
- **Live Message Updates** - See reactions and edits in real-time
- **Presence Simulation** - Other users' status changes simulate real activity

### 🎬 Voice & Video
- **Voice Calls** - UI for initiating voice calls (simulated)
- **Video Calls** - UI for initiating video calls (simulated)
- **Voice Messages** - Record and send voice messages (UI)
- **Call Overlays** - Professional call interface with controls

### 🔔 Notifications
- **Toast Notifications** - Success, error, and info toasts
- **In-App Notification Panel** - Dedicated notifications area
- **Unread Counters** - See unread message counts
- **Notification Types** - New messages, profile updates, system events

### ⚙️ Settings & Personalization
- **Dark/Light Theme** - Toggle between themes (persisted)
- **Notification Settings** - Enable/disable message alerts
- **Read Receipts** - Choose whether others see when you read messages
- **Typing Indicators** - Toggle typing status visibility
- **Theme Persistence** - Settings saved across sessions

### 🔐 Security (Frontend)
- **Password Hashing** - Client-side PBKDF2 password hashing
- **Password Strength Indicator** - Real-time strength feedback
- **Password Visibility Toggle** - Show/hide password while typing
- **Session Persistence** - Secure session storage in localStorage
- **Input Sanitization** - XSS protection and HTML escaping
- **CSRF Token Simulation** - CSRF protection layer

### 🎨 UI/UX Excellence
- **Glassmorphism Design** - Modern frosted glass effect
- **Responsive Layout** - Perfect on mobile, tablet, and desktop
- **Smooth Animations** - Polished transitions (300+ lines of CSS animations)
- **Dark/Light Modes** - Complete theme support
- **Emoji Picker** - 4 categories: smileys, gestures, objects, symbols
- **Context Menus** - Right-click message options
- **Modal Dialogs** - Beautiful modals for settings, profiles, groups
- **Sidebar Layout** - WhatsApp/Telegram-style interface
- **Chat Info Panel** - Detailed conversation information
- **Search UI** - Find people and start conversations
- **Empty States** - Helpful guidance when no data available

### 📱 File & Media Features
- **File Upload** - Attach images, documents, etc.
- **Drag & Drop** - Drop files directly into chat
- **Image Preview** - See images before sending
- **File Attachment UI** - Clean attachment display
- **Media Gallery** - View shared files

## 🏗️ Architecture

### File Structure
```
NexusChat/
├── index.html        - HTML structure & UI markup
├── style.css         - Comprehensive styling & animations
├── app.js            - Application initialization & real-time simulation
├── auth.js           - Authentication & login handlers
├── chat.js           - Messaging & conversation logic (650+ lines)
├── ui.js             - UI helpers & modal management
├── store.js          - Data store & localStorage persistence
├── crypto.js         - Cryptography & security utilities
└── README.md         - This file
```

### Tech Stack
- **HTML5** - Semantic markup
- **CSS3** - Flexbox, Grid, glassmorphism, animations
- **Vanilla JavaScript** - No frameworks, pure JS (~2000+ lines)
- **Web Crypto API** - Password hashing & encryption
- **localStorage** - Persistent data storage

### Data Management
All data is stored in localStorage with the following keys:
- `nexus_users` - User profiles and credentials
- `nexus_messages` - All messages grouped by conversation
- `nexus_session` - Current user session
- `nexus_pinned` - Pinned conversations
- `nexus_archived` - Archived conversations
- `nexus_muted` - Muted conversations
- `nexus_blocked` - Blocked users
- `nexus_favorites` - Favorite users
- `nexus_bookmarks` - Bookmarked messages
- `nexus_groups` - Group chat data
- `nexus_theme` - Theme preference
- `nexus_typing_*` - Typing status per conversation

## 🚀 Getting Started

### Installation
1. Clone or download the repository
2. Open `index.html` in a modern web browser
3. That's it! No build process, no server needed

### Demo Credentials
```
Email: alex@nexus.io
Password: demo1234
```

Other demo users available: sarah@nexus.io, john@nexus.io, emma@nexus.io

### Browser Support
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Any browser supporting ES6+ and Web Crypto API

## 📚 Usage Guide

### Getting Started
1. **Sign In/Register** - Create an account or use demo credentials
2. **Find Contacts** - Use the search icon to find people
3. **Start Chatting** - Click "Start Chat" to begin a conversation
4. **Send Messages** - Type your message and press Enter or click Send
5. **Personalize** - Adjust settings and theme preferences

### Advanced Features

#### Message Operations
- **Reply**: Right-click message → "Reply" or use reply UI
- **Edit**: Right-click message → "Edit" to modify
- **Delete**: Right-click message → "Delete"
- **React**: Click reaction pills to add emojis
- **Bookmark**: Right-click message → "Bookmark"
- **Forward**: Right-click message → "Forward" (to other chats)

#### Conversation Management
- **Archive**: Chat menu → "Archive" (hide from main list)
- **Pin**: Chat menu → "Pin" (appear at top)
- **Mute**: Chat menu → "Mute" (disable notifications)
- **Block**: Chat menu → "Block user" (prevent future contact)
- **Clear**: Chat menu → "Clear chat" (delete all messages)

#### Profile
- **Edit**: Settings → Update profile information
- **Status**: Set custom status text
- **Avatar**: Auto-generated gradient avatar
- **Bio**: Add personal bio
- **Phone**: Add contact number

#### Appearance
- **Theme**: Click theme toggle (sun/moon icon)
- **Settings**: Customize notifications, read receipts, typing indicators
- **Sidebar**: Access profiles, settings, search from header

#### Group Chats
- **Create Group**: Use "Create Group" button
- **Add Members**: Select users to invite
- **Manage**: View members in chat info panel
- **Notifications**: Mute group notifications if needed

## 🛠️ Development

### Project Structure Notes

**`store.js`** (600+ lines)
- Data persistence layer
- User management
- Message operations (edit, delete, react, bookmark)
- Conversation state management
- Group chat support
- Typing indicators
- Online status management

**`chat.js`** (650+ lines)
- Message rendering and display
- Advanced messaging features
- User search and discovery
- Conversation list rendering
- Profile management
- Settings UI
- Group creation
- Notifications system

**`app.js`** (100+ lines)
- App initialization
- Real-time simulation (status changes every 5s)
- Drag & drop file handling
- Event listener setup
- App lifecycle management

**`auth.js`** (100+ lines)
- Login/registration handlers
- Password strength validation
- Form validation
- Session management

**`ui.js`** (80+ lines)
- Modal management
- Theme toggling
- Toast notifications
- Element visibility helpers
- Conversation filtering

**`crypto.js`** (150+ lines)
- PBKDF2 password hashing
- AES-GCM message encryption
- Input sanitization
- Email validation
- CSRF token generation

### Adding New Features

To add new features, follow the modular pattern:

1. **Add data structure** in `store.js`
2. **Add UI rendering** in `chat.js`
3. **Add styles** in `style.css`
4. **Add event handlers** in relevant JS files
5. **Update HTML** with new elements if needed

Example: Adding a new setting
```javascript
// 1. Store: Add getter/setter
function getSetting(key) { return _load(`nexus_setting_${key}`); }
function setSetting(key, value) { _save(`nexus_setting_${key}`, value); }

// 2. Chat: Add UI
const setting = getSetting('myFeature');
renderSettingsUI(setting);

// 3. CSS: Style it
.feature-checkbox { /* styles */ }

// 4. HTML: Add element
<input type="checkbox" id="feature-checkbox" />
```

## 🎨 Customization

### Theme Variables
Edit the CSS variables in `style.css` `:root`:
```css
:root {
  --accent: #6C63FF;           /* Primary color */
  --accent-2: #3ECF8E;         /* Secondary color */
  --danger: #FF5A5F;           /* Error color */
  --bg: #0F0F14;               /* Background */
  --text: #EEEEF5;             /* Text color */
}
```

### Colors & Branding
All brand colors are in the CSS design tokens - change them once, applies everywhere

### Fonts
- Display font: `Syne` (headers, buttons)
- Body font: `DM Sans` (text, messages)
- Loaded from Google Fonts

## 📊 Stats

- **Total Lines of Code**: 2000+
- **Features Implemented**: 50+
- **CSS Animations**: 15+
- **Supported Message Types**: Text, images, files, reactions, replies, forwards
- **Demo Users**: 4 pre-configured accounts
- **Responsive Breakpoints**: 3 (desktop, tablet, mobile)
- **LocalStorage Keys**: 12+
- **Time Zones**: UTC (extensible)

## 🔄 Real-Time Simulation

The app simulates real-time behavior without a backend:

- **Status Changes**: Every 5 seconds, other users' online status changes
- **Typing Indicators**: Shown for 3 seconds when receiving messages
- **Message Status**: Automatically marked as delivered/read
- **Time Updates**: Last seen and message times update in real-time
- **Presence Simulation**: Creates natural-feeling chat experience

## 📱 Responsive Design

- **Desktop** (1024px+): Full sidebar + chat + info panel
- **Tablet** (768px-1024px): Adjusted layout, collapsible sidebar
- **Mobile** (480px-768px): Stack layout, simplified UI
- **Small Mobile** (<480px): Optimized for small screens

## 🔒 Security Features

### Client-Side Security
- ✅ PBKDF2 password hashing (100,000 iterations)
- ✅ AES-GCM message encryption
- ✅ XSS protection (HTML escaping)
- ✅ CSRF token simulation
- ✅ Input sanitization
- ✅ Email validation
- ✅ Password strength validation (0-5 score)
- ✅ Secure session handling

### Data Privacy
- All data stored locally (no server)
- No external API calls
- No analytics tracking
- No cookies (uses localStorage only)
- Can be used completely offline (after initial load)

## 🎯 Future Enhancements

Potential features for future versions:
- Backend integration (Node.js + Database)
- Real WebSocket support
- End-to-end encryption
- User authentication with JWT
- Message history export
- Media upload to cloud storage
- Voice/video call implementation
- Message search with filters
- Custom themes
- Sticker/GIF support
- Message reactions customization
- Read-only channels
- User roles & permissions
- Message scheduling
- Auto-responders
- Contact cards

## 🐛 Known Limitations

- All data is lost when localStorage is cleared
- No actual voice/video calls (UI only)
- File uploads are base64 encoded (not ideal for large files)
- No real backend synchronization
- No mobile app version
- Simulated real-time (doesn't sync across tabs)
- No calendar integration

## 💡 Tips

1. **Test Multi-User**: Open app in multiple browser windows to see realistic conversations
2. **Try All Features**: Right-click messages to see advanced options
3. **Export Data**: Open DevTools → Application → LocalStorage to backup data
4. **Keyboard Shortcuts**: Shift+Enter for new line, Escape to close modals
5. **Status Simulation**: Refresh the page to see demo users with different statuses

## 📄 License

This is a demonstration project. Feel free to use, modify, and build upon it.

## 🙏 Credits

Built as an advanced chat application showcase with modern web technologies and best practices.

---

**NexusChat** - Connect Instantly, Securely, and Beautifully.
