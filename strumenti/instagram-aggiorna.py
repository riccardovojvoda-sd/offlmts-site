# Aggiorna la strip Instagram del sito: legge il profilo dal Brave di Riccardo (instagram-leggi-post.py),
# salva le copertine nuove, riscrive src/_data/instagram.json con i 12 post piu' recenti.
# Le didascalie dei post gia' noti restano; per i nuovi: reel = prima riga della didascalia, foto = "Foto dallo studio".
# Uso: python3 strumenti/instagram-aggiorna.py [--push]   (con --push: commit e push se c'e' qualcosa di nuovo)
import json,subprocess,sys,os,base64,tempfile
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATI=os.path.join(R,'src/_data/instagram.json'); IMG=os.path.join(R,'src/assets/img/instagram')
PROFILO='offlmts.recording.studio'; N=12
tmp=os.path.join(tempfile.mkdtemp(),'ig.json')
subprocess.run([sys.executable,os.path.join(R,'strumenti/instagram-leggi-post.py'),PROFILO,str(N+2),tmp],check=True)
letti=json.load(open(tmp))
if len(letti)<N: raise SystemExit(f'letti solo {len(letti)} post, non tocco niente')
vecchi={p['url']:p for p in json.load(open(DATI))}
nuovi=[]; aggiunti=[]
for p in letti[:N]:
    if p['url'] in vecchi: nuovi.append(vecchi[p['url']]); continue
    if not p.get('b64'): raise SystemExit(f'niente miniatura per {p["url"]}')
    open(os.path.join(IMG,p['id']+'.jpg'),'wb').write(base64.b64decode(p['b64'].split(',',1)[1]))
    dida=p['alt'].strip().split('\n')[0].strip() if p['tipo']=='reel' else 'Foto dallo studio'
    nuovi.append({'url':p['url'],'copertina':p['id']+'.jpg','didascalia':dida,'tipo':p['tipo']}); aggiunti.append(p['url'])
if not aggiunti: print('nessun post nuovo'); sys.exit(0)
json.dump(nuovi,open(DATI,'w'),ensure_ascii=False,indent=1); open(DATI,'a').write('\n')
usate={p['copertina'] for p in nuovi}
for f in os.listdir(IMG):
    if f.endswith('.jpg') and f not in usate: os.remove(os.path.join(IMG,f))
print('post nuovi:',*aggiunti)
if '--push' in sys.argv:
    subprocess.run(['git','-C',R,'add','src/_data/instagram.json','src/assets/img/instagram'],check=True)
    subprocess.run(['git','-C',R,'commit','-q','-m',f'Instagram: {len(aggiunti)} post nuovi nella strip\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>'],check=True)
    subprocess.run(['git','-C',R,'push','-q'],check=True); print('push fatto')
