# Guía de producción — Dato Cósmico 2

> **⚠️ Publicación con Buffer (desde el 6-nov-2026):** Metricool gratis agotó sus 20 publicaciones del mes (cada red cuenta aparte). Programa con `python3 herramientas/buffer.py programar ...` (una llamada para youtube y otra para tiktok; ver ayuda en el archivo). La clave de Buffer NUNCA va en el repositorio: va en ~/.buffer_key o en la variable BUFFER_KEY. Si Buffer falla, entrega a Iván el .mp4 y los textos para que lo suba a mano.


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

## ✂️ ESTILO ACTUAL: PAPEL RECORTADO (aprobado por Iván el 11-nov-2026) — OBLIGATORIO, reemplaza a "MEZCLA" y a la animación 3D low-poly

Todos los videos nuevos se hacen en **papel recortado** con el kit `herramientas/motor3d/papel.js`:
- `import { kitPapel } from '../motor3d/papel.js'; const P = kitPapel(E);` dentro de `build(E)`. El motor sigue manejando tiempos, voz, subtítulos, rótulos, etiquetas y el cierre.
- Piezas planas de papel en capas (`P.pieza`, `P.parte`, formas en `P.F`: rect, elipse, circ, poly, estrella, corazon, ola, rayo, arco, nube), textura de papel, sombras suaves entre capas (`P.luces`), fondos con `P.fondo`.
- Movimiento "a saltitos" de stop-motion: anima con `const t = P.tw(lt)` (12 cuadros por segundo). La cámara puede moverse suave.
- Personajes: `P.protagonista(pos)` (el que vive o explica el dato) y `P.persona(pos, o)` para los demás (ver sección de personajes). Contorno oscuro, colores vivos, trama de puntitos.
- Cámara casi frontal: `cam([x, y, 8–12], [x, y, 0], 30–36)`. Profundidades: fondo z≈-2.2, escenario -1.5…0, personajes 0…0.4.
- Rótulos abajo (`rotulo(..., 1590)`) para no tapar pies ni caras; etiquetas con fondo (`etiqueta(txt, pos, p, size, color, true)`).
- Plantilla aprobada: `herramientas/ejemplos/2026-11-11-papel-dedo.json/.js` (cuarto, pie, corte del dedo, silueta con rayo y ardor, remate con dos personas).
- Render: `PR=1.5 node render3d.js ...` (~1 hora para 30 s). Empieza el render completo en cuanto los fotogramas de revisión estén bien.
- Lo de "MEZCLA" y "3D LOW-POLY" de abajo queda solo como referencia histórica.

## 🪐 CIERRE OFICIAL Y PERSONAJES (aprobado por Iván el 11-nov-2026) — OBLIGATORIO

**Personas sin rigidez (11-nov-2026):** los brazos salen DEBAJO del hombro del torso (hombros caídos, una sola silueta, nada de "hombreras" encimadas) y el reposo ya trae contrapposto (codos un poco doblados, piernas ligeramente abiertas, cabeza inclinada). En cada cuadro en que un personaje no esté haciendo otra acción, llama `p.respira(t)` para que respire y se balancee; nunca dejes a nadie congelado.
**Mascotas oficiales:** perro = `P.perroLobo(pos, {pose:'perfil'|'frente', escala})` (gris lobo, patas y pecho blancos, collar coral). Gato = el negro con patitas y panza blancos (sentado / caminando / echado). Úsalos siempre que el tema sea de perros o gatos.

- **Cierre:** el logo 14 "planeta curioso" (planeta morado con un ojo que mira y parpadea, ceja que se levanta, anillo amarillo y "DATO CÓSMICO 2" en letras gruesas con contorno). Ya es el cierre por defecto del motor (engine.js → papel.js `cierre()`), en TODOS los estilos. No hagas otro cierre.
- **Personajes (estilo J "cómic de papel", cuerpos fluidos):** `kitPapel(E).persona(pos, o)`: proporciones de adulto, contorno oscuro, colores vivos, trama de puntitos en el lado de sombra, cejas expresivas, manos con pulgar, tenis de color. Ni infantiles (nada de ojos gigantes ni chapitas) ni serios. Poses: `p.pose('R'|'L', 'jarra'|'senala'|'pulgar'|'saluda'|'brazosArriba'|'cruzado'|'normal')`; caras: `p.cara('feliz'|'abierta'|'o'|'grito'|'risa'|'seria'|'ladeada', cejas)`; `p.mira(x, y)`. Muestras: motor3d/papel_muestras.html?s=pN.
- **PROTAGONISTA:** `kitPapel(E).protagonista(pos)`: playera azul eléctrico con el logo del planeta curioso en el pecho, copete castaño, pantalón oscuro, tenis menta. **Sin barba y sin audífonos.** Es el que vive o explica el dato en cada video; los demás personajes son secundarios y NO usan playera azul con logo.
- **Barbas:** úsalas poco y solo en secundarios. La barba del kit ya sigue la quijada y deja ver la boca; nunca dibujes una barba como un parche encima de la cara.
- Paleta: coral #ff6b5b, azul eléctrico #3d6bff, menta #2ec4a6, amarillo #ffc83d, morado #7b5cff, tinta #1f1b2e.

