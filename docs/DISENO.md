# PACTUM: la nueva polis — Documento de diseño

Versión del 27 de septiembre de 2026. Autor: Juan. Documento vivo: la sección **Balance general** manda sobre las demás cuando haya diferencias.

## Visión y principios de diseño

Pactum es un simulador de gobierno para un jugador en el que cada decisión enseña un concepto de filosofía política, ciencias sociales o finanzas públicas. Está pensado para estudiantes de colegio y universidad, y para jugarse también fuera del aula.

**Lo que debe enseñar:** formas de gobierno y su corrupción (Aristóteles, Polibio), ética aplicada (Kant, Mill, Rawls, Maquiavelo, Aristóteles), finanzas públicas (presupuesto, deuda, inflación, riesgo) y fenómenos sociales (desigualdad, migración, segregación).

**Reglas para aceptar una idea nueva:**

1. **Se ve en el mapa o en una decisión.** Un sistema que el jugador no percibe no enseña nada.
2. **Enseña un concepto nombrable.** Si no podemos decir qué concepto enseña, no entra.
3. **Tiene costos y ganancias reales.** Ninguna opción, ley ni régimen es "la correcta"; el juego pregunta, no adoctrina.
4. **No rompe el balance.** Cada sistema nuevo pasa por las simulaciones automáticas antes de publicarse.
5. **Se entiende en una frase.** Si explicarlo requiere un párrafo, hay que simplificarlo.

## Decisiones tomadas

- **Nombre:** PACTUM: la nueva polis.
- **Público:** no se fija uno; la profundidad es moderada, con suficiente fondo para que los sistemas funcionen bien pero sin volverse complejo.
- **Ideas:** se aprueban todas, organizadas según el balance general.
- **Estilo visual:** acuarela propia por capas, sin paquetes de arte externos. La referencia aprobada es `referencia/referencia-estilo-acuarela.html`.
- **Repositorio:** https://github.com/sirkujo7-creator/pactum
- **Herramienta de desarrollo:** Claude Code.

## Estado actual (versión 9, llamada Polis)

El juego ya funciona completo en un solo archivo HTML (`referencia/referencia-polis-v9.html`), con balance probado en miles de partidas simuladas. Todo esto se conserva en la migración.

| Sistema | Qué hace hoy |
| --- | --- |
| Territorio | Mapa isométrico 20×20 con relieve de 3 niveles, río, afluentes, lagunas, montañas y bosques; cada partida trae un mapa distinto con código de semilla |
| Etapas | Aldea, Pueblo, Ciudad y Polis, desbloqueadas por población, servicios y confianza |
| Construcciones | 15 obras: casas, cultivo, cafetal (ladera), mercado, parque, escuela, hospital, taller, acueducto, molino, puerto, sede de gobierno, mina, banco, universidad |
| Sociedad | 3 clases (campesinos, artesanos, élite) con empleo, ingreso y ánimo propios; voces: Doña Rosa, Julián y Don Aurelio |
| Recursos | Oro, alimento, agua (acueductos) y energía (molinos para talleres) |
| Hacienda | Impuesto por clase, presupuesto anual, préstamos, bonos a 5 años, emisión de moneda, inflación, calificación de riesgo AAA a CCC, cesación de pagos |
| Regímenes | 6 formas (Monarquía, Aristocracia, República, Dictadura, Plutocracia, Populismo) con reglas, sede, colores y música propias; rumbo del gobierno, corrupción, reforma y revoluciones según el ciclo de Polibio |
| Leyes | 8 leyes con cupos por etapa y restricciones según régimen |
| Dilemas | 20 dilemas y 20 consecuencias diferidas, cada opción ligada a un filósofo; perfil ético al final |
| Presentación | Pantalla de juego con dock, efectos de fin de año, viñetas en acuarela, sonido generado, 3 niveles de dificultad, guía, logros y ranuras de guardado |

## Estado de la fase 0 (migración)

La versión 9 ya vive en la nueva base (Phaser, módulos, datos en JSON, app instalable). Juan la probó en su celular y dio paso a la fase 1.

| Parte | Estado |
| --- | --- |
| Lógica | Toda la lógica de la v9 está en `src/core`. `node herramientas/prueba-equivalencia.js` juega miles de partidas con el mismo azar en la v9 y en la versión nueva: 0 diferencias |
| Contenido | Dilemas (21, los de la v9), consecuencias, leyes, obras, regímenes, logros, personajes y pobladores en `src/data` (JSON editable; guía en `src/data/LEEME.md`) |
| Territorio | Terreno continuo de la prueba de estilo, 32×32 (probado en 64×64), siete entornos, pintado por sectores |
| Mapa lógico | Río → río; páramo, roca y nevado → montaña (minas); bosque de niebla → bosque; el resto → llano; ladera → café. El bosque aporta al ambiente según el porcentaje del territorio (2,9 por cada 1%) para conservar el balance |
| Obras | Las 15 obras de la v9 en acuarela, variantes por etapa y seis sedes por régimen; campos, caminos y puentes pintados en el suelo |
| Pobladores | Hasta 150 figuras (unas dos personas por figura) con casa y trabajo reales, rutina diaria, luz del día y fichas |
| Interfaz | La de la v9: medidores, paneles, fin de año, dilemas con viñetas, etapas, régimen, final con perfil ético, ayuda |
| Guardado | Automático, con número de versión y migraciones; tres ranuras y código de partida; abre partidas de la v9 (reubica sus obras en el nuevo mapa) |
| Logros y sonido | Los 14 logros y la música de la v9 por régimen |
| Balance (Normal, estrategia equilibrada) | República 69%, Monarquía 86%, Aristocracia 83%, Dictadura 79%, Plutocracia 52%, Populismo 51%. Igual que la v9; la diferencia entre regímenes se corrige en la fase 3 |

## Estado de la fase 1 (territorio vivo)

Terminada. Juan la jugó 100 años y la aprobó. Pidió, para después de las fases, más leyes, más dilemas y que cada decisión se vea en el mapa.

| Paso | Estado |
| --- | --- |
| 1. Temporadas | Publicado (0.8.0). Lluvias abundantes, normales o escasas cada año; cambian la cosecha y el color del paisaje |
| 2. El Niño y La Niña | Publicado (0.9.0). Desde Pueblo con 60 habitantes; pronóstico un año antes; fondo de emergencias en Hacienda (0–20% de los ingresos, 3% de interés); seis dilemas de clima |
| 3. Suelo vivo | Publicado (0.10.0). El bosque vuelve a las laderas junto a otros bosques (más rápido con la ley ambiental); El Niño trae incendios; las laderas taladas se erosionan y con La Niña pueden derrumbarse y llevarse obras. Se ve en el mapa (bosque joven, cenizas y troncos, cárcavas, derrumbes) y en la ficha de cada casilla |
| 4. Vida de los edificios | Publicado (0.11.0). Desde 25 habitantes las obras se gastan según el mantenimiento que se paga (control de 0% a 100% en Hacienda): en buen estado, gastada, agrietada (rinde 25% menos y baja el ánimo) y abandonada (deja de funcionar). Se ven con tono desteñido, grietas y maleza; se reparan desde la ficha o todas juntas en Hacienda. Robots: 62% con 100% de mantenimiento, 54% con 70%, casi 0% con 40% o menos |
| 5. Balance | Publicado (0.11.1). `node herramientas/balance-fases.js` compara las mismas partidas: mapa de la v9 68% (gana hacia el año 45); fase 1 con preparación 66% (año 55); fase 1 sin prepararse 36%. Unas 5 emergencias por partida; con preparación no aumentan las derrotas. Regímenes (Normal, equilibrada): República 62–66%, Monarquía 81%, Dictadura 75%, Aristocracia 73%, Plutocracia 51%, Populismo 47% (v9: 49%). Decisión de Juan: no se baja la meta de Polis; la duración (unos 55 años) se mantiene exigente. Juan jugó 100 años y aprobó la fase 1; el contenido nuevo (más leyes, dilemas y decisiones visibles) va después de las fases |

## Estado de la fase 2 (economía y obra)

Terminada (0.19.1), con el paréntesis de claridad. Falta que Juan la pruebe y la apruebe.

| Paso | Estado |
| --- | --- |
| 1. Obras por etapas | Publicado (0.12.0). Escuela, taller, acueducto y molino tardan 1 año; hospital, mina, banco, puerto y ágora, 2; universidad, 3. Se paga una cuota por año; mientras avanzan emplean 6 personas; sin oro se detienen y a los 2 años son elefante blanco. Se ven cimientos, muros que suben con andamio y material; grises si están detenidas. Robots: 65% |
| 2. Evaluación y licitación | Publicado (0.13.0; ajuste 0.13.1 pedido por Juan: contratistas más distintos). Antes de una obra grande sale su ficha: inversión, tiempo, resultado anual, VPN a 15 años con la tasa de interés del momento, recuperación y beneficio social. Cada licitación trae tres ofertas: siempre una con soborno (precio normal, da 25% del costo en oro, tuerce el rumbo 10 puntos, 60% de escándalo en 2 a 4 años) y dos de estas: sólida (+15%, mantenimiento 30% menor para siempre y obra muy durable), rápida (+25%, un año menos; las de un año quedan listas al instante) y barata (−30%, se entrega agrietada y 50% de sobrecosto de una etapa). Precios con variación de ±6%. Deshacer devuelve el soborno. Robots: eligen la honesta más barata que no sea la de materiales pobres; 67% |
| 3. Cobertura y recaudo | Publicado (0.14.0). Desde Pueblo, escuela (radio 6), hospital (8) y mercado (6) atienden solo las casas cercanas; la cobertura efectiva es el menor entre cupos y casas dentro del radio. Casas lejos del mercado bajan el ánimo. Nueva obra: oficina de recaudo (50 de oro, radio 7); el centro del pueblo recauda en radio 6 y el ágora en 7; fuera de su alcance se evade 35% de los impuestos. Capa de cobertura (botón ◎ o tecla C): casas verdes, amarillas o rojas y círculos de alcance; al elegir un servicio en Construir se ve su alcance. Robots: construyen compacto y ponen los servicios donde cubren más casas: 63% |
| 4. Economía viva | Publicado (0.15.0). Desde Pueblo con 60 habitantes. Precio del alimento por oferta y demanda (0,6 a 2 veces lo normal): caro baja el ánimo de los artesanos y sube el ingreso campesino; se ve en la pastilla del alimento (▲/▼) y en puestos vacíos del mercado. Café con precio internacional que varía. Ciclo: auge (ingresos +10%, 2 a 3 años) y recesión (ingresos −15% y menos ánimo, 2 años), anunciada un año antes; es crisis mayor y respeta el respiro (no coincide con El Niño o La Niña). En la recesión cada obra en marcha emplea el doble y sostiene el ánimo (Keynes). Hacienda tiene sección de economía. Guardado versión 6. Robots: 63% |
| Claridad (pedida por Juan) | Publicada. 1: recuadro de cada indicador y desglose del ánimo por clase (0.16.0). 2: cada obra muestra todos sus efectos antes de construirla (oro, empleos por clase, cupos, alimento, agua, energía, ambiente, ánimo de cada clase, alcance, mantenimiento) y lo que aporta hoy en su ficha (0.17.0). 3: cada opción de dilema muestra a quién mueve y hacia dónde (▲/▼) y su filosofía; al elegir, «¿Por qué afecta así?» con una frase escrita para cada una de las 80 opciones (0.18.0). 4: diez sucesos buenos (cosecha abundante, arrieros, minga, fiestas de San Juan y San Pedro, paisano, inventora, voluntarios, café premiado, familias que regresan, reconocimiento) y una consecuencia buena; regla contra rachas: tras dos golpes seguidos (dilemas o consecuencias malas, o un año de crisis) llega un suceso bueno y las consecuencias malas esperan un año; para conservar la exigencia, cada golpe pesa un tercio más (Normal ×1,6 en vez de ×1,2); tras ganar se puede seguir gobernando (0.19.0). Robots: Normal 65%, Fácil 100%, Difícil 22%. Terminada; falta que Juan la pruebe. |
| 5. Balance | Publicado (0.19.1). `node herramientas/balance-fases.js` (mismas semillas): versión 9 67% (gana hacia el año 45); jugador preparado 63% (año 52); sin prepararse 48%. Unas 5 crisis mayores por partida (clima y recesión); las derrotas no se concentran después de ellas. Normal República 65–68%; Fácil 100%; Difícil 22%. Regímenes: Monarquía 90%, Dictadura 80%, Aristocracia 79%, República 68%, Populismo 55%, Plutocracia 49% (se corrige en la fase 3). Perfiles éticos: virtud 82%, deontología 82%, contrato 76%, utilitarismo 74%, realismo 17% (en la v9 el realismo ganaba 10%: rasgo del diseño original, para proponer en la fase 3) |

## Estado de la fase 3 (poder)

