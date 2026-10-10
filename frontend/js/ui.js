/**
 * CampusDesk UI Helper Facade
 * Client: TechNova Solutions
 * Provides unified interface for toasts, modals, loaders, and role badges.
 */
'use strict';

const UI = {
  showToast(type, title, message) {
    if (typeof Toast !== 'undefined') Toast.show(type, title, message);
  },

  showModal(options) {
    if (typeof Modal !== 'undefined') Modal.open(options);
  },

  formatDate(dateStr) {
    return typeof formatDate === 'function' ? formatDate(dateStr) : dateStr;
  },

  getStatusBadge(status) {
    return typeof getStatusBadge === 'function' ? getStatusBadge(status) : status;
  },

  getPriorityBadge(priority) {
    return typeof getPriorityBadge === 'function' ? getPriorityBadge(priority) : priority;
  }
};
