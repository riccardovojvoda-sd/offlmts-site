"""Quanti download hanno avuto le basi della pagina d'ascolto riservata (Beats OFFLMTS).
GitHub conta ogni scaricamento di un file di una release: nessun cookie, nessun consenso.
Uso: python3 scarichi-basi.py [tag]   (default: basi-giovas-g7k2m9x4qa)
Nota: il conteggio include anche eventuali anteprime automatiche del link fatte da app di messaggistica.
"""
import json, subprocess, sys

TAG = sys.argv[1] if len(sys.argv) > 1 else "basi-giovas-g7k2m9x4qa"
REPO = "riccardovojvoda-sd/offlmts-site"
r = subprocess.run(["gh", "api", f"repos/{REPO}/releases/tags/{TAG}"], capture_output=True, text=True, check=True)
asset = json.loads(r.stdout)["assets"]
tot = sum(a["download_count"] for a in asset)
scaricati = [a for a in asset if a["download_count"]]
print(f"{tot} download totali, {len(scaricati)} file scaricati su {len(asset)}")
for a in sorted(asset, key=lambda a: -a["download_count"]):
    if a["download_count"]:
        print(f"  {a['download_count']:>3}  {a['name']}")
