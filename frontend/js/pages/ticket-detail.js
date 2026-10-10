/**
 * CampusDesk Ticket Detail Controller
 * Client: TechNova Solutions
 * Controls incident inspection, lifecycle step progression, comments thread,
 * technician assignment dialogs, immutable audit logs, and multi-language support.
 */
'use strict';

let currentTicket = null;
let currentTicketId = null;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  Navigation.render('nav-tickets');

  const params = new URLSearchParams(window.location.search);
  currentTicketId = params.get('id');

  if (!currentTicketId) {
    Toast.error('Invalid Request', 'No incident ticket ID specified.');
    setTimeout(() => { window.location.href = 'tickets.html'; }, 1000);
    return;
  }

  await loadTicketDetails();

  // Bind comment submission
  const postCommentBtn = document.getElementById('post-comment-btn');
  if (postCommentBtn) {
    postCommentBtn.addEventListener('click', handleAddComment);
  }
});

/**
 * Fetch and render comprehensive ticket data
 */
async function loadTicketDetails() {
  const skeleton = document.getElementById('detail-skeleton');
  const container = document.getElementById('detail-container');

  skeleton.classList.remove('d-none');
  container.classList.add('d-none');

  try {
    const [ticket, comments, history] = await Promise.all([
      apiFetch(`/tickets/${currentTicketId}`),
      apiFetch(`/tickets/${currentTicketId}/comments`).catch(() => []),
      apiFetch(`/tickets/${currentTicketId}/history`).catch(() => [])
    ]);

    currentTicket = ticket;
    renderTicketOverview(ticket);
    renderLifecycleStepper(ticket.status);
    renderComments(comments, ticket.status);
    renderAuditHistory(history);
    renderRoleActions(ticket);

    skeleton.classList.add('d-none');
    container.classList.remove('d-none');

    if (typeof I18n !== 'undefined') {
      I18n.translatePage();
    }

  } catch (err) {
    skeleton.classList.add('d-none');
    Toast.error('Error Loading Ticket', err.message || 'Unable to fetch incident details.');
  }
}

/**
 * Populate ticket metadata and problem description
 */
function renderTicketOverview(ticket) {
  const formattedId = `#TK-${String(ticket.id).padStart(4, '0')}`;
  document.getElementById('ticket-header-id').textContent = `Incident ${formattedId}`;
  document.getElementById('detail-id-tag').textContent = formattedId;
  document.getElementById('detail-title').textContent = ticket.title;
  document.getElementById('detail-category-badge').textContent = ticket.category;
  document.getElementById('detail-priority-badge').innerHTML = getPriorityBadge(ticket.priority);
  document.getElementById('detail-status-badge').innerHTML = getStatusBadge(ticket.status);

  document.getElementById('detail-date-reported').textContent = `Reported: ${formatDate(ticket.createdAt)}`;
  document.getElementById('detail-description-body').textContent = ticket.description;

  document.getElementById('meta-requester-name').textContent = ticket.requester ? ticket.requester.fullName : 'Unknown Requester';
  document.getElementById('meta-technician-name').innerHTML = ticket.technician
    ? `<strong>${ticket.technician.fullName}</strong>`
    : '<span class="text-unassigned">Unassigned</span>';
  document.getElementById('meta-created-at').textContent = formatDate(ticket.createdAt);
  document.getElementById('meta-updated-at').textContent = formatDate(ticket.updatedAt);
  document.getElementById('meta-status-badge').innerHTML = getStatusBadge(ticket.status);
}

/**
 * Update the visual lifecycle progress stepper
 */
function renderLifecycleStepper(currentStatus) {
  const steps = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];
  const currentIndex = steps.indexOf(currentStatus);
  const fillPercentage = currentIndex >= 0 ? (currentIndex / (steps.length - 1)) * 100 : 0;

  const fillEl = document.getElementById('stepper-fill');
  if (fillEl) fillEl.style.width = `${fillPercentage}%`;

  steps.forEach((step, index) => {
    const el = document.getElementById(`step-${step}`);
    if (!el) return;

    el.classList.remove('active', 'completed');
    const node = el.querySelector('.step-node');

    if (index < currentIndex) {
      el.classList.add('completed');
      if (node) node.innerHTML = '✓';
    } else if (index === currentIndex) {
      el.classList.add('active');
      if (node) node.textContent = index + 1;
    } else {
      if (node) node.textContent = index + 1;
    }
  });
}

/**
 * Render conversation comments thread
 */
