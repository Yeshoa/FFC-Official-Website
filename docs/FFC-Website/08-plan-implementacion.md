# 08 — Plan de implementación (fases)

> Plan de ejecución dividido en fases, cada una con su branch y review independiente.
> Toda fase debe mantener el build verde (`npm run build`) y no romper lo visual.

---

## Convenciones

- Cada fase: branch nueva desde `development` → PR → review → merge.
- Antes de cada fase se corre `npm run build` y se verifica el deploy de preview.
- Orden prioritario: **primero el modelo de datos** (fase B1) porque define todo lo demás, aunque el trabajo "de consistencia" (fase A) se puede empezar en paralelo en branch separada.

---

## FASE A — Consistencia y arquitectura de lo existente

> No toca visual ni agrega CL/clubes. Prepara el terreno.

### A1 · Frontmatter, utils/lib y tipado
- Crear `src/components/ui/` (DataTable, StandingsTable, Card base, etc.).
- Consolidar `src/lib/` vs `src/utils/`: eliminar duplicados (matchUtils/tournamentUtils, memberUtils/scoreUtils).
- Crear selectores tipados por dominio; pasar props tipadas a componentes.
- Eliminar `any`, `as any`, `passthrough()` innecesarios y `console.log` de producción.
- Refactorizar frontmatter de páginas (members, forest-cup, ranking, matches, stadiums, sponsors, articles).
- Revisar `playerUtils.ts` (dejar listo para fase B1; hoy importa un módulo inexistente).

### A2 · Colores y tokens
- Definir tokens semánticos en `src/styles/global.css` (`@theme`): primary, surface, text, tier colors, rarity tokens.
- Migrar clases hardcodeadas repetidas a tokens/clases compartidas sin cambiar el aspecto.

### A3 · Temporada y ranking (base)
- Agregar `season` a `tournaments` (schema + datos existentes: 2020→2020, 2022→2022, 2024→2024, 2026→2026).
- Crear `src/config/season.ts` con `CURRENT_SEASON`.
- Refactorizar `rankingUtils`/`scoreUtils`: indexar score por **temporada**, decay por **años**.
- Migrar frontmatter de `score` de ids de torneo → temporadas (script de migración + validación).
- **El ranking de selecciones mantiene su lógica intacta** (ya está bien); solo cambia cómo se detecta la temporada actual y los torneos anteriores para el decay. Verificar que el resultado del ranking sea idéntico antes/después (golden snapshot).

### A4 · Motor de logros (refactor) + badges
- Pipeline central `evaluateAchievements` + `AchievementResult` (progress/current/target/visible).
- Migrar `dynamics/*` a nueva API; quitar caches sueltos y logs.
- Crear `AchievementBadge` y `MemberBadges` para el `MemberHero`.

### A5 · Migración de contenido a JSON
- Migrar colecciones de `.md` a JSON manteniendo los mismos schemas Zod (ver [[02-modelo-datos]] §9). Colección por colección, con `loader` de JSON como `matches`.
- Orden sugerido: `tournaments` → `stadiums` → `achievements` → `members` → `sponsors` → `articles`.
- Migrar `squad` de frontmatter a referencia por `playerId` (ver §8) cuando `players.json` exista (o en coordinación con B1).

---

## FASE B — Nuevo modelo: Champions League, clubes y partidos

> Requiere A1 y A3 (modelo de datos y temporada) como base.

