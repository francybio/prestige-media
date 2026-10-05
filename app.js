/* ==========================================================
   PRESTIGE MEDIA — interacción
   ========================================================== */
(() => {
'use strict';

const WA_NUMBER = '34625179835';
const EMAIL = 'fbiondo2612@gmail.com';
const LANGS = ['es', 'en', 'ca', 'fr'];

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(hover:none), (pointer:coarse)').matches;
const hasGsap = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';
const desktop = () => window.innerWidth > 1100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sin almacenamiento */ } }
};
function scrollToEl(el, offset = -70) {
  if (!el) return;
  if (window.__lenis) window.__lenis.scrollTo(el, { offset, duration: 1.6 });
  else el.scrollIntoView({ behavior: 'smooth' });
}
const waLink = t => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(t)}`;

/* ----------------------------------------------------------
   IDIOMAS
---------------------------------------------------------- */
const DICT = window.I18N || { es: {} };
let LANG = (() => {
  const q = new URLSearchParams(location.search).get('lang');
  if (q && LANGS.includes(q)) return q;
  const s = store.get('pm-lang', null);
  return LANGS.includes(s) ? s : 'es';
})();
function t(key, vars) {
  let s = (DICT[LANG] && DICT[LANG][key]) ?? (DICT.es && DICT.es[key]) ?? key;
  if (vars) Object.entries(vars).forEach(([k, v]) => { s = s.replace(`{${k}}`, v); });
  return s;
}
const langHooks = [];
function applyLang(l) {
  LANG = LANGS.includes(l) ? l : 'es';
  store.set('pm-lang', LANG);
  document.documentElement.lang = LANG;
  document.title = t('meta.title');
  const md = $('meta[name="description"]'); if (md) md.setAttribute('content', t('meta.desc'));
  $$('[data-i18n]').forEach(el => { el.innerHTML = t(el.dataset.i18n); });
  $$('[data-i18n-attr]').forEach(el => el.dataset.i18nAttr.split(';').forEach(pair => {
    const [attr, key] = pair.split(':'); if (attr && key) el.setAttribute(attr.trim(), t(key.trim()));
  }));
  $$('[data-lang]').forEach(b => { b.classList.toggle('is-on', b.dataset.lang === LANG); b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)); });
  langHooks.forEach(fn => fn());
}
function setupLang() {
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-lang]');
    if (b) applyLang(b.dataset.lang);
  });
}

/* ----------------------------------------------------------
   WHATSAPP
---------------------------------------------------------- */
function setupWa() {
  const upd = () => { const href = waLink(t('wa.default')); $$('[data-wa]').forEach(a => a.setAttribute('href', href)); };
  langHooks.push(upd); upd();
}

/* ----------------------------------------------------------
   LANDING
---------------------------------------------------------- */
function setupLanding() {
  const pin = $('.landing__pin'), logo = $('[data-landing-logo]');
  pin.addEventListener('pointermove', e => {
    const r = pin.getBoundingClientRect(), l = logo.getBoundingClientRect();
    pin.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100) + '%');
    pin.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100) + '%');
    logo.style.setProperty('--sx', ((e.clientX - l.left) / l.width * 100) + '%');
    logo.style.setProperty('--sy', ((e.clientY - l.top) / l.height * 100) + '%');
    pin.classList.add('is-hover');
  });
  pin.addEventListener('pointerleave', () => pin.classList.remove('is-hover'));
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
let wordsProgress = 0;
function litWords() {
  const ws = $$('[data-words] .w');
  const n = Math.round(wordsProgress * ws.length);
  ws.forEach((w, i) => w.classList.toggle('is-lit', i < n));
}
function splitWords() {
  const p = $('[data-words]');
  p.innerHTML = p.textContent.trim().split(/\s+/).map(w => `<span class="w">${w}</span> `).join('');
  litWords();
}
function setupWords() {
  langHooks.push(splitWords);
  splitWords();
  if (!hasGsap || reduce) { wordsProgress = 1; litWords(); return; }
  ScrollTrigger.create({ trigger: '[data-words]', start: 'top 82%', end: 'bottom 45%', scrub: true, onUpdate: s => { wordsProgress = s.progress; litWords(); } });
}

/* ----------------------------------------------------------
   ESTUDIO: datos
---------------------------------------------------------- */
const ICONS = {
  restaurant: '<path d="M7 3v8M5 3v4a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  beauty: '<path d="M12 20c-4 0-7-3-7-7 3 0 5 1 7 3 2-2 4-3 7-3 0 4-3 7-7 7z"/><path d="M12 16c-2-2-2-6 0-10 2 4 2 8 0 10z"/>',
  health: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/><path d="M8 12h2l1-2 2 4 1-2h2"/>',
  shop: '<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>',
  pro: '<path d="M3 7h18v13H3z"/><path d="M8 7V4h8v3M3 12h18"/>',
  realestate: '<path d="M3 11l9-7 9 7v9H3z"/><path d="M9 20v-6h6v6"/>',
  hotel: '<path d="M12 4v2M5 7l1.5 1.5M19 7l-1.5 1.5M8 13a4 4 0 0 1 8 0"/><path d="M3 17c2 0 2-1 4.5-1S10 17 12 17s2.5-1 4.5-1S19 17 21 17M3 20c2 0 2-1 4.5-1S10 20 12 20s2.5-1 4.5-1S19 20 21 20"/>',
  other: '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>'
};
const SMALL = [
  '<path d="M12 3l2 6 6 2-6 2-2 6-2-6-6-2 6-2z"/>',
  '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
  '<path d="M12 3l8 4v5c0 5-3.5 8-8 9-4.5-1-8-4-8-9V7z"/><path d="m9 12 2 2 4-4"/>'
];
const SECTORS = {
  restaurant: { sections: ['about', 'menu', 'gallery', 'reviews'], features: ['booking', 'whatsapp', 'instagram'] },
  beauty: { sections: ['services', 'pricing', 'gallery', 'reviews'], features: ['booking', 'whatsapp', 'instagram'] },
  health: { sections: ['about', 'services', 'team', 'reviews', 'faq'], features: ['booking', 'whatsapp', 'seo'] },
  shop: { sections: ['about', 'gallery', 'reviews'], features: ['shop', 'instagram', 'whatsapp'] },
  pro: { sections: ['about', 'services', 'team', 'faq'], features: ['whatsapp', 'seo', 'blog'] },
  realestate: { sections: ['listings', 'services', 'about', 'reviews'], features: ['whatsapp', 'multilang', 'seo'] },
  hotel: { sections: ['rooms', 'gallery', 'reviews', 'faq'], features: ['booking', 'multilang', 'instagram'] },
  other: { sections: ['about', 'services', 'reviews'], features: ['whatsapp'] }
};
const STYLES = {
  elegant: { b: '#0B0B0D', s: '#16161A', t: '#F2F2F2', m: '#9A9AA2', acc: ['#CFCFD4', '#C8A96A', '#9DB2FF'], r: '0px', font: 'serif' },
  minimal: { b: '#FFFFFF', s: '#F4F4F4', t: '#111111', m: '#6E6E6E', acc: ['#111111', '#2F6BFF', '#E04A2F'], r: '4px', font: 'sans' },
  warm: { b: '#F6EFE6', s: '#EDE1D2', t: '#3A2A20', m: '#8A7464', acc: ['#C2673F', '#8E6E53', '#6F7F5A'], r: '18px', font: 'serif' },
  bold: { b: '#FFF4EC', s: '#FFFFFF', t: '#1C1013', m: '#6B5A5C', acc: ['#E0233F', '#2F7BFF', '#FFB800'], r: '14px', font: 'display' },
  natural: { b: '#F4EFE3', s: '#E7E0CD', t: '#183A1F', m: '#5E6B5F', acc: ['#3E6B47', '#C8693F', '#8FA67E'], r: '26px', font: 'serif' },
  tech: { b: '#0A0F1E', s: '#121A30', t: '#E8EEFF', m: '#8A96B8', acc: ['#4F7CFF', '#00D1B2', '#B072FF'], r: '10px', font: 'sans' }
};
const FONTS = { serif: "'Cormorant Garamond',Georgia,serif", sans: "'Jost',system-ui,sans-serif", display: "'Syne',system-ui,sans-serif" };
const SECTION_ORDER = ['about', 'services', 'menu', 'listings', 'rooms', 'pricing', 'gallery', 'team', 'reviews', 'faq'];
const FEATURES = ['booking', 'shop', 'blog', 'whatsapp', 'multilang', 'instagram', 'seo', 'analytics'];

const svgI = (p, cls = '') => `<svg class="${cls}" viewBox="0 0 24 24">${p}</svg>`;
function textOn(hex) {
  const n = parseInt(hex.slice(1), 16), r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) > 160 ? '#111111' : '#FFFFFF';
}

/* ----------------------------------------------------------
   ESTUDIO: render de la mini web
---------------------------------------------------------- */
function siteHTML(st) {
  const name = esc((st.name || '').trim() || t('studio.defName'));
  const sec = st.sections, ft = st.features;
  const has = k => ft.includes(k);
  const L = (w = 100) => `<span class="pv-line" style="width:${w}%"></span>`;
  const art = (icon = st.sector, extra = '') => `<div class="pv-art ${extra}">${svgI(ICONS[icon] || ICONS.other)}</div>`;
  const cta = has('booking') ? t('pv.book') : t('pv.contact');
  const ordered = SECTION_ORDER.filter(k => sec.includes(k));
  const links = ordered.slice(0, 4).map(k => `<span>${t('sec.' + k)}</span>`).join('') + `<span>${t('menu.contact')}</span>`;
  let h = `<header class="pv-nav"><span class="pv-logo">${name}</span><nav class="pv-links">${links}</nav><div class="pv-nav__r">${has('multilang') ? '<span class="pv-badge">ES · EN · FR</span>' : ''}${has('shop') ? svgI('<path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/>', 'pv-cart') : ''}<span class="pv-btn pv-btn--sm">${cta}</span><span class="pv-burger"></span></div></header>`;
  h += `<section class="pv-hero"><div class="pv-hero__txt"><p class="pv-eyebrow">${t('sector.' + st.sector + '.n')}</p><h1>${t('sector.' + st.sector + '.h')}</h1><p class="pv-sub">${t('sector.' + st.sector + '.s')}</p><div class="pv-ctas"><span class="pv-btn">${cta}</span><span class="pv-btn pv-btn--ghost">${t('pv.discover')}</span></div></div>${art(st.sector, 'pv-art--hero')}</section>`;
  let alt = false;
  const S = (title, body, key) => { alt = !alt; return `<section class="pv-sec ${alt ? 'pv-sec--alt' : ''}" data-k="${key}"><h2 class="pv-h2">${title}</h2>${body}</section>`; };
  const items = [1, 2, 3].map(i => t(`sector.${st.sector}.i${i}`));
  ordered.forEach(k => {
    if (k === 'about') h += S(t('sec.about'), `<div class="pv-split"><div>${L(92)}${L(86)}${L(95)}${L(70)}<br>${L(88)}${L(60)}</div>${art()}</div>`, k);
    if (k === 'services') h += S(t('sec.services'), `<div class="pv-grid3">${items.map((it, i) => `<div class="pv-card"><span class="pv-ico">${svgI(SMALL[i])}</span><h3>${esc(it)}</h3>${L(90)}${L(70)}</div>`).join('')}</div>`, k);
    if (k === 'menu') h += S(t('sec.menu'), `<div class="pv-split"><div>${[['pv.menu1', '9€'], ['pv.menu2', '16€'], ['pv.menu3', '6€']].map(([m, p]) => `<div class="pv-menu-row"><b>${t(m)}</b><span>${p}</span></div>`).join('')}</div>${art('restaurant')}</div>`, k);
    if (k === 'listings') h += S(t('sec.listings'), `<div class="pv-grid3">${['285.000€', '1.150€', '420.000€'].map((p, i) => `<div class="pv-card">${art('realestate')}<h3>${esc(items[i])}</h3><p class="pv-price">${p}</p><small>${t('pv.listing')}</small></div>`).join('')}</div>`, k);
    if (k === 'rooms') h += S(t('sec.rooms'), `<div class="pv-grid3">${[['pv.room1', '120€'], ['pv.room2', '190€'], ['pv.room3', '160€']].map(([r, p]) => `<div class="pv-card">${art('hotel')}<h3>${t(r)}</h3><p class="pv-price">${p}<small>${t('pv.night')}</small></p></div>`).join('')}</div>`, k);
    if (k === 'pricing') h += S(t('sec.pricing'), `<div class="pv-grid3">${[['pv.plan1', '29€'], ['pv.plan2', '49€'], ['pv.plan3', '79€']].map(([pl, p]) => `<div class="pv-card"><h3>${t(pl)}</h3><p class="pv-price"><small>${t('pv.from')} </small>${p}</p>${L(85)}${L(70)}${L(78)}</div>`).join('')}</div>`, k);
    if (k === 'gallery') h += S(t('sec.gallery'), `<div class="pv-gallery">${[0, 1, 2, 3, 4, 5].map(() => art()).join('')}</div>`, k);
    if (k === 'team') h += S(t('sec.team'), `<div class="pv-team">${['pv.team1', 'pv.team2', 'pv.team3'].map(r => `<div>${art()}<b>${t(r)}</b>${L(60)}</div>`).join('')}</div>`, k);
    if (k === 'reviews') h += S(t('sec.reviews'), `<div class="pv-grid3">${['pv.r1', 'pv.r2', 'pv.r3'].map(r => `<div class="pv-card"><span class="pv-stars">★★★★★</span><p class="pv-quote">${t(r)}</p>${L(40)}</div>`).join('')}</div>`, k);
    if (k === 'faq') h += S(t('sec.faq'), `<div class="pv-faq">${[80, 65, 72, 58].map(w => `<div><span>${L(w)}</span><b>+</b></div>`).join('')}</div>`, k);
  });
  if (has('booking')) h += S(t('pv.bookTitle'), `<div class="pv-book"><label class="pv-field">${t('pv.date')}<i></i></label><label class="pv-field">${t('pv.time')}<i></i></label><label class="pv-field">${t('pv.people')}<i></i></label><span class="pv-btn">${t('pv.confirm')}</span></div>`, 'booking');
  if (has('shop')) h += S(t('feat.shop'), `<div class="pv-grid4">${['39€', '59€', '24€', '89€'].map(p => `<div class="pv-card">${art('shop')}${L(70)}<p class="pv-price">${p}</p><span class="pv-btn pv-btn--sm">${t('pv.add')}</span></div>`).join('')}</div>`, 'shop');
  if (has('blog')) h += S(t('feat.blog'), `<div class="pv-grid3">${[0, 1, 2].map(() => `<div class="pv-card">${art()}${L(90)}${L(65)}<p class="pv-price" style="font-size:16px">${t('pv.read')} →</p></div>`).join('')}</div>`, 'blog');
  if (has('instagram')) h += S(t('pv.ig'), `<div class="pv-ig">${[0, 1, 2, 3, 4, 5].map(() => art()).join('')}</div>`, 'instagram');
  h += S(t('pv.where'), `<div class="pv-contact"><div>${L(70)}${L(55)}${L(62)}<br><span class="pv-btn">${t('pv.write')}</span></div><div class="pv-map"></div></div>`, 'contact');
  h += `<footer class="pv-foot"><span>© 2026 ${name}</span><span>${t('pv.rights')}</span></footer>`;
  if (has('whatsapp')) h += `<div class="pv-wa">${svgI('<path d="M20.5 3.5A11 11 0 0 0 3.2 17.1L2 22l5-1.3A11 11 0 0 0 20.5 3.5Zm-8.4 17a9 9 0 0 1-4.6-1.3l-.3-.2-3 .8.8-2.9-.2-.3a9 9 0 1 1 7.3 3.9Z"/>')}</div>`;
  return h;
}
function paintSite(root, st, mobile) {
  const sty = STYLES[st.style];
  const accent = st.accent || sty.acc[0];
  root.className = `pv pv--${st.style}${mobile ? ' pv--m' : ''}`;
  root.style.cssText = `--b:${sty.b};--s:${sty.s};--t:${sty.t};--m:${sty.m};--a:${accent};--at:${textOn(accent)};--r:${sty.r};--hf:${FONTS[st.font || sty.font]};--bf:${FONTS.sans}`;
  root.innerHTML = siteHTML(st);
}
function fitZoom(root, box, mobile) {
  const W = mobile ? 390 : 1200;
  if (box.clientWidth) root.style.zoom = String(box.clientWidth / W);
}

/* ----------------------------------------------------------
   ESTUDIO: interfaz
---------------------------------------------------------- */
const DEFAULT = { name: '', sector: 'beauty', style: 'elegant', accent: null, font: null, sections: SECTORS.beauty.sections.slice(), features: SECTORS.beauty.features.slice(), device: 'desktop', tab: 0, custom: false };
const SAVED = store.get('pm-studio', null);
let S = Object.assign({}, DEFAULT, SAVED || {});
if (!SAVED && window.innerWidth < 640) S.device = 'mobile';
if (!SECTORS[S.sector]) S.sector = 'beauty';
if (!STYLES[S.style]) S.style = 'elegant';
if (!Array.isArray(S.sections)) S.sections = SECTORS[S.sector].sections.slice();
if (!Array.isArray(S.features)) S.features = SECTORS[S.sector].features.slice();
const saveS = () => store.set('pm-studio', S);

function setupStudio() {
  const pv = $('[data-pv]'), vp = $('[data-pv-viewport]'), frame = $('[data-device-frame]');
  const nameIn = $('[data-s-name]');
  nameIn.value = S.name || '';

  function renderControls() {
    $('[data-s-sector]').innerHTML = Object.keys(SECTORS).map(k => `<button type="button" class="scard ${S.sector === k ? 'is-on' : ''}" data-v="${k}">${svgI(ICONS[k])}<span>${t('sector.' + k + '.n')}</span></button>`).join('');
    $('[data-s-style]').innerHTML = Object.entries(STYLES).map(([k, v]) => `<button type="button" class="scard ${S.style === k ? 'is-on' : ''}" data-v="${k}"><span class="sdots"><i style="background:${v.b}"></i><i style="background:${v.s}"></i><i style="background:${v.acc[0]}"></i></span><span>${t('style.' + k)}</span></button>`).join('');
    const sty = STYLES[S.style], acc = S.accent || sty.acc[0];
    $('[data-s-accent]').innerHTML = sty.acc.map(c => `<button type="button" class="sw ${!S.custom && acc.toLowerCase() === c.toLowerCase() ? 'is-on' : ''}" style="--c:${c}" data-v="${c}" aria-label="${c}"></button>`).join('') +
      `<label class="sw-custom ${S.custom ? 'is-on' : ''}"><input type="color" value="${acc}" data-s-color aria-label="${t('studio.custom')}">${t('studio.custom')}</label>`;
    $('[data-s-font]').innerHTML = Object.keys(FONTS).map(k => `<button type="button" class="schip schip--font ${(S.font || sty.font) === k ? 'is-on' : ''}" data-v="${k}" style="font-family:${FONTS[k]}">Aa · ${t('font.' + k)}</button>`).join('');
    $('[data-s-sections]').innerHTML = SECTION_ORDER.map(k => `<button type="button" class="schip ${S.sections.includes(k) ? 'is-on' : ''}" data-v="${k}"><i>${S.sections.includes(k) ? '✓' : ''}</i>${t('sec.' + k)}</button>`).join('');
    $('[data-s-features]').innerHTML = FEATURES.map(k => `<button type="button" class="schip ${S.features.includes(k) ? 'is-on' : ''}" data-v="${k}"><i>${S.features.includes(k) ? '✓' : ''}</i>${t('feat.' + k)}</button>`).join('');
    $$('.stab').forEach(b => b.classList.toggle('is-on', +b.dataset.tab === S.tab));
    $$('.spanel').forEach(p => p.classList.toggle('is-on', +p.dataset.panel === S.tab));
    $('[data-s-prev]').disabled = S.tab === 0;
    $('[data-s-next]').disabled = S.tab === 3;
    $$('[data-device]').forEach(b => b.classList.toggle('is-on', b.dataset.device === S.device));
  }
  function summary() {
    const sty = STYLES[S.style];
    const acc = (S.accent || sty.acc[0]).toUpperCase();
    const secs = SECTION_ORDER.filter(k => S.sections.includes(k)).map(k => t('sec.' + k));
    const fts = FEATURES.filter(k => S.features.includes(k)).map(k => t('feat.' + k));
    const name = (S.name || '').trim() || t('studio.defName');
    const rows = [
      [t('studio.sumSector'), t('sector.' + S.sector + '.n')],
      [t('studio.sumStyle'), `${t('style.' + S.style)} · <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${acc};vertical-align:middle"></span> ${acc}`],
      [t('studio.sumFont'), t('font.' + (S.font || sty.font))],
      [t('studio.sumSections'), secs.length ? secs.join(', ') : t('studio.none')],
      [t('studio.sumFeatures'), fts.length ? fts.join(', ') : t('studio.none')]
    ];
    $('[data-s-summary]').innerHTML = rows.map(([a, b]) => `<dt>${a}</dt><dd>${b}</dd>`).join('');
    const brief = [
      t('studio.msgIntro'), '',
      `${t('studio.msgName')}: ${name}`,
      `${t('studio.sumSector')}: ${t('sector.' + S.sector + '.n')}`,
      `${t('studio.sumStyle')}: ${t('style.' + S.style)} (${t('studio.msgColor')} ${acc})`,
      `${t('studio.sumFont')}: ${t('font.' + (S.font || sty.font))}`,
      `${t('studio.sumSections')}: ${secs.join(', ') || t('studio.none')}`,
      `${t('studio.sumFeatures')}: ${fts.join(', ') || t('studio.none')}`
    ].join('\n');
    $('[data-s-send]').href = waLink(brief);
    return brief;
  }
  function preview() {
    const mobile = S.device === 'mobile';
    frame.classList.toggle('is-mobile', mobile);
    paintSite(pv, S, mobile);
    fitZoom(pv, vp, mobile);
    const slug = ((S.name || '').trim() || t('studio.defName')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '') || 'web';
    $('[data-pv-url]').textContent = `${slug}.com`;
  }
  function all() { renderControls(); summary(); preview(); saveS(); }
  function scrollPreviewTo(k) {
    const target = $(`.pv-sec[data-k="${k}"]`, pv);
    if (!target) return;
    const z = parseFloat(pv.style.zoom) || 1;
    vp.scrollTo({ top: Math.max(0, target.offsetTop * z - 10), behavior: reduce ? 'auto' : 'smooth' });
  }

  nameIn.addEventListener('input', () => { S.name = nameIn.value; summary(); preview(); saveS(); });
  $('[data-s-sector]').addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    S.sector = b.dataset.v; S.sections = SECTORS[S.sector].sections.slice(); S.features = SECTORS[S.sector].features.slice();
    all(); vp.scrollTop = 0;
  });
  $('[data-s-style]').addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    S.style = b.dataset.v; S.accent = null; S.font = null; S.custom = false; all();
  });
  $('[data-s-accent]').addEventListener('click', e => {
    const b = e.target.closest('.sw'); if (!b) return;
    S.accent = b.dataset.v; S.custom = false; all();
  });
  $('[data-s-accent]').addEventListener('input', e => {
    if (!e.target.matches('[data-s-color]')) return;
    S.accent = e.target.value; S.custom = true; summary(); preview(); saveS();
    $$('.sw', $('[data-s-accent]')).forEach(s => s.classList.remove('is-on'));
    $('.sw-custom').classList.add('is-on');
  });
  $('[data-s-font]').addEventListener('click', e => { const b = e.target.closest('[data-v]'); if (!b) return; S.font = b.dataset.v; all(); });
  $('[data-s-sections]').addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const k = b.dataset.v, on = !S.sections.includes(k);
    S.sections = on ? S.sections.concat(k) : S.sections.filter(x => x !== k);
    all(); if (on) scrollPreviewTo(k);
  });
  $('[data-s-features]').addEventListener('click', e => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    const k = b.dataset.v, on = !S.features.includes(k);
    S.features = on ? S.features.concat(k) : S.features.filter(x => x !== k);
    all(); if (on) scrollPreviewTo(k);
  });
  $$('.stab').forEach(b => b.addEventListener('click', () => { S.tab = +b.dataset.tab; renderControls(); saveS(); }));
  $('[data-s-prev]').addEventListener('click', () => { S.tab = Math.max(0, S.tab - 1); renderControls(); saveS(); });
  $('[data-s-next]').addEventListener('click', () => { S.tab = Math.min(3, S.tab + 1); renderControls(); saveS(); });
  $('[data-s-random]').addEventListener('click', () => {
    const keys = Object.keys(STYLES).filter(k => k !== S.style);
    S.style = keys[Math.random() * keys.length | 0];
    S.accent = STYLES[S.style].acc[Math.random() * 3 | 0]; S.custom = false;
    S.font = Object.keys(FONTS)[Math.random() * 3 | 0];
    all();
    if (!reduce) vp.animate([{ opacity: .3, transform: 'scale(.985)' }, { opacity: 1, transform: 'none' }], { duration: 600, easing: 'cubic-bezier(.19,1,.22,1)' });
  });
  $$('[data-device]').forEach(b => b.addEventListener('click', () => { S.device = b.dataset.device; all(); vp.scrollTop = 0; }));
  $('[data-s-form]').addEventListener('click', () => {
    const form = $('[data-brief]');
    const web = $('[data-services] input[value="web"]'); if (web) web.checked = true;
    form.msg.value = summary();
    if (!form.company.value && (S.name || '').trim()) form.company.value = S.name.trim();
    $('[data-s-ok]').textContent = t('studio.added');
    scrollToEl($('#contacto'));
  });
  if (window.ResizeObserver) new ResizeObserver(() => fitZoom(pv, vp, S.device === 'mobile')).observe(vp);
  else window.addEventListener('resize', () => fitZoom(pv, vp, S.device === 'mobile'));
  langHooks.push(() => { all(); $('[data-s-ok]').textContent = ''; });
  all();
}

