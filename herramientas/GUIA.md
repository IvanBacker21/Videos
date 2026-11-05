# Guía de producción — Dato Cósmico 2

Canal de YouTube Shorts de datos curiosos de ciencia, en español latino. Tres shorts al día (por unas semanas, hasta que el canal tenga historial), publicados vía Metricool a las 13:30, 18:00 y 21:30 (America/Mexico_City).

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

- **Aprende de las métricas**: si existe `metricas.md` (lo llena la revisión cada 2 h), léelo antes de elegir tema y formato: repite lo que tiene mejor % visto y más vistas del feed, y evita lo que se atascó.

0. **Pedidos de Iván**: abre `pedidos.json`. Si hay una entrada con `estado: "pendiente"` para la fecha de hoy y el horario que te toca, ESE es el tema (sigue sus `indicaciones`, que mandan sobre las reglas generales de elección de tema). Al terminar, cambia su `estado` a `"hecho"` y haz commit.

1. **Tema**: busca en la web noticias de ciencia de los últimos días y temas curiosos con interés en México/Latam. Elige uno que no esté en `temas.json`. Comprueba el dato en al menos dos fuentes fiables; si no se puede verificar, elige otro tema.
2. **Guion** (`herramientas/ejemplos/AAAA-MM-DD-slug.json`, mismo formato que el ejemplo del helado):
   - **20–30 s de contenido** (más el cierre), 5–6 escenas cortas, frases cortas y conversacionales, tuteo, español latino.
   - **Tono**: datos curiosos LIGEROS y divertidos, que cualquiera entienda y quiera contar a un amigo. Pocos números (máximo uno o dos, redondos), nada de tecnicismos ni listas de cifras. Mejor temas cotidianos y sorprendentes (tu cuerpo, animales, comida, hábitos, cosas que todos hacen) que datos astronómicos o técnicos. Ejemplo de referencia PRINCIPAL (aprobado por Iván): `ejemplos/2026-11-04-1330-picante.*` — estructura, tono, ritmo, estilo Material y remate para compartir. Úsalo como plantilla. Evita el estilo del short de Venus (demasiadas cifras).
   - **Sin bucle**: NO intentes conectar el final con el inicio. La última escena de contenido cierra la historia con un remate claro (una pregunta al espectador o una frase graciosa) y de ahí se pasa natural a la escena de cierre.
   - Escena 1 = gancho en los primeros 2 s (pregunta o afirmación sorprendente) + promesa que obligue a quedarse ("al final te digo…").
   - Etiquetas "PASO 1/2/3" o similares para que se note el avance.
   - Cierre (escena `cierre`, SIEMPRE con este texto, palabra por palabra): "¿Tienes algún dato curioso del que te gustaría que habláramos? Déjalo en los comentarios y síguenos para más datos." Va después del remate de la historia.
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
   **NO hagas miniaturas** y NUNCA mandes `videoThumbnailUrl` ni `videoCoverMilliseconds` a Metricool (falla y afecta la publicación).
   Programa en Metricool (blogId `7853477`) con `createScheduledPost`: red `youtube`, `type: "short"`, `privacy: "public"`, `madeForKids: false`, `category: "EDUCATION"`, `isAiGeneratedContent: false` (animación no realista), título con gancho + `#shorts` (≤ 100 caracteres), descripción de 3–4 líneas + "💬 ¿Tienes algún dato curioso del que te gustaría que habláramos? Déjalo en los comentarios." + "🔔 Un dato curioso de ciencia cada día en Dato Cósmico 2." + 5–6 hashtags.
7. Añade la entrada a `temas.json` y haz commit.

## Estrategia de crecimiento (aplícala en cada short)

- **Los primeros 2 segundos deciden todo.** El primer fotograma ya debe mostrar acción y una pregunta o afirmación sorprendente en texto grande. Nada de logos ni introducciones.
- **Corto y completo**: 20–30 s de contenido. Los datos del canal lo confirman: el bostezo (26 s) se vio al 71 %, el pulpo y el helado (~40 s) a menos del 50 %. Corta cualquier frase que no aporte; una idea por escena.
- **Promesa abierta**: "al final te digo…", "el paso 3 es el más raro", y cúmplela.
- **Títulos**: palabra clave al principio, ≤ 60 caracteres antes de "#shorts", curiosidad sin engañar (p. ej. "¿Por qué los pulpos tienen 3 corazones?").
- **Variedad de formatos dentro del nicho**, rotando: "¿Por qué…?", "Mito o realidad", "Top 3", "Noticia de ciencia de esta semana", "Tu cuerpo hace esto sin que lo sepas", "Escala/comparación" (qué tan grande, qué tan rápido). Evita que dos shorts seguidos tengan la misma estructura, y que cada short tenga animaciones propias: YouTube no monetiza contenido repetitivo o producido en masa.
- **Temas con demanda**: cuerpo humano, espacio, animales raros, comida, mitos populares, tecnología/IA cotidiana, noticias de ciencia virales. Revisa en `temas.json` qué categorías se han usado y equilibra.
- **Comentarios**: termina la descripción con una pregunta para el público ("¿Tú sabías esto?"). Si el título lo permite, provoca opinión.
- **Exactitud**: cero datos inventados; dos fuentes fiables por short. Un error destruye la confianza y los comentarios lo señalan.
- En `temas.json` guarda también `formato` y `categoria` para equilibrar.

