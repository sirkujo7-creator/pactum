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
4. **Guerra con otra polis (publicado en 0.55.0):** nueva; tensión que puede llevar a guerra, tropas en el borde, asedio, daño visible y tratado de paz; con su balance. Decisiones de Juan (4 de octubre): **se puede perder territorio** (casillas del borde que ocupa el vecino hasta recuperarlas en un tratado), **el jugador también puede declarar la guerra** (desde Ciudad, con cuartel, a un vecino hostil, con su costo de legitimidad y el debate de la guerra justa) y la guerra es **rara y evitable** (solo si se descuida a un vecino).
5. Revisión final en celular y computador (incluye el paso 7 de la fase 8), publicada en 0.56.0.

**Fase 10 (aprobada por Juan el 4 de octubre): el campo y el clima.** El cultivo pasa a ser una decisión y no un edificio, y los biomas cambian con el clima. Un paso publicable a la vez:

1. **La finca y sus cultivos (publicado en 0.57.0):** un solo edificio, la finca; en su ficha se elige qué sembrar: pancoger (maíz y fríjol), arroz, café, plátano, cacao, aguacate, algodón o ganadería. Cada cultivo tiene su piso térmico, su comida o su dinero, el agua que pide, el empleo, el efecto en el ambiente y los años hasta la primera cosecha; cambiar de cultivo cuesta oro y tiempo. Las partidas guardadas conservan sus cultivos (cafetal → finca de café). Se ve en el mapa.
2. **Precios y canasta agrícola (publicado en 0.58.0):** cada cultivo con sus ciclos de precio (bonanzas y crisis; el algodón se desploma como en El Espinal); en Hacienda, la canasta agrícola muestra cuánto depende la economía de cada cultivo (lección de diversificación y riesgo).
3. **Biomas que cambian (publicado en 0.59.0):** con el cambio climático los pisos térmicos suben (el café trepa, el páramo se encoge, el Nevado pierde su glaciar, el deshielo da agua y luego la quita); la tala, la ganadería y la reforestación cambian el bioma casilla por casilla; dilemas del entorno (minería en el páramo, cafeteros que suben, el glaciar que desaparece) en los archivos de datos.
4. **Balance** con los robots (que eligen cultivos) y revisión en celular y computador (publicado en 0.60.0; la fase 10 queda terminada y espera la prueba de Juan).

**Ideas de otros juegos (decisión de Juan, 4 de octubre):** se adoptan, en este orden, **la industria** (al estilo Victoria 3: cadenas de producción, obreros y mercado), **cultura y civismo** (rasgo cultural por época, como Humankind, y árbol de civismo, como Civilization VI) e **historias humanas** (cartas y viñetas de pobladores, como Valiant Hearts). Dawn of Man, solo como posible prólogo opcional. Descartados: Ancestors, Spore y Hearts of Iron IV.

**Fase 11 (aprobada por Juan el 4 de octubre): la industria como decisión.** Juan pidió además destacar los avances paso a paso con un sistema de desbloqueo, en un periódico que se despliega con su propio sonido.

0. **El Pregonero y el camino de avances (publicado en 0.61.0):** los desbloqueos (etapas, inventos, caminos y luego productos y civismo) en `src/data/avances.json`; salen en el periódico al cerrar el año; camino de avances y hemeroteca en la Crónica.
1. **La fábrica y sus productos (publicado en 0.62.0):** el taller pasa a ser la fábrica, y en su ficha se elige qué producir, como en la finca: trilladora de café, molino de arroz, textiles (algodón), chocolate (cacao), fundición (mina) o artesanías. Transforma lo que da el campo y lo vende más caro (valor agregado); sin materia prima rinde poco.
2. **Obreros, mercado y contaminación (publicado en 0.63.0):** precios de cada producto con ciclos, salarios y el sindicato de Marta Quintero ligados a las fábricas, contaminación del aire y del río; la canasta de Hacienda muestra campo e industria.
3. **La revolución industrial por épocas (publicado en 0.64.0):** del taller artesanal a la fábrica con máquinas y luego a la automatización (más producción y menos empleo); dilemas de la industria en los archivos de datos.
4. **Balance** con los robots y revisión en celular y computador (publicado en 0.65.0; la fase 11 queda terminada y espera la prueba de Juan).

**Fase 12 (aprobada por Juan el 4 de octubre): cultura y civismo.** Un paso publicable a la vez:

1. **El árbol de civismo (publicado en 0.66.0):** 18 leyes en tres ramas de seis (derechos, economía, territorio) con pros y contras; las nuevas se desbloquean con puntos de civismo, su época o una ley anterior; prensa y censura son contrarias; salen en El Pregonero.
2. **Rasgo cultural de cada época (publicado en 0.67.0):** al empezar cada época se elige uno de tres rasgos que se acumulan en la identidad del pueblo (estandarte en la Crónica).
3. **La cultura en el mapa y los dilemas (publicado en 0.68.0):** fiestas y patrimonio según los rasgos, dilemas de identidad y memoria, y el juicio de la historia los menciona.
4. **Balance** con los robots (que eligen rasgos y leyes) (publicado en 0.69.0; la fase 12 queda terminada y espera la prueba de Juan).

