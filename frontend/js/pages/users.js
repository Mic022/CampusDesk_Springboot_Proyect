/**
 * CampusDesk Users Directory Controller
 * Client: TechNova Solutions
 * Fetches corporate users and provides instant name and email filtering.
 */
'use strict';

let allCorporateUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ADMIN'])) return;

  Navigation.render('nav-users');

  const searchInput = document.getElementById('user-search-input');
  searchInput.addEventListener('input', filterAndRenderUsers);

  try {
    const users = await apiFetch('/users');
    allCorporateUsers = Array.isArray(users) ? users : [];
    filterAndRenderUsers();
  } catch (err) {
    Toast.error('Load Error', err.message || 'Unable to retrieve user directory.');
  }
});

function filterAndRenderUsers() {
  const query = document.getElementById('user-search-input').value.trim().toLowerCase();
  const tbody = document.getElementById('users-table-rows');
  const countTitle = document.getElementById('users-count-title');

  const filtered = allCorporateUsers.filter(u => {
    return (u.fullName || '').toLowerCase().includes(query) ||
           (u.email || '').toLowerCase().includes(query) ||
           (u.role || '').toLowerCase().includes(query);
  });

  countTitle.textContent = `Corporate Accounts (${filtered.length})`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-table-cell">
          No matching corporate accounts found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const role = (u.role || 'EMPLOYEE').toUpperCase();
    const roleBadgeClass = `badge-role-${role.toLowerCase()}`;

    return `
      <tr>
        <td data-label="Account ID" class="monospace-id">#USR-${String(u.id).padStart(3, '0')}</td>
        <td data-label="Full Name"><strong>${u.fullName}</strong></td>
        <td data-label="Corporate Email">${u.email}</td>
        <td data-label="Role">
          <span class="badge ${roleBadgeClass}">${role}</span>
        </td>
        <td data-label="Status">
          <span class="badge badge-status-resolved"><span class="badge-dot"></span>ACTIVE</span>
        </td>
      </tr>
    `;
  }).join('');

  if (window.I18n) {
    I18n.translatePage();
  }
}