## Estilo visual anterior (2.5D, solo referencia)

Look moderno 2.5D tipo motion graphics, coherente en todo el canal:
- **Todo con volumen**: formas con `volume()` (degradado claro→oscuro, brillo superior, sombra suave). Nada de rellenos planos con contorno negro grueso.
- **Profundidad**: sombras suaves (`shadow`), luces (`radial_glow`, `glow`), destellos (`sparkle`), ondas (`ring_burst`). El fondo siempre con `background()` y cada fotograma termina con `finish()` (viñeta + grano).
- **Tipografía**: Poppins Black para titulares y subtítulos, con sombra suave; degradado en titulares; textos de apoyo en `callout()` (píldora en degradado) o `glass()`.
- **Paleta**: fondos oscuros cósmicos + acentos neón (CYAN, VIOLET, PINK, YEL, MINT, ORANGE). Un color de fondo distinto por escena (`BGS`).
- **Iconos e ilustraciones**: formas redondeadas, simples y legibles a tamaño de celular; usa `icon_badge()` para iconos tipo app. Sujeto principal grande (500–800 px).
- **Movimiento**: todo entra con rebote (`pop`, `spring`), nada aparece de golpe sin animación; algo se mueve siempre (flotación suave, partículas).
- Antes del render completo revisa una hoja de contacto y pregúntate: ¿parece de un canal profesional? Si algo se ve plano, vacío o amateur, mejóralo.

## Textos de título y descripción

- Escribe todo en español normal y correcto. **Nunca** uses letras cambiadas por números o símbolos (p. ej. "s4ngr3", "m.u.e.r.t.e"): YouTube lo trata como spam y deja de recomendar el short.
- Evita en título y descripción palabras sensibles para anunciantes (sangre, muerte, matar, cadáver, drogas, sexo, armas…). Si el tema las necesita, usa sinónimos neutros ("fluido azul", "circulación", "no sobrevivió"); en la voz y el video sí pueden decirse con naturalidad.
- Al inicio de cada ejecución, revisa con `getScheduledPosts` (últimos 2 días) el estado de los shorts anteriores: si alguno tiene `status` distinto de `PUBLISHED` o un aviso, inclúyelo en el resumen para Iván.

## TikTok (@datocosmico2)

Cada short se publica TAMBIÉN en TikTok, a la misma hora que en YouTube, con una llamada aparte a `createScheduledPost`:
- `providers: [{"network":"tiktok"}]`, mismo enlace raw del MP4.
- `text` (caption): 1–2 frases cortas con gancho + pregunta al público + 5–6 hashtags (sin `#shorts`; usa p. ej. `#datoscuriosos #ciencia #sabiasque #aprendeentiktok` + 2 del tema). Máximo ~200 caracteres.
- `tiktokData`: `{"privacyOption":"PUBLIC_TO_EVERYONE","title":"<título corto sin #>","isAigc":true,"autoAddMusic":false,"disableComment":false,"disableDuet":false,"disableStitch":false,"commercialContentThirdParty":false,"commercialContentOwnBrand":false}`.
- `isAigc: true` siempre: el video está hecho con IA (voz, guion y animación) y TikTok exige declararlo.
- Las mismas reglas de texto limpio que en YouTube.

## Hacerlo COMPARTIBLE (prioridad n.º 1 al elegir tema y escribir guion)

Antes de escribir, el short debe pasar esta prueba: **¿a quién se lo mandaría alguien por WhatsApp y qué le diría?** ("¡mira, eres tú!", "¿ves? te dije", "no sabía esto"). Si no hay respuesta clara, cambia de tema o de enfoque.

