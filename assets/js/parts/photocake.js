/* Cako parts: the revolving photo cake (home hero). Markup: _workfiles/demos/photocake.snippet.mjs; styles: assets/css/parts/photocake.css.
   The cake is complete without this file (pure CSS 3D, a still three-quarter view). This adds:
   - the idle spin: CSS keyframes that run on the compositor, switched on with .is-live (never under reduced motion, Save-Data
     or html.low-power, which motion.js sets);
   - drag or swipe to turn, with inertia (pointer events; touch-action: pan-y keeps the page scrolling on phones);
   - the scroll "explode": as the cake scrolls away the tiers lift off the stand, the camera rises and the spin speeds up
     (ScrollTrigger when it is loaded, otherwise one passive scroll listener); it reverses on the way back;
   - rest: it pauses off screen, in a hidden tab and with the site's pause control (CakoParts.*.pause / play);
   - "Facing you": a bubbling cako:facing event { slug, name, index } when another bottom-tier cake turns to the front (4 Hz);
   - candles that burn from 11 am to 11:59 pm Pune time and go out at 12 with one wisp of smoke.
   API: window.CakoParts.photoCake = { init(root) -> { pause, play, refresh }, pause(), play() }. Auto-inits [data-photocake]. */
(function () {
  'use strict';
  var W = window, D = document, H = D.documentElement;
  var mq = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(mq && mq.matches); };
  var cakes = [];
  var DEG_PX = 152.8; // 57.3 deg per radian / 0.375: the bottom tier's front follows the pointer (its radius is 37.5% of the width)

  function init(root) {
    if (!root || root.pcake) return root && root.pcake;
    var $ = function (s) { return [].slice.call(root.querySelectorAll(s)); };
    var tiers = $('.pcake__tier'), turns = $('.pcake__turn'), spins = $('.pcake__spin'), faces = $('.pcake__t1 .pcake__p');
    var cam = root.querySelector('.pcake__cam');
    if (tiers.length < 3 || !cam) return null;
    var still = reduced() || (navigator.connection || {}).saveData || H.classList.contains('low-power');
    var s = { a: 0, v: 0, vd: 0, p: 0, pt: 0, pa: -1, r: 1, w: 0, n: faces.length, vis: true, on: true, raf: 0, t: 0, face: -1, anims: [] };
    var dir = parseFloat(getComputedStyle(tiers[0]).getPropertyValue('--dir')) || -1;

    function size() {
      var w = root.clientWidth;
      if (!w || w === s.w) return;
      s.w = w;
      root.style.setProperty('--u', w / 100 + 'px'); // the radius unit (CSS falls back to 1cqi)
      s.n = parseInt(getComputedStyle(tiers[0]).getPropertyValue('--n'), 10) || faces.length; // 12, or 10 under 460 px
      s.face = -1;
    }

    /* which bottom-tier cake faces the viewer: the CSS spin's progress plus the drag angle */
    function facing() {
      if (!faces.length) return;
      var ang = s.a, an = s.anims[0];
      if (an && an.currentTime != null) {
        var d = s.d || (s.d = an.effect.getComputedTiming().duration);
        ang += dir * 360 * (an.currentTime % d) / d;
      }
      var i = ((Math.round(-ang * s.n / 360) % s.n) + s.n) % s.n, f = faces[i];
      if (i === s.face || !f) return;
      s.face = i;
      root.dispatchEvent(new CustomEvent('cako:facing', { bubbles: true, detail: { slug: f.getAttribute('data-slug'), name: f.getAttribute('data-name'), index: i } }));
    }

    function rate(r) {
      if (Math.abs(r - s.r) < 0.04 && !(r === 1 && s.r !== 1)) return;
      s.r = r;
      s.anims.forEach(function (an) { if (!an) return; if (an.updatePlaybackRate) an.updatePlaybackRate(r); else an.playbackRate = r; });
    }

    function apply() {
      var t = 'rotateY(' + s.a.toFixed(2) + 'deg)';
      for (var i = 0; i < turns.length; i++) turns[i].style.transform = t;
      if (s.p !== s.pa) {
        // an exploded view: the stand stays on its counter line and the tiers rise off it, front-loaded so it plays on screen
        var p = s.p, e = 1 - (1 - p) * (1 - p), lift = function (k) { return '0 calc(var(--u) * ' + (k * e).toFixed(3) + ')'; };
        s.pa = p;
        tiers[0].style.translate = lift(-6);
        tiers[1].style.translate = lift(-17);
        tiers[2].style.translate = lift(-30);
        cam.style.transform = 'rotateX(calc(var(--tilt) - ' + (16 * e).toFixed(2) + 'deg))';
        rate(1 + 3 * e);
      }
      facing();
    }

    function frame(now) {
      s.raf = 0;
      var dt = s.t ? Math.min(50, now - s.t) : 16, busy = !!s.drag;
      s.t = now;
      if (!s.drag && s.v) {
        s.a += s.v * dt;
        s.v *= Math.exp(-dt / 650);
        if (Math.abs(s.v) < 0.002) s.v = 0;
        busy = true;
      }
      if (s.p !== s.pt) {
        var d = s.pt - s.p;
        s.p = Math.abs(d) < 0.001 ? s.pt : s.p + d * (1 - Math.exp(-dt / 140));
        busy = true;
      }
      apply();
      if (busy) kick(); else s.t = 0;
    }
    function kick() { if (!s.raf && s.on) s.raf = requestAnimationFrame(frame); }

    /* reduced motion switched on, or the site marked a low-power device: a still cake from here on (drag still works) */
    function rest() {
      if (still) return;
      still = true;
      s.anims = []; s.v = 0; s.pt = 0;
      clearInterval(s.iv); s.iv = 0;
      root.classList.remove('is-live');
      root.classList.add('is-still');
      kick();
    }

    function sync() {
      if (H.classList.contains('low-power')) rest();
      s.on = s.vis && !D.hidden;
      root.classList.toggle('is-off', !s.on);
      if (s.on) {
        kick();
        if (!s.iv && s.anims.length) s.iv = setInterval(facing, 250);
      } else {
        if (s.raf) cancelAnimationFrame(s.raf);
        clearInterval(s.iv);
        s.raf = s.iv = s.t = 0;
      }
    }

    /* candles: Pune is UTC+5:30 all year. data-now="HH:MM" pins the time for tests */
    function refresh() {
      clearTimeout(s.ht);
      var pin = root.getAttribute('data-now'), m, q, d;
      if (pin) { q = pin.split(':'); m = q[0] * 60 + (+q[1] || 0); }
      else { d = new Date(); m = (d.getUTCHours() * 60 + d.getUTCMinutes() + 330) % 1440; s.ht = setTimeout(refresh, 60500 - Date.now() % 60000); }
      var out = m < 660;
      if (out && s.lit) root.classList.add('is-snuff'); else if (!out) root.classList.remove('is-snuff');
      s.lit = !out;
      root.classList.toggle('is-out', out);
    }

    /* drag / swipe: the front of the bottom tier follows the pointer, then coasts */
    function end(e) {
      var g = s.drag;
      if (!g || e.pointerId !== g.id) return;
      s.drag = null;
      root.classList.remove('is-drag');
      s.v = reduced() || e.timeStamp - g.t > 90 ? 0 : Math.max(-1.5, Math.min(1.5, s.vd));
      s.vd = 0;
      kick();
    }
    root.addEventListener('pointerdown', function (e) {
      if (s.drag || e.button > 0) return;
      s.drag = { id: e.pointerId, x: e.clientX, t: e.timeStamp };
      s.v = s.vd = 0;
      try { root.setPointerCapture(e.pointerId); } catch (x) { /* capture is optional */ }
      root.classList.add('is-drag');
      kick();
    });
    root.addEventListener('pointermove', function (e) {
      var g = s.drag;
      if (!g || e.pointerId !== g.id) return;
      var da = (e.clientX - g.x) * DEG_PX / (s.w || 1), dt = Math.max(8, e.timeStamp - g.t);
      s.a += da;
      s.vd = 0.7 * s.vd + 0.3 * da / dt;
      g.x = e.clientX; g.t = e.timeStamp;
      kick();
    });
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (t) { root.addEventListener(t, end); });

    /* scroll: 0 while the cake sits in view, 1 as it leaves the top of the screen */
    function scroll() {
      var set = function (p) { if (!still) { s.pt = p; kick(); } };
      var ST = W.ScrollTrigger;
      if (W.gsap && ST) {
        W.gsap.registerPlugin(ST);
        ST.create({ trigger: root, start: 'clamp(center 60%)', end: 'bottom top', onUpdate: function (st) { set(st.progress); } });
        return;
      }
      var top = 0, h = 0;
      var measure = function () { var r = root.getBoundingClientRect(); top = r.top + W.pageYOffset; h = r.height; };
      var onScroll = function () {
        var a = Math.max(0, top + h / 2 - W.innerHeight * 0.6), b = top + h;
        set(b > a ? Math.min(1, Math.max(0, (W.pageYOffset - a) / (b - a))) : 0);
      };
      W.addEventListener('scroll', onScroll, { passive: true });
      W.addEventListener('resize', function () { measure(); onScroll(); });
      measure(); onScroll();
    }

    size();
    if (W.ResizeObserver) new ResizeObserver(size).observe(root);
    if (!still) {
      root.classList.add('is-live');
      s.anims = spins.map(function (el) { return el.getAnimations ? el.getAnimations()[0] : null; });
      s.v = 0.1 * dir; // it arrives with a flick and settles into the idle spin
      scroll();
      if (mq && mq.addEventListener) mq.addEventListener('change', function (e) { if (e.matches) rest(); });
    } else {
      root.classList.add('is-still');
    }
    if (H.getAttribute('data-motion') === 'paused') root.classList.add('is-paused'); // the site's remembered pause (motion.js)
    if (W.IntersectionObserver) new IntersectionObserver(function (es) { s.vis = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: '80px 0px' }).observe(root);
    D.addEventListener('visibilitychange', sync);
    refresh();
    sync();
    apply();

    var self = {
      root: root, refresh: refresh,
      pause: function () { root.classList.add('is-paused'); },
      play: function () { root.classList.remove('is-paused'); }
    };
    root.pcake = self;
    cakes.push(self);
    return self;
  }

  function each(m) { return function () { cakes.forEach(function (c) { c[m](); }); }; }
  W.CakoParts = W.CakoParts || {};
  W.CakoParts.photoCake = { init: init, pause: each('pause'), play: each('play') };
  function boot() { [].forEach.call(D.querySelectorAll('[data-photocake]'), function (el) { init(el); }); }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();
