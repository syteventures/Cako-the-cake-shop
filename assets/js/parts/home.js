/* Home behaviour (brief section 9): flavour hands, gift tags, size link, live countdown, "Facing you", header button.
   Everything works without GSAP; GSAP only adds the elastic swing and the rolling digits. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var paused = function () { return root.getAttribute('data-motion') === 'paused'; };
  var gsap = function () { return !reduce && window.gsap ? window.gsap : null; };
  var io = 'IntersectionObserver' in window;
  var once = function (el, fn, threshold) {
    if (!el) return;
    if (!io) { fn(); return; }
    var o = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { o.disconnect(); fn(); } }); }, { threshold: threshold || 0.35 });
    o.observe(el);
  };

  /* ---------------------------------------------------------------- 4. flavours: choosing a family deals its hand */
  var families = document.querySelector('[data-families]');
  if (families) {
    var fans = Array.prototype.slice.call(document.querySelectorAll('[data-fan]'));
    var first = fans[0];
    once(document.querySelector('.flavours__table'), function () { if (first) first.classList.add('is-dealt'); }, 0.4);
    families.addEventListener('click', function (e) {
      var btn = e.target.closest('.family__btn'); if (!btn) return;
      var li = btn.closest('[data-family]'), k = li.getAttribute('data-family');
      if (li.classList.contains('is-on')) return;
      families.querySelectorAll('[data-family]').forEach(function (f) {
        var on = f === li; f.classList.toggle('is-on', on);
        f.querySelector('.family__btn').setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      var next = document.getElementById('fan-' + k);
      var current = fans.filter(function (f) { return !f.hidden; })[0];
      var show = function () {
        fans.forEach(function (f) { f.hidden = f !== next; f.classList.remove('is-dealt'); });
        void next.offsetWidth; // start from the stacked deck
        next.classList.add('is-dealt');
      };
      if (current && current !== next && !reduce) { current.classList.remove('is-dealt'); setTimeout(show, 330); } else show();
    });
  }

  /* ---------------------------------------------------------------- 5. occasions: a tag swings like a pendulum */
  var tags = Array.prototype.slice.call(document.querySelectorAll('[data-tag]'));
  function swing(tag, from) {
    var g = gsap(); if (!g || paused()) return;
    g.killTweensOf(tag);
    g.fromTo(tag, { rotation: from }, { rotation: 0, duration: 1.4, ease: 'elastic.out(1, 0.4)', overwrite: true });
  }
  tags.forEach(function (tag, i) {
    var last = 0;
    var go = function (e) {
      var now = Date.now(); if (now - last < 700) return; last = now;
      var r = tag.getBoundingClientRect(); var dir = e && e.clientX ? (e.clientX < r.left + r.width / 2 ? -1 : 1) : (i % 2 ? -1 : 1);
      swing(tag, 9 * dir);
    };
    tag.addEventListener('pointerenter', go);
    tag.addEventListener('focusin', go);
    tag.addEventListener('click', function (e) { if (!e.target.closest('a')) go(e); });
  });
  once(document.querySelector('[data-tags]'), function () {
    var g = gsap(); if (!g || paused()) return;
    g.fromTo(tags, { rotation: 6 }, { rotation: 0, duration: 1.6, ease: 'elastic.out(1, 0.35)', stagger: 0.12 }); // one breeze along the row
  }, 0.3);

  /* ---------------------------------------------------------------- 7. "Order this size" follows the size guide */
  var sizeLink = document.querySelector('[data-size-order]');
  var sizeKey = { '0.5': 'half', '1': '1kg', '1.5': '1.5kg', '2': '2kg' };
  document.addEventListener('change', function (e) {
    if (!sizeLink || !e.target.matches || !e.target.matches('.sguide__opt input')) return;
    sizeLink.setAttribute('href', 'order.html?size=' + (sizeKey[e.target.value] || '1kg'));
  });

  /* ---------------------------------------------------------------- 12. the live countdown (Pune time, whatever the visitor's zone) */
  var box = document.querySelector('[data-countdown]');
  var fmt = window.Intl && Intl.DateTimeFormat ? new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' }) : null;
  function pune() {
    var p = { hour: 0, minute: 0, second: 0 };
    if (fmt) fmt.formatToParts(new Date()).forEach(function (x) { if (p[x.type] !== undefined) p[x.type] = parseInt(x.value, 10) % (x.type === 'hour' ? 24 : 60); });
    else { var d = new Date(Date.now() + (330 + new Date().getTimezoneOffset()) * 60000); p = { hour: d.getHours(), minute: d.getMinutes(), second: d.getSeconds() }; }
    return p;
  }
  function digitsHTML(str) { return str.split('').map(function (c) { return '<span class="countdown__d"><span>' + c + '</span></span>'; }).join(''); }
  function part(n, unit, key) { return '<span class="countdown__part"><span class="countdown__digits" data-k="' + key + '">' + digitsHTML(String(n)) + '</span><span class="countdown__unit">' + unit + '</span></span>'; }
  function roll(holder, str) {
    var old = holder.querySelectorAll('.countdown__d');
    if (old.length !== str.length) { holder.innerHTML = digitsHTML(str); return; }
    str.split('').forEach(function (c, i) {
      var cell = old[i], cur = cell.firstElementChild;
      if (cur.textContent === c) return;
      var g = gsap();
      if (!g || paused()) { cur.textContent = c; return; }
      var nx = document.createElement('span'); nx.textContent = c; cell.appendChild(nx);
      g.set(cell, { display: 'inline-grid' }); g.set([cur, nx], { gridArea: '1 / 1' });
      g.fromTo(nx, { yPercent: 100 }, { yPercent: 0, duration: 0.5, ease: 'power3.out' });
      g.to(cur, { yPercent: -100, duration: 0.5, ease: 'power3.out', onComplete: function () { cur.remove(); } });
    });
  }
  function tick() {
    if (!box) return;
    var t = pune(), now = t.hour * 3600 + t.minute * 60 + t.second;
    var open = t.hour >= 11;
    var left = open ? 86400 - now : 11 * 3600 - now;
    var mins = Math.max(1, Math.ceil(left / 60));
    var h = Math.floor(mins / 60), m = mins % 60;
    var label = open ? 'left tonight' : 'until we open at 11 am';
    var said = (h ? h + (h === 1 ? ' hour ' : ' hours ') : '') + m + (m === 1 ? ' minute ' : ' minutes ') + label;
    var shape = (h ? 'h' : '') + (h && !m ? '' : 'm') + (open ? 'o' : 'c');
    if (box.getAttribute('data-shape') !== shape) {
      box.setAttribute('data-shape', shape);
      box.innerHTML = '<span class="visually-hidden" data-said></span><span class="countdown__vis" aria-hidden="true" style="display:contents">' +
        (h ? part(h, 'hr', 'h') : '') + (h && !m ? '' : part(m, 'min', 'm')) + '<span class="countdown__label">' + label + '</span></span>';
    } else {
      var hh = box.querySelector('[data-k="h"]'), mm = box.querySelector('[data-k="m"]');
      if (hh) roll(hh, String(h)); if (mm) roll(mm, String(m));
    }
    box.querySelector('[data-said]').textContent = said;
  }
  if (box) { tick(); setInterval(tick, 15000); document.addEventListener('visibilitychange', function () { if (!document.hidden) tick(); }); }

  /* ---------------------------------------------------------------- hero: "Facing you" follows the cake (the photo cake dispatches cako:facing) */
  var facing = document.querySelector('[data-facing]');
  document.addEventListener('cako:facing', function (e) {
    if (!facing || !e.detail || !e.detail.slug) return;
    if (facing.getAttribute('data-slug') === e.detail.slug) return;
    facing.setAttribute('data-slug', e.detail.slug);
    facing.textContent = e.detail.name || e.detail.slug;
    facing.setAttribute('href', 'order.html#order-' + e.detail.slug);
    swapPic(e.detail.slug, e.detail.name || e.detail.slug);
  });

  /* the single photo in the hero box shows the cake that faces you */
  var pic = document.querySelector('[data-facing-pic]'), picImg = pic && pic.querySelector('img');
  function swapPic(slug, name) {
    if (!pic || !picImg) return;
    var base = '/assets/img/cut/' + slug, next = new Image();
    pic.setAttribute('href', 'order.html#order-' + slug);
    pic.setAttribute('aria-label', 'Order the ' + name + ' cake');
    next.onload = function () {
      picImg.classList.add('is-swap');
      setTimeout(function () {
        picImg.src = base + '-480.webp';
        picImg.srcset = base + '-240.webp 240w, ' + base + '-480.webp 480w, ' + base + '-960.webp 960w';
        picImg.classList.remove('is-swap');
      }, 220);
    };
    next.src = base + '-480.webp';
  }

  /* ---------------------------------------------------------------- header: its WhatsApp button rests while the hero's own is on screen */
  var heroCta = document.querySelector('[data-hero-cta]'), top = document.querySelector('[data-top]');
  if (heroCta && top && io) {
    var wa = top.querySelector('.top__wa');
    new IntersectionObserver(function (es) { es.forEach(function (e) {
      if (wa) top.style.setProperty('--wa-shift', (wa.offsetWidth + 10) + 'px');
      top.classList.toggle('hide-wa', e.isIntersecting);
    }); }).observe(heroCta);
  }
})();
