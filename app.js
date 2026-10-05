/* ==========================================================
   PRESTIGE MEDIA — interacción
   ========================================================== */
(() => {
'use strict';

const WA_NUMBER = '34625179835';
const EMAIL = 'fbiondo2612@gmail.com';

const PROJECTS = [
  { id: 'lidia-fornes-estetica', n: 'Estètica Lídia Fornés', s: 'Estética', note: 'Mapa láser a medida, rasca y gana y carta con reserva por WhatsApp.' },
  { id: 'julio-nails-lloret', n: 'Julio Nails', s: 'Salón de uñas', note: 'Nail Lab para diseñar uñas en directo y galería tipo “match”.' },
  { id: 'carla-pitarch-nutricion', n: 'Carla Pitarch', s: 'Nutrición', note: 'Juego “¿mito o realidad?” y constructor de plato equilibrado.' },
  { id: 'bhawna-neus', n: 'Bhawna Neus', s: 'Depilación con hilo', note: 'Estética de alta relojería para el arte del hilo.' },
  { id: 'trivis-peluqueria', n: 'Trivi’s', s: 'Peluquería', note: 'Experiencia de marca premium para él y para ella.' },
  { id: 'infinitybeauty-endospheres', n: 'INFINITYbeauty', s: 'Endospheres', note: 'Presentación de producto con estética tecnológica.' },
  { id: 'grand-cafe-latino', n: 'Grand Café Latino', s: 'Ocio nocturno', note: 'Noches latino y reservas VIP con energía de club.' },
  { id: 'fridabellesa', n: 'Frida Bellesa', s: 'Micropigmentación', note: 'Simulador láser: un clic y el texto se borra.' },
  { id: 'salon85', n: 'Salón 85', s: 'Peluquería ecológica', note: 'Laboratorio de color y ritual capilar a medida.' }
];
const STEP_NAMES = ['01 · DIAGNÓSTICO', '02 · ESTRATEGIA', '03 · DISEÑO Y EJECUCIÓN', '04 · MEDICIÓN Y MEJORA'];
const SERVICE_MAP = { web: 'Web corporativa', landing: 'Landing page', social: 'Gestión de redes sociales', seo: 'Posicionamiento en Google (SEO)' };

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const desktop = () => window.innerWidth > 1100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function scrollToEl(el, offset = -70) {
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
const waLink = t => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

/* ----------------------------------------------------------
   WHATSAPP
---------------------------------------------------------- */
function setupWa() {
  const href = waLink('Hola, Prestige Media. Me gustaría hablar sobre un proyecto para mi negocio.');
  $$('[data-wa]').forEach(a => a.setAttribute('href', href));
}

/* ----------------------------------------------------------
   LANDING: luz, polvo plateado y transición
---------------------------------------------------------- */
function setupLanding() {
  const pin = $('.landing__pin'), logo = $('[data-landing-logo]');
  // luz que sigue al cursor
  pin.addEventListener('pointermove', e => {
    const r = pin.getBoundingClientRect(), l = logo.getBoundingClientRect();
    pin.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
    pin.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
    logo.style.setProperty('--sx', ((e.clientX - l.left) / l.width * 100) + '%');
    logo.style.setProperty('--sy', ((e.clientY - l.top) / l.height * 100) + '%');
    pin.classList.add('is-hover');
  });
  pin.addEventListener('pointerleave', () => pin.classList.remove('is-hover'));

  // polvo plateado
  const cv = $('.landing__dust'), ctx = cv.getContext('2d');
  let W = 0, H = 0, dpr = 1, parts = [], mx = -999, my = -999, visible = true;
  function size() {
    const r = pin.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height; cv.width = W * dpr; cv.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = reduce ? 0 : (W < 700 ? 45 : 90);
    parts = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, r: Math.random() * 1.3 + .2, vy: -(Math.random() * .18 + .03), vx: (Math.random() - .5) * .08, t: Math.random() * 6.28, a: Math.random() * .5 + .15 }));
  }
  pin.addEventListener('pointermove', e => { const r = cv.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; });
  (function draw() {
    if (visible) {
      ctx.clearRect(0, 0, W, H);
      for (const p of parts) {
        p.t += .02; p.x += p.vx; p.y += p.vy;
        if (p.y < -5) { p.y = H + 5; p.x = Math.random() * W; }
        const d = Math.hypot(p.x - mx, p.y - my), boost = d < 160 ? (160 - d) / 160 : 0;
        ctx.globalAlpha = clamp(p.a * (.6 + Math.sin(p.t) * .4) + boost * .6, 0, 1);
        ctx.fillStyle = '#e9e9ee';
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r + boost * 1.2, 0, 6.28); ctx.fill();
      }
    }
    requestAnimationFrame(draw);
  })();
  new IntersectionObserver(([en]) => visible = en.isIntersecting).observe(pin);
  window.addEventListener('resize', size); size();
}
function landingScroll() {
  const nav = $('#nav'), claim = $('[data-claim]');
  if (!hasGsap || reduce) { nav.classList.add('show-logo'); return; }
  gsap.timeline({ scrollTrigger: { trigger: '.landing', start: 'top top', end: 'bottom bottom', scrub: 1,
    onUpdate: s => { nav.classList.toggle('show-logo', s.progress > .35); claim.classList.toggle('is-live', s.progress > .45); } } })
    .to('[data-landing-logo]', { scale: .56, yPercent: -27, opacity: .9, ease: 'none' }, 0)
    .to('.landing__scroll, .landing__corner', { opacity: 0, ease: 'none', duration: .3 }, 0)
    .to(claim, { opacity: 1, y: 0, ease: 'none', duration: .6 }, .25)
    .to('.landing__glow', { opacity: .4, ease: 'none' }, 0);
}

