# Pactum: la nueva polis — instrucciones para Claude Code

Lee este archivo completo al inicio de cada sesión. Después lee `docs/DISENO.md`: es la fuente de verdad del diseño, y su sección **Balance general** manda sobre las demás.

## Con quién trabajas

- El dueño del proyecto es **Juan**, docente de Ciencias Sociales, Filosofía y Comprensión lectora en Ibagué (Colombia) y estudiante de Administración Financiera.
- **No programa.** Tú manejas todo lo técnico, incluido git: commits con mensajes en español, push y publicación.
- Habla siempre en **español**, con frases sencillas y sin jerga técnica. Si un término técnico es inevitable, explícalo en una frase.
- Profundidad moderada: respuestas claras y cortas, con el detalle necesario y sin exceso de texto.
- **Antes de un cambio grande**, explícale el plan en pocas líneas y espera su visto bueno. Los cambios pequeños y las correcciones se hacen directamente.
- **Al terminar cada tarea**, dile qué cambió y cómo probarlo en su celular (el enlace de GitHub Pages).
- No entregues archivos .zip salvo que los pida.
- El juego debe funcionar **igual de bien en celular y en computador**. En celular (pantallas de unos 390×800 px) se juega con toques y paneles que suben desde abajo; en computador aprovecha la pantalla grande: paneles laterales, zoom con la rueda del ratón y atajos de teclado (por ejemplo, barra espaciadora para terminar el año). Juan prueba en los dos.

## Qué es Pactum

Simulador de gobierno para un jugador. Cada decisión enseña un concepto de filosofía política, ciencias sociales o finanzas públicas. El jugador lleva un territorio del Tolima de Aldea a Polis, bajo uno de seis regímenes (formas de Aristóteles y ciclo de Polibio), con dilemas éticos ligados a filósofos. Estilo visual: acuarela propia, isométrica, con los pisos térmicos del Tolima.

## Archivos de referencia (no borrarlos)

| Archivo | Qué es |
| --- | --- |
| `docs/DISENO.md` | Documento de diseño completo |
| `referencia/referencia-polis-v9.html` | Versión 9 del juego (se llamaba Polis). Contiene toda la lógica y el contenido que hay que conservar: economía, clases, regímenes, leyes, 20 dilemas, 20 consecuencias diferidas, logros, sonido |
| `referencia/referencia-estilo-acuarela.html` | Prueba de estilo aprobada: terreno continuo con luz, 7 entornos, casas de bahareque, pobladores con identidad, luz del día y temporadas. Es la guía visual obligatoria |
| `referencia/balance-v9.js` | Herramienta de balance original de la v9, con su lógica tal cual. Sirve para comparar: `node herramientas/prueba-equivalencia.js` comprueba que `src/core` da exactamente los mismos resultados |
| `herramientas/balance.js` | Robots que juegan cientos de partidas con la lógica real de `src/core`. Uso: `node herramientas/balance.js` (variables opcionales `DIF`, `REG`, `NG`, `ETH`) |

## Decisiones fijas

- Nombre: **PACTUM: la nueva polis**.
- Arte: acuarela propia por capas (forma, color, textura de papel, bordes, luz). Sin paquetes de arte externos. El arte se hornea a texturas una vez; nada de redibujar formas complejas en cada cuadro.
- Motor: **Phaser 3**, guardado en `vendor/` (no por CDN), para que funcione sin internet.
- **Sin paso de compilación**: módulos ES nativos, se publica tal cual en GitHub Pages.
- App instalable (PWA) con `manifest.webmanifest` y `sw.js`.
- Tipografía: Alegreya y Alegreya Sans, siempre con fuentes de respaldo.

## Arquitectura objetivo

