/**
 * CampusDesk Registration Page Controller
 * Client: TechNova Solutions
 * Manages user registration, password strength verification, matching validation, and submission.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isAuthenticated()) {
    window.location.href = 'dashboard.html';
    return;
  }

  const form = document.getElementById('register-form');
  const firstNameInput = document.getElementById('first-name');
  const lastNameInput = document.getElementById('last-name');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirm-password');
  const passwordToggle = document.getElementById('password-toggle');
  const submitBtn = document.getElementById('register-submit-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');
  const alertBox = document.getElementById('register-alert');

  if (passwordToggle && passwordInput) {
    passwordToggle.addEventListener('click', () => {
      const isPassword = passwordInput.getAttribute('type') === 'password';
      passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
      passwordToggle.textContent = isPassword ? 'Hide' : 'Show';
    });
  }

  function clearErrors() {
    alertBox.style.display = 'none';
    document.querySelectorAll('.form-error-msg').forEach(el => el.style.display = 'none');
  }

  function showAlert(msg, isError = true) {
    alertBox.style.display = 'block';
    alertBox.style.backgroundColor = isError ? 'var(--priority-critical-bg)' : 'var(--status-resolved-bg)';
    alertBox.style.color = isError ? 'var(--priority-critical)' : 'var(--status-resolved)';
    alertBox.style.border = `1px solid ${isError ? '#fca5a5' : '#86efac'}`;
    alertBox.textContent = msg;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    let hasError = false;

    if (!firstName) {
      document.getElementById('first-name-error').style.display = 'block';
      hasError = true;
    }

    if (!lastName) {
      document.getElementById('last-name-error').style.display = 'block';
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById('email-error').style.display = 'block';
      hasError = true;
    }

    // Password policy: >= 8 characters, at least 1 uppercase, 1 lowercase, 1 digit
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !passwordPolicy.test(password)) {
      document.getElementById('password-error').style.display = 'block';
      hasError = true;
    }

    if (password !== confirmPassword) {
      document.getElementById('confirm-password-error').style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    const fullName = `${firstName} ${lastName}`;

    try {
      await Auth.register(fullName, email, password);
      Toast.success('Account Created', 'Registration successful! Please sign in with your new credentials.');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 1200);
    } catch (err) {
      showAlert(err.message || 'Registration failed. The email address may already be in use.');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  });
});
