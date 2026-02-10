/* Futuristic background + scroll-driven effects + small UX helpers */

(() => {
  const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

  // --- Theme (dark/light)
  const THEME_KEY = 'ar_theme';
  const themeToggle = document.getElementById('themeToggle');

  const getPreferredTheme = () => {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
    const prefersLight = window.matchMedia?.('(prefers-color-scheme: light)')?.matches;
    return prefersLight ? 'light' : 'dark';
  };

  const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    // aria-pressed true means "light" (switched) to make the toggle feel like a switch.
    if (themeToggle) themeToggle.setAttribute('aria-pressed', String(theme === 'light'));
  };

  const initialTheme = getPreferredTheme();
  applyTheme(initialTheme);

  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });

  // --- Mobile nav
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => {
      const open = navMenu.classList.toggle('isOpen');
      navToggle.setAttribute('aria-expanded', String(open));
    });

    navMenu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (a) {
        navMenu.classList.remove('isOpen');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // --- Year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // --- Contact form: mailto
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();

    const form = /** @type {HTMLFormElement} */ (e.currentTarget);
    const data = new FormData(form);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const message = String(data.get('message') || '').trim();

    const subject = encodeURIComponent(`Consulta — ${name}`);
    const body = encodeURIComponent(`Nombre: ${name}\nEmail: ${email}\n\n${message}\n\nEnviado desde mi sitio.`);

    const to = 'mailto:agusrodriguez0602@gmail.com';
    window.location.href = `${to}?subject=${subject}&body=${body}`;
  });

  // --- Contact links
  const emailLink = document.getElementById('emailLink');
  if (emailLink) {
    emailLink.textContent = 'agusrodriguez0602@gmail.com';
    emailLink.setAttribute('href', 'mailto:agusrodriguez0602@gmail.com');
  }

  const liLink = document.getElementById('liLink');
  if (liLink) {
    liLink.textContent = 'linkedin.com/in/agustin-rodriguez-363037303';
    liLink.setAttribute('href', 'https://www.linkedin.com/in/agustin-rodriguez-363037303/');
    liLink.setAttribute('target', '_blank');
    liLink.setAttribute('rel', 'noreferrer');
  }

  // --- Counter animation
  const counters = [...document.querySelectorAll('[data-counter]')];
  if (counters.length) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = /** @type {HTMLElement} */ (entry.target);
          const target = Number(el.getAttribute('data-counter') || '0');
          animateCounter(el, target);
          io.unobserve(el);
        }
      },
      { threshold: 0.6 }
    );

    counters.forEach((c) => io.observe(c));
  }

  function animateCounter(el, target) {
    if (prefersReducedMotion) {
      el.textContent = String(target);
      return;
    }

    const duration = 900;
    const start = performance.now();
    const from = 0;

    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const n = Math.round(from + (target - from) * eased);
      el.textContent = String(n);
      if (p < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  // --- Background canvas
  const canvas = /** @type {HTMLCanvasElement|null} */ (document.getElementById('bgCanvas'));
  const ctx = canvas?.getContext('2d', { alpha: true });
  if (!canvas || !ctx) return;

  /** @type {{x:number,y:number,vx:number,vy:number,r:number}[]} */
  const particles = [];

  let width = 0;
  let height = 0;
  let dpr = Math.max(1, Math.min(1.6, window.devicePixelRatio || 1));
  /** @type {CanvasGradient|null} */
  let tintGradient = null;

  const config = {
    count: 40,
    linkDist: 145,
    speed: 0.35,
  };

  const resize = () => {
    width = Math.floor(window.innerWidth);
    height = Math.floor(window.innerHeight);
    dpr = Math.max(1, Math.min(1.6, window.devicePixelRatio || 1));

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Cache gradient tint (recomputed only on resize)
    tintGradient = ctx.createRadialGradient(
      width * 0.3,
      height * 0.2,
      60,
      width * 0.3,
      height * 0.2,
      Math.max(width, height)
    );
    tintGradient.addColorStop(0, 'rgba(106,228,255,0.10)');
    tintGradient.addColorStop(0.55, 'rgba(167,139,250,0.06)');
    tintGradient.addColorStop(1, 'rgba(0,0,0,0)');
  };

  window.addEventListener('resize', resize);
  resize();

  const rand = (min, max) => min + Math.random() * (max - min);

  const seed = () => {
    particles.length = 0;
    for (let i = 0; i < config.count; i++) {
      particles.push({
        x: rand(0, width),
        y: rand(0, height),
        vx: rand(-1, 1) * config.speed,
        vy: rand(-1, 1) * config.speed,
        r: rand(1.0, 2.2),
      });
    }
  };

  seed();

  // Scroll-driven parallax intensity
  let scrollY = window.scrollY || 0;
  let lastScrollTs = 0;
  window.addEventListener(
    'scroll',
    () => {
      scrollY = window.scrollY || 0;
      lastScrollTs = performance.now();
    },
    { passive: true }
  );

  // Reduce main-thread pressure to keep scroll smooth
  const targetFps = 30;
  const frameInterval = 1000 / targetFps;
  let lastFrameTs = 0;

  const draw = (ts) => {
    if (!ctx) return;

    // While user is actively scrolling, pause drawing briefly
    if (ts - lastScrollTs < 140) {
      requestAnimationFrame(draw);
      return;
    }

    if (ts - lastFrameTs < frameInterval) {
      requestAnimationFrame(draw);
      return;
    }
    lastFrameTs = ts;

    // Clear
    ctx.clearRect(0, 0, width, height);

    // Subtle gradient tint (cached)
    if (tintGradient) ctx.fillStyle = tintGradient;
    ctx.fillRect(0, 0, width, height);

    // Parallax based on scroll
    const parallax = prefersReducedMotion ? 0 : Math.min(1, scrollY / (document.body.scrollHeight - height + 1));
    const drift = parallax * 22;

    // Update and draw particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy + drift * 0.002; // subtle drift with scroll

      if (p.x < -20) p.x = width + 20;
      if (p.x > width + 20) p.x = -20;
      if (p.y < -20) p.y = height + 20;
      if (p.y > height + 20) p.y = -20;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(233,238,252,0.45)';
      ctx.fill();
    }

    // Links
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.hypot(dx, dy);
        if (dist > config.linkDist) continue;

        const alpha = (1 - dist / config.linkDist) * 0.22;
        const hue = 195 + parallax * 35;
        ctx.strokeStyle = `hsla(${hue}, 95%, 70%, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }

    requestAnimationFrame(draw);
  };

  if (!prefersReducedMotion) {
    requestAnimationFrame(draw);
  } else {
    // Reduced motion: draw once
    draw(performance.now());
  }
})();