```
index.html
manifest.webmanifest
sw.js
vendor/phaser.min.js
src/core/        lógica pura, sin DOM ni Phaser (economía, sociedad, regímenes, leyes, dilemas, mundo, guardado)
src/data/        contenido en JSON (dilemas, consecuencias, leyes, edificios, personajes, textos)
src/arte/        pintura en acuarela y sprites horneados
src/escenas/     escenas de Phaser: Arranque, Mapa, Interfaz
herramientas/    balance.js y pruebas con Node
docs/            DISENO.md
referencia/      las dos referencias HTML
```

Reglas técnicas:

1. `src/core` nunca importa Phaser ni toca el DOM; así las simulaciones de balance lo prueban con Node.
2. El contenido narrativo vive en `src/data`, para que Juan pueda agregar dilemas sin tocar código.
3. Guardado con número de versión y migraciones: una actualización nunca debe borrar la partida de nadie.
4. Orden por profundidad por posición en el mundo (fila + columna), para que ningún poblador quede encima de un techo.
5. Terreno pintado por sectores; al cambiar algo, solo se repinta su sector.
6. Rendimiento: fluido en un celular de gama media y en un computador corriente; máximo unos 150 pobladores animados.
7. Accesibilidad: respetar "reducir movimiento", foco visible, textos legibles.

## Fase actual: Fase 1, territorio vivo

La fase 0 (migración) está terminada y Juan la probó en su celular. Su estado queda en `docs/DISENO.md`.

Objetivo: que el territorio cambie solo y por las decisiones del jugador, sin romper el balance.

Incluye (en este orden, un paso publicable a la vez):

1. Temporadas: el paisaje alterna lluvias y seca; la calidad de las lluvias de cada año afecta las cosechas (decisión de Juan).
2. El Niño y La Niña: sequías y crecidas cada pocos años, con pronóstico un año antes y un fondo de emergencias en Hacienda (decisión de Juan). Dilemas nuevos de clima.
3. Suelo vivo: el bosque crece o se quema; las laderas taladas se erosionan y pueden derrumbarse; la ley ambiental hace volver los árboles.
4. Vida de los edificios: desgaste visible (nuevo, gastado, agrietado, abandonado), con un control de mantenimiento de 0% a 100% en Hacienda (decisión de Juan). Se abre con 25 habitantes.
5. Balance: robots que también enfrentan los sistemas nuevos.

Reglas del diseño que aplican: máximo una crisis mayor por año, dos años de respiro después de una crisis, toda crisis tiene preparación posible; El Niño y La Niña empiezan en Pueblo con 60 habitantes; ninguna medida nueva en la barra superior (máximo 4 recursos a la vez).

Terminado cuando:

- Los cuatro sistemas funcionan y se ven en el mapa.
- `node herramientas/balance.js` sigue entre 55% y 70% de victorias en Normal, estrategia equilibrada, República; los desastres siempre son sobrevivibles con preparación.
- `node herramientas/prueba-equivalencia.js` sigue en 0 diferencias (los sistemas nuevos se apagan en el modo de comparación con la v9).
- Las partidas guardadas en la fase 0 se abren sin perderse.
- No hay errores en la consola; se ve fluido en celular y en computador.
- Juan lo prueba y lo aprueba.

No adelantes sistemas de fases futuras.

## Forma de trabajar en cada fase

1. Plan corto a Juan y espera su visto bueno.
2. Implementa en pasos pequeños, con un commit por paso.
3. Corre las simulaciones de balance cuando cambie la lógica.
4. Revisa en tamaño celular y en tamaño computador.
5. Push y publicación.
6. Explícale a Juan qué cambió y cómo probarlo.
7. Actualiza la tabla de estado de `docs/DISENO.md` si cambió algo del diseño.

## Qué no hacer

- No cambiar el diseño por tu cuenta: propón, y Juan decide.
- No agregar dependencias externas sin necesidad real.
- No borrar las referencias.
- No usar paquetes de arte externos.
- No dejar el juego roto en la rama principal: GitHub Pages publica lo que está ahí.
