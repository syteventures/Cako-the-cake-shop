import asyncio, pathlib, sys
from playwright.async_api import async_playwright
from PIL import Image
root = pathlib.Path(sys.argv[1]).resolve()
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630})
        await pg.goto((root / "tools" / "og.html").as_uri()); await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(500)
        await pg.screenshot(path=str(root / "tools" / "og.png")); await b.close()
asyncio.run(main())
Image.open(root / "tools" / "og.png").convert("RGB").save(root / "assets" / "img" / "og-cako.jpg", quality=84, optimize=True, progressive=True)
(root / "tools" / "og.png").unlink()
print("og-cako.jpg", (root / "assets" / "img" / "og-cako.jpg").stat().st_size // 1024, "KB")
