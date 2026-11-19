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
      <svg class="sguide__svg" viewBox="-60 -70 520 520" focusable="false">
        <defs>
          <radialGradient id="${g}t" cx="36%" cy="30%" r="80%"><stop offset="0" stop-color="#6e4330"/><stop offset=".42" stop-color="#46271a"/><stop offset="1" stop-color="#28140d"/></radialGradient>
          <linearGradient id="${g}b" x1="0" y1="0" x2="1" y2="1"><stop class="sguide__gold-hi" offset="0"/><stop class="sguide__gold-lo" offset=".55"/><stop class="sguide__gold-hi" offset="1"/></linearGradient>
          <radialGradient id="${g}pw" cx="45%" cy="40%" r="65%"><stop offset="0" stop-color="#ffffff"/><stop offset=".8" stop-color="#f6f8f9"/><stop offset="1" stop-color="#e7edf0"/></radialGradient>
          <linearGradient id="${g}pr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".6" stop-color="#eef2f4"/><stop offset="1" stop-color="#dfe6ea"/></linearGradient>
          <radialGradient id="${g}gl" cx="32%" cy="26%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".45" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
          <radialGradient id="${g}rg" cx="50%" cy="50%" r="50%"><stop offset=".78" stop-color="#F7CBD6"/><stop offset="1" stop-color="#E9A3B6"/></radialGradient>
          <filter id="${g}n" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 .9 -.3"/><feComposite in2="SourceGraphic" operator="in"/></filter>
          <filter id="${g}s" x="-25%" y="-25%" width="150%" height="150%"><feGaussianBlur stdDeviation="9"/></filter>
          <g id="${g}r"><path class="sguide__rose" d="${star}"/><circle class="sguide__rose-c" r="2"/></g>
        </defs>
        <g class="sguide__box">
          <rect class="sguide__box-shadow" x="-30" y="-24" width="460" height="460" rx="14" filter="url(#${g}s)"/>
          <rect x="-30" y="-40" width="460" height="460" rx="14" fill="#FFFFFF" stroke="#E3D1BA" stroke-width="2"/>
          <rect x="-22" y="-32" width="444" height="444" rx="9" fill="none" stroke="#D3202A" stroke-width="2.5" opacity=".85"/>
          <rect x="-14" y="-24" width="428" height="428" rx="6" fill="#E2CBA8"/>
          <path d="M-14 -24L0 -10M414 -24L400 -10M-14 404L0 390M414 404L400 390" stroke="rgba(90,50,20,.32)" stroke-width="1.6"/>
          <rect x="0" y="-10" width="400" height="400" rx="4" fill="#F8EEDF" stroke="rgba(90,50,20,.28)" stroke-width="3"/>
          <circle cx="${CX}" cy="${CY}" r="188" fill="#FFFFFF"/>
          <circle cx="${CX}" cy="${CY}" r="184" fill="none" stroke="#F2B8C6" stroke-width="6" stroke-dasharray="7 5"/>
          <circle cx="${CX}" cy="${CY}" r="174" fill="none" stroke="#FBE3E9" stroke-width="1.5"/>
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
