"""Dynamic Short renderer. usage: render2.py script.json outdir [frames]"""
import cairo, json, math, os, random, subprocess, sys

W, H, FPS = 1080, 1920, 30
FONT = "Inter"
CYAN, PINK, YEL, WHITE = (0.30, 0.86, 1.0), (1.0, 0.33, 0.62), (1.0, 0.86, 0.22), (1, 1, 1)
RED, ICE, GREEN, ORANGE = (0.95, 0.20, 0.28), (0.70, 0.93, 1.0), (0.35, 1.0, 0.55), (1.0, 0.6, 0.15)
SKIN, LINE = (0.99, 0.80, 0.67), (0.22, 0.10, 0.18)
# per-scene background hues (top, bottom)
BGS = {"gancho": ((0.06, 0.07, 0.20), (0.30, 0.05, 0.25)), "nombre": ((0.04, 0.10, 0.22), (0.05, 0.25, 0.35)),
       "contrae": ((0.03, 0.12, 0.25), (0.10, 0.35, 0.55)), "dilata": ((0.20, 0.03, 0.08), (0.45, 0.06, 0.12)),
       "nervio": ((0.10, 0.05, 0.20), (0.35, 0.20, 0.05)), "truco": ((0.05, 0.15, 0.10), (0.35, 0.18, 0.05)),
       "cierre": ((0.06, 0.07, 0.20), (0.18, 0.05, 0.30))}

def cl(x): return max(0.0, min(1.0, x))
def ease(x): x = cl(x); return x * x * (3 - 2 * x)
def eout(x): x = cl(x); return 1 - (1 - x) ** 3
def pop(x):
    x = cl(x); c = 1.9; return max(0.01, 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2)
def spring(x, f=3.0, d=5.0):  # 0->1 with wobble
    if x <= 0: return 0.0
    return 1 - math.exp(-d * x) * math.cos(2 * math.pi * f * x)

def text(cr, s, x, y, size, color=WHITE, alpha=1, stroke=0, weight=cairo.FONT_WEIGHT_BOLD, font=FONT):
    cr.select_font_face(font, cairo.FONT_SLANT_NORMAL, weight); cr.set_font_size(size)
    e = cr.text_extents(s); cr.move_to(x - (e.width / 2 + e.x_bearing), y); cr.text_path(s)
    if stroke:
        cr.set_source_rgba(0.02, 0.0, 0.05, alpha); cr.set_line_width(stroke); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke_preserve()
    cr.set_source_rgba(*color, alpha); cr.fill(); return e

def circle(cr, x, y, r, col, a=1):
    cr.arc(x, y, r, 0, 2 * math.pi); cr.set_source_rgba(*col, a); cr.fill()

def glow(cr, x, y, r, col, a):
    g = cairo.RadialGradient(x, y, 0, x, y, r); g.add_color_stop_rgba(0, *col, a); g.add_color_stop_rgba(1, *col, 0)
    cr.set_source(g); cr.arc(x, y, r, 0, 2 * math.pi); cr.fill()

