# Bitácora de mejoras visuales

Cada short implementa al menos UNA mejora de esta lista (o una nueva) y la anota aquí.

## Hechas
- 2026-11-04 · Kit Material Design 3 (`material.py`): superficies con elevación, formas M3, chips, FAB, ripple, iconos redondeados, fondo tonal. `render3.py` usa estilo "material" por defecto.
- 2026-11-04 · `coherencia.py`: verifica cierre, invitación a compartir, números, palabras clave de animación ↔ voz, título y descripción.

- 2026-11-04 · Short del picante · Cierre en Material (`cierre_material` en render3): planeta scallop, chip de comentarios con icono, botón Suscribirse plano con ripple y cursor. Personajes planos M3 (chile, pájaro), tarjeta de chat y vasos en tarjetas con check/close.

- 2026-11-04 · Short de nadar después de comer · Transición M3 "container transform" en `render3.py` (`TRANSICION = "container"`, `TR_DUR`, `TR_FORMA`, `container_transform()`): la escena nueva se abre dentro de una forma scallop con elevación que crece y se redondea sobre el fondo de la escena anterior; reemplaza el destello blanco (`TRANSICION = "flash"` lo recupera). Además: gráfica de barras plana M3 sin cifras (`bars()` en el short, pendiente de pasar a material.py) y chat con respuesta de "mamá" (burbuja escribiendo → respuesta).

