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
| 3. Personajes con papel propio | Pendiente |
| 4. Decisiones que se ven | Pendiente |
| 5. Desastres reales del Tolima | Pendiente |
| 6. Conflicto armado y desplazamiento | Pendiente |
| 7. Relaciones con otras polis | Pendiente |
| 8. Otras formas de ganar y efecto por edificio | Pendiente |

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