# ---------------- characters & props ----------------
def head(cr, cx, cy, s, mood="normal", t=0, nerve=None, squash=1.0):
    cr.save(); cr.translate(cx, cy); cr.scale(s * (2 - squash), s * squash)
    cr.move_to(-150, 250); cr.curve_to(-170, 120, -230, 40, -220, -80)
    cr.curve_to(-210, -230, -80, -300, 40, -290); cr.curve_to(170, -280, 220, -180, 215, -90)
    cr.curve_to(212, -50, 230, -30, 255, 10); cr.curve_to(270, 35, 250, 45, 232, 50)
    cr.curve_to(240, 70, 235, 85, 228, 95); cr.curve_to(238, 110, 230, 125, 222, 132)
    cr.curve_to(225, 160, 210, 190, 170, 200); cr.curve_to(120, 210, 60, 200, 40, 250); cr.close_path()
    cr.set_source_rgb(*SKIN); cr.fill_preserve(); cr.set_source_rgb(*LINE); cr.set_line_width(9); cr.stroke()
    # hair tuft
    cr.move_to(-200, -150); cr.curve_to(-160, -320, 120, -330, 190, -190); cr.curve_to(100, -250, 0, -240, -60, -200)
    cr.curve_to(-120, -170, -170, -120, -200, -150); cr.set_source_rgb(0.25, 0.14, 0.12); cr.fill()
    # ear
    cr.save(); cr.translate(-55, -15); cr.scale(0.7, 1); cr.arc(0, 0, 45, 0, 2 * math.pi); cr.restore()
    cr.set_source_rgb(0.96, 0.70, 0.58); cr.fill_preserve(); cr.set_source_rgb(*LINE); cr.set_line_width(6); cr.stroke()
    cr.set_line_width(5); cr.arc(-50, -15, 18, -1.2, 1.4); cr.stroke()
    if nerve: nerve(cr)
    cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_source_rgb(*LINE)
    ex, ey = 150, -70
    if mood == "pain":
        cr.set_line_width(10); cr.move_to(ex - 26, ey - 18); cr.line_to(ex + 8, ey); cr.line_to(ex - 26, ey + 18); cr.stroke()
        cr.set_line_width(11); cr.move_to(ex - 40, ey - 70); cr.line_to(ex + 25, ey - 42); cr.stroke()          # angry brow
        cr.move_to(195, 112); cr.curve_to(205, 98, 222, 100, 230, 110); cr.stroke()                              # grimace
        for k in range(2):  # sweat drops
            ph = (t * 1.3 + k * 0.5) % 1; dx, dy = 40 + k * 70, -170 + ph * 90
            cr.move_to(dx, dy - 22); cr.curve_to(dx + 16, dy, dx + 14, dy + 14, dx, dy + 14); cr.curve_to(dx - 14, dy + 14, dx - 16, dy, dx, dy - 22)
            cr.set_source_rgba(0.55, 0.85, 1, 1 - ph); cr.fill(); cr.set_source_rgb(*LINE)
    elif mood == "happy":
        cr.set_line_width(10); cr.arc(ex - 5, ey + 10, 20, math.pi * 1.1, math.pi * 1.9); cr.stroke()
        cr.set_line_width(9); cr.move_to(ex - 40, ey - 55); cr.curve_to(ex - 15, ey - 70, ex + 10, ey - 68, ex + 25, ey - 55); cr.stroke()
        cr.arc(205, 95, 26, 0.1 * math.pi, 0.8 * math.pi); cr.stroke()
        circle(cr, 120, 10, 26, (1, 0.5, 0.55), 0.45)
    elif mood == "confused":
        circle(cr, ex, ey, 16, LINE); cr.set_source_rgb(*LINE); cr.set_line_width(9)
        cr.move_to(ex - 40, ey - 50 + 8 * math.sin(t * 6)); cr.line_to(ex + 25, ey - 62); cr.stroke()
        cr.move_to(198, 112); cr.line_to(228, 106); cr.stroke()
    else:  # normal / eating, blink
        if (t % 3.1) < 0.12: cr.set_line_width(9); cr.move_to(ex - 18, ey); cr.line_to(ex + 18, ey); cr.stroke()
        else: circle(cr, ex, ey, 17, LINE); circle(cr, ex + 6, ey - 6, 6, WHITE)
        cr.set_source_rgb(*LINE); cr.set_line_width(9); cr.move_to(ex - 40, ey - 55); cr.line_to(ex + 25, ey - 60); cr.stroke()
        cr.arc(212, 108, 18, 0.0, math.pi * 0.9); cr.stroke()
    cr.restore()

def cone(cr, cx, cy, s, rot=0, bite=0):
    cr.save(); cr.translate(cx, cy); cr.rotate(rot); cr.scale(s, s)
    cr.move_to(-72, 0); cr.line_to(0, 200); cr.line_to(72, 0); cr.close_path()
    cr.set_source_rgb(0.90, 0.62, 0.30); cr.fill_preserve(); cr.set_source_rgb(0.45, 0.26, 0.10); cr.set_line_width(6); cr.stroke()
    cr.set_line_width(4)
    for i in range(-3, 4):
        cr.move_to(i * 24, 0); cr.line_to(i * 24 * 0.2 + 30, 140); cr.stroke(); cr.move_to(i * 24, 0); cr.line_to(i * 24 * 0.2 - 30, 140); cr.stroke()
    for (x, y, r, c) in [(-38, -22, 52, (1, 0.6, 0.78)), (38, -22, 52, (0.6, 0.95, 0.8)), (0, -80, 58 - bite * 12, (1, 0.96, 0.86))]:
        cr.arc(x, y, r, 0, 2 * math.pi); cr.set_source_rgb(*c); cr.fill_preserve(); cr.set_source_rgba(0, 0, 0, 0.2); cr.set_line_width(5); cr.stroke()
    circle(cr, -20, -100, 12, WHITE, 0.6)
    cr.restore()

def bolt(cr, x, y, s, a, rot=0):
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.scale(s, s)
    pts = [(0, -60), (-25, 5), (-2, 5), (-15, 60), (30, -10), (6, -10), (20, -60)]
    cr.move_to(*pts[0]); [cr.line_to(*p) for p in pts[1:]]; cr.close_path()
    cr.set_source_rgba(*YEL, a); cr.fill_preserve(); cr.set_source_rgba(0.35, 0.15, 0, a); cr.set_line_width(5); cr.stroke(); cr.restore()

def snowflake(cr, x, y, r, a, rot):
    cr.save(); cr.translate(x, y); cr.rotate(rot); cr.set_source_rgba(*ICE, a); cr.set_line_width(max(3, r / 9)); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(6):
        cr.save(); cr.rotate(k * math.pi / 3); cr.move_to(0, 0); cr.line_to(0, -r)
        cr.move_to(0, -r * .6); cr.line_to(-r * .25, -r * .82); cr.move_to(0, -r * .6); cr.line_to(r * .25, -r * .82); cr.stroke(); cr.restore()
    cr.restore()

