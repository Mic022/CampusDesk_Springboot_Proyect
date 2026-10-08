/**
 * CampusDesk Statistics Page Controller
 * Client: TechNova Solutions
 * Generates pure SVG and CSS vector analytics without any external chart libraries.
 */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ADMIN'])) return;

  Navigation.render('nav-statistics');

  try {
    const [summary, tickets] = await Promise.all([
      apiFetch('/reports/summary').catch(() => ({ total: 0, open: 0, assigned: 0, inProgress: 0, resolved: 0, closed: 0 })),
      apiFetch('/tickets').catch(() => [])
    ]);

    renderKPIs(summary);
    renderDonutChart(summary);
    renderPriorityDistribution(tickets);
    renderCategoryBreakdown(tickets);

    if (window.I18n) {
      I18n.translatePage();
    }

    if (typeof Animations !== 'undefined') {
      Animations.animateNumbers();
    }

  } catch (err) {
    Toast.error('Analytics Error', err.message || 'Unable to load statistics.');
  }
});

function renderKPIs(summary) {
  const container = document.getElementById('stats-kpi-grid');
  container.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Total Volume</span><div class="kpi-icon-wrapper">${Icons.tickets}</div></div>
      <div class="kpi-value">${summary.total || 0}</div>
      <div class="kpi-trend trend-up">All-time tracked</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Open</span><div class="kpi-icon-wrapper kpi-open">${Icons.clock}</div></div>
      <div class="kpi-value kpi-open">${summary.open || 0}</div>
      <div class="kpi-trend trend-warning">Unassigned triage</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Assigned</span><div class="kpi-icon-wrapper kpi-assigned">${Icons.technicians}</div></div>
      <div class="kpi-value kpi-assigned">${summary.assigned || 0}</div>
      <div class="kpi-trend trend-neutral">Specialist dispatched</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">In Progress</span><div class="kpi-icon-wrapper kpi-in-progress">${Icons.clock}</div></div>
      <div class="kpi-value kpi-in-progress">${summary.inProgress || 0}</div>
      <div class="kpi-trend trend-warning">Active repairs</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Resolved</span><div class="kpi-icon-wrapper kpi-resolved">${Icons.check}</div></div>
      <div class="kpi-value kpi-resolved">${summary.resolved || 0}</div>
      <div class="kpi-trend trend-up">Awaiting user check</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Closed</span><div class="kpi-icon-wrapper kpi-closed">${Icons.shield}</div></div>
      <div class="kpi-value kpi-closed">${summary.closed || 0}</div>
      <div class="kpi-trend trend-neutral">Archived success</div>
    </div>
  `;
}

function renderDonutChart(summary) {
  const container = document.getElementById('status-donut-container');
  const total = summary.total || 1;
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

  container.innerHTML = `
    <div class="chart-container">
      <div class="chart-svg-wrapper">
        <svg class="chart-donut-svg" width="200" height="200" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="rgba(168, 85, 247, 0.14)" stroke-width="22" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-open)" stroke-width="22" stroke-dasharray="${dashOpen}" stroke-dashoffset="${offsetOpen}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-assigned)" stroke-width="22" stroke-dasharray="${dashAssigned}" stroke-dashoffset="${offsetAssigned}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-in-progress)" stroke-width="22" stroke-dasharray="${dashProg}" stroke-dashoffset="${offsetProg}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-resolved)" stroke-width="22" stroke-dasharray="${dashRes}" stroke-dashoffset="${offsetRes}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-closed)" stroke-width="22" stroke-dasharray="${dashClosed}" stroke-dashoffset="${offsetClosed}" />
        </svg>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color-box legend-color-open"></span> Open (${open})</div>
        <div class="legend-item"><span class="legend-color-box legend-color-assigned"></span> Assigned (${assigned})</div>
        <div class="legend-item"><span class="legend-color-box legend-color-in-progress"></span> In Progress (${inProgress})</div>
        <div class="legend-item"><span class="legend-color-box legend-color-resolved"></span> Resolved (${resolved})</div>
        <div class="legend-item"><span class="legend-color-box legend-color-closed"></span> Closed (${closed})</div>
      </div>
    </div>
  `;
}

function renderPriorityDistribution(tickets) {
  const container = document.getElementById('priority-bar-container');
  const low = tickets.filter(t => t.priority === 'LOW').length;
  const med = tickets.filter(t => t.priority === 'MEDIUM').length;
  const high = tickets.filter(t => t.priority === 'HIGH').length;
  const crit = tickets.filter(t => t.priority === 'CRITICAL').length;
  const total = tickets.length || 1;

  container.innerHTML = `
    <div class="chart-bar-list">
      <div>
        <div class="chart-bar-header">
          <span>LOW SEVERITY</span>
          <span>${low} (${Math.round((low/total)*100)}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill bg-priority-low" style="width: ${(low/total)*100}%;"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header">
          <span>MEDIUM SEVERITY</span>
          <span>${med} (${Math.round((med/total)*100)}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill bg-priority-medium" style="width: ${(med/total)*100}%;"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header">
          <span>HIGH SEVERITY</span>
          <span>${high} (${Math.round((high/total)*100)}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill bg-priority-high" style="width: ${(high/total)*100}%;"></div>
        </div>
      </div>

      <div>
        <div class="chart-bar-header text-critical">
          <span>CRITICAL OUTAGE</span>
          <span>${crit} (${Math.round((crit/total)*100)}%)</span>
        </div>
        <div class="chart-bar-track">
          <div class="chart-bar-fill bg-priority-critical" style="width: ${(crit/total)*100}%;"></div>
        </div>
      </div>
    </div>
  `;
}

function renderCategoryBreakdown(tickets) {
  const container = document.getElementById('category-breakdown-container');
  const categories = ['HARDWARE', 'SOFTWARE', 'NETWORK', 'ACCESS', 'OTHER'];
  const total = tickets.length || 1;

  container.innerHTML = `
    <div class="category-breakdown-grid">
      ${categories.map(cat => {
        const count = tickets.filter(t => t.category === cat).length;
        const pct = Math.round((count / total) * 100);
        return `
          <div class="category-stat-card">
            <div class="category-stat-title">${cat}</div>
            <div class="category-stat-count">${count}</div>
            <div class="category-stat-sub">${pct}% of incident volume</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
