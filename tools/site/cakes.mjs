// Cakes page (brief section 10, "the night display case"). Copy: _workfiles/content.md "CAKES", word for word.
// Styles: assets/css/src/20-pages.css (case-hero, filterbar, shelves, dcake, sstrip, know, ccta).
// Behaviour: assets/js/site.js (filter chips + hash, live region, Shelves / Price list view, hand-written FLIP).
import { CAKES, FEATURED, bySlug, icon, part } from './data.mjs';
import { ALT, CAT_NAMES, catCount, inr, WA_CUSTOM, mark } from './content.mjs';
import { page } from './shell.mjs';

const r1 = (v) => Math.round(v * 10) / 10;
const fav = new Set(FEATURED);
// the moving strip at the foot of the custom-cake panel: the occasions people order cakes for
const STRIP_OCCASIONS = ['Birthdays', 'Anniversaries', 'Midnight surprises', 'Kids’ parties', 'Baby showers', 'Engagements', 'Weddings', 'Graduations', 'Farewells', 'Housewarmings', 'Office celebrations', 'Festivals'];
const stripList = (hidden) => `<ul class="ccta__strip-list"${hidden ? ' aria-hidden="true"' : ''}>${STRIP_OCCASIONS.map((o) => `<li>${mark}<span>${o}</span></li>`).join('')}</ul>`;
// the eight counter favourites first (in the counter's order), then the rest grouped by category
const CAT_ORDER = ['chocolate', 'fruit', 'classic', 'celebration'];
const SHOWN = [...FEATURED.map((s) => bySlug[s]), ...CAT_ORDER.flatMap((k) => CAKES.filter((c) => c[2] === k && !fav.has(c[0])))];

// chips and the polite live region's lines (copy deck, CAKES section 2)
const FILTERS = [
  ['all', 'All cakes', CAKES.length, `Showing all ${CAKES.length} cakes.`],
  ['chocolate', CAT_NAMES.chocolate, catCount('chocolate'), `Showing ${catCount('chocolate')} chocolate cakes.`],
  ['fruit', CAT_NAMES.fruit, catCount('fruit'), `Showing ${catCount('fruit')} fruit &amp; cream cakes.`],
  ['classic', CAT_NAMES.classic, catCount('classic'), `Showing ${catCount('classic')} classics.`],
  ['celebration', CAT_NAMES.celebration, catCount('celebration'), `Showing ${catCount('celebration')} celebration cakes.`],
];

// small line icons for the view toggle (shown alone on narrow phones; the words stay for screen readers)
const viewIcon = {
  shelves: '<svg class="icon icon--line" viewBox="0 0 20 20" aria-hidden="true"><path d="M2.5 9h15M2.5 17.5h15"/><rect x="4.5" y="3.5" width="4" height="5.5" rx="1"/><rect x="11.5" y="3.5" width="4" height="5.5" rx="1"/><rect x="4.5" y="12" width="4" height="5.5" rx="1"/><rect x="11.5" y="12" width="4" height="5.5" rx="1"/></svg>',
  list: '<svg class="icon icon--line" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5h9M3 10h9M3 15h9"/><path d="M15 5h2M15 10h2M15 15h2" stroke-dasharray="0.01 2"/></svg>',
};