### B1 · Modelo de datos (jugadores, clubes, torneos, partidos)
- Crear `src/data/players/players.json` central (multi-equipo, con `rating` 0.5–6 y `position` principal).
- Migrar `by-team` + `historical` + `squad` de frontmatter al JSON central; resolver homónimos una vez con el dueño.
- Crear `src/data/clubs/` (JSON) con `federation`, `squad` por `playerId`, `code`.
- Crear `@data/players/index.ts` (loaders + `getPlayerById`, `loadCurrentSquad`, `loadHistoricalSquad`).
- Schema `matches`: agregar `assistId` y `team1Type/team2Type: 'national' | 'club'`.
- Schema `tournaments`: `season` (hecho en A3) + validar `type`.
- Normalizar `playerId` en los JSON de partidos (script `players:link`, ver [[02-modelo-datos]] §6).
- Migrar `squad` de federaciones a referencia por `playerId` (coordinado con A5; el coach queda como campo del squad).
- Migrar lookups de equipos de `teamName` → `teamCode` en utils (ver [[02-modelo-datos]] §10).

### B2 · Script CLI de carga de goles
- `npm run players:link`: autocompleta `playerId` por `team + nombre`, reporta homónimos y escribe de vuelta.
- Modo `--strict` para CI; completar `number` (dorsal) como desambiguador.

### B3 · Layout y estética Champions League
- `src/layouts/ChampionsLeague.astro` (fondo negro + rombos verde lima).
- Tokens CL (`--color-cl-black`, `--color-cl-lime`) y patrón de rombos CSS.
- Navbar/footer de la sección; reemplazar placeholder `champions-league.astro`.

### B4 · Páginas de clubes
- `/clubs` (índice) + `/clubs/<slug>` con estética CL.
- Mostrar liga doméstica en la página del miembro (clubes de su federación).

### B5 · Páginas individuales de partido
- `src/pages/matches/[...match].astro` con `getStaticPaths`.
- Componentes: MatchDetailHeader, Lineups, MatchStatsPanel, MatchTimeline.

### B6 · Páginas de logros por federación
- Ruta `/members/<slug>/achievements` (obtenidos / por obtener / secretos como `?` / progreso / puntaje).

### B7 · Forestian Champions League (contenido)
- Torneo CL con `type: 'forestian-champions-league'` y `season`.
- Rutas de la sección (home, season, fixtures, standings, ranking CL propio).
- Carga de datos de clubes y partidos CL (ida/vuelta, final simple).

---

## Orden recomendado de ejecución

```
1.  Branch "refactor/fase-a1"  →  A1
2.  Branch "refactor/fase-a2"  →  A2
3.  Branch "refactor/fase-a3"  →  A3
4.  Branch "refactor/fase-a4"  →  A4
5.  Branch "refactor/fase-a5"  →  A5
6.  Branch "feature/fase-b1"   →  B1
7.  Branch "feature/fase-b2"   →  B2
8.  Branch "feature/fase-b3"   →  B3
9.  Branch "feature/fase-b4"   →  B4
10. Branch "feature/fase-b5"   →  B5
11. Branch "feature/fase-b6"   →  B6
12. Branch "feature/fase-b7"   →  B7
```

> Cada fase produce su propio doc/checklist si es necesario; este plan se actualiza al cerrar cada una.

---

## Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|-----------|
| Cambiar `score` (ids→season) rompe historial | Script de migración + golden snapshot del ranking actual antes/después |
| Homónimos en jugadores | Script `players:link` con resolución asistida + dorsal |
| CL de ida/vuelta complica standings | Reutilizar `leg`/`aggregate`/`penalties` ya soportados; teste con torneo CL de prueba |
| Romper lo visual | Fases A1/A2 enfocadas en consistencia, verificación visual en preview |
| `playerUtils.ts` importa módulo inexistente | Resolver en B1 creando `@data/players/index.ts` |
| Migrar `.md` → JSON pierde contenido/cuerpo markdown | Migración colección por colección + comparación de build y de páginas afectadas en preview |
| Migrar `teamName` → `teamCode` rompe lookups | Migrar junto con B1 (cuando existan códigos consistentes) y validar con build + golden snapshot de standings |

---

## Definición de "done" por fase

- `npm run build` sin errores.
- Preview de Netlify revisado por el dueño.
- Sin `any`/`console.log` nuevos en el código tocado.
- Docs de `/docs` actualizados si cambió el diseño.
