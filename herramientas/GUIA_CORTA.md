# Guía CORTA — Dato Cósmico 2 (desde el 17-nov-2026)

Lo indispensable para las tareas programadas. La guía larga (`GUIA.md`) queda como consulta: léela solo con `grep`/`sed -n` si necesitas un detalle.

## Entorno (cada sesión es nueva)
```bash
pip install --break-system-packages -q kokoro-onnx soundfile pycairo numpy
mkdir -p ~/voices/kok && cd ~/voices/kok && curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx && curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
mkdir -p ~/.fonts && cd ~/.fonts && for f in Poppins-Black Poppins-ExtraBold Poppins-Bold; do curl -sSLO https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/$f.ttf; done; fc-cache -f
cd <repo>/herramientas/motor3d && npm i --silent
```
Clave de Buffer: solo en `~/.buffer_key` (nunca en el repo, commits, mensajes ni salidas).

## Tema (lo decide la tarea de la mañana)
- `pedidos.json` manda: pedido "pendiente" con esa fecha y horario = ese tema.
- Si no: dato curioso que sea TENDENCIA hoy en México (noticia, temporada, fiestas, clima, futbol, cielo) conectado con algo que TODOS han vivido + mito o "¿por qué SIEMPRE…?"; cuerpo, comida, casa, tecnología, clima o espacio; contexto mexicano y truco útil si se puede.
- Máximo 1 de animales cada 6 shorts (revisa los últimos 6 de `temas.json`). Nada abstracto en el gancho, nada de ganchos de reto. No repetir `temas.json` NI los pedidos pendientes de `pedidos.json`. No más de 2 shorts seguidos del mismo tema de temporada (p. ej. frío).
- Dos fuentes fiables por dato. Prueba de compartir: ¿a quién se lo mandarían y qué le dirían? (eres tú / ¿ves? te dije / lo mexicano / truco útil / sorpresa: usa al menos dos).

## Guion `herramientas/ejemplos/AAAA-MM-DD-HHMM-slug.json`
- `"voz": {"modelo": "em_alex", "lang": "es-419", "speed": 1.0}`; 4–5 escenas de contenido (una idea cada una), 18–23 s de contenido, TOTAL ≤ 30 s con el cierre. Números con letra, máximo dos.
- Gancho concreto en los primeros 2 s. Última escena de contenido: "Mándaselo a…" alguien concreto. Luego escena `cierre` con el texto exacto: "¿Tienes algún dato curioso del que te gustaría que habláramos?" + "Déjalo en los comentarios y síguenos para más datos."
- `python3 herramientas/coherencia.py guion.json [escenas.js] --out OUT --titulo "…" --descripcion "…"` debe dar OK.
- Título YouTube: pregunta corta con UNA palabra en MAYÚSCULAS + 1 emoji + ` #shorts`, sin letras cambiadas por números ni palabras sensibles (sangre, muerte…). Descripción con la línea `💬 ¿Tienes algún dato curioso del que te gustaría que habláramos? Déjalo en los comentarios.` y hashtags. TikTok: título corto + gancho, invitación a etiquetar y hashtags sin #shorts.

- **🧪 PRUEBA DE DURACIÓN (Iván, 19-nov) — SOLO del 20 al 26 de noviembre de 2026 y SOLO el short de las 21:30:** contenido de **36–42 s** (6–8 escenas, ~95–110 palabras sin el cierre) + el cierre exacto. No es relleno: un dato extra, un segundo mito o un truco extra, gancho fuerte y una sorpresa a la mitad; cambio de escena cada 4–6 s. `coherencia.py` con `--largo`. En temas.json: `"prueba": "largo-40s"` en el de 21:30 y `"prueba": "normal"` en los de 13:30 y 18:00 de esos días. El resto de horarios y fechas siguen en ≤ 30 s. La producción de las 21:30 arranca a las 17:40 porque el render tarda ~2.5 h.

