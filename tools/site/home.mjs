// Home page (brief section 9): three chapters that get later as you scroll.
//   chapter 1, after dark: hero, ticker, counter, flavours, occasions, midnight clock
//   scallop, chapter 2, the order desk (paper): sizes, custom cakes, reviews
//   scallop, chapter 3, find us tonight: visit, questions, close, footer
// Copy: _workfiles/content.md, word for word (eyebrows dropped per the brief). Components: tools/site/parts/*.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { FEATURED, bySlug, icon, live, part, DIRECTIONS, root } from './data.mjs';
const exists = (rel) => fs.existsSync(path.join(root, rel));
import { WA, WA_ORDER, WA_CUSTOM, TEL, ADDRESS, ALT, CAT_NAMES, catCount, cut, photo, FACTS, FLAVOURS, OCCASIONS, nameOf, SAMPLE_REVIEWS, REVIEWS, faqList, faqJsonLd, mark, waText } from './content.mjs';
import { page, motionButton } from './shell.mjs';
import { photoCake } from './parts/photocake.mjs';
import { balloons } from './parts/balloons.mjs';
import { turntable } from './parts/turntable.mjs';
import { midnightClock, hoursDial, sizeGuide } from './parts/midnight.mjs';

const HOME_FAQ = ['F1', 'F2', 'F4', 'F5', 'F6'];
const head = (id, title, lede = '', rise = false) => `<header class="sec__head">
        <h2 class="h2" id="${id}-title"${rise ? ' data-rise' : ''}>${title}</h2>
        ${lede ? `<p class="lede">${lede}</p>` : ''}
      </header>`;
const scallop = (from, to) => `<div class="scallop" style="--from: var(${from}); --to: var(${to})" aria-hidden="true"></div>`;
const tickerList = (hidden) => `<ul class="ticker__list"${hidden ? ' aria-hidden="true"' : ''}>${FACTS.map((f) => `<li${/delivery|Seats|₹100/.test(f) ? ' data-assumed' : ''}>${mark}<span>${f}</span></li>`).join('')}</ul>`;

// the hand each flavour family deals (5 cards; 3 for Celebration). red-velvet-heart-2 is a photo of the same cake.
const FANS = {
  chocolate: ['chocolate-truffle', 'black-forest', 'choco-zebra', 'black-and-white-drip', 'dark-chocolate-flake'],
  fruit: ['pineapple', 'mango-swirl', 'strawberry-rose', 'white-forest', 'mango'],
  classic: ['rasmalai', 'butterscotch', 'caramel-nut', 'vanilla-sprinkle', 'almond-white-chocolate'],
  celebration: ['red-velvet-heart', 'strawberry-butterfly', 'red-velvet-heart-2'],
};
const orderSlug = (s) => (s === 'red-velvet-heart-2' ? 'red-velvet-heart' : s);
const fanCard = (s, i, n) => `<a class="fan__card" href="order.html#order-${orderSlug(s)}" style="--i:${i}; --n:${n}" aria-label="Order the ${nameOf(orderSlug(s))} cake">${photo(s, ALT[s], '(min-width: 960px) 220px, 34vw')}<span class="fan__name">${nameOf(orderSlug(s))}</span></a>`;

// the midnight clock is its own full-bleed section (pinned on desktop); add the Marathi line and the foot
const midnightSection = midnightClock({ id: 'midnight', level: 2, heading: 'How a midnight cake works', lede: 'The candles go on at twelve. Our counter stays open until then, every day of the week.' })
  .replace(/(<p class="mclock__lede">[\s\S]*?<\/p>)/, '$1\n      <p class="mr mclock__mr"><span lang="mr">मध्यरात्रीचा केक, अगदी वेळेवर.</span><span class="mr__en">A midnight cake, right on time.</span></p>')
  .replace(/<\/ol>(\s*)<\/div>(\s*)<\/section>\s*$/, `</ol>
    <div class="mclock__foot">
      <p class="small" data-assumed>The times show an example evening, not a cut-off. Ask us on WhatsApp how late we can take your order.</p>
      <a class="btn btn--primary" href="order.html?occasion=midnight">Plan a midnight cake</a>
    </div>$1</div>$2</section>`)
  .replace('<section class="mclock', '<section data-ground="night-3" class="mclock');

