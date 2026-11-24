---
name: Cako The Cake Shop
description: The neighbourhood cake shop still open when a birthday starts at midnight.
colors:
  night: "#1b0d0a"
  night-2: "#24120e"
  night-3: "#2f1813"
  night-line: "#42251d"
  cream: "#fff3e6"
  cream-2: "#f6e4d0"
  field-cream: "#fffaf4"
  ink: "#2a140f"
  ink-2: "#6e4a3c"
  mute: "#cbb19e"
  badge-red: "#ef3334"
  act: "#e0292d"
  act-press: "#c41f23"
  error: "#b3141a"
  amber: "#ffb547"
  veg: "#128a3e"
  veg-on-night: "#3fbf6a"
typography:
  display:
    fontFamily: "Shrikhand, Mukta, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1.45rem + 5.4vw, 5.75rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.012em"
  headline:
    fontFamily: "Shrikhand, Mukta, system-ui, sans-serif"
    fontSize: "clamp(2.2rem, 1.35rem + 2.9vw, 3.75rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.008em"
  title:
    fontFamily: "Mukta, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.005em"
  body:
    fontFamily: "Mukta, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.55
  lede:
    fontFamily: "Mukta, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "clamp(1.125rem, 1.02rem + 0.42vw, 1.3125rem)"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Mukta, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.25
  pipe:
    fontFamily: "'Leckerli One', Shrikhand, cursive"
    fontSize: "30px"
    fontWeight: 400
rounded:
  field: "10px"
  btn: "12px"
  card: "14px"
  slip: "18px"
  panel: "20px"
  pill: "999px"
spacing:
  gutter: "clamp(16px, 4.2vw, 56px)"
  section: "clamp(80px, 10vw, 152px)"
  wrap: "1240px"
  header: "72px"
components:
  button-act:
    backgroundColor: "{colors.act}"
    textColor: "#ffffff"
    typography: "{typography.label}"
    rounded: "{rounded.btn}"
    padding: "0.7rem 1.3rem"
    height: "52px"
  button-act-hover:
    backgroundColor: "{colors.act-press}"
    textColor: "#ffffff"
  button-line:
    backgroundColor: "transparent"
    textColor: "{colors.cream}"
    rounded: "{rounded.btn}"
    padding: "0.7rem 1.3rem"
    height: "52px"
  button-line-on-cream:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.btn}"
    padding: "0.7rem 1.3rem"
    height: "52px"
  input:
    backgroundColor: "{colors.field-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "10px 12px"
    height: "48px"
  segment:
    backgroundColor: "{colors.field-cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.field}"
    padding: "8px 12px"
    height: "44px"
  segment-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.cream}"
  status-chip:
    backgroundColor: "rgba(27, 13, 10, 0.55)"
    textColor: "{colors.cream}"
    rounded: "{rounded.pill}"
    padding: "7px 13px"
  order-slip:
    backgroundColor: "{colors.cream}"
    textColor: "{colors.ink}"
    rounded: "{rounded.slip}"
    padding: "20px 22px"
  review-card:
    backgroundColor: "{colors.night-2}"
    textColor: "{colors.cream}"
    rounded: "{rounded.card}"
    padding: "24px"
  custom-panel:
    backgroundColor: "{colors.cream-2}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "clamp(24px, 4vw, 40px)"
---

# Design System: Cako The Cake Shop

## Overview

**Creative North Star: "The Counter After Dark"**

The page is the shop at night. The ground is dark chocolate, the type is frosting cream, and the only bright island is the counter itself, lit cream like a glass showcase and edged top and bottom with the logo's scalloped piping. Light lives in the photographs (candles, cakes) and in one warm amber reserved for the clock; everything the visitor can act on is red, and nothing else is.

The system is driven by a real clock. The Pune time (Asia/Kolkata) decides open or closed, colours the live line and the now mark, and draws the hours line from 11 am to now once on load. Every other surface is still until touched. Density is moderate and phone-first: large tap targets, a fixed action bar under 960px, and generous section rhythm on the night.

The type is a bakery shopfront, not a pastel boutique: a heavy brush-script display (Shrikhand) for headlines and the address, a plain humanist sans (Mukta) for everything that has to be read or tapped, and piped gel lettering (Leckerli One) only on the cake itself.