function renderComments(comments, status) {
  const thread = document.getElementById('comments-thread');
  const countBadge = document.getElementById('comments-count-badge');
  const inputArea = document.getElementById('comment-input-area');
  const closedNotice = document.getElementById('comment-closed-notice');

  countBadge.textContent = `${comments.length} Comments`;

  // Disable commenting if ticket is CLOSED per business rules
  if (status === 'CLOSED') {
    inputArea.classList.add('d-none');
    closedNotice.classList.remove('d-none');
  } else {
    inputArea.classList.remove('d-none');
    closedNotice.classList.add('d-none');
  }

  if (comments.length === 0) {
    thread.innerHTML = `
      <div class="empty-state-desc text-center">
        No discussion notes posted yet. Add a comment below to start technical triage.
      </div>
    `;
    return;
  }

  thread.innerHTML = comments.map(c => {
    const role = c.author && c.author.role ? c.author.role : 'USER';
    const roleCss = role === 'ADMIN' ? 'role-admin' : (role === 'TECHNICIAN' ? 'role-tech' : 'role-user');
    const authorName = c.author ? c.author.fullName : 'System User';
    const initials = authorName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

    return `
      <div class="comment-card ${roleCss}">
        <div class="comment-avatar">${initials}</div>
        <div class="w-100">
          <div class="comment-header-row">
            <div class="comment-author-name">
              <span>${authorName}</span>
              <span class="badge badge-priority-medium">${role}</span>
            </div>
            <div class="comment-timestamp">${formatDate(c.createdAt)}</div>
          </div>
          <div class="comment-body-text">${c.content}</div>
        </div>
      </div>
    `;
  }).join('');
}

/**
 * Post new comment to the conversation
 */