Disparadores que hacen que la gente comparta y dé like (usa al menos dos por short):
1. **"Eres tú"** – identidad y situaciones que todos vivimos: el que siempre llega tarde, el que le pone salsa a todo, la mamá que dice "ponte un suéter", el que no puede dormir sin cobija. La gente lo comparte para etiquetar a alguien.
2. **Lo mexicano** – picante, tortillas, tráfico, temblores, "ahorita", el Oxxo, las abuelitas. Orgullo y humor local = muchos envíos.
3. **"¿Ves? Te dije"** – mitos y consejos de casa que la ciencia confirma o desmiente ("¿de verdad no hay que bañarse después de comer?"). Generan debate en comentarios y la gente lo manda para ganar una discusión.
4. **Truco útil** – algo que el espectador puede probar hoy mismo (cortar cebolla sin llorar, quitarse el hipo, calmar el picante). Se guarda y se comparte.
5. **Reto o prueba en vivo** – el espectador hace algo mientras ve (como el de no bostezar). Comentan el resultado.
6. **Sorpresa con emoción** – asombro, risa o ternura. Nada de datos fríos: siempre la reacción ("¡¿qué?!").

Fórmulas de guion:
- Gancho = situación reconocible + pregunta: "¿Por qué tu abuelita siempre dice que no te bañes después de comer? 👀"
- Desarrollo = explicación en 2–3 frases sencillas con una imagen mental clara (comparaciones cotidianas, no cifras).
- Remate = **invitación a compartir** dirigida a alguien concreto, por ejemplo: "Mándaselo a ese amigo que le pone salsa a TODO." / "Etiqueta a tu mamá." / "Comenta si te pasa." Después viene la escena de cierre.
- Títulos tipo: "Tu mamá tenía razón…", "Esto le pasa a TODOS los que…", "Por esto NO deberías…", "Mándaselo al que…". Siempre honestos con el contenido.

Evita: temas técnicos o lejanos (planetas con cifras, química con nombres raros), listas de datos, tono de clase.

## Estilo visual: MATERIAL DESIGN 3 EXPRESSIVE (obligatorio desde el 4-nov)

`render3.py` ya usa `ESTILO = "material"`: fondo tonal plano con formas M3 que giran, subtítulos y etiquetas como chips planos con elevación, sin grano ni brillos. Las escenas NUEVAS se dibujan con `herramientas/material.py`:
- **Superficies planas con elevación** (`surface`, `card`, `blob`): colores sólidos y saturados de la paleta `P` (violeta, cian, verde, coral, rosa, amarillo, naranja), sombras suaves de elevación. Nada de degradados brillantes, contornos negros ni texturas.
- **Formas M3** (`shape`/`blob`: circle, scallop, flower, burst, squircle, clover, gem, pill) como contenedores de iconos, datos y personajes; que giren o cambien de forma (`morph`) suavemente.
- **Componentes**: `chip` (etiquetas), `fab` (botón de acción), `ripple` (toque), `big_number` (dato clave sobre un burst), iconos redondeados `ICONOS` (check, close, heart, chat, share, bolt, flame, drop, star, clock, bulb).
- **Movimiento M3**: entradas con `bounce_in`/`emph`, elementos en cascada con `stagger`, nada aparece de golpe; cada escena tiene un cambio visual cada 1–3 s.
- **Color por escena**: asigna en `ROLES` un rol distinto a cada tipo de escena para que el fondo cambie de color al pasar de escena.
- **Composición**: un elemento protagonista grande (500–800 px) centrado en y≈700–1000, apoyado por 2–3 elementos secundarios; mucho aire; textos cortos en chips.
- Personajes (caritas, animales, objetos): formas geométricas simples y planas con colores de la paleta, ojos y boca en `INK`; expresivos.

## Mejora continua (OBLIGATORIO en cada short)

Cada short debe verse MEJOR que el anterior. En cada ejecución:
1. Lee `herramientas/MEJORAS.md` (bitácora). Toma la primera mejora pendiente de la lista "Siguientes" (o una nueva que tú detectes al revisar la hoja de contacto del short anterior) e impleméntala.
2. Si la mejora es reutilizable (un componente, un personaje, una transición, un efecto), agrégala a `material.py` o `render3.py`, NO solo a tu escena.
3. Prueba de regresión antes de subir cambios compartidos: dibuja fotogramas del ejemplo del bostezo (`python3 ejemplos/2026-11-03-2130-bostezo.py ejemplos/2026-11-03-2130-bostezo.json /tmp/reg frames 3,9,23,31.5`) y confirma que nada se rompió.
4. Anota en `MEJORAS.md` qué mejoraste (fecha, short, mejora) y añade 1–2 ideas nuevas a "Siguientes".

