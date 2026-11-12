#!/usr/bin/env python3
"""Draw the guide screenshots for one language from raw plates and docs/screenshots/manifest.json.

  python3 scripts/draw-guide-shots.py es

Reads docs/screenshots/raw/<lang>/<plate>.png, crops, scales to the English file's width,
draws rounded red boxes with numbered badges, writes public/guides/<lang>/<name>.png.
Then add the names to LOCALIZED_SHOTS in app/marketing/guide-copy/localized-shots.ts.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

RED = (230, 30, 30)
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
lang = sys.argv[1]
manifest = json.load(open(f"{root}/docs/screenshots/manifest.json"))["shots"]
out_dir = f"{root}/public/guides/{lang}"
os.makedirs(out_dir, exist_ok=True)
FONT = next((p for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if os.path.exists(p)), None)

for name, spec in manifest.items():
    plate = Image.open(f"{root}/docs/screenshots/raw/{lang}/{spec['plate']}.png").convert("RGB")
    x, y, w, h = spec["crop"]
    en_w = Image.open(f"{root}/public/guides/{name}").width
    s = en_w / w
    im = plate.crop((x, y, x + w, y + h)).resize((en_w, round(h * s)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 20) if FONT else ImageFont.load_default()
    for n, bx, by, bw, bh in spec["boxes"]:
        r = [(bx - x) * s, (by - y) * s, (bx - x + bw) * s, (by - y + bh) * s]
        d.rounded_rectangle(r, radius=10, outline=RED, width=4)
        cx, cy = r[0] + 4, r[1] + 2
        d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=RED, outline=(255, 255, 255), width=2)
        d.text((cx, cy), str(n), fill="white", font=f, anchor="mm")
    im.save(f"{out_dir}/{name}", optimize=True)
    print("wrote", f"public/guides/{lang}/{name}", im.size)
