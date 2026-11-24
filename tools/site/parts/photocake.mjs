/* Cako parts: the revolving photo cake, the home hero's centrepiece.
 *
 *   photoCake(slugs, opts)  ->  HTML string for <div class="pcake" data-photocake>
 *
 * The page also needs:
 *   assets/css/parts/photocake.css   (add 'photocake' to PARTS in tools/build-pages.mjs)
 *   assets/js/parts/photocake.js     (defer; the shell already loads it for parts: ['photocake'])
 * and an `overflow-x: clip` section around it (the hero has one): the load burst flies panels outside the box.
 *
 * What it is: three tiers (12 / 10 / 8 panels; 10 / 8 / 6 when the box is under 460 px wide) whose sides are made of
 * the shop's cutout photos on ivory fondant, gold seams and piped beads, standing on a gold cake stand with "1" "2"
 * candles. The layout is pure CSS 3D computed from custom properties, so it renders without JS.
 *
 * Size: the box is as wide as its container (it is an inline-size container, so the container must give it a width:
 * 560 px desktop, 340 to 420 px phone) and 0.96 of that tall. The stand's foot sits on the bottom edge, so
 * `align-items: end` stands it on a counter line; the contact shadow spills a little below, on purpose.
 * Ground: made for night. On a light ground set --contact: var(--contact-paper) on the section.
 * The page draws the light pool and the hint (the hero has both); the cake adds .is-out while the candles are out, so a
 * pool can dim with them: .hero__stage:has(.pcake.is-out)::before { opacity: .3 }.
 *
 * Accessibility: the cake is decoration and is aria-hidden as a whole (30 photo panels would be 30 stops for a screen
 * reader). Put it inside a role="img" wrapper with one sentence (home.mjs does), keep the cake links in the page, and let
 * the "Facing you" link (home.js, fed by the cako:facing event) be the one accessible way to the cake in front.
 * The visible hint ("Drag to turn" in home.mjs) is aria-hidden too: it only describes a pointer gesture.
 *
 * Panels take the slugs in order: bottom tier first, then middle, then top; the list repeats when it runs out.
 * "red-velvet-heart-2" is the second heart photo; it links and is named as "red-velvet-heart".
 *
 * @param {string[]} [slugs]   cake slugs (default: the home page order)
 * @param {object}   [o]
 * @param {string}   [o.base='assets/img/cut/']  image folder (relative to the page)
 * @param {string}   [o.now]         tests only: pin the candles' Pune time, e.g. '21:30' (out from 00:00 to 10:59)
 * @param {boolean}  [o.compare=false] demo only: also write each cake's colour for the rejected 'print' panels
 *                                    (photocake.html styles .pcake--print; the site stylesheet does not)
 */

const NAMES = {
  'red-velvet-heart': 'Red velvet heart', 'chocolate-truffle': 'Chocolate truffle', 'black-forest': 'Black forest',
  rasmalai: 'Rasmalai', pineapple: 'Pineapple', butterscotch: 'Butterscotch', 'black-and-white-drip': 'Black & white drip',
  'strawberry-butterfly': 'Butterfly celebration', 'choco-zebra': 'Choco zebra', 'dark-chocolate-flake': 'Dark chocolate flake',
  'choco-vanilla': 'Choco vanilla', 'choco-nut-crunch': 'Choco nut crunch', mango: 'Mango', 'mango-swirl': 'Mango swirl',
  'strawberry-rose': 'Strawberry rose', 'strawberry-cream': 'Strawberry cream', 'fruit-and-nut': 'Fruit & nut',
  'white-forest': 'White forest', 'vanilla-swirl': 'Vanilla swirl', 'vanilla-sprinkle': 'Vanilla sprinkle',
  'caramel-nut': 'Caramel nut', 'almond-white-chocolate': 'Almond white chocolate',
};

/* the cake's own top colour (assets/img/cut/manifest.json "cakeColor"): the ground of the 'print' variant */
const COLORS = {
  'chocolate-truffle': '#1e1f20', 'choco-zebra': '#151513', 'black-forest': '#1d1a1a', 'dark-chocolate-flake': '#141215',
  'choco-vanilla': '#e4e1d5', 'black-and-white-drip': '#e0dbc6', pineapple: '#f6e302', butterscotch: '#eebf81',
  'vanilla-sprinkle': '#e9e2ce', 'almond-white-chocolate': '#e9e2d1', 'red-velvet-heart': '#e80205',
  'strawberry-butterfly': '#fd535f', 'choco-nut-crunch': '#201819', 'caramel-nut': '#f4b953', mango: '#ffd750',
  rasmalai: '#ffcd03', 'fruit-and-nut': '#fbe1b5', 'mango-swirl': '#efc902', 'strawberry-rose': '#f6d8cc',
  'strawberry-cream': '#fec995', 'vanilla-swirl': '#fae7c0', 'red-velvet-heart-2': '#fe0108', 'white-forest': '#eae7da',
};