## 🎨 ESTILO VISUAL "MEZCLA" (aprobado por Iván el 9-nov-2026) — OBLIGATORIO

Mezcla de low-poly pulido + plastilina: formas con esquinas redondeadas pero con carácter, **entre rudas y tiernas**, en alta definición.
- El motor ya lo aplica solo: `box()` hace cajas redondeadas, `ball()`/`cyl()` salen lisos, materiales suaves con un poco de brillo, bloom (resplandor) y render al doble de resolución. Para facetas a propósito usa `{ facetas: true }`; para una caja de esquinas rectas `{ recto: true }`.
- **Ojos grandes con reflejo en todo lo que tenga cara**: usa `ojo(parent, pos, escala, mira)`. `persona()` ya los trae. Animales y objetos con personalidad también llevan ojos (ver atomoH en el ejemplo de las estrellas).
- **Toque rudo:** cejas gruesas e inclinadas, quijada o pecho fuertes, patas gruesas. **Toque tierno:** cabeza grande, ojos grandes, colores cálidos.
- **Luz que se vea:** cosas que brillan con `emissive` (el bloom las hace resplandecer), `rayoLuz()` desde ventanas o el sol, y `polvo()` + `polvoMueve()` para motas de luz en el aire.
- Encuadre: el personaje principal ocupa entre 1/3 y 1/2 de la altura; nunca cortado por los lados ni tapado por subtítulos o rótulos.
- Referencias: herramientas/ejemplos/2026-11-10-1330-estrellas.* (primer short en este estilo) y la prueba herramientas/motor3d/estilos.html?s=mezcla.
- El render tarda ~2.5 s por cuadro (≈35–40 min un short de 30 s). Empieza el render completo en cuanto aprueben los fotogramas de revisión. Si no alcanza el tiempo, usa `PR=1.5` (variable de entorno) para render más rápido.

## 📊 LO QUE FUNCIONA (datos reales al 8-nov-2026, YouTube Studio + TikTok) — OBLIGATORIO

| Short | Vistas YT | Se quedaron viendo | Media / duración | Subs | Vistas TikTok |
|---|---|---|---|---|---|
| Tronarte los dedos (mito de mamá) | 2,117 | **64 %** | 0:24 / 0:36 | +5 | 672 |
| Pan cae al revés | 2,103 | 57 % | 0:19 / **0:29** | +5 | 594 |
| Cebolla (truco de cocina) | 2,031 | 54 % | 0:21 / 0:35 | +5 | 202 |
| Dedos arrugados (1 día) | 1,818 | 62 % | 0:21 / 0:37 | +2 | 238 |
| Átomos (tema abstracto) | 1,544 | **45 %** | 0:21 / 0:38 | +3 | 221 |
| Perro muerde todo | 1,310 | 53 % | **0:14** / 0:32 | — | **970** |
| Tráfico CDMX | 1,213 | 55 % | 0:24 / 0:45 | +2 | 768 |
| Bostezo ("te reto") | 1,168 | **43 %** | 0:23 / 0:33 | +1 | 176 |

