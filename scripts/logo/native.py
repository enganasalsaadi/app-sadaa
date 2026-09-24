"""Generates native app icons + bootsplash assets from src/assets/images/logo/*.svg (rule 08). Never hand-edit outputs.

Run: python3 scripts/logo/native.py   (needs Google Chrome for SVG rendering + ImageMagick `magick`)

Writes:
  ios/Sadaa/Images.xcassets/AppIcon.appiconset/*.png   every file in its Contents.json, opaque (no alpha)
  ios/Sadaa/Images.xcassets/iTunesArtwork@{1,2,3}x.png  opaque
  ios/Sadaa/Images.xcassets/BootSplashLogo-*.imageset/*.png   logo-full-dark, transparent, current pixel sizes
  ios BootSplash colorset + BootSplash.storyboard background -> navy
  android res mipmap-*/ic_launcher{,_round,_foreground}.png, playstore-icon.png
  android res drawable-*/bootsplash_logo.png (logo width 130dp on the 288dp bootsplash canvas)
  android res drawable-*/ic_notification.png (24dp, white symbol-mono in the 20dp live area)
  android values colors: ic_launcher_background + bootsplash_background -> navy, notification_accent -> teal
Sources: app-icon.svg (icons), logo-full-dark.svg (bootsplash), symbol-mono.svg (notification). Adaptive foreground = app-icon.svg minus its navy rect.
"""
import json, os, re, subprocess, tempfile
ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..'))
LOGO = os.path.join(ROOT, 'src', 'assets', 'images', 'logo')
IOS = os.path.join(ROOT, 'ios', 'Sadaa')
XC = os.path.join(IOS, 'Images.xcassets')
RES = os.path.join(ROOT, 'android', 'app', 'src', 'main', 'res')
CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
N, T = '#1C3349', '#397D8C'
DENS = {'ldpi': .75, 'mdpi': 1, 'hdpi': 1.5, 'xhdpi': 2, 'xxhdpi': 3, 'xxxhdpi': 4}
TMP = tempfile.mkdtemp()


def read(name):
    return open(os.path.join(LOGO, name)).read()


def render(svg, out, w, h, box=None):
    """Rasterise svg text into a w×h transparent PNG, fitted (contain) into box=(x, y, bw, bh)."""
    x, y, bw, bh = box or (0, 0, w, h)
    src = os.path.join(TMP, 'src.svg')
    html = os.path.join(TMP, 'page.html')
    open(src, 'w').write(svg)
    open(html, 'w').write(
        f'<html><body style="margin:0;width:{w}px;height:{h}px;overflow:hidden">'
        f'<img src="src.svg" style="position:absolute;left:{x}px;top:{y}px;width:{bw}px;height:{bh}px;'
        f'object-fit:contain"></body></html>')
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    f'--screenshot={out}', f'--window-size={w},{h}', '--default-background-color=00000000',
                    'file://' + html], check=True, capture_output=True)


def magick(*args):
    subprocess.run(['magick', *args], check=True)


def opaque(svg, out, px):
    render(svg, out, px, px)
    magick(out, '-background', N, '-flatten', '-alpha', 'off', '-strip', 'PNG24:' + out)


def circle(svg, out, px):
    render(svg, out, px, px)
    magick(out, '-alpha', 'set', '(', '-size', f'{px}x{px}', 'xc:none', '-fill', 'white', '-draw',
           f'circle {px / 2 - .5},{px / 2 - .5} {px / 2 - .5},0', ')', '-compose', 'DstIn', '-composite', '-strip', 'PNG32:' + out)


def size(path):
    return tuple(map(int, subprocess.check_output(['magick', 'identify', '-format', '%w %h', path]).split()))


def sub(path, pattern, repl):
    s = open(path).read()
    s2 = re.sub(pattern, repl, s)
    open(path, 'w').write(s2)
    print('updated' if s2 != s else 'unchanged', os.path.relpath(path, ROOT))


def rgb01(hexc):
    return [int(hexc[i:i + 2], 16) / 255 for i in (1, 3, 5)]


icon = read('app-icon.svg')
foreground = re.sub(r'<rect[^>]*/>', '', icon, count=1)
lockup = read('logo-full-dark.svg')

