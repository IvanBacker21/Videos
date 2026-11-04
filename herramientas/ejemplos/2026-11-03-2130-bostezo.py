"""Short: ¿Por qué bostezar es contagioso?  Uso (desde herramientas/):
python3 ejemplos/2026-11-03-2130-bostezo.py ejemplos/2026-11-03-2130-bostezo.json OUT [frames t1,t2]
Reutiliza render3 (fondo, cámara, subtítulos, cierre) y solo define las escenas nuevas."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import cairo
import render3 as R
from estilo import *
from render3 import callout, ICE

R.BGS.update({
    "gancho": ((0.10, 0.05, 0.24), (0.30, 0.08, 0.32), (VIOLET, PINK, CYAN)),
    "contagio": ((0.05, 0.08, 0.22), (0.10, 0.22, 0.38), (CYAN, MINT, VIOLET)),
    "enfriar": ((0.03, 0.09, 0.22), (0.05, 0.25, 0.42), (CYAN, (0.4, 0.6, 1.0), MINT)),
    "amigos": ((0.18, 0.05, 0.16), (0.36, 0.10, 0.22), (PINK, ORANGE, VIOLET)),
    "perro": ((0.10, 0.08, 0.04), (0.32, 0.18, 0.06), (ORANGE, YEL, PINK)),
    "remate": ((0.10, 0.05, 0.24), (0.28, 0.06, 0.30), (VIOLET, PINK, YEL)),
})

def face(cr, cx, cy, r, col, yawn=0.0, t=0.0, grey=False, blush=True):
    """Carita redonda de frente; yawn 0..1 abre la boca y cierra los ojos."""
    base = mix(col, (0.55, 0.55, 0.6), 0.75) if grey else col
    d = lambda c: c.arc(cx, cy, r, 0, 2 * math.pi)
    volume(cr, d, base, (cx - r, cy - r, cx + r, cy + r), light=0.3, shade=0.3, sh_blur=r * 0.35)
    if blush and not grey:
        for s in (-1, 1): radial_glow(cr, cx + s * r * 0.52, cy + r * 0.18, r * 0.25, (1, 0.4, 0.5), 0.45)
    ink = (0.12, 0.06, 0.12)
    cr.set_source_rgb(*ink); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for s in (-1, 1):
        ex, ey = cx + s * r * 0.36, cy - r * 0.18
        if yawn > 0.45:  # ojos cerrados tipo ^ ^ invertido
            cr.set_line_width(r * 0.07); cr.arc(ex, ey - r * 0.02, r * 0.13, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
            if yawn > 0.8 and s == 1:  # lagrimita
                g = cairo.LinearGradient(0, ey, 0, ey + r * 0.3); g.add_color_stop_rgba(0, 0.8, 0.95, 1, 0.95); g.add_color_stop_rgba(1, 0.4, 0.75, 1, 0.95)
                cr.move_to(ex + r * 0.16, ey + r * 0.04); cr.curve_to(ex + r * 0.26, ey + r * 0.2, ex + r * 0.22, ey + r * 0.28, ex + r * 0.15, ey + r * 0.28)
                cr.curve_to(ex + r * 0.08, ey + r * 0.28, ex + r * 0.06, ey + r * 0.2, ex + r * 0.16, ey + r * 0.04); cr.set_source(g); cr.fill(); cr.set_source_rgb(*ink)
        else:
            h = r * 0.15 * (1 - yawn * 1.6) if yawn > 0 else r * 0.15
            blink = (t % 2.7) < 0.1
            if blink: cr.set_line_width(r * 0.06); cr.move_to(ex - r * 0.1, ey); cr.line_to(ex + r * 0.1, ey); cr.stroke()
            else:
                cr.save(); cr.translate(ex, ey); cr.scale(1, max(0.2, h / (r * 0.15))); cr.arc(0, 0, r * 0.11, 0, 2 * math.pi); cr.restore(); cr.fill()
                cr.arc(ex + r * 0.04, ey - r * 0.04, r * 0.035, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*ink)
    my = cy + r * 0.38
    if yawn < 0.08:
        cr.set_line_width(r * 0.06); cr.arc(cx, my - r * 0.08, r * 0.14, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    else:
        mh = r * (0.08 + 0.42 * yawn); mw = r * (0.18 + 0.14 * yawn)
        mouth = lambda c: (c.save(), c.translate(cx, my), c.scale(mw, mh), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
        mouth(cr); cr.set_source_rgb(0.35, 0.05, 0.12); cr.fill()
        cr.save(); mouth(cr); cr.clip(); cr.arc(cx, my + mh * 0.9, mw * 0.8, 0, 2 * math.pi); cr.set_source_rgb(1, 0.45, 0.55); cr.fill(); cr.restore()

def yawn_curve(lt, t0, dur=1.6):
    """0→1→0: sube, se sostiene y baja."""
    x = (lt - t0) / dur
    if x <= 0 or x >= 1: return 0.0
    return ease(x / 0.35) if x < 0.35 else (1.0 if x < 0.7 else 1 - ease((x - 0.7) / 0.3))

def zz(cr, x, y, lt, col=WHITE):
    for k in range(3):
        ph = (lt * 0.7 + k / 3) % 1
        cr.save(); cr.translate(x + ph * 60 + k * 10, y - ph * 140); s = 0.6 + ph * 0.6; cr.scale(s, s)
        text(cr, "Z", 0, 0, 70, col, alpha=1 - ph, sh=False); cr.restore()

def dog(cr, cx, cy, r, yawn, t):
    brown, dark = (0.86, 0.58, 0.32), (0.45, 0.26, 0.12)
    for s in (-1, 1):  # orejas caídas
        ear = lambda c, s=s: (c.save(), c.translate(cx + s * r * 0.82, cy - r * 0.05), c.rotate(s * 0.25 + s * 0.08 * math.sin(t * 3)), c.scale(0.38, 0.75), c.arc(0, 0, r, 0, 2 * math.pi), c.restore())
        volume(cr, ear, dark, (cx - r * 1.2, cy - r * 0.8, cx + r * 1.2, cy + r * 0.7), sh_blur=20)
    d = lambda c: c.arc(cx, cy, r, 0, 2 * math.pi)
    volume(cr, d, brown, (cx - r, cy - r, cx + r, cy + r), light=0.3, shade=0.3, sh_blur=r * 0.35)
    sn = lambda c: (c.save(), c.translate(cx, cy + r * 0.32), c.scale(r * 0.55, r * 0.42), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
    volume(cr, sn, (0.98, 0.88, 0.76), (cx - r * 0.55, cy - r * 0.1, cx + r * 0.55, cy + r * 0.74), sh=False)
    ink = (0.12, 0.06, 0.06); cr.set_source_rgb(*ink); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for s in (-1, 1):
        ex, ey = cx + s * r * 0.36, cy - r * 0.2
        if yawn > 0.45: cr.set_line_width(r * 0.07); cr.arc(ex, ey, r * 0.12, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
        else: cr.arc(ex, ey, r * 0.11, 0, 2 * math.pi); cr.fill(); cr.arc(ex + r * 0.04, ey - r * 0.04, r * 0.035, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*ink)
    nose = lambda c: (c.save(), c.translate(cx, cy + r * 0.12), c.scale(r * 0.17, r * 0.12), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
    volume(cr, nose, (0.15, 0.08, 0.08), (cx - r * 0.17, cy, cx + r * 0.17, cy + r * 0.24), sh=False, rim=False)
    my = cy + r * 0.5
    if yawn < 0.08:
        cr.set_source_rgb(*ink); cr.set_line_width(r * 0.05); cr.arc(cx - r * 0.1, my - r * 0.06, r * 0.1, 0.1 * math.pi, 0.9 * math.pi); cr.stroke(); cr.arc(cx + r * 0.1, my - r * 0.06, r * 0.1, 0.1 * math.pi, 0.9 * math.pi); cr.stroke()
    else:
        mh, mw = r * (0.06 + 0.32 * yawn), r * (0.16 + 0.1 * yawn)
        cr.save(); cr.translate(cx, my + mh * 0.3); cr.scale(mw, mh); cr.arc(0, 0, 1, 0, 2 * math.pi); cr.restore(); cr.set_source_rgb(0.35, 0.05, 0.12); cr.fill()
        cr.save(); cr.translate(cx, my + mh * 0.9); cr.scale(mw * 0.6, mh * 0.45); cr.arc(0, 0, 1, 0, 2 * math.pi); cr.restore(); cr.set_source_rgb(1, 0.45, 0.55); cr.fill()

def fan(cr, cx, cy, r, ang, a=1.0):
    cr.save(); cr.translate(cx, cy)
    glass(cr, -r * 1.15, -r * 1.15, r * 2.3, r * 2.3, r * 1.15, a=0.08, sh=True)
    for k in range(3):
        cr.save(); cr.rotate(ang + k * 2 * math.pi / 3)
        bl = lambda c: (c.save(), c.translate(0, -r * 0.5), c.scale(r * 0.32, r * 0.55), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
        volume(cr, bl, CYAN, (-r * 0.32, -r * 1.05, r * 0.32, 0), sh=False); cr.restore()
    hub = lambda c: c.arc(0, 0, r * 0.16, 0, 2 * math.pi)
    volume(cr, hub, WHITE, (-r * 0.16, -r * 0.16, r * 0.16, r * 0.16), sh=False)
    cr.restore()

def draw_scene(cr, kind, lt, z, ev):
    if kind == "gancho":
        ty = z.w("bostezar"); y = yawn_curve(lt, ty, 2.2)
        radial_glow(cr, W / 2, 960, 560, VIOLET, 0.35)
        face(cr, W / 2, 980 + 10 * math.sin(lt * 2), 290, (1.0, 0.80, 0.42), y, lt)
        ev("whoosh", 0.0)
        if y > 0.5: zz(cr, W / 2 + 230, 760, lt, CYAN)
        callout(cr, "RETO: NO BOSTEZAR", W / 2, 480, 62, YEL, ORANGE, lt, 0.15, dark=True); ev("pop", 0.15)
        tc = z.f(1)
        if lt > tc:
            ev("ding", tc); k = pop((lt - tc) / 0.35)
            cr.save(); cr.translate(W / 2, 1290); cr.rotate(0.03); cr.scale(k, k)
            text(cr, "¿Aguantarás?", 0, 0, 64, grad=(WHITE, (0.8, 0.85, 1.0))); cr.restore()
    elif kind == "contagio":
        t0 = z.f(0); cols = [(1.0, 0.80, 0.42), (0.55, 0.85, 1.0), (1.0, 0.62, 0.72)]
        for i, x in enumerate((230, 540, 850)):
            yy = yawn_curve(lt, t0 + 0.2 + i * 0.55, 1.5); k = pop((lt - i * 0.12) / 0.4)
            cr.save(); cr.translate(x, 760); cr.scale(k, k); face(cr, 0, 0, 125, cols[i], yy, lt + i); cr.restore()
            if i < 2 and lt > t0 + 0.6 + i * 0.55:
                p = cl((lt - t0 - 0.6 - i * 0.55) / 0.3)
                cr.set_source_rgba(*YEL, 0.9); cr.set_line_width(8); cr.set_line_cap(cairo.LINE_CAP_ROUND)
                cr.move_to(x + 140, 760); cr.line_to(x + 140 + 30 * p, 760); cr.stroke()
                sparkle(cr, x + 155, 700, 20, YEL, p, lt * 3)
            ev("pop", t0 + 0.2 + i * 0.55, g=0.6)
        icons = [("ver", "VER", CYAN), ("oír", "OÍR", PINK), ("leer", "LEER", MINT)]
        for j, (wd, lab, c1) in enumerate(icons):
            tw = z.w(wd)
            if lt > tw:
                ev("pop", tw); kk = pop((lt - tw) / 0.35); x = 230 + j * 310
                cr.save(); cr.translate(x, 1100); cr.scale(kk, kk)
                def ic(c, r, j=j):
                    c.set_source_rgb(1, 1, 1); c.set_line_width(r * 0.12); c.set_line_cap(cairo.LINE_CAP_ROUND)
                    if j == 0:
                        c.save(); c.scale(1, 0.55); c.arc(0, 0, r * 0.55, 0, 2 * math.pi); c.restore(); c.stroke(); c.arc(0, 0, r * 0.2, 0, 2 * math.pi); c.fill()
                    elif j == 1:
                        c.arc(0, -r * 0.05, r * 0.38, math.pi * 0.9, math.pi * 2.25); c.stroke(); c.arc(r * 0.05, -r * 0.05, r * 0.14, math.pi, math.pi * 2.2); c.stroke()
                    else:
                        for q in range(3): c.move_to(-r * 0.4, -r * 0.3 + q * r * 0.3); c.line_to(r * 0.4 - (q == 2) * r * 0.25, -r * 0.3 + q * r * 0.3); c.stroke()
                icon_badge(cr, 0, 0, 78, c1, darken(c1, 0.35), ic); cr.restore()
                text(cr, lab, x, 1225, 44, WHITE, font=DISPLAY_XB, alpha=ease((lt - tw) / 0.3))
    elif kind == "enfriar":
        R.brain(cr, W / 2 - 60, 860, 1.05, frost=0.55 * ease((lt - z.w("enfría")) / 1.2), t=lt, wob=0.3)
        R.thermo(cr, 930, 900, 0.85 - 0.55 * ease((lt - z.w("enfría")) / 1.4), CYAN)
        tv = z.w("ventilador")
        if lt > tv - 0.6:
            k = pop((lt - tv + 0.6) / 0.4); ev("whoosh", tv - 0.6, g=0.7)
            cr.save(); cr.translate(250, 1170); cr.scale(k, k); fan(cr, 0, 0, 120, lt * 14); cr.restore()
            for i in range(7):
                ph = (lt * 1.6 + i / 7) % 1; y = 780 + i * 45
                g = cairo.LinearGradient(330, 0, 330 + 500 * ph, 0); g.add_color_stop_rgba(0, *ICE, 0); g.add_color_stop_rgba(1, *ICE, 0.7 * (1 - ph))
                cr.set_source(g); cr.set_line_width(6); cr.set_line_cap(cairo.LINE_CAP_ROUND)
                cr.move_to(330 + 400 * ph, y + 30 * math.sin(lt * 4 + i)); cr.line_to(330 + 400 * ph + 120, y + 30 * math.sin(lt * 4 + i + 0.5)); cr.stroke()
        callout(cr, "MODO VENTILADOR", W / 2, 1360, 54, CYAN, (0.3, 0.5, 1.0), lt, tv)
    elif kind == "amigos":
        tf = z.f(0); td = z.f(1)
        # pareja de amigos con corazones
        for i, (x, c) in enumerate(((330, (1.0, 0.80, 0.42)), (640, (1.0, 0.62, 0.72)))):
            yy = yawn_curve(lt, 0.5 + i * 0.6, 1.4)
            k = pop((lt - i * 0.12) / 0.4); cr.save(); cr.translate(x, 800); cr.scale(k, k); face(cr, 0, 0, 140, c, yy, lt + i); cr.restore()
        for q in range(5):
            ph = (lt * 0.8 + q / 5) % 1; hx = 485 + 40 * math.sin(lt * 3 + q); hy = 700 - ph * 220
            hrt = lambda c, hx=hx, hy=hy, s=24 + 8 * (1 - ph): (c.move_to(hx, hy + s * 0.9), c.curve_to(hx - s * 1.4, hy - s * 0.2, hx - s * 0.6, hy - s * 1.2, hx, hy - s * 0.4), c.curve_to(hx + s * 0.6, hy - s * 1.2, hx + s * 1.4, hy - s * 0.2, hx, hy + s * 0.9))
            hrt(cr); cr.set_source_rgba(*PINK, 1 - ph); cr.fill()
        if lt > tf: callout(cr, "AMIGOS Y FAMILIA", 485, 560, 48, PINK, VIOLET, lt, tf); ev("pop", tf)
        # desconocido en gris
        if lt > td:
            ev("pop", td); k = pop((lt - td) / 0.4)
            cr.save(); cr.translate(880, 1130); cr.scale(k, k); face(cr, 0, 0, 105, (0.7, 0.7, 0.75), 0, lt, grey=True); cr.restore()
            text(cr, "DESCONOCIDO", 880, 1290, 36, (0.8, 0.8, 0.88), font=DISPLAY_XB, alpha=ease((lt - td) / 0.3))
            cr.set_source_rgba(1, 0.35, 0.4, 0.9 * ease((lt - td - 0.2) / 0.3)); cr.set_line_width(12); cr.set_line_cap(cairo.LINE_CAP_ROUND)
            cr.move_to(800, 1050); cr.line_to(960, 1210); cr.stroke(); cr.move_to(960, 1050); cr.line_to(800, 1210); cr.stroke()
    elif kind == "perro":
        tp = z.w("perro"); radial_glow(cr, W / 2, 900, 520, ORANGE, 0.35)
        yh = yawn_curve(lt, 0.2, 1.3); yd = yawn_curve(lt, tp + 0.2, 1.6)
        k = pop(lt / 0.4); cr.save(); cr.translate(300, 760); cr.scale(k, k); face(cr, 0, 0, 130, (1.0, 0.80, 0.42), yh, lt); cr.restore()
        if lt > tp - 0.3:
            kd = pop((lt - tp + 0.3) / 0.45); ev("pop", tp - 0.3)
            cr.save(); cr.translate(650, 1020); cr.scale(kd, kd); dog(cr, 0, 0, 210, yd, lt); cr.restore()
            if yd > 0.5: zz(cr, 820, 830, lt, YEL)
            ring_burst(cr, 650, 1020, (lt - tp - 0.2) / 0.6, YEL, 330, 10)
    elif kind == "remate":
        tq = z.f(1); y = yawn_curve(lt, tq - 0.2, 2.6)
        radial_glow(cr, W / 2, 960, 600, PINK, 0.3)
        k = pop(lt / 0.35); cr.save(); cr.translate(W / 2, 980); cr.scale(k, k); face(cr, 0, 0, 300, (1.0, 0.80, 0.42), y, lt); cr.restore()
        if lt > tq:
            ev("impact", tq, g=0.4); k2 = pop((lt - tq) / 0.35)
            cr.save(); cr.translate(W / 2, 520); cr.rotate(-0.04); cr.scale(k2, k2)
            text(cr, "¿YA BOSTEZASTE?", 0, 0, 92, grad=(lighten(YEL, 0.5), ORANGE), glow_c=ORANGE); cr.restore()
            for q in range(4): sparkle(cr, 200 + q * 230, 640 + 30 * math.sin(lt * 3 + q), 22, [CYAN, PINK, YEL, MINT][q], 0.9, lt * 2)
    else:
        _orig(cr, kind, lt, z, ev)

_orig = R.draw_scene
R.draw_scene = draw_scene

if __name__ == "__main__":
    R.main()
