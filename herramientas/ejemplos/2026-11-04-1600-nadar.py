"""Short: ¿Nadar después de comer? Tu mamá estaba... (Mito o realidad, estilo Material Design 3).
Uso (desde herramientas/): python3 ejemplos/2026-11-04-1600-nadar.py ejemplos/2026-11-04-1600-nadar.json OUT [frames t1,t2]"""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import cairo
import render3 as R
import material as M
from material import *

R.ROLES.update({"gancho": "cian", "miedo": "coral", "verdad": "verde", "prueba": "violeta", "ojo": "naranja", "remate": "rosa"})
SKIN = (1.0, 0.78, 0.62); WATER = (0.30, 0.70, 1.0); WATER2 = (0.55, 0.84, 1.0)
TORT = (1.0, 0.82, 0.35); DROP = (0.93, 0.25, 0.30)

def lw(cr, w): cr.set_line_width(w); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)

# ---------- personajes planos M3 ----------
def swimmer(cr, cx, cy, s, t, mood="feliz", cap="rosa"):
    """Niño nadador: cara redonda, gorro de natación y goggles en la frente."""
    cr.save(); cr.translate(cx, cy); cr.scale(s, s)
    blob(cr, "circle", 0, 0, 120, SKIN, 4)
    capp = lambda c: (c.arc(0, -10, 124, math.pi * 1.05, math.pi * 1.95), c.close_path())
    surface(cr, capp, M.C(cap), 2)
    for gx in (-45, 45):
        blob(cr, "circle", gx, -62, 26, M.C("cian", 1), 1)
        cr.arc(gx, -62, 26, 0, 2 * math.pi); cr.set_source_rgb(*M.C("cian")); lw(cr, 8); cr.stroke()
    cr.set_source_rgb(*INK)
    if mood == "miedo":
        for ex in (-40, 40): cr.arc(ex, 5, 17, 0, 2 * math.pi); cr.fill()
        cr.arc(0, 60, 22, 0, 2 * math.pi); cr.fill()
    elif mood == "lleno":
        lw(cr, 10)
        for ex in (-40, 40): cr.move_to(ex - 16, 8); cr.line_to(ex + 16, 8); cr.stroke()
        cr.move_to(-30, 62); cr.curve_to(-10, 50, 10, 74, 30, 62); cr.stroke()
    else:
        for ex in (-40, 40):
            cr.arc(ex, 5, 15, 0, 2 * math.pi); cr.fill(); cr.arc(ex + 5, 0, 5, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*INK)
        lw(cr, 10); cr.arc(0, 40, 36, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    for ex in (-78, 78):
        cr.arc(ex, 40, 16, 0, 2 * math.pi); cr.set_source_rgba(1, 0.45, 0.5, 0.45); cr.fill()
    cr.restore()

def floatie(cr, cx, cy, r, t):
    """Flotador (dona) con franjas."""
    cr.save(); cr.translate(cx, cy); cr.rotate(0.15 * math.sin(t * 2))
    ring = lambda c: (c.arc(0, 0, r, 0, 2 * math.pi), c.new_sub_path(), c.arc_negative(0, 0, r * 0.48, 2 * math.pi, 0))
    cr.set_fill_rule(cairo.FILL_RULE_EVEN_ODD); surface(cr, ring, M.C("coral"), 3)
    cr.save(); ring(cr); cr.clip()
    for k in range(4):
        a = k * math.pi / 2 + 0.4; cr.move_to(0, 0); cr.arc(0, 0, r + 4, a, a + 0.45); cr.close_path(); cr.set_source_rgb(1, 1, 1); cr.fill()
    cr.restore(); cr.set_fill_rule(cairo.FILL_RULE_WINDING); cr.restore()

def water(cr, y, t, col=WATER, amp=18, x0=0, x1=W, bottom=None):
    bottom = bottom or y + 600
    cr.move_to(x0, bottom); cr.line_to(x0, y)
    for x in range(int(x0), int(x1) + 20, 20): cr.line_to(x, y + amp * math.sin(x / 70 + t * 3))
    cr.line_to(x1, bottom); cr.close_path(); cr.set_source_rgb(*col); cr.fill()

def taco(cr, cx, cy, s, t, mood="feliz"):
    cr.save(); cr.translate(cx, cy); cr.rotate(0.08 * math.sin(t * 3)); cr.scale(s, s)
    for i, (col, rad) in enumerate((((0.65, 0.38, 0.22), 44), ((0.95, 0.30, 0.25), 30), ((0.30, 0.75, 0.35), 34))):
        for k in range(6):
            cr.arc(-150 + k * 60, -30 - i * 18 + 8 * math.sin(k * 2 + i), rad, 0, 2 * math.pi); cr.set_source_rgb(*col); cr.fill()
    shell = lambda c: (c.arc(0, -20, 190, 0, math.pi), c.close_path())
    surface(cr, shell, TORT, 4)
    cr.set_source_rgba(0.85, 0.55, 0.15, 0.6)
    for (sx, sy) in ((-120, 40), (110, 30), (-60, 120), (70, 110), (0, 150)): cr.arc(sx, sy, 9, 0, 2 * math.pi); cr.fill()
    cr.set_source_rgb(*INK)
    for ex in (-50, 50): cr.arc(ex, 50, 14, 0, 2 * math.pi); cr.fill()
    lw(cr, 9)
    if mood == "lleno": cr.move_to(-28, 100); cr.curve_to(-10, 88, 10, 112, 28, 100)
    else: cr.arc(0, 80, 28, 0.15 * math.pi, 0.85 * math.pi)
    cr.stroke(); cr.restore()

def stomach(cr, cx, cy, s, t, pulse=0.0):
    k = 1 + 0.05 * pulse * math.sin(t * 10)
    cr.save(); cr.translate(cx, cy); cr.scale(s * k, s * k)
    body = lambda c: (c.move_to(-40, -150), c.curve_to(40, -160, 40, -90, 30, -60), c.curve_to(150, -70, 170, 120, 40, 140),
                      c.curve_to(-60, 160, -150, 90, -90, 20), c.curve_to(-60, -20, -60, -90, -40, -150), c.close_path())
    surface(cr, body, (1.0, 0.60, 0.66), 4)
    cr.set_source_rgb(*INK)
    for ex in (-10, 60): cr.arc(ex, 30, 12, 0, 2 * math.pi); cr.fill()
    lw(cr, 8); cr.arc(25, 62, 22, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    cr.restore()

def limb(cr, cx, cy, s, rol, label, lt, t0, ok=None):
    """Tarjeta con brazo/pierna simplificado (forma píldora) y etiqueta."""
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.5); cr.save(); cr.translate(cx, cy); cr.scale(k * s, k * s)
    card(cr, -150, -150, 300, 300, SURF, 3, 60)
    cr.save(); cr.rotate(-0.6); surface(cr, lambda c: rr(c, -35, -100, 70, 200, 35), SKIN, 2); cr.restore()
    blob(cr, "circle", 0, 0, 48, M.C(rol), 2); cr.save(); ic_bolt(cr, 28, (1, 1, 1)); cr.restore()
    text(cr, label, 0, 125, 34, M.C(rol), font=DISPLAY_XB, sh=False)
    if ok is not None:
        blob(cr, "circle", 125, -125, 42, M.C("verde") if ok else M.C("coral"), 3)
        cr.save(); cr.translate(125, -125); (ic_check if ok else ic_close)(cr, 22, (1, 1, 1)); cr.restore()
    cr.restore()

def bars(cr, x, y, items, lt, t0):
    """Mejora #7 (gráfica M3 sin cifras): barras planas redondeadas que crecen en cascada."""
    for i, (lab, frac, rol) in enumerate(items):
        p = emph(stagger(lt - t0, i, 0.18, 0.7))
        if lt < t0: continue
        yy = y + i * 150
        surface(cr, lambda c, yy=yy: rr(c, x, yy, 580, 96, 48), M.C(rol, 1), 1)
        if p > 0: surface(cr, lambda c, yy=yy: rr(c, x, yy, max(96, 580 * frac * p), 96, 48), M.C(rol), 2)
        text(cr, lab, x + 40, yy + 64, 42, INK, font=DISPLAY_XB, sh=False, align="l")

def bubble(cr, x, y, w, h, col, s, fg, size=44, me=True):
    surface(cr, lambda c: rr(c, x, y, w, h, 44), col, 2)
    text(cr, s, x + w / 2, y + h / 2 + size * 0.36, size, fg, font=DISPLAY_XB, sh=False)

# ---------- escenas ----------
def draw_scene(cr, kind, lt, z, ev):
    if kind == "gancho":
        ev("whoosh", 0.0)
        # alberca en tarjeta grande (entra desde el fotograma 0)
        k = bounce_in(lt / 0.45); cr.save(); cr.translate(W / 2, 920); cr.scale(k, k); cr.translate(-W / 2, -920)
        card(cr, 110, 560, 860, 720, SURF, 4, 70)
        cr.save(); rr(cr, 140, 590, 800, 660, 56); cr.clip()
        cr.set_source_rgb(*WATER2); cr.paint(); water(cr, 900, lt, WATER, 20); water(cr, 980, lt + 1, (0.20, 0.58, 0.95), 14)
        sink = 0
        swimmer(cr, W / 2 - 120, 860 + 10 * math.sin(lt * 3), 0.95, lt, "feliz")
        water(cr, 950, lt + 2, (0.30, 0.70, 1.0, ) , 12, bottom=1300)
        cr.restore()
        floatie(cr, W / 2 + 230, 960 + 12 * math.sin(lt * 2.5), 95, lt)
        cr.restore()
        # chip de "no te metas" + reloj
        tc = z.w("comer")
        if lt > 0.25: chip(cr, "¡ACABAS DE COMER!", W / 2, 470, 50, "coral", lt=lt, t0=0.25, icon=ic_close); ev("pop", 0.25)
        if lt > tc:
            p = bounce_in((lt - tc) / 0.5); cr.save(); cr.translate(860, 640); cr.scale(p, p)
            blob(cr, "scallop", 0, 0, 95, M.C("amarillo"), 4, rot=lt * 0.5)
            cr.set_source_rgb(*INK); lw(cr, 10); cr.arc(0, 0, 55, 0, 2 * math.pi); cr.stroke()
            a = lt * 4; cr.move_to(0, 0); cr.line_to(40 * math.sin(a), -40 * math.cos(a)); cr.stroke(); cr.restore(); ev("click", tc)
        t1 = z.f(1)
        if lt > t1:
            ev("ding", t1); chip(cr, "¿MITO O REALIDAD?", W / 2, 1220, 54, "amarillo", lt=lt, t0=t1)
    elif kind == "miedo":
        tm, tc, th = z.w("músculos"), z.w("calambre"), z.w("hundes")
        if lt < th:
            blob(cr, "scallop", W / 2, 780, 300, M.C("coral", 1), 2, rot=lt * 0.3)
            stomach(cr, W / 2 - 20, 790, 1.55 * bounce_in(lt / 0.4), lt, 1.0)
            if lt > z.w("roba"): chip(cr, "SE ROBA LA SANGRE", W / 2, 560, 40, "coral", tonal=True, lt=lt, t0=z.w("roba"))
        else:
            p = emph((lt - th) / 0.9)
            cr.save(); rr(cr, 190, 560, 700, 560, 60); cr.clip(); cr.set_source_rgb(*WATER2); cr.paint()
            swimmer(cr, W / 2, 760 + 260 * p, 1.0, lt, "miedo")
            water(cr, 820, lt, (0.30, 0.70, 1.0, ), 18, x0=190, x1=890, bottom=1130); cr.restore()
        chip(cr, "LA TEORÍA", W / 2, 450, 44, "noche", lt=lt, t0=0.05, icon=ic_bulb)
        # gotitas que viajan de brazos/piernas a la panza
        if lt > z.w("roba"):
            for i in range(8):
                ph = ((lt - z.w("roba")) * 0.9 + i / 8) % 1
                sx = 180 if i % 2 else 900; sy = 1120
                x = sx + (W / 2 - sx) * emph(ph); y = sy + (800 - sy) * emph(ph)
                cr.save(); cr.translate(x, y); ic_drop(cr, 20, DROP); cr.restore()
        limb(cr, 200, 1150, 0.8, "coral" if lt > tc else "cian", "MÚSCULOS", lt, tm)
        limb(cr, 880, 1150, 0.8, "coral" if lt > tc else "cian", "MÚSCULOS", lt, tm + 0.15)
        if lt > tm: ev("pop", tm)
        if lt > tc:
            ev("zap", tc); chip(cr, "¿CALAMBRE?", W / 2, 1050, 50, "coral", lt=lt, t0=tc, icon=ic_bolt)
        if lt > th:
            ev("impact", th, g=0.5); p = emph((lt - th) / 0.6)
            for b in range(6):
                bx = 400 + b * 55; by = 1000 - ((lt - th) * 260 + b * 50) % 300
                cr.arc(bx, by, 10 + b % 3 * 4, 0, 2 * math.pi); cr.set_source_rgba(1, 1, 1, 0.8); lw(cr, 5); cr.stroke()
    elif kind == "verdad":
        ta = z.w("alcanza")
        chip(cr, "SÍ PASA... UN POQUITO", W / 2, 450, 44, "verde", tonal=True, lt=lt, t0=0.05, icon=ic_check)
        stomach(cr, 300, 760, 0.85 * bounce_in(lt / 0.4), lt, 0.4)
        k = bounce_in((lt - 0.15) / 0.5) if lt > 0.15 else 0
        if k:
            cr.save(); cr.translate(760, 760); cr.scale(k, k)
            swimmer(cr, 0, 0, 1.0, lt, "feliz", "verde"); cr.restore()
        ev("pop", 0.15)
        bars(cr, 160, 1010, [("PANZA", 0.30, "naranja"), ("BRAZOS Y PIERNAS", 1.0, "verde")], lt, z.w("panza"))
        if lt > ta:
            ev("ding", ta); big_number(cr, "OK", 905, 1085, 70, "amarillo", lt=lt, t0=ta)
            ripple(cr, W / 2, 1160, (lt - ta) / 0.7, M.C("verde", 1), 420)
    elif kind == "prueba":
        tr, tm = z.w("revisó"), z.w("mito")
        # carpeta de estudios en cascada
        for i in range(3):
            p = stagger(lt, i, 0.12, 0.5)
            if p <= 0: continue
            cr.save(); cr.translate(W / 2 - 60 + i * 60, 830 - i * 40); cr.rotate(-0.08 + i * 0.08); cr.scale(bounce_in(p), bounce_in(p))
            card(cr, -230, -290, 460, 580, SURF, 3 + i, 44)
            for l in range(6):
                surface(cr, lambda c, l=l: rr(c, -170, -210 + l * 70, 340 if l % 3 else 220, 30, 15), M.C("violeta", 1), 0)
            cr.restore()
        if lt > 0.2: ev("pop", 0.2)
        chip(cr, "REVISARON LOS ESTUDIOS", W / 2, 450, 42, "noche", lt=lt, t0=tr, icon=ic_star)
        # lupa que recorre
        if tr < lt < tm:
            ph = (lt - tr) * 1.4; lx, ly = W / 2 + 140 * math.sin(ph), 820 + 90 * math.cos(ph * 0.7)
            cr.save(); cr.translate(lx, ly)
            surface(cr, lambda c: (c.arc(0, 0, 95, 0, 2 * math.pi)), M.C("violeta", 1), 4)
            cr.arc(0, 0, 95, 0, 2 * math.pi); cr.set_source_rgb(*M.C("violeta")); lw(cr, 22); cr.stroke()
            cr.move_to(70, 70); cr.line_to(150, 150); lw(cr, 34); cr.stroke(); cr.restore()
        if lt > tm:
            ev("impact", tm, g=0.6)
            k = bounce_in((lt - tm) / 0.5); cr.save(); cr.translate(W / 2, 860); cr.rotate(-0.18); cr.scale(k, k)
            surface(cr, lambda c: rr(c, -270, -95, 540, 190, 95), M.C("coral"), 5)
            text(cr, "¡ES MITO!", 0, 34, 96, (1, 1, 1), font=DISPLAY, sh=False); cr.restore()
        tc = z.f(1)
        if lt > tc: ev("pop", tc); chip(cr, "CERO CASOS POR COMER", W / 2, 1235, 46, "verde", lt=lt, t0=tc, icon=ic_check)
    elif kind == "ojo":
        tt, tp, ts = z.w("tacos"), z.w("pesado"), z.w("nunca")
        if lt < z.f(1):
            k = bounce_in(lt / 0.45)
            cr.save(); cr.translate(W / 2, 820); cr.scale(k, k)
            blob(cr, "burst", 0, 30, 340, M.C("naranja"), 2, rot=lt * 0.3)
            taco(cr, -40, 20, 1.15, lt, "lleno" if lt > tp else "feliz")
            cr.restore()
            for i in range(3):
                if lt > tt + i * 0.15:
                    p = bounce_in((lt - tt - i * 0.15) / 0.5); cr.save(); cr.translate(250 + i * 290, 540); cr.scale(p, p)
                    taco(cr, 0, 0, 0.45, lt + i, "feliz"); cr.restore()
            if lt > tt: ev("pop", tt)
            if lt > tp: ev("pop", tp); chip(cr, "PESADEZ", W / 2, 1230, 54, "naranja", lt=lt, t0=tp, icon=ic_clock)
        else:
            t1 = z.f(1); lt2 = lt - t1
            k = bounce_in(lt2 / 0.45); cr.save(); cr.translate(W / 2, 880); cr.scale(k, k)
            card(cr, -420, -330, 840, 620, SURF, 4, 70)
            cr.save(); rr(cr, -390, -300, 780, 560, 50); cr.clip()
            cr.set_source_rgb(*WATER2); cr.paint(); water(cr, 60, lt, WATER, 16, x0=-400, x1=400, bottom=400)
            cr.restore()
            swimmer(cr, -170, -20 + 8 * math.sin(lt * 3), 0.85, lt, "feliz", "rosa")
            if lt > ts: swimmer(cr, 170, -20 + 8 * math.sin(lt * 3 + 1), 0.85 * bounce_in((lt - ts) / 0.5), lt, "feliz", "violeta")
            cr.restore()
            ev("whoosh", t1)
            chip(cr, "LO IMPORTANTE", W / 2, 450, 46, "noche", lt=lt, t0=t1, icon=ic_star)
            if lt > ts:
                ev("ding", ts); chip(cr, "NUNCA NADES SOLO", W / 2, 1235, 52, "verde", lt=lt, t0=ts, icon=ic_check)
                ripple(cr, W / 2, 880, (lt - ts) / 0.7, M.C("verde", 1), 500)
    elif kind == "remate":
        tm, tc = z.w("mándaselo"), z.w("contesta")
        k = bounce_in(lt / 0.45); cr.save(); cr.translate(W / 2, 860); cr.scale(k, k)
        card(cr, -390, -330, 780, 660, SURF, 4, 64)
        surface(cr, lambda c: rr(c, -390, -330, 780, 130, 64), M.C("rosa"), 0)
        cr.rectangle(-390, -260, 780, 60); cr.set_source_rgb(*M.C("rosa")); cr.fill()
        blob(cr, "circle", -300, -265, 44, M.C("rosa", 1), 1); cr.save(); cr.translate(-300, -265); ic_heart(cr, 24, M.C("rosa")); cr.restore()
        text(cr, "Mamá", -150, -248, 50, (1, 1, 1), font=DISPLAY_XB, sh=False)
        bubble(cr, -10, -170, 370, 100, M.C("rosa"), "¡Era mito, ma!", (1, 1, 1), 42)
        if lt > 0.5:
            p = bounce_in((lt - 0.5) / 0.5); cr.save(); cr.translate(175, -10); cr.scale(p, p)
            surface(cr, lambda c: rr(c, -185, -70, 370, 140, 44), M.C("rosa", 1), 1)
            swimmer(cr, -100, 0, 0.42, lt, "feliz"); floatie(cr, 70, 5, 45, lt); cr.restore()
        td = z.f(1)
        if lt > td:
            p = bounce_in((lt - td) / 0.5); cr.save(); cr.translate(-160, 150); cr.scale(p, p)
            if lt < tc:
                surface(cr, lambda c: rr(c, -170, -55, 340, 110, 50), (0.93, 0.93, 0.97), 1)
                for d in range(3):
                    yy = -8 * max(0, math.sin(lt * 8 - d))
                    cr.arc(-60 + d * 60, yy, 17, 0, 2 * math.pi); cr.set_source_rgb(*M.C("noche", 1)); cr.fill()
            else:
                surface(cr, lambda c: rr(c, -190, -55, 380, 110, 50), (0.93, 0.93, 0.97), 1)
                text(cr, "¡Igual espérate!", 0, 15, 40, INK, font=DISPLAY_XB, sh=False)
            cr.restore()
        cr.restore()
        fab(cr, W / 2, 1230, 80, "rosa", ic_share, lt=lt, t0=tm)
        if lt > tm:
            ev("pop", tm); ripple(cr, W / 2, 1230, (lt - tm - 0.4) / 0.6, M.C("rosa", 1), 300); ev("click", tm + 0.4)
        if lt > tc: ev("pop", td); ev("ding", tc)
    else:
        _orig(cr, kind, lt, z, ev)

_orig = R.draw_scene
R.draw_scene = draw_scene

if __name__ == "__main__":
    R.main()
