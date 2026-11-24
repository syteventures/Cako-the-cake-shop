// Cakes page (brief section 10, "the night display case"). Copy: _workfiles/content.md "CAKES", word for word.
// Styles: assets/css/src/20-pages.css (case-hero, filterbar, shelves, dcake, sstrip, know, ccta).
// Behaviour: assets/js/site.js (filter chips + hash, live region, Shelves / Price list view, hand-written FLIP).
import { CAKES, FEATURED, bySlug, icon, part } from './data.mjs';
import { ALT, CAT_NAMES, catCount, inr, WA_CUSTOM } from './content.mjs';
import { page } from './shell.mjs';

const r1 = (v) => Math.round(v * 10) / 10;
const fav = new Set(FEATURED);
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

  <section class="ccta" id="cakes-custom" data-ground="night" aria-labelledby="cakes-custom-title">
    <div class="ccta__party" aria-hidden="true">
      <span class="ccta__garland ccta__garland--left">
        <svg viewBox="0 0 120 520" preserveAspectRatio="none" focusable="false">
          <defs><linearGradient id="garland-left" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#a83b60"/><stop offset=".5" stop-color="#f6b5c8"/><stop offset="1" stop-color="#c45b7d"/></linearGradient></defs>
          <path d="M18 0 C18 38 102 44 102 88 C102 132 18 138 18 182 C18 226 102 232 102 276 C102 320 18 326 18 370 C18 414 102 420 102 464 C102 486 72 500 60 520" fill="none" stroke="#ffe7ef" stroke-opacity=".7" stroke-width="2.5"/>
          <path d="M18 0 C18 38 102 44 102 88 C102 132 18 138 18 182 C18 226 102 232 102 276 C102 320 18 326 18 370 C18 414 102 420 102 464 C102 486 72 500 60 520 L42 520 C54 500 84 486 84 464 C84 420 0 414 0 370 C0 326 84 320 84 276 C84 232 0 226 0 182 C0 138 84 132 84 88 C84 44 0 38 0 0Z" fill="url(#garland-left)" opacity=".96"/>
          <path d="M12 0 C12 38 96 44 96 88 C96 132 12 138 12 182 C12 226 96 232 96 276 C96 320 12 326 12 370 C12 414 96 420 96 464" fill="none" stroke="#fff0f5" stroke-opacity=".72" stroke-width="3"/>
        </svg>
      </span>
      <span class="ccta__garland ccta__garland--right">
        <svg viewBox="0 0 120 520" preserveAspectRatio="none" focusable="false">
          <defs><linearGradient id="garland-right" x1="0" y1="0" x2="1" y2="0"><stop stop-color="#c45b7d"/><stop offset=".5" stop-color="#f6b5c8"/><stop offset="1" stop-color="#a83b60"/></linearGradient></defs>
          <path d="M18 0 C18 38 102 44 102 88 C102 132 18 138 18 182 C18 226 102 232 102 276 C102 320 18 326 18 370 C18 414 102 420 102 464 C102 486 72 500 60 520" fill="none" stroke="#ffe7ef" stroke-opacity=".7" stroke-width="2.5"/>
          <path d="M18 0 C18 38 102 44 102 88 C102 132 18 138 18 182 C18 226 102 232 102 276 C102 320 18 326 18 370 C18 414 102 420 102 464 C102 486 72 500 60 520 L42 520 C54 500 84 486 84 464 C84 420 0 414 0 370 C0 326 84 320 84 276 C84 232 0 226 0 182 C0 138 84 132 84 88 C84 44 0 38 0 0Z" fill="url(#garland-right)" opacity=".96"/>
          <path d="M12 0 C12 38 96 44 96 88 C96 132 12 138 12 182 C12 226 96 232 96 276 C96 320 12 326 12 370 C12 414 96 420 96 464" fill="none" stroke="#fff0f5" stroke-opacity=".72" stroke-width="3"/>
        </svg>
      </span>
      <span class="ccta__doodle ccta__doodle--cake"><svg viewBox="0 0 100 100"><path d="M15 48h70v38H15z" fill="#ff8fb0" stroke="#fff0d8" stroke-width="3"/><path d="M15 58q12-12 24 0t24 0t22 0" fill="none" stroke="#fff8f0" stroke-width="5"/><path d="M25 48q0-19 15-19t15 19q0-17 14-17t16 17" fill="#f6c6d3" stroke="#fff0d8" stroke-width="3"/><path d="M50 29V12" stroke="#fff8f0" stroke-width="4"/><path d="M50 7q10 10 0 16q-10-6 0-16" fill="#ffc65c"/></svg></span>
      <span class="ccta__doodle ccta__doodle--slice"><svg viewBox="0 0 100 100"><path d="M12 65L50 20l38 45z" fill="#f2c27a" stroke="#fff0d8" stroke-width="3"/><path d="M20 64h66v14H20z" fill="#f28ca8" stroke="#fff0d8" stroke-width="3"/><path d="M34 45q16-13 30 0" fill="none" stroke="#fff8f0" stroke-width="5"/><circle cx="52" cy="32" r="6" fill="#c8161d"/></svg></span>
      <span class="ccta__doodle ccta__doodle--star"><svg viewBox="0 0 100 100"><path d="M50 5l11 31 32 1-25 20 9 31-27-18-27 18 9-31L7 37l32-1z" fill="#ffd166" stroke="#fff0d8" stroke-width="3"/></svg></span>
      <span class="ccta__doodle ccta__doodle--heart"><svg viewBox="0 0 100 100"><path d="M50 86C8 57 13 20 36 20c8 0 14 6 14 14 0-8 6-14 14-14 23 0 28 37-14 66Z" fill="#ff7198" stroke="#fff0d8" stroke-width="3"/></svg></span>
      <span class="ccta__doodle ccta__doodle--candle"><svg viewBox="0 0 100 100"><rect x="40" y="35" width="20" height="53" rx="4" fill="#8fd3ff" stroke="#fff0d8" stroke-width="3"/><path d="M40 51h20M40 68h20" stroke="#fff8f0" stroke-width="4"/><path d="M50 5q18 19 0 29Q32 24 50 5Z" fill="#ffb547" stroke="#fff0d8" stroke-width="2"/></svg></span>
      <span class="ccta__doodle ccta__doodle--sprinkles"><svg viewBox="0 0 100 100"><path d="M15 20l14 8M56 12l-4 16M77 42l13-6M22 66l-8 13M58 66l12 10M78 85l8-5" stroke="#ff8fb0" stroke-width="7" stroke-linecap="round"/><circle cx="42" cy="48" r="5" fill="#ffd166"/><circle cx="88" cy="18" r="4" fill="#8fd3ff"/></svg></span>
      <span class="ccta__doodle ccta__doodle--balloon"><svg viewBox="0 0 100 100"><ellipse cx="50" cy="38" rx="25" ry="32" fill="#8fd3ff" stroke="#fff0d8" stroke-width="3"/><path d="M44 69l6 8 6-8M50 77q-12 10 0 20" fill="none" stroke="#fff0d8" stroke-width="2.5" stroke-linecap="round"/></svg></span>
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
