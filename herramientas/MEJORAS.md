# Bitácora de mejoras visuales

Cada short implementa al menos UNA mejora de esta lista (o una nueva) y la anota aquí.

## Hechas
- 2026-11-04 · Kit Material Design 3 (`material.py`): superficies con elevación, formas M3, chips, FAB, ripple, iconos redondeados, fondo tonal. `render3.py` usa estilo "material" por defecto.
- 2026-11-04 · `coherencia.py`: verifica cierre, invitación a compartir, números, palabras clave de animación ↔ voz, título y descripción.

## Siguientes (toma la primera)
1. Rehacer la escena `cierre` de `render3.py` en estilo Material: planeta como forma M3 plana, botón "Suscribirse" tipo FAB con ripple, chip "Déjalo en comentarios" con icono `chat`.
2. Transición entre escenas tipo M3 "container transform": la forma protagonista crece y se convierte en el fondo de la escena siguiente (en lugar del destello blanco).
3. Personaje mascota del canal en estilo Material (astronauta o planeta con cara) reutilizable en gancho y cierre, con 4 expresiones.
4. Subtítulos: la palabra activa con chip que se desliza (no aparece) de una palabra a otra.
5. Barra de progreso tipo M3 "wavy progress indicator" (línea ondulada).
6. Íconos animados (morph): check que se dibuja, corazón que late, rayo que parpadea.
7. Gráficas simples en estilo M3 (barras y donas planas animadas) para comparar cosas sin usar cifras.
8. Fondo: formas que reaccionan al ritmo de la música (pulso suave en los golpes).
