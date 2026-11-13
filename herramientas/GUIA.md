# Guía de producción — Dato Cósmico 2

> **⚠️ Publicación con Buffer (desde el 6-nov-2026):** Metricool gratis agotó sus 20 publicaciones del mes (cada red cuenta aparte). Programa con `python3 herramientas/buffer.py programar ...` (una llamada para youtube y otra para tiktok; ver ayuda en el archivo). La clave de Buffer NUNCA va en el repositorio: va en ~/.buffer_key o en la variable BUFFER_KEY. Si Buffer falla, entrega a Iván el .mp4 y los textos para que lo suba a mano.


Canal de YouTube Shorts de datos curiosos de ciencia, en español latino. Tres shorts al día (por unas semanas, hasta que el canal tenga historial), publicados con Buffer a las 13:30, 18:00 y 21:30 (America/Mexico_City).

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

## Flujo (resumen; el detalle de cada paso está en las secciones de abajo)

0. **Pedidos**: `pedidos.json` manda (pendiente para hoy y tu horario = tu tema; al final márcalo `"hecho"`).
1. **Tema**: tendencia de hoy en México + dato cotidiano verificable (ver "📊 LO QUE FUNCIONA" y "Hacerlo COMPARTIBLE"). Dos fuentes fiables. No repitas nada de `temas.json`. Lee `metricas.md` (solo las 2 entradas más recientes) para repetir lo que funciona.
2. **Guion** `ejemplos/AAAA-MM-DD-HHMM-slug.json`: 4–5 escenas, 18–23 s de contenido, total ≤ 30 s con el cierre. Voz `{"modelo": "em_alex", "lang": "es-419", "speed": 1.0}`; números y siglas como se pronuncian. Cierre (escena `cierre`, palabra por palabra): "¿Tienes algún dato curioso del que te gustaría que habláramos? Déjalo en los comentarios y síguenos para más datos."
3. **Voz**: `python3 herramientas/voice.py guion.json OUT/` → `v*.wav` + `timings.json`.
4. **Escenas**: `ejemplos/AAAA-MM-DD-HHMM-slug.js` en CARTULINA CHIBI (sección de abajo). Fotogramas de revisión + REVISIÓN AUTOCRÍTICA.
5. **Render y video**:
   - `cd herramientas/motor3d && npm i --silent` (una vez por sesión).
   - Fotogramas: `PR=1.5 node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js frames 0.1,2.9,…` → `OUT/fr_*.png` (tiempos en SEGUNDOS).
   - Completo: `PR=1.5 nohup node render3d.js ../ejemplos/X.json OUT ../ejemplos/X.js > OUT/log.txt 2>&1 &` (7–9 s por cuadro: 70–130 min; el log escribe cada 150 cuadros y termina con `ok`).
   - `python3 ../audio.py OUT` y `ffmpeg -i OUT/video.mp4 -i OUT/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -af loudnorm=I=-14:TP=-1.5 -shortest shorts/<archivo>.mp4`.
6. **Publicar**: commit + push a `main`; enlace `https://raw.githubusercontent.com/IvanBacker21/Videos/main/shorts/<archivo>.mp4`; programa YouTube y TikTok con `herramientas/buffer.py` (ver aviso de arriba). NO hagas miniaturas.
7. Agrega la entrada a `temas.json` y haz commit.

## ⚡ Ahorro de uso (Iván, 13-nov-2026) — OBLIGATORIO

El plan de Claude tiene límite semanal; cada vuelta de la sesión vuelve a mandar todo el contexto. Para que alcance:
- **Mientras corre el render, revisa el avance cada 20–25 minutos** (`sleep 1200` o más por llamada; o un bucle que espere hasta que el log diga `ok`), nunca cada 5–10 min. Mientras esperas no hagas trabajo pesado (otro render en paralelo compite por los 2 núcleos y lo hace más lento).
- **Hojas de contacto de revisión PREVIA al render: pequeñas** (cuadros de 240×427 px, máximo 12 por hoja). Solo amplía un cuadro si ves algo dudoso. La revisión del MP4 FINAL se queda igual de completa (un cuadro cada 0.5 s).
- **Lee solo esta guía vigente.** Los estilos viejos (2.5D, Material, papel recortado, mezcla, 3D low-poly) están en `GUIA_HISTORIAL.md`: NO lo leas salvo que necesites una función vieja de `engine.js`.
- De `MEJORAS.md` lee solo las 3 últimas entradas de "Hechas" y la lista "Siguientes"; de `metricas.md`, solo las 2 entradas más recientes.
- No vuelvas a leer archivos que ya tienes en contexto; usa `grep`/`sed -n` para ver solo la parte que necesitas.

