// Generates the four pages (index, cakes, order, visit) plus sitemap.xml, robots.txt and the bundled stylesheet.
// Run: npm run pages. Data and helpers: tools/site/data.mjs; shell: tools/site/shell.mjs; one module per page.
// Styles: edit assets/css/src/*.css (and the component files in assets/css/parts/ listed in PARTS);
// they are joined, in file-name order, into assets/css/site.css. Never edit site.css by hand.
import fs from 'node:fs';
import path from 'node:path';
import { root, SITE } from './site/data.mjs';
import { NAV } from './site/shell.mjs';
import home from './site/home.mjs';
import cakes from './site/cakes.mjs';
import order from './site/order.mjs';
import visit from './site/visit.mjs';
import gallery from './site/gallery.mjs';

// component stylesheets that are part of the build (the rest of assets/css/parts is work in progress)
const PARTS = ['midnight', 'photocake', 'turntable'];

const cssDir = path.join(root, 'assets/css');
const srcCss = fs.readdirSync(path.join(cssDir, 'src')).filter((f) => f.endsWith('.css')).sort().map((f) => path.join(cssDir, 'src', f));
const partCss = PARTS.map((p) => path.join(cssDir, 'parts', `${p}.css`));
// order: the foundation (00-09), then the components, then page files (10+), so pages can adjust components
const isBase = (f) => /^0\d/.test(path.basename(f));
const ordered = [...srcCss.filter(isBase), ...partCss, ...srcCss.filter((f) => !isBase(f))];
fs.writeFileSync(path.join(cssDir, 'site.css'),
  '/* Built by tools/build-pages.mjs from assets/css/src/*.css and assets/css/parts/. Edit those files, not this one. */\n' +
  ordered.map((f) => `\n/* ==== ${path.relative(cssDir, f).replaceAll('\\', '/')} ==== */\n${fs.readFileSync(f, 'utf8').trim()}\n`).join(''));

// asset URLs are root-absolute: Vite serves and copies public/ as is, and bundles the CSS and JS
const abs = (html) => html.replace(/(="|, )assets\//g, '$1/assets/').replace(/="(favicon\.svg|site\.webmanifest)"/g, '="/$1"');
for (const [f, html] of [['index.html', home], ['cakes.html', cakes], ['order.html', order], ['visit.html', visit], ['gallery.html', gallery]]) fs.writeFileSync(path.join(root, f), abs(html));
// sitemap for launch (domain is a placeholder)
fs.writeFileSync(path.join(root, 'public/sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${NAV.map(([h]) => `  <url><loc>${SITE}${h === 'index.html' ? '' : h}</loc></url>`).join('\n')}\n</urlset>\n`);
fs.writeFileSync(path.join(root, 'public/robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}sitemap.xml\n`);
console.log('pages written: index, cakes, order, visit (+ sitemap.xml, robots.txt, assets/css/site.css)');