/* mini web animada en el panel «Web corporativa» */
function setupMini() {
  const box = $('[data-mini]');
  const root = document.createElement('div');
  box.appendChild(root);
  const looks = [
    { sector: 'beauty', style: 'elegant' }, { sector: 'restaurant', style: 'warm' }, { sector: 'shop', style: 'bold' },
    { sector: 'health', style: 'natural' }, { sector: 'pro', style: 'tech' }, { sector: 'hotel', style: 'minimal' }
  ];
  let i = 0;
  const draw = () => {
    const lk = looks[i];
    paintSite(root, { name: '', sector: lk.sector, style: lk.style, accent: null, font: null, sections: SECTORS[lk.sector].sections, features: [] }, false);
    fitZoom(root, box, false);
  };
  draw();
  setInterval(() => {
    if (document.hidden || (desktop() && !$('[data-pane="web"]').classList.contains('is-open'))) return;
    box.classList.add('is-swap');
    setTimeout(() => { i = (i + 1) % looks.length; draw(); box.classList.remove('is-swap'); }, 600);
  }, 3200);
  if (window.ResizeObserver) new ResizeObserver(() => fitZoom(root, box, false)).observe(box);
  else window.addEventListener('resize', () => fitZoom(root, box, false));
  langHooks.push(draw);
}

