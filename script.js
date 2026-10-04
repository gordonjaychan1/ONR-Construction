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

/* ── Hero slideshows ──
   Every .slides block cycles its own <img> set. data-hold sets the time per photo
   and data-offset staggers a block so the two frames never change at the same moment.
   One pause button controls all of them. They stop when off screen, when the tab is
   hidden, and under prefers-reduced-motion. */
const slideBlocks = $$('.slides');
if (slideBlocks.length) {
  const toggle = $('#slidesToggle');
  let paused = reduceMotion;
  let onScreen = true;

  const shows = slideBlocks.map(wrap => {
    const imgs = $$('img', wrap);
    const bar = $('.slides-bar i', wrap.parentElement);
    const hold = Number(wrap.dataset.hold) || 6000;
    const offset = Number(wrap.dataset.offset) || 0;
    let current = 0, tick = null, kickoff = null;

    const advance = () => {
      current = (current + 1) % imgs.length;
      imgs.forEach((img, i) => img.classList.toggle('is-on', i === current));
      runBar(hold);
    };
    const runBar = ms => {
      if (!bar) return;
      bar.classList.remove('is-running');
      bar.style.transitionDuration = `${ms}ms`;
      void bar.offsetWidth;                      // restart the transition
      if (!paused && onScreen) bar.classList.add('is-running');
    };
    return {
      start() {
        this.stop();
        if (paused || !onScreen || imgs.length < 2) return;
        const first = offset || hold;            // staggered frame waits less the first time
        runBar(first);
        kickoff = setTimeout(() => { advance(); tick = setInterval(advance, hold); }, first);
      },
      stop() {
        clearTimeout(kickoff); clearInterval(tick);
        kickoff = tick = null;
        if (bar) bar.classList.remove('is-running');
      }
    };
  });

  const playAll = () => shows.forEach(s => s.start());
  const stopAll = () => shows.forEach(s => s.stop());

  toggle?.addEventListener('click', () => {
    paused = !paused;
    toggle.classList.toggle('is-paused', paused);
    toggle.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
    paused ? stopAll() : playAll();
  });

  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    onScreen ? playAll() : stopAll();
  }, { threshold: 0.2 }).observe(slideBlocks[0]);

  document.addEventListener('visibilitychange', () => (document.hidden ? stopAll() : playAll()));

  if (paused && toggle) {
    toggle.classList.add('is-paused');
    toggle.setAttribute('aria-label', 'Play slideshow');
  }
  playAll();
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
