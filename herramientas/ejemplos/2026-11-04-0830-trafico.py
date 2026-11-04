"""Short: el tráfico de la CDMX y los atascos fantasma.  Uso (desde herramientas/):
python3 ejemplos/2026-11-04-0830-trafico.py ejemplos/2026-11-04-0830-trafico.json OUT [frames t1,t2]
Reutiliza render3 (fondo, cámara, subtítulos, cierre) y solo define las escenas nuevas."""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import cairo
import render3 as R
from estilo import *
from render3 import callout, RED

R.BGS.update({
    "gancho": ((0.12, 0.05, 0.16), (0.34, 0.08, 0.14), (RED, ORANGE, VIOLET)),
    "fantasma": ((0.05, 0.06, 0.20), (0.16, 0.10, 0.34), (VIOLET, CYAN, PINK)),
    "ola": ((0.03, 0.08, 0.20), (0.05, 0.22, 0.36), (CYAN, (0.4, 0.6, 1.0), MINT)),
    "experimento": ((0.14, 0.04, 0.10), (0.30, 0.06, 0.20), (PINK, RED, YEL)),
    "dias": ((0.10, 0.07, 0.04), (0.30, 0.16, 0.05), (ORANGE, YEL, PINK)),
    "remate": ((0.04, 0.10, 0.12), (0.10, 0.22, 0.20), (MINT, CYAN, YEL)),
})

CAR_COLS = [(1.0, 0.36, 0.45), (0.35, 0.75, 1.0), (1.0, 0.80, 0.30), (0.55, 0.45, 1.0), (0.40, 0.92, 0.70), (1.0, 0.58, 0.30)]
GLASS_C = (0.55, 0.80, 1.0)

