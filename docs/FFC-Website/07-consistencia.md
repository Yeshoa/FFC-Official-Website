# 07 — Diseño objetivo: consistencia (frontmatter, utils/lib, colores, componentes)

> Optimizar el frontmatter de las vistas, aprovechar utils/lib, unificar colores en tokens y reutilizar componentes (sin tocar lo visual salvo consistencia).

---

## 1. Frontmatter de las vistas

### Problemas
- Props mal aprovechados o duplicados: muchas páginas/componentes reciben los mismos datos crudos y recalculan (por ej. standings, top scorers) en vez de recibir datos ya calculados desde un layer.
- `score` indexado por tournament id (acoplado al problema de [[03-ranking]]).
- Campos como `getCurrentRoleplayDataWithDefaults(memberName, ...)` reciben `memberName` sin usarlo.

### Objetivo
- **Tipar las props de componentes** con tipos derivados de `CollectionEntry` (evitar `any` y `passthrough()` donde sea posible).
- **Layer de datos**: `src/lib/collections.ts` + helpers ya exponen data; crear "selectores" (p.ej. `getMemberStandings(member)`, `getMatchStats(match)`) para que los componentes reciban **datos listos**, no crudos.
- Frontmatter mínimo: las páginas calculan lo necesario y pasan props tipadas; los componentes no vuelven a consultar colecciones.
- Eliminar duplicación de lógica entre `src/lib/` y `src/utils/` (hay solapamiento: `matchUtils`, `tournamentUtils`, `memberUtils`, `playerUtils`).

---

## 2. Utils / Lib (organización)

### Propuesta de convención
- `src/lib/` → **dominio**: ranking, scores, logros, eventos, roleplays, bonuses, collections/cache.
- `src/utils/` → **helpers puros de datos**: matches, tournaments, members, players, stadiums, articles.
- Eliminar/mergear duplicados:
  - `matchUtils` vs `tournamentUtils` (ambos calculan resultados/standings).
  - `memberUtils.getMemberTier` vs `scoreUtils.getTotalColorClass` (definir dónde vive el tier).
  - `playerUtils.ts` debe importar una fuente real (`@data/players/index.ts` que **no existe** → crearlo como parte de la fase B).
- **Tipos**: mover interfaces de dominio a `src/types/` y que `collections.d.ts` los reexporte.

### Reglas
- Sin `any` ni `as any` (hay `(member.data as any).manualAchievements`, `passthrough()` en lineups/squads).
- Sin `console.log` en producción (hay en `achievements/index.ts`).
- Funciones puras, sin efectos de cache en módulo salvo los centralizados en `lib/collections.ts`.

---

## 3. Colores y tokens

### Problema
- No existe `--color-primary` ni una paleta consistente; se usan clases Tailwind ad-hoc (`text-amber-300`, `bg-green-600`, `from-green-1000 to-green-900`, etc.).

### Objetivo
- Definir **tokens semánticos** en `src/styles/global.css` (Tailwind 4 `@theme`):
  - `--color-primary`, `--color-primary-light`, `--color-primary-dark` (verde bosque actual).
  - `--color-accent` (si aplica).
  - `--color-background`, `--color-surface`, `--color-text`, `--color-text-muted`.
  - Tokens de tier (gold/silver/bronze para ranking), rareza de logros, y la paleta CL (negro + lima).
- **Mapear a clases Tailwind** vía `@theme` (Tailwind 4 genera `bg-primary`, `text-primary`, etc.) y usarlas en todo el proyecto.
- Mantener clases utilitarias solo para casos puntuales; reemplazar hardcodes repetidos.

### Regla
- Todo color repetido más de ~3 veces pasa a token o clase compartida. No se cambia el aspecto visual actual (solo el origen del valor).

---

## 4. Componentes reutilizables

### Tablas (prioridad reportada)
- Existen varias tablas sueltas (`TournamentHistoryTable`, `HistoricalTable`, `Standings`, `Groups`, etc.) con estilos repetidos.
- Crear primitivos reutilizables:
  - `DataTable.astro` (tabla tipada: columnas + filas + estilos de celda/header).
  - `StandingsTable.astro` (posiciones con puntos/gd/pr + fase).
  - `ScorersTable.astro`, `FixturesTable.astro`, `RecordsTable.astro`.
- Unificar en `src/components/ui/` (primitivos) separados de `src/components/<dominio>/` (específicos).

### Otros
- `Card` base para tarjetas (hero, match, member, sponsor) para homogeneizar padding/sombra.
- Badges de logros (ver [[04-logros]]).
- Botones/links (`Button.astro` ya existe, revisar consistencia).

---

## 5. Páginas afectadas (frontmatter/props)

- `members/[slug]` (hero, participaciones, records, score details).
- `forest-cup/*` y `tournaments/*` (hero, standings, grupos, playoffs, scorers, históricos).
- `ranking` / `ranking-detailed`.
- `matches/*`, `stadiums`, `sponsors`, `articles`.

Cada página pasa a consumir selectores de `lib/` y componentes `ui/` sin duplicar lógica ni estilos.

---

## 6. Pasos de implementación (resumen)

1. Definir tokens semánticos en `@theme` y migrar clases hardcodeadas.
2. Crear `src/components/ui/` (DataTable, StandingsTable, Card, badges).
3. Consolidar `lib/` vs `utils/`; crear selectores tipados; eliminar duplicados y `any`.
4. Refactorizar frontmatter de páginas y props de componentes (tipado estricto).
5. Crear `@data/players/index.ts` (fase B) para cerrar `playerUtils.ts`.
