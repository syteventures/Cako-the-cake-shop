// Visit page (brief section 12, "is it open right now?"). Copy: _workfiles/content.md "VISIT", word for word.
// Styles: assets/css/src/20-pages.css (vhero, vhours, vaddr, vmap, vfind, vserv, vfaq, vtalk).
// Behaviour: assets/js/parts/midnight.js (the live hours dial) and assets/js/site.js (today's row, copy address, map facade).
import { DIRECTIONS, icon, live, part } from './data.mjs';
import { ALT, TEL, WA, PHONE_TEXT, faqList, faqJsonLd } from './content.mjs';
import { page } from './shell.mjs';
import { hoursDial } from './parts/midnight.mjs';

const VISIT_FAQ = ['F3', 'F1', 'F4', 'F5'];
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const ADDRESS_ONE_LINE = 'Survey 658/9, Ambika Nagar, Upper Kondhwa Road, Bibvewadi, Pune, Maharashtra 411037';
const MAP_SRC = 'https://maps.google.com/maps?q=18.4610957,73.875732&amp;z=16&amp;output=embed';
const MAP_LABEL = 'Map of Upper Kondhwa Road, Bibvewadi, with Cako marked.';

// the map facade's drawing: loose contour rings around the pin, nothing that pretends to be a street
const r1 = (v) => Math.round(v * 10) / 10;
function contours() {
  const cx = 452, cy = 286;
  let d = '';
  for (let k = 0; k < 6; k++) {
    const R = 46 + k * 58, n = 16, pts = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2;
      const r = R * (1 + 0.09 * Math.sin(2 * t + k * 0.9) + 0.05 * Math.sin(3 * t + 1.7 + k * 0.4));
      pts.push([cx + r * Math.cos(t) * 1.25, cy + r * Math.sin(t) * 0.92]);
    }
    const mid = (a, b) => [r1((a[0] + b[0]) / 2), r1((a[1] + b[1]) / 2)];
    const m0 = mid(pts[n - 1], pts[0]);
    d += `M${m0[0]} ${m0[1]}`;
    for (let i = 0; i < n; i++) { const p = pts[i], m = mid(p, pts[(i + 1) % n]); d += `Q${r1(p[0])} ${r1(p[1])} ${m[0]} ${m[1]}`; }
    d += 'Z';
  }
  return `<svg class="vmap__art" viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice" fill="none" aria-hidden="true" focusable="false">
            <path class="vmap__grid" d="M0 100H800M0 200H800M0 300H800M0 400H800M0 500H800M100 0V600M200 0V600M300 0V600M400 0V600M500 0V600M600 0V600M700 0V600"/>
            <path class="vmap__rings" d="${d}"/>
            <ellipse class="vmap__spot" cx="${cx}" cy="${cy}" rx="34" ry="11"/>
            <g class="vmap__pin" transform="translate(${cx} ${cy}) scale(2.6) translate(-12 -22)"><path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/></g>
          </svg>`;
}

// the hours dial at full scale. Its centre reads the time left in the copy deck's units ("2 hr 15 min", from site.js's
// Pune clock); the component's own readout stays for no-script visitors.
const dial = hoursDial({ tone: 'night', size: 'lg' }).replace(
  /(<span class="hdial__left">[^<]*<\/span>)/,
  '$1<span class="vhero__left" data-live data-open="{left} left" data-closed="{until} to go"></span>');

