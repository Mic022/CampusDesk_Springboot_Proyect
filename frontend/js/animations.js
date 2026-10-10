/**
 * CampusDesk Interactive Animation Engine
 * Client: TechNova Solutions
 * Provides high-performance ambient glowing canvas, interactive cursor-following card glow,
 * button ripple shockwaves, smooth number ticker animations, and entrance transitions.
 */
'use strict';

const Animations = {
  canvas: null,
  ctx: null,
  orbs: [],
  animFrameId: null,
  mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, targetX: window.innerWidth / 2, targetY: window.innerHeight / 2 },

  /**
   * Initializes all interactive JavaScript animations across the page
   */
  init() {
    this.setupAmbientCanvas();
    this.setupCardCursorGlow();
    this.setupButtonRipples();
    this.setupStaggeredReveal();
    this.animateNumbers();
  },

  /**
   * Creates and manages ambient floating violet light orbs in a background canvas
   */
  setupAmbientCanvas() {
    if (document.getElementById('ambient-glow-canvas')) return;

    const canvas = document.createElement('canvas');
    canvas.id = 'ambient-glow-canvas';
    canvas.className = 'ambient-glow-canvas';
    document.body.prepend(canvas);

    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');

    const resize = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    // Track mouse for ambient reactivity
    window.addEventListener('mousemove', (e) => {
      this.mouse.targetX = e.clientX;
      this.mouse.targetY = e.clientY;
    }, { passive: true });

    // Generate floating luminous purple orbs
    const orbColors = [
      'rgba(168, 85, 247, 0.12)',  // Electric violet
      'rgba(147, 51, 234, 0.14)',  // Purple
      'rgba(192, 132, 252, 0.08)', // Lavender glow
      'rgba(126, 34, 206, 0.10)'   // Deep purple
    ];

    const orbCount = window.innerWidth < 768 ? 10 : 20;
    this.orbs = [];
    for (let i = 0; i < orbCount; i++) {
      this.orbs.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 140 + 70,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        color: orbColors[Math.floor(Math.random() * orbColors.length)],
        pulseSpeed: Math.random() * 0.02 + 0.01,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }

    this.startAmbientLoop();
  },

  /**
   * Render loop for floating ambient violet orbs
   */
  startAmbientLoop() {
    let tick = 0;
    const render = () => {
      tick += 0.02;
      // Smooth mouse interpolation
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.05;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.05;

      const w = this.canvas.width;
      const h = this.canvas.height;
      this.ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < this.orbs.length; i++) {
        const orb = this.orbs[i];
        orb.x += orb.vx;
        orb.y += orb.vy;

        // Bounce gently off boundaries
        if (orb.x < -orb.radius) orb.x = w + orb.radius;
        if (orb.x > w + orb.radius) orb.x = -orb.radius;
        if (orb.y < -orb.radius) orb.y = h + orb.radius;
        if (orb.y > h + orb.radius) orb.y = -orb.radius;

        // Dynamic pulsing radius
        const currentRadius = orb.radius + Math.sin(tick + orb.pulseOffset) * 15;

        // Radial glow gradient
        const grad = this.ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, Math.max(10, currentRadius));
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'rgba(7, 4, 13, 0)');

        this.ctx.fillStyle = grad;
        this.ctx.beginPath();
        this.ctx.arc(orb.x, orb.y, Math.max(10, currentRadius), 0, Math.PI * 2);
        this.ctx.fill();
      }

      this.animFrameId = requestAnimationFrame(render);
    };

    render();
  },

  /**
   * Tracks cursor movements across cards to position dynamic radial glow highlights
   */
  setupCardCursorGlow() {
    const cardSelectors = '.card, .kpi-card, .benefit-card, .flow-step-box, .tech-card, .auth-card, .quick-action-card, .category-stat-card';
    
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll(cardSelectors);
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        // Check if cursor is reasonably close to card to avoid unneeded calculations
        if (
          e.clientX >= rect.left - 50 &&
          e.clientX <= rect.right + 50 &&
          e.clientY >= rect.top - 50 &&
          e.clientY <= rect.bottom + 50
        ) {
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          card.style.setProperty('--glow-x', `${x}px`);
          card.style.setProperty('--glow-y', `${y}px`);
        }
      });
    }, { passive: true });
  },

  /**
   * Injects tactile glowing ripple circles when buttons are clicked
   */
  setupButtonRipples() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn');
      if (!btn) return;

      const rect = btn.getBoundingClientRect();
      const circle = document.createElement('span');
      const diameter = Math.max(rect.width, rect.height);
      const radius = diameter / 2;

      circle.style.width = circle.style.height = `${diameter}px`;
      circle.style.left = `${e.clientX - rect.left - radius}px`;
      circle.style.top = `${e.clientY - rect.top - radius}px`;
      circle.className = 'btn-ripple';

      const existingRipple = btn.querySelector('.btn-ripple');
      if (existingRipple) existingRipple.remove();

      btn.appendChild(circle);
      setTimeout(() => circle.remove(), 700);
    });
  },

  /**
   * Staggered fade and slide entrance for elements
   */
  setupStaggeredReveal() {
    const targets = document.querySelectorAll('.card, .kpi-card, .benefit-card, .flow-step-box');
    targets.forEach((el, index) => {
      el.classList.add('reveal-item');
      el.style.setProperty('--reveal-delay', `${(index % 8) * 60}ms`);
    });
  },

  /**
   * Smooth animated counter ticker for KPI cards and metrics
   * Counts up from 0 to target number using easeOutCubic curve
   * @param {HTMLElement|Document} scope 
   */
  animateNumbers(scope = document) {
    const targets = scope.querySelectorAll('.kpi-value, .category-stat-count');
    targets.forEach((el) => {
      const text = el.textContent.trim();
      const num = parseInt(text, 10);
      if (isNaN(num) || num === 0 || el.getAttribute('data-animated') === 'true') return;

      el.setAttribute('data-animated', 'true');
      const duration = 1200;
      const start = 0;
      const startTime = performance.now();

      const easeOutCubic = (t) => (--t) * t * t + 1;

      const step = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const currentVal = Math.round(start + (num - start) * easeOutCubic(progress));
        el.textContent = currentVal;

        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = num;
        }
      };

      requestAnimationFrame(step);
    });
  }
};

// Auto-initialize when the DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => Animations.init());
} else {
  Animations.init();
}
