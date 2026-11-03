"""Kit de estilo visual moderno para Dato Cósmico 2 (pycairo).
Sombras suaves, glow, degradados con volumen, bokeh, grano, viñeta, tarjetas glass, texto premium."""
import cairo, math, random

W, H = 1080, 1920
DISPLAY = "Poppins Black"      # titulares y subtítulos
DISPLAY_XB = "Poppins ExtraBold"
UI = "Inter Display SemiBold"  # textos pequeños

# Paleta de marca (oscuro cósmico + neones suaves)
INK = (0.04, 0.03, 0.10)
NAVY = (0.07, 0.06, 0.18)
CYAN = (0.35, 0.88, 1.0)
VIOLET = (0.55, 0.40, 1.0)
PINK = (1.0, 0.36, 0.64)
YEL = (1.0, 0.84, 0.30)
MINT = (0.40, 1.0, 0.75)
ORANGE = (1.0, 0.58, 0.25)
WHITE = (1, 1, 1)

def mix(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))
def lighten(c, t): return mix(c, WHITE, t)
def darken(c, t): return mix(c, (0, 0, 0), t)
def cl(x): return max(0.0, min(1.0, x))
def ease(x): x = cl(x); return x * x * (3 - 2 * x)
def eout(x): x = cl(x); return 1 - (1 - x) ** 3
def pop(x):
    x = cl(x); c = 1.7; return max(0.01, 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2)
def spring(x, f=2.2, d=6.0):
    if x <= 0: return 0.0
    return 1 - math.exp(-d * x) * math.cos(2 * math.pi * f * x)

def rr(cr, x, y, w, h, r):
    r = min(r, w / 2, h / 2)
    cr.new_sub_path(); cr.arc(x + w - r, y + r, r, -math.pi / 2, 0); cr.arc(x + w - r, y + h - r, r, 0, math.pi / 2)
    cr.arc(x + r, y + h - r, r, math.pi / 2, math.pi); cr.arc(x + r, y + r, r, math.pi, 1.5 * math.pi); cr.close_path()

# ---------------- blur por reducción de escala ----------------
def _soft(cr, draw, blur, color, alpha, dx=0, dy=0):
    """Dibuja `draw(ctx)` (en coordenadas de usuario actuales) desenfocado ~blur px."""
    s = max(0.04, min(0.5, 2.2 / max(1, blur)))
    sw, sh = max(2, int(W * s)), max(2, int(H * s))
    small = cairo.ImageSurface(cairo.FORMAT_ARGB32, sw, sh); c2 = cairo.Context(small)
    m = cr.get_matrix(); c2.scale(s, s); c2.translate(dx, dy); c2.transform(m)
    c2.set_source_rgba(*color, 1); draw(c2); c2.fill()
    # segundo paso: subir x4 con bilineal para suavizar
    mid = cairo.ImageSurface(cairo.FORMAT_ARGB32, sw * 4, sh * 4); c3 = cairo.Context(mid)
    c3.scale(4, 4); c3.set_source_surface(small, 0, 0); c3.get_source().set_filter(cairo.FILTER_BILINEAR); c3.paint()
    cr.save(); cr.identity_matrix(); cr.scale(1 / (4 * s), 1 / (4 * s))
    cr.set_source_surface(mid, 0, 0); cr.get_source().set_filter(cairo.FILTER_BILINEAR); cr.paint_with_alpha(alpha); cr.restore()

def shadow(cr, draw, blur=30, alpha=0.45, dy=18, color=(0, 0, 0)):
    _soft(cr, draw, blur, color, alpha, 0, dy)

def glow(cr, draw, color, blur=40, alpha=0.8):
    cr.save(); cr.set_operator(cairo.OPERATOR_ADD); _soft(cr, draw, blur, color, alpha); cr.restore()

def radial_glow(cr, x, y, r, color, a):
    g = cairo.RadialGradient(x, y, 0, x, y, r)
    g.add_color_stop_rgba(0, *color, a); g.add_color_stop_rgba(0.4, *color, a * 0.45); g.add_color_stop_rgba(1, *color, 0)
    cr.set_source(g); cr.arc(x, y, r, 0, 2 * math.pi); cr.fill()

