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
    alertBox.classList.remove('active', 'auth-alert-error', 'auth-alert-success');
    document.querySelectorAll('.form-error-msg').forEach(el => el.classList.add('d-none'));
  }

  function showAlert(msg, isError = true) {
    alertBox.className = `auth-alert-box active ${isError ? 'auth-alert-error' : 'auth-alert-success'}`;
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
      document.getElementById('first-name-error').classList.add('active');
      hasError = true;
    }

    if (!lastName) {
      document.getElementById('last-name-error').classList.add('active');
      hasError = true;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      document.getElementById('email-error').classList.add('active');
      hasError = true;
    }

    // Password policy: >= 8 characters, at least 1 uppercase, 1 lowercase, 1 digit
    const passwordPolicy = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!password || !passwordPolicy.test(password)) {
      document.getElementById('password-error').classList.add('active');
      hasError = true;
    }

    if (password !== confirmPassword) {
      document.getElementById('confirm-password-error').classList.add('active');
      hasError = true;
    }

    if (hasError) return;

    submitBtn.disabled = true;
    btnText.classList.add('d-none');
    btnSpinner.classList.remove('d-none');

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
      btnText.classList.remove('d-none');
      btnSpinner.classList.add('d-none');
    }
  });
});
