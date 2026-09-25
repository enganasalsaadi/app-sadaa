"""Generates every SVG in src/assets/images/logo/ (rule 08). Never hand-edit those files.

Run: python3 scripts/logo/gen.py

wordmark-glyphs.svg = «صدى» Tajawal ExtraBold shaped by HarfBuzz, so the wordmark has no font dependency.
Regenerate only if the wordmark font changes:
  hb-view Tajawal-ExtraBold.ttf "صدى" --output-format=svg --font-size=100 --margin=0 -o scripts/logo/wordmark-glyphs.svg
If regenerated, re-measure the ص counter centre (DOT_X, DOT_Y) and the ص body bottom (BODY_BOTTOM).

wordmark-glyphs-en.svg = «Sada», same font and method:
  hb-view Tajawal-ExtraBold.ttf "Sada" --output-format=svg --font-size=100 --margin=0 -o scripts/logo/wordmark-glyphs-en.svg
If regenerated, re-measure the d bowl centre (EN_DOT_X, EN_DOT_Y) and the S cap height (EN_CAP).
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
# «Sada»: d bowl centre (counter x 17.4–36.2, y −37.0…−8.5 from the d origin) and S cap height.
EN_DOT_X, EN_DOT_Y, EN_CAP = 103.30 + 26.8, 65.30 - 22.75, 64.5


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


def compact(d):
    return re.sub(r'\s+', ' ', re.sub(r'(\d)\.(\d{2})\d+', r'\1.\2', d)).strip()


class Wordmark:
    """HarfBuzz glyph outlines + mint dot centre, both in font-size-100 units."""

    def __init__(self, src, dot_x, dot_y):
        s = open(os.path.join(HERE, src)).read()
        self.glyphs = dict(re.findall(r'id="(glyph-0-\d)">\s*<path d="([^"]+)"', s))
        self.uses = re.findall(r'href="#(glyph-0-\d)" x="([\d.]+)" y="([\d.]+)"', s)
        self.dot_x, self.dot_y = dot_x, dot_y
        xs, ys = [], []
        for g, x, y in self.uses:
            n = list(map(float, re.findall(r'-?\d+\.?\d*', self.glyphs[g])))
            xs += [v + float(x) for v in n[0::2]]
            ys += [v + float(y) for v in n[1::2]]
        self.x0, self.x1, self.y0, self.y1 = min(xs), max(xs), min(ys), max(ys)
        self.W, self.H = self.x1 - self.x0, self.y1 - self.y0
        self.baseline = float(self.uses[0][2])

    def body(self, fill, dx=0, dy=0):
        parts = [f'<path transform="translate({float(x) + dx:.3f} {float(y) + dy:.3f})" d="{compact(self.glyphs[g])}"/>'
                 for g, x, y in self.uses]
        return (f'<g fill="{fill}">' + ''.join(parts)
                + f'</g><circle cx="{self.dot_x + dx:.2f}" cy="{self.dot_y + dy:.2f}" r="5" fill="{M}"/>')


AR = Wordmark('wordmark-glyphs.svg', DOT_X, DOT_Y)
EN = Wordmark('wordmark-glyphs-en.svg', EN_DOT_X, EN_DOT_Y)


def write(name, content):
    with open(os.path.join(OUT, name), 'w') as f:
        f.write(content)
    print(name, len(content))


for t in TIER:
    write(f'symbol-{t}.svg', svg('0 0 100 100', sym_body(t, N, T, M)))
    # On navy: navy arcs become BG, teal stays (matches dark lockup + app icon).
    write(f'symbol-{t}-dark.svg', svg('0 0 100 100', sym_body(t, B, T, M)))
write('symbol-mono.svg', svg('0 0 100 100', sym_body('lg', 'currentColor', 'currentColor', 'currentColor', flat=True)))
for wm, sfx in ((AR, ''), (EN, '-en')):
    write(f'wordmark{sfx}-light.svg', svg(f'0 0 {wm.W:.2f} {wm.H:.2f}', wm.body(N, -wm.x0, -wm.y0)))
    write(f'wordmark{sfx}-dark.svg', svg(f'0 0 {wm.W:.2f} {wm.H:.2f}', wm.body(B, -wm.x0, -wm.y0)))


def lockup(wm, S, GAP, centre, symbol_start, wfill, l):
    """Symbol sits on the reading-start side: right for Arabic, left for English. Never mirrored."""
    sy = centre - S / 2
    top, bot = min(wm.y0, sy), max(wm.y1, sy + S)
    sym = sym_body('lg', l, T, M)
    if symbol_start == 'right':
        sx, wx = wm.W + GAP, -wm.x0
    else:
        sx, wx = 0, S + GAP - wm.x0
    return svg(f'0 0 {wm.W + GAP + S:.2f} {bot - top:.2f}',
               wm.body(wfill, wx, -top) + f'<g transform="translate({sx:.2f} {sy - top:.2f}) scale({S / 100})">'
               + sym + '</g>')


# Arabic: 1.2x font size, gap 0.23x, centred on the ص body.
AR_LOCK = (AR, 120, 23, (AR.y0 + BODY_BOTTOM) / 2, 'right')
# English (approved 2026-09-24): 1.2x cap height, gap 0.23x cap height, centred on the cap height.
EN_LOCK = (EN, 1.2 * EN_CAP, 0.23 * EN_CAP, EN.baseline - EN_CAP / 2, 'left')
aspect = {}
for spec, lang, sfx in ((AR_LOCK, 'ar', ''), (EN_LOCK, 'en', '-en')):
    write(f'logo-full{sfx}-light.svg', lockup(*spec, N, N))
    write(f'logo-full{sfx}-dark.svg', lockup(*spec, B, B))
    for kind in ('logo-full', 'wordmark'):
        w, h = re.search(r'viewBox="0 0 ([\d.]+) ([\d.]+)"',
                         open(os.path.join(OUT, f'{kind}{sfx}-light.svg')).read()).groups()
        aspect.setdefault(kind, {})[lang] = float(w) / float(h)

# BrandLogo sizes its <Svg> from these, so they can never drift from the artwork.
with open(os.path.join(HERE, '..', '..', 'src', 'shared', 'ui', 'BrandLogo', 'logoAspect.ts'), 'w') as f:
    f.write('// Generated by scripts/logo/gen.py — do not edit. viewBox width / height per logo file.\n'
            'export const LOGO_ASPECT = {\n'
            + ''.join(f"  {key}: {{ ar: {aspect[kind]['ar']:.4f}, en: {aspect[kind]['en']:.4f} }},\n"
                      for key, kind in (('full', 'logo-full'), ('wordmark', 'wordmark')))
            + '} as const;\n')
print('logoAspect.ts')

# App icon = dark lockup symbol colours on full-bleed navy (OS applies the corner mask).
write('app-icon.svg', svg('0 0 1024 1024', f'<rect width="1024" height="1024" fill="{N}"/>'
                          f'<g transform="translate(192 192) scale(6.4)">' + sym_body('lg', B, T, M) + '</g>'))
