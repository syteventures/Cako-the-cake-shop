"""Runtime WCAG contrast audit: every visible text node against its nearest painted background."""
import asyncio, functools, http.server, socketserver, sys, threading
from playwright.async_api import async_playwright
JS = r"""
() => {
  const parse = c => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(',').map(Number); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lin = v => { v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4); };
  const L = c => 0.2126*lin(c.r)+0.7152*lin(c.g)+0.0722*lin(c.b);
  const blend = (top, bot) => ({r: top.r*top.a+bot.r*(1-top.a), g: top.g*top.a+bot.g*(1-top.a), b: top.b*top.a+bot.b*(1-top.a), a:1});
  const bgOf = el => { let layers=[]; for (let e=el; e; e=e.parentElement) { const c=parse(getComputedStyle(e).backgroundColor); if (c && c.a>0) { layers.push(c); if (c.a>=1) break; } } let base={r:27,g:13,b:10,a:1}; for (let i=layers.length-1;i>=0;i--) base=blend(layers[i],base); return base; };
  const out=[]; const seen=new Set();
  const walker=document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t=walker.currentNode; if (!t.textContent.trim()) continue; const el=t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const s=getComputedStyle(el); if (s.visibility==='hidden'||s.display==='none'||el.closest('[hidden],.visually-hidden,svg,script,style,noscript')) continue;
    const r=el.getBoundingClientRect(); if (r.width<1||r.height<1) continue;
    let fg=parse(s.color); const bg=bgOf(el); if (fg.a<1) fg=blend(fg,bg);
    const l1=L(fg), l2=L(bg); const ratio=(Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
    const size=parseFloat(s.fontSize), bold=parseInt(s.fontWeight)>=700; const large= size>=24 || (bold && size>=18.66);
    const need= large?3:4.5; if (ratio<need) out.push(`${ratio.toFixed(2)} < ${need}  ${el.tagName.toLowerCase()}.${el.className}  "${t.textContent.trim().slice(0,40)}"`);
  }
  return out;
}"""
async def main():
    class Q(http.server.SimpleHTTPRequestHandler):
        def log_message(self,*a): pass
    socketserver.ThreadingTCPServer.allow_reuse_address=True
    httpd=socketserver.ThreadingTCPServer(("127.0.0.1",0),functools.partial(Q,directory=sys.argv[1])); threading.Thread(target=httpd.serve_forever,daemon=True).start()
    async with async_playwright() as p:
        b=await p.chromium.launch()
        for w,h in ((1440,900),(390,844)):
            pg=await b.new_page(viewport={"width":w,"height":h}); await pg.goto(f"http://127.0.0.1:{httpd.server_address[1]}/index.html",wait_until="networkidle")
            res=await pg.evaluate(JS); print(f"{w}px: {len(res)} below AA"); [print("  ",r) for r in res]
        await b.close()
    httpd.shutdown()
asyncio.run(main())
