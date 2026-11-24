"""Extra review evidence that full-page captures cannot show:
the loaded Google map (cross-origin frames paint blank in full-page shots) at 1440 and 390,
the hours line drawing on load, and the name being piped letter by letter (motion on).

  python tools/evidence.py <site-dir> <out-dir> [--time HH:MM]
"""
import asyncio, functools, http.server, os, socketserver, sys, threading
from datetime import datetime, timedelta, timezone
from playwright.async_api import async_playwright

SITE, OUT = sys.argv[1], sys.argv[2]
HHMM = sys.argv[sys.argv.index("--time") + 1] if "--time" in sys.argv else "22:42"
os.makedirs(OUT, exist_ok=True)


def clock(hhmm):
    h, m = map(int, hhmm.split(":"))
    ist = timezone(timedelta(hours=5, minutes=30))
    d = datetime.now(ist).date()
    ms = int(datetime(d.year, d.month, d.day, h, m, tzinfo=ist).timestamp() * 1000)
    return ("(() => { const T=%d, D=Date, off=T-D.now(); class F extends D { constructor(...a){ if(a.length) super(...a); else super(D.now()+off); } "
            "static now(){ return D.now()+off; } } window.Date=F; })();" % ms)


class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass


async def main():
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    srv = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Q, directory=SITE))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    url = f"http://127.0.0.1:{srv.server_address[1]}/index.html"
    async with async_playwright() as p:
        b = await p.chromium.launch()
        # the loaded map at both widths
        for w, h, dpr, tag in ((1440, 900, 1, "1440"), (390, 844, 2, "390")):
            ctx = await b.new_context(viewport={"width": w, "height": h}, device_scale_factor=dpr, is_mobile=w < 900, timezone_id="Asia/Kolkata")
            await ctx.add_init_script(clock(HHMM))
            pg = await ctx.new_page()
            await pg.goto(url, wait_until="networkidle")
            if w < 900:
                # phone: a real viewport shot (stitched element shots paint cross-origin frames blank), with the
                # directions buttons and the whole map in view and the fixed action bar at its true place
                await pg.evaluate("""(() => { const a = document.querySelector('.visit__actions');
                    window.scrollTo({ top: a.getBoundingClientRect().top + window.scrollY - 84, behavior: 'instant' }); })()""")
            else:
                await pg.evaluate("document.querySelector('.visit').scrollIntoView({behavior:'instant'})")
            await pg.wait_for_function("document.querySelector('.map').classList.contains('is-loaded')", timeout=15000)
            await pg.wait_for_timeout(7000)  # Google paints its marker and controls a few seconds after the frame's load event
            if w < 900:
                await pg.screenshot(path=os.path.join(OUT, f"visit-map-{tag}.png"))
            else:
                await (await pg.query_selector(".visit .wrap")).screenshot(path=os.path.join(OUT, f"visit-map-{tag}.png"))
            await ctx.close()
        # offline (or before Google's frame loads): the map box shows its own pin, address and directions
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True, timezone_id="Asia/Kolkata")
        await ctx.add_init_script(clock(HHMM))
        await ctx.add_init_script("Object.defineProperty(Navigator.prototype, 'onLine', { get: () => false });")
        pg = await ctx.new_page()
        await pg.goto(url, wait_until="networkidle")
        await pg.evaluate("""(() => { const a = document.querySelector('.visit__actions');
            window.scrollTo({ top: a.getBoundingClientRect().top + window.scrollY - 84, behavior: 'instant' }); })()""")
        await pg.wait_for_timeout(600)
        await pg.screenshot(path=os.path.join(OUT, "visit-map-390-offline.png"))
        await ctx.close()
        # motion: the hours line draws once on load (frames at 0, 300, 700, 1400 ms)
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, timezone_id="Asia/Kolkata")
        await ctx.add_init_script(clock(HHMM))
        pg = await ctx.new_page()
        await pg.goto(url, wait_until="domcontentloaded")
        await pg.evaluate("document.fonts.ready")
        last = 0
        for i, t in enumerate((0, 300, 700, 1400)):
            await pg.wait_for_timeout(t - last); last = t
            await pg.screenshot(path=os.path.join(OUT, f"motion-hours-{i}-{t}ms.png"), clip={"x": 0, "y": 790, "width": 1440, "height": 110})
        # motion: typing pipes each new letter onto the cake (frames after each key)
        await pg.click("#slip-name")
        cake = await pg.query_selector(".cake-top")
        for i, ch in enumerate("Riya"):
            await pg.keyboard.type(ch)
            await pg.wait_for_timeout(90)
            await cake.screenshot(path=os.path.join(OUT, f"motion-pipe-{i + 1}-{ch}.png"))
        await ctx.close()
        await b.close()
    srv.shutdown()
    print("evidence written to", OUT)


asyncio.run(main())