def thermo(cr, x, y, level, col):
    cr.save(); cr.translate(x, y)
    cr.set_source_rgb(1, 1, 1); cr.rectangle(-22, -200, 44, 200); cr.fill(); circle(cr, 0, 20, 40, WHITE)
    cr.set_source_rgb(*col); cr.rectangle(-12, -10 - 180 * level, 24, 180 * level + 20); cr.fill(); circle(cr, 0, 20, 30, col)
    cr.set_source_rgb(*LINE); cr.set_line_width(5)
    for k in range(5): cr.move_to(-22, -30 - k * 38); cr.line_to(-8, -30 - k * 38); cr.stroke()
    cr.restore()

def brain(cr, x, y, s, frost=0, t=0, wob=0):
    cr.save(); cr.translate(x, y); cr.scale(s * (1 + 0.04 * math.sin(t * 8) * wob), s * (1 - 0.04 * math.sin(t * 8) * wob))
    cols = (1 - 0.45 * frost, 0.55 + 0.35 * frost, 0.70 + 0.3 * frost)
    for (bx, by, r) in [(-90, -30, 95), (0, -70, 100), (95, -30, 95), (-60, 50, 85), (60, 50, 85), (0, 20, 90)]:
        circle(cr, bx, by, r, cols)
    cr.set_source_rgba(*LINE, 0.55); cr.set_line_width(8); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for (a, b, c, d2) in [(-150, -40, -60, -100), (-40, -120, 40, -30), (60, -110, 150, -50), (-140, 60, -40, 20), (30, 30, 140, 70), (0, -150, 0, 110)]:
        cr.move_to(a, b); cr.curve_to((a + c) / 2, b - 40, (a + c) / 2, d2 + 40, c, d2); cr.stroke()
    if frost > 0:
        for k in range(7):
            snowflake(cr, -150 + k * 50, -150 + (k % 3) * 120, 22, frost, t + k)
    cr.restore()

def vessel(cr, t, cy, width, speed, cold, beat=0):
    x0, x1 = -40, W + 40
    w = width * (1 + 0.12 * beat)
    cr.set_source_rgba(1, 0.5, 0.55, 0.25); cr.rectangle(x0, cy - w / 2 - 26, x1 - x0, w + 52); cr.fill()
    g = cairo.LinearGradient(0, cy - w / 2, 0, cy + w / 2); g.add_color_stop_rgb(0, 0.75, 0.08, 0.18); g.add_color_stop_rgb(0.5, 0.5, 0.03, 0.10); g.add_color_stop_rgb(1, 0.75, 0.08, 0.18)
    cr.set_source(g); cr.rectangle(x0, cy - w / 2, x1 - x0, w); cr.fill()
    cr.set_source_rgba(*ICE, cl(cold)); cr.set_line_width(14)
    for yy in (cy - w / 2 - 18, cy + w / 2 + 18): cr.move_to(x0, yy); cr.line_to(x1, yy); cr.stroke()
    rnd = random.Random(3)
    for i in range(34):
        off, ry = rnd.uniform(0, 1200), rnd.uniform(-0.36, 0.36)
        x = x0 + (off + t * speed) % (x1 - x0); y = cy + ry * w; r = max(10, min(30, w * 0.15))
        cr.save(); cr.translate(x, y); cr.rotate(rnd.uniform(0, 3)); cr.scale(1, 0.6); cr.arc(0, 0, r, 0, 2 * math.pi); cr.restore()
        cr.set_source_rgb(*RED); cr.fill_preserve(); cr.set_source_rgba(0.5, 0, 0.05, 0.6); cr.set_line_width(3); cr.stroke()

# ---------------- scenes ----------------
class S:  # scene context
    def __init__(s, sc, tm): s.sc, s.tm, s.dur = sc, tm, tm["dur"]
    def w(s, sub, nth=0):  # time when word containing `sub` starts
        hits = [x["t"] for x in s.tm["words"] if sub.lower() in x["w"].lower()]
        return hits[min(nth, len(hits) - 1)] if hits else 0
    def f(s, k):  # time phrase k starts
        hits = [x["t"] for x in s.tm["words"] if x["frase"] == k]; return hits[0] if hits else 0