| Paso | Estado |
| --- | --- |
| 1. Clases ampliadas | Publicado (0.20.0). En Sociedad cada clase muestra sus subgrupos con personas y ánimo: campesinos con tierra y sin tierra; obreros, comerciantes y funcionarios; terratenientes y financistas; y aparte estudiantes e informales. El ánimo de un subgrupo es el de su clase más sus causas propias (tierra, precio de la comida, sueldos del Estado, ciclo económico, leyes...). Nueva medida: parte de los campesinos con tierra (35% al inicio), que mueven la reforma agraria, los créditos, la cooperativa cafetera y las familias que regresan. Robots: 68% |
| 2. Ejército | Publicado (0.21.0). Nuevo edificio: cuartel (Ciudad, 120 de oro, 2 años de obra). Desde que existe, el Ejército cuesta un porcentaje de los ingresos (control en Hacienda, 0 a 15%). Su ánimo tiende a una meta que depende del gasto, del régimen, de la confianza del pueblo y del tesoro; con ánimo alto da orden y seguridad (comerciantes y terratenientes +3). Si su ánimo baja de 30 y la confianza de 45, hay "ruido de sables": un año de aviso y, si nada cambia, golpe de Estado (crisis mayor, el régimen pasa a tiranía). Respeta los años de respiro. Los soldados aparecen como subgrupo en Sociedad. Robots: 63% |
| 3. Legitimidad y uso de la fuerza | Publicado (0.22.0). Confianza pasa a llamarse Legitimidad en todo el juego (el modo de comparación con la v9 conserva sus textos). Las opciones que usan la fuerza (romper la huelga, dispersar la protesta) avisan con qué legitimidad se dará la orden. Alta (60 o más): cuesta la mitad de legitimidad y no deja consecuencias. Media: igual que antes. Baja (menos de 40): cuesta un cuarto más y trae sabotaje en 1 o 2 años (una obra dañada en el mapa, oro y ánimo). Con Ejército, reprimir le baja el ánimo a los soldados. Lección de Weber. Robots: 67% |
| 4. Movimientos sociales | Publicado (0.23.0). Cuatro movimientos con líder y nombre: sindicato (obreros, con taller o mina), estudiantes (con escuela o universidad), campesinos (jornaleros sin tierra) y ambientalistas (desde Ciudad, según el ambiente). Fuerza de 0 a 100: crece si su gente está descontenta (ánimo bajo 50) y se calma si está contenta. Con 40 presentan demandas en los años sin dilema; con 70 se movilizan: multitud con pancartas en la plaza, −2 de legitimidad por año e ignorarlos tiene costo inmediato (huelga, toma, paro agrario, bloqueo). Respuestas: escuchar (−35, cuesta oro), ignorar (+8), reprimir (usa la fuerza de Weber: −30, o +15 con legitimidad baja). Mesa de diálogo desde Sociedad, una vez por año. La élite no tiene movimiento ni financia huelgas: responde con presión política. Ninguno termina la partida por sí solo. Robots: 68% |
| 5. Acta fundacional | Publicado (0.24.0). Al empezar una partida nueva se eligen 2 de 6 principios: libertad de expresión, gobernar escuchando, cuidar el agua y la tierra, gobierno limpio, que pague más quien más tiene y tierra para quien la trabaja. Firmar da +5 de legitimidad de origen; contradecir un principio cuesta 5 (usar la fuerza, censura, soborno, abrir una mina, ignorar a un movimiento, quitar tierra, impuestos regresivos). Antes de decidir, las opciones avisan si contradicen el acta. El estado del acta se ve en la ficha del régimen. Las partidas guardadas antes siguen sin acta. Robots: 64% sin acta, 67% con acta |
| 6. Balance | Publicado (0.25.0). Ajustes de régimen que solo valen en el terreno en acuarela (`ajustesFase3` en `regimenes.json`; la v9 queda igual). Hallazgo: por el ciclo de Polibio casi todas las partidas cambian de régimen, y el destino pesa más que el inicio (Monarquía terminaba en Aristocracia, sin elecciones; Plutocracia caía pronto en República). Monarquía y Aristocracia se corrompen más rápido; Dictadura con menos legitimidad; Plutocracia con tope de 15% a la élite y caída más pronta; Populismo con menos inflación. Robots (Normal, equilibrada, 800 partidas por régimen): República 62%, Plutocracia 57%, Aristocracia 65%, Dictadura 65%, Populismo 66%, Monarquía 65%: 9 puntos de diferencia (antes 42). Normal República con balance.js: 63%. Fácil 99%, Difícil 15% |

## Estado de la fase 4 (riesgo y mundo)

| Paso | Estado |
| --- | --- |
| 0. Opciones sin pistas | Publicado (0.25.1). Las opciones de los eventos ya no muestran flechas ni avisos; todo se explica al elegir |
| 1. Exigencia | Publicado (0.26.0). 25 opciones tienen riesgo: con cierta probabilidad salen mal (tarjeta «Salió mal»). Los sucesos buenos llegan solo tras 3 golpes seguidos (2 en Fácil) y solo a veces (Normal 30%, Difícil 20%, Fácil 80%); si no, es un año tranquilo. Cada régimen tiene una ventaja propia: Monarquía, leyes 40% más baratas; Aristocracia, obras 10% más baratas; República, movimientos crecen 40% más lento; Dictadura, obras grandes un año más rápidas; Plutocracia, préstamos 4 puntos más baratos; Populismo, escuchar a un movimiento calma 50% más. Robots: República 52% (balance.js 54%); regímenes entre 47% y 61% (14 puntos). Fácil 99%, Difícil 10% |
| 2. Sucesos sin decisión y Policía | Publicado (0.27.0). Nueva medida, la inseguridad (en Sociedad, con sus causas): sube con desempleo, desigualdad, pobreza, poca legitimidad, corrupción y movimientos movilizados; baja con policía, escuelas y parques cerca de las casas y un Ejército que da orden. Sucesos que llegan solos, como mucho uno por año y sin repetirse seguido: atentado (inseguridad alta y legitimidad baja; daña una obra pública), robo (se lleva oro), incendio (sequía o poco mantenimiento), brote de enfermedad (casas sin hospital, ambiente sucio) y abuso policial (policía con corrupción alta; sube el movimiento estudiantil). Cada uno trae una tarjeta con por qué pasó y cómo prevenirlo, y humo sobre la obra dañada. Nuevo edificio: estación de policía (Pueblo, 60 de oro, radio 7, entra en la capa de cobertura). Robots: unos 4 sucesos por partida; República 51%; regímenes entre 42% y 56% (14 puntos). Difícil 5% |
| 3. Personajes con papel propio | Publicado (0.28.0). Cinco personajes con retrato, relación (0 a 100) y misiones con plazo: comandante Rocío Méndez (llega con la primera estación de policía), periodista Ernesto Lozada (La Voz del Combeima), padre Anselmo, Saúl Tique (gobernador del cabildo pijao) y Beatriz Arango (empresaria cafetera, llega con el primer cafetal). Reaccionan a lo que se hace (fuerza, censura, prensa, sobornos, minas, escuchar o ignorar movimientos, quitar tierra) con intereses opuestos. Misión cumplida: relación +20 y un premio; vencida: −10. Relación alta o baja cambia algo: inseguridad, legitimidad (prensa) o escándalos, crecimiento de los movimientos, ambiente o bloqueo de minas, ingresos de la élite. Se ven en Sociedad (sección Personajes) y llegan con una tarjeta al cierre del año. Robots: República 48 a 50%; regímenes entre 48% y 57% |
| 4. Decisiones que se ven | Publicado (0.29.0). Cada decisión deja una huella en una casilla libre cerca del centro: mural (justicia social, escuchar), retén con guardia (mano dura), valla de negocio (tratos con la élite), placa (deber y transparencia), olla comunitaria (ayuda directa), pancartas (demandas no atendidas), vivero (ambiente) y la piedra del acta fundacional (permanente). Cada opción de los 27 dilemas tiene su huella; las que no, según su corriente filosófica. Duran de 4 a 15 años (máximo 14 a la vez); construir encima las borra. Tocar una huella muestra qué decisión la dejó y en qué año. Sin efecto en el balance |
| 5. Desastres reales del Tolima | Publicado (0.30.0). Nevado del Ruiz (desde Pueblo, año 8): alerta verde, amarilla, naranja y roja con fumarola en el pico; la Dra. Inés Calderón (vulcanóloga) llega con la primera alerta; plan de evacuación (50 de oro, en la tarjeta de alerta o en Hacienda). Con alerta roja, al año siguiente puede llegar la erupción: el lahar baja por el río (lodo gris en el mapa), daña las obras de la ribera y la ceniza baja la cosecha 30%; sin plan muere 20% de la gente (lección de Armero, 1985), con plan 2%. Terremoto (sin aviso, 1,5% por año): daña obras (más las viejas) y cuesta una emergencia que paga el fondo; la nueva ley «Código sismorresistente» encarece las obras 10% pero reduce mucho el daño (lección del Eje Cafetero, 1999). Ambos son crisis mayores y respetan los años de respiro. Incendios forestales y derrumbes ya existían con El Niño y La Niña. Robots: unas 0,3 erupciones y 0,35 terremotos por partida; República 46 a 49%; regímenes entre 48% y 59% |
| 6. Conflicto armado y desplazamiento | Publicado (0.31.0). Nivel de conflicto (0 a 100, en Sociedad con sus causas) que crece donde el Estado no llega: casas sin policía ni escuela, jornaleros pobres, pocos campesinos con tierra, poca legitimidad, inseguridad y minas. Con 36 aparece un grupo armado ficticio (el Frente del Páramo) con campamento en las veredas más lejanas: menos cosecha (veredas abandonadas), desplazados que llegan al pueblo, extorsión, algo de inflación, −0,5 de legitimidad por año e inseguridad +6; con 70, toma armada (crisis mayor). Estrategias: ofensiva militar (necesita cuartel; baja rápido pero desplaza más), diálogo de paz (puede terminar en acuerdo de paz con placa en el mapa y +6 de legitimidad) e inversión social (lenta; da tierra y ánimo a los campesinos). Robots: el grupo aparece en 1 de cada 4 partidas; República 46%; regímenes entre 42% y 51% |
| 7. Relaciones con otras polis | Publicado (0.32.0). Desde Ciudad, tres vecinos ficticios con alcalde y relación (0 a 100): Villa Lagunilla (río abajo; le molesta el río sucio), San Lorenzo del Magdalena (puerto; le molestan los aranceles y los regímenes autoritarios) y Altamira de los Nevados (cafetera; agradece el plan del volcán, le molesta la competencia del café). Tratado de comercio (ingresos de artesanos y élite +4% por vecino con relación de 40 o más; deja un letrero de camino en el mapa) y visita diplomática. El conflicto armado y los regímenes autoritarios enfrían las relaciones. Aliados (70+) envían ayuda en las emergencias; hostiles (25 o menos) bloquean el comercio. Nivel mínimo: con un promedio menor que 35 hay aislamiento (ingresos −5%, legitimidad −1 por año) y no se puede llegar a Polis. Robots: República 53%; regímenes entre 42% y 53% |
| 8. Otras formas de ganar y efecto por edificio | Publicado (0.33.0). Desde Ciudad, además de la Polis, cuatro caminos que se ganan sosteniendo todas sus condiciones los años que pide la dificultad (6 en Normal): Polis próspera (bienestar 60, calificación AAA, sin deuda, tesoro de 250), Polis justa (igualdad 70, legitimidad 62, ninguna clase bajo 45), Polis verde (ambiente 82, sin minas, bosque en 26% del territorio) y Polis en paz (sin grupo armado, inseguridad menor que 10, sin movimientos movilizados, vecinos con 70 de promedio). Tarjeta «Caminos a la victoria» desde la meta, con el avance de cada uno. Cada edificio muestra en su ficha su efecto especial; nuevos efectos: el mercado estabiliza el precio de la comida (hasta 30%), el acueducto reduce los brotes (hasta la mitad) y el puerto suma 2% de comercio y mejora la relación con San Lorenzo. Robots (no buscan estos caminos): unos 2% ganan por ellos. República 47%; regímenes entre 40% y 54%; Fácil 100%, Difícil 8% |
| 9. Ajuste de Difícil | Publicado (0.33.1). Decisión de Juan (3 de octubre): Difícil cerca de 30%. Golpes ×1,45, racha para suceso bueno de 2 y suceso bueno 55% de esas veces. Robots: Difícil 31% |

## Ajustes pedidos por Juan (5 de octubre)

