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
      <div class="ccta__shelf"><svg viewBox="0 0 1200 92" focusable="false"><g fill="none" stroke="#F2C27A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M24 70H1176" stroke-width="2.4"/><path d="M24 70q-14 0-14-12M1176 70q14 0 14-12" stroke-width="2"/><g fill="#F2C27A" stroke="none" fill-opacity=".8"><circle cx="40" cy="78" r="1.7"/><circle cx="54" cy="78" r="1.7"/><circle cx="68" cy="78" r="1.7"/><circle cx="82" cy="78" r="1.7"/><circle cx="96" cy="78" r="1.7"/><circle cx="110" cy="78" r="1.7"/><circle cx="124" cy="78" r="1.7"/><circle cx="138" cy="78" r="1.7"/><circle cx="152" cy="78" r="1.7"/><circle cx="166" cy="78" r="1.7"/><circle cx="180" cy="78" r="1.7"/><circle cx="194" cy="78" r="1.7"/><circle cx="208" cy="78" r="1.7"/><circle cx="222" cy="78" r="1.7"/><circle cx="236" cy="78" r="1.7"/><circle cx="250" cy="78" r="1.7"/><circle cx="264" cy="78" r="1.7"/><circle cx="278" cy="78" r="1.7"/><circle cx="292" cy="78" r="1.7"/><circle cx="306" cy="78" r="1.7"/><circle cx="320" cy="78" r="1.7"/><circle cx="334" cy="78" r="1.7"/><circle cx="348" cy="78" r="1.7"/><circle cx="362" cy="78" r="1.7"/><circle cx="376" cy="78" r="1.7"/><circle cx="390" cy="78" r="1.7"/><circle cx="404" cy="78" r="1.7"/><circle cx="418" cy="78" r="1.7"/><circle cx="432" cy="78" r="1.7"/><circle cx="446" cy="78" r="1.7"/><circle cx="460" cy="78" r="1.7"/><circle cx="474" cy="78" r="1.7"/><circle cx="488" cy="78" r="1.7"/><circle cx="502" cy="78" r="1.7"/><circle cx="516" cy="78" r="1.7"/><circle cx="530" cy="78" r="1.7"/><circle cx="544" cy="78" r="1.7"/><circle cx="558" cy="78" r="1.7"/><circle cx="572" cy="78" r="1.7"/><circle cx="586" cy="78" r="1.7"/><circle cx="600" cy="78" r="1.7"/><circle cx="614" cy="78" r="1.7"/><circle cx="628" cy="78" r="1.7"/><circle cx="642" cy="78" r="1.7"/><circle cx="656" cy="78" r="1.7"/><circle cx="670" cy="78" r="1.7"/><circle cx="684" cy="78" r="1.7"/><circle cx="698" cy="78" r="1.7"/><circle cx="712" cy="78" r="1.7"/><circle cx="726" cy="78" r="1.7"/><circle cx="740" cy="78" r="1.7"/><circle cx="754" cy="78" r="1.7"/><circle cx="768" cy="78" r="1.7"/><circle cx="782" cy="78" r="1.7"/><circle cx="796" cy="78" r="1.7"/><circle cx="810" cy="78" r="1.7"/><circle cx="824" cy="78" r="1.7"/><circle cx="838" cy="78" r="1.7"/><circle cx="852" cy="78" r="1.7"/><circle cx="866" cy="78" r="1.7"/><circle cx="880" cy="78" r="1.7"/><circle cx="894" cy="78" r="1.7"/><circle cx="908" cy="78" r="1.7"/><circle cx="922" cy="78" r="1.7"/><circle cx="936" cy="78" r="1.7"/><circle cx="950" cy="78" r="1.7"/><circle cx="964" cy="78" r="1.7"/><circle cx="978" cy="78" r="1.7"/><circle cx="992" cy="78" r="1.7"/><circle cx="1006" cy="78" r="1.7"/><circle cx="1020" cy="78" r="1.7"/><circle cx="1034" cy="78" r="1.7"/><circle cx="1048" cy="78" r="1.7"/><circle cx="1062" cy="78" r="1.7"/><circle cx="1076" cy="78" r="1.7"/><circle cx="1090" cy="78" r="1.7"/><circle cx="1104" cy="78" r="1.7"/><circle cx="1118" cy="78" r="1.7"/><circle cx="1132" cy="78" r="1.7"/><circle cx="1146" cy="78" r="1.7"/><circle cx="1160" cy="78" r="1.7"/></g><g transform="translate(110 0)"><path d="M-15 70L-19 46H19L15 70Z" fill="rgba(242,194,122,.08)"/><path d="M-8 46L-6 70M0 46V70M8 46L6 70"/><path d="M-22 46C-26 34-14 30-12 24C-10 14 10 14 12 24C14 30 26 34 22 46Z" fill="rgba(242,194,122,.08)"/><circle cx="0" cy="15" r="4.5" fill="rgba(255,140,170,.55)"/><path d="M0 11q2-6 6-7"/></g><g transform="translate(235 0)"><path d="M-20 47C-20 31 20 31 20 47Z" fill="rgba(242,194,122,.08)"/><circle cx="-8" cy="41" r="1.1"/><circle cx="0" cy="38" r="1.1"/><circle cx="8" cy="41" r="1.1"/><path d="M-22 53q5.5-6 11 0t11 0 11 0 11 0"/><path d="M-20 57C-20 73 20 73 20 57Z" fill="rgba(242,194,122,.08)"/></g><g transform="translate(360 0)"><path d="M-26 70H26V50L-26 38Z" fill="rgba(242,194,122,.08)"/><path d="M-26 62H26M-26 54.5H26"/><path d="M-26 38L26 50"/><circle cx="-14" cy="34" r="4.2" fill="rgba(255,140,170,.55)"/><path d="M-14 30q2-5 6-6"/><circle cx="6" cy="49" r="1.1"/><circle cx="14" cy="52" r="1.1"/></g><g transform="translate(485 0)"><path d="M0 70V39"/><circle cx="0" cy="26" r="13" fill="rgba(242,194,122,.08)"/><path d="M-12 22q6 6 12 0t12 0"/><circle cx="-4" cy="30" r="1"/><circle cx="5" cy="31" r="1"/><circle cx="0" cy="16" r="1"/><path d="M0 56l-7-4v9zM0 56l7-4v9z"/></g><g transform="translate(600 0)"><path d="M-46 70H46"/><rect x="-38" y="56" width="76" height="14" rx="3" fill="rgba(242,194,122,.08)"/><rect x="-26" y="42" width="52" height="14" rx="3" fill="rgba(242,194,122,.08)"/><rect x="-15" y="29" width="30" height="13" rx="3" fill="rgba(242,194,122,.08)"/><path d="M-38 56q6.33 8 12.67 0t12.66 0 12.67 0 12.67 0 12.67 0 12.67 0"/><path d="M-26 42q6.5 7 13 0t13 0 13 0 13 0"/><path d="M-14 29q3.75 5 7.5 0t7.5 0 7.5 0 7.5 0"/><rect x="-2" y="14" width="4" height="15" rx="1.5"/><path d="M0 4q4 5 0 9q-4-4 0-9Z" fill="rgba(255,214,140,.7)"/><circle cx="-30" cy="64" r="1.2"/><circle cx="-18" cy="64" r="1.2"/><circle cx="-6" cy="64" r="1.2"/><circle cx="6" cy="64" r="1.2"/><circle cx="18" cy="64" r="1.2"/><circle cx="30" cy="64" r="1.2"/></g><g transform="translate(715 0) scale(-1 1)"><path d="M0 70V39"/><circle cx="0" cy="26" r="13" fill="rgba(242,194,122,.08)"/><path d="M-12 22q6 6 12 0t12 0"/><circle cx="-4" cy="30" r="1"/><circle cx="5" cy="31" r="1"/><circle cx="0" cy="16" r="1"/><path d="M0 56l-7-4v9zM0 56l7-4v9z"/></g><g transform="translate(840 0) scale(-1 1)"><path d="M-26 70H26V50L-26 38Z" fill="rgba(242,194,122,.08)"/><path d="M-26 62H26M-26 54.5H26"/><path d="M-26 38L26 50"/><circle cx="-14" cy="34" r="4.2" fill="rgba(255,140,170,.55)"/><path d="M-14 30q2-5 6-6"/><circle cx="6" cy="49" r="1.1"/><circle cx="14" cy="52" r="1.1"/></g><g transform="translate(965 0) scale(-1 1)"><path d="M-20 47C-20 31 20 31 20 47Z" fill="rgba(242,194,122,.08)"/><circle cx="-8" cy="41" r="1.1"/><circle cx="0" cy="38" r="1.1"/><circle cx="8" cy="41" r="1.1"/><path d="M-22 53q5.5-6 11 0t11 0 11 0 11 0"/><path d="M-20 57C-20 73 20 73 20 57Z" fill="rgba(242,194,122,.08)"/></g><g transform="translate(1090 0) scale(-1 1)"><path d="M-15 70L-19 46H19L15 70Z" fill="rgba(242,194,122,.08)"/><path d="M-8 46L-6 70M0 46V70M8 46L6 70"/><path d="M-22 46C-26 34-14 30-12 24C-10 14 10 14 12 24C14 30 26 34 22 46Z" fill="rgba(242,194,122,.08)"/><circle cx="0" cy="15" r="4.5" fill="rgba(255,140,170,.55)"/><path d="M0 11q2-6 6-7"/></g><path class="tw" style="animation-delay:0s" transform="translate(172 34) scale(0.8)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:1.1s" transform="translate(298 26) scale(0.6)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:0.5s" transform="translate(422 36) scale(0.7)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:1.7s" transform="translate(540 22) scale(0.6)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:0.9s" transform="translate(660 22) scale(0.6)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:2.1s" transform="translate(778 36) scale(0.7)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:0.3s" transform="translate(902 26) scale(0.6)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:1.4s" transform="translate(1028 34) scale(0.8)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:0.7s" transform="translate(60 52) scale(0.55)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/><path class="tw" style="animation-delay:1.9s" transform="translate(1140 52) scale(0.55)" d="M0-8L2-2L8 0L2 2L0 8L-2 2L-8 0L-2-2Z" fill="#FFE2A8" stroke="none"/></g></svg></div>
      <span class="ccta__ribbon ccta__ribbon--left"><svg viewBox="0 0 120 320" focusable="false"><path class="rb-t1" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t1d" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t2" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-t2d" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-l1" d="M55 40C22 -2 2 32 14 56C24 72 46 58 55 40Z"/><path class="rb-l2" d="M55 40C88 -2 108 32 96 56C86 72 64 58 55 40Z"/><path class="rb-hi" d="M48 36C34 18 22 24 20 38"/><path class="rb-hi" d="M62 36C76 18 88 24 90 38"/><ellipse class="rb-k" cx="55" cy="44" rx="11" ry="10"/><path class="rb-hi" d="M50 40a6 5 0 0 1 8-1"/></svg></span>
      <span class="ccta__ribbon ccta__ribbon--right"><svg viewBox="0 0 120 320" focusable="false"><path class="rb-t1" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t1d" d="M46 46C16 100 76 146 42 206S54 270 34 306"/><path class="rb-t2" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-t2d" d="M64 46C98 96 52 146 88 204S72 262 94 298"/><path class="rb-l1" d="M55 40C22 -2 2 32 14 56C24 72 46 58 55 40Z"/><path class="rb-l2" d="M55 40C88 -2 108 32 96 56C86 72 64 58 55 40Z"/><path class="rb-hi" d="M48 36C34 18 22 24 20 38"/><path class="rb-hi" d="M62 36C76 18 88 24 90 38"/><ellipse class="rb-k" cx="55" cy="44" rx="11" ry="10"/><path class="rb-hi" d="M50 40a6 5 0 0 1 8-1"/></svg></span>
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