/* ----------------------------------------------------------
   AGENCIA: palabras que se iluminan
---------------------------------------------------------- */
function setupWords() {
  const p = $('[data-words]');
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span> `).join('');
  const words = $$('.w', p);
  if (!hasGsap || reduce) return;
  ScrollTrigger.create({ trigger: p, start: 'top 82%', end: 'bottom 45%', scrub: true,
    onUpdate: s => { const n = Math.round(s.progress * words.length); words.forEach((w, i) => w.classList.toggle('is-lit', i < n)); } });
}

/* ----------------------------------------------------------
   SERVICIOS: vitrina
---------------------------------------------------------- */
function setupVitrine() {
  const panes = $$('[data-pane]');
  let timers = [];
  const clearTimers = () => { timers.forEach(t => clearInterval(t)); timers = []; };
  function open(p) {
    if (p.classList.contains('is-open') && timers.length) return;
    panes.forEach(x => x.classList.toggle('is-open', x === p));
    clearTimers();
    animatePane(p);
  }
  function animatePane(p) {
    const kind = p.dataset.pane;
    if (kind === 'web') {
      const imgs = $$('[data-rotate] img', p); let i = 0;
      imgs.forEach((im, k) => im.classList.toggle('is-on', k === 0));
      timers.push(setInterval(() => { i = (i + 1) % imgs.length; imgs.forEach((im, k) => im.classList.toggle('is-on', k === i)); }, 2800));
    }
    if (kind === 'social') {
      const box = $('[data-hearts]', p);
      timers.push(setInterval(() => {
        const h = document.createElement('i'); h.textContent = Math.random() > .5 ? '♥' : '♡';
        h.style.left = (20 + Math.random() * 60) + '%'; h.style.fontSize = (12 + Math.random() * 14) + 'px';
        box.appendChild(h); setTimeout(() => h.remove(), 2700);
      }, 380));
    }
    if (kind === 'seo') runSerp(p);
  }
  function runSerp(p) {
    const txt = $('[data-typing]', p), items = $$('[data-serp] li', p);
    const phrase = 'agencia de marketing digital';
    const order0 = [0, 1, 2, 3], order1 = [2, 0, 1, 3];
    const place = ord => ord.forEach((idx, pos) => { items[idx].style.top = (pos * 54) + 'px'; });
    let k = 0, phase = 0, wait = 0;
    place(order0); txt.textContent = '';
    timers.push(setInterval(() => {
      if (phase === 0) { k++; txt.textContent = phrase.slice(0, k); if (k >= phrase.length) { phase = 1; wait = 0; } }
      else if (phase === 1) { if (++wait === 6) place(order1); if (wait > 34) { phase = 2; } }
      else { k--; txt.textContent = phrase.slice(0, Math.max(k, 0)); if (k <= 0) { place(order0); phase = 0; } }
    }, 80));
  }
  panes.forEach(p => {
    p.addEventListener('mouseenter', () => { if (desktop() && !coarse) open(p); });
    p.addEventListener('click', e => { if (!e.target.closest('[data-want]')) open(p); });
    p.addEventListener('focus', () => open(p));
    p.addEventListener('pointermove', e => { const r = p.getBoundingClientRect(); p.style.setProperty('--px', (e.clientX - r.left) + 'px'); p.style.setProperty('--py', (e.clientY - r.top) + 'px'); });
  });
  // en móvil todos están abiertos: animamos todos
  function mobileAll() { clearTimers(); panes.forEach(animatePane); }
  if (!desktop()) mobileAll(); else animatePane(panes[0]);
  let wasDesk = desktop();
  window.addEventListener('resize', () => { const d = desktop(); if (d !== wasDesk) { wasDesk = d; if (d) open(panes[0]); else mobileAll(); } });
  $$('[data-want]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const v = SERVICE_MAP[b.dataset.want];
    $$('[data-services] input').forEach(i => { if (i.value === v) i.checked = true; });
    scrollToEl($('#contacto'));
  }));
}

/* ----------------------------------------------------------
   MÉTODO: esfera de reloj
---------------------------------------------------------- */
function setupDial() {
  const svg = $('[data-dial] svg');
  const ticks = $('[data-ticks]', svg), nums = $('[data-numerals]', svg), sub = $('[data-subticks]', svg);
  let t = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, big = i % 5 === 0;
    const r1 = big ? 206 : 214, r2 = 224;
    t += `<line x1="${250 + Math.sin(a) * r1}" y1="${250 - Math.cos(a) * r1}" x2="${250 + Math.sin(a) * r2}" y2="${250 - Math.cos(a) * r2}" stroke="${big ? '#e7e7ea' : 'rgba(231,231,234,.35)'}" stroke-width="${big ? 2.2 : 1}"/>`;
  }
  ticks.innerHTML = t;
  const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  nums.innerHTML = R.map((r, i) => { const a = i * 30 * Math.PI / 180; return (i === 6) ? '' : `<text x="${250 + Math.sin(a) * 182}" y="${250 - Math.cos(a) * 182}">${r}</text>`; }).join('');
  let s = '';
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; s += `<line x1="${250 + Math.sin(a) * 38}" y1="${340 - Math.cos(a) * 38}" x2="${250 + Math.sin(a) * 43}" y2="${340 - Math.cos(a) * 43}" stroke="rgba(231,231,234,.5)" stroke-width="1"/>`; }
  sub.innerHTML = s;
  const hour = $('[data-hour]', svg), min = $('[data-minute]', svg), sec = $('[data-sec]', svg), stepTxt = $('[data-dial-step]', svg);
  const steps = $$('[data-steps] li');
  // segundero en tiempo real
  const tickSec = () => { const d = new Date(); sec.style.transform = `rotate(${d.getSeconds() * 6}deg)`; };
  tickSec(); setInterval(tickSec, 1000);
  let cur = -1;
  function setProgress(p) {
    p = clamp(p, 0, 1);
    min.style.transform = `rotate(${p * 360}deg)`;
    hour.style.transform = `rotate(${300 + p * 30}deg)`;
    const i = Math.min(3, Math.floor(p * 4 + .02));
    if (i !== cur) {
      cur = i;
      steps.forEach((li, k) => li.classList.toggle('is-on', k === i));
      stepTxt.textContent = STEP_NAMES[i];
    }
  }
  setProgress(0);
  const sec_ = $('#metodo');
  function onScroll() {
    const r = sec_.getBoundingClientRect();
    const total = r.height - window.innerHeight;
    if (total > 50) setProgress(-r.top / total);
    else setProgress(clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1));
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  // ligera inclinación con el ratón
  const dial = $('[data-dial]');
  if (!coarse && !reduce) {
    sec_.addEventListener('pointermove', e => {
      const r = dial.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      dial.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    sec_.addEventListener('pointerleave', () => dial.style.transform = '');
  }
}

/* ----------------------------------------------------------
   CIFRAS
---------------------------------------------------------- */
function setupCounters() {
  const io = new IntersectionObserver(ens => ens.forEach(en => {
    if (!en.isIntersecting) return;
    io.unobserve(en.target);
    const el = en.target, to = +el.dataset.count, t0 = performance.now();
    (function f(now) { const k = Math.min((now - t0) / 1800, 1), e = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * e); if (k < 1) requestAnimationFrame(f); })(t0);
  }), { threshold: .6 });
  $$('[data-count]').forEach(el => io.observe(el));
}

/* ----------------------------------------------------------
   PROYECTOS + VISOR EN VIVO
---------------------------------------------------------- */
function setupWork() {
  const list = $('[data-work-list]'), view = $('[data-screen-view]');
  list.innerHTML = PROJECTS.map((p, i) => `<li class="wl" data-i="${i}" tabindex="0"><span class="wl__n">${String(i + 1).padStart(2, '0')}</span><span class="wl__t">${p.n}</span><span class="wl__s">${p.s}</span></li>`).join('');
  view.innerHTML = PROJECTS.map(p => `<img src="assets/img/work/${p.id}.jpg" alt="Web de ${p.n}" loading="lazy">`).join('');
  const imgs = $$('img', view), rows = $$('.wl', list);
  let cur = -1, hover = false, timer;
  function show(i) {
    if (i === cur) return;
    imgs.forEach((im, k) => { im.classList.remove('was-on'); if (k === cur) im.classList.add('was-on'); im.classList.toggle('is-on', k === i); });
    cur = i;
    rows.forEach((r, k) => r.classList.toggle('is-active', k === i));
    const p = PROJECTS[i], url = `https://francybio.github.io/${p.id}/`;
    $('[data-screen-url]').textContent = url.replace('https://', '');
    $('[data-screen-note]').textContent = p.note;
    $('[data-open]').href = url;
  }
  rows.forEach(r => {
    r.addEventListener('mouseenter', () => { hover = true; show(+r.dataset.i); });
    r.addEventListener('mouseleave', () => { hover = false; });
    r.addEventListener('click', () => show(+r.dataset.i));
    r.addEventListener('keydown', e => { if (e.key === 'Enter') openLive(PROJECTS[+r.dataset.i]); });
  });
  $('[data-screen]').addEventListener('mouseenter', () => hover = true);
  $('[data-screen]').addEventListener('mouseleave', () => hover = false);
  timer = setInterval(() => { if (!hover && !document.hidden) show((cur + 1) % PROJECTS.length); }, 4200);
  $('[data-live]').addEventListener('click', () => openLive(PROJECTS[cur]));
  $('[data-screen-view]').addEventListener('click', () => openLive(PROJECTS[cur]));
  show(0);
  void timer;
}
function openLive(p) {
  const live = $('.live'), frame = $('[data-live-frame]');
  const url = `https://francybio.github.io/${p.id}/`;
  if (window.innerWidth < 640) { window.open(url, '_blank', 'noopener'); return; }
  frame.src = url;
  $('[data-live-url]').textContent = url.replace('https://', '');
  live.classList.add('is-open'); live.setAttribute('aria-hidden', 'false');
  if (window.__lenis) window.__lenis.stop();
}
function setupLive() {
  const live = $('.live');
  const close = () => {
    live.classList.remove('is-open'); live.setAttribute('aria-hidden', 'true');
    setTimeout(() => { $('[data-live-frame]').src = 'about:blank'; }, 600);
    if (window.__lenis) window.__lenis.start();
  };
  $$('[data-live-close]').forEach(b => b.addEventListener('click', close));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && live.classList.contains('is-open')) close(); });
}

