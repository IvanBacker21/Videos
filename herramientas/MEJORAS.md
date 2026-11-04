# Bitácora de mejoras visuales

Cada short implementa al menos UNA mejora de esta lista (o una nueva) y la anota aquí.

## Hechas
- 2026-11-04 · Kit Material Design 3 (`material.py`): superficies con elevación, formas M3, chips, FAB, ripple, iconos redondeados, fondo tonal. `render3.py` usa estilo "material" por defecto.
- 2026-11-04 · `coherencia.py`: verifica cierre, invitación a compartir, números, palabras clave de animación ↔ voz, título y descripción.

- 2026-11-04 · Short del picante · Cierre en Material (`cierre_material` en render3): planeta scallop, chip de comentarios con icono, botón Suscribirse plano con ripple y cursor. Personajes planos M3 (chile, pájaro), tarjeta de chat y vasos en tarjetas con check/close.

- 2026-11-04 · Short de nadar después de comer · Transición M3 "container transform" en `render3.py` (`TRANSICION = "container"`, `TR_DUR`, `TR_FORMA`, `container_transform()`): la escena nueva se abre dentro de una forma scallop con elevación que crece y se redondea sobre el fondo de la escena anterior; reemplaza el destello blanco (`TRANSICION = "flash"` lo recupera). Además: gráfica de barras plana M3 sin cifras (`bars()` en el short, pendiente de pasar a material.py) y chat con respuesta de "mamá" (burbuja escribiendo → respuesta).

- 2026-11-04 · Short del perro (19:00) · Mascota del canal "Cosmo" (`material.mascota()`, expresiones en `EXPRESIONES`: feliz, sorpresa, guino, pensando; parpadea y flota). Protagoniza el cierre (`CIERRE_MASCOTA = True` en render3: pensando → feliz → guiño al "síguenos") y aparece en el gancho como reacción. Además `material.donut()` (anillo de progreso M3 sin cifras, parte de la #7) y personajes de perro/lobo de frente, desde arriba y enroscado.
- 2026-11-04 · Motor 3D low-poly (`motor3d/`): Three.js headless, cocina, persona, rótulos dorados, subtítulos arriba palabra por palabra, cierre con planeta 3D. Short demo: pan con mantequilla. **Desde aquí el estilo oficial es 3D**; lo de Material queda como referencia.

## Siguientes (toma la primera de las 3D)
0. (3D) Sets reutilizables en `engine.js`: `setCalle()`, `setCuarto()`, `setEspacio()`, `setLaboratorio()`, `setMapa()` (mapa plano con etiquetas como en la referencia).
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