# iOS app icon: size × scale, flattened on navy (App Store rejects alpha).
iconset = os.path.join(XC, 'AppIcon.appiconset')
for im in json.load(open(os.path.join(iconset, 'Contents.json')))['images']:
    px = round(float(im['size'].split('x')[0]) * int(im['scale'][0]))
    opaque(icon, os.path.join(iconset, im['filename']), px)
    print(im['filename'], px)
for k in (1, 2, 3):
    opaque(icon, os.path.join(XC, f'iTunesArtwork@{k}x.png'), 512 * k)

# iOS bootsplash: keep current pixel sizes (storyboard frame depends on them).
splash = next(d for d in os.listdir(XC) if d.startswith('BootSplashLogo'))
for f in sorted(os.listdir(os.path.join(XC, splash))):
    if f.endswith('.png'):
        p = os.path.join(XC, splash, f)
        render(lockup, p, *size(p))
        print(f, size(p))
r, g, b = rgb01(N)
colorset = next(d for d in os.listdir(os.path.join(IOS, 'Colors.xcassets')) if d.startswith('BootSplashBackground'))
cs = os.path.join(IOS, 'Colors.xcassets', colorset, 'Contents.json')
data = json.load(open(cs))
data['colors'][0]['color']['components'].update(red=f'{r:.15f}', green=f'{g:.15f}', blue=f'{b:.15f}')
json.dump(data, open(cs, 'w'), indent=2)
sub(os.path.join(IOS, 'BootSplash.storyboard'), r'(<namedColor name="BootSplashBackground[^"]*">\s*<color) red="[^"]*" green="[^"]*" blue="[^"]*"',
    rf'\1 red="{r:.15f}" green="{g:.15f}" blue="{b:.15f}"')

# Android launcher: legacy 48dp (square + circle) and adaptive 108dp foreground.
# Foreground places the 1024 icon artwork on the 72dp visible area, so the symbol is 0.625×72dp = 45dp (inside the 66dp safe zone).
for d, k in DENS.items():
    folder = os.path.join(RES, f'mipmap-{d}')
    os.makedirs(folder, exist_ok=True)
    px, fg, vis = round(48 * k), round(108 * k), round(72 * k)
    opaque(icon, os.path.join(folder, 'ic_launcher.png'), px)
    circle(icon, os.path.join(folder, 'ic_launcher_round.png'), px)
    o = (fg - vis) / 2
    render(foreground, os.path.join(folder, 'ic_launcher_foreground.png'), fg, fg, (o, o, vis, vis))
    print(d, px, fg)
opaque(icon, os.path.join(RES, 'playstore-icon.png'), 512)

# Android bootsplash: 288dp canvas, lockup 130dp wide, centred (react-native-bootsplash layout).
for d, k in DENS.items():
    p = os.path.join(RES, f'drawable-{d}', 'bootsplash_logo.png')
    if os.path.exists(p):
        c, w = round(288 * k), round(130 * k)
        render(lockup, p, c, c, ((c - w) / 2, 0, w, c))
        print(os.path.relpath(p, RES), c)

# Android notification small icon: 24dp, white silhouette on transparent (OS tints it), symbol in the 20dp live area.
mono = read('symbol-mono.svg').replace('currentColor', '#FFFFFF')
for d, k in DENS.items():
    if d == 'ldpi':
        continue
    folder = os.path.join(RES, f'drawable-{d}')
    os.makedirs(folder, exist_ok=True)
    c, live = round(24 * k), 20 * k
    render(mono, os.path.join(folder, 'ic_notification.png'), c, c, ((c - live) / 2, (c - live) / 2, live, live))
    print(f'drawable-{d}/ic_notification.png', c)

sub(os.path.join(RES, 'values', 'ic_launcher_background.xml'), r'(name="ic_launcher_background">)[^<]*', rf'\g<1>{N}')
colors = os.path.join(RES, 'values', 'colors.xml')
sub(colors, r'(name="bootsplash_background">)[^<]*', rf'\g<1>{N}')
sub(colors, r'(name="notification_accent">)[^<]*', rf'\g<1>{T}')
