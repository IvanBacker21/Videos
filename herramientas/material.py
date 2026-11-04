"""Kit Material Design 3 "Expressive" para Dato Cósmico 2 (pycairo).
Superficies tonales planas con elevación, formas M3 (scallop, flor, burst, squircle, píldora),
chips, FAB, ripple, iconos redondeados y movimiento con resorte.
Úsalo para TODAS las escenas nuevas:  from material import *
"""
import cairo, math, random
from estilo import W, H, DISPLAY, DISPLAY_XB, UI, mix, lighten, darken, cl, ease, eout, pop, spring, rr, text, text_extents, _soft

# ---------- paleta tonal (estilo M3, alto contraste y saturada) ----------
# cada rol: (color fuerte, contenedor claro, "on" = color de texto/icono sobre el fuerte)
P = {
    "violeta": ((0.42, 0.30, 0.96), (0.87, 0.84, 1.00), (1, 1, 1)),
    "cian":    ((0.00, 0.62, 0.86), (0.78, 0.93, 1.00), (1, 1, 1)),
    "verde":   ((0.10, 0.70, 0.45), (0.78, 0.96, 0.86), (1, 1, 1)),
    "coral":   ((1.00, 0.38, 0.33), (1.00, 0.86, 0.82), (1, 1, 1)),
    "rosa":    ((0.95, 0.26, 0.56), (1.00, 0.85, 0.92), (1, 1, 1)),
    "amarillo":((1.00, 0.76, 0.10), (1.00, 0.95, 0.75), (0.15, 0.10, 0.02)),
    "naranja": ((1.00, 0.55, 0.12), (1.00, 0.89, 0.76), (1, 1, 1)),
    "noche":   ((0.10, 0.09, 0.20), (0.20, 0.18, 0.34), (1, 1, 1)),
}
def C(rol, k=0): return P[rol][k]
INK = (0.11, 0.10, 0.18)
SURF = (0.98, 0.97, 1.0)

# ---------- movimiento ----------
def emph(x):
    """Curva 'emphasized decelerate' de M3 (aprox. cubic-bezier(0.05,0.7,0.1,1))."""
    x = cl(x); return 1 - (1 - x) ** 4
def bounce_in(x): return max(0.01, spring(x, 1.6, 7.0))
def stagger(lt, i, step=0.08, dur=0.45): return cl((lt - i * step) / dur)

# ---------- elevación (dos sombras: clave + ambiente, como M3) ----------
def elevation(cr, draw, level=2):
    if level <= 0: return
    _soft(cr, draw, 6 + level * 6, (0, 0, 0), 0.10 + 0.04 * level, 0, 2 + level * 3)
    _soft(cr, draw, 2 + level * 2, (0, 0, 0), 0.12, 0, 1 + level)

def surface(cr, draw, color, level=2, outline=None):
    """Superficie plana M3: color sólido + elevación. Sin brillos ni grano."""
    elevation(cr, draw, level)
    draw(cr); cr.set_source_rgb(*color); cr.fill()
    if outline: draw(cr); cr.set_source_rgba(*outline); cr.set_line_width(3); cr.stroke()

# ---------- formas M3 Expressive ----------
def _poly_round(cr, pts):
    """Polígono con esquinas suavizadas (curvas por puntos medios)."""
    n = len(pts); mids = [((pts[i][0] + pts[(i + 1) % n][0]) / 2, (pts[i][1] + pts[(i + 1) % n][1]) / 2) for i in range(n)]
    cr.move_to(*mids[-1])
    for i in range(n):
        cr.curve_to(pts[i][0], pts[i][1], pts[i][0], pts[i][1], *mids[i])
    cr.close_path()

def shape(cr, kind, cx, cy, r, rot=0.0, morph=0.0):
    """kind: circle | scallop | flower | burst | squircle | pill | gem | clover. morph 0..1 lo acerca a círculo."""
    cr.new_path()
    if kind == "circle": cr.arc(cx, cy, r, 0, 2 * math.pi); return
    if kind == "pill": rr(cr, cx - r * 1.5, cy - r * 0.6, r * 3, r * 1.2, r * 0.6); return
    if kind == "squircle":
        n = 64
        for i in range(n + 1):
            a = 2 * math.pi * i / n; c, s = math.cos(a), math.sin(a)
            e = 4 - 2 * morph
            x = cx + r * math.copysign(abs(c) ** (2 / e), c); y = cy + r * math.copysign(abs(s) ** (2 / e), s)
            cr.line_to(x, y) if i else cr.move_to(x, y)
        cr.close_path(); return
    lobes, depth = {"scallop": (12, 0.07), "flower": (6, 0.18), "burst": (10, 0.22), "gem": (5, 0.10), "clover": (4, 0.25)}.get(kind, (8, 0.1))
    depth *= (1 - morph)
    n = 180
    for i in range(n + 1):
        a = 2 * math.pi * i / n
        if kind == "burst": k = 1 - depth * (0.5 + 0.5 * math.copysign(abs(math.cos(lobes * (a + rot) / 2)) ** 0.6, 1))
        else: k = 1 - depth * (0.5 - 0.5 * math.cos(lobes * (a + rot)))
        x, y = cx + r * k * math.cos(a), cy + r * k * math.sin(a)
        cr.line_to(x, y) if i else cr.move_to(x, y)
    cr.close_path()

