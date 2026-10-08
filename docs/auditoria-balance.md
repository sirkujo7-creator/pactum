# Auditoría de balance

Generado con `node herramientas/auditoria.js` (2 partidas de la estrategia equilibrada, República, años 20, 45, 70). No cambia el juego.

## Parte A. Rentabilidad de cada edificio

Mide lo que cambia **al construir uno más hoy**: `Ganancia` = oro por año después de mantenimiento; `Retorno` = años para recuperar el costo (costo ÷ ganancia); `Empleos` = puestos que crea; `Comida` = comida por año. Valores medianos de las partidas medidas. Retorno «—» = nunca se paga solo con oro (puede dar servicio, ánimo o legitimidad).

### Hacia el año 45

| Edificio | Costo | Ganancia/año | Retorno (años) | Empleos | Comida | Partidas |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| finca:cacao | 112 | 50 | 2.2 | 6 | 0 | 2 |
| puerto | 250 | 95 | 2.6 | 5 | 0 | 2 |
| finca:algodon | 101 | 37 | 2.7 | 7 | 0 | 2 |
| mercado | 136 | 46 | 3 | 5 | 0 | 2 |
| fábrica:fundicion | 233 | 72 | 3.2 | 10 | 0 | 2 |
| fábrica:chocolate | 233 | 62 | 3.8 | 9 | 0 | 2 |
| fábrica:textiles | 233 | 59 | 3.9 | 12 | 0 | 2 |
| fábrica:trilladora | 233 | 58 | 4 | 9 | 0 | 2 |
| mina | 273 | 62 | 4.4 | 10 | -2 | 2 |
| fábrica:molino | 233 | 52 | 4.5 | 8 | 0 | 2 |
| finca:cafe | 117 | 26 | 4.5 | 6 | 0 | 2 |
| finca:ganaderia | 106 | 22 | 4.8 | 2 | 10 | 2 |
| fábrica:artesanias | 233 | 45 | 5.2 | 9 | 0 | 2 |
| finca:platano | 91 | 16 | 5.7 | 5 | 12 | 2 |
| banco | 455 | 46 | 9.9 | 2 | 0 | 2 |
| finca:aguacate | 127 | 12 | 10.5 | 4 | 2 | 2 |
| finca:arroz | 96 | 7 | 13.7 | 6 | 17 | 2 |
| universidad | 568 | 24 | 23.7 | 5 | 0 | 2 |
| finca:pancoger | 86 | 3 | 28.5 | 7 | 17 | 2 |
| cantera | 68 | 2 | 34 | 2 | 0 | 2 |
| casa | 68 | -10 | — | 0 | 0 | 2 |
| parque | 68 | -5 | — | 0 | 0 | 2 |
| cancha | 57 | -2 | — | 0 | 0 | 2 |
| cementerio | 80 | -2 | — | 0 | 0 | 2 |
| aserradero | 57 | 0 | — | 1 | 0 | 2 |
| escuela | 182 | -14 | — | 3 | 0 | 2 |
| biblioteca | 125 | -4 | — | 2 | 0 | 2 |
| hospital | 227 | -19 | — | 3 | 0 | 2 |
| agora | 341 | -93 | — | 1 | 0 | 2 |
| cuartel | 273 | -47 | — | 4 | 0 | 2 |
| acueducto | 159 | -6 | — | 2 | 0 | 2 |
| recaudo | 114 | -4 | — | 2 | 0 | 2 |
| policia | 136 | -3 | — | 3 | 0 | 2 |
| molino | 182 | -4 | — | 2 | 0 | 2 |
| teatro | 205 | -3 | — | 3 | 0 | 2 |
| estadio | 386 | -11 | — | 4 | 0 | 2 |
| estudio | 91 | -5 | — | 0 | 0 | 2 |

### Fincas contra fábricas (todas las épocas medidas)

- Mejor finca: **cacao**, se paga en 3.2 años (50 de oro por año).
- Peor finca: pancoger, se paga en 27.8 años.
- Mejor fábrica: **fundicion**, se paga en 3.8 años (72 de oro por año).
- Peor fábrica: artesanias, se paga en 6.5 años.
- Fábricas que dan ganancia: 6 de 6 productos.

## Parte B. Peso de las decisiones

Pesos usados (puntos por unidad): oro 0.083, alimento 0.067, habitantes 1, ánimo 1, campesinos 0.5, artesanos 0.5, élite 0.5, igualdad 1, legitimidad 1, ambiente 1, deuda -0.083, inflación -0.3, tierra 0.5. Cada opción suma su efecto inmediato, su riesgo (por su probabilidad) y su consecuencia diferida.

- Decisiones: 83; opciones: 241. Promedio de una opción: -1.3 puntos (desviación 7.6).

| Etapa | Decisiones | Promedio de la opción | Mejor opción | Peor opción |
| --- | ---: | ---: | ---: | ---: |
| 0 | 41 | -2.2 | 15.6 | -30.6 |
| 1 | 30 | -0.5 | 15 | -27.8 |
| 2 | 10 | -0.9 | 9 | -29.5 |
| 3 | 2 | 1.9 | 8.8 | -4.5 |

### Marcadas para revisar (32)

**Todas pierden** (2)

