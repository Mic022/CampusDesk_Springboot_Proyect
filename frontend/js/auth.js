/**
 * CampusDesk Authentication and Route Guards
 * Client: TechNova Solutions
 * Controls sign in, registration, session state, and role-based page security.
 */
'use strict';

const Auth = {
  // Attempt user authentication against Spring Boot /auth/login
  async login(email, password) {
    const response = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    if (response && response.token) {
      StorageService.setToken(response.token);
      StorageService.setUser(response.user);
      return response.user;
    }
    throw new Error('Invalid authentication response from server.');
  },

  // Public user registration (Strictly USER role per security policies)
  async register(fullName, email, password) {
    const response = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ fullName, email, password })
    });
    return response;
  },

  // Confirm and terminate current session
  logout() {
    Modal.open({
      title: 'Sign Out Confirmation',
      content: '<p>Are you sure you want to log out of your CampusDesk account?</p>',
      confirmText: 'Sign Out',
      cancelText: 'Cancel',
      onConfirm: () => {
        StorageService.clearSession();
        Toast.info('Signed Out', 'You have been successfully logged out.');
        setTimeout(() => {
          const isPages = window.location.pathname.includes('/pages/');
          window.location.href = isPages ? 'login.html' : 'pages/login.html';
        }, 500);
      }
    });
  },

  getCurrentUser() {
    return StorageService.getUser();
  },

  isAuthenticated() {
    return !!StorageService.getToken();
  },

  // Client-side route protection guard
  requireAuth(allowedRoles = []) {
    const user = this.getCurrentUser();
    const isPagesDir = window.location.pathname.includes('/pages/');
    const loginPath = isPagesDir ? 'login.html' : 'pages/login.html';
    const unauthorizedPath = isPagesDir ? 'unauthorized.html' : 'pages/unauthorized.html';

    if (!this.isAuthenticated() || !user) {
      window.location.href = loginPath;
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      window.location.href = unauthorizedPath;
      return false;
    }

    return true;
  }
};
