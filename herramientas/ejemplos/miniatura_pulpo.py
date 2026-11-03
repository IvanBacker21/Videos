"""Miniatura del short del pulpo. Ejecuta desde herramientas/: python3 ejemplos/miniatura_pulpo.py salida.png"""
import sys, os, math, importlib.util
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
spec = importlib.util.spec_from_file_location("R", os.path.join(os.path.dirname(os.path.abspath(__file__)), "2026-11-03-1800-pulpo.py"))
R = importlib.util.module_from_spec(spec); spec.loader.exec_module(R)
from miniatura import miniatura
from estilo import *

def sujeto(cr):
    R.radial_glow(cr, 540, 760, 460, R.RED, 0.45)
    R.octopus(cr, 540, 1100, 1.3, 2.1, "shock", look=(0, -1), L=300)
    for k, (hx, hy, r, col) in enumerate([(250, 720, 80, PINK), (540, 640, 100, R.RED), (830, 720, 80, PINK)]):
        R.heart(cr, hx, hy, r, col, 1, 0.6, 0.8)

miniatura(sys.argv[1] if len(sys.argv) > 1 else "miniatura.png", ["TIENE 3", "CORAZONES"], sujeto, etiqueta="Y SANGRE AZUL",
          top=(0.02, 0.08, 0.24), bottom=(0.20, 0.04, 0.28), blobs=(PINK, CYAN, VIOLET))