const SIZES = [['½ kg', 'about 4 to 6 people', 'Two of you, or a small family'], ['1 kg', 'about 8 to 10 people', 'A birthday at home'], ['1.5 kg', 'about 12 to 15 people', 'A full house'], ['2 kg', 'about 16 to 20 people', 'A party, or the office']];
const candles = (cls = '') => `<span class="candles${cls ? ` ${cls}` : ''}" aria-hidden="true"><span class="candle"><span class="candle__flame"></span><span class="candle__n">1</span></span><span class="candle"><span class="candle__flame"></span><span class="candle__n">2</span></span></span>`;

export default page({
  file: 'index.html',
  title: 'Cako Cake in Bibvewadi, Pune | Open till Midnight',
  description: 'Vegetarian-only cake shop on Upper Kondhwa Road, Bibvewadi, Pune. Open every day, 11 am to 12 midnight, with home delivery, takeaway and seats inside.',
  ogTitle: 'Cako Cake in Bibvewadi, Pune',
  jsonld: part('jsonld.html') + '\n' + faqJsonLd(HOME_FAQ),
  parts: ['photocake', 'turntable', 'midnight', 'home'],
  bodyClass: 'page-home',
  body: `
  <section class="hero" id="hero" data-ground="night" aria-labelledby="hero-title">
    <span class="hero__mark" aria-hidden="true">midnight</span>
    <div class="wrap hero__grid">
      <h1 class="hero__title" id="hero-title">
        <span class="hero__kicker label">Vegetarian cake shop in Bibvewadi, Pune</span>
        <span class="hero__display display-xl"><span class="hero__line" data-split>Fresh cakes,</span><span class="hero__line hero__line--accent" data-split>till midnight.</span></span>
      </h1>
      <div class="hero__stage">
        <div class="hero__cake" role="img" aria-label="A three-tier cake wrapped in photos of Cako cakes, turning on a cake stand, with number candles 1 and 2.">
          ${photoCake(['chocolate-truffle', 'red-velvet-heart', 'black-forest', 'rasmalai', 'pineapple', 'butterscotch', 'black-and-white-drip', 'strawberry-butterfly', 'choco-zebra', 'mango-swirl', 'white-forest', 'strawberry-rose', 'choco-vanilla', 'caramel-nut', 'almond-white-chocolate', 'vanilla-sprinkle', 'dark-chocolate-flake', 'fruit-and-nut', 'mango', 'choco-nut-crunch', 'vanilla-swirl', 'strawberry-cream', 'red-velvet-heart-2'])}
        </div>
      </div>
      <div class="hero__rule" aria-hidden="true"></div>
      <div class="hero__below">
        <p class="hero__lede lede" data-enter>Cako is a vegetarian-only cake shop on Upper Kondhwa Road. We’re open every day from 11 am to 12 midnight, for the cake you need tonight.</p>
        <div class="hero__cta" data-enter>
          <a class="btn btn--primary" href="order.html" data-hero-cta>${icon('b-whatsapp', 1)}<span>Order on WhatsApp</span></a>
          <a class="link" href="cakes.html">See all 22 cakes</a>
        </div>
        <ul class="hero__facts" data-enter>
          <li><b>22</b><span>cakes on the menu</span></li>
          <li><b>100%</b><span>vegetarian, always</span></li>
          <li><b>11–12</b><span>open daily, am to midnight</span></li>
        </ul>
        <div class="hero__status" data-enter>${live('hero__live')}</div>
        <p class="hero__note small" data-enter data-assumed>Home delivery, takeaway and seats inside.</p>
      </div>
      <div class="hero__under">
        <div class="hero__proof">
          <a class="hero__pic" href="order.html#order-chocolate-truffle" aria-label="Order the Chocolate truffle cake" data-facing-pic>${cut('chocolate-truffle', '', '120px', { eager: true })}</a>
          <p class="hero__caption">Every photo on this cake is one of our cakes.</p>
        </div>
        <p class="hero__facing small">Facing you: <a href="order.html#order-chocolate-truffle" data-facing>Chocolate truffle</a></p>
        <div class="hero__tools"><span class="hero__hint small" aria-hidden="true">Drag to turn</span>${motionButton('hero__pause')}</div>
      </div>
    </div>
  </section>

  <section class="ticker" id="facts" data-ground="night-3" aria-label="Cako at a glance">
    <div class="ticker__track" data-ticker>${tickerList(false)}${tickerList(true)}${tickerList(true)}${tickerList(true)}</div>
  </section>

  <section class="sec counter" id="counter" data-ground="night-2" aria-labelledby="counter-title">
    <div class="wrap">
      ${head('counter', 'On the counter tonight', 'Eight counter favourites. Turn the stand, stop on one, and the order slip opens with that cake already chosen.')}
      ${turntable(FEATURED.map((s) => bySlug[s]), undefined, { autoplay: 0 })}
      <div class="counter__foot">
        <a class="link" href="cakes.html">See all 22 cakes</a>
        <p class="small" data-assumed>Prices depend on the cake, the size and the design. WhatsApp us what you need and we’ll send you today’s price.</p>
      </div>
    </div>
  </section>

  <section class="sec flavours" id="flavours" data-ground="night" aria-labelledby="flavours-title">
    <div class="wrap flavours__grid">
      <div class="flavours__pick">
        ${head('flavours', 'Start with a flavour', 'Twenty-two cakes in four groups. Pick the one that sounds like tonight.')}
        <ul class="families" role="list" data-families>
          ${FLAVOURS.map(([k, desc, linkText], i) => `<li class="family${i === 0 ? ' is-on' : ''}" data-family="${k}">
            <button class="family__btn" type="button" aria-pressed="${i === 0}" aria-controls="fan-${k}"><span class="family__name">${CAT_NAMES[k]}</span><span class="family__n">${catCount(k)} cakes</span></button>
            <div class="family__more"><p>${desc}</p><a class="link" href="cakes.html#${k}">${linkText}</a></div>
          </li>`).join('\n          ')}
        </ul>
      </div>
      <div class="flavours__table">
        ${Object.entries(FANS).map(([k, slugs], j) => `<div class="fan" id="fan-${k}" data-fan="${k}"${j ? ' hidden' : ''}>${slugs.map((s, i) => fanCard(s, i, slugs.length)).join('')}</div>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="sec occasions" id="occasions" data-ground="night" aria-labelledby="occasions-title">
    <div class="wrap">
      ${balloons('balloons--occ')}
      ${head('occasions', 'What are we celebrating?', 'Tell us the occasion and we’ll help you choose the size and the flavour.')}
    </div>
    <div class="tags__scroller">
      <ul class="tags wrap" role="list" data-tags>
        ${OCCASIONS.map(([k, t, line, tries, link]) => `<li class="tag-slot">
          <article class="tag" data-tag aria-labelledby="tag-${k}">
            <span class="tag__thread" aria-hidden="true"></span>
            <div class="tag__paper">
              <span class="tag__hole" aria-hidden="true"></span>
              <span class="tag__seal" aria-hidden="true">${cut(tries[0], '', '72px')}</span>
              <h3 class="tag__title" id="tag-${k}">${t}</h3>
              <p class="tag__line"${['kids', 'office', 'festival', 'midnight'].includes(k) ? ' data-assumed' : ''}>${line}</p>
              <p class="tag__try small">Try: ${tries.map((s) => `<a href="order.html#order-${s}">${nameOf(s)}</a>`).join(', ')}</p>
              <a class="link tag__plan" href="order.html?occasion=${k}">${link}</a>
            </div>
          </article>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  ${midnightSection}

  <section class="sec sizes" id="sizes" data-ground="paper" aria-labelledby="sizes-title">
    <div class="wrap sizes__grid">
      <div class="sizes__copy">
        ${head('sizes', 'Sizes and servings', 'A rough guide for regular slices. Cut thinner and a cake goes further.', true)}
        <table class="table sizes__table" data-assumed>
          <caption class="visually-hidden">Approximate servings by cake size</caption>
          <thead><tr><th scope="col">Size</th><th scope="col">Serves, approximately</th><th scope="col">Good for</th></tr></thead>
          <tbody>${SIZES.map(([s, n, g]) => `<tr><th scope="row">${s}</th><td>${n}</td><td>${g}</td></tr>`).join('')}</tbody>
        </table>
        <p class="small" data-assumed>Prices depend on the cake, the size and the design. WhatsApp us what you need and we’ll send you today’s price.</p>
        <a class="btn btn--primary sizes__order" href="order.html?size=1kg" data-size-order>Order this size</a>
      </div>
      <div class="sizes__guide">${sizeGuide({ tone: 'paper', selected: '1' })}</div>
    </div>
  </section>

  <div class="party-divider" aria-hidden="true"><span class="party-divider__sprinkles"></span><span class="party-divider__flags"></span></div>

  <section class="sec custom" id="custom" data-ground="paper" aria-labelledby="custom-title">
    <div class="wrap">
      <div class="custom__panel" data-ground="paper-2">
        <div class="custom__window framed" data-sketch>
          <div class="custom__clip">
            ${photo('strawberry-butterfly', ALT['strawberry-butterfly'], '(min-width: 960px) 40vw, 90vw')}
            <div class="custom__sketch" aria-hidden="true">${exists('public/assets/img/sketch-butterfly.svg') ? '<img src="assets/img/sketch-butterfly.svg" width="400" height="500" alt="" loading="lazy">' : ''}<span class="custom__sketch-note">The idea</span></div>
          </div>
        </div>
        <div class="custom__copy" data-assumed>
          ${head('custom', 'Have a cake in mind?', 'Send us a photo or a sketch on WhatsApp, with the date, the size and the flavour you like. We’ll tell you what we can make, and what it costs.')}
          <h3 class="name">What to send</h3>
          <ul class="ticks">
            <li>A photo or sketch of the idea</li><li>The date, and roughly what time</li><li>The size, or how many people</li><li>The flavour</li><li>The name or message for the top</li>
          </ul>
          <p class="small" data-assumed>Bigger or more detailed cakes need more notice. Ask us how much.</p>
          <a class="btn btn--primary" href="${WA_CUSTOM}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>Send your idea on WhatsApp</span></a>
        </div>
      </div>
    </div>
  </section>

  <section class="sec reviews" id="reviews" data-ground="paper" aria-labelledby="reviews-title">
    <div class="doodles" aria-hidden="true">
      <span class="doodle dd1"><svg viewBox="0 0 100 100" focusable="false"><path d="M24 52 L30 90 Q50 96 70 90 L76 52 Z" fill="#FFD166" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M39 58 L41 88 M50 58 L50 91 M61 58 L59 88" fill="none" stroke="#2A0B0F" stroke-width="2.5" stroke-linecap="round" opacity=".55"/><path d="M20 54 Q14 40 30 38 Q28 26 42 28 Q50 16 60 28 Q74 26 72 38 Q88 40 80 54 Z" fill="#FF8FB0" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M34 44 l4 -3 M50 38 l-1 -5 M62 44 l5 -2" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><circle cx="50" cy="15" r="7" fill="#D3202A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 8 Q52 2 58 1" fill="none" stroke="#2A0B0F" stroke-width="2.5" stroke-linecap="round"/></svg></span>
      <span class="doodle dd2"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 6 Q54 46 94 50 Q54 54 50 94 Q46 54 6 50 Q46 46 50 6 Z" fill="#FFD166" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg></span>
      <span class="doodle dd3"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 46 C30 8 4 18 10 44 C14 58 38 58 50 50 Z" fill="#F2B84B" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 46 C70 8 96 18 90 44 C86 58 62 58 50 50 Z" fill="#F2B84B" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 52 C34 56 16 66 24 82 C32 94 48 76 50 60 Z" fill="#FFD98A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 52 C66 56 84 66 76 82 C68 94 52 76 50 60 Z" fill="#FFD98A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="26" cy="36" r="6" fill="#FF8FB0"/><circle cx="74" cy="36" r="6" fill="#FF8FB0"/><path d="M47 36 Q50 30 53 36 V76 Q50 82 47 76 Z" fill="#2A0B0F" stroke="#2A0B0F" stroke-width="2" stroke-linejoin="round"/><path d="M48 33 Q44 18 36 12 M52 33 Q56 18 64 12" fill="none" stroke="#2A0B0F" stroke-width="2.5" stroke-linecap="round"/></svg></span>
      <span class="doodle dd4"><svg viewBox="0 0 100 100" focusable="false"><path d="M6 40 Q16 16 26 40 T46 40 T66 40 T86 40" fill="none" stroke="#FF6F91" stroke-width="5" stroke-linecap="round"/><path d="M12 70 l10 -6 M44 74 l8 8 M74 66 l10 -4 M60 14 l4 -10" stroke="#6FD1A8" stroke-width="5" stroke-linecap="round" fill="none"/><path d="M30 80 l8 -4 M84 84 l-2 -9" stroke="#8FD3FF" stroke-width="5" stroke-linecap="round" fill="none"/><circle cx="30" cy="10" r="4" fill="#F2B84B"/><circle cx="92" cy="18" r="4" fill="#EF3334"/></svg></span>
      <span class="doodle dd5"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 88 C8 58 14 20 36 20 C44 20 50 26 50 33 C50 26 56 20 64 20 C86 20 92 58 50 88 Z" fill="#FF6F91" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M28 36 Q30 30 36 29" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg></span>
      <span class="doodle dd6"><svg viewBox="0 0 100 100" focusable="false"><path fill-rule="evenodd" d="M50 10 a40 40 0 1 0 .01 0 Z M50 38 a12 12 0 1 1 -.01 0 Z" fill="#E8B67A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path fill-rule="evenodd" d="M50 16 C70 14 86 28 84 50 C82 72 66 86 48 84 C28 82 14 68 16 48 C18 30 32 18 50 16 Z M50 38 a12 12 0 1 1 -.01 0 Z" fill="#FF8FB0" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M30 36 l6 -3 M64 30 l5 4 M72 56 l-6 3 M42 74 l2 -6 M26 58 l5 2 M56 20 l-1 5" stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none"/><path d="M62 70 l5 -3 M34 24 l5 1" stroke="#8FD3FF" stroke-width="3" stroke-linecap="round" fill="none"/></svg></span>
      <span class="doodle dd7"><svg viewBox="0 0 100 100" focusable="false"><ellipse cx="50" cy="38" rx="26" ry="32" fill="#EF3334" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M45 70 L55 70 L50 77 Z" fill="#EF3334" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 77 Q40 85 50 91 Q58 96 48 99" fill="none" stroke="#2A0B0F" stroke-width="2.5" stroke-linecap="round"/><path d="M35 28 Q37 19 46 16" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".75"/></svg></span>
      <span class="doodle dd8"><svg viewBox="0 0 100 100" focusable="false"><path d="M50 6 Q54 46 94 50 Q54 54 50 94 Q46 54 6 50 Q46 46 50 6 Z" fill="#FFD166" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg></span>
      <span class="doodle dd9"><svg viewBox="0 0 100 100" focusable="false"><path d="M14 46 H86 V80 H14 Z" fill="#FFF1DC" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 58 H86 V66 H14 Z" fill="#FF8FB0" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M14 46 L30 32 H96 L86 46 Z" fill="#FFB3C6" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M86 46 L96 32 V66 L86 80Z" fill="#F2D5B0" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><ellipse cx="62" cy="26" rx="9" ry="10" fill="#D3202A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M54 18 L62 21 L70 18 L62 13 Z" fill="#6FD1A8" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M6 85 H94" fill="none" stroke="#C99A3C" stroke-width="5" stroke-linecap="round"/></svg></span>
      <span class="doodle dd10"><svg viewBox="0 0 100 100" focusable="false"><rect x="38" y="38" width="24" height="56" rx="4" fill="#8FD3FF" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M38 52 L62 44 M38 66 L62 58 M38 80 L62 72" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none"/><path d="M50 38 V30" fill="none" stroke="#2A0B0F" stroke-width="3" stroke-linecap="round"/><path d="M50 4 Q64 20 50 31 Q36 20 50 4 Z" fill="#FFB547" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M50 15 Q56 22 50 28 Q44 22 50 15 Z" fill="#FFF3C2"/></svg></span>
      <span class="doodle dd11"><svg viewBox="0 0 100 100" focusable="false"><path d="M26 56 Q38 26 58 12 M68 60 Q66 32 58 12" fill="none" stroke="#2A0B0F" stroke-width="3" stroke-linecap="round"/><path d="M58 12 Q74 2 86 16 Q70 24 58 12 Z" fill="#6FD1A8" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="26" cy="72" r="17" fill="#D3202A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><circle cx="68" cy="76" r="17" fill="#D3202A" stroke="#2A0B0F" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/><path d="M18 66 Q19 61 24 59 M60 70 Q61 65 66 63" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" opacity=".75"/></svg></span>
    </div>
    <div class="wrap">
      <header class="sec__head reviews__head">
        <p class="label reviews__eyebrow">From our guests</p>
        <h2 class="h2" id="reviews-title">Kind words</h2>
        <p class="lede reviews__lede">Birthdays, anniversaries and plain Tuesday cravings. Here is what our guests wrote about us on Google.</p>
      </header>
      <div class="board">
        <ul class="notes" role="list">
        ${REVIEWS.map(([q, who, tag, slug, col, tilt, drop], i) => `<li class="note${i % 3 === 1 ? ' note--pin' : ' note--tape'}" style="--c:${col};--r:${tilt};--y:${drop};--d:${i * -1.3}s">
          <p class="note__stars" aria-hidden="true">★★★★★</p><span class="visually-hidden">5 out of 5 stars.</span>
          <blockquote class="note__q"><p>${q}</p></blockquote>
          <div class="note__foot">
            <p class="note__by"><strong>${who}</strong><span>${tag}</span></p>
            <a class="note__cake" href="order.html#order-${slug}" aria-label="Order the ${nameOf(slug)} cake">${cut(slug, '', '64px')}</a>
          </div>
        </li>`).join('\n        ')}
        </ul>
      </div>
      <p class="reviews__actions"><a class="btn btn--primary" href="https://search.google.com/local/writereview?placeid=ChIJoXZOdifrwjsRGWtERyUqq4A" target="_blank" rel="noopener">Write a Google review</a><a class="link" href="https://maps.google.com/?cid=9271550597470120729" target="_blank" rel="noopener">Read all our reviews on Google</a></p>
    </div>
  </section>

  <section class="sec inside" id="inside" data-ground="night-2" aria-labelledby="inside-title">
    <div class="wrap">
      ${head("inside", "Come in, it’s lit till twelve", "Glowing arches, a counter full of cakes and a corner for birthdays. This is the shop on Upper Kondhwa Road.", true)}
      <div class="inside__grid">
        <figure class="inside__fig inside__a"><img src="assets/img/shop/arch-cake-800.webp" srcset="assets/img/shop/arch-cake-800.webp 800w, assets/img/shop/arch-cake-1600.webp 1600w" sizes="(min-width: 960px) 34vw, 92vw" width="800" height="1000" alt="A yellow cake on the counter in front of a lit arch with the red Cako sign" loading="lazy" decoding="async"><figcaption>Under the arch</figcaption></figure>
        <figure class="inside__fig inside__v"><video muted loop playsinline preload="none" poster="assets/img/shop/display-loop-poster.jpg" width="600" height="1066" data-autoloop aria-label="A slow pan along the lit display case full of cakes"><source data-src="assets/img/shop/display-loop.mp4" type="video/mp4"></video><figcaption>The counter, tonight</figcaption></figure>
        <figure class="inside__fig inside__c"><img src="assets/img/shop/party-800.webp" srcset="assets/img/shop/party-800.webp 800w, assets/img/shop/party-1600.webp 1600w" sizes="(min-width: 960px) 30vw, 92vw" width="800" height="1000" alt="The party corner: a teal sofa, pink and white balloons and a Happy Birthday banner" loading="lazy" decoding="async"><figcaption>The party corner</figcaption></figure>
        <figure class="inside__fig inside__d"><img src="assets/img/shop/interior-800.webp" srcset="assets/img/shop/interior-800.webp 800w, assets/img/shop/interior-1600.webp 1600w" sizes="(min-width: 960px) 30vw, 92vw" width="800" height="533" alt="The Cako wall: red with white arches, shelves and the cake counters" loading="lazy" decoding="async"><figcaption>The arch wall</figcaption></figure>
      </div>
    </div>
    <div class="inside__strip" role="region" aria-label="More photos from the shop, moving slowly across the screen.">
      <div class="inside__track">
      <ul class="inside__row">
          <li><figure class="inside__card"><img src="assets/img/shop/sign-lamp-800.webp" srcset="assets/img/shop/sign-lamp-800.webp 800w, assets/img/shop/sign-lamp-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="The red Cako sign glowing inside a white arch under a pendant lamp" loading="lazy" decoding="async"><figcaption>The sign, lit</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/party-cakes-800.webp" srcset="assets/img/shop/party-cakes-800.webp 800w, assets/img/shop/party-cakes-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="Three cakes on a low table in front of the teal sofa and balloons" loading="lazy" decoding="async"><figcaption>The birthday corner</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/arch-shelves-800.webp" srcset="assets/img/shop/arch-shelves-800.webp 800w, assets/img/shop/arch-shelves-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="Lit white arches on the red wall, with gift shelves and pendant lamps" loading="lazy" decoding="async"><figcaption>Shelves in the arches</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/candy-cakes-800.webp" srcset="assets/img/shop/candy-cakes-800.webp 800w, assets/img/shop/candy-cakes-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="A chocolate cake, a red heart cake and a yellow cake on a table of coloured sweets" loading="lazy" decoding="async"><figcaption>Three cakes, one table</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/display-2-800.webp" srcset="assets/img/shop/display-2-800.webp 800w, assets/img/shop/display-2-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="The lit glass case with rows of cakes" loading="lazy" decoding="async"><figcaption>Tonight’s display</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/banner-800.webp" srcset="assets/img/shop/banner-800.webp 800w, assets/img/shop/banner-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="A Happy Birthday banner with pink and white balloons" loading="lazy" decoding="async"><figcaption>Ready for a birthday</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/arch-cake-2-800.webp" srcset="assets/img/shop/arch-cake-2-800.webp 800w, assets/img/shop/arch-cake-2-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="A yellow cake in front of a lit arch with the Cako sign" loading="lazy" decoding="async"><figcaption>Under the arch</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/shelves-800.webp" srcset="assets/img/shop/shelves-800.webp 800w, assets/img/shop/shelves-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="Shelves of party hats, boxes and gifts in a lit arch" loading="lazy" decoding="async"><figcaption>Party things</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/display-wide-800.webp" srcset="assets/img/shop/display-wide-800.webp 800w, assets/img/shop/display-wide-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="The glass display case below the lit arches" loading="lazy" decoding="async"><figcaption>The glass case</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/cakes-table-800.webp" srcset="assets/img/shop/cakes-table-800.webp 800w, assets/img/shop/cakes-table-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="Three cakes seen from above on a table of coloured sweets" loading="lazy" decoding="async"><figcaption>From above</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/wall-wide-800.webp" srcset="assets/img/shop/wall-wide-800.webp 800w, assets/img/shop/wall-wide-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="The red wall with white arches above the counters" loading="lazy" decoding="async"><figcaption>The whole wall</figcaption></figure></li>
          <li><figure class="inside__card"><img src="assets/img/shop/arch-wall-800.webp" srcset="assets/img/shop/arch-wall-800.webp 800w, assets/img/shop/arch-wall-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="White arches glowing on the red wall" loading="lazy" decoding="async"><figcaption>Lit till twelve</figcaption></figure></li>
      </ul>
      <ul class="inside__row inside__row--dup" aria-hidden="true">
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/sign-lamp-800.webp" srcset="assets/img/shop/sign-lamp-800.webp 800w, assets/img/shop/sign-lamp-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="The red Cako sign glowing inside a white arch under a pendant lamp" loading="lazy" decoding="async"><figcaption>The sign, lit</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/party-cakes-800.webp" srcset="assets/img/shop/party-cakes-800.webp 800w, assets/img/shop/party-cakes-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="Three cakes on a low table in front of the teal sofa and balloons" loading="lazy" decoding="async"><figcaption>The birthday corner</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/arch-shelves-800.webp" srcset="assets/img/shop/arch-shelves-800.webp 800w, assets/img/shop/arch-shelves-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="Lit white arches on the red wall, with gift shelves and pendant lamps" loading="lazy" decoding="async"><figcaption>Shelves in the arches</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/candy-cakes-800.webp" srcset="assets/img/shop/candy-cakes-800.webp 800w, assets/img/shop/candy-cakes-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="A chocolate cake, a red heart cake and a yellow cake on a table of coloured sweets" loading="lazy" decoding="async"><figcaption>Three cakes, one table</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/display-2-800.webp" srcset="assets/img/shop/display-2-800.webp 800w, assets/img/shop/display-2-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="The lit glass case with rows of cakes" loading="lazy" decoding="async"><figcaption>Tonight’s display</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/banner-800.webp" srcset="assets/img/shop/banner-800.webp 800w, assets/img/shop/banner-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="A Happy Birthday banner with pink and white balloons" loading="lazy" decoding="async"><figcaption>Ready for a birthday</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/arch-cake-2-800.webp" srcset="assets/img/shop/arch-cake-2-800.webp 800w, assets/img/shop/arch-cake-2-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="A yellow cake in front of a lit arch with the Cako sign" loading="lazy" decoding="async"><figcaption>Under the arch</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/shelves-800.webp" srcset="assets/img/shop/shelves-800.webp 800w, assets/img/shop/shelves-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="Shelves of party hats, boxes and gifts in a lit arch" loading="lazy" decoding="async"><figcaption>Party things</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/display-wide-800.webp" srcset="assets/img/shop/display-wide-800.webp 800w, assets/img/shop/display-wide-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="The glass display case below the lit arches" loading="lazy" decoding="async"><figcaption>The glass case</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/cakes-table-800.webp" srcset="assets/img/shop/cakes-table-800.webp 800w, assets/img/shop/cakes-table-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="Three cakes seen from above on a table of coloured sweets" loading="lazy" decoding="async"><figcaption>From above</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/wall-wide-800.webp" srcset="assets/img/shop/wall-wide-800.webp 800w, assets/img/shop/wall-wide-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="The red wall with white arches above the counters" loading="lazy" decoding="async"><figcaption>The whole wall</figcaption></figure></li>
          <li aria-hidden="true"><figure class="inside__card"><img src="assets/img/shop/arch-wall-800.webp" srcset="assets/img/shop/arch-wall-800.webp 800w, assets/img/shop/arch-wall-1600.webp 1600w" sizes="(min-width: 960px) 300px, 62vw" width="800" height="1000" alt="" data-orig="White arches glowing on the red wall" loading="lazy" decoding="async"><figcaption>Lit till twelve</figcaption></figure></li>
      </ul>
      </div>
    </div>
    <p class="wrap inside__hint small">More of the shop, or <a class="link" href="gallery.html">open the full gallery</a>.</p>
    <script>(()=>{const v=document.querySelector("[data-autoloop]");if(!v||!("IntersectionObserver" in window))return;const still=matchMedia("(prefers-reduced-motion: reduce)").matches;new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const s=v.querySelector("source");if(s.dataset.src){s.src=s.dataset.src;s.removeAttribute("data-src");v.load()}if(!still)v.play().catch(()=>{})}else v.pause()}),{rootMargin:"300px"}).observe(v)})();</script>
  </section>

  <section class="sec visit" id="visit" data-ground="night" aria-labelledby="visit-title">
    <div class="wrap visit__grid">
      <figure class="visit__photo framed"><img src="assets/img/shop/logo-arch-800.webp" srcset="assets/img/shop/logo-arch-800.webp 800w, assets/img/shop/logo-arch-1600.webp 1600w" sizes="(min-width: 960px) 34vw, 92vw" width="800" height="1000" alt="The glowing red Cako sign inside a lit white arch" loading="lazy" decoding="async"></figure>
      <div class="visit__copy">
        ${head('visit', 'Find us on Upper Kondhwa Road', '', true)}
        <address class="h3 visit__addr" data-assumed>${ADDRESS}</address>
        <p class="visit__hours">Open every day, 11 am to 12 midnight</p>
        ${live('visit__live')}
        <div class="visit__dial">${hoursDial({ tone: 'night', size: 'sm' })}<p class="small visit__caption">The gold arc is our opening hours. The hand is the time in Pune, right now.</p></div>
        <div class="visit__cta">
          <a class="btn btn--primary" href="${DIRECTIONS}" target="_blank" rel="noopener">${icon('i-navigation')}<span>Get directions</span></a>
          <a class="btn btn--secondary" href="${TEL}">${icon('i-phone')}<span>Call the shop</span></a>
          <a class="link" href="visit.html">Plan your visit</a>
        </div>
      </div>
      <ul class="trio" role="list">
        <li>${icon('i-bike')}<b>Home delivery</b><span data-assumed>Ask us on WhatsApp whether we reach you.</span></li>
        <li>${icon('i-shopping-bag')}<b>Takeaway</b><span data-assumed>Order ahead, collect from the counter.</span></li>
        <li>${icon('i-armchair')}<b>Seats inside</b><span data-assumed>About ₹100 for one.</span></li>
      </ul>
    </div>
  </section>

  <section class="sec faqs" id="faq" data-ground="night-2" aria-labelledby="faq-title">
    <div class="wrap faqs__grid">
      <div class="faqs__main">
        ${head('faq', 'Before you order')}
        ${faqList(HOME_FAQ, 'faq', { ask: true })}
        <a class="link faqs__more" href="order.html#faq">More questions</a>
      </div>
      <aside class="faqs__help paper-card" aria-labelledby="help-title">
        <p class="name" id="help-title">Not answered here?</p>
        <p>Ask us on WhatsApp.</p>
        <a class="btn btn--primary btn--block" href="${waText('Hello Cako, I have a question.')}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>Ask on WhatsApp</span></a>
      </aside>
    </div>
  </section>`,
});