export default page({
  file: 'visit.html',
  title: 'Hours and Directions | Cako Cake, Bibvewadi, Pune',
  description: 'Cako Cake, Survey 658/9, Ambika Nagar, Upper Kondhwa Road, Bibvewadi, Pune 411037. Open every day, 11 am to 12 midnight. Call +91 84469 66779.',
  ogTitle: 'Hours and Directions',
  jsonld: part('jsonld.html') + '\n' + faqJsonLd(VISIT_FAQ),
  parts: ['midnight'],
  bodyClass: 'page-visit',
  body: `
  <section class="ihero vhero" id="visit-top" data-ground="night" aria-labelledby="visit-title">
    <div class="vhero__sky" aria-hidden="true"></div>
    <div class="vhero__lights" aria-hidden="true"></div>
    <div class="wrap ip-grid vhero__grid">
      <div class="vhero__head">
        <p class="vhero__eyebrow" aria-hidden="true">Visit us</p>
        <h1 class="display-l vhero__title" id="visit-title">Cako on Upper Kondhwa&nbsp;Road,<br class="vhero__br"> Bibvewadi</h1>
      </div>
      <div class="vhero__answer">
        <p class="vhero__now" aria-hidden="true"><span data-live data-open="Open now" data-closed="Closed now">Open every day</span></p>
        ${live('vhero__live')}
        <p class="lede vhero__lede" data-assumed>Open every day, 11 am to 12 midnight. Delivery, takeaway and seats inside.</p>
      </div>
      <div class="vhero__dial">
        <span class="vhero__glow" aria-hidden="true"></span>
        ${dial}
        <p class="vhero__cap">The gold arc is our opening hours. The hand is the time in Pune, right now.</p>
      </div>
      <figure class="vhero__photo framed">
        <img src="assets/img/shop/arch-cake-800.webp" srcset="assets/img/shop/arch-cake-800.webp 800w, assets/img/shop/arch-cake-1600.webp 1600w" sizes="(min-width: 1200px) 334px, (min-width: 768px) 40vw, 92vw" width="800" height="1000" alt="Inside Cako: a cake on the counter in front of a lit white arch with the red Cako sign" decoding="async">
      <span class="vhero__tape vhero__tape--l" aria-hidden="true"></span><span class="vhero__tape vhero__tape--r" aria-hidden="true"></span><span class="vhero__badge" aria-hidden="true"><svg viewBox="0 0 120 120" focusable="false"><circle cx="60" cy="60" r="57" fill="#F2C27A" stroke="#FFF1DC" stroke-width="3"/><circle cx="60" cy="60" r="31" fill="#FFF1DC" stroke="#B8822F" stroke-width="1.5"/><g class="ring"><path id="vhb" d="M60 60m-43 0a43 43 0 1 1 86 0a43 43 0 1 1-86 0" fill="none"/><text><textPath href="#vhb" startOffset="0">OPEN EVERY DAY • 11 AM TO 12 MIDNIGHT • </textPath></text></g><path d="M60 76l-13-13a8 8 0 0 1 13-10 8 8 0 0 1 13 10z" fill="#E02B3C"/><path d="M52 50c2-4 6-5 8-3" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="2" stroke-linecap="round"/></svg></span>
      </figure>
    </div>
  </section>

  <div class="vdiv vdiv--drip" aria-hidden="true"></div>
  <section class="vhours" id="hours" data-ground="night-2" aria-labelledby="hours-title">
    <div class="wrap ip-grid">
      <div class="vhours__head">
        <h2 class="h2" id="hours-title">Hours</h2>
        <p class="lede">Open every day, 11 am to 12 midnight.</p>
        <p class="small" data-assumed>On festival days, check with us on WhatsApp before you come.</p>
      </div>
      <dl class="vhours__list" data-days>
        ${DAYS.map((d) => `<div class="vhours__day" data-day="${d}"><dt>${d}</dt><dd>11 am to 12 midnight</dd></div>`).join('\n        ')}
      </dl>
    </div>
  </section>

  <div class="vdiv vdiv--awning" aria-hidden="true"></div>
  <section class="vaddr" id="address" data-ground="night" aria-labelledby="address-title">
    <div class="vaddr__art" aria-hidden="true">
      <span class="vaddr__route"></span>
      <span class="vaddr__shop"><svg viewBox="0 0 200 232" focusable="false"><path d="M-4 214H204" stroke="#F2C27A" stroke-opacity=".7" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/><rect x="20" y="78" width="160" height="136" rx="4" fill="#7A0F18" stroke="#F2C27A" stroke-opacity=".75" stroke-width="2.4"/><path d="M20 80h20v18a10 10 0 0 1-20 0z" fill="#FFF1DC"/><path d="M40 80h20v18a10 10 0 0 1-20 0z" fill="#E02B3C"/><path d="M60 80h20v18a10 10 0 0 1-20 0z" fill="#FFF1DC"/><path d="M80 80h20v18a10 10 0 0 1-20 0z" fill="#E02B3C"/><path d="M100 80h20v18a10 10 0 0 1-20 0z" fill="#FFF1DC"/><path d="M120 80h20v18a10 10 0 0 1-20 0z" fill="#E02B3C"/><path d="M140 80h20v18a10 10 0 0 1-20 0z" fill="#FFF1DC"/><path d="M160 80h20v18a10 10 0 0 1-20 0z" fill="#E02B3C"/><path d="M20 80h160" stroke="#F2C27A" stroke-width="3"/><rect x="56" y="44" width="88" height="28" rx="6" fill="#F2C27A" stroke="#FFF1DC" stroke-width="2"/><path d="M100 66l-9-9a5 5 0 0 1 9-6 5 5 0 0 1 9 6z" fill="#E02B3C"/><circle cx="72" cy="58" r="3" fill="#7A0F18"/><circle cx="128" cy="58" r="3" fill="#7A0F18"/><path d="M84 214V170a16 16 0 0 1 32 0V214z" fill="#FFE7BC" stroke="#B8822F" stroke-width="2"/><circle cx="108" cy="192" r="2.6" fill="#B8822F"/><rect x="32" y="124" width="38" height="44" rx="4" fill="#FFD9A0" fill-opacity=".9" stroke="#F2C27A" stroke-width="2"/><rect x="130" y="124" width="38" height="44" rx="4" fill="#FFD9A0" fill-opacity=".9" stroke="#F2C27A" stroke-width="2"/><rect x="38" y="150" width="26" height="14" rx="2" fill="#FF8FB0"/><path d="M38 150h26" stroke="#FFF1DC" stroke-width="3"/><circle cx="51" cy="144" r="4" fill="#E02B3C"/><rect x="136" y="150" width="26" height="14" rx="2" fill="#9B6BFF"/><path d="M136 150h26" stroke="#FFF1DC" stroke-width="3"/><circle cx="149" cy="144" r="4" fill="#FFD84D"/><path class="heart" d="M30 40l-8-8a4.5 4.5 0 0 1 8-5 4.5 4.5 0 0 1 8 5z" fill="#FF8FB0"/><path class="heart" d="M170 30l-6-6a3.4 3.4 0 0 1 6-4 3.4 3.4 0 0 1 6 4z" fill="#FFD84D"/><path d="M100 24c-5 0-8 4-8 8 0 6 8 14 8 14s8-8 8-14c0-4-3-8-8-8z" fill="#4FD6C3" stroke="#FFF1DC" stroke-width="1.6"/><circle cx="100" cy="32" r="2.6" fill="#FFF1DC"/></svg></span>
      <span class="vaddr__sign"><svg viewBox="0 0 200 250" focusable="false"><rect x="95" y="34" width="10" height="200" rx="3" fill="#E2B77A" stroke="#B8822F" stroke-width="1.6"/><circle cx="100" cy="28" r="9" fill="#F2C27A" stroke="#FFF1DC" stroke-width="2"/><path d="M36 50h96l18 14-18 14H36z" fill="#FF8FB0" stroke="#FFF1DC" stroke-width="2.4" stroke-linejoin="round"/><path d="M52 64h44" stroke="#7A0F18" stroke-width="4" stroke-linecap="round"/><path class="heart" d="M118 70l-6-6a3.4 3.4 0 0 1 6-4 3.4 3.4 0 0 1 6 4z" fill="#E02B3C"/><path d="M164 102H68L50 116l18 14h96z" fill="#FFD84D" stroke="#FFF1DC" stroke-width="2.4" stroke-linejoin="round"/><path d="M82 116h58" stroke="#7A0F18" stroke-width="4" stroke-linecap="round"/><circle cx="152" cy="116" r="3.4" fill="#E02B3C"/><path d="M44 154h90l18 14-18 14H44z" fill="#4FD6C3" stroke="#FFF1DC" stroke-width="2.4" stroke-linejoin="round"/><path d="M60 168h50" stroke="#7A0F18" stroke-width="4" stroke-linecap="round"/><path d="M122 168l5-5 5 5-5 5z" fill="#FFF1DC"/><path d="M70 234c-4-12 0-22 6-26M130 234c4-12 0-22-6-26M84 236c0-10 4-18 10-22M116 236c0-10-4-18-10-22" fill="none" stroke="#6BD36B" stroke-width="3" stroke-linecap="round"/><circle cx="76" cy="206" r="4.5" fill="#FF8FB0"/><circle cx="124" cy="206" r="4.5" fill="#FFD84D"/><circle cx="94" cy="212" r="3.6" fill="#FFF1DC"/></svg></span>
    </div>
    <div class="wrap ip-grid">
      <div class="vaddr__copy">
        <h2 class="h2" id="address-title">Address</h2>
        <address class="vaddr__lines" data-assumed>Survey 658/9, Ambika Nagar,<br>Upper Kondhwa Road, Bibvewadi,<br>Pune, Maharashtra 411037</address>
        <div class="vaddr__acts">
          <a class="btn btn--primary" href="${DIRECTIONS}" target="_blank" rel="noopener">${icon('i-navigation')}<span>Get directions</span></a>
          <button class="btn btn--secondary" type="button" data-copy-address data-text="${ADDRESS_ONE_LINE}"><span class="copy-ico copy-ico--a">${icon('i-copy')}</span><span class="copy-ico copy-ico--b">${icon('i-check')}</span><span data-copy-label>Copy address</span></button>
          <a class="btn btn--secondary" href="${TEL}">${icon('i-phone')}<span>Call the shop</span></a>
        </div>
      </div>
      <div class="vmap" data-map data-src="${MAP_SRC}" data-title="${MAP_LABEL}" role="region" aria-label="${MAP_LABEL}" data-assumed>
        <div class="vmap__facade">
          ${contours()}
          <div class="vmap__ask">
            <button class="btn btn--secondary vmap__load" type="button" data-map-load>${icon('i-map-pin')}<span>Load the map</span></button>
            <p class="vmap__note">Loads Google Maps.</p>
          </div>
        </div>
      </div>
    </div>
  </section>

  <div class="vdiv vdiv--road" aria-hidden="true"></div>
  <section class="vfind" id="directions" data-ground="night" aria-labelledby="directions-title">
    <div class="wrap ip-grid">
      <h2 class="h2 vfind__title" id="directions-title">Finding us</h2>
      <p class="lede vfind__text" data-assumed>We’re on Upper Kondhwa Road in Ambika Nagar, Bibvewadi (also spelt Bibwewadi), Pune 411037. Tap Get directions for the route from where you are. Lost on the way? Call us and we’ll guide you in.</p>
    </div>
  </section>

  <div class="vdiv vdiv--lace" aria-hidden="true"></div>
  <section class="vfaq" id="faq" data-ground="night" aria-labelledby="faq-title">
    <div class="wrap ip-grid">
      <h2 class="h2 vfaq__title" id="faq-title">Visiting questions</h2>
      ${faqList(VISIT_FAQ)}
    </div>
  </section>

  <div class="vdiv vdiv--ribbon" aria-hidden="true"></div>
  <section class="vtalk" id="contact" data-ground="night-2" aria-labelledby="contact-title">
    <div class="wrap ip-grid">
      <h2 class="h2 vtalk__title" id="contact-title">Talk to us</h2>
      <ul class="vtalk__list" role="list">
        <li><span class="vtalk__k">Call<span class="visually-hidden">:</span></span> <a class="vtalk__v" href="${TEL}">${PHONE_TEXT}</a></li>
        <li><span class="vtalk__k">WhatsApp<span class="visually-hidden">:</span></span> <a class="vtalk__v" href="${WA}" target="_blank" rel="noopener">${PHONE_TEXT}</a></li>
        <li><span class="vtalk__v vtalk__v--plain">Every day, 11 am to 12 midnight</span></li>
      </ul>
    </div>
  </section>`,
});
