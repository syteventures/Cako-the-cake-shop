"""Crop and encode the Cako stand-in photographs to WebP. Sources: Wikimedia Commons thumbnails."""
import io, json, os, sys, urllib.request, urllib.error
from PIL import Image, ImageOps
SITE = sys.argv[1]
IMG = os.path.join(SITE, "assets", "img")
CACHE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "src-cache"); os.makedirs(CACHE, exist_ok=True)
found = {p["id"]: p for p in json.load(open(os.path.join(SITE, ".taste-skill", "found.json"), encoding="utf-8"))["photos"]}
UA = "CakoDemoSiteBuilder/1.0 (static demo page; image resize for local preview)"

import time, glob
def local(pid):
    best = None
    for f in glob.glob(os.path.join(IMG, f"photo-{pid}*.jpg")):
        im = Image.open(f)
        if best is None or im.width > best[1]: best = (f, im.width)
    return best

def thumb(pid, width):
    lc = local(pid)
    cache0 = os.path.join(CACHE, f"{pid}-{width}.jpg")
    if lc and lc[1] >= min(width, 1280) and not os.path.exists(cache0):
        return ImageOps.exif_transpose(Image.open(lc[0])).convert("RGB")
    url = found[pid]["url"]
    parts = url.split("/wikipedia/commons/")[1]          # a/ab/File.jpg
    name = parts.split("/")[-1]
    turl = f"https://upload.wikimedia.org/wikipedia/commons/thumb/{parts}/{width}px-{name}"
    cache = os.path.join(CACHE, f"{pid}-{width}.jpg")
    if not os.path.exists(cache):
        for attempt in range(6):
            try:
                req = urllib.request.Request(turl, headers={"User-Agent": UA})
                with urllib.request.urlopen(req, timeout=60) as r: open(cache, "wb").write(r.read())
                break
            except urllib.error.HTTPError as e:
                if e.code != 429 or attempt == 5: raise
                time.sleep(20 * (attempt + 1))
    im = Image.open(cache); im = ImageOps.exif_transpose(im).convert("RGB")
    return im

def crop_frac(im, x0, y0, x1, y1):
    W, H = im.size
    return im.crop((int(W * x0), int(H * y0), int(W * x1), int(H * y1)))

def crop_aspect(im, aspect, cx=0.5, cy=0.5):
    """Largest crop of the given aspect (w/h) centred near (cx, cy)."""
    W, H = im.size
    if W / H > aspect: w, h = int(H * aspect), H
    else: w, h = W, int(W / aspect)
    x = min(max(int(W * cx - w / 2), 0), W - w); y = min(max(int(H * cy - h / 2), 0), H - h)
    return im.crop((x, y, x + w, y + h))

def save(im, base, widths, q=78):
    out = []
    for w in widths:
        if w > im.width: w = im.width
        r = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS) if w != im.width else im
        path = os.path.join(IMG, f"{base}-{w}.webp")
        r.save(path, "WEBP", quality=q, method=6)
        out.append((os.path.basename(path), r.width, r.height, os.path.getsize(path) // 1024))
    return out

jobs = []
# hero: desktop frame (right side, feathered) and the 4:5 phone crop
h = thumb("f49362853", 1920)
jobs += save(crop_frac(h, 0.10, 0.0, 0.90, 1.0), "photo-f49362853-wide", [1000, 1536], q=74)
jobs += save(crop_aspect(h, 4 / 5, cx=0.48), "photo-f49362853-phone", [600, 860], q=74)
# midnight section: cake in the dark, 4:5
jobs += save(crop_aspect(thumb("f37208737", 1920), 4 / 5, cx=0.45, cy=0.5), "photo-f37208737-tall", [640, 1040])
# counter: the lead cake and the shelf
jobs += save(crop_aspect(thumb("f33803813", 1920), 1.0, cx=0.5, cy=0.52), "photo-f33803813-sq", [720, 1200])
jobs += save(crop_aspect(thumb("f94961509", 960), 4 / 5, cx=0.5), "photo-f94961509-card", [480, 760])
jobs += save(crop_aspect(thumb("f27067668", 1280), 4 / 5, cx=0.5), "photo-f27067668-card", [480, 760])
jobs += save(crop_aspect(thumb("f143416029", 1280), 4 / 5, cx=0.55), "photo-f143416029-card", [480, 760])
jobs += save(crop_aspect(thumb("f113100349", 960), 4 / 5, cx=0.5, cy=0.55), "photo-f113100349-card", [480, 760])
# small bites and the made-to-order craft
# the right 10% holds a handwritten euro price tag: drop it before the 16:10 window
jobs += save(crop_aspect(crop_frac(thumb("f107930153", 1920), 0, 0, 0.9, 1.0), 16 / 10, cx=0.5, cy=0.5), "photo-f107930153-wide", [800, 1120], q=66)
jobs += save(crop_aspect(thumb("f198053684", 1280), 1.0, cx=0.5), "photo-f198053684-sq", [480, 760])
jobs += save(crop_aspect(thumb("f94426342", 1280), 1.0, cx=0.5), "photo-f94426342-sq", [480, 760])
jobs += save(crop_aspect(thumb("f13358647", 1280), 4 / 3, cx=0.5), "photo-f13358647-wide", [640, 1000])
tot = 0
for name, w, hgt, kb in jobs:
    tot += kb; print(f"{name:42s} {w}x{hgt} {kb} KB")
print("total", tot, "KB")