def draw_scene(cr, kind, lt, z, ev):
    """z: scene ctx. ev(name, t, sfx) registers an sfx (only collected once)."""
    if kind == "gancho":
        tz = z.w("zas"); hit = lt >= tz
        mood = "pain" if hit else "normal"
        sh = math.exp(-(lt - tz) * 6) if hit else 0
        hx = 420 + (math.sin(lt * 60) * 18 * sh)
        head(cr, hx, 1000, 1.3, mood, lt, squash=1 - 0.08 * sh)
        # cone flies in, then bobs toward mouth
        ci = eout(lt / 0.5); bob = math.sin(lt * 7) * 18 if not hit else 0
        cone(cr, 1400 - 520 * ci + bob, 1060 - 40 * ci, 1.05, -0.55 + 0.3 * (1 - ci), bite=min(1, lt / tz) if tz else 0)
        ev("whoosh", 0.0)
        if hit:
            ev("impact", tz); ev("crack", tz + 0.05)
            a = math.exp(-(lt - tz) * 4)
            cr.set_source_rgba(1, 0.2, 0.3, 0.45 * a); cr.paint()
            glow(cr, 560, 720, 300 + 40 * math.sin(lt * 9), RED, 0.7)
            for k in range(5):
                ang = -2.6 + k * 0.45; r = 300 + 120 * eout((lt - tz) / 0.4)
                bolt(cr, 560 + math.cos(ang) * r, 760 + math.sin(ang) * r, 1.1 + 0.15 * math.sin(lt * 12 + k), 1, ang + 1.57)
            # ice crack lines across screen
            cr.set_source_rgba(*ICE, 0.85 * cl(1.6 - (lt - tz))); cr.set_line_width(5); rnd = random.Random(5)
            for k in range(6):
                x, y = 560, 720; cr.move_to(x, y); ang = k * 1.05 + 0.3
                for j in range(5): x += math.cos(ang) * 70; y += math.sin(ang) * 70; ang += rnd.uniform(-0.6, 0.6); cr.line_to(x, y)
                cr.stroke()
        tq = z.f(3)
        if lt > tq:  # retention badge
            ev("pop", tq); k = pop((lt - tq) / 0.35)
            cr.save(); cr.translate(W / 2, 470); cr.rotate(-0.05 + 0.02 * math.sin(lt * 5)); cr.scale(k, k)
            cr.set_source_rgb(*YEL); rr(cr, -330, -70, 660, 115, 26); cr.fill()
            text(cr, "TRUCO AL FINAL", 0, 15, 64, (0.1, 0.05, 0.1)); cr.restore()
            by = 590 + 18 * math.sin(lt * 9); cr.set_source_rgb(*YEL); cr.move_to(W / 2 - 40, by); cr.line_to(W / 2 + 40, by); cr.line_to(W / 2, by + 50); cr.close_path(); cr.fill()
        elif lt < tz:
            k = pop(lt / 0.35); cr.save(); cr.translate(W / 2, 470); cr.scale(k, k)
            text(cr, "¿TE HA PASADO?", 0, 0, 92, WHITE, stroke=16); cr.restore()
    elif kind == "nombre":
        word = "GANGLIONEURALGIA"; word2 = "ESFENOPALATINA"
        t1 = z.f(1); t2 = z.f(2)
        brain(cr, W / 2, 1060, 1.25, frost=ease((lt - t2) / 0.6), t=lt, wob=1 if lt < t2 else 0.3)
        letters = word + word2
        for idx, ch in enumerate(letters):
            ts = t1 + idx * 0.055
            if lt < ts: continue
            line = 0 if idx < len(word) else 1; pos = idx if line == 0 else idx - len(word); L = len(word) if line == 0 else len(word2)
            wd = word if line == 0 else word2
            cr.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD); cr.set_font_size(84)
            full = cr.text_extents(wd).x_advance; pre = cr.text_extents(wd[:pos]).x_advance; me = cr.text_extents(ch).x_advance
            x = W / 2 - full / 2 + pre + me / 2; y = 560 + line * 105
            k = pop((lt - ts) / 0.25); dy = (1 - ease((lt - ts) / 0.25)) * -60
            crossed = lt > t2
            cr.save(); cr.translate(x, y + dy + (math.sin(lt * 8 + idx) * 4 if not crossed else 0)); cr.scale(k, k)
            text(cr, ch, 0, 0, 84, CYAN if not crossed else (0.5, 0.6, 0.7), stroke=10, alpha=1 if not crossed else 0.6); cr.restore()
            if idx % 4 == 0: ev("click", ts, g=0.5)
        if lt > t2:
            ev("impact", t2, g=0.5); k = spring((lt - t2) / 0.6, 2.5, 6)
            cr.set_source_rgba(*RED, 0.9); cr.set_line_width(12)
            cr.move_to(110, 545); cr.line_to(110 + 860 * eout((lt - t2) / 0.25), 640); cr.stroke()
            tc = z.w("congelamiento")
            if lt > tc:
                ev("ding", tc); k = pop((lt - tc) / 0.4)
                cr.save(); cr.translate(W / 2, 800); cr.rotate(-0.06); cr.scale(k, k)
                cr.set_source_rgb(*PINK); rr(cr, -440, -80, 880, 125, 24); cr.fill()
                text(cr, "CONGELAMIENTO CEREBRAL", 0, 18, 62, WHITE); cr.restore()
    elif kind == "contrae":
        te = z.w("encogen"); k = ease((lt - te) / 0.6)
        # palate zoom badge
        thermo(cr, 920, 800, 0.8 - 0.65 * ease((lt - z.w("enfría")) / 1.0), CYAN)
        ev("whoosh", z.w("enfría"), g=0.6)
        vessel(cr, lt, 1010, 300 - 200 * k + 10 * math.sin(lt * 20) * k, 260 - 180 * k, ease((lt - z.w("enfría")) / 0.8))
        rnd = random.Random(2)
        for i in range(16):
            x = rnd.uniform(40, W - 40); y0 = rnd.uniform(0, 1); sp = rnd.uniform(80, 200)
            yy = 560 + ((y0 * 900 + lt * sp) % 900)
            snowflake(cr, x, yy, rnd.uniform(18, 40), 0.25 + 0.6 * k, lt * rnd.choice([-1, 1]))
        if lt > te:
            ev("crack", te); ev("pop", te + 0.2)
            for side in (-1, 1):  # squeeze arrows
                cr.save(); cr.translate(W / 2, 1010 + side * (200 - 60 * k)); cr.scale(1, side)
                cr.set_source_rgba(*YEL, k); cr.move_to(-50, -60); cr.line_to(50, -60); cr.line_to(0, 0); cr.close_path(); cr.fill(); cr.restore()
            text(cr, "¡SE ENCOGEN!", W / 2, 1280, 72, ICE, stroke=12, alpha=k)
    elif kind == "dilata":
        tb = z.f(1); tc = z.w("chorro")
        k = ease((lt - tb) / 0.5)
        beat = max(0.0, math.sin(lt * 2 * math.pi * 1.8)) ** 6 if lt > z.f(0) else 0
        vessel(cr, lt, 1000, 100 + 260 * k, 120 + 900 * ease((lt - tc) / 0.3), 1 - k, beat)
        if lt > 0.1: ev("heartbeat", 0.15, g=0.8)
        ev("heartbeat", tb, g=0.9)
        if lt < tb:  # alarm
            a = 0.5 + 0.5 * math.sin(lt * 18)
            glow(cr, W / 2, 650, 300, RED, 0.6 * a)
            cr.set_source_rgb(0.3, 0.3, 0.35); rr(cr, W / 2 - 110, 700, 220, 50, 12); cr.fill()
            cr.arc(W / 2, 700, 95, math.pi, 2 * math.pi); cr.close_path(); cr.set_source_rgb(1, 0.15 + 0.25 * a, 0.2); cr.fill()
            circle(cr, W / 2 - 30, 650, 22, WHITE, 0.6)
            cr.set_source_rgba(*YEL, a); cr.set_line_width(12); cr.set_line_cap(cairo.LINE_CAP_ROUND)
            for ang in (-2.6, -2.0, -1.57, -1.14, -0.54): cr.move_to(W / 2 + math.cos(ang) * 130, 680 + math.sin(ang) * 130); cr.line_to(W / 2 + math.cos(ang) * 180, 680 + math.sin(ang) * 180); cr.stroke()
        for side in (-1, 1):
            cr.save(); cr.translate(W / 2, 1000 + side * (60 + 160 * k)); cr.scale(1, side)
            cr.set_source_rgba(*GREEN, k); cr.move_to(-50, 0); cr.line_to(50, 0); cr.line_to(0, -60 * k); cr.close_path(); cr.fill(); cr.restore()
        if lt > tc:
            ev("whoosh", tc); ev("impact", tc + 0.1, g=0.4)
            for i in range(10):  # speed lines
                ph = (lt * 2.5 + i / 10) % 1; y = 560 + i * 85
                cr.set_source_rgba(1, 1, 1, 0.7 * (1 - ph)); cr.set_line_width(7); cr.move_to(W * ph - 120, y); cr.line_to(W * ph + 80, y); cr.stroke()
            k2 = pop((lt - tc) / 0.35); cr.save(); cr.translate(W / 2, 1330); cr.rotate(0.04); cr.scale(k2, k2)
            text(cr, "¡FIUUUM!", 0, 0, 96, YEL, stroke=14); cr.restore()
    elif kind == "nervio":
        tn = z.w("trigémino"); tcf = z.f(2); tf = z.f(3)
        path = [(745, 1185), (650, 1150), (585, 1060), (590, 950), (650, 870), (725, 815)]
        def nerve(c):
            pass
        mood = "normal" if lt < tcf else ("confused" if lt < tf else "pain")
        head(cr, 430, 1050, 1.4, mood, lt)
        # nerve drawn over head (in screen space)
        a = ease((lt - tn + 0.3) / 0.5)
        cr.set_source_rgba(*YEL, 0.55 * a); cr.set_line_width(16); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)
        cr.move_to(*path[0]); [cr.line_to(*p) for p in path[1:]]; cr.stroke()
        if lt > tn:
            ev("zap", tn)
            for q in range(2):
                ph = ((lt - tn) * 1.2 + q * 0.5) % 1; seg = ph * (len(path) - 1); i = int(seg); fr = seg - i
                px = path[i][0] + (path[i + 1][0] - path[i][0]) * fr; py = path[i][1] + (path[i + 1][1] - path[i][1]) * fr
                glow(cr, px, py, 90, YEL, 1); circle(cr, px, py, 16, WHITE)
                rnd = random.Random(int(lt * 20) + q)
                cr.set_source_rgba(*YEL, 0.9); cr.set_line_width(4)
                for _ in range(4):
                    cr.move_to(px, py); cr.rel_line_to(rnd.uniform(-50, 50), rnd.uniform(-50, 50)); cr.stroke()
        if tcf <= lt < tf:
            for q in range(3):
                ang = lt * 3 + q * 2.1
                text(cr, "?", 520 + math.cos(ang) * 220, 600 + math.sin(ang) * 70, 110, YEL, stroke=10)
            ev("pop", tcf); ev("pop", tcf + 0.15); ev("pop", tcf + 0.3)
        if lt > tf:
            ev("impact", tf); p = 1 + 0.15 * math.sin(lt * 14)
            glow(cr, 725, 800, 230 * p, RED, 0.85)
            k = pop((lt - tf) / 0.35); cr.save(); cr.translate(860, 640); cr.rotate(0.18 + 0.05 * math.sin(lt * 20)); cr.scale(k, k)
            text(cr, "¡AY!", 0, 0, 140, YEL, stroke=16); cr.restore()
    elif kind == "truco":
        tl = z.f(1); tt = z.f(2); tok = z.f(3)
        if lt < tt + 0.2:
            cx, cy = W / 2, 1000
            cr.set_source_rgb(1, 0.62, 0.7); cr.set_line_width(60); cr.set_line_cap(cairo.LINE_CAP_ROUND)
            cr.arc(cx, cy + 150, 330, math.pi * 1.1, math.pi * 1.9); cr.stroke()
            text(cr, "PALADAR", cx, cy - 230, 44, (1, 0.8, 0.85), stroke=8)
            up = spring((lt - tl) / 0.8, 1.5, 5) * 130
            cr.save(); cr.translate(cx, cy + 330 - up); cr.scale(1, 0.55); cr.arc(0, 0, 250, math.pi, 2 * math.pi); cr.restore()
            cr.set_source_rgb(0.93, 0.35, 0.47); cr.fill()
            cr.set_source_rgba(0.6, 0.15, 0.25, 0.6); cr.set_line_width(6); cr.move_to(cx, cy + 330 - up - 120); cr.line_to(cx, cy + 330 - up - 30); cr.stroke()
            text(cr, "LENGUA", cx, cy + 300 - up, 44, WHITE, stroke=8)
            if lt > tl + 0.5:
                a = ease((lt - tl - 0.5) / 0.6)
                glow(cr, cx, cy - 60, 360, ORANGE, 0.6 * a)
                for q in range(6):
                    ph = (lt * 0.9 + q / 6) % 1
                    cr.set_source_rgba(1, 0.75, 0.3, a * (1 - ph)); cr.set_line_width(8)
                    x = cx - 250 + q * 100; cr.move_to(x, cy - 120 - ph * 200)
                    cr.curve_to(x + 25, cy - 150 - ph * 200, x - 25, cy - 180 - ph * 200, x, cy - 210 - ph * 200); cr.stroke()
            ev("whoosh", tl, g=0.6)
        else:
            # cup slides in, then happy head
            k = eout((lt - tt) / 0.4)
            if lt < tok:
                cup(cr, W / 2 + (1 - k) * 700, 1030, 1.5, lt); ev("whoosh", tt)
            else:
                head(cr, 470, 1050, 1.3, "happy", lt, squash=1 + 0.05 * math.sin((lt - tok) * 12) * math.exp(-(lt - tok) * 3))
                cup(cr, 870, 1150, 0.8, lt)
                ev("ding", tok)
                for q in range(12):  # confetti
                    rnd = random.Random(q); ph = (lt - tok) * rnd.uniform(0.6, 1.2)
                    x = rnd.uniform(100, W - 100); y = 500 + ph * 700 + 30 * math.sin(lt * 5 + q)
                    cr.save(); cr.translate(x, y); cr.rotate(lt * 4 + q); cr.set_source_rgb(*[CYAN, PINK, YEL, GREEN][q % 4]); cr.rectangle(-12, -6, 24, 12); cr.fill(); cr.restore()
                k2 = pop((lt - tok) / 0.35); cr.save(); cr.translate(W / 2, 600); cr.scale(k2, k2)
                cr.set_source_rgb(*GREEN); rr(cr, -310, -75, 620, 115, 28); cr.fill()
                text(cr, "✓ ADIÓS DOLOR", 0, 15, 66, (0.03, 0.15, 0.08)); cr.restore()
    elif kind == "cierre":
        k = pop(lt / 0.5)
        cr.save(); cr.translate(W / 2, 720); cr.scale(k, k); cr.rotate(math.sin(lt * 2) * 0.05)
        glow(cr, 0, 0, 380, CYAN, 0.35); circle(cr, 0, 0, 220, (0.10, 0.12, 0.30))
        cr.set_source_rgb(*CYAN); cr.set_line_width(12); cr.arc(0, 0, 220, 0, 2 * math.pi); cr.stroke()
        cr.save(); cr.rotate(-0.3); cr.scale(1, 0.32); cr.set_source_rgba(*PINK, 1); cr.set_line_width(14); cr.arc(0, 0, 320, 0, 2 * math.pi); cr.stroke(); cr.restore()
        ang = lt * 3; px, py = 320 * math.cos(ang), 102 * math.sin(ang); c, s_ = math.cos(-0.3), math.sin(-0.3)
        circle(cr, px * c - py * s_, px * s_ + py * c, 26, YEL)
        text(cr, "?", 0, 70, 230, WHITE, stroke=12); cr.restore()
        text(cr, "DATO CÓSMICO 2", W / 2, 1030, 84, WHITE, stroke=14, alpha=ease((lt - 0.2) / 0.3))
        tb = 0.7
        if lt > tb:
            ev("pop", tb); kk = pop((lt - tb) / 0.35)
            pressed = 1.6 < lt < 1.8
            cr.save(); cr.translate(W / 2, 1180); s2 = kk * (0.92 if pressed else 1 + 0.04 * math.sin(lt * 8)); cr.scale(s2, s2)
            subbed = lt > 1.7
            cr.set_source_rgb(*((0.35, 0.35, 0.4) if subbed else (0.92, 0.1, 0.15))); rr(cr, -270, -70, 540, 115, 57); cr.fill()
            text(cr, "SUSCRITO ✓" if subbed else "SUSCRÍBETE", 0, 15, 60, WHITE); cr.restore()
            # hand cursor
            hx = W / 2 + 120 + 300 * (1 - ease((lt - 1.0) / 0.6)); hy = 1210 + 300 * (1 - ease((lt - 1.0) / 0.6))
            cr.save(); cr.translate(hx, hy); cr.scale(1.6, 1.6); cr.move_to(0, 0); cr.line_to(0, 70); cr.line_to(18, 55); cr.line_to(32, 85); cr.line_to(44, 79); cr.line_to(30, 50); cr.line_to(52, 50); cr.close_path()
            cr.set_source_rgb(*WHITE); cr.fill_preserve(); cr.set_source_rgb(*LINE); cr.set_line_width(4); cr.stroke(); cr.restore()
            ev("click", 1.65, g=1.2); ev("ding", 1.75, g=0.6)

