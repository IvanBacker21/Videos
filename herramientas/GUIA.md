# Guía de producción — Dato Cósmico 2

Canal de YouTube Shorts de datos curiosos de ciencia, en español latino. Tres shorts al día, publicados vía Metricool a las 13:30, 18:00 y 21:30 (America/Mexico_City).

## Preparar el entorno (cada sesión es nueva)

```bash
pip install --break-system-packages -q kokoro-onnx soundfile pycairo numpy
mkdir -p ~/voices/kok && cd ~/voices/kok
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/kokoro-v1.0.onnx
curl -sSLO https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/voices-v1.0.bin
```
Fuente Poppins (titulares y subtítulos):
```bash
mkdir -p ~/.fonts && cd ~/.fonts && for f in Poppins-Black Poppins-ExtraBold Poppins-Bold; do curl -sSLO https://raw.githubusercontent.com/google/fonts/main/ofl/poppins/$f.ttf; done; fc-cache -f
```
`ffmpeg` e Inter ya vienen instalados.

## Flujo

1. **Tema**: busca en la web noticias de ciencia de los últimos días y temas curiosos con interés en México/Latam. Elige uno que no esté en `temas.json`. Comprueba el dato en al menos dos fuentes fiables; si no se puede verificar, elige otro tema.
2. **Guion** (`herramientas/ejemplos/AAAA-MM-DD-slug.json`, mismo formato que el ejemplo del helado):
   - 25–40 s en total (mejor 30 s), 5–7 escenas, frases cortas y conversacionales, tuteo, español latino.
   - Escena 1 = gancho en los primeros 2 s (pregunta o afirmación sorprendente) + promesa que obligue a quedarse ("al final te digo…").
   - Etiquetas "PASO 1/2/3" o similares para que se note el avance.
   - Cierre: "Sígueme y mañana te cuento otro dato que no vas a creer." (o variante).
   - Voz: `{"modelo": "em_alex", "lang": "es-419", "speed": 1.1}`. Escribe números y siglas como se pronuncian.
3. **Voz**: `python3 herramientas/voice.py guion.json out/` → `v*.wav` + `timings.json`.
4. **Animación**: usa **`render3.py` + `estilo.py`** (estilo moderno; `render2.py` es la versión vieja, no la uses). Copia `render3.py` y reescribe `draw_scene()` y `BGS` con ilustraciones nuevas para el tema (el resto — fondo, cámara con zoom/temblor, subtítulos palabra por palabra, barra de progreso, efectos — se reutiliza). Ajusta `BGS` con un color de fondo por escena. Reglas de ritmo:
   - Algo cambia en pantalla cada 1–3 s; cada escena entra con zoom y destello.
   - Eventos ligados a palabras con `z.w("palabra")` y a frases con `z.f(n)`; registra efectos de sonido con `ev("impact"|"whoosh"|"pop"|"ding"|"zap"|"crack"|"heartbeat"|"click", t)`.
   - Nada de emojis en el texto de cairo (no se ven): dibuja las formas.
   - Zona útil: elementos entre y=250 y y=1350; subtítulos en y≈1460; nada importante en los 300 px inferiores ni a la derecha extrema (botones de YouTube).
   - Antes del render completo, dibuja fotogramas sueltos (`render3.py guion.json out frames 1.0,5.0,…`), haz una hoja de contacto y revísala.
5. **Render**: `python3 render3.py guion.json out && python3 herramientas/audio.py out` y luego
   `ffmpeg -i out/video.mp4 -i out/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest shorts/AAAA-MM-DD-slug.mp4`
