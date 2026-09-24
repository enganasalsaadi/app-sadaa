"""Generates every SVG in src/assets/images/logo/ (rule 08). Never hand-edit those files.

Run: python3 scripts/logo/gen.py

wordmark-glyphs.svg = «صدى» Tajawal ExtraBold shaped by HarfBuzz, so the wordmark has no font dependency.
Regenerate only if the wordmark font changes:
  hb-view Tajawal-ExtraBold.ttf "صدى" --output-format=svg --font-size=100 --margin=0 -o scripts/logo/wordmark-glyphs.svg
If regenerated, re-measure the ص counter centre (DOT_X, DOT_Y) and the ص body bottom (BODY_BOTTOM).
"""
import re, math, os
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', '..', 'src', 'assets', 'images', 'logo')
N, T, M, B = '#1C3349', '#397D8C', '#12B886', '#F5F7F9'
TILT = -20
SPAN = math.radians(50)
TIER = {'lg': dict(r=[19, 30, 41], sw=6, dot=9, op=[.5, .75, 1]),
        'md': dict(r=[22, 38], sw=8, dot=10, op=[.75, 1]),
        'sm': dict(r=[30], sw=11, dot=12, op=[1])}
DOT_X, DOT_Y, BODY_BOTTOM = 194.65, 40.7, 64.3


def arc(r, side):
    base = math.pi if side == 'l' else 0
    p = lambda a: (f"{50 + r * math.cos(a):.2f}", f"{50 + r * math.sin(a):.2f}")
    (x1, y1), (x2, y2) = p(base - SPAN), p(base + SPAN)
    return f"M{x1} {y1}A{r} {r} 0 0 1 {x2} {y2}"


def sym_body(tier, l, r, d, flat=False):
    k = TIER[tier]
    out = []
    for side, col in (('l', l), ('r', r)):
        for rad, op in zip(k['r'], k['op']):
            o = '' if flat or op == 1 else f' stroke-opacity="{op}"'
            out.append(f'<path d="{arc(rad, side)}" stroke="{col}"{o}/>')
    return (f'<g transform="rotate({TILT} 50 50)" fill="none" stroke-width="{k["sw"]}" stroke-linecap="round">'
            + ''.join(out) + f'</g><circle cx="50" cy="50" r="{k["dot"]}" fill="{d}"/>')


def svg(vb, body):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" fill="none">{body}</svg>\n'


s = open(os.path.join(HERE, 'wordmark-glyphs.svg')).read()
glyphs = dict(re.findall(r'id="(glyph-0-\d)">\s*<path d="([^"]+)"', s))
uses = re.findall(r'href="#(glyph-0-\d)" x="([\d.]+)" y="([\d.]+)"', s)


def compact(d):
    return re.sub(r'\s+', ' ', re.sub(r'(\d)\.(\d{2})\d+', r'\1.\2', d)).strip()


def wm_body(fill, dx=0, dy=0):
    parts = [f'<path transform="translate({float(x) + dx:.3f} {float(y) + dy:.3f})" d="{compact(glyphs[g])}"/>'
             for g, x, y in uses]
    return f'<g fill="{fill}">' + ''.join(parts) + f'</g><circle cx="{DOT_X + dx:.2f}" cy="{DOT_Y + dy:.2f}" r="5" fill="{M}"/>'


xs, ys = [], []
for g, x, y in uses:
    n = list(map(float, re.findall(r'-?\d+\.?\d*', glyphs[g])))
    xs += [v + float(x) for v in n[0::2]]
    ys += [v + float(y) for v in n[1::2]]
x0, x1, y0, y1 = min(xs), max(xs), min(ys), max(ys)
W, H = x1 - x0, y1 - y0


def write(name, content):
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(content)
    print(name, len(content))


for t in TIER:
    write(f'symbol-{t}.svg', svg('0 0 100 100', sym_body(t, N, T, M)))
    # On navy: navy arcs become BG, teal stays (matches dark lockup + app icon).
    write(f'symbol-{t}-dark.svg', svg('0 0 100 100', sym_body(t, B, T, M)))
write('symbol-mono.svg', svg('0 0 100 100', sym_body('lg', 'currentColor', 'currentColor', 'currentColor', flat=True)))
write('wordmark-light.svg', svg(f'0 0 {W:.2f} {H:.2f}', wm_body(N, -x0, -y0)))
write('wordmark-dark.svg', svg(f'0 0 {W:.2f} {H:.2f}', wm_body(B, -x0, -y0)))

# Lockup: symbol on the RTL reading-start side (right), 1.2x font size, gap 0.23x, centred on the ص body.
S, GAP = 120, 23
sy = (y0 + BODY_BOTTOM) / 2 - S / 2
top, bot = min(y0, sy), max(y1, sy + S)


def lockup(wfill, l, r):
    sx = W + GAP
    return svg(f'0 0 {sx + S:.2f} {bot - top:.2f}',
               wm_body(wfill, -x0, -top) + f'<g transform="translate({sx:.2f} {sy - top:.2f}) scale({S / 100})">'
               + sym_body('lg', l, r, M) + '</g>')


write('logo-full-light.svg', lockup(N, N, T))
write('logo-full-dark.svg', lockup(B, B, T))

# App icon = dark lockup symbol colours on full-bleed navy (OS applies the corner mask).
write('app-icon.svg', svg('0 0 1024 1024', f'<rect width="1024" height="1024" fill="{N}"/>'
                          f'<g transform="translate(192 192) scale(6.4)">' + sym_body('lg', B, T, M) + '</g>'))
