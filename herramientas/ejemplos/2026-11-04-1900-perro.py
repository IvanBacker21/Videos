"""Short: ¿Por qué tu perro da vueltas antes de acostarse? (¿Por qué…? + experimento, estilo Material Design 3).
Uso (desde herramientas/): python3 ejemplos/2026-11-04-1900-perro.py ejemplos/2026-11-04-1900-perro.json OUT [frames t1,t2]"""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import cairo
import render3 as R
import material as M
from material import *

R.ROLES.update({"gancho": "cian", "lobo": "violeta", "nido": "verde", "bolita": "naranja", "experimento": "rosa", "remate": "coral"})
TAN = (0.93, 0.62, 0.30); TAN2 = (0.72, 0.42, 0.18); CREAM = (1.0, 0.92, 0.80)
GRAY = (0.62, 0.64, 0.74); GRAY2 = (0.42, 0.44, 0.55); PINKT = (1.0, 0.45, 0.55)
GRASS = (0.30, 0.72, 0.38); GRASS2 = (0.18, 0.55, 0.30); SNOW = (0.92, 0.96, 1.0)

def lw(cr, w): cr.set_line_width(w); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)

# ---------- personajes planos M3 ----------
def perro(cr, cx, cy, s, t, mood="feliz", lobo=False, gorro=False):
    """Perro (o lobo) sentado de frente: formas planas, orejas caídas (perro) o puntiagudas (lobo)."""
    col, col2 = (GRAY, GRAY2) if lobo else (TAN, TAN2)
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    # cola que se mueve
    wag = 0.5 * math.sin(t * (14 if mood == "feliz" else 5))
    cr.save(); cr.translate(95, 210); cr.rotate(-0.9 + wag)
    surface(cr, lambda c: rr(c, -18, -120, 36, 130, 18), col2, 1); cr.restore()
    # cuerpo
    surface(cr, lambda c: rr(c, -115, 60, 230, 220, 105), col, 2)
    cr.save(); rr(cr, -60, 90, 120, 170, 60); cr.set_source_rgb(*CREAM); cr.fill(); cr.restore()
    for px in (-55, 55): surface(cr, lambda c, px=px: rr(c, px - 35, 230, 70, 60, 30), col2, 1)
    # orejas
    if lobo:
        for sx in (-1, 1):
            _poly = [(sx * 40, -90), (sx * 120, -200), (sx * 125, -60)]
            surface(cr, lambda c, p=_poly: M._poly_round(c, p), col2, 1)
    else:
        for sx in (-1, 1):
            cr.save(); cr.translate(sx * 105, -30); cr.rotate(sx * (0.25 + 0.06 * math.sin(t * 3)))
            surface(cr, lambda c: rr(c, -38, -70, 76, 170, 38), col2, 2); cr.restore()
    # cabeza
    surface(cr, lambda c: c.arc(0, 0, 120, 0, 2 * math.pi), col, 3)
    if lobo:
        cr.move_to(-70, 30); cr.curve_to(-40, -20, 40, -20, 70, 30); cr.curve_to(60, 110, -60, 110, -70, 30); cr.set_source_rgb(*SNOW); cr.fill()
    if gorro:
        cr.save(); cr.translate(0, -60)
        surface(cr, lambda c: (c.arc(0, 0, 105, math.pi * 1.05, math.pi * 1.95), c.close_path()), C("rosa"), 2)
        cr.arc(0, -105, 22, 0, 2 * math.pi); cr.set_source_rgb(*SURF); cr.fill(); cr.restore()
    # hocico
    cr.save(); cr.translate(0, 50); cr.scale(1, 0.72); cr.arc(0, 0, 62, 0, 2 * math.pi); cr.restore(); cr.set_source_rgb(*CREAM); cr.fill()
    cr.save(); cr.translate(0, 28); cr.scale(1.3, 0.9); cr.arc(0, 0, 20, 0, 2 * math.pi); cr.restore(); cr.set_source_rgb(*INK); cr.fill()
    cr.set_source_rgb(*INK); lw(cr, 8)
    if mood == "sorpresa":
        cr.arc(0, 72, 14, 0, 2 * math.pi); cr.fill()
    elif mood == "preocupado":
        cr.move_to(-22, 76); cr.curve_to(-8, 64, 8, 64, 22, 76); cr.stroke()
    else:
        cr.move_to(0, 46); cr.line_to(0, 60); cr.stroke()
        cr.arc(-16, 60, 16, 0, math.pi); cr.stroke(); cr.arc(16, 60, 16, 0, math.pi); cr.stroke()
        if mood == "feliz":
            cr.save(); cr.translate(0, 84 + 4 * math.sin(t * 10)); rr(cr, -16, -8, 32, 34, 15); cr.set_source_rgb(*PINKT); cr.fill(); cr.restore()
    # ojos
    cr.set_source_rgb(*INK)
    blink = (t % 2.7) < 0.1 or mood == "dormido"
    for ex in (-45, 45):
        if blink:
            lw(cr, 8); cr.move_to(ex - 15, -18); cr.curve_to(ex - 5, -10, ex + 5, -10, ex + 15, -18); cr.stroke()
        else:
            r_ = 18 if mood == "sorpresa" else 15
            cr.arc(ex, -18, r_, 0, 2 * math.pi); cr.fill()
            cr.arc(ex + 5, -23, 5, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*INK)
            if mood == "preocupado":
                lw(cr, 7); cr.move_to(ex - 18, -50 - (6 if ex < 0 else -6) * -1); cr.line_to(ex + 18, -50 + (6 if ex < 0 else -6) * -1); cr.stroke()
    cr.restore()

