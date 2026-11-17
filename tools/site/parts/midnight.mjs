/* Copied from _workfiles/demos/midnight.snippet.mjs (component build), with the copy deck wording for the steps.
 * Cako parts: markup for three signature components.
 *
 *   midnightClock()  "How a midnight cake works": analog clock 9 pm -> 12 + three steps   [data-midnight-clock]
 *   hoursDial()      live 24-hour opening-hours dial (Visit page, home teaser)              [data-hours-dial]
 *   sizeGuide()      size and servings guide: segmented control + top-view cake drawing    [data-size-guide]
 *
 * Each function returns an HTML string. The page also needs:
 *   <link rel="stylesheet" href="assets/css/parts/midnight.css">
 *   <script src="assets/js/parts/midnight.js" defer></script>   (after gsap / ScrollTrigger if they are loaded)
 * The script initialises itself on DOMContentLoaded; call window.CakoParts.midnight.init(root) for markup added later.
 *
 * Placement notes for the page layout:
 *   midnightClock()  a full-bleed <section> with its own night ground and padding. On desktop (>= 960 x 620) it pins
 *                    for 130% of a screen while the hands sweep; give it no transform/overflow-clipping ancestors.
 *   hoursDial()      sizes itself like an image: --hd-size wide (420px; 280px for size 'sm'), shrinking with its column.
 *                    Override with e.g. .visit .hdial { --hd-size: 480px }.
 *   sizeGuide()      a block that fills its column; it switches to two columns when that column is 700px or wider.
 * Tests and demos only: <figure data-hours-dial data-now="21:30"> pins the dial to a Pune time.
 *
 * Facts used: open every day 11 am to 12 midnight; phone and WhatsApp +91 84469 66779; home delivery, takeaway.
 * Sizes and servings are labelled approximate on the page.
 */

const WA_NUMBER = '918446966779';
const TEL = '+918446966779';
const TEL_TEXT = '+91 84469 66779';

let seq = 0;
const uid = (p) => `${p}${(++seq).toString(36)}`;
const r2 = (v) => Math.round(v * 100) / 100;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const wa = (text) => `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
const hTag = (level) => `h${Math.min(6, Math.max(2, level | 0 || 2))}`;

/** Point on a circle. deg 0 = 12 o'clock, clockwise. */
function pt(cx, cy, r, deg) {
  const a = ((deg - 90) * Math.PI) / 180;
  return [r2(cx + r * Math.cos(a)), r2(cy + r * Math.sin(a))];
}
/** Radial segment from r1 to r2 at an angle, as path data. */
function seg(cx, cy, ra, rb, deg) {
  const [x1, y1] = pt(cx, cy, ra, deg);
  const [x2, y2] = pt(cx, cy, rb, deg);
  return `M${x1} ${y1}L${x2} ${y2}`;
}
/** Clockwise arc between two angles, as path data. */
function arc(cx, cy, r, d0, d1) {
  const [x0, y0] = pt(cx, cy, r, d0);
  const [x1, y1] = pt(cx, cy, r, d1);
  return `M${x0} ${y0}A${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
}

/* ================================================================== 1. midnight clock + steps */

/**
 * @param {object} [o]
 * @param {string} [o.id='midnight']  section id
 * @param {number} [o.level=2]        heading level of the section title (step titles use level + 1)
 * @param {string} [o.heading]
 * @param {string} [o.lede]
 */
