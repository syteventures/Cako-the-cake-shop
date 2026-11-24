# Copy draft: Cako The Cake Shop, one-page demo

Voice: sensory facts, second person, present tense (copy-registers.md 7), with one move from 12: talk to one person sorting a birthday cake late in the evening. The menu, the order slip and the FAQ go plain.
Pairs: warm, not sugary; sure about the late hours, not loud; neighbourly, not cute.
Person: "you" for the customer, "we" for the shop, Cako by its name; sentences mostly 6 to 16 words; house words kept the same every time: order slip, counter, 12 midnight, pure veg, 1/2 kg, Rs.
Never: hype words (delicious, mouth-watering, indulge, heavenly, baked with love), a pun on cake, a claim outside the facts (eggless, delivery area, charges or times, lead times, payment), an exclamation mark.

Note: how to read this deck. Lines that start with "Note:" are for the builder and never go on the page. Every other line is page copy, in page order, word for word.
Note: DEMO means written for the pitch because the client asked for it; it is replaced before launch and never goes into structured data. ASSUMED means a plausible stand-in the owner must confirm; its element carries data-assumed.
Note: prices are written as the page shows them (Rs 340), with a no-break space between Rs and the figure. 1/2 kg may be typeset as ½ kg.
Note: facts from the brief this deck relies on: the name, the address, +91 84469 66779 (phone and WhatsApp), open every day 11 am to 12 midnight, vegetarian only, home delivery, takeaway, seating, about Rs 100 for one on Zomato, and the Zomato listing name "Cako cake (shop)".

---

Note: part 1 of 10, TITLE AND META. Both are kept word for word from docs/seo-head.html (the SEO pass), so the page has one title and one description.
Note: the title tag (58 characters)
Cako The Cake Shop in Bibvewadi, Pune | Open till Midnight
Note: the meta description (153 characters)
Vegetarian-only cake shop in Bibvewadi, Pune, open every day 11 am to 12 midnight. Home delivery, takeaway and seating. Call or WhatsApp +91 84469 66779.

---

Note: part 2 of 10, NAV. Four links, then one button. Targets: Cakes #cakes, Midnight orders #midnight, Reviews #reviews, Visit #visit. Call the shop is tel:+918446966779. Each link shares a word with the heading of the section it opens.
- Cakes
- Midnight orders
- Reviews
- Visit
- Call the shop
Note: the phone bar (phones only) carries the same two actions in the same words: Order on WhatsApp and Call the shop.

---

Note: part 3 of 10, HERO.
Note: h1, 7 words, 42 characters: the category first, then the place, then the midnight fact. "Cake shop in Bibvewadi" is the SEO pass's first target phrase.
# Cake shop in Bibvewadi, open till midnight
Note: the line under the h1 (79 characters)
Pure veg cakes on Upper Kondhwa Road, with delivery, takeaway and seats inside.
Note: live status in candle amber, filled by script in Asia/Kolkata time whatever the visitor's zone. OPEN from 11:00 to 23:59, CLOSED from 00:00 to 10:59. {left} and {until} read "2 hr 15 min", "40 min" or "1 min". Without script, show the hours sentence from part 7 instead.
Note: OPEN
Open now, till 12 midnight ({left} left)
Note: CLOSED, then its second line
Closed now, opens at 11 am ({until} to go)
You can still send the order slip; we read it when we open.

Note: the order slip, the hero's form (id order). It sends nothing itself: it builds the WhatsApp message below and opens wa.me/918446966779. Labels sit above the fields. Name on the cake is the only optional field. The brief called the fourth field "When"; its label here says what goes in.
Note: the slip's title, a small label over the fields
Order slip
| Label | Placeholder or options (separated by semicolons) | Hint under the field | Error |
| --- | --- | --- | --- |
| Name on the cake | Ishaan | Leave it empty if the cake needs no writing. | none |
| Cake flavour | Choose a flavour; Chocolate truffle; Black forest; Pineapple; Butterscotch; Red velvet; Rasmalai | none | Choose a flavour for the cake. |
| Size | Choose a size; 1/2 kg; 1 kg; 2 kg | none | Choose a size: 1/2 kg, 1 kg or 2 kg. |
| When you need it | Today, before 12 midnight; Tomorrow; Pick a date | none | Choose today, tomorrow or a date. |
| Date | the browser's date picker, from today on (shown only after Pick a date) | none | Pick a date from today onwards. |
Note: ASSUMED: the Name on the cake field assumes the shop writes names on cakes (see part 8); the owner confirms.
Note: the primary button; it opens WhatsApp with the message below
Order on WhatsApp
Note: the secondary button, tel:+918446966779, set as the quieter of the two so the hero reads as one action
Call the shop
Note: the helper line under the buttons
Opens WhatsApp with your order typed out, ready to send.
Note: shown after the button is pressed
Your order is ready in WhatsApp. Press send there, and we reply with the price and the time.
Note: shown if WhatsApp does not open (a desktop without it)
WhatsApp did not open? Call the shop on +91 84469 66779.

