/**
 * CampusDesk Technicians Page Controller
 * Client: TechNova Solutions
 * Renders technical staff roster, calculates workload capacity, and provides workload links.
 */
'use strict';

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth(['ADMIN'])) return;

  Navigation.render('nav-technicians');

  const container = document.getElementById('technicians-grid');
  const countHeader = document.getElementById('tech-header-count');

  try {
    const [technicians, tickets] = await Promise.all([
      apiFetch('/users/technicians').catch(() => []),
      apiFetch('/tickets').catch(() => [])
    ]);

    countHeader.textContent = `Active Technical Staff (${technicians.length})`;

    if (technicians.length === 0) {
      container.innerHTML = `
        <div class="empty-tech-state">
          No technicians currently registered in the system.
        </div>
      `;
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
                <span>Active Workload</span>
                <span>${activeTickets.length} / 5 Assigned</span>
              </div>
              <div class="workload-bar-track">
                <div class="workload-bar-fill ${meterClass}" style="width: ${loadPercent}%;"></div>
              </div>
            </div>
          </div>

          <div class="tech-card-action">
            <a href="tickets.html" class="btn btn-secondary btn-sm w-100">
              Inspect Assigned Incidents
            </a>
          </div>
        </div>
      `;
    }).join('');

    if (window.I18n) {
      I18n.translatePage();
    }

  } catch (err) {
    Toast.error('Load Error', err.message || 'Unable to retrieve technicians roster.');
  }
});