def perro_arriba(cr, cx, cy, s, ang, t, lobo=False):
    """Perro visto desde arriba, caminando en la dirección `ang` (rad)."""
    col, col2 = (GRAY, GRAY2) if lobo else (TAN, TAN2)
    cr.save(); cr.translate(cx, cy); cr.rotate(ang); cr.scale(s, s)
    step = math.sin(t * 16) * 14
    for (lx, ly, ph) in ((40, -42, 1), (40, 42, -1), (-45, -42, -1), (-45, 42, 1)):
        surface(cr, lambda c, lx=lx, ly=ly, ph=ph: c.arc(lx + ph * step, ly, 16, 0, 2 * math.pi), col2, 1)
    cr.save(); cr.translate(-85, 0); cr.rotate(0.6 * math.sin(t * 14))
    surface(cr, lambda c: rr(c, -70, -11, 75, 22, 11), col2, 1); cr.restore()
    surface(cr, lambda c: (c.save(), c.scale(1, 0.62), c.arc(0, 0, 90, 0, 2 * math.pi), c.restore()), col, 2)
    surface(cr, lambda c: c.arc(85, 0, 46, 0, 2 * math.pi), col, 3)
    for sy in (-1, 1):
        if lobo: surface(cr, lambda c, sy=sy: M._poly_round(c, [(70, sy * 25), (55, sy * 70), (95, sy * 35)]), col2, 1)
        else: surface(cr, lambda c, sy=sy: (c.save(), c.translate(72, sy * 42), c.scale(1.3, 0.7), c.arc(0, 0, 20, 0, 2 * math.pi), c.restore()), col2, 1)
    cr.arc(130, 0, 11, 0, 2 * math.pi); cr.set_source_rgb(*INK); cr.fill()
    cr.restore()

def perro_bolita(cr, cx, cy, s, t, col=TAN, col2=TAN2):
    """Perro enroscado (vista de arriba) con la cola tapándole la nariz, dormido."""
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    br = 1 + 0.025 * math.sin(t * 2.5)
    cr.save(); cr.scale(br, br)
    surface(cr, lambda c: c.arc(0, 0, 170, 0, 2 * math.pi), col, 3)
    cr.arc(0, 0, 105, 0, 2 * math.pi); cr.set_source_rgb(*mix(col, col2, 0.35)); cr.fill()
    cr.restore()
    for (px, py) in ((-60, 120), (10, 135)): surface(cr, lambda c, px=px, py=py: c.arc(px, py, 30, 0, 2 * math.pi), col2, 1)
    # cabeza
    surface(cr, lambda c: c.arc(70, -40, 85, 0, 2 * math.pi), col, 3)
    for (ex, ang) in ((0, -0.6), (140, 0.6)):
        cr.save(); cr.translate(70 + (ex - 70) * 0.85, -110); cr.rotate(ang)
        surface(cr, lambda c: rr(c, -25, -45, 50, 95, 25), col2, 1); cr.restore()
    cr.set_source_rgb(*INK); lw(cr, 8)
    for ex in (40, 105):
        cr.move_to(ex - 15, -45); cr.curve_to(ex - 5, -36, ex + 5, -36, ex + 15, -45); cr.stroke()
    cr.save(); cr.translate(75, 5); cr.scale(1.3, 0.9); cr.arc(0, 0, 16, 0, 2 * math.pi); cr.restore(); cr.fill()
    # cola enroscada encima del hocico
    lw(cr, 46); cr.set_source_rgb(*col2)
    cr.arc(10, 10, 140, math.pi * 0.05, math.pi * 0.55); cr.stroke()
    cr.restore()