/* ----------------------------------------------------------
   FORMULARIO
---------------------------------------------------------- */
function setupBrief() {
  const form = $('[data-brief]'), err = $('[data-err]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const mode = (e.submitter && e.submitter.dataset.send) || 'wa';
    const fd = new FormData(form);
    const svc = fd.getAll('svc');
    const name = (fd.get('name') || '').trim(), email = (fd.get('email') || '').trim();
    $$('.field', form).forEach(f => f.classList.remove('is-bad'));
    const bad = [];
    if (!name) { bad.push('su nombre'); form.name.closest('.field').classList.add('is-bad'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { bad.push('un email válido'); form.email.closest('.field').classList.add('is-bad'); }
    if (!form.privacy.checked) bad.push('aceptar el uso de datos');
    if (bad.length) { err.textContent = `Falta ${bad.join(', ')}.`; return; }
    err.textContent = '';
    const lines = [
      'Hola, Prestige Media. Me gustaría solicitar una propuesta.',
      '',
      `Servicios: ${svc.length ? svc.join(', ') : 'Por definir'}`,
      `Nombre: ${name}`,
      fd.get('company') ? `Empresa: ${fd.get('company')}` : '',
      `Email: ${email}`,
      fd.get('phone') ? `Teléfono: ${fd.get('phone')}` : '',
      '',
      fd.get('msg') ? `Proyecto: ${fd.get('msg')}` : ''
    ].filter((l, i, a) => l !== '' || (a[i - 1] !== '' && i < a.length - 1));
    const body = lines.join('\n');
    if (mode === 'mail') {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent('Solicitud de propuesta · ' + name)}&body=${encodeURIComponent(body)}`;
    } else {
      window.open(waLink(body), '_blank', 'noopener');
    }
    err.textContent = 'Gracias. Se ha abierto su solicitud lista para enviar.';
  });
}

/* ----------------------------------------------------------
   NAV, PUNTOS, CURSOR
---------------------------------------------------------- */
function setupNav() {
  const nav = $('#nav'), btn = $('.nav__menu'), menu = $('.menu');
  const setMenu = open => {
    btn.setAttribute('aria-expanded', String(open)); menu.classList.toggle('is-open', open); menu.setAttribute('aria-hidden', String(!open));
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  };
  btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href'); if (id.length < 2) return;
    const t = $(id); if (!t) return;
    e.preventDefault(); setMenu(false);
    setTimeout(() => scrollToEl(t, id === '#inicio' ? 0 : -60), 50);
  }));
  const dots = $('.dots');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > window.innerHeight * .9);
    dots.classList.toggle('is-on', y > window.innerHeight * .5);
    const mid = window.innerHeight / 2;
    const light = $$('.figures, .why').some(s => { const r = s.getBoundingClientRect(); return r.top < mid && r.bottom > mid; });
    document.body.classList.toggle('on-light', light);
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('[data-dot]');
  const io = new IntersectionObserver(ens => ens.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.dataset.dot === en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'agencia', 'servicios', 'metodo', 'proyectos', 'contacto'].forEach(id => io.observe(document.getElementById(id)));
}
function setupCursor() {
  if (coarse) return;
  const c = $('.cursor'), label = $('.cursor__label');
  let x = -100, y = -100, cx = x, cy = y;
  window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
  (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    const big = e.target.closest('[data-screen-view], .pane:not(.is-open)');
    const ring = e.target.closest('a, button, label, .wl, input, textarea');
    c.classList.toggle('is-big', !!big);
    c.classList.toggle('is-ring', !big && !!ring);
    label.textContent = big ? (big.matches('[data-screen-view]') ? 'Ver' : 'Abrir') : '';
  });
  $$('.magnetic').forEach(b => {
    b.addEventListener('mousemove', e => { const r = b.getBoundingClientRect(); b.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * .15}px,${(e.clientY - r.top - r.height / 2) * .3}px)`; });
    b.addEventListener('mouseleave', () => b.style.transform = '');
  });
}