Reglas que salen de los datos:
1. **Tema = algo que TODOS han vivido + un mito o un "¿por qué SIEMPRE…?"** (tronarse los dedos, el pan, la cebolla, dedos arrugados). Mejor aún si hay "tu mamá decía…": genera discusión y compartidos. Cuerpo, comida y casa son lo más fuerte.
2. **Nada abstracto en el gancho.** Átomos fue el que más gente deslizó (45 %). Si el tema es abstracto, el gancho debe ser algo físico y cotidiano ("tu mano nunca toca nada").
3. **No uses ganchos de reto** ("te reto a no…"): el bostezo fue el peor en "se quedaron viendo" (43 %).
4. **Más corto = más % visto.** La gente ve ~20–24 s sin importar la duración. Duración TOTAL ≤ 30 s (contenido 18–23 s + cierre). Los de 35–45 s pierden. Recorta frases, una idea por escena, sin repetir.
5. **Incluye un truco útil cuando se pueda** (cebolla: 2 trucos) → se guarda y se reenvía.
6. **En TikTok ganan mascotas y lo mexicano** (perro 970, tráfico CDMX 768). Mete contexto mexicano (Periférico, salsa, el súper, la abuela) siempre que encaje.
7. Título: pregunta corta con UNA palabra en MAYÚSCULAS (SIEMPRE, TODO, SOLO) + 1 emoji. Funciona.

## ⭐ ESTILO ACTUAL: ANIMACIÓN 3D LOW-POLY (obligatorio desde el 4-nov tarde; reemplaza a Material y a render3)

Pedido de Iván con un video de referencia: escenas 3D sencillas tipo "low-poly" (objetos y personas hechos de cubos y formas simples, sombreado plano, luz suave con sombras, niebla), cámara cinematográfica que se mueve despacio, subtítulos ARRIBA palabra por palabra (dichas en blanco, próximas en gris, la actual con recuadro azul) y rótulos inferiores en caja oscura con borde dorado (texto dorado grande + subtítulo blanco en mayúsculas). Tono narrativo, tipo documental.