## Coherencia del guion (OBLIGATORIO)

Antes del render completo Y antes de publicar ejecuta:
`python3 herramientas/coherencia.py guion.json escenas.py --out OUT --titulo "..." --descripcion "..."`
- Si sale "NO PUBLICAR", corrige y vuelve a correrlo.
- Responde honestamente la lista de 7 preguntas que imprime; si alguna es "no", reescribe esa parte.
- Escribe los números con letra en la voz.

## ⭐ ESTILO ACTUAL: ANIMACIÓN 3D LOW-POLY (obligatorio desde el 4-nov tarde; reemplaza a Material y a render3)

Pedido de Iván con un video de referencia: escenas 3D sencillas tipo "low-poly" (objetos y personas hechos de cubos y formas simples, sombreado plano, luz suave con sombras, niebla), cámara cinematográfica que se mueve despacio, subtítulos ARRIBA palabra por palabra (dichas en blanco, próximas en gris, la actual con recuadro azul) y rótulos inferiores en caja oscura con borde dorado (texto dorado grande + subtítulo blanco en mayúsculas). Tono narrativo, tipo documental.

**Motor**: `herramientas/motor3d/` (Three.js en Chromium sin pantalla).
- Preparar (una vez por sesión): `cd herramientas/motor3d && npm i --silent` (descarga three).
- Plantilla aprobada: `ejemplos/2026-11-05-1330-pan.json` + `ejemplos/2026-11-05-1330-pan.js` (cocina, mesa, pan que cae, persona, etiquetas 3D, rótulos). Cada short nuevo es un `.js` que exporta `build(E)` y registra una escena por tipo con `E.escena('tipo', { setup(ctx){...}, update(lt, ctx){...} })`. El cierre ya viene hecho en el motor (planeta low-poly + rótulos "¿Qué dato quieres ver?" y "Síguenos").
- Herramientas del motor (`engine.js`): `box`, `cyl`, `ball`, `plane`, `group`, `persona` (personaje low-poly con brazos/cabeza animables), `mat`, `ambiente({top,bottom,fog,...})` (cielo/niebla/luz por escena), `cam(pos, mira, fov)`, `rotulo(texto, sub, tiempo_desde_que_aparece, y)`, `etiqueta(texto, pos3D, tiempo)`, easing (`ease`, `eout`, `einout`, `spring`) y `ctx.w('palabra')`, `ctx.f(n)`, `ctx.ev('impact'|'whoosh'|'pop'|'ding'|'zap'|'crack'|'heartbeat'|'click', t)`.
- **Sets listos** (no rehagas el lugar): `setCuarto({noche})`, `cama()`/`acostar()`, `setCalle()`, `setEspacio({planeta})`, `setCielo()`+`nubesCaida()`, con ambientes en `AMB.*` (ver `ejemplos/2026-11-04-2130-caida.js`).
- Revisión rápida: `node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js frames 1,4,8,...` → `OUT/fr_*.png` (haz hoja de contacto y revísala).
- Render completo (~8 min): `node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js` → `OUT/video.mp4` + `OUT/events.json`; luego `python3 ../audio.py OUT` y `ffmpeg -i OUT/video.mp4 -i OUT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest shorts/<archivo>.mp4`.
- La voz se genera igual que antes con `voice.py` (Alex, es-419). Usa `"speed": 1.0` (tono narrador, más pausado).
- `coherencia.py` acepta el `.js` de escenas (revisa `c.w('...')` y `c.f(n)`).

Reglas de dirección de arte 3D:
- Cada escena es un PLANO de cine: decide dónde está la cámara y a qué mira; muévela despacio (dolly, grúa, paneo) o haz un corte. Nada estático.
- Objetos protagonistas grandes y legibles en celular (exagera tamaños si hace falta, como el pan).
- Paleta cálida y realista apagada (maderas, paredes crema, cielos de atardecer) con UN color de acento por escena.
- Usa `etiqueta` para nombrar cosas en el espacio 3D (medidas, lugares) y `rotulo` para la idea clave de cada escena (2–4 palabras + subtítulo).
- Personas: usa `persona()` y anímala (brazos, cabeza) para dar emoción.
- Revisa que ningún rótulo tape lo importante y que los subtítulos de arriba se lean (si el fondo es claro, baja la cámara o cambia `ambiente`).
- Mejora continua: cada short agrega al motor algo reutilizable (un set nuevo: calle, cuarto, espacio, laboratorio; un objeto; un movimiento de cámara) y lo anota en MEJORAS.md.