| Ajuste | Estado |
| --- | --- |
| Fundar a elección y movimiento más suave | Publicado (0.73.0). Las partidas nuevas empiezan con el mapa vacío: el jugador escoge dónde fundar con la **misión de fundación** (2 casas y 2 fincas, con el oro que valían ya en el tesoro); la primera obra marca el centro del pueblo y no se puede cerrar el primer año sin al menos una casa y una finca. Los robots y las partidas guardadas siguen igual (`?clasico=1` abre una partida con la aldea de antes). Movimiento: cada figura usa el mismo pincel en sus cuatro pasos (antes el dibujo «temblaba» al caminar), el arriero conserva su ropa (antes cambiaba de color en cada paso), la gente y los animales ya no se voltean de un lado al otro en las esquinas, los animales tienen un leve vaivén al andar y el tráfico es menor (máximo 4, solo con 4 o más tramos de calle) y descansa entre viaje y viaje |
| Caminos naturales y cartas más espaciadas | Publicado (0.74.0). Los caminos ya no tienen borde dibujado ni parecen en relieve: orilla difusa, cuerpo semitransparente y centro gastado, en tonos de tierra (herradura), piedra (empedrado) y asfalto (carretera). Las cartas de las familias llegan cada 6 años como mucho (antes 3), nunca el mismo año en que se elige el rasgo de la época, y la primera llega hacia el año 2 o 3 |
| Vecindad | Publicado (0.75.0). Lo que se construye junto a las casas importa (`src/core/vecindad.js`, `src/data/vecindad.json`): los **parques** alegran solo a las casas que tienen al lado (artesanos +8 y campesinos +2 según la parte de las casas con parque cerca; antes valían igual en cualquier sitio); las **fábricas** (a una casilla, −7 de ánimo), las **minas** (a dos, −9) y los **cuarteles** (a una, −3) molestan a sus vecinos; una **fábrica con su materia prima a tres casillas** rinde 12% más y un **mercado junto a las fincas** vende 8% más. Al construir, un aviso dice cuántas casas quedan junto a la molestia o al parque; la ficha de cada casa muestra su vecindario. Lección de ordenamiento territorial (POT). Los robots ponen los parques entre las casas y las fábricas lejos. Golpes: Normal de 1,27 a 1,30 y Difícil de 1,40 a 1,60. Resultados: Normal 52% (República; regímenes entre 53% y 66%), Difícil 28% |
| Sonido en el celular | Publicado (0.75.1). El sonido viene encendido (antes había que activarlo en el menú) y arranca con el primer toque completo (en iPhone, el toque debe terminar para que el navegador deje sonar el audio). En iPhone suena aunque el interruptor de silencio esté puesto (Safari 16.4 o más reciente) y se reactiva si el aparato lo suspende al volver al juego. Se apaga y se prende en el menú |
| Cine más largo | Publicado (0.76.0). Las escenas de cine duran unos diez segundos (antes 3,6), con título grande arriba («La procesión», «La invasión»…), y ya no se cierran solas ni con un toque cualquiera: al terminar se quedan en pantalla, con la gente y el humo, hasta tocar «Continuar» (o «Saltar» antes). La **invasión** se rehízo: una columna de 18 soldados del vecino, con fusiles y su estandarte rojo, cruza el borde y marcha hacia las casas más cercanas; la cámara la sigue y, al llegar, salen humo y fogonazos. Solo cambia lo que se ve: el balance no se mueve |
| Huellas alrededor | Publicado (0.76.1). Las huellas nuevas (murales, placas, retenes…) ya no se ponen junto a las obras: buscan una casilla libre a dos casillas o más de cualquier construcción, alrededor del pueblo, para no estorbar al construir |
| Plaza de fundación | Publicado (0.77.0). En las partidas nuevas la primera obra es la **plaza de fundación** (cruz de piedra sobre gradas y una ceiba, sobre una explanada clara), como mandaban las Leyes de Indias (1573). Marca el centro del pueblo y el **casco urbano**: las obras del pueblo van a 4 casillas o menos de la plaza en Aldea, 6 en Pueblo, 9 en Ciudad y sin límite en Polis; fincas, minas, acueductos, molinos y puertos pueden ir más lejos. Cuesta 20 de oro (incluidos en el oro inicial), no tiene mantenimiento y no se puede demoler. Misión de fundación: plaza, 2 casas y 2 fincas. Las partidas guardadas antes siguen sin casco |
| Ruinas, cementerio y luto | Publicado (0.78.0). Las muertes trágicas (desastres, epidemias, hambre y guerra) se cuentan y piden sepultura. **Cementerio**: nuevo edificio (35 de oro, tapia blanca, cipreses y tumbas que aparecen con cada muerte; 40 sepulturas cada uno); debe quedar a 4 casillas o más de la plaza (cédula de Carlos III, 1787). Desde 3 muertos sin sepultura: −4 de ánimo a campesinos y artesanos y epidemias 1,6 veces más probables, con aviso en la meta. **Ruinas**: tras un terremoto (35% de las obras dañadas; 10% con la ley sismorresistente), una erupción (50% de las de la ribera) o una avenida (40%), algunas obras se derrumban: se ven en ruinas (muros quebrados, vigas y tejas caídas, maleza), no rinden y se **reconstruyen** con oro desde su ficha. **Luto**: velas y flores al pie de la plaza durante 3 años tras una tragedia; **banderas amarillas** en las casas durante una epidemia. Los robots construyen el cementerio cuando hace falta. Normal 51%, Difícil 26% (400 partidas) |
| Barrio de invasión y colonos | Publicado (0.79.0). **Barrio de invasión que crece**: un asentamiento informal que nadie resuelve suma un rancho a su lado cada 2 años (hasta 6) mientras falte trabajo o vivienda. Cada rancho alberga 6 personas, sube la evasión (2% por rancho, hasta 20%: ahí nadie paga impuestos), la deserción escolar, la violencia y la brecha de género de su barrio, y el riesgo de epidemia (6% por rancho). Legalizar cuesta más cuanto más grande (todos los ranchos se vuelven casas); desalojar los quita todos. **Colonos en los baldíos**: el dilema de las tierras baldías trae 3 familias que se ven en la frontera agrícola (a unas 9 casillas de la plaza), según la decisión: ranchos propios con cerca de guadua, arrendatarios con alambre y letrero de la hacienda, o parcelas sorteadas con mojones blancos. En las épocas de la fundación y del café llegan más colonos por su cuenta (hasta 8 ranchos). Tumban monte (−2 de ambiente), siembran su comida (2 por rancho), albergan 4 personas y no se puede construir encima |
| Leyes y guerra que se ven | Publicado (0.80.0). Balance final de la fase: Normal 52%, Difícil 27% (400 partidas). **Leyes**: cada ley vigente deja su señal pintada junto a las obras que toca, y la ficha de la obra dice cuál es: pizarras y libros en las escuelas (educación), bultos sellados y mojones en las fincas (subsidio, reforma agraria), reloj en las fábricas (jornada), letreros verdes en fábricas y minas (ambiente), talanquera en mercados y puertos (aranceles), columna de la moneda en el banco, triángulos sismorresistentes en las casas, letreros de juntas comunales (descentralización), banca de pensionados en el hospital (seguridad social) y, en la plaza, quiosco de periódicos (prensa), periódicos tachados (censura), registro civil (Estado laico), urna (sufragio), mesa de tutelas, tablero de tarifas (impuesto progresivo), cartel del SÍ y el NO (consulta) y la paloma de la paz. El resguardo indígena es una maloca lejos del pueblo donde no se puede construir; se va si se deroga la ley. **Guerra y conflicto**: las obras dañadas por la guerra o por una toma armada quedan ahumadas con hollín (8 años o hasta repararlas) y algunas en ruinas (30% en la guerra, 50% en la toma); cada año de guerra se cavan trincheras con sacos de arena y alambre entre el pueblo y la frontera (hasta 6, duran 12 años); la toma armada deja muertos que piden sepultura |
| Territorios al azar | Publicado (0.81.0). Cada partida nueva sale en uno de cinco territorios del Tolima, al azar según la semilla (las partidas guardadas antes conservan su terreno de siempre): **valle del Magdalena** (llanura ancha, arrozales y potreros con palmas; fincas +12% y comercio +8%), **ladera cafetera** (lomas templadas, café y guadua; vivir en la pendiente cuesta más), **cañón del Combeima** (río encajonado entre paredes de montaña; poco espacio plano y costos más altos), **alta montaña y páramo** (tierra fría, niebla, frailejones y minas; costos algo más altos) y **sur seco** (bosque seco con cardones, tono ocre; fincas +5% y comercio +4%, pero poca agua). Cada uno cambia el relieve, la humedad, los colores (pigmentos más ocres o más fríos) y la vegetación. La tarjeta de bienvenida y la Crónica dicen qué territorio tocó y qué enseña (Comisión Corográfica de Codazzi). Balance por territorio (Normal, 200 partidas): valle 53%, ladera 46%, cañón 51%, montaña 50%, sur 55%. Con territorios al azar: Normal 51%, Difícil 29% (golpe de Difícil de 1,60 a 1,54; 400 partidas) |
| El mundo | Publicado (0.82.0). Pantalla «El mundo» (botón 🌎 del menú, tecla m o desde Sociedad): un mapa pintado al fresco con el mar Caribe, el Pacífico, las tres cordilleras, los ríos Cauca y Magdalena, los Llanos y la Amazonía; tu polis al centro con sus tres vecinos de frontera, cinco **polis hermanas** (Antioquia desde el año 4, Santafé, Huila y Quindío desde Pueblo, Valle del Cauca desde Ciudad) y tres **países vecinos** (Venezuela, Ecuador y Panamá, desde Ciudad y los años 40 a 50). Cada uno tiene su régimen, que puede cambiar (el ciclo de Polibio no es solo tuyo), y una relación que vuelve poco a poco a la neutralidad. Acciones: **embajada** (+12 de relación, una por año), **tratado de comercio** (desde 55 de relación; trae lo que ofrece: más comercio, fincas, fábricas, saber o legitimidad) y **liga** (desde 75; más beneficios, 8 de oro al año, y −3 de legitimidad si el aliado es autoritario). Un tratado se rompe si la relación cae de 30. Los beneficios son modestos (2 a 3% de comercio, fincas o fábricas; saber y civismo con Santafé) para no regalar la partida; el golpe de Normal sube de 1,30 a 1,33. Los robots también hacen diplomacia. Lección: autarquía de Aristóteles y la liga de Delos |
| Pendientes | Publicado (0.83.0). Botón 📋 arriba a la derecha (tecla p) con un contador de lo que espera una decisión; rojo si hay algo urgente. La lista se ordena en urgente (comida, agua, cuentas en rojo, guerra, volcán sin plan, promesas a punto de vencer, roya), importante (misiones de los personajes, muertos sin sepultura, asentamientos, ruinas, obras agrietadas, fábricas sin energía o sin materia prima, movimientos movilizados, vecinos hostiles, tratados por romperse) y sugerencias (leyes por desbloquear, cupos de ley libres, renovar el café contra la roya). Cada pendiente tiene «Ir», que abre el panel, la ficha o la casilla del mapa. El botón se esconde cuando no hay pendientes |
| Pantallas desplegables | Publicado (0.84.0). Crónica, Sociedad, Hacienda y Leyes se dividen en secciones desplegables con su título y un dato clave (resultado del año, fondo guardado, leyes vigentes por rama, época, gráfica elegida…). Abiertas al empezar: Impuestos y cuentas, y Clases sociales; las demás cerradas. Cada aparato recuerda cuáles dejaste abiertas. «Ir» de Pendientes abre la sección justa (ciclos del café, riesgo, personajes, movimientos, vecinos). No se recorta ningún texto |
| Interfaz colombiana | Publicado (0.85.0). La interfaz conserva su estética (muro de cal, versalitas, tarjetas) pero deja lo grecorromano: los bordes, botones y acentos pasan de rojo pompeyano a **verde cafetero**; la greca griega se cambia por una **guarda de rombos escalonados** inspirada en la cerámica pijao, en terracota con un punto ocre; los retratos llevan aro verde. **El Pregonero** se imprime en papel viejo (pergamino con manchas y fibras, bordes oscurecidos) con letra de imprenta del siglo XIX (IM Fell English, licencia libre, guardada en el juego para funcionar sin internet). Los avisos urgentes siguen en rojo. En 0.85.1 la guarda va dentro de la barra inferior y arriba de cada panel, siempre con rombos enteros, y el botón de pendientes 📋 queda siempre debajo de los indicadores: gris sin pendientes, con alerta roja y número cuando algo espera |
| Terreno natural | Publicado (0.86.0). El suelo deja el color plano: manchones de pasto seco (más en la sequía), lodo y charcos junto al río, piedras sueltas en las laderas, el páramo y la roca, y pinceladas finas de pasto; las manchas siguen un ruido del mundo y se agrupan a través de varias casillas. La vegetación va en grupos: guaduales a lo largo del agua y palmas de cera en manchones; árboles nuevos de la prueba colonial (copas de hojas con luz, troncos curvos; guadua en macolla con hojas colgantes). Las calles tienen bordes imperfectos, huellas de ruedas y cascos y piedras sueltas; veredas curvas de tierra unen fincas, minas y cementerio con la esquina de calle más cercana (hasta 3 casillas) |
| Animales y pobladores | Publicado (0.87.0). Animales de la prueba colonial (vaca orejinegra, gallinas, perro criollo, garza, loros, mula de arriero, piedras y tocones) con luz de arriba y contorno suave, y cuadros propios para moverse sin cosas raras: la vaca camina con las patas en diagonal y pasta bajando la cabeza (a ratos la levanta), la gallina picotea con la cabeza (antes giraba todo el cuerpo), el perro trota en cuatro cuadros y descansa sentado, la garza camina y aletea despacio; los cuadros avanzan según lo recorrido (sin patinar) y nunca cambian de color. Pobladores nuevos en tres cuartos con ropa del Tolima (aguadeño, ruana, machete en su funda, falda larga y pañolón, delantal de cuero, levita y sombrero de copa; ropa moderna en las épocas del ladrillo y el concreto) y ocho cuadros al caminar (antes cuatro). El arriero va detrás de su mula |
| Casas coloniales | Publicado (0.88.0), en `src/arte/casas.js`. Cuatro variantes con silueta propia y su elemento vivo: casa de corredor (alero largo sobre pilares, materas de flores y banco), casa esquinera (techo de cuatro aguas, puerta en la esquina, ropa tendida), casa de zaguán (larga, portón de arco y caballo ensillado amarrado a su poste; garaje y carreta en el concreto) y casa con solar (tapia baja con portón, plátanos asomando, carreta). Cuatro épocas de fachada: bahareque de un piso, tapia de dos pisos con balcón, ladrillo con hiladas y balcón de hierro, concreto con terraza, tanque y ventanas de vidrio. Cada casa tiene su versión húmeda (manchas que suben del zócalo, chorreones bajo el alero y cal caída que deja ver el bahareque o el ladrillo), que el mapa muestra cuando la obra está gastada. Dibujo por capas: sombra, estructura, techo y elementos vivos |
| Edificios públicos coloniales | Publicado (0.89.0), en `src/arte/publicos.js`; reemplazan a los templos griegos con las mismas claves. Cada obra tiene una silueta propia: escuela con corredor y espadaña con campana; hospital de dos pisos con galería de arcos, capilla y cruz roja; taller como ramada abierta con banco, vasijas y horno de ladrillo con chimenea; recaudo como casa fuerte de piedra con rejas, escudo, balanza y sacos; biblioteca (casa de la cultura) con linterna en el techo; teatro con fachada alta de tres arcos, balcón corrido y pretil con lira; policía con garita y farol; cuartel de muralla con almenas, torreón y cañón; banco de piedra con cúpula verde; universidad (claustro) con torre del reloj; acueducto de arcos de piedra con su canal y pila; molino de piedra con rueda hidráulica; puerto con bodega de zinc, muelle y champán. La sede cambia con el régimen: cabildo de portales con reloj (república), palacio con torreones y corona (monarquía), casona en L con escudo de armas (aristocracia), fortaleza con torre del homenaje (tiranía), casa de comercio de ladrillo con frontón curvo dorado (oligarquía) y tribuna popular con murales, banderines y megáfono (demagogia) |
| Iglesia e identidad de los edificios | Publicado (0.90.0). Pedido de Juan (6 de octubre): los edificios se veían iguales, sobre todo por los techos, y faltaba la iglesia. **Iglesia parroquial** (opción B, se construye): una sola, en una casilla vecina a la plaza de fundación (Leyes de Indias); 80 de oro, mantenimiento 5, desde Aldea; baja la exigencia de cultura y sentido (cultura 1; con 2 los robots ganaban 62%) y al párroco le agrada (+15 de relación). Es la obra más grande y detallada y crece con las épocas: capilla de bahareque con espadaña y cruz de madera; iglesia colonial con portada de piedra, óculo, espadaña de tres campanas, contrafuertes y sacristía; templo de dos torres con frontón, rosetón y cúpula sobre el crucero; templo restaurado como patrimonio, pintado de amarillo, con reloj, reflectores y placa. Su fachada mira a la plaza y sus campanas suenan al construirla y al empezar cada año. **Identidad**: cada edificio con su material de techo (zinc rojo en la escuela, pizarra en el hospital y el palacio, zinc oxidado en el taller, teja vidriada verde en la biblioteca, zinc verde en la policía, paja en el molino, teja vieja o parda en otros) y su color de fachada (escuela amarilla, biblioteca rosa viejo, universidad de ladrillo, casona azul, policía con franja verde); patios y jardines (rayuela y mango en la escuela, jardín florido en el hospital, banca y árbol en la biblioteca); las casas varían el tono de su teja; las obras importantes se ven más grandes (iglesia, sede de gobierno, universidad, teatro, hospital, cuartel). Los robots construyen la iglesia; balance en esta versión: ver Balance general |