## Escenas `ejemplos/AAAA-MM-DD-HHMM-slug.js` (CARTULINA CHIBI, obligatorio)
- Copia la estructura del short más reciente de `ejemplos/` (p. ej. `2026-11-16-2130-vaho-frio.js`). `import { kitPapel } from '../motor3d/papel.js'; import { kitPM } from '../motor3d/papel_pm.js';` → `const P = kitPapel(E), PM = kitPM(P, THREE, group), { A } = PM;` y termina con `P.cierre();` (logo 14; no hagas otro cierre).
- Escenario: `ambiente({top:0xbfe3f5,bottom:0xbfe3f5,fog:0xbfe3f5,near:80,far:160,sunInt:.01,hemiInt:.01}); PM.diorama(); P.luces({pos:[-3,5,8],hemi:1.75,sol:1.5,radio:6});` o interiores `PM.cocina()`, `PM.cuarto()`, `PM.espacio()`.
- Protagonista = `PM.chibi(pos, {logo:true})` (único con playera azul y logo). Mascotas: `PM.perroPM`, `PM.gatoPM`. Máximo 3 personajes por toma; todos parpadean (`A.parpadea` con fase distinta) y se mueven; expresión = lo que dice la voz (`p.boca(...)`, `A.preocupa`). Movimiento con `const t = P.tw(lt)` (12 fps). Tiempos de palabras: `c.w('palabra')`.
- Para ver qué hay en el kit: `grep -n "^  // PM\.\|^  function " herramientas/motor3d/papel_pm.js` (no lo leas completo). Lo nuevo y reutilizable va en `papel_pm.js` (sin cambiar lo existente) y una línea en `MEJORAS.md` → "Hechas".
- Cámara `cam([x, 1.2, 10.4], [x, 1.15, 0], 34)` (ancho visible ≈ ±1.43). Etiquetas entre y ≈ -.45 y 2.6 (fuera de subtítulos arriba y del rótulo abajo); rótulo `rotulo(titulo, sub, lt, 1600)` de ≤ 26 letras por línea.

## Revisión autocrítica (antes del render y con el MP4 final)
Nada cortado (sobre todo lo que explica la voz) · letreros fuera de subtítulos y rótulo · nada fuera de cuadro · sin cuadros negros · nadie congelado · expresiones correctas · primer cuadro con ojos abiertos. Fotogramas previos: `PR=1.5 node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js frames 0,1.6,…` (segundos) y UNA hoja de contacto pequeña (240×427, ≤ 12 cuadros). Solo amplía lo dudoso.

## Render (reanudable; la sesión puede reiniciarse)
```bash
cd herramientas/motor3d; for w in 0 1; do PR=1.5 setsid nohup node render_partes.js ../ejemplos/X.json OUT ../ejemplos/X.js $w 2 > OUT/log$w.txt 2>&1 < /dev/null & done
# espera con sleep ≤ 300 s por llamada; avance = ls OUT/jpg | wc -l (≈ 10 cuadros/min). Si los procesos murieron y faltan cuadros, vuelve a lanzar lo mismo.
node render_partes.js --unir OUT && cd .. && python3 audio.py OUT
ffmpeg -i OUT/video.mp4 -i OUT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest ../shorts/<archivo>.mp4
```
`OUT` necesita `timings.json` y los `v*.wav` de `voice.py`. Para rehacer cuadros: bórralos de `OUT/jpg/` y vuelve a lanzar. Revisión final: `ffmpeg -i shorts/<archivo>.mp4 -vf "fps=2,scale=150:267,tile=11x5" hoja.png`; `ffprobe` ≤ 30 s, < 20 MB.

## Publicar
`temas.json` (fecha, hora, tema con fuentes, formato, categoria, tendencia, disparadores, duracion, mejora, archivo, titulo) → commit y push a `main` (si falla: `git pull --rebase` y reintenta; si da 403, entrega manual y avisa) → `https://raw.githubusercontent.com/IvanBacker21/Videos/main/shorts/<archivo>.mp4` debe dar 200 → `python3 herramientas/buffer.py lista` (que no haya nada a esa hora) → `buffer.py programar --red youtube …` y `--red tiktok …` con `--hora AAAA-MM-DDTHH:MM` (CDMX). Si Buffer falla dos veces: SendUserFile con el .mp4 + textos listos para copiar.
