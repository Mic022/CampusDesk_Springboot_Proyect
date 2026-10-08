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
        <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 32px;">
          No matching corporate accounts found.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(u => {
    const roleColor = u.role === 'ADMIN' ? 'var(--status-assigned)' : (u.role === 'TECHNICIAN' ? 'var(--color-primary)' : 'var(--text-secondary)');

    return `
      <tr>
        <td data-label="Account ID" style="font-family: monospace; font-weight: 700;">#USR-${String(u.id).padStart(3, '0')}</td>
        <td data-label="Full Name"><strong>${u.fullName}</strong></td>
        <td data-label="Corporate Email">${u.email}</td>
        <td data-label="Role">
          <span class="badge" style="background: rgba(0,0,0,0.06); color: ${roleColor}; font-weight: 700;">${u.role}</span>
        </td>
        <td data-label="Status">
          <span class="badge badge-status-resolved"><span class="badge-dot"></span>ACTIVE</span>
        </td>
      </tr>
    `;
  }).join('');
}