- **El 9 de abril** (`h_9abril`, etapa 0): todas las opciones salen perdiendo (-5, -30.6, -4 puntos), como un golpe sin salida.
- **La comisión investigadora** (`h_comision`, etapa 0): todas las opciones salen perdiendo (-3.3, -4.7, -5.5 puntos), como un golpe sin salida.

**Opción atípica** (16)

- **El río se desborda** (`crecida`, etapa 0): «Esperar a que baje el agua» da -28.3 puntos (muy por debajo del promedio).
- **Familias desplazadas piden refugio** (`migra`, etapa 0): «Acogerlas» da +15.6 puntos (muy por encima del promedio).
- **Un terrateniente evade impuestos** (`evasion`, etapa 1): «Perdonarlo a cambio de su apoyo» da -26 puntos (muy por debajo del promedio).
- **Los campesinos piden tierras** (`tierras`, etapa 1): «Hacer una reforma agraria» da +14.2 puntos (muy por encima del promedio).
- **Los campesinos piden tierras** (`tierras`, etapa 1): «Rechazar la petición» da -19.5 puntos (muy por debajo del promedio).
- **Los maestros piden mejor salario** (`maestros`, etapa 1): «Subir el salario» da +14.2 puntos (muy por encima del promedio).
- **Huelga en los talleres** (`huelga`, etapa 1): «Romper la huelga» da -18.8 puntos (muy por debajo del promedio).
- **Los talleres contaminan el río** (`humo`, etapa 1): «Ignorar la denuncia» da -27.5 puntos (muy por debajo del promedio).
- **Rumores de corrupción** (`corrup`, etapa 1): «Investigar públicamente» da +15 puntos (muy por encima del promedio).
- **Rumores de corrupción** (`corrup`, etapa 1): «No hacer nada» da -19.8 puntos (muy por debajo del promedio).
- **Brota una epidemia** (`epidemia`, etapa 1): «Atender a quien pueda pagar» da -27.8 puntos (muy por debajo del promedio).
- **Hallan oro en la montaña** (`oro`, etapa 2): «Explotar a gran escala» da -29.5 puntos (muy por debajo del promedio).
- **Protesta estudiantil** (`protesta`, etapa 2): «Dispersarla con la guardia» da -29.5 puntos (muy por debajo del promedio).
- **El 9 de abril** (`h_9abril`, etapa 0): «Dejar que la gente se desahogue» da -30.6 puntos (muy por debajo del promedio).
- **Los pájaros** (`h_pajaros`, etapa 0): «Mirar para otro lado» da -25.5 puntos (muy por debajo del promedio).
- **El agua del páramo** (`h_paramo`, etapa 0): «Aceptar la exploración» da -26.2 puntos (muy por debajo del promedio).

**Opciones muy separadas** (14)

- **El río se desborda** (`crecida`, etapa 0): la mejor opción (4.7) y la peor (-28.3) están muy separadas: casi no hay dilema.
- **Familias desplazadas piden refugio** (`migra`, etapa 0): la mejor opción (15.6) y la peor (-6.5) están muy separadas: casi no hay dilema.
- **Un terrateniente evade impuestos** (`evasion`, etapa 1): la mejor opción (5.1) y la peor (-26) están muy separadas: casi no hay dilema.
- **Los campesinos piden tierras** (`tierras`, etapa 1): la mejor opción (14.2) y la peor (-19.5) están muy separadas: casi no hay dilema.
- **Los maestros piden mejor salario** (`maestros`, etapa 1): la mejor opción (14.2) y la peor (-6.5) están muy separadas: casi no hay dilema.
- **Huelga en los talleres** (`huelga`, etapa 1): la mejor opción (4.6) y la peor (-18.8) están muy separadas: casi no hay dilema.
- **Los talleres contaminan el río** (`humo`, etapa 1): la mejor opción (7.2) y la peor (-27.5) están muy separadas: casi no hay dilema.
- **Rumores de corrupción** (`corrup`, etapa 1): la mejor opción (15) y la peor (-19.8) están muy separadas: casi no hay dilema.
- **Brota una epidemia** (`epidemia`, etapa 1): la mejor opción (-1) y la peor (-27.8) están muy separadas: casi no hay dilema.
- **Hallan oro en la montaña** (`oro`, etapa 2): la mejor opción (9) y la peor (-29.5) están muy separadas: casi no hay dilema.
- **Protesta estudiantil** (`protesta`, etapa 2): la mejor opción (8.8) y la peor (-29.5) están muy separadas: casi no hay dilema.
- **El 9 de abril** (`h_9abril`, etapa 0): la mejor opción (-4) y la peor (-30.6) están muy separadas: casi no hay dilema.
- **Los pájaros** (`h_pajaros`, etapa 0): la mejor opción (-0.1) y la peor (-25.5) están muy separadas: casi no hay dilema.
- **El agua del páramo** (`h_paramo`, etapa 0): la mejor opción (1.8) y la peor (-26.2) están muy separadas: casi no hay dilema.

Límites de la medida: no incluye los efectos de las leyes, las huellas en el mapa ni las reacciones de los personajes; el oro se mide a precio base. Sirve para encontrar lo que se sale de lo normal, no para decidir por sí sola.
