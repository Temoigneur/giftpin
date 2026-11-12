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
full = json.load(open(f"{root}/docs/screenshots/manifest.json"))
manifest = full["shots"]
out_dir = f"{root}/public/guides/{lang}"
os.makedirs(out_dir, exist_ok=True)
FONT = next((p for p in ["/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"] if os.path.exists(p)), None)


# Names and emails that must not be published are covered with grey boxes (as in the English images).
# "redactions": {"<plate>": [[x, y, w, h], ...]} in plate pixels.
def load_plate(name):
    im = Image.open(f"{root}/docs/screenshots/raw/{lang}/{name}.png").convert("RGB")
    for x, y, w, h in full.get("redactions", {}).get(name, []):
        ImageDraw.Draw(im).rectangle([x, y, x + w, y + h], fill=(200, 200, 200))
    return im

def badge(d, f, n, cx, cy):
    if not n:
        return
    d.ellipse([cx - 14, cy - 14, cx + 14, cy + 14], fill=RED, outline=(255, 255, 255), width=2)
    d.text((cx, cy), str(n), fill="white", font=f, anchor="mm")

def arrow(d, pts):
    d.line(pts, fill=RED, width=6, joint="curve")
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    import math
    a = math.atan2(y1 - y0, x1 - x0)
    L = 18
    tip = (x1, y1)
    l = (x1 - L * math.cos(a - 0.5), y1 - L * math.sin(a - 0.5))
    r = (x1 - L * math.cos(a + 0.5), y1 - L * math.sin(a + 0.5))
    d.polygon([tip, l, r], fill=RED)

# Plates taller than one screen are stitched from two real captures of the same page:
# "stitches": {"<name>": [[plate, y0, y1], ...]} stacks the rows y0..y1 of each plate, in order.
for name, parts in full.get("stitches", {}).items():
    rows = [Image.open(f"{root}/docs/screenshots/raw/{lang}/{pl}.png").convert("RGB").crop((0, a, 1568, b)) for pl, a, b in parts]
    st = Image.new("RGB", (1568, sum(r.height for r in rows)))
    yy = 0
    for r in rows:
        st.paste(r, (0, yy))
        yy += r.height
    st.save(f"{root}/docs/screenshots/raw/{lang}/{name}.png")

for name, spec in full.get("composites", {}).items():
    W, H = spec["size"]
    im = Image.new("RGB", (W, H), "white")
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 20) if FONT else ImageFont.load_default()
    for pn in spec["panels"]:
        plate = load_plate(pn["plate"])
        x, y, w, h = pn["crop"]
        s = pn["w"] / w
        pw, ph = pn["w"], round(h * s)
        im.paste(plate.crop((x, y, x + w, y + h)).resize((pw, ph), Image.LANCZOS), tuple(pn["at"]))
        d.rectangle([pn["at"][0], pn["at"][1], pn["at"][0] + pw - 1, pn["at"][1] + ph - 1], outline=(200, 200, 200), width=1)
    for pn in spec["panels"]:
        x, y, w, h = pn["crop"]
        s = pn["w"] / w
        for n, bx, by, bw, bh in pn["boxes"]:
            r = [pn["at"][0] + (bx - x) * s, pn["at"][1] + (by - y) * s, pn["at"][0] + (bx - x + bw) * s, pn["at"][1] + (by - y + bh) * s]
            d.rounded_rectangle(r, radius=8, outline=RED, width=4)
            badge(d, f, n, r[0] + 3, r[1] + 1)
    for pts in spec["arrows"]:
        arrow(d, [tuple(p) for p in pts])
    im.save(f"{out_dir}/{name}", optimize=True)
    print("wrote", f"public/guides/{lang}/{name}", im.size)

for name, spec in manifest.items():
    plate = load_plate(spec["plate"])
    x, y, w, h = spec["crop"]
    en_w = Image.open(f"{root}/public/guides/{name}").width
    s = en_w / w
    im = plate.crop((x, y, x + w, y + h)).resize((en_w, round(h * s)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    f = ImageFont.truetype(FONT, 20) if FONT else ImageFont.load_default()
    for n, bx, by, bw, bh in spec["boxes"]:
        r = [(bx - x) * s, (by - y) * s, (bx - x + bw) * s, (by - y + bh) * s]
        d.rounded_rectangle(r, radius=10, outline=RED, width=4)
        badge(d, f, n, r[0] + 4, r[1] + 2)
    im.save(f"{out_dir}/{name}", optimize=True)
    print("wrote", f"public/guides/{lang}/{name}", im.size)
