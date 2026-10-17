#!/usr/bin/env python3
# SPDX-License-Identifier: GPL-3.0-or-later
"""Draws the launcher's Melee-style art (resources/launcher.rml) into
resources/launcher/, and cuts its menu font:

  launcher/sprites.png   menu plates (idle and selected, and the settings
                         categories' pointer-hover plate), the cursor disc,
                         the value arrows; drawn at 2x, see launcher.rcss
  launcher/backdrop.png  the navy grid and light swirls behind the menus
                         (PNG: aurora's RmlUi loads no other format)
  menu.ttf, menu-bold.ttf, menu-heavy.ttf
                         Noto Sans SemiCondensed Regular, Bold and ExtraBold
                         (the plates' names), cut to Latin (OFL;
                         FONT-LICENSE.txt)

The look follows Melee's own Main Menu and Options screens: dark plates with
a gold rim, a chevron at the left end and a D tab at the right, the selected
plate filled yellow with the glowing cursor disc on its tab. Everything is
drawn here; nothing comes from the disc.

Needs Pillow and fontTools. The Noto files come from the system
(Fedora's google-noto-sans-fonts) unless --noto points elsewhere.
Run from anywhere: python3 tools/launcher_art/make_launcher_art.py
"""
import argparse
import math
import os
import random

from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, "..", ".."))
RES = os.path.join(ROOT, "resources")
OUT = os.path.join(RES, "launcher")

SS = 4  # supersampling: shapes drawn at 4x the sprite size, then reduced

# Melee's menu palette, sampled from the Main Menu and Options screens.
GOLD_HI = (246, 214, 112)
GOLD = (214, 170, 62)
GOLD_LO = (120, 88, 26)
PLATE_TOP = (34, 28, 12)
PLATE_BOTTOM = (6, 6, 8)
YELLOW_HI = (255, 236, 96)
YELLOW = (255, 203, 0)
YELLOW_LO = (226, 160, 0)
DISC = (253, 238, 100)
DISC_RING = (215, 211, 85)

# Sprite sheet layout. Sizes are sprite pixels at 2x (the sheet's
# `resolution: 2x`), so a 112 px plate is 56 dp tall. launcher.rcss repeats
# these rectangles; keep the two in step.
PLATE_W, PLATE_H = 480, 180
SMALL_H = 124
DISC_SIZE = 184
ARROW_W, ARROW_H = 28, 40
ARROWS_X = DISC_SIZE + 8
HOVER_Y = PLATE_H + SMALL_H + DISC_SIZE  # the small plate's hover variant


def vgradient(w, h, stops):
    """A vertical gradient through (position, colour) stops."""
    img = Image.new("RGBA", (w, h))
    draw = ImageDraw.Draw(img)
    for y in range(h):
        t = y / max(1, h - 1)
        for i in range(len(stops) - 1):
            p0, c0 = stops[i]
            p1, c1 = stops[i + 1]
            if p0 <= t <= p1:
                f = (t - p0) / max(1e-6, p1 - p0)
                c = tuple(int(c0[k] + (c1[k] - c0[k]) * f) for k in range(3)) + (255,)
                break
        draw.line((0, y, w - 1, y), fill=c)
    return img


GLOW = 10  # sprite pixels kept clear around each plate for the selected glow


def rounded_chevron(x0, y0, x1, y1, top_in, bottom_in, radius, steps=12):
    """A plate silhouette: Melee's leaning chevron at the left, its point
    two thirds of the way down, its top corner `top_in` in from the point and
    its bottom corner `bottom_in` (less, so the bottom reaches further left);
    the right end rounded with `radius`."""
    h = y1 - y0
    pts = [(x0, y0 + h * 0.70), (x0 + top_in, y0)]
    cx, cy = x1 - radius, y0 + radius  # top-right corner
    for i in range(steps + 1):
        a = -math.pi / 2 + (math.pi / 2) * i / steps
        pts.append((cx + radius * math.cos(a), cy + radius * math.sin(a)))
    cx, cy = x1 - radius, y1 - radius  # bottom-right corner
    for i in range(steps + 1):
        a = (math.pi / 2) * i / steps
        pts.append((cx + radius * math.cos(a), cy + radius * math.sin(a)))
    pts.append((x0 + bottom_in, y1))
    return pts