## 📄 ESTILO OFICIAL: CARTULINA CHIBI (tipo papel "Paper Mario", aprobado por Iván el 11-nov-2026 19:22) — OBLIGATORIO, reemplaza a todos los anteriores

Todos los videos nuevos se hacen con personajes de **cartulina chibi** sobre un **diorama de papel**, con el kit `herramientas/motor3d/papel_pm.js` (encima de papel.js):
- `import { kitPapel } from '../motor3d/papel.js'; import { kitPM } from '../motor3d/papel_pm.js';` y dentro de `build(E)`: `const P = kitPapel(E); const PM = kitPM(P, THREE, group), { A } = PM;`. Termina el archivo con `P.cierre();` (logo 14).
- **Plantilla aprobada (cópiala y adáptala):** `herramientas/ejemplos/2026-11-11-paper-cola.json/.js` → video `pruebas/2026-11-11-paper-cola.mp4`.
- **Escenario en cada escena:** `ambiente({top:0xa9dcf5,bottom:0xa9dcf5,fog:0xa9dcf5,near:80,far:160,sunInt:.01,hemiInt:.01}); PM.diorama(); P.luces({pos:[-3,5,8],hemi:1.75,sol:1.5,radio:6});` (cielo, nubes, colinas en capas con borde de papel, arbolitos, flores, piso con puntadas). Para otros lugares (cocina, espacio, cuarto) arma piezas con `PM.pz(forma, color, pos, padre, {tinta, papel})` (recorte con contorno fino y borde blanco grueso) y `PM.det(...)` (detalle impreso sin borde), con formas de `P.F`.
- **Personas:** `PM.chibi(pos, o)` → o: `{piel, ropa, pantalon, falda, tenis, pelo:'copete'|'cola'|'chongo', colPelo, gorra, lentes, aretes, logo, saluda, boca:'abierta'|'feliz', inclina, mira, escala}`. **Protagonista** = `PM.chibi(pos, {logo:true})` (playera azul con el planeta, copete castaño, sin barba ni audífonos); nadie más usa playera azul con logo. Sin barbas en este estilo.
- **Mascotas oficiales:** perro lobo `PM.perroPM(pos, {pose:'frente'|'perfil', escala})` (gris, máscara/pecho/patas blancos, ojos ámbar, collar coral); gato `PM.gatoPM(pos, {pose:'frente'|'perfil', escala})` (negro con pecho, panza, hocico y patitas blancos, ojos verde limón, collar morado). De perfil miran a la derecha; para que miren a la izquierda: `g.scale.x = -escala`.
- **Animación (siempre con `const t = P.tw(lt)`, 12 cuadros/s):** `A.anda(g, t, on)` caminar con rebote; `A.cola(g, t, vel, amp, sesgo)`; `A.parpadea(g, t, fase)` (fase distinta por personaje); `A.orejas(g, 0..1)` (atrás = nervioso/enojado); `A.voltea(g, k, dir)` vuelta de cartulina (k 0→1; para pasar de perfil a frente oculta uno y muestra el otro a la mitad, ver escena del gato en la plantilla); `A.saluda(p, t)`; cabeza con `g.head.rotation.z`; brazos `p.brazos[0|1].rotation.z`. **Nadie se queda congelado**: todo personaje en pantalla parpadea y se mueve un poco.
- **Expresiones y frío (12-nov 21:30):** `p.boca('abierta'|'feliz'|'apretada')`, `A.preocupa(p, k)`, `A.tiembla(g, t, k, x0)`, `PM.bufanda(p)`, `PM.copos()`, `PM.lupa(pos, r)` y órganos con `PM.astro(pos, r, color, {forma: PM.formaRinon()})` (ver `ejemplos/2026-11-12-2130-pipi-frio.js`).
- **Encuadre vertical:** cámara `cam([x, ~1.1, 8–10.5], [x, ~1.0, 0], 34)`; máximo 3 personajes por toma. Etiquetas NUNCA en la franja de subtítulos (arriba): ponlas a media altura cerca del personaje o en el piso (y ≈ -.1 a -.5); rótulo abajo `rotulo(..., 1600)`.
- **Render:** `PR=1.5 node render3d.js ...` tarda **80–130 min** para 30 s (7–9 s por cuadro; el 12-nov 21:30 tardó 110 min): empieza el render completo lo antes posible y revisa el avance cada 20–25 min. Revisa primero fotogramas (`frames 0.6,1.6,...` en SEGUNDOS), luego render completo en segundo plano y espera a que termine (`ok` en el log) antes de audio.py y ffmpeg.
- **REVISIÓN AUTOCRÍTICA OBLIGATORIA (Iván, 12-nov):** a Iván solo se le entrega un video PERFECTO. Antes del render completo Y otra vez con el .mp4 final, saca un cuadro cada 0.5 s (ffmpeg -ss) y revisa uno por uno:
  1. **Nada cortado**: personajes y mascotas COMPLETOS dentro del cuadro, sobre todo la parte de la que habla la voz (cola, patas, cara). Ancho visible ≈ distancia_cámara × 0.172 a cada lado del centro (fov 34, vertical): perro de perfil escala 1 mide ~1.9 de largo; chibi ~1.2 de ancho con brazos.
  2. **Franja segura de letreros**: entre 27 % y 75 % de la altura (arriba están los subtítulos, abajo el rótulo). Con cámara en z y mirando a y0: y ∈ [y0 − 0.5·z·0.306, y0 + 0.46·z·0.306].
  3. **La cola o la parte que se explica SE VE** durante todo el meneo (el sesgo hacia afuera, nunca escondida detrás del cuerpo).
  4. **La expresión coincide con lo que dice la voz** (enojado = ceño fruncido, nervioso = cejas preocupadas/sudor/sin lengua, feliz = boca abierta/corazones).
  5. Nada se sale del cuadro (corazones, rayitas), sin cuadros negros, sin pelo atravesando gorras, sin personajes congelados.
  Si algo falla, corrígelo y vuelve a revisar; no lo publiques con fallas.
