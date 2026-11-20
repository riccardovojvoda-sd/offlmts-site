# Crea il carosello Instagram di una dritta OFFLMTS da una scheda JSON: HTML delle slide (stesso impianto di
# modificare-beat), PNG 1080x1350, provino, JPG in tool-personali/offlmts-social/cover, copertina animata e storia.
# Non tocca post-instagram.json (la voce del post si scrive a parte, e "Programmato" solo dopo l'ok di Riccardo).
# Uso: MyScraper/.venv/bin/python crea_carosello_dritta.py <scheda.json>
# Scheda: {cartella, pref, nomecover, foto (file in src/assets/img/dritte), titolo, titolo_cta, url, slide: [{titolo, testo, muto}]}
#         (testo e muto accettano <strong>)
import json, os, re, subprocess, sys
from PIL import Image
from playwright.sync_api import sync_playwright

QUI = os.path.dirname(os.path.abspath(__file__))
SOCIAL = os.path.expanduser("~/Library/CloudStorage/Dropbox/Code/tool-personali")
PY = sys.executable
S = json.load(open(sys.argv[1], encoding="utf-8"))
D = os.path.join(QUI, S["cartella"]); os.makedirs(os.path.join(D, "png"), exist_ok=True)
html_path = os.path.join(D, f"carosello-{S['pref']}.html")

modello = open(os.path.join(QUI, "modificare-beat", "carosello-modifica-beat.html"), encoding="utf-8").read()
testa = modello.split("</head>")[0]
testa = testa.replace("beat-comprato-stereo-e-stem.jpg", S["foto"]).replace("Carosello modificare un beat comprato", "Carosello " + S["titolo"])
if S.get("css_extra"):  # ritocchi della sola copertina, es. foto che sfuma nel nero
    testa += "<style>" + S["css_extra"] + "</style>\n"
LOGO = '<img src="../../src/assets/img/logo-offlmts.png" alt=""><span class="sito">offlmts.com</span>'
N = len(S["slide"]) + 2
corpo = ['<section class="slide cA" id="s1"><div class="sfondo"></div><div class="sfocato"></div><div class="velo"></div>\n'
         f' <div class="pad"><p class="occhiello">Dritte · OFFLMTS</p><h1>{S["titolo"]}</h1></div>\n'
         f' <div class="piede">{LOGO}<span class="scorri">Scorri →</span></div></section>']
for i, s in enumerate(S["slide"], start=1):
    muto = f'\n <p class="muto">{s["muto"]}</p>' if s.get("muto") else ""
    corpo.append(f'<section class="slide" id="s{i + 1}"><div class="pad">\n <div class="num">{i:02d}</div><h2>{s["titolo"]}</h2>\n'
                 f' <p>{s["testo"]}</p>{muto}</div>\n <div class="piede">{LOGO}<span>{i + 1}/{N}</span></div></section>')
corpo.append(f'<section class="slide cta" id="s{N}"><div class="pad">\n <p class="occhiello">La guida completa</p>\n'
             f' <h2>{S["titolo_cta"]}</h2>\n <div class="url">{S["url"]}</div>\n <p class="bio">→ link in bio</p></div>\n'
             f' <div class="piede">{LOGO}<span>Salva il post</span></div></section>')
coda = ("<script>\nconst h=location.hash.slice(1);\nif(h){document.getElementById(h).classList.add('attiva')}"
        "else{document.body.classList.add('tutte')}\n</script>\n</body>\n</html>\n")
open(html_path, "w", encoding="utf-8").write(testa + "</head>\n<body>\n" + "\n".join(corpo) + "\n\n" + coda)

cover = os.path.join(SOCIAL, "offlmts-social", "cover")
png = []
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={"width": 1080, "height": 1350})
    for i in range(1, N + 1):
        pg.goto(f"file://{html_path}#s{i}"); pg.reload(); pg.wait_for_timeout(300); pg.evaluate("document.fonts.ready")
        f = os.path.join(D, "png", f"{S['pref']}-{i:02d}.png"); pg.screenshot(path=f)
        im = Image.open(f).convert("RGB"); png.append(im)
        im.save(os.path.join(cover, f"{S['nomecover']}_{i:02d}.jpg"), "JPEG", quality=92)
    b.close()
prov = Image.new("RGB", (540 * 4 + 50, 675 * 2 + 30), (0, 0, 0))
for i, im in enumerate(png):
    prov.paste(im.resize((540, 675), Image.LANCZOS), (10 + (i % 4) * 550, 10 + (i // 4) * 685))
prov.save(os.path.join(D, f"provini-carosello-{S['pref']}.png"))
print("slide:", len(png))

IG = os.path.join(SOCIAL, "storie-instagram")
subprocess.run([PY, os.path.join(IG, "copertina_animata.py"), html_path, os.path.join(D, f"{S['pref']}-01-animata.mp4"),
                "--stile", "misto", "--durata", "15"], check=True)
subprocess.run([PY, os.path.join(IG, "storia_racconto.py"), html_path, os.path.join(D, f"{S['pref']}-storia.mp4"),
                "--colore", "#D4964B", "--disegno", "chevron"], check=True)
print("ok", S["cartella"])
