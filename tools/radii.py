import sys, math
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB"); px = im.load()
cx, cy = 358.6, 431.0
def isred(p): return p[0] > 190 and p[1] < 110 and p[2] < 110 and (p[0]-p[1]) > 110
def edge(adeg):
    a = math.radians(adeg); r = 190.0; last = None
    while r < 260:
        p = px[int(round(cx + r*math.cos(a))), int(round(cy + r*math.sin(a)))]
        if isred(p): last = r
        r += 0.25
    return last
pk = [edge(k*20) for k in range(18)]
tr = [edge(k*20+10) for k in range(18)]
print("peak r:", [round(v,1) for v in pk]); print("trough r:", [round(v,1) for v in tr])
print("peak mean %.2f trough mean %.2f" % (sum(pk)/18, sum(tr)/18))
# white ring outer radius sampled where background is darker (left/top/bottom-left)
def ring(adeg):
    a = math.radians(adeg); r = 225.0; lastw = None
    while r < 300:
        x = cx + r*math.cos(a); y = cy + r*math.sin(a)
        p = px[int(x), int(y)]
        if min(p) > 238: lastw = r
        r += 0.25
    return lastw
for ang in (150, 170, 190, 200, 210, 230, 250, 120):
    print("ring at", ang, ring(ang))
