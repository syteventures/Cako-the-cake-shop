"""List the elements that stick out past the viewport at a given width (frozen Pune clock optional)."""
import asyncio, functools, http.server, socketserver, sys, threading
from playwright.async_api import async_playwright
W = int(sys.argv[2]) if len(sys.argv) > 2 else 390
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.ThreadingTCPServer.allow_reuse_address = True
h = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Q, directory=sys.argv[1])); threading.Thread(target=h.serve_forever, daemon=True).start()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": W, "height": 844}, is_mobile=True, device_scale_factor=2)
        await pg.goto(f"http://127.0.0.1:{h.server_address[1]}/index.html", wait_until="networkidle")
        r = await pg.evaluate(f"""[...document.querySelectorAll('body *')].filter(e=>{{const r=e.getBoundingClientRect();return r.right>{W}+0.5&&r.width>0&&!e.closest('[hidden]')&&getComputedStyle(e).position!=='fixed'}}).map(e=>{{const r=e.getBoundingClientRect();return e.tagName+'.'+(e.className.baseVal??e.className)+' left='+r.left.toFixed(0)+' right='+r.right.toFixed(0)+' w='+r.width.toFixed(0)}}).slice(0,20)""")
        print("\n".join(r) or "nothing past the edge"); print("scrollWidth", await pg.evaluate("document.documentElement.scrollWidth"))
        await b.close()
asyncio.run(main()); h.shutdown()