def cup(cr, x, y, s, t):
    cr.save(); cr.translate(x, y); cr.scale(s, s)
    cr.set_source_rgb(1, 1, 1); rr(cr, -90, -100, 180, 200, 20); cr.fill()
    cr.set_line_width(22); cr.arc(95, 0, 45, -math.pi / 2, math.pi / 2); cr.stroke()
    cr.set_source_rgb(*PINK); cr.rectangle(-90, -40, 180, 34); cr.fill()
    cr.set_source_rgba(1, 1, 1, 0.75); cr.set_line_width(9); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for k in range(3):
        cr.move_to(-45 + k * 45, -120)
        for j in range(1, 8): cr.line_to(-45 + k * 45 + 15 * math.sin(t * 5 + j + k), -120 - j * 20)
        cr.stroke()
    cr.restore()

def rr(cr, x, y, w, h, r):
    cr.new_sub_path(); cr.arc(x + w - r, y + r, r, -math.pi / 2, 0); cr.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    cr.arc(x + r, y + h - r, r, math.pi / 2, math.pi); cr.arc(x + r, y + r, r, math.pi, 1.5 * math.pi); cr.close_path()

# ---------------- overlays ----------------
def background(cr, kind, t, gt):
    top, bot = BGS[kind]; g = cairo.LinearGradient(0, 0, W * 0.3, H); g.add_color_stop_rgb(0, *top); g.add_color_stop_rgb(1, *bot)
    cr.set_source(g); cr.paint()
    # rotating soft rays
    cr.save(); cr.translate(W / 2, 900); cr.rotate(gt * 0.15)
    for k in range(12):
        cr.move_to(0, 0); cr.arc(0, 0, 1600, k * math.pi / 6, k * math.pi / 6 + 0.18); cr.close_path()
        cr.set_source_rgba(1, 1, 1, 0.025); cr.fill()
    cr.restore()
    rnd = random.Random(7)
    for _ in range(60):
        x, y, r, sp = rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(1.5, 4), rnd.uniform(15, 60)
        circle(cr, x, (y - gt * sp) % H, r, WHITE, 0.12 + 0.2 * (0.5 + 0.5 * math.sin(gt * 2 + x)))