Note: the WhatsApp message, exactly, one line each (join the lines with %0A in the wa.me link). {name} is the typed name, or "no writing" when the field is empty; {cake} is the flavour; {size} is the size as shown; {when} is "today, before 12 midnight", "tomorrow" or the picked date written as "Saturday, 22 November".
- Hello Cako, I would like to order a cake.
- Name on the cake: {name}
- Flavour: {cake}
- Size: {size}
- When: {when}
- Please confirm the price and the time.
Note: Order on WhatsApp in the close and the phone bar either scrolls to the order slip (#order) or opens WhatsApp with the first line alone. Pick one and use it in both places.

---

Note: part 4 of 10, THE COUNTER (the menu), section id cakes, set as the lit glass counter. ASSUMED: every item, description and price in this part is a demo value, because the real menu is unknown. Each price element carries data-assumed, and the footer's demo note covers them. The six cakes are the order slip's six flavours, in the same order. On the page the only column heads are 1/2 kg and 1 kg; the three group names are 13px labels.
## Birthday cakes and pastries
Six cakes by the 1/2 kg and 1 kg, pastries by the piece, and cakes made to order. Zomato lists the average at about Rs 100 for one.
Note: the Zomato figure is real (the listing says "Rs 100 for one order (approx.)"). Keep it when the prices change.

### Cakes by weight
| Cake | Description | 1/2 kg | 1 kg |
| --- | --- | --- | --- |
| Chocolate truffle | Dark ganache through every layer | Rs 420 | Rs 820 |
| Black forest | Chocolate sponge, whipped cream and cherries | Rs 340 | Rs 660 |
| Pineapple | Vanilla sponge, cream and pineapple | Rs 320 | Rs 620 |
| Butterscotch | Caramel cream with crunchy butterscotch bits | Rs 360 | Rs 690 |
| Red velvet | Red cocoa sponge with cream cheese frosting | Rs 460 | Rs 890 |
| Rasmalai | Saffron cream, pistachios and pieces of rasmalai | Rs 480 | Rs 940 |
For 2 kg and bigger cakes, ask for the price when you order.

### Pastries and small cakes
| Item | Description | Price |
| --- | --- | --- |
| Truffle pastry | A slice of the chocolate truffle cake | Rs 90 |
| Choco lava cake | Served warm, with a soft chocolate centre | Rs 95 |
| Brownie | Dense chocolate square with walnuts | Rs 85 |
| Jar cake | Cake and cream layered in a jar | Rs 140 |
| Cupcake | Vanilla or chocolate, with a buttercream swirl | Rs 60 |
| Bento cake | A small boxed cake for two | Rs 280 |

### Made to order
| Item | Description | Price |
| --- | --- | --- |
| Photo cake | Your photo printed on the top | Price on request |
| Theme cake | Decorated around a theme you choose | Price on request |
| Number cake | Cut in the shape of a number | Price on request |
| Pinata cake | A chocolate dome you break open | Price on request |
| Tier cake | Two or three tiers for big gatherings | Price on request |
| Half-and-half cake | Two flavours in one cake | Price on request |
Send the photo or the idea on WhatsApp for a price.

---

Note: part 5 of 10, MIDNIGHT ORDERS, section id midnight. The three steps happen in this order, so they carry the numbers 1, 2 and 3 on the page. The second sentence under the heading is the page's one admission.
## How midnight orders work
Cakes from the counter can be collected till 12 midnight. A photo or theme cake takes longer to make, so order it early.
### Send the order
Fill in the order slip and send it on WhatsApp, or call the shop.
### Get the price and the time
We reply with the price and the time the cake will be ready.
### Pick it up, or have it delivered
Collect it from Upper Kondhwa Road before 12 midnight, or have it brought to your door.

---

Note: part 6 of 10, REVIEWS, section id reviews. DEMO: the client asked for a 5-star rating and a few demo reviews. These six people and their words are not real. Never put them or the rating into structured data (no Review or AggregateRating schema), never post them anywhere else, and replace them word for word with real reviews (name, area, stars) before launch. Each card: five stars (aria-label "5 out of 5 stars"), the text, then the name and the area.
## Reviews
Note: the rating line, DEMO
5.0 out of 5, from 6 reviews
Note: review 1, DEMO (a midnight birthday pickup)
Forgot the cake for my husband's birthday until 10 at night. Called Cako, picked up a 1/2 kg pineapple at 11:40, and we cut it at 12.
Ketaki M., Salunke Vihar
Note: review 2, DEMO (the chocolate truffle)
Ordered the 1 kg chocolate truffle for my daughter's seventh birthday. The ganache is dark and only lightly sweet, and all twelve of us got a proper slice.
Omkar D., Upper Indiranagar
Note: review 3, DEMO (the seats)
Good that there are seats inside. Three of us shared a jar cake and two brownies around 11 at night, and nobody hurried us out.
Sana K., Kondhwa
Note: review 4, DEMO (value)
Pastries are about Rs 100 each, so this is our weeknight stop after we shut our own shop. I keep coming back for the brownie.
Ankit R., Market Yard
Note: review 5, DEMO (vegetarian only)
Everything on the counter is vegetarian, which matters in our house. We took the rasmalai cake for my parents' anniversary, and the saffron cream is what everyone talked about.
Mrunal T., Gangadham
Note: review 6, DEMO (home delivery, in the shop's own area so it claims no delivery range)
Stuck at work, so I had a black forest delivered home for Aai's birthday. It reached in a sealed box with the cream intact.
Harshad J., Bibvewadi

---

Note: part 7 of 10, VISIT, section id visit.
## Visit the shop
Note: the address set large (the type moment), linked to the map search
Upper Kondhwa Road, Bibvewadi
Note: the open-now line at the top of the panel uses the two templates from part 3.
Note: the address in the panel on two lines, linked to the same map search; then the phone, linked to tel:+918446966779
Survey 658/9, Ambika Nagar,
Upper Kondhwa Road, Bibvewadi, Pune
+91 84469 66779
Note: the hours sentence, the one wording of the hours on this page (the FAQ, the close and the footer repeat it)
Open every day, 11 am to 12 midnight.
Note: the four services, a short list in Zomato's own words
- Home delivery
- Takeaway
- Seating
- Vegetarian only
Note: buttons. Get directions opens the map search. Call the shop is tel:, worded as in the nav and the hero. Order on Zomato needs the listing's own URL, which the brief does not give: leave that button out until the owner sends it. See the map shows the drawn map in the panel; the brief said "Show the map", and "see" is on the skill's verb list.
- Get directions
- Call the shop
- Order on Zomato
- See the map
Note: the note on finding the shop: two true facts (the Zomato name from the brief, the second spelling from the SEO pass). No landmark is known, so none is given.
Zomato still lists the shop as "Cako cake (shop)", and the area is also spelt Bibwewadi.

---

Note: part 8 of 10, FAQ, section id questions. Every answer shows in full (no accordion).
## Questions before you order
### Are the cakes pure veg?
Yes, the whole shop is vegetarian only. Ask before you order whether a cake can be made eggless.
Note: ASSUMED wording for the egg sentence: the brief does not say whether the cakes contain egg. The owner replaces it with the real answer, and the page says eggless only if every cake is.
### What are the shop timings?
Open every day, 11 am to 12 midnight. For a birthday at midnight, pick the cake up before 12.
### Do you do home delivery?
Yes. Send your address with the order, and we confirm whether we deliver there, the charge and the time. You can also order on Zomato.
### Can you write a name on the cake?
Yes. Type it in the order slip exactly as it should read.
Note: ASSUMED: the brief does not say the shop writes names on cakes. The owner confirms; if it does not, drop this question and the slip's Name on the cake field.
### How do I order?
Send the order slip on WhatsApp, call +91 84469 66779, order on Zomato, or come to the counter on Upper Kondhwa Road.

---

Note: part 9 of 10, CLOSE, on the darkest ground at the foot of the night. The heading is the page's one brand line, and it is literal: the shop is open at 11:59 pm. The fact sits under it, then the two actions, worded as in the hero.
## Still open at 11:59 pm
Open every day, 11 am to 12 midnight, on Upper Kondhwa Road, Bibvewadi.
- Order on WhatsApp
- Call the shop

---

## Footer
Note: part 10 of 10. The address links to the map search, the phone to tel:+918446966779. The demo note sits in the legal row at 13 to 14px and stays while any DEMO or ASSUMED copy is on the page. No Privacy or Terms links: the demo has no such pages.
Cako The Cake Shop
Survey 658/9, Ambika Nagar, Upper Kondhwa Road, Bibvewadi, Pune
+91 84469 66779
Open every day, 11 am to 12 midnight
© 2026 Cako The Cake Shop
Demo site, with a demo menu and demo reviews.
Note: the credits slot. Replace the next line with the exact line photos.mjs credits prints (it opens the credits list), or drop it if the page uses no stand-in photographs.
Photographs via Wikimedia Commons

Note: what the owner must supply before launch: the real menu and prices; whether any cake contains egg; whether the shop writes names on cakes; the delivery area, charges and times; that WhatsApp runs on +91 84469 66779; the Zomato listing URL; real reviews to replace the six demo ones; photographs of the shopfront, the counter, the seats and the cakes.