## Estado de la fase 13 (historias humanas)

Terminada (0.72.0): espera la prueba de Juan. Aprobada por Juan el 4 de octubre, sin censura: las cartas cuentan la historia tal como fue (muertes, desplazamiento, extorsión, reclutamiento).

| Paso | Estado |
| --- | --- |
| 1. Las familias y sus cartas | Publicado (0.70.0). Cinco familias atraviesan el siglo (`src/data/familias.json`, `src/core/familias.js`): los Tique (pijao del resguardo), los Rojas (campesinos que llegan de Boyacá), los Quintero (obreros: escogedores de café, tejedoras, repartidores), los Arango (comerciantes de la tienda de la plaza) y los Lozano (desplazados que llegan hacia el año 70). Cada tres años como mucho llega una carta de un miembro (24 cartas, 39 variantes): la colonización de los baldíos, las fichas de la tienda de raya, los arrieros, el asesinato de Ignacio Tique y de Pedro Rojas en La Violencia, las tierras compradas sobre el miedo, el sindicato de Marta Quintero, el primer voto de una mujer, la reforma agraria, la extorsión, el desplazamiento, el reclutamiento de un muchacho sin escuela, la Comisión de la Verdad, la restitución de tierras, el trabajo por aplicaciones... Cada carta cambia según lo que decidió el jugador (leyes, rasgos, salarios, fincas, fábricas, guerra y conflicto), trae una viñeta, una frase para pensar y a veces un recuerdo con su dato histórico (14 en total). Llega antes del dilema del año, con su sonido (papel y tiple). Solo narra: no cambia el balance |
| 2. El álbum de las familias | Publicado (0.71.0). En la Crónica, **Álbum de las familias**: cada familia con su origen, su gente (los del comienzo y los que aparecen en las cartas, con † y el año si murieron o «se fue» si migraron) y sus cartas para releer; y los **recuerdos** (14 objetos con su dato histórico: el chumbe, el azadón, la ficha de la tienda de raya, el carriel, la foto de Pedro Rojas, la radio, la cédula de la primera votante, la escritura de la parcela, el carné del sindicato, la libreta de deudas, la maleta del desplazamiento, el título de restitución, el celular del repartidor y el cuaderno de la lengua); los que faltan aparecen como «por descubrir» |
| 3. En el mapa y al final | Publicado (0.72.0). Quien escribió la última carta de cada familia (si sigue vivo) camina por el pueblo como un poblador más, con una marca roja sobre la cabeza; al tocarlo se ve su familia y se puede leer su última carta. Al terminar la partida, el juicio de la historia cierra con **«Qué fue de las familias»**: la historia de cada una, contada según lo que decidió el jugador |
| 4. Revisión | Publicada (0.72.0). Las familias solo narran: el balance no cambia. Normal 47%, Difícil 28%. Partida larga en el navegador sin errores; probado en celular y computador |

## Estado de la fase 12 (cultura y civismo)

Terminada (0.69.0): espera la prueba de Juan. Aprobada por Juan el 4 de octubre: árbol de civismo con 18 leyes (seis por rama, con sus pros y contras), rasgo cultural de cada época, la cultura en el mapa y los dilemas, y balance.

| Paso | Estado |
| --- | --- |
| 1. El árbol de civismo | Publicado (0.66.0). Las leyes se ordenan en tres ramas de seis (`src/data/civismo.json`, `src/core/civismo.js`). **Derechos y ciudadanía:** libertad de prensa (contraria a la censura), educación pública, Estado laico, sufragio universal, acción de tutela, derechos indígenas y consulta previa. **Economía y trabajo:** jornada de 8 horas, banco central, subsidio al campo, aranceles (sin ellos hay libre comercio), impuesto progresivo, seguridad social. **Territorio y convivencia:** protección ambiental, código sismorresistente, reforma agraria, consulta popular, descentralización, acuerdo de paz y ley de víctimas. Las nueve de siempre siguen igual; las diez nuevas se desbloquean con **puntos de civismo** (dan las escuelas, las bibliotecas, el ágora, la universidad, la prensa libre y una legitimidad de 60 o más) y algunas piden su época (sufragio y reforma agraria desde La Violencia, seguridad social desde la modernización, tutela, derechos indígenas y paz desde la época de la paz) o una ley anterior (tutela e indígenas piden el sufragio; seguridad social, la jornada; reforma agraria, el subsidio; consulta, la prensa libre). Prensa y censura no pueden estar vigentes a la vez. Cada ley muestra sus pros y contras y su lección (Locke, Rawls y Piketty, Bismarck, Tocqueville, Cajamarca, la Constitución de 1991, el Acuerdo de 2016) y sus efectos entran en las cuentas de cada indicador («Leyes del árbol de civismo»). Los personajes reaccionan (el párroco al Estado laico, el líder pijao a los derechos indígenas, la empresaria al impuesto progresivo...). Cada ley desbloqueada sale en El Pregonero. Los robots aún no usan las leyes nuevas: el balance no cambia |
| 2. El rasgo cultural de cada época | Publicado (0.67.0). Al empezar cada época de la historia (y al cerrar el primer año, para la fundación) se elige uno de tres rasgos (`src/data/rasgos.json`): fundación (pueblo de minga, colonos emprendedores, pueblo devoto), café (arrieros, cafeteros, artesanos), La Violencia (pueblo que recuerda, mano firme, resistencia campesina), modernización (ciudad industrial, ciudad letrada, capital musical), paz (pueblo reconciliado, democracia participativa, pueblo emprendedor) y era digital (territorio verde, territorio conectado, pueblo solidario). Cada uno tiene su ventaja, su costo y su lección, y sus efectos usan las mismas cuentas que las leyes nuevas, más claves propias (fincas, fábricas, comercio, cultura, civismo y saber). Se acumulan en el **estandarte del pueblo** (Crónica → Identidad del pueblo). Los robots eligen al azar. Resultados: Normal 54% (regímenes entre 49% y 58%), Difícil 32% |
| 3. La cultura en el mapa y los dilemas | Publicado (0.68.0). Al elegir un rasgo se levanta un **estandarte** permanente en el mapa (pedestal, asta y bandera roja). La fiesta del pueblo cambia según los rasgos (San Juan y San Pedro, Festival Folclórico Colombiano con más cultura, fiesta de la minga, noche de la memoria, carnaval de la paz, fiesta del agua...). Cinco dilemas de identidad en `dilemas.json` (condiciones nuevas `rasgo` y `ley`): la lengua de los abuelos pijao, monumento o silencio sobre La Violencia, la música que llega de afuera, la procesión y el Estado laico, y turistas en el festival. El juicio de la historia recuerda los rasgos del pueblo (con su estandarte) y las leyes que quedaron vigentes. Normal 57% (se ajusta en el paso 4) |
| 4. Balance | Publicado (0.69.0). Los robots (estrategia equilibrada) desbloquean y promulgan leyes del árbol de civismo en orden (el acuerdo de paz primero si hay grupo armado; luego sufragio, impuesto progresivo, descentralización, tutela, derechos indígenas y Estado laico) y eligen los rasgos al azar. Usan sobre todo sufragio, impuesto progresivo y descentralización. Las leyes tienen costos reales: con ellas los robots ganan algo menos que sin ellas, porque el sufragio sube la exigencia y el impuesto progresivo enoja a la élite. Golpes en Difícil de 1,24 a 1,40. Resultados: Normal 49% (República; regímenes entre 49% y 56%), Difícil 32%, Fácil 77% |

## Estado de la fase 11 (la industria como decisión)

Terminada (0.65.0): espera la prueba de Juan. Aprobada por Juan el 4 de octubre. Pidió además que los avances se destaquen paso a paso, con un sistema de desbloqueo que salga en un periódico desplegable con su propio sonido.

