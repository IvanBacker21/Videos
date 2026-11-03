# Guía de producción — Dato Cósmico 2

Canal de YouTube Shorts de datos curiosos de ciencia, en español latino. Un short al día, publicado a las 18:00 (America/Mexico_City) vía Metricool.

## Preparar el entorno (cada sesión es nueva)

```bash
pip install --break-system-packages -q kokoro-onnx soundfile pycairo numpy
mkdir -p ~/voices/kok && cd ~/voices/kok
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
`ffmpeg` y la fuente Inter ya vienen instalados.

## Flujo

1. **Tema**: busca en la web noticias de ciencia de los últimos días y temas curiosos con interés en México/Latam. Elige uno que no esté en `temas.json`. Comprueba el dato en al menos dos fuentes fiables; si no se puede verificar, elige otro tema.
2. **Guion** (`herramientas/ejemplos/AAAA-MM-DD-slug.json`, mismo formato que el ejemplo del helado):
   - 35–50 s en total, 6–7 escenas, frases cortas y conversacionales, tuteo, español latino.
   - Escena 1 = gancho en los primeros 2 s (pregunta o afirmación sorprendente) + promesa que obligue a quedarse ("al final te digo…").
   - Etiquetas "PASO 1/2/3" o similares para que se note el avance.
   - Cierre: "Sígueme y mañana te cuento otro dato que no vas a creer." (o variante).
   - Voz: `{"modelo": "em_alex", "lang": "es-419", "speed": 1.1}`. Escribe números y siglas como se pronuncian.
3. **Voz**: `python3 herramientas/voice.py guion.json out/` → `v*.wav` + `timings.json`.
4. **Animación**: copia `render2.py` y reescribe `draw_scene()` con ilustraciones nuevas para el tema (el resto — fondo, cámara con zoom/temblor, subtítulos palabra por palabra, barra de progreso, efectos — se reutiliza). Ajusta `BGS` con un color de fondo por escena. Reglas de ritmo:
   - Algo cambia en pantalla cada 1–3 s; cada escena entra con zoom y destello.
   - Eventos ligados a palabras con `z.w("palabra")` y a frases con `z.f(n)`; registra efectos de sonido con `ev("impact"|"whoosh"|"pop"|"ding"|"zap"|"crack"|"heartbeat"|"click", t)`.
   - Nada de emojis en el texto de cairo (no se ven): dibuja las formas.
   - Zona útil: elementos entre y=250 y y=1350; subtítulos en y≈1460; nada importante en los 300 px inferiores ni a la derecha extrema (botones de YouTube).
   - Antes del render completo, dibuja fotogramas sueltos (`render2.py guion.json out frames 1.0,5.0,…`), haz una hoja de contacto y revísala.
5. **Render**: `python3 render2.py guion.json out && python3 herramientas/audio.py out` y luego
   `ffmpeg -i out/video.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest shorts/AAAA-MM-DD-slug.mp4`
6. **Publicar**: commit + push a `main` de este repo; el enlace público es
   `https://raw.githubusercontent.com/IvanBacker21/videos/main/shorts/AAAA-MM-DD-slug.mp4`.
   Programa en Metricool (blogId `7853477`) con `createScheduledPost`: red `youtube`, `type: "short"`, `privacy: "public"`, `madeForKids: false`, `category: "EDUCATION"`, `isAiGeneratedContent: false` (animación no realista), título con gancho + `#shorts` (≤ 100 caracteres), descripción de 3–4 líneas + "🔔 Un dato curioso de ciencia cada día en Dato Cósmico 2." + 5–6 hashtags.
7. Añade la entrada a `temas.json` y haz commit.