// a cut-out on its shelf: the first shelf row loads straight away, the rest lazily
const SIZES = '(min-width: 1200px) 270px, (min-width: 768px) 28vw, (min-width: 360px) 42vw, 86vw';
const cutImg = (slug, alt, lazy) =>
  `<img class="dcake__img" src="assets/img/cut/${slug}-480.webp" srcset="assets/img/cut/${slug}-240.webp 240w, assets/img/cut/${slug}-480.webp 480w, assets/img/cut/${slug}-960.webp 960w" sizes="${SIZES}" width="960" height="960" alt="${alt}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;

const card = (c, i) => `<li class="dcake" id="cake-${c[0]}" data-cat="${c[2]}"${fav.has(c[0]) ? ' data-fav' : ''} data-assumed>
          <div class="dcake__stage">
            <span class="dcake__contact" aria-hidden="true"></span>
            ${cutImg(c[0], ALT[c[0]], i >= 4)}
            <span class="dcake__lip" aria-hidden="true"></span>
          </div>
          <div class="dcake__label">
            <h3 class="dcake__name">${c[1]}</h3>
            ${fav.has(c[0]) ? '<p class="dcake__fav">Counter favourite</p>' : ''}
            <p class="dcake__desc">${c[3]}.</p>
            <div class="dcake__buy">
            </div>
            <a class="btn btn--secondary btn--sm dcake__order" href="order.html#order-${c[0]}" aria-label="Order the ${c[1]} cake">Order</a>
          </div>
        </li>`;

// the custom-cake sketch: the butterfly celebration cake in gold hairlines (decorative, 1.5 px strokes)
function sketch() {
  const cx = 200, top = 132, rx = 126, ry = 32, bot = 252, bx = 156, bry = 44, by = bot + 10;
  const ex = (a, x0, y0, ax, ay) => [r1(x0 + ax * Math.cos(a)), r1(y0 + ay * Math.sin(a))];
  let beads = '';
  for (let i = 0; i < 30; i++) {
    const [x, y] = ex((i / 30) * Math.PI * 2, cx, top, rx - 7, ry - 4);
    beads += `M${r1(x + 3.4)} ${y}a3.4 3.2 0 1 0-6.8 0a3.4 3.2 0 1 0 6.8 0`;
  }
  let foot = '';
  for (let i = 1; i < 18; i++) {
    const [x, y] = ex(Math.PI - (i / 18) * Math.PI, cx, bot, rx, ry);
    foot += `M${r1(x + 3.6)} ${r1(y - 3)}a3.6 3.4 0 1 0-7.2 0a3.6 3.4 0 1 0 7.2 0`;
  }
  // piped swags round the side, each joint finished with a bead
  let swag = '', knots = '';
  const n = 10, sy = top + 24;
  for (let i = 0; i <= n; i++) {
    const [x, y] = ex(Math.PI - (i / n) * Math.PI, cx, sy, rx, ry);
    if (i) {
      const [px, py] = ex(Math.PI - ((i - 0.5) / n) * Math.PI, cx, sy, rx, ry);
      swag += `Q${px} ${r1(py + 30)} ${x} ${y}`;
    } else swag += `M${x} ${y}`;
    if (i && i < n) knots += `M${r1(x + 2.6)} ${y}a2.6 2.6 0 1 0-5.2 0a2.6 2.6 0 1 0 5.2 0`;
  }
  const hide = r1(by - bry * Math.sqrt(1 - (rx / bx) ** 2));
  // a butterfly: two rounded upper wings, two small lower wings, a body and curled antennae
  const fly = 'M0 0C3-9 11-17 20-16C27-15 27-6 21-2C15 2 6 2 0 0ZM0 0C-3-9-11-17-20-16C-27-15-27-6-21-2C-15 2-6 2 0 0ZM0 1C6 3 13 6 14 12C15 18 8 19 5 14C3 10 1 5 0 1ZM0 1C-6 3-13 6-14 12C-15 18-8 19-5 14C-3 10-1 5 0 1ZM0-6V10M0-6C-1-10-3-13-6-14M0-6C1-10 3-13 6-14';
  return `<svg class="ccta__svg" viewBox="0 0 400 330" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
        <defs><path id="ccta-fly" d="${fly}" vector-effect="non-scaling-stroke"/></defs>
        <path d="M${cx - bx} ${by}A${bx} ${bry} 0 0 0 ${cx + bx} ${by}M${cx - bx} ${by}v6A${bx} ${bry} 0 0 0 ${cx + bx} ${by + 6}v-6M${cx - bx} ${by}A${bx} ${bry} 0 0 1 ${cx - rx} ${hide}M${cx + bx} ${by}A${bx} ${bry} 0 0 0 ${cx + rx} ${hide}"/>
        <path d="M${cx - rx} ${top}V${bot}A${rx} ${ry} 0 0 0 ${cx + rx} ${bot}V${top}"/>
        <ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}"/>
        <path d="${swag}"/>
        <path d="${knots}"/>
        <path d="${beads}"/>
        <path d="${foot}"/>
        <use href="#ccta-fly" transform="translate(146 64) rotate(-16) scale(1.05)"/>
        <use href="#ccta-fly" transform="translate(236 40) rotate(9) scale(1.35)"/>
        <use href="#ccta-fly" transform="translate(312 84) rotate(22) scale(0.72)"/>
        <use href="#ccta-fly" transform="translate(182 128) rotate(-6) scale(0.62, 0.5)"/>
      </svg>`;
}

const almond = '<svg class="icon icon--line" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5c4.2 3.4 6.5 7.6 6.5 11.4a6.5 6.5 0 0 1-13 0C5.5 10.1 7.8 5.9 12 2.5Z"/><path d="M12 7.5c-1.2 2.6-1.4 6.6.4 10.5"/></svg>';

export default page({
  file: 'cakes.html',
  title: 'Birthday Cakes in Bibvewadi, Pune | Cako Cake',
  description: 'Chocolate truffle, black forest, rasmalai, red velvet and 18 more vegetarian cakes, in half kg and 1 kg. Pick one and order on WhatsApp from Cako, Pune.',
  ogTitle: 'Birthday Cakes in Bibvewadi, Pune',
  jsonld: part('jsonld.html'),
  bodyClass: 'page-cakes',
  body: `
  <section class="ihero case-hero" id="cakes-top" data-ground="night" aria-labelledby="cakes-title">
    <div class="ihero__glow case-hero__glow" aria-hidden="true"></div>
    <div class="wrap">
      <div class="case-hero__stand">
        <h1 class="display-l case-hero__title" id="cakes-title"><span class="nb">Twenty-two</span> cakes, one counter.</h1>
        <div class="case-hero__num" aria-hidden="true">22</div>
      </div>
      <div class="case-hero__copy">
        <p class="lede">Chocolate, fruit and cream, the classics, and two cakes made for big days. All vegetarian, in ½ kg and 1 kg.</p>
        <p class="small" data-assumed>Prices depend on the cake, the size and the design. WhatsApp us what you need and we’ll send you today’s price.</p>
      </div>
    </div>
  </section>

  <section class="case" id="grid" data-ground="night" aria-labelledby="grid-title">
    <div class="filterbar" id="filters" data-ground="night-2">
      <div class="wrap filterbar__in">
        <div class="filterbar__chips" role="group" aria-labelledby="filters-label">
          <span class="visually-hidden" id="filters-label">Filter cakes</span>
          ${FILTERS.map(([k, t, n, say], i) => `<button class="chip" type="button" data-filter="${k}" aria-pressed="${i === 0}" data-say="${say}">${t} <span class="chip__n">${n}</span></button>`).join('\n          ')}
        </div>
        <p class="visually-hidden" role="status" aria-live="polite" data-filter-status></p>
      </div>
    </div>
    <div class="wrap case__body">
      <h2 class="visually-hidden" id="grid-title">The cakes</h2>
      <ul class="shelves" role="list" data-shelves data-view="shelves">
        ${SHOWN.map(card).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="sstrip" id="sizes-strip" data-ground="paper" aria-labelledby="sizes-strip-title">
    <span class="sstrip__drip" aria-hidden="true"></span>
    <div class="wrap sstrip__in">
      <h2 class="visually-hidden" id="sizes-strip-title">Sizes and servings</h2>
      <p class="sstrip__line" data-assumed>
        <span class="sstrip__item"><b class="sstrip__kg">½ kg</b> serves about 4 to 6.</span>
        <span class="sstrip__item"><b class="sstrip__kg">1 kg</b><span class="visually-hidden">,</span> about 8 to 10.</span>
        <span class="sstrip__item"><b class="sstrip__kg">1.5 kg</b><span class="visually-hidden">,</span> about 12 to 15.</span>
        <span class="sstrip__item"><b class="sstrip__kg">2 kg</b><span class="visually-hidden">,</span> about 16 to 20.</span>
        <span class="sstrip__item sstrip__item--all">All approximate.</span>
      </p>
      <a class="link sstrip__link" href="index.html#sizes">Read the size guide</a>
    </div>
  </section>

  <section class="know" id="notes" data-ground="night-2" aria-labelledby="notes-title">
    <div class="wrap ip-grid">
      <h2 class="h2 know__title" id="notes-title">Good to know</h2>
      <ul class="know__list" role="list">
        <li>${icon('i-leaf')}<span>Everything at Cako is vegetarian.</span></li>
        <li data-assumed>${almond}<span>Several cakes have almonds or nut crunch. Tell us about any allergy when you order.</span></li>
        <li data-assumed>${icon('i-message-circle')}<span>For anything about ingredients, including egg, ask us on WhatsApp.</span></li>
        <li data-assumed>${icon('i-clock')}<span>Not every cake is on the counter every day. Ask us what’s ready today.</span></li>
      </ul>
    </div>
  </section>

  <div class="bunting" aria-hidden="true"></div>

  <section class="ccta" id="cakes-custom" data-ground="night" aria-labelledby="cakes-custom-title">
    <div class="ccta__party" aria-hidden="true">
      <span class="ccta__ribbon ccta__ribbon--left"><svg viewBox="0 0 120 320" focusable="false"><path class="rb-t1" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t1d" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t2" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-t2d" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-l1" d="M55 40C22 -2 2 32 14 56C24 72 46 58 55 40Z"/><path class="rb-l2" d="M55 40C88 -2 108 32 96 56C86 72 64 58 55 40Z"/><path class="rb-hi" d="M48 36C34 18 22 24 20 38"/><path class="rb-hi" d="M62 36C76 18 88 24 90 38"/><ellipse class="rb-k" cx="55" cy="44" rx="11" ry="10"/><path class="rb-hi" d="M50 40a6 5 0 0 1 8-1"/></svg></span>
      <span class="ccta__ribbon ccta__ribbon--right"><svg viewBox="0 0 120 320" focusable="false"><path class="rb-t1" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t1d" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t2" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-t2d" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-l1" d="M55 40C22 -2 2 32 14 56C24 72 46 58 55 40Z"/><path class="rb-l2" d="M55 40C88 -2 108 32 96 56C86 72 64 58 55 40Z"/><path class="rb-hi" d="M48 36C34 18 22 24 20 38"/><path class="rb-hi" d="M62 36C76 18 88 24 90 38"/><ellipse class="rb-k" cx="55" cy="44" rx="11" ry="10"/><path class="rb-hi" d="M50 40a6 5 0 0 1 8-1"/></svg></span>
    </div>
    <div class="ccta__strip" role="group" aria-label="Occasions we make cakes for">
      <div class="ccta__strip-track">${stripList(false)}${stripList(true)}</div>
    </div>
    <div class="wrap ip-grid ccta__grid">
      <div class="ccta__sketch">
        <span class="ccta__glow" aria-hidden="true"></span>
        ${sketch()}
      </div>
      <div class="ccta__copy" data-assumed>
        <h2 class="h2" id="cakes-custom-title">Don’t see your cake here?</h2>
        <p class="lede">Send us a photo of the cake you have in mind, with the date and the size. We’ll tell you what we can make.</p>
        <a class="btn btn--primary" href="${WA_CUSTOM}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>Ask about a custom cake</span></a>
      </div>
    </div>
  </section>`,
});
