/* Cako Cake: page behaviour. No dependencies.
 * Shared (every page): the Pune clock and live status, the header, the phone menu, the old hours line.
 * cakes.html: filter chips (aria-pressed, URL hash, polite live region), Shelves / Price list, a hand-written FLIP.
 * order.html: the order slip (live piping, the exact WhatsApp message, validation, pre-selection, the phone bar).
 * visit.html: today's row in the hours list, Copy address, the click-to-load map.
 * Everything here is an enhancement: without script every page shows all of its copy and photos. */
(function () {
  'use strict';

  var OPEN = 11 * 60;   // 11:00 am, Pune time
  var CLOSE = 24 * 60;  // 12:00 midnight
  var PHONE = '918446966779';
  var root = document.documentElement;
  var reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = reduceMQ.matches;
  function reduced() { return reduceMQ.matches; }
  function all(sel, scope) { return Array.prototype.slice.call((scope || document).querySelectorAll(sel)); }

  /* ------------------------------------------------------------ Pune clock */
  var clockFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Kolkata', hour: 'numeric', minute: '2-digit', hourCycle: 'h23'
  });
  var dayFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit'
  });
  var weekdayFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', weekday: 'long' });

  function puneNow() {
    var parts = clockFmt.formatToParts(new Date());
    var h = 0, m = 0;
    parts.forEach(function (p) {
      if (p.type === 'hour') h = parseInt(p.value, 10) % 24;
      if (p.type === 'minute') m = parseInt(p.value, 10);
    });
    return { h: h, m: m, t: h * 60 + m };
  }

  function puneDate(offsetDays) {
    var d = new Date(Date.now() + (offsetDays || 0) * 864e5);
    return dayFmt.format(d); // YYYY-MM-DD in Pune
  }

  function span(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (h && m) return h + ' hr ' + m + ' min';
    if (h) return h + ' hr';
    return m <= 1 ? '1 min' : m + ' min';
  }

  function clock(h, m) {
    var ap = h < 12 ? 'am' : 'pm';
    var hh = h % 12 || 12;
    return hh + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }

  function fill(tpl, map) {
    return String(tpl || '').replace(/\{(\w+)\}/g, function (_, k) { return map[k] != null ? map[k] : ''; });
  }

  var hoursLines = all('[data-hours]');
  var liveNodes = all('[data-live]');
  var dayRows = all('[data-days] [data-day]');

  // visit.html: the seven-day list marks today (Pune's weekday)
  function markToday() {
    if (!dayRows.length) return;
    var today = weekdayFmt.format(new Date());
    dayRows.forEach(function (row) {
      var on = row.getAttribute('data-day') === today;
      row.classList.toggle('is-today', on);
      if (on) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
    });
  }

  function renderStatus() {
    var n = puneNow();
    var open = n.t >= OPEN && n.t < CLOSE;
    var left = CLOSE - n.t;
    var until = n.t < OPEN ? OPEN - n.t : CLOSE - n.t + OPEN;
    var map = { left: span(left), until: span(until), time: clock(n.h, n.m) };

    root.classList.toggle('is-closed', !open);
    root.classList.toggle('is-open', open);

    liveNodes.forEach(function (el) {
      var tpl = el.getAttribute(open ? 'data-open' : 'data-closed');
      if (tpl != null) el.innerHTML = fill(tpl, map);
      // a live line that only makes sense with the clock running stays hidden without script
      var holder = el.closest('.live');
      if (holder && holder.hidden) holder.hidden = false;
    });

    var p = open ? (n.t - OPEN) / (CLOSE - OPEN) : 0;
    hoursLines.forEach(function (line) {
      var labelEl = line.querySelector('[data-hours-label]');
      // the label slides along with the mark and never leaves the line (shifted by its own width)
      if (labelEl) labelEl.textContent = fill(line.getAttribute(open ? 'data-open' : 'data-closed'), map);
      line.style.setProperty('--p', p.toFixed(4));
      line.style.setProperty('--lp', p.toFixed(4));
      line.setAttribute('aria-label', fill(line.getAttribute('data-aria'), map) + ' ' + (labelEl ? labelEl.textContent : ''));
    });
    markToday();
  }

  // the one moment on load: the hours line draws from 11 am to now
  if (!reduceMotion && hoursLines.length) {
    hoursLines.forEach(function (line) { line.style.setProperty('--p', '0'); line.style.setProperty('--lp', '0'); });
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        hoursLines.forEach(function (line) { line.classList.add('hours--animate'); });
        renderStatus();
      });
    });
  } else {
    renderStatus();
  }
  setInterval(renderStatus, 30000);
  document.addEventListener('visibilitychange', function () { if (!document.hidden) renderStatus(); });

  /* ------------------------------------------------------------ header: solid after 80 px (motion.js also hides it going
     down; the same threshold here keeps the header readable if motion.js does not load, and the two never disagree) */
  var top = document.querySelector('.top');
  function onScroll() { if (top) top.classList.toggle('is-solid', window.scrollY > 80); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // a jump the page makes for the visitor (not a smooth scroll); goes through Lenis when motion.js runs it
  function jumpTo(y) {
    y = Math.max(0, Math.round(y));
    var lenis = window.__cakoLenis;
    if (lenis && typeof lenis.scrollTo === 'function') lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo({ top: y, behavior: 'instant' });
  }

  /* ------------------------------------------------------------ phone menu: a real modal while open */
  var menuBtn = document.querySelector('[data-menu-open]');
  var menu = document.getElementById('menu');
  var menuClose = document.querySelector('[data-menu-close]');
  function setInert(on) {
    // everything but the menu leaves the tab order and the accessibility tree while the menu is open
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el !== menu && el.tagName !== 'SCRIPT') el.inert = on;
    });
  }
  function setMenu(open, restoreFocus) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    setInert(open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) { (menuClose || menu).focus(); } else if (restoreFocus !== false) { menuBtn.focus(); }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    if (menuClose) menuClose.addEventListener('click', function () { setMenu(false); });
    menu.addEventListener('click', function (e) {
      // a link inside the menu closes it and lets the page jump to the link's section
      if (e.target.closest('a')) setMenu(false, false);
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });
    // a tablet rotated past the desktop breakpoint loses the close button, so close the menu then
    var wide = window.matchMedia('(min-width: 960px)');
    var closeIfWide = function (e) { if (e.matches && !menu.hidden) setMenu(false, false); };
    if (wide.addEventListener) wide.addEventListener('change', closeIfWide); else if (wide.addListener) wide.addListener(closeIfWide);
  }

  /* ------------------------------------------------------------ small helpers: copy to the clipboard, a polite announcer */
  function copyText(text) {
    function legacy() {
      return new Promise(function (resolve, reject) {
        var t = document.createElement('textarea');
        t.value = text;
        t.setAttribute('readonly', '');
        t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none';
        document.body.appendChild(t);
        t.select();
        var ok = false;
        try { ok = document.execCommand('copy'); } catch (err) { ok = false; }
        t.remove();
        if (ok) resolve(); else reject(new Error('copy failed'));
      });
    }
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text).catch(legacy);
    return legacy();
  }
  var announcer = null;
  function makeAnnouncer() {
    if (announcer) return;
    announcer = document.createElement('p');
    announcer.className = 'visually-hidden';
    announcer.setAttribute('role', 'status');
    document.body.appendChild(announcer);
  }
  function announce(text) {
    if (!announcer) return;
    announcer.textContent = '';
    setTimeout(function () { announcer.textContent = text; }, 80);
  }
  // a copy button says what happened ("Copied", "Address copied") for a moment, then goes back
  function flash(btn, text) {
    var label = btn.querySelector('[data-copy-label]');
    if (!label) return;
    if (btn.__label == null) btn.__label = label.textContent;
    label.textContent = text;
    btn.classList.add('is-done');
    announce(text);
    clearTimeout(btn.__timer);
    btn.__timer = setTimeout(function () { label.textContent = btn.__label; btn.classList.remove('is-done'); }, 2400);
  }
  if (document.querySelector('[data-copy-message], [data-copy-address]')) makeAnnouncer();

  /* ============================================================ cakes.html: filter, view, FLIP */
  var shelves = document.querySelector('[data-shelves]');
  if (shelves) initCase(shelves);

  function initCase(list) {
    var cards = all('.dcake', list);
    var chips = all('[data-filter]');
    var views = all('input[name="view"]');
    var status = document.querySelector('[data-filter-status]');
    var bar = document.querySelector('.filterbar');
    var KEYS = { all: 1, chocolate: 1, fruit: 1, classic: 1, celebration: 1 };
    var EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'; // expo.out
    var DUR = 420;
    var current = 'all';

    function headerBottom() { return top ? top.getBoundingClientRect().bottom : 0; }
    function snapshot() { return cards.map(function (c) { return c.hidden ? null : c.getBoundingClientRect(); }); }
    function stopAll() {
      cards.forEach(function (c) { if (c.getAnimations) c.getAnimations().forEach(function (a) { a.cancel(); }); });
    }
    function onScreen(r, vh) { return r && r.bottom > 0 && r.top < vh; }

    // after a change, a visitor who was deep in the case starts again at its top, just under the sticky strip
    function keepInView() {
      var limit = bar ? bar.getBoundingClientRect().bottom : headerBottom();
      var listTop = list.getBoundingClientRect().top;
      if (listTop < limit) jumpTo(window.pageYOffset + listTop - limit - 24);
    }

    // FLIP: first (measure), last (change and measure), invert and play, with transforms only
    function change(apply) {
      var before = snapshot();
      stopAll();
      apply();
      keepInView();
      if (reduced() || !Element.prototype.animate) return;
      var vh = window.innerHeight;
      cards.forEach(function (c, i) {
        if (c.hidden) return;
        var b = c.getBoundingClientRect();
        if (!onScreen(b, vh)) return;
        var a = before[i];
        if (!onScreen(a, vh)) {
          // new on screen: it rises into its place
          c.animate([{ opacity: 0, transform: 'translateY(18px) scale(0.97)' }, { opacity: 1, transform: 'none' }], { duration: DUR, easing: EASE });
          return;
        }
        var dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        c.animate([{ transform: 'translate(' + dx.toFixed(1) + 'px, ' + dy.toFixed(1) + 'px)' }, { transform: 'none' }], { duration: DUR, easing: EASE });
      });
    }

    // on phones the chips scroll sideways: keep the chosen one in sight (moves only the strip, never the page)
    function revealChip(chip) {
      var strip = chip && chip.parentNode;
      if (!strip || strip.scrollWidth <= strip.clientWidth) return;
      var cr = chip.getBoundingClientRect(), sr = strip.getBoundingClientRect();
      if (cr.left < sr.left + 4) strip.scrollLeft += cr.left - sr.left - 8;
      else if (cr.right > sr.right - 40) strip.scrollLeft += cr.right - sr.right + 48;
    }

    function setFilter(key, opts) {
      opts = opts || {};
      if (!KEYS[key]) key = 'all';
      var chip = chips.filter(function (ch) { return ch.getAttribute('data-filter') === key; })[0];
      var apply = function () {
        current = key;
        cards.forEach(function (c) { c.hidden = key !== 'all' && c.getAttribute('data-cat') !== key; });
        chips.forEach(function (ch) { ch.setAttribute('aria-pressed', String(ch === chip)); });
      };
      if (opts.instant) apply(); else change(apply);
      revealChip(chip);
      if (opts.announce && status) status.textContent = chip ? chip.getAttribute('data-say') : '';
    }

    function setView(v, instant) {
      v = v === 'list' ? 'list' : 'shelves';
      var apply = function () {
        list.setAttribute('data-view', v);
        views.forEach(function (input) { input.checked = input.value === v; });
      };
      if (instant) apply(); else change(apply);
      try { localStorage.setItem('cako-view', v); } catch (err) { /* private mode: the view is simply not remembered */ }
    }

    chips.forEach(function (ch) {
      ch.addEventListener('click', function () {
        var key = ch.getAttribute('data-filter');
        if (key === current) return;
        setFilter(key, { announce: true });
        if (history.replaceState) history.replaceState(null, '', key === 'all' ? location.pathname + location.search : '#' + key);
      });
    });
    views.forEach(function (input) {
      input.addEventListener('change', function () { if (input.checked) setView(input.value); });
    });
    window.addEventListener('hashchange', function () {
      var k = location.hash.slice(1);
      if (KEYS[k]) setFilter(k, { announce: true });
      else if (!k) setFilter('all', { announce: true });
    });

    // the remembered view, then the hash (cakes.html#chocolate, #fruit, #classic, #celebration)
    var saved = null;
    try { saved = localStorage.getItem('cako-view'); } catch (err) { saved = null; }
    if (saved === 'list') setView('list', true);
    var hash = location.hash.slice(1);
    if (KEYS[hash] && hash !== 'all') {
      setFilter(hash, { instant: true });
      // a link to cakes.html#chocolate asks for those cakes: open the page at the case, under the header
      if (window.pageYOffset < 40 && bar) {
        requestAnimationFrame(function () {
          jumpTo(bar.getBoundingClientRect().top + window.pageYOffset - headerBottom());
        });
      }
    }
  }

  /* ============================================================ order.html: the slip */
  var slipForm = document.getElementById('slip');
  if (slipForm) initSlip(slipForm);

  function initSlip(form) {
    var q = function (s) { return form.querySelector(s); };
    var nameIn = q('#f-name'), wishIn = q('#f-wish'), cakeIn = q('#f-cake'), dateIn = q('#f-date');
    var timeIn = q('#f-time'), occIn = q('#f-occasion'), notesIn = q('#f-notes'), more = q('#f-more');
    var dateWrap = q('[data-date]'), servesEl = q('[data-serves-out]');
    var errCake = q('#f-cake-error'), errDate = q('#f-date-error'), errSize = q('#f-size-error'), errWhen = q('#f-when-error');
    var preview = document.querySelector('[data-preview]');
    var ocake = preview && preview.querySelector('.ocake');
    var turnEl = preview && preview.querySelector('.ocake__turn');
    var writing = preview && preview.querySelector('.ocake__writing');
    var pipes = { wish: preview && preview.querySelector('[data-pipe="wish"]'), name: preview && preview.querySelector('[data-pipe="name"]') };
    var priceEl = preview && preview.querySelector('[data-price]');
    var bubble = document.querySelector('[data-message]');
    var sends = all('[data-send]');
    var afters = all('[data-after]');
    var DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var shown = { wish: null, name: null };
    var turns = 0, lastSlug = null;

    if (dateIn) dateIn.min = puneDate(0);

    function val(name) { var r = form.querySelector('input[name="' + name + '"]:checked'); return r ? r.value : ''; }
    function inr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
    function cake() {
      var o = cakeIn.options[cakeIn.selectedIndex];
      if (!o || !o.value) return null;
      return { slug: o.value, name: o.text, family: o.getAttribute('data-f'), prices: (o.getAttribute('data-p') || '').split(' ') };
    }
    function whenText() {
      var w = val('when');
      if (w === 'today') return 'Today';
      if (w === 'tomorrow') return 'Tomorrow';
      if (w === 'date' && dateIn && dateIn.value) {
        var p = dateIn.value.split('-');
        var d = new Date(+p[0], +p[1] - 1, +p[2]);
        if (!isNaN(d.getTime())) return DAYS[d.getDay()] + ', ' + d.getDate() + ' ' + MONTHS[d.getMonth()];
      }
      return '';
    }

    // the exact message (copy deck, "WhatsApp messages"): lines whose field is empty are left out
    function message() {
      var c = cake();
      var lines = ["Hello Cako, I'd like to order a cake."];
      if (c) lines.push('Cake: ' + c.name);
      var size = val('size');
      if (size) lines.push('Size: ' + size);
      var words = [wishIn.value, nameIn.value.trim()].filter(Boolean).join(' ');
      lines.push('Writing: ' + (words || 'No writing'));
      if (occIn && occIn.value) lines.push('Occasion: ' + occIn.options[occIn.selectedIndex].text);
      var when = whenText(), time = timeIn ? timeIn.value.trim() : '';
      if (when) lines.push('When: ' + when + (time ? ', around ' + time : ''));
      else if (time) lines.push('When: around ' + time);
      var mode = val('mode');
      if (mode) lines.push('Pickup or delivery: ' + (mode === 'pickup' ? "I'll collect it" : 'Please tell me about delivery to my area'));
      var notes = notesIn ? notesIn.value.trim() : '';
      if (notes) lines.push('Notes: ' + notes);
      lines.push('Please confirm the price and the time.');
      return lines.join('\n');
    }

    // fit a piped line inside the cake by its measured width, not its letter count
    function fit(el) {
      if (!el || !writing) return;
      el.style.setProperty('--fit', '1');
      var avail = writing.clientWidth, w = el.offsetWidth;
      if (avail && w > avail) el.style.setProperty('--fit', Math.max(0.42, avail / w).toFixed(3));
    }

    // live piping: a letter typed at the end swells into place like a bead of cream; anything else redraws
    function pipe(key, text, typed) {
      var el = pipes[key];
      if (!el) return;
      var prev = shown[key];
      if (text === prev) return;
      var last = text.slice(-1);
      var grow = typed && !reduced() && prev !== null && text.length === prev.length + 1 && text.slice(0, -1) === prev && /\S/.test(last);
      if (grow) {
        var bead = document.createElement('span');
        bead.className = 'bead';
        bead.textContent = last;
        bead.addEventListener('animationend', function () {
          if (!bead.parentNode) return;
          bead.parentNode.replaceChild(document.createTextNode(bead.textContent), bead);
          el.normalize();
        });
        el.appendChild(bead);
      } else {
        el.textContent = text;
      }
      shown[key] = text;
      el.hidden = !text.trim();
      el.classList.toggle('is-deva', /[ऀ-ॿ]/.test(text));
      fit(el);
    }

    function paintCake(c) {
      if (!ocake) return;
      ocake.setAttribute('data-family', c ? c.family : 'none');
      var slug = c ? c.slug : '';
      // the cake turns 30 degrees when the chosen cake changes
      if (lastSlug !== null && slug !== lastSlug && slug && turnEl) {
        turns += 30;
        turnEl.style.setProperty('rotate', turns + 'deg');
      }
      lastSlug = slug;
    }

    function priceLine(c) {
      if (!priceEl) return;
      if (!c) { priceEl.hidden = true; priceEl.textContent = ''; return; }
      var size = val('size');
      var p = size === '½ kg' ? c.prices[0] : size === '1 kg' ? c.prices[1] : '';
      priceEl.hidden = false;
      priceEl.innerHTML = 'We’ll confirm today’s price for <b>' + size + '</b> on WhatsApp.';
    }

    function update(typed) {
      var c = cake();
      paintCake(c);
      pipe('wish', wishIn.value, false);
      pipe('name', nameIn.value.replace(/\s+/g, ' ').replace(/^\s/, ''), typed);
      priceLine(c);
      var sized = form.querySelector('input[name="size"]:checked');
      if (servesEl && sized) servesEl.textContent = sized.getAttribute('data-serves');
      if (dateWrap) dateWrap.classList.toggle('is-on', val('when') === 'date');
      var msg = message();
      if (bubble) bubble.textContent = msg;
      var href = 'https://wa.me/' + PHONE + '?text=' + encodeURIComponent(msg);
      sends.forEach(function (a) { a.href = href; });
    }

    // errors: shown under the field, tied to it with aria-describedby only while they show
    function setError(field, errEl, on) {
      if (!field || !errEl) return;
      errEl.hidden = !on;
      var ids = (field.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== errEl.id; });
      if (on) { ids.push(errEl.id); field.setAttribute('aria-invalid', 'true'); } else { field.removeAttribute('aria-invalid'); }
      if (ids.length) field.setAttribute('aria-describedby', ids.join(' ')); else field.removeAttribute('aria-describedby');
    }
    function dateOk() { return !!(dateIn && dateIn.value && dateIn.value >= puneDate(0)); }
    function validate() {
      var first = null;
      var noCake = !cakeIn.value;
      setError(cakeIn, errCake, noCake);
      if (noCake) first = cakeIn;
      var noSize = !val('size');
      setError(q('.slip__size'), errSize, noSize);
      if (noSize && !first) first = q('input[name="size"]');
      var noWhen = !val('when');
      setError(q('.slip__when'), errWhen, noWhen);
      if (noWhen && !first) first = q('input[name="when"]');
      var badDate = val('when') === 'date' && !dateOk();
      setError(dateIn, errDate, badDate);
      if (badDate && !first) first = dateIn;
      return first;
    }

    sends.forEach(function (a) {
      a.addEventListener('click', function (e) {
        update(false);
        var bad = validate();
        if (bad) {
          e.preventDefault();
          bad.focus();
          return;
        }
        afters.forEach(function (box) {
          box.innerHTML = '<p>WhatsApp is open with your order. Press send there.</p>' +
            '<p>WhatsApp didn’t open? Call us on <a href="tel:+918446966779">+91 84469 66779</a>, or copy the message and send it yourself.</p>';
        });
      });
    });

    all('[data-copy-message]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        update(false);
        copyText(message()).then(function () { flash(btn, 'Copied'); }, function () {
          // no clipboard: select the message so it can be copied by hand
          if (!bubble || !window.getSelection) return;
          var range = document.createRange();
          range.selectNodeContents(bubble);
          var sel = window.getSelection();
          sel.removeAllRanges();
          sel.addRange(range);
        });
      });
    });

    form.addEventListener('input', function (e) { update(e.target === nameIn); });
    form.addEventListener('change', function (e) {
      if (e.target === cakeIn && cakeIn.value) setError(cakeIn, errCake, false);
      if (e.target.name === 'size') setError(q('.slip__size'), errSize, false);
      if (e.target.name === 'when') setError(q('.slip__when'), errWhen, false);
      if ((e.target === dateIn || e.target.name === 'when') && (val('when') !== 'date' || dateOk())) setError(dateIn, errDate, false);
      update(false);
    });
    // Enter in a field moves to the send button rather than opening WhatsApp mid-choice
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      update(false);
      var send = sends.filter(function (a) { return a.offsetParent !== null; })[0];
      if (send) send.focus();
    });

    // pre-selection: #order-<slug>, ?occasion= and ?size=
    var OCCASION_WISH = { anniversary: 'Happy Anniversary', office: 'Congratulations', festival: '' };
    function sizeFrom(v) {
      var s = String(v || '').toLowerCase().replace(/\s+/g, '').replace('½', '0.5').replace(/^half(kg)?$/, '0.5').replace(/kgs?$/, '');
      return { '0.5': '½ kg', '.5': '½ kg', '1': '1 kg', '1.0': '1 kg', '1.5': '1.5 kg', '2': '2 kg', '2.0': '2 kg' }[s] || '';
    }
    function fromQuery() {
      var params;
      try { params = new URLSearchParams(location.search); } catch (err) { return; }
      var occ = (params.get('occasion') || '').toLowerCase().trim();
      if (/^[a-z]+$/.test(occ) && occIn && occIn.querySelector('option[value="' + occ + '"]')) {
        occIn.value = occ;
        if (more) more.open = true;
        if (Object.prototype.hasOwnProperty.call(OCCASION_WISH, occ)) wishIn.value = OCCASION_WISH[occ];
      }
      var size = sizeFrom(params.get('size'));
      if (size) {
        var r = form.querySelector('input[name="size"][value="' + size + '"]');
        if (r) r.checked = true;
      }
    }
    function fromHash() {
      var m = /^#order-([a-z0-9-]+)$/.exec(location.hash);
      if (!m || !cakeIn.querySelector('option[value="' + m[1] + '"]')) return false;
      cakeIn.value = m[1];
      setError(cakeIn, errCake, false);
      return true;
    }
    window.addEventListener('hashchange', function () { if (fromHash()) update(false); });
    // a same-page link to #order-<slug> (motion.js scrolls those itself and uses pushState, which fires no hashchange)
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href*="#order-"]');
      if (!a) return;
      var url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname) return;
      setTimeout(function () { if (fromHash()) update(false); }, 0);
    });

    // the phone action bar steps aside while a field has focus, and while the slip (with its own send bar) is on screen
    var bar = document.querySelector('.actionbar');
    if (bar) {
      var slipSeen = false, fieldFocus = false;
      var sync = function () {
        var away = slipSeen || fieldFocus;
        bar.classList.toggle('is-away', away);
        bar.inert = away;
      };
      var isField = function (el) { return !!(el && el.matches && el.matches('input, select, textarea')); };
      form.addEventListener('focusin', function (e) { if (isField(e.target)) { fieldFocus = true; sync(); } });
      form.addEventListener('focusout', function () {
        setTimeout(function () { var a = document.activeElement; fieldFocus = isField(a) && form.contains(a); sync(); }, 0);
      });
      if ('IntersectionObserver' in window) {
        // the slip counts as on screen once its own send bar has room to stand in for the action bar
        new IntersectionObserver(function (es) { slipSeen = es[es.length - 1].isIntersecting; sync(); }, { rootMargin: '0px 0px -140px 0px' }).observe(form);
      }
    }

    // the sticky preview knows its own height, so on a short screen it can stick by its foot (Send stays in view)
    if (preview && 'ResizeObserver' in window) {
      new ResizeObserver(function () { preview.style.setProperty('--ph', preview.offsetHeight + 'px'); }).observe(preview);
    }

    // the slow turn rests while the cake is off screen
    if (ocake && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { ocake.classList.toggle('is-offscreen', !es[es.length - 1].isIntersecting); }).observe(ocake);
    }

    fromQuery();
    fromHash();
    update(false);
    // re-measure the piped writing once the icing face (Sofia) has loaded
    if (document.fonts && document.fonts.load) {
      document.fonts.load('400 1em Sofia').then(function () { fit(pipes.wish); fit(pipes.name); }, function () {});
    }
  }

  /* ============================================================ visit.html: Copy address, the map facade */
  all('[data-copy-address]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      copyText(btn.getAttribute('data-text') || '').then(function () { flash(btn, 'Address copied'); }, function () {});
    });
  });

  // the map loads only when asked: no Google frame (and no Google request) until "Load the map" is pressed
  var map = document.querySelector('[data-map]');
  var mapLoad = map && map.querySelector('[data-map-load]');
  if (mapLoad) {
    mapLoad.addEventListener('click', function () {
      if (map.querySelector('iframe')) return;
      var frame = document.createElement('iframe');
      frame.className = 'vmap__frame';
      frame.title = map.getAttribute('data-title') || 'Map';
      frame.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
      frame.setAttribute('allowfullscreen', '');
      frame.addEventListener('load', function () { map.classList.add('is-loaded'); });
      frame.src = map.getAttribute('data-src');
      map.appendChild(frame);
      map.classList.add('is-on');
      frame.focus();
    });
  }
})();
