"""Render moderno de Shorts (estilo 2.5D: volumen, sombras suaves, glow, glass).
uso: render3.py guion.json outdir [frames t1,t2,...]
Cada short nuevo reescribe draw_scene(); todo lo demás se reutiliza."""
import cairo, json, math, os, random, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from estilo import *

FPS = 30
SKIN = (1.0, 0.76, 0.62); HAIR = (0.30, 0.17, 0.20); LINE = (0.16, 0.08, 0.14); RED = (1.0, 0.27, 0.36); ICE = (0.70, 0.93, 1.0)
# fondo por escena: (arriba, abajo, manchas de luz)
BGS = {"gancho": ((0.10, 0.05, 0.22), (0.30, 0.06, 0.28), (PINK, VIOLET, ORANGE)),
       "nombre": ((0.04, 0.08, 0.20), (0.06, 0.20, 0.32), (CYAN, VIOLET, MINT)),
       "contrae": ((0.03, 0.08, 0.20), (0.05, 0.22, 0.40), (CYAN, (0.4, 0.6, 1.0), MINT)),
       "dilata": ((0.16, 0.03, 0.08), (0.36, 0.05, 0.14), (RED, PINK, ORANGE)),
       "nervio": ((0.08, 0.05, 0.18), (0.26, 0.14, 0.06), (YEL, ORANGE, VIOLET)),
       "truco": ((0.04, 0.12, 0.12), (0.20, 0.14, 0.06), (MINT, ORANGE, YEL)),
       "cierre": ((0.07, 0.06, 0.18), (0.16, 0.05, 0.28), (VIOLET, CYAN, PINK))}

# ================= ilustraciones reutilizables =================
def head_path(c):
    c.move_to(-150, 250); c.curve_to(-170, 120, -230, 40, -220, -80)
    c.curve_to(-210, -230, -80, -300, 40, -290); c.curve_to(170, -280, 220, -180, 215, -90)
    c.curve_to(212, -50, 230, -30, 255, 10); c.curve_to(270, 35, 250, 45, 232, 50)
    c.curve_to(240, 70, 235, 85, 228, 95); c.curve_to(238, 110, 230, 125, 222, 132)
    c.curve_to(225, 160, 210, 190, 170, 200); c.curve_to(120, 210, 60, 200, 40, 250); c.close_path()

def hair_path(c):
    c.move_to(-212, -110); c.curve_to(-215, -260, -60, -330, 70, -305); c.curve_to(170, -290, 215, -220, 214, -150)
    c.curve_to(170, -205, 90, -215, 30, -190); c.curve_to(-30, -168, -90, -175, -120, -140)
    c.curve_to(-150, -110, -190, -90, -212, -110); c.close_path()

