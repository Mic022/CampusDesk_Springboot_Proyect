/**
 * CampusDesk Centralized API Client
 * Client: TechNova Solutions
 * Handles HTTP requests, JWT authorization headers, standard error handling,
 * and resilient demo fallback when the backend service is offline.
 */
'use strict';

// Spring Boot API Base URL (Configurable)
const API_BASE_URL = 'http://localhost:8080/api';

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
  }
};

/**
 * Primary API request dispatcher
 * Connects to Spring Boot backend with Bearer token authentication
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

    // Handle 401 Unauthorized: Session expiration
    if (response.status === 401) {
      StorageService.clearSession();
      if (typeof Toast !== 'undefined') {
        Toast.error('Session Expired', 'Your session has expired. Please sign in again.');
      }
      setTimeout(() => {
        window.location.href = window.location.pathname.includes('/pages/') ? 'login.html' : 'pages/login.html';
      }, 1200);
      throw new Error('Your session has expired. Please sign in again.');
    }

    // Handle 403 Forbidden: Insufficient permissions
    if (response.status === 403) {
      if (typeof Toast !== 'undefined') {
        Toast.error('Access Denied', 'You do not have permission to perform this action.');
      }
      throw new Error('You do not have permission to perform this action.');
    }

    // Process JSON response
    const responseData = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = responseData.message || responseData.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }

    return responseData;

  } catch (error) {
    // If backend is unreachable or connection refused, fallback gracefully to mock sandbox
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.warn(`[CampusDesk API] Live backend offline at ${url}. Operating in local sandbox mode.`);
      return handleSandboxMock(endpoint, options);
    }
    throw error;
  }
}

/**
 * Built-in local sandbox matching docs/api-contract.md precisely.
 * Allows full frontend validation even when the Spring Boot server has not yet booted.
 */