**Fase 13 (aprobada por Juan el 4 de octubre): historias humanas**, sin censura (las cartas cuentan la historia tal como fue). Un paso publicable a la vez:

1. **Las familias y sus cartas (publicado en 0.70.0):** cinco familias (Tique, Rojas, Quintero, Arango, Lozano); cada pocos años una carta que cambia según las decisiones, con viñeta, frase para pensar y recuerdo.
2. **El álbum de las familias (publicado en 0.71.0):** árbol de cada familia, cartas guardadas y recuerdos con su historia (Crónica).
3. **En el mapa y al final (publicado en 0.72.0):** los miembros de las familias caminan por el pueblo y se pueden tocar; epílogo con el destino de cada familia.
4. **Balance** y revisión en celular y computador (publicado en 0.72.0; la fase 13 queda terminada y espera la prueba de Juan).

**Ajustes del 5 de octubre (publicado en 0.73.0):** las partidas empiezan con el mapa vacío y una misión de fundación (2 casas y 2 fincas con su oro); movimiento más suave de gente, animales y arrieros; menos tráfico en los caminos. En 0.74.0: caminos sin borde, como tierra gastada, y cartas cada 6 años como mucho. En 0.75.0: vecindad (parques que alegran a las casas cercanas, fábricas, minas y cuarteles que molestan a sus vecinos, bonos por materia prima y fincas cerca).

**Decisiones del 5 de octubre (después de 0.75.1):**
- **Cine más largo (publicado en 0.76.0):** las escenas duran unos diez segundos, con título grande, y se quedan en pantalla hasta tocar «Continuar». La invasión muestra la columna del vecino con fusiles y estandarte marchando hacia las casas, con humo y fogonazos. Regla para lo que viene: todo evento mecánico grande debe verse en el mapa.
- **Fase 14 (aprobada en idea): territorios al azar.** Cinco tipos de territorio con relieve, colores y vegetación propios, que salen al azar en cada partida: valle del Magdalena, ladera cafetera, cañón del Combeima, alta montaña y páramo, sur seco.
- **Fase 15 (aprobada en idea): la polis en el mundo.** El Tolima **sigue siendo una polis independiente**, nunca un departamento. Tres círculos: polis hermanas andinas (Antioquia con sus colonos y baldíos, Santafé, Huila, Quindío, Valle), regiones lejanas por rutas (Caribe, Pacífico, Llanos, Amazonía; río Magdalena, Camino del Quindío, ferrocarril, cable aéreo) y potencias por época (España, Inglaterra, Estados Unidos, Alemania, China, ONU). Pantalla «El mundo». Juan quiere ampliarlo aún más; con escenas de cine para caravanas, llegadas e invasiones.

**Fase «El mapa cuenta la historia» (aprobada por Juan el 5 de octubre, antes de la fase 14):** las decisiones, leyes y desgracias dejan huellas físicas en el mapa, no solo números. Las huellas van alrededor del pueblo, lejos de las obras (0.76.1). Un paso publicable a la vez:

0. **Plaza de fundación (publicado en 0.77.0):** primera obra de cada partida nueva (cruz de piedra y ceiba, Leyes de Indias); marca el centro y el casco urbano (4, 6 y 9 casillas por etapa; libre en Polis). Fincas, minas y obras del río pueden ir fuera del casco. No se demuele. Datos en `src/data/huellas.json`, lógica en `src/core/huellas.js`.
1. **Desastres y muertes (publicado en 0.78.0):** ruinas que cuestan oro al reconstruir; cementerio como edificio con su parcela, lejos de la plaza (mínimo 4 casillas; cédula de Carlos III, 1787), con tumbas que crecen con las muertes y más riesgo de epidemia sin él; luto en la plaza, campos secos, bandera amarilla en epidemias.
2. **Barrio de invasión que crece (publicado en 0.79.0)** casilla por casilla, con informalidad, menos impuestos, enfermedad, deserción e inseguridad (legalizar, ignorar o desalojar); colonos que toman baldíos con ranchos y cercas en el borde.
3. **Leyes que se ven (publicado en 0.80.0):** cada ley vigente con su señal junto a las obras que toca (pizarras en las escuelas, urna y quiosco en la plaza, mojones de la reforma agraria en las fincas, maloca del resguardo indígena lejos del pueblo…).
4. **Guerra y conflicto (publicado en 0.80.0):** casas quemadas con hollín (8 años o hasta repararlas), ruinas, trincheras con sacos y alambre entre el pueblo y la frontera (12 años); la toma armada deja muertos que piden sepultura.
5. **Balance** con los robots (0.80.0: Normal 52%, Difícil 27%; falta medir los seis regímenes). La fase queda terminada y espera la prueba de Juan.

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