**Key Characteristics:**
- Dark chocolate night ground with frosting-cream text; one cream "lit counter" island.
- Red only on the badge and on actions; amber only on the live time and the now mark.
- The logo's scallop reused as piping: the cake rim and the counter's top and bottom edge.
- Flat fills; depth comes from the cream-on-night contrast and from photographs, not from glow.
- A live hours line (11 am to 12 midnight) that opens the page and returns at Visit.
- One label band per counter item: veg mark, name, description, sizes and prices, order link.

## Colors

A two-world palette: dark chocolate for the night, warm cream for the lit counter and the order slip, with two tightly reserved accents.

### Primary
- **Cako Badge Red** (badge-red): the red of the client's logo. It lives in the badge mark and nowhere else on the page.
- **Order Red** (act): every action fill (Order on WhatsApp, Call the shop, Send, Get directions) and the "Order this cake" text links on the night. White text on it holds 4.6:1.
- **Pressed Red** (act-press): hover and pressed state of red actions, and the resting colour of red text links on cream, where Order Red would be too light.

### Secondary
- **Candle Amber** (amber): the live line in the hero, the status-chip dot, the now mark and its time label on the hours line, the flame in the cake preview, and the keyboard focus ring on the night. On closed hours the live elements switch to Muted Caramel.

### Tertiary
- **Veg Mark Green** (veg): the Indian vegetarian mark (green square with a filled circle) on every cake and menu row on cream. On the night the same mark is drawn in **Leaf Green** (veg-on-night) so it holds contrast.

### Neutral
- **Night** (night): the page ground, the solid header, the phone menu and action bar, and the browser theme colour.
- **Night Raised** (night-2): review cards and the map panel.
- **Night Deep Raised** (night-3): a third tonal step, available for nested surfaces on the night.
- **Night Hairline** (night-line): every divider on the night (header underline, FAQ rules, footer rules, card borders).
- **Frosting Cream** (cream): body text on the night, the lit counter's fill, the order slip, the filled part of the hours line.
- **Deep Frosting** (cream-2): the custom-cake panel inside the counter and the placeholder fill behind photographs.
- **Field Cream** (field-cream): input, select and segment fills inside the slip, one step brighter than the paper.
- **Chocolate Ink** (ink): text on cream, the selected segment fill, the focus ring on cream.
- **Cocoa Ink** (ink-2): secondary text on cream (descriptions, notes, unit labels), about 7:1.
- **Muted Caramel** (mute): secondary text on the night (ledes, captions, hour labels, FAQ answers), about 9:1; also the closed-state colour of the live elements.
- **Error Red** (error): field error text and invalid borders in the slip. A state colour, not decoration.

### Named Rules
**The Red Means Act Rule.** Red appears on the badge and on things you press. Nothing decorative is red: no red headings, borders, rules, or backgrounds.

**The Candle Rule.** Amber is the clock. It marks the live time, the now mark and the candle flame, and doubles as the focus ring on the night; it never fills a button or colours a heading.

**The Two Grounds Rule.** A surface is either night (cream text, mute secondary) or cream (ink text, ink-2 secondary). Never put cream text on cream-2 or ink on night.

## Typography

**Display Font:** Shrikhand (with Mukta, system-ui fallback)
**Body Font:** Mukta 400 and 700 (with system-ui, Segoe UI, Roboto fallback)
**Piping Font:** Leckerli One (cake preview only)

All three are self-hosted, subset woff2 files under the SIL Open Font License 1.1. Mukta 400 also carries the Devanagari glyphs for the one Marathi line.

**Character:** a fat, friendly brush script for the shopfront voice against a calm, legible humanist sans; together they read like a hand-painted sign above a printed price card.

### Hierarchy
- **Display** (Shrikhand 400, clamp 2.75rem to 5.75rem, line-height 0.98, -0.012em): the closing line ("Still open at 11:59 pm"). The hero h1 uses the same face at a tighter size (fixed 3.5rem from 960px, fluid up to 3.9rem below) so the slip fits the first viewport.
- **Headline** (Shrikhand 400, clamp 2.2rem to 3.75rem, line-height 1.02): section titles. The Visit address is set even larger (up to 4.25rem) as the section's title.
- **Title** (Mukta 700, 1.3125rem, line-height 1.2): sub-heads; card names in the label band at 1.1875rem. The lead cake's name and the bites group headings switch to Shrikhand.
- **Body** (Mukta 400, 1.0625rem rising to 1.125rem at 960px, line-height 1.55): all running text, lining numerals by default, tabular numerals for prices.
- **Lede** (Mukta 400, clamp 1.125rem to 1.3125rem, line-height 1.5, max 54ch): section introductions, in Muted Caramel on night and Cocoa Ink on cream.
- **Label** (Mukta 700, 0.9375rem): form labels, the hours-line time label, the slip's chosen-cake note.
- **Piping** (Leckerli One, 16px wish line and 30px name): only inside the cake preview, cream with a chocolate stroke.

