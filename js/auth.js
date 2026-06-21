/* ═══════════════════════════════════════════════════
   NEXUSCHAT — AUTH & LOGIN HANDLERS
═══════════════════════════════════════════════════ */

window.togglePassword = function(fieldId, btn) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  field.type = field.type === 'password' ? 'text' : 'password';
  btn.classList.toggle('active');
};

window.setAuthTab = function(tabName) {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });
  document.querySelectorAll('.auth-form').forEach(form => {
    form.classList.toggle('active', form.id === `${tabName}-form`);
  });
};

window.handleLogin = async function() {
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');

  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  try {
    await Store.login(email, password);
    window.showToast('Welcome back to NexusChat!', 'success');
    window.showAppScreen();
    window.initApp();
  } catch (err) {
    errorEl.textContent = err.message || 'Unable to sign in';
    errorEl.classList.remove('hidden');
  }
};

window.handleRegister = async function() {
  const name = document.getElementById('reg-name').value;
  const username = document.getElementById('reg-username').value;
  const email = document.getElementById('reg-email').value;
  const password = document.getElementById('reg-password').value;
  const errorEl = document.getElementById('reg-error');

  errorEl.classList.add('hidden');
  errorEl.textContent = '';

  try {
    await Store.register(name, username, email, password);
    window.showToast('Account created successfully!', 'success');
    window.showAppScreen();
    window.initApp();
  } catch (err) {
    errorEl.textContent = err.message || 'Unable to create account';
    errorEl.classList.remove('hidden');
  }
};

window.updatePasswordStrength = function() {
  const password = document.getElementById('reg-password').value;
  const score = NexusCrypto.passwordStrength(password);
  const strengthLabel = document.getElementById('strength-label');
  const strengthFill = document.getElementById('strength-fill');
  if (!strengthLabel || !strengthFill) return;

  const widths = ['0%', '20%', '40%', '60%', '80%', '100%'];
  strengthFill.style.width = widths[score];

  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong', 'Secure'];
  const colors = ['#FF5A5F', '#FFB800', '#F2C94C', '#6C63FF', '#3ECF8E', '#3ECF8E'];
  strengthLabel.textContent = labels[score];
  strengthFill.style.background = colors[score];
  document.getElementById('pw-strength').classList.toggle('hidden', password.length === 0);
};

window.showAuthScreen = function() {
  document.getElementById('auth-screen')?.classList.add('active');
  document.getElementById('app-screen')?.classList.add('hidden');
};

window.showAppScreen = function() {
  document.getElementById('auth-screen')?.classList.remove('active');
  document.getElementById('app-screen')?.classList.remove('hidden');
};

window.clearAuthForms = function() {
  ['login-email', 'login-password', 'reg-name', 'reg-username', 'reg-email', 'reg-password'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('login-error')?.classList.add('hidden');
  document.getElementById('reg-error')?.classList.add('hidden');
  document.getElementById('pw-strength')?.classList.add('hidden');
};

window.attachAuthEvents = function() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => window.setAuthTab(btn.dataset.tab));
  });

  const passwordInput = document.getElementById('reg-password');
  if (passwordInput) {
    passwordInput.addEventListener('input', window.updatePasswordStrength);
  }
};