def blob(cr, kind, cx, cy, r, color, level=3, rot=0.0, morph=0.0, outline=None):
    surface(cr, lambda c: shape(c, kind, cx, cy, r, rot, morph), color, level, outline)

# ---------- componentes ----------
def chip(cr, s, cx, cy, size=46, rol="violeta", tonal=False, lt=1.0, t0=0.0, icon=None):
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.6); e = text_extents(cr, s, size, DISPLAY_XB)
    w = e.x_advance + size * 1.2 + (size * 1.1 if icon else 0); h = size * 1.7
    bg = C(rol, 1) if tonal else C(rol, 0); fg = C(rol, 0) if tonal else C(rol, 2)
    cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    surface(cr, lambda c: rr(c, -w / 2, -h / 2, w, h, h / 2), bg, 2)
    tx = 0
    if icon:
        ix = -w / 2 + size * 0.95; cr.save(); cr.translate(ix, 0); icon(cr, size * 0.42, fg); cr.restore(); tx = size * 0.5
    text(cr, s, tx, size * 0.36, size, fg, font=DISPLAY_XB, sh=False)
    cr.restore()

def card(cr, x, y, w, h, color=SURF, level=3, r=48):
    surface(cr, lambda c: rr(c, x, y, w, h, r), color, level)

def fab(cr, cx, cy, r, rol, icon=None, lt=1.0, t0=0.0):
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.6)
    cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    surface(cr, lambda c: rr(c, -r, -r, 2 * r, 2 * r, r * 0.55), C(rol, 0), 4)
    if icon: icon(cr, r * 0.5, C(rol, 2))
    cr.restore()

def ripple(cr, cx, cy, p, color=(1, 1, 1), rmax=220):
    if 0 < p < 1:
        cr.arc(cx, cy, rmax * emph(p), 0, 2 * math.pi); cr.set_source_rgba(*color, 0.35 * (1 - p)); cr.fill()

def big_number(cr, s, cx, cy, size, rol="amarillo", lt=1.0, t0=0.0):
    """Número o palabra gigante sobre una forma M3 que rota (para datos clave)."""
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.7)
    cr.save(); cr.translate(cx, cy); cr.scale(k, k)
    blob(cr, "burst", 0, 0, size * 1.1, C(rol, 0), 4, rot=lt * 0.4)
    text(cr, s, 0, size * 0.35, size, C(rol, 2), font=DISPLAY, sh=False)
    cr.restore()

# ---------- iconos redondeados (trazo grueso, estilo Material Symbols Rounded) ----------
def _pen(cr, r, col):
    cr.set_source_rgb(*col); cr.set_line_width(r * 0.22); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_join(cairo.LINE_JOIN_ROUND)
def ic_check(cr, r, col): _pen(cr, r, col); cr.move_to(-r * 0.6, 0); cr.line_to(-r * 0.15, r * 0.45); cr.line_to(r * 0.65, -r * 0.4); cr.stroke()
def ic_close(cr, r, col): _pen(cr, r, col); cr.move_to(-r * .5, -r * .5); cr.line_to(r * .5, r * .5); cr.move_to(r * .5, -r * .5); cr.line_to(-r * .5, r * .5); cr.stroke()
def ic_heart(cr, r, col):
    cr.move_to(0, r * 0.75); cr.curve_to(-r * 1.3, -r * 0.1, -r * 0.6, -r * 1.05, 0, -r * 0.35); cr.curve_to(r * 0.6, -r * 1.05, r * 1.3, -r * 0.1, 0, r * 0.75)
    cr.set_source_rgb(*col); cr.fill()
