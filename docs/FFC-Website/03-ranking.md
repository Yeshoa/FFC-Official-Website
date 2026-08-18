# 03 — Diseño objetivo: ranking, temporadas y decay

> Sistema de puntos consistente para la transición entre temporadas. **El ranking actual de selecciones ya tiene los cálculos deseados y NO se le agrega nada nuevo**; lo único a refactorizar es *cómo* se detecta la temporada actual y *cuáles* son los torneos anteriores para el decay.

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
- Cada torneo declara su `season` (ver [[02-modelo-datos]] §4).

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

>**Aclaración**: Los torneos de CL no aportan al ranking de selecciones. Si dos torneos caen en la misma temporada, no debería afectar en nada, solo cuenta el de la Forest Cup.

---

## 5. Ranking de la Champions League (NO suma al ranking de selecciones)

> Decisión del dueño (aclarada en [[Plan del usuario/01 - Actualización]]): **la Champions League NO debe sumar al ranking de selecciones**. El ranking actual de selecciones ya tiene los cálculos deseados; no se le agrega nada.

### Modelo
- El ranking general de federaciones (`ranking.astro` / `ranking-detailed.astro`) **solo** considera Forest Cup (selecciones). No cambia en lógica: ya está bien.
- La CL tiene su **propio ranking/table** (de clubes), con sus propias reglas. Se implementa por separado, reutilizando infraestructura genérica de cálculo (`torneo + season`) pero **sin mezclarse** con el ranking de selecciones.
- La refactorización de este doc se limita a:
  1. Reemplazar `CURRENT_TOURNAMENT_ID` por `CURRENT_SEASON` (año).
  2. Detectar torneos anteriores para el decay por **años**, no por conteo de torneos.
  3. Indexar `score` por temporada en vez de tournament id (o el mapeo equivalente).

### Implicación en páginas
- `ranking.astro` / `ranking-detailed.astro` → ranking de federaciones (Forest Cup). Sin cambios de lógica.
- Nueva sección CL con su ranking propio (en [[05-champions-league]]).

---

## 6. Validaciones / invariantes

1. Todo torneo tiene `season` válida.
2. `CURRENT_SEASON` siempre existe y es coherente con los datos (build falla si no).
3. Un miembro no puede tener puntos de una temporada futura (excepto si se está preparando y se marca explícitamente).
4. Los `tierHistory` se siguen computando por `edition` (o `season`) para los logros de tier.
5. El ranking "debería" poder calcularse para **cualquier temporada histórica** (útil para páginas de logros por federación).

> **Nota Adicional**: Como el ranking debería poder calcularse según temporada, estaría bueno agregar una función que obtenga el ranking/puntaje de una federación según temporada (parámetro).

---

## 7. Pasos de implementación (resumen)

1. Agregar `season` a `tournaments` y a la config.
2. Crear `src/config/season.ts` con `CURRENT_SEASON` (con fallback/validación).
3. Refactorizar `rankingUtils.ts`: indexar score por season, decay por años, ranking calculable por temporada.
4. Migrar frontmatter de miembros (script o manual) de ids de torneo → años.
5. Mantener tests/build verdes en cada paso.
