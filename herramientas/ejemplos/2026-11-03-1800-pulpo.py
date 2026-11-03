"""Short del pulpo (3 corazones). Basado en render3.py: draw_scene y BGS nuevos.
uso (desde herramientas/): python3 ejemplos/2026-11-03-1800-pulpo.py guion.json outdir [frames t1,t2,...]"""
import cairo, json, math, os, random, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from estilo import *

FPS = 30
LINE = (0.16, 0.08, 0.14); RED = (1.0, 0.27, 0.36); ICE = (0.70, 0.93, 1.0)
OCTO = (1.0, 0.42, 0.40); BLUE = (0.25, 0.55, 1.0); COPPER = (0.95, 0.55, 0.28); SAND = (0.93, 0.78, 0.55)
# fondo por escena: (arriba, abajo, manchas de luz) — tonos submarinos
BGS = {"gancho": ((0.02, 0.08, 0.22), (0.10, 0.04, 0.26), (PINK, CYAN, VIOLET)),
       "corazones": ((0.10, 0.03, 0.20), (0.30, 0.05, 0.20), (RED, VIOLET, CYAN)),
       "sangre": ((0.02, 0.06, 0.22), (0.03, 0.18, 0.38), (BLUE, CYAN, ORANGE)),
       "nadar": ((0.01, 0.10, 0.18), (0.02, 0.24, 0.30), (MINT, CYAN, (0.3, 0.5, 1.0))),
       "remate": ((0.06, 0.04, 0.20), (0.04, 0.16, 0.30), (PINK, CYAN, YEL)),
       "cierre": ((0.07, 0.06, 0.18), (0.16, 0.05, 0.28), (VIOLET, CYAN, PINK))}

# ================= ilustraciones del short =================
def beatf(t, rate=1.3, ph=0.0):
    return max(0.0, math.sin(2 * math.pi * rate * t + ph)) ** 8

def rays(cr, t, a=0.07):
    """Rayos de luz que entran desde la superficie del mar."""
    cr.save(); cr.set_operator(cairo.OPERATOR_ADD)
    for k in range(6):
        x = 80 + k * 190 + 40 * math.sin(t * 0.5 + k * 1.3); w = 70 + 30 * math.sin(t * 0.7 + k)
        g = cairo.LinearGradient(0, 0, 0, 1500); g.add_color_stop_rgba(0, 0.6, 0.9, 1, a * (0.6 + 0.4 * math.sin(t + k))); g.add_color_stop_rgba(1, 0.6, 0.9, 1, 0)
        cr.move_to(x - w * 0.3, 0); cr.line_to(x + w * 0.3, 0); cr.line_to(x + w + 160, 1500); cr.line_to(x - w + 160, 1500); cr.close_path(); cr.set_source(g); cr.fill()
    cr.restore()

def bubbles(cr, t, x0, x1, y0, y1, n=14, seed=5, a=0.6):
    rnd = random.Random(seed)
    for _ in range(n):
        x = rnd.uniform(x0, x1); sp = rnd.uniform(60, 160); r = rnd.uniform(6, 20); ph = rnd.uniform(0, 1)
        y = y1 - ((ph * (y1 - y0) + t * sp) % (y1 - y0)); x += 14 * math.sin(t * 2 + ph * 6)
        cr.arc(x, y, r, 0, 2 * math.pi); cr.set_source_rgba(0.75, 0.95, 1, 0.12 * a); cr.fill_preserve()
        cr.set_source_rgba(0.85, 0.97, 1, 0.7 * a); cr.set_line_width(2.5); cr.stroke()
        cr.arc(x - r * 0.35, y - r * 0.35, r * 0.25, 0, 2 * math.pi); cr.set_source_rgba(1, 1, 1, 0.8 * a); cr.fill()

def tentacle_pts(k, t, swim, crawl, L=320, n=30):
    bx = -125 + k * 250 / 7; side = bx / 125
    a = math.pi / 2 + side * 0.95
    a = a * (1 - swim) + (math.pi / 2 + side * 0.22) * swim
    a = a * (1 - crawl) + (math.pi / 2 + side * 1.25) * crawl
    x, y = bx * 0.85, 40; pts = [(x, y)]; seg = L / n
    for i in range(1, n + 1):
        u = i / n
        wav = math.sin(t * (2.2 + 3 * swim) - u * 4 + k * 0.9) * (0.05 + 0.05 * swim)
        curl = (1 if side >= 0 else -1) * (0.11 * u * u) * (1 - swim) * (1 - 0.6 * crawl)
        if crawl: wav += 0.04 * math.sin(t * 5 + k * 1.7 - u * 3)
        a += wav + curl; x += math.cos(a) * seg; y += math.sin(a) * seg; pts.append((x, y))
    return pts

def tentacle_path(c, pts, r0=40):
    n = len(pts) - 1; L, R = [], []
    for i, (x, y) in enumerate(pts):
        j0, j1 = max(0, i - 1), min(n, i + 1)
        tx, ty = pts[j1][0] - pts[j0][0], pts[j1][1] - pts[j0][1]; m = math.hypot(tx, ty) or 1
        nx, ny = -ty / m, tx / m; r = r0 * (1 - i / n) ** 0.8 + 5
        L.append((x + nx * r, y + ny * r)); R.append((x - nx * r, y - ny * r))
    c.move_to(*L[0])
    for p in L[1:]: c.line_to(*p)
    c.arc(pts[-1][0], pts[-1][1], 4, 0, 0);
    for p in reversed(R): c.line_to(*p)
    c.close_path()

def mantle_path(c):
    c.move_to(-150, 60); c.curve_to(-215, -60, -170, -340, 0, -340); c.curve_to(170, -340, 215, -60, 150, 60)
    c.curve_to(80, 105, -80, 105, -150, 60); c.close_path()

