/**
 * CampusDesk Admin Console Delegate
 * Client: TechNova Solutions
 * Forwards legacy admin module to administration controller.
 */
'use strict';

// If loaded directly, ensure redirect or execution of administration logic
if (window.location.pathname.endsWith('admin.html')) {
  window.location.replace('pages/administration.html');
}