| Paso | Estado |
| --- | --- |
| 0. El Pregonero y el camino de avances | Publicado (0.61.0). Todo lo que se desbloquea vive en una lista (`src/data/avances.json`, `src/core/avances.js`): etapas (con sus obras nuevas y lo que se abre), inventos y la era de los caminos (empedrado, carretera); después se sumarán los productos de la industria y el civismo. Al cerrar el año, los avances nuevos salen juntos en **El Pregonero**, un periódico que se despliega desde arriba con su propio sonido (golpes de la prensa, campanilla del voceador y fanfarria de metales): titular grande, notas en columnas, breves del año y una editorial con la lección. Reemplaza la tarjeta del cambio de etapa. El nombre cambia con los inventos (hoja volante, periódico impreso con la imprenta, periódico y radio, El Pregonero digital con internet). En la Crónica: **Camino de avances** (lo logrado con su año, los tres siguientes con lo que piden y cuántos faltan por descubrir) y la **Hemeroteca** para releer las ediciones. Solo anota: el balance no cambia |
| 1. La fábrica y sus productos | Publicado (0.62.0). El taller pasa a llamarse **fábrica** y en su ficha se elige qué producir (`src/core/industria.js`, `src/data/industria.json`): artesanías (el taller de siempre: 9 empleos, sin ganancia), trilladora de café (3 fincas de café), molino de arroz (3 de arroz), chocolatería (2 de cacao), textiles (3 de algodón) y fundición (1 mina). Cada producto deja oro al tesoro según la materia prima que haya (sin ella trabaja a medias: menos empleo y nada de ganancia) y sigue a medias el precio de su cultivo, así que la industria amortigua las crisis del campo (lección de valor agregado, Prebisch y la CEPAL). Con poca energía trabajan primero las fábricas que más dejan. Los productos se desbloquean en el camino de avances y salen en El Pregonero: trilladora y molino con el Pueblo, chocolatería con el telégrafo, textiles con la electricidad y fundición con la Ciudad y la electricidad. Al construir una fábrica se abre la tarjeta para elegir (el primer producto va incluido; cambiar cuesta 25). En el mapa, cada fábrica muestra su carga (sacos de café o de arroz, cajas de chocolate, rollos de tela, lingotes, ollas). En Hacienda, la sección «La industria». Las partidas guardadas siguen igual (sus talleres son fábricas de artesanías) |
| 2. Obreros, salarios y contaminación | Publicado (0.63.0). En Hacienda → «Salarios en las fábricas» se elige cuánto pagar: bajos (ganancia ×1,25, ánimo de los obreros −9 y el sindicato crece), justo (como siempre) o altos (ganancia ×0,8, obreros +6 y el sindicato se calma), con la lección de Henry Ford y la plusvalía de Marx. Los obreros (subgrupo de los artesanos) se cuentan según el empleo real de cada fábrica. Las fábricas junto al río lo ensucian más (ambiente ×1,4). El precio del metal de la fundición sigue el ciclo de la economía (×1,3 en el auge, ×0,7 en la recesión). La sección «La industria» muestra cuánto pesa la industria frente al campo |
| 3. La revolución industrial por épocas | Publicado (0.64.0). Cada fábrica tiene un nivel: taller artesanal; **fábrica con máquinas** (pide adoptar la electricidad, cuesta 60: ganancia ×1,6, empleo ×0,8, humo ×1,3) y **fábrica automatizada** (pide la automatización, cuesta 120: ganancia ×2,3, empleo ×0,4, humo ×1,1). Se moderniza desde la ficha, con la lección de la «destrucción creativa» de Schumpeter. En el mapa: chimenea alta con máquinas y nave de metal automatizada. Los dos saltos salen en El Pregonero. Cinco dilemas de la industria en `dilemas.json` (condiciones nuevas `productos` y `nivelFabrica`): niños en la fábrica, aguas mieles de la trilladora, huelga en la textilera, aranceles para proteger la industria (CEPAL frente a Smith y Ricardo) y las máquinas que reemplazan obreros |
| 4. Balance | Publicado (0.65.0). Los robots (estrategia equilibrada) construyen una fábrica cuando sobra materia prima, hay desempleo y oro; pasan las de artesanías al producto que más deja, las modernizan con la electricidad (y las automatizan solo sin desempleo) y suben los salarios si el sindicato aprieta. Usan sobre todo chocolatería y trilladora. Ganancias ajustadas: trilladora 6, molino 4, chocolatería 7, textiles 8 y fundición 10. Golpes en Normal de 1,24 a 1,27. Con y sin industria los robots ganan casi igual (55% y 56%): la industria es una opción más, no una obligación. Resultados: Normal 51% (República; regímenes entre 44% y 57%), Difícil 32%, Fácil 82%. Partida larga en el navegador sin errores |

## Estado de la fase 10 (el campo y el clima)

Terminada (0.60.0): espera la prueba de Juan.

| Paso | Estado |
| --- | --- |
| 1. La finca y sus cultivos | Publicado (0.57.0). El cultivo y el cafetal se vuelven un solo edificio, la **finca** (`src/core/fincas.js`, `src/data/cultivos.json`); al construirla se abre la tarjeta para elegir qué sembrar, y en su ficha se puede cambiar. Ocho cultivos: maíz y fríjol (pancoger), arroz (pide riego, sufre con El Niño), café (3 años hasta la primera cosecha, sigue su mercado y la roya), plátano, cacao (4 años, mejora el ambiente), aguacate (4 años, tierra fría, sufre con la sequía), algodón y ganadería (poco empleo, daña el suelo). Cada uno rinde según el piso térmico de la casilla (cálida, templada, fría) y da alimento, oro, empleo y un efecto en el ambiente; junto al río la comida rinde 4 más. Cambiar de cultivo cuesta la siembra (la primera va incluida en la finca nueva). El café, el plátano y el cacao protegen la ladera de la erosión. Cada cultivo se pinta distinto en el mapa (matas pequeñas mientras no produce). Las partidas guardadas conservan todo: los cafetales pasan a ser fincas de café y los cultivos, fincas de pancoger. Robots: siembran comida (pancoger) y café para la misión de la empresaria. Difícil se ajustó de 1,28 a 1,22 en los golpes. Resultados: Normal 49% (regímenes entre 42% y 52%), Difícil 28%, Fácil 89% |
| 2. Precios y canasta agrícola | Publicado (0.58.0). Cada cultivo tiene su precio (`mercado` en `cultivos.json`): se mueve un poco cada año y vuelve a su nivel normal, con bonanzas y crisis de varios años. Pancoger muy estable; arroz, plátano y ganadería algo variables; cacao y aguacate más volátiles y con precio que sube con los años (el aguacate desde el año 60); el café sigue su mercado de antes (bonanza, crisis y roya). El algodón tiene su auge del año 50 al 61 (precio ×1,9) y luego se desploma a 0,4, como en El Espinal. Las bonanzas y crisis de los cultivos que siembras llegan en una tarjeta al cerrar el año ("El mercado del campo"). En Hacienda, la **canasta agrícola** muestra el oro de cada cultivo, su precio y su peso; si uno pasa del 60% avisa del monocultivo (lección de Markowitz y el portafolio). Los robots siembran pancoger, así que el balance no cambia: Normal 47% |
| 3. Biomas que cambian | Publicado (0.59.0). Desde el año 50 el clima se calienta y los pisos térmicos suben cada año (`src/core/biomas.js`, `src/data/biomas.json`): unos 5 metros por año con buen ambiente y hasta el doble si el ambiente está mal (más emisiones). Con ellos se mueven los cultivos (el piso térmico de cada casilla cambia: el café rinde peor abajo y mejor arriba), el páramo se encoge (solo pierde por abajo) y el glaciar se derrite (dentro del mapa o, si no hay nieve en el territorio, el Nevado del fondo). Agua para el pueblo: +8% mientras se derrite el glaciar, −20% por todo el páramo perdido y −5% sin glaciar (mínimo 75%). El terreno se repinta con los nuevos pisos y el casquete del Nevado se encoge. Tarjetas cuando empieza el calentamiento, cuando el glaciar pierde la mitad o casi todo y cuando el páramo pierde una cuarta parte; sección «Clima del territorio» en Hacienda. Cinco dilemas del entorno en `dilemas.json` (con condiciones nuevas `subidaPisos`, `glaciarMenorQue` y `fincas`): oro bajo el páramo (con la consulta popular de Cajamarca), el café sube la montaña, el Nevado se queda sin hielo, potreros en la ladera (ganadería silvopastoril) y los guardianes del páramo; dos consecuencias nuevas. Resultados: Normal 52% (regímenes entre 44% y 52%), Difícil 28%, Fácil 92% |
| 4. Balance | Publicado (0.60.0). Los robots (estrategia equilibrada) siembran cultivos de dinero cuando les sobra comida y hay gente sin empleo, reparten entre varios (castigan el cultivo que ya pesa mucho en la canasta) y resiembran cada 4 años las fincas que perdieron su piso térmico o cuyo precio se hundió. La lección se comprueba con los robots: diversificando ganan 45% (19% de bancarrotas); con solo café, 26% (30%); con solo algodón y sin cambiar tras el desplome, 0% (52%). Golpes: Normal 1,24 (antes 1,33) y Difícil 1,24 (antes 1,22). Resultados: Normal 50-56% (República; regímenes entre 44% y 55%), Difícil 28-29%, Fácil 76%. Partidas largas en celular y computador sin errores |

## Estado de la fase 9 (vida y escena)

| Paso | Estado |
| --- | --- |
| 1. Calles en damero | Publicado (0.52.0). Herramientas **Calle** y **Quitar calles** al comienzo del panel Construir. Las calles van por los bordes de las casillas: se toca una esquina y luego otra, la ruta se traza sola (prefiere tramos rectos, esquiva la montaña y pone puente donde cruza el río) y se confirma viendo el costo. Su aspecto cambia solo con la época: camino de herradura (fundación y café; 4 de oro por tramo), calle empedrada (La Violencia; 8) y carretera (desde la modernización; 14); puente 20. Mantenimiento por tramo y año: 0,15, 0,25 y 0,4 (fila nueva en el presupuesto). Efectos: mercados, cafetales, minas, talleres y puertos junto a una calle venden 15% más; los servicios junto a una calle llegan una casilla más lejos; las casas sobre una calle evaden hasta la mitad menos; si la red llega al borde del mapa, sale el comercio a los vecinos (+3% de ingresos y +1 de relación al año); abrir calle por el bosque baja el ambiente (0,3 por tramo). Toda partida empieza con una plaza de cuatro tramos alrededor del centro (las guardadas la reciben al abrirse). Por las calles andan arrieros con mulas, chivas o camiones según la época (uno por cada seis tramos, máximo seis); la gente sigue caminando por todo el pueblo. Con calles, el pueblo ya no dibuja los caminitos automáticos entre obras. Robots: la estrategia equilibrada abre calles desde el centro hasta las obras cercanas. Resultados: Normal 51% (regímenes entre 43% y 52%), Difícil 26%, Fácil 90%; partida de 64 años en el navegador sin errores |
| 2. Movimiento de la gente | Publicado (0.53.0). La gente camina por una rejilla de medias casillas (centros, bordes y esquinas) y prefiere las calles; el río solo se cruza por los puentes de las calles; dobla las esquinas en curva y arranca suave. Se queda más tiempo donde llega (mercado 25 a 45 segundos, trabajo 16 a 32, plaza 12 a 26), así que en un momento dado camina cerca de un tercio. Quietos con sentido: corrillos de conversación en hasta tres casillas libres junto a la plaza (miran al centro y gesticulan), vendedores en su puesto fijo del mercado mirando a la calle, niños jugando en ronda y campesinos que trabajan la tierra. Quien aparece en el mapa ya está en su lugar (no sale todo el pueblo a caminar a la vez). Partida larga en celular sin errores |
| 3. Eventos de cine | Publicado (0.54.0). Antes de la tarjeta de un suceso grande, una escena de unos 4 segundos: la cámara viaja al lugar y se acerca, bajan franjas de cine con un texto (en `src/data/cine.json`, editable) y la interfaz se esconde. Escenas: marcha de un movimiento movilizado hacia la plaza con pancartas (la campesina, encabezada por Saúl Tique, el líder pijao, si ya llegó); procesión con velas cuando llega el padre Anselmo; escándalo de prensa (el pueblo se agolpa y vuelan periódicos), por la consecuencia del soborno o cuando el periodista lo publica; caravana de desplazados por el conflicto (cada 6 años como mucho); toma armada (humo, fogonazos y gente que huye); terremoto (la cámara tiembla y se levanta polvo); lahar del Nevado (lodo gris que baja por el río y ceniza); avenida torrencial (lodo que baja de la ladera). Se salta con un toque, Esc, Enter o la barra espaciadora; con "reducir movimiento" no hay escena. Solo muestran lo que ya pasó: no cambian el balance ni las reglas de crisis. También se corrigió el tamaño de la multitud de la plaza en celulares |
| 4. Guerra con otra polis | Publicado (0.55.0). Con las tres polis vecinas, desde Ciudad (`src/core/guerra.js`, `src/data/guerra.json`). Si la relación con un vecino se queda hostil (25 o menos), sube una tensión de 0 a 100: en 35 hay un incidente en la frontera, en 60 acampan sus tropas en el borde (carpas, bandera, fogata y soldados en el mapa) y en 100 estalla la guerra (crisis mayor, respeta el respiro). Respuestas: negociar, pedir mediación a un aliado, fortificar la frontera o lanzar un ultimátum; el jugador también puede declarar la guerra con cuartel, contra un vecino hostil o que ocupe sus tierras (−8 de legitimidad, −4 si es preventiva, nada si es para recuperar lo propio: la guerra justa). Cada año de guerra (hasta 3): asedio con oro, 2% de habitantes, comida y ánimo, comercio cortado y obras dañadas cerca del borde; el frente se mueve según tu fuerza (Ejército, legitimidad, aliados, fortificación) contra la del vecino. Quien pierde el frente ve ocupadas 3 casillas de su borde (no rinden ni se construye en ellas; se ven con el color y la bandera del vecino) hasta recuperarlas ganando una guerra, con la paz justa o negociando con buenas relaciones. Tratados: paz justa, paz impuesta (tributo, revancha), armisticio, o aceptar sus condiciones o resistir si perdiste; dejan una placa en el mapa. Escenas de cine del asedio y de la firma de la paz. Robots: la estrategia equilibrada negocia y nunca declara; no vive guerras porque cuida a los vecinos (la guerra es rara y evitable, como pidió Juan). Resultados: Normal 52% (regímenes entre 43% y 52%), Difícil 26%, Fácil 88%. Se corrigió además un error antiguo: tras las tarjetas de recesión y de pronóstico de El Niño o La Niña se saltaban las demás tarjetas del año |
| 5. Revisión final | Publicado (0.56.0). Animales, piedras y troncos quemados repintados con el pincel del fresco (`src/arte/fauna.js`: vacas blancas orejinegras, gallinas, perros, garzas, loros, pájaros), con las mismas medidas en el mapa; ya no queda arte del estilo viejo. Los 161 emojis de los textos (unos 400 usos) se tiñen con los pigmentos del fresco (sepia y ocre) en toda la interfaz, sin perder su significado; pintarlos uno por uno queda como posible mejora. En celular los recursos de arriba caben en una sola fila (el precio de la comida queda en su ficha). Rendimiento: con 150 pobladores, tráfico y animales, el juego usa menos de 1 ms por cuadro (de 16 disponibles); memoria de la página cerca de 100 MB. Partidas largas en celular y computador sin errores |

