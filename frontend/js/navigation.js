/**
 * CampusDesk Dynamic Navigation Controller
 * Client: TechNova Solutions
 * Dynamically renders sidebar items based on authenticated role, integrates
 * language selector and notifications bell, and controls mobile drawer behavior.
 */
'use strict';

const Navigation = {
  // Navigation menus configured per role
  navConfig: {
    ADMIN: [
      { id: 'nav-dashboard', labelKey: 'nav_dashboard', defaultLabel: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', labelKey: 'nav_tickets', defaultLabel: 'Incident Desk', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-technicians', labelKey: 'nav_technicians', defaultLabel: 'Technicians', icon: 'technicians', href: 'technicians.html' },
      { id: 'nav-users', labelKey: 'nav_users', defaultLabel: 'Users Directory', icon: 'users', href: 'users.html' },
      { id: 'nav-admin', labelKey: 'nav_admin', defaultLabel: 'Administration', icon: 'shield', href: 'administration.html' },
      { id: 'nav-statistics', labelKey: 'nav_stats', defaultLabel: 'Analytics', icon: 'statistics', href: 'statistics.html' },
      { id: 'nav-profile', labelKey: 'nav_profile', defaultLabel: 'My Profile', icon: 'profile', href: 'profile.html' }
    ],
    TECHNICIAN: [
      { id: 'nav-dashboard', labelKey: 'nav_dashboard', defaultLabel: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', labelKey: 'nav_tickets', defaultLabel: 'Assigned Tickets', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-profile', labelKey: 'nav_profile', defaultLabel: 'My Profile', icon: 'profile', href: 'profile.html' }
    ],
    USER: [
      { id: 'nav-dashboard', labelKey: 'nav_dashboard', defaultLabel: 'Dashboard', icon: 'dashboard', href: 'dashboard.html' },
      { id: 'nav-tickets', labelKey: 'nav_tickets', defaultLabel: 'My Requests', icon: 'tickets', href: 'tickets.html' },
      { id: 'nav-create-ticket', labelKey: 'nav_submit', defaultLabel: 'Submit Ticket', icon: 'plus', href: 'create-ticket.html' },
      { id: 'nav-profile', labelKey: 'nav_profile', defaultLabel: 'My Profile', icon: 'profile', href: 'profile.html' }
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
          const label = typeof I18n !== 'undefined' ? I18n.t(item.labelKey, item.defaultLabel) : item.defaultLabel;
          return `
            <a href="${pathPrefix}${item.href}" class="nav-link ${isActive}" id="${item.id}" data-i18n="${item.labelKey}">
              <span class="nav-icon">${Icons[item.icon] || ''}</span>
              <span>${label}</span>
            </a>
          `;
        }).join('')}
      `;
    }

    // Configure sidebar sign out trigger
    const logoutBtn = document.getElementById('sidebar-logout-btn');
    if (logoutBtn) {
      const logoutText = typeof I18n !== 'undefined' ? I18n.t('sign_out', 'Sign Out') : 'Sign Out';
      logoutBtn.innerHTML = `
        <span class="nav-icon">${Icons.logout}</span>
        <span data-i18n="sign_out">${logoutText}</span>
      `;
      logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        Auth.logout();
      });
    }

    // Mount language switcher in header right area
    const headerRight = document.querySelector('.header-right');
    if (headerRight && typeof I18n !== 'undefined' && !document.getElementById('lang-toggle-btn')) {
      const i18nMount = document.createElement('div');
      i18nMount.id = 'header-i18n-container';
      headerRight.insertBefore(i18nMount, headerRight.firstChild);
      I18n.mountSelector(i18nMount);
    }

    // Mount interactive notifications bell in header
    const notifMountTarget = document.getElementById('header-notifications-mount');
    if (notifMountTarget && typeof Notifications !== 'undefined') {
      Notifications.mount(notifMountTarget);
    } else if (headerRight && typeof Notifications !== 'undefined' && !document.getElementById('notifications-bell-btn')) {
      const notifMount = document.createElement('div');
      notifMount.id = 'header-notifications-mount';
      const profileBadge = document.getElementById('header-user-profile');
      if (profileBadge) {
        headerRight.insertBefore(notifMount, profileBadge);
      } else {
        headerRight.appendChild(notifMount);
      }
      Notifications.mount(notifMount);
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
