"""Verificador de coherencia del short. Ejecútalo SIEMPRE antes del render completo y otra vez antes de publicar.
uso: python3 coherencia.py guion.json [escenas.py] [--out OUT] [--titulo "..."] [--descripcion "..."]
Sale con código 1 si hay ERRORES (no publiques). Las ADVERTENCIAS hay que revisarlas a mano.
"""
import json, re, sys, os, argparse

CIERRE = "¿Tienes algún dato curioso del que te gustaría que habláramos? Déjalo en los comentarios y síguenos para más datos."
SENSIBLES = ["sangre", "muerte", "muere", "matar", "mata ", "cadáver", "droga", "sexo", "arma", "suicid", "violen", "disparo"]
COMPARTIR = ["mándaselo", "mandaselo", "etiqueta", "comparte", "compártelo", "pásaselo", "enséñale", "mándale"]

ap = argparse.ArgumentParser(); ap.add_argument("guion"); ap.add_argument("escenas", nargs="?")
ap.add_argument("--out"); ap.add_argument("--titulo", default=""); ap.add_argument("--descripcion", default="")
a = ap.parse_args()
d = json.load(open(a.guion)); esc = d["escenas"]
err, warn = [], []

# 1. estructura y cierre
if esc[-1]["tipo"] != "cierre": err.append("La última escena debe ser 'cierre'.")
elif " ".join(esc[-1]["frases"]).strip() != CIERRE: err.append(f"El texto del cierre no es exacto. Debe ser: {CIERRE}")
contenido = esc[:-1]
if not contenido: err.append("No hay escenas de contenido.")
remate = " ".join(contenido[-1]["frases"]).lower() if contenido else ""
if not any(w in remate for w in COMPARTIR):
    warn.append("La última escena de contenido no invita a compartir con alguien concreto ('Mándaselo a…', 'Etiqueta a…').")
tipos = [e["tipo"] for e in esc]
if len(set(tipos)) != len(tipos): err.append(f"Hay tipos de escena repetidos: {tipos} (cada escena necesita un 'tipo' único).")

# 2. texto: números, letras raras, repeticiones
todo = " ".join(" ".join(e["frases"]) for e in contenido)
nums = re.findall(r"\d+(?:[.,]\d+)?", todo)
if len(nums) > 2: warn.append(f"Hay {len(nums)} números en la voz ({nums}); la guía pide máximo 2 y redondos. Escríbelos con letra para que la voz los lea bien.")
elif nums: warn.append(f"Números escritos con cifra en la voz ({nums}): escríbelos con letra para que la voz los pronuncie bien.")
for w in re.findall(r"\b\w+\b", todo):
    if re.search(r"[a-záéíóúñ]\d|\d[a-záéíóúñ]", w.lower()): err.append(f"Palabra con letras y números mezclados: '{w}'.")
largas = [f for e in contenido for f in e["frases"] if len(f.split()) > 22]
if largas: warn.append(f"Frases demasiado largas para un short (>22 palabras): {largas}")

# 3. duración (si ya hay timings)
if a.out and os.path.exists(f"{a.out}/timings.json"):
    T = json.load(open(f"{a.out}/timings.json")); total = sum(t["dur"] for t in T); cont = sum(t["dur"] for t in T[:-1])
    if cont > 32: err.append(f"El contenido dura {cont:.1f} s: el máximo es 30 s (los shorts largos se ven a menos del 50 %). Recorta frases.")
    elif cont < 18: warn.append(f"El contenido dura {cont:.1f} s (objetivo 20–30 s).")
    if T[0]["dur"] > 6.5: warn.append(f"La primera escena dura {T[0]['dur']:.1f} s: el gancho debe ser corto y directo.")
    print(f"Duración total {total:.1f} s (contenido {cont:.1f} s + cierre {total - cont:.1f} s)")

# 4. animación ↔ guion: cada z.w("palabra") y z.f(n) del archivo de escenas debe existir en su escena
if a.escenas and os.path.exists(a.escenas):
    src = open(a.escenas, encoding="utf-8").read()
    js = a.escenas.endswith(".js")
    bloques = re.split(r"escena\('([^']+)'" if js else r'kind == "([^"]+)"', src)
    por_tipo = {bloques[i]: bloques[i + 1] for i in range(1, len(bloques) - 1, 2)}
    for e in esc:
        b = por_tipo.get(e["tipo"])
        if b is None:
            if e["tipo"] != "cierre": err.append(f"La escena '{e['tipo']}' no tiene animación en {os.path.basename(a.escenas)}.")
            continue
        palabras = " ".join(e["frases"]).lower()
        for w in re.findall(r"c\.w\('([^']+)'" if js else r'z\.w\("([^"]+)"', b):
            if w.lower() not in palabras: err.append(f"[{e['tipo']}] la animación espera la palabra '{w}' pero no está en la voz → el efecto saldrá en el segundo 0.")
        for n in re.findall(r"c\.f\((\d+)\)" if js else r"z\.f\((\d+)\)", b):
            if int(n) >= len(e["frases"]): err.append(f"[{e['tipo']}] la animación usa la frase {n} pero la escena solo tiene {len(e['frases'])}.")

# 5. título y descripción
for nombre, t in (("título", a.titulo), ("descripción", a.descripcion)):
    if not t: continue
    low = t.lower()
    for s in SENSIBLES:
        if s in low: err.append(f"La {nombre} contiene una palabra sensible para anunciantes: '{s.strip()}'.")
    for w in re.findall(r"\b\w+\b", t):
        if re.search(r"[a-záéíóúñ]\d|\d[a-záéíóúñ]", w.lower()) and not w.lower().startswith("#"): err.append(f"La {nombre} tiene letras y números mezclados: '{w}'.")
if a.titulo and len(a.titulo) > 100: err.append("El título pasa de 100 caracteres.")

print("\n=== GUION COMPLETO (léelo en voz alta y revisa la lista) ===")
for e in esc: print(f"[{e['tipo']}] " + " ".join(e["frases"]))
print("""
Revisión humana obligatoria (responde sí/no a cada una antes de seguir):
 1. ¿El gancho promete algo que el video SÍ cumple?
 2. ¿Cada escena se sigue lógicamente de la anterior (sin saltos ni datos sueltos)?
 3. ¿Todo lo que se ve en pantalla (textos, etiquetas, iconos) coincide con lo que dice la voz en ese momento?
 4. ¿Ningún dato contradice a otro, y todos están verificados en dos fuentes?
 5. ¿Un niño de 12 años lo entendería a la primera?
 6. ¿El remate invita a compartir con alguien concreto y luego viene el cierre, sin intentar conectar con el inicio?
 7. ¿El título y la descripción dicen lo mismo que el video, sin exagerar?""")
for w in warn: print("ADVERTENCIA:", w)
for e in err: print("ERROR:", e)
print("\nRESULTADO:", "NO PUBLICAR — corrige los errores" if err else "OK (revisa advertencias y la lista)")
sys.exit(1 if err else 0)
