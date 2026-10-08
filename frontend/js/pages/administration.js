/**
 * CampusDesk Administration Controller
 * Client: TechNova Solutions
 * Manages administrative tabs, technician capacity oversight, and corporate user directories.
 */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  // Enforce ADMIN role requirement
  if (!Auth.requireAuth(['ADMIN'])) return;

  Navigation.render('nav-admin');

  setupTabSwitching();
  await loadAdminData();
});

/**
 * Configure tab navigation transitions
 */
function setupTabSwitching() {
  const tabButtons = document.querySelectorAll('.admin-tab-btn');
  const tabContents = document.querySelectorAll('.admin-tab-content');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTabId = btn.getAttribute('data-tab');

      tabButtons.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetContent = document.getElementById(targetTabId);
      if (targetContent) targetContent.classList.add('active');
    });
  });
}

/**
 * Fetch and populate administrative modules
 */
async function loadAdminData() {
  try {
    const [summary, tickets, technicians, users] = await Promise.all([
      apiFetch('/reports/summary').catch(() => ({ total: 0, open: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 })),
      apiFetch('/tickets').catch(() => []),
      apiFetch('/users/technicians').catch(() => []),
      apiFetch('/users').catch(() => [])
    ]);

    renderOverviewTab(summary, tickets);
    renderTechniciansTab(technicians, tickets);
    renderUsersTab(users);

  } catch (err) {
    Toast.error('Load Error', err.message || 'Unable to populate administration consoles.');
  }
}

/**
 * Render System Overview metrics and unassigned tickets queue
 */
function renderOverviewTab(summary, tickets) {
  const summaryGrid = document.getElementById('admin-summary-grid');
  summaryGrid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Total Volume</span><div class="kpi-icon-wrapper">${Icons.tickets}</div></div>
      <div class="kpi-value">${summary.total || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Open Awaiting Triage</span><div class="kpi-icon-wrapper" style="color: var(--status-open);">${Icons.clock}</div></div>
      <div class="kpi-value" style="color: var(--status-open);">${summary.open || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Active Work</span><div class="kpi-icon-wrapper" style="color: var(--status-in-progress);">${Icons.clock}</div></div>
      <div class="kpi-value" style="color: var(--status-in-progress);">${summary.inProgress || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Resolved</span><div class="kpi-icon-wrapper" style="color: var(--status-resolved);">${Icons.check}</div></div>
      <div class="kpi-value" style="color: var(--status-resolved);">${summary.resolved || 0}</div>
    </div>
  `;

  const unassigned = tickets.filter(t => !t.technician && t.status === 'OPEN');
  const unassignedTable = document.getElementById('unassigned-table-body');

  if (unassigned.length === 0) {
    unassignedTable.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">
          All open tickets have been assigned to designated technicians.
        </td>
      </tr>
    `;
    return;
  }

  unassignedTable.innerHTML = unassigned.map(t => `
    <tr>
      <td data-label="ID"><span class="ticket-id-tag">#TK-${String(t.id).padStart(4, '0')}</span></td>
      <td data-label="Title"><strong>${t.title}</strong></td>
      <td data-label="Category">${t.category}</td>
      <td data-label="Priority">${getPriorityBadge(t.priority)}</td>
      <td data-label="Submitted On">${formatDate(t.createdAt)}</td>
      <td data-label="Action"><a href="ticket-detail.html?id=${t.id}" class="btn btn-primary btn-sm">Assign Now</a></td>
    </tr>
  `).join('');
}

/**
 * Render technician workload capacity cards
 */
function renderTechniciansTab(technicians, tickets) {
  const container = document.getElementById('technicians-cards-container');

  if (technicians.length === 0) {
    container.innerHTML = `<div style="grid-column: 1 / -1; text-align: center; color: var(--text-muted); padding: 32px;">No active technicians registered in the directory.</div>`;
    return;
  }

  container.innerHTML = technicians.map(tech => {
    const activeTickets = tickets.filter(t => t.technician && t.technician.id === tech.id && t.status !== 'CLOSED');
    const loadPercent = Math.min(Math.round((activeTickets.length / 5) * 100), 100);
    const meterClass = loadPercent >= 80 ? 'critical' : (loadPercent >= 50 ? 'high' : '');
    const initials = tech.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return `
      <div class="tech-card">
        <div>
          <div class="tech-card-header">
            <div class="tech-avatar">${initials}</div>
            <div class="tech-info">
              <h4>${tech.fullName}</h4>
              <p>${tech.email}</p>
            </div>
          </div>

          <div class="workload-meter">
            <div class="workload-label-row">
              <span>Workload Capacity</span>
              <span>${activeTickets.length} / 5 Active</span>
            </div>
            <div class="workload-bar-track">
              <div class="workload-bar-fill ${meterClass}" style="width: ${loadPercent}%;"></div>
            </div>
          </div>
        </div>

        <div style="margin-top: 14px; display: flex; justify-content: flex-end;">
          <a href="tickets.html" class="btn btn-secondary btn-sm" style="width: 100%;">View Queue</a>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Render corporate users directory table
 */
function renderUsersTab(users) {
  const tbody = document.getElementById('users-table-body');
  const countBadge = document.getElementById('users-count-badge');

  countBadge.textContent = `Corporate User Directory (${users.length})`;

  tbody.innerHTML = users.map(u => {
    const roleColor = u.role === 'ADMIN' ? 'var(--status-assigned)' : (u.role === 'TECHNICIAN' ? 'var(--color-primary)' : 'var(--text-secondary)');

    return `
      <tr>
        <td data-label="ID" style="font-family: monospace; font-weight: 700;">#USR-${String(u.id).padStart(3, '0')}</td>
        <td data-label="Full Name"><strong>${u.fullName}</strong></td>
        <td data-label="Corporate Email">${u.email}</td>
        <td data-label="Role">
          <span class="badge" style="background: rgba(0,0,0,0.06); color: ${roleColor}; font-weight: 700;">${u.role}</span>
        </td>
        <td data-label="Account Status">
          <span class="badge badge-status-resolved"><span class="badge-dot"></span>ACTIVE</span>
        </td>
      </tr>
    `;
  }).join('');
}
