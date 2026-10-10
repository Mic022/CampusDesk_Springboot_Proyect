/**
 * CampusDesk Centralized API Client
 * Client: TechNova Solutions
 * Direct integration with real Spring Boot REST API endpoints (http://localhost:8080/api).
 * Handles JWT Bearer authentication headers, session management, Spring Boot error mapping,
 * and eliminates all mock/fake sandbox data fallbacks.
 */
'use strict';

// Spring Boot REST API Base URL
const API_BASE_URL = window.CAMPUSDESK_API_URL || 'http://localhost:8080/api';

/**
 * Storage helpers for authentication token and current user session
 */
const StorageService = {
  TOKEN_KEY: 'campusdesk_token',
  USER_KEY: 'campusdesk_user',

  getToken() {
    return localStorage.getItem(this.TOKEN_KEY);
  },

  setToken(token) {
    if (token) localStorage.setItem(this.TOKEN_KEY, token);
    else localStorage.removeItem(this.TOKEN_KEY);
  },

  getUser() {
    try {
      const data = localStorage.getItem(this.USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  setUser(user) {
    if (user) localStorage.setItem(this.USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(this.USER_KEY);
  },

  clearSession() {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  },

  /**
   * Purges any legacy mock caches stored in browser local storage
   */
  purgeLegacyMockData() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('mock_') || key === 'mock_users' || key === 'mock_tickets')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
  }
};

// Purge legacy mock data on startup
StorageService.purgeLegacyMockData();

/**
 * Primary API request dispatcher
 * Connects directly to real Spring Boot endpoints with JWT Bearer authentication.
 * No mock data or fake sandbox fallback is utilized.
 */
async function apiFetch(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  const token = StorageService.getToken();

  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);

    // Handle 401 Unauthorized: Session expiration or bad credentials
    if (response.status === 401) {
      // If login failed with invalid credentials, surface error directly
      if (endpoint.includes('/auth/login')) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || 'Invalid email or password.';
        const err = new Error(msg);
        err.status = 401;
        throw err;
      }

      // Expired token on protected route: terminate session and redirect to login
      StorageService.clearSession();
      if (typeof Toast !== 'undefined') {
        Toast.error('Session Expired', 'Your session has expired. Please sign in again.');
      }
      setTimeout(() => {
        const isPages = window.location.pathname.includes('/pages/');
        window.location.href = isPages ? 'login.html' : 'pages/login.html';
      }, 1200);
      const err = new Error('Your session has expired. Please sign in again.');
      err.status = 401;
      throw err;
    }

    // Handle 403 Forbidden: Insufficient permissions
    if (response.status === 403) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData.message || 'You do not have permission to perform this action.';
      if (typeof Toast !== 'undefined') {
        Toast.error('Access Denied', msg);
      }
      const err = new Error(msg);
      err.status = 403;
      throw err;
    }

    // Parse JSON response body (or empty object if empty response)
    const text = await response.text();
    const responseData = text ? JSON.parse(text) : {};

    if (!response.ok) {
      let errorMsg = responseData.message || responseData.error || `HTTP error ${response.status}`;

      // Format field validation error messages from Spring Boot MethodArgumentNotValidException
      if (responseData.errors && typeof responseData.errors === 'object') {
        const fieldErrors = Object.entries(responseData.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join(', ');
        if (fieldErrors) {
          errorMsg = `${errorMsg} (${fieldErrors})`;
        }
      }

      const err = new Error(errorMsg);
      err.status = response.status;
      err.data = responseData;
      throw err;
    }

    return responseData;

  } catch (error) {
    // Detect network connection errors (Spring Boot server offline or connection refused)
    if (error.name === 'TypeError' && (error.message.includes('fetch') || error.message.includes('NetworkError') || error.message.includes('Failed to fetch'))) {
      const connErr = new Error(`Cannot connect to Spring Boot backend at ${url}. Please ensure the server is running on port 8080.`);
      connErr.status = 0;
      throw connErr;
    }
    throw error;
  }
}
