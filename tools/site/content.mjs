// Redesign content: copy from _workfiles/content.md (the copy deck), alt text, FAQ bank, occasions, helpers for cut-out images.
// DEMO = pitch content replaced before launch (prices, sample reviews). Anything the owner must confirm carries data-assumed.
import { CAKES, bySlug } from './data.mjs';

export const WA = 'https://wa.me/918446966779';
export const TEL = 'tel:+918446966779';
export const PHONE_TEXT = '+91 84469 66779';
export const ADDRESS = 'Survey 658/9, Ambika Nagar, Upper Kondhwa Road, Bibvewadi, Pune 411037';
export const waText = (t) => `${WA}?text=${encodeURIComponent(t)}`;
export const WA_ORDER = waText('Hello Cako, I\'d like to order a cake.');
export const WA_CUSTOM = waText('Hello Cako, I\'d like to ask about a custom cake.\nDate:\nPeople:\nFlavour:\nI\'ll send a reference photo next.');

export const inr = (n) => '₹' + Number(n).toLocaleString('en-IN');
export const CAT_NAMES = { chocolate: 'Chocolate', fruit: 'Fruit & cream', classic: 'Classics', celebration: 'Celebration' };
export const catCount = (k) => CAKES.filter((c) => c[2] === k).length;

// alt text, word for word from the copy deck
export const ALT = {
  'red-velvet-heart': 'Heart-shaped red velvet cake with white cream rosettes and chocolate hearts, on a gold board.',
  'chocolate-truffle': 'Chocolate truffle cake in glossy dark ganache with red cherries and chocolate shards, on a gold board.',
  'black-forest': 'Black forest cake covered in chocolate curls, with cream rosettes and red cherries, on a gold board.',
  rasmalai: 'Rasmalai cake in saffron-yellow cream with almond slivers, on the shop counter.',
  pineapple: 'Pineapple cake in yellow cream with glazed cherries and chocolate dots, on a gold board.',
  butterscotch: 'Butterscotch cake in caramel cream with butterscotch crunch, almonds and cream rosettes, on a gold board.',
  'black-and-white-drip': 'White cream cake with a dark chocolate drip and a white chocolate fan, on a gold board.',
  'strawberry-butterfly': 'Pink strawberry cream cake with golden butterflies, on the shop counter.',
  'choco-zebra': 'Dark ganache cake piped with a white spiral web, on a gold board.',
  'dark-chocolate-flake': 'Round cake covered in dark chocolate flakes, on a gold board.',
  'choco-vanilla': 'Chocolate and vanilla cake with a chocolate lattice, a white cream border and a white chocolate fan, on a gold board.',
  'choco-nut-crunch': 'Chocolate cake topped with roasted nut crunch, on the shop counter.',
  mango: 'Mango cake in ridged mango cream with a white rosette, on the shop counter.',
  'mango-swirl': 'Mango cake with swirled yellow cream and almonds, on the shop counter.',
  'strawberry-rose': 'Pink strawberry cream cake finished with a chocolate rose, on the shop counter.',
  'strawberry-cream': 'Light pink strawberry cream cake, on the shop counter.',
  'fruit-and-nut': 'White cream cake with tutti frutti and almonds, on the shop counter.',
  'white-forest': 'White forest cake covered in white chocolate shavings, with cream rosettes and cherries, on a gold board.',
  'vanilla-swirl': 'Vanilla cream cake with a chocolate swirl on top, on the shop counter.',
  'vanilla-sprinkle': 'Vanilla cake with chocolate lace, sprinkles and chocolate pieces, on a gold board.',
  'caramel-nut': 'Cream cake topped with caramelised nuts, on the shop counter.',
  'almond-white-chocolate': 'White cream cake with almond slivers and white chocolate pieces, on a gold board.',
  'red-velvet-heart-2': 'Heart-shaped red velvet cake with chocolate hearts, on a gold board.',
  counter: 'Cakes on glass shelves in Cako\'s display counter.',
};