function handleSandboxMock(endpoint, options) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body) : {};

  // Mock registered users database
  let mockUsers = JSON.parse(localStorage.getItem('mock_users') || 'null');
  if (!mockUsers) {
    mockUsers = [
      { id: 1, fullName: 'Admin System', email: 'admin@technova.com', role: 'ADMIN' },
      { id: 2, fullName: 'Luis Gomez', email: 'luis.gomez@technova.com', role: 'TECHNICIAN' },
      { id: 3, fullName: 'Carlos Rodriguez', email: 'carlos.rodriguez@technova.com', role: 'TECHNICIAN' },
      { id: 4, fullName: 'Ana Perez', email: 'ana.perez@technova.com', role: 'USER' },
      { id: 5, fullName: 'David Morales', email: 'david.morales@technova.com', role: 'USER' }
    ];
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
  }

  // Mock tickets database
  let mockTickets = JSON.parse(localStorage.getItem('mock_tickets') || 'null');
  if (!mockTickets) {
    mockTickets = [
      {
        id: 101,
        title: 'Workstation Display Failure in Lab 4',
        description: 'Primary monitor blinks repeatedly and loses HDMI sync during high computational loads.',
        category: 'HARDWARE',
        priority: 'HIGH',
        status: 'ASSIGNED',
        requester: { id: 4, fullName: 'Ana Perez' },
        technician: { id: 2, fullName: 'Luis Gomez' },
        createdAt: '2026-10-06T09:15:00',
        updatedAt: '2026-10-06T10:30:00'
      },
      {
        id: 102,
        title: 'Enterprise VPN Gateway Authentication Timeout',
        description: 'Unable to establish secure tunnel via Radius authenticator on corporate network.',
        category: 'NETWORK',
        priority: 'CRITICAL',
        status: 'IN_PROGRESS',
        requester: { id: 5, fullName: 'David Morales' },
        technician: { id: 3, fullName: 'Carlos Rodriguez' },
        createdAt: '2026-10-07T08:00:00',
        updatedAt: '2026-10-07T11:20:00'
      },
      {
        id: 103,
        title: 'ERP Suite License Allocation Error',
        description: 'License manager reports seat saturation for department finance team.',
        category: 'SOFTWARE',
        priority: 'MEDIUM',
        status: 'OPEN',
        requester: { id: 4, fullName: 'Ana Perez' },
        technician: null,
        createdAt: '2026-10-07T14:10:00',
        updatedAt: '2026-10-07T14:10:00'
      },
      {
        id: 104,
        title: 'Biometric Access Revocation Audit',
        description: 'Requested clearance revocation for departed contractor on server room wing.',
        category: 'ACCESS',
        priority: 'LOW',
        status: 'RESOLVED',
        requester: { id: 5, fullName: 'David Morales' },
        technician: { id: 2, fullName: 'Luis Gomez' },
        createdAt: '2026-10-05T11:00:00',
        updatedAt: '2026-10-06T16:00:00'
      },
      {
        id: 105,
        title: 'Server Rack Ambient Temperature Alert',
        description: 'Cooling sensor sensor #2 indicated thermal delta breach.',
        category: 'OTHER',
        priority: 'CRITICAL',
        status: 'CLOSED',
        requester: { id: 4, fullName: 'Ana Perez' },
        technician: { id: 3, fullName: 'Carlos Rodriguez' },
        createdAt: '2026-10-04T07:30:00',
        updatedAt: '2026-10-05T18:45:00'
      }
    ];
    localStorage.setItem('mock_tickets', JSON.stringify(mockTickets));
  }

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const user = mockUsers.find(u => u.email.toLowerCase() === body.email.toLowerCase()) || {
      id: 99,
      fullName: 'Demo Enterprise User',
      email: body.email,
      role: body.email.includes('admin') ? 'ADMIN' : (body.email.includes('tech') ? 'TECHNICIAN' : 'USER')
    };
    return {
      token: 'mock-jwt-token-' + Date.now(),
      tokenType: 'Bearer',
      expiresIn: 3600,
      user
    };
  }

  // Auth: Register
  if (endpoint === '/auth/register' && method === 'POST') {
    const newUser = {
      id: mockUsers.length + 1,
      fullName: body.fullName || 'Registered User',
      email: body.email,
      role: 'USER'
    };
    mockUsers.push(newUser);
    localStorage.setItem('mock_users', JSON.stringify(mockUsers));
    return newUser;
  }

  // Reports Summary
  if (endpoint.startsWith('/reports/summary')) {
    const total = mockTickets.length;
    const open = mockTickets.filter(t => t.status === 'OPEN').length;
    const assigned = mockTickets.filter(t => t.status === 'ASSIGNED').length;
    const inProgress = mockTickets.filter(t => t.status === 'IN_PROGRESS').length;
    const resolved = mockTickets.filter(t => t.status === 'RESOLVED').length;
    const closed = mockTickets.filter(t => t.status === 'CLOSED').length;
    return { total, open, assigned, inProgress, resolved, closed };
  }

  // Users listing
  if (endpoint === '/users') {
    return mockUsers;
  }

  // Technicians listing
  if (endpoint === '/users/technicians') {
    return mockUsers.filter(u => u.role === 'TECHNICIAN');
  }

  // Tickets List & Filter
  if (endpoint.startsWith('/tickets') && method === 'GET') {
    const ticketIdMatch = endpoint.match(/^\/tickets\/(\d+)$/);
    if (ticketIdMatch) {
      const id = parseInt(ticketIdMatch[1], 10);
      const ticket = mockTickets.find(t => t.id === id);
      if (!ticket) throw new Error('Ticket not found');
      return ticket;
    }

    const commentsMatch = endpoint.match(/^\/tickets\/(\d+)\/comments$/);
    if (commentsMatch) {
      const id = parseInt(commentsMatch[1], 10);
      const commentsStore = JSON.parse(localStorage.getItem(`mock_comments_${id}`) || 'null');
      return commentsStore || [
        {
          id: 1,
          content: 'Diagnostics started on hardware sub-components.',
          author: { id: 2, fullName: 'Luis Gomez', role: 'TECHNICIAN' },
          createdAt: '2026-10-06T10:45:00'
        }
      ];
    }

    const historyMatch = endpoint.match(/^\/tickets\/(\d+)\/history$/);
    if (historyMatch) {
      const id = parseInt(historyMatch[1], 10);
      const historyStore = JSON.parse(localStorage.getItem(`mock_history_${id}`) || 'null');
      return historyStore || [
        {
          id: 1,
          previousStatus: null,
          newStatus: 'OPEN',
          changedBy: { id: 4, fullName: 'Ana Perez' },
          changedAt: '2026-10-06T09:15:00'
        },
        {
          id: 2,
          previousStatus: 'OPEN',
          newStatus: 'ASSIGNED',
          changedBy: { id: 1, fullName: 'Admin System' },
          changedAt: '2026-10-06T10:30:00'
        }
      ];
    }

    return mockTickets;
  }

  // Tickets: Create Ticket
  if (endpoint === '/tickets' && method === 'POST') {
    const currentUser = StorageService.getUser() || { id: 4, fullName: 'Ana Perez' };
    const newTicket = {
      id: 100 + mockTickets.length + 1,
      title: body.title,
      description: body.description,
      category: body.category,
      priority: body.priority,
      status: 'OPEN',
      requester: { id: currentUser.id, fullName: currentUser.fullName },
      technician: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    mockTickets.unshift(newTicket);
    localStorage.setItem('mock_tickets', JSON.stringify(mockTickets));
    return newTicket;
  }

  // Tickets: Assign Technician
  const assignMatch = endpoint.match(/^\/tickets\/(\d+)\/assign$/);
  if (assignMatch && method === 'PATCH') {
    const id = parseInt(assignMatch[1], 10);
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    const tech = mockUsers.find(u => u.id === body.technicianId);
    ticket.technician = tech ? { id: tech.id, fullName: tech.fullName } : null;
    ticket.status = 'ASSIGNED';
    ticket.updatedAt = new Date().toISOString();
    localStorage.setItem('mock_tickets', JSON.stringify(mockTickets));
    return ticket;
  }

  // Tickets: Status Update
  const statusMatch = endpoint.match(/^\/tickets\/(\d+)\/status$/);
  if (statusMatch && method === 'PATCH') {
    const id = parseInt(statusMatch[1], 10);
    const ticket = mockTickets.find(t => t.id === id);
    if (!ticket) throw new Error('Ticket not found');
    ticket.status = body.status;
    ticket.updatedAt = new Date().toISOString();
    localStorage.setItem('mock_tickets', JSON.stringify(mockTickets));
    return ticket;
  }

  // Tickets: Add Comment
  const addCommentMatch = endpoint.match(/^\/tickets\/(\d+)\/comments$/);
  if (addCommentMatch && method === 'POST') {
    const id = parseInt(addCommentMatch[1], 10);
    const currentUser = StorageService.getUser() || { id: 1, fullName: 'Admin System', role: 'ADMIN' };
    const commentsKey = `mock_comments_${id}`;
    const comments = JSON.parse(localStorage.getItem(commentsKey) || '[]');
    const newComment = {
      id: comments.length + 1,
      content: body.content,
      author: { id: currentUser.id, fullName: currentUser.fullName, role: currentUser.role },
      createdAt: new Date().toISOString()
    };
    comments.push(newComment);
    localStorage.setItem(commentsKey, JSON.stringify(comments));
    return newComment;
  }

  return { success: true };
}