export const PHOTOCAKE_DEFAULT = ['chocolate-truffle', 'red-velvet-heart', 'black-forest', 'rasmalai', 'pineapple', 'butterscotch',
  'black-and-white-drip', 'strawberry-butterfly', 'choco-zebra', 'mango-swirl', 'white-forest', 'strawberry-rose', 'choco-vanilla',
  'caramel-nut', 'almond-white-chocolate', 'vanilla-sprinkle', 'dark-chocolate-flake', 'fruit-and-nut', 'mango', 'choco-nut-crunch',
  'vanilla-swirl', 'strawberry-cream', 'red-velvet-heart-2'];

/* panels per tier: [desktop, phone]. 30 / 24 in all (brief: at most 30 desktop, 24 phone) */
const TIERS = [[12, 10], [10, 8], [8, 6]];
const SLEEVE = `<b class="pcake__sl">${'<i></i>'.repeat(5)}</b>`;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
let seq = 0;

export function photoCake(slugs, o = {}) {
  const list = (slugs && slugs.length ? slugs : PHOTOCAKE_DEFAULT).filter((s) => NAMES[s.replace(/-2$/, '')] && COLORS[s]);
  if (!list.length) return '';
  const base = o.base ?? 'assets/img/cut/';
  const g = `pcg${(++seq).toString(36)}`;
  let k = 0;
  const tiers = TIERS.map(([n, sm], t) => {
    let panels = '';
    for (let i = 0; i < n; i++) {
      const s = list[k++ % list.length];
      const id = s.replace(/-2$/, '');
      // only the bottom tier says which cake it is: it drives "Facing you"
      const data = t === 0 ? ` data-slug="${id}" data-name="${esc(NAMES[id])}"` : '';
      // panels that start on the far side load after the ones you see first; desktop-only panels are display:none on
      // phones, and loading="lazy" keeps their photos from downloading there
      const back = (Math.cos((2 * Math.PI * i) / n) < -0.1 ? ' fetchpriority="low"' : '') + (i >= sm ? ' loading="lazy"' : '');
      panels += `<i class="pcake__p${i >= sm ? ' pcake__p--lg' : ''}" style="--i:${i}${o.compare ? `;--c:${COLORS[s]}` : ''}"${data}>` +
        `<img src="${esc(base)}${s}-240.webp" alt="" width="240" height="240" decoding="async"${back}></i>`;
    }
    const candles = t === 2
      ? '<b class="pcake__candles"><b class="pcake__c">1<i></i></b><b class="pcake__c">2<i></i></b></b>' : '';
    return `<div class="pcake__tier pcake__t${t + 1}" style="--nl:${n};--ns:${sm}"><div class="pcake__turn"><div class="pcake__spin">${panels}</div></div>` +
      `<i class="pcake__top"></i>${SLEEVE}${candles}</div>`;
  }).join('');

  // the stand: plate (top + rim), a lathe-like stem drawn once (it never turns), foot and the contact shadow
  const stem = `<svg viewBox="0 0 100 40" width="100%" height="100%" preserveAspectRatio="none" focusable="false" style="display:block"><defs><linearGradient id="${g}" x1="0" x2="1">` +
    '<stop offset="0" stop-color="#5e4220"/><stop offset=".3" stop-color="#e9cf98"/><stop offset=".42" stop-color="#b38a4c"/>' +
    '<stop offset=".7" stop-color="#7a5829"/><stop offset="1" stop-color="#3f2a12"/></linearGradient></defs>' +
    `<path fill="url(#${g})" d="M36 0h28c-3 4-6 6-7 9 0 3 3 4 3 7s-3 4-3 8c0 6 9 12 24 16H19c15-4 24-10 24-16 0-4-3-5-3-8s3-4 3-7c-1-3-4-5-7-9z"/></svg>`;
  const stand = `<div class="pcake__stand"><i class="pcake__shadow"></i><i class="pcake__foot"></i><b class="pcake__stem">${stem}</b>` +
    '<i class="pcake__rim"></i><i class="pcake__plate"></i></div>';

  const now = o.now ? ` data-now="${esc(o.now)}"` : '';
  return `<div class="pcake" data-photocake${now} aria-hidden="true"><div class="pcake__scene"><div class="pcake__cam">` +
    `${stand}${tiers}</div></div></div>`;
}

export default photoCake;