## Estado de la fase 8 (el fresco)

| Paso | Estado |
| --- | --- |
| 1. Prueba de estilo | Aprobada por Juan (4 de octubre): **variante A, muro de cal** (paneles claros con bordes rojo pompeyano). Muestra en `pruebas/fresco.html` |
| 2. Interfaz | Publicado (0.47.0). Variante A (muro de cal): paneles, fichas, tarjetas y barra inferior con textura de muro y bordes rojo pompeyano; greca en las tarjetas y sobre la barra inferior; títulos en versalitas; íconos pintados al fresco en recursos, medidores y barra inferior (`src/arte/iconos.js`); recursos en una sola fila en celular; los ocho botones de la derecha agrupados en un menú (en computador quedan a la vista); el ícono grande de cada tarjeta va en un medallón. Pendiente para pasos siguientes: retratos de personajes, viñetas de los dilemas y los emojis dentro de los textos |
| 3. Pobladores | Publicado (0.48.0). Pobladores del mapa con las figuras nuevas al fresco (`src/arte/gente.js`), con ropa moderna desde la época del ladrillo. Retratos de las voces del pueblo y de los personajes al estilo de El Fayum: tondo con aro rojo y ocre, rostro de tres cuartos y ojos almendrados. Viñetas de los dilemas con fondo de fresco, gente y árboles nuevos (los edificios cambian en el paso 5) |
| 4. Naturaleza | Publicado (0.49.0). Las plantas del mapa son las del fresco (`src/arte/flora.js`): árbol de copa, samán, arbusto, árbol de niebla, palma de cera, guadua, plátano y frailejón, más pequeñas y estilizadas. Densidad reducida a cerca de la mitad en cada entorno (galería, seco, potrero, ladera, niebla, páramo) y en el bosque que vuelve. Parques ordenados: fuente al centro, dos árboles a los lados y dos setos. Los animales, piedras y troncos quemados siguen como estaban |
| 5. Obras | Publicado (0.50.0). Todas las obras y huellas se pintan con los pinceles del fresco (color plano, manchas de muro y contorno siena) conservando su forma; zócalos de las casas en los pigmentos del fresco. Edificios públicos neoclásicos (podio con gradas, columnas, friso de color, frontón con emblema): escuela (ocre, campana), hospital (azul, cruz), biblioteca (verde, libro), teatro (rojo, máscara), policía (azul, estrella), banco (ocre, moneda), universidad (rojo, libro y cúpula) y las sedes de la república (azul, balanza), la monarquía (violeta, corona y cúpula), la aristocracia (verde, laurel) y la oligarquía (ocre, moneda); la tiranía y la demagogia conservan su forma propia |
| 6. Terreno e inicio | Publicado (0.51.0). Portada nueva al fresco (`src/arte/portada.js`): Nevado del Ruiz con su fumarola, cordillera en tres capas, ladera cafetera, valle con parcelas, río y un pueblo con ágora de columnas; título en siena y subtítulo en rojo pompeyano. Terreno en colores de pigmento (tierra verde, ocres, azul egipcio, cal) con textura de muro en vez del grano de papel; río en azul egipcio con orilla de arena y filo siena; arrozales en tierra verde con bordes casi invisibles (sin el efecto de cuadrícula); la montaña se pinta con subdivisiones más finas (sin mosaico en el nevado) y el fondo con más resolución; nevado del fondo con contorno siena |
| 7. Revisión | Hecha dentro de la revisión final de la fase 9 (0.56.0) |

## Estado de la fase 7 (un siglo de historia)

| Paso | Estado |
| --- | --- |
| 1. El ritmo del siglo | Publicado (0.42.0). Etapas con habitantes y año mínimo: Pueblo 55 habitantes desde el año 12, Ciudad 130 desde el 40 y Polis 220 desde el 68 (más los requisitos de antes). La población crece la mitad de rápido (9% en vez de 18% por año). Ganar exige sostener la Polis 20 años en Fácil, 25 en Normal y 30 en Difícil; los otros cuatro caminos se abren desde Polis. Calendario: personajes de a uno, con 7 años entre llegadas (periodista desde el año 13, líder 20, comandante 22, párroco 27 y empresaria 34; la vulcanóloga llega con la alerta del volcán); una sola misión a la vez, con 3 años de respiro y plazos 50% más largos. Inventos por época: imprenta desde el año 22, telégrafo 36, electricidad 50, radio 62, internet 80 y automatización 96. Sucesos desde el año 10, terremotos desde el 18, volcán desde el 28 y conflicto armado desde el 35. Los años tranquilos pasan más rápido y los avisos de los personajes se muestran de a tres como mucho. Para compensar los años de más, los eventos malos pegan un poco menos fuerte en Normal (1,55 en vez de 1,6). Robots: Pueblo hacia el año 18, Ciudad 42, Polis 69; ninguna victoria antes del año 92 (mediana 97). Normal 51%; regímenes entre 45% y 54%; Difícil 35%; Fácil 99% |
| 2. Épocas de la historia | Publicado (0.43.0). Seis épocas del Tolima según el año: fundación y tierras baldías (0), el café y los arrieros (15), La Violencia (35), modernización y migración a la ciudad (50), conflicto y acuerdos de paz (70) y era digital y cambio climático (90). Cada una llega con una tarjeta (contexto y lección) y trae 5 dilemas propios (30 en total, en `dilemas.json` con la condición `epoca`; Juan puede agregar más) y 7 consecuencias nuevas. Los dilemas de la época salen primero (55% de las veces) y cada uno una sola vez por partida; la Crónica muestra la época actual y la siguiente. Los dilemas de época son menos duros que los de antes, así que para conservar la dificultad los golpes pesan más: Normal 1,65 (antes 1,55) y Difícil 1,53 (antes 1,45). Robots: 21 dilemas de época por partida; Normal 51%, regímenes entre 46% y 54%; Difícil 38%; Fácil 99% |
| 3. Economía con ciclos | Publicado (0.44.0). Costos del gobierno (mantenimiento y administración) que suben con cada época, de ×1 a ×1,05. Café desde el año 20 (si hay cafetales; 8% por año, cada 12 años como mucho): bonanza de 3 años (precio ×1,8; ahorrar en un fondo de estabilización con 25% de interés o gastarla ya) o crisis de 4 años (precio ×0,55; crisis mayor; el fondo la paga, o se decide subsidiar o no: sin subsidio, campesinos −9 y legitimidad −3). Roya desde el año 30 (5% por año, cada 20 años como mucho): 3 años con los cafetales al 40% y campesinos −6; se previene renovando los cafetales en Hacienda (12 de oro por cafetal). Pensiones desde el año 50: reparto, ahorro individual o mixto, con un costo anual que crece con el envejecimiento; cambiar de sistema cuesta 4 de legitimidad. Jóvenes que se van a la ciudad desde el año 50 (0,8% de la población por año, menos con universidad, biblioteca o internet). Nueva sección Hacienda → Ciclos de la economía y fila de pensiones en el presupuesto. Robots: la estrategia equilibrada ahora sube los impuestos poco a poco ante un déficit (como un jugador sensato), ahorra las bonanzas, elige el sistema mixto y renueva los cafetales. Golpes: Normal 1,5 y Difícil 1,28. Resultados: Normal 47% (regímenes entre 47% y 55%), Difícil 34%, Fácil 94% |
| 4. Más desastres y clima | Publicado (0.45.0). Epidemias desde Pueblo (3% por año, cada 22 años como mucho; crisis mayor): fiebre amarilla hasta el año 40, la gran gripe hasta el 85 y pandemia después. Se pierde 10% de la población, menos 2% por hospital, 1,5% con acueducto y 3,5% con vigilancia epidemiológica (70 de oro, en Hacienda → Riesgo de desastres; mínimo 2%), más el costo de la emergencia (lo paga primero el fondo) y ánimo −6. Avenidas torrenciales desde el año 25 (3,5% por año, más con laderas taladas o erosionadas; crisis mayor): dañan obras en laderas y orillas. Sequía larga desde el año 50: El Niño puede durar un año más (25%; es la misma crisis). Cambio climático: desde el año 50, El Niño y La Niña son más probables (hasta 80% más hacia el año 100). Robots: 0,6 epidemias, 0,4 avenidas y 0,8 sequías largas por partida. Golpes: Normal 1,33. Resultados: Normal 48% (regímenes entre 44% y 56%), Difícil 28%, Fácil 91% |
| 5. Balance | Publicado (0.46.0). `balance.js` (400 partidas, estrategia equilibrada, República): Normal 50%, Difícil 26%, Fácil 88%. Regímenes en Normal: entre 44% y 56%. Victorias desde el año 92 (mediana cerca del 95). Unas 14 crisis por partida repartidas en el siglo; ninguna crisis impuesta coincide con otra ni rompe los dos años de respiro (solo una revolución, que depende del gobierno del jugador, puede caer cerca). Partida de 75 años en el navegador sin errores. Correcciones: la barra de arriba y Caminos a la victoria mostraban la meta vieja de años como Polis (6); un dilema ya resuelto no rompe la tarjeta |

## Estado de la fase 6 (conocimiento)

| Paso | Estado |
| --- | --- |
| 1. Tecnología por épocas | Publicado (0.38.0). Saber por año desde Pueblo: 1,5 de base, 1,5 por escuela, 3 por biblioteca y 6 por universidad. Seis inventos que llegan al juntar saber (y con la etapa mínima): imprenta (12), telégrafo (30), electricidad (55, Ciudad), radio (85, Ciudad), internet (120, Polis) y automatización (160, Polis). Al llegar, una tarjeta: adoptarlo libre (todo el beneficio y todo el riesgo), regulado (menos de ambos, con un costo por año) o rechazarlo; se puede cambiar después en Leyes → Tecnología. Efectos: igualdad, legitimidad, ambiente, ingresos, cosecha, inseguridad, cultura, rumbo y crecimiento de los movimientos. Cada invento adoptado deja su obra en el mapa (imprenta, postes del telégrafo, planta eléctrica, torre de radio, antena, fábrica automática). Ninguno es obligatorio para ganar. Robots: imprenta hacia el año 16, telégrafo 28, electricidad 43, radio 52, internet 65; República 49 a 53%; regímenes entre 45% y 56% |
| 2. Megaproyectos y consulta previa | Publicado (0.39.0). Desde Polis, en Hacienda: represa hidroeléctrica (600, 5 años; energía para 10 talleres, cosechas +10%, ambiente −8, desplaza familias), ferrocarril (500, 4 años; ingresos +6% y relaciones con los vecinos +10) y aeropuerto (450, 4 años; ingresos +4%, cultura, ambiente −3). Ficha financiera con inversión, cuota por año, beneficio anual, tasa de interés del momento, VPN a 25 años, TIR y años de recuperación. Consulta previa (20 de oro, un año; la aprobación depende del cabildo pijao, del ambiente y del ánimo de los campesinos): aprobada, la obra empieza con respaldo; rechazada, se puede cancelar (legitimidad +2) o seguir contra su voluntad. Empezar sin consulta: conflicto +20, legitimidad −5, cabildo −25 y movimientos campesino y ambientalista +20. La obra se paga por cuotas (se detiene sin oro) y se ve en el mapa (grúa; luego represa con embalse, estación con vía o pista con torre). También: las huellas de las decisiones ya se ven en el mapa al instante. Robots (no usan megaproyectos): República 47 a 48%; regímenes entre 44% y 56% |
| 3. El río que cambia | Publicado (0.40.0). Desde Pueblo y el año 8: en un año de La Niña (o de lahar) el río puede abrir un cauce nuevo. Probabilidad: 50% con La Niña (60% con lahar) por la parte de orilla sin vegetación natural (una orilla sin obras ni tala, o con bosque, la protege en un 85%), más hasta 50% si hay orillas erosionadas o taladas; como mucho una vez cada 15 años y cuatro cambios por partida. No es una crisis aparte: va con la de La Niña o la erupción. Las casillas que el agua ocupa pierden lo construido (legitimidad −2 por obra, hasta −8); donde corría queda una madrevieja (humedal, ambiente +2) que dura 40 años. El cambio se guarda como un desvío del cauce y el terreno en acuarela se repinta con el río nuevo. Riesgo en Hacienda → Riesgo de desastres; la ficha de cada casilla de la orilla avisa de la ronda del río. Lección: dinámica de los ríos, ronda hídrica y ordenamiento territorial. Robots: el río cambia en 18% de las partidas (1,7 obras perdidas cada vez); República 47%; regímenes entre 47% y 55% |
| 4. Balance | Publicado (0.41.0). Sin cambios de reglas: la fase 6 quedó dentro de las metas. `balance.js` (800 partidas, estrategia equilibrada, República): Normal 50%, Difícil 35%, Fácil 99%. Regímenes en Normal (800 partidas con las mismas semillas): entre 47% y 55%. Equivalencia con la v9: 0 diferencias. Partida de 45 años en el navegador (con cambio de curso del río) sin errores |

