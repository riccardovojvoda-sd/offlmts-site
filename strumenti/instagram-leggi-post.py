# Legge i post di un profilo Instagram dal Brave di Riccardo (loggato), via AppleScript + JavaScript.
# Apre un tab, scorre la griglia, raccoglie link + miniatura + didascalia, poi chiude il tab e
# rimette attivo il tab di prima. Uso: python3 ig_leggi.py <profilo> <max_post> <out.json>
import subprocess,json,sys,time
profilo,maxn,out=sys.argv[1],int(sys.argv[2]),sys.argv[3]
def osa(s):
    r=subprocess.run(['osascript','-e',s],capture_output=True,text=True); 
    if r.returncode: raise SystemExit(r.stderr)
    return r.stdout.strip()
def js(code):
    code=code.replace('\\','\\\\').replace('"','\\"')
    return osa(f'tell application "Brave Browser" to execute tab {TAB} of window {WIN} javascript "{code}"')
prev=osa('tell application "Brave Browser" to get active tab index of front window')
osa(f'tell application "Brave Browser" to tell front window to make new tab with properties {{URL:"https://www.instagram.com/{profilo}/"}}')
WIN='1'; TAB=osa('tell application "Brave Browser" to get active tab index of front window')
osa(f'tell application "Brave Browser" to set active tab index of front window to {prev}')
time.sleep(6)
JS=r'''
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
})();'''.replace('MAXN',str(maxn))
js(JS)
for i in range(40):
    time.sleep(2)
    if js('window.__ig?window.__ig.stato:"?"')=='fatto': break
n=int(js('window.__ig.post.length'))
print('post trovati',n)
# miniature in base64, dentro la pagina (stessa sessione)
JS2=r'''
(async function(){
  window.__ig.stato='miniature';
  for (var p of window.__ig.post){
    try{ var r=await fetch(p.src); var b=await r.blob(); p.b64=await new Promise(function(ok){var f=new FileReader();f.onload=function(){ok(f.result)};f.readAsDataURL(b)}); }
    catch(e){ p.err=String(e); }
  }
  window.__ig.stato='fatto2';
})();'''
js(JS2)
for i in range(60):
    time.sleep(2)
    if js('window.__ig.stato')=='fatto2': break
dati=json.loads(js('JSON.stringify(window.__ig.post)'))
open(out,'w').write(json.dumps(dati,ensure_ascii=False))
osa(f'tell application "Brave Browser" to close tab {TAB} of window {WIN}')
osa(f'tell application "Brave Browser" to set active tab index of front window to {prev}')
print('salvato',out,'con',len(dati),'post;',sum(1 for d in dati if d.get('b64')),'miniature')
