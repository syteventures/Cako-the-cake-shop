"""Capture review screenshots of the Cako page with Playwright (Chromium).

Usage (from anywhere):
  set PLAYWRIGHT_BROWSERS_PATH to the D: Playwright browsers, then
  python tools/shoot.py <site-dir> <out-dir> [--time HH:MM] [--only desktop,mobile] [--full]

--time freezes the Pune clock (IST) so the open and closed states can be checked.
Serves the site over http://127.0.0.1 (never file://) from a throwaway local server.
"""
import argparse, asyncio, functools, http.server, os, socketserver, threading
from datetime import datetime, timedelta, timezone
from playwright.async_api import async_playwright

VIEWS = {
    "desktop": dict(width=1440, height=900, dpr=1, mobile=False),
    "laptop": dict(width=1280, height=760, dpr=1, mobile=False),
    "tablet": dict(width=820, height=1180, dpr=1, mobile=True),
    "mobile": dict(width=390, height=844, dpr=2, mobile=True),
    "small": dict(width=320, height=640, dpr=2, mobile=True),
}


def serve(root):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    handler = functools.partial(Quiet, directory=root)
    socketserver.ThreadingTCPServer.daemon_threads = True
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


def frozen_clock_script(hhmm):
    h, m = map(int, hhmm.split(":"))
    ist = timezone(timedelta(hours=5, minutes=30))
    today = datetime.now(ist).date()
    ms = int(datetime(today.year, today.month, today.day, h, m, tzinfo=ist).timestamp() * 1000)
    return f"""(() => {{ const T = {ms}; const D = Date; const off = T - D.now();
      class F extends D {{ constructor(...a) {{ if (a.length) super(...a); else super(D.now() + off); }}
        static now() {{ return D.now() + off; }} }}
      window.Date = F; }})();"""


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("site"); ap.add_argument("out")
    ap.add_argument("--time", default=None)
    ap.add_argument("--only", default="desktop,mobile")
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--suffix", default="")
    ap.add_argument("--path", default="index.html")
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    httpd = serve(a.site)
    url = f"http://127.0.0.1:{httpd.server_address[1]}/{a.path}"
    errors = []
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for name in a.only.split(","):
            v = VIEWS[name]
            ctx = await b.new_context(viewport={"width": v["width"], "height": v["height"]},
                                      device_scale_factor=v["dpr"], is_mobile=v["mobile"], has_touch=v["mobile"],
                                      reduced_motion="reduce", locale="en-IN", timezone_id="Asia/Kolkata")
            if a.time:
                await ctx.add_init_script(frozen_clock_script(a.time))
            pg = await ctx.new_page()
            pg.on("console", lambda m, n=name: errors.append(f"[{n}] console.{m.type}: {m.text}") if m.type in ("error", "warning") else None)
            pg.on("pageerror", lambda e, n=name: errors.append(f"[{n}] pageerror: {e}"))
            pg.on("requestfailed", lambda r, n=name: errors.append(f"[{n}] failed: {r.url} {r.failure}"))
            await pg.goto(url, wait_until="networkidle")
            await pg.evaluate("document.fonts.ready")
            await pg.wait_for_timeout(400)
            tag = f"{name}{a.suffix}"
            await pg.screenshot(path=os.path.join(a.out, f"{tag}-fold.png"))
            if a.full:
                # walk the page so lazy images load, then capture the whole document from the top
                h = await pg.evaluate("document.documentElement.scrollHeight")
                y = 0
                while y < h:
                    await pg.evaluate(f"window.scrollTo({{top:{y},behavior:'instant'}})")
                    await pg.wait_for_timeout(120)
                    y += v["height"]
                # let Google's map frame finish loading so the capture shows the map, not its fallback
                if await pg.query_selector(".map iframe"):
                    await pg.evaluate("document.querySelector('.map').scrollIntoView({block:'center',behavior:'instant'})")
                    try:
                        await pg.wait_for_function("document.querySelector('.map').classList.contains('is-loaded')", timeout=12000)
                        await pg.wait_for_timeout(1500)
                    except Exception:
                        errors.append(f"[{name}] map frame did not report loaded within 12 s")
                await pg.evaluate("window.scrollTo({top:0,behavior:'instant'})")
                await pg.wait_for_timeout(300)
                await pg.screenshot(path=os.path.join(a.out, f"{tag}-full.png"), full_page=True)
            sw = await pg.evaluate("document.documentElement.scrollWidth")
            if sw > v["width"]:
                errors.append(f"[{name}] horizontal overflow: scrollWidth {sw} > {v['width']}")
            await ctx.close()
        await b.close()
    httpd.shutdown()
    print("\n".join(errors) if errors else "no console errors, failed requests or overflow")


asyncio.run(main())