/* ----------------------------------------------------------
   SERVICIOS: vitrina
---------------------------------------------------------- */
function setupVitrine() {
  const panes = $$('[data-pane]');
  let timers = [];
  const clearTimers = () => { timers.forEach(x => clearInterval(x)); timers = []; };
  function open(p) {
    if (p.classList.contains('is-open') && timers.length) return;
    panes.forEach(x => x.classList.toggle('is-open', x === p));
    clearTimers();
    animatePane(p);
    if (p.dataset.pane === 'web') setTimeout(() => { const r = $('[data-mini] .pv'); if (r) fitZoom(r, $('[data-mini]'), false); }, 80);
  }
  function animatePane(p) {
    const kind = p.dataset.pane;
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
    const order0 = [0, 1, 2, 3], order1 = [2, 0, 1, 3];
    const place = ord => ord.forEach((idx, pos) => { items[idx].style.top = (pos * 54) + 'px'; });
    let k = 0, phase = 0, wait = 0;
    place(order0); txt.textContent = '';
    timers.push(setInterval(() => {
      const phrase = t('vis.q');
      if (phase === 0) { k++; txt.textContent = phrase.slice(0, k); if (k >= phrase.length) { phase = 1; wait = 0; } }
      else if (phase === 1) { if (++wait === 6) place(order1); if (wait > 34) phase = 2; }
      else { k--; txt.textContent = phrase.slice(0, Math.max(k, 0)); if (k <= 0) { place(order0); phase = 0; } }
    }, 80));
  }
  panes.forEach(p => {
    p.addEventListener('mouseenter', () => { if (desktop() && !coarse) open(p); });
    p.addEventListener('click', e => { if (!e.target.closest('[data-want]')) open(p); });
    p.addEventListener('focus', () => open(p));
    p.addEventListener('pointermove', e => { const r = p.getBoundingClientRect(); p.style.setProperty('--px', (e.clientX - r.left) + 'px'); p.style.setProperty('--py', (e.clientY - r.top) + 'px'); });
  });
  const mobileAll = () => { clearTimers(); panes.forEach(animatePane); };
  if (!desktop()) mobileAll(); else animatePane(panes[0]);
  let wasDesk = desktop();
  window.addEventListener('resize', () => { const d = desktop(); if (d !== wasDesk) { wasDesk = d; if (d) open(panes[0]); else mobileAll(); } });
  $$('[data-want]').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const map = { web: 'web', landing: 'land', social: 'social', seo: 'seo' };
    const inp = $(`[data-services] input[value="${map[b.dataset.want]}"]`); if (inp) inp.checked = true;
    scrollToEl($('#contacto'));
  }));
}

