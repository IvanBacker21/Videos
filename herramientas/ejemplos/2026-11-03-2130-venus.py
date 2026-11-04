"""Short de Venus (un día dura más que un año). Basado en render3.py: draw_scene y BGS nuevos.
uso (desde herramientas/): python3 ejemplos/2026-11-03-2130-venus.py guion.json outdir [frames t1,t2,...]"""
import cairo, json, math, os, random, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from estilo import *

FPS = 30
LINE = (0.16, 0.08, 0.14); RED = (1.0, 0.27, 0.36)
VEN = (0.98, 0.72, 0.36); BLUE = (0.25, 0.55, 1.0); GREEN = (0.30, 0.85, 0.50)
BGS = {"gancho": ((0.10, 0.04, 0.18), (0.32, 0.10, 0.10), (ORANGE, VIOLET, PINK)),
       "anio": ((0.04, 0.05, 0.18), (0.20, 0.08, 0.26), (YEL, VIOLET, CYAN)),
       "dia": ((0.06, 0.04, 0.20), (0.26, 0.10, 0.20), (ORANGE, CYAN, VIOLET)),
       "reves": ((0.03, 0.08, 0.20), (0.24, 0.10, 0.06), (CYAN, ORANGE, PINK)),
       "remate": ((0.08, 0.04, 0.16), (0.10, 0.12, 0.30), (PINK, YEL, CYAN)),
       "cierre": ((0.07, 0.06, 0.18), (0.16, 0.05, 0.28), (VIOLET, CYAN, PINK))}