def ic_chat(cr, r, col):
    rr(cr, -r * 0.8, -r * 0.65, r * 1.6, r * 1.15, r * 0.35); cr.move_to(-r * 0.35, r * 0.45); cr.line_to(-r * 0.55, r * 0.85); cr.line_to(r * 0.05, r * 0.5)
    cr.set_source_rgb(*col); cr.fill()
def ic_share(cr, r, col):
    _pen(cr, r * 0.9, col); cr.move_to(-r * 0.6, r * 0.35); cr.curve_to(-r * 0.5, -r * 0.2, -r * 0.1, -r * 0.35, r * 0.4, -r * 0.35); cr.stroke()
    cr.move_to(r * 0.15, -r * 0.7); cr.line_to(r * 0.7, -r * 0.35); cr.line_to(r * 0.15, 0.0); cr.stroke()
def ic_bolt(cr, r, col):
    pts = [(0.1, -1), (-0.55, 0.12), (-0.05, 0.12), (-0.2, 1), (0.55, -0.15), (0.05, -0.15)]
    cr.move_to(pts[0][0] * r, pts[0][1] * r); [cr.line_to(x * r, y * r) for x, y in pts[1:]]; cr.close_path(); cr.set_source_rgb(*col); cr.fill()
def ic_flame(cr, r, col):
    cr.move_to(0, -r); cr.curve_to(r * 0.9, -r * 0.2, r * 0.8, r * 0.9, 0, r * 0.9); cr.curve_to(-r * 0.8, r * 0.9, -r * 0.9, 0, -r * 0.3, -r * 0.35)
    cr.curve_to(-r * 0.2, -r * 0.05, 0, -r * 0.1, 0, -r); cr.set_source_rgb(*col); cr.fill()
def ic_drop(cr, r, col):
    cr.move_to(0, -r); cr.curve_to(r * 0.9, 0, r * 0.75, r * 0.9, 0, r * 0.9); cr.curve_to(-r * 0.75, r * 0.9, -r * 0.9, 0, 0, -r); cr.set_source_rgb(*col); cr.fill()
def ic_star(cr, r, col):
    pts = [(math.cos(-math.pi / 2 + i * math.pi / 5) * (r if i % 2 == 0 else r * 0.45), math.sin(-math.pi / 2 + i * math.pi / 5) * (r if i % 2 == 0 else r * 0.45)) for i in range(10)]
    _poly_round(cr, pts); cr.set_source_rgb(*col); cr.fill()
def ic_clock(cr, r, col):
    _pen(cr, r, col); cr.arc(0, 0, r * 0.8, 0, 2 * math.pi); cr.stroke(); cr.move_to(0, -r * 0.45); cr.line_to(0, 0); cr.line_to(r * 0.35, r * 0.2); cr.stroke()
def ic_bulb(cr, r, col):
    cr.arc(0, -r * 0.2, r * 0.6, math.pi * 0.8, math.pi * 2.2); cr.line_to(r * 0.3, r * 0.55); cr.line_to(-r * 0.3, r * 0.55); cr.close_path(); cr.set_source_rgb(*col); cr.fill()
    rr(cr, -r * 0.3, r * 0.65, r * 0.6, r * 0.25, r * 0.1); cr.fill()
ICONOS = {"check": ic_check, "close": ic_close, "heart": ic_heart, "chat": ic_chat, "share": ic_share, "bolt": ic_bolt,
          "flame": ic_flame, "drop": ic_drop, "star": ic_star, "clock": ic_clock, "bulb": ic_bulb}

# ---------- fondo tonal ----------
def md_background(cr, t, rol="violeta", dark=True):
    """Fondo plano tonal con formas M3 grandes girando despacio (sin grano ni viñeta)."""
    base = darken(C(rol, 0), 0.62) if dark else C(rol, 1)
    cr.set_source_rgb(*base); cr.paint()
    tone = lighten(base, 0.08) if dark else darken(base, 0.05)
    for i, (kind, x, y, r, sp) in enumerate([("flower", 0.12, 0.18, 330, 0.12), ("scallop", 0.92, 0.42, 380, -0.08),
                                              ("burst", 0.18, 0.86, 300, 0.10), ("clover", 0.86, 0.95, 260, -0.14)]):
        shape(cr, kind, x * W + 30 * math.sin(t * 0.4 + i), y * H + 30 * math.cos(t * 0.3 + i), r, rot=t * sp)
        cr.set_source_rgb(*tone); cr.fill()
    # puntitos de patrón
    rnd = random.Random(9); cr.set_source_rgba(1, 1, 1, 0.07 if dark else 0.25)
    for _ in range(40):
        x, y = rnd.uniform(0, W), rnd.uniform(0, H); cr.arc(x, (y + t * 12) % H, rnd.uniform(3, 7), 0, 2 * math.pi); cr.fill()

