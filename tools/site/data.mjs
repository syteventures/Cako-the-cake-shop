// Shared data and small HTML helpers for the page generator (tools/build-pages.mjs).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const part = (f) => fs.readFileSync(path.join(root, 'tools/partials', f), 'utf8');
export const SITE = 'https://cako-the-cake-shop.vercel.app/'; // live address; change here when a custom domain is bought
export const PHONE = '+918446966779';
export const DIRECTIONS = 'https://www.google.com/maps/dir/?api=1&amp;destination=Cako+Cake&amp;destination_place_id=ChIJoXZOdifrwjsRGWtERyUqq4A';
export const ZOMATO = 'https://www.zomato.com/pune/kekiz-the-cake-shop-2-bibvewadi';

// The shop's own cakes. Names describe the photo; prices are demo values the owner confirms (data-assumed).
export const CAKES = [
  ['red-velvet-heart', 'Red velvet heart', 'celebration', 'Red velvet sponge, cream cheese cream, chocolate hearts', 520, 980],
  ['chocolate-truffle', 'Chocolate truffle', 'chocolate', 'Glossy dark ganache, cherries and chocolate shards', 480, 900],
  ['black-forest', 'Black forest', 'chocolate', 'Chocolate sponge, whipped cream, cherries and curls', 400, 750],
  ['rasmalai', 'Rasmalai', 'classic', 'Saffron cream, almond slivers and rasmalai', 520, 980],
  ['pineapple', 'Pineapple', 'fruit', 'Fresh cream, pineapple and glazed cherries', 380, 700],
  ['butterscotch', 'Butterscotch', 'classic', 'Caramel cream with butterscotch crunch and almonds', 420, 780],
  ['black-and-white-drip', 'Black & white drip', 'chocolate', 'White cream, dark drip, white chocolate fan', 520, 980],
  ['strawberry-butterfly', 'Butterfly celebration', 'celebration', 'Strawberry cream with golden butterflies', 550, 1050],
  ['choco-zebra', 'Choco zebra', 'chocolate', 'Dark ganache piped with a white web', 460, 880],
  ['dark-chocolate-flake', 'Dark chocolate flake', 'chocolate', 'Covered in dark chocolate flakes', 480, 900],
  ['choco-vanilla', 'Choco vanilla', 'chocolate', 'Chocolate and vanilla lattice with a cream border', 440, 840],
  ['choco-nut-crunch', 'Choco nut crunch', 'chocolate', 'Chocolate cream with roasted nut crunch', 500, 950],
  ['mango', 'Mango', 'fruit', 'Mango cream with white rosettes', 420, 800],
  ['mango-swirl', 'Mango swirl', 'fruit', 'Swirled mango cream with almonds', 420, 800],
  ['strawberry-rose', 'Strawberry rose', 'fruit', 'Strawberry cream finished with a chocolate rose', 420, 800],
  ['strawberry-cream', 'Strawberry cream', 'fruit', 'Light strawberry cream and sponge', 400, 760],
  ['fruit-and-nut', 'Fruit & nut', 'fruit', 'Vanilla cream, tutti frutti and almonds', 450, 860],
  ['white-forest', 'White forest', 'fruit', 'White chocolate shavings, cream and cherries', 420, 800],
  ['vanilla-swirl', 'Vanilla swirl', 'classic', 'Vanilla cream with a chocolate swirl', 380, 720],
  ['vanilla-sprinkle', 'Vanilla sprinkle', 'classic', 'Vanilla cream, chocolate lace and sprinkles', 380, 720],
  ['caramel-nut', 'Caramel nut', 'classic', 'Fresh cream topped with caramelised nuts', 460, 880],
  ['almond-white-chocolate', 'Almond white chocolate', 'classic', 'White chocolate, almonds and cream', 480, 900],
];
export const CATS = [['all', 'All cakes'], ['chocolate', 'Chocolate'], ['fruit', 'Fruit & cream'], ['classic', 'Classics'], ['celebration', 'Celebration']];
export const FEATURED = ['red-velvet-heart', 'chocolate-truffle', 'black-forest', 'rasmalai', 'pineapple', 'butterscotch', 'black-and-white-drip', 'strawberry-butterfly'];
export const bySlug = Object.fromEntries(CAKES.map((c) => [c[0], c]));

