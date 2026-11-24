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
    <div class="wrap ip-grid vhero__grid">
      <div class="vhero__head">
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
      </figure>
    </div>
  </section>

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

  <section class="vaddr" id="address" data-ground="night" aria-labelledby="address-title">
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

  <section class="vfind" id="directions" data-ground="night" aria-labelledby="directions-title">
    <div class="wrap ip-grid">
      <h2 class="h2 vfind__title" id="directions-title">Finding us</h2>
      <p class="lede vfind__text" data-assumed>We’re on Upper Kondhwa Road in Ambika Nagar, Bibvewadi (also spelt Bibwewadi), Pune 411037. Tap Get directions for the route from where you are. Lost on the way? Call us and we’ll guide you in.</p>
    </div>
  </section>

  <section class="vserv" id="services" data-ground="night-2" aria-labelledby="services-title">
    <div class="wrap">
      <h2 class="h2 vserv__title" id="services-title">Delivery, takeaway or a seat</h2>
      <ul class="vserv__list" role="list">
        <li data-assumed>${icon('i-bike')}<h3 class="vserv__h">Home delivery</h3><p>Send your address on WhatsApp. We’ll confirm whether we reach you, the charge and the time.</p></li>
        <li data-assumed>${icon('i-shopping-bag')}<h3 class="vserv__h">Takeaway</h3><p>Order ahead on WhatsApp, or choose at the counter and take it home.</p></li>
        <li data-assumed>${icon('i-armchair')}<h3 class="vserv__h">Seating</h3><p>Sit down inside with something sweet. About ₹100 for one.</p></li>
      </ul>
    </div>
  </section>

  <section class="vfaq" id="faq" data-ground="night" aria-labelledby="faq-title">
    <div class="wrap ip-grid">
      <h2 class="h2 vfaq__title" id="faq-title">Visiting questions</h2>
      ${faqList(VISIT_FAQ)}
    </div>
  </section>

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
