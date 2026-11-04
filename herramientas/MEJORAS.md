# Bitácora de mejoras visuales

Cada short implementa al menos UNA mejora de esta lista (o una nueva) y la anota aquí.

## Hechas
- 2026-11-04 · Kit Material Design 3 (`material.py`): superficies con elevación, formas M3, chips, FAB, ripple, iconos redondeados, fondo tonal. `render3.py` usa estilo "material" por defecto.
- 2026-11-04 · `coherencia.py`: verifica cierre, invitación a compartir, números, palabras clave de animación ↔ voz, título y descripción.

- 2026-11-04 · Short del picante · Cierre en Material (`cierre_material` en render3): planeta scallop, chip de comentarios con icono, botón Suscribirse plano con ripple y cursor. Personajes planos M3 (chile, pájaro), tarjeta de chat y vasos en tarjetas con check/close.

- 2026-11-04 · Short de nadar después de comer · Transición M3 "container transform" en `render3.py` (`TRANSICION = "container"`, `TR_DUR`, `TR_FORMA`, `container_transform()`): la escena nueva se abre dentro de una forma scallop con elevación que crece y se redondea sobre el fondo de la escena anterior; reemplaza el destello blanco (`TRANSICION = "flash"` lo recupera). Además: gráfica de barras plana M3 sin cifras (`bars()` en el short, pendiente de pasar a material.py) y chat con respuesta de "mamá" (burbuja escribiendo → respuesta).

## Siguientes (toma la primera)
3. Personaje mascota del canal en estilo Material (astronauta o planeta con cara) reutilizable en gancho y cierre, con 4 expresiones.
4. Subtítulos: la palabra activa con chip que se desliza (no aparece) de una palabra a otra.
5. Barra de progreso tipo M3 "wavy progress indicator" (línea ondulada).
6. Íconos animados (morph): check que se dibuja, corazón que late, rayo que parpadea.
7. Gráficas simples en estilo M3 (barras y donas planas animadas) para comparar cosas sin usar cifras.
8. Fondo: formas que reaccionan al ritmo de la música (pulso suave en los golpes).
9. Que ninguna escena empiece vacía: el protagonista entra en los primeros 0.3 s aunque la palabra clave llegue después.
10. Biblioteca de personajes M3 reutilizables (`personajes.py`): chile, pájaro, carita, perro… con expresiones, para no redibujarlos cada vez.
11. Pasar `bars()` y `bubble()`/chat (con "escribiendo…") del short de nadar a `material.py` como componentes `bar_chart()` y `chat_card()`.
12. Container transform con origen configurable: que la forma crezca desde el elemento protagonista de la escena anterior (z.tr_y / x) y no siempre desde el centro.