def captions(cr, z, lt, hl):
    words = z.tm["words"]
    cur = max([i for i, x in enumerate(words) if x["t"] <= lt] or [0])
    # chunk: up to 3 words within same phrase
    fr = words[cur]["frase"]; same = [i for i, x in enumerate(words) if x["frase"] == fr]
    pos = same.index(cur); c0 = same[(pos // 3) * 3]; chunk = [i for i in same if c0 <= i < c0 + 3]
    size = 92; cr.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD)
    up = [words[i]["w"].upper() for i in chunk]
    while True:
        cr.set_font_size(size); ws = [cr.text_extents(u).x_advance for u in up]
        if max(ws) <= 900 or size < 50: break
        size -= 6
    sp = 28; rows, cur_row, cw = [], [], 0
    for j, wv in enumerate(ws):
        if cur_row and cw + sp + wv > 900: rows.append(cur_row); cur_row, cw = [], 0
        cw = cw + (sp if cur_row else 0) + wv; cur_row.append(j)
    rows.append(cur_row)
    y0 = 1460 - (len(rows) - 1) * 55
    for r, row in enumerate(rows):
        tw = sum(ws[j] for j in row) + sp * (len(row) - 1); x = W / 2 - tw / 2
        for j in row:
            i = chunk[j]; active = i == cur; key = any(h in words[i]["w"].lower() for h in hl)
            k = (0.82 + 0.18 * pop((lt - words[i]["t"]) / 0.15)) if active else 1
            col = (PINK if key else YEL) if active else (CYAN if key and i < cur else WHITE)
            cr.save(); cr.translate(x + ws[j] / 2, y0 + r * 110); cr.rotate((-0.03 if active else 0)); cr.scale(k, k)
            text(cr, up[j], 0, 0, size, col, stroke=18); cr.restore(); x += ws[j] + sp

def title_tag(cr, s, lt):
    if not s: return
    k = pop(lt / 0.35); cr.save(); cr.translate(W / 2, 300); cr.scale(k, k)
    cr.select_font_face(FONT, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_BOLD); cr.set_font_size(56); e = cr.text_extents(s)
    cr.set_source_rgba(0, 0, 0, 0.45); rr(cr, -e.width / 2 - 36, -62, e.width + 72, 92, 46); cr.fill()
    text(cr, s, 0, 0, 56, YEL); cr.restore()

# ---------------- main ----------------
def frame(cr, i, z, lt, gt, total, hl, ev):
    kind = z.sc["tipo"]
    background(cr, kind, lt, gt)
    # camera: punch-in at scene start + slow push + shake
    punch = 1 + 0.22 * (1 - eout(lt / 0.32)) if i > 0 else 1 + 0.1 * (1 - eout(lt / 0.4))
    zoom = punch * (1 + 0.035 * lt / max(1, z.dur))
    shk = sum(math.exp(-(lt - e["lt"]) * 7) * 22 for e in z.shakes if 0 <= lt - e["lt"] < 0.8)
    cr.save(); cr.translate(W / 2 + math.sin(gt * 71) * shk, 960 + math.cos(gt * 53) * shk); cr.scale(zoom, zoom); cr.translate(-W / 2, -960)
    draw_scene(cr, kind, lt, z, ev)
    cr.restore()
    # flash on cut
    if i > 0 and lt < 0.12: cr.set_source_rgba(1, 1, 1, 0.5 * (1 - lt / 0.12)); cr.paint()
    title_tag(cr, z.sc.get("titulo", ""), lt)
    text(cr, "DATO CÓSMICO 2", W / 2, 150, 40, CYAN)
    captions(cr, z, lt, hl)
    cr.set_source_rgba(1, 1, 1, 0.15); cr.rectangle(0, 0, W, 12); cr.fill()
    cr.set_source_rgb(*PINK); cr.rectangle(0, 0, W * gt / total, 12); cr.fill()

def main():
    js, out = sys.argv[1], sys.argv[2]; mode = sys.argv[3] if len(sys.argv) > 3 else ""
    d = json.load(open(js)); T = json.load(open(f"{out}/timings.json")); hl = d.get("resaltar", [])
    scenes = [S(sc, tm) for sc, tm in zip(d["escenas"], T)]
    offs = [sum(t["dur"] for t in T[:i]) for i in range(len(T))]; total = sum(t["dur"] for t in T)
    SH = {"impact", "heartbeat", "crack"}
    events = {}
    for i, z in enumerate(scenes):
        # pre-pass to collect sfx so shakes are known
        coll = {}
        def ev(name, t, g=1.0, coll=coll): coll.setdefault((name, round(t, 3)), g)
        surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, 8, 8); cr = cairo.Context(surf)
        z.shakes = []
        for f in range(int(z.dur * FPS)): draw_scene(cr, z.sc["tipo"], f / FPS, z, ev)
        z.shakes = [{"lt": t} for (n, t) in coll if n in SH]
        for (n, t), g in coll.items(): events[(n, round(offs[i] + t, 3))] = g
        if i > 0: events[("whoosh", round(offs[i] - 0.18, 3))] = 0.7
    json.dump([{"s": n, "t": t, "g": g} for (n, t), g in sorted(events.items(), key=lambda x: x[0][1])], open(f"{out}/events.json", "w"), indent=0)
    noop = lambda *a, **k: None
    if mode == "frames":
        pick = [float(x) for x in sys.argv[4].split(",")]
        for gt in pick:
            i = max(j for j in range(len(offs)) if offs[j] <= gt); lt = gt - offs[i]
            surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); cr = cairo.Context(surf)
            frame(cr, i, scenes[i], lt, gt, total, hl, noop); surf.write_to_png(f"{out}/fr_{gt:05.1f}.png")
        return
    for i, z in enumerate(scenes):
        n = int(round(z.dur * FPS)); tmp = f"{out}/s{i}.tmp.mp4"
        p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "bgra", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                              "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p", tmp], stdin=subprocess.PIPE)
        surf = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H)
        for f in range(n):
            cr = cairo.Context(surf); lt = f / FPS; frame(cr, i, z, lt, offs[i] + lt, total, hl, noop); surf.flush(); p.stdin.write(surf.get_data())
        p.stdin.close()
        if p.wait() != 0: sys.exit(f"scene {i} failed")
        os.replace(tmp, f"{out}/s{i}.mp4")
    open(f"{out}/list.txt", "w").write("".join(f"file 's{i}.mp4'\n" for i in range(len(scenes))))
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", f"{out}/list.txt", "-c", "copy", f"{out}/video.mp4"], check=True)
    print("video ok", round(total, 2))

if __name__ == "__main__":
    main()
