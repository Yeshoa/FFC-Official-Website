# 10 — Instructivo: cómo cargar goles (y demás eventos de partido)

> Guía práctica para el dueño: cómo agregar goles, asistencias, penales, tarjetas y sustituciones
> en los partidos de forma correcta, y cómo usar el script `npm run players:link` para no tener
> que buscar ids a mano. Fase [[08-plan-implementacion]] · B6.

---

## 1. Idea general

- Los partidos viven en `src/data/matches/forest-cup-{2020,2022,2024,2026}.json` (y futuro `champions-league-*.json`).
- El **id del jugador es la fuente de verdad** (`playerId`), pero **no hace falta cargarlo a mano**:
  el script `npm run players:link` lo **autocompleta** resolviendo por `equipo + nombre`.
- Para que el autocompletado funcione, el **`player` debe coincidir EXACTO** con el `name` del jugador en `src/data/players/players.json` (mismas mayúsculas, abreviaturas y acentos).
- Si el nombre no coincide o hay dos jugadores con el mismo nombre, el script lo **reporta** y queda pendiente de decisión humana.

---

## 2. Cargar un gol paso a paso

1. Abrí `src/data/matches/forest-cup-<año>.json` y buscá el partido (por `team1`/`team2` o por el link de YouTube).
2. Dentro de `"goals": [...]` agregá la entrada del gol. Ejemplo real:

```jsonc
{
  "team": "Cacusia",        // nombre del equipo que anotó (DEBE coincidir con team1/team2 del partido)
  "player": "S. Blair",     // nombre EXACTO del jugador en players.json
  "assist": "M. Dartmouth", // asistencia (opcional, mismo formato)
  "minute": 15,             // minuto (opcional pero recomendado)
  "penalty": false,         // true si es de penal
  "ownGoal": false          // true si fue autogol
}
```

3. **NO escribas `playerId`/`assistId` a mano.** Guardá el archivo y corré:

```bash
npm run players:link
```

El script agrega `playerId` y `assistId` automáticamente cuando hay 1 candidato exacto.

> Si igual querés cargarlo a mano: `playerId` es el `id` **global numérico** del jugador en
> `players.json` (ej: `"42"`). Los ids estilo `CAC_009` / `LUM_004` son **legacy y no se usan**.

---

## 3. Regla de oro: el nombre debe coincidir exacto

El script compara el `player` del gol contra el `name` de `players.json` **ignorando mayúsculas, tildes y espacios**, pero respetando el resto. Ejemplos reales que hoy NO resuelven (y por qué):

| `player` en el partido | Jugador en `players.json` | Qué pasa |
|---|---|---|
| `T. Ervaan` | `Ervaan` | Sin match: el partido tiene inicial, `players.json` no |
| `D. Hajan` | `Hajan` | Sin match: idem |
| `Bonfis` | `O. Bonfis` | Sin match: el partido no tiene la inicial |
| `Bœn` | `B. Boen` | Sin match: ligadura `œ` ≠ `oe` |

**Qué hacer** en estos casos (elegí la que corresponda):
1. **Corregir el `player` en el partido** para que coincida con `players.json` (si es el mismo jugador), o
2. **Agregar el jugador faltante** a `players.json` (si existe y todavía no está), o
3. Dejarlo sin `playerId` (el sitio muestra el nombre igual; queda reportado por el script).

---

## 4. Otros eventos: penales, tarjetas, sustituciones, lineups

El script autocompleta también:

- **`penalties[]`**: `{ "order": 1, "team": "...", "player": "...", "scored": true }` → autocompleta `playerId`.
- **`cards[]`**: `{ "team": "...", "player": "...", "minute": 30, "type": "yellow" }` → autocompleta `playerId`. Tipos válidos: `yellow`, `red`, `second-yellow`.
- **`substitutions[]`**: `{ "team": "...", "playerOut": "...", "playerIn": "...", "minute": 60 }` → autocompleta `playerOutId` y `playerInId`.
- **`lineup.team1/team2.players[]`**: `{ "name": "...", "number": 7, "position": "CF", "starter": true }` → autocompleta `playerId` (si falta).

