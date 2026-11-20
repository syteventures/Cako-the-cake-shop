/* Cako parts: "The Counter", the lazy-susan turntable for "On the counter tonight".
 *
 *   turntable(cakes, manifest, opts)  ->  HTML string      [data-turntable]
 *
 *   cakes     array of [slug, name, category, description, halfKgPrice, oneKgPrice] in display order
 *             (the eight counter favourites first, then the rest; 8 to 22 cakes all work).
 *   manifest  assets/img/cut/manifest.json (array of { slug, cakeColor, ... } or an object keyed by slug).
 *             Optional: when left out it is read from disk next to the site.
 *   opts      { id = 'counter-tt', autoplay = 4000 (ms, 0 = never turns by itself), level = 3 (heading level),
 *               featured = the eight favourites (they carry "Counter favourite"), sizes = img sizes attribute }
 *
 * The page also needs (both are bundled / loaded by the build):
 *   assets/css/parts/turntable.css      (tools/build-pages.mjs bundles it into site.css)
 *   <script src="assets/js/parts/turntable.js" defer></script>   (self-initialising; CakoParts.turntable.init(root))
 *
 * Without JavaScript the markup is a horizontal scroll-snap row: every cake with its own caption, prices and order
 * link. The script turns it into the turntable, the paper place-card (a tabpanel) and the controls, which ship
 * `hidden` so nothing half-built ever shows.
 *
 * Placement: put it inside the section's .wrap, under the heading. The section should clip sideways
 * (.sec already has overflow-x: clip): on phones the stage bleeds to the screen edges.
 *
 * Facts used: the cake names, descriptions, categories and demo prices from tools/site/data.mjs. Prices are
 * labelled "Demo price" and carry data-assumed.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FEATURED = ['red-velvet-heart', 'chocolate-truffle', 'black-forest', 'rasmalai', 'pineapple', 'butterscotch', 'black-and-white-drip', 'strawberry-butterfly'];
const CAT_NAMES = { chocolate: 'Chocolate', fruit: 'Fruit & cream', classic: 'Classics', celebration: 'Celebration' };

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const inr = (n) => {
  const s = String(Math.round(Number(n) || 0));
  if (s.length <= 3) return '₹' + s;
  return '₹' + s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + s.slice(-3); // Indian grouping: 1,050 / 1,05,000
};
const hTag = (level) => `h${Math.min(6, Math.max(2, level | 0 || 3))}`;

/** manifest.json from disk: next to this file in tools/site/parts/, or from the work folder's demos/. */
function readManifest() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const tries = [
    path.resolve(here, '../../../public/assets/img/cut/manifest.json'),
    path.resolve(here, '../../../assets/img/cut/manifest.json'),
    path.resolve(here, '../../Cako the cake shop/assets/img/cut/manifest.json'),
    path.resolve(process.cwd(), 'assets/img/cut/manifest.json'),
  ];
  for (const f of tries) {
    try { if (fs.existsSync(f)) return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { /* try the next one */ }
  }
  return [];
}
const bySlugOf = (m) => (Array.isArray(m) ? Object.fromEntries(m.filter((e) => e && e.slug).map((e) => [e.slug, e])) : m || {});

const ICON = {
  prev: '<svg class="tt__ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M14.5 5.5 8 12l6.5 6.5"/></svg>',
  next: '<svg class="tt__ic" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9.5 5.5 16 12l-6.5 6.5"/></svg>',
  pause: '<svg class="tt__ic tt__ic--pause" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 6.5v11M15 6.5v11"/></svg>',
  play: '<svg class="tt__ic tt__ic--play" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M8.5 6.4v11.2L17.8 12z"/></svg>',
};

/**
 * @param {Array<[string,string,string,string,number,number]>} cakes
 * @param {object|Array} [manifest]
 * @param {object} [opts]
 */
