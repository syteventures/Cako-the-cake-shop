"""Drive the Cako page's interactions in headless Chromium and report pass/fail.

  set PLAYWRIGHT_BROWSERS_PATH, then: python tools/qa.py <site-dir> [<shots-dir>]
"""
import asyncio, functools, http.server, socketserver, sys, threading, urllib.parse
from playwright.async_api import async_playwright

SITE = sys.argv[1]
SHOTS = sys.argv[2] if len(sys.argv) > 2 else None
results = []


def check(name, ok, detail=""):
    results.append((name, bool(ok), detail))


def serve(root):
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *a): pass
    socketserver.ThreadingTCPServer.daemon_threads = True
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    httpd = socketserver.ThreadingTCPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=root))
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd


async def main():
    httpd = serve(SITE)
    base = f"http://127.0.0.1:{httpd.server_address[1]}/index.html"
    errors = []
    async with async_playwright() as p:
        b = await p.chromium.launch()

        # ---------------- desktop: order slip
        ctx = await b.new_context(viewport={"width": 1440, "height": 900}, timezone_id="Asia/Kolkata", locale="en-IN")
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(base, wait_until="networkidle")

        # Tab order: the skip link comes first
        await pg.keyboard.press("Tab")
        first = await pg.evaluate("document.activeElement.className + '|' + document.activeElement.textContent.trim()")
        check("first Tab lands on the skip link", first.startswith("skip|"), first)

        # sending without a flavour shows the error and does not open WhatsApp
        popups = []
        ctx.on("page", lambda np: popups.append(np))
        await pg.click("[data-send]")
        await pg.wait_for_timeout(300)
        err_visible = await pg.is_visible("#slip-cake-error")
        focused = await pg.evaluate("document.activeElement.id")
        invalid = await pg.get_attribute("#slip-cake", "aria-invalid")
        check("no flavour: error shown", err_visible)
        check("no flavour: focus moves to the flavour field", focused == "slip-cake", focused)
        check("no flavour: field marked invalid", invalid == "true", str(invalid))
        check("no flavour: WhatsApp not opened", len(popups) == 0, f"{len(popups)} popups")

        # typing pipes the name onto the cake top
        await pg.click("#slip-name")
        await pg.keyboard.type("Riya", delay=60)
        piped = await pg.text_content(".cake-top .pipe-name")
        example = await pg.evaluate("document.querySelector('.cake-top .pipe-name').classList.contains('is-example')")
        check("name is piped on the cake preview", piped == "Riya" and not example, f"{piped!r} example={example}")

        # choose flavour, size and a date; the WhatsApp link carries every choice
        await pg.select_option("#slip-cake", "Black forest")
        await pg.click("label[for=size-one]")
        await pg.click("label[for=when-date]")
        date_shown = await pg.is_visible("#slip-date")
        check("Pick a date reveals the date field", date_shown)
        dmin = await pg.get_attribute("#slip-date", "min")
        await pg.fill("#slip-date", dmin)
        await pg.dispatch_event("#slip-date", "change")
        err_after = await pg.is_visible("#slip-cake-error")
        check("choosing a flavour clears the error", not err_after)
        href = await pg.get_attribute("[data-send]", "href")
        msg = urllib.parse.unquote(href.split("text=", 1)[1]) if "text=" in href else ""
        check("WhatsApp link goes to the shop number", href.startswith("https://wa.me/918446966779?text="), href[:60])
        for frag in ["Hello Cako", "On the cake: Happy Birthday Riya", "Flavour: Black forest", "Size: 1 kg", "When: ", "Please confirm the price and the time."]:
            check(f"message contains {frag!r}", frag in msg, msg.replace("\n", " / "))
        check("message lines are separated by newlines", msg.count("\n") >= 5, repr(msg[:80]))

        # a valid send opens WhatsApp in a new tab and shows the status line
        async with ctx.expect_page() as newp:
            await pg.click("[data-send]")
        np = await newp.value
        check("valid send opens a new tab", np is not None)
        await np.close()
        check("status line shown after sending", await pg.is_visible("[data-sent]"))

        # counter link pre-fills the slip with that cake
        await pg.click("#cake-red-velvet [data-order-cake]")
        await pg.wait_for_timeout(900)
        val = await pg.input_value("#slip-cake")
        h = await pg.evaluate("location.hash")
        foc = await pg.evaluate("document.activeElement.id")
        check("'Order this cake' selects the cake", val == "Red velvet", val)
        check("'Order this cake' gives the cake its own link", h == "#order-red-velvet", h)
        check("'Order this cake' puts focus in the name field", foc == "slip-name", foc)

        # map loads once the visit section is reached
        await pg.evaluate("document.getElementById('visit').scrollIntoView({behavior:'instant'})")
        await pg.wait_for_timeout(4500)
        frames = [f.url for f in pg.frames if "google" in f.url]
        check("map iframe loads near the visit section", len(frames) > 0, ", ".join(frames)[:90])
        if SHOTS:
            await (await pg.query_selector(".map")).screenshot(path=f"{SHOTS}/map.png")
        await ctx.close()

        # ---------------- deep link on load
        ctx = await b.new_context(viewport={"width": 1440, "height": 900})
        pg = await ctx.new_page()
        await pg.goto(base + "#order-rasmalai", wait_until="networkidle")
        await pg.wait_for_timeout(700)
        check("a shared #order-rasmalai link opens the slip with Rasmalai", await pg.input_value("#slip-cake") == "Rasmalai")
        await ctx.close()

        # ---------------- phone: menu and action bar
        ctx = await b.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True)
        pg = await ctx.new_page()
        pg.on("pageerror", lambda e: errors.append(str(e)))
        await pg.goto(base, wait_until="networkidle")
        await pg.click("[data-menu-open]")
        opened = await pg.is_visible("#menu")
        exp = await pg.get_attribute("[data-menu-open]", "aria-expanded")
        check("phone menu opens", opened and exp == "true", f"visible={opened} expanded={exp}")
        if SHOTS:
            await pg.screenshot(path=f"{SHOTS}/phone-menu.png")
        await pg.keyboard.press("Escape")
        await pg.wait_for_timeout(200)
        check("Escape closes the phone menu", not await pg.is_visible("#menu"))
        bar = await pg.is_visible(".actionbar")
        check("phone action bar is shown", bar)
        small = await pg.evaluate("""[...document.querySelectorAll('a,button,input,select,label[for]')].filter(e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);if(e.tagName==='INPUT'&&s.opacity==='0')return false;if(e.tagName==='LABEL'){const t=document.getElementById(e.htmlFor);if(!t||!t.matches('[type=radio],[type=checkbox]'))return false;}return r.width>0&&r.height>0&&s.visibility!=='hidden'&&!e.closest('p,li,figcaption,.band__desc,address')&&r.height<44}).map(e=>(e.className||e.tagName)+':'+Math.round(e.getBoundingClientRect().height)).slice(0,12)""")
        check("controls outside running text are at least 44px tall on a phone", len(small) == 0, "; ".join(small))
        await ctx.close()
        await b.close()
    httpd.shutdown()
    check("no JavaScript errors", not errors, "; ".join(errors))
    width = max(len(n) for n, _, _ in results)
    for n, ok, d in results:
        print(("PASS " if ok else "FAIL ") + n.ljust(width) + ("" if ok else "  -> " + d))
    print(f"\n{sum(ok for _, ok, _ in results)}/{len(results)} passed")


asyncio.run(main())