/* ----------------------------------------------------------
   SCROLL + LOADER
---------------------------------------------------------- */
function setupScroll() {
  if (!hasGsap || reduce) { document.body.classList.add('no-gsap'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.3, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('[data-reveal]').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.fromTo('.footer__word', { letterSpacing: '.02em' }, { letterSpacing: '.14em', ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'center center', scrub: true } });
}
function intro() {
  if (!hasGsap || reduce) return;
  gsap.from('[data-landing-logo] img', { opacity: 0, scale: 1.08, filter: 'blur(14px)', duration: 2.2, ease: 'expo.out', clearProps: 'filter' });
  gsap.from('.landing__corner, .landing__scroll', { opacity: 0, y: 20, duration: 1.4, delay: .9, ease: 'expo.out', stagger: .1 });
  gsap.from('.nav__menu, .nav__right', { opacity: 0, y: -14, duration: 1.2, delay: .6, ease: 'expo.out' });
}
function runLoader() {
  const loader = $('.loader');
  if (!hasGsap || reduce) { loader.remove(); document.body.classList.remove('is-loading'); return; }
  let done = false;
  const finish = () => {
    if (done) return; done = true;
    document.body.classList.remove('is-loading');
    gsap.timeline({ onComplete: () => loader.remove() })
      .to('.loader__mark, .loader__word, .loader__line', { opacity: 0, y: -20, duration: .7, ease: 'power3.in', stagger: .05 })
      .to(loader, { opacity: 0, duration: .9, ease: 'power2.inOut' }, '-=.2')
      .add(intro, '-=.6');
  };
  gsap.to('.loader__line span', { scaleX: 1, duration: 2.4, ease: 'power2.inOut', onComplete: finish });
  setTimeout(finish, 6000);
}

function init() {
  setupWa();
  setupLanding();
  setupWords();
  setupVitrine();
  setupDial();
  setupCounters();
  setupWork();
  setupLive();
  setupBrief();
  setupNav();
  setupCursor();
  setupScroll();
  if (hasGsap && !reduce) landingScroll(); else $('#nav').classList.add('show-logo');
  runLoader();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