### Named Rules
**The Piping Stays on the Cake Rule.** Leckerli One is the gel pen on the cake top. It never sets a heading, button or label anywhere else.

**The Sentence Case Rule.** Headings and buttons are plain sentence case in their own face; no uppercase tracked labels or small caps above headings.

## Layout

A centred column of max 1240px with a fluid gutter (16px to 56px). Sections breathe on a fluid rhythm of 80px to 152px top and bottom. The main breakpoint is 960px: below it the page is a single column with a fixed three-button action bar at the foot (Call, WhatsApp order, Directions), a 72px header with the status chip and a menu button, and a full-screen menu; above it the header gains inline nav and a red Call button, and the action bar disappears. Secondary breakpoints (440px, 560px, 720px, 900px, 1100px) only re-flow grids.

- **Hero:** on phones a photo band (54svh, 330px to 560px) with the h1 overlapping its foot, then the slip. From 960px the photograph fills the right 64% and dissolves into the night on its left; the copy and slip sit bottom-left in an 800px column; the hours line runs full width along the bottom edge.
- **Lit counter:** a full-bleed cream band. The shelf is two columns on phones (the lead cake spans both, a lone last item centres at one column wide) and five columns from 960px, with the lead cake as a 7:5 feature row of photograph beside label band.
- **Splits:** two-column splits use 5:6, 5:7 or 7:5 ratios with 48px to 72px gaps; never equal halves for photo plus text.
- **Short screens:** under 960px wide and 500px tall, the header stops being fixed and the action bar hides, so zoomed and landscape views are not covered.

## Elevation & Depth

Depth is mostly tonal. The night has three surface steps (night, night-2, night-3) separated by hairlines, and the cream counter reads as the lit foreground because of contrast, not lift. Two elements carry a soft drop shadow: the order slip (it is a sheet of paper laid on the night table) and the red action button (a faint lift under the fill). There are no glows, no coloured shadows and no blurred halos. The hero photograph has a flat legibility scrim from the night colour at its foot (and, on desktop, a mask that dissolves its left side into the night); it is a fade to ground, not a light source.

### Shadow Vocabulary
- **Paper on the table** (`box-shadow: 0 28px 60px -24px rgba(0,0,0,0.75), 0 2px 8px rgba(0,0,0,0.35)`): the order slip only.
- **Action lift** (`box-shadow: 0 6px 14px -8px rgba(0,0,0,0.55)`, hover `0 8px 18px -8px rgba(0,0,0,0.6)`): red action buttons only.
- **Piped relief** (`filter: drop-shadow(0 1.4px 0 #2a120c)`): the piped letters on the cake preview, so the gel sits on the chocolate.

### Named Rules
**The Light Lives in the Photographs Rule.** Fills are flat. Candles, cakes and the lit counter supply the light; never add gradient glows, neon halos or coloured shadows to make something shine.

## Shapes

Soft, generous corners everywhere: 10px on fields and segments, 12px on buttons, 14px on photographs and review cards, 18px on the order slip, the midnight photograph and the map, 20px on the custom-cake panel, full pills only for the status chip and round markers (live dot, now mark, step numbers). Photographs carry an inset 1px hairline at 8% black so they hold their edge on cream.

The one signature silhouette is the logo's scallop: the badge's 18-lobe sine edge. It returns as the piped rim on the cake preview (with 18 cream rosettes around it), and as a repeating 48px scallop (16px tall) that edges the lit counter at top and bottom, so the cream band looks piped onto the night. The order slip uses a 2px dashed rule under its title, like a tear line on a paper slip.

## Components

### Buttons
Solid and confident, sized for thumbs.
- **Shape:** gently rounded (12px), 52px tall (44px in the small variant), 2px border, Mukta 700 at 1.0625rem, icon at 20px.
- **Primary (act):** Order Red fill with white text and the action lift; pressed to Pressed Red on hover. Used for the one main action in a group (the WhatsApp order, the header Call).
- **Line:** transparent with a 2px cream border at 55% on the night (ink at 35% on cream); hover firms the border and adds an 8% (5% on cream) tint.
- **Press:** every button scales to 0.97 on press. Transitions run 0.18s on the shared ease-out curve.
- **Text action link:** red, bold, 2px underline at 0.25em offset, 44px tap height; "Order this cake" on every counter item.

