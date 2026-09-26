"""Sync the React Anti-Doping Champion build into Flask.
Run after `npm run build` inside antidoping-champion/:
    python sync_champion.py
Copies dist assets to static/champion/ and regenerates templates/champion.html
from dist/index.html (so hashed filenames never drift).
"""
import os, shutil, re

ROOT = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.join(ROOT, "antidoping-champion", "dist")
STATIC = os.path.join(ROOT, "static", "champion")
TPL = os.path.join(ROOT, "templates", "champion.html")

os.makedirs(os.path.join(STATIC, "assets"), exist_ok=True)
for f in os.listdir(os.path.join(DIST, "assets")):
    shutil.copy2(os.path.join(DIST, "assets", f), os.path.join(STATIC, "assets", f))
for f in ("favicon.svg", "icons.svg"):
    p = os.path.join(DIST, f)
    if os.path.exists(p):
        shutil.copy2(p, os.path.join(STATIC, f))

with open(os.path.join(DIST, "index.html"), encoding="utf-8") as fh:
    html = fh.read()

back_btn = '<a id="arenaBack" href="/">&#8592; FairPlay Arena</a>'
style = ("<style>#arenaBack{position:fixed;top:12px;left:12px;z-index:100;display:flex;align-items:center;gap:8px;"
         "background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.2);color:#fff;"
         "padding:8px 14px;border-radius:999px;font-weight:700;font-size:13px;text-decoration:none;"
         "backdrop-filter:blur(10px);font-family:system-ui}"
         "#arenaBack:hover{border-color:#f5c518}</style>")
html = html.replace("</head>", style + "</head>")
html = html.replace('<div id="root"></div>', back_btn + '<div id="root"></div>')

with open(TPL, "w", encoding="utf-8") as fh:
    fh.write(html)
print("Champion synced: assets + templates/champion.html")
