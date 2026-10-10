/**
 * CampusDesk Internationalization (i18n) Engine
 * Client: TechNova Solutions
 * Provides multi-language translations (English, Spanish, Portuguese, French, German)
 * and dynamic UI language switching across all pages.
 */
'use strict';

const I18n = {
  currentLang: localStorage.getItem('campusdesk_lang') || 'en',

  languages: [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'pt', label: 'Português', flag: '🇧🇷' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'de', label: 'Deutsch', flag: '🇩🇪' }
  ],

  translations: {
    en: {
      brand_sub: 'Smart IT Support Management',
      sign_in: 'Sign In',
      create_account: 'Create Account',
      sign_out: 'Sign Out',
      welcome_back: 'Welcome back',
      login_sub: 'Enter your corporate credentials to access the support portal',
      email_label: 'Corporate Email',
      password_label: 'Password',
      confirm_password_label: 'Confirm Password',
      first_name_label: 'First Name',
      last_name_label: 'Last Name',
      demo_quick_login: 'Demo Quick Sign-In',
      dont_have_account: "Don't have an account?",
      already_have_account: 'Already have an account?',
      register_title: 'Create account',
      register_sub: 'Register your corporate profile for IT support services',
      security_notice: 'Security Notice: Administrative and technician privileges are provisioned exclusively through authorized IT governance channels.',
      hero_badge: '● Enterprise IT Service Management',
      hero_heading: 'Your tech support, smarter and more organized.',
      hero_subtext: 'CAMPUSDESK delivers modern centralized incident tracking, real-time workload orchestration, and role-based operational transparency for TechNova Solutions.',
      hero_cta_portal: 'Sign In to Portal',
      hero_cta_request: 'Submit a Request',
      benefits_tag: 'Enterprise Capabilities',
      benefits_heading: 'Designed for High-Reliability Operations',
      benefit_1_title: 'Incident Management',
      benefit_1_desc: 'Centralize hardware, software, network, and access control tickets in one structured workspace.',
      benefit_2_title: 'Real-Time Tracking',
      benefit_2_desc: 'Monitor live status changes from initial intake through technical diagnostics to final verification.',
      benefit_3_title: 'Technician Dispatch',
      benefit_3_desc: 'Administrators balance workloads with transparent capacity meters and instant task assignment.',
      benefit_4_title: 'Complete Audit History',
      benefit_4_desc: 'Maintain an immutable, timestamped audit trail of every status transition and responsible actor.',
      benefit_5_title: 'Role-Based Security',
      benefit_5_desc: 'Strict separation of duties across Administrators, Field Technicians, and Business Requesters.',
      benefit_6_title: 'Operational Statistics',
      benefit_6_desc: 'Visualize incident volume, resolution velocity, and priority distributions with clean analytics.',
      workflow_tag: 'Workflow Governance',
      workflow_heading: 'Structured Ticket Lifecycle',
      step_open_name: 'OPEN',
      step_open_desc: 'User submits issue with priority & details',
      step_assigned_name: 'ASSIGNED',
      step_assigned_desc: 'Admin assigns designated technician',
      step_progress_name: 'IN PROGRESS',
      step_progress_desc: 'Technician conducts diagnosis and fixes',
      step_resolved_name: 'RESOLVED',
      step_resolved_desc: 'Solution applied and ready for validation',
      step_closed_name: 'CLOSED',
      step_closed_desc: 'User confirms closure & ticket archives',
      footer_copy: '© 2026 TechNova Solutions. All rights reserved. Enterprise Support Portal.',
      nav_dashboard: 'Dashboard',
      nav_tickets: 'Incident Desk',
      nav_technicians: 'Technicians',
      nav_users: 'Users Directory',
      nav_admin: 'Administration',
      nav_stats: 'Analytics',
      nav_profile: 'My Profile',
      nav_submit: 'Submit Ticket',
      notifications_title: 'Notifications',
      notifications_mark_all: 'Mark all as read',
      notifications_empty: 'No notifications',
      new_request: '+ New Request',
      reset_filters: 'Reset Filters',
      search_placeholder: 'Search by ID or title...',
      all_statuses: 'All Statuses',
      all_priorities: 'All Priorities',
      all_categories: 'All Categories',
      submit_request: 'Submit Request',
      cancel: 'Cancel',
      first_name_error: 'First name is required.',
      last_name_error: 'Last name is required.',
      email_error: 'Please enter a valid corporate email.',
      password_hint: 'At least 8 characters, with 1 uppercase, 1 lowercase, and 1 number.',
      password_error: 'Password must meet security requirements.',
      password_required_error: 'Password is required.',
      confirm_password_error: 'Passwords do not match.',
      registration_success: 'Account created successfully! Redirecting to sign in...'
    },
    es: {
      brand_sub: 'Gestión Inteligente de Soporte TI',
      sign_in: 'Iniciar Sesión',
      create_account: 'Crear Cuenta',
      sign_out: 'Cerrar Sesión',
      welcome_back: 'Bienvenido de nuevo',
      login_sub: 'Ingresa tus credenciales corporativas para acceder al portal',
      email_label: 'Correo Corporativo',
      password_label: 'Contraseña',
      confirm_password_label: 'Confirmar Contraseña',
      first_name_label: 'Nombre',
      last_name_label: 'Apellido',
      demo_quick_login: 'Acceso Rápido de Demostración',
      dont_have_account: '¿No tienes una cuenta?',
      already_have_account: '¿Ya tienes una cuenta?',
      register_title: 'Crear cuenta',
      register_sub: 'Registra tu perfil corporativo para servicios de TI',
      security_notice: 'Aviso de Seguridad: Los privilegios administrativos y técnicos se asignan exclusivamente mediante gobernanza autorizada.',
      hero_badge: '● Gestión Empresarial de Servicios TI',
      hero_heading: 'Tu soporte tecnológico, más inteligente y organizado.',
      hero_subtext: 'CAMPUSDESK ofrece seguimiento centralizado de incidentes, asignación en tiempo real y transparencia operacional para TechNova Solutions.',
      hero_cta_portal: 'Acceder al Portal',
      hero_cta_request: 'Crear una Solicitud',
      benefits_tag: 'Capacidades Empresariales',
      benefits_heading: 'Diseñado para Operaciones de Alta Fiabilidad',
      benefit_1_title: 'Gestión de Incidencias',
      benefit_1_desc: 'Centraliza tickets de hardware, software, redes y accesos en un espacio de trabajo estructurado.',
      benefit_2_title: 'Seguimiento en Tiempo Real',
      benefit_2_desc: 'Monitorea cambios de estado en vivo desde el reporte inicial hasta la verificación final.',
      benefit_3_title: 'Asignación de Técnicos',
      benefit_3_desc: 'Administradores equilibran cargas de trabajo con medidores transparentes y asignación inmediata.',
      benefit_4_title: 'Historial de Auditoría Completo',
      benefit_4_desc: 'Mantén un registro inmutable y fechado de cada transición de estado y responsable.',
      benefit_5_title: 'Seguridad Basada en Roles',
      benefit_5_desc: 'Estricta separación de funciones entre Administradores, Técnicos y Solicitantes.',
      benefit_6_title: 'Estadísticas Operativas',
      benefit_6_desc: 'Visualiza volumen de incidencias, velocidad de resolución y prioridades con analítica limpia.',
      workflow_tag: 'Gobernanza del Flujo',
      workflow_heading: 'Ciclo de Vida Estructurado del Ticket',
      step_open_name: 'ABIERTA',
      step_open_desc: 'El usuario envía la solicitud con prioridad y detalles',
      step_assigned_name: 'ASIGNADA',
      step_assigned_desc: 'El administrador asigna un técnico especialista',
      step_progress_name: 'EN PROCESO',
      step_progress_desc: 'El técnico realiza diagnóstico y solución',
      step_resolved_name: 'RESUELTA',
      step_resolved_desc: 'Solución aplicada lista para verificación',
      step_closed_name: 'CERRADA',
      step_closed_desc: 'El usuario confirma cierre y se archiva el ticket',
      footer_copy: '© 2026 TechNova Solutions. Todos los derechos reservados. Portal de Soporte Empresarial.',
      nav_dashboard: 'Panel de Control',
      nav_tickets: 'Mesa de Incidencias',
      nav_technicians: 'Técnicos',
      nav_users: 'Directorio de Usuarios',
      nav_admin: 'Administración',
      nav_stats: 'Estadísticas',
      nav_profile: 'Mi Perfil',
      nav_submit: 'Crear Solicitud',
      notifications_title: 'Notificaciones',
      notifications_mark_all: 'Marcar todas como leídas',
      notifications_empty: 'No hay notificaciones',
      new_request: '+ Nueva Solicitud',
      reset_filters: 'Limpiar Filtros',
      search_placeholder: 'Buscar por ID o título...',
      all_statuses: 'Todos los Estados',
      all_priorities: 'Todas las Prioridades',
      all_categories: 'Todas las Categorías',
      submit_request: 'Enviar Solicitud',
      cancel: 'Cancelar',
      first_name_error: 'El nombre es obligatorio.',
      last_name_error: 'El apellido es obligatorio.',
      email_error: 'Ingresa un correo corporativo válido.',
      password_hint: 'Al menos 8 caracteres, con 1 mayúscula, 1 minúscula y 1 número.',
      password_error: 'La contraseña debe cumplir los requisitos de seguridad.',
      password_required_error: 'La contraseña es obligatoria.',
      confirm_password_error: 'Las contraseñas no coinciden.',
      registration_success: '¡Cuenta creada exitosamente! Redirigiendo a iniciar sesión...'
    },
    pt: {
      brand_sub: 'Gestão Inteligente de Suporte de TI',
      sign_in: 'Entrar',
      create_account: 'Criar Conta',
      sign_out: 'Sair',
      welcome_back: 'Bem-vindo de volta',
      login_sub: 'Insira suas credenciais corporativas para acessar o portal',
      email_label: 'E-mail Corporativo',
      password_label: 'Senha',
      confirm_password_label: 'Confirmar Senha',
      first_name_label: 'Nome',
      last_name_label: 'Sobrenome',
      demo_quick_login: 'Acesso Rápido de Demonstração',
      dont_have_account: 'Não tem uma conta?',
      already_have_account: 'Já tem uma conta?',
      register_title: 'Criar conta',
      register_sub: 'Cadastre seu perfil corporativo para suporte de TI',
      security_notice: 'Aviso de Segurança: Privilégios administrativos e técnicos são atribuídos exclusivamente por governança autorizada.',
      hero_badge: '● Gestão Empresarial de Serviços de TI',
      hero_heading: 'Seu suporte tecnológico, mais inteligente e organizado.',
      hero_subtext: 'O CAMPUSDESK centraliza chamados, orquestra cargas de trabalho e fornece transparência operacional.',
      hero_cta_portal: 'Entrar no Portal',
      hero_cta_request: 'Abrir Chamado',
      benefits_tag: 'Capacidades Empresariais',
      benefits_heading: 'Projetado para Operações de Alta Confiabilidade',
      benefit_1_title: 'Gestão de Incidentes',
      benefit_1_desc: 'Centralize chamados de hardware, software, redes e acessos em um ambiente estruturado.',
      benefit_2_title: 'Acompanhamento em Tempo Real',
      benefit_2_desc: 'Acompanhe atualizações de status ao vivo desde o registro até a verificação final.',
      benefit_3_title: 'Despacho de Técnicos',
      benefit_3_desc: 'Administradores equilibram cargas com medidores transparentes e atribuição instantânea.',
      benefit_4_title: 'Histórico de Auditoria Completo',
      benefit_4_desc: 'Mantenha um log imutável com data e hora de cada transição de estado.',
      benefit_5_title: 'Segurança Baseada em Funções',
      benefit_5_desc: 'Separação rigorosa de funções entre Administradores, Técnicos e Usuários.',
      benefit_6_title: 'Estatísticas Operacionais',
      benefit_6_desc: 'Visualize volume de chamados, velocidade de resolução e severidade com facilidade.',
      workflow_tag: 'Governança do Fluxo',
      workflow_heading: 'Ciclo de Vida Estruturado do Chamado',
      step_open_name: 'ABERTO',
      step_open_desc: 'Usuário registra chamado com prioridade',
      step_assigned_name: 'ATRIBUÍDO',
      step_assigned_desc: 'Administrador designa técnico especialista',
      step_progress_name: 'EM ANDAMENTO',
      step_progress_desc: 'Técnico realiza diagnóstico e reparos',
      step_resolved_name: 'RESOLVIDO',
      step_resolved_desc: 'Solução aplicada pronta para validação',
      step_closed_name: 'FECHADO',
      step_closed_desc: 'Usuário confirma conclusão e chamado é arquivado',
      footer_copy: '© 2026 TechNova Solutions. Todos os direitos reservados.',
      nav_dashboard: 'Painel',
      nav_tickets: 'Central de Chamados',
      nav_technicians: 'Técnicos',
      nav_users: 'Diretório de Usuários',
      nav_admin: 'Administração',
      nav_stats: 'Estatísticas',
      nav_profile: 'Meu Perfil',
      nav_submit: 'Abrir Chamado',
      notifications_title: 'Notificações',
      notifications_mark_all: 'Marcar todas como lidas',
      notifications_empty: 'Nenhuma notificação',
      new_request: '+ Novo Chamado',
      reset_filters: 'Redefinir Filtros',
      search_placeholder: 'Buscar por ID ou título...',
      all_statuses: 'Todos os Status',
      all_priorities: 'Todas as Prioridades',
      all_categories: 'Todas as Categorias',
      submit_request: 'Enviar Chamado',
      cancel: 'Cancelar',
      first_name_error: 'O primeiro nome é obrigatório.',
      last_name_error: 'O sobrenome é obrigatório.',
      email_error: 'Insira um e-mail corporativo válido.',
      password_hint: 'Pelo menos 8 caracteres, com 1 maiúscula, 1 minúscula e 1 número.',
      password_error: 'A senha deve atender aos requisitos de segurança.',
      password_required_error: 'A senha é obrigatória.',
      confirm_password_error: 'As senhas não coincidem.',
      registration_success: 'Conta criada com sucesso! Redirecionando para login...'
    },
    fr: {
      brand_sub: 'Gestion Intelligente du Support Informatique',
      sign_in: 'Se Connecter',
      create_account: 'Créer un Compte',
      sign_out: 'Déconnexion',
      welcome_back: 'Bon retour',
      login_sub: 'Entrez vos identifiants d’entreprise pour accéder au portail',
      email_label: 'E-mail Professionnel',
      password_label: 'Mot de passe',
      confirm_password_label: 'Confirmer le mot de passe',
      first_name_label: 'Prénom',
      last_name_label: 'Nom',
      demo_quick_login: 'Connexion Démo Rapide',
      dont_have_account: "Vous n'avez pas de compte ?",
      already_have_account: 'Avez-vous déjà un compte ?',
      register_title: 'Créer un compte',
      register_sub: 'Enregistrez votre profil pour les services de support',
      security_notice: "Avis de Sécurité : Les rôles privilégiés sont attribués uniquement via la gouvernance autorisée.",
      hero_badge: '● Gestion des Services Informatiques d’Entreprise',
      hero_heading: 'Votre support technologique, plus intelligent et organisé.',
      hero_subtext: 'CAMPUSDESK centralise les incidents technologiques, gère les flux opérationnels et garantit la transparence.',
      hero_cta_portal: 'Accéder au Portail',
      hero_cta_request: 'Créer une Demande',
      benefits_tag: 'Capacités d’Entreprise',
      benefits_heading: 'Conçu pour des Opérations à Haute Fiabilité',
      benefit_1_title: 'Gestion des Incidents',
      benefit_1_desc: 'Centralisez le matériel, les logiciels, le réseau et les accès dans un espace unifié.',
      benefit_2_title: 'Suivi en Temps Réel',
      benefit_2_desc: 'Surveillez l’état des tickets en direct de la soumission à la vérification finale.',
      benefit_3_title: 'Attribution des Techniciens',
      benefit_3_desc: 'Les administrateurs équilibrent la charge grâce à des jauges de capacité en direct.',
      benefit_4_title: 'Journal d’Audit Complet',
      benefit_4_desc: 'Conservez une piste d’audit immuable et horodatée de chaque transition d’état.',
      benefit_5_title: 'Sécurité Basée sur les Rôles',
      benefit_5_desc: 'Séparation stricte des tâches entre Administrateurs, Techniciens et Demandeurs.',
      benefit_6_title: 'Statistiques Opérationnelles',
      benefit_6_desc: 'Analysez les volumes, les délais de résolution et les niveaux de sévérité.',
      workflow_tag: 'Gouvernance des Processus',
      workflow_heading: 'Cycle de Vie Structuré du Ticket',
      step_open_name: 'OUVERT',
      step_open_desc: 'L’utilisateur soumet l’incident avec priorité',
      step_assigned_name: 'ATTRIBUÉ',
      step_assigned_desc: 'L’administrateur affecte un technicien spécialisé',
      step_progress_name: 'EN COURS',
      step_progress_desc: 'Le technicien applique les corrections techniques',
      step_resolved_name: 'RÉSOLU',
      step_resolved_desc: 'Solution mise en place prête pour validation',
      step_closed_name: 'FERMÉ',
      step_closed_desc: 'L’utilisateur confirme la clôture et archivage',
      footer_copy: '© 2026 TechNova Solutions. Tous droits réservés.',
      nav_dashboard: 'Tableau de Bord',
      nav_tickets: 'Gestion des Incidents',
      nav_technicians: 'Techniciens',
      nav_users: 'Répertoire Utilisateurs',
      nav_admin: 'Administration',
      nav_stats: 'Analytique',
      nav_profile: 'Mon Profil',
      nav_submit: 'Nouveau Ticket',
      notifications_title: 'Notifications',
      notifications_mark_all: 'Tout marquer comme lu',
      notifications_empty: 'Aucune notification',
      new_request: '+ Nouveau Ticket',
      reset_filters: 'Réinitialiser Filtres',
      search_placeholder: 'Rechercher par ID ou titre...',
      all_statuses: 'Tous les Statuts',
      all_priorities: 'Toutes les Priorités',
      all_categories: 'Toutes les Catégories',
      submit_request: 'Soumettre Ticket',
      cancel: 'Annuler',
      first_name_error: 'Le prénom est obligatoire.',
      last_name_error: 'Le nom de famille est obligatoire.',
      email_error: 'Veuillez saisir un e-mail professionnel valide.',
      password_hint: 'Au moins 8 caractères, avec 1 majuscule, 1 minuscule et 1 chiffre.',
      password_error: 'Le mot de passe doit respecter les critères de sécurité.',
      password_required_error: 'Le mot de passe est obligatoire.',
      confirm_password_error: 'Les mots de passe ne correspondent pas.',
      registration_success: 'Compte créé avec succès ! Redirection vers la connexion...'
    },
    de: {
      brand_sub: 'Intelligentes IT-Support-Management',
      sign_in: 'Anmelden',
      create_account: 'Konto Erstellen',
      sign_out: 'Abmelden',
      welcome_back: 'Willkommen zurück',
      login_sub: 'Geben Sie Ihre Unternehmensdaten ein, um auf das Portal zuzugreifen',
      email_label: 'Unternehmens-E-Mail',
      password_label: 'Passwort',
      confirm_password_label: 'Passwort bestätigen',
      first_name_label: 'Vorname',
      last_name_label: 'Nachname',
      demo_quick_login: 'Demo-Schnellanmeldung',
      dont_have_account: 'Noch kein Konto?',
      already_have_account: 'Bereits registriert?',
      register_title: 'Konto erstellen',
      register_sub: 'Registrieren Sie Ihr Unternehmensprofil für IT-Services',
      security_notice: 'Sicherheitshinweis: Administrative und technische Rollen werden ausschließlich über autorisierte Kanäle vergeben.',
      hero_badge: '● Enterprise IT-Service-Management',
      hero_heading: 'Ihr technischer Support, intelligenter und organisierter.',
      hero_subtext: 'CAMPUSDESK zentralisiert technische Störungen, steuert Arbeitsabläufe und bietet operative Transparenz.',
      hero_cta_portal: 'Zum Portal Anmelden',
      hero_cta_request: 'Ticket Erstellen',
      benefits_tag: 'Unternehmensfunktionen',
      benefits_heading: 'Entwickelt für Hochzuverlässigen Betrieb',
      benefit_1_title: 'Störungsmanagement',
      benefit_1_desc: 'Zentralisieren Sie Hardware-, Software-, Netzwerk- und Zugriffsanfragen in einer Plattform.',
      benefit_2_title: 'Echtzeit-Tracking',
      benefit_2_desc: 'Verfolgen Sie Statusänderungen von der Erfassung bis zur endgültigen Überprüfung live.',
      benefit_3_title: 'Techniker-Disposition',
      benefit_3_desc: 'Administratoren steuern Arbeitslasten mit transparenten Kapazitätsanzeigen.',
      benefit_4_title: 'Vollständiges Audit-Protokoll',
      benefit_4_desc: 'Unveränderlicher Prüfpfad für jeden Statusübergang und verantwortliche Personen.',
      benefit_5_title: 'Rollenbasierte Sicherheit',
      benefit_5_desc: 'Strikte Aufgabentrennung zwischen Administratoren, Technikern und Anforderern.',
      benefit_6_title: 'Betriebsstatistiken',
      benefit_6_desc: 'Analysieren Sie Ticketvolumen, Lösungsgeschwindigkeit und Schweregrade übersichtlich.',
      workflow_tag: 'Prozesssteuerung',
      workflow_heading: 'Strukturierter Ticket-Lebenszyklus',
      step_open_name: 'OFFEN',
      step_open_desc: 'Benutzer meldet Störung mit Priorität',
      step_assigned_name: 'ZUGEWIESEN',
      step_assigned_desc: 'Administrator weist Fachtechniker zu',
      step_progress_name: 'IN BEARBEITUNG',
      step_progress_desc: 'Techniker führt Diagnose und Behebung durch',
      step_resolved_name: 'GELÖST',
      step_resolved_desc: 'Lösung angewendet, bereit zur Prüfung',
      step_closed_name: 'GESCHLOSSEN',
      step_closed_desc: 'Benutzer bestätigt Abschluss und Archivierung',
      footer_copy: '© 2026 TechNova Solutions. Alle Rechte vorbehalten.',
      nav_dashboard: 'Dashboard',
      nav_tickets: 'Incident Desk',
      nav_technicians: 'Techniker',
      nav_users: 'Benutzerverzeichnis',
      nav_admin: 'Administration',
      nav_stats: 'Analytik',
      nav_profile: 'Mein Profil',
      nav_submit: 'Ticket Einreichen',
      notifications_title: 'Benachrichtigungen',
      notifications_mark_all: 'Alle als gelesen markieren',
      notifications_empty: 'Keine Benachrichtigungen',
      new_request: '+ Neues Ticket',
      reset_filters: 'Filter Zurücksetzen',
      search_placeholder: 'Nach ID oder Titel suchen...',
      all_statuses: 'Alle Status',
      all_priorities: 'Alle Prioritäten',
      all_categories: 'Alle Kategorien',
      submit_request: 'Ticket Senden',
      cancel: 'Abbrechen',
      first_name_error: 'Vorname ist erforderlich.',
      last_name_error: 'Nachname ist erforderlich.',
      email_error: 'Bitte geben Sie eine gültige Unternehmens-E-Mail ein.',
      password_hint: 'Mindestens 8 Zeichen, mit 1 Großbuchstaben, 1 Kleinbuchstaben und 1 Zahl.',
      password_error: 'Das Passwort muss die Sicherheitsanforderungen erfüllen.',
      password_required_error: 'Passwort ist erforderlich.',
      confirm_password_error: 'Passwörter stimmen nicht überein.',
      registration_success: 'Konto erfolgreich erstellt! Weiterleitung zur Anmeldung...'
    }
  },

  // Retrieve translation for key
  t(key, fallback = '') {
    const dict = this.translations[this.currentLang] || this.translations.en;
    return dict[key] || this.translations.en[key] || fallback || key;
  },

  // Set active language and re-translate DOM
  setLanguage(langCode) {
    if (!this.translations[langCode]) return;
    this.currentLang = langCode;
    localStorage.setItem('campusdesk_lang', langCode);
    document.documentElement.lang = langCode;
    this.translateDOM();
    this.updateSelectorUI();
  },

  // Translate all DOM elements containing data-i18n attributes
  translateDOM() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = this.t(key);
      if (text) el.textContent = text;
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = this.t(key);
      if (text) el.setAttribute('placeholder', text);
    });
  },

  // Mount language selector dropdown into target container
  mountSelector(container) {
    if (!container) return;

    const currentMeta = this.languages.find(l => l.code === this.currentLang) || this.languages[0];

    const wrapper = document.createElement('div');
    wrapper.className = 'language-switcher-wrapper';
    wrapper.innerHTML = `
      <button class="language-toggle-btn" id="lang-toggle-btn" aria-label="Select language">
        <span>${currentMeta.flag}</span>
        <span id="lang-current-code">${currentMeta.code.toUpperCase()}</span>
        <span class="lang-arrow">▼</span>
      </button>
      <div class="language-dropdown-menu" id="lang-dropdown-menu">
        ${this.languages.map(l => `
          <button class="language-dropdown-item ${l.code === this.currentLang ? 'active' : ''}" data-code="${l.code}">
            <span>${l.flag} ${l.label}</span>
            ${l.code === this.currentLang ? '<span class="lang-check">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;

    container.appendChild(wrapper);

    const toggleBtn = wrapper.querySelector('#lang-toggle-btn');
    const menu = wrapper.querySelector('#lang-dropdown-menu');

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      menu.classList.toggle('active');
    });

    menu.querySelectorAll('.language-dropdown-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = item.getAttribute('data-code');
        this.setLanguage(code);
        menu.classList.remove('active');
      });
    });

    document.addEventListener('click', () => {
      menu.classList.remove('active');
    });
  },

  // Update button label and active items in selector
  updateSelectorUI() {
    const currentMeta = this.languages.find(l => l.code === this.currentLang) || this.languages[0];
    const codeEl = document.getElementById('lang-current-code');
    if (codeEl) codeEl.textContent = currentMeta.code.toUpperCase();

    document.querySelectorAll('.language-dropdown-item').forEach(item => {
      const code = item.getAttribute('data-code');
      if (code === this.currentLang) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  },

  init() {
    document.documentElement.lang = this.currentLang;
    this.translateDOM();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
});