# ================= ilustraciones =================
def venus(cr, x, y, r, spin, t, marker=None, glow_a=0.45):
    """Venus con bandas de nubes que se desplazan según `spin` (radianes de giro)."""
    radial_glow(cr, x, y, r * 1.7, ORANGE, glow_a)
    d = lambda c: c.arc(x, y, r, 0, 2 * math.pi)
    volume(cr, d, VEN, (x - r, y - r, x + r, y + r), light=0.35, shade=0.45, sh_blur=max(10, r * 0.25))
    cr.save(); d(cr); cr.clip()
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for b in range(8):
        yy = y - r + (b + 0.5) * 2 * r / 8
        cr.move_to(x - r * 1.1, yy)
        for k in range(1, 31):
            xx = x - r * 1.1 + k * r * 2.2 / 30
            cr.line_to(xx, yy + r * 0.07 * math.sin((xx - x) / r * 4 + spin * 2.5 + b * 1.7) + r * 0.03 * math.sin(t * 0.8 + b))
        col = lighten(VEN, 0.45) if b % 2 else darken(VEN, 0.25)
        cr.set_source_rgba(*col, 0.35); cr.set_line_width(r * (0.10 + 0.05 * (b % 3))); cr.stroke()
    # remolinos
    for k in range(3):
        sx = x + r * 0.9 * math.sin(spin + k * 2.1); sy = y + r * (-0.4 + k * 0.4)
        if math.cos(spin + k * 2.1) > 0:
            cr.arc(sx, sy, r * 0.12, 0, 2 * math.pi); cr.set_source_rgba(*lighten(VEN, 0.6), 0.25); cr.set_line_width(r * 0.04); cr.stroke()
    g = cairo.RadialGradient(x - r * 0.4, y - r * 0.4, r * 0.25, x, y, r * 1.2)
    g.add_color_stop_rgba(0, 0, 0, 0, 0); g.add_color_stop_rgba(0.7, 0.1, 0, 0.05, 0.25); g.add_color_stop_rgba(1, 0.1, 0, 0.1, 0.65)
    cr.set_source(g); cr.paint()
    cr.restore()
    d(cr); cr.set_source_rgba(*lighten(YEL, 0.5), 0.35); cr.set_line_width(max(2, r * 0.02)); cr.stroke()
    if marker is not None:
        c_ = math.cos(marker)
        if c_ > 0.05:
            px = x + r * 0.92 * math.sin(marker); py = y - r * 0.25
            s = r / 250 * (0.4 + 0.6 * c_)
            cr.save(); cr.translate(px, py); cr.scale(s, s)
            cr.set_source_rgb(0.95, 0.95, 1.0); cr.set_line_width(9); cr.move_to(0, 0); cr.line_to(0, -110); cr.stroke()
            fl = lambda c: (c.move_to(0, -110), c.line_to(80, -88), c.line_to(0, -62), c.close_path())
            volume(cr, fl, MINT, (0, -110, 80, -62), sh_blur=8, rim=False)
            cr.arc(0, 0, 12, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill()
            cr.restore()

def sun(cr, x, y, r, t, a=1.0, rays=True):
    radial_glow(cr, x, y, r * 3.2, ORANGE, 0.40 * a); radial_glow(cr, x, y, r * 1.9, YEL, 0.55 * a)
    if rays:
        cr.save(); cr.translate(x, y); cr.rotate(t * 0.4)
        for k in range(12):
            cr.save(); cr.rotate(k * math.pi / 6); L = r * (1.45 + 0.08 * math.sin(t * 4 + k))
            cr.move_to(-r * 0.13, -r * 1.12); cr.line_to(0, -L); cr.line_to(r * 0.13, -r * 1.12); cr.close_path()
            cr.set_source_rgba(*lighten(YEL, 0.3), 0.85 * a); cr.fill(); cr.restore()
        cr.restore()
    d = lambda c: c.arc(x, y, r, 0, 2 * math.pi)
    volume(cr, d, YEL, (x - r, y - r, x + r, y + r), light=0.55, shade=0.25, sh=False)
    glow(cr, d, YEL, r * 0.6, 0.35 * a)

def earth(cr, x, y, r, t):
    radial_glow(cr, x, y, r * 1.6, CYAN, 0.35)
    d = lambda c: c.arc(x, y, r, 0, 2 * math.pi)
    volume(cr, d, BLUE, (x - r, y - r, x + r, y + r), light=0.35, shade=0.4, sh_blur=r * 0.25)
    cr.save(); d(cr); cr.clip()
    for k, (ox, oy, rr_) in enumerate([(-0.3, -0.3, 0.38), (0.4, 0.1, 0.3), (-0.1, 0.5, 0.25), (0.9, -0.5, 0.3)]):
        xx = x + r * (((ox + t * 0.25 + 1.3) % 2.6) - 1.3); yy = y + r * oy
        bl = lambda c, xx=xx, yy=yy, rr_=rr_: (c.save(), c.translate(xx, yy), c.scale(1.3, 0.9), c.arc(0, 0, r * rr_, 0, 2 * math.pi), c.restore())
        bl(cr); cr.set_source_rgba(*GREEN, 0.9); cr.fill()
    g = cairo.RadialGradient(x - r * 0.4, y - r * 0.4, r * 0.25, x, y, r * 1.2)
    g.add_color_stop_rgba(0, 0, 0, 0, 0); g.add_color_stop_rgba(1, 0, 0, 0.1, 0.6); cr.set_source(g); cr.paint()
    cr.restore()
    d(cr); cr.set_source_rgba(1, 1, 1, 0.35); cr.set_line_width(3); cr.stroke()

def arc_arrow(cr, x, y, rx, ry, a0, a1, col, w=16, alpha=1.0):
    """Flecha curva sobre una elipse, de a0 a a1 (radianes)."""
    if abs(a1 - a0) < 0.02: return
    n = 40; pts = [(x + rx * math.cos(a0 + (a1 - a0) * i / n), y + ry * math.sin(a0 + (a1 - a0) * i / n)) for i in range(n + 1)]
    def d(c):
        c.move_to(*pts[0])
        for p in pts[1:]: c.line_to(*p)
    cr.set_line_cap(cairo.LINE_CAP_ROUND)
    glow(cr, lambda c: (d(c), c.set_line_width(w), c.stroke_preserve()), col, 20, 0.5 * alpha)
    d(cr); cr.set_source_rgba(*col, alpha); cr.set_line_width(w); cr.stroke()
    (ex, ey), (px, py) = pts[-1], pts[-3]; ang = math.atan2(ey - py, ex - px); L = w * 2.6
    cr.move_to(ex + math.cos(ang) * L * 0.6, ey + math.sin(ang) * L * 0.6)
    cr.line_to(ex + math.cos(ang + 2.4) * L, ey + math.sin(ang + 2.4) * L)
    cr.line_to(ex + math.cos(ang - 2.4) * L, ey + math.sin(ang - 2.4) * L); cr.close_path()
    cr.set_source_rgba(*lighten(col, 0.2), alpha); cr.fill()

def clock_icon(c, r):
    c.set_source_rgb(1, 1, 1); c.set_line_width(r * 0.12); c.arc(0, 0, r * 0.55, 0, 2 * math.pi); c.stroke()
    c.set_line_cap(cairo.LINE_CAP_ROUND); c.move_to(0, 0); c.line_to(0, -r * 0.36); c.stroke(); c.move_to(0, 0); c.line_to(r * 0.26, r * 0.1); c.stroke()

def cal_icon(c, r):
    c.set_source_rgb(1, 1, 1); rr(c, -r * 0.55, -r * 0.45, r * 1.1, r * 0.95, r * 0.15); c.fill()
    c.set_source_rgba(0.9, 0.2, 0.3, 1); rr(c, -r * 0.55, -r * 0.45, r * 1.1, r * 0.3, r * 0.12); c.fill()
    c.set_source_rgba(0.3, 0.3, 0.5, 1)
    for i in range(3):
        for j in range(2): c.rectangle(-r * 0.38 + i * r * 0.28, -r * 0.02 + j * r * 0.24, r * 0.16, r * 0.14); c.fill()

def sunrise_icon(c, r):
    c.set_source_rgb(1, 1, 1); c.arc(0, r * 0.15, r * 0.32, math.pi, 2 * math.pi); c.fill()
    c.set_line_width(r * 0.1); c.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(5):
        a = math.pi + (k + 0.5) * math.pi / 5; c.move_to(r * 0.42 * math.cos(a), r * 0.15 + r * 0.42 * math.sin(a)); c.line_to(r * 0.58 * math.cos(a), r * 0.15 + r * 0.58 * math.sin(a)); c.stroke()
    c.move_to(-r * 0.6, r * 0.2); c.line_to(r * 0.6, r * 0.2); c.stroke()

def fit(cr, s, size, maxw=960, font=DISPLAY):
    while text_extents(cr, s, size, font).x_advance > maxw and size > 40: size -= 4
    return size

def big_title(cr, s, y, lt, t0, grad=(WHITE, (0.80, 0.88, 1.0)), size=104, glow_c=None, alpha=1.0):
    if lt < t0 or alpha <= 0: return
    size = fit(cr, s, size); k = pop((lt - t0) / 0.3)
    cr.save(); cr.translate(W / 2, y); cr.scale(k, k); text(cr, s, 0, 0, size, grad=grad, glow_c=glow_c, alpha=alpha); cr.restore()

def counter_card(cr, val, unit, cx, cy, k, col, alpha=1.0, w=560):
    if k <= 0.01 or alpha <= 0: return
    cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    glass(cr, -w / 2, -95, w, 170, 50, a=0.12)
    s = f"{int(round(val))}"; e = text_extents(cr, s, 120)
    eu = text_extents(cr, unit, 52, DISPLAY_XB); tot = e.x_advance + 24 + eu.x_advance
    text(cr, s, -tot / 2, 35, 120, grad=(lighten(col, 0.5), col), align="l", glow_c=col, alpha=alpha)
    text(cr, unit, -tot / 2 + e.x_advance + 24, 30, 52, WHITE, font=DISPLAY_XB, align="l", alpha=alpha)
    cr.restore()

def bar(cr, y, label, val, maxv, c1, c2, k, alpha=1.0, x0=110, wmax=820):
    if k <= 0 or alpha <= 0: return
    text(cr, label, x0, y - 26, 42, WHITE, font=DISPLAY_XB, align="l", alpha=alpha)
    w = max(90, wmax * val / maxv * eout(k)); h = 86
    d = lambda c: rr(c, x0, y, w, h, h / 2)
    cr.save(); cr.push_group()
    volume(cr, d, c1, (x0, y, x0 + w, y + h), light=0.35, shade=0.3, sh_blur=20)
    g = cairo.LinearGradient(x0, 0, x0 + w, 0); g.add_color_stop_rgba(0, *c1, 0); g.add_color_stop_rgba(1, *c2, 0.6); d(cr); cr.set_source(g); cr.fill()
    s = f"{int(round(val * eout(k)))} DÍAS"; e = text_extents(cr, s, 48)
    text(cr, s, x0 + w - e.x_advance - 34, y + h / 2 + 17, 48, WHITE, align="l", sh_alpha=0.4)
    cr.pop_group_to_source(); cr.paint_with_alpha(alpha); cr.restore()

def stamp(cr, s, cx, cy, lt, t0, c1=MINT, c2=(0.1, 0.7, 0.5), size=96, rot=-0.08):
    if lt < t0: return
    p = cl((lt - t0) / 0.25); k = 2.2 - 1.2 * eout(p) if p < 1 else 1 + 0.03 * math.sin((lt - t0) * 6)
    e = text_extents(cr, s, size)
    cr.save(); cr.translate(cx, cy); cr.rotate(rot); cr.scale(k, k)
    pill(cr, 0, -size * 0.32, e.x_advance + size * 1.0, size * 1.6, c1, c2)
    text(cr, s, 0, 0, size, (0.05, 0.12, 0.10), sh=False)
    cr.restore()
    ring_burst(cr, cx, cy - 30, (lt - t0 - 0.2) / 0.6, c1, 420, 14)

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

def dust(cr, t, n=26, seed=3, a=0.6):
    rnd = random.Random(seed)
    for i in range(n):
        x = rnd.uniform(40, W - 40); y = rnd.uniform(330, 1330); r = rnd.uniform(2, 6); ph = rnd.uniform(0, 6)
        cr.arc(x + 14 * math.sin(t * 0.7 + ph), y + 10 * math.cos(t * 0.5 + ph), r, 0, 2 * math.pi)
        cr.set_source_rgba(*rnd.choice([YEL, ORANGE, CYAN, PINK]), a * (0.4 + 0.6 * abs(math.sin(t + ph)))); cr.fill()

def draw_scene(cr, kind, lt, z, ev):
    if kind != "cierre": dust(cr, lt + z.dur, seed=len(kind))
    if kind == "gancho":
        t1, t2 = z.f(1), z.f(2)
        k = pop((lt + 0.25) / 0.45); bob = 12 * math.sin(lt * 2)
        cr.save(); cr.translate(540, 900 + bob); cr.scale(k, k); venus(cr, 0, 0, 280, lt * 0.6, lt, glow_a=0.55); cr.restore()
        ev("whoosh", 0.0); ev("impact", 0.05, g=0.7)
        # reloj (día) y calendario (año) con la comparación
        for j, (bx, ic, lab, c1, c2, tt) in enumerate([(160, clock_icon, "1 DÍA", PINK, VIOLET, 0.25), (920, cal_icon, "1 AÑO", (0.2, 0.7, 1.0), CYAN, 0.45)]):
            if lt < tt: continue
            ev("pop", tt); kb = pop((lt - tt) / 0.35); by = 1170 + 10 * math.sin(lt * 3 + j)
            cr.save(); cr.translate(bx, by); cr.scale(kb, kb); icon_badge(cr, 0, 0, 78, c1, c2, ic)
            text(cr, lab, 0, 135, 44, WHITE, font=DISPLAY_XB); cr.restore()
        if lt > 0.65:
            ev("ding", 0.65, g=0.5); kg = pop((lt - 0.65) / 0.3)
            cr.save(); cr.translate(540, 1205); cr.scale(kg, kg); text(cr, ">", 0, 0, 150, grad=(lighten(YEL, 0.5), ORANGE), glow_c=ORANGE); cr.restore()
        if lt < t1:
            big_title(cr, "UN DÍA DURA MÁS", 440, lt, -0.3, grad=(WHITE, (0.85, 0.88, 1.0)), size=100)
            big_title(cr, "QUE UN AÑO", 550, lt, -0.15, grad=(lighten(YEL, 0.5), ORANGE), size=120, glow_c=ORANGE)
        elif lt < t2:
            ev("whoosh", t1, g=0.7)
            callout(cr, "MITO", 300, 470, 76, PINK, (0.8, 0.15, 0.4), lt, t1, rot=-0.07)
            callout(cr, "REALIDAD", 730, 470, 76, MINT, (0.1, 0.7, 0.5), lt, t1 + 0.25, rot=0.06, dark=True)
            ev("pop", t1); ev("pop", t1 + 0.25)
        else:
            ev("impact", t2, g=0.6); callout(cr, "EL PASO 3 ES EL MÁS RARO", W / 2, 470, 58, YEL, ORANGE, lt, t2, dark=True)
            for q in range(4): sparkle(cr, 150 + q * 260, 360 + 25 * math.sin(lt * 3 + q), 20, [CYAN, PINK, YEL, MINT][q], 0.8, lt)
    elif kind == "anio":
        ta, td, t1 = 0.25, z.w("días"), z.f(1)
        cx, cy, rx, ry = 540, 830, 390, 150
        p = ease((lt - ta) / max(0.5, td - ta + 0.3))
        ang0 = math.pi / 2; ang = ang0 + 2 * math.pi * p
        vx, vy = cx + rx * math.cos(ang), cy + ry * math.sin(ang)
        # órbita
        cr.save(); cr.translate(cx, cy); cr.scale(rx, ry); cr.arc(0, 0, 1, 0, 2 * math.pi); cr.restore()
        cr.set_source_rgba(1, 1, 1, 0.25); cr.set_line_width(3); cr.set_dash([14, 12], -lt * 30); cr.stroke(); cr.set_dash([])
        if p > 0.01:
            arc_arrow(cr, cx, cy, rx, ry, ang0, ang - 0.12, YEL, 12, 0.9)
        front = math.sin(ang) > 0
        if not front: venus(cr, vx, vy, 62, lt * 0.3, lt, glow_a=0.35)
        sun(cr, cx, cy, 120, lt)
        if front: venus(cr, vx, vy, 62, lt * 0.3, lt, glow_a=0.35)
        ev("whoosh", ta, g=0.6)
        val = 225 * p
        counter_card(cr, val, "DÍAS", 540, 1180, pop((lt - 0.2) / 0.35), YEL)
        if lt < t1:
            callout(cr, "VUELTA AL SOL", W / 2, 470, 66, ORANGE, PINK, lt, 0.1); ev("pop", 0.1)
        else:
            ev("ding", t1); ev("pop", t1)
            kb = pop((lt - t1) / 0.35)
            cr.save(); cr.translate(250, 450); cr.scale(kb, kb); icon_badge(cr, 0, 0, 66, (0.2, 0.7, 1.0), CYAN, cal_icon); cr.restore()
            callout(cr, "1 AÑO = 225 DÍAS", 600, 470, 64, (0.2, 0.7, 1.0), VIOLET, lt, t1 + 0.1, rot=0.03)
            for q in range(3): sparkle(cr, 200 + q * 340, 1030 + 20 * math.sin(lt * 3 + q), 22, [YEL, CYAN, PINK][q], 0.9, lt * 2)
    elif kind == "dia":
        tl, t1, tv, td, t2, tr = z.w("lento"), z.f(1), z.w("vuelta"), z.w("días"), z.f(2), z.w("realidad")
        m = ease((lt - t2) / 0.5) if lt > t2 else 0
        pcx, pcy, pr = 540, 780 - 220 * m, 250 * (1 - 0.45 * m)
        rp = ease((lt - tv + 0.2) / max(0.6, td - tv + 0.5)) if lt > tv - 0.2 else 0
        spin = 0.15 * lt + 2 * math.pi * rp
        if m < 1:
            # anillo de progreso de la vuelta completa
            R = pr + 55
            cr.arc(pcx, pcy, R, 0, 2 * math.pi); cr.set_source_rgba(1, 1, 1, 0.12 * (1 - m)); cr.set_line_width(16); cr.stroke()
            if rp > 0:
                arc_arrow(cr, pcx, pcy, R, R, -math.pi / 2, -math.pi / 2 + 2 * math.pi * rp * 0.97, PINK, 16, 1 - m)
        venus(cr, pcx, pcy, pr, spin, lt, marker=math.sin(spin) * 0 + ((spin + 1.2) % (2 * math.pi)) - math.pi, glow_a=0.5)
        if lt < t1:
            callout(cr, "GIRA MUY LENTO", W / 2, 1180, 70, ORANGE, PINK, lt, tl - 0.2); ev("pop", tl - 0.2)
            arc_arrow(cr, pcx, pcy, pr + 55, pr + 55, -math.pi / 2, -math.pi / 2 + 0.15 * lt, PINK, 16, 0.9)
        elif lt < t2:
            ev("whoosh", tv - 0.2, g=0.6)
            counter_card(cr, 243 * rp, "DÍAS", 540, 1190, pop((lt - t1) / 0.35), PINK)
            callout(cr, "1 VUELTA COMPLETA", W / 2, 470, 60, PINK, VIOLET, lt, t1); ev("pop", t1)
            if rp >= 1: ev("ding", td + 0.3)
        else:
            ev("whoosh", t2, g=0.6)
            bar(cr, 860, "SU AÑO", 225, 243, (0.25, 0.65, 1.0), CYAN, cl((lt - t2 - 0.2) / 0.5))
            bar(cr, 1020, "SU DÍA", 243, 243, PINK, ORANGE, cl((lt - t2 - 0.5) / 0.5))
            ev("pop", t2 + 0.2); ev("pop", t2 + 0.5)
            if tr: stamp(cr, "¡REALIDAD!", W / 2, 1225, lt, tr, size=80); ev("impact", tr); ev("ding", tr + 0.05, g=0.7)
    elif kind == "reves":
        t1, t2, to, te = z.f(1), z.f(2), z.w("oeste"), z.w("este", 1)
        if lt < t1:
            k1 = pop(lt / 0.4); k2 = pop((lt - 0.2) / 0.4)
            cr.save(); cr.translate(290, 850); cr.scale(k1, k1); earth(cr, 0, 0, 140, lt)
            arc_arrow(cr, 0, 0, 200, 70, math.pi * 0.85, math.pi * 0.85 - 1.8 - 0.3 * math.sin(lt * 2), MINT, 14)
            text(cr, "TIERRA", 0, 290, 50, WHITE, font=DISPLAY_XB); cr.restore()
            cr.save(); cr.translate(790, 850); cr.scale(k2, k2); venus(cr, 0, 0, 160, -lt * 1.2, lt)
            arc_arrow(cr, 0, 0, 225, 80, math.pi * 0.15, math.pi * 0.15 + 1.8 + 0.3 * math.sin(lt * 2), RED, 14)
            text(cr, "VENUS", 0, 290, 50, WHITE, font=DISPLAY_XB); cr.restore()
            ev("whoosh", 0.0, g=0.6); ev("pop", 0.2)
            stamp(cr, "¡AL REVÉS!", W / 2, 520, lt, 0.45, RED, (0.75, 0.1, 0.25), size=84, rot=-0.05); ev("impact", 0.45, g=0.7)
        else:
            # ventana con el paisaje de Venus
            x0, y0, ww, hh = 90, 470, 900, 820
            kw = pop((lt - t1) / 0.4); ev("whoosh", t1, g=0.7)
            cr.save(); cr.translate(W / 2, y0 + hh / 2); cr.scale(kw, kw); cr.translate(-W / 2, -(y0 + hh / 2))
            win = lambda c: rr(c, x0, y0, ww, hh, 48)
            shadow(cr, win, 40, 0.5, dy=24)
            cr.save(); win(cr); cr.clip()
            g = cairo.LinearGradient(0, y0, 0, y0 + hh); g.add_color_stop_rgb(0, 0.45, 0.22, 0.12); g.add_color_stop_rgb(0.6, 0.95, 0.62, 0.30); g.add_color_stop_rgb(1, 1.0, 0.80, 0.45)
            cr.set_source(g); cr.paint()
            # trayectoria del Sol: de izquierda (oeste) a derecha (este)
            pr_ = ease((lt - to + 0.3) / 1.0) if lt > to - 0.3 else 0
            ps = ease((lt - te + 0.6) / 1.2) if lt > te - 0.6 else 0
            u = 0.5 * pr_ + 0.5 * ps
            sx = x0 + 120 + (ww - 240) * u; sy = y0 + hh * 0.72 - 380 * math.sin(math.pi * u)
            ax0, ay0 = x0 + 120, y0 + hh * 0.72
            cr.save(); cr.translate(W / 2, ay0); cr.scale((ww - 240) / 2, 380); cr.arc(0, 0, 1, math.pi, 2 * math.pi); cr.restore()
            cr.set_source_rgba(1, 1, 1, 0.45); cr.set_line_width(5); cr.set_dash([16, 14], -lt * 40); cr.stroke(); cr.set_dash([])
            sun(cr, sx, sy, 70, lt, 1.0)
            # suelo rocoso
            gd = lambda c: (c.move_to(x0 - 10, y0 + hh * 0.72), c.curve_to(x0 + 250, y0 + hh * 0.66, x0 + 600, y0 + hh * 0.78, x0 + ww + 10, y0 + hh * 0.70), c.line_to(x0 + ww + 10, y0 + hh + 10), c.line_to(x0 - 10, y0 + hh + 10), c.close_path())
            volume(cr, gd, (0.55, 0.26, 0.14), (x0, y0 + hh * 0.66, x0 + ww, y0 + hh), light=0.25, shade=0.5, rim=False, sh=False)
            for (rx_, ry_, r_) in [(x0 + 200, y0 + hh * 0.86, 50), (x0 + 640, y0 + hh * 0.9, 70), (x0 + 420, y0 + hh * 0.82, 30)]:
                rk = lambda c, rx_=rx_, ry_=ry_, r_=r_: (c.save(), c.translate(rx_, ry_), c.scale(1, 0.6), c.arc(0, 0, r_, 0, 2 * math.pi), c.restore())
                volume(cr, rk, (0.42, 0.20, 0.12), (rx_ - r_, ry_ - r_ * 0.6, rx_ + r_, ry_ + r_ * 0.6), sh_blur=10, rim=False)
            cr.restore()
            glass(cr, x0, y0, ww, hh, 48, a=0.0, sh=False)
            cr.restore()
            if kw > 0.5:
                callout(cr, "OESTE", 250, 1255, 50, ORANGE, PINK, lt, to - 0.1, rot=0); ev("pop", to - 0.1)
                if te: callout(cr, "ESTE", 830, 1255, 50, VIOLET, (0.2, 0.7, 1.0), lt, te - 0.1, rot=0); ev("pop", te - 0.1)
                if lt > to: callout(cr, "SALE AQUÍ", 250, 400, 52, YEL, ORANGE, lt, to, rot=-0.04, dark=True)
                if te and lt > te: callout(cr, "SE OCULTA AQUÍ", 760, 400, 52, VIOLET, PINK, lt, te, rot=0.04)
    elif kind == "remate":
        t1, t2, ta, tn = z.f(1), z.f(2), z.w("amanecer"), z.w("diecisiete")
        if lt < t1:
            kc = pop(lt / 0.4)
            cr.save(); cr.translate(W / 2, 830); cr.scale(kc, kc); cr.translate(-W / 2, -830)
            glass(cr, 100, 600, 880, 480, 48, a=0.10)
            for j, bx in enumerate((250, 830)):
                tt = ta - 0.2 + j * 0.5
                if lt > tt:
                    kb = pop((lt - tt) / 0.35); cr.save(); cr.translate(bx, 760); cr.scale(kb, kb)
                    icon_badge(cr, 0, 0, 80, ORANGE, PINK, sunrise_icon); text(cr, "AMANECER", 0, 140, 38, WHITE, font=DISPLAY_XB); cr.restore()
                    ev("pop", tt)
            pa = ease((lt - ta) / max(0.6, tn - ta)) if lt > ta else 0
            if pa > 0:
                cr.save(); cr.translate(540, 760); cr.scale(250, 120); cr.arc(0, 0, 1, math.pi, 2 * math.pi); cr.restore()
                cr.set_source_rgba(1, 1, 1, 0.4); cr.set_line_width(5); cr.set_dash([12, 12], -lt * 30); cr.stroke(); cr.set_dash([])
                a = math.pi + math.pi * pa; sun(cr, 540 + 250 * math.cos(a), 760 + 120 * math.sin(a), 30, lt, 0.9, rays=False)
            cr.restore()
            counter_card(cr, 117 * (ease((lt - ta) / max(0.6, tn - ta + 0.3)) if lt > ta else 0), "DÍAS", 540, 1190, pop((lt - ta) / 0.35), ORANGE)
            callout(cr, "OJO", W / 2, 470, 70, YEL, ORANGE, lt, 0.0, dark=True); ev("pop", 0.0)
            if tn: ev("ding", tn + 0.2)
        elif lt < t2:
            ev("whoosh", t1, g=0.6)
            kk = [cl((lt - t1 - 0.1 - 0.25 * j) / 0.5) for j in range(3)]
            bar(cr, 560, "DE AMANECER A AMANECER", 117, 243, ORANGE, YEL, kk[0])
            bar(cr, 790, "SU AÑO", 225, 243, (0.25, 0.65, 1.0), CYAN, kk[1])
            bar(cr, 1020, "UNA VUELTA COMPLETA", 243, 243, PINK, ORANGE, kk[2])
            for j in range(3): ev("pop", t1 + 0.1 + 0.25 * j)
            if lt > t1 + 1.3:
                callout(cr, "GANA LA VUELTA", W / 2, 1265, 56, MINT, (0.1, 0.7, 0.5), lt, t1 + 1.3, dark=True); ev("ding", t1 + 1.3, g=0.6)
        else:
            kv = pop((lt - t2) / 0.45); ev("impact", t2, g=0.6)
            cr.save(); cr.translate(540, 920); cr.scale(kv, kv); venus(cr, 0, 0, 290, lt * 0.6, lt, glow_a=0.6); cr.restore()
            for q in range(5): sparkle(cr, 140 + q * 200, 1270 + 25 * math.sin(lt * 3 + q), 20, [CYAN, PINK, YEL, MINT, ORANGE][q], 0.8, lt)
            big_title(cr, "EN VENUS...", 470, lt, t2 + 0.1, grad=(lighten(YEL, 0.5), ORANGE), size=120, glow_c=ORANGE)
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