export const icon = (id, solid) => `<svg class="icon ${solid ? 'icon--solid' : 'icon--line'}" aria-hidden="true"><use href="#${id}"/></svg>`;
export const veg = '<svg class="veg" aria-hidden="true"><use href="#i-veg"/></svg>';
export const img = (slug, alt, sizes, eager) =>
  `<img src="assets/img/cakes/${slug}-480.webp" srcset="assets/img/cakes/${slug}-480.webp 480w, assets/img/cakes/${slug}-900.webp 900w" sizes="${sizes}" width="900" height="1125" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
export const price = (c) => `<p class="band__prices" data-assumed><span><small>½ kg</small> <b>₹${c[4]}</b></span><span><small>1 kg</small> <b>₹${c[5].toLocaleString('en-IN')}</b></span></p>`;
export const live = (cls = '') => `<p class="live ${cls}"><span class="live__dot" aria-hidden="true"></span><span data-live data-open="Open now, till 12 midnight (&lt;strong&gt;{left}&lt;/strong&gt; left)" data-closed="Closed now, opens at 11 am (&lt;strong&gt;{until}&lt;/strong&gt; to go)">Open every day, 11 am to 12 midnight.</span></p>`;
export const hoursLine = (full = true) => `<div class="hours" data-hours role="img" data-aria="Open every day from 11 am to 12 midnight." data-open="Now {time}" data-closed="Opens 11 am" aria-label="Open every day from 11 am to 12 midnight.">
        <div class="hours__track"><div class="hours__ticks" aria-hidden="true"></div><div class="hours__fill"></div><div class="hours__now"></div><span class="hours__label" data-hours-label aria-hidden="true"></span></div>
        <ol class="hours__scale" aria-hidden="true"><li style="left:0">11 am</li>${full ? '<li class="tick-mid" style="left:30.77%">3 pm</li>' : ''}<li class="tick-mid" style="left:53.85%">6 pm</li>${full ? '<li class="tick-mid" style="left:76.92%">9 pm</li>' : ''}<li style="left:100%">12 midnight</li></ol>
      </div>`;
export const cakeCard = (c) => `<article class="cake" data-cat="${c[2]}" id="cake-${c[0]}">
          <a class="cake__photo" href="order.html#order-${c[0]}" aria-label="Order the ${c[1]} cake">${img(c[0], `${c[1]} cake from Cako`, '(min-width: 1100px) 280px, (min-width: 720px) 33vw, 50vw')}</a>
          <div class="band">
            <h3 class="band__name">${veg}${c[1]}</h3>
            <p class="band__desc">${c[3]}.</p>
            ${price(c)}
            <a class="link-act" href="order.html#order-${c[0]}">Order this cake</a>
          </div>
        </article>`;

export const marquee = () => {
  const names = CAKES.slice(0, 12).map((c) => `<span>${c[1]}</span>`).join('<i></i>');
  return `<div class="marquee" aria-hidden="true"><div class="marquee__track">${names}<i></i>${names}<i></i></div></div>`;
};
export const badge = `<svg class="spin-badge" viewBox="0 0 200 200" aria-hidden="true"><defs><path id="ring" d="M100 100m-74 0a74 74 0 1 1 148 0a74 74 0 1 1-148 0"/></defs><circle cx="100" cy="100" r="98" fill="#ef3334"/><text><textPath href="#ring" textLength="458" lengthAdjust="spacing">OPEN TILL 12 MIDNIGHT · EVERY DAY · </textPath></text><circle cx="100" cy="100" r="40" fill="#fff3e6"/><text class="spin-badge__mid" x="100" y="110" text-anchor="middle">12</text></svg>`;
export const steps = `<ol class="steps">
          <li class="step"><span class="step__n" aria-hidden="true">1</span><div><h3 class="step__t">Send the order</h3><p class="step__d">Fill in the order slip and send it on WhatsApp, or call the shop.</p></div></li>
          <li class="step"><span class="step__n" aria-hidden="true">2</span><div><h3 class="step__t">Get the price and the time</h3><p class="step__d">We reply with the price and the time the cake will be ready.</p></div></li>
          <li class="step"><span class="step__n" aria-hidden="true">3</span><div><h3 class="step__t">Pick it up, or have it delivered</h3><p class="step__d">Collect it from Upper Kondhwa Road before 12 midnight, or ask for home delivery: we confirm the area, the charge and the time.</p></div></li>
        </ol>`;
export const reviews = [
  ['Forgot the cake for my husband\'s birthday until 10 at night. Called Cako, picked up a ½ kg pineapple at 11:40, and we cut it at 12.', 'Ketaki M.', 'Salunke Vihar', true],
  ['Ordered the 1 kg chocolate truffle for my daughter\'s seventh birthday. The ganache is dark and only lightly sweet.', 'Omkar D.', 'Upper Indiranagar'],
  ['The red velvet heart looked exactly like the photo on WhatsApp. Soft sponge, not too sweet.', 'Sana K.', 'Kondhwa'],
  ['Everything on the counter is vegetarian, which matters in our house. The rasmalai cake is what everyone talked about.', 'Mrunal T.', 'Gangadham'],
  ['Stuck at work, so I had a black forest delivered home for Aai\'s birthday. It reached with the cream intact.', 'Harshad J.', 'Bibvewadi'],
  ['Two pastries and a brownie for under ₹200. Our weeknight stop after we shut our own shop.', 'Ankit R.', 'Market Yard'],
];
export const stars = `<span class="stars" role="img" aria-label="5 out of 5 stars">${'<svg class="icon icon--solid"><use href="#i-star"/></svg>'.repeat(5)}</span>`;