# ---------------- rellenos con volumen ----------------
def volume(cr, draw, base, bbox, light=0.35, shade=0.35, rim=True, sh=True, sh_blur=28, sh_alpha=0.4, outline=None):
    """Forma 2.5D: sombra suave, degradado vertical claro→oscuro, brillo superior, borde de luz."""
    x0, y0, x1, y1 = bbox
    if sh: shadow(cr, draw, sh_blur, sh_alpha, dy=(y1 - y0) * 0.06 + 8)
    g = cairo.LinearGradient(x0, y0, x1 * 0.3 + x0 * 0.7, y1)
    g.add_color_stop_rgb(0, *lighten(base, light)); g.add_color_stop_rgb(0.55, *base); g.add_color_stop_rgb(1, *darken(base, shade))
    draw(cr); cr.set_source(g); cr.fill_preserve()
    cr.save(); cr.clip()
    # brillo superior (sheen)
    hg = cairo.LinearGradient(0, y0, 0, y0 + (y1 - y0) * 0.5)
    hg.add_color_stop_rgba(0, 1, 1, 1, 0.28); hg.add_color_stop_rgba(1, 1, 1, 1, 0)
    cr.set_source(hg); cr.paint()
    # oclusión inferior
    og = cairo.LinearGradient(0, y1 - (y1 - y0) * 0.25, 0, y1)
    og.add_color_stop_rgba(0, 0, 0, 0, 0); og.add_color_stop_rgba(1, 0, 0, 0, 0.18)
    cr.set_source(og); cr.paint()
    cr.restore()
    if rim:
        draw(cr); cr.set_source_rgba(1, 1, 1, 0.22); cr.set_line_width(3); cr.stroke()
    if outline:
        draw(cr); cr.set_source_rgba(*outline); cr.set_line_width(4); cr.stroke()

def glass(cr, x, y, w, h, r=36, tint=WHITE, a=0.10, sh=True):
    d = lambda c: rr(c, x, y, w, h, r)
    if sh: shadow(cr, d, 40, 0.35, dy=20)
    d(cr); g = cairo.LinearGradient(0, y, 0, y + h)
    g.add_color_stop_rgba(0, *tint, a + 0.08); g.add_color_stop_rgba(1, *tint, a * 0.6)
    cr.set_source(g); cr.fill()
    d(cr); g2 = cairo.LinearGradient(x, y, x + w, y + h)
    g2.add_color_stop_rgba(0, 1, 1, 1, 0.45); g2.add_color_stop_rgba(0.5, 1, 1, 1, 0.08); g2.add_color_stop_rgba(1, 1, 1, 1, 0.25)
    cr.set_source(g2); cr.set_line_width(2.5); cr.stroke()

def pill(cr, cx, cy, w, h, c1, c2=None, sh=True):
    c2 = c2 or darken(c1, 0.15); x, y = cx - w / 2, cy - h / 2
    d = lambda c: rr(c, x, y, w, h, h / 2)
    if sh: shadow(cr, d, 24, 0.45, dy=10)
    g = cairo.LinearGradient(x, y, x + w, y + h); g.add_color_stop_rgb(0, *c1); g.add_color_stop_rgb(1, *c2)
    d(cr); cr.set_source(g); cr.fill()
    d(cr); cr.set_source_rgba(1, 1, 1, 0.25); cr.set_line_width(2); cr.stroke()

# ---------------- texto ----------------
def text_extents(cr, s, size, font=DISPLAY):
    cr.select_font_face(font, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL); cr.set_font_size(size)
    return cr.text_extents(s)

def text(cr, s, x, y, size, color=WHITE, font=DISPLAY, alpha=1.0, grad=None, sh=True, sh_alpha=0.55, glow_c=None, outline=None, align="c"):
    """Texto premium: sombra suave, relleno plano o degradado (grad=(c_top,c_bottom)), glow opcional."""
    cr.select_font_face(font, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL); cr.set_font_size(size)
    e = cr.text_extents(s); tx = x - (e.width / 2 + e.x_bearing) if align == "c" else x
    def d(c):
        c.select_font_face(font, cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL); c.set_font_size(size); c.move_to(tx, y); c.text_path(s)
    if sh and alpha > 0.05: shadow(cr, d, size * 0.25, sh_alpha * alpha, dy=size * 0.08)
    if glow_c: glow(cr, d, glow_c, size * 0.4, 0.7 * alpha)
    if outline:
        d(cr); cr.set_source_rgba(*outline[0], alpha); cr.set_line_width(outline[1]); cr.set_line_join(cairo.LINE_JOIN_ROUND); cr.stroke()
    d(cr)
    if grad:
        g = cairo.LinearGradient(0, y - size * 0.8, 0, y + size * 0.1)
        g.add_color_stop_rgba(0, *grad[0], alpha); g.add_color_stop_rgba(1, *grad[1], alpha); cr.set_source(g)
    else: cr.set_source_rgba(*color, alpha)
    cr.fill()
    return e

# ---------------- fondo ----------------
_cache = {}
def _blob(color, r):
    key = (color, r)
    if key not in _cache:
        s = cairo.ImageSurface(cairo.FORMAT_ARGB32, int(r * 2), int(r * 2)); c = cairo.Context(s)
        g = cairo.RadialGradient(r, r, 0, r, r, r)
        g.add_color_stop_rgba(0, *color, 0.55); g.add_color_stop_rgba(0.5, *color, 0.22); g.add_color_stop_rgba(1, *color, 0)
        c.set_source(g); c.paint(); _cache[key] = s
    return _cache[key]

