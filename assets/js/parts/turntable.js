/* Cako parts: "The Counter", the lazy-susan turntable ("On the counter tonight", home).
 *
 * Markup: _workfiles/demos/turntable.snippet.mjs (copied to tools/site/parts/turntable.mjs). Styles: assets/css/parts/turntable.css.
 * window.CakoParts.turntable = { init(root), play(), pause(), instances }. It initialises every [data-turntable] by itself;
 * call init(root) for markup added later (anything already wired is skipped).
 *
 *  - The cut-outs stand on a circle seen in perspective. Every frame each cake's place comes from its angle on the circle
 *    (translate3d + scale, z-index by depth), and the cut-outs always face the viewer. The plate under them is the exact
 *    ellipse that circle makes; its sunray sheen turns with the cakes. Cakes further back are smaller, higher and dimmer.
 *  - The cake in front drives the paper place-card (the tabpanel): count, name, description, demo prices that roll like a
 *    till, the order link. The section's light eases toward the cake's colour, never past AA for the text on it.
 *  - Turns by itself every data-autoplay ms (4000). It rests on hover, keyboard focus, drag, off screen, in a hidden tab and
 *    under html[data-motion="paused"] (the site's one motion toggle, WCAG 2.2.2), and never runs under reduced motion.
 *  - Drag or swipe with inertia and snap, previous / next buttons, arrow keys, Home / End, click a side cake.
 *  - Accessibility: the cakes are a tablist (roving tabindex, automatic activation), the card is its tabpanel, and a polite
 *    live region names the cake after a pointer or button change. Without JS the markup stays a scroll-snap row.
 *  - Performance: one requestAnimationFrame loop that runs only while something moves; transforms and opacity only;
 *    geometry is measured on resize, never inside the loop.
 */
