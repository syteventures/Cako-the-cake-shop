// Gallery page: every usable photo from Cako Images.zip (enhanced by _workfiles/scripts/enhance.py) and the two
// stabilised, de-flickered display-case films. Photos with customers in them are left out.
// Styles: assets/css/src/30-gallery.css. Behaviour: assets/js/parts/gallery.js (filters, lightbox, film play/pause).
import fs from 'node:fs';
import path from 'node:path';
import { root } from './data.mjs';
import { page } from './shell.mjs';

const PHOTOS = JSON.parse(fs.readFileSync(path.join(root, 'tools/site/gallery.json'), 'utf8'));
const CATS = [['all', 'Everything'], ['shop', 'The shop'], ['cakes', 'Cakes'], ['birthdays', 'Birthdays']];
const count = (k) => PHOTOS.filter((p) => k === 'all' || p.cat === k).length + (k === 'all' || k === 'cakes' ? 1 : 0);
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

const photo = (p, i) => `<li class="gal__item" data-cat="${p.cat}"${p.h > p.w ? ' data-shape="arch"' : ''}>
          <figure class="gal__fig">
            <button class="gal__open" type="button" data-full="assets/img/gallery/${p.id}-1600.webp" data-cap="${esc(p.cap)}" aria-label="View larger: ${esc(p.cap)}">
              <img src="assets/img/gallery/${p.id}-800.webp" srcset="assets/img/gallery/${p.id}-800.webp 800w, assets/img/gallery/${p.id}-1600.webp 1600w" sizes="(min-width: 1100px) 400px, (min-width: 640px) 45vw, 92vw" width="${p.w}" height="${p.h}" alt="${esc(p.alt)}"${i > 2 ? ' loading="lazy"' : ''} decoding="async">
            </button>
            <figcaption>${esc(p.cap)}</figcaption>
          </figure>
        </li>`;
const film = `<li class="gal__item" data-cat="cakes" data-shape="arch">
          <figure class="gal__fig">
            <div class="gal__film"><video muted loop playsinline preload="none" poster="assets/img/shop/display-loop-2-poster.jpg" width="600" height="1066" data-autoloop aria-label="A slow walk along the lit display case and the arch wall"><source data-src="assets/img/shop/display-loop-2.mp4" type="video/mp4"></video></div>
            <figcaption>Along the counter (film)</figcaption>
          </figure>
        </li>`;
const items = PHOTOS.map(photo);
items.splice(4, 0, film);

export default page({
  file: 'gallery.html',
  title: 'Gallery | Cako Cake, Bibvewadi, Pune',
  description: 'Photos and short films from Cako Cake on Upper Kondhwa Road, Bibvewadi: the lit arch wall, the cake counter and the party corner.',
  ogTitle: 'Inside Cako',
  parts: ['gallery'],
  bodyClass: 'page-gallery',
  body: `
  <section class="ihero ghero" id="gallery-top" data-ground="night" aria-labelledby="gallery-title">
    <div class="wrap ghero__grid">
      <div class="ghero__copy">
        <h1 class="display-l ghero__title" id="gallery-title">Inside Cako</h1>
        <p class="lede ghero__lede">The lit arch wall, the cake counter and the party corner on Upper Kondhwa Road. Every photo here was taken in the shop.</p>
        <p class="ghero__links"><a class="btn btn--primary" href="visit.html">Get directions</a><a class="link" href="order.html">Order a cake</a></p>
      </div>
      <figure class="ghero__film">
        <video muted loop playsinline preload="none" poster="assets/img/shop/display-loop-poster.jpg" width="600" height="1066" data-autoloop aria-label="A slow pan along the lit display case full of cakes"><source data-src="assets/img/shop/display-loop.mp4" type="video/mp4"></video>
        <figcaption>The counter, tonight</figcaption>
      </figure>
    </div>
  </section>

  <section class="sec gal" id="photos" data-ground="night-2" aria-label="Photos">
    <div class="wrap">
      <div class="gal__chips" role="group" aria-label="Show photos of">
        ${CATS.map(([k, t], i) => `<button class="chip" type="button" data-gfilter="${k}" aria-pressed="${i === 0}">${t} <span class="chip__n">${count(k)}</span></button>`).join('\n        ')}
      </div>
      <p class="visually-hidden" aria-live="polite" data-gal-say></p>
      <ul class="gal__grid">
        ${items.join('\n        ')}
      </ul>
    </div>
  </section>

  <dialog class="gal__box" aria-label="Photo" data-gal-box>
    <figure class="gal__boxfig"><img alt="" data-gal-img><figcaption data-gal-cap></figcaption></figure>
    <button class="icon-btn gal__nav gal__nav--prev" type="button" data-gal-prev aria-label="Previous photo">&#8249;</button>
    <button class="icon-btn gal__nav gal__nav--next" type="button" data-gal-next aria-label="Next photo">&#8250;</button>
    <button class="icon-btn gal__close" type="button" data-gal-close aria-label="Close">&#215;</button>
  </dialog>
`,
});