def _grain(k):
    key = ("grain", k)
    if key not in _cache:
        rnd = random.Random(k); s = cairo.ImageSurface(cairo.FORMAT_ARGB32, 270, 480); c = cairo.Context(s)
        data = s.get_data(); st = s.get_stride()
        for yy in range(480):
            for xx in range(270):
                v = rnd.randint(0, 255); o = yy * st + xx * 4; a = 40
                data[o] = data[o + 1] = data[o + 2] = v * a // 255; data[o + 3] = a
        s.mark_dirty(); _cache[key] = s
    return _cache[key]

def background(cr, t, top=NAVY, bottom=(0.16, 0.05, 0.28), blobs=(VIOLET, CYAN, PINK)):
    g = cairo.LinearGradient(0, 0, W * 0.4, H); g.add_color_stop_rgb(0, *top); g.add_color_stop_rgb(1, *bottom)
    cr.set_source(g); cr.paint()
    # manchas de luz desenfocadas que flotan
    pos = [(0.15, 0.22, 520, 0.0), (0.88, 0.45, 600, 1.7), (0.30, 0.86, 560, 3.1)]
    for (bx, by, r, ph), col in zip(pos, blobs):
        x = bx * W + 80 * math.sin(t * 0.35 + ph); y = by * H + 60 * math.cos(t * 0.28 + ph)
        cr.set_source_surface(_blob(col, r), x - r, y - r); cr.paint()
    # estrellas finas
    rnd = random.Random(11)
    for _ in range(90):
        x, y, rad, sp = rnd.uniform(0, W), rnd.uniform(0, H), rnd.uniform(0.8, 2.6), rnd.uniform(6, 26)
        tw = 0.25 + 0.5 * (0.5 + 0.5 * math.sin(t * rnd.uniform(1, 3) + x))
        cr.arc(x, (y - t * sp) % H, rad, 0, 2 * math.pi); cr.set_source_rgba(1, 1, 1, tw * 0.6); cr.fill()

def finish(cr, t):
    """Viñeta + grano: se aplica al final de cada fotograma."""
    v = cairo.RadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, H * 0.85)
    v.add_color_stop_rgba(0, 0, 0, 0, 0); v.add_color_stop_rgba(1, 0, 0, 0, 0.45)
    cr.set_source(v); cr.paint()
    cr.save(); cr.scale(4, 4); cr.set_source_surface(_grain(int(t * 12) % 3), 0, 0); cr.get_source().set_filter(cairo.FILTER_NEAREST)
    cr.set_operator(cairo.OPERATOR_OVERLAY); cr.paint_with_alpha(0.32); cr.restore()

# ---------------- partículas y FX ----------------
def sparkle(cr, x, y, r, color, a=1.0, rot=0.0):
    """Destello de 4 puntas."""
    cr.save(); cr.translate(x, y); cr.rotate(rot)
    radial_glow(cr, 0, 0, r * 2.2, color, 0.35 * a)
    tips = [(0, -r), (r, 0), (0, r), (-r, 0)]
    cr.move_to(*tips[0])
    for k in range(4):
        p, q = tips[k], tips[(k + 1) % 4]
        cr.curve_to(p[0] * 0.12, p[1] * 0.12, q[0] * 0.12, q[1] * 0.12, q[0], q[1])
    cr.close_path(); cr.set_source_rgba(*lighten(color, 0.6), a); cr.fill(); cr.restore()

def ring_burst(cr, x, y, p, color, rmax=260, width=10):
    """Onda expansiva (p de 0 a 1)."""
    if p <= 0 or p >= 1: return
    cr.arc(x, y, rmax * eout(p), 0, 2 * math.pi); cr.set_source_rgba(*color, (1 - p) * 0.9); cr.set_line_width(width * (1 - p) + 1); cr.stroke()

def icon_badge(cr, cx, cy, r, c1, c2, draw_icon=None):
    """Círculo 3D tipo app icon con icono blanco dentro."""
    d = lambda c: c.arc(cx, cy, r, 0, 2 * math.pi)
    shadow(cr, d, r * 0.5, 0.5, dy=r * 0.18)
    g = cairo.LinearGradient(cx - r, cy - r, cx + r, cy + r); g.add_color_stop_rgb(0, *c1); g.add_color_stop_rgb(1, *c2)
    d(cr); cr.set_source(g); cr.fill()
    cr.save(); d(cr); cr.clip(); hg = cairo.LinearGradient(0, cy - r, 0, cy); hg.add_color_stop_rgba(0, 1, 1, 1, 0.35); hg.add_color_stop_rgba(1, 1, 1, 1, 0); cr.set_source(hg); cr.paint(); cr.restore()
    d(cr); cr.set_source_rgba(1, 1, 1, 0.35); cr.set_line_width(3); cr.stroke()
    if draw_icon: cr.save(); cr.translate(cx, cy); draw_icon(cr, r); cr.restore()
