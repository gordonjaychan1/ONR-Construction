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
    svcImg.style.objectPosition = item.dataset.pos || '';
    svcLabel.textContent = item.dataset.service;
    return;
  }
  svcImg.classList.add('is-swapping');
  setTimeout(() => {
    svcImg.src = src;
    svcImg.style.objectPosition = item.dataset.pos || '';
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
   FORM_EMAIL is ONR's confirmed business inbox. Nothing is delivered until that
   inbox clicks "Activate" in the one-time email FormSubmit sends after the first
   submission. */
const FORM_EMAIL = 'info@onrconstruction.com';
const form = $('#contactForm');
const formButton = $('#formButton');
const formStatus = $('#formStatus');
const buttonHTML = formButton.innerHTML;

/* ── Optional photos ──
   Each photo is redrawn at no more than 1600px as a JPEG before upload. That keeps a
   request well under FormSubmit's 10MB limit, and re-encoding drops the photo's
   location metadata. If the browser can't read a format (e.g. HEIC in desktop Chrome),
   the original file is sent as long as it fits. */
const MAX_PHOTOS = 5;
const MAX_UPLOAD_BYTES = 9.5 * 1024 * 1024;
const photoInput = $('#f-photos');
const photoList = $('#photoList');
const uploadBox = $('.upload', form);
let photos = [];   // { blob, name, url } — blob is null while the photo is being shrunk

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('unreadable image')); };
    img.src = url;
  });
}

async function shrinkPhoto(file, max = 1600, quality = 0.82) {
  const img = await loadImage(file);   // <img> decoding honours the photo's rotation
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * scale);
  canvas.height = Math.round(img.naturalHeight * scale);
  canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) =>
    canvas.toBlob(b => (b ? resolve(b) : reject(new Error('encode failed'))), 'image/jpeg', quality));
}

function renderPhotos() {
  photoList.innerHTML = '';
  photos.forEach((p, i) => {
    const li = document.createElement('li');
    if (!p.blob) li.className = 'is-busy';
    if (p.url) {
      const img = new Image();
      img.src = p.url;
      img.alt = `Photo ${i + 1}`;
      li.append(img);
    }
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `Remove photo ${i + 1}`);
    remove.addEventListener('click', () => {
      if (p.url) URL.revokeObjectURL(p.url);
      photos = photos.filter(x => x !== p);
      renderPhotos();
    });
    li.append(remove);
    photoList.append(li);
  });
  uploadBox.classList.toggle('is-full', photos.length >= MAX_PHOTOS);
}

function clearPhotos() {
  photos.forEach(p => p.url && URL.revokeObjectURL(p.url));
  photos = [];
  renderPhotos();
}

photoInput.addEventListener('change', async () => {
  const picked = [...photoInput.files].filter(f => f.type.startsWith('image/') || /\.(heic|heif)$/i.test(f.name));
  photoInput.value = '';                       // lets the same photo be picked again after removing it
  const room = MAX_PHOTOS - photos.length;
  formStatus.className = 'form-status';
  formStatus.textContent = picked.length > room ? `Up to ${MAX_PHOTOS} photos — the first ${room} were added.` : '';
  for (const file of picked.slice(0, room)) {
    const item = { blob: null, name: file.name, url: null };
    photos.push(item);
    renderPhotos();
    try { item.blob = await shrinkPhoto(file); }
    catch { item.blob = file; }
    item.url = URL.createObjectURL(item.blob);
    renderPhotos();
  }
});

/* FormSubmit's AJAX endpoint silently drops file attachments (tested 2026-10-19), so a
   request with photos goes as a normal multipart POST into a hidden iframe instead.
   FormSubmit then redirects that iframe to thanks.html via _next; seeing our own page
   load there is the delivery confirmation. Anything else (its activation or error page,
   which we can't read cross-origin) counts as not delivered. */
