# Rende ogni slide di carosello-tracce.html in PNG 1080x1350 (cartella png/).
# Uso: python3 rendi-carosello.py
import os
from playwright.sync_api import sync_playwright
QUI=os.path.dirname(os.path.abspath(__file__))
SLIDE=[f's{i}' for i in range(1,9)]
os.makedirs(os.path.join(QUI,'png'),exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1080,'height':1350})
    for i,s in enumerate(SLIDE,1):
        pg.goto(f'file://{QUI}/carosello-tracce.html#{s}'); pg.reload(); pg.wait_for_timeout(300)
        pg.evaluate('document.fonts.ready')
        pg.screenshot(path=os.path.join(QUI,'png',f'tracce-{i:02d}.png'))
    b.close()
print('ok')