- Los estilos anteriores (papel recortado, "MEZCLA", "3D LOW-POLY", Material) están en `GUIA_HISTORIAL.md`, solo como referencia.

## 🪐 CIERRE OFICIAL Y PERSONAJES (aprobado por Iván el 11-nov-2026) — OBLIGATORIO

**Desde el 11-nov 19:22 los personajes y mascotas se hacen en CARTULINA CHIBI (sección de arriba).** De esta sección siguen vigentes: el cierre (logo 14), las reglas del protagonista y la paleta. Lo de persona()/estilo J y perroLobo de papel.js queda como referencia.

**Personas sin rigidez (11-nov-2026):** los brazos salen DEBAJO del hombro del torso (hombros caídos, una sola silueta, nada de "hombreras" encimadas) y el reposo ya trae contrapposto (codos un poco doblados, piernas ligeramente abiertas, cabeza inclinada). En cada cuadro en que un personaje no esté haciendo otra acción, llama `p.respira(t)` para que respire y se balancee; nunca dejes a nadie congelado.
**Mascotas oficiales:** perro = `P.perroLobo(pos, {pose:'perfil'|'frente', escala})` (gris lobo, patas y pecho blancos, collar coral). Gato = el negro con patitas y panza blancos (sentado / caminando / echado). Úsalos siempre que el tema sea de perros o gatos.

- **Cierre:** el logo 14 "planeta curioso" (planeta morado con un ojo que mira y parpadea, ceja que se levanta, anillo amarillo y "DATO CÓSMICO 2" en letras gruesas con contorno). Ya es el cierre por defecto del motor (engine.js → papel.js `cierre()`), en TODOS los estilos. No hagas otro cierre.
- **Personajes (estilo J "cómic de papel", cuerpos fluidos):** `kitPapel(E).persona(pos, o)`: proporciones de adulto, contorno oscuro, colores vivos, trama de puntitos en el lado de sombra, cejas expresivas, manos con pulgar, tenis de color. Ni infantiles (nada de ojos gigantes ni chapitas) ni serios. Poses: `p.pose('R'|'L', 'jarra'|'senala'|'pulgar'|'saluda'|'brazosArriba'|'cruzado'|'normal')`; caras: `p.cara('feliz'|'abierta'|'o'|'grito'|'risa'|'seria'|'ladeada', cejas)`; `p.mira(x, y)`. Muestras: motor3d/papel_muestras.html?s=pN.
- **PROTAGONISTA:** `kitPapel(E).protagonista(pos)`: playera azul eléctrico con el logo del planeta curioso en el pecho, copete castaño, pantalón oscuro, tenis menta. **Sin barba y sin audífonos.** Es el que vive o explica el dato en cada video; los demás personajes son secundarios y NO usan playera azul con logo.
- **Barbas:** úsalas poco y solo en secundarios. La barba del kit ya sigue la quijada y deja ver la boca; nunca dibujes una barba como un parche encima de la cara.
- Paleta: coral #ff6b5b, azul eléctrico #3d6bff, menta #2ec4a6, amarillo #ffc83d, morado #7b5cff, tinta #1f1b2e.

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
6. **En TikTok ganan mascotas y lo mexicano** (perro 970, tráfico CDMX 768). Mete contexto mexicano (Periférico, salsa, el súper, la abuela) siempre que encaje. Pero OJO con la regla 7: animales solo de vez en cuando.
7. **MEZCLA DE TEMAS (Iván, 12-nov-2026) — OBLIGATORIO:** la base del canal son los **datos curiosos que son TENDENCIA**; los de animales/mascotas son solo de vez en cuando: **máximo 1 de animales cada 6 shorts (≈ uno cada 2 días)**. Antes de elegir, revisa los últimos 6 de temas.json: si alguno es de animales/mascotas, el tuyo NO puede ser de animales (salvo que sea un pedido de Iván o de un seguidor en pedidos.json). Para encontrar la tendencia: busca en la web qué es viral o noticia HOY en México y en redes (WebSearch: "tendencias México hoy", "viral TikTok México", "noticias de ciencia hoy", Google Trends México, temporada: frío, lluvias, fiestas, Buen Fin, futbol, eclipses, etc.) y conéctalo con un dato curioso cotidiano y verificable de cuerpo, comida, casa, tecnología, clima o espacio. Anota en temas.json qué tendencia lo inspiró (campo "tendencia").
8. Título: pregunta corta con UNA palabra en MAYÚSCULAS (SIEMPRE, TODO, SOLO) + 1 emoji. Funciona.

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

