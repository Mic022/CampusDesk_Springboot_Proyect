/**
 * CampusDesk Dashboard Page Controller
 * Client: TechNova Solutions
 * Fetches analytics reports and tickets, rendering customized operational views
 * for ADMIN, TECHNICIAN, and USER roles with pure SVG data visualizations and i18n support.
 */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  // Guard route against unauthenticated access
  if (!Auth.requireAuth()) return;

  const user = Auth.getCurrentUser();
  Navigation.render('nav-dashboard');

  const loadingEl = document.getElementById('dashboard-loading');
  const viewContainer = document.getElementById('role-dashboard-view');

  try {
    // Concurrently fetch summary indicators and ticket queues
    const [summary, tickets] = await Promise.all([
      apiFetch('/reports/summary').catch(() => ({ total: 0, open: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 })),
      apiFetch('/tickets').catch(() => [])
    ]);

    loadingEl.classList.add('d-none');
    viewContainer.classList.remove('d-none');

    if (user.role === 'ADMIN') {
      const technicians = await apiFetch('/users/technicians').catch(() => []);
      renderAdminDashboard(viewContainer, summary, tickets, technicians);
    } else if (user.role === 'TECHNICIAN') {
      renderTechnicianDashboard(viewContainer, summary, tickets, user);
    } else {
      renderUserDashboard(viewContainer, summary, tickets, user);
    }

    if (typeof I18n !== 'undefined') {
      I18n.translatePage();
    }

  } catch (err) {
    loadingEl.classList.add('d-none');
    Toast.error('Dashboard Error', err.message || 'Failed to load operational metrics.');
  } finally {
    dismissSplash();
  }
});

/**
 * Render comprehensive command center for Administrator
 */
