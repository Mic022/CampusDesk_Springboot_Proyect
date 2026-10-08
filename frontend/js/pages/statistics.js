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
      <div class="kpi-card-header"><span class="kpi-label">Open</span><div class="kpi-icon-wrapper" style="color: var(--status-open);">${Icons.clock}</div></div>
      <div class="kpi-value" style="color: var(--status-open);">${summary.open || 0}</div>
      <div class="kpi-trend trend-warning">Unassigned triage</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Assigned</span><div class="kpi-icon-wrapper" style="color: var(--status-assigned);">${Icons.technicians}</div></div>
      <div class="kpi-value" style="color: var(--status-assigned);">${summary.assigned || 0}</div>
      <div class="kpi-trend trend-neutral">Specialist dispatched</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">In Progress</span><div class="kpi-icon-wrapper" style="color: var(--status-in-progress);">${Icons.clock}</div></div>
      <div class="kpi-value" style="color: var(--status-in-progress);">${summary.inProgress || 0}</div>
      <div class="kpi-trend trend-warning">Active repairs</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Resolved</span><div class="kpi-icon-wrapper" style="color: var(--status-resolved);">${Icons.check}</div></div>
      <div class="kpi-value" style="color: var(--status-resolved);">${summary.resolved || 0}</div>
      <div class="kpi-trend trend-up">Awaiting user check</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-card-header"><span class="kpi-label">Closed</span><div class="kpi-icon-wrapper" style="color: var(--status-closed);">${Icons.shield}</div></div>
      <div class="kpi-value" style="color: var(--status-closed);">${summary.closed || 0}</div>
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
        <svg width="200" height="200" viewBox="0 0 160 160" style="transform: rotate(-90deg);">
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="#f1f5f9" stroke-width="22" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-open)" stroke-width="22" stroke-dasharray="${dashOpen}" stroke-dashoffset="${offsetOpen}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-assigned)" stroke-width="22" stroke-dasharray="${dashAssigned}" stroke-dashoffset="${offsetAssigned}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-in-progress)" stroke-width="22" stroke-dasharray="${dashProg}" stroke-dashoffset="${offsetProg}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-resolved)" stroke-width="22" stroke-dasharray="${dashRes}" stroke-dashoffset="${offsetRes}" />
          <circle cx="80" cy="80" r="${radius}" fill="none" stroke="var(--status-closed)" stroke-width="22" stroke-dasharray="${dashClosed}" stroke-dashoffset="${offsetClosed}" />
        </svg>
      </div>
      <div class="chart-legend">
        <div class="legend-item"><span class="legend-color-box" style="background: var(--status-open);"></span> Open (${open})</div>
        <div class="legend-item"><span class="legend-color-box" style="background: var(--status-assigned);"></span> Assigned (${assigned})</div>
        <div class="legend-item"><span class="legend-color-box" style="background: var(--status-in-progress);"></span> In Progress (${inProgress})</div>
        <div class="legend-item"><span class="legend-color-box" style="background: var(--status-resolved);"></span> Resolved (${resolved})</div>
        <div class="legend-item"><span class="legend-color-box" style="background: var(--status-closed);"></span> Closed (${closed})</div>
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
    <div style="display: flex; flex-direction: column; gap: 16px; padding: 12px 0;">
      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px;">
          <span>LOW SEVERITY</span>
          <span>${low} (${Math.round((low/total)*100)}%)</span>
        </div>
        <div style="height: 10px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${(low/total)*100}%; background: var(--priority-low);"></div>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px;">
          <span>MEDIUM SEVERITY</span>
          <span>${med} (${Math.round((med/total)*100)}%)</span>
        </div>
        <div style="height: 10px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${(med/total)*100}%; background: var(--priority-medium);"></div>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px;">
          <span>HIGH SEVERITY</span>
          <span>${high} (${Math.round((high/total)*100)}%)</span>
        </div>
        <div style="height: 10px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${(high/total)*100}%; background: var(--priority-high);"></div>
        </div>
      </div>

      <div>
        <div style="display: flex; justify-content: space-between; font-size: 0.82rem; font-weight: 700; margin-bottom: 6px;">
          <span style="color: var(--priority-critical);">CRITICAL OUTAGE</span>
          <span style="color: var(--priority-critical); font-weight: 800;">${crit} (${Math.round((crit/total)*100)}%)</span>
        </div>
        <div style="height: 10px; background: var(--bg-subtle); border-radius: var(--radius-full); overflow: hidden;">
          <div style="height: 100%; width: ${(crit/total)*100}%; background: var(--priority-critical);"></div>
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
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px;">
      ${categories.map(cat => {
        const count = tickets.filter(t => t.category === cat).length;
        const pct = Math.round((count / total) * 100);
        return `
          <div style="padding: 16px; border: 1px solid var(--border-color); border-radius: var(--radius-sm); background: var(--bg-subtle);">
            <div style="font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">${cat}</div>
            <div style="font-size: 1.6rem; font-weight: 800; color: var(--text-main); margin: 6px 0;">${count}</div>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${pct}% of incident volume</div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}