def flecha_giro(cr, cx, cy, r, t, rol="amarillo", speed=3.0, w=14):
    """Flecha circular que gira (indica vueltas)."""
    a0 = t * speed; cr.set_source_rgb(*C(rol)); lw(cr, w)
    cr.arc(cx, cy, r, a0, a0 + math.pi * 1.4); cr.stroke()
    a1 = a0 + math.pi * 1.4; tx, ty = cx + r * math.cos(a1), cy + r * math.sin(a1)
    dx, dy = -math.sin(a1), math.cos(a1); nx, ny = math.cos(a1), math.sin(a1); h = w * 2.2
    cr.move_to(tx + dx * h, ty + dy * h); cr.line_to(tx + nx * h * 0.8, ty + ny * h * 0.8); cr.line_to(tx - nx * h * 0.8, ty - ny * h * 0.8); cr.close_path(); cr.fill()

def pino(cr, x, y, s, k):
    cr.save(); cr.translate(x, y); cr.scale(s * k, s * k)
    surface(cr, lambda c: rr(c, -14, -10, 28, 60, 10), (0.45, 0.28, 0.20), 1)
    for i, (w, yy) in enumerate(((120, -20), (95, -90), (68, -155))):
        surface(cr, lambda c, w=w, yy=yy: M._poly_round(c, [(-w, yy + 10), (0, yy - 95), (w, yy + 10)]), mix(GRASS2, GRASS, i * 0.3), 2)
    cr.restore()

def bicho(cr, x, y, ang, t, col=INK):
    cr.save(); cr.translate(x, y); cr.rotate(ang); lw(cr, 5); cr.set_source_rgb(*col)
    for k in (-1, 0, 1):
        wig = 6 * math.sin(t * 30 + k)
        cr.move_to(k * 12, 0); cr.line_to(k * 12 + wig, -22); cr.move_to(k * 12, 0); cr.line_to(k * 12 - wig, 22)
    cr.stroke(); cr.save(); cr.scale(1.5, 1); cr.arc(0, 0, 16, 0, 2 * math.pi); cr.restore(); cr.fill(); cr.restore()

def vibora(cr, x, y, ang, t):
    cr.save(); cr.translate(x, y); cr.rotate(ang); lw(cr, 26); cr.set_source_rgb(*C("amarillo"))
    for i in range(30):
        px = -i * 8; py = 22 * math.sin(i * 0.35 - t * 10)
        cr.line_to(px, py) if i else cr.move_to(px, py)
    cr.stroke(); cr.arc(8, 22 * math.sin(-t * 10) * 0, 20, 0, 2 * math.pi); cr.fill()
    cr.set_source_rgb(*INK); cr.arc(14, -7, 4, 0, 2 * math.pi); cr.fill(); cr.restore()

def cojin(cr, cx, cy, r, t, rol="coral"):
    blob(cr, "squircle", cx, cy, r, C(rol), 3, morph=0.3)
    shape(cr, "squircle", cx, cy, r * 0.72, morph=0.5); cr.set_source_rgb(*C(rol, 1)); cr.fill()

def mini_card_icon(cr, cx, cy, s, kind, lt, t0, t):
    """Tarjeta pequeña (cama / cobija) tachada: lo que NO había en el bosque."""
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.5); cr.save(); cr.translate(cx, cy); cr.scale(k * s, k * s)
    card(cr, -140, -120, 280, 240, SURF, 3, 54)
    if kind == "cama": cojin(cr, 0, -10, 75, t, "cian")
    else:
        surface(cr, lambda c: rr(c, -95, -75, 190, 130, 28), C("violeta"), 2)
        for k2 in range(3): cr.rectangle(-95, -50 + k2 * 40, 190, 14); cr.set_source_rgb(*C("violeta", 1)); cr.fill()
    blob(cr, "circle", 110, -95, 42, C("coral"), 3); cr.save(); cr.translate(110, -95); ic_close(cr, 22, (1, 1, 1)); cr.restore()
    text(cr, "CAMA" if kind == "cama" else "COBIJA", 0, 100, 34, INK, font=DISPLAY_XB, sh=False)
    cr.restore()

