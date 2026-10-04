const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Year ── */
$('#year').textContent = new Date().getFullYear();

/* ── Mobile menu ── */
const menuBtn = $('#menuBtn');
const mobileMenu = $('#mobileMenu');
const nav = $('#nav');

function setMenu(open) {
  menuBtn.setAttribute('aria-expanded', String(open));
  menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  if (open) mobileMenu.style.top = `${nav.getBoundingClientRect().bottom}px`;
  mobileMenu.hidden = !open;
  document.body.classList.toggle('menu-open', open);
}
menuBtn.addEventListener('click', () => setMenu(mobileMenu.hidden));
$$('a', mobileMenu).forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !mobileMenu.hidden) setMenu(false); });
matchMedia('(min-width: 1000px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

/* ── Hero slideshow ──
   Cycles the big hero photo. Pauses when off screen, when the tab is hidden,
   and when the viewer hits the pause button. Add/remove <img> tags in the HTML
   to change the rotation. */
const slidesWrap = $('#slides');
if (slidesWrap) {
  const slides = $$('img', slidesWrap);
  const bar = $('#slidesBar');
  const toggle = $('#slidesToggle');
  const HOLD = 5500;
  let current = 0;
  let timer = null;
  let paused = reduceMotion || slides.length < 2;
  let onScreen = true;

  function paint() {
    slides.forEach((img, i) => img.classList.toggle('is-on', i === current));
  }
  function runBar() {
    if (!bar) return;
    bar.classList.remove('is-running');
    bar.offsetWidth;            // restart the transition
    if (!paused) bar.classList.add('is-running');
  }
  function advance() {
    current = (current + 1) % slides.length;
    paint();
    runBar();
  }
  function play() {
    stop();
    if (paused || !onScreen) return;
    runBar();
    timer = setInterval(advance, HOLD);
  }
  function stop() {
    clearInterval(timer);
    timer = null;
    if (bar) bar.classList.remove('is-running');
  }

  toggle?.addEventListener('click', () => {
    paused = !paused;
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    paused ? stop() : play();
  });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    onScreen ? play() : stop();
  }, { threshold: 0.2 }).observe(slidesWrap);

  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : play()));

  if (paused && toggle) {
    toggle.classList.add('is-paused');
    toggle.setAttribute('aria-label', 'Play slideshow');
  }
  play();
}

/* ── Scroll reveal ── */
const revealer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealer.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
$$('.reveal').forEach(el => revealer.observe(el));

/* ── Current section in nav ── */
const navLinks = $$('.nav-links a');
const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
const spy = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === `#${entry.target.id}`));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
sections.forEach(s => spy.observe(s));

/* ── Services accordion + preview ── */
const svcItems = $$('.svc-item');
const svcImg = $('#svcImg');
const svcLabel = $('#svcLabel');

function openService(item) {
  svcItems.forEach(i => {
    const on = i === item;
    i.classList.toggle('is-active', on);
    $('.svc-btn', i).setAttribute('aria-expanded', String(on));
  });
  const src = item.dataset.img;
  if (svcImg.getAttribute('src') === src) return;
  if (reduceMotion) {
    svcImg.src = src;
    svcLabel.textContent = item.dataset.service;
    return;
  }
  svcImg.classList.add('is-swapping');
  setTimeout(() => {
    svcImg.src = src;
    svcLabel.textContent = item.dataset.service;
    svcImg.onload = () => svcImg.classList.remove('is-swapping');
    if (svcImg.complete) svcImg.classList.remove('is-swapping');
  }, 200);
}
svcItems.forEach(item => {
  $('.svc-btn', item).addEventListener('click', () => openService(item));
  // preload preview images
  new Image().src = item.dataset.img;
});

/* ── "Request an estimate" links preselect the service in the form ── */
function preselect(service) {
  const radio = $$('input[name="Service"]').find(r => r.value === service);
  if (radio) radio.checked = true;
}
$$('[data-service]').forEach(el => {
  if (el.tagName !== 'A') return;
  el.addEventListener('click', () => preselect(el.dataset.service));
});

