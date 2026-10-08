# Rende ogni slide di carosello-distrokid.html in PNG 1080x1350 (cartella png/).
# Uso: python3 rendi-carosello.py
import os
from playwright.sync_api import sync_playwright
QUI=os.path.dirname(os.path.abspath(__file__))
SLIDE=['s1a','s1b','s1c','s2','s3','s4','s5','s6','s7','s8']
os.makedirs(os.path.join(QUI,'png'),exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(viewport={'width':1080,'height':1350})
    for s in SLIDE:
        pg.goto(f'file://{QUI}/carosello-distrokid.html#{s}'); pg.reload(); pg.wait_for_timeout(300)
        pg.evaluate('document.fonts.ready')
        pg.screenshot(path=os.path.join(QUI,'png',f'distrokid-{s}.png'))
    b.close()
print('ok')