# ---------- escenas ----------
def draw_scene(cr, kind, lt, z, ev):
    if kind == "gancho":
        ev("whoosh", 0.0)
        k = bounce_in(lt / 0.4)
        cr.save(); cr.translate(W / 2, 880); cr.scale(k, k)
        blob(cr, "flower", 0, 0, 380, C("cian", 1), 2, rot=lt * 0.2)
        cojin(cr, 0, 0, 200, lt)
        R_ = 300; ang = lt * 2.6 - 1.2
        # rastro punteado
        cr.set_source_rgba(1, 1, 1, 0.85); lw(cr, 10); cr.set_dash([2, 26])
        cr.arc(0, 0, R_, ang - 2.4, ang - 0.3); cr.stroke(); cr.set_dash([])
        perro_arriba(cr, R_ * math.cos(ang), R_ * math.sin(ang), 1.1, ang + math.pi / 2, lt)
        vuelta = int((lt * 2.6) / (2 * math.pi)) + 1
        big_number(cr, str(min(vuelta, 9)), 0, 0, 120, "amarillo", lt=lt, t0=0.1)
        cr.restore()
        for n in range(1, 4):
            tv = (2 * math.pi * (n - 1)) / 2.6
            if lt > tv + 0.05: ev("pop", tv + 0.05)
        chip(cr, "¿POR QUÉ DA VUELTAS?", W / 2, 470, 52, "amarillo", lt=lt, t0=0.0, icon=ic_bulb)
        mascota(cr, 905, 1235, 78, lt, "sorpresa" if lt < z.f(1) else "pensando", lt=lt, t0=0.35)
        t1 = z.f(1)
        if lt > t1:
            ev("ding", t1); chip(cr, "AL FINAL: EL EXPERIMENTO", 430, 1240, 38, "noche", lt=lt, t0=t1, icon=ic_star)
    elif kind == "lobo":
        tl, tb, tc, tco = z.w("lobos"), z.w("bosque"), z.w("camitas"), z.w("cobijas")
        # pinos en cascada (bosque)
        if lt > tb:
            for i, (x, y, s) in enumerate(((150, 1060, 1.0), (930, 1040, 1.1), (290, 690, 0.7), (820, 660, 0.75))):
                p = stagger(lt - tb, i, 0.1, 0.5)
                if p > 0: pino(cr, x, y, s, bounce_in(p))
            ev("pop", tb)
        k = bounce_in(lt / 0.45)
        cr.save(); cr.translate(W / 2, 830); cr.scale(k, k)
        blob(cr, "burst", 0, 40, 300, C("violeta", 1), 2, rot=lt * 0.25)
        cr.restore()
        if lt < tc:
            perro(cr, W / 2 + 40, 760, 1.15 * k, lt, "feliz", lobo=lt > tl)
            if lt > tl: ev("impact", tl, g=0.5); ripple(cr, W / 2, 830, (lt - tl) / 0.6, (1, 1, 1), 420)
            # el perrito chiquito, su descendiente
            if lt > 0.3 and lt < tb:
                p = bounce_in((lt - 0.3) / 0.5); cr.save(); cr.translate(230, 1130); cr.scale(p, p)
                perro(cr, 0, 0, 0.45, lt, "sorpresa"); cr.restore()
                cr.set_source_rgba(1, 1, 1, 0.8); lw(cr, 9); cr.set_dash([4, 22])
                cr.move_to(320, 1090); cr.curve_to(380, 1000, 400, 960, 430, 930); cr.stroke(); cr.set_dash([])
            chip(cr, "SU ANCESTRO: EL LOBO", W / 2, 470, 46, "noche", lt=lt, t0=tl, icon=ic_star)
        else:
            perro(cr, W / 2, 740, 0.95, lt, "sorpresa", lobo=True)
            mini_card_icon(cr, 300, 1150, 1.0, "cama", lt, tc, lt); ev("pop", tc)
            mini_card_icon(cr, 780, 1150, 1.0, "cobija", lt, tco, lt); ev("pop", tco)
            chip(cr, "EN EL BOSQUE NO HABÍA...", W / 2, 470, 42, "noche", lt=lt, t0=tc)
    elif kind == "nido":
        tp, tn, tb, tv = z.w("pasto"), z.w("nieve"), z.w("bichos"), z.w("víboras")
        k = bounce_in(lt / 0.45); cx, cy = W / 2, 900
        cr.save(); cr.translate(cx, cy); cr.scale(k, k); cr.translate(-cx, -cy)
        card(cr, 110, 560, 860, 700, SURF, 4, 70)
        cr.save(); rr(cr, 140, 590, 800, 640, 54); cr.clip()
        sn = emph((lt - tn) / 0.6) if lt > tn else 0
        cr.set_source_rgb(*mix(GRASS2, SNOW, sn)); cr.paint()
        flat = emph(lt / 2.4)
        rnd = random.Random(4)
        for _ in range(140):
            x, y = rnd.uniform(150, 930), rnd.uniform(600, 1230)
            d = math.hypot(x - cx, y - cy); inside = d < 230
            h = 46 * (1 - 0.85 * flat if inside else 1)
            sw = 6 * math.sin(lt * 2 + x * 0.05)
            cr.move_to(x, y); cr.curve_to(x + sw, y - h * 0.5, x + sw, y - h * 0.7, x + sw * 1.6 + (14 if inside else 0) * flat, y - h)
            cr.set_source_rgb(*mix(GRASS, (0.70, 0.82, 0.95), sn)); lw(cr, 10); cr.stroke()
        # huella aplastada
        cr.save(); cr.translate(cx, cy); cr.scale(1, 0.85); cr.arc(0, 0, 220 * flat, 0, 2 * math.pi); cr.restore()
        cr.set_source_rgba(*mix(GRASS2, SNOW, sn), 0.9); cr.fill()
        ang = lt * 2.8
        if lt < tb + 0.6:
            perro_arriba(cr, cx + 150 * math.cos(ang), cy + 125 * math.sin(ang), 1.05, ang + math.pi / 2, lt, lobo=True)
        else:
            perro_bolita(cr, cx, cy, 0.62 * bounce_in((lt - tb - 0.6) / 0.5), lt, GRAY, GRAY2)
        # bichos y víbora huyen
        if lt > tb:
            pb = lt - tb
            for i in range(6):
                a = i * 1.05 + 0.3; dist = 180 + pb * 420
                bicho(cr, cx + dist * math.cos(a), cy + dist * math.sin(a) * 0.85, a, lt)
            ev("pop", tb)
        if lt > tv:
            pv = lt - tv; vibora(cr, cx + 120 + pv * 520, cy + 200, 0.2, lt); ev("whoosh", tv)
        cr.restore(); cr.restore()
        if lt < tb:
            chip(cr, "NIEVE" if lt > tn else "PASTO", W / 2, 585, 46, "amarillo" if lt > tn else "verde", lt=lt, t0=tp if lt < tn else tn)
            if lt > tp: ev("pop", tp)
            if lt > tn: ev("pop", tn)
        chip(cr, "¡FUERA BICHOS!" if lt > tb else "APLASTA SU CAMITA", W / 2, 470, 48, "coral" if lt > tb else "noche",
             lt=lt, t0=tb if lt > tb else 0.4, icon=ic_close if lt > tb else ic_check)
    elif kind == "bolita":
        tb, tc, tco = z.w("bolita"), z.w("calor"), z.w("cobija")
        k = bounce_in(lt / 0.45)
        cr.save(); cr.translate(W / 2, 860); cr.scale(k, k)
        blob(cr, "flower", 0, 0, 360, C("naranja", 1), 2, rot=lt * 0.25)
        cr.restore()
        if lt < tb:
            ang = lt * 3.0
            perro_arriba(cr, W / 2 + 120 * math.cos(ang), 860 + 120 * math.sin(ang), 0.9, ang + math.pi / 2, lt)
            flecha_giro(cr, W / 2, 860, 270, lt, "amarillo", 3.0)
        else:
            perro_bolita(cr, W / 2 - 20, 870, 1.05 * bounce_in((lt - tb) / 0.5), lt)
            ev("pop", tb)
            # zzz
            for i in range(3):
                ph = ((lt - tb) * 0.7 + i / 3) % 1
                text(cr, "z", 740 + ph * 90, 640 - ph * 160, 40 + i * 14, INK, font=DISPLAY, sh=False, alpha=1 - ph)
        chip(cr, "HECHO BOLITA", W / 2, 470, 50, "noche", lt=lt, t0=tb)
        if lt > tc:
            ev("ding", tc)
            for i in range(5):
                p = stagger(lt - tc, i, 0.09, 0.5)
                if p <= 0: continue
                a = -math.pi * 0.85 + i * math.pi * 0.42; r = 340
                cr.save(); cr.translate(W / 2 + r * math.cos(a), 870 + r * math.sin(a) * 0.95); cr.scale(bounce_in(p), bounce_in(p))
                blob(cr, "circle", 0, 0, 48, C("coral"), 3); ic_flame(cr, 26, (1, 1, 1)); cr.restore()
            chip(cr, "GUARDA SU CALOR", W / 2, 1270, 50, "coral", lt=lt, t0=tc, icon=ic_flame)
        if lt > tco:
            ev("whoosh", tco); p = emph((lt - tco) / 0.6)
            cr.save(); cr.translate(W / 2, 1080 + (1 - p) * 300); cr.rotate(-0.06)
            cr.save(); rr(cr, -300, -110, 600, 170, 50); cr.clip()
            surface(cr, lambda c: rr(c, -300, -110, 600, 170, 50), C("violeta"), 3)
            for k2 in range(4): cr.rectangle(-300, -90 + k2 * 44, 600, 16); cr.set_source_rgb(*C("violeta", 1)); cr.fill()
            cr.restore(); cr.restore()
    elif kind == "experimento":
        tl, tu, tci, tpe, tm, tca = z.w("lisa"), z.w("uno"), z.w("cinco"), z.w("peluda"), z.w("mitad"), z.w("cama")
        chip(cr, "UN PSICÓLOGO LO PROBÓ", W / 2, 470, 44, "noche", lt=lt, t0=0.15, icon=ic_bulb)
        if lt > 0.15: ev("pop", 0.15)
        def tablero(cx, t0, peluda, giran, tg, rol):
            if lt < t0: return
            k = bounce_in((lt - t0) / 0.5); cr.save(); cr.translate(cx, 870); cr.scale(k, k)
            card(cr, -215, -300, 430, 600, SURF, 4, 54)
            # muestra de alfombra
            cr.save(); rr(cr, -185, -270, 370, 120, 36); cr.clip()
            cr.set_source_rgb(*C(rol, 1)); cr.paint()
            if peluda:
                cr.set_source_rgb(*C(rol)); lw(cr, 9)
                for i in range(26):
                    x = -185 + i * 15; cr.move_to(x, -150); cr.curve_to(x + 8 * math.sin(lt * 3 + i), -200, x - 6, -230, x + 10 * math.sin(i * 1.7), -265 + 8 * math.sin(i * 2.3)); cr.stroke()
            cr.restore()
            lab = "PELUDA" if peluda else "LISA"; surface(cr, lambda c: rr(c, -120, -245, 240, 74, 37), SURF, 2)
            text(cr, lab, 0, -192, 42, C(rol), font=DISPLAY, sh=False)
            pos = [(-115, -40), (0, -40), (115, -40), (-60, 140), (60, 140)]
            for j, (px, py) in enumerate(pos):
                pj = stagger(lt - t0 - 0.2, j, 0.07, 0.45)
                if pj <= 0: continue
                gira = j in giran and lt > tg
                cr.save(); cr.translate(px, py); cr.scale(bounce_in(pj), bounce_in(pj))
                if gira:
                    blob(cr, "circle", 0, 10, 68, C("amarillo", 1), 0)
                    flecha_giro(cr, 0, 10, 68, lt + j, "amarillo", 5.0, 9)
                perro(cr, 0, -5, 0.27, lt + j, "feliz" if gira else "dormido")
                cr.restore()
            cr.restore()
        tablero(290, 1.4, False, (2,), tu, "cian")
        tablero(790, tpe, True, (0, 2, 3), tpe + 0.6, "rosa")
        if lt > tu: ev("ding", tu)
        if lt > tpe: ev("pop", tpe)
        if lt > tpe + 0.6: ev("ding", tpe + 0.6)
        chip(cr, "1 DE CADA 5", 290, 1235, 40, "cian", lt=lt, t0=tci)
        if lt > tm:
            chip(cr, "MÁS DE LA MITAD", 790, 1235, 38, "rosa", lt=lt, t0=tm); ev("pop", tm)
        if lt > tca:
            ev("impact", tca, g=0.6); kk = bounce_in((lt - tca) / 0.5)
            cr.save(); cr.translate(W / 2, 880); cr.rotate(-0.12); cr.scale(kk, kk)
            surface(cr, lambda c: rr(c, -400, -95, 800, 190, 95), C("amarillo"), 5)
            text(cr, "¡TENDIENDO SU CAMA!", 0, 30, 74, INK, font=DISPLAY, sh=False); cr.restore()
    elif kind == "remate":
        tn, tmu, tv, tma = z.w("normales"), z.w("muchísimas"), z.w("veterinario"), z.w("mándaselo")
        if lt < tma:
            k = bounce_in(lt / 0.45)
            cr.save(); cr.translate(W / 2, 850); cr.scale(k, k)
            blob(cr, "scallop", 0, 20, 330, C("coral", 1), 2, rot=lt * 0.2)
            cr.restore()
            fast = lt > tmu
            flecha_giro(cr, W / 2, 870, 300, lt * (3 if fast else 1), "amarillo" if not fast else "coral", 3.0, 16)
            perro(cr, W / 2, 790, 1.0 * k, lt, "preocupado" if fast else "feliz")
            if not fast:
                chip(cr, "UNAS VUELTAS: NORMAL", W / 2, 470, 46, "verde", lt=lt, t0=tn, icon=ic_check)
                if lt > tn: ev("ding", tn)
            else:
                ev("zap", tmu)
                chip(cr, "¿MUCHÍSIMAS?", W / 2, 470, 50, "coral", lt=lt, t0=tmu, icon=ic_bolt)
                chip(cr, "AL VETERINARIO", W / 2, 1255, 50, "noche", lt=lt, t0=tv, icon=ic_heart)
                if lt > tv: ev("pop", tv)
        else:
            lt2 = lt - tma; k = bounce_in(lt2 / 0.45)
            cr.save(); cr.translate(W / 2, 830); cr.scale(k, k)
            card(cr, -390, -330, 780, 640, SURF, 4, 64)
            surface(cr, lambda c: rr(c, -390, -330, 780, 130, 64), C("rosa"), 0)
            cr.rectangle(-390, -260, 780, 60); cr.set_source_rgb(*C("rosa")); cr.fill()
            blob(cr, "circle", -300, -265, 44, C("rosa", 1), 1); cr.save(); cr.translate(-300, -265); ic_heart(cr, 24, C("rosa")); cr.restore()
            text(cr, "Papá de Firulais", -40, -248, 46, (1, 1, 1), font=DISPLAY_XB, sh=False)
            surface(cr, lambda c: rr(c, -350, -170, 400, 330, 44), C("rosa", 1), 1)
            cr.save(); rr(cr, -350, -170, 400, 330, 44); cr.clip()
            perro(cr, -150, -50, 0.62, lt, "feliz", gorro=True); cr.restore()
            if lt2 > 0.5:
                p = bounce_in((lt2 - 0.5) / 0.5); cr.save(); cr.translate(190, 30); cr.scale(p, p)
                surface(cr, lambda c: rr(c, -150, -60, 300, 120, 44), C("rosa"), 2)
                text(cr, "¡Es él!", 0, 16, 46, (1, 1, 1), font=DISPLAY_XB, sh=False); cr.restore()
            if lt2 > 1.1:
                p = bounce_in((lt2 - 1.1) / 0.5); cr.save(); cr.translate(-60, 230); cr.scale(p, p)
                surface(cr, lambda c: rr(c, -220, -50, 440, 100, 46), (0.93, 0.93, 0.97), 1)
                text(cr, "¡Mi bebé hace eso!", 0, 14, 38, INK, font=DISPLAY_XB, sh=False); cr.restore()
            cr.restore()
            chip(cr, "MÁNDASELO", W / 2, 470, 50, "rosa", lt=lt, t0=tma, icon=ic_share)
            fab(cr, W / 2, 1240, 80, "rosa", ic_share, lt=lt, t0=tma + 0.2)
            ev("pop", tma); ev("pop", tma + 0.5); ev("ding", tma + 1.1)
            ripple(cr, W / 2, 1240, (lt2 - 0.6) / 0.6, C("rosa", 1), 300); ev("click", tma + 0.6)
    else:
        _orig(cr, kind, lt, z, ev)

_orig = R.draw_scene
R.draw_scene = draw_scene

if __name__ == "__main__":
    R.main()
