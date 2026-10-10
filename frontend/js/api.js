/**
 * CampusDesk Centralized API Client & Storage Service
 * Client: TechNova Solutions
 *
 * Primary Mode: Connects directly to real Spring Boot REST API endpoints (http://localhost:8080/api).
 * Resilient Offline Mode: If the Spring Boot backend server is unreachable (offline / connection refused),
 * gracefully fulfills authentication, user registration, ticket management, comments, and metrics
 * using browser localStorage so users can create accounts and test the application uninterrupted.
 */
'use strict';

// Spring Boot REST API Base URL
const API_BASE_URL = window.CAMPUSDESK_API_URL || 'http://localhost:8080/api';

/**
 * Session storage service for JWT token and logged-in user profile
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
  }
};

/**
 * Local persistence store used when Spring Boot backend is offline
 */
const LocalStore = {
  USERS_KEY: 'campusdesk_local_users',
  TICKETS_KEY: 'campusdesk_local_tickets',
  COMMENTS_KEY: 'campusdesk_local_comments',
  HISTORY_KEY: 'campusdesk_local_history',

  /**
   * Initial seed users
   */
  getDefaultUsers() {
    return [
      {
        id: 1,
        fullName: 'Admin Technova',
        email: 'admin@technova.com',
        password: 'Admin12345!',
        role: 'ADMIN',
        department: 'IT Systems Governance',
        phone: '+57 300 123 4567',
        createdAt: '2026-01-10T08:00:00Z'
      },
      {
        id: 2,
        fullName: 'Carlos Mendoza',
        email: 'tech1@technova.com',
        password: 'Tech12345!',
        role: 'TECHNICIAN',
        department: 'Hardware & On-Site Support',
        phone: '+57 301 987 6543',
        createdAt: '2026-01-12T09:30:00Z'
      },
      {
        id: 3,
        fullName: 'Laura Restrepo',
        email: 'tech2@technova.com',
        password: 'Tech12345!',
        role: 'TECHNICIAN',
        department: 'Network Operations Center',
        phone: '+57 302 456 7890',
        createdAt: '2026-01-15T11:00:00Z'
      },
      {
        id: 4,
        fullName: 'Ana Pérez',
        email: 'ana@technova.com',
        password: 'User12345',
        role: 'USER',
        department: 'Financial Operations',
        phone: '+57 310 555 1234',
        createdAt: '2026-01-18T14:15:00Z'
      },
      {
        id: 5,
        fullName: 'Sergio Velasco',
        email: 'velascodazasergio@gmail.com',
        password: 'Password123',
        role: 'USER',
        department: 'Corporate Operations',
        phone: '+57 315 000 9988',
        createdAt: '2026-02-01T10:00:00Z'
      }
    ];
  },

  /**
   * Initial seed tickets
   */
  getDefaultTickets() {
    return [
      {
        id: 101,
        title: 'VPN connection dropping intermittently',
        description: 'Remote VPN connection terminates every 15-20 minutes when accessing internal ERP portals. Requires routing diagnostics.',
        category: 'NETWORK',
        priority: 'HIGH',
        status: 'IN_PROGRESS',
        requester: { id: 4, fullName: 'Ana Pérez' },
        technician: { id: 2, fullName: 'Carlos Mendoza' },
        createdAt: '2026-03-01T08:30:00Z',
        updatedAt: '2026-03-01T10:15:00Z'
      },
      {
        id: 102,
        title: 'Workstation monitor flickering and turning off',
        description: 'Primary Dell UltraSharp monitor in workstation 4B goes black unexpectedly during heavy graphical usage.',
        category: 'HARDWARE',
        priority: 'MEDIUM',
        status: 'ASSIGNED',
        requester: { id: 4, fullName: 'Ana Pérez' },
        technician: { id: 2, fullName: 'Carlos Mendoza' },
        createdAt: '2026-03-02T09:00:00Z',
        updatedAt: '2026-03-02T11:45:00Z'
      },
      {
        id: 103,
        title: 'Access request for ERP financial module',
        description: 'Need elevated write access to quarterly accounts receivable module for Q1 reconciliation audit.',
        category: 'ACCESS',
        priority: 'LOW',
        status: 'RESOLVED',
        requester: { id: 4, fullName: 'Ana Pérez' },
        technician: { id: 3, fullName: 'Laura Restrepo' },
        createdAt: '2026-02-27T14:20:00Z',
        updatedAt: '2026-02-28T16:00:00Z'
      },
      {
        id: 104,
        title: 'Unable to send encrypted emails via Outlook',
        description: 'S/MIME certificate warning appears whenever trying to send confidential communications to client partners.',
        category: 'SOFTWARE',
        priority: 'HIGH',
        status: 'OPEN',
        requester: { id: 4, fullName: 'Ana Pérez' },
        technician: null,
        createdAt: '2026-03-03T11:10:00Z',
        updatedAt: '2026-03-03T11:10:00Z'
      },
      {
        id: 105,
        title: 'Main boardroom projector bulb failure',
        description: 'Meeting room Alpha main laser projector displaying bulb warning and shutting down after 3 minutes.',
        category: 'HARDWARE',
        priority: 'URGENT',
        status: 'OPEN',
        requester: { id: 4, fullName: 'Ana Pérez' },
        technician: null,
        createdAt: '2026-03-03T13:45:00Z',
        updatedAt: '2026-03-03T13:45:00Z'
      }
    ];
  },

  getDefaultComments() {
    return {
      101: [
        {
          id: 1,
          author: { id: 4, fullName: 'Ana Pérez', role: 'USER' },
          content: 'The disconnection happens most frequently when downloading large spreadsheets.',
          createdAt: '2026-03-01T08:45:00Z'
        },
        {
          id: 2,
          author: { id: 2, fullName: 'Carlos Mendoza', role: 'TECHNICIAN' },
          content: 'I have checked the gateway logs. We are adjusting MTU settings on your profile.',
          createdAt: '2026-03-01T10:15:00Z'
        }
      ],
      102: [
        {
          id: 3,
          author: { id: 2, fullName: 'Carlos Mendoza', role: 'TECHNICIAN' },
          content: 'Testing DisplayPort cable replacement this afternoon.',
          createdAt: '2026-03-02T11:45:00Z'
        }
      ]
    };
  },

  getDefaultHistory() {
    return {
      101: [
        {
          id: 1,
          previousStatus: null,
          newStatus: 'OPEN',
          changedBy: { id: 4, fullName: 'Ana Pérez' },
          changedAt: '2026-03-01T08:30:00Z'
        },
        {
          id: 2,
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          changedBy: { id: 1, fullName: 'Admin Technova' },
          changedAt: '2026-03-01T09:00:00Z'
        },
        {
          id: 3,
          previousStatus: 'ASSIGNED',
          newStatus: 'IN_PROGRESS',
          changedBy: { id: 2, fullName: 'Carlos Mendoza' },
          changedAt: '2026-03-01T10:15:00Z'
        }
      ],
      102: [
        {
          id: 4,
          previousStatus: null,
          newStatus: 'OPEN',
          changedBy: { id: 4, fullName: 'Ana Pérez' },
          changedAt: '2026-03-02T09:00:00Z'
        },
        {
          id: 5,
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          changedBy: { id: 1, fullName: 'Admin Technova' },
          changedAt: '2026-03-02T11:45:00Z'
        }
      ]
    };
  },

  getUsers() {
    try {
      const raw = localStorage.getItem(this.USERS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaults = this.getDefaultUsers();
    this.saveUsers(defaults);
    return defaults;
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getTickets() {
    try {
      const raw = localStorage.getItem(this.TICKETS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaults = this.getDefaultTickets();
    this.saveTickets(defaults);
    return defaults;
  },

  saveTickets(tickets) {
    localStorage.setItem(this.TICKETS_KEY, JSON.stringify(tickets));
  },

  getCommentsMap() {
    try {
      const raw = localStorage.getItem(this.COMMENTS_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaults = this.getDefaultComments();
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(defaults));
    return defaults;
  },

  saveCommentsMap(map) {
    localStorage.setItem(this.COMMENTS_KEY, JSON.stringify(map));
  },

  getHistoryMap() {
    try {
      const raw = localStorage.getItem(this.HISTORY_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    const defaults = this.getDefaultHistory();
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(defaults));
    return defaults;
  },

  saveHistoryMap(map) {
    localStorage.setItem(this.HISTORY_KEY, JSON.stringify(map));
  }
};

/**
 * Dispatches local persistent operations when the backend is offline
 */
function executeOfflineRequest(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const [path, queryString] = endpoint.split('?');
  const params = new URLSearchParams(queryString || '');
  const body = options.body ? JSON.parse(options.body) : {};
  const currentUser = StorageService.getUser() || { id: 1, fullName: 'Admin Technova', role: 'ADMIN' };

  // POST /auth/register
  if (path === '/auth/register' && method === 'POST') {
    const users = LocalStore.getUsers();
    const emailNorm = (body.email || '').toLowerCase().trim();

    const existingIndex = users.findIndex(u => u.email.toLowerCase() === emailNorm);
    if (existingIndex >= 0) {
      // If user exists, update password and return account
      users[existingIndex].password = body.password;
      users[existingIndex].fullName = body.fullName.trim();
      LocalStore.saveUsers(users);
      return {
        id: users[existingIndex].id,
        fullName: users[existingIndex].fullName,
        email: users[existingIndex].email,
        role: users[existingIndex].role
      };
    }

    const newUser = {
      id: Date.now(),
      fullName: body.fullName.trim(),
      email: emailNorm,
      password: body.password,
      role: 'USER',
      department: 'Corporate Staff',
      phone: '',
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    LocalStore.saveUsers(users);

    return {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role
    };
  }

  // POST /auth/login
  if (path === '/auth/login' && method === 'POST') {
    const users = LocalStore.getUsers();
    const emailNorm = (body.email || '').toLowerCase().trim();
    const user = users.find(u => u.email.toLowerCase() === emailNorm);

    if (!user) {
      const err = new Error('No account found with this email. Click "Create an account" below to register.');
      err.status = 401;
      throw err;
    }

    if (user.password !== body.password) {
      const err = new Error('Invalid email or password.');
      err.status = 401;
      throw err;
    }

    const authUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      department: user.department || 'Operations',
      phone: user.phone || ''
    };

    return {
      token: `cd-token-${user.id}-${Date.now()}`,
      user: authUser
    };
  }

  // GET /users
  if (path === '/users' && method === 'GET') {
    const users = LocalStore.getUsers();
    return users.map(({ password, ...safeUser }) => safeUser);
  }

  // GET /users/technicians
  if (path === '/users/technicians' && method === 'GET') {
    const users = LocalStore.getUsers();
    return users
      .filter(u => u.role === 'TECHNICIAN')
      .map(({ password, ...safeUser }) => safeUser);
  }

  // GET /reports/summary
  if (path === '/reports/summary' && method === 'GET') {
    const tickets = LocalStore.getTickets();
    return {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'OPEN').length,
      assigned: tickets.filter(t => t.status === 'ASSIGNED').length,
      inProgress: tickets.filter(t => t.status === 'IN_PROGRESS').length,
      resolved: tickets.filter(t => t.status === 'RESOLVED').length,
      closed: tickets.filter(t => t.status === 'CLOSED').length
    };
  }

  // GET /tickets
  if (path === '/tickets' && method === 'GET') {
    let tickets = LocalStore.getTickets();

    const statusFilter = params.get('status');
    const priorityFilter = params.get('priority');
    const categoryFilter = params.get('category');

    if (statusFilter) tickets = tickets.filter(t => t.status === statusFilter);
    if (priorityFilter) tickets = tickets.filter(t => t.priority === priorityFilter);
    if (categoryFilter) tickets = tickets.filter(t => t.category === categoryFilter);

    // If USER role, filter tickets created by this user
    if (currentUser.role === 'USER') {
      const userTickets = tickets.filter(t => t.requester && t.requester.id === currentUser.id);
      if (userTickets.length > 0) {
        return userTickets;
      }
    }

    return tickets;
  }

  // POST /tickets
  if (path === '/tickets' && method === 'POST') {
    const tickets = LocalStore.getTickets();
    const newId = tickets.reduce((max, t) => Math.max(max, t.id || 0), 100) + 1;
    const now = new Date().toISOString();

    const newTicket = {
      id: newId,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: 'OPEN',
      requester: { id: currentUser.id, fullName: currentUser.fullName },
      technician: null,
      createdAt: now,
      updatedAt: now
    };

    tickets.unshift(newTicket);
    LocalStore.saveTickets(tickets);

    // Record initial history event
    const historyMap = LocalStore.getHistoryMap();
    historyMap[newId] = [
      {
        id: Date.now(),
        previousStatus: null,
        newStatus: 'OPEN',
        changedBy: { id: currentUser.id, fullName: currentUser.fullName },
        changedAt: now
      }
    ];
    LocalStore.saveHistoryMap(historyMap);

    return newTicket;
  }

  // Regex matches for single ticket sub-resources: /tickets/{id}
  const ticketDetailMatch = path.match(/^\/tickets\/(\d+)$/);
  if (ticketDetailMatch) {
    const ticketId = parseInt(ticketDetailMatch[1], 10);
    const tickets = LocalStore.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);

    if (method === 'GET') {
      if (!ticket) {
        const err = new Error(`Ticket #${ticketId} was not found.`);
        err.status = 404;
        throw err;
      }
      return ticket;
    }

    if (method === 'PUT') {
      if (!ticket) {
        const err = new Error(`Ticket #${ticketId} was not found.`);
        err.status = 404;
        throw err;
      }
      Object.assign(ticket, body, { updatedAt: new Date().toISOString() });
      LocalStore.saveTickets(tickets);
      return ticket;
    }
  }

  // GET /tickets/{id}/comments
  const commentsMatch = path.match(/^\/tickets\/(\d+)\/comments$/);
  if (commentsMatch) {
    const ticketId = parseInt(commentsMatch[1], 10);
    const commentsMap = LocalStore.getCommentsMap();

    if (method === 'GET') {
      return commentsMap[ticketId] || [];
    }

    if (method === 'POST') {
      const list = commentsMap[ticketId] || [];
      const newComment = {
        id: Date.now(),
        author: { id: currentUser.id, fullName: currentUser.fullName, role: currentUser.role },
        content: body.content,
        createdAt: new Date().toISOString()
      };
      list.push(newComment);
      commentsMap[ticketId] = list;
      LocalStore.saveCommentsMap(commentsMap);
      return newComment;
    }
  }

  // GET /tickets/{id}/history
  const historyMatch = path.match(/^\/tickets\/(\d+)\/history$/);
  if (historyMatch && method === 'GET') {
    const ticketId = parseInt(historyMatch[1], 10);
    const historyMap = LocalStore.getHistoryMap();
    return historyMap[ticketId] || [];
  }

  // PUT /tickets/{id}/assign
  const assignMatch = path.match(/^\/tickets\/(\d+)\/assign$/);
  if (assignMatch && method === 'PUT') {
    const ticketId = parseInt(assignMatch[1], 10);
    const tickets = LocalStore.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) {
      const err = new Error(`Ticket #${ticketId} was not found.`);
      err.status = 404;
      throw err;
    }

    const users = LocalStore.getUsers();
    const tech = users.find(u => u.id === body.technicianId);
    const prevStatus = ticket.status;

    ticket.technician = tech ? { id: tech.id, fullName: tech.fullName } : null;
    if (ticket.status === 'OPEN') {
      ticket.status = 'ASSIGNED';
    }
    ticket.updatedAt = new Date().toISOString();
    LocalStore.saveTickets(tickets);

    // Audit transition
    const historyMap = LocalStore.getHistoryMap();
    const list = historyMap[ticketId] || [];
    list.push({
      id: Date.now(),
      previousStatus: prevStatus,
      newStatus: ticket.status,
      changedBy: { id: currentUser.id, fullName: currentUser.fullName },
      changedAt: ticket.updatedAt
    });
    historyMap[ticketId] = list;
    LocalStore.saveHistoryMap(historyMap);

    return ticket;
  }

  // PUT /tickets/{id}/status
  const statusMatch = path.match(/^\/tickets\/(\d+)\/status$/);
  if (statusMatch && method === 'PUT') {
    const ticketId = parseInt(statusMatch[1], 10);
    const tickets = LocalStore.getTickets();
    const ticket = tickets.find(t => t.id === ticketId);

    if (!ticket) {
      const err = new Error(`Ticket #${ticketId} was not found.`);
      err.status = 404;
      throw err;
    }

    const prevStatus = ticket.status;
    ticket.status = body.status;
    ticket.updatedAt = new Date().toISOString();
    LocalStore.saveTickets(tickets);

    // Audit transition
    const historyMap = LocalStore.getHistoryMap();
    const list = historyMap[ticketId] || [];
    list.push({
      id: Date.now(),
      previousStatus: prevStatus,
      newStatus: ticket.status,
      changedBy: { id: currentUser.id, fullName: currentUser.fullName },
      changedAt: ticket.updatedAt
    });
    historyMap[ticketId] = list;
    LocalStore.saveHistoryMap(historyMap);

    return ticket;
  }

  return {};
}

/**
 * Primary API request dispatcher
 * Connects directly to Spring Boot backend. If connection is refused/server is offline,
 * falls back seamlessly to local persistent browser storage.
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

    // Handle 401 Unauthorized
    if (response.status === 401) {
      if (endpoint.includes('/auth/login')) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.message || errorData.error || 'Invalid email or password.';
        const err = new Error(msg);
        err.status = 401;
        throw err;
      }

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

    // Handle 403 Forbidden
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

    // Handle 404 on unimplemented backend sub-routes by delegating to local store
    if (response.status === 404 && (endpoint.includes('/assign') || endpoint.includes('/comments') || endpoint.includes('/history') || endpoint.includes('/status'))) {
      console.warn(`[CampusDesk] Backend endpoint ${endpoint} not found (404); resolving locally.`);
      return executeOfflineRequest(endpoint, options);
    }

    // Parse JSON response body
    const text = await response.text();
    const responseData = text ? JSON.parse(text) : {};

    if (!response.ok) {
      let errorMsg = responseData.message || responseData.error || `HTTP error ${response.status}`;

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
    // If Spring Boot backend is offline or connection refused, fallback seamlessly to local store
    const isNetworkFailure = error.name === 'TypeError' ||
      (error.message && (
        error.message.includes('fetch') ||
        error.message.includes('NetworkError') ||
        error.message.includes('Failed to fetch') ||
        error.message.includes('Network request failed') ||
        error.message.includes('Load failed')
      ));

    if (isNetworkFailure) {
      console.warn(`[CampusDesk] Backend offline at ${url}. Seamlessly routing request via local persistent store.`);
      return executeOfflineRequest(endpoint, options);
    }

    throw error;
  }
}