Todos siguen la misma regla: `team` debe coincidir con `team1`/`team2` del partido (o con `team1Code`/`team2Code`) y `player` debe coincidir con `players.json`.

---

## 5. El script `npm run players:link`

### Qué hace (en orden)

1. **Autocompleta** `playerId`/`assistId` (y tarjetas/penales/cambios/lineup) resolviendo por **equipo + nombre exacto**.
2. **Reporta** en el terminal lo que no pudo resolver:
   - `[homónimo]` → 2+ jugadores con el mismo nombre en el mismo equipo. En modo interactivo **pregunta cuál elegir** (mostrando id · nombre · posición · dorsal · status). Con Enter se saltea.
   - `sin match` → el nombre no coincide con nadie del plantel (a veces sugiere candidatos parecidos con `?`).
   - `sin plantel` → el equipo **no tiene jugadores** en `players.json` todavía.
   - `equipo sin resolver` → la etiqueta de equipo no se pudo mapear.
3. **Valida** al final:
   - **Huérfanos**: `playerId` que no apuntan a ningún jugador de `players.json` (ERROR, corta la ejecución).
   - **Skills**: todos los jugadores deben tener TODAS las habilidades (WARN; ERROR solo con `--strict`).

### Modos

```bash
npm run players:link             # autocompleta + valida (pregunta ante homónimos)
npm run players:link:dry         # solo reporta, NO escribe nada
npm run players:link:strict      # CI: falla si quedan referencias con nombre pero sin playerId
```

> En este repo, npm no reenvía `-- <flags>` al script; por eso hay aliases propios por modo.
> Si querés pasarlos a mano, invocá node directo: `node scripts/players-link.mjs --dry-run` / `--strict`.

> Usar `npm run players:link:strict` en CI/antes de commitear: asegura que no se suban partidos con nombres sin resolver.

### Truco: desambiguar homónimos con dorsal

Si dos jugadores del mismo equipo tienen el mismo nombre (normalizado), el script muestra la lista
para que elijas. Para que sea más fácil de leer, conviene completar el **`number` (dorsal)** de esos
jugadores en `players.json` (`teams[].number`): aparece en la lista de candidatos del prompt.

---

## 6. Casos especiales (datos existentes)

- **Goles de 2020 sin `player`** (solo `{ "team": "..." }`): son **marcadores de resultado** sin nombre de jugador. No se les puede poner `playerId` (no hay nombre para resolver). Se dejan como están.
- **Ids legacy** tipo `LUM_004`: NO se usan. Si encontrás uno, **borrá el `playerId`** (dejá el `player` con el nombre correcto) y corré el script para que lo autocomplete. En la fase B6 se corrigieron los 5 que quedaban en `forest-cup-2024.json` (penales de Lumiose).
- **Homónimo real resuelto**: `C. Mcarthur` / `C. McArthur` en Roless eran **el mismo jugador** con mayúscula inconsistente (duplicado de la migración). Se fusionaron en un solo jugador (**id 181**, nombre `C. McArthur`) y las 9 referencias de goles/asistencias se remapearon a ese id. Si volvés a ver un nombre duplicado así, fusionar en un solo id es lo correcto (no hay dos jugadores distintos).

---

## 7. Estado actual (al cerrar B6)

- `playerId` resueltos en goles: **352 / 666** (el script autocompletó 194 `playerId` + 128 `assistId` + 7 tarjetas + 11 penales de una pasada, incluyendo el homónimo resuelto).
- **Pendientes de decisión humana** (~123 referencias): 90 sin match (nombres que no coinciden) y 33 sin plantel (equipos sin jugadores en `players.json`: 47 federaciones no tienen plantel cargado). Sin homónimos pendientes.
- Las skills de los jugadores (233/239 incompletas) son tema de [[08-plan-implementacion]] B3, no afectan la carga de goles.

---

## 8. Checklist antes de terminar

1. Cargaste los goles/eventos con `team` y `player` correctos (nombres exactos de `players.json`).
2. `npm run players:link` termina en `OK:` y sin `ERROR:` de huérfanos.
3. Si usás CI: `npm run players:link:strict` pasa o las referencias pendientes están resueltas.
4. `npm run build` compila sin errores.
