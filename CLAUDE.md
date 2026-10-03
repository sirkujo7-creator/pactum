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
| `herramientas/balance-fases.js` | Informe de las fases 1 y 2 con las mismas semillas: versión 9, jugador preparado y sin prepararse; victorias, año de victoria, crisis por partida y derrotas después de una crisis |
| `herramientas/balance.js` | Robots que juegan cientos de partidas con la lógica real de `src/core`. Uso: `node herramientas/balance.js` (variables opcionales `DIF`, `REG`, `NG`, `ETH`) |

## Decisiones fijas

- Nombre: **PACTUM: la nueva polis**.
- Arte: **fresco pompeyano con el Tolima neoclásico** (decisión de Juan, 4 de octubre; reemplaza la acuarela y se aplica en la fase 8). Un solo estilo para todo: mapa, obras, gente, íconos y paneles, con paleta de pigmentos (rojo pompeyano, ocres, tierra verde, azul egipcio, blanco de cal), contorno siena y textura de muro. Se conservan el Nevado, el río, el café, la guadua y las casas de bahareque; los edificios públicos son neoclásicos (columnas y frontón, como la arquitectura republicana). Pinceles en `src/arte/fresco.js`. Sin paquetes de arte externos. El arte se hornea a texturas una vez; nada de redibujar formas complejas en cada cuadro.
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

## Fase actual: Fase 7, un siglo de historia

Las fases 0 a 3 están terminadas. Las fases 4 (riesgo y mundo), 5 (sociedad y memoria), 6 (conocimiento) y 7 (un siglo de historia, versión 0.46.0, 4 de octubre) están publicadas y esperan la prueba de Juan; su estado queda en `docs/DISENO.md`. Lo siguiente es el cambio visual (abajo).

Juan pidió el 3 de octubre que una partida dure **mínimo unos 100 años para ganar**, con los eventos repartidos en el tiempo (hoy todo se amontona entre los años 8 y 16 y se gana hacia el año 57). La dificultad **no baja**: se mantiene ajustando el oro o con más eventos y desastres, pero repartidos. Plan aprobado (un paso publicable a la vez):

1. El ritmo del siglo: etapas más largas (Pueblo hacia el año 15, Ciudad hacia el 45, Polis hacia el 75); ganar exige sostener la Polis unos 25 años; calendario de llegada (personajes de a uno, una misión a la vez, inventos repartidos, volcán, conflicto y vecinos más adelante); los años tranquilos pasan rápido.
2. Épocas de la historia del Tolima, con eventos y dilemas propios (unos 5 por época): fundación y tierras baldías (0-15), el café y los arrieros (15-35), La Violencia (35-50), modernización y migración a la ciudad (50-70), conflicto y acuerdos de paz (70-90), era digital y cambio climático (90+).
3. Economía con ciclos: bonanzas y crisis del café, la roya, envejecimiento y pensiones, jóvenes que se van a la ciudad, costos que suben con cada época (el oro nunca sobra).
4. Más desastres y clima: epidemias (fiebre amarilla al principio, pandemia al final), sequías largas, avenidas torrenciales; con el cambio climático, El Niño y La Niña más seguidos en la segunda mitad. Siempre preparables y con años de respiro.
5. Balance final.

Fase 8 (siguiente): **el fresco**, un cambio visual completo con un solo estilo grecorromano. Juan pidió el 4 de octubre rehacer los pobladores (le parecían horribles), árboles menos exagerados (también en los parques) y un solo estilo igual en todo, ojalá grecorromano. Eligió **fresco pompeyano** y **Tolima neoclásico**. Pasos (un paso publicable a la vez):

