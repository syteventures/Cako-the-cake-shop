// Rebuild credits.html from the photographs index.html actually uses (ids found in file names "photo-f<id>-...").
// Usage: node tools/build_credits.js   (run from the site folder)
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const page = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const found = JSON.parse(fs.readFileSync(path.join(root, '.taste-skill', 'found.json'), 'utf8')).photos;
const byId = Object.fromEntries(found.map((p) => [p.id, p]));
const used = [...new Set([...page.matchAll(/photo-(f\d+)-/g)].map((m) => m[1]))];
const missing = used.filter((id) => !byId[id]);
if (missing.length) throw new Error('no licence record for: ' + missing.join(', '));

// what each frame shows on this site (alt text of its first <img>)
const shows = (id) => {
  const m = new RegExp('photo-' + id + '-[^"]*"[^>]*?alt="([^"]+)"').exec(page);
  return m ? m[1] : byId[id].alt;
};
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const lic = (p) => (p.licenceUrl ? `<a href="${esc(p.licenceUrl)}">${esc(p.licence)}</a>` : esc(p.licence));
const rows = used.map((id) => {
  const p = byId[id];
  return `      <li><span>${esc(shows(id))}</span>: photograph by <a href="${esc(p.page)}">${esc(p.by)}</a>, ${lic(p)}, cropped and resized</li>`;
}).join('\n');

const html = `<!doctype html>
<html lang="en-IN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Photograph credits | Cako The Cake Shop</title>
<meta name="description" content="Photographers, licences and sources of the photographs on the Cako The Cake Shop website.">
<meta name="robots" content="noindex, nofollow">
<meta name="theme-color" content="#1b0d0a">
<link rel="icon" href="favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="assets/css/site.css">
<style>
  .legal { padding: 56px 0 96px; }
  .legal h1 { font-family: var(--font-display); font-size: clamp(2.2rem, 1.4rem + 3vw, 3.5rem); line-height: 1.04; margin-top: 32px; }
  .legal p { color: var(--mute); max-width: 64ch; margin-top: 16px; }
  .legal ul { margin: 32px 0 0; padding: 0; list-style: none; max-width: 820px; }
  .legal li { padding: 14px 0; border-top: 1px solid var(--night-line); color: var(--mute); }
  .legal li span { color: var(--cream); font-weight: 700; }
  .legal a { color: var(--cream); }
  body { padding-bottom: 0; }
</style>
</head>
<body>
<main class="legal">
  <div class="wrap">
    <a class="brand" href="index.html"><img src="assets/brand/cako-badge.svg" width="64" height="64" alt="Cako The Cake Shop, back to the home page"></a>
    <h1>Photograph credits</h1>
    <p>This site does not have the shop&#39;s own photographs yet, so these licensed photographs from Wikimedia Commons stand in until the owner&#39;s own pictures replace them. They show other bakers&#39; cakes, not Cako&#39;s. Each one has been cropped and resized for this page; adaptations of CC BY-SA photographs are shared under the same licence.</p>
    <ul>
${rows}
    </ul>
    <p><a href="index.html">Back to Cako The Cake Shop</a></p>
  </div>
</main>
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'credits.html'), html);
console.log('credits.html:', used.length, 'photographs:', used.join(', '));
