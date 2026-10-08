/**
 * CampusDesk Login Page Controller
 * Client: TechNova Solutions
 * Manages login form submission, password visibility toggle, input validation, and redirection.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // If user is already authenticated, forward to dashboard
  if (Auth.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('login-form');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const passwordToggle = document.getElementById('password-toggle');
  const submitBtn = document.getElementById('login-submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const alertBox = document.getElementById('login-alert');

  // Toggle password visibility between text and password types
  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggle.textContent = isPassword ? 'Hide' : 'Show';
    });
  }

  // Quick-fill buttons for evaluator convenience
  document.getElementById('demo-admin')?.addEventListener('click', () => {
    emailInput.value = 'admin@technova.com';
    passwordInput.value = 'AdminPass123!';
    clearErrors();
  });

  document.getElementById('demo-tech')?.addEventListener('click', () => {
    emailInput.value = 'luis.gomez@technova.com';
    passwordInput.value = 'TechPass123!';
    clearErrors();
  });

  document.getElementById('demo-user')?.addEventListener('click', () => {
    emailInput.value = 'ana.perez@technova.com';
    passwordInput.value = 'UserPass123!';
    clearErrors();
  });

  function clearErrors() {
    alertBox.style.display = 'none';
    document.getElementById('email-error').style.display = 'none';
    document.getElementById('password-error').style.display = 'none';
  }

  function showAlert(msg, isError = true) {
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = isError ? 'var(--priority-critical-bg)' : 'var(--status-resolved-bg)';
    alertBox.style.color = isError ? 'var(--priority-critical)' : 'var(--status-resolved)';
    alertBox.style.border = `1px solid ${isError ? '#fca5a5' : '#86efac'}`;
    alertBox.textContent = msg;
  }

  // Form submission handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    let hasError = false;

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById('email-error').style.display = 'block';
      hasError = true;
    }

    // Validate password
    if (!password) {
      document.getElementById('password-error').style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    // Set loading state
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    try {
      const user = await Auth.login(email, password);
      Toast.success('Authentication Successful', `Welcome back, ${user.fullName}`);
      setTimeout(() => {
        window.location.href = 'dashboard.html';
      }, 700);
    } catch (err) {
      showAlert(err.message || 'Invalid credentials. Please verify your email and password.');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  });
});