1. Prueba de estilo en `pruebas/fresco.html` (no toca el juego): pueblo, pobladores y árboles antes y ahora, e interfaz en dos variantes (A muro de cal, B muro rojo pompeyano). Juan la aprueba o pide cambios.
2. Interfaz al fresco con la variante A (muro de cal), elegida por Juan: barra de arriba compacta, menú lateral agrupado, íconos pintados, tarjetas con greca.
3. Pobladores nuevos en el juego (`src/arte/gente.js`), y retratos de personajes y viñetas de los dilemas en el mismo estilo.
4. Naturaleza: árboles nuevos, menos y más pequeños; parques ordenados (`src/arte/flora.js`).
5. Obras: casas de bahareque con zócalo y teja; edificios públicos neoclásicos; huellas (`src/arte/obras-fresco.js`).
6. Terreno y pantalla de inicio al fresco (nevado nítido, arrozales sin cuadrícula, nitidez al acercar).
7. Revisión en celular y computador, y rendimiento.

**Fase 9 (aprobada por Juan el 4 de octubre): vida y escena**, en este orden (un paso publicable a la vez):

1. **Caminos en damero (publicado en 0.52.0):** calles por los bordes de las casillas (trazado colonial), rectas, con cruces en las esquinas; se ponen tocando dos esquinas y la ruta se traza sola (puente si cruza el río). Aspecto según la época (herradura, empedrado, carretera). Por ellos se mueven pocos vehículos con carga según la época: arrieros con mulas, chivas y camiones (no gente). Efectos (todos aprobados): comercio (mercados, cafetales y minas conectados rinden más), servicios que alcanzan más lejos a lo largo del camino, menos evasión en casas conectadas y mejores relaciones si el camino llega al borde hacia los vecinos; cuestan oro y mantenimiento y talan el bosque que cruzan. Primero se ve en `pruebas/caminos.html`.
2. **Pulir el movimiento de la gente (publicado en 0.53.0):** andar más suave, menos gente moviéndose y más quieta con sentido (grupos en la plaza, vendedores, niños jugando), caminar por las calles, rutina visible.
3. **Eventos de cine (publicado en 0.54.0):** escena corta (la cámara viaja al lugar, franjas de cine, lo que pasa) y luego la decisión: movimientos y personajes (marcha campesina con la líder pijao, procesión del párroco, escándalo del periodista, caravana de desplazados), conflicto armado visible (toma armada), desastres en escena (lahar, terremoto, avenida torrencial). Respetan una crisis mayor por año y los años de respiro.
4. **Guerra con otra polis:** nueva; tensión que puede llevar a guerra, tropas en el borde, asedio, daño visible y tratado de paz; con su balance. Decisiones de Juan (4 de octubre): **se puede perder territorio** (casillas del borde que ocupa el vecino hasta recuperarlas en un tratado), **el jugador también puede declarar la guerra** (desde Ciudad, con cuartel, a un vecino hostil, con su costo de legitimidad y el debate de la guerra justa) y la guerra es **rara y evitable** (solo si se descuida a un vecino).
5. Revisión final en celular y computador (incluye el paso 7 de la fase 8).

**Pendientes para después (no olvidar):**
- **Relevo de generaciones y legado** (a Juan le encantó): cada 20 o 30 años cambia el gobernante y el siguiente hereda aciertos y deudas, con un balance del legado; los personajes envejecen y los reemplazan sus sucesores con misiones nuevas.
- **Gobierno nacional y comunidad internacional**: Juan lo decide después de probar.
- Campaña por capítulos: le gusta, pero no es prioridad.
- Descartado: modo aula. Por decidir: guardado en la nube.

Metas: Normal entre 45% y 55% (República), regímenes a máximo 15 puntos, Difícil entre 25% y 35% (Juan pidió cerca de 30% y aceptó 35%); victorias alrededor del año 100; opciones de eventos sin flechas ni avisos; máximo una crisis mayor por año y dos años de respiro; máximo 4 recursos arriba y 5 medidores.

Terminado cuando:

- Los sistemas funcionan, se explican y se ven en el mapa.
- `node herramientas/balance.js` da entre 45% y 55% en Normal, República; regímenes con máximo 15 puntos de diferencia.
- `node herramientas/prueba-equivalencia.js` sigue en 0 diferencias.
- Las partidas guardadas antes se abren sin perderse.
- No hay errores en la consola; se ve fluido en celular y en computador.
- Juan lo prueba y lo aprueba.

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
