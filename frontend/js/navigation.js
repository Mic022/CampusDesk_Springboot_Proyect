/**
 * CampusDesk Dynamic Navigation Controller
 * Client: TechNova Solutions
 * Dynamically renders sidebar items based on authenticated role and controls mobile drawer behavior.
 */
'use strict';

const Navigation = {
  // Navigation menus configured per role
  navConfig: {
    ADMIN: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', label: 'Incident Desk', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-technicians', label: 'Technicians', icon: 'technicians', href: 'technicians.html' },
      { id: 'nav-users', label: 'Users Directory', icon: 'users', href: 'users.html' },
      { id: 'nav-admin', label: 'Administration', icon: 'shield', href: 'administration.html' },
      { id: 'nav-statistics', label: 'Analytics', icon: 'statistics', href: 'statistics.html' },
      { id: 'nav-profile', label: 'My Profile', icon: 'profile', href: 'profile.html' }
    ],
    TECHNICIAN: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', label: 'Assigned Tickets', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-profile', label: 'My Profile', icon: 'profile', href: 'profile.html' }
    ],
    USER: [
      { id: 'nav-dashboard', label: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', label: 'My Requests', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-create-ticket', label: 'Submit Ticket', icon: 'plus', href: 'create-ticket.html' },
      { id: 'nav-profile', label: 'My Profile', icon: 'profile', href: 'profile.html' }
    ]
  },

  // Initialize navigation elements in sidebar and top header
  render(activePageId) {
    const user = Auth.getCurrentUser() || { fullName: 'Guest User', role: 'USER' };
    const navItems = this.navConfig[user.role] || this.navConfig.USER;
    const isPagesDir = window.location.pathname.includes('/pages/');

    // Inject sidebar links
    const navContainer = document.getElementById('sidebar-nav');
    if (navContainer) {
      navContainer.innerHTML = `
        <div class="nav-section-title">Navigation Menu</div>
        ${navItems.map(item => {
          const pathPrefix = isPagesDir ? '' : 'pages/';
          const isActive = item.id === activePageId ? 'active' : '';
          return `
            <a href="${pathPrefix}${item.href}" class="nav-link ${isActive}" id="${item.id}">
              <span class="nav-icon">${Icons[item.icon] || ''}</span>
              <span>${item.label}</span>
            </a>
          `;
        }).join('')}
      `;
    }

    // Configure sidebar sign out trigger
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      logoutBtn.innerHTML = `
        <span class="nav-icon">${Icons.logout}</span>
        <span>Sign Out</span>
      `;
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }

    // Render user profile summary in the top header
    const headerProfile = document.getElementById('header-user-profile');
    if (headerProfile) {
      const initials = (user.fullName || 'User')
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();

      headerProfile.innerHTML = `
        <div class="user-avatar-circle">${initials}</div>
        <div class="user-meta-info">
          <span class="user-meta-name">${user.fullName}</span>
          <span class="user-meta-role">${user.role}</span>
        </div>
      `;

      headerProfile.addEventListener('click', () => {
        window.location.href = isPagesDir ? 'profile.html' : 'pages/profile.html';
      });
    }

    // Set up responsive mobile sidebar drawer
    this.setupMobileMenu();
  },

  setupMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');

    if (menuToggle && sidebar && backdrop) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }
  }
};