## Estado de la fase 5 (sociedad y memoria)

| Paso | Estado |
| --- | --- |
| 1. Barrios y problemáticas | Publicado (0.34.0). Desde Ciudad, las casas forman barrios según su dirección desde el centro (El Centro, La Pola, Belén, El Salado, Picaleña, Jordán, La Ribera). Cada barrio tiene cuatro problemáticas de 0 a 100: deserción escolar, trabajo infantil, violencia y brecha de género, que dependen de los servicios cercanos (escuela, hospital, policía), la pobreza, la inseguridad, la periferia, la ley de educación y los asentamientos. No son medidores nuevos: por encima de 30 pesan en la igualdad y en la inseguridad. Programas sociales por barrio (6 años): comedor y transporte escolar, cuadrante de policía y alumbrado, casa de la mujer. Asentamientos informales cuando hay mucho desempleo o falta vivienda (ranchos en la periferia; dan techo a 6 personas): legalizar y mejorar, desalojar (fuerza, acta, personajes) o ignorar. Sección Barrios en Sociedad; nombres de los barrios en la capa ◎. Robots: República 48%; regímenes entre 43% y 55%; Difícil 33% |
| 2. Cultura y deporte | Publicado (0.35.0). Cuatro edificios: cancha (Aldea, 25), biblioteca (Pueblo, 55), teatro (Ciudad, 90) y estadio (Ciudad, 170, dos años de obra). En el terreno en acuarela la «exigencia creciente» de la v9 pasa a ser la exigencia de cultura y sentido: la calman los edificios culturales (cancha 1,5; biblioteca 2; teatro 3; estadio 5) y las fiestas del pueblo (30 de oro, una vez por año, calman 4 durante dos años y llenan la plaza de banderines). Mejoran su barrio: la biblioteca baja la deserción escolar, el teatro la brecha de género y la cancha la violencia; el estadio sube un poco la inseguridad. Nuevo dilema «Pan y circo» (Juvenal), solo con estadio. Sección Cultura y deporte en Sociedad. Robots (no usan la cultura): República 47%; regímenes entre 41% y 54% |
| 3. Memoria y legado | Publicado (0.36.0). Cada huella que dejan las decisiones queda en la memoria del pueblo, por categorías: justicia, ayuda, deber, ambiente, paz (positivas) y negocios, mano dura, demandas abandonadas, patrimonio perdido (negativas). Cada 25 años llega una nueva generación: juzga lo que recuerda (legitimidad de −6 a +6) y luego olvida 60%. Las obras de más de 30 años son patrimonio (demolerlas cuesta 4 de legitimidad y queda en la memoria). Sección Legado en la Crónica (generación, próximo juicio, cómo te recordarían, patrimonio, deuda que heredaría el sucesor). Al terminar, el juicio de la historia: cómo te recordarán, crisis vividas, relevos de generación, patrimonio y la herencia al sucesor (deuda, suelo erosionado) con la lección de Hans Jonas. Robots: República 48%; regímenes entre 44% y 51% |
| 4. Evolución visual por épocas | Publicado (0.37.0). Cuatro épocas: bahareque (Aldea y Pueblo), tapia y balcón (Ciudad), ladrillo (Ciudad desde el año 50) y concreto (Polis desde el año 80). Cada época cambia las casas (nuevas casas de ladrillo y de concreto con terraza, tanque y antena) y, desde el ladrillo, la ropa de los pobladores (jean, camisa, sin ruana ni sombrero de copa; el aguadeño se queda). Tarjeta al comenzar cada época con su lección (modernización) y la época en la sección Legado. Sin efecto en el balance |
| 5. Balance | Cerrado (0.37.0, sin cambios de lógica). Robots, estrategia equilibrada, 800 partidas por régimen: República 48%, Plutocracia 40%, Dictadura 47%, Monarquía 52%, Populismo 53%, Aristocracia 54% (14 puntos de diferencia). balance.js: Fácil 100%, Normal 48%, Difícil 33%. Equivalencia con la v9: 0 diferencias. Partida de 45 años en el navegador sin errores |

## Ideas propuestas (primera ronda)

| # | Idea | Concepto que enseña | Cómo se ve |
| --- | --- | --- | --- |
| 1 | Costo de vida por escasez | Inflación de oferta: un Estado rico con un pueblo que no alcanza a comprar | Precio de la comida en la barra superior; mercados vacíos |
| 2 | Cuarta facción: el Ejército | Relaciones cívico-militares, golpe de Estado | Un cuarto personaje con voz; cuartel en el mapa |
| 3 | Legitimidad del uso de la fuerza | Weber: el Estado como monopolio de la violencia legítima | Reprimir con baja legitimidad provoca sabotaje |
| 4 | Materiales baratos o de calidad | Riesgo, mantenimiento diferido, valor presente frente a futuro | Edificios baratos se agrietan y pueden colapsar años después |
| 5 | Acta fundacional | Contrato social, coherencia entre principios y actos | Pantalla inicial de principios; contradecirlos castiga la legitimidad |
| 6 | Factor del absurdo | Camus: la alienación cuando las necesidades básicas están cubiertas | Teatro, biblioteca y monumentos; productividad que cae sin causa económica |
| 7 | Oficinas de recaudo con radio | Evasión fiscal y capacidad del Estado | Se conserva el impuesto por clase; fuera del radio de una oficina hay evasión |

Corrección de diseño: la élite nunca "financia huelgas"; responde con cierre patronal, fuga de capitales o financiando a la oposición.

## Construcción a fondo

Cada obra es un proyecto con financiación, tiempo, riesgo y consecuencias sociales. Las marcadas con ★ son prioritarias.

### La obra como proyecto financiero

| Idea | Qué enseña | Cómo se juega |
| --- | --- | --- |
| ★ Obras por etapas y elefantes blancos | Flujo de caja, cronograma de inversión | Las obras grandes tardan 1 a 3 años (cimientos, estructura, acabados) y se pagan por etapa. Sin dinero a mitad de camino, la obra queda inconclusa en el mapa. |
| ★ Evaluación de proyectos | VPN, TIR, periodo de recuperación | Antes de una obra grande aparece su ficha: inversión, ingresos esperados, VPN y beneficio social. |
| ★ Depreciación y mantenimiento | Vida útil, depreciación, mantenimiento diferido | Cada edificio pierde estado cada año; sin mantenimiento se agrieta y al final exige reconstruir. |
| Formas de financiar | Crédito, bonos de obra, alianzas público-privadas, valorización | Pagar de contado, crédito, bono de obra, concesión privada (cobra peaje por años) o valorización a vecinos beneficiados. |
| ★ Licitación y contratistas | Contratación pública, sobrecostos, corrupción | Tres ofertas con precio, plazo y reputación; una trae soborno, y aceptarlo tuerce el rumbo. |
| Empleo en la obra | Gasto público contracíclico (Keynes) | Mientras se construye, la obra emplea gente. |

### La obra en el territorio

| Idea | Qué enseña | Cómo se juega |
| --- | --- | --- |
| ★ Cobertura por distancia | Accesibilidad, equidad territorial | Escuelas, hospitales y mercados atienden un radio, no todo el territorio. |
| Vías que construyes tú | Infraestructura y conectividad | Caminos, puentes y carreteras; lo desconectado rinde menos. |
| Usos del suelo | Plan de ordenamiento territorial | Zonas residencial, comercial, industrial y rural; puede ser una ley. |
| Sinergias entre vecinos | Economías de aglomeración | Mercado rodeado de casas vende más; un parque valoriza las casas cercanas. |
| Mejoras por niveles | Densificación urbana | Casa → casa de dos pisos → edificio; escuela → colegio. |
| Riesgo y gestión del desastre | Gestión del riesgo, prevención | Ladera: deslizamientos; río: inundaciones; volcán: avalanchas. Armero (1985) como referencia histórica. |

### La obra como decisión política

| Idea | Qué enseña | Cómo se juega |
| --- | --- | --- |
| Consulta previa y participación | Participación ciudadana, derechos de comunidades | Minas, puertos y megaproyectos exigen consultar; saltarse la consulta dispara el conflicto. |
| Megaproyectos | Impacto social y ambiental a gran escala | Represa, ferrocarril o aeropuerto: años de obra, gran beneficio, familias desplazadas. |
| Obras de vanidad e inauguraciones | Populismo, propaganda | Suben la confianza a corto plazo. |
| Patrimonio frente a desarrollo | Identidad, memoria, costo de oportunidad | Proteger o demoler lo antiguo. |
| Autoconstrucción y legalización | Informalidad urbana, titulación | Desalojar, ignorar o legalizar y mejorar el barrio. |

## Mundo visual

Regla: cada edificio muestra lo que está pasando; el jugador entiende el pueblo mirándolo.

| Idea | Qué se ve en el mapa |
| --- | --- |
| Estado del edificio | Nuevo, gastado, agrietado o abandonado |
| Actividad real | Luces de noche; humo solo si el taller tiene trabajadores |
| Función visible | Compradores en el mercado, niños en la escuela, fila en el hospital lleno, cultivos de siembra a cosecha |
| Obra en marcha | Andamios, trabajadores y material que avanzan por etapas |
| Clase social en las casas | Casonas con jardín, casas de dos pisos, casas pequeñas de bahareque |
| Arquitectura por etapa | Bahareque, tapia, ladrillo, estilo republicano |
| Huella del régimen | Palacio y mansiones en monarquía; muros, retenes y estatuas en dictadura; plazas y periódicos en república |
| Terreno y producción | Café en ladera, arroz en llanura junto al río, ganado en zonas planas secas |
| Ánimo en las calles | Plazas llenas, protestas o calles vacías |
| Capas de información | Lentes de cobertura, contaminación, riesgo y valor del suelo |

## Escenarios y pobladores

La prueba de estilo (`referencia/referencia-estilo-acuarela.html`) ya resuelve la forma del relieve, los entornos y los pobladores. Es la referencia visual aprobada.

### Forma del relieve

- Terreno continuo con luz (malla de alturas), nunca casillas con paredes ni conos repetidos.
- Montañas con volumen, varias crestas, roca en pendientes fuertes y nieve solo en la cumbre.
- Formas variadas: colinas, mesetas, cañones con quebrada, cerros aislados, valles y humedales.
- Curvas de nivel suaves que ayudan a leer la altura.

### Diversidad de entornos (pisos térmicos del Tolima)

| Entorno | Dónde aparece | Qué se ve |
| --- | --- | --- |
| Bosque seco tropical | Valle bajo y cálido | Samanes de copa ancha, suelo dorado |
| Llanura arrocera | Valle plano junto al río | Arrozales inundados, garzas |
| Bosque de galería | Orillas de ríos | Franja verde densa que sigue el agua |
| Ladera cafetera | Montaña media | Cafetales, guadua, plátano, palma de cera, bahareque |
| Bosque de niebla | Montaña alta y húmeda | Árboles con musgo, niebla que se mueve |
| Páramo | Por encima del bosque | Frailejones, lagunas, pasto amarillo |
| Nevado | Cumbre | Roca y nieve que retrocede con los años |

### Pobladores con identidad

- Proporciones tipo juguete: cabeza grande, torso con volumen, piernas que caminan, sombra en los pies.
- Silueta por clase: campesino con aguadeño y ruana; campesina con pañoleta y falda; artesano con delantal y gorra; élite con traje, sombrero de copa y bastón; soldados con uniforme; niños.
- Variedad de colores dentro de cada grupo; cuatro posturas al caminar.
- Rutinas: casa → trabajo → plaza → casa. Fichas con nombre, edad, oficio y lo que piensa.
- Máximo unos 150 pobladores animados en celular; cada figura representa a varios habitantes.

### Vida en el paisaje

- Luz del día (mañana, tarde, noche con ventanas encendidas) y temporadas (lluvias, sequía).
- Animales: vacas, garzas, gallinas, perros, loros.
- Más detalle al acercarse.

## Evolución visual

### Un territorio que crece por veredas

- **Tamaño objetivo:** 64×64 casillas.
- **Crecimiento por veredas:** se empieza en una zona pequeña y se incorporan veredas vecinas.
- **Pintura por sectores:** solo se repinta el bloque que cambia.

### Pobladores que cambian

| Causa | Cómo cambia la ropa |
| --- | --- |
| Época | Ruana y aguadeño; paño y fieltro; overol; jean y tenis. Los mayores conservan la ropa antigua. |
| Riqueza | Remendada y apagada con pobreza; nueva y colorida con bonanza |
| Clima | Más ruanas en lluvias |
| Régimen | Uniformes en dictadura, trajes en plutocracia, consignas en populismo |
| Oficios nuevos | Escolares, enfermeras, maquinistas |

### Arquitectura y arte que evolucionan

- Viviendas: bahareque → tapia con teja → ladrillo republicano → concreto.
- Centro histórico: conservar o demoler.
- La plaza madura: tierra → empedrada → parque con kiosco → plazoleta moderna.
- Arte público según el régimen: estatuas del líder, murales comunitarios, escudos.
- Caminos: trocha → empedrado → destapada → pavimentada.