// transparent cut-out (square canvas, cake bottom-aligned); falls back to the 4:5 photo set when a cut-out is missing
export const cut = (slug, alt, sizes, { eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="assets/img/cut/${slug}-480.webp" srcset="assets/img/cut/${slug}-240.webp 240w, assets/img/cut/${slug}-480.webp 480w, assets/img/cut/${slug}-960.webp 960w" sizes="${sizes}" width="960" height="960" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;
// the shop's 4:5 photo
export const photo = (slug, alt, sizes, { eager = false, cls = '' } = {}) =>
  `<img${cls ? ` class="${cls}"` : ''} src="assets/img/cakes/${slug}-480.webp" srcset="assets/img/cakes/${slug}-480.webp 480w, assets/img/cakes/${slug}-900.webp 900w" sizes="${sizes}" width="900" height="1125" alt="${alt}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async">`;

export const FACTS = ['Vegetarian only', 'Open every day, 11 am to 12 midnight', 'Home delivery', 'Takeaway', 'Seats inside', 'Upper Kondhwa Road, Bibvewadi', 'About ₹100 for one'];

export const FLAVOURS = [
  ['chocolate', 'Glossy ganache, dark flakes, drips and nut crunch.', 'See the chocolate cakes', ['chocolate-truffle', 'choco-zebra', 'black-and-white-drip']],
  ['fruit', 'Mango, pineapple, strawberry and cherry, in light cream.', 'See the fruit cakes', ['mango-swirl', 'strawberry-rose', 'white-forest']],
  ['classic', 'Saffron rasmalai, butterscotch crunch, caramel nuts and vanilla.', 'See the classics', ['rasmalai', 'butterscotch', 'caramel-nut']],
  ['celebration', 'A red velvet heart, and a cake with golden butterflies.', 'See the celebration cakes', ['red-velvet-heart', 'strawberry-butterfly', 'red-velvet-heart-2']],
];

// [key, title, line, try-slugs, link text]
export const OCCASIONS = [
  ['birthday', 'Birthday', 'A name on top, and the right size for the room.', ['chocolate-truffle', 'black-forest', 'butterscotch'], 'Plan a birthday cake'],
  ['anniversary', 'Anniversary', 'A red velvet heart for two, or a rasmalai cake for the whole family.', ['red-velvet-heart', 'rasmalai', 'almond-white-chocolate'], 'Plan an anniversary cake'],
  ['midnight', 'Midnight surprise', 'We’re open till 12. Collect before midnight and be home for the candles.', ['black-forest', 'choco-zebra', 'dark-chocolate-flake'], 'Plan a midnight cake'],
  ['kids', 'Kids’ party', 'Butterflies and sprinkles, sized for a room full of kids. Ask us about theme cakes.', ['strawberry-butterfly', 'vanilla-sprinkle', 'choco-vanilla'], 'Plan a party cake'],
  ['office', 'Office celebration', 'A 1.5 kg or 2 kg cake for the whole team. Ask us on WhatsApp about delivery to the office.', ['pineapple', 'black-and-white-drip', 'fruit-and-nut'], 'Plan an office cake'],
  ['festival', 'Festivals', 'Diwali, Christmas, New Year’s Eve and Raksha Bandhan. Message us early in festival weeks.', ['rasmalai', 'fruit-and-nut', 'white-forest'], 'Plan a festival cake'],
];
export const nameOf = (slug) => (bySlug[slug] ? bySlug[slug][1] : slug);

// DEMO: sample reviews, labelled on the page, never in structured data, no names or rating while they are samples
// Google reviews on the Business Profile, quoted as written (2026-11-20). [quote, name, tag, cake slug, note colour, tilt, drop]
export const REVIEWS = [
  ['Bought a chocolate cake from cako. Loved the taste.', 'Nasim Khan', 'Google review', 'chocolate-truffle', '#FFE15D', '-2.4deg', '0px'],
  ['The quality of cakes is really good. I personally loved the rasmalai cake. Must try!', 'Amaan Khan', 'Google review · Takeaway', 'rasmalai', '#FF9CB8', '2.2deg', '14px'],
  ['A must try for sure. The prices are low for this quality, that’s rare!', 'Ethan Hunt', 'Google review · Dine in', 'red-velvet-heart', '#9FE8C0', '-1.6deg', '-6px'],
  ['The cakes are just too good for the price. This shop is a must visit if you’re in upper Bibwewadi! Lovely service too.', 'Faisal Ahmad Shaikh', 'Google review · Takeaway', 'butterscotch', '#FFB36B', '2.8deg', '10px'],
  ['Amazing cakes served here.', 'EHK', 'Google review', 'black-forest', '#8FD3FF', '-2.8deg', '-4px'],
];

export const SAMPLE_REVIEWS = [
  // [quote, name, occasion, cake slug, note colour, tilt, drop]
  ['Walked in at 11:40 pm for my sister’s birthday and the counter was still glowing. Cake in hand before midnight!', 'Riya S.', 'midnight birthday', 'chocolate-truffle', '#FFE15D', '-2.4deg', '0px'],
  ['As a vegetarian family, a shop that is 100% veg makes ordering so easy. No awkward questions, just cake.', 'Meenal K.', 'family dinner', 'pineapple', '#FF9CB8', '2.2deg', '14px'],
  ['The black forest was soft, not too sweet, and the cherries tasted fresh. The whole family finished it in one evening.', 'Aditya P.', 'weekend treat', 'black-forest', '#9FE8C0', '-1.6deg', '-6px'],
  ['The team at the counter is so patient. We changed the order three times and they still smiled.', 'Sneha D.', 'office party', 'butterscotch', '#FFB36B', '2.8deg', '10px'],
  ['Ordered on WhatsApp, confirmed in minutes, and the cake reached home perfectly set. Zero stress.', 'Karan M.', 'home delivery', 'choco-vanilla', '#8FD3FF', '-2.8deg', '-4px'],
  ['That glowing arch wall and the birthday corner are so pretty. We clicked more photos of the shop than the cake!', 'Pooja T.', 'kids’ birthday', 'strawberry-butterfly', '#D2B4FF', '1.8deg', '8px'],
  ['The red velvet heart for our anniversary was gorgeous and tasted even better. Two forks, no leftovers.', 'Nikhil & Isha', 'anniversary', 'red-velvet-heart', '#FF8F85', '-2deg', '16px'],
  ['So many flavours and every one looks like a bakery window. Choosing was the hardest part of the night.', 'Farhan A.', 'late-night run', 'mango', '#FFF09A', '2.6deg', '-8px'],
  ['Fair prices and generous size. The half kg butterscotch easily served six of us.', 'Tanvi J.', 'friends’ get-together', 'white-forest', '#BDEB6B', '-2.6deg', '6px'],
  ['My kids now demand the rasmalai cake every birthday. Saffron cream, almond slivers, not a slice left.', 'Sunita R.', 'family birthday', 'rasmalai', '#FFC4DA', '2deg', '-2px'],
];

// FAQ bank (word for word); pages pick by id
export const FAQ = {
  F1: ['Is everything at Cako vegetarian?', 'Yes. Cako is a vegetarian-only cake shop and bakery.'],
  F2: ['Are your cakes eggless?', 'We’re a vegetarian-only shop. For any question about ingredients, including egg, ask us on WhatsApp before you order.'],
  F3: ['When are you open?', 'Every day, 11 am to 12 midnight.'],
  F4: ['Can I get a cake for a midnight birthday?', 'Yes. We’re open till 12, so you can collect your cake from the counter before midnight. For delivery, ask us on WhatsApp first.'],
  F5: ['Do you deliver?', 'Yes, we do home delivery. Send your address on WhatsApp and we’ll confirm whether we reach you, the charge and the time.'],
  F6: ['How far ahead should I order?', 'It depends on the cake and the size. Send us the date on WhatsApp and we’ll tell you. For a big or custom cake, give us as much notice as you can.'],
  F7: ['Can you write a name on the cake?', 'Yes. Type it in the order slip exactly as it should read, up to 20 characters.'],
  F8: ['Which size should I order?', 'Roughly: ½ kg serves about 4 to 6 people, 1 kg about 8 to 10, 1.5 kg about 12 to 15 and 2 kg about 16 to 20. These are approximate, and thinner slices go further.'],
  F9: ['How do I pay?', 'Ask us on WhatsApp when you order, and we’ll tell you how.'],
  F10: ['How do I keep the cake fresh?', 'Keep it in the fridge, in its box, and take it out 15 to 20 minutes before you cut it. Cream cakes don’t like heat, so don’t leave yours out for long.'],
};
// questions whose answers the owner must confirm
const ASSUMED_FAQ = new Set(['F4', 'F5', 'F6', 'F7', 'F8', 'F10']);
// { ask: true } ends every answer with a link that opens WhatsApp with that exact question written (home signature)
export const faqList = (ids, cls = 'faq', { ask = false } = {}) => `<div class="${cls}">${ids.map((id) => `
        <details class="faq__item" name="${cls}">
          <summary class="faq__q"><span>${FAQ[id][0]}</span><span class="faq__icon" aria-hidden="true"></span></summary>
          <div class="faq__a"><p${ASSUMED_FAQ.has(id) ? ' data-assumed' : ''}>${FAQ[id][1]}</p>${ask ? `<a class="link faq__ask" href="${waText(`Hello Cako. ${FAQ[id][0]}`)}" target="_blank" rel="noopener">Ask this on WhatsApp</a>` : ''}</div>
        </details>`).join('')}
      </div>`;
// FAQPage JSON-LD holding exactly the questions shown on that page
export const faqJsonLd = (ids) => `<script type="application/ld+json">${JSON.stringify({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: ids.map((id) => ({ '@type': 'Question', name: FAQ[id][0], acceptedAnswer: { '@type': 'Answer', text: FAQ[id][1] } })),
})}</script>`;

// the small scalloped badge mark used between marquee items and as a bullet
export const mark = '<svg class="mark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.5l1.9 1.6 2.4-.6 1 2.3 2.4.7-.1 2.5 1.9 1.6-1.2 2.2 1.2 2.2-1.9 1.6.1 2.5-2.4.7-1 2.3-2.4-.6L12 22.5l-1.9-1.6-2.4.6-1-2.3-2.4-.7.1-2.5L2.5 14.4l1.2-2.2-1.2-2.2 1.9-1.6-.1-2.5 2.4-.7 1-2.3 2.4.6z"/></svg>';