def head(cr, cx, cy, s, mood="normal", t=0, squash=1.0, heat=0.0):
    cr.save(); cr.translate(cx, cy); cr.scale(s * (2 - squash), s * squash)
    torso = lambda c: (c.move_to(-380, 900), c.line_to(-370, 420), c.curve_to(-350, 310, -260, 250, -150, 238), c.line_to(60, 238), c.curve_to(190, 250, 300, 310, 320, 420), c.line_to(330, 900), c.close_path())
    volume(cr, torso, (0.42, 0.30, 0.95), (-380, 238, 330, 700), light=0.3, shade=0.35, sh_blur=40)
    cr.set_source_rgba(1, 1, 1, 0.35); cr.set_line_width(8); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.move_to(-130, 250); cr.curve_to(-110, 300, 20, 300, 40, 250); cr.stroke()
    volume(cr, head_path, SKIN, (-230, -300, 270, 250), light=0.25, shade=0.25, sh_blur=40, sh_alpha=0.45)
    if heat > 0:  # rubor de dolor en la frente
        cr.save(); head_path(cr); cr.clip(); radial_glow(cr, 160, -170, 230, RED, 0.75 * heat); cr.restore()
    volume(cr, hair_path, HAIR, (-215, -310, 215, -100), light=0.3, shade=0.3, sh=False, rim=True)
    # oreja
    ear = lambda c: (c.save(), c.translate(-55, -15), c.scale(0.68, 1), c.arc(0, 0, 46, 0, 2 * math.pi), c.restore())
    volume(cr, ear, darken(SKIN, 0.08), (-90, -60, -20, 30), light=0.2, sh=False, rim=False)
    cr.set_source_rgba(*darken(SKIN, 0.35), 0.8); cr.set_line_width(6); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.arc(-52, -15, 18, -1.2, 1.4); cr.stroke()
    # mejilla
    radial_glow(cr, 130, 25, 70, (1, 0.45, 0.5), 0.35)
    ex, ey = 150, -70; cr.set_source_rgb(*LINE); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    if mood == "pain":
        cr.set_line_width(11); cr.move_to(ex - 26, ey - 18); cr.line_to(ex + 6, ey); cr.line_to(ex - 26, ey + 18); cr.stroke()
        cr.set_line_width(12); cr.move_to(ex - 42, ey - 66); cr.line_to(ex + 24, ey - 40); cr.stroke()
        cr.set_line_width(9); cr.move_to(196, 114); cr.curve_to(206, 98, 222, 100, 230, 110); cr.stroke()
        for k in range(2):
            ph = (t * 1.3 + k * 0.5) % 1; dx, dy = 40 + k * 70, -150 + ph * 90
            drop = lambda c, dx=dx, dy=dy: (c.move_to(dx, dy - 24), c.curve_to(dx + 17, dy, dx + 15, dy + 15, dx, dy + 15), c.curve_to(dx - 15, dy + 15, dx - 17, dy, dx, dy - 24))
            drop(cr); g = cairo.LinearGradient(0, dy - 24, 0, dy + 15); g.add_color_stop_rgba(0, 0.8, 0.95, 1, 1 - ph); g.add_color_stop_rgba(1, 0.4, 0.75, 1, 1 - ph); cr.set_source(g); cr.fill()
        cr.set_source_rgb(*LINE)
    elif mood == "happy":
        cr.set_line_width(11); cr.arc(ex - 4, ey + 10, 20, math.pi * 1.1, math.pi * 1.9); cr.stroke()
        cr.set_line_width(10); cr.move_to(ex - 40, ey - 55); cr.curve_to(ex - 15, ey - 72, ex + 10, ey - 70, ex + 26, ey - 56); cr.stroke()
        cr.arc(205, 96, 26, 0.1 * math.pi, 0.8 * math.pi); cr.stroke()
    elif mood == "confused":
        cr.arc(ex, ey, 17, 0, 2 * math.pi); cr.fill(); cr.arc(ex + 6, ey - 6, 6, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill()
        cr.set_source_rgb(*LINE); cr.set_line_width(10); cr.move_to(ex - 40, ey - 50 + 8 * math.sin(t * 6)); cr.line_to(ex + 25, ey - 62); cr.stroke()
        cr.move_to(198, 112); cr.line_to(228, 106); cr.stroke()
    else:
        if (t % 3.1) < 0.12: cr.set_line_width(10); cr.move_to(ex - 18, ey); cr.line_to(ex + 18, ey); cr.stroke()
        else:
            cr.arc(ex, ey, 18, 0, 2 * math.pi); cr.fill(); cr.arc(ex + 6, ey - 6, 6.5, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill()
        cr.set_source_rgb(*LINE); cr.set_line_width(10); cr.move_to(ex - 40, ey - 55); cr.line_to(ex + 25, ey - 60); cr.stroke()
        cr.arc(212, 108, 18, 0.0, math.pi * 0.9); cr.stroke()
    cr.restore()

def cone(cr, cx, cy, s, rot=0, bite=0):
    cr.save(); cr.translate(cx, cy); cr.rotate(rot); cr.scale(s, s)
    wf = lambda c: (c.move_to(-74, 0), c.line_to(0, 205), c.line_to(74, 0), c.close_path())
    volume(cr, wf, (0.93, 0.64, 0.32), (-74, 0, 74, 205), light=0.25, shade=0.35, sh_blur=30)
    cr.save(); wf(cr); cr.clip(); cr.set_source_rgba(0.55, 0.32, 0.12, 0.45); cr.set_line_width(5)
    for i in range(-5, 6):
        cr.move_to(i * 26 - 60, -10); cr.line_to(i * 26 + 60, 220); cr.stroke(); cr.move_to(i * 26 + 60, -10); cr.line_to(i * 26 - 60, 220); cr.stroke()
    cr.restore()
    for (x, y, r, col) in [(-40, -24, 54, (1.0, 0.55, 0.74)), (40, -24, 54, (0.50, 0.92, 0.78)), (0, -84, 60 - bite * 12, (1.0, 0.93, 0.80))]:
        d = lambda c, x=x, y=y, r=r: c.arc(x, y, r, 0, 2 * math.pi)
        volume(cr, d, col, (x - r, y - r, x + r, y + r), light=0.35, shade=0.2, sh_blur=18, sh_alpha=0.3)
        cr.arc(x - r * 0.35, y - r * 0.4, r * 0.18, 0, 2 * math.pi); cr.set_source_rgba(1, 1, 1, 0.6); cr.fill()
    # chispas de colores (sprinkles)
    rnd = random.Random(4)
    for _ in range(9):
        x, y, a = rnd.uniform(-70, 70), rnd.uniform(-120, -10), rnd.uniform(0, 3)
        cr.save(); cr.translate(x, y); cr.rotate(a); rr(cr, -9, -3, 18, 6, 3); cr.set_source_rgb(*rnd.choice([CYAN, YEL, VIOLET, WHITE])); cr.fill(); cr.restore()
    cr.restore()

def bolt(cr, x, y, s, a, rot=0, col=YEL):
    if a <= 0.02: return
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.scale(s, s)
    d = lambda c: ([c.move_to(0, -60)] + [c.line_to(px, py) for (px, py) in [(-25, 5), (-2, 5), (-15, 60), (30, -10), (6, -10), (20, -60)]] + [c.close_path()])
    glow(cr, d, col, 30, 0.7 * a)
    d(cr); g = cairo.LinearGradient(0, -60, 0, 60); g.add_color_stop_rgba(0, *lighten(col, 0.5), a); g.add_color_stop_rgba(1, *col, a); cr.set_source(g); cr.fill()
    cr.restore()

def snowflake(cr, x, y, r, a, rot):
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.set_source_rgba(*ICE, a); cr.set_line_width(max(3, r / 8)); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(6):
        cr.save(); cr.rotate(k * math.pi / 3); cr.move_to(0, 0); cr.line_to(0, -r)
        cr.move_to(0, -r * .6); cr.line_to(-r * .25, -r * .82); cr.move_to(0, -r * .6); cr.line_to(r * .25, -r * .82); cr.stroke(); cr.restore()
    cr.restore()

def brain(cr, x, y, s, frost=0, t=0, wob=0):
    cr.save(); cr.translate(x, y); cr.scale(s * (1 + 0.035 * math.sin(t * 8) * wob), s * (1 - 0.035 * math.sin(t * 8) * wob))
    base = mix((1.0, 0.55, 0.70), (0.62, 0.86, 1.0), frost)
    lobes = [(-90, -30, 95), (0, -70, 100), (95, -30, 95), (-60, 50, 85), (60, 50, 85), (0, 20, 90)]
    d = lambda c: [(c.new_sub_path(), c.arc(bx, by, r, 0, 2 * math.pi)) for (bx, by, r) in lobes]
    glow(cr, d, base, 60, 0.35)
    volume(cr, d, base, (-190, -170, 190, 140), light=0.3, shade=0.3, sh_blur=40, rim=False)
    cr.set_source_rgba(*darken(base, 0.35), 0.55); cr.set_line_width(9); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for (a, b, c_, d2) in [(-150, -40, -60, -100), (-40, -120, 40, -30), (60, -110, 150, -50), (-140, 60, -40, 20), (30, 30, 140, 70), (0, -150, 0, 110)]:
        cr.move_to(a, b); cr.curve_to((a + c_) / 2, b - 40, (a + c_) / 2, d2 + 40, c_, d2); cr.stroke()
    if frost > 0:
        for k in range(7): snowflake(cr, -150 + k * 50, -150 + (k % 3) * 120, 22, frost, t + k)
    cr.restore()

def vessel(cr, t, cy, width, speed, cold, beat=0):
    x0, x1 = -40, W + 40; w = width * (1 + 0.12 * beat)
    tube = lambda c: rr(c, x0, cy - w / 2 - 22, x1 - x0, w + 44, 30)
    shadow(cr, tube, 40, 0.5, dy=24)
    tube(cr); g = cairo.LinearGradient(0, cy - w / 2 - 22, 0, cy + w / 2 + 22)
    g.add_color_stop_rgb(0, 1.0, 0.62, 0.68); g.add_color_stop_rgb(0.5, 0.86, 0.35, 0.45); g.add_color_stop_rgb(1, 0.6, 0.18, 0.28); cr.set_source(g); cr.fill()
    inner = lambda c: c.rectangle(x0, cy - w / 2, x1 - x0, w)
    inner(cr); g = cairo.LinearGradient(0, cy - w / 2, 0, cy + w / 2)
    g.add_color_stop_rgb(0, 0.42, 0.02, 0.10); g.add_color_stop_rgb(0.5, 0.62, 0.05, 0.14); g.add_color_stop_rgb(1, 0.30, 0.01, 0.07); cr.set_source(g); cr.fill()
    rnd = random.Random(3)
    for i in range(30):
        off, ry = rnd.uniform(0, 1200), rnd.uniform(-0.34, 0.34)
        x = x0 + (off + t * speed) % (x1 - x0); y = cy + ry * w; r = max(12, min(32, w * 0.15))
        cr.save(); cr.translate(x, y); cr.rotate(rnd.uniform(0, 3)); cr.scale(1, 0.62)
        gg = cairo.RadialGradient(-r * 0.3, -r * 0.3, 0, 0, 0, r); gg.add_color_stop_rgb(0, 1.0, 0.55, 0.55); gg.add_color_stop_rgb(1, 0.82, 0.10, 0.20)
        cr.arc(0, 0, r, 0, 2 * math.pi); cr.set_source(gg); cr.fill(); cr.arc(0, 0, r * 0.45, 0, 2 * math.pi); cr.set_source_rgba(0.55, 0.0, 0.08, 0.5); cr.fill(); cr.restore()
    # brillo del tubo
    cr.set_source_rgba(1, 1, 1, 0.22); rr(cr, x0, cy - w / 2 - 16, x1 - x0, 10, 5); cr.fill()
    if cold > 0:
        cr.set_source_rgba(*ICE, cold * 0.85); cr.set_line_width(10)
        for yy in (cy - w / 2 - 26, cy + w / 2 + 26): cr.move_to(x0, yy); cr.line_to(x1, yy); cr.stroke()
        radial_glow(cr, W / 2, cy, 600, ICE, 0.18 * cold)

def thermo(cr, x, y, level, col):
    glass(cr, x - 34, y - 230, 68, 250, 34, a=0.14)
    d = lambda c: c.arc(x, y + 30, 46, 0, 2 * math.pi)
    volume(cr, d, col, (x - 46, y - 16, x + 46, y + 76), sh_blur=20)
    d2 = lambda c: rr(c, x - 14, y - 10 - 200 * level, 28, 200 * level + 30, 14)
    d2(cr); cr.set_source_rgb(*col); cr.fill()
    glow(cr, d2, col, 30, 0.5)

def cup(cr, x, y, s, t):
    cr.save(); cr.translate(x, y); cr.scale(s, s)
    body = lambda c: rr(c, -95, -105, 190, 210, 34)
    cr.set_line_width(26); cr.arc(98, 0, 48, -math.pi / 2, math.pi / 2); cr.set_source_rgb(0.85, 0.85, 0.92); cr.stroke()
    volume(cr, body, (0.96, 0.96, 1.0), (-95, -105, 95, 105), light=0.1, shade=0.25)
    pill_band = lambda c: c.rectangle(-95, -38, 190, 36)
    cr.save(); body(cr); cr.clip(); pill_band(cr); g = cairo.LinearGradient(-95, 0, 95, 0); g.add_color_stop_rgb(0, *PINK); g.add_color_stop_rgb(1, *VIOLET); cr.set_source(g); cr.fill(); cr.restore()
    cr.set_source_rgba(1, 1, 1, 0.7); cr.set_line_width(10); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(3):
        cr.move_to(-45 + k * 45, -125)
        for j in range(1, 8): cr.line_to(-45 + k * 45 + 15 * math.sin(t * 5 + j + k), -125 - j * 20)
        cr.stroke()
    cr.restore()

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
    if kind == "gancho":
        tz = z.w("zas"); hit = lt >= tz; sh = math.exp(-(lt - tz) * 6) if hit else 0
        heat = ease((lt - tz) / 0.3) if hit else 0
        if hit:
            radial_glow(cr, 560, 760, 520 + 40 * math.sin(lt * 9), RED, 0.55 * heat)
            ring_burst(cr, 560, 740, (lt - tz) / 0.7, YEL, 520, 14)
        head(cr, 420 + math.sin(lt * 60) * 16 * sh, 1010, 1.3, "pain" if hit else "normal", lt, squash=1 - 0.07 * sh, heat=heat)
        ci = eout(lt / 0.5); bob = math.sin(lt * 7) * 14 if not hit else 0
        cone(cr, 1400 - 520 * ci + bob, 1080 - 40 * ci, 1.05, -0.55 + 0.3 * (1 - ci), bite=min(1, lt / tz) if tz else 0)
        ev("whoosh", 0.0)
        for k in range(4): sparkle(cr, 180 + k * 240, 640 + 40 * math.sin(lt * 2 + k), 18 + 6 * math.sin(lt * 4 + k), [CYAN, PINK, YEL, MINT][k], 0.7, lt)
        if hit:
            ev("impact", tz); ev("crack", tz + 0.05)
            cr.set_source_rgba(1, 0.25, 0.35, 0.35 * math.exp(-(lt - tz) * 5)); cr.paint()
            for k in range(5):
                ang = -2.6 + k * 0.45; r = 300 + 110 * eout((lt - tz) / 0.4)
                bolt(cr, 560 + math.cos(ang) * r, 760 + math.sin(ang) * r, 1.1 + 0.12 * math.sin(lt * 12 + k), 1, ang + 1.57)
        tq = z.f(3)
        if lt > tq:
            ev("pop", tq); callout(cr, "TRUCO AL FINAL", W / 2, 470, 58, YEL, ORANGE, lt, tq, dark=True)
            by = 560 + 16 * math.sin(lt * 9); d = lambda c: (c.move_to(W / 2 - 34, by), c.line_to(W / 2 + 34, by), c.line_to(W / 2, by + 42), c.close_path())
            glow(cr, d, YEL, 20, 0.6); d(cr); cr.set_source_rgb(*YEL); cr.fill()
        elif lt < tz:
            k = pop(lt / 0.35); cr.save(); cr.translate(W / 2, 470); cr.scale(k, k)
            text(cr, "¿TE HA PASADO?", 0, 0, 96, grad=(WHITE, (0.80, 0.85, 1.0))); cr.restore()
    elif kind == "nombre":
        word, word2 = "GANGLIONEURALGIA", "ESFENOPALATINA"; t1, t2 = z.f(1), z.f(2)
        brain(cr, W / 2, 1080, 1.2, frost=ease((lt - t2) / 0.6), t=lt, wob=1 if lt < t2 else 0.3)
        glass(cr, 60, 470, W - 120, 260, 44, a=0.08)
        for line, wd in enumerate((word, word2)):
            e = text_extents(cr, wd, 74); x0 = W / 2 - e.x_advance / 2
            for pos, ch in enumerate(wd):
                idx = pos if line == 0 else len(word) + pos; ts = t1 + idx * 0.05
                if lt < ts: continue
                pre = text_extents(cr, wd[:pos], 74).x_advance; me = text_extents(cr, ch, 74).x_advance
                k = pop((lt - ts) / 0.22); dy = (1 - ease((lt - ts) / 0.22)) * -50
                crossed = lt > t2
                cr.save(); cr.translate(x0 + pre + me / 2, 580 + line * 100 + dy); cr.scale(k, k)
                text(cr, ch, 0, 0, 74, grad=((0.8, 0.97, 1.0), CYAN) if not crossed else None, color=(0.6, 0.65, 0.75), alpha=1 if not crossed else 0.55, sh=not crossed); cr.restore()
                if idx % 4 == 0: ev("click", ts, g=0.5)
        if lt > t2:
            ev("impact", t2, g=0.5); p = eout((lt - t2) / 0.25)
            cr.set_source_rgba(*RED, 0.95); cr.set_line_width(12); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.move_to(110, 548); cr.line_to(110 + 860 * p, 650); cr.stroke()
            tc = z.w("congelamiento")
            if lt > tc: ev("ding", tc); callout(cr, "CONGELAMIENTO CEREBRAL", W / 2, 850, 54, PINK, VIOLET, lt, tc)
    elif kind == "contrae":
        te = z.w("encogen"); k = ease((lt - te) / 0.6); tf = z.w("enfría")
        thermo(cr, 930, 780, 0.8 - 0.65 * ease((lt - tf) / 1.0), CYAN); ev("whoosh", tf, g=0.6)
        rnd = random.Random(2)
        for i in range(14):
            x = rnd.uniform(40, W - 40); y0 = rnd.uniform(0, 1); sp = rnd.uniform(80, 200); r = rnd.uniform(18, 40)
            snowflake(cr, x, 560 + ((y0 * 900 + lt * sp) % 900), r, 0.2 + 0.55 * k, lt * rnd.choice([-1, 1]))
        vessel(cr, lt, 1010, 300 - 200 * k + 10 * math.sin(lt * 20) * k, 260 - 180 * k, ease((lt - tf) / 0.8))
        if lt > te:
            ev("crack", te); ev("pop", te + 0.2)
            for side in (-1, 1):
                d = lambda c, side=side: (c.save(), c.translate(W / 2, 1010 + side * (230 - 60 * k)), c.scale(1, side), c.move_to(-46, -60), c.line_to(46, -60), c.line_to(0, 0), c.close_path(), c.restore())
                glow(cr, d, CYAN, 20, 0.6 * k); d(cr); cr.set_source_rgba(*ICE, k); cr.fill()
            callout(cr, "¡SE ENCOGEN!", W / 2, 1290, 60, CYAN, (0.35, 0.5, 1.0), lt, te + 0.1)
    elif kind == "dilata":
        tb, tc = z.f(1), z.w("chorro"); k = ease((lt - tb) / 0.5)
        beat = max(0.0, math.sin(lt * 2 * math.pi * 1.8)) ** 6 if lt > z.f(0) else 0
        ev("heartbeat", 0.15, g=0.8); ev("heartbeat", tb, g=0.9)
        if lt < tb:
            a = 0.5 + 0.5 * math.sin(lt * 18)
            radial_glow(cr, W / 2, 680, 420, RED, 0.6 * a)
            icon_badge(cr, W / 2, 690, 120, (1.0, 0.35, 0.40), (0.75, 0.05, 0.25), lambda c, r: (c.set_source_rgb(1, 1, 1), c.set_line_width(14), c.set_line_cap(cairo.LINE_CAP_ROUND), c.move_to(0, -50), c.line_to(0, 15), c.stroke(), c.arc(0, 50, 9, 0, 2 * math.pi), c.fill()))
            ring_burst(cr, W / 2, 690, (lt * 1.8) % 1, RED, 300, 10)
        vessel(cr, lt, 1020, 100 + 260 * k, 120 + 900 * ease((lt - tc) / 0.3), 1 - k, beat)
        for side in (-1, 1):
            d = lambda c, side=side: (c.save(), c.translate(W / 2, 1020 + side * (90 + 170 * k)), c.scale(1, side), c.move_to(-46, 0), c.line_to(46, 0), c.line_to(0, -58), c.close_path(), c.restore())
            if k > 0.05: glow(cr, d, MINT, 20, 0.6 * k); d(cr); cr.set_source_rgba(*MINT, k); cr.fill()
        if lt > tc:
            ev("whoosh", tc); ev("impact", tc + 0.1, g=0.4)
            for i in range(9):
                ph = (lt * 2.5 + i / 9) % 1; y = 600 + i * 90
                g = cairo.LinearGradient(W * ph - 160, 0, W * ph + 80, 0); g.add_color_stop_rgba(0, 1, 1, 1, 0); g.add_color_stop_rgba(1, 1, 1, 1, 0.75 * (1 - ph))
                cr.set_source(g); rr(cr, W * ph - 160, y - 4, 240, 8, 4); cr.fill()
            callout(cr, "¡FIUUUM!", W / 2, 1320, 80, YEL, ORANGE, lt, tc, rot=0.04, dark=True)
    elif kind == "nervio":
        tn, tcf, tf = z.w("trigémino"), z.f(2), z.f(3)
        mood = "normal" if lt < tcf else ("confused" if lt < tf else "pain")
        if lt > tf: radial_glow(cr, 725, 800, 420, RED, 0.5)
        head(cr, 430, 1050, 1.4, mood, lt, heat=ease((lt - tf) / 0.3) if lt > tf else 0)
        path = [(745, 1185), (650, 1150), (585, 1060), (590, 950), (650, 870), (725, 815)]
        a = ease((lt - tn + 0.3) / 0.5)
        dpath = lambda c: ([c.move_to(*path[0])] + [c.line_to(*p) for p in path[1:]])
        if a > 0:
            cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)
            def dn(c):
                dpath(c); c.set_line_width(22); c.stroke_preserve()
            cr.save(); cr.set_operator(cairo.OPERATOR_ADD); dpath(cr); cr.set_line_width(30); cr.set_source_rgba(*YEL, 0.25 * a); cr.stroke(); cr.restore()
            dpath(cr); cr.set_line_width(10); cr.set_source_rgba(*lighten(YEL, 0.4), 0.9 * a); cr.stroke()
        if lt > tn:
            ev("zap", tn)
            for q in range(2):
                ph = ((lt - tn) * 1.2 + q * 0.5) % 1; seg = ph * (len(path) - 1); i = int(seg); fr = seg - i
                px = path[i][0] + (path[i + 1][0] - path[i][0]) * fr; py = path[i][1] + (path[i + 1][1] - path[i][1]) * fr
                radial_glow(cr, px, py, 110, YEL, 0.9); sparkle(cr, px, py, 34, YEL, 1, lt * 4)
        if tcf <= lt < tf:
            for q in range(3):
                ang = lt * 3 + q * 2.1; k = pop((lt - tcf - q * 0.15) / 0.3)
                cr.save(); cr.translate(520 + math.cos(ang) * 220, 600 + math.sin(ang) * 70); cr.scale(k, k)
                text(cr, "?", 0, 0, 120, grad=(lighten(YEL, 0.5), ORANGE)); cr.restore()
            ev("pop", tcf); ev("pop", tcf + 0.15); ev("pop", tcf + 0.3)
        if lt > tf:
            ev("impact", tf); ring_burst(cr, 725, 800, (lt - tf) / 0.6, YEL, 380, 14)
            k = pop((lt - tf) / 0.35); cr.save(); cr.translate(860, 640); cr.rotate(0.15 + 0.04 * math.sin(lt * 20)); cr.scale(k, k)
            text(cr, "¡AY!", 0, 0, 150, grad=(lighten(YEL, 0.5), ORANGE), glow_c=ORANGE); cr.restore()
    elif kind == "truco":
        tl, tt, tok = z.f(1), z.f(2), z.f(3)
        if lt < tt + 0.2:
            cx, cy = W / 2, 1000
            arch = lambda c: (c.arc(cx, cy + 150, 360, math.pi * 1.08, math.pi * 1.92), c.arc_negative(cx, cy + 150, 290, math.pi * 1.92, math.pi * 1.08), c.close_path())
            volume(cr, arch, (1.0, 0.62, 0.70), (cx - 360, cy - 210, cx + 360, cy + 40))
            text(cr, "PALADAR", cx, cy - 250, 40, (1, 0.85, 0.9), font=DISPLAY_XB)
            up = spring((lt - tl) / 0.8, 1.5, 5) * 130
            if lt > tl + 0.5:
                a = ease((lt - tl - 0.5) / 0.6); radial_glow(cr, cx, cy - 60, 420, ORANGE, 0.6 * a)
                for q in range(6):
                    ph = (lt * 0.9 + q / 6) % 1; x = cx - 250 + q * 100
                    cr.set_source_rgba(1, 0.78, 0.35, a * (1 - ph)); cr.set_line_width(9); cr.set_line_cap(cairo.LINE_CAP_ROUND)
                    cr.move_to(x, cy - 130 - ph * 200); cr.curve_to(x + 25, cy - 160 - ph * 200, x - 25, cy - 190 - ph * 200, x, cy - 220 - ph * 200); cr.stroke()
            tg = lambda c: (c.save(), c.translate(cx, cy + 330 - up), c.scale(1, 0.55), c.arc(0, 0, 250, math.pi, 2 * math.pi), c.close_path(), c.restore())
            volume(cr, tg, (0.95, 0.38, 0.52), (cx - 250, cy + 190 - up, cx + 250, cy + 330 - up))
            cr.set_source_rgba(0.6, 0.15, 0.25, 0.5); cr.set_line_width(7); cr.move_to(cx, cy + 330 - up - 115); cr.line_to(cx, cy + 330 - up - 30); cr.stroke()
            text(cr, "LENGUA", cx, cy + 300 - up, 40, WHITE, font=DISPLAY_XB)
            ev("whoosh", tl, g=0.6)
        else:
            k = eout((lt - tt) / 0.4)
            if lt < tok:
                radial_glow(cr, W / 2, 1000, 400, ORANGE, 0.5); cup(cr, W / 2 + (1 - k) * 700, 1030, 1.6, lt); ev("whoosh", tt)
            else:
                radial_glow(cr, W / 2, 900, 520, MINT, 0.35)
                head(cr, 470, 1050, 1.3, "happy", lt, squash=1 + 0.05 * math.sin((lt - tok) * 12) * math.exp(-(lt - tok) * 3))
                cup(cr, 870, 1160, 0.8, lt); ev("ding", tok)
                for q in range(16):
                    rnd = random.Random(q); ph = (lt - tok) * rnd.uniform(0.6, 1.2)
                    x = rnd.uniform(80, W - 80); y = 480 + ph * 700 + 30 * math.sin(lt * 5 + q)
                    cr.save(); cr.translate(x, y); cr.rotate(lt * 4 + q); rr(cr, -13, -6, 26, 12, 4); cr.set_source_rgb(*[CYAN, PINK, YEL, MINT, VIOLET][q % 5]); cr.fill(); cr.restore()
                callout(cr, "ADIÓS DOLOR", W / 2, 620, 64, MINT, (0.2, 0.8, 0.6), lt, tok, dark=True)
    elif kind == "cierre":
        k = pop(lt / 0.5)
        cr.save(); cr.translate(W / 2, 720); cr.scale(k, k); cr.rotate(math.sin(lt * 2) * 0.04)
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
        text(cr, "DATO CÓSMICO 2", W / 2, 1060, 80, grad=(WHITE, (0.8, 0.85, 1.0)), alpha=ease((lt - 0.2) / 0.3))
        tb = 0.7
        if lt > tb:
            ev("pop", tb); kk = pop((lt - tb) / 0.35); pressed = 1.6 < lt < 1.8; subbed = lt > 1.7
            cr.save(); cr.translate(W / 2, 1200); s2 = kk * (0.92 if pressed else 1 + 0.035 * math.sin(lt * 8)); cr.scale(s2, s2)
            if subbed: pill(cr, 0, 0, 520, 120, (0.45, 0.45, 0.55), (0.32, 0.32, 0.42))
            else: pill(cr, 0, 0, 520, 120, (1.0, 0.22, 0.28), (0.85, 0.05, 0.18))
            text(cr, "SUSCRITO" if subbed else "SUSCRÍBETE", 0, 20, 54, WHITE); cr.restore()
            if pressed: ring_burst(cr, W / 2 + 120, 1220, (lt - 1.6) / 0.4, WHITE, 140, 8)
            hx = W / 2 + 120 + 300 * (1 - ease((lt - 1.0) / 0.6)); hy = 1220 + 300 * (1 - ease((lt - 1.0) / 0.6))
            cur = lambda c: (c.save(), c.translate(hx, hy), c.scale(1.7, 1.7), c.move_to(0, 0), c.line_to(0, 70), c.line_to(18, 55), c.line_to(32, 85), c.line_to(44, 79), c.line_to(30, 50), c.line_to(52, 50), c.close_path(), c.restore())
            shadow(cr, cur, 14, 0.5, dy=8); cur(cr); cr.set_source_rgb(1, 1, 1); cr.fill_preserve(); cr.set_source_rgb(*LINE); cr.set_line_width(4); cr.stroke()
            ev("click", 1.65, g=1.2); ev("ding", 1.75, g=0.6)

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