### Decisiones que se ven

| Decisión | Lo que aparece en el mapa |
| --- | --- |
| Talar el bosque | Laderas peladas, erosión y derrumbes |
| Ley de protección ambiental | Árboles que vuelven a crecer |
| Descuidar el mantenimiento | Casas agrietadas y techos rotos |
| Obra sin terminar | Esqueleto abandonado |
| Segregación | Tugurios en los bordes, casonas en el centro |
| Represión | Retenes, soldados, calles vacías |
| Educación gratuita | Niños de uniforme camino a la escuela |
| Festival o torneo | Banderines, plaza llena |
| Corrupción | Edificios públicos descuidados, obras de vanidad |
| Bonanza cafetera | Casas pintadas, más comercio y vehículos |

## Clima y territorio vivo

| Ciclo | Qué pasa | Cómo se ve |
| --- | --- | --- |
| Temporadas | Dos de lluvia y dos secas al año | Verde intenso o dorado; niebla en las mañanas |
| El Niño | Sequía cada pocos años: río bajo, menos energía, cosechas perdidas, incendios | Tierra agrietada, río angosto, humo |
| La Niña | Crecidas, inundaciones y deslizamientos; llanuras más fértiles después | Río desbordado, laderas derrumbadas |
| Retroceso del nevado | Menos agua a largo plazo | La nieve se encoge |

Geografía que se transforma: el río puede cambiar de curso (fase final), erosión en laderas sin bosque, bosque que crece o se quema, volcán como evento raro (fase final).

Lo que enseña: ciclos naturales frente a impacto humano, gestión del riesgo, finanzas para la incertidumbre (fondo de emergencias, seguros agrícolas).

## Economía, sociedad y tecnología

- **Economía viva:** precios por oferta y demanda, costo de vida, exportación de café con precio internacional variable, auge y recesión, competencia y monopolio, salarios.
- **Sectores:** primario (cultivos, café, arroz, ganado, mina), secundario (talleres, fábricas), terciario (mercado, banco, puerto, turismo), conocimiento (universidad, medios), informal (vendedores ambulantes).
- **Cultura y deporte:** fiestas, identidad, medios; cancha, estadio, torneos; dilema de "pan y circo" (Juvenal).
- **Movimientos sociales:** sindicato, ambientalistas, estudiantes, campesinos; crecen si se les ignora, se moderan si se les escucha; líderes con nombre; formas de presión: protesta, huelga, paro, bloqueo, desobediencia civil.
- **Problemáticas sociales por barrio:** violencia, deserción escolar, trabajo infantil, brechas de género.
- **Tecnología por épocas:**

| Época | Beneficio | Dilema |
| --- | --- | --- |
| Imprenta | Más alfabetización | Más crítica al gobierno |
| Telégrafo | Noticias rápidas, mejor comercio | Rumores igual de rápidos |
| Electricidad | Fábricas, luz de noche | Contaminación, dependencia energética |
| Radio | Unión e identidad | Propaganda |
| Internet | Educación y comercio a distancia | Desinformación |
| Automatización | Mucha más producción | Menos empleo |

## Balance general

Todo lo ideado cabe en 16 sistemas conectados por siete ejes; ninguna idea se conecta directamente con otra.

### Los siete ejes

- **Agua:** río, lluvias, nevado, acueductos, energía.
- **Suelo:** fertilidad, bosque, erosión, riesgo, valor de la tierra.
- **Dinero:** tesoro, deuda, precios, salarios, comercio.
- **Gente:** clases sociales, empleo, vivienda, ánimo.
- **Legitimidad:** apoyo al gobierno, uso de la fuerza, rumbo, régimen.
- **Memoria:** lo que el pueblo recuerda, generaciones, legado.
- **Conocimiento:** investigación y tecnología.

### Los 16 sistemas

| Sistema | Reúne | Usa → mueve |
| --- | --- | --- |
| Hacienda | Impuestos por clase, deuda, bonos, inflación, calificación, fondo de emergencias | Dinero → Gente, Legitimidad |
| Economía viva | Precios, costo de vida, comercio exterior, auge y recesión, competencia, salarios, informalidad, turismo | Agua, Suelo, Conocimiento → Dinero, Gente |
| Obras | Etapas, licitación, formas de pago, empleo en la obra | Dinero → Gente, Legitimidad |
| Vida de los edificios | Materiales, mantenimiento, depreciación, deterioro visible | Dinero, Legitimidad → Gente |
| Cobertura | Radios de escuelas, hospitales, mercados y recaudo; vías; sinergias | Suelo → Gente, Dinero |
| Clima | Temporadas, El Niño, La Niña, pronósticos | ciclo natural → Agua, Suelo |
| Suelo vivo | Bosque, erosión, fertilidad, riesgo, reforestación | Agua, Dinero → Suelo |
| Agua y energía | Acueducto, molino, embalse, retroceso del nevado | Agua, Conocimiento → Gente, Dinero |
| Clases y facciones | Campesinos, artesanos, élite y Ejército, con voz | Dinero, Suelo → Legitimidad |
| Barrios y problemáticas | Vivienda por clase, segregación, asentamientos, desplazados, problemáticas por barrio | Gente, Suelo → Legitimidad |
| Poder | Régimen, rumbo, leyes, políticas medibles, acta fundacional, uso de la fuerza | Gente → Legitimidad |
| Movimientos sociales | Movimientos y formas de presión | Gente → Legitimidad, Dinero |
| Cultura y deporte | Absurdo, fiestas, medios, teatro, biblioteca, monumentos, cancha, estadio | Gente → Gente, Memoria |
| Conocimiento y tecnología | Investigación y épocas tecnológicas | Dinero → Conocimiento → todos |
| Memoria y legado | Generaciones, sucesor, juicio de la historia, árbol de causas | todos → Memoria |
| Megaproyectos | Represa, ferrocarril, VPN y TIR, consulta previa | Dinero, Suelo → todos |

### Fusiones clave

- El costo de vida vive dentro de la economía viva.
- **Confianza pasa a llamarse Legitimidad**; el uso de la fuerza se paga con ella.
- Materiales, mantenimiento, depreciación y deterioro son un solo sistema.
- El absurdo, la cultura y el deporte son un solo sistema; el absurdo reemplaza la "exigencia creciente" de la versión 9.
- Las oficinas de recaudo usan los mismos radios que escuelas y hospitales.
- Las problemáticas sociales se ven por barrio, no como medidores nuevos.
- Los actos disruptivos son formas de presión de los movimientos sociales.
- Los medios de comunicación avanzan con la tecnología.

### Lo que pasa a ser dilema

Agua compartida río abajo, reubicar o reconstruir, saberes tradicionales, especulación con la sequía, ayuda externa con condiciones, culpar al clima, patrimonio frente a desarrollo, obras de vanidad, semillas resistentes o productivas, ganadería o bosque, pan y circo, formalizar o perseguir la informalidad, y los dilemas de cada época tecnológica. Otros dilemas para debatir: fondo de emergencias en año electoral, generaciones que olvidan, el sucesor que hereda tus deudas (Hans Jonas).

### Lo que se aplaza

El río que cambia de curso, el volcán, el modo aula y guardado en la nube (trabajo paralelo) y la campaña por capítulos.

### Orden de aparición

Nunca más de tres sistemas con decisiones al mismo tiempo. Clima y suelo vivo funcionan solos desde el inicio.

| Momento | Sistemas que se abren |
| --- | --- |
| Inicio (Aldea) | Obras simples, clases, régimen y acta fundacional |
| Aldea con 25 habitantes | Vida de los edificios, cultura y deporte (cancha y fiestas) |
| Pueblo (40 habitantes) | Hacienda completa, agua y energía, cobertura |
| Pueblo con 60 habitantes | Economía viva, movimientos sociales; empiezan El Niño y La Niña |
| Primera escuela | Conocimiento y tecnología (la imprenta) |
| Ciudad (80 habitantes) | Obras completas, el Ejército, barrios y problemáticas |
| Ciudad con 120 habitantes | Memoria y legado |
| Polis | Megaproyectos y juicio de la historia |

### Reglas contra el castigo en cadena

1. Máximo una crisis mayor por año (desastre climático, recesión, paro o revolución).
2. Dos años de respiro después de una crisis mayor.
3. Toda crisis tiene preparación posible.

### Metas de balance

| Meta | Valor esperado |
| --- | --- |
| Duración de una partida ganada en Normal | Exigente: unos 45 a 55 años (decisión de Juan tras la fase 1; antes 30 a 40) |
| Victorias de un jugador competente en Normal | Alrededor de 50% (45% a 55%), decisión de Juan del 2 de octubre tras la fase 3; antes 55% a 70% |
| Diferencia entre regímenes | máximo 15 puntos (fase 3: 9 puntos) |
| Diferencia entre perfiles éticos | máximo 15 puntos |
| Tecnología | ninguna época obligatoria para ganar |
| Movimientos sociales | ninguno termina la partida por sí solo |
| Desastres naturales | siempre sobrevivibles con preparación |
| Estrategia dominante | ninguna |
| Medidores visibles | máximo 5 (bienestar, igualdad, legitimidad, ambiente, rumbo) |
| Recursos en la barra superior | máximo 4 a la vez |

## Arquitectura técnica objetivo

- Repositorio en GitHub, publicado con GitHub Pages, sin paso de compilación.
- Motor Phaser (licencia MIT) incluido como archivo en `vendor/` para que funcione sin internet.
- La lógica del juego vive aparte de los gráficos (sin DOM ni Phaser), para que las simulaciones de balance la prueben con Node.
- Contenido (dilemas, leyes, edificios, personajes) en archivos de datos JSON.
- Orden por profundidad para que ningún poblador aparezca encima de un techo.
- Arte en acuarela horneado a texturas una vez; pintura del terreno por sectores.
- Funciona igual de bien en celular y en computador; se puede instalar como app en ambos (PWA) y funciona sin internet.
- Guardado con número de versión y migraciones, para que las partidas sobrevivan a las actualizaciones.

## Plan por fases

La fase 0 no agrega sistemas nuevos: muda el juego a la nueva base hasta que juegue igual o mejor que la versión 9, con el estilo visual aprobado. Cada fase cierra solo si pasan las simulaciones de balance y las metas del balance general.

| Fase | Contenido |
| --- | --- |
| 0: Migración | Repositorio y Phaser; lógica separada en módulos; terreno y pobladores con el estilo de la prueba de acuarela; igualar la versión 9 |
| 1: Territorio vivo | Temporadas, El Niño y La Niña; suelo vivo y erosión; vida de los edificios. Decisiones de Juan: las temporadas también afectan las cosechas; la preparación ante El Niño y La Niña es un pronóstico un año antes más un fondo de emergencias en Hacienda; el mantenimiento se decide con un control de 0% a 100% en Hacienda |
| 2: Economía y obra | Economía viva y costo de vida; cobertura por radios; obras por etapas y licitación. Decisiones de Juan: por etapas solo las obras grandes; el costo de vida se ve en la pastilla del alimento y en el mercado; las oficinas de recaudo entran con la cobertura |
| 3: Poder | Ejército y legitimidad; movimientos sociales; acta fundacional; corregir balance de regímenes. Decisiones de Juan: clases ampliadas primero, vistas como tres grandes con subgrupos (con tierra y sin tierra; obreros, comerciantes y funcionarios; terratenientes y financistas; estudiantes e informales); el perfil realista se deja como está, como lección |
| 4: Riesgo y mundo | Pedida por Juan tras probar la fase 3. Exigencia (menos eventos buenos, riesgo, ventaja por régimen); sucesos sin decisión y Policía; personajes con papel; decisiones que se ven; desastres reales del Tolima (Nevado del Ruiz); conflicto armado y desplazamiento; relaciones con otras polis; otras formas de ganar y efecto propio por edificio. Sin flechas ni avisos en las opciones de los eventos |
| 5: Sociedad y memoria | Barrios y problemáticas; cultura y deporte; memoria y legado; evolución visual por épocas |
| 6: Conocimiento | Tecnología por épocas; megaproyectos; río que cambia (el volcán pasa a la fase 4); aula y nube en paralelo |
| 7: Un siglo de historia | Pedida por Juan: partidas de unos 100 años para ganar, sin bajar la dificultad. Ritmo del siglo (etapas largas, calendario de llegada, una misión a la vez); épocas de la historia del Tolima con dilemas propios; economía con ciclos; más desastres y clima; balance |
| 8: El fresco | Cambio visual completo con un solo estilo: fresco pompeyano con el Tolima neoclásico (decisión de Juan, 4 de octubre; reemplaza la acuarela). Pobladores rehechos, árboles menos y más pequeños, obras neoclásicas y de bahareque, interfaz con greca e íconos pintados |
| 9: Vida y escena | Aprobada por Juan: caminos en damero con arrieros, chivas y camiones (y sus efectos: comercio, servicios, recaudo, vecinos); pulir el movimiento de la gente; eventos de cine (movimientos y personajes, conflicto armado visible, desastres en escena); guerra con otra polis; revisión final |
| Después | Pendientes: relevo de generaciones y legado (a Juan le encantó); gobierno nacional y comunidad internacional (tras su prueba); campaña por capítulos (no prioritaria). Descartado: modo aula |
