# Contenido del juego

Estos archivos guardan todo el texto y los números del juego. Se pueden editar sin tocar código.

| Archivo | Qué contiene |
| --- | --- |
| `dilemas.json` | Los dilemas del año, con sus opciones |
| `consecuencias.json` | Lo que pasa años después de ciertas decisiones |
| `edificios.json` | Obras: costo, mantenimiento, empleos, dónde se pueden construir |
| `leyes.json` | Leyes y en qué etapa se abren |
| `regimenes.json` | Las seis formas de gobierno y el ciclo de Polibio |
| `etapas.json`, `guia.json`, `logros.json` | Etapas, metas de la guía y logros |
| `personajes.json`, `filosofias.json`, `textos.json` | Voces del pueblo, corrientes éticas y textos sueltos |

## Cómo agregar un dilema

Copia uno de `dilemas.json` y cambia sus datos:

```json
{
  "id": "puente",
  "etapa": 1,
  "icono": "🌉",
  "titulo": "El puente viejo cruje",
  "texto": "Los arrieros dicen que no aguantará otro invierno.",
  "condicion": { "edificios": { "mercado": 1 } },
  "opciones": [
    {
      "texto": "Reconstruirlo ya",
      "efectos": { "oro": -60, "confianza": 5 },
      "filosofia": "deon",
      "porque": "Cuidar lo que es de todos es un deber.",
      "aQuien": "El tesoro paga, y el pueblo ve un gobierno que cuida lo común: por eso sube la confianza."
    }
  ]
}
```

- **etapa:** 0 Aldea, 1 Pueblo, 2 Ciudad, 3 Polis (desde cuándo puede salir).
- **condicion** (opcional): `edificios` (mínimo de cada obra), `anio`, `etapa`, `impuestoElite` (mínimo en %), `inflacionMayorQue` (por ejemplo 0.08), `terreno` (por ejemplo "montana").
- **efectos:** `oro`, `alimento`, `habitantes`, `animo`, `igualdad`, `confianza`, `ambiente`, `deuda`, `campesinos`, `artesanos`, `elite`, `inflacion`, `impuestoElite`.
- **filosofia:** `util` (Mill), `deon` (Kant), `contr` (Rawls), `real` (Maquiavelo), `virt` (Aristóteles).
- **aQuien:** una frase que explica a quién afecta la opción y por qué (se muestra al elegirla, en «¿Por qué afecta así?»).
- **despues** (opcional): `{ "anios": 4, "id": "nombre_consecuencia", "probabilidad": 0.5 }`, y esa consecuencia debe existir en `consecuencias.json`.

Después de editar, Claude corre `node herramientas/balance.js` para revisar que el balance siga sano.