- 2026-11-04 · Short del perro (21:30) · Mascota del canal "Cosmo" (`material.mascota()`, expresiones en `EXPRESIONES`: feliz, sorpresa, guino, pensando; parpadea y flota). Protagoniza el cierre (`CIERRE_MASCOTA = True` en render3: pensando → feliz → guiño al "síguenos") y aparece en el gancho como reacción. Además `material.donut()` (anillo de progreso M3 sin cifras, parte de la #7) y personajes de perro/lobo de frente, desde arriba y enroscado.
- 2026-11-04 · Motor 3D low-poly (`motor3d/`): Three.js headless, cocina, persona, rótulos dorados, subtítulos arriba palabra por palabra, cierre con planeta 3D. Short demo: pan con mantequilla. **Desde aquí el estilo oficial es 3D**; lo de Material queda como referencia.

- 2026-11-04 · Short de la sacudida hípnica (21:30) · **Sets reutilizables en `engine.js` (MEJORAS 0)**: `setCuarto({noche})` (recámara con cama, buró, lámpara con luz cálida, ventana con luna o día, tapete), `cama()` + `acostar(persona, pos)` (personaje acostado), `setCalle()` (asfalto, banquetas, edificios con ventanas, postes), `setEspacio()` (estrellas + planeta), `setCielo()` + `nubesCaida()` (nubes low-poly que suben = sensación de caer) y ambientes listos en `AMB` (cuartoNoche, cuartoDia, calle, espacio, cielo). Además se corrigió `etiqueta()`: ahora actualiza la matriz de la cámara antes de proyectar (antes usaba la cámara del fotograma anterior y las etiquetas salían corridas en el primer fotograma de cada escena y en los fotogramas de revisión). Prueba de regresión: fotogramas del pan OK.
- 2026-11-05 · Short de la voz en grabaciones (18:00) · **MEJORAS 0 completada en `engine.js`**: `setLaboratorio({acento})` (piso de loseta, pared de azulejo, pizarrón, repisa con frascos que brillan, mesa de trabajo con matraces y lámparas colgantes; devuelve `{mesa, frascos, pizarron, topY}` con la cubierta en y=.92), `setMapa({lugares:[{nombre,x,z,color}]})` (mapa low-poly sobre marco de madera con mar, islas en losetas de alturas fijas y pines; devuelve `pins[].pos3` para `etiqueta()`) y `ondas(pos, {color,n,vel,alcance,grosor,dir})` (anillos de sonido/señal que salen y se desvanecen; animar con `.update(lt, on)`). En el short: busto de laboratorio con piel que se vuelve transparente y cráneo interior, partículas que viajan por curvas (aire vs. hueso, con `depthTest=false` para verse a través de la piel), celular con nota de voz animada y bocina que retumba. Prueba de regresión: fotogramas del pan OK.

- 2026-11-06 13:30 (dedos) · **MEJORAS 0e en `engine.js`**: `persona()` ahora trae cara con cejas y boca (`o.cara:false` la quita), `pelo:'largo'` y `bata:true` (médico/científico); nuevas `gesto(p,'feliz'|'enojada'|'sorpresa'|'triste'|'neutral')`, `hablar(p, lt, k)` (boca que se mueve) y `pose(p,'senalar'|'jarras'|'brazosArriba'|'encoger'|'manosJuntas'|'neutral', mezcla, lt)`. En el short: `mano()` grande con falanges que se doblan (`flex`), corte de `nudillo()` con huesos, cartílago, líquido, cápsula y burbuja, y `reloj()` de pared. Prueba de regresión: fotogramas del pan OK.

- 2026-11-06 18:00 (gato) · **`gato()` en `engine.js`** (pedido de Iván): gato low-poly con orejas de cono, rayas, bigotes, ojos con pupilas que se dilatan, cola de 5 segmentos; `colaGato(g, lt, k, rapidez)`, `gatoAnda()`, `patita(g, k, lado)` (toquecitos con la pata) y `ojosCazador(g, k)`. Además **MEJORAS 0j hecha**: `etiqueta(texto, pos, t, size, color, fondo=true)` dibuja una píldora oscura con borde dorado detrás del texto (para fondos claros). En el short: `comedor()` (mesa, pared con lambrín, cuadro), `vaso()` con agua que cae y salpica (gotas), `raton()`, `varita()` con plumas y `pedazos()` (vajilla rota). Prueba de regresión: fotogramas del pan OK.

- 2026-11-06 21:30 (cebolla) · **MEJORAS 0k hecha en `engine.js`**: `comedor({top, mantel, pared})`, `vaso()` y `pedazos()` ahora son del motor; además **`setCocina({acento, vidrio})`** nuevo: piso de mosaico, pared de azulejo talavera, barra con cubierta (y=.92) y alacenas, estufa con comal, ventana y **refrigerador hueco con puerta que abre** (`refri.puerta.rotation.y` de 0 a -1.9, luz interior, repisas; mete objetos con `parent = refri.g`). En el short: `cebolla()`, `mediaCebolla()` (anillos), `cuchillo(filo)`, `gas()` (partículas por camino curvo), `lagrimas()`/`llorar()` y tazón de pico de gallo. Lección: un gabinete sólido tapa su interior aunque abras la puerta; hazlo de paneles. Prueba de regresión: fotogramas del pan OK.

## Siguientes (toma la primera de las 3D)
0m. (3D) Pasar `lagrimas()/llorar()` y `gas()` del short de la cebolla a `engine.js` (llanto y vapores reutilizables: sirven para cebolla, picante, aliento con frío).
0l. (3D) Pose 'sentado' para `gato()` y `perro()` (patas traseras dobladas) y salto con arco.
0i. (3D) Pasar `mano()` (dedos articulados) y `reloj()` del short de los dedos a `engine.js`.
0g. (3D) Pasar `celular()` (nota de voz animada), `busto()` (cabeza grande con cráneo) y `chorro()` (partículas sobre una curva) del short de la voz a `engine.js`.
0h. (3D) Usar `setMapa()` en un short de lugares (aún sin probar en video) y `setEspacio()`.
0e. (3D) `persona()` con poses listas (sentada, acostada de lado, señalando, riendo) y cara con boca para dar emoción.
0f. (3D) Escenario "multitud" reutilizable (N personas en gradas/escenario que se iluminan en dorado) para datos tipo "7 de cada 10".
0b. (3D) Cámara con temblor suave de mano y profundidad de campo falsa (niebla más cercana) para look cinematográfico.
0c. (3D) Transición entre escenas: barrido de cámara rápido (whip pan) en vez de corte seco.
0d. (3D) Mascota "Cosmo" en versión 3D low-poly para el cierre.
--- (lista anterior, estilo Material) ---
4. Subtítulos: la palabra activa con chip que se desliza (no aparece) de una palabra a otra.
5. Barra de progreso tipo M3 "wavy progress indicator" (línea ondulada).
6. Íconos animados (morph): check que se dibuja, corazón que late, rayo que parpadea.
7. Gráficas simples en estilo M3 (barras y donas planas animadas) para comparar cosas sin usar cifras.
8. Fondo: formas que reaccionan al ritmo de la música (pulso suave en los golpes).
9. Que ninguna escena empiece vacía: el protagonista entra en los primeros 0.3 s aunque la palabra clave llegue después.
10. Biblioteca de personajes M3 reutilizables (`personajes.py`): chile, pájaro, carita, perro… con expresiones, para no redibujarlos cada vez.
11. Pasar `bars()` y `bubble()`/chat (con "escribiendo…") del short de nadar a `material.py` como componentes `bar_chart()` y `chat_card()`.
12. Container transform con origen configurable: que la forma crezca desde el elemento protagonista de la escena anterior (z.tr_y / x) y no siempre desde el centro.
13. Que la luna "2" del cierre pase por detrás de la mascota (orden de dibujo según el ángulo) y no por encima de la cara.
14. Pasar `perro()`, `perro_arriba()` y `flecha_giro()` del short del perro a `personajes.py` (base de la #10).

- 2026-11-05 18:00 (perro): agregado perro({pos,s,color,mancha,oscuro,collar}) y perroAnda(p,lt,vel,cola) en engine.js. Lección: en vertical el FOV horizontal es angosto; para objetos de menos de 1 m usa fov 42–50 y cámara a 3–5 m, o se ven cortados.
