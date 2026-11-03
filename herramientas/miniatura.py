"""Plantilla de miniatura 1080x1920 para Shorts.
Uso desde código:  from miniatura import miniatura; miniatura("salida.png", ["¿POR QUÉ", "DUELE?"], dibujar_sujeto, etiqueta="EL CEREBRO SE CONGELA")
- lineas: 1–3 líneas MUY cortas (2–4 palabras en total). La última va en el color de acento.
- dibujar_sujeto(cr): dibuja la ilustración principal centrada en (540, 1050), ocupando ~800 px. Debe ser grande, con contraste y emoción.
"""
import cairo, math, sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from estilo import *

def miniatura(path, lineas, dibujar_sujeto, etiqueta=None, acento=YEL, acento2=ORANGE, top=(0.10, 0.05, 0.24), bottom=(0.32, 0.06, 0.30), blobs=(PINK, VIOLET, CYAN)):
    s = cairo.ImageSurface(cairo.FORMAT_ARGB32, W, H); cr = cairo.Context(s)
    background(cr, 2.0, top, bottom, blobs)
    # rayos de luz detrás del sujeto
    cr.save(); cr.translate(540, 1050)
    for k in range(16):
        a = k * math.pi / 8; cr.move_to(0, 0); cr.arc(0, 0, 1300, a, a + 0.12); cr.close_path()
        cr.set_source_rgba(1, 1, 1, 0.045); cr.fill()
    cr.restore()
    radial_glow(cr, 540, 1050, 620, acento, 0.35)
    dibujar_sujeto(cr)
    # titular gigante
    size = 168; y = 300
    for i, ln in enumerate(lineas):
        last = i == len(lineas) - 1
        while text_extents(cr, ln, size).x_advance > 980 and size > 90: size -= 6
    for i, ln in enumerate(lineas):
        last = i == len(lineas) - 1
        text(cr, ln, 540, y + i * size * 1.02, size, grad=(lighten(acento, 0.45), acento2) if last else (WHITE, (0.82, 0.86, 1.0)),
             outline=((0.05, 0.02, 0.10), 18), glow_c=acento2 if last else None, sh_alpha=0.8)
    if etiqueta:
        e = text_extents(cr, etiqueta, 58)
        cr.save(); cr.translate(540, 1590); cr.rotate(-0.035)
        pill(cr, 0, -20, e.x_advance + 90, 120, PINK, VIOLET); text(cr, etiqueta, 0, 0, 58, WHITE); cr.restore()
    text(cr, "DATO CÓSMICO 2", 540, 1800, 40, CYAN, font=DISPLAY_XB)
    finish(cr, 2.0)
    s.write_to_png(path)
    return path