function renderAdminDashboard(container, summary, tickets, technicians) {
  const criticalTickets = tickets.filter(t => t.priority === 'CRITICAL' && t.status !== 'CLOSED');

  container.innerHTML = `
    <!-- Top KPI Metrics Grid -->
    <div class="metrics-grid">
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Total Incidents</span>
          <div class="kpi-icon-wrapper">${Icons.tickets}</div>
        </div>
        <div class="kpi-value">${summary.total || 0}</div>
        <div class="kpi-trend trend-up">↑ Active tracking</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Open Intake</span>
          <div class="kpi-icon-wrapper icon-open">${Icons.clock}</div>
        </div>
        <div class="kpi-value val-open">${summary.open || 0}</div>
        <div class="kpi-trend trend-warning">Awaiting triage</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Assigned</span>
          <div class="kpi-icon-wrapper icon-assigned">${Icons.technicians}</div>
        </div>
        <div class="kpi-value val-assigned">${summary.assigned || 0}</div>
        <div class="kpi-trend trend-neutral">Dispatched</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">In Progress</span>
          <div class="kpi-icon-wrapper icon-progress">${Icons.clock}</div>
        </div>
        <div class="kpi-value val-progress">${summary.inProgress || 0}</div>
        <div class="kpi-trend trend-warning">Under active repair</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Resolved</span>
          <div class="kpi-icon-wrapper icon-resolved">${Icons.check}</div>
        </div>
        <div class="kpi-value val-resolved">${summary.resolved || 0}</div>
        <div class="kpi-trend trend-up">Pending verification</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Closed</span>
          <div class="kpi-icon-wrapper icon-closed">${Icons.shield}</div>
        </div>
        <div class="kpi-value val-closed">${summary.closed || 0}</div>
        <div class="kpi-trend trend-neutral">Archived</div>
      </div>
    </div>

    <!-- Charts & Analytics Section -->
    <div class="dashboard-grid-even">
      <!-- Pure SVG Donut Chart: Status Distribution -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Status Breakdown</h3>
          <span class="card-header-badge">Distribution</span>
        </div>
        <div class="card-body">
          ${renderSvgDonutChart(summary)}
        </div>
      </div>

      <!-- Pure SVG Bar Chart: Priority Distribution -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Priority Distribution</h3>
          <span class="card-header-badge">Volume by Severity</span>
        </div>
        <div class="card-body">
          ${renderSvgPriorityBars(tickets)}
        </div>
      </div>
    </div>

    <!-- Operational Tables Grid -->
    <div class="dashboard-grid-two-col">
      <!-- Critical & Unassigned Incidents -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Urgent Incidents (${criticalTickets.length})</h3>
          <a href="tickets.html?priority=CRITICAL" class="btn btn-outline btn-sm">View All Critical</a>
        </div>
        <div class="card-body card-body-flush">
          ${criticalTickets.length === 0 ? `
            <div class="empty-state">
              <div class="empty-state-title">No critical incidents</div>
              <div class="empty-state-desc">All systems operating within acceptable stability thresholds.</div>
            </div>
          ` : `
            <div class="table-responsive">
              <table class="data-table responsive-cards-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Technician</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${criticalTickets.slice(0, 5).map(t => `
                    <tr>
                      <td data-label="ID"><span class="ticket-id-tag">#TK-${String(t.id).padStart(4, '0')}</span></td>
                      <td data-label="Title"><strong>${t.title}</strong></td>
                      <td data-label="Category">${t.category}</td>
                      <td data-label="Status">${getStatusBadge(t.status)}</td>
                      <td data-label="Technician">${t.technician ? t.technician.fullName : '<span class="text-unassigned">Unassigned</span>'}</td>
                      <td data-label="Action"><a href="ticket-detail.html?id=${t.id}" class="btn btn-secondary btn-sm">Inspect</a></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>

      <!-- Technicians Roster Quick View -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">Technician Roster</h3>
          <a href="technicians.html" class="btn btn-secondary btn-sm">Manage</a>
        </div>
        <div class="card-body">
          <div class="tech-roster-list">
            ${technicians.length === 0 ? `
              <div class="empty-state-desc text-center">No technicians registered.</div>
            ` : technicians.map(tech => {
              const assignedCount = tickets.filter(t => t.technician && t.technician.id === tech.id && t.status !== 'CLOSED').length;
              return `
                <div class="tech-roster-item">
                  <div class="tech-roster-info">
                    <span class="tech-status-dot"></span>
                    <div>
                      <div class="tech-roster-name">${tech.fullName}</div>
                      <div class="tech-roster-email">${tech.email}</div>
                    </div>
                  </div>
                  <span class="badge badge-priority-medium">${assignedCount} Active</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render technician-specific dashboard view
 */
function renderTechnicianDashboard(container, summary, tickets, user) {
  const myTickets = tickets.filter(t => t.technician && t.technician.id === user.id);
  const activeCount = myTickets.filter(t => t.status === 'IN_PROGRESS').length;
  const pendingCount = myTickets.filter(t => t.status === 'ASSIGNED').length;
  const resolvedCount = myTickets.filter(t => t.status === 'RESOLVED').length;

  container.innerHTML = `
    <div class="metrics-grid">
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Assigned to Me</span>
          <div class="kpi-icon-wrapper">${Icons.tickets}</div>
        </div>
        <div class="kpi-value">${myTickets.length}</div>
        <div class="kpi-trend trend-neutral">Assigned backlog</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">In Progress</span>
          <div class="kpi-icon-wrapper icon-progress">${Icons.clock}</div>
        </div>
        <div class="kpi-value val-progress">${activeCount}</div>
        <div class="kpi-trend trend-warning">Under active investigation</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Pending Intake</span>
          <div class="kpi-icon-wrapper icon-assigned">${Icons.technicians}</div>
        </div>
        <div class="kpi-value val-assigned">${pendingCount}</div>
        <div class="kpi-trend trend-neutral">Awaiting start</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Resolved</span>
          <div class="kpi-icon-wrapper icon-resolved">${Icons.check}</div>
        </div>
        <div class="kpi-value val-resolved">${resolvedCount}</div>
        <div class="kpi-trend trend-up">Awaiting user confirmation</div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <h3 class="card-title">My Assigned Incident Queue</h3>
        <a href="tickets.html" class="btn btn-secondary btn-sm">Filter Queue</a>
      </div>
      <div class="card-body card-body-flush">
        ${myTickets.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${Icons.check}</div>
            <div class="empty-state-title">You have no pending assignments</div>
            <div class="empty-state-desc">You are all caught up on your technical support assignments.</div>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table responsive-cards-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Requester</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${myTickets.map(t => `
                  <tr>
                    <td data-label="ID"><span class="ticket-id-tag">#TK-${String(t.id).padStart(4, '0')}</span></td>
                    <td data-label="Title"><strong>${t.title}</strong></td>
                    <td data-label="Category">${t.category}</td>
                    <td data-label="Priority">${getPriorityBadge(t.priority)}</td>
                    <td data-label="Status">${getStatusBadge(t.status)}</td>
                    <td data-label="Requester">${t.requester ? t.requester.fullName : 'N/A'}</td>
                    <td data-label="Actions"><a href="ticket-detail.html?id=${t.id}" class="btn btn-primary btn-sm">Work Ticket</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Render user requester dashboard view
 */
function renderUserDashboard(container, summary, tickets, user) {
  const myRequests = tickets.filter(t => t.requester && t.requester.id === user.id);
  const openCount = myRequests.filter(t => t.status === 'OPEN').length;
  const inProgressCount = myRequests.filter(t => t.status === 'IN_PROGRESS' || t.status === 'ASSIGNED').length;
  const resolvedCount = myRequests.filter(t => t.status === 'RESOLVED').length;
  const closedCount = myRequests.filter(t => t.status === 'CLOSED').length;

  container.innerHTML = `
    <!-- Top Action Banner -->
    <div class="user-banner-cta">
      <div>
        <h2 class="user-banner-title">Need IT Assistance?</h2>
        <p class="user-banner-sub">Submit an incident ticket to receive prompt support from our tech team.</p>
      </div>
      <a href="create-ticket.html" class="btn btn-banner btn-lg" data-i18n="new_request">+ Submit New Request</a>
    </div>

    <!-- User KPI Metrics Grid -->
    <div class="metrics-grid">
      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Total Requests</span>
          <div class="kpi-icon-wrapper">${Icons.tickets}</div>
        </div>
        <div class="kpi-value">${myRequests.length}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Open Intake</span>
          <div class="kpi-icon-wrapper icon-open">${Icons.clock}</div>
        </div>
        <div class="kpi-value val-open">${openCount}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">In Progress</span>
          <div class="kpi-icon-wrapper icon-progress">${Icons.clock}</div>
        </div>
        <div class="kpi-value val-progress">${inProgressCount}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Resolved</span>
          <div class="kpi-icon-wrapper icon-resolved">${Icons.check}</div>
        </div>
        <div class="kpi-value val-resolved">${resolvedCount}</div>
      </div>

      <div class="kpi-card">
        <div class="kpi-card-header">
          <span class="kpi-label">Closed</span>
          <div class="kpi-icon-wrapper icon-closed">${Icons.shield}</div>
        </div>
        <div class="kpi-value val-closed">${closedCount}</div>
      </div>
    </div>

    <!-- User Requests List Table -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">My Support Requests</h3>
        <a href="create-ticket.html" class="btn btn-primary btn-sm" data-i18n="new_request">+ New Request</a>
      </div>
      <div class="card-body card-body-flush">
        ${myRequests.length === 0 ? `
          <div class="empty-state">
            <div class="empty-state-icon">${Icons.tickets}</div>
            <div class="empty-state-title">No support requests yet</div>
            <div class="empty-state-desc">You have not submitted any technical support tickets. Click below to submit your first issue.</div>
            <a href="create-ticket.html" class="btn btn-primary" data-i18n="new_request">+ Submit Request</a>
          </div>
        ` : `
          <div class="table-responsive">
            <table class="data-table responsive-cards-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                ${myRequests.map(t => `
                  <tr>
                    <td data-label="Ticket #"><span class="ticket-id-tag">#TK-${String(t.id).padStart(4, '0')}</span></td>
                    <td data-label="Title"><strong>${t.title}</strong></td>
                    <td data-label="Category">${t.category}</td>
                    <td data-label="Priority">${getPriorityBadge(t.priority)}</td>
                    <td data-label="Status">${getStatusBadge(t.status)}</td>
                    <td data-label="Date" class="text-muted">${formatDate(t.createdAt)}</td>
                    <td data-label="Action"><a href="ticket-detail.html?id=${t.id}" class="btn btn-secondary btn-sm">View Details</a></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}
      </div>
    </div>
  `;
}

/**
 * Pure SVG Donut Chart Renderer (Zero Chart.js dependency)
 */
function renderSvgDonutChart(summary) {
  const total = (summary.total || 1);
  const open = summary.open || 0;
  const assigned = summary.assigned || 0;
  const inProgress = summary.inProgress || 0;
  const resolved = summary.resolved || 0;
  const closed = summary.closed || 0;

  const radius = 60;
  const circumference = 2 * Math.PI * radius;

  const pOpen = (open / total) * circumference;
  const pAssigned = (assigned / total) * circumference;
  const pProg = (inProgress / total) * circumference;
  const pRes = (resolved / total) * circumference;
  const pClosed = (closed / total) * circumference;

  let offset = 0;
  const dashOpen = `${pOpen} ${circumference}`;
  const offsetOpen = -offset;
  offset += pOpen;

  const dashAssigned = `${pAssigned} ${circumference}`;
  const offsetAssigned = -offset;
  offset += pAssigned;

  const dashProg = `${pProg} ${circumference}`;
  const offsetProg = -offset;
  offset += pProg;

  const dashRes = `${pRes} ${circumference}`;
  const offsetRes = -offset;
  offset += pRes;

  const dashClosed = `${pClosed} ${circumference}`;
  const offsetClosed = -offset;

  return `
    <div class="chart-container">
      <div class="chart-svg-wrapper">
        <svg width="180" height="180" viewBox="0 0 160 160" class="chart-donut-svg">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(45, 212, 191, 0.12)" stroke-width="22" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-open)" stroke-width="22" stroke-dasharray="${dashOpen}" stroke-dashoffset="${offsetOpen}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-assigned)" stroke-width="22" stroke-dasharray="${dashAssigned}" stroke-dashoffset="${offsetAssigned}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-in-progress)" stroke-width="22" stroke-dasharray="${dashProg}" stroke-dashoffset="${offsetProg}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-resolved)" stroke-width="22" stroke-dasharray="${dashRes}" stroke-dashoffset="${offsetRes}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-closed)" stroke-width="22" stroke-dasharray="${dashClosed}" stroke-dashoffset="${offsetClosed}" />
        </svg>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color-box icon-open"></span> Open (${open})</div>
        <div class="legend-item"><span class="legend-color-box icon-assigned"></span> Assigned (${assigned})</div>
        <div class="legend-item"><span class="legend-color-box icon-progress"></span> In Progress (${inProgress})</div>
        <div class="legend-item"><span class="legend-color-box icon-resolved"></span> Resolved (${resolved})</div>
        <div class="legend-item"><span class="legend-color-box icon-closed"></span> Closed (${closed})</div>
      </div>
    </div>
  `;
}

/**
 * Pure SVG Priority Bar Chart Renderer
 */
function renderSvgPriorityBars(tickets) {
  const low = tickets.filter(t => t.priority === 'LOW').length;
  const med = tickets.filter(t => t.priority === 'MEDIUM').length;
  const high = tickets.filter(t => t.priority === 'HIGH').length;
  const crit = tickets.filter(t => t.priority === 'CRITICAL').length;
  const max = Math.max(low, med, high, crit, 1);

  return `
    <div class="chart-bar-list">
      <div>
        <div class="chart-bar-header">
          <span>LOW</span> <span>${low}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${(low / max) * 100}%; background-color: var(--priority-low);"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header">
          <span>MEDIUM</span> <span>${med}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${(med / max) * 100}%; background-color: var(--priority-medium);"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header">
          <span>HIGH</span> <span>${high}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${(high / max) * 100}%; background-color: var(--priority-high);"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header text-critical">
          <span>CRITICAL</span> <span>${crit}</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill" style="width: ${(crit / max) * 100}%; background-color: var(--priority-critical);"></div>
        </div>
      </div>
    </div>
  `;
}
