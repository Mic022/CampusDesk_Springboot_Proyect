/**
 * CampusDesk Profile Page Controller
 * Client: TechNova Solutions
 * Renders verified user information and handles secure session sign out.
 */
'use strict';

document.addEventListener('DOMContentLoaded', () => {
  if (!Auth.requireAuth()) return;

  Navigation.render('nav-profile');

  const user = Auth.getCurrentUser();
  if (!user) return;

  const names = (user.fullName || 'User').split(' ');
  const firstName = names[0] || 'User';
  const lastName = names.slice(1).join(' ') || 'Account';
  const initials = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase();

  document.getElementById('profile-avatar-large').textContent = initials;
  document.getElementById('profile-name-header').textContent = user.fullName;
  document.getElementById('profile-role-badge').textContent = user.role;
  document.getElementById('profile-first-name').textContent = firstName;
  document.getElementById('profile-last-name').textContent = lastName;
  document.getElementById('profile-email').textContent = user.email;
  document.getElementById('profile-role-text').textContent = `${user.role} Authority Access`;

  document.getElementById('profile-logout-btn')?.addEventListener('click', () => {
    Auth.logout();
  });

  if (window.I18n) {
    I18n.translatePage();
  }
});