/* ----------------------------------------------------------
   MÉTODO: esfera de reloj
---------------------------------------------------------- */
function setupDial() {
  const svg = $('[data-dial] svg');
  const ticks = $('[data-ticks]', svg), nums = $('[data-numerals]', svg), sub = $('[data-subticks]', svg);
  let tk = '';
  for (let i = 0; i < 60; i++) {
    const a = i * 6 * Math.PI / 180, big = i % 5 === 0, r1 = big ? 206 : 214, r2 = 224;
    tk += `<line x1="${250 + Math.sin(a) * r1}" y1="${250 - Math.cos(a) * r1}" x2="${250 + Math.sin(a) * r2}" y2="${250 - Math.cos(a) * r2}" stroke="${big ? '#e7e7ea' : 'rgba(231,231,234,.35)'}" stroke-width="${big ? 2.2 : 1}"/>`;
  }
  ticks.innerHTML = tk;
  const R = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
  nums.innerHTML = R.map((r, i) => { const a = i * 30 * Math.PI / 180; return i === 6 ? '' : `<text x="${250 + Math.sin(a) * 182}" y="${250 - Math.cos(a) * 182}">${r}</text>`; }).join('');
  let s = '';
  for (let i = 0; i < 12; i++) { const a = i * 30 * Math.PI / 180; s += `<line x1="${250 + Math.sin(a) * 38}" y1="${340 - Math.cos(a) * 38}" x2="${250 + Math.sin(a) * 43}" y2="${340 - Math.cos(a) * 43}" stroke="rgba(231,231,234,.5)" stroke-width="1"/>`; }
  sub.innerHTML = s;
  const hour = $('[data-hour]', svg), min = $('[data-minute]', svg), sec = $('[data-sec]', svg), stepTxt = $('[data-dial-step]', svg);
  const steps = $$('[data-steps] li');
  const tickSec = () => { sec.style.transform = `rotate(${new Date().getSeconds() * 6}deg)`; };
  tickSec(); setInterval(tickSec, 1000);
  let cur = -1;
  function setProgress(p, force) {
    p = clamp(p, 0, 1);
    min.style.transform = `rotate(${p * 360}deg)`;
    hour.style.transform = `rotate(${300 + p * 30}deg)`;
    const i = Math.min(3, Math.floor(p * 4 + .02));
    if (i !== cur || force) {
      cur = i;
      steps.forEach((li, k) => li.classList.toggle('is-on', k === i));
      stepTxt.textContent = t('met.d' + (i + 1));
    }
  }
  const secEl = $('#metodo');
  let lastP = 0;
  function onScroll() {
    const r = secEl.getBoundingClientRect(), total = r.height - window.innerHeight;
    lastP = total > 50 ? -r.top / total : clamp((window.innerHeight - r.top) / (window.innerHeight + r.height), 0, 1);
    setProgress(lastP);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  langHooks.push(() => setProgress(lastP, true));
  const dial = $('[data-dial]');
  if (!coarse && !reduce) {
    secEl.addEventListener('pointermove', e => {
      const r = dial.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      dial.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    secEl.addEventListener('pointerleave', () => dial.style.transform = '');
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
   FORMULARIO
---------------------------------------------------------- */
function setupBrief() {
  const form = $('[data-brief]'), err = $('[data-err]');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const mode = (e.submitter && e.submitter.dataset.send) || 'wa';
    const fd = new FormData(form);
    const svc = fd.getAll('svc').map(v => t('form.o.' + v));
    const name = (fd.get('name') || '').trim(), email = (fd.get('email') || '').trim();
    $$('.field', form).forEach(f => f.classList.remove('is-bad'));
    const bad = [];
    if (!name) { bad.push(t('form.errName')); form.name.closest('.field').classList.add('is-bad'); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { bad.push(t('form.errEmail')); form.email.closest('.field').classList.add('is-bad'); }
    if (!form.privacy.checked) bad.push(t('form.errPrivacy'));
    if (bad.length) { err.textContent = t('form.missing', { x: bad.join(', ') }); return; }
    const lines = [t('msg.hello'), '', `${t('msg.services')}: ${svc.length ? svc.join(', ') : t('msg.tbd')}`, `${t('msg.name')}: ${name}`];
    if (fd.get('company')) lines.push(`${t('msg.company')}: ${fd.get('company')}`);
    lines.push(`${t('msg.email')}: ${email}`);
    if (fd.get('phone')) lines.push(`${t('msg.phone')}: ${fd.get('phone')}`);
    if (fd.get('msg')) lines.push('', `${t('msg.project')}:`, fd.get('msg'));
    const body = lines.join('\n');
    if (mode === 'mail') window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(t('msg.subject') + ' · ' + name)}&body=${encodeURIComponent(body)}`;
    else window.open(waLink(body), '_blank', 'noopener');
    err.textContent = t('form.ok');
  });
  langHooks.push(() => { err.textContent = ''; });
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
    const tg = $(id); if (!tg) return;
    e.preventDefault(); setMenu(false);
    setTimeout(() => scrollToEl(tg, id === '#inicio' ? 0 : -60), 50);
  }));
  const dots = $('.dots');
  const onScroll = () => {
    const y = window.scrollY;
    nav.classList.toggle('is-scrolled', y > window.innerHeight * .9);
    dots.classList.toggle('is-on', y > window.innerHeight * .5);
    const mid = window.innerHeight / 2;
    document.body.classList.toggle('on-light', $$('.figures, .why').some(s => { const r = s.getBoundingClientRect(); return r.top < mid && r.bottom > mid; }));
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const links = $$('[data-dot]');
  const io = new IntersectionObserver(ens => ens.forEach(en => { if (en.isIntersecting) links.forEach(l => l.classList.toggle('is-active', l.dataset.dot === en.target.id)); }), { rootMargin: '-45% 0px -50% 0px' });
  ['inicio', 'agencia', 'servicios', 'metodo', 'disena', 'contacto'].forEach(id => io.observe(document.getElementById(id)));
}
function setupCursor() {
  if (coarse) return;
  const c = $('.cursor'), label = $('.cursor__label');
  let x = -100, y = -100, cx = x, cy = y;
  window.addEventListener('pointermove', e => { x = e.clientX; y = e.clientY; });
  (function loop() { cx += (x - cx) * .2; cy += (y - cy) * .2; c.style.transform = `translate(${cx}px,${cy}px)`; requestAnimationFrame(loop); })();
  document.addEventListener('mouseover', e => {
    const big = e.target.closest('.pane:not(.is-open)');
    const ring = e.target.closest('a, button, label, input, textarea, [data-pv-viewport]');
    c.classList.toggle('is-big', !!big);
    c.classList.toggle('is-ring', !big && !!ring);
    label.textContent = big ? '+' : '';
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
  if (!hasGsap || reduce) { document.body.classList.add('no-gsap'); $('#nav').classList.add('show-logo'); return; }
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    const lenis = new Lenis({ duration: 1.3, smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(x => lenis.raf(x * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  $$('[data-reveal]').forEach(el => gsap.to(el, { opacity: 1, y: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 90%' } }));
  gsap.fromTo('.footer__word', { letterSpacing: '.02em' }, { letterSpacing: '.14em', ease: 'none', scrollTrigger: { trigger: '.footer', start: 'top bottom', end: 'center center', scrub: true } });
  landingScroll();
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
  setupLang();
  applyLang(LANG);
  setupWa();
  setupLanding();
  setupScroll();
  setupWords();
  setupVitrine();
  setupMini();
  setupDial();
  setupCounters();
  setupStudio();
  setupBrief();
  setupNav();
  setupCursor();
  runLoader();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