export function midnightClock(o = {}) {
  const id = o.id || 'midnight';
  const level = o.level || 2;
  const heading = o.heading || 'How a midnight cake works';
  const lede = o.lede || 'Open every day till 12 midnight. Here is how to get a cake for a birthday that starts at 12.';
  const g = uid('mc');
  const H = hTag(level);
  const H3 = hTag(level + 1);
  const C = 200;

  // the dial: 60 minute ticks, 12 hour ticks; the evening quarter (9 to 12) is picked out in gold
  let minor = '';
  let eve = '';
  let hours = '';
  for (let i = 0; i < 60; i++) {
    const deg = i * 6;
    if (i % 5 === 0) hours += seg(C, C, 181, 164, deg);
    else if (i > 45) eve += seg(C, C, 181, 172, deg);
    else minor += seg(C, C, 181, 174, deg);
  }
  const sweep = arc(C, C, 189, 270, 360);

  const face = `<svg class="mclock__face" viewBox="0 0 400 400" focusable="false">
          <defs>
            <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1">
              <stop class="mclock__gold-hi" offset="0"/><stop class="mclock__gold-lo" offset=".5"/><stop class="mclock__gold-hi" offset="1"/>
            </linearGradient>
          </defs>
          <circle class="mclock__bezel" cx="200" cy="200" r="197" stroke="url(#${g}b)"/>
          <circle class="mclock__chapter" cx="200" cy="200" r="189"/>
          <path class="mclock__ticks" d="${minor}"/>
          <path class="mclock__ticks mclock__ticks--eve" d="${eve}"/>
          <path class="mclock__ticks mclock__ticks--hour" d="${hours}"/>
          <path class="mclock__lit" data-lit="1" d="${seg(C, C, 182, 156, 300)}"/>
          <path class="mclock__lit" data-lit="2" d="${seg(C, C, 182, 156, 330)}"/>
        </svg>`;

  const hand = (cls, tip, ctl, base, tail) => `<div class="mclock__hand mclock__hand--${cls}"><svg viewBox="0 0 400 400" focusable="false">
          <path class="mclock__tail" d="M200 194V${tail}"/>
          <path class="mclock__leaf-a" d="M200 ${tip}Q${200 - ctl} ${r2((tip + 200) / 2 + 12)} ${200 - base} 200H200Z"/>
          <path class="mclock__leaf-b" d="M200 ${tip}Q${200 + ctl} ${r2((tip + 200) / 2 + 12)} ${200 + base} 200H200Z"/>
        </svg></div>`;

  const steps = [
    {
      w: '9:00 pm', t: 'Send the order',
      p: 'Cake, size and the name for the top, on WhatsApp. The earlier you send it, the calmer the night.',
    },
    { w: '10:30 pm', t: 'We confirm', p: 'We reply with the price and the time your cake will be ready.' },
    { w: '11:30 pm', t: 'Collect it', p: 'Pick it up from the counter on Upper Kondhwa Road before 12. For delivery, ask us on WhatsApp first.' },
    { w: '12:00', t: 'Candles', p: 'Lights off. Make a wish.' },
  ];

  return `<section class="mclock is-midnight" id="${esc(id)}" data-midnight-clock aria-labelledby="${g}h">
  <div class="mclock__in">
    <div class="mclock__head">
      <${H} class="mclock__h" id="${g}h">${esc(heading)}</${H}>
      <p class="mclock__lede">${esc(lede)}</p>
    </div>
    <div class="mclock__clock" aria-hidden="true">
      <div class="mclock__dial">
        <div class="mclock__plate"></div>
        ${face}
        <svg class="mclock__sweep" viewBox="0 0 400 400" focusable="false"><path class="mclock__sweep-arc" pathLength="1" d="${sweep}"/></svg>
        <div class="mclock__nums">
          <span class="mclock__num mclock__num--12"><span>1</span><span>2</span></span><span class="mclock__num mclock__num--3">3</span><span class="mclock__num mclock__num--6">6</span><span class="mclock__num mclock__num--9">9</span>
          <span class="mclock__word">Cako</span>
        </div>
        ${hand('h', 98, 15, 3, 222)}
        ${hand('m', 30, 10, 2.2, 232)}
        <svg class="mclock__cap" viewBox="0 0 400 400" focusable="false"><circle class="mclock__cap-o" cx="200" cy="200" r="10"/><circle class="mclock__cap-i" cx="200" cy="200" r="3.4"/></svg>
        <div class="mclock__candle">
          <span class="mclock__halo"></span>
          <svg class="mclock__stick" viewBox="0 0 40 100" focusable="false">
            <defs><clipPath id="${g}c"><rect x="14" y="46" width="12" height="56" rx="2.5"/></clipPath></defs>
            <rect class="mclock__wax" x="14" y="46" width="12" height="56" rx="2.5"/>
            <g class="mclock__stripes" clip-path="url(#${g}c)"><path d="M10 60L30 46V52L10 66ZM10 76L30 62V68L10 82ZM10 92L30 78V84L10 98Z"/></g>
            <path class="mclock__wick" d="M20 46.5C20 43.5 21.2 41.5 20.4 38.5"/>
          </svg>
          <span class="mclock__smoke"><svg viewBox="0 0 20 40" focusable="false"><path d="M10 39C6 33 14 29 10 23S6 13 11 7"/></svg></span>
          <span class="mclock__flame"><svg viewBox="0 0 40 48" focusable="false">
            <defs><radialGradient id="${g}f" cx="50%" cy="78%" r="70%"><stop offset="0" stop-color="#fffdf6"/><stop offset=".42" stop-color="#ffe6a3"/><stop offset=".78" stop-color="#ffae4a"/><stop offset="1" stop-color="#ef7426"/></radialGradient></defs>
            <path fill="url(#${g}f)" d="M20 2C25.5 13 30 21 28 30C26.6 37 23.4 41 20 41C16.6 41 13.4 37 12 30C10 21 14.5 13 20 2Z"/>
            <ellipse cx="20" cy="31.5" rx="3.6" ry="7" fill="#fffef9" opacity=".9"/>
            <ellipse cx="20" cy="39" rx="3.2" ry="1.7" fill="#9bb8ff" opacity=".55"/>
          </svg></span>
        </div>
      </div>
      <p class="mclock__time"><span class="mclock__hm">12:00</span> <span class="mclock__ap">midnight</span></p>
    </div>
    <ol class="mclock__steps">
${steps
  .map(
    (s, i) => `      <li class="mclock__step is-lit">
        <span class="mclock__mark" aria-hidden="true"><span>${i + 1}</span></span>
        <div class="mclock__copy">
          <p class="mclock__when">${esc(s.w)}</p>
          <${H3} class="mclock__title">${esc(s.t)}</${H3}>
          <p class="mclock__text">${esc(s.p)}</p>${s.acts ? `\n          ${s.acts}` : ''}
        </div>
      </li>`
  )
  .join('\n')}
    </ol>
  </div>
</section>`;
}