(function () {
  'use strict';
  var W = window, D = document, HTML = D.documentElement;
  var mqReduce = W.matchMedia ? W.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduced = function () { return !!(mqReduce && mqReduce.matches); };
  var motionPaused = function () { return HTML.getAttribute('data-motion') === 'paused'; };
  var now = function () { return W.performance && W.performance.now ? W.performance.now() : Date.now(); };
  var EASE_OUT = 'cubic-bezier(.16, 1, .3, 1)', EASE_IO = 'cubic-bezier(.65, 0, .35, 1)';
  var instances = [], seq = 0;

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function mod(a, n) { return ((a % n) + n) % n; }
  function pad2(k) { return k < 10 ? '0' + k : String(k); }
  function rupees(v) {
    var s = String(Math.round(v || 0));
    if (s.length > 3) s = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); // 1,050 / 1,05,000
    return '₹' + s;
  }
  function isFocusVisible(t) { try { return t.matches(':focus-visible'); } catch (e) { return true; } }

  /* ------------------------------------------------------------------ colour: the light a cake gives the section */
  function hexRgb(h) {
    var m = /^\s*#?([0-9a-f]{3}|[0-9a-f]{6})\s*$/i.exec(String(h || ''));
    if (!m) return null;
    var s = m[1].length === 3 ? m[1].replace(/./g, '$&$&') : m[1], v = parseInt(s, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
  }
  function cssRgb(s) {
    var m = /rgba?\(([^)]+)\)/.exec(s || '');
    if (!m) return null;
    var p = m[1].split(/[\s,\/]+/).filter(Boolean).map(parseFloat);
    return p.length < 3 || p[3] === 0 ? null : [p[0], p[1], p[2]];
  }
  function lum(c) {
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function ratio(a, b) { var x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); }
  function mix(a, b, t) { return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
  function toHsl(c) {
    var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, max = Math.max(r, g, b), min = Math.min(r, g, b);
    var l = (max + min) / 2, d = max - min, h = 0, s = 0;
    if (d) {
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      h = (max === r ? (g - b) / d + (g < b ? 6 : 0) : max === g ? (b - r) / d + 2 : (r - g) / d + 4) / 6;
    }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    var f = function (t) { t = mod(t, 1); return t < 1 / 6 ? p + (q - p) * 6 * t : t < 0.5 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3) * 255, f(h) * 255, f(h - 1 / 3) * 255];
  }
  // Near-neutral cakes borrow cocoa (dark ones) or vanilla (light ones); the others keep their hue, deep and warm, with
  // yellows pulled toward amber so they never go olive on cocoa. Then the strength drops until secondary text (cream-2)
  // still reads at 4.5:1 or better on the brightest spot of the glow, even at 1.6x strength (two lights mid cross-fade).
  function tintOf(hex, ground, text2) {
    var c = hexRgb(hex) || [198, 162, 107], h = toHsl(c), out;
    if (h[1] < 0.22 || h[2] < 0.1) out = h[2] < 0.45 ? [140, 84, 48] : [226, 194, 148];
    else {
      var hue = h[0];
      if (hue > 0.08 && hue < 0.2) hue = 0.08 + (hue - 0.08) * 0.3;
      out = fromHsl(hue, clamp(h[1], 0.4, 0.74), clamp(h[2], 0.42, 0.54));
    }
    var a = 0.24;
    while (a > 0.04 && ratio(text2, mix(ground, out, Math.min(1, a * 1.6))) < 4.5) a -= 0.01;
    return { c: out.map(Math.round), a: Math.round(a * 100) / 100 };
  }

  /* ------------------------------------------------------------------ the till: digits roll on reels (translateY only) */
  function Odo(el) { this.el = el; this.v = null; this.shape = ''; this.cells = []; }
  Odo.prototype.set = function (str, animate, dir) {
    var el = this.el;
    if (!el) return;
    var shape = str.replace(/\d/g, '0');
    if (this.v === null || shape !== this.shape) {
      el.textContent = '';
      this.cells = [];
      for (var j = 0; j < str.length; j++) {
        var ch = str.charAt(j);
        if (/\d/.test(ch)) {
          var cell = D.createElement('span'), reel = D.createElement('span');
          cell.className = 'tt__dg'; reel.className = 'tt__reel';
          for (var k = 0; k < 10; k++) { var s = D.createElement('span'); s.textContent = k; reel.appendChild(s); }
          reel.style.transform = 'translateY(' + (-10 * +ch) + '%)';
          cell.appendChild(reel); el.appendChild(cell);
          this.cells.push({ reel: reel, d: +ch });
        } else {
          var c = D.createElement('span'); c.className = 'tt__ch'; c.textContent = ch; el.appendChild(c);
        }
      }
      if (animate && this.v !== null && el.animate) {
        el.animate([{ opacity: 0, transform: 'translateY(' + (dir < 0 ? -40 : 40) + '%)' }, { opacity: 1, transform: 'none' }], { duration: 560, easing: EASE_OUT });
      }
      this.shape = shape; this.v = str;
      return;
    }
    var n = 0;
    for (var i = 0; i < str.length; i++) {
      var chr = str.charAt(i);
      if (!/\d/.test(chr)) continue;
      var cel = this.cells[n++], d = +chr;
      if (cel.d === d) continue;
      cel.reel.style.transitionDelay = animate ? (n - 1) * 55 + 'ms' : '0ms';
      cel.reel.style.transform = 'translateY(' + (-10 * d) + '%)';
      cel.d = d;
    }
    this.v = str;
  };

  /* ------------------------------------------------------------------ a line that leaves while the next one arrives */
  function swapLine(box, text, dir, kind, animate) {
    if (!box) return;
    var cur = box._cur;
    if (cur && cur.textContent === text) return;
    [].slice.call(box.children).forEach(function (c) { if (c !== cur) box.removeChild(c); });
    var nu = D.createElement('span');
    nu.className = 'tt__sw'; nu.textContent = text;
    box.appendChild(nu); box._cur = nu;
    if (!cur) return;
    if (!animate || !nu.animate) { box.removeChild(cur); return; }
    cur.setAttribute('aria-hidden', 'true');
    var out;
    if (kind === 'slide') {
      // the box is the mask: both lines travel its full height so neither shows inside it on the way
      // and they move as one (same time, same curve, one mask-height apart): the new name pushes the old one out
      var hgt = Math.max(box.clientHeight, cur.offsetHeight, nu.offsetHeight) + 4;
      out = cur.animate([{ transform: 'none', opacity: 1 }, { transform: 'translateY(' + -dir * hgt + 'px)', opacity: 0.2 }], { duration: 780, easing: EASE_IO, fill: 'forwards' });
      nu.animate([{ transform: 'translateY(' + dir * hgt + 'px)', opacity: 0.2 }, { transform: 'none', opacity: 1 }], { duration: 780, easing: EASE_IO });
    } else {
      out = cur.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 220, easing: 'linear', fill: 'forwards' });
      nu.animate([{ opacity: 0, transform: 'translateY(' + dir * 8 + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 620, delay: 150, easing: EASE_OUT, fill: 'backwards' });
    }
    out.onfinish = function () { if (cur.parentNode === box) box.removeChild(cur); };
  }

  /* ------------------------------------------------------------------ one turntable */
  function create(el) {
    var stage = el.querySelector('.tt__stage'), list = el.querySelector('.tt__list');
    if (!stage || !list) return null;
    var lis = [].filter.call(list.children, function (c) { return c.classList && c.classList.contains('tt__item'); });
    var n = lis.length;
    if (!n) return null;

    var deck = el.querySelector('.tt__deck'), bar = el.querySelector('.tt__bar'), card = el.querySelector('.tt__card');
    var live = el.querySelector('[data-tt-live]'), sheen = el.querySelector('.tt__sheen');
    var timerBox = el.querySelector('.tt__timer'), timerBar = timerBox ? timerBox.firstElementChild : null;
    var motionBtn = bar ? bar.querySelector('[data-motion-toggle]') : null;
    var uid = el.id || (el.id = 'tt' + (++seq));
    var panelId = card ? card.id || (card.id = uid + '-card') : '';
    var auto = Math.max(0, parseInt(el.getAttribute('data-autoplay'), 10) || 0);
    var rs = getComputedStyle(el);
    var text2 = hexRgb(rs.getPropertyValue('--cream-2')) || [200, 176, 154];
    var host = el.parentElement && el.parentElement.closest ? el.parentElement.closest('[data-ground], section') : null;
    var ground = (host && cssRgb(getComputedStyle(host).backgroundColor)) || hexRgb(rs.getPropertyValue('--night-2')) || [43, 24, 17];

    var ring = Math.min(n, 9);                    // places round the visible ring
    var stepA = (2 * Math.PI) / ring, stepDeg = 360 / ring;
    var visHalf = n <= 9 ? n / 2 : 4.5;           // how far round a cake can be and still show
    var keepHalf = n <= 9 ? n / 2 + 0.01 : 6.2;   // rendered (so its photo loads) a little before it shows

    /* ---- the still pictures become tabs */
    var items = lis.map(function (li, i) {
      var txt = function (sel) { var e = li.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
      var order = li.querySelector('.tt__order');
      var it = {
        li: li, i: i, slug: li.getAttribute('data-slug') || '', name: txt('.tt__name'), cat: txt('.tt__cat'),
        fav: txt('.tt__fav'), desc: txt('.tt__desc'), half: +li.getAttribute('data-half') || 0, kg: +li.getAttribute('data-kg') || 0,
        href: order ? order.getAttribute('href') : 'order.html',
        tint: tintOf(li.getAttribute('data-color'), ground, text2),
        on: true, tf: '', z: -1, a: -1, dim: -1, hit: true,
      };
      var still = li.querySelector('.tt__cake');
      var btn = D.createElement('button');
      btn.type = 'button'; btn.className = 'tt__cake'; btn.id = uid + '-tab-' + i;
      btn.setAttribute('role', 'tab'); btn.setAttribute('aria-selected', 'false'); btn.setAttribute('data-i', i);
      if (panelId) btn.setAttribute('aria-controls', panelId);
      btn.tabIndex = -1;
      if (still) { while (still.firstChild) btn.appendChild(still.firstChild); still.parentNode.replaceChild(btn, still); }
      else li.appendChild(btn);
      var name = D.createElement('span'); name.className = 'tt-sr'; name.textContent = it.name; btn.appendChild(name);
      var lift = btn.querySelector('.tt__lift') || btn;
      var shade = D.createElement('span'); shade.className = 'tt__shade'; shade.setAttribute('aria-hidden', 'true'); lift.appendChild(shade);
      li.setAttribute('role', 'presentation');
      // a <figure> with a caption may not take a role (ARIA in HTML), so it keeps its own
      it.btn = btn; it.img = btn.querySelector('img'); it.shade = shade;
      // the shade is the cut-out's own silhouette: it darkens a cake without showing the ones behind through it.
      // It reuses the file the <img> picked, so nothing downloads twice.
      var setMask = function () {
        var src = it.img && (it.img.currentSrc || it.img.src);
        if (!src) return;
        var u = 'url("' + src.replace(/"/g, '%22') + '")';
        shade.style.webkitMaskImage = u; shade.style.maskImage = u;
        shade.classList.add('is-masked');
      };
      if (it.img) { if (it.img.complete && it.img.naturalWidth) setMask(); else it.img.addEventListener('load', setMask); }
      return it;
    });
    list.setAttribute('role', 'tablist');
    if (!list.getAttribute('aria-label')) list.setAttribute('aria-label', 'Cakes on the counter');

    /* ---- the place-card */
    var K = {};
    if (card) {
      card.setAttribute('role', 'tabpanel');
      ['cat', 'fav', 'count', 'count-sr', 'name', 'desc', 'half', 'half-sr', 'kg', 'kg-sr', 'order', 'order-sr'].forEach(function (k) { K[k] = card.querySelector('[data-k="' + k + '"]'); });
      ['cat', 'fav', 'name', 'desc'].forEach(function (k) { if (K[k]) { K[k].textContent = ''; K[k].classList.add('tt__stack'); } });
    }
    var odoCount = new Odo(K.count), odoHalf = new Odo(K.half), odoKg = new Odo(K.kg);

    function paint(it, dir, animate) {
      if (!card) return;
      swapLine(K.name, it.name, dir, 'slide', animate);
      swapLine(K.cat, it.cat, dir, 'fade', animate);
      swapLine(K.fav, it.fav, dir, 'fade', animate);
      swapLine(K.desc, it.desc, dir, 'fade', animate);
      odoCount.set(pad2(it.i + 1), animate, dir);
      odoHalf.set(rupees(it.half), animate, dir);
      odoKg.set(rupees(it.kg), animate, dir);
      if (K['count-sr']) K['count-sr'].textContent = 'Cake ' + (it.i + 1) + ' of ' + n;
      if (K['half-sr']) K['half-sr'].textContent = rupees(it.half);
      if (K['kg-sr']) K['kg-sr'].textContent = rupees(it.kg);
      if (K.order) K.order.setAttribute('href', it.href);
      if (K['order-sr']) K['order-sr'].textContent = ': ' + it.name;
      card.setAttribute('aria-labelledby', it.btn.id);
    }

    // One height for the card, the tallest any cake needs, so the button never jumps when the cake changes.
    // Measured on a hidden copy (a handful of layouts, only when the card's width changes or the fonts arrive).
    var fitW = -1;
    function fitCard(force) {
      if (!card || !card.offsetWidth) return;
      var w = card.getBoundingClientRect().width;
      if (!force && Math.abs(w - fitW) < 0.5) return;
      fitW = w;
      var probe = card.cloneNode(true);
      [].forEach.call(probe.querySelectorAll('[id]'), function (x) { x.removeAttribute('id'); });
      ['id', 'role', 'aria-labelledby'].forEach(function (a) { probe.removeAttribute(a); });
      probe.setAttribute('aria-hidden', 'true');
      probe.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;pointer-events:none;min-height:0;margin:0;opacity:0;width:' + w + 'px';
      el.appendChild(probe);
      var q = function (k) { return probe.querySelector('[data-k="' + k + '"]'); };
      var nm = q('name'), ds = q('desc'), ct = q('cat'), fv = q('fav'), max = 0;
      items.forEach(function (it) {
        if (nm) nm.textContent = it.name;
        if (ds) ds.textContent = it.desc;
        if (ct) ct.textContent = it.cat;
        if (fv) fv.textContent = it.fav;
        max = Math.max(max, probe.getBoundingClientRect().height);
      });
      el.removeChild(probe);
      card.style.minHeight = Math.ceil(max) + 'px';
    }

    /* ---- the section's light (two layers that cross-fade by opacity) */
    var sky = null, skyL = [], skyOn = 0;
    if (host) {
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      host.classList.add('tt-host');
      sky = D.createElement('div'); sky.className = 'tt-sky'; sky.setAttribute('aria-hidden', 'true');
      for (var s = 0; s < 2; s++) { var l = D.createElement('span'); l.className = 'tt-sky__l'; sky.appendChild(l); skyL.push(l); }
      host.insertBefore(sky, host.firstChild);
    }
    function light(it, first) {
      if (!sky) return;
      var on = skyL[(skyOn = 1 - skyOn)], off = skyL[1 - skyOn];
      on.style.setProperty('--tt-c', it.tint.c.join(' '));
      on.style.setProperty('--tt-a', String(it.tint.a));
      if (first) { on.classList.add('is-now'); off.classList.add('is-now'); }
      on.classList.add('is-on'); off.classList.remove('is-on');
      if (first) W.requestAnimationFrame(function () { W.requestAnimationFrame(function () { on.classList.remove('is-now'); off.classList.remove('is-now'); }); });
    }

    /* ---- geometry: a circle of radius R seen from a camera D radii in front of it, H above the plate (all from the stage size) */
    var G = { S: 300, R: 315, H: 309, D: 2.2, q: 0.52, cx: 0, hz: 0, px: 220, k: 0.4 };
    function measure() {
      var w = stage.clientWidth, h = stage.clientHeight;
      if (!w || !h) return false;
      var narrow = w < 700;
      // Everything below is in units of S, the front cake's size, so the whole scene fits the stage by construction.
      var Dp = 2.2, q = Dp / (Dp + 2), rho = 1.3, thick = 0.05, margin = 0.05;
      var r = narrow ? 1.16 : 1.3;                // ring radius
      var Hs = r * 1.2;                           // camera height above the plate (the photos are shot from above)
      var den = (Dp + 1) * (Dp + 1) - rho * rho;
      var k = Hs - 0.93;                          // a cake's base minus its visible height
      var topOff = k >= 0 ? q * k : k;            // the highest cake top, measured from the horizon
      var pcS = (Hs * Dp * (Dp + 1)) / den;       // plate centre, from the horizon
      var pbS = (Hs * Dp * rho) / den;            // plate half-height
      var sSide = Dp / (Dp + 1 - 1 / (Dp + 1));   // scale where the ring is widest
      var spanS = 2 * ((r * Dp) / Math.sqrt((Dp + 1) * (Dp + 1) - 1) + 0.46 * sSide); // ring width, cakes included
      var perS = margin - topOff + pcS + pbS * 1.35 + thick + 0.02; // top margin .. the plate's shadow
      var S = Math.min(h / perS, narrow ? w * 0.54 : w / spanS, 360);
      G.S = S; G.R = r * S; G.H = Hs * S; G.D = Dp; G.q = q;
      G.cx = w / 2;
      G.hz = (margin - topOff) * S + Math.max(0, (h - perS * S) / 2);
      G.pa = (rho * G.R * Dp) / Math.sqrt(den);   // the plate: the exact ellipse a circle of radius rho * R makes here
      G.pb = pbS * S;
      G.pc = G.hz + pcS * S;
      G.pt = thick * S;
      G.k = G.pb / G.pa;
      G.px = Math.max(60, G.R * stepA);           // pixels of drag per cake, at the front
      var gy = G.hz + G.H - 0.45 * S;             // the downlight sits on the front cake, and stays inside the stage
      var st = el.style, px = function (v) { return v.toFixed(1) + 'px'; };
      st.setProperty('--tt-s', px(S)); st.setProperty('--tt-cx', px(G.cx)); st.setProperty('--tt-hz', px(G.hz));
      st.setProperty('--tt-pa', px(G.pa)); st.setProperty('--tt-pb', px(G.pb)); st.setProperty('--tt-pc', px(G.pc)); st.setProperty('--tt-pt', px(G.pt));
      st.setProperty('--tt-gy', px(gy));
      st.setProperty('--tt-grx', px(Math.max(40, Math.min(1.45 * S, G.cx - 1))));
      st.setProperty('--tt-gry', px(Math.max(40, Math.min(1.0 * S, gy - 1, h - gy - 1))));
      if (sky) {
        var hr = host.getBoundingClientRect(), sr = stage.getBoundingClientRect();
        sky.style.setProperty('--tt-sky-x', px(sr.left - hr.left + G.cx));
        sky.style.setProperty('--tt-sky-y', px(sr.top - hr.top + G.hz + G.H * 0.62));
        sky.style.setProperty('--tt-sky-rx', px(Math.max(520, w * 0.95)));
        sky.style.setProperty('--tt-sky-ry', px(Math.max(420, h * 1.05)));
      }
      return true;
    }

    /* ---- state, and the frame */
    var pos = 0, vel = 0, tw = null, raf = 0, active = -1, restT = 0;
    var intro = !reduced() && 'IntersectionObserver' in W ? { t0: null, len: 0 } : null;
    var holds = { hover: false, focus: false, drag: false, off: true, hidden: !!D.hidden, intro: !!intro };

    function introAlpha(i, t) {
      if (intro.t0 === null) return 0;
      var d = mod(i, n); if (d > n / 2) d -= n;
      var e = clamp((t - intro.t0 - 160 - Math.abs(d) * 85) / 650, 0, 1);
      return 1 - (1 - e) * (1 - e) * (1 - e);
    }
    // Once the section has been seen, the cakes about to come round are fetched and decoded ahead of time,
    // so none of them is decoded in the middle of a turn. Until then every photo keeps loading="lazy".
    var seen = false;
    function warm(it) {
      it.warm = true;
      if (!it.img) return;
      try { it.img.loading = 'eager'; } catch (e) { /* older browsers */ }
      if (it.img.decode) it.img.decode().catch(function () { /* still loading or failed: the <img> shows it anyway */ });
    }
    function render(t) {
      for (var i = 0; i < n; i++) {
        var it = items[i], d = mod(i - pos, n);
        if (d > n / 2) d -= n;
        var ad = d < 0 ? -d : d;
        if (seen && !it.warm && ad <= keepHalf + 1.6) warm(it);
        // far round the back: out of rendering (and not loaded yet). Never the selected cake: it may hold focus.
        if (ad > keepHalf && i !== active) { if (it.on) { it.li.classList.add('is-off'); it.on = false; it.tf = ''; } continue; }
        if (!it.on) { it.li.classList.remove('is-off'); it.on = true; }
        var th = d * stepA, s = G.D / (G.D + 1 - Math.cos(th));
        var x = G.R * Math.sin(th) * s, y = G.H * s;
        var a = n <= 9 ? 1 : clamp((visHalf - ad) / 0.9, 0, 1);
        if (intro) { var e = introAlpha(i, t); a *= e; y -= (1 - e) * G.S * 0.16; }
        var tf = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) scale(' + s.toFixed(4) + ')';
        if (tf !== it.tf) { it.li.style.transform = tf; it.tf = tf; }
        var z = Math.round(s * 100);
        if (z !== it.z) { it.li.style.zIndex = String(z); it.z = z; }
        if (Math.abs(a - it.a) > 0.004 || (a === 1 && it.a !== 1)) { it.li.style.opacity = a >= 0.999 ? '' : a.toFixed(3); it.a = a >= 0.999 ? 1 : a; }
        var dim = 0.8 * Math.pow(clamp((1 - s) / (1 - G.q), 0, 1), 1.05);
        if (Math.abs(dim - it.dim) > 0.004) { it.li.style.setProperty('--dim', dim.toFixed(3)); it.dim = dim; }
        var hit = a > 0.4;
        if (hit !== it.hit) { it.li.classList.toggle('is-ghost', !hit); it.hit = hit; }
      }
      if (sheen) sheen.style.transform = 'scaleY(' + G.k.toFixed(4) + ') rotate(' + (pos * stepDeg).toFixed(2) + 'deg)';
    }
    function frame(t) {
      raf = 0;
      t = t || now();
      var busy = drag.on;
      if (!drag.on && tw) {
        var u = (t - tw.t0) / tw.dur;
        if (u >= 1) { pos = tw.p1; vel = 0; tw = null; }
        else {
          // cubic Hermite from the current place and speed to the target at rest: smooth when retargeted mid-turn
          u = Math.max(0, u);
          var u2 = u * u, u3 = u2 * u, T = tw.dur;
          pos = (2 * u3 - 3 * u2 + 1) * tw.p0 + (u3 - 2 * u2 + u) * T * tw.v0 + (3 * u2 - 2 * u3) * tw.p1;
          vel = ((6 * u2 - 6 * u) * tw.p0 + (3 * u2 - 4 * u + 1) * T * tw.v0 + (6 * u - 6 * u2) * tw.p1) / T;
          busy = true;
        }
      }
      if (intro && intro.t0 !== null) {
        if (t - intro.t0 >= intro.len) { intro = null; el.classList.remove('is-intro'); }
        else busy = true;
      }
      render(t);
      if (busy) raf = W.requestAnimationFrame(frame);
      else rest();
    }
    function kick() {
      clearTimeout(restT);
      el.classList.add('is-moving');
      if (!raf) raf = W.requestAnimationFrame(frame);
    }
    function rest() {
      pos = mod(pos, n);
      if (Math.abs(pos - Math.round(pos)) < 1e-6) pos = mod(Math.round(pos), n);
      restT = setTimeout(function () { if (!raf) el.classList.remove('is-moving'); }, 220);
      if (!intro) holds.intro = false;
      restartTimer();
    }

    /* ---- moving */
    var userHold = false; // after the visitor turns it, the next turn by itself waits longer
    function durFor(dist, kind) {
      var ad = Math.abs(dist);
      return Math.min(1700, (kind === 'auto' ? 1150 : 780) + Math.max(0, ad - 1) * 170);
    }
    function go(target, o) {
      o = o || {};
      if (n < 2) return;
      if (o.kind !== 'auto') userHold = true;
      cancelTimer();
      var idx = mod(Math.round(target), n), dir = target > pos ? 1 : target < pos ? -1 : 1;
      if (reduced()) { tw = null; vel = 0; pos = target; render(now()); select(idx, dir, o); rest(); return; }
      tw = { p0: pos, v0: vel, p1: target, t0: now(), dur: o.dur || durFor(target - pos, o.kind) };
      select(idx, dir, o);
      kick();
    }
    function step(k, o) { go((tw ? tw.p1 : Math.round(pos)) + k, o); }
    function goTo(i, o) {
      var base = tw ? tw.p1 : Math.round(pos), d = mod(i - base, n);
      if (d > n / 2) d -= n;
      if (!d && !tw) { select(mod(i, n), 1, o); return; }
      go(base + d, o);
    }
    function select(i, dir, o) {
      o = o || {};
      var it = items[i];
      var tabFocused = D.activeElement && D.activeElement.getAttribute && D.activeElement.getAttribute('role') === 'tab' && list.contains(D.activeElement);
      if (i !== active) {
        var prev = items[active], first = active < 0;
        if (prev) { prev.btn.setAttribute('aria-selected', 'false'); prev.btn.tabIndex = -1; prev.li.classList.remove('is-front'); }
        it.btn.setAttribute('aria-selected', 'true'); it.btn.tabIndex = 0; it.li.classList.add('is-front');
        active = i;
        paint(it, dir || 1, !first && !reduced());
        light(it, first);
        if (!first && typeof W.CustomEvent === 'function') el.dispatchEvent(new CustomEvent('cako:counter', { bubbles: true, detail: { slug: it.slug, name: it.name, index: i } }));
      }
      // a focused tab announces itself; otherwise say which cake is in front now (never for turns it makes by itself)
      if (o.say && live && !tabFocused && !o.focus) live.textContent = it.name + ', ' + (i + 1) + ' of ' + n;
      if (o.focus || (tabFocused && D.activeElement !== it.btn)) {
        if (!it.on) { it.li.classList.remove('is-off'); it.on = true; } // a far cake is still out of rendering: bring it in first
        try { it.btn.focus({ preventScroll: true }); } catch (e) { it.btn.focus(); }
      }
    }

    /* ---- turning by itself: the gold hairline in the controls is the clock (Web Animations, so it pauses exactly) */
    var timer = null;
    function canRun() { return auto > 0 && n > 1 && !reduced() && !motionPaused() && !holds.hover && !holds.focus && !holds.drag && !holds.off && !holds.hidden && !holds.intro; }
    function cancelTimer() { if (timer) { timer.onfinish = null; timer.cancel(); timer = null; } }
    function restartTimer() {
      cancelTimer();
      if (!auto || n < 2 || reduced() || !timerBar || !timerBar.animate) { syncTimer(); return; }
      timer = timerBar.animate([{ transform: 'scaleX(0)' }, { transform: 'scaleX(1)' }], { duration: userHold ? auto * 3 : auto, easing: 'linear', fill: 'forwards' });
      timer.onfinish = function () { timer = null; userHold = false; step(1, { kind: 'auto' }); };
      syncTimer();
    }
    function syncTimer() {
      var run = canRun() && !tw && !drag.on;
      el.classList.toggle('is-auto', run);
      if (!timer) return;
      if (run) { if (timer.playState === 'paused') timer.play(); }
      else if (timer.playState === 'running') timer.pause();
    }

    /* ---- the first time it comes into view, the table spins in and slows onto the first cake */
    function startIntro() {
      if (!intro || intro.t0 !== null) return;
      intro.t0 = now();
      intro.len = 160 + Math.ceil(visHalf) * 85 + 700;
      el.classList.remove('is-pre'); el.classList.add('is-intro');
      pos = -2.6; vel = 2.6 / 480;
      tw = { p0: pos, v0: vel, p1: 0, t0: intro.t0, dur: 1900 };
      kick();
    }

    /* ---- drag and swipe, with inertia and snap */
    var drag = { down: false, on: false, id: null, x0: 0, y0: 0, p0: 0, pts: [], just: false };
    stage.addEventListener('pointerdown', function (e) {
      if ((e.pointerType === 'mouse' && e.button !== 0) || n < 2) return;
      drag.down = true; drag.on = false; drag.id = e.pointerId; drag.x0 = e.clientX; drag.y0 = e.clientY;
      drag.pts = [{ x: e.clientX, t: e.timeStamp || now() }];
    });
    stage.addEventListener('pointermove', function (e) {
      if (!drag.down || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.on) {
        if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
        if (Math.abs(dy) > Math.abs(dx)) { drag.down = false; return; } // an up-down gesture: the page scrolls
        drag.on = true; holds.drag = true; userHold = true;
        cancelTimer(); syncTimer();
        try { stage.setPointerCapture(e.pointerId); } catch (err) { /* old browsers */ }
        tw = null; drag.p0 = pos; drag.x0 = e.clientX;
        el.classList.add('is-dragging');
        kick();
      }
      pos = drag.p0 - (e.clientX - drag.x0) / G.px;
      var t = e.timeStamp || now();
      drag.pts.push({ x: e.clientX, t: t });
      while (drag.pts.length > 2 && t - drag.pts[0].t > 100) drag.pts.shift();
      var idx = mod(Math.round(pos), n);
      if (idx !== active) select(idx, e.clientX < drag.pts[0].x ? 1 : -1, {});
    });
    function release(e) {
      if (!drag.down || (e && e.pointerId !== drag.id)) return;
      drag.down = false;
      if (!drag.on) return; // a tap: the click handler has it
      drag.on = false; holds.drag = false; drag.just = true;
      setTimeout(function () { drag.just = false; }, 60);
      el.classList.remove('is-dragging');
      var p = drag.pts, v = 0, a = p[0], b = p[p.length - 1], t = (e && e.timeStamp) || now();
      if (p.length > 1 && b.t > a.t && t - b.t < 90) v = (b.x - a.x) / (b.t - a.t); // px per ms
      var vp = clamp(-v / G.px, -0.02, 0.02);                                      // cakes per ms
      var base = Math.round(pos);
      var target = clamp(Math.round(pos + vp * 300), base - 4, base + 4);
      vel = reduced() ? 0 : vp;
      go(target, { kind: 'drag', say: true, dur: clamp(420 + Math.abs(target - pos) * 180, 420, 1300) });
    }
    stage.addEventListener('pointerup', release);
    stage.addEventListener('pointercancel', release);
    stage.addEventListener('lostpointercapture', function (e) { if (drag.on) release(e); });
    stage.addEventListener('dragstart', function (e) { e.preventDefault(); });
    stage.addEventListener('click', function (e) { if (drag.just) { e.preventDefault(); e.stopPropagation(); } }, true);

    // a sideways trackpad swipe turns it one cake at a time (and keeps the browser from going back a page)
    var wAcc = 0, wLast = 0, wReset = 0;
    stage.addEventListener('wheel', function (e) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY) || Math.abs(e.deltaX) < 1) return;
      e.preventDefault(); e.stopPropagation();
      wAcc += e.deltaX;
      clearTimeout(wReset); wReset = setTimeout(function () { wAcc = 0; }, 180);
      var t = now();
      if (Math.abs(wAcc) > 48 && t - wLast > 420) { step(wAcc > 0 ? 1 : -1, { kind: 'user', say: true }); wAcc = 0; wLast = t; }
    }, { passive: false });

    /* ---- clicks and keys */
    list.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('.tt__cake') : null;
      if (!b) return;
      var i = +b.getAttribute('data-i');
      if (i !== active || tw) goTo(i, { kind: 'user', say: true });
    });
    if (bar) bar.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-tt]') : null;
      if (!b) return;
      step(b.getAttribute('data-tt') === 'prev' ? -1 : 1, { kind: 'user', say: true });
    });
    el.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      var t = e.target, onTab = t.getAttribute && t.getAttribute('role') === 'tab';
      if (!onTab && !(bar && bar.contains(t))) return;
      var key = e.key;
      if (key === 'ArrowRight' || key === 'ArrowLeft') {
        e.preventDefault();
        step(key === 'ArrowRight' ? 1 : -1, { kind: 'user', focus: onTab, say: !onTab });
      } else if (onTab && (key === 'Home' || key === 'End')) {
        e.preventDefault();
        goTo(key === 'Home' ? 0 : n - 1, { kind: 'user', focus: true });
      }
    });

    /* ---- what pauses it */
    el.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { holds.hover = true; syncTimer(); } });
    el.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { holds.hover = false; syncTimer(); } });
    el.addEventListener('focusin', function (e) { if (isFocusVisible(e.target)) { holds.focus = true; syncTimer(); } });
    el.addEventListener('focusout', function (e) { if (!e.relatedTarget || !el.contains(e.relatedTarget)) { holds.focus = false; syncTimer(); } });
    D.addEventListener('visibilitychange', function () { holds.hidden = !!D.hidden; syncTimer(); });
    D.addEventListener('cako:motion', syncTimer);
    if (W.MutationObserver) new MutationObserver(syncTimer).observe(HTML, { attributes: true, attributeFilter: ['data-motion'] });
    var onReduce = function () {
      el.classList.toggle('is-instant', reduced());
      if (motionBtn) motionBtn.hidden = !auto || reduced();
      if (timerBox) timerBox.hidden = !auto || reduced();
      if (reduced() && intro) { intro = null; holds.intro = false; el.classList.remove('is-pre', 'is-intro'); render(now()); }
      restartTimer();
    };
    if (mqReduce) { if (mqReduce.addEventListener) mqReduce.addEventListener('change', onReduce); else if (mqReduce.addListener) mqReduce.addListener(onReduce); }

    // The motion button is one of the site's [data-motion-toggle] buttons: motion.js flips html[data-motion] for all of
    // them. Where motion.js is not on the page, this does the same, so the button always works and never flips twice.
    if (motionBtn) {
      motionBtn.setAttribute('aria-pressed', motionPaused() ? 'true' : 'false');
      var lab = motionBtn.querySelector('[data-motion-label]');
      if (lab) lab.textContent = motionPaused() ? 'Play motion' : 'Pause motion';
      motionBtn.addEventListener('click', function () {
        var seen = false, saw = function () { seen = true; };
        D.addEventListener('cako:motion', saw);
        setTimeout(function () {
          D.removeEventListener('cako:motion', saw);
          if (seen) return;
          var play = motionPaused();
          if (play) HTML.removeAttribute('data-motion'); else HTML.setAttribute('data-motion', 'paused');
          [].forEach.call(D.querySelectorAll('[data-motion-toggle]'), function (b) {
            b.setAttribute('aria-pressed', play ? 'false' : 'true');
            var l = b.querySelector('[data-motion-label]'); if (l) l.textContent = play ? 'Pause motion' : 'Play motion';
          });
          try { W.localStorage.setItem('cako-motion', play ? 'playing' : 'paused'); } catch (err) { /* private mode */ }
          if (typeof W.CustomEvent === 'function') D.dispatchEvent(new CustomEvent('cako:motion', { detail: { playing: play } }));
        }, 0);
      });
    }

    /* ---- go */
    [deck, n > 1 ? bar : null, card].forEach(function (x) { if (x) x.hidden = false; }); // one cake: nothing to turn
    el.classList.add('is-ready');
    if (intro) el.classList.add('is-pre');
    onReduce();
    measure();
    select(0, 1, {});
    render(now());
    fitCard(true);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { fitCard(true); });

    var onResize = function () { if (measure()) render(now()); fitCard(); };
    if (W.ResizeObserver) {
      var ro = new W.ResizeObserver(onResize);
      ro.observe(stage);
      if (host) ro.observe(host);
    } else {
      W.addEventListener('resize', onResize);
    }
    if ('IntersectionObserver' in W) {
      new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          holds.off = !en.isIntersecting;
          if (en.isIntersecting && !seen) { seen = true; if (!raf) render(now()); }
          if (en.isIntersecting && en.intersectionRatio >= 0.2) startIntro();
          syncTimer();
        });
      }, { threshold: [0, 0.2] }).observe(stage);
    } else {
      holds.off = false; seen = true;
    }
    restartTimer();

    var api = {
      el: el,
      next: function () { step(1, { kind: 'user' }); },
      prev: function () { step(-1, { kind: 'user' }); },
      go: function (i) { goTo(mod(i, n), { kind: 'user' }); },
      get index() { return active; },
      get position() { return pos; },
      sync: syncTimer,
      measure: function () { if (measure()) render(now()); },
    };
    return api;
  }

  function init(scope) {
    var els = (scope && scope.querySelectorAll ? scope : D).querySelectorAll('[data-turntable]');
    [].forEach.call(els, function (el) {
      if (el.__tt) return;
      try {
        var t = create(el);
        if (t) { el.__tt = t; instances.push(t); }
      } catch (err) {
        el.classList.remove('is-ready', 'is-pre', 'is-intro'); // leave the scroll-snap row standing
      }
    });
    return instances;
  }
  // motion.js calls these with html[data-motion] already set; the state is read from there
  function sync() { instances.forEach(function (t) { t.sync(); }); }

  W.CakoParts = W.CakoParts || {};
  W.CakoParts.turntable = { init: init, play: sync, pause: sync, instances: instances };
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', function () { init(D); });
  else init(D);
})();