def octopus(cr, x, y, s, t, mood="happy", swim=0.0, crawl=0.0, col=OCTO, rot=0.0, look=(0, 0), L=320, squash=1.0):
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.scale(s * (2 - squash), s * squash)
    for layer in (0, 1):
        ks = [k for k in range(8) if (k in (0, 2, 5, 7)) == (layer == 0)]
        cc = darken(col, 0.18) if layer == 0 else col
        tps = {k: tentacle_pts(k, t, swim, crawl, L) for k in ks}
        d = lambda c, tps=tps: [tentacle_path(c, p) for p in tps.values()]
        volume(cr, d, cc, (-260, 40, 260, 40 + L), light=0.3, shade=0.35, rim=False, sh_blur=30, sh_alpha=0.35)
        if layer == 1:
            for p in tps.values():
                for i in range(3, len(p) - 3, 3):
                    r = 11 * (1 - i / len(p)) + 3
                    cr.arc(p[i][0], p[i][1] + r * 0.4, r, 0, 2 * math.pi); cr.set_source_rgba(*lighten(col, 0.55), 0.85); cr.fill()
    volume(cr, mantle_path, col, (-215, -340, 215, 100), light=0.3, shade=0.35, sh_blur=40)
    for (sx, sy, sr) in [(-70, -240, 22), (40, -280, 16), (90, -190, 26), (-110, -140, 14), (10, -170, 12)]:
        cr.save(); cr.translate(sx, sy); cr.scale(1, 0.75); cr.arc(0, 0, sr, 0, 2 * math.pi); cr.restore(); cr.set_source_rgba(*darken(col, 0.3), 0.45); cr.fill()
    # mejillas
    radial_glow(cr, -115, 55, 50, (1, 0.55, 0.65), 0.45); radial_glow(cr, 115, 55, 50, (1, 0.55, 0.65), 0.45)
    blink = ((t + 1.6) % 3.3) < 0.12
    for ex in (-62, 62):
        ey = 5
        if mood == "happy" and blink:
            cr.set_source_rgb(*LINE); cr.set_line_width(9); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.move_to(ex - 30, ey); cr.line_to(ex + 30, ey); cr.stroke(); continue
        if mood == "joy":
            cr.set_source_rgb(*LINE); cr.set_line_width(11); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.arc(ex, ey + 14, 28, math.pi * 1.15, math.pi * 1.85); cr.stroke(); continue
        e = lambda c, ex=ex: (c.save(), c.translate(ex, ey), c.scale(1, 1.12), c.arc(0, 0, 46, 0, 2 * math.pi), c.restore())
        volume(cr, e, (1, 1, 1), (ex - 46, ey - 52, ex + 46, ey + 52), light=0, shade=0.12, sh=False, rim=False)
        pr = 15 if mood == "shock" else 26
        px, py = ex + look[0] * 14, ey + look[1] * 14
        cr.arc(px, py, pr, 0, 2 * math.pi); cr.set_source_rgb(0.08, 0.05, 0.14); cr.fill()
        cr.arc(px + pr * 0.35, py - pr * 0.4, pr * 0.32, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill()
    cr.set_source_rgb(*LINE); cr.set_line_width(9); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    if mood == "shock":
        cr.save(); cr.translate(0, 72); cr.scale(0.8, 1); cr.arc(0, 0, 18, 0, 2 * math.pi); cr.restore(); cr.set_source_rgb(0.35, 0.05, 0.12); cr.fill()
    else:
        cr.arc(0, 52, 22, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    cr.restore()

def heart_path(c, x, y, r):
    c.move_to(x, y + r * 0.95); c.curve_to(x - r * 1.7, y - r * 0.1, x - r * 0.95, y - r * 1.3, x, y - r * 0.45)
    c.curve_to(x + r * 0.95, y - r * 1.3, x + r * 1.7, y - r * 0.1, x, y + r * 0.95); c.close_path()

def heart(cr, x, y, r, col=RED, k=1.0, beat=0.0, glow_a=0.6, grey=0.0):
    if k <= 0.02: return
    col = mix(col, (0.45, 0.45, 0.52), grey)
    cr.save(); cr.translate(x, y); s = k * (1 + 0.14 * beat); cr.scale(s, s)
    d = lambda c: heart_path(c, 0, 0, r)
    if glow_a > 0: glow(cr, d, col, r * 0.6, glow_a * (0.6 + 0.4 * beat) * (1 - grey))
    volume(cr, d, col, (-r * 1.4, -r * 1.25, r * 1.4, r * 0.95), light=0.35, shade=0.3, sh_blur=r * 0.4)
    cr.save(); cr.translate(-r * 0.5, -r * 0.55); cr.rotate(-0.6); cr.scale(1, 0.55); cr.arc(0, 0, r * 0.22, 0, 2 * math.pi); cr.restore(); cr.set_source_rgba(1, 1, 1, 0.55); cr.fill()
    cr.restore()

def drop_path(c, x, y, r):
    c.move_to(x, y - r * 1.55); c.curve_to(x + r * 0.55, y - r * 0.75, x + r, y - r * 0.35, x + r, y + r * 0.15)
    c.arc(x, y + r * 0.15, r, 0, math.pi); c.curve_to(x - r, y - r * 0.35, x - r * 0.55, y - r * 0.75, x, y - r * 1.55); c.close_path()

def snowflake(cr, x, y, r, a, rot):
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.set_source_rgba(*ICE, a); cr.set_line_width(max(3, r / 8)); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(6):
        cr.save(); cr.rotate(k * math.pi / 3); cr.move_to(0, 0); cr.line_to(0, -r)
        cr.move_to(0, -r * .6); cr.line_to(-r * .25, -r * .82); cr.move_to(0, -r * .6); cr.line_to(r * .25, -r * .82); cr.stroke(); cr.restore()
    cr.restore()

def gill(cr, x, y, s, a, flip=1):
    cr.save(); cr.translate(x, y); cr.scale(s * flip, s)
    d = lambda c: (c.save(), c.rotate(-0.5), c.scale(0.45, 1), c.arc(0, 0, 80, 0, 2 * math.pi), c.restore())
    volume(cr, d, (0.55, 0.85, 1.0), (-60, -80, 60, 80), light=0.3, shade=0.3, sh=False)
    cr.set_source_rgba(0.2, 0.45, 0.8, 0.6); cr.set_line_width(5); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for i in range(-3, 4):
        cr.move_to(-30 + i * 2, i * 20); cr.line_to(30 + i * 2, i * 20 - 18); cr.stroke()
    cr.restore()

def tile(cr, cx, cy, sym, name, c1, c2, k, cross=0.0, check=0.0, alpha=1.0):
    if k <= 0.02 or alpha <= 0.02: return
    cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    d = lambda c: rr(c, -130, -130, 260, 260, 46)
    shadow(cr, d, 40, 0.5 * alpha, dy=20)
    g = cairo.LinearGradient(-130, -130, 130, 130); g.add_color_stop_rgba(0, *c1, alpha); g.add_color_stop_rgba(1, *c2, alpha)
    d(cr); cr.set_source(g); cr.fill()
    cr.save(); d(cr); cr.clip(); hg = cairo.LinearGradient(0, -130, 0, 0); hg.add_color_stop_rgba(0, 1, 1, 1, 0.3 * alpha); hg.add_color_stop_rgba(1, 1, 1, 1, 0); cr.set_source(hg); cr.paint(); cr.restore()
    d(cr); cr.set_source_rgba(1, 1, 1, 0.4 * alpha); cr.set_line_width(3); cr.stroke()
    text(cr, sym, 0, 40, 140, WHITE, alpha=alpha)
    text(cr, name, 0, 105, 38, (1, 1, 1), font=DISPLAY_XB, alpha=0.9 * alpha, sh=False)
    if cross > 0:
        cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_width(26)
        p = eout(cross); cr.set_source_rgba(0.1, 0.02, 0.05, 0.5); cr.move_to(-110, -110); cr.line_to(-110 + 220 * p, -110 + 220 * p); cr.stroke()
        cr.set_source_rgb(1, 0.2, 0.3); cr.set_line_width(20); cr.move_to(-110, -110); cr.line_to(-110 + 220 * p, -110 + 220 * p); cr.stroke()
        if cross > 0.5:
            q = eout((cross - 0.5) * 2); cr.move_to(110, -110); cr.line_to(110 - 220 * q, -110 + 220 * q); cr.stroke()
    if check > 0:
        kk = pop(check); cr.save(); cr.translate(110, -110); cr.scale(kk, kk)
        icon_badge(cr, 0, 0, 52, MINT, (0.1, 0.7, 0.5), lambda c, r: (c.set_source_rgb(1, 1, 1), c.set_line_width(12), c.set_line_cap(cairo.LINE_CAP_ROUND), c.set_line_join(cairo.LINE_JOIN_ROUND), c.move_to(-22, 2), c.line_to(-6, 18), c.line_to(24, -16), c.stroke()))
        cr.restore()
    cr.restore()

def o2(cr, x, y, s, a=1.0, col=CYAN):
    cr.save(); cr.translate(x, y); cr.scale(s, s)
    for dx in (-26, 26):
        d = lambda c, dx=dx: c.arc(dx, 0, 34, 0, 2 * math.pi)
        volume(cr, d, mix(col, WHITE, 0.2), (dx - 34, -34, dx + 34, 34), sh=False, light=0.4)
    text(cr, "O2", 0, 14, 36, (0.05, 0.1, 0.25), sh=False, alpha=a)
    cr.restore()

def ecg_card(cr, lt, t_stop, t_resume, y=390):
    glass(cr, 90, y, 900, 230, 40, a=0.10)
    stopped = t_stop <= lt < t_resume
    col = RED if stopped else MINT
    x0, x1 = 230, 950; per = 0.75; sp = 420
    def val(tt):
        if t_stop <= tt < t_resume: return 0.0
        ph = (tt % per) / per
        if 0.10 < ph < 0.16: return -0.25
        if 0.16 < ph < 0.22: return 1.0 - abs(ph - 0.19) / 0.03 * 0.9
        if 0.22 < ph < 0.27: return -0.35
        if 0.40 < ph < 0.55: return 0.22 * math.sin((ph - 0.40) / 0.15 * math.pi)
        return 0.0
    cy = y + 138
    cr.save(); rr(cr, x0 - 10, y + 10, x1 - x0 + 20, 210, 30); cr.clip()
    cr.set_source_rgba(1, 1, 1, 0.06); cr.set_line_width(2)
    for gx in range(x0, x1, 45): cr.move_to(gx, y + 15); cr.line_to(gx, y + 215); cr.stroke()
    d = lambda c: ([c.move_to(x0, cy - val(lt - (x1 - x0) / sp) * 85)] + [c.line_to(x, cy - val(lt - (x1 - x) / sp) * 85) for x in range(x0, x1 + 1, 4)])
    cr.save(); cr.set_operator(cairo.OPERATOR_ADD); d(cr); cr.set_line_width(22); cr.set_source_rgba(*col, 0.25); cr.stroke(); cr.restore()
    d(cr); cr.set_line_width(8); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.set_source_rgb(*lighten(col, 0.3)); cr.stroke()
    radial_glow(cr, x1, cy - val(lt) * 85, 40, col, 0.9)
    cr.restore()
    heart(cr, 160, y + 120, 44, RED, 1, 0 if stopped else beatf(lt, 1 / per, -0.6), 0.5, grey=1.0 if stopped else 0)
    text(cr, "CORAZÓN PRINCIPAL", 590, y + 46, 28, (0.85, 0.95, 1), font=DISPLAY_XB, sh=False)

def seafloor(cr, t, y=1250):
    for (sx, h, ph) in [(110, 220, 0), (160, 160, 1.2), (950, 240, 2.1), (1000, 170, 0.6)]:
        cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_width(22)
        cr.move_to(sx, y + 20)
        for i in range(1, 9): cr.line_to(sx + 22 * math.sin(t * 1.6 + ph + i * 0.7) * i / 8, y + 20 - h * i / 8)
        cr.set_source_rgb(0.18, 0.62, 0.45); cr.stroke()
    d = lambda c: (c.move_to(-50, y + 40), c.curve_to(250, y - 20, 700, y + 50, 1130, y), c.line_to(1130, 1700), c.line_to(-50, 1700), c.close_path())
    volume(cr, d, SAND, (0, y - 20, W, y + 260), light=0.2, shade=0.5, rim=False, sh=False)
    for (rx, ry, r, cc) in [(240, y + 40, 60, (0.45, 0.42, 0.55)), (330, y + 60, 38, (0.55, 0.5, 0.62)), (820, y + 50, 70, (0.42, 0.40, 0.52))]:
        d = lambda c, rx=rx, ry=ry, r=r: (c.save(), c.translate(rx, ry), c.scale(1, 0.7), c.arc(0, 0, r, 0, 2 * math.pi), c.restore())
        volume(cr, d, cc, (rx - r, ry - r * 0.7, rx + r, ry + r * 0.7), sh_blur=16)

def fit(cr, s, size, maxw=960, font=DISPLAY):
    while text_extents(cr, s, size, font).x_advance > maxw and size > 40: size -= 4
    return size

def big_title(cr, s, y, lt, t0, grad=(WHITE, (0.80, 0.88, 1.0)), size=104, glow_c=None):
    if lt < t0: return
    size = fit(cr, s, size); k = pop((lt - t0) / 0.3)
    cr.save(); cr.translate(W / 2, y); cr.scale(k, k); text(cr, s, 0, 0, size, grad=grad, glow_c=glow_c); cr.restore()

# ================= escenas del short =================
class S:
    def __init__(s, sc, tm): s.sc, s.tm, s.dur = sc, tm, tm["dur"]
    def w(s, sub, nth=0):
        hits = [x["t"] for x in s.tm["words"] if sub.lower() in x["w"].lower()]
        return hits[min(nth, len(hits) - 1)] if hits else 0
    def f(s, k):
        hits = [x["t"] for x in s.tm["words"] if x["frase"] == k]; return hits[0] if hits else 0

def callout(cr, s, cx, cy, size, c1, c2, lt, t0, rot=-0.04, dark=False):
    """Etiqueta con píldora en degradado que aparece con rebote."""
    if lt < t0: return
    k = pop((lt - t0) / 0.35); e = text_extents(cr, s, size)
    cr.save(); cr.translate(cx, cy); cr.rotate(rot); cr.scale(k, k)
    pill(cr, 0, -size * 0.32, e.x_advance + size * 1.1, size * 1.55, c1, c2)
    text(cr, s, 0, 0, size, (0.08, 0.04, 0.12) if dark else WHITE, sh=not dark)
    cr.restore()


def draw_scene(cr, kind, lt, z, ev):
    if kind != "cierre": rays(cr, lt + z.dur)
    if kind == "gancho":
        bubbles(cr, lt, 40, W - 40, 300, 1400, 16, 3, 0.7)
        t1, t2 = z.f(1), z.f(2)
        th = [0.15 + k * 0.18 for k in range(3)]
        bob = 18 * math.sin(lt * 2.4)
        radial_glow(cr, W / 2, 900, 560, PINK, 0.30)
        mood = "happy" if lt < t2 else "shock"
        octopus(cr, W / 2, 1010 + bob, 1.1, lt, mood, look=(0, -1) if lt < t1 else (0.6, -0.4))
        for k, (hx, hy) in enumerate([(250, 640), (540, 560), (830, 640)]):
            if lt < th[k]: continue
            ev("pop", th[k]); kk = pop((lt - th[k]) / 0.3)
            heart(cr, hx, hy + 10 * math.sin(lt * 3 + k), 62 if k != 1 else 78, RED if k == 1 else (0.95, 0.35, 0.75), kk, beatf(lt, 1.4, k * 0.6))
            ring_burst(cr, hx, hy, (lt - th[k]) / 0.5, YEL, 160, 8)
        ev("heartbeat", 0.4, g=0.8)
        if lt < t1:
            big_title(cr, "¡3 CORAZONES!", 430, lt, 0.0, grad=(lighten(YEL, 0.5), ORANGE), size=120, glow_c=ORANGE)
        elif lt < t2:
            ev("whoosh", t1, g=0.7); big_title(cr, "Y NO ES LO MÁS RARO", 430, lt, t1, size=88)
        else:
            ev("impact", t2, g=0.6); callout(cr, "EL DATO 3 ES EL MÁS LOCO", W / 2, 440, 58, YEL, ORANGE, lt, t2, dark=True)
            for k in range(4): sparkle(cr, 150 + k * 260, 330 + 30 * math.sin(lt * 3 + k), 20, [CYAN, PINK, YEL, MINT][k], 0.8, lt)
    elif kind == "corazones":
        bubbles(cr, lt, 40, W - 40, 300, 1400, 10, 7, 0.5)
        t1, tb, tt = z.f(1), z.w("branquias"), z.w("tercero")
        xr = ease((lt - t1 + 0.2) / 0.5)
        octopus(cr, W / 2, 1000, 1.2, lt, "happy", look=(0, -0.6) if lt > t1 else (0, 0))
        if lt < t1:
            callout(cr, "EL PULPO", W / 2, 460, 72, PINK, VIOLET, lt, 0.1); ev("pop", 0.1)
            for k in range(3): sparkle(cr, 260 + k * 280, 560 + 20 * math.sin(lt * 4 + k), 22, [YEL, CYAN, PINK][k], 0.9, lt * 2)
        if xr > 0:
            ev("whoosh", t1 - 0.2, g=0.6)
            # ventana de rayos X dentro del manto
            win = lambda c: (c.save(), c.translate(540, 770), c.scale(1, 0.82), c.arc(0, 0, 215, 0, 2 * math.pi), c.restore())
            cr.save(); win(cr); g = cairo.RadialGradient(540, 760, 40, 540, 770, 230); g.add_color_stop_rgba(0, 0.05, 0.03, 0.15, 0.85 * xr); g.add_color_stop_rgba(1, 0.10, 0.04, 0.22, 0.75 * xr)
            cr.set_source(g); cr.fill(); cr.restore()
            win(cr); cr.set_source_rgba(*CYAN, 0.7 * xr); cr.set_line_width(5); cr.set_dash([18, 12], lt * 40); cr.stroke(); cr.set_dash([])
            act_b = lt > tb - 0.3; act_s = lt > tt
            gill(cr, 375, 760, 0.85 * xr, 1, 1); gill(cr, 705, 760, 0.85 * xr, 1, -1)
            for side, (hx, hy) in ((-1, (440, 830)), (1, (640, 830))):
                heart(cr, hx, hy, 42, (0.55, 0.45, 1.0), xr, beatf(lt, 1.5, side) if act_b else 0, 0.7 if act_b else 0.2)
                if act_b:
                    for q in range(4):
                        ph = (lt * 1.2 + q / 4) % 1; gx = 375 if side < 0 else 705
                        px = hx + (gx - hx) * ph; py = hy + (760 - hy) * ph - 40 * math.sin(ph * math.pi)
                        radial_glow(cr, px, py, 26, CYAN, 0.9 * (1 - ph)); cr.arc(px, py, 8, 0, 2 * math.pi); cr.set_source_rgba(*lighten(CYAN, 0.6), 1 - ph); cr.fill()
            heart(cr, 540, 700, 62, RED, xr, beatf(lt, 1.2) if act_s else 0, 0.8 if act_s else 0.25)
            if act_s:
                ev("heartbeat", tt); ev("ding", tt, g=0.5)
                ends = [(250, 1280), (420, 1330), (660, 1330), (830, 1280)]
                for j, (ex, ey) in enumerate(ends):
                    for q in range(3):
                        ph = ((lt - tt) * 0.9 + q / 3 + j * 0.1) % 1; ap = ease((lt - tt) / 0.4)
                        px = 540 + (ex - 540) * ph; py = 750 + (ey - 750) * ph
                        radial_glow(cr, px, py, 34, RED, 0.9 * ap * (1 - ph * 0.6)); cr.arc(px, py, 9, 0, 2 * math.pi); cr.set_source_rgba(1, 0.75, 0.75, ap * (1 - ph * 0.5)); cr.fill()
        if lt > tb - 0.3 and lt < tt:
            ev("pop", tb - 0.3); callout(cr, "2 PARA LAS BRANQUIAS", W / 2, 455, 56, (0.45, 0.55, 1.0), VIOLET, lt, tb - 0.3)
        if lt > tt:
            callout(cr, "1 PARA TODO EL CUERPO", W / 2, 455, 56, RED, PINK, lt, tt, rot=0.03)
    elif kind == "sangre":
        bubbles(cr, lt, 40, W - 40, 300, 1400, 12, 9, 0.5)
        th, tc, tu, t2 = z.w("hierro"), z.w("cobre"), z.w("usa"), z.f(2)
        k = pop(lt / 0.4); pul = 1 + 0.04 * math.sin(lt * 5)
        dy = -90 * ease((lt - th) / 0.5) if lt > th else 0
        cr.save(); cr.translate(W / 2, 780 + dy); cr.scale(k * pul, k * pul)
        radial_glow(cr, 0, 0, 380, BLUE, 0.55)
        d = lambda c: drop_path(c, 0, 20, 190)
        glow(cr, d, BLUE, 60, 0.5)
        volume(cr, d, BLUE, (-190, -275, 190, 210), light=0.45, shade=0.45, sh_blur=40)
        cr.save(); cr.translate(-80, -40); cr.rotate(-0.4); cr.scale(0.45, 1); cr.arc(0, 0, 50, 0, 2 * math.pi); cr.restore(); cr.set_source_rgba(1, 1, 1, 0.5); cr.fill()
        cr.restore()
        ev("pop", 0.0, g=0.8)
        if lt < th:
            callout(cr, "¡SANGRE AZUL!", W / 2, 1180, 80, CYAN, BLUE, lt, 0.4, dark=True); ev("ding", 0.4, g=0.6)
        fade = 1 - ease((lt - t2) / 0.4) if lt > t2 else 1
        if lt > th and fade > 0:
            ev("pop", th); ev("crack", tu)
            tile(cr, 320, 1080, "Fe", "HIERRO", (0.95, 0.30, 0.35), (0.6, 0.08, 0.2), pop((lt - th) / 0.35), cross=cl((lt - tu) / 0.4) if lt > tu else 0, alpha=fade)
            if lt > tc:
                ev("ding", tc); ev("pop", tc)
                radial_glow(cr, 760, 1080, 260, COPPER, 0.5 * fade)
                tile(cr, 760, 1080, "Cu", "COBRE", (1.0, 0.68, 0.35), (0.78, 0.38, 0.15), pop((lt - tc) / 0.35), check=cl((lt - tc - 0.4) / 0.35), alpha=fade)
                for q in range(3):
                    ph = ((lt - tc) * 0.6 + q / 3) % 1; ox = 760 + (540 - 760) * ph; oy = 930 + (690 - 930) * ph - 60 * math.sin(ph * math.pi)
                    o2(cr, ox, oy, 0.8 * (1 - 0.4 * ph) * fade)
        if lt > t2:
            ev("whoosh", t2, g=0.6)
            for i in range(10):
                rnd = random.Random(i); x = rnd.uniform(60, W - 60); y = 420 + ((rnd.uniform(0, 1) * 900 + lt * rnd.uniform(60, 140)) % 900)
                snowflake(cr, x, y, rnd.uniform(16, 32), 0.6 * ease((lt - t2) / 0.5), lt * rnd.choice([-1, 1]))
            ka = pop((lt - t2) / 0.35); kb = pop((lt - t2 - 0.6) / 0.35)
            for (cx, kk, c1, c2, lab, icon) in [(300, ka, CYAN, (0.2, 0.5, 1.0), "AGUA FRÍA", "snow"), (780, kb, MINT, (0.1, 0.6, 0.6), "POCO OXÍGENO", "o2")]:
                if lt < t2 + (0 if icon == "snow" else 0.6): continue
                cr.save(); cr.translate(cx, 1090); cr.scale(kk, kk)
                if icon == "snow": icon_badge(cr, 0, 0, 105, c1, c2, lambda c, r: snowflake(c, 0, 0, 62, 1, lt * 0.5))
                else: icon_badge(cr, 0, 0, 105, c1, c2, lambda c, r: (o2(c, 0, -8, 0.9), c.set_source_rgba(1, 1, 1, 0.9), c.set_line_width(9), c.set_line_cap(cairo.LINE_CAP_ROUND), c.move_to(-30, 52), c.line_to(-30 + 25 * (0.5 + 0.5 * math.sin(lt * 4)), 52), c.stroke()))
                text(cr, lab, 0, 175, 44, WHITE, font=DISPLAY_XB); cr.restore()
            ev("pop", t2 + 0.1); ev("pop", t2 + 0.7)
    elif kind == "nadar":
        bubbles(cr, lt, 40, W - 40, 650, 1400, 10, 11, 0.5)
        tn, td, tg = 0.0, z.w("detiene"), z.f(2)
        ecg_card(cr, lt, td, tg + 0.5)
        if lt < tg:
            p = (lt / max(0.1, tg)); ox, oy = 300 + 480 * p, 1180 - 330 * p + 20 * math.sin(lt * 6)
            stopped = lt > td
            for q in range(10):  # chorro de propulsión
                ph = ((lt * 2 + q / 10) % 1); bx = ox - 180 * ph - 40; by = oy + 260 * ph + 30
                cr.arc(bx + 20 * math.sin(q * 3 + lt * 8), by, 10 + 18 * ph, 0, 2 * math.pi); cr.set_source_rgba(0.85, 0.97, 1, 0.5 * (1 - ph)); cr.set_line_width(3); cr.stroke()
            octopus(cr, ox, oy, 0.82, lt, "shock" if stopped else "happy", swim=1, rot=0.45, squash=1 + 0.06 * math.sin(lt * 10), look=(0.7, -0.6))
            ev("whoosh", 0.1); ev("whoosh", 0.9, g=0.6)
            if stopped:
                ev("impact", td); ev("zap", td + 0.05, g=0.6)
                a = 0.5 + 0.5 * math.sin((lt - td) * 14)
                cr.set_source_rgba(1, 0.2, 0.3, 0.18 * a * math.exp(-(lt - td) * 0.8)); cr.paint()
                ring_burst(cr, 160, 510, (lt - td) / 0.6, RED, 220, 10)
                callout(cr, "¡SE DETIENE!", W / 2, 720, 74, RED, (0.75, 0.05, 0.25), lt, td + 0.05, rot=0.04)
        else:
            seafloor(cr, lt)
            p = (lt - tg); ox = 330 + 70 * p
            octopus(cr, ox, 1080 + 6 * math.sin(lt * 6), 0.78, lt, "happy", crawl=1, L=240, look=(1, 0.2))
            ev("whoosh", tg, g=0.6); ev("ding", tg + 0.5)
            callout(cr, "MEJOR GATEAR", W / 2 + 120, 730, 70, MINT, (0.1, 0.7, 0.55), lt, tg + 0.1, dark=True)
            ev("pop", tg + 0.1)
    elif kind == "remate":
        bubbles(cr, lt, 40, W - 40, 300, 1400, 14, 13, 0.6)
        tA, tB, tC, t3 = z.w("Tres"), z.w("azul"), z.f(1), z.f(2)
        items = [(220, tA, PINK, (0.8, 0.1, 0.4), "3 CORAZONES", "hearts"), (540, tB, (0.3, 0.6, 1.0), (0.1, 0.25, 0.8), "SANGRE AZUL", "drop"),
                 (860, tC, MINT, (0.1, 0.6, 0.5), "PAUSA AL NADAR", "pause")]
        for (cx, t0, c1, c2, lab, ic) in items:
            if lt < t0: continue
            ev("pop", t0); kk = pop((lt - t0) / 0.35); yy = 560 + 12 * math.sin(lt * 3 + cx)
            cr.save(); cr.translate(cx, yy); cr.scale(kk, kk)
            if ic == "hearts":
                fi = lambda c, r: [heart(c, dx, dy, 26, WHITE, 1, beatf(lt, 1.4, j), 0) for j, (dx, dy) in enumerate([(-34, 18), (34, 18), (0, -26)])]
            elif ic == "drop":
                fi = lambda c, r: (drop_path(c, 0, 10, 42), c.set_source_rgb(1, 1, 1), c.fill())
            else:
                fi = lambda c, r: (heart(c, -10, 0, 34, WHITE, 1, 0, 0), c.set_source_rgb(*c2), rr(c, 16, -26, 14, 52, 6), c.fill(), rr(c, 40, -26, 14, 52, 6), c.fill())
            icon_badge(cr, 0, 0, 110, c1, c2, fi)
            text(cr, lab, 0, 185, 38, WHITE, font=DISPLAY_XB); cr.restore()
        if lt < t3:
            octopus(cr, W / 2, 1080 + 14 * math.sin(lt * 2.5), 0.8, lt, "happy", L=260, look=(0, -1))
        else:
            k = eout((lt - t3) / 0.5); ev("whoosh", t3); ev("ding", t3 + 0.3, g=0.5)
            radial_glow(cr, W / 2, 950, 520 * k, PINK, 0.35)
            octopus(cr, W / 2, 1080 + 20 * k, 0.8 + 0.12 * k, lt, "joy", L=260)
            for q in range(6): sparkle(cr, W / 2 + 330 * math.cos(lt + q * 1.05), 900 + 260 * math.sin(lt + q * 1.05), 22, [CYAN, PINK, YEL][q % 3], k, lt * 3)
            big_title(cr, "ESTE ANIMAL...", 380, lt, t3, grad=(lighten(YEL, 0.5), ORANGE), size=96)
    elif kind == "cierre":
        k = pop(lt / 0.5)
        cr.save(); cr.translate(W / 2, 690); cr.scale(k, k); cr.rotate(math.sin(lt * 2) * 0.04)
        radial_glow(cr, 0, 0, 460, CYAN, 0.35)
        ringp = lambda c, half: (c.save(), c.rotate(-0.3), c.scale(1, 0.32), c.arc(0, 0, 330, math.pi if half else 0, 2 * math.pi if half else math.pi), c.restore())
        cr.set_line_cap(cairo.LINE_CAP_ROUND)
        ringp(cr, True); cr.set_source_rgb(*PINK); cr.set_line_width(18); cr.stroke()
        pl = lambda c: c.arc(0, 0, 220, 0, 2 * math.pi)
        volume(cr, pl, (0.22, 0.26, 0.62), (-220, -220, 220, 220), light=0.35, shade=0.4, sh_blur=50)
        cr.save(); pl(cr); cr.clip()
        for b in range(4): cr.set_source_rgba(1, 1, 1, 0.06); cr.rectangle(-240, -150 + b * 90, 480, 34); cr.fill()
        cr.restore()
        pl(cr); cr.set_source_rgba(*CYAN, 0.9); cr.set_line_width(8); cr.stroke()
        text(cr, "?", 0, 75, 240, grad=(WHITE, (0.75, 0.85, 1.0)))
        ringp(cr, False); cr.set_source_rgb(*PINK); cr.set_line_width(18); cr.stroke()
        ang = lt * 3; px, py = 330 * math.cos(ang), 105 * math.sin(ang); c_, s_ = math.cos(-0.3), math.sin(-0.3)
        mx, my = px * c_ - py * s_, px * s_ + py * c_
        moon = lambda c: c.arc(mx, my, 34, 0, 2 * math.pi)
        volume(cr, moon, YEL, (mx - 34, my - 34, mx + 34, my + 34), sh_blur=14)
        cr.restore()
        text(cr, "DATO CÓSMICO 2", W / 2, 1020, 80, grad=(WHITE, (0.8, 0.85, 1.0)), alpha=ease((lt - 0.2) / 0.3))
        # invitación a comentar (burbuja + etiqueta)
        tcm = z.w("comentarios") if z.w("comentarios") else 0.4
        bub = lambda c, r: (c.set_source_rgb(1, 1, 1), rr(c, -r * 0.5, -r * 0.42, r, r * 0.66, r * 0.2), c.fill(), c.move_to(-r * 0.2, r * 0.2), c.line_to(-r * 0.32, r * 0.48), c.line_to(r * 0.02, r * 0.22), c.close_path(), c.fill())
        if lt > 0.3:
            kb = pop((lt - 0.3) / 0.4); cr.save(); cr.translate(W / 2, 330); cr.scale(kb, kb)
            text(cr, "¿QUÉ DATO QUIERES VER?", 0, 0, 60, grad=(lighten(YEL, 0.5), ORANGE)); cr.restore()
        if lt > tcm:
            ev("pop", tcm); kc = pop((lt - tcm) / 0.35)
            cr.save(); cr.translate(W / 2 - 330, 1125); cr.scale(kc, kc); icon_badge(cr, 0, 0, 62, (0.2, 0.7, 1.0), VIOLET, bub); cr.restore()
            callout(cr, "DÉJALO EN COMENTARIOS", W / 2 + 60, 1145, 46, (0.2, 0.7, 1.0), VIOLET, lt, tcm)
        tb = 0.7 if z.dur < 4 else z.w("síguenos") or 0.7
        if lt > tb:
            ev("pop", tb); kk = pop((lt - tb) / 0.35); pressed = tb + 0.9 < lt < tb + 1.1; subbed = lt > tb + 1.0
            cr.save(); cr.translate(W / 2, 1255); s2 = kk * (0.92 if pressed else 1 + 0.035 * math.sin(lt * 8)); cr.scale(s2, s2)
            if subbed: pill(cr, 0, 0, 520, 120, (0.45, 0.45, 0.55), (0.32, 0.32, 0.42))
            else: pill(cr, 0, 0, 520, 120, (1.0, 0.22, 0.28), (0.85, 0.05, 0.18))
            text(cr, "SUSCRITO" if subbed else "SUSCRÍBETE", 0, 20, 54, WHITE); cr.restore()
            if pressed: ring_burst(cr, W / 2 + 120, 1275, (lt - tb - 0.9) / 0.4, WHITE, 140, 8)
            hx = W / 2 + 120 + 300 * (1 - ease((lt - tb - 0.3) / 0.6)); hy = 1275 + 300 * (1 - ease((lt - tb - 0.3) / 0.6))
            cur = lambda c: (c.save(), c.translate(hx, hy), c.scale(1.7, 1.7), c.move_to(0, 0), c.line_to(0, 70), c.line_to(18, 55), c.line_to(32, 85), c.line_to(44, 79), c.line_to(30, 50), c.line_to(52, 50), c.close_path(), c.restore())
            shadow(cr, cur, 14, 0.5, dy=8); cur(cr); cr.set_source_rgb(1, 1, 1); cr.fill_preserve(); cr.set_source_rgb(*LINE); cr.set_line_width(4); cr.stroke()
            ev("click", tb + 0.95, g=1.2); ev("ding", tb + 1.05, g=0.6)

# ================= capas comunes =================
ACCENTS = [PINK, VIOLET, (0.2, 0.7, 1.0), ORANGE]
def captions(cr, z, lt, hl):
    words = z.tm["words"]
    cur = max([i for i, x in enumerate(words) if x["t"] <= lt] or [0])
    fr = words[cur]["frase"]; same = [i for i, x in enumerate(words) if x["frase"] == fr]
    pos = same.index(cur); c0 = same[(pos // 3) * 3]; chunk = [i for i in same if c0 <= i < c0 + 3]
    up = [words[i]["w"].upper() for i in chunk]; size = 86
    while True:
        ws = [text_extents(cr, u, size).x_advance for u in up]
        if max(ws) <= 860 or size < 50: break
        size -= 6
    sp = 30; rows, row, cw = [], [], 0
    for j, wv in enumerate(ws):
        if row and cw + sp + wv > 900: rows.append(row); row, cw = [], 0
        cw = cw + (sp if row else 0) + wv; row.append(j)
    rows.append(row); y0 = 1450 - (len(rows) - 1) * 54
    for r, row in enumerate(rows):
        tw = sum(ws[j] for j in row) + sp * (len(row) - 1); x = W / 2 - tw / 2
        for j in row:
            i = chunk[j]; active = i == cur; key = any(h in words[i]["w"].lower() for h in hl)
            cx, cy = x + ws[j] / 2, y0 + r * 108
            if active:
                k = 0.85 + 0.15 * pop((lt - words[i]["t"]) / 0.14)
                cr.save(); cr.translate(cx, cy - size * 0.33); cr.rotate(-0.025); cr.scale(k, k)
                acc = ACCENTS[i % len(ACCENTS)] if not key else YEL
                pill(cr, 0, 0, ws[j] + 38, size * 1.28, acc, darken(acc, 0.2))
                cr.restore()
                cr.save(); cr.translate(cx, cy); cr.rotate(-0.025); cr.scale(k, k)
                text(cr, up[j], 0, 0, size, (0.08, 0.04, 0.12) if key else WHITE, sh=False); cr.restore()
            else:
                text(cr, up[j], cx, cy, size, YEL if (key and i < cur) else WHITE, sh_alpha=0.75)
            x += ws[j] + sp

def title_tag(cr, s, lt):
    if not s: return
    k = pop(lt / 0.35); e = text_extents(cr, s, 44, DISPLAY_XB)
    cr.save(); cr.translate(W / 2, 290); cr.scale(k, k)
    glass(cr, -e.x_advance / 2 - 40, -58, e.x_advance + 80, 84, 42, a=0.12)
    text(cr, s, 0, 0, 44, YEL, font=DISPLAY_XB, sh=False); cr.restore()

def frame(cr, i, z, lt, gt, total, hl, ev):
    kind = z.sc["tipo"]; top, bot, blobs = BGS[kind]
    background(cr, gt, top, bot, blobs)
    punch = 1 + 0.2 * (1 - eout(lt / 0.32)) if i > 0 else 1 + 0.1 * (1 - eout(lt / 0.4))
    zoom = punch * (1 + 0.035 * lt / max(1, z.dur))
    shk = sum(math.exp(-(lt - e) * 7) * 20 for e in z.shakes if 0 <= lt - e < 0.8)
    cr.save(); cr.translate(W / 2 + math.sin(gt * 71) * shk, 960 + math.cos(gt * 53) * shk); cr.scale(zoom, zoom); cr.translate(-W / 2, -960)
    draw_scene(cr, kind, lt, z, ev); cr.restore()
    if i > 0 and lt < 0.12: cr.set_source_rgba(1, 1, 1, 0.45 * (1 - lt / 0.12)); cr.paint()
    title_tag(cr, z.sc.get("titulo", ""), lt)
    text(cr, "DATO CÓSMICO 2", W / 2, 150, 34, CYAN, font=DISPLAY_XB, sh=False)
    captions(cr, z, lt, hl)
    finish(cr, gt)
    cr.set_source_rgba(1, 1, 1, 0.12); cr.rectangle(0, 0, W, 10); cr.fill()
    g = cairo.LinearGradient(0, 0, W, 0); g.add_color_stop_rgb(0, *CYAN); g.add_color_stop_rgb(1, *PINK)
    cr.set_source(g); cr.rectangle(0, 0, W * gt / total, 10); cr.fill()

def main():
    js, out = sys.argv[1], sys.argv[2]; mode = sys.argv[3] if len(sys.argv) > 3 else ""
    d = json.load(open(js)); T = json.load(open(f"{out}/timings.json")); hl = d.get("resaltar", [])
    scenes = [S(sc, tm) for sc, tm in zip(d["escenas"], T)]
    offs = [sum(t["dur"] for t in T[:i]) for i in range(len(T))]; total = sum(t["dur"] for t in T)
    SH = {"impact", "heartbeat", "crack"}; events = {}
    # pasada rápida para recoger efectos de sonido (sin dibujar: contexto diminuto)
    import estilo
    for i, z in enumerate(scenes):
        coll = {}
        def ev(name, t, g=1.0, coll=coll): coll.setdefault((name, round(t, 3)), g)
        z.shakes = []
        for f in range(0, int(z.dur * FPS), 3):
            surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, 4, 4); c = cairo.Context(surf); c.scale(0.001, 0.001)
            try: draw_scene(c, z.sc["tipo"], f / FPS, z, ev)
            except cairo.Error: pass
        z.shakes = [t for (n, t) in coll if n in SH]
        for (n, t), g in coll.items(): events[(n, round(offs[i] + t, 3))] = g
        if i > 0: events[("whoosh", round(offs[i] - 0.18, 3))] = 0.7
    json.dump([{"s": n, "t": t, "g": g} for (n, t), g in sorted(events.items(), key=lambda x: x[0][1])], open(f"{out}/events.json", "w"), indent=0)
    noop = lambda *a, **k: None
    if mode == "frames":
        for gt in [float(x) for x in sys.argv[4].split(",")]:
            i = max(j for j in range(len(offs)) if offs[j] <= gt); lt = gt - offs[i]
            surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); cr = cairo.Context(surf)
            frame(cr, i, scenes[i], lt, gt, total, hl, noop); surf.write_to_png(f"{out}/fr_{gt:05.1f}.png")
        return
    only = [int(x) for x in sys.argv[4].split(",")] if mode == "scenes" else range(len(scenes))
    for i in only:
        z = scenes[i]; n = int(round(z.dur * FPS)); tmp = f"{out}/s{i}.tmp.mp4"
        p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
        surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
        for f in range(n):
            cr = cairo.Context(surf); lt = f / FPS; frame(cr, i, z, lt, offs[i] + lt, total, hl, noop); surf.flush(); p.stdin.write(surf.get_data())
        p.stdin.close()
        if p.wait() != 0: sys.exit(f"scene {i} failed")
        os.replace(tmp, f"{out}/s{i}.mp4")
    if mode == "scenes": return
    open(f"{out}/list.txt", "w").write("".join(f"file 's{i}.mp4'\n" for i in range(len(scenes))))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{out}/list.txt", "-c", "copy", f"{out}/video.mp4"], check=True)
    print("video ok", round(total, 2))

if __name__ == "__main__":
    main()