6. **Publicar**: commit + push a `main` de este repo; el enlace público es
   `https://raw.githubusercontent.com/IvanBacker21/videos/main/shorts/AAAA-MM-DD-slug.mp4`.
   **Miniatura**: crea `shorts/<mismo-nombre>.png` con `herramientas/miniatura.py` (ver `ejemplos/miniatura_helado.py`): 2–4 palabras gigantes que generen curiosidad (no repitas el título entero), el sujeto ilustrado grande con emoción y glow, una etiqueta corta. Revísala antes de subirla. Súbela junto con el video.
   Programa en Metricool (blogId `7853477`) con `videoThumbnailUrl` = enlace raw del PNG. Si responde `VIDEO_THUMBNAIL_NOT_APPLICABLE` (canal sin verificar o sin miniaturas de Shorts), repite la llamada SIN `videoThumbnailUrl` y menciona en el resumen que la miniatura no se aplicó.
   Programa con `createScheduledPost`: red `youtube`, `type: "short"`, `privacy: "public"`, `madeForKids: false`, `category: "EDUCATION"`, `isAiGeneratedContent: false` (animación no realista), título con gancho + `#shorts` (≤ 100 caracteres), descripción de 3–4 líneas + "🔔 Un dato curioso de ciencia cada día en Dato Cósmico 2." + 5–6 hashtags.
7. Añade la entrada a `temas.json` y haz commit.

## Estrategia de crecimiento (aplícala en cada short)

- **Los primeros 2 segundos deciden todo.** El primer fotograma ya debe mostrar acción y una pregunta o afirmación sorprendente en texto grande. Nada de logos ni introducciones.
- **Corto y completo**: 25–40 s. Mejor un 30 s visto al 90 % que un 50 s visto a la mitad. Corta cualquier frase que no aporte.
- **Bucle**: que la última frase conecte con la primera (p. ej. termina en "…y por eso" o vuelve a la pregunta inicial) para que se repita sin corte.
- **Promesa abierta**: "al final te digo…", "el paso 3 es el más raro", y cúmplela.
- **Títulos**: palabra clave al principio, ≤ 60 caracteres antes de "#shorts", curiosidad sin engañar (p. ej. "¿Por qué los pulpos tienen 3 corazones?").
- **Variedad de formatos dentro del nicho**, rotando: "¿Por qué…?", "Mito o realidad", "Top 3", "Noticia de ciencia de esta semana", "Tu cuerpo hace esto sin que lo sepas", "Escala/comparación" (qué tan grande, qué tan rápido). Evita que dos shorts seguidos tengan la misma estructura, y que cada short tenga animaciones propias: YouTube no monetiza contenido repetitivo o producido en masa.
- **Temas con demanda**: cuerpo humano, espacio, animales raros, comida, mitos populares, tecnología/IA cotidiana, noticias de ciencia virales. Revisa en `temas.json` qué categorías se han usado y equilibra.
- **Comentarios**: termina la descripción con una pregunta para el público ("¿Tú sabías esto?"). Si el título lo permite, provoca opinión.
- **Exactitud**: cero datos inventados; dos fuentes fiables por short. Un error destruye la confianza y los comentarios lo señalan.
- En `temas.json` guarda también `formato` y `categoria` para equilibrar.

## Estilo visual (obligatorio)

Look moderno 2.5D tipo motion graphics, coherente en todo el canal:
- **Todo con volumen**: formas con `volume()` (degradado claro→oscuro, brillo superior, sombra suave). Nada de rellenos planos con contorno negro grueso.
- **Profundidad**: sombras suaves (`shadow`), luces (`radial_glow`, `glow`), destellos (`sparkle`), ondas (`ring_burst`). El fondo siempre con `background()` y cada fotograma termina con `finish()` (viñeta + grano).
- **Tipografía**: Poppins Black para titulares y subtítulos, con sombra suave; degradado en titulares; textos de apoyo en `callout()` (píldora en degradado) o `glass()`.
- **Paleta**: fondos oscuros cósmicos + acentos neón (CYAN, VIOLET, PINK, YEL, MINT, ORANGE). Un color de fondo distinto por escena (`BGS`).
- **Iconos e ilustraciones**: formas redondeadas, simples y legibles a tamaño de celular; usa `icon_badge()` para iconos tipo app. Sujeto principal grande (500–800 px).
- **Movimiento**: todo entra con rebote (`pop`, `spring`), nada aparece de golpe sin animación; algo se mueve siempre (flotación suave, partículas).
- Antes del render completo revisa una hoja de contacto y pregúntate: ¿parece de un canal profesional? Si algo se ve plano, vacío o amateur, mejóralo.