def plate_geometry(w, h, scale=1):
    """Where a plate's parts sit, in sprite pixels times `scale`. The
    proportions are measured off Melee's Main Menu: the gold band is about
    18% of the plate's height along the top and 12% along the bottom, and the
    right end is a black ring around the gold P (see draw_plate)."""
    g = GLOW * scale
    x0, y0, x1, y1 = g, g, w * scale - g, h * scale - g
    bh = y1 - y0
    wy0, wy1 = y0 + bh * 0.18, y1 - bh * 0.12
    wh = wy1 - wy0
    # The ring is a little taller than wide; its top runs flush with the
    # window's top edge.
    ring_out, ring_in = (wh * 0.42, wh * 0.50), (wh * 0.25, wh * 0.33)
    cx = x1 - ring_out[0] - bh * 0.14  # the ring's centre, and the cursor disc's
    cy = wy0 + wh * 0.50
    return dict(x0=x0, y0=y0, x1=x1, y1=y1, bh=bh, wy0=wy0, wy1=wy1, wh=wh,
                casing=(bh * 0.39, bh * 0.14), wx0=x0 + bh * 0.22, window=(wh * 0.36, wh * 0.18),
                wx1=cx - wh * 0.22, cx=cx, cy=cy, ring_out=ring_out, ring_in=ring_in)


def ninepatch_rect(h):
    """The stretchable middle of a plate (x, y, w, h): clear of the chevron,
    the bands and the tab."""
    p = plate_geometry(PLATE_W, h)
    left = int(p["x0"] + p["casing"][0] + 6)
    right = int(p["wx1"] - 6)
    top, bottom = int(p["wy0"] + 2), int(p["wy1"] - 2)
    return left, top, right - left, bottom - top


def tab_centre(h):
    """The ring's centre, from the plate's right edge and top, in sprite
    pixels: where the cursor disc goes."""
    p = plate_geometry(PLATE_W, h)
    return PLATE_W - p["cx"], p["cy"]


def draw_plate(h, selected, hover=False):
    """Melee's menu plate. Idle: a soft, glowing gold band around a
    see-through black window. At the right end the window stops square, and a
    black ring arcs from its top edge round the right and drops straight down
    through the bottom band; the gold it encloses is the P (a small black
    half disc for its counter), and the casing's rounded end wraps the ring.
    Selected: the whole plate solid yellow, glowing (the cursor disc goes on
    the ring, as a separate sprite). Hover, in between: the idle plate with a
    brighter rim and its window lit a dim amber."""
    w = PLATE_W
    W, H = w * SS, h * SS
    g = GLOW * SS
    p = plate_geometry(w, h, SS)
    x0, y0, x1, y1, bh = p["x0"], p["y0"], p["x1"], p["y1"], p["bh"]
    casing = rounded_chevron(x0, y0, x1, y1, *p["casing"], bh * 0.46)
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    mask = Image.new("L", (W, H), 0)
    ImageDraw.Draw(mask).polygon(casing, fill=255)
    if selected:
        halo = mask.filter(ImageFilter.GaussianBlur(g * 0.6)).point(lambda v: int(v * 0.85))
        img.paste((255, 214, 40, 255), (0, 0), halo)
        body = vgradient(W, H, [(0, (255, 226, 70)), (0.2, YELLOW), (0.85, YELLOW), (1, (240, 178, 0))])
        layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        layer.paste(body, (0, 0), mask.filter(ImageFilter.GaussianBlur(SS * 3)))
        img.alpha_composite(layer)
        return img.resize((w, h), Image.LANCZOS)
    wy0, wy1, wh = p["wy0"], p["wy1"], p["wh"]
    cx, cy, (rox, roy), (rix, riy) = p["cx"], p["cy"], p["ring_out"], p["ring_in"]
    # Everything black: the window, square at its right end ...
    black = Image.new("L", (W, H), 0)
    d = ImageDraw.Draw(black)
    d.polygon(rounded_chevron(p["wx0"], wy0, p["wx1"] + wh * 0.02, wy1, *p["window"], 1, steps=1), fill=255)
    # ... the ring's right half, its top joined to the window's top edge ...
    d.pieslice((cx - rox, cy - roy, cx + rox, cy + roy), -90, 90, fill=255)
    d.pieslice((cx - rix, cy - riy, cx + rix, cy + riy), -90, 90, fill=0)
    d.rectangle((p["wx1"], cy - roy, cx, cy - riy), fill=255)
    # ... its foot dropping straight down through the bottom band ...
    d.rectangle((cx - wh * 0.11, cy + riy, cx - wh * 0.01, y1), fill=255)
    d.rectangle((cx - wh * 0.11, cy + riy, cx, cy + roy), fill=255)  # the ring's lower end
    # ... and the P's counter, a half disc against its stem.
    ccx, ccy, rc = cx - wh * 0.12, cy - wh * 0.02, wh * 0.13
    d.pieslice((ccx - rc, ccy - rc, ccx + rc, ccy + rc), -90, 90, fill=255)
    # The casing's glowing gold, everywhere the black is not.
    if hover:
        gold = vgradient(W, H, [(0, (255, 226, 128)), (0.35, (246, 200, 84)), (1, (214, 162, 52))])
    else:
        gold = vgradient(W, H, [(0, (236, 190, 84)), (0.35, (218, 166, 58)), (1, (184, 132, 40))])
    band = ImageChops.subtract(mask, black)
    glow = band.filter(ImageFilter.GaussianBlur(g * 0.6)).point(lambda v: int(v * (0.95 if hover else 0.75)))
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(gold, (0, 0), glow)
    img.alpha_composite(layer)
    # The black, see-through, so the grid shows in it (clipped to the casing:
    # the ring's foot stops at its bottom edge).
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    window = (86, 60, 6, 215) if hover else (6, 6, 10, 205)
    layer.paste(window, (0, 0), ImageChops.multiply(black, mask).filter(ImageFilter.GaussianBlur(SS * 2)))
    img.alpha_composite(layer)
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    layer.paste(gold, (0, 0), band.filter(ImageFilter.GaussianBlur(SS * 5)))
    img.alpha_composite(layer)
    return img.resize((w, h), Image.LANCZOS)