## Coherencia del guion (OBLIGATORIO)

Antes del render completo Y antes de publicar ejecuta:
`python3 herramientas/coherencia.py guion.json escenas.py --out OUT --titulo "..." --descripcion "..."`
- Si sale "NO PUBLICAR", corrige y vuelve a correrlo.
- Responde honestamente la lista de 7 preguntas que imprime; si alguna es "no", reescribe esa parte.
- Escribe los números con letra en la voz.

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

## Textos de título y descripción

- Escribe todo en español normal y correcto. **Nunca** uses letras cambiadas por números o símbolos (p. ej. "s4ngr3", "m.u.e.r.t.e"): YouTube lo trata como spam y deja de recomendar el short.
- Evita en título y descripción palabras sensibles para anunciantes (sangre, muerte, matar, cadáver, drogas, sexo, armas…). Si el tema las necesita, usa sinónimos neutros ("fluido azul", "circulación", "no sobrevivió"); en la voz y el video sí pueden decirse con naturalidad.

## Mejora continua (OBLIGATORIO en cada short)

Cada short debe verse MEJOR que el anterior. En cada ejecución:
1. Lee `herramientas/MEJORAS.md` (bitácora). Toma la primera mejora pendiente de la lista "Siguientes" (o una nueva que tú detectes al revisar la hoja de contacto del short anterior) e impleméntala.
2. Si la mejora es reutilizable (un componente, un personaje, una transición, un efecto), agrégala a `motor3d/papel_pm.js`, NO solo a tu escena.
3. Si cambias `papel_pm.js`, no cambies lo que ya hacen las funciones existentes (agrega opciones nuevas); tus fotogramas de revisión sirven de prueba.
4. Anota en `MEJORAS.md` qué mejoraste (fecha, short, mejora) y añade 1–2 ideas nuevas a "Siguientes".

## 🎄 Serie "Navidad Cósmica" (27-nov → 24-dic, horario de las 18:00)

Los pedidos de la serie están en `pedidos.json` (campo `serie`). Reglas de la serie, además de todo lo demás:
- Identidad visual: en la primera escena, rótulo dorado `rotulo('Navidad Cósmica', 'episodio N', …)`; ambiente navideño (luces cálidas, nieve ligera cayendo con `PM.copos()`, tonos rojo/verde/dorado discretos) en el estilo oficial CARTULINA CHIBI.
- Título de YouTube con el gancho + " 🎄 #shorts"; en la descripción, "🎄 Serie Navidad Cósmica · episodio N".
- Temas religiosos (Belén, estrella, pastores): tono respetuoso, solo datos históricos/científicos verificados, sin burla ni opiniones sobre la fe. Si los historiadores no coinciden, decir "una explicación es…".
- Villancicos: solo se pueden mencionar o citar fragmentos MUY cortos (son tradicionales); no cantar la canción completa.
- Mejora reutilizable sugerida para el primer episodio: agregar a `papel_pm.js` un `PM.navidad()` (nieve, luces de colores, árbol de cartulina) y usar `PM.espacio()` para la noche estrellada.
