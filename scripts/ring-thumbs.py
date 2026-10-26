"""Thumbnails of the hero renders for the ring page's design-history cards."""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "media" / "ring" / "renders"
OUT.mkdir(parents=True, exist_ok=True)
for name in ("hers_hero", "hers_v1_hero", "his_hero"):
    src = ROOT / "ring" / "renders" / f"{name}.png"
    if not src.exists():
        print("missing", src); continue
    im = Image.open(src).convert("RGB")
    im.thumbnail((700, 700), Image.LANCZOS)
    im.save(OUT / f"{name}.jpg", quality=86, optimize=True, progressive=True)
    print("wrote", OUT / f"{name}.jpg")