### Chips
- **Status chip:** a pill with a cream hairline at 22% over a translucent night fill, an 8px amber dot and "Open till 12 tonight"; the dot turns Muted Caramel when closed.

### Cards / Containers
- **Order slip:** cream paper (18px corners) with the paper-on-the-table shadow, a Shrikhand title over a dashed tear line, the cake preview beside a two-column form from 960px.
- **Review card:** night-2 fill, night-line border, 14px corners, 24px padding, stacked in a 1/2/3-column masonry; the featured review sets its quote in Shrikhand.
- **Custom-cake panel:** cream-2 inset inside the counter, 20px corners, fluid 24px to 40px padding.

### Inputs / Fields
- **Style:** Field Cream fill, 2px ink border at 20%, 10px corners, 48px tall, caret in Order Red. Labels above in Mukta 700 at 0.9375rem; optional hints in Cocoa Ink 400.
- **Hover / Focus:** border to 42% ink on hover, full Chocolate Ink on focus.
- **Segments (size, when):** the same field chip as a radio; selected fills with Chocolate Ink and cream text, never red.
- **Error:** bold Error Red text under the field and an Error Red border.
- **Focus ring:** 3px amber outline at 3px offset on the night; 3px ink on cream and inside the slip.

### Navigation
- **Header:** transparent over the hero, turning solid Night with a hairline once scrolled past 24px. Desktop nav in Mukta 400 with a 2px underline that grows from the left on hover. Phones get a 48px menu button that opens a full-screen night menu of Shrikhand links at 2rem divided by hairlines, with action buttons at its foot.
- **Phone action bar:** fixed to the bottom under 960px, night with a hairline top; three equal-weight buttons, the middle one red.

### The Hours Line (signature)
A 6px rounded track at 20% cream spanning 11 am to 12 midnight with 13 hour ticks; the elapsed part fills cream, the now mark is an 18px amber dot ringed in night, with a bold amber time label above that clamps inside the track. Scale labels in Muted Caramel (every 3 hours on phones, hourly marks from 720px). It draws from 11 am to now over 1.2s once on load and is otherwise still; when closed, the mark and label go Muted Caramel.

### The Cake Preview (signature)
A top-down cake in the order slip: a sponge disc, a chocolate top edged with the badge scallop piped in cream, 18 cream rosettes, three candles with amber flames, "Happy Birthday" and the typed name in Leckerli One. Each newly typed letter fades in over 0.32s; the flames flicker briefly when the name changes.

### The Label Band (signature)
Every counter item carries the same facts in the same order: veg mark and name, a one-line description in Cocoa Ink, sizes with prices in tabular numerals, and an "Order this cake" link to its own `#order-<slug>` anchor that opens the slip pre-filled. In a row, prices and links align on one bottom line. Photographs sit above in 4:5 (the lead cake 3:2) and zoom to 1.03 on hover.

## Do's and Don'ts

### Do:
- **Do** keep every action red (act, pressed to act-press) and every non-action element free of red.
- **Do** reserve Candle Amber for the live time, the now mark, the status dot, the flame and the focus ring on the night.
- **Do** edge any cream island set on the night with the logo scallop (48px repeat, 16px tall), as the lit counter does.
- **Do** give every orderable item its own label band in the fixed order (veg mark, name, description, sizes and prices, order link) and its own `#order-<slug>` link.
- **Do** drive time-dependent copy and states from the Pune clock, with a designed closed state in Muted Caramel.
- **Do** keep tap targets at 44px or more and primary buttons at 52px.
- **Do** keep motion to the load moment (a 14px rise over 0.8s, the hours line draw) and to touch responses, all on cubic-bezier(0.16, 1, 0.3, 1), and honour reduced motion.

### Don't:
- **Don't** add gradient glows, neon halos or coloured shadows; fills stay flat and light stays in the photographs.
- **Don't** use red for headings, borders, dividers, backgrounds or decoration.
- **Don't** set anything outside the cake preview in Leckerli One.
- **Don't** build a grid of identical product cards with no lead item, a testimonial carousel, or a pastel bakery hero.
- **Don't** use amber on buttons, headings or large fills.
