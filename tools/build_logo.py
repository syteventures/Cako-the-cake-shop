import math, sys
import numpy as np
from PIL import Image
import potrace

SRC = sys.argv[1]; OUT = sys.argv[2]
cx, cy = 358.6, 431.0          # badge centre in source px
R_PEAK, R_TROUGH, R_RING = 219.17, 205.79, 235.6
N = 18
S = 240.0 / R_RING             # scale source px -> svg units (ring radius 240 in a 512 box)
C = 256.0

im = Image.open(SRC).convert("RGB")
# --- lettering mask: crop a square around the inner disc, upscale x4 on the green channel
pad = int(R_TROUGH - 4)
box = (int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad))
crop = im.crop(box)
g = crop.getchannel("G")
UP = 4
g = g.resize((g.width * UP, g.height * UP), Image.LANCZOS)
a = np.asarray(g).astype(np.float32)
# keep only inside the inner disc (avoid scallop edge)
hh, ww = a.shape
yy, xx = np.mgrid[0:hh, 0:ww]
rr = np.hypot(xx - ww / 2, yy - hh / 2)
inside = rr < (R_TROUGH - 8) * UP
mask = (a > 150) & inside
bm = potrace.Bitmap(~mask)
plist = bm.trace(turdsize=12, turnpolicy=potrace.POTRACE_TURNPOLICY_MINORITY, alphamax=1.0, opticurve=True, opttolerance=0.25)

def tx(pt):
    # upscaled crop px -> source px -> svg units
    x = box[0] + pt[0] / UP; y = box[1] + pt[1] / UP
    return (C + (x - cx) * S, C + (y - cy) * S)

def f(v): return ("%.1f" % v).rstrip("0").rstrip(".")
parts = []
for curve in plist:
    sp = tx((curve.start_point.x, curve.start_point.y))
    d = ["M%s %s" % (f(sp[0]), f(sp[1]))]
    for seg in curve:
        if seg.is_corner:
            c = tx((seg.c.x, seg.c.y)); e = tx((seg.end_point.x, seg.end_point.y))
            d.append("L%s %sL%s %s" % (f(c[0]), f(c[1]), f(e[0]), f(e[1])))
        else:
            c1 = tx((seg.c1.x, seg.c1.y)); c2 = tx((seg.c2.x, seg.c2.y)); e = tx((seg.end_point.x, seg.end_point.y))
            d.append("C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(e[0]), f(e[1])))
    d.append("Z")
    parts.append("".join(d))
letters = "".join(parts)

# --- scallop outline r(t) = Rm + A cos(N t), Catmull-Rom -> cubic Bezier
Rm = (R_PEAK + R_TROUGH) / 2 * S; A = (R_PEAK - R_TROUGH) / 2 * S
K = N * 8
pts = []
for i in range(K):
    t = 2 * math.pi * i / K
    r = Rm + A * math.cos(N * t)
    pts.append((C + r * math.cos(t), C + r * math.sin(t)))
d = ["M%s %s" % (f(pts[0][0]), f(pts[0][1]))]
for i in range(K):
    p0, p1, p2, p3 = pts[i - 1], pts[i], pts[(i + 1) % K], pts[(i + 2) % K]
    c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
    c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
    d.append("C%s %s %s %s %s %s" % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1])))
d.append("Z")
scallop = "".join(d)

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-labelledby="t"><title id="t">Cako The Cake Shop</title><circle cx="256" cy="256" r="240" fill="#fff"/><path fill="#EF3334" d="{scallop}"/><path fill="#fff" fill-rule="evenodd" d="{letters}"/></svg>'''
open(OUT, "w", encoding="utf-8").write(svg)
open(OUT.replace(".svg", "-scallop.txt"), "w").write(scallop)
open(OUT.replace(".svg", "-letters.txt"), "w").write(letters)
print("curves", len(plist), "svg bytes", len(svg), "Rm %.2f A %.2f" % (Rm, A))
