"""¿Ya hicimos este tema? Busca en TODO temas.json, pedidos.json y herramientas/guiones/*.json.
uso: python3 herramientas/repetido.py "bostezo" "bostezar" "contagioso"
Pasa 2–4 palabras clave del tema (sin acentos también vale). Si encuentra algo, sale con código 1: ese tema YA se hizo; elige otro (o un ángulo claramente distinto y avísalo).
"""
import json, sys, glob, unicodedata, os
def norm(s): return "".join(c for c in unicodedata.normalize("NFD", (s or "").lower()) if unicodedata.category(c) != "Mn")
claves = [norm(k) for k in sys.argv[1:] if k.strip()]
if not claves: print(__doc__); sys.exit(2)
raiz = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
hall = []
t = json.load(open(os.path.join(raiz, "temas.json"))); t = t if isinstance(t, list) else t.get("temas", t)
for x in t:
    txt = norm(x.get("tema", "") + " " + x.get("titulo", "") + " " + str(x.get("archivo", "")))
    if any(k in txt for k in claves): hall.append(f"temas.json  {x.get('fecha')} {x.get('hora')}: {x.get('tema','')[:90]}")
for x in json.load(open(os.path.join(raiz, "pedidos.json"))):
    if any(k in norm(x.get("tema", "")) for k in claves): hall.append(f"pedidos.json {x.get('fecha')} {x.get('horario')} [{x.get('estado')}]: {x.get('tema','')[:90]}")
for f in sorted(glob.glob(os.path.join(raiz, "herramientas/guiones/*.json"))):
    for x in json.load(open(f)):
        if any(k in norm(x.get("tema", "") + " " + x.get("slug", "")) for k in claves): hall.append(f"guiones/{os.path.basename(f)} {x.get('hora')} [{x.get('estado')}]: {x.get('tema','')[:90]}")
if hall: print("⚠️ YA HECHO O EN COLA:\n  " + "\n  ".join(hall)); sys.exit(1)
print("OK: no aparece en temas.json, pedidos.json ni guiones.")
