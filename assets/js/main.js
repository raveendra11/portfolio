/* ===========================================================
   Raveendra Pujari — Portfolio main.js
   Section-themed interactions:
   - Mobile menu, scroll-spy, active section detection
   - Animated background blobs (swap colors per section)
   - Scroll progress bar
   - Theme switcher (light / dark / system)
   - Typing effect with cursor
   - Stats counter (intersection observer)
   - Photography carousel (drag/swipe/keys/dots) + lightbox
   - Contact form (Formspree)
   - Toast notifications
   =========================================================== */

(function () {
  'use strict';

  /* ===== Helpers ===== */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const root = document.documentElement;
  const body = document.body;

  /* ===== Mobile menu ===== */
  const navToggle = $('#nav-toggle');
  const navMenu = $('#nav-menu');
  if (navToggle && navMenu) {
    navToggle.addEventListener('click', () => navMenu.classList.toggle('show'));
    navToggle.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navToggle.click(); }
    });
  }

  /* ===== Nav active on click + close mobile menu ===== */
  const navLinks = $$('.nav__link');
  navLinks.forEach(link => {
    link.addEventListener('click', function () {
      navLinks.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      if (navMenu) navMenu.classList.remove('show');
    });
  });

  /* ===== Sections, scroll-spy, active section for label + bg ===== */
  const sections = $$('main section[data-section]');
  const stickyLabel = $('#sticky-label');
  const headerH = () => parseInt(getComputedStyle(root).getPropertyValue('--header-height')) || 64;

  const setActiveByScroll = () => {
    const scrollY = window.pageYOffset;
    const offset = headerH() + 30;
    let current = sections[0] ? sections[0].id : '';
    sections.forEach(s => {
      const top = s.offsetTop - offset;
      const h = s.offsetHeight;
      if (scrollY >= top && scrollY < top + h) current = s.id;
    });
    navLinks.forEach(n => n.classList.remove('active'));
    const link = $('.nav__link[href="#' + current + '"]');
    if (link) link.classList.add('active');

    if (stickyLabel) {
      const active = sections.find(s => s.id === current);
      if (active) {
        const name = active.getAttribute('data-section');
        stickyLabel.textContent = name;
        body.setAttribute('data-section-active', name);
        const grad1 = getComputedStyle(active).getPropertyValue('--section-grad-1').trim();
        const grad2 = getComputedStyle(active).getPropertyValue('--section-grad-2').trim();
        const grad3 = getComputedStyle(active).getPropertyValue('--section-grad-3').trim();
        if (grad1) root.style.setProperty('--grad-1', grad1);
        if (grad2) root.style.setProperty('--grad-2', grad2);
        if (grad3) root.style.setProperty('--grad-3', grad3);
      }
    }
  };
  window.addEventListener('scroll', setActiveByScroll, { passive: true });

  /* ===== Scroll progress bar ===== */
  const progress = $('.scroll-progress');
  if (progress) {
    const updateProgress = () => {
      const h = document.documentElement;
      const scrolled = h.scrollTop || body.scrollTop;
      const height = h.scrollHeight - h.clientHeight;
      const pct = height > 0 ? (scrolled / height) * 100 : 0;
      progress.style.width = pct + '%';
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    updateProgress();
  }

  /* ===== Theme switcher (light / dark / system) ===== */
  const themeBtn = $('#theme-toggle');
  const themeIcon = $('#theme-icon');
  const mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  const getSystemTheme = () => (mq && mq.matches ? 'dark' : 'light');
  const applyTheme = (mode) => {
    let actual = mode;
    if (mode === 'system') actual = getSystemTheme();
    root.setAttribute('data-theme', actual);
    try { localStorage.setItem('themeMode', mode); } catch (_) {}
    if (themeIcon) {
      const next = mode === 'system' ? 'system' : (actual === 'dark' ? 'light' : 'dark');
      themeIcon.className = next === 'system' ? 'bx bx-desktop' : (actual === 'dark' ? 'bx bx-sun' : 'bx bx-moon');
      themeBtn.setAttribute('title', `Theme: ${mode} (click for ${next})`);
    }
  };
  let savedMode = 'system';
  try { savedMode = localStorage.getItem('themeMode') || 'system'; } catch (_) {}
  applyTheme(savedMode);
  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      const cycle = ['light', 'dark', 'system'];
      const cur = localStorage.getItem('themeMode') || 'system';
      const next = cycle[(cycle.indexOf(cur) + 1) % cycle.length];
      applyTheme(next);
    });
  }
  if (mq && mq.addEventListener) mq.addEventListener('change', () => {
    if ((localStorage.getItem('themeMode') || 'system') === 'system') applyTheme('system');
  });

  /* ===== Typing effect for hero ===== */
  const typingEl = $('#typing-text');
  if (typingEl) {
    const phrases = (typingEl.getAttribute('data-words') || '').split('|').filter(Boolean);
    if (phrases.length) {
      let pi = 0, ci = 0, deleting = false;
      const tick = () => {
        const word = phrases[pi];
        ci += deleting ? -1 : 1;
        typingEl.textContent = word.slice(0, ci);
        let delay = deleting ? 40 : 90;
        if (!deleting && ci === word.length) { delay = 1500; deleting = true; }
        else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
        setTimeout(tick, delay);
      };
      tick();
    }
  }

  /* ===== IntersectionObserver: reveal on scroll ===== */
  const revealTargets = $$('.reveal, .bento__card, .cert-card, .project-card, .exp-card, .stat, .timeline__item, .carousel__slide');
  revealTargets.forEach(t => t.classList.add('reveal'));

  const ioReveal = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        el.classList.add('is-visible');
        if (el.classList.contains('stat')) {
          const numEl = el.querySelector('.stat__value');
          if (numEl && !numEl.dataset.counted) {
            numEl.dataset.counted = '1';
            const target = parseFloat(numEl.getAttribute('data-target') || '0');
            const suffix = numEl.getAttribute('data-suffix') || '';
            const dur = 1400;
            const start = performance.now();
            const step = (now) => {
              const t = Math.min(1, (now - start) / dur);
              const eased = 1 - Math.pow(1 - t, 3);
              numEl.textContent = Math.floor(eased * target) + (t === 1 ? suffix : '');
              if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
          }
        }
        ioReveal.unobserve(el);
      }
    });
  }, { threshold: 0.15 });
  revealTargets.forEach(t => ioReveal.observe(t));

  /* ===== Photography: Carousel + Lightbox + Filter tabs ===== */
  const carouselEl = $('#gallery');
  const track = $('#gallery-track');
  const slides = track ? $$('.carousel__slide', track) : [];
  const prevArrow = $('#gallery-prev');
  const nextArrow = $('#gallery-next');
  const dotsContainer = $('#gallery-dots');
  const tabs = $$('.photo-tab');
  const lightbox = $('#lightbox');
  const lightboxImg = $('#lightbox-img');
  const lightboxCap = $('#lightbox-caption');
  const closeBtn = $('.lightbox__close');
  const lbPrevBtn = $('.lightbox__prev');
  const lbNextBtn = $('.lightbox__next');

  let activeIndex = 0;
  let lightboxOpen = false;
  let didDrag = false;

  /* Build pagination dots */
  if (dotsContainer && slides.length) {
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'carousel__dot';
      dot.setAttribute('aria-label', `Go to photo ${i + 1}`);
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });
  }
  const dots = dotsContainer ? $$('.carousel__dot', dotsContainer) : [];

  /* Carousel geometry */
  const centerSlide = (index, smooth = true) => {
    if (!track || !slides.length) return;
    const target = slides[index];
    if (!target) return;
    const viewportWidth = track.parentElement.clientWidth;
    const slideWidth = target.offsetWidth;
    let offset = target.offsetLeft - (viewportWidth - slideWidth) / 2;
    const maxOffset = Math.max(0, track.scrollWidth - viewportWidth);
    offset = Math.max(0, Math.min(offset, maxOffset));
    if (!smooth) track.style.transition = 'none';
    track.style.transform = `translate3d(${-offset}px, 0, 0)`;
    if (!smooth) requestAnimationFrame(() => { track.style.transition = ''; });
  };

  const updateActive = () => {
    slides.forEach((s, i) => s.classList.toggle('is-active', i === activeIndex));
    dots.forEach((d, i) => d.classList.toggle('is-active', i === activeIndex));
  };

  const goTo = (i, smooth = true) => {
    if (!slides.length) return;
    activeIndex = Math.max(0, Math.min(slides.length - 1, i));
    updateActive();
    centerSlide(activeIndex, smooth);
  };

  const next = () => {
    let i = activeIndex + 1;
    while (i < slides.length && slides[i].classList.contains('is-hidden')) i++;
    if (i >= slides.length) i = slides.findIndex(s => !s.classList.contains('is-hidden'));
    if (i >= 0) goTo(i);
  };

  const prev = () => {
    let i = activeIndex - 1;
    while (i >= 0 && slides[i].classList.contains('is-hidden')) i--;
    if (i < 0) {
      for (let j = slides.length - 1; j >= 0; j--) {
        if (!slides[j].classList.contains('is-hidden')) { i = j; break; }
      }
    }
    if (i >= 0) goTo(i);
  };

  if (prevArrow) prevArrow.addEventListener('click', prev);
  if (nextArrow) nextArrow.addEventListener('click', next);

  /* Drag / swipe */
  if (track) {
    let startX = 0, currentX = 0, startOffset = 0, isDown = false;

    const getOffset = () => {
      const m = new DOMMatrix(getComputedStyle(track).transform);
      return m.m41 || 0;
    };

    const onDown = (e) => {
      isDown = true;
      didDrag = false;
      startX = (e.touches ? e.touches[0].clientX : e.clientX);
      startOffset = getOffset();
      track.classList.add('is-dragging');
    };
    const onMove = (e) => {
      if (!isDown) return;
      currentX = (e.touches ? e.touches[0].clientX : e.clientX);
      const delta = currentX - startX;
      if (Math.abs(delta) > 6) didDrag = true;
      track.style.transform = `translate3d(${startOffset + delta}px, 0, 0)`;
    };
    const onUp = () => {
      if (!isDown) return;
      isDown = false;
      track.classList.remove('is-dragging');
      const delta = currentX - startX;
      const threshold = Math.max(40, (track.parentElement.clientWidth || 600) * 0.15);
      if (delta < -threshold) next();
      else if (delta > threshold) prev();
      else goTo(activeIndex);
    };

    track.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    track.addEventListener('touchstart', onDown, { passive: true });
    track.addEventListener('touchmove', onMove, { passive: true });
    track.addEventListener('touchend', onUp);
    track.querySelectorAll('img').forEach(img => {
      img.addEventListener('dragstart', e => e.preventDefault());
    });
  }

  /* Filter tabs */
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const filter = tab.getAttribute('data-filter') || 'all';
      tabs.forEach(t => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', active ? 'true' : 'false');
      });
      slides.forEach(s => {
        const cat = s.getAttribute('data-cat');
        const match = filter === 'all' || cat === filter;
        s.classList.toggle('is-hidden', !match);
      });
      const firstVisible = slides.findIndex(s => !s.classList.contains('is-hidden'));
      if (firstVisible >= 0) goTo(firstVisible);
    });
  });

  /* Resize */
  let resizeRaf;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(() => centerSlide(activeIndex, false));
  });

  /* Lightbox */
  if (lightbox && lightboxImg && slides.length) {
    const openLightbox = (i) => {
      activeIndex = Math.max(0, Math.min(slides.length - 1, i));
      const target = slides[activeIndex];
      const img = target.querySelector('img');
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt || '';
      if (lightboxCap) lightboxCap.textContent = `Image ${activeIndex + 1} of ${slides.length}`;
      lightbox.classList.add('is-open');
      body.style.overflow = 'hidden';
      lightboxOpen = true;
    };
    const closeLightbox = () => {
      lightbox.classList.remove('is-open');
      body.style.overflow = '';
      lightboxOpen = false;
    };
    const lbNext = () => {
      let i = activeIndex + 1;
      while (i < slides.length && slides[i].classList.contains('is-hidden')) i++;
      if (i >= slides.length) i = slides.findIndex(s => !s.classList.contains('is-hidden'));
      if (i >= 0) openLightbox(i);
    };
    const lbPrev = () => {
      let i = activeIndex - 1;
      while (i >= 0 && slides[i].classList.contains('is-hidden')) i--;
      if (i < 0) for (let j = slides.length - 1; j >= 0; j--) if (!slides[j].classList.contains('is-hidden')) { i = j; break; }
      if (i >= 0) openLightbox(i);
    };
    slides.forEach((s, i) => s.addEventListener('click', () => {
      if (didDrag) { didDrag = false; return; }
      openLightbox(i);
    }));
    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (lbPrevBtn) lbPrevBtn.addEventListener('click', lbPrev);
    if (lbNextBtn) lbNextBtn.addEventListener('click', lbNext);
    lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  }

  /* Keyboard nav when carousel is in view */
  const carouselInView = () => {
    if (!carouselEl) return false;
    const r = carouselEl.getBoundingClientRect();
    return r.top < window.innerHeight && r.bottom > 0;
  };
  document.addEventListener('keydown', (e) => {
    if (lightboxOpen) {
      if (e.key === 'Escape') { lightbox.classList.remove('is-open'); body.style.overflow = ''; lightboxOpen = false; }
      if (e.key === 'ArrowLeft' && lbPrevBtn) lbPrevBtn.click();
      if (e.key === 'ArrowRight' && lbNextBtn) lbNextBtn.click();
      return;
    }
    if (!carouselInView()) return;
    if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
  });

  /* Init */
  if (slides.length) {
    requestAnimationFrame(() => goTo(0, false));
  }

  /* ===== Toast helper ===== */
  const toast = (msg, opts = {}) => {
    let t = $('#toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast';
      t.className = 'toast';
      t.innerHTML = `<i class='bx bx-check-circle ico'></i><span class="msg"></span>`;
      body.appendChild(t);
    }
    t.querySelector('.msg').textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(t._timer);
    t._timer = setTimeout(() => t.classList.remove('is-visible'), opts.duration || 2400);
  };

  /* ===== Contact form (Formspree) ===== */
  const form = $('#contact-form');
  const status = $('#form-status');
  if (form) {
    const btn = $('#submit-btn');
    const icon = $('#submit-icon');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!btn) return;
      btn.disabled = true;
      if (status) { status.textContent = 'Sending…'; status.classList.remove('error', 'success'); }

      try {
        const data = new FormData(form);
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          form.reset();
          if (status) { status.textContent = 'Message sent — thank you!'; status.classList.add('success'); }
          if (icon) { icon.classList.remove('bx-send'); icon.classList.add('bx-check'); }
          if (btn) btn.classList.add('success');
          toast('Message sent successfully');
          setTimeout(() => {
            if (icon) { icon.classList.remove('bx-check'); icon.classList.add('bx-send'); }
            if (btn) btn.classList.remove('success');
            if (btn) btn.disabled = false;
            if (status) status.textContent = '';
          }, 2500);
        } else { throw new Error('Request failed'); }
      } catch (err) {
        if (status) { status.textContent = 'Something went wrong. Please try again.'; status.classList.add('error'); }
        btn.disabled = false;
        toast('Failed to send — please retry', { duration: 3000 });
      }
    });
  }

  /* ===== Initial setup ===== */
  setActiveByScroll();

  /* ===== Close mobile menu on outside click ===== */
  document.addEventListener('click', (e) => {
    if (!navMenu || !navMenu.classList.contains('show')) return;
    if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
      navMenu.classList.remove('show');
    }
  });
})();
