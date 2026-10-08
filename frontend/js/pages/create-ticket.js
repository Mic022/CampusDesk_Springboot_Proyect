/**
 * CampusDesk Create Ticket Controller
 * Client: TechNova Solutions
 * Validates ticket intake specifications and submits new incidents to Spring Boot REST API.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;

  Navigation.render('nav-create-ticket');

  const form = document.getElementById('create-ticket-form');
  const titleInput = document.getElementById('ticket-title');
  const categorySelect = document.getElementById('ticket-category');
  const prioritySelect = document.getElementById('ticket-priority');
  const descInput = document.getElementById('ticket-description');
  const submitBtn = document.getElementById('submit-ticket-btn');
  const btnText = document.getElementById('btn-text');
  const btnSpinner = document.getElementById('btn-spinner');

  function clearErrors() {
    document.querySelectorAll('.form-error-msg').forEach(el => el.style.display = 'none');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors();

    const title = titleInput.value.trim();
    const category = categorySelect.value;
    const priority = prioritySelect.value;
    const description = descInput.value.trim();

    let hasError = false;

    // Validate title bounds (5 to 150 chars per API contract)
    if (!title || title.length < 5 || title.length > 150) {
      document.getElementById('title-error').style.display = 'block';
      hasError = true;
    }

    // Validate category selection
    if (!category) {
      document.getElementById('category-error').style.display = 'block';
      hasError = true;
    }

    // Validate priority selection
    if (!priority) {
      document.getElementById('priority-error').style.display = 'block';
      hasError = true;
    }

    // Validate description bounds (10 to 2000 chars per API contract)
    if (!description || description.length < 10 || description.length > 2000) {
      document.getElementById('desc-error').style.display = 'block';
      hasError = true;
    }

    if (hasError) return;

    // Set loading indicator
    submitBtn.disabled = true;
    btnText.style.display = 'none';
    btnSpinner.style.display = 'inline-block';

    try {
      const newTicket = await apiFetch('/tickets', {
        method: 'POST',
        body: JSON.stringify({
          title,
          category,
          priority,
          description
        })
      });

      Toast.success('Incident Created', `Ticket #TK-${String(newTicket.id).padStart(4, '0')} has been registered.`);
      
      setTimeout(() => {
        window.location.href = `ticket-detail.html?id=${newTicket.id}`;
      }, 900);

    } catch (err) {
      Toast.error('Submission Failed', err.message || 'Unable to register support ticket.');
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnSpinner.style.display = 'none';
    }
  });
});