**Motor**: `herramientas/motor3d/` (Three.js en Chromium sin pantalla).
- Preparar (una vez por sesión): `cd herramientas/motor3d && npm i --silent` (descarga three).
- Plantilla aprobada: `ejemplos/2026-11-05-1330-pan.json` + `ejemplos/2026-11-05-1330-pan.js` (cocina, mesa, pan que cae, persona, etiquetas 3D, rótulos). Cada short nuevo es un `.js` que exporta `build(E)` y registra una escena por tipo con `E.escena('tipo', { setup(ctx){...}, update(lt, ctx){...} })`. El cierre ya viene hecho en el motor (planeta low-poly + rótulos "¿Qué dato quieres ver?" y "Síguenos").
- Herramientas del motor (`engine.js`): `box`, `cyl`, `ball`, `plane`, `group`, `persona` (personaje low-poly con brazos/cabeza animables), `mat`, `ambiente({top,bottom,fog,...})` (cielo/niebla/luz por escena), `cam(pos, mira, fov)`, `rotulo(texto, sub, tiempo_desde_que_aparece, y)`, `etiqueta(texto, pos3D, tiempo)`, easing (`ease`, `eout`, `einout`, `spring`) y `ctx.w('palabra')`, `ctx.f(n)`, `ctx.ev('impact'|'whoosh'|'pop'|'ding'|'zap'|'crack'|'heartbeat'|'click', t)`.
- **Sets listos** (no rehagas el lugar): `setCuarto({noche})`, `cama()`/`acostar()`, `setCalle()`, `setEspacio({planeta})`, `setCielo()`+`nubesCaida()`, `setLaboratorio()`, `setMapa({lugares})` y `ondas()` (anillos de sonido/señal), con ambientes en `AMB.*` (ver `ejemplos/2026-11-04-2130-caida.js` y `ejemplos/2026-11-05-1800-voz.js`).
- **Emoción en personas** (desde el 6-nov): `persona({pelo:'largo', bata:true})`, `gesto(p,'enojada'|'feliz'|'sorpresa'|'triste')`, `hablar(p, lt)`, `pose(p,'senalar'|'jarras'|'brazosArriba'|'encoger'|'manosJuntas', mezcla, lt)` (ver `ejemplos/2026-11-06-1330-dedos.js`).
- **Cocina y comedor** (desde el 6-nov 21:30): `setCocina()` (barra, estufa, refri que abre) y `comedor()`, `vaso()`, `pedazos()` (ver `ejemplos/2026-11-06-2130-cebolla.js`).
- **Manos y átomos** (desde el 7-nov): `mano()` (dedos con `flex`), `reloj()` y `atomo()` (núcleo, nube de electrones, órbitas; ver `ejemplos/2026-11-07-1330-atomos.js`).
- **Sentarse y baño** (desde el 7-nov 18:00): `persona()` tiene rodillas (`kneeL/R`) y tobillos (`pieL/R`); `sentar(p,k)`, `setBano()` (devuelve `personaY` para sentar en el escusado), `chispas()`, y `gas()`/`lagrimas()`/`llorar()` ya son del motor (ver `ejemplos/2026-11-07-1800-pierna.js`).
- **Caminar** (desde el 7-nov 21:30): `caminar(p, lt, vel, {cojear})` anima el paso y devuelve la distancia; avanza con `p.position.z = z0 + caminar(...)` (ver `ejemplos/2026-11-07-2130-dedos-pasa.js`).
- **Insectos, patio y alberca** (desde el 8-nov): `mosquito({s, macho})`+`volar(m, lt, centro, radio)`, `setPatio()` con `AMB.patioNoche` (fiesta de noche con foquitos), `ronchas(p)`, `setAlberca()`, `palmera()`, `arrugas(mano)`, `pasa()` (ver `ejemplos/2026-11-08-1330-moscos.js`).
- **Insectos y gérmenes** (desde el 8-nov 18:00): `mosca()`, `abeja()` (mismo uso que `mosquito()` con `volar()`), `flor()` y `germenes(n)` (bacterias que brincan de un lugar a otro; ver `ejemplos/2026-11-08-1800-cinco-segundos.js`).
- **Panza y comida** (desde el 8-nov 21:30): `tuboDigestivo({pos, s, soloPanza, comida, parent})` (estómago + intestino translúcidos; `update(lt,{ola, apriete, burbujas})`, `mundo(t)` para etiquetas), `galleta()`, `sandia()`, `gomita()`, `loseta()`, `alfombra()` y `disco()` (reparto con ángulo dorado) (ver `ejemplos/2026-11-08-2130-panza.js`).
- **Coche y electricidad** (desde el 9-nov): `coche({pos,color})` (puerta que abre, asientos, `asiento`/`personaY` para sentar, llantas) y `rayo(a,b)` (chispa/arco eléctrico) (ver `ejemplos/2026-11-09-1330-toques.js`).
- **Jardín, pasto y perros sentados/comiendo** (desde el 9-nov 18:00): `setJardin({noche})` con `AMB.jardin`/`AMB.bosqueNoche`, `pasto()` (briznas que se mecen; llama `.update(lt)`), `arbol()`, `perroSentar(p,k)`, `perroCome(p,lt,k)` y `perro({lobo:true})` (ver `ejemplos/2026-11-09-1800-pasto.js`).
- **Rayos X y respiración** (desde el 9-nov 21:30): `persona({rayosX:true})` o `rayosX(p)`, `verRayosX(p,k)`, `respirar(p, lt, {hipo})` + `hipoDesde(lt, [ts])` (pulmones, diafragma, cuerdas vocales; ver `ejemplos/2026-11-09-2130-hipo.js`).
- **Puertas e ideas** (desde el 11-nov 13:30): `marcoPuerta()` (pared con hueco, marco que brilla con `brillo(k)`, hoja con bisagra), `pensamiento()` (globo de pensamiento con objeto dentro que se revienta con `update(lt, k, rompe)`) e `interrogacion()` ("?" 3D) (ver `ejemplos/2026-11-11-1330-puerta.js`).
- **Animales**: `perro()`+`perroAnda()` y `gato()`+`colaGato()`/`patita()`/`ojosCazador()` (ver `ejemplos/2026-11-06-1800-gato.js`). `etiqueta(..., fondo=true)` pone píldora oscura detrás del texto.
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

## 🎄 Serie "Navidad Cósmica" (27-nov → 24-dic, horario de las 18:00)

Los pedidos de la serie están en `pedidos.json` (campo `serie`). Reglas de la serie, además de todo lo demás:
- Identidad visual: en la primera escena, rótulo dorado `rotulo('Navidad Cósmica', 'episodio N', …)`; ambiente navideño en 3D (luces cálidas, nieve ligera cayendo, tonos rojo/verde/dorado discretos) sin perder el estilo low-poly del canal.
- Título de YouTube con el gancho + " 🎄 #shorts"; en la descripción, "🎄 Serie Navidad Cósmica · episodio N".
- Temas religiosos (Belén, estrella, pastores): tono respetuoso, solo datos históricos/científicos verificados, sin burla ni opiniones sobre la fe. Si los historiadores no coinciden, decir "una explicación es…".
- Villancicos: solo se pueden mencionar o citar fragmentos MUY cortos (son tradicionales); no cantar la canción completa.
- Mejora reutilizable sugerida para el primer episodio: agregar a `engine.js` un `setNavidad()` (nieve, luces de colores, árbol low-poly) y un `setNocheEstrellada()`.