def draw_disc():
    """The cursor disc on the selected plate's tab: pale yellow and partly
    see-through, ringed, with the tab's P faint inside it and ripples of
    light spreading from it."""
    s = DISC_SIZE * SS
    c = s / 2
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))

    def ring(r, width, colour, blur=0):
        layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse((c - r, c - r, c + r, c + r), outline=colour, width=int(width))
        img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)) if blur else layer)

    def disc(r, colour, blur=0):
        layer = Image.new("RGBA", (s, s), (0, 0, 0, 0))
        ImageDraw.Draw(layer).ellipse((c - r, c - r, c + r, c + r), fill=colour)
        img.alpha_composite(layer.filter(ImageFilter.GaussianBlur(blur)) if blur else layer)

    disc(s * 0.44, (255, 236, 90, 110), blur=s * 0.04)  # glow
    ring(s * 0.47, SS * 1.5, (255, 240, 140, 90), blur=SS)  # ripples
    ring(s * 0.41, SS * 1.5, (255, 240, 140, 120), blur=SS)
    disc(s * 0.36, (226, 234, 132, 235))  # outer ring
    disc(s * 0.29, (244, 242, 150, 245))  # face
    ring(s * 0.19, SS * 3, (214, 200, 70, 230))
    disc(s * 0.11, (250, 236, 110, 255))
    # The tab's P, faint through the face: its right half is shaded.
    shade = Image.new("L", (s, s), 0)
    ImageDraw.Draw(shade).pieslice((c - s * 0.29, c - s * 0.29, c + s * 0.29, c + s * 0.29), -90, 90, fill=70)
    img.paste((120, 130, 90, 255), (0, 0), shade.filter(ImageFilter.GaussianBlur(SS)))
    disc(s * 0.05, (150, 140, 40, 220))
    return img.resize((DISC_SIZE, DISC_SIZE), Image.LANCZOS)


def draw_arrow(direction, colour):
    w, h = ARROW_W * SS, ARROW_H * SS
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    m = 3 * SS
    if direction < 0:
        pts = [(w - m, m), (w - m, h - m), (m, h / 2)]
    else:
        pts = [(m, m), (m, h - m), (w - m, h / 2)]
    d.polygon(pts, fill=colour + (255,))
    return img.resize((ARROW_W, ARROW_H), Image.LANCZOS)


