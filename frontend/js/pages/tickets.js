/**
 * CampusDesk Tickets Page Controller
 * Client: TechNova Solutions
 * Controls multi-parameter filtering, search queries, table rendering, and responsive ticket inspection.
 */
'use strict';

let allFetchedTickets = [];

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  const user = Auth.getCurrentUser();
  Navigation.render('nav-tickets');

  // Personalize title based on authenticated role
  const titleEl = document.getElementById('tickets-view-title');
  const descEl = document.getElementById('tickets-view-desc');
  if (user.role === 'ADMIN') {
    titleEl.textContent = 'Incident Desk';
    descEl.textContent = 'Global incident queue, triage routing, and escalation management';
  } else if (user.role === 'TECHNICIAN') {
    titleEl.textContent = 'Assigned Tickets';
    descEl.textContent = 'Support incidents assigned to your technical queue';
  } else {
    titleEl.textContent = 'My Support Requests';
    descEl.textContent = 'Review status updates and history of your submitted requests';
  }

  // Bind UI Filter Elements
  const searchInput = document.getElementById('filter-search');
  const statusSelect = document.getElementById('filter-status');
  const prioritySelect = document.getElementById('filter-priority');
  const categorySelect = document.getElementById('filter-category');
  const resetBtn = document.getElementById('btn-reset-filters');
  const emptyClearBtn = document.getElementById('empty-clear-btn');

  // Parse initial query params from URL (e.g. ?priority=CRITICAL)
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('status')) statusSelect.value = urlParams.get('status');
  if (urlParams.get('priority')) prioritySelect.value = urlParams.get('priority');
  if (urlParams.get('category')) categorySelect.value = urlParams.get('category');
  if (urlParams.get('search')) searchInput.value = urlParams.get('search');

  // Event Listeners for Filters
  statusSelect.addEventListener('change', () => loadTickets());
  prioritySelect.addEventListener('change', () => loadTickets());
  categorySelect.addEventListener('change', () => loadTickets());
  searchInput.addEventListener('input', () => applyClientFilters());

  const resetAllFilters = () => {
    searchInput.value = '';
    statusSelect.value = '';
    prioritySelect.value = '';
    categorySelect.value = '';
    window.history.replaceState({}, document.title, window.location.pathname);
    loadTickets();
  };

  resetBtn.addEventListener('click', resetAllFilters);
  if (emptyClearBtn) emptyClearBtn.addEventListener('click', resetAllFilters);

  // Initial load
  await loadTickets();
});

/**
 * Fetch tickets matching server query parameters
 */
async function loadTickets() {
  const status = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;
  const category = document.getElementById('filter-category').value;

  const skeleton = document.getElementById('tickets-skeleton');
  const tableContainer = document.getElementById('tickets-table-container');
  const emptyState = document.getElementById('tickets-empty');

  skeleton.classList.remove('d-none');
  tableContainer.classList.add('d-none');
  emptyState.classList.add('d-none');

  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (priority) params.append('priority', priority);
  if (category) params.append('category', category);

  const endpoint = `/tickets${params.toString() ? '?' + params.toString() : ''}`;

  try {
    const data = await apiFetch(endpoint);
    allFetchedTickets = Array.isArray(data) ? data : [];
    skeleton.classList.add('d-none');
    applyClientFilters();
  } catch (err) {
    skeleton.classList.add('d-none');
    Toast.error('Load Failed', err.message || 'Unable to retrieve tickets.');
  }
}

/**
 * Filter tickets in-memory for instant search typing response
 */
function applyClientFilters() {
  const searchTerm = document.getElementById('filter-search').value.trim().toLowerCase();
  const tableContainer = document.getElementById('tickets-table-container');
  const tableBody = document.getElementById('tickets-table-body');
  const emptyState = document.getElementById('tickets-empty');
  const countBadge = document.getElementById('tickets-count-badge');

  let filtered = allFetchedTickets;

  if (searchTerm) {
    filtered = filtered.filter(t => {
      const idStr = `tk-${t.id}`.toLowerCase();
      const titleStr = (t.title || '').toLowerCase();
      const descStr = (t.description || '').toLowerCase();
      return idStr.includes(searchTerm) || titleStr.includes(searchTerm) || descStr.includes(searchTerm);
    });
  }

  countBadge.textContent = `All Incidents (${filtered.length})`;

  if (filtered.length === 0) {
    tableContainer.classList.add('d-none');
    emptyState.classList.remove('d-none');
    return;
  }

  emptyState.classList.add('d-none');
  tableContainer.classList.remove('d-none');

  tableBody.innerHTML = filtered.map(t => {
    const formattedId = `#TK-${String(t.id).padStart(4, '0')}`;
    const techName = t.technician ? t.technician.fullName : '<span class="text-unassigned">Unassigned</span>';

    return `
      <tr>
        <td data-label="ID"><span class="ticket-id-tag">${formattedId}</span></td>
        <td data-label="Title">
          <a href="ticket-detail.html?id=${t.id}" class="ticket-title-link">${t.title}</a>
        </td>
        <td data-label="Category"><span class="ticket-category-tag">${t.category}</span></td>
        <td data-label="Priority">${getPriorityBadge(t.priority)}</td>
        <td data-label="Status">${getStatusBadge(t.status)}</td>
        <td data-label="Assigned Tech">${techName}</td>
        <td data-label="Date" class="text-muted">${formatDate(t.createdAt)}</td>
        <td data-label="Action">
          <a href="ticket-detail.html?id=${t.id}" class="btn btn-secondary btn-sm">Inspect</a>
        </td>
      </tr>
    `;
  }).join('');

  if (typeof I18n !== 'undefined') {
    I18n.translateDOM();
  }
}