/* ================================================================== 2. live hours dial */

const HD = { C: 150, R: 96 }; // keep in step with HOURS_GEOMETRY in assets/js/parts/midnight.js

/**
 * @param {object} [o]
 * @param {'night'|'paper'} [o.tone='night']  ground the dial sits on
 * @param {'lg'|'sm'} [o.size='lg']           sm = compact home teaser
 */
export function hoursDial(o = {}) {
  const tone = o.tone === 'paper' ? 'paper' : 'night';
  const size = o.size === 'sm' ? 'sm' : 'lg';
  const g = uid('hd');
  const { C, R } = HD;
  let ticks = '';
  let major = '';
  for (let h = 0; h < 24; h++) {
    const deg = h * 15;
    if (h % 6 === 0) major += seg(C, C, R + 9, R + 19, deg);
    else ticks += seg(C, C, R + 10, R + 16, deg);
  }
  const open = arc(C, C, R, 165, 360); // 11:00 -> 24:00
  const label = (text, deg, r, cls = '') => {
    const [x, y] = pt(C, C, r, deg);
    return `<span class="hdial__label${cls}" style="left:${r2((x / 300) * 100)}%;top:${r2((y / 300) * 100)}%">${text}</span>`;
  };
  const needleTop = C - R - 21;
  const px = size === 'sm' ? 280 : 420;
  // the svg is the in-flow, image-like part: it sets the dial's size and shrinks like an image in narrow places
  return `<figure class="hdial hdial--${size}" data-hours-dial data-tone="${tone}" role="img" aria-label="Opening hours: open every day, 11 am to 12 midnight.">
  <svg class="hdial__svg" viewBox="0 0 300 300" width="${px}" height="${px}" focusable="false">
    <defs><mask id="${g}m" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="300"><path class="hdial__mask" pathLength="1" d="${open}"/></mask></defs>
    <circle class="hdial__ring" cx="${C}" cy="${C}" r="${R}"/>
    <path class="hdial__ticks" d="${ticks}"/>
    <path class="hdial__ticks hdial__ticks--major" d="${major}"/>
    <g mask="url(#${g}m)">
      <path class="hdial__arc hdial__arc--past" d=""/>
      <path class="hdial__arc hdial__arc--ahead" d="${open}"/>
    </g>
  </svg>
  <span class="hdial__over">
    ${label('Midnight', 0, R + 34)}${label('6 pm', 270, R + 36)}${label('11 am', 165, R + 33)}${label('6 am', 90, R + 34, ' hdial__label--quiet')}
    <span class="hdial__needle"><svg viewBox="0 0 300 300" focusable="false"><path d="M${C} ${C - R - 12}V${needleTop}"/><circle class="hdial__halo" cx="${C}" cy="${C - R}" r="10.5"/><circle class="hdial__dot" cx="${C}" cy="${C - R}" r="5.5"/></svg></span>
    <span class="hdial__center">
      <span class="hdial__status" data-static>Open every day</span>
      <span class="hdial__left">11 am to 12 midnight</span>
      <span class="hdial__next"></span>
    </span>
  </span>
</figure>`;
}