# ---------- mascota del canal: "Cosmo", planeta con cara (mejora #3) ----------
EXPRESIONES = ("feliz", "sorpresa", "guino", "pensando")
def mascota(cr, cx, cy, r, t, expr="feliz", rol="violeta", anillo=True, lt=1.0, t0=0.0):
    """Planeta-mascota de Dato Cósmico 2 en estilo M3: cuerpo scallop con elevación, anillo plano,
    mejillas y cara en INK. expr: feliz | sorpresa | guino | pensando. Parpadea solo y flota."""
    if lt < t0: return
    k = bounce_in((lt - t0) / 0.55)
    cr.save(); cr.translate(cx, cy + r * 0.04 * math.sin(t * 2.2)); cr.scale(k * r / 100, k * r / 100)
    cr.rotate(0.05 * math.sin(t * 1.3))
    ring = lambda c, a0, a1: (c.save(), c.translate(0, 62), c.rotate(-0.2), c.scale(1, 0.22), c.arc(0, 0, 150, a0, a1), c.restore())
    cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_width(16)
    if anillo: ring(cr, math.pi, 2 * math.pi); cr.set_source_rgb(*C("rosa")); cr.stroke()
    blob(cr, "scallop", 0, 0, 100, C(rol), 4, rot=t * 0.25)
    shape(cr, "circle", -30, -35, 26); cr.set_source_rgba(1, 1, 1, 0.16); cr.fill()
    shape(cr, "circle", 40, 45, 14); cr.set_source_rgba(1, 1, 1, 0.12); cr.fill()
    # cara
    blink = (t % 3.1) < 0.12
    cr.set_source_rgb(*INK); cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_width(9)
    for i, ex in enumerate((-32, 32)):
        wink = expr == "guino" and i == 1
        if blink or wink:
            cr.move_to(ex - 13, -6); cr.curve_to(ex - 5, 2, ex + 5, 2, ex + 13, -6); cr.stroke()
        else:
            er = 17 if expr == "sorpresa" else 14
            ey = -14 if expr == "pensando" else -6
            cr.arc(ex + (6 if expr == "pensando" else 0), ey, er, 0, 2 * math.pi); cr.fill()
            cr.arc(ex + 5 + (6 if expr == "pensando" else 0), ey - 5, er * 0.33, 0, 2 * math.pi); cr.set_source_rgb(1, 1, 1); cr.fill(); cr.set_source_rgb(*INK)
    if expr == "sorpresa":
        cr.arc(0, 30, 14, 0, 2 * math.pi); cr.fill()
    elif expr == "pensando":
        cr.move_to(-18, 32); cr.line_to(18, 26); cr.stroke()
        for j, (bx, by, br) in enumerate(((95, -95, 10), (120, -130, 15), (150, -175, 22))):
            if (t * 2) % 3 > j * 0.6: cr.arc(bx, by, br, 0, 2 * math.pi); cr.set_source_rgb(*SURF); cr.fill()
        cr.set_source_rgb(*INK)
    else:
        cr.arc(0, 14, 24, 0.15 * math.pi, 0.85 * math.pi); cr.stroke()
    for ex in (-62, 62):
        cr.arc(ex, 16, 13, 0, 2 * math.pi); cr.set_source_rgba(1, 0.45, 0.6, 0.55); cr.fill()
    if anillo: ring(cr, 0, math.pi); cr.set_source_rgb(*C("rosa")); cr.set_line_width(16); cr.stroke()
    cr.restore()

# ---------- dona M3 plana animada (mejora #7, sin cifras) ----------
def donut(cr, cx, cy, r, frac, rol="verde", p=1.0, grosor=0.34):
    """Anillo de progreso M3: pista tonal + arco fuerte con puntas redondas; p anima de 0 a 1."""
    w = r * grosor; cr.set_line_cap(cairo.LINE_CAP_ROUND); cr.set_line_width(w)
    cr.arc(cx, cy, r, 0, 2 * math.pi); cr.set_source_rgb(*C(rol, 1)); cr.stroke()
    a = frac * emph(p)
    if a > 0.005:
        cr.arc(cx, cy, r, -math.pi / 2, -math.pi / 2 + 2 * math.pi * a); cr.set_source_rgb(*C(rol)); cr.stroke()
