# tools/: checks and asset rebuilds

All scripts keep every file on D:. The Python scripts that use Playwright need:

```
set PLAYWRIGHT_BROWSERS_PATH=D:/WEBDEV/_tools/ms-playwright
PY = "D:/WEBDEV/CAKO CAKE SHOP/_workfiles/venv/Scripts/python.exe"              (has Playwright and Pillow)
```

## Checks

| Script | What it does |
|---|---|
| `$PY tools/shoot.py . <out> --time 22:42 --only desktop,mobile --full` | Screenshots at 1440, 1280, 820, 390 and 320 (`--only`). `--time` freezes the Pune clock (`--time 02:15` gives the closed state). Also reports console errors, failed requests and horizontal overflow. |
| `$PY tools/qa.py . [<shots>]` | Drives the page: skip link, the flavour-required error, the piped name, the exact WhatsApp message, the per-cake links, the phone menu, tap sizes, the map. Prints PASS/FAIL. |
| `$PY tools/contrast.py .` | Runtime WCAG contrast of every text node against its real background, at 1440 and 390. |
| `node "<taste skill>/scripts/copy-lint.mjs" index.html --kind place` | Copy lint (taste skill). |
| `node "<taste skill>/scripts/perf.mjs" index.html --profile .taste-skill/chrome-perf` | Page weight and loading (taste skill). Delete `.taste-skill/chrome-perf` afterwards. |

## Asset rebuilds

- **Logo** (`assets/brand/cako-badge.svg`): `build_logo.py` traces the white lettering from `source-logo.jpg` (potrace, 4x upscale) and computes the 18-scallop edge (`analyze_badge.py` and `radii.py` measured it). It needs a venv with `pillow numpy potracer`; the one used lives at `D:/WEBDEV/CAKO CAKE SHOP/_workfiles/venv`.
- **Share image** (`assets/img/og-cako.jpg`): edit `og.html`, then run `$PY tools/render_og.py .`
- **Icon sprite**: built from `icons-src/` (Lucide, ISC; Simple Icons, CC0) and pasted inline at the top of `index.html`'s `<body>` (`sprite.svg.html`).
- **Cake-top preview path**: `icons-src/caketop-path.txt` (the logo's scallop, made bolder) is inlined in the order slip's SVG.
- **Fonts**: subsets of the Google Fonts originals made with fontTools:
  ```
  pyftsubset Mukta-Regular.ttf --unicodes="U+0020-007E,U+00A0-00FF,U+2010-2027,U+2030-203A,U+20B9,U+2212" --text="<the Marathi line>" --layout-features='*' --flavor=woff2 --output-file=mukta-400.woff2
  ```
  Do the same for `Mukta-Bold` (700), `Shrikhand-Regular` and `LeckerliOne-Regular` without `--text`. **If you change the Marathi line in the close section, rebuild `mukta-400.woff2` with the new text**, or the new letters fall back to a system font.
- **Photographs**: `tools/images.py <site-dir>` (run with the cako-tools venv) crops and encodes the Commons stand-ins to WebP. Real photos should replace them; keep the file names (or update `index.html`) and run `photos.mjs credits` only for stand-ins that remain.