/* ================================================================== 3. size and servings guide */

const SIZES = [
  { v: '0.5', label: '½ kg', say: 'Half kg', inch: 6, cm: 15, serves: '4–6', saysServes: '4 to 6', inner: 0, innerCuts: 0, cuts: 6 },
  { v: '1', label: '1 kg', say: '1 kg', inch: 8, cm: 20, serves: '8–10', saysServes: '8 to 10', inner: 0, innerCuts: 0, cuts: 10 },
  { v: '1.5', label: '1.5 kg', say: '1.5 kg', inch: 9, cm: 23, serves: '12–15', saysServes: '12 to 15', inner: 70, innerCuts: 5, cuts: 10 },
  { v: '2', label: '2 kg', say: '2 kg', inch: 10, cm: 25, serves: '16–20', saysServes: '16 to 20', inner: 78, innerCuts: 6, cuts: 14 },
];

/**
 * @param {object} [o]
 * @param {'paper'|'night'} [o.tone='paper']
 * @param {string} [o.selected='1']   initially checked size: '0.5' | '1' | '1.5' | '2'
 */
export function sizeGuide(o = {}) {
  const tone = o.tone === 'night' ? 'night' : 'paper';
  const selected = SIZES.some((s) => s.v === o.selected) ? o.selected : '1';
  const g = uid('sg');
  const CX = 200;
  const CY = 190;
  const R = 150; // cake top at 10 in (2 kg); smaller sizes scale down from here
  const BOARD = 168;

  // piped border: star-tip rosettes, as they look from above
  const star = (() => {
    let d = '';
    for (let i = 0; i < 16; i++) {
      const rr = i % 2 ? 5.4 : 10.5;
      const [x, y] = pt(0, 0, rr, i * 22.5);
      d += `${i ? 'L' : 'M'}${x} ${y}`;
    }
    return `${d}Z`;
  })();
  let rosettes = '';
  for (let i = 0; i < 30; i++) {
    const [x, y] = pt(CX, CY, R - 13, i * 12);
    rosettes += `<use href="#${g}r" x="${x}" y="${y}"/>`;
  }

  const cutSet = (s) => {
    let k = 0;
    const lines = [];
    const line = (ra, rb, deg) => lines.push(`<path pathLength="1" style="--k:${k++}" d="${seg(CX, CY, ra, rb, deg)}"/>`);
    if (s.inner) {
      lines.push(`<path pathLength="1" style="--k:${k++}" d="${arc(CX, CY, s.inner, 0, 180)}${arc(CX, CY, s.inner, 180, 360).replace(/^M[^A]+/, '')}"/>`);
      for (let i = 0; i < s.innerCuts; i++) line(0, s.inner, i * (360 / s.innerCuts) + 45);
      for (let i = 0; i < s.cuts; i++) line(s.inner, R, i * (360 / s.cuts));
    } else {
      for (let i = 0; i < s.cuts; i++) line(0, R, i * (360 / s.cuts));
    }
    return `<g class="sguide__cut" data-cut="${s.v}">${lines.join('')}</g>`;
  };

  const opts = SIZES.map(
    (s) =>
      `<label class="sguide__opt"><input type="radio" name="${g}" value="${s.v}"${s.v === selected ? ' checked' : ''} data-say="${esc(`${s.say}: serves about ${s.saysServes} people.`)}"><span>${s.label}</span></label>`
  ).join('');

  const reads = SIZES.map(
    (s) => `<div class="sguide__read" data-for="${s.v}">
          <p class="sguide__k">Serves about</p>
          <p class="sguide__v">${s.serves}</p>
        </div>`
  ).join('\n        ');

  return `<div class="sguide" data-size-guide data-tone="${tone}">
  <div class="sguide__in">
    <div class="sguide__stage" aria-hidden="true">
      <svg class="sguide__svg" viewBox="-122 -132 644 644" focusable="false">
        <defs>
          <radialGradient id="${g}t" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#6e4330"/><stop offset=".42" stop-color="#46271a"/><stop offset="1" stop-color="#28140d"/></radialGradient>
          <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop class="sguide__gold-hi" offset="0"/><stop class="sguide__gold-lo" offset=".55"/><stop class="sguide__gold-hi" offset="1"/></linearGradient>
          <radialGradient id="${g}pw" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#f6f8f9"/><stop offset="1" stop-color="#e7edf0"/></radialGradient>
          <linearGradient id="${g}pr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef2f4"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>
          <radialGradient id="${g}gl" cx="32%" cy="26%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <radialGradient id="${g}rg" cx="50%" cy="50%" r="50%"><stop offset=".78" stop-color="#6e151d"/><stop offset="1" stop-color="#3a0a10"/></radialGradient>
          <filter id="${g}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.3"/><feComposite in2="SourceGraphic" operator="in"/></filter>
          <filter id="${g}s" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="9"/></filter>
          <g id="${g}r"><path class="sguide__rose" d="${star}"/><circle class="sguide__rose-c" r="2"/></g>
        </defs>
        <g class="sguide__rug">
          <circle class="sguide__rug-shadow" cx="${CX}" cy="${CY + 12}" r="304" filter="url(#${g}s)"/>
          <path class="sguide__rug-fringe" d="M502.0 190.0L516.0 190.0M501.7 203.2L515.7 203.8M500.9 216.3L514.8 217.5M499.4 229.4L513.3 231.2M497.4 242.4L511.2 244.9M494.8 255.4L508.5 258.4M491.7 268.2L505.2 271.8M488.0 280.8L501.4 285.0M483.8 293.3L496.9 298.1M479.0 305.6L491.9 310.9M473.7 317.6L486.4 323.5M467.9 329.4L480.3 335.9M461.5 341.0L473.7 348.0M454.7 352.3L466.5 359.8M447.4 363.2L458.9 371.3M439.6 373.8L450.7 382.4M431.3 384.1L442.1 393.1M422.7 394.0L433.0 403.5M413.5 403.5L423.4 413.4M404.0 412.7L413.5 423.0M394.1 421.3L403.1 432.1M383.8 429.6L392.4 440.7M373.2 437.4L381.3 448.9M362.3 444.7L369.8 456.5M351.0 451.5L358.0 463.7M339.4 457.9L345.9 470.3M327.6 463.7L333.5 476.4M315.6 469.0L320.9 481.9M303.3 473.8L308.1 486.9M290.8 478.0L295.0 491.4M278.2 481.7L281.8 495.2M265.4 484.8L268.4 498.5M252.4 487.4L254.9 501.2M239.4 489.4L241.2 503.3M226.3 490.9L227.5 504.8M213.2 491.7L213.8 505.7M200.0 492.0L200.0 506.0M186.8 491.7L186.2 505.7M173.7 490.9L172.5 504.8M160.6 489.4L158.8 503.3M147.6 487.4L145.1 501.2M134.6 484.8L131.6 498.5M121.8 481.7L118.2 495.2M109.2 478.0L105.0 491.4M96.7 473.8L91.9 486.9M84.4 469.0L79.1 481.9M72.4 463.7L66.5 476.4M60.6 457.9L54.1 470.3M49.0 451.5L42.0 463.7M37.7 444.7L30.2 456.5M26.8 437.4L18.7 448.9M16.2 429.6L7.6 440.7M5.9 421.3L-3.1 432.1M-4.0 412.7L-13.5 423.0M-13.5 403.5L-23.4 413.4M-22.7 394.0L-33.0 403.5M-31.3 384.1L-42.1 393.1M-39.6 373.8L-50.7 382.4M-47.4 363.2L-58.9 371.3M-54.7 352.3L-66.5 359.8M-61.5 341.0L-73.7 348.0M-67.9 329.4L-80.3 335.9M-73.7 317.6L-86.4 323.5M-79.0 305.6L-91.9 310.9M-83.8 293.3L-96.9 298.1M-88.0 280.8L-101.4 285.0M-91.7 268.2L-105.2 271.8M-94.8 255.4L-108.5 258.4M-97.4 242.4L-111.2 244.9M-99.4 229.4L-113.3 231.2M-100.9 216.3L-114.8 217.5M-101.7 203.2L-115.7 203.8M-102.0 190.0L-116.0 190.0M-101.7 176.8L-115.7 176.2M-100.9 163.7L-114.8 162.5M-99.4 150.6L-113.3 148.8M-97.4 137.6L-111.2 135.1M-94.8 124.6L-108.5 121.6M-91.7 111.8L-105.2 108.2M-88.0 99.2L-101.4 95.0M-83.8 86.7L-96.9 81.9M-79.0 74.4L-91.9 69.1M-73.7 62.4L-86.4 56.5M-67.9 50.6L-80.3 44.1M-61.5 39.0L-73.7 32.0M-54.7 27.7L-66.5 20.2M-47.4 16.8L-58.9 8.7M-39.6 6.2L-50.7 -2.4M-31.3 -4.1L-42.1 -13.1M-22.7 -14.0L-33.0 -23.5M-13.5 -23.5L-23.4 -33.4M-4.0 -32.7L-13.5 -43.0M5.9 -41.3L-3.1 -52.1M16.2 -49.6L7.6 -60.7M26.8 -57.4L18.7 -68.9M37.7 -64.7L30.2 -76.5M49.0 -71.5L42.0 -83.7M60.6 -77.9L54.1 -90.3M72.4 -83.7L66.5 -96.4M84.4 -89.0L79.1 -101.9M96.7 -93.8L91.9 -106.9M109.2 -98.0L105.0 -111.4M121.8 -101.7L118.2 -115.2M134.6 -104.8L131.6 -118.5M147.6 -107.4L145.1 -121.2M160.6 -109.4L158.8 -123.3M173.7 -110.9L172.5 -124.8M186.8 -111.7L186.2 -125.7M200.0 -112.0L200.0 -126.0M213.2 -111.7L213.8 -125.7M226.3 -110.9L227.5 -124.8M239.4 -109.4L241.2 -123.3M252.4 -107.4L254.9 -121.2M265.4 -104.8L268.4 -118.5M278.2 -101.7L281.8 -115.2M290.8 -98.0L295.0 -111.4M303.3 -93.8L308.1 -106.9M315.6 -89.0L320.9 -101.9M327.6 -83.7L333.5 -96.4M339.4 -77.9L345.9 -90.3M351.0 -71.5L358.0 -83.7M362.3 -64.7L369.8 -76.5M373.2 -57.4L381.3 -68.9M383.8 -49.6L392.4 -60.7M394.1 -41.3L403.1 -52.1M404.0 -32.7L413.5 -43.0M413.5 -23.5L423.4 -33.4M422.7 -14.0L433.0 -23.5M431.3 -4.1L442.1 -13.1M439.6 6.2L450.7 -2.4M447.4 16.8L458.9 8.7M454.7 27.7L466.5 20.2M461.5 39.0L473.7 32.0M467.9 50.6L480.3 44.1M473.7 62.4L486.4 56.5M479.0 74.4L491.9 69.1M483.8 86.7L496.9 81.9M488.0 99.2L501.4 95.0M491.7 111.8L505.2 108.2M494.8 124.6L508.5 121.6M497.4 137.6L511.2 135.1M499.4 150.6L513.3 148.8M500.9 163.7L514.8 162.5M501.7 176.8L515.7 176.2"/>
          <circle cx="${CX}" cy="${CY}" r="302" fill="url(#${g}rg)"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="198" stroke="#5c1219" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="205" stroke="#6e151d" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="212" stroke="#4a0e14" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="219" stroke="#e8a7b5" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="226" stroke="#5c1219" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="233" stroke="#6e151d" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="240" stroke="#4a0e14" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="247" stroke="#e8a7b5" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="254" stroke="#5c1219" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="261" stroke="#d9a35a" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="268" stroke="#4a0e14" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="275" stroke="#f6eedc" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="282" stroke="#d9a35a" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="289" stroke="#6e151d" style="stroke-dashoffset:3"/>
          <circle class="sguide__rug-ring" cx="${CX}" cy="${CY}" r="296" stroke="#4a0e14" style="stroke-dashoffset:0"/>
          <circle class="sguide__rug-tex" cx="${CX}" cy="${CY}" r="302" filter="url(#${g}n)"/>
          <circle class="sguide__rug-edge" cx="${CX}" cy="${CY}" r="301"/>
        </g>
        <g class="sguide__plate">
          <circle class="sguide__plate-shadow" cx="${CX}" cy="${CY + 14}" r="194" filter="url(#${g}s)"/>
          <circle cx="${CX}" cy="${CY}" r="194" fill="url(#${g}pr)"/>
          <circle class="sguide__plate-edge" cx="${CX}" cy="${CY}" r="190"/>
          <circle cx="${CX}" cy="${CY}" r="172" fill="url(#${g}pw)"/>
          <circle class="sguide__plate-well" cx="${CX}" cy="${CY}" r="172"/>
        </g>
        <g class="sguide__cake">
          <circle class="sguide__shadow" cx="${CX}" cy="${CY + 12}" r="${BOARD}" filter="url(#${g}s)"/>
          <circle class="sguide__board" cx="${CX}" cy="${CY}" r="${BOARD}" fill="url(#${g}b)"/>
          <circle class="sguide__board-line" cx="${CX}" cy="${CY}" r="${BOARD - 5}"/>
          <circle class="sguide__top" cx="${CX}" cy="${CY}" r="${R}" fill="url(#${g}t)"/>
          <circle cx="${CX}" cy="${CY}" r="${R}" fill="url(#${g}gl)" pointer-events="none"/>
          <g class="sguide__cuts">${SIZES.map(cutSet).join('')}</g>
          <g class="sguide__roses">${rosettes}</g>
        </g>
      </svg>
    </div>
    <div class="sguide__panel">
      <fieldset class="sguide__seg">
        <legend class="mp-vh">Cake size</legend>
        <div class="sguide__opts"><span class="sguide__thumb" aria-hidden="true"></span>${opts}</div>
      </fieldset>
      <div class="sguide__reads">
        ${reads}
      </div>
      <p class="sguide__live mp-vh" aria-live="polite"></p>
      <p class="sguide__note">All servings are approximate. For more than 20 people, <a href="${wa("Hello Cako, I'd like a cake for more than 20 people.")}" target="_blank" rel="noopener">ask us on WhatsApp</a>.</p>
    </div>
  </div>
</div>`;
}