def sprites():
    """One sheet. The rectangles here are the ones launcher.rcss names."""
    sheet = Image.new("RGBA", (1024, 640), (0, 0, 0, 0))
    y = 0
    sheet.alpha_composite(draw_plate(PLATE_H, False), (0, y))
    sheet.alpha_composite(draw_plate(PLATE_H, True), (512, y))
    y += PLATE_H
    sheet.alpha_composite(draw_plate(SMALL_H, False), (0, y))
    sheet.alpha_composite(draw_plate(SMALL_H, True), (512, y))
    y += SMALL_H
    sheet.alpha_composite(draw_disc(), (0, y))
    x = ARROWS_X
    for i, (direction, colour) in enumerate(
            [(-1, GOLD), (1, GOLD), (-1, (24, 18, 4)), (1, (24, 18, 4))]):
        sheet.alpha_composite(draw_arrow(direction, colour), (x + i * (ARROW_W + 8), y))
    sheet.alpha_composite(draw_plate(SMALL_H, False, hover=True), (0, HOVER_Y))
    return sheet


def backdrop(w=1600, h=1000):
    """Melee's menu backdrop: deep navy, a grid bent like the inside of a
    sphere, and thin rings of light sweeping through it."""
    rnd = random.Random(1102)
    img = vgradient(w, h, [(0, (7, 7, 26)), (0.45, (13, 14, 48)), (1, (5, 5, 20))]).convert("RGB")

    # Coloured haze, as the menus have behind the rings.
    haze = Image.new("RGB", (w, h), (0, 0, 0))
    d = ImageDraw.Draw(haze)
    for (cx, cy, r, col) in [(0.82, 0.18, 0.30, (90, 18, 48)), (0.12, 0.62, 0.22, (14, 70, 40)),
                             (0.55, 0.85, 0.35, (30, 26, 110)), (0.30, 0.20, 0.25, (40, 30, 120))]:
        d.ellipse(((cx - r) * w, (cy - r) * w + (h - w) / 2, (cx + r) * w, (cy + r) * w + (h - w) / 2), fill=col)
    haze = haze.filter(ImageFilter.GaussianBlur(w * 0.08))
    img = ImageChops.add(img, haze.point(lambda v: int(v * 0.5)))

    # The grid, drawn bowed outward from the centre.
    grid = Image.new("L", (w * 2, h * 2), 0)
    d = ImageDraw.Draw(grid)
    k = 0.18

    def bow(x, y):
        nx, ny = x / w - 0.5, y / h - 0.5
        f = 1 + k * (nx * nx + ny * ny) * 4
        return ((nx * f + 0.5) * w * 2, (ny * f + 0.5) * h * 2)

    step = w / 22
    for gx in range(-4, 27):
        pts = [bow(gx * step, y) for y in range(-200, h + 200, 20)]
        d.line(pts, fill=150, width=3)
    for gy in range(-4, int(h / step) + 5):
        pts = [bow(x, gy * step) for x in range(-200, w + 200, 20)]
        d.line(pts, fill=150, width=3)
    grid = grid.resize((w, h), Image.LANCZOS)
    img.paste((56, 68, 170), (0, 0), grid.point(lambda v: int(v * 0.75)))

    # Rings of light.
    rings = Image.new("RGB", (w, h), (0, 0, 0))
    for i in range(9):
        layer = Image.new("RGB", (w, h), (0, 0, 0))
        d = ImageDraw.Draw(layer)
        cx = w * rnd.uniform(0.25, 0.8)
        cy = h * rnd.uniform(0.3, 0.8)
        rx = w * rnd.uniform(0.18, 0.55)
        ry = rx * rnd.uniform(0.25, 0.6)
        col = rnd.choice([(110, 120, 255), (150, 110, 255), (90, 160, 255), (200, 200, 255)])
        start = rnd.uniform(0, 360)
        d.arc((cx - rx, cy - ry, cx + rx, cy + ry), start, start + rnd.uniform(90, 220), fill=col, width=3)
        layer = layer.rotate(rnd.uniform(-35, 35), center=(cx, cy), resample=Image.BICUBIC)
        glow = layer.filter(ImageFilter.GaussianBlur(10))
        rings = ImageChops.add(rings, ImageChops.add(layer, glow))
    img = ImageChops.add(img, rings.point(lambda v: int(v * 0.55)))

    # Darken the edges so the frame reads against them.
    vignette = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(vignette)
    d.ellipse((-w * 0.15, -h * 0.2, w * 1.15, h * 1.2), fill=255)
    vignette = vignette.filter(ImageFilter.GaussianBlur(w * 0.08))
    img = Image.composite(img, Image.new("RGB", (w, h), (4, 4, 14)), vignette)
    return img


