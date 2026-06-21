/* ═══════════════════════════════════════════════════
   NEXUSCHAT — CRYPTO.JS
   Client-side encryption utilities using Web Crypto API
═══════════════════════════════════════════════════ */

const NexusCrypto = (() => {
  'use strict';

  // ── Password hashing using PBKDF2 ──────────────────
  async function hashPassword(password) {
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    const hashArr = Array.from(new Uint8Array(hashBuffer));
    const saltArr = Array.from(salt);
    const hashHex = hashArr.map(b => b.toString(16).padStart(2,'0')).join('');
    const saltHex = saltArr.map(b => b.toString(16).padStart(2,'0')).join('');
    return `${saltHex}:${hashHex}`;
  }

  async function verifyPassword(password, stored) {
    const [saltHex, storedHash] = stored.split(':');
    const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const enc = new TextEncoder();
    const keyMaterial = await crypto.subtle.importKey(
      'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
    );
    const hashBuffer = await crypto.subtle.deriveBits(
      { name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' },
      keyMaterial, 256
    );
    const hashArr = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArr.map(b => b.toString(16).padStart(2,'0')).join('');
    return hashHex === storedHash;
  }

  // ── AES-GCM message encryption ─────────────────────
  async function generateKey() {
    return crypto.subtle.generateKey(
      { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
    );
  }

  async function exportKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return btoa(String.fromCharCode(...new Uint8Array(raw)));
  }

  async function importKey(b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    return crypto.subtle.importKey('raw', raw, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }

  async function encryptMessage(text, key) {
    const enc = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, key, enc.encode(text)
    );
    const combined = new Uint8Array(iv.length + ciphertext.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(ciphertext), iv.length);
    return btoa(String.fromCharCode(...combined));
  }

  async function decryptMessage(b64, key) {
    try {
      const data = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const iv = data.slice(0, 12);
      const ciphertext = data.slice(12);
      const plainBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv }, key, ciphertext
      );
      return new TextDecoder().decode(plainBuffer);
    } catch {
      return '[Encrypted message]';
    }
  }

  // ── CSRF token generation ──────────────────────────
  function generateCSRFToken() {
    const arr = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(arr).map(b => b.toString(16).padStart(2,'0')).join('');
  }

  // ── Input sanitization (XSS prevention) ───────────
  function sanitizeInput(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function sanitizeHTML(html) {
    // Allow only safe tags
    const allowed = ['b','i','em','strong','br'];
    const temp = document.createElement('div');
    temp.innerHTML = html;
    // Remove all script tags and event attributes
    temp.querySelectorAll('script,[onclick],[onerror],[onload]').forEach(el => el.remove());
    temp.querySelectorAll('*').forEach(el => {
      if (!allowed.includes(el.tagName.toLowerCase())) {
        el.replaceWith(document.createTextNode(el.textContent));
      }
      [...el.attributes].forEach(attr => {
        if (attr.name.startsWith('on')) el.removeAttribute(attr.name);
        if (attr.name === 'href' && !attr.value.startsWith('#') && !attr.value.startsWith('https://')) {
          el.removeAttribute(attr.name);
        }
      });
    });
    return temp.innerHTML;
  }

  // ── SQL injection prevention (for local storage keys) ──
  function sanitizeKey(str) {
    return str.replace(/[^a-zA-Z0-9_\-@.]/g, '');
  }

  // ── Session token ──────────────────────────────────
  function generateSessionToken() {
    const arr = crypto.getRandomValues(new Uint8Array(48));
    return btoa(String.fromCharCode(...arr)).replace(/[+/=]/g, c => ({'+':'-','/':'_','=':''}[c]));
  }

  // ── Validate email ──────────────────────────────────
  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // ── Validate password strength ──────────────────────
  function passwordStrength(pw) {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score; // 0-5
  }

  return {
    hashPassword, verifyPassword,
    generateKey, exportKey, importKey,
    encryptMessage, decryptMessage,
    generateCSRFToken, generateSessionToken,
    sanitizeInput, sanitizeHTML, sanitizeKey,
    validateEmail, passwordStrength
  };
})();
