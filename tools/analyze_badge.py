import sys, math
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
W, H = im.size
px = im.load()
def isred(p): return p[0] > 190 and p[1] < 110 and p[2] < 110 and (p[0]-p[1]) > 110
# centroid of strong red pixels in the badge window
sx = sy = n = 0
for y in range(180, 700):
    for x in range(100, 620):
        if isred(px[x, y]):
            sx += x; sy += y; n += 1
cx, cy = sx / n, sy / n
print("red px", n, "centroid", round(cx, 1), round(cy, 1))
# radial profile: for each angle march out from centre until 3 consecutive non-red (skip white text inside by starting at r=150)
prof = []
for i in range(720):
    a = i * math.pi / 360
    r_edge = None
    r = 150.0
    miss = 0
    last_red = None
    while r < 300:
        x = cx + r * math.cos(a); y = cy + r * math.sin(a)
        p = px[int(round(x)), int(round(y))]
        if isred(p):
            last_red = r; miss = 0
        else:
            miss += 1
            if miss >= 4 and last_red is not None:
                break
        r += 0.5
    prof.append(last_red)
vals = [v for v in prof if v]
print("radius min/max/mean", round(min(vals), 1), round(max(vals), 1), round(sum(vals) / len(vals), 1))
# count peaks via smoothed profile and sign changes of derivative
sm = []
N = len(prof)
for i in range(N):
    w = [prof[(i + k) % N] for k in range(-3, 4) if prof[(i + k) % N]]
    sm.append(sum(w) / len(w))
peaks = []
for i in range(N):
    if sm[i] > sm[i - 1] and sm[i] >= sm[(i + 1) % N] and sm[i] > (min(vals) + max(vals)) / 2:
        peaks.append(i / 2.0)
# merge peaks closer than 8 degrees
merged = []
for p in peaks:
    if merged and p - merged[-1] < 8: continue
    merged.append(p)
if merged and (merged[0] + 360 - merged[-1]) < 8: merged.pop()
print("peaks", len(merged), [round(p, 1) for p in merged])
# white ring: from centre at angle 0..360, find outer white boundary beyond red edge
ring = []
for i in range(0, 720, 10):
    a = i * math.pi / 360
    r = (prof[i] or 230) + 2
    lastw = None
    while r < 340:
        x = cx + r * math.cos(a); y = cy + r * math.sin(a)
        if not (0 <= x < W and 0 <= y < H): break
        p = px[int(x), int(y)]
        if p[0] > 235 and p[1] > 235 and p[2] > 235: lastw = r
        elif lastw is not None and r - lastw > 6: break
        r += 0.5
    ring.append(lastw)
rv = [v for v in ring if v]
print("white ring outer r min/max/median", round(min(rv), 1), round(max(rv), 1), sorted(rv)[len(rv) // 2])
