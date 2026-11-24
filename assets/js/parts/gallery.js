// gallery.html: category filters, a <dialog> lightbox (arrows, Esc, backdrop click), films that play only on screen
(() => {
  const chips = [...document.querySelectorAll('[data-gfilter]')];
  const items = [...document.querySelectorAll('.gal__item')];
  const say = document.querySelector('[data-gal-say]');
  chips.forEach((c) => c.addEventListener('click', () => {
    const k = c.dataset.gfilter;
    chips.forEach((x) => x.setAttribute('aria-pressed', String(x === c)));
    let n = 0;
    items.forEach((it) => { const on = k === 'all' || it.dataset.cat === k; it.hidden = !on; n += on; });
    if (say) say.textContent = `Showing ${n} ${k === 'all' ? 'photos and films' : c.firstChild.textContent.trim().toLowerCase()}.`;
  }));

  const box = document.querySelector('[data-gal-box]');
  const img = box && box.querySelector('[data-gal-img]');
  const cap = box && box.querySelector('[data-gal-cap]');
  let list = [], at = 0;
  const show = (i) => {
    at = (i + list.length) % list.length;
    const b = list[at];
    img.src = b.dataset.full; img.alt = b.querySelector('img').alt; cap.textContent = b.dataset.cap;
  };
  document.addEventListener('click', (e) => {
    const b = e.target.closest('.gal__open');
    if (!b || !box) return;
    list = [...document.querySelectorAll('.gal__item:not([hidden]) .gal__open')];
    show(list.indexOf(b)); box.showModal();
  });
  if (box) {
    box.querySelector('[data-gal-prev]').addEventListener('click', () => show(at - 1));
    box.querySelector('[data-gal-next]').addEventListener('click', () => show(at + 1));
    box.querySelector('[data-gal-close]').addEventListener('click', () => box.close());
    box.addEventListener('click', (e) => { if (e.target === box) box.close(); });
    box.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') show(at - 1); if (e.key === 'ArrowRight') show(at + 1); });
  }

  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((es) => es.forEach(({ target: v, isIntersecting }) => {
      if (isIntersecting) {
        const s = v.querySelector('source');
        if (s && s.dataset.src) { s.src = s.dataset.src; s.removeAttribute('data-src'); v.load(); }
        if (!still && document.documentElement.dataset.motion !== 'paused') v.play().catch(() => {});
      } else v.pause();
    }), { rootMargin: '300px' });
    document.querySelectorAll('video[data-autoloop]').forEach((v) => io.observe(v));
  }
})();