export function turntable(cakes, manifest, opts = {}) {
  const {
    id = 'counter-tt',
    autoplay = 4000,
    level = 3,
    featured = FEATURED,
    label = 'Cakes on the counter',
    sizes = '(min-width: 1200px) 340px, (min-width: 900px) 27vw, 62vw',
  } = opts;
  const list = (cakes || []).filter(Boolean);
  const mf = bySlugOf(manifest === undefined ? readManifest() : manifest);
  const fav = new Set(featured);
  const H = hTag(level);
  const n = list.length;
  const pad = (k) => String(k).padStart(2, '0');
  const first = list[0] || ['', '', '', '', 0, 0];

  const cut = (slug) =>
    `<img class="tt__img" src="assets/img/cut/${slug}-480.webp" srcset="assets/img/cut/${slug}-240.webp 240w, assets/img/cut/${slug}-480.webp 480w, assets/img/cut/${slug}-960.webp 960w" sizes="${sizes}" width="960" height="960" alt="" loading="lazy" decoding="async" draggable="false">`;

  const item = ([slug, name, cat, desc, half, kg]) => {
    const color = (mf[slug] && mf[slug].cakeColor) || '#c6a26b';
    const isFav = fav.has(slug);
    return `<li class="tt__item" data-slug="${esc(slug)}" data-color="${esc(color)}" data-half="${Number(half) || 0}" data-kg="${Number(kg) || 0}"${isFav ? ' data-fav' : ''}>
          <figure class="tt__fig">
            <div class="tt__cake"><span class="tt__shadow" aria-hidden="true"></span><span class="tt__lift">${cut(slug)}</span></div>
            <figcaption class="tt__cap">
              <p class="tt__meta"><span class="tt__cat">${esc(CAT_NAMES[cat] || cat)}</span>${isFav ? '<span class="tt__fav">Counter favourite</span>' : ''}</p>
              <${H} class="tt__name">${esc(name)}</${H}>
              <p class="tt__desc">${esc(desc)}.</p>
              <dl class="tt__prices" data-assumed><div><dt>½ kg</dt><dd>${inr(half)}</dd></div><div><dt>1 kg</dt><dd>${inr(kg)}</dd></div></dl>
              
              <a class="tt__order" href="order.html#order-${esc(slug)}">Order this cake<span class="tt-sr">: ${esc(name)}</span></a>
            </figcaption>
          </figure>
        </li>`;
  };

  return `<div class="tt" id="${esc(id)}" data-turntable data-autoplay="${Math.max(0, Number(autoplay) || 0)}">
      <div class="tt__stage">
        <div class="tt__deck" aria-hidden="true" hidden>
          <span class="tt__pool"></span>
          <span class="tt__line"></span>
          <span class="tt__contact"></span>
          <span class="tt__plate"><span class="tt__side"></span><span class="tt__top"><span class="tt__sheen"></span></span></span>
        </div>
        <ul class="tt__list" role="list" aria-label="${esc(label)}">
        ${list.map(item).join('\n        ')}
        </ul>
      </div>
      <div class="tt__bar" hidden>
        <button class="tt__btn" type="button" data-tt="prev" aria-label="Previous cake">${ICON.prev}</button>
        <button class="tt__btn" type="button" data-tt="next" aria-label="Next cake">${ICON.next}</button>
        <p class="tt__hint">Drag, swipe or use the arrow keys.</p>
        <span class="tt__timer" aria-hidden="true"><i></i></span>
        <button class="tt__btn tt__btn--motion" type="button" aria-pressed="false" data-motion-toggle>${ICON.pause}${ICON.play}<span class="tt-sr" data-motion-label>Pause motion</span></button>
      </div>
      <div class="tt__card" id="${esc(id)}-card" hidden>
        <div class="tt__k-top">
          <p class="tt__k-meta"><span class="tt__k-cat" data-k="cat">${esc(CAT_NAMES[first[2]] || first[2])}</span><span class="tt__k-fav" data-k="fav">${fav.has(first[0]) ? 'Counter favourite' : ''}</span></p>
          <p class="tt__k-count"><span class="tt-sr" data-k="count-sr">Cake 1 of ${n}</span><span aria-hidden="true">Counter: <span class="tt__odo" data-k="count">01</span><span class="tt__k-of"> of ${pad(n)}</span></span></p>
        </div>
        <${H} class="tt__k-name" data-k="name">${esc(first[1])}</${H}>
        <p class="tt__k-desc" data-k="desc">${esc(first[3])}.</p>
        <dl class="tt__k-prices" data-assumed>
          <div><dt>½ kg</dt><dd><span class="tt-sr" data-k="half-sr">${inr(first[4])}</span><span class="tt__odo" aria-hidden="true" data-k="half">${inr(first[4])}</span></dd></div>
          <div><dt>1 kg</dt><dd><span class="tt-sr" data-k="kg-sr">${inr(first[5])}</span><span class="tt__odo" aria-hidden="true" data-k="kg">${inr(first[5])}</span></dd></div>
        </dl>
        
        <a class="tt__k-order" data-k="order" href="order.html#order-${esc(first[0])}">Order this cake<span class="tt-sr" data-k="order-sr">: ${esc(first[1])}</span></a>
      </div>
      <p class="tt-sr" aria-live="polite" aria-atomic="true" data-tt-live></p>
    </div>`;
}

export default turntable;