async function handleAddComment() {
  const textarea = document.getElementById('new-comment-text');
  const content = textarea.value.trim();

  if (!content) {
    Toast.warning('Validation', 'Please enter comment text before submitting.');
    return;
  }

  const postBtn = document.getElementById('post-comment-btn');
  postBtn.disabled = true;

  try {
    await apiFetch(`/tickets/${currentTicketId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });

    textarea.value = '';
    Toast.success('Comment Posted', 'Your technical note was added to the conversation.');
    
    // Refresh comments and audit timeline
    const [comments, history] = await Promise.all([
      apiFetch(`/tickets/${currentTicketId}/comments`),
      apiFetch(`/tickets/${currentTicketId}/history`).catch(() => [])
    ]);
    renderComments(comments, currentTicket.status);
    renderAuditHistory(history);

  } catch (err) {
    Toast.error('Comment Failed', err.message || 'Unable to post comment.');
  } finally {
    postBtn.disabled = false;
  }
}

/**
 * Render immutable status audit timeline
 */
function renderAuditHistory(history) {
  const timeline = document.getElementById('history-timeline');

  if (history.length === 0) {
    timeline.innerHTML = `
      <div class="empty-state-desc">
        Initial intake record created with status OPEN.
      </div>
    `;
    return;
  }

  timeline.innerHTML = history.map(h => {
    const actorName = h.changedBy ? h.changedBy.fullName : 'Authorized User';
    const transitionText = h.previousStatus
      ? `${h.previousStatus} → <strong>${h.newStatus}</strong>`
      : `Initial Intake: <strong>${h.newStatus}</strong>`;

    return `
      <div class="history-item">
        <div class="history-date">${formatDate(h.changedAt)}</div>
        <div class="history-change">${transitionText}</div>
        <div class="history-actor">Actor: ${actorName}</div>
      </div>
    `;
  }).join('');
}

/**
 * Render role-specific action buttons
 */
function renderRoleActions(ticket) {
  const panel = document.getElementById('role-actions-panel');
  const user = Auth.getCurrentUser();

  if (ticket.status === 'CLOSED') {
    panel.innerHTML = `
      <div class="text-center">
        <span class="badge badge-status-closed">CLOSED</span>
        <p class="empty-state-desc">This incident is archived. No further workflow actions can be executed.</p>
      </div>
    `;
    return;
  }

  let actionsHtml = '';

  // ADMIN Actions: Technician Assignment / Reassignment
  if (user.role === 'ADMIN') {
    const isAssigned = !!ticket.technician;
    actionsHtml += `
      <div class="d-flex flex-column gap-12">
        <p class="activity-meta">
          ${isAssigned ? 'Reassign this incident to another qualified technician.' : 'Assign a designated specialist to triage and resolve this ticket.'}
        </p>
        <button id="btn-assign-technician" class="btn btn-primary w-100">
          ${isAssigned ? 'Reassign Technician' : 'Assign Technician'}
        </button>
      </div>
    `;
  }

  // TECHNICIAN Actions: Lifecycle State Progression
  if (user.role === 'TECHNICIAN' && ticket.technician && ticket.technician.id === user.id) {
    if (ticket.status === 'ASSIGNED') {
      actionsHtml += `
        <div class="d-flex flex-column gap-12">
          <p class="activity-meta">Begin active diagnostic investigation and troubleshooting.</p>
          <button id="btn-start-progress" class="btn btn-primary w-100">
            Start Working (IN PROGRESS)
          </button>
        </div>
      `;
    } else if (ticket.status === 'IN_PROGRESS') {
      actionsHtml += `
        <div class="d-flex flex-column gap-12">
          <p class="activity-meta">Mark this ticket as resolved and await requester verification.</p>
          <button id="btn-resolve-ticket" class="btn btn-primary btn-resolve-ticket w-100">
            Mark as Resolved (RESOLVED)
          </button>
        </div>
      `;
    }
  }

  // USER Actions: Verify and Close Ticket
  if (user.role === 'USER' && ticket.requester && ticket.requester.id === user.id) {
    if (ticket.status === 'RESOLVED') {
      actionsHtml += `
        <div class="d-flex flex-column gap-12">
          <p class="activity-meta">The technician has reported this issue as resolved. Please verify and confirm closure.</p>
          <button id="btn-close-ticket" class="btn btn-secondary btn-close-ticket w-100">
            Confirm Resolution & Close (CLOSED)
          </button>
        </div>
      `;
    } else if (ticket.status === 'OPEN' && !ticket.technician) {
      actionsHtml += `
        <div class="d-flex flex-column gap-12">
          <p class="empty-state-desc">Your ticket is awaiting assignment by an administrator.</p>
        </div>
      `;
    }
  }

  panel.innerHTML = actionsHtml || `
    <div class="empty-state-desc text-center">
      No operational actions required from your role at this stage.
    </div>
  `;

  // Attach event handlers for actions
  document.getElementById('btn-assign-technician')?.addEventListener('click', openAssignmentModal);
  document.getElementById('btn-start-progress')?.addEventListener('click', () => updateTicketStatus('IN_PROGRESS'));
  document.getElementById('btn-resolve-ticket')?.addEventListener('click', () => updateTicketStatus('RESOLVED'));
  document.getElementById('btn-close-ticket')?.addEventListener('click', confirmCloseTicket);
}

/**
 * Open assignment modal dialog for Administrator
 */
async function openAssignmentModal() {
  try {
    const technicians = await apiFetch('/users/technicians');
    
    if (technicians.length === 0) {
      Toast.warning('No Technicians', 'There are no active technicians available for dispatch.');
      return;
    }

    const currentTechId = currentTicket.technician ? currentTicket.technician.id : '';

    const optionsHtml = technicians.map(t => `
      <option value="${t.id}" ${t.id === currentTechId ? 'selected' : ''}>
        ${t.fullName} (${t.email})
      </option>
    `).join('');

    const modalContent = `
      <p class="activity-meta mb-16">
        Select an authorized technician to take ownership of incident <strong>#TK-${String(currentTicket.id).padStart(4, '0')}</strong>:
      </p>
      <div class="form-group">
        <label class="form-label" for="modal-tech-select">Designated Technician</label>
        <select id="modal-tech-select" class="form-select">
          ${optionsHtml}
        </select>
      </div>
    `;

    Modal.open({
      title: currentTicket.technician ? 'Reassign Incident Technician' : 'Assign Incident Technician',
      content: modalContent,
      confirmText: 'Confirm Assignment',
      onConfirm: async () => {
        const select = document.getElementById('modal-tech-select');
        const technicianId = parseInt(select.value, 10);
        
        try {
          await apiFetch(`/tickets/${currentTicketId}/assign`, {
            method: 'PATCH',
            body: JSON.stringify({ technicianId })
          });
          Toast.success('Assignment Updated', 'The technician was assigned to this ticket successfully.');
          await loadTicketDetails();
        } catch (err) {
          Toast.error('Assignment Error', err.message || 'Failed to update technician.');
        }
      }
    });

  } catch (err) {
    Toast.error('Error', 'Unable to fetch available technicians.');
  }
}

/**
 * Update ticket lifecycle status
 */
async function updateTicketStatus(newStatus) {
  try {
    await apiFetch(`/tickets/${currentTicketId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status: newStatus })
    });
    Toast.success('Status Updated', `Incident status advanced to ${newStatus}.`);
    await loadTicketDetails();
  } catch (err) {
    Toast.error('Transition Error', err.message || 'Status transition not permitted.');
  }
}

/**
 * Confirmation dialog for closing resolved ticket
 */
function confirmCloseTicket() {
  Modal.open({
    title: 'Confirm Ticket Closure',
    content: '<p>Are you satisfied with the solution provided? Confirming closure will permanently archive this incident.</p>',
    confirmText: 'Confirm & Close',
    cancelText: 'Cancel',
    onConfirm: async () => {
      await updateTicketStatus('CLOSED');
    }
  });
}
