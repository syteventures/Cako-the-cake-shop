/* Cako motion layer (brief section 13): GSAP 3.12.5 + ScrollTrigger + Lenis 1.1.13.
   Decoration only. Every word and photo is in the HTML and visible without it; under prefers-reduced-motion nothing
   animates and nothing is hidden. Moves on its own: the hero cake and the ticker, both under the one pause control. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gsap = window.gsap, ST = window.ScrollTrigger;
  var conn = navigator.connection || {};
  if (conn.saveData || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4)) root.classList.add('low-power');

  /* ---------------------------------------------------------------- pause / play motion (WCAG 2.2.2), remembered */
  var toggles = Array.prototype.slice.call(document.querySelectorAll('[data-motion-toggle]'));
  var isPaused = function () { return root.getAttribute('data-motion') === 'paused'; };
  function setMotion(play, persist) {
    if (play) root.removeAttribute('data-motion'); else root.setAttribute('data-motion', 'paused');
    toggles.forEach(function (b) {
      b.setAttribute('aria-pressed', play ? 'false' : 'true');
      var l = b.querySelector('[data-motion-label]'); if (l) l.textContent = play ? 'Pause motion' : 'Play motion';
    });
    if (persist) { try { localStorage.setItem('cako-motion', play ? 'playing' : 'paused'); } catch (e) {} }
    var parts = window.CakoParts || {};
    Object.keys(parts).forEach(function (k) { var c = parts[k]; if (c && typeof c[play ? 'play' : 'pause'] === 'function') { try { c[play ? 'play' : 'pause'](); } catch (e) {} } });
    document.dispatchEvent(new CustomEvent('cako:motion', { detail: { playing: play } }));
  }
  if (reduce) toggles.forEach(function (b) { b.hidden = true; });
  else {
    toggles.forEach(function (b) { b.addEventListener('click', function () { setMotion(isPaused(), true); }); });
    if (isPaused()) setMotion(false, false);
  }

  /* ---------------------------------------------------------------- header: solid after 80 px; hides going down, returns going up */
  var top = document.querySelector('[data-top]');
  if (top) {
    var lastY = window.scrollY, ticking = false;
    var onScroll = function () {
      var y = window.scrollY, menuOpen = document.querySelector('.menu:not([hidden])');
      top.classList.toggle('is-solid', y > 80);
      if (!menuOpen && y > 480 && y > lastY + 6) top.classList.add('is-hidden');
      else if (y < lastY - 6 || y < 480) top.classList.remove('is-hidden');
      lastY = y; ticking = false;
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    top.addEventListener('focusin', function () { top.classList.remove('is-hidden'); });
    onScroll();
  }

  /* ---------------------------------------------------------------- things that move on their own rest off screen */
  if ('IntersectionObserver' in window) {
    var off = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('is-offscreen', !e.isIntersecting); }); }, { rootMargin: '80px 0px' });
    document.querySelectorAll('.hero__stage, .ticker, .close__count').forEach(function (el) { off.observe(el); });
  }

  /* ---------------------------------------------------------------- the ticker is a still line without motion */
  var ticker = document.querySelector('.ticker');
  if (ticker && (reduce || !gsap)) ticker.classList.add('is-still');

  if (reduce || !gsap || !ST) { root.classList.add('no-motion'); return; }
  gsap.registerPlugin(ST);
  ST.config({ ignoreMobileResize: true });
  root.classList.add('has-motion');

  /* ---------------------------------------------------------------- smooth scroll: Lenis on wheel, native on touch */
  var lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ lerp: 0.1, smoothWheel: true, syncTouch: false });
    window.__cakoLenis = lenis;
    lenis.on('scroll', ST.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click', function (e) {
      var a = e.target.closest('a[href*="#"]'); if (!a) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || url.hash.length < 2) return;
      var t = document.getElementById(decodeURIComponent(url.hash.slice(1))); if (!t) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: url.hash === '#main' ? 0 : -16, duration: 1.2 });
      history.pushState(null, '', url.hash);
      if (url.hash === '#main') { t.setAttribute('tabindex', '-1'); t.focus({ preventScroll: true }); }
    });
    var menu = document.getElementById('menu');
    if (menu) new MutationObserver(function () { if (menu.hidden) lenis.start(); else lenis.stop(); }).observe(menu, { attributes: true, attributeFilter: ['hidden'] });
  }

  /* ---------------------------------------------------------------- split headings into masked words, keeping one readable copy */
  function split(el) {
    if (el.getAttribute('data-split-done')) return [];
    el.setAttribute('data-split-done', '1');
    var sr = document.createElement('span'); sr.className = 'visually-hidden'; sr.textContent = el.textContent.replace(/\s+/g, ' ').trim();
    var holder = document.createElement('span'); holder.className = 'split'; holder.setAttribute('aria-hidden', 'true');
    var out = [];
    sr.textContent.split(' ').forEach(function (w, i) {
      if (i) holder.appendChild(document.createTextNode(' '));
      var mask = document.createElement('span'); mask.className = 'sw';
      var inner = document.createElement('span'); inner.className = 'sw__in'; inner.textContent = w;
      mask.appendChild(inner); holder.appendChild(mask); out.push(inner);
    });
    el.textContent = ''; el.appendChild(sr); el.appendChild(holder);
    return out;
  }

  var mm = gsap.matchMedia();
  mm.add('(prefers-reduced-motion: no-preference)', function () {
    /* hero load: the only orchestrated entrance (<= 1.8 s); buttons work from the first frame */
    var tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
    var words = []; document.querySelectorAll('[data-split]').forEach(function (el) { words = words.concat(split(el)); });
    var rule = document.querySelector('.hero__rule');
    if (rule) tl.from(rule, { scaleX: 0, transformOrigin: '0 50%', duration: 1.2, ease: 'power3.inOut' }, 0.05);
    var kicker = document.querySelector('.hero__kicker');
    if (kicker) tl.from(kicker, { autoAlpha: 0, y: 12, duration: 0.5 }, 0.1);
    if (words.length) tl.from(words, { yPercent: 110, duration: 0.8, stagger: 0.05 }, 0.15);
    var enter = gsap.utils.toArray('[data-enter]');
    if (enter.length) tl.from(enter, { autoAlpha: 0, y: 12, duration: 0.5, stagger: 0.06 }, 0.6);
    var under = document.querySelector('.hero__under');
    if (under) tl.from(under, { autoAlpha: 0, duration: 0.6 }, 1.2);

    /* one line-rise on the chapter-opening headings: sizes, visit and close */
    document.querySelectorAll('[data-rise]').forEach(function (el) {
      var w = split(el); if (!w.length) return;
      gsap.from(w, { yPercent: 110, duration: 0.9, stagger: 0.04, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 86%', once: true } });
    });

    /* the ticker drifts, follows scroll speed and reverses when you scroll up; rests on hover, focus, pause or off screen */
    var track = ticker && ticker.querySelector('.ticker__track');
    if (track) {
      var x = 0, dir = 1, boost = 0, hold = false, width = 0;
      var measure = function () { var l = track.querySelector('.ticker__list'); width = l ? l.getBoundingClientRect().width : 0; };
      measure(); window.addEventListener('resize', measure);
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
      ticker.addEventListener('pointerenter', function () { hold = true; });
      ticker.addEventListener('pointerleave', function () { hold = false; });
      ticker.addEventListener('focusin', function () { hold = true; });
      ticker.addEventListener('focusout', function () { hold = false; });
      if (lenis) lenis.on('scroll', function (l) { var v = l.velocity || 0; if (Math.abs(v) > 0.2) dir = v < 0 ? -1 : 1; boost = Math.min(6, Math.abs(v) * 0.5); });
      var set = gsap.quickSetter(track, 'x', 'px');
      gsap.ticker.add(function (t, dt) {
        if (hold || isPaused() || ticker.classList.contains('is-offscreen') || !width) return;
        x -= dir * (0.55 + boost) * Math.min(3, dt / 16.7);
        boost *= 0.94;
        if (x <= -width) x += width; else if (x > 0) x -= width;
        set(x);
      });
      document.addEventListener('cako:motion', function (e) { ticker.classList.toggle('is-still', !e.detail.playing); });
      if (isPaused()) ticker.classList.add('is-still');
    }

    /* custom cakes: the sketch slides away and the card opens fully as soon as it comes into view */
    var sketch = document.querySelector('.custom__sketch');
    if (sketch) {
      gsap.to(sketch, { xPercent: 101, duration: 0.9, ease: 'power3.inOut', scrollTrigger: { trigger: '.custom__window', start: 'top 92%', once: true } });
    }
  });

  /* ---------------------------------------------------------------- keep trigger positions right once fonts and images settle */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { ST.refresh(); });
  window.addEventListener('load', function () { ST.refresh(); });
})();
