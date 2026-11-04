"""Short: Por esto NO puedes dejar el picante 🌶️ (estilo Material Design 3).
Uso (desde herramientas/): python3 ejemplos/2026-11-04-1330-picante.py ejemplos/2026-11-04-1330-picante.json OUT [frames t1,t2]"""
import sys, os, math, random
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import cairo
import render3 as R
import material as M
from material import *

R.ROLES.update({"gancho": "coral", "engano": "naranja", "premio": "violeta", "truco": "cian", "pajaros": "verde", "remate": "rosa"})
RED, GREEN = (0.93, 0.20, 0.22), (0.18, 0.66, 0.30)

# ---------- personajes planos M3 ----------
def chile(cr, cx, cy, s, t, mood="feliz", sweat=0.0):
    cr.save(); cr.translate(cx, cy); cr.rotate(0.12 * math.sin(t * 2)); cr.scale(s, s)
    body = lambda c: (c.move_to(-40, -150), c.curve_to(90, -150, 120, -20, 70, 90), c.curve_to(30, 180, -30, 230, -10, 260),
                      c.curve_to(-90, 220, -130, 60, -120, -40), c.curve_to(-115, -110, -90, -150, -40, -150), c.close_path())
    surface(cr, body, RED, 4)
    cr.save(); body(cr); cr.clip(); cr.set_source_rgba(1, 1, 1, 0.18); cr.arc(-60, -60, 40, 0, 2 * math.pi); cr.fill(); cr.restore()
    stem = lambda c: (c.move_to(-60, -150), c.curve_to(-50, -200, 10, -205, 20, -150), c.close_path())
    surface(cr, stem, GREEN, 2)
    cr.set_source_rgb(*GREEN); cr.set_line_width(16); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.move_to(-20, -190); cr.curve_to(-20, -240, 30, -250, 50, -230); cr.stroke()
    cr.set_source_rgb(*INK); cr.set_line_cap(cairo.LINE_CAP_ROUND)
    for ex in (-70, 10):
        if mood == "llora":
            cr.set_line_width(11); cr.move_to(ex - 18, -40); cr.line_to(ex + 18, -30); cr.stroke()
        else:
            cr.arc(ex, -35, 15, 0, 2 * math.pi); cr.fill(); cr.arc(ex + 5, -40, 5, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*INK)
    if mood == "llora":
        cr.arc(-30, 40, 30, math.pi, 2 * math.pi); cr.fill()
        for k, ex in enumerate((-70, 10)):
            ph = (t * 1.5 + k * 0.5) % 1
            cr.save(); cr.translate(ex, -15 + ph * 120); ic_drop(cr, 16, M.C("cian")); cr.restore()
    else:
        cr.set_line_width(10); cr.arc(-30, 15, 30, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    for k in range(int(3 * sweat)):
        ph = (t * 1.2 + k / 3) % 1
        cr.save(); cr.translate(90 + k * 18, -120 + ph * 90); ic_drop(cr, 14, M.C("cian", 1)); cr.restore()
    cr.restore()

def bird(cr, cx, cy, s, t, peck=0.0):
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    blob(cr, "circle", 0, 0, 120, M.C("amarillo"), 4)
    wing = lambda c: (c.save(), c.translate(-40, 30), c.rotate(-0.4 + 0.3 * math.sin(t * 12)), c.scale(70, 40), c.arc(0, 0, 1, 0, 2 * math.pi), c.restore())
    surface(cr, wing, M.C("naranja"), 2)
    beak = lambda c: (c.move_to(95, -20 + peck * 20), c.line_to(170, 5 + peck * 30), c.line_to(95, 25 + peck * 20), c.close_path())
    surface(cr, beak, M.C("naranja"), 2)
    cr.arc(45, -30, 16, 0, 2 * math.pi); cr.set_source_rgb(*INK); cr.fill(); cr.arc(50, -35, 5, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill()
    cr.restore()

def glass_cup(cr, cx, cy, fill, ok, t, lt, t0):
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.6); cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    card(cr, -170, -230, 340, 460, SURF, 4, 56)
    cup = lambda c: (c.move_to(-90, -150), c.line_to(90, -150), c.line_to(70, 140), c.line_to(-70, 140), c.close_path())
    cup(cr); cr.set_source_rgb(0.90, 0.93, 0.98); cr.fill()
    cr.save(); cup(cr); cr.clip(); h = 220; cr.rectangle(-100, 140 - h, 200, h); cr.set_source_rgb(*fill); cr.fill()
    cr.set_source_rgba(1, 1, 1, 0.5); cr.rectangle(-100, 140 - h, 200, 10); cr.fill(); cr.restore()
    cup(cr); cr.set_source_rgb(*darken((0.9, 0.93, 0.98), 0.25)); cr.set_line_width(6); cr.stroke()
    blob(cr, "circle", 120, -180, 50, M.C("verde") if ok else M.C("coral"), 3)
    cr.save(); cr.translate(120, -180); (ic_check if ok else ic_close)(cr, 26, (1, 1, 1)); cr.restore()
    cr.restore()

# ---------- escenas ----------
def draw_scene(cr, kind, lt, z, ev):
    if kind == "gancho":
        ev("whoosh", 0.0)
        blob(cr, "burst", W / 2, 900, 380 + 15 * math.sin(lt * 6), M.C("coral", 1), 2, rot=lt * 0.4)
        k = bounce_in(lt / 0.5); cr.save(); cr.translate(W / 2, 960); cr.scale(k, k)
        chile(cr, 0, 0, 1.25, lt, "llora", sweat=1.0); cr.restore()
        for i, (x, y) in enumerate(((210, 640), (880, 680), (240, 1230), (860, 1200))):
            p = stagger(lt, i, 0.12, 0.5)
            if p > 0:
                cr.save(); cr.translate(x, y + 8 * math.sin(lt * 5 + i)); cr.scale(bounce_in(p), bounce_in(p))
                blob(cr, "circle", 0, 0, 62, M.C("naranja"), 3); ic_flame(cr, 34, (1, 1, 1)); cr.restore()
        ts = z.f(1)
        if lt > ts:
            ev("pop", ts); chip(cr, "+ SALSA", W / 2, 470, 60, "amarillo", lt=lt, t0=ts, icon=ic_flame)
    elif kind == "engano":
        t1, t2 = z.f(1), z.f(2)
        # termómetro tipo chip que NO sube
        chip(cr, "NO ESTÁ CALIENTE", W / 2, 470, 46, "noche", lt=lt, t0=0.1, icon=ic_close)
        # lengua con receptores
        tongue = lambda c: rr(c, W / 2 - 330, 820, 660, 300, 150)
        surface(cr, tongue, (1.0, 0.55, 0.62), 3)
        for i in range(5):
            x = W / 2 - 240 + i * 120; on = lt > t1 + 0.3 + i * 0.12
            blob(cr, "squircle", x, 900, 34, M.C("amarillo") if on else (1.0, 0.75, 0.80), 1)
            if on:
                cr.save(); cr.translate(x, 900); ic_bolt(cr, 18, M.C("amarillo", 2)); cr.restore()
                if i == 0: ev("zap", t1 + 0.3)
        # moléculas de capsaicina cayendo como chiles chiquitos
        if lt > t1:
            for i in range(5):
                p = cl((lt - t1 - i * 0.12) / 0.45)
                if 0 < p < 1:
                    x = W / 2 - 240 + i * 120; y = 620 + 270 * emph(p)
                    blob(cr, "pill", x, y, 22, RED, 2)
        if lt > t1: chip(cr, "CAPSAICINA", W / 2, 640, 40, "coral", tonal=True, lt=lt, t0=t1)
        # alerta del cerebro
        if lt > t2:
            ev("impact", t2, g=0.5); k = bounce_in((lt - t2) / 0.5)
            cr.save(); cr.translate(W / 2, 1250); cr.scale(k, k)
            card(cr, -330, -80, 660, 160, M.C("coral"), 4, 80)
            cr.save(); cr.translate(-240, 0); ic_flame(cr, 44, (1, 1, 1)); cr.restore()
            text(cr, "¡ALERTA: FUEGO!", 40, 22, 58, (1, 1, 1), font=DISPLAY, sh=False); cr.restore()
            ripple(cr, W / 2, 1250, (lt - t2) / 0.6, M.C("coral", 1), 450)
    elif kind == "premio":
        t1, t2 = z.f(1), z.f(2)
        k = bounce_in(lt / 0.5)
        cr.save(); cr.translate(W / 2, 860); cr.scale(k, k)
        blob(cr, "flower", 0, 0, 300, M.C("violeta", 1), 3, rot=lt * 0.35)
        blob(cr, "circle", 0, 0, 190, M.C("violeta"), 4)
        cr.set_source_rgb(1, 1, 1); cr.set_line_width(14); cr.set_line_cap(cairo.LINE_CAP_ROUND)
        for ex in (-60, 60):
            cr.arc(ex, -30, 26, math.pi * 1.1, math.pi * 1.9); cr.stroke()
        cr.arc(0, 30, 70, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
        cr.restore()
        chip(cr, "ENDORFINAS", W / 2, 470, 52, "violeta", lt=lt, t0=z.w("endorfinas"), icon=ic_heart)
        if lt > z.w("endorfinas"): ev("ding", z.w("endorfinas"))
        if lt > t1:
            for i in range(8):
                ang = i * math.pi / 4 + lt * 0.8; r = 330 + 20 * math.sin(lt * 4 + i)
                p = stagger(lt - t1, i, 0.05, 0.4)
                cr.save(); cr.translate(W / 2 + math.cos(ang) * r, 860 + math.sin(ang) * r); cr.scale(bounce_in(p), bounce_in(p))
                (ic_heart if i % 2 else ic_star)(cr, 30, M.C("rosa") if i % 2 else M.C("amarillo")); cr.restore()
        if lt > t2:
            ev("pop", t2); chip(cr, "OTRA MORDIDA", W / 2, 1235, 54, "amarillo", lt=lt, t0=t2, icon=ic_flame)
    elif kind == "truco":
        tl, tw = z.w("leche"), z.w("atrapa")
        chip(cr, "¿CÓMO LO APAGAS?", W / 2, 450, 48, "noche", lt=lt, t0=0.05, icon=ic_bulb)
        glass_cup(cr, 300, 900, (0.55, 0.80, 1.0), False, lt, lt, tl)
        glass_cup(cr, 780, 900, (0.99, 0.98, 0.94), True, lt, lt, tl + 0.25)
        if lt > tl:
            ev("pop", tl); ev("pop", tl + 0.25)
            text(cr, "AGUA", 300, 1200, 52, (1, 1, 1), font=DISPLAY, sh=False, alpha=ease((lt - tl) / 0.3))
            text(cr, "LECHE", 780, 1200, 52, (1, 1, 1), font=DISPLAY, sh=False, alpha=ease((lt - tl - 0.25) / 0.3))
        if lt > tw:
            ev("ding", tw); chip(cr, "LA LECHE LO ATRAPA", W / 2, 1240, 46, "verde", lt=lt, t0=tw, icon=ic_check)
            ripple(cr, 780, 900, (lt - tw) / 0.6, M.C("verde", 1), 320)
    elif kind == "pajaros":
        tp = z.w("pájaros")
        if lt > 0.1:
            k = bounce_in((lt - 0.1) / 0.5); peck = max(0.0, math.sin(lt * 9)) if lt > tp else 0
            cr.save(); cr.translate(W / 2 - 80, 900); cr.scale(k, k); bird(cr, 0, 0, 1.6, lt, peck); cr.restore()
            cr.save(); cr.translate(W / 2 + 270, 950); cr.scale(k, k); chile(cr, 0, 0, 0.5, lt, "feliz"); cr.restore()
            ev("pop", 0.1)
        tn = z.w("pica")
        if lt > tn:
            ev("impact", tn, g=0.4); big_number(cr, "0", W / 2 + 260, 640, 80, "verde", lt=lt, t0=tn)
            chip(cr, "PICOR: CERO", W / 2, 1235, 50, "verde", lt=lt, t0=tn + 0.1, icon=ic_check)
    elif kind == "remate":
        tm = z.w("mándaselo"); ta = z.w("amigo")
        # tarjeta de chat
        k = bounce_in(lt / 0.5); cr.save(); cr.translate(W / 2, 880); cr.scale(k, k)
        card(cr, -380, -260, 760, 520, SURF, 4, 60)
        blob(cr, "circle", -260, -150, 60, M.C("rosa"), 2); text(cr, "TÚ", -260, -132, 40, (1, 1, 1), font=DISPLAY, sh=False)
        surface(cr, lambda c: rr(c, -170, -210, 470, 120, 50), M.C("rosa", 1), 1)
        text(cr, "¡Mira esto!", 65, -132, 46, M.C("rosa"), font=DISPLAY_XB, sh=False)
        if lt > ta:
            p = bounce_in((lt - ta) / 0.5)
            cr.save(); cr.translate(0, 60); cr.scale(p, p)
            surface(cr, lambda c: rr(c, -300, -70, 470, 140, 50), M.C("violeta", 1), 1)
            chile(cr, -200, 20, 0.28, lt, "feliz")
            text(cr, "+ salsa a todo", 30, 15, 42, M.C("violeta"), font=DISPLAY_XB, sh=False); cr.restore()
            blob(cr, "circle", 270, 120, 56, M.C("rosa"), 2); cr.save(); cr.translate(270, 122); ic_heart(cr, 30, (1, 1, 1)); cr.restore()
        cr.restore()
        fab(cr, W / 2, 1225, 78, "rosa", ic_share, lt=lt, t0=tm)
        if lt > tm:
            ev("pop", tm); ripple(cr, W / 2, 1225, (lt - tm - 0.4) / 0.6, M.C("rosa", 1), 300); ev("click", tm + 0.4)
    else:
        _orig(cr, kind, lt, z, ev)

_orig = R.draw_scene
R.draw_scene = draw_scene

if __name__ == "__main__":
    R.main()
