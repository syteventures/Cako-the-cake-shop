// The page shell (brief section 8): head, header, phone menu, footer, phone action bar, scripts.
import fs from 'node:fs';
import path from 'node:path';
import { SITE, DIRECTIONS, icon, part, root } from './data.mjs';
import { WA_ORDER, TEL, PHONE_TEXT, ADDRESS } from './content.mjs';

export const NAV = [['index.html', 'Home'], ['cakes.html', 'Cakes'], ['order.html', 'Order'], ['visit.html', 'Visit'], ['gallery.html', 'Gallery']];
// header nav (copy deck): Cakes, Occasions, Order, Visit
const MENU = [['index.html', 'Home'], ['cakes.html', 'Cakes'], ['index.html#occasions', 'Occasions'], ['gallery.html', 'Gallery'], ['order.html', 'Order'], ['visit.html', 'Visit']];
// only the two faces used above the fold on every page (brief section 3)
export const FONT_LINKS = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400..700;1,400..700&family=Playfair+Display:ital,wght@0,400..700;1,400..700&display=swap">`;

export const statusPill = (cls = '') => `<p class="status-chip${cls ? ` ${cls}` : ''}"><span class="status-chip__dot" aria-hidden="true"></span><span data-live data-open="Open till 12 tonight" data-closed="Opens at 11 am">Open 11 am to 12 midnight</span></p>`;
export const motionButton = (cls = '') => `<button class="icon-btn motion-btn${cls ? ` ${cls}` : ''}" type="button" aria-pressed="false" data-motion-toggle><span class="motion-btn__pause">${icon('i-pause', 1)}</span><span class="motion-btn__play">${icon('i-play', 1)}</span><span class="visually-hidden" data-motion-label>Pause motion</span></button>`;

export function page({ file, title, description, body, jsonld = '', preload = '', parts = [], bodyClass = '', ogTitle = '' }) {
  const current = (h) => (h === file ? ' aria-current="page"' : '');
  const nav = MENU.map(([h, t]) => `<li><a href="${h}"${current(h)}>${t}</a></li>`).join('');
  const side = (hs) => hs.map((h) => MENU.find(([x]) => x === h)).map(([h, t]) => `<li><a href="${h}"${current(h)}>${t}</a></li>`).join('');
  const url = SITE + (file === 'index.html' ? '' : file);
  return `<!doctype html>
<html lang="en-IN" class="is-open">
<head>
<meta charset="utf-8">
<script>(function(d){d.classList.add('js');try{if(localStorage.getItem('cako-motion')==='paused')d.setAttribute('data-motion','paused')}catch(e){}})(document.documentElement)</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#211410">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="icon" href="assets/icons/app/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="assets/icons/app/apple-touch-icon.png">
<link rel="manifest" href="site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Cako Cake">
<meta property="og:locale" content="en_IN">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${ogTitle || title}">
<meta property="og:description" content="${description}">
<meta property="og:image" content="${SITE}assets/img/og-cako.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Cakes from Cako Cake, Bibvewadi, Pune.">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image:alt" content="Cakes from Cako Cake, Bibvewadi, Pune.">
${FONT_LINKS}
${preload}<link rel="stylesheet" href="assets/css/site.css">
${jsonld}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
<a class="skip" href="#main">Skip to content</a>
${part('sprite.html')}
<header class="top" data-top>
  <div class="wrap top__bar">
    <nav class="nav" aria-label="Main">
      <ul class="nav__side nav__side--l">${side(['index.html', 'cakes.html', 'index.html#occasions'])}</ul>
      <a class="brand" href="index.html" aria-label="Cako Cake, home"><span class="brand__bow" aria-hidden="true"></span><img src="assets/brand/cako-badge.svg" width="76" height="76" alt=""></a>
      <ul class="nav__side nav__side--r">${side(['gallery.html', 'visit.html'])}</ul>
    </nav>
    <div class="top__right">
      <a class="btn btn--primary btn--sm top__order" href="order.html"${current('order.html')}>Order a cake</a>
      <button class="icon-btn menu-btn" type="button" aria-expanded="false" aria-controls="menu" data-menu-open>${icon('i-menu')}<span class="visually-hidden">Menu</span></button>
    </div>
  </div>
  <span class="top__ribbon" aria-hidden="true"></span>
</header>
<div class="menu" id="menu" role="dialog" aria-modal="true" aria-label="Menu" tabindex="-1" hidden>
  <div class="menu__head wrap"><img src="assets/brand/cako-badge.svg" width="52" height="52" alt="" loading="lazy"><button class="icon-btn menu-btn" type="button" data-menu-close>${icon('i-x')}<span class="visually-hidden">Close menu</span></button></div>
  <nav class="menu__nav wrap" aria-label="Phone menu"><ul>${MENU.map(([h, t]) => `<li><a href="${h}"${current(h)}>${t}</a></li>`).join('')}</ul></nav>
  <div class="menu__foot wrap">
    ${statusPill()}
    <div class="menu__actions">
      <a class="btn btn--primary" href="${WA_ORDER}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>WhatsApp</span></a>
      <a class="btn btn--secondary" href="${TEL}">${icon('i-phone')}<span>Call</span></a>
    </div>
  </div>
</div>
<main id="main">
${body}
</main>
<footer class="foot">
  <div class="wrap">
    <div class="foot__grid">
      <div class="foot__brand">
        <a href="index.html" aria-label="Cako Cake, home"><img src="assets/brand/cako-badge.svg" width="88" height="88" alt="" loading="lazy"></a>
        <p class="foot__tag"><span class="foot__name">Cako Cake <span class="foot__deva" lang="mr">केको केक</span></span> A vegetarian-only cake shop and bakery.</p>
        <address><a href="${DIRECTIONS}" target="_blank" rel="noopener">${ADDRESS}</a><br><a class="tnum" href="${TEL}">${PHONE_TEXT}</a>, call or WhatsApp</address>
      </div>
      <div class="foot__col"><h2 class="foot__h">Hours</h2><p>Open every day, 11 am to 12 midnight</p>${statusPill()}</div>
      <div class="foot__col"><h2 class="foot__h">Pages</h2><ul class="foot__links"><li><a href="cakes.html">Cakes</a></li><li><a href="order.html">Order a cake</a></li><li><a href="visit.html">Visit</a></li><li><a href="${DIRECTIONS}" target="_blank" rel="noopener">Get directions</a></li></ul></div>
      <div class="foot__col">
        <h2 class="foot__h">This site</h2>
        <p class="small">This is a demo site. Prices and reviews are samples until Cako confirms them.</p>
        <a class="link" href="#main">Back to top</a>
        <button class="motion-link" type="button" aria-pressed="false" data-motion-toggle><span data-motion-label>Pause motion</span></button>
      </div>
    </div>
    <div class="foot__legal"><p>© 2026 Cako Cake</p><p>Bibvewadi, Pune</p></div>
  </div>
</footer>
<nav class="actionbar" aria-label="Quick actions">
  <a class="actionbar__btn actionbar__btn--wa" href="${WA_ORDER}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>WhatsApp</span></a>
  <a class="actionbar__btn" href="${TEL}">${icon('i-phone')}<span>Call</span></a>
  <a class="actionbar__btn" href="${DIRECTIONS}" target="_blank" rel="noopener">${icon('i-navigation')}<span>Directions</span></a>
</nav>
<script type="module" src="/src/entries/${parts.includes('home') ? 'home' : parts.includes('gallery') ? 'gallery' : parts.includes('midnight') ? 'visit' : 'base'}.js"></script>
</body>
</html>
`;
}
