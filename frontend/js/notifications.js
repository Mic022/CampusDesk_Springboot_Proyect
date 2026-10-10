/**
 * CampusDesk Interactive Notifications System
 * Client: TechNova Solutions
 * Manages operational incident alerts, unread badges, mark-as-read actions,
 * and dropdown overlay interactions.
 */
'use strict';

const Notifications = {
  STORAGE_KEY: 'campusdesk_notifications',

  defaultNotifications: [
    {
      id: 1,
      title: 'Critical Outage Alert',
      desc: 'VPN Gateway #TK-0102 reported high latency exceeding SLA threshold.',
      time: '10 min ago',
      unread: true,
      ticketId: 102
    },
    {
      id: 2,
      title: 'Technician Assigned',
      desc: 'Luis Gomez assigned to incident #TK-0101 (Workstation Display).',
      time: '45 min ago',
      unread: true,
      ticketId: 101
    },
    {
      id: 3,
      title: 'Ticket Marked Resolved',
      desc: 'Incident #TK-0104 (Biometric Access) has been verified and resolved.',
      time: '2 hours ago',
      unread: true,
      ticketId: 104
    },
    {
      id: 4,
      title: 'Scheduled Maintenance',
      desc: 'Core switch firmware upgrade scheduled tonight at 23:00 UTC.',
      time: '5 hours ago',
      unread: false,
      ticketId: null
    }
  ],

  getItems() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : this.defaultNotifications;
    } catch (e) {
      return this.defaultNotifications;
    }
  },

  saveItems(items) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(items));
  },

  getUnreadCount() {
    return this.getItems().filter(n => n.unread).length;
  },

  markAllAsRead() {
    const items = this.getItems().map(n => ({ ...n, unread: false }));
    this.saveItems(items);
    this.render();
  },

  markAsRead(id) {
    const items = this.getItems().map(n => n.id === id ? { ...n, unread: false } : n);
    this.saveItems(items);
    this.render();
  },

  mount(container) {
    if (!container) return;

    container.innerHTML = `
      <div class="notifications-wrapper" id="notifications-wrapper">
        <button class="notifications-bell-btn" id="notifications-bell-btn" aria-label="View notifications">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span class="notifications-badge-count" id="notifications-badge-count">0</span>
        </button>

        <div class="notifications-panel" id="notifications-panel">
          <div class="notifications-header">
            <span class="notifications-title" data-i18n="notifications_title">Notifications</span>
            <button class="notifications-mark-all-btn" id="notifications-mark-all-btn" data-i18n="notifications_mark_all">Mark all as read</button>
          </div>
          <div class="notifications-list" id="notifications-list"></div>
        </div>
      </div>
    `;

    const bellBtn = container.querySelector('#notifications-bell-btn');
    const panel = container.querySelector('#notifications-panel');
    const markAllBtn = container.querySelector('#notifications-mark-all-btn');

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      panel.classList.toggle('active');
    });

    markAllBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.markAllAsRead();
      if (typeof Toast !== 'undefined') {
        Toast.info('Notifications', 'All operational alerts marked as read.');
      }
    });

    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        panel.classList.remove('active');
      }
    });

    this.render();
  },

  render() {
    const badge = document.getElementById('notifications-badge-count');
    const list = document.getElementById('notifications-list');
    if (!badge || !list) return;

    const items = this.getItems();
    const unreadCount = items.filter(n => n.unread).length;

    badge.textContent = unreadCount;
    if (unreadCount === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }

    if (items.length === 0) {
      list.innerHTML = `<div class="notifications-empty-state" data-i18n="notifications_empty">No notifications</div>`;
      return;
    }

    list.innerHTML = items.map(n => `
      <div class="notification-item ${n.unread ? 'unread' : 'read'}" data-id="${n.id}" data-ticket-id="${n.ticketId || ''}">
        <span class="notification-dot"></span>
        <div class="notification-item-content">
          <div class="notification-item-title">${n.title}</div>
          <div class="notification-item-desc">${n.desc}</div>
          <div class="notification-item-time">${n.time}</div>
        </div>
      </div>
    `).join('');

    list.querySelectorAll('.notification-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.getAttribute('data-id'), 10);
        const ticketId = el.getAttribute('data-ticket-id');
        this.markAsRead(id);

        if (ticketId) {
          const isPages = window.location.pathname.includes('/pages/');
          window.location.href = isPages ? `ticket-detail.html?id=${ticketId}` : `pages/ticket-detail.html?id=${ticketId}`;
        }
      });
    });
  }
};