# Latin, Latin-1, Latin Extended-A, general punctuation, currency, arrows.
LATIN = ("U+0020-007E,U+00A0-00FF,U+0100-017F,U+2010-2027,U+2030-205E,"
         "U+20A0-20C0,U+2122,U+2190-2195,U+2212")


def cut_font(src, dst):
    from fontTools import subset
    options = subset.Options()
    options.layout_features = ["kern", "liga", "calt", "ccmp", "locl", "mark", "mkmk"]
    options.name_IDs = ["*"]
    options.notdef_outline = True
    font = subset.load_font(src, options)
    sub = subset.Subsetter(options)
    sub.populate(unicodes=subset.parse_unicodes(LATIN))
    sub.subset(font)
    subset.save_font(font, dst, options)


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--noto", default="/usr/share/fonts/google-noto",
                        help="directory holding NotoSans-SemiCondensed{,Bold,ExtraBold}.ttf")
    parser.add_argument("--no-fonts", action="store_true", help="redraw the art only")
    args = parser.parse_args()
    os.makedirs(OUT, exist_ok=True)
    sprites().save(os.path.join(OUT, "sprites.png"), optimize=True)
    # The sheet's rectangles, for launcher.rcss's @spritesheet.
    disc_y = PLATE_H + SMALL_H
    lines = []
    for name, h, y in [("plate", PLATE_H, 0), ("small", SMALL_H, PLATE_H)]:
        x, iy, iw, ih = ninepatch_rect(h)
        edges = f"{iy / 2:g}dp {(PLATE_W - x - iw) / 2:g}dp {(h - iy - ih) / 2:g}dp {x / 2:g}dp"
        for suffix, ox in [("", 0), ("-on", 512)]:
            lines.append(f"{name}{suffix}: {ox}px {y}px {PLATE_W}px {h}px;")
            lines.append(f"{name}{suffix}-inner: {ox + x}px {y + iy}px {iw}px {ih}px;")
        if name == "small":
            lines.append(f"{name}-hover: 0px {HOVER_Y}px {PLATE_W}px {h}px;")
            lines.append(f"{name}-hover-inner: {x}px {HOVER_Y + iy}px {iw}px {ih}px;")
        lines.append(f"/* {name} edges: {edges} */")
    lines.append(f"disc: 0px {disc_y}px {DISC_SIZE}px {DISC_SIZE}px;")
    for name, h in [("plate", PLATE_H), ("small", SMALL_H)]:
        right, top = tab_centre(h)
        lines.append(f"/* {name} ring centre: {right / 2:g}dp from the right, {top / 2:g}dp down */")
    for i, n in enumerate(["arrow-l", "arrow-r", "arrow-l-dark", "arrow-r-dark"]):
        lines.append(f"{n}: {ARROWS_X + i * (ARROW_W + 8)}px {disc_y}px {ARROW_W}px {ARROW_H}px;")
    print("\n".join(lines))
    backdrop().save(os.path.join(OUT, "backdrop.png"), optimize=True)
    if not args.no_fonts:
        cut_font(os.path.join(args.noto, "NotoSans-SemiCondensed.ttf"), os.path.join(RES, "menu.ttf"))
        cut_font(os.path.join(args.noto, "NotoSans-SemiCondensedBold.ttf"), os.path.join(RES, "menu-bold.ttf"))
        cut_font(os.path.join(args.noto, "NotoSans-SemiCondensedExtraBold.ttf"),
                 os.path.join(RES, "menu-heavy.ttf"))
    for name in ["launcher/sprites.png", "launcher/backdrop.png", "menu.ttf", "menu-bold.ttf", "menu-heavy.ttf"]:
        path = os.path.join(RES, name)
        if os.path.exists(path):
            print(f"{name}: {os.path.getsize(path) // 1024} KiB")


if __name__ == "__main__":
    main()
