# Rasterise public/favicon.svg into the PWA and Apple icons. Run after `npm run icon`.
# The maskable icon keeps the art inside the safe zone (80%) on a navy field.
from playwright.sync_api import sync_playwright
import pathlib
svg = pathlib.Path('public/favicon.svg').read_text()
def page_html(size, inner):
    return f"<html><body style='margin:0;background:#0b2036;width:{size}px;height:{size}px;display:grid;place-items:center'>{inner}</body></html>"
jobs = [('public/icon-192.png', 192, 192), ('public/icon-512.png', 512, 512), ('public/apple-touch-icon.png', 180, 180), ('public/icon-maskable-512.png', 512, 410)]
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page()
    for out, size, art in jobs:
        pg.set_viewport_size({'width': size, 'height': size})
        pg.set_content(page_html(size, svg.replace(f'width="64" height="64"', f'width="{art}" height="{art}"')))
        pg.screenshot(path=out, omit_background=False)
        print('wrote', out)
    b.close()
