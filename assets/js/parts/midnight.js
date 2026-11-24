/* Cako parts: midnight clock + steps, live hours dial, size and servings guide.
 * Initialises on [data-midnight-clock], [data-hours-dial] and [data-size-guide] once the DOM is ready.
 * window.CakoParts.midnight.init(root) wires up markup added later (it skips anything already wired).
 * Uses window.gsap + ScrollTrigger when the page loads them; works without them, and without this file
 * every part still shows its full content (final clock state, open hours, the 1 kg guide).
 */
(function () {
  'use strict';

  var W = window;
  var D = document;
  var hasIO = 'IntersectionObserver' in W;
  var reduceMQ = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null;
  function reduced() { return !!(reduceMQ && reduceMQ.matches); }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function each(list, fn) { Array.prototype.forEach.call(list, fn); }
  function setText(node, txt) { if (node && node.textContent !== txt) node.textContent = txt; }

  /* ================================================================ 1. midnight clock */

  var PIN_MQ = '(min-width: 1200px) and (min-height: 860px)';
  var SIDE_MQ = '(min-width: 960px) and (max-width: 1199.98px), (min-width: 1200px) and (max-height: 859.98px)';
  var STACK_MQ = '(max-width: 959.98px)';
  var HOLD = 0.84; // pinned: the last part of the scroll rests at midnight, candle lit

  function initClock(el) {
    var hourH = el.querySelector('.mclock__hand--h');
    var minH = el.querySelector('.mclock__hand--m');
    if (!hourH || !minH) return;
    var dial = el.querySelector('.mclock__dial') || el;
    var sweep = el.querySelector('.mclock__sweep-arc');
    var hm = el.querySelector('.mclock__hm');
    var ap = el.querySelector('.mclock__ap');
    var steps = el.querySelectorAll('.mclock__step');
    var ticks = el.querySelectorAll('[data-lit]');
    var last = { min: -1, lit: -1, f1: -1, f2: -1 };
    var smokeTimer = 0;
    var follow = true; // steps beside the clock follow the hands; stacked under it, they light as they scroll into view
    var stepIO = null;

    function setFollow(on) {
      follow = on;
      el.classList.toggle('is-flow', !on);
      if (stepIO) { stepIO.disconnect(); stepIO = null; }
      last.lit = last.f1 = last.f2 = -1; // the next render re-applies everything
      if (on || !hasIO) return;
      stepIO = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          var line = e.rootBounds ? e.rootBounds.bottom : W.innerHeight * 0.78;
          e.target.classList.toggle('is-lit', e.boundingClientRect.top < line);
        });
        each(steps, function (s, i) {
          if (steps[i + 1]) s.style.setProperty('--f', steps[i + 1].classList.contains('is-lit') ? '1' : '0');
        });
      }, { rootMargin: '0px 0px -22% 0px' });
      each(steps, function (s) { stepIO.observe(s); });
    }

    function setLit(n, hr) {
      if (follow) each(steps, function (s, i) { s.classList.toggle('is-lit', i < n); });
      each(ticks, function (t) { t.classList.toggle('is-on', +t.getAttribute('data-lit') <= hr); });
      var was = el.classList.contains('is-midnight');
      el.classList.toggle('is-midnight', n >= steps.length);
      // scrolling back past 12 blows the candle out: a wisp of smoke
      if (was && n < steps.length && el.classList.contains('is-armed') && el.classList.contains('is-visible')) {
        el.classList.remove('is-smoke');
        void el.offsetWidth;
        el.classList.add('is-smoke');
        clearTimeout(smokeTimer);
        smokeTimer = setTimeout(function () { el.classList.remove('is-smoke'); }, 1600);
      }
    }

    // p: 0 = 9:00 pm, hold = the share of p that reaches 12 (the rest rests at midnight)
    function render(p, hold) {
      var tp = clamp(p / (hold || 1), 0, 1);
      var m = tp * 180; // minutes after 9 pm
      hourH.style.transform = 'rotate(' + (270 + m / 2).toFixed(2) + 'deg)';
      minH.style.transform = 'rotate(' + (m * 6).toFixed(2) + 'deg)';
      if (sweep) sweep.style.strokeDasharray = tp.toFixed(4) + ' 1';
      var whole = Math.floor(m + 1e-6);
      if (whole !== last.min) {
        last.min = whole;
        if (whole >= 180) {
          setText(hm, '12:00'); setText(ap, 'midnight');
        } else {
          var mm = whole % 60;
          setText(hm, (9 + Math.floor(whole / 60)) + ':' + (mm < 10 ? '0' : '') + mm); setText(ap, 'pm');
        }
      }
      if (follow) {
        // the gold line fills between steps: 9:00 to 10:30, 10:30 to 11:30, 11:30 to 12:00
        [[0, 90], [90, 150], [150, 180]].forEach(function (r, i) {
          var f = Math.round(clamp((m - r[0]) / (r[1] - r[0]), 0, 1) * 1000) / 1000;
          if (steps[i] && f !== last['f' + i]) { last['f' + i] = f; steps[i].style.setProperty('--f', String(f)); }
        });
      }
      var n = whole >= 180 ? 4 : whole >= 150 ? 3 : whole >= 90 ? 2 : 1; // steps at 9:00, 10:30, 11:30, 12:00
      var hr = whole >= 120 ? 2 : whole >= 60 ? 1 : 0;
      if (n !== last.lit || hr !== last.hr) { last.lit = n; last.hr = hr; setLit(n, hr); }
    }

    if (reduced()) { el.classList.add('is-static'); render(1); return; }

    // the flame only flickers while the clock is on screen
    if (hasIO) {
      new IntersectionObserver(function (es) {
        el.classList.toggle('is-visible', es[es.length - 1].isIntersecting);
      }).observe(dial);
    } else {
      el.classList.add('is-visible');
    }

    el.classList.add('is-armed');
    render(0);

    var gsap = W.gsap;
    var ST = W.ScrollTrigger;
    if (gsap && ST) {
      gsap.registerPlugin(ST);
      var state = { p: 0 };
      // pin: desktop, the section holds still while the hands sweep (130% of a screen of scroll).
      // side: wide but short screens, no pin. stack: phones, no pin; the sweep ends while the 12 is still in view.
      var build = function (mode) {
        var hold = mode === 'pin' ? HOLD : 0.92;
        setFollow(mode !== 'stack');
        state.p = 0;
        render(0);
        gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: function () { render(state.p, hold); },
          scrollTrigger: mode === 'pin'
            ? { trigger: el, start: 'top top', end: '+=130%', pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true }
            : mode === 'side'
              ? { trigger: el, start: 'top 70%', end: 'bottom 85%', scrub: 0.6, invalidateOnRefresh: true }
              : { trigger: dial, start: 'top 88%', end: 'top 24%', scrub: 0.6, invalidateOnRefresh: true }
        });
        if (ST.sort) ST.sort(); // keep refresh order = page order, whatever order scripts created triggers in
      };
      if (gsap.matchMedia) {
        gsap.matchMedia().add({ pin: PIN_MQ, side: SIDE_MQ, stack: STACK_MQ }, function (ctx) {
          var c = ctx.conditions;
          build(c.pin ? 'pin' : c.side ? 'side' : 'stack');
        });
      } else {
        build(W.matchMedia(PIN_MQ).matches ? 'pin' : W.matchMedia(STACK_MQ).matches ? 'stack' : 'side');
      }
      return;
    }

    // no GSAP: the hands play 9 -> 12 once, when the clock is well in view
    setFollow(!W.matchMedia(STACK_MQ).matches);
    if (!hasIO) { render(1); return; }
    var io = new IntersectionObserver(function (es) {
      if (!es[es.length - 1].isIntersecting) return;
      io.disconnect();
      var t0 = 0;
      var dur = 4200;
      var tick = function (ts) {
        if (!t0) t0 = ts;
        var k = clamp((ts - t0) / dur, 0, 1);
        render(k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
        if (k < 1) W.requestAnimationFrame(tick);
      };
      W.requestAnimationFrame(tick);
    }, { threshold: 0.45 });
    io.observe(dial);
  }

  /* ================================================================ 2. live hours dial */

  var HOURS_GEOMETRY = { C: 150, R: 96 }; // keep in step with hoursDial() in midnight.snippet.mjs
  var OPEN = 11 * 60;
  var CLOSE = 24 * 60;
  var puneFmt = null;
  try {
    puneFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: 'numeric', minute: 'numeric', second: 'numeric', hourCycle: 'h23' });
  } catch (e) { puneFmt = null; }

  // minutes since midnight in Pune, whatever the visitor's own time zone
  function puneMinutes() {
    var d = new Date();
    if (puneFmt && puneFmt.formatToParts) {
      var h = 0, m = 0, s = 0;
      puneFmt.formatToParts(d).forEach(function (p) {
        if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
        else if (p.type === 'minute') m = parseInt(p.value, 10);
        else if (p.type === 'second') s = parseInt(p.value, 10);
      });
      return h * 60 + m + s / 60;
    }
    return (d.getUTCHours() * 60 + d.getUTCMinutes() + d.getUTCSeconds() / 60 + 330) % 1440; // IST = UTC + 5:30, no DST
  }
  function dialPoint(deg) {
    var a = ((deg - 90) * Math.PI) / 180;
    var g = HOURS_GEOMETRY;
    return (g.C + g.R * Math.cos(a)).toFixed(2) + ' ' + (g.C + g.R * Math.sin(a)).toFixed(2);
  }
  // arc between two times of day (minutes), 24 h = 360 degrees, midnight at the top
  function dialArc(m0, m1) {
    if (m1 - m0 < 0.75) return '';
    var d0 = m0 / 4, d1 = m1 / 4, R = HOURS_GEOMETRY.R;
    return 'M' + dialPoint(d0) + 'A' + R + ' ' + R + ' 0 ' + (d1 - d0 > 180 ? 1 : 0) + ' 1 ' + dialPoint(d1);
  }
  function clock12(t) {
    var h = Math.floor(t / 60) % 24, m = Math.floor(t % 60);
    return (h % 12 || 12) + ':' + (m < 10 ? '0' : '') + m + ' ' + (h < 12 ? 'am' : 'pm');
  }
  function spanShort(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h ? h + ' hr ' + m + ' min' : m + ' min'; // copy deck: '2 hr 15 min', '40 min'
  }
  function spanSay(min) {
    var h = Math.floor(min / 60), m = min % 60, out = [];
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m || !h) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    return out.join(' ');
  }

  function initDial(el) {
    var past = el.querySelector('.hdial__arc--past');
    var ahead = el.querySelector('.hdial__arc--ahead');
    var needle = el.querySelector('.hdial__needle svg');
    var status = el.querySelector('.hdial__status');
    var left = el.querySelector('.hdial__left');
    var next = el.querySelector('.hdial__next');
    if (!past || !ahead || !needle) return;
    var still = reduced() || !hasIO;
    var shown = still;
    var angle = null; // kept unbounded so the needle never runs backwards through midnight

    function now() {
      var o = el.getAttribute('data-now'); // HH:MM, for demos and tests only
      if (o && /^\d{1,2}:\d{2}$/.test(o)) { var q = o.split(':'); return (parseInt(q[0], 10) % 24) * 60 + parseInt(q[1], 10); }
      return puneMinutes();
    }
    function turn(a) {
      if (angle !== null) { while (a < angle - 180) a += 360; }
      angle = a;
      needle.style.transform = 'rotate(' + a.toFixed(2) + 'deg)';
    }

    function update() {
      var t = now();
      var whole = Math.floor(t);
      var open = whole >= OPEN && whole < CLOSE;
      var gap = open ? CLOSE - whole : OPEN - whole;
      if (status) { status.removeAttribute('data-static'); setText(status, open ? 'Open now' : 'Closed'); }
      setText(left, spanShort(gap) + (open ? ' left' : ' to go'));
      setText(next, open ? 'Closes at 12 midnight' : 'Opens at 11 am');
      el.classList.toggle('is-open', open);
      el.classList.toggle('is-closed', !open);
      past.setAttribute('d', open ? dialArc(OPEN, t) : '');
      ahead.setAttribute('d', dialArc(open ? t : OPEN, CLOSE));
      if (shown) turn(t / 4);
      el.setAttribute('aria-label', 'Opening hours: open every day, 11 am to 12 midnight, Pune time. It is ' + clock12(t) + ': ' +
        (open ? 'open now, closes at 12 midnight, ' + spanSay(gap) + ' left.' : 'closed, opens at 11 am, ' + spanSay(gap) + ' to go.'));
    }

    el.classList.add('is-live');
    if (still) {
      update();
    } else {
      // arrives once: the open arc draws from 11 am to midnight and the needle swings to now
      el.classList.add('is-armed');
      var t0 = now();
      turn(t0 >= OPEN && t0 < CLOSE ? OPEN / 4 : 0);
      update();
      var io = new IntersectionObserver(function (es) {
        if (!es[es.length - 1].isIntersecting) return;
        io.disconnect();
        el.classList.add('is-in', 'is-sweep');
        W.requestAnimationFrame(function () { shown = true; update(); });
      }, { threshold: 0.35 });
      io.observe(el);
    }
    W.setInterval(update, 30000);
    D.addEventListener('visibilitychange', function () { if (!D.hidden) update(); });
  }

  /* ================================================================ 3. size and servings guide */

  function initGuide(el) {
    var live = el.querySelector('.sguide__live');
    function sync(say) {
      var c = el.querySelector('.sguide__opt input:checked');
      if (!c) return;
      el.setAttribute('data-size', c.value); // drives the drawing in browsers without :has()
      if (say && live) live.textContent = c.getAttribute('data-say') || '';
    }
    el.addEventListener('change', function (e) {
      if (e.target && e.target.matches && e.target.matches('.sguide__opt input')) sync(true);
    });
    sync(false);
    W.addEventListener('pageshow', function () { sync(false); }); // a restored page may restore a different choice

    if (!reduced() && hasIO) {
      // the cake settles to size and the knife cuts draw once the drawing is in view
      el.classList.add('is-wait');
      var io = new IntersectionObserver(function (es) {
        if (!es[es.length - 1].isIntersecting) return;
        io.disconnect();
        W.requestAnimationFrame(function () { el.classList.remove('is-wait'); });
      }, { threshold: 0.35 });
      io.observe(el.querySelector('.sguide__stage') || el);
    }
  }

  /* ================================================================ boot */

  function wire(sel, fn, root) {
    var list = Array.prototype.slice.call(root.querySelectorAll(sel));
    if (root.matches && root.matches(sel)) list.unshift(root);
    list.forEach(function (el) {
      if (el.__cakoMidnight) return;
      el.__cakoMidnight = true;
      try { fn(el); } catch (err) { if (W.console && W.console.error) W.console.error('[Cako midnight parts]', err); }
    });
  }
  function init(root) {
    root = root && root.querySelectorAll ? root : D;
    wire('[data-midnight-clock]', initClock, root);
    wire('[data-hours-dial]', initDial, root);
    wire('[data-size-guide]', initGuide, root);
  }

  W.CakoParts = W.CakoParts || {};
  W.CakoParts.midnight = { init: init };

  var booted = false;
  function boot() { if (booted) return; booted = true; init(D); }
  if (D.readyState === 'complete') boot();
  else {
    D.addEventListener('DOMContentLoaded', boot); // after every deferred script, so gsap is there if the page loads it
    W.addEventListener('load', boot);
  }
})();