def car_side(cr, cx, cy, s, col, brake=0.0, t=0.0, wheel=0.0, face=None):
    """Auto de lado (mira a la derecha). brake 0..1 enciende las calaveras."""
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    body = lambda c: rr(c, -150, -40, 300, 80, 36)
    cab = lambda c: (c.move_to(-95, -38), c.curve_to(-80, -105, -40, -110, 0, -110), c.line_to(30, -110), c.curve_to(70, -110, 90, -80, 110, -38), c.close_path())
    volume(cr, cab, col, (-95, -110, 110, -38), light=0.3, shade=0.3, sh=False)
    volume(cr, body, col, (-150, -40, 150, 40), light=0.35, shade=0.35, sh_blur=22, sh_alpha=0.45)
    # ventanas
    for (x0, x1) in ((-75, -12), (2, 88)):
        w = lambda c, x0=x0, x1=x1: (c.move_to(x0, -42), c.curve_to(x0 + 8, -88, x0 + 20, -96, x0 + 30, -96), c.line_to(x1 - 30, -96), c.curve_to(x1 - 15, -96, x1 - 5, -70, x1, -42), c.close_path())
        w(cr); g = cairo.LinearGradient(0, -96, 0, -42); g.add_color_stop_rgb(0, *lighten(GLASS_C, 0.45)); g.add_color_stop_rgb(1, *darken(GLASS_C, 0.25)); cr.set_source(g); cr.fill()
        cr.save(); w(cr); cr.clip(); cr.set_source_rgba(1, 1, 1, 0.35); cr.move_to(x0 + 10, -42); cr.line_to(x0 + 32, -96); cr.line_to(x0 + 46, -96); cr.line_to(x0 + 24, -42); cr.fill(); cr.restore()
    if face:  # conductor (cabecita) en la ventana delantera
        hx, hy = 48, -64
        cr.save(); rr(cr, 2, -96, 86, 54, 10); cr.clip()
        d = lambda c: c.arc(hx, hy, 22, 0, 2 * math.pi)
        volume(cr, d, (1.0, 0.76, 0.62), (hx - 22, hy - 22, hx + 22, hy + 22), sh=False, rim=False)
        cr.set_source_rgb(0.15, 0.08, 0.12); cr.arc(hx + 9, hy - 4, 3.5, 0, 2 * math.pi); cr.fill()
        cr.set_line_width(3); cr.set_line_cap(cairo.LINE_CAP_ROUND)
        if face == "sad": cr.arc(hx + 8, hy + 14, 7, 1.15 * math.pi, 1.85 * math.pi); cr.stroke()
        else: cr.arc(hx + 8, hy + 5, 7, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
        cr.restore()
    # faros y calaveras
    hl = lambda c: rr(c, 132, -22, 18, 18, 6)
    hl(cr); cr.set_source_rgb(1, 0.97, 0.8); cr.fill()
    tl = lambda c: rr(c, -152, -24, 18, 22, 6)
    if brake > 0.05:
        cr.save(); cr.set_operator(cairo.OPERATOR_ADD); radial_glow(cr, -150, -12, 150, RED, 0.75 * brake); cr.restore()
    tl(cr); cr.set_source_rgb(*mix((0.55, 0.08, 0.12), (1.0, 0.35, 0.35), brake)); cr.fill()
    # llantas
    for wx in (-88, 88):
        d = lambda c, wx=wx: c.arc(wx, 40, 34, 0, 2 * math.pi)
        volume(cr, d, (0.16, 0.16, 0.22), (wx - 34, 6, wx + 34, 74), light=0.2, sh=False, rim=False)
        cr.arc(wx, 40, 15, 0, 2 * math.pi); cr.set_source_rgb(0.78, 0.80, 0.88); cr.fill()
        cr.set_source_rgb(0.35, 0.36, 0.45); cr.set_line_width(4)
        for k in range(3):
            a = wheel + k * 2.09; cr.move_to(wx, 40); cr.line_to(wx + 14 * math.cos(a), 40 + 14 * math.sin(a)); cr.stroke()
    cr.restore()

def car_top(cr, x, y, ang, s, col, brake=0.0):
    """Auto visto desde arriba, apunta hacia `ang`."""
    cr.save(); cr.translate(x, y); cr.rotate(ang); cr.scale(s, s)
    if brake > 0.05:
        cr.save(); cr.set_operator(cairo.OPERATOR_ADD); radial_glow(cr, -34, 0, 70, RED, 0.8 * brake); cr.restore()
    b = lambda c: rr(c, -34, -18, 68, 36, 12)
    volume(cr, b, col, (-34, -18, 34, 18), sh=False, rim=False)
    rr(cr, -6, -14, 24, 28, 7); cr.set_source_rgba(*darken(GLASS_C, 0.2), 0.95); cr.fill()
    rr(cr, -36, -15, 6, 9, 2); cr.set_source_rgb(*mix((0.5, 0.1, 0.1), (1, 0.35, 0.35), brake)); cr.fill()
    rr(cr, -36, 6, 6, 9, 2); cr.fill()
    cr.restore()

def ghost(cr, x, y, r, t, a=1.0):
    cr.save(); cr.translate(x, y + 14 * math.sin(t * 3)); cr.rotate(0.08 * math.sin(t * 2))
    def g(c):
        c.move_to(-r, 0); c.arc(0, 0, r, math.pi, 2 * math.pi); c.line_to(r, r * 1.1)
        for k in range(4):
            x0 = r - k * r / 2; c.curve_to(x0 - r * 0.12, r * 1.1 - r * 0.28 * (1 if k % 2 == 0 else -0.2), x0 - r * 0.38, r * 1.1 - r * 0.28 * (1 if k % 2 == 0 else -0.2), x0 - r / 2, r * 1.1)
        c.close_path()
    glow(cr, g, (0.75, 0.80, 1.0), r * 0.5, 0.5 * a)
    volume(cr, g, (0.92, 0.94, 1.0), (-r, -r, r, r * 1.2), light=0.2, shade=0.25, sh_blur=r * 0.4)
    cr.set_source_rgb(0.12, 0.08, 0.2)
    for s in (-1, 1):
        cr.save(); cr.translate(s * r * 0.35, -r * 0.1); cr.scale(1, 1.4); cr.arc(0, 0, r * 0.13, 0, 2 * math.pi); cr.restore(); cr.fill()
    cr.save(); cr.translate(0, r * 0.35); cr.scale(1, 1.3); cr.arc(0, 0, r * 0.12, 0, 2 * math.pi); cr.restore(); cr.fill()
    cr.restore()

def road(cr, y0, y1, t, speed=0.0, lanes=2):
    """Asfalto horizontal con líneas que se mueven."""
    d = lambda c: c.rectangle(-60, y0, W + 120, y1 - y0)
    shadow(cr, d, 40, 0.5, dy=20)
    d(cr); g = cairo.LinearGradient(0, y0, 0, y1); g.add_color_stop_rgb(0, 0.26, 0.26, 0.34); g.add_color_stop_rgb(1, 0.13, 0.13, 0.19); cr.set_source(g); cr.fill()
    cr.set_source_rgba(1, 0.85, 0.3, 0.9); cr.rectangle(-60, y0 + 6, W + 120, 6); cr.fill(); cr.rectangle(-60, y1 - 12, W + 120, 6); cr.fill()
    for l in range(1, lanes):
        yy = y0 + (y1 - y0) * l / lanes
        off = (t * speed) % 120
        for k in range(-1, 11):
            rr(cr, k * 120 - off, yy - 4, 64, 8, 4); cr.set_source_rgba(1, 1, 1, 0.75); cr.fill()

def green_sign(cr, cx, cy, s, label, sub=None, a=1.0):
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    e = text_extents(cr, label, 54, DISPLAY_XB); w = e.x_advance + 90; h = 120 if not sub else 160
    for px in (-w * 0.3, w * 0.3):
        rr(cr, px - 9, h / 2 - 6, 18, 70, 6); cr.set_source_rgba(0.6, 0.62, 0.7, a); cr.fill()
    d = lambda c: rr(c, -w / 2, -h / 2, w, h, 20)
    volume(cr, d, (0.05, 0.50, 0.30), (-w / 2, -h / 2, w / 2, h / 2), light=0.25, shade=0.3, sh_blur=24)
    rr(cr, -w / 2 + 10, -h / 2 + 10, w - 20, h - 20, 14); cr.set_source_rgba(1, 1, 1, 0.9); cr.set_line_width(4); cr.stroke()
    text(cr, label, 0, 18 if not sub else -2, 54, WHITE, font=DISPLAY_XB, sh=False)
    if sub: text(cr, sub, 0, 52, 30, (0.85, 1, 0.9), font=DISPLAY_XB, sh=False)
    cr.restore()

def draw_scene(cr, kind, lt, z, ev):
    if kind == "gancho":
        radial_glow(cr, W / 2, 900, 600, RED, 0.25)
        tp = z.w("Periférico"); tc = z.w("choque")
        ks = pop((lt - tp + 0.2) / 0.4) if lt > tp - 0.2 else 0
        if ks > 0.02: green_sign(cr, W / 2, 440, ks, "PERIFÉRICO", "SALIDA: ALGÚN DÍA"); ev("pop", tp - 0.2)
        road(cr, 760, 1300, lt, 0, lanes=2)
        # dos carriles de autos parados, temblando un poquito
        for lane, yy in enumerate((900, 1160)):
            for k in range(4):
                x = -40 + k * 330 + lane * 160; col = CAR_COLS[(k + lane * 2) % 6]
                bob = 2 * math.sin(lt * 20 + k)
                car_side(cr, x, yy + bob, 0.82, col, brake=0.75 + 0.25 * math.sin(lt * 6 + k), t=lt,
                         face=("sad" if (lane == 1 and k == 1) else None))
        ev("whoosh", 0.0); ev("impact", 0.25, g=0.5)
        tf = z.f(1)
        if lt > tf:
            ev("pop", tf); k2 = pop((lt - tf) / 0.35)
            cr.save(); cr.translate(W / 2, 680); cr.rotate(-0.03); cr.scale(k2, k2)
            pill(cr, 0, -22, 820, 110, YEL, ORANGE); text(cr, "AL FINAL: TU TIEMPO PERDIDO", 0, 0, 50, (0.08, 0.04, 0.12), sh=False); cr.restore()
        elif lt > tc:
            ev("ding", tc); k2 = pop((lt - tc) / 0.35)
            cr.save(); cr.translate(W / 2, 690); cr.rotate(-0.04); cr.scale(k2, k2)
            text(cr, "¿Y EL CHOQUE?", 0, 0, 96, grad=(lighten(YEL, 0.5), ORANGE), glow_c=ORANGE); cr.restore()
            for q in range(3):
                kk = pop((lt - tc - q * 0.12) / 0.3)
                cr.save(); cr.translate(160 + q * 380, 600 + 18 * math.sin(lt * 4 + q)); cr.scale(kk, kk)
                text(cr, "?", 0, 0, 90, WHITE, alpha=0.85); cr.restore()
        elif lt < tp - 0.2:
            k = pop(lt / 0.3); cr.save(); cr.translate(W / 2, 560); cr.scale(k, k)
            text(cr, "¡NI SE MUEVE!", 0, 0, 96, grad=(WHITE, (1.0, 0.75, 0.8))); cr.restore()
    elif kind == "fantasma":
        tg = z.w("fantasma"); t1 = z.f(1); t2 = z.f(2)
        kg = pop((lt - tg + 0.1) / 0.45) if lt > tg - 0.1 else 0
        if kg > 0.02:
            ev("whoosh", tg - 0.1)
            cr.save(); cr.translate(W / 2, 560); cr.scale(kg, kg); ghost(cr, 0, 0, 120, lt); cr.restore()
        road(cr, 900, 1260, lt, 0, lanes=1)
        # fila de autos: el de adelante (derecha) frena primero, luego se propaga hacia atrás
        n = 4
        for k in range(n):
            idx = n - 1 - k  # 0 = el de adelante
            x = 925 - idx * 255
            tb = t1 + 0.3 + idx * 0.75 if lt > t1 else 99
            b = ease((lt - tb) / 0.25) if lt > tb else 0
            bounce = math.exp(-(lt - tb) * 8) * math.sin((lt - tb) * 40) * 6 * (1 + idx * 0.6) if lt > tb else 0
            car_side(cr, x, 1080 + bounce, 0.8, CAR_COLS[idx], brake=b, t=lt, face="sad" if b > 0.5 else "ok")
            if lt > tb:
                ev("crack" if idx == n - 1 else "pop", tb, g=0.5 + idx * 0.2)
                ring_burst(cr, x - 120, 1070, (lt - tb) / 0.5, RED, 120 + idx * 40, 8)
                lab = ["tantito", "fuerte", "MÁS", "¡FRENAZO!"][idx]
                ka = pop((lt - tb) / 0.3); sz = 34 + idx * 10
                cr.save(); cr.translate(max(x, 215), 880 - (idx % 2) * 90); cr.rotate(-0.05); cr.scale(ka, ka)
                pill(cr, 0, -sz * 0.32, text_extents(cr, lab.upper(), sz).x_advance + sz, sz * 1.5, mix(ORANGE, RED, idx / 3), darken(RED, 0.2))
                text(cr, lab.upper(), 0, 0, sz, WHITE, sh=False); cr.restore()
        # flecha que indica dirección de la ola de frenado
        if lt > t2:
            p = ease((lt - t2) / 0.6); ax0, ax1 = 980, 980 - 860 * p
            cr.set_source_rgba(*PINK, 0.9); cr.set_line_width(14); cr.set_line_cap(cairo.LINE_CAP_ROUND)
            cr.move_to(ax0, 1330); cr.line_to(ax1, 1330); cr.stroke()
            cr.move_to(ax1 + 40, 1300); cr.line_to(ax1, 1330); cr.line_to(ax1 + 40, 1360); cr.stroke()
    elif kind == "ola":
        tw = z.w("ola"); tp = z.f(1)
        # carretera vista desde arriba en diagonal: fila larga de autos; la ola de densidad viaja hacia atrás
        glass(cr, 50, 420, W - 100, 560, 50, a=0.07)
        cr.save(); rr(cr, 50, 420, W - 100, 560, 50); cr.clip()
        road_t = lambda c: c.rectangle(0, 580, W, 300)
        road_t(cr); cr.set_source_rgb(0.18, 0.18, 0.26); cr.fill()
        cr.set_source_rgba(1, 1, 1, 0.6)
        for k in range(12): rr(cr, k * 100, 726, 50, 8, 4); cr.fill()
        wave_x = 1150 - (lt - 0.0) * 220  # la ola se mueve hacia la izquierda (hacia atrás)
        rnd = random.Random(5)
        for lane, ly in enumerate((655, 805)):
            for k in range(16):
                base = k * 120 + lane * 50
                x = (base + lt * 150) % 1920 - 220
                dist = x - wave_x; jam = math.exp(-(dist / 170) ** 2)
                x = x - 60 * jam * math.tanh(dist / 100)  # se amontonan en la ola
                car_top(cr, x, ly, 0, 1.45, CAR_COLS[(k + lane) % 6], brake=jam)
        cr.restore()
        # cresta de la ola dibujada encima
        a = ease((lt - tw + 0.3) / 0.5)
        if a > 0:
            ev("whoosh", tw - 0.3)
            cr.save(); cr.set_line_cap(cairo.LINE_CAP_ROUND)
            def wv(c):
                c.move_to(60, 540)
                for xx in range(60, W - 50, 10):
                    c.line_to(xx, 540 - 90 * math.exp(-((xx - wave_x) / 140) ** 2))
            glow(cr, lambda c: (wv(c), c.set_line_width(20), c.stroke_preserve()), CYAN, 30, 0.6 * a)
            wv(cr); cr.set_source_rgba(*lighten(CYAN, 0.4), a); cr.set_line_width(10); cr.stroke()
            cr.restore()
            sparkle(cr, wave_x, 445, 26, CYAN, a, lt * 3)
        callout(cr, "VIAJA HACIA ATRÁS", W / 2, 1100, 58, CYAN, (0.3, 0.5, 1.0), lt, tw)
        if lt > tp:
            ev("pop", tp)
            for q in range(3):
                kk = pop((lt - tp - 0.4 - q * 0.2) / 0.3)
                if kk < 0.02: continue
                cr.save(); cr.translate(250 + q * 290, 1290 + 10 * math.sin(lt * 5 + q)); cr.scale(kk, kk)
                icon_badge(cr, 0, 0, 62, CAR_COLS[q], darken(CAR_COLS[q], 0.35),
                           lambda c, r: text(c, "?", 0, r * 0.38, r * 1.1, WHITE, sh=False))
                cr.restore()
                ev("pop", tp + 0.4 + q * 0.2, g=0.5)
    elif kind == "experimento":
        tj = z.w("Japón"); t22 = z.w("veintidós"); tt = z.f(1); tx = z.w("tráfico")
        cx, cy, rx, ry = W / 2, 850, 380, 270
        # bandera / insignia
        kb = pop((lt - tj + 0.1) / 0.4) if lt > tj - 0.1 else 0
        if kb > 0.02:
            cr.save(); cr.translate(W / 2, 420); cr.scale(kb * 0.7, kb * 0.7)
            fl = lambda c: rr(c, -110, -70, 220, 140, 18)
            volume(cr, fl, (0.98, 0.98, 1.0), (-110, -70, 110, 70), light=0.05, shade=0.15)
            d = lambda c: c.arc(0, 0, 44, 0, 2 * math.pi)
            volume(cr, d, (0.92, 0.12, 0.22), (-44, -44, 44, 44), sh=False)
            cr.restore(); ev("pop", tj - 0.1)
        # pista ovalada
        track = lambda c: (c.save(), c.translate(cx, cy), c.scale(rx, ry), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
        cr.save(); cr.set_line_width(110); track(cr); cr.set_source_rgba(0, 0, 0, 0.35); cr.translate(0, 18); cr.stroke(); cr.restore()
        cr.save(); track(cr); cr.set_line_width(110); cr.set_source_rgb(0.22, 0.22, 0.30); cr.stroke(); cr.restore()
        cr.save(); track(cr); cr.set_line_width(4); cr.set_dash([30, 24]); cr.set_source_rgba(1, 1, 1, 0.55); cr.stroke(); cr.restore()
        for (rrx, rry) in ((rx + 58, ry + 58), (rx - 58, ry - 58)):
            cr.save(); cr.translate(cx, cy); cr.scale(rrx, rry); cr.arc(0, 0, 1, 0, 2 * math.pi); cr.restore(); cr.set_source_rgba(1, 0.85, 0.3, 0.8); cr.set_line_width(5); cr.stroke()
        # 22 autos; después de tt se forma un grumo que viaja hacia atrás
        n = 22; jamk = ease((lt - tt) / 1.2)
        jam_ang = -1.2 - (lt - tt) * 0.35
        for k in range(n):
            th0 = k * 2 * math.pi / n + lt * 0.55
            d = math.atan2(math.sin(th0 - jam_ang), math.cos(th0 - jam_ang))
            th = th0 - 0.45 * jamk * math.tanh(d / 0.35) * math.exp(-(d / 0.9) ** 2)
            inj = math.exp(-(d / 0.35) ** 2) * jamk
            x, y = cx + rx * math.cos(th), cy + ry * math.sin(th)
            ang = math.atan2(ry * math.cos(th), -rx * math.sin(th))
            ka = pop((lt - t22 - k * 0.025) / 0.25) if lt > t22 - 0.5 else 0
            if ka > 0.02: car_top(cr, x, y, ang, 0.85 * ka, CAR_COLS[k % 6], brake=inj)
        if lt > t22 - 0.5: ev("pop", t22 - 0.3)
        if t22 < lt < tx:
            k2 = pop((lt - t22) / 0.35); cr.save(); cr.translate(cx, cy + 40); cr.scale(k2, k2)
            text(cr, "22", 0, 0, 200, grad=(WHITE, (0.85, 0.85, 1.0))); text(cr, "AUTOS", 0, 70, 52, YEL, font=DISPLAY_XB); cr.restore()
        if lt > tt:
            for q, lab in enumerate(("SIN SEMÁFOROS", "SIN CHOQUES")):
                callout(cr, lab, 290 + q * 500, 1250, 40, MINT, (0.2, 0.75, 0.55), lt, tt + q * 0.6, dark=True); ev("pop", tt + q * 0.6)
        if lt > tx:
            ev("impact", tx); jx, jy = cx + rx * math.cos(jam_ang), cy + ry * math.sin(jam_ang)
            ring_burst(cr, jx, jy, (lt - tx) / 0.6, RED, 220, 12)
            k3 = pop((lt - tx) / 0.35); cr.save(); cr.translate(cx, cy + 30); cr.rotate(0.03); cr.scale(k3, k3)
            text(cr, "¡TRÁFICO!", 0, 0, 110, grad=(lighten(YEL, 0.5), ORANGE), glow_c=RED); cr.restore()
    elif kind == "dias":
        tm = z.w("México"); tpe = z.w("peor"); t8 = z.w("ocho")
        # trofeo "número 1" de forma juguetona
        if lt < t8 - 0.2:
            k = pop((lt - tm + 0.3) / 0.4) if lt > tm - 0.3 else 0
            if k > 0.02:
                ev("pop", tm - 0.3)
                cr.save(); cr.translate(W / 2, 820 + 10 * math.sin(lt * 3)); cr.scale(k, k)
                radial_glow(cr, 0, 0, 380, YEL, 0.35)
                cupd = lambda c: (c.move_to(-170, -200), c.line_to(170, -200), c.curve_to(170, 20, 90, 110, 0, 110), c.curve_to(-90, 110, -170, 20, -170, -200), c.close_path())
                for s in (-1, 1):
                    cr.set_source_rgb(*darken(YEL, 0.2)); cr.set_line_width(26); cr.arc(s * 170, -110, 70, (-0.5 if s > 0 else 0.5) * math.pi + (0 if s > 0 else math.pi), (0.5 if s > 0 else -0.5) * math.pi + (0 if s > 0 else math.pi)); cr.stroke()
                volume(cr, cupd, YEL, (-170, -200, 170, 110), light=0.4, shade=0.35, sh_blur=40)
                stem = lambda c: (rr(c, -30, 100, 60, 90, 10), rr(c, -120, 180, 240, 60, 18))
                volume(cr, stem, darken(YEL, 0.15), (-120, 100, 120, 240), sh=False)
                text(cr, "#1", 0, -20, 130, (0.45, 0.25, 0.02), sh=False)
                cr.restore()
                green_sign(cr, W / 2, 1230, 0.85 * pop((lt - tm) / 0.4) if lt > tm else 0.01, "CDMX", "TOMTOM 2025")
            if lt > tpe:
                ev("impact", tpe, g=0.5)
                callout(cr, "PEOR TRÁFICO DEL MUNDO", W / 2, 470, 52, RED, PINK, lt, tpe)
                for q in range(6): sparkle(cr, 180 + q * 145, 600 + 40 * math.sin(lt * 3 + q), 18, [YEL, PINK, CYAN][q % 3], 0.8, lt * 2)
        else:
            # calendario que va pasando hojas hasta 8
            p = cl((lt - t8 + 0.2) / 1.0); day = 1 + int(7 * eout(p))
            cx, cy = W / 2, 830
            radial_glow(cr, cx, cy, 480, ORANGE, 0.35)
            cal = lambda c: rr(c, cx - 240, cy - 230, 480, 470, 48)
            volume(cr, cal, (0.98, 0.97, 1.0), (cx - 240, cy - 230, cx + 240, cy + 240), light=0.05, shade=0.15, sh_blur=40)
            top = lambda c: (c.save(), rr(c, cx - 240, cy - 230, 480, 120, 48), c.restore())
            cr.save(); cal(cr); cr.clip(); g = cairo.LinearGradient(0, cy - 230, 0, cy - 110); g.add_color_stop_rgb(0, 1.0, 0.45, 0.45); g.add_color_stop_rgb(1, 0.85, 0.15, 0.28); cr.set_source(g); cr.rectangle(cx - 240, cy - 230, 480, 120); cr.fill(); cr.restore()
            for s in (-1, 1):
                rr(cr, cx + s * 120 - 14, cy - 260, 28, 70, 14); cr.set_source_rgb(0.75, 0.76, 0.85); cr.fill()
            text(cr, "DÍAS", cx, cy - 145, 54, WHITE, font=DISPLAY_XB, sh=False)
            kd = pop(((lt - t8 + 0.2) * 7 % 1) / 0.5) if p < 1 else 1
            cr.save(); cr.translate(cx, cy + 130); cr.scale(kd, kd)
            text(cr, str(day), 0, 0, 300, (0.85, 0.15, 0.28), sh=False); cr.restore()
            for k in range(1, 8): ev("click", t8 - 0.2 + eout_inv(k / 7) * 1.0, g=0.6)
            if p >= 1:
                ev("ding", t8 + 0.8)
                callout(cr, "CASI 8 DÍAS AL AÑO", W / 2, 1230, 60, YEL, ORANGE, lt, t8 + 0.8, dark=True)
                ring_burst(cr, cx, cy, (lt - t8 - 0.8) / 0.6, YEL, 420, 12)
            callout(cr, "EN LA HORA PICO", W / 2, 470, 48, PINK, VIOLET, lt, t8 - 0.2)
    elif kind == "remate":
        tl = z.w("llegando"); tv = z.w("Viaducto"); tq = z.f(1)
        if lt < tq:
            # celular con mensaje "ya voy llegando" mientras el auto no avanza
            k = pop(lt / 0.4); cr.save(); cr.translate(W / 2 - 40, 790 + 8 * math.sin(lt * 3)); cr.rotate(-0.05); cr.scale(k * 0.95, k * 0.95)
            ph = lambda c: rr(c, -230, -400, 460, 800, 70)
            volume(cr, ph, (0.15, 0.15, 0.22), (-230, -400, 230, 400), light=0.2, shade=0.3, sh_blur=50)
            scr = lambda c: rr(c, -205, -370, 410, 740, 52)
            scr(cr); g = cairo.LinearGradient(0, -370, 0, 370); g.add_color_stop_rgb(0, 0.10, 0.20, 0.25); g.add_color_stop_rgb(1, 0.06, 0.10, 0.16); cr.set_source(g); cr.fill()
            rr(cr, -60, -355, 120, 28, 14); cr.set_source_rgb(0.05, 0.05, 0.08); cr.fill()
            text(cr, "Mamá", -150, -270, 40, WHITE, font=DISPLAY_XB, sh=False, align="l")
            bub1 = lambda c: rr(c, -180, -210, 300, 90, 30)
            bub1(cr); cr.set_source_rgb(0.25, 0.30, 0.38); cr.fill(); text(cr, "¿Dónde vienes?", -30, -152, 34, WHITE, font=DISPLAY_XB, sh=False)
            if lt > tl - 0.6:
                kk = pop((lt - tl + 0.6) / 0.35); ev("pop", tl - 0.6)
                cr.save(); cr.translate(40, -40); cr.scale(kk, kk)
                b2 = lambda c: rr(c, -170, -50, 340, 100, 34)
                volume(cr, b2, (0.20, 0.80, 0.45), (-170, -50, 170, 50), sh=False)
                text(cr, "Ya voy llegando", 0, 14, 38, WHITE, sh=False); cr.restore()
            if lt > tv:
                kk = pop((lt - tv) / 0.35); ev("pop", tv)
                cr.save(); cr.translate(-30, 120); cr.scale(kk, kk)
                b3 = lambda c: rr(c, -150, -45, 300, 90, 30)
                b3(cr); cr.set_source_rgb(0.25, 0.30, 0.38); cr.fill(); text(cr, "¿...en serio?", 0, 12, 36, WHITE, font=DISPLAY_XB, sh=False); cr.restore()
            cr.restore()
            car_side(cr, 860, 1290, 0.55, CAR_COLS[0], brake=1, t=lt, face="sad")
            if lt > tv: green_sign(cr, 210, 1230, 0.6 * pop((lt - tv) / 0.4), "VIADUCTO")
        else:
            k = pop((lt - tq) / 0.35); ev("impact", tq, g=0.4)
            radial_glow(cr, W / 2, 900, 560, MINT, 0.3)
            # casa → oficina con camino y auto que avanza despacito
            hx, ox, yy = 230, 850, 900
            rd = lambda c: (c.move_to(hx, yy + 110), c.curve_to(hx + 200, yy + 260, ox - 200, yy - 40, ox, yy + 110))
            cr.save(); cr.set_line_cap(cairo.LINE_CAP_ROUND); rd(cr); cr.set_line_width(46); cr.set_source_rgb(0.22, 0.22, 0.30); cr.stroke()
            rd(cr); cr.set_dash([26, 22], -lt * 40); cr.set_line_width(5); cr.set_source_rgba(1, 1, 1, 0.7); cr.stroke(); cr.restore()
            cr.save(); cr.translate(hx, yy); cr.scale(k, k)
            roof = lambda c: (c.move_to(-130, -10), c.line_to(0, -130), c.line_to(130, -10), c.close_path())
            body = lambda c: rr(c, -105, -20, 210, 150, 14)
            volume(cr, body, (1.0, 0.82, 0.55), (-105, -20, 105, 130)); volume(cr, roof, (1.0, 0.36, 0.45), (-130, -130, 130, -10), sh=False)
            rr(cr, -25, 50, 50, 80, 8); cr.set_source_rgb(0.55, 0.30, 0.18); cr.fill(); cr.restore()
            cr.save(); cr.translate(ox, yy); cr.scale(k, k)
            bld = lambda c: rr(c, -95, -190, 190, 320, 16)
            volume(cr, bld, (0.40, 0.55, 1.0), (-95, -190, 95, 130))
            for r_ in range(4):
                for c_ in range(3):
                    rr(cr, -70 + c_ * 52, -160 + r_ * 62, 36, 40, 6); cr.set_source_rgba(1, 0.92, 0.6, 0.9 if (r_ + c_ + int(lt * 2)) % 3 else 0.4); cr.fill()
            cr.restore()
            prog = 0.18 + 0.04 * math.sin(lt * 1.5)
            px = (1 - prog) ** 3 * hx + 3 * (1 - prog) ** 2 * prog * (hx + 200) + 3 * (1 - prog) * prog ** 2 * (ox - 200) + prog ** 3 * ox
            py = (1 - prog) ** 3 * (yy + 110) + 3 * (1 - prog) ** 2 * prog * (yy + 260) + 3 * (1 - prog) * prog ** 2 * (yy - 40) + prog ** 3 * (yy + 110)
            car_top(cr, px, py, 0.4, 1.3, YEL, brake=1)
            k2 = pop((lt - tq - 0.2) / 0.35)
            cr.save(); cr.translate(W / 2, 560); cr.rotate(-0.03); cr.scale(k2, k2)
            text(cr, "¿CUÁNTO HACES TÚ?", 0, 0, 84, grad=(lighten(YEL, 0.5), ORANGE), glow_c=ORANGE); cr.restore()
            callout(cr, "DÍMELO EN COMENTARIOS", W / 2, 1240, 44, MINT, (0.2, 0.75, 0.55), lt, tq + 0.8, dark=True)
            for q in range(4): sparkle(cr, 180 + q * 240, 690 + 25 * math.sin(lt * 3 + q), 20, [CYAN, PINK, YEL, MINT][q], 0.9, lt * 2)
    else:
        _orig(cr, kind, lt, z, ev)

def eout_inv(y):
    """inversa de eout para sincronizar clics del calendario."""
    return 1 - (1 - cl(y)) ** (1 / 3)

_orig = R.draw_scene
R.draw_scene = draw_scene

if __name__ == "__main__":
    R.main()
