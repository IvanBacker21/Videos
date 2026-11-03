"""Ejemplo: miniatura del short del helado. Ejecuta desde herramientas/: python3 ejemplos/miniatura_helado.py salida.png"""
import sys, os, math
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
import render3 as R
from miniatura import miniatura
from estilo import *

def sujeto(cr):
    R.radial_glow(cr, 600, 800, 420, R.RED, 0.7)
    R.ring_burst(cr, 600, 800, 0.35, YEL, 520, 16)
    R.head(cr, 470, 1120, 1.45, "pain", 0.3, heat=1.0)
    R.cone(cr, 880, 1200, 1.2, -0.5)
    for k in range(5):
        ang = -2.6 + k * 0.45
        R.bolt(cr, 600 + math.cos(ang) * 400, 840 + math.sin(ang) * 400, 1.5, 1, ang + 1.57)

miniatura(sys.argv[1] if len(sys.argv) > 1 else "miniatura.png", ["¿POR QUÉ", "DUELE?"], sujeto, etiqueta="EL CEREBRO SE CONGELA")
