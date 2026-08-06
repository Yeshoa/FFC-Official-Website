# 03 — Diseño objetivo: ranking, temporadas y decay

> Sistema de puntos consistente y que soporta la transición entre temporadas y la Champions League.

---

## 1. Problema actual

- `CURRENT_TOURNAMENT_ID` (en `src/utils/tournamentUtils.ts`) se calcula como **el torneo de mayor id** (`sortedTournaments[0]?.data.id`).
- Los puntos se guardan en el frontmatter del miembro indexados por **tournament id como string** (`score.rp["4"]`, etc.).
- El decay se aplica a los **últimos 4 torneos** con factores `[1.0, 0.5, 0.25, 0.1]`.

Esto funciona hoy porque solo existe una competición (Forest Cup, bienal). Con una **Champions League anual**:
- Si CL y FC conviven en el mismo año, "últimos 4 torneos" ya no representa "últimas 4 temporadas".
- "Temporada actual" debe ser **el año**, no "el último torneo creado".
- Preparar la temporada siguiente no debería requerir tocar una constante derivada de datos.

---

## 2. Diseño objetivo: temporada por año

### Nueva fuente de verdad
- **`CURRENT_SEASON: number`** (año, ej: `2027`) en una constante explícita, por ejemplo `src/config/season.ts` (o `constants.ts`).
- Se puede derivar/validar: `max(tournaments.season)` pero **no debe ser la única fuente**; debe poder fijarse a mano para preparar la próxima temporada antes de crear torneos.
- Cada torneo declara su `season` (ver `02-modelo-datos.md` §4).

### Qué significa "consistente al pasar de temporada"
- Al iniciar una temporada nueva, **no se pierden datos**: los puntos de torneos cerrados se congelan por torneo; el ranking suma:
  - Torneos cerrados (con decay por antigüedad en **años**).
  - La actividad de la **temporada actual** (rp/eventos/bonus del año en curso).
- `getLastFourTournamentIds` → reemplazar por "torneos de las últimas 4 temporadas **cerradas**" (o un período de años), no "4 torneos".

---

## 3. Estructura de puntaje propuesta

> Se mantiene el esquema de frontmatter `score` (rp/events/bonus), pero se indexa por **temporada (año)** en vez de tournament id, o se agrega un mapa `season → breakdown`.

### Opción A (recomendada): indexar por temporada
```ts
score: {
  rp: Record<season: string, Record<activity: string, number>>;     // "2027": { ... }
  events: Record<season, Record<activity, number>>;
  bonus: Record<season, Record<activity, number>>;
}
```
- Un torneo pertenece a una `season`. Los puntos "de torneo" (posición, decay) se calculan de los partidos, no del frontmatter.
- `additionalPoints` queda por season si hiciera falta.

### Opción B: mantener por tournament id, con mapeo
- Agregar `season` al torneo y un helper `getSeasonFromTournamentId(id)`.
- El frontmatter sigue igual, pero el ranking resuelve la temporada a través del torneo.
- Más compatible con lo existente, pero mantiene el acoplamiento a `id`.

**Recomendación**: migrar a la opción A (indexar por año). Es el cambio que hace el sistema a prueba de múltiples torneos por año.

---

## 4. Decay por temporada

- Factores actuales: `[1.0, 0.5, 0.25, 0.1]` para torneo `-1..-4`.
- Propuesta: aplicar sobre **temporadas** (años) cerradas:
  - Temporada actual: 100%
  - Temporada anterior: 50%
  - 2 temporadas atrás: 25%
  - 3 temporadas atrás: 10%
  - 4 o más: 0%
- Si dos torneos distintos caen en la misma temporada cerrada (FC + CL), ambos aportan con el **mismo factor** (el de su temporada), no se descuenta dos veces.
- `SCORING_CONFIG.DECAY_FACTORS` pasa a `Record<yearsAgo, number>`.

---

## 5. Ranking de la Champions League (separado)

Decisión confirmada: **la CL tiene ranking propio**, independiente del ranking general de federaciones.

### Modelo
- El ranking general (federaciones) **solo** considera Forest Cup (y lo que decida el dueño para actividades no-CL).
- La CL tiene su propio ranking/table (puntos de clubes, o de federaciones según lo que se defina luego), con sus propias reglas y decay.
- Ambas comparten la **misma infraestructura** de cálculo (helpers genéricos por `torneo + season`), pero se exponen como rankings distintos en UI.

### Implicación en páginas
- `ranking.astro` / `ranking-detailed.astro` → ranking de federaciones (Forest Cup).
- Nueva sección CL con su ranking propio (en `05-champions-league.md`).

---

## 6. Validaciones / invariantes

1. Todo torneo tiene `season` válida.
2. `CURRENT_SEASON` siempre existe y es coherente con los datos (build falla si no).
3. Un miembro no puede tener puntos de una temporada futura (excepto si se está preparando y se marca explícitamente).
4. Los `tierHistory` se siguen computando por `edition` (o `season`) para los logros de tier.
5. El ranking "debería" poder calcularse para **cualquier temporada histórica** (útil para páginas de logros por federación).

---

## 7. Pasos de implementación (resumen)

1. Agregar `season` a `tournaments` y a la config.
2. Crear `src/config/season.ts` con `CURRENT_SEASON` (con fallback/validación).
3. Refactorizar `rankingUtils.ts`: indexar score por season, decay por años, ranking calculable por temporada.
4. Migrar frontmatter de miembros (script o manual) de ids de torneo → años.
5. Mantener tests/build verdes en cada paso.