/* ── Project filters ── */
const projects = $$('.proj');
const projEmpty = $('#projEmpty');
$$('.filter').forEach(btn => btn.addEventListener('click', () => {
  $$('.filter').forEach(b => {
    b.classList.toggle('is-on', b === btn);
    b.setAttribute('aria-pressed', String(b === btn));
  });
  const cat = btn.dataset.cat;
  let shown = 0;
  projects.forEach(p => {
    const show = cat === 'all' || p.dataset.cat === cat;
    p.hidden = !show;
    if (show) { p.classList.add('is-in'); shown++; }
  });
  projEmpty.hidden = shown > 0;
}));
$$('.filter').forEach(b => b.setAttribute('aria-pressed', String(b.classList.contains('is-on'))));

/* ── Photo viewer ── */
const viewer = $('#viewer');
const viewerImg = $('#viewerImg');
const viewerCap = $('#viewerCap');
let viewIndex = 0;
const visibleProjects = () => projects.filter(p => !p.hidden);

function showPhoto(i) {
  const list = visibleProjects();
  viewIndex = (i + list.length) % list.length;
  const p = list[viewIndex];
  const img = $('img', p);
  viewerImg.src = p.dataset.full;
  viewerImg.alt = img.alt;
  viewerCap.textContent = $('.proj-cap strong', p).textContent;
}
projects.forEach(p => p.addEventListener('click', () => {
  showPhoto(visibleProjects().indexOf(p));
  viewer.showModal();
}));
$('#viewerClose').addEventListener('click', () => viewer.close());
$('#viewerPrev').addEventListener('click', () => showPhoto(viewIndex - 1));
$('#viewerNext').addEventListener('click', () => showPhoto(viewIndex + 1));
viewer.addEventListener('click', e => { if (e.target === viewer) viewer.close(); });
viewer.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') showPhoto(viewIndex - 1);
  if (e.key === 'ArrowRight') showPhoto(viewIndex + 1);
});

/* ── Mobile action bar: hide when the contact section is on screen ── */
const actionBar = $('#actionBar');
new IntersectionObserver(([entry]) => {
  actionBar.classList.toggle('is-hidden', entry.isIntersecting);
}, { threshold: 0.15 }).observe($('#contact'));

/* ── Estimate form (FormSubmit) ──
   Replace FORM_EMAIL with the inbox that should receive requests.
   The first submission sends a one-time activation email to that address. */
const FORM_EMAIL = 'info@onrconstruction.com';
const form = $('#contactForm');
const formButton = $('#formButton');
const formStatus = $('#formStatus');
const buttonHTML = formButton.innerHTML;

form.addEventListener('submit', async e => {
  e.preventDefault();
  let firstInvalid = null;
  $$('input[required]', form).forEach(input => {
    const bad = !input.checkValidity();
    input.closest('.field').classList.toggle('has-error', bad);
    if (bad && !firstInvalid) firstInvalid = input;
  });
  if (firstInvalid) {
    formStatus.className = 'form-status err';
    formStatus.textContent = 'Please add your name and a valid email.';
    firstInvalid.focus();
    return;
  }

  const data = new FormData(form);
  data.append('_subject', `New estimate request from ${data.get('Name')}`);
  data.append('_template', 'table');

  formButton.disabled = true;
  formButton.textContent = 'Sending…';
  formStatus.className = 'form-status';
  formStatus.textContent = '';
  try {
    const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: data
    });
    const result = await res.json();
    if (!res.ok || String(result.success) !== 'true') throw new Error(result.message);
    formStatus.className = 'form-status ok';
    formStatus.textContent = "✓ Request sent! We'll be in touch within one business day.";
    form.reset();
  } catch (err) {
    formStatus.className = 'form-status err';
    formStatus.innerHTML = 'Sorry, that didn\'t go through. Please call or text <a href="tel:+12097656794">(209) 765-6794</a>.';
  } finally {
    formButton.disabled = false;
    formButton.innerHTML = buttonHTML;
  }
});
$$('input[required]', form).forEach(input =>
  input.addEventListener('input', () => input.closest('.field').classList.remove('has-error'))
);
