# Legge i post di un profilo Instagram dal Brave OFFLMTS (profilo dedicato, loggato), via CDP (porta 9223).
# Apre una scheda IN SECONDO PIANO (Target.createTarget background), scorre la griglia, raccoglie
# link + miniatura + didascalia, poi chiude la scheda. Non tocca il Brave di Riccardo e non porta
# nulla in primo piano. Se il Brave OFFLMTS e' spento lo accende (lancia-brave.sh) e lo lascia acceso.
# Uso: python3 instagram-leggi-post.py <profilo> <max_post> <out.json>
import json, os, subprocess, sys, time, urllib.request

VENV = os.path.expanduser("~/Library/CloudStorage/Dropbox/Code/tool-personali/MyScraper/.venv/bin/python")
try:
    import websocket
except ImportError:
    if sys.executable != VENV and os.path.exists(VENV):
        os.execv(VENV, [VENV] + sys.argv)
    raise

profilo, maxn, out = sys.argv[1], int(sys.argv[2]), sys.argv[3]
PORT = 9223
LANCIA = os.path.expanduser("~/Library/CloudStorage/Dropbox/Code/tool-personali/offlmts-social/lancia-brave.sh")


def versione():
    try:
        with urllib.request.urlopen(f"http://localhost:{PORT}/json/version", timeout=3) as r:
            return json.load(r)
    except Exception:
        return None


v = versione()
if not v:
    subprocess.run(["bash", LANCIA, "about:blank"], check=True)
    for _ in range(40):
        time.sleep(1)
        v = versione()
        if v:
            break
    else:
        raise SystemExit("Brave OFFLMTS non si apre")


class Cdp:
    def __init__(self, url):
        self.ws = websocket.create_connection(url, suppress_origin=True, timeout=60)
        self.i = 0

    def send(self, m, **p):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": m, "params": p}))
        while True:
            r = json.loads(self.ws.recv())
            if r.get("id") == self.i:
                if "error" in r:
                    raise SystemExit(f"{m}: {r['error']}")
                return r.get("result", {})

    def js(self, expr):
        r = self.send("Runtime.evaluate", expression=expr, awaitPromise=True, returnByValue=True)
        if "exceptionDetails" in r:
            raise SystemExit(r["exceptionDetails"].get("exception", {}).get("description", "errore JS"))
        return r.get("result", {}).get("value")


browser = Cdp(v["webSocketDebuggerUrl"])
TARGET = browser.send("Target.createTarget", url=f"https://www.instagram.com/{profilo}/", background=True)["targetId"]
pagina = Cdp(f"ws://localhost:{PORT}/devtools/page/{TARGET}")
pagina.send("Runtime.enable")
# la scheda e' in secondo piano: senza questo Instagram la tratta come nascosta e non carica la griglia
pagina.send("Emulation.setFocusEmulationEnabled", enabled=True)
time.sleep(6)


def js(code):
    return pagina.js(code)


JS = r'''
(function(){
  window.__ig={stato:'in corso',post:[]};
  var visti={};
  function raccogli(){
    document.querySelectorAll('a[href^="/p/"],a[href^="/reel/"],a[href*="/p/"],a[href*="/reel/"]').forEach(function(a){
      var m=a.getAttribute('href').match(/\/(p|reel)\/([A-Za-z0-9_-]+)/); if(!m) return;
      var id=m[2]; if(visti[id]) return;
      var img=a.querySelector('img'); if(!img) return;
      visti[id]=true;
      window.__ig.post.push({tipo:m[1],id:id,url:'https://www.instagram.com/'+m[1]+'/'+id+'/',src:img.currentSrc||img.src,alt:img.alt||''});
    });
  }
  var giri=0;
  var t=setInterval(function(){
    raccogli(); giri++;
    if(window.__ig.post.length>=MAXN||giri>18){clearInterval(t);window.__ig.stato='fatto';window.scrollTo(0,0);return;}
    window.scrollBy(0,window.innerHeight*2);
  },1500);
})();'''.replace('MAXN', str(maxn))
try:
    js(JS)
    for i in range(40):
        time.sleep(2)
        if js('window.__ig?window.__ig.stato:"?"') == 'fatto':
            break
    n = int(js('window.__ig.post.length'))
    print('post trovati', n)
    # miniature in base64, dentro la pagina (stessa sessione)
    JS2 = r'''
(async function(){
  window.__ig.stato='miniature';
  for (var p of window.__ig.post){
    try{ var r=await fetch(p.src); var b=await r.blob(); p.b64=await new Promise(function(ok){var f=new FileReader();f.onload=function(){ok(f.result)};f.readAsDataURL(b)}); }
    catch(e){ p.err=String(e); }
  }
  window.__ig.stato='fatto2';
})();'''
    pagina.send("Runtime.evaluate", expression=JS2)
    for i in range(60):
        time.sleep(2)
        if js('window.__ig.stato') == 'fatto2':
            break
    dati = json.loads(js('JSON.stringify(window.__ig.post)'))
    open(out, 'w').write(json.dumps(dati, ensure_ascii=False))
    print('salvato', out, 'con', len(dati), 'post;', sum(1 for d in dati if d.get('b64')), 'miniature')
finally:
    try:
        browser.send("Target.closeTarget", targetId=TARGET)
    except BaseException:
        pass
