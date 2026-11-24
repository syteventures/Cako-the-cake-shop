// Order page (brief section 11, "the order slip"). Copy: _workfiles/content.md "ORDER", word for word.
// The slip markup lives here (tools/partials/slip.html is no longer used).
// Styles: assets/css/src/20-pages.css (desk, slip, preview, ocake, bubble, acts, ohow, opd, ocare, ofaq).
// Behaviour: assets/js/site.js (live piping, the WhatsApp message, validation, pre-selection, the phone bar).
import { CAKES, icon, live, part } from './data.mjs';
import { CAT_NAMES, WA_ORDER, TEL, PHONE_TEXT, faqList, faqJsonLd } from './content.mjs';
import { page } from './shell.mjs';

const ORDER_FAQ = ['F2', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10'];
const GROUPS = ['chocolate', 'fruit', 'classic', 'celebration'];
const OCCASIONS = [['birthday', 'Birthday'], ['anniversary', 'Anniversary'], ['midnight', 'Midnight surprise'], ['kids', 'Kids’ party'], ['office', 'Office celebration'], ['festival', 'Festival'], ['other', 'Something else']];
const SIZES = [['half', '½ kg', '4 to 6'], ['1', '1 kg', '8 to 10'], ['15', '1.5 kg', '12 to 15'], ['2', '2 kg', '16 to 20']];
const DEFAULT_SIZE = '1';

const cakeOptions = GROUPS.map((k) => `<optgroup label="${CAT_NAMES[k]}">
                ${CAKES.filter((c) => c[2] === k).map((c) => `<option value="${c[0]}" data-f="${k}" data-p="${c[4]} ${c[5]}">${c[1]}</option>`).join('\n                ')}
              </optgroup>`).join('\n              ');

const radio = (name, id, value, label, extra = '') => `<input type="radio" name="${name}" id="${id}" value="${value}"${extra}><label for="${id}">${label}</label>`;
const errorLine = (id, text) => `<p class="field__error" id="${id}" hidden><svg class="icon icon--line" viewBox="0 0 20 20" aria-hidden="true"><circle cx="10" cy="10" r="8"/><path d="M10 5.8v5M10 13.6v.4"/></svg><span>${text}</span></p>`;

// the send, call and copy actions: once in the preview (desktop) and once at the slip's foot (phones).
// On phones the send button is a direct child of the slip, so it can stick to the bottom of the screen while the slip is in view.
const sendBtn = (block) => `<a class="btn btn--primary${block ? ' btn--block' : ''}" data-send href="${WA_ORDER}" target="_blank" rel="noopener">${icon('b-whatsapp', 1)}<span>Send on WhatsApp</span></a>`;
const copyIcons = `<span class="copy-ico copy-ico--a">${icon('i-copy')}</span><span class="copy-ico copy-ico--b">${icon('i-check')}</span>`;
const actions = (where) => `<div class="acts acts--${where}">
          ${where === 'preview' ? sendBtn(true) : ''}
          <div class="acts__row">
            <a class="btn btn--secondary btn--sm" href="${TEL}">${icon('i-phone')}<span>Call the shop</span></a>
            <button class="btn btn--secondary btn--sm" type="button" data-copy-message>${copyIcons}<span data-copy-label>Copy message</span></button>
          </div>
          <p class="acts__note">Nothing is sent until you press send in WhatsApp.</p>
          <div class="acts__after" role="status" data-after></div>
          <p class="acts__closed" data-assumed><span class="acts__dot" aria-hidden="true"></span>We’re closed right now and open at 11 am. Send the slip anyway, and we’ll reply when we open.</p>
        </div>`;

const slip = `<form class="slip paper-card" id="slip" data-ground="paper" novalidate aria-labelledby="slip-title">
          <div class="slip__head">
            <h2 class="slip__title" id="slip-title">Order slip</h2>
            <img class="slip__stamp" src="assets/brand/cako-badge.svg" width="44" height="44" alt="" loading="lazy">
          </div>
          <div class="slip__fields">
            <div class="field slip__name" data-assumed>
              <label for="f-name">Name on the cake <span class="field__opt">(optional)</span></label>
              <input class="input" id="f-name" name="name" type="text" maxlength="20" autocomplete="off" spellcheck="false" placeholder="Ishaan" aria-describedby="f-name-hint" enterkeyhint="next">
              <p class="field__hint" id="f-name-hint">Up to 20 characters. Leave it empty for no writing.</p>
            </div>
            <div class="field slip__wish" data-assumed>
              <label for="f-wish">Wish</label>
              <select class="select" id="f-wish" name="wish" aria-describedby="f-wish-hint">
                <option value="Happy Birthday" selected>Happy Birthday</option>
                <option value="Happy Anniversary">Happy Anniversary</option>
                <option value="Congratulations">Congratulations</option>
                <option value="">Name only</option>
              </select>
              <p class="field__hint" id="f-wish-hint">Shown on the preview.</p>
            </div>
            <div class="field slip__cake" data-assumed>
              <label for="f-cake">Cake</label>
              <select class="select" id="f-cake" name="cake" required>
                <option value="" selected>Choose a cake</option>
              ${cakeOptions}
              </select>
              ${errorLine('f-cake-error', 'Choose a cake to continue.')}
            </div>
            <fieldset class="field slip__size" data-assumed aria-describedby="f-size-hint">
              <legend class="field__label">Size</legend>
              <div class="seg slip__seg slip__seg--4">
                ${SIZES.map(([v, l, n]) => radio('size', `f-size-${v}`, l, l, ` data-serves="${n}"${v === DEFAULT_SIZE ? ' checked' : ''}`)).join('\n                ')}
              </div>
              <p class="field__hint" id="f-size-hint">Serves about <span data-serves-out>8 to 10</span> people.</p>
              ${errorLine('f-size-error', 'Choose a size.')}
            </fieldset>
            <fieldset class="field slip__when" aria-describedby="f-when-hint">
              <legend class="field__label">When do you need it?</legend>
              <div class="seg slip__seg slip__seg--3">
                ${radio('when', 'f-when-today', 'today', 'Today', ' checked')}
                ${radio('when', 'f-when-tomorrow', 'tomorrow', 'Tomorrow')}
                ${radio('when', 'f-when-date', 'date', 'Pick a date')}
              </div>
              <p class="field__hint" id="f-when-hint">Today: We’re open till 12 midnight tonight.</p>
              ${errorLine('f-when-error', 'Choose a day.')}
            </fieldset>
            <div class="field slip__date" data-date>
              <label for="f-date">Date</label>
              <input class="input" id="f-date" name="date" type="date">
              ${errorLine('f-date-error', 'Pick today or a later date.')}
            </div>
            <details class="slip__more" id="f-more">
              <summary class="slip__more-btn"><span>Add details (optional)</span><span class="slip__more-icon" aria-hidden="true"></span></summary>
              <div class="slip__more-body">
                <div class="field">
                  <label for="f-occasion">Occasion</label>
                  <select class="select" id="f-occasion" name="occasion">
                    <option value="" selected>Choose an occasion</option>
                    ${OCCASIONS.map(([v, l]) => `<option value="${v}">${l}</option>`).join('\n                    ')}
                  </select>
                </div>
                <div class="field">
                  <label for="f-time">Around what time?</label>
                  <input class="input" id="f-time" name="time" type="text" maxlength="24" autocomplete="off" placeholder="11:30 pm">
                </div>
                <fieldset class="field slip__mode" data-assumed aria-describedby="f-mode-hint">
                  <legend class="field__label">Pickup or delivery</legend>
                  <div class="slip__pills">
                    ${radio('mode', 'f-mode-pickup', 'pickup', 'I’ll collect it')}
                    ${radio('mode', 'f-mode-delivery', 'delivery', 'Ask about delivery')}
                  </div>
                  <p class="field__hint" id="f-mode-hint">Delivery: Add your area in WhatsApp. We’ll confirm whether we reach you, the charge and the time.</p>
                </fieldset>
                <div class="field slip__notes">
                  <label for="f-notes">Anything else?</label>
                  <textarea class="input" id="f-notes" name="notes" rows="3" maxlength="400" placeholder="An allergy, a design idea, a second line of writing"></textarea>
                </div>
              </div>
            </details>
          </div>
          <div class="slip__send">${sendBtn(true)}</div>
          ${actions('slip')}
        </form>`;

const preview = `<aside class="preview" data-ground="night-2" aria-labelledby="preview-cap" data-preview>
          <p class="preview__cap" id="preview-cap">Preview. Your writing, on the cake you chose.</p>
          <div class="preview__stage" aria-hidden="true">
            <div class="ocake" data-family="none">
              <span class="ocake__pool"></span>
              <span class="ocake__contact"></span>
              <span class="ocake__plate"></span>
              <span class="ocake__board"></span>
              <span class="ocake__turn"><span class="ocake__top"></span><span class="ocake__beads"></span></span>
              <span class="ocake__sheen"></span>
              <span class="ocake__writing">
                <span class="ocake__line ocake__wish pipe" data-pipe="wish">Happy Birthday</span>
                <span class="ocake__line ocake__name pipe" data-pipe="name"></span>
              </span>
            </div>
          </div>
          <div class="preview__copy">
            <p class="preview__price" data-price data-assumed hidden></p>
            <div class="bubble" data-message>Hello Cako, I'd like to order a cake.</div>
          </div>
          ${actions('preview')}
        </aside>`;

export default page({
  file: 'order.html',
  title: 'Order a Cake on WhatsApp | Cako Cake, Pune',
  description: 'Choose a cake and size, add the name for the top, and send your order to Cako on WhatsApp. Collect in Bibvewadi till 12 midnight, or ask about delivery.',
  ogTitle: 'Order a Cake on WhatsApp',
  jsonld: part('jsonld.html') + '\n' + faqJsonLd(ORDER_FAQ),
  preload: '<link rel="preload" href="assets/fonts/sofia-latin.woff2" as="font" type="font/woff2" crossorigin>\n',
  bodyClass: 'page-order',
  body: `
  <section class="ihero desk-hero" id="order-top" data-ground="night" aria-labelledby="order-title">
    <div class="ihero__glow desk-hero__glow" aria-hidden="true"></div>
    <div class="wrap desk-hero__in">
      <h1 class="display-l" id="order-title">Order a cake</h1>
      <div class="desk-hero__copy">
        <p class="lede" data-assumed>Fill in the slip below. It opens WhatsApp with your order typed out. Press send, and we’ll reply with the price and the time.</p>
        ${live('desk-hero__live')}
      </div>
    </div>
  </section>

  <section class="desk" id="order" data-ground="night" aria-labelledby="slip-title">
    <div class="desk__anchors">${CAKES.map((c) => `<span class="desk__anchor" id="order-${c[0]}"></span>`).join('')}</div>
    <div class="wrap desk__grid">
        ${slip}
        ${preview}
    </div>
  </section>

  <section class="ohow" id="how" data-ground="night-2" aria-labelledby="how-title">
    <div class="wrap">
      <h2 class="h2 ohow__title" id="how-title">How ordering works</h2>
      <ol class="steps-list ohow__steps">
        <li><b>Fill in the slip.</b> <span>Cake, size, day, and the writing for the top.</span></li>
        <li><b>Send it on WhatsApp.</b> <span>Your message is typed out. You only press send.</span></li>
        <li data-assumed><b>We confirm.</b> <span>We reply with the price and the ready time. Then you collect it, or we talk about delivery.</span></li>
      </ol>
    </div>
  </section>

  <section class="opd" id="pickup-delivery" data-ground="night" aria-labelledby="pd-title">
    <div class="wrap ip-grid">
      <h2 class="h2 opd__title" id="pd-title">Pickup and delivery</h2>
      <div class="opd__col" data-assumed>
        ${icon('i-shopping-bag')}
        <h3 class="opd__h">Pickup</h3>
        <p>Collect from the counter at Survey 658/9, Ambika Nagar, Upper Kondhwa Road, Bibvewadi. We’re open every day, 11 am to 12 midnight. Tell us roughly when you’ll come.</p>
      </div>
      <div class="opd__col" data-assumed>
        ${icon('i-bike')}
        <h3 class="opd__h">Delivery</h3>
        <p>We do home delivery. Send your address on WhatsApp, and we’ll confirm whether we reach you, the charge and the time. Planning a midnight delivery? Ask us before you plan around it.</p>
      </div>
    </div>
  </section>

  <section class="ocare" id="care" data-ground="night-2" aria-labelledby="care-title">
    <div class="wrap ip-grid">
      <h2 class="h2 ocare__title" id="care-title">Getting it home</h2>
      <ol class="ocare__list" data-assumed>
        <li>Carry the box flat and level. In a car, the floor is flatter than a seat.</li>
        <li>On a scooter, keep the box level and take the speed breakers slowly.</li>
        <li>Keep it out of the sun.</li>
        <li>Put it in the fridge, in its box, as soon as you’re home.</li>
        <li>Take it out 15 to 20 minutes before you cut it.</li>
        <li>Cream cakes don’t like heat. Put what’s left back in the fridge soon after cutting.</li>
        <li>Ask us how long your cake keeps.</li>
      </ol>
    </div>
  </section>

  <section class="ofaq" id="faq" data-ground="night" aria-labelledby="faq-title">
    <div class="wrap ip-grid">
      <h2 class="h2 ofaq__title" id="faq-title">Ordering questions</h2>
      ${faqList(ORDER_FAQ)}
    </div>
  </section>`,
});