const supportsFileTransfer = (() => { try { return !!new DataTransfer(); } catch { return false; } })();

function postWithPhotos(fields, files) {
  return new Promise((resolve, reject) => {
    const target = `fs-${Date.now()}`;
    const frame = document.createElement('iframe');
    frame.name = target;
    frame.hidden = true;
    frame.tabIndex = -1;
    frame.setAttribute('aria-hidden', 'true');

    const post = document.createElement('form');
    post.method = 'POST';
    post.action = `https://formsubmit.co/${FORM_EMAIL}`;
    post.enctype = 'multipart/form-data';
    post.target = target;
    post.hidden = true;
    const add = (name, value) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = name;
      input.value = value;
      post.append(input);
    };
    for (const [name, value] of fields) add(name, value);
    add('_captcha', 'false');                                    // no CAPTCHA page inside a hidden frame
    add('_next', new URL('thanks.html', location.href).href);
    files.forEach((file, i) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.name = `photo${i + 1}`;
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      post.append(input);
    });

    let failTimer;
    const finish = ok => {
      clearTimeout(giveUp);
      clearTimeout(failTimer);
      setTimeout(() => { frame.remove(); post.remove(); }, 0);
      ok ? resolve() : reject(new Error('FormSubmit did not redirect to thanks.html'));
    };
    const giveUp = setTimeout(() => finish(false), 60000);
    frame.addEventListener('load', () => {
      let href = null;
      try { href = frame.contentWindow.location.href; } catch { /* cross-origin: FormSubmit's own page */ }
      if (href === 'about:blank') return;                         // the empty frame's first load
      if (href && /\/thanks\.html(?:$|[?#])/.test(href)) return finish(true);
      clearTimeout(failTimer);                                    // give an in-between page a moment to redirect
      failTimer = setTimeout(() => finish(false), 8000);
    });
    document.body.append(frame, post);
    post.submit();
  });
}

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
  if (photos.some(p => !p.blob)) {
    formStatus.className = 'form-status';
    formStatus.textContent = 'Still preparing your photos — one moment, then send again.';
    return;
  }
  const photoBytes = photos.reduce((sum, p) => sum + p.blob.size, 0);
  if (photoBytes > MAX_UPLOAD_BYTES) {
    formStatus.className = 'form-status err';
    formStatus.textContent = 'Those photos are too large to send together. Remove one or two and try again.';
    return;
  }

  const data = new FormData(form);
  for (const [key, value] of [...data]) if (value === '' && key !== '_honey') data.delete(key);  // no blank rows in the email
  data.append('_subject', `New estimate request from ${data.get('Name')}`);
  data.append('_template', 'table');
  const files = supportsFileTransfer
    ? photos.map((p, i) => new File([p.blob], p.blob.type === 'image/jpeg' ? `photo-${i + 1}.jpg` : p.name, { type: p.blob.type || 'image/jpeg' }))
    : [];

  formButton.disabled = true;
  formButton.textContent = photos.length ? 'Uploading photos…' : 'Sending…';
  formStatus.className = 'form-status';
  formStatus.textContent = '';
  try {
    if (files.length) {
      await postWithPhotos(data, files);
    } else {
      const res = await fetch(`https://formsubmit.co/ajax/${FORM_EMAIL}`, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: data
      });
      const result = await res.json();
      if (!res.ok || String(result.success) !== 'true') throw new Error(result.message);
    }
    formStatus.className = 'form-status ok';
    formStatus.textContent = photos.length && !files.length
      ? "✓ Request sent! Your browser couldn't attach the photos, so please text them to (209) 765-6794."
      : "✓ Request sent! We'll be in touch within one business day.";
    form.reset();
    clearPhotos();
  } catch (err) {
    // Customers see the generic fallback; the real reason (e.g. FormSubmit's
    // "This form needs Activation") goes to the console for whoever is debugging.
    console.warn('Estimate form not sent:', err.message);
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
