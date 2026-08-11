# 08 — Plan de implementación (fases)

> Plan de ejecución dividido en fases, cada una con su branch y review independiente.
> Toda fase debe mantener el build verde (`npm run build`) y no romper lo visual.

---

## Convenciones

- Cada fase: branch nueva desde `development` → PR → review → merge.
- Antes de cada fase se corre `npm run build` y se verifica el deploy de preview.
- Orden prioritario: **primero el modelo de datos** (fase B1) porque define todo lo demás, aunque el trabajo "de consistencia" (fase A) se puede empezar en paralelo en branch separada.
- **Fase A completa mergeada a `development`** (2026-08): las fases B parten de `development` con la fase A adentro.

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

### A5 · Migración de contenido a JSON ✅
- Migrar colecciones de `.md` a JSON manteniendo los mismos schemas Zod (ver [[02-modelo-datos]] §9). Colección por colección, con `loader` de JSON como `matches`.
- Orden sugerido: `tournaments` → `stadiums` → `achievements` → `members` → `sponsors`.
- **`articles` quedan como `.mdx` (NO se migran a JSON)**: usan componentes MDX e imports; el cuerpo markdown vive en el archivo. Decisión del dueño.
- Migrar `squad` de frontmatter a referencia por `playerId` (ver §8) cuando `players.json` exista (o en coordinación con B1).
- **Hecho**: las 5 colecciones migradas de `.md` a **un único JSON por colección** en `src/data/` (`members.json`, `tournaments.json`, `achievements.json`, `sponsors.json`, `stadiums.json`), formato objeto `{ [id]: data }`, cargadas con loader custom `objectLoader` (store.set por entrada, desacopla entry id/slug de `data.id` numérico). `image()` resuelve paths optimizados igual que antes. `.slug` de members → `.id` (entry id = slug). Body markdown de members descartado (decisión del dueño). `articles` quedan `.mdx`.

---

## FASE B — Nuevo modelo: Champions League, clubes y partidos

> Requiere A1, A3 y A5 (modelo de datos, temporada, contenido en JSON) como base.
> Replanificado (2026-08) con: skills 0-100 por jugador + rating derivado + estrellitas, ligas domésticas hardcodeadas (infraestructura primero), navbar por sección FC/CL, y simulador de mercado de pases.

### B1 · Modelo de datos (jugadores, clubes, torneos, partidos, ligas)
- Crear `src/data/players/players.json` central (multi-equipo). Cada jugador tiene:
  - `id` global autoincremental, único.
  - `position` principal, `nationality`, `birthdate?`, **`birthplace: { city?, state? }`** (nuevo).
  - **`skills`**: cada habilidad del simulador en escala **0-100** (`shortRange`, `mediumRange`, `longRange`, `heading`, `pace`, `agility`, `stamina`, `jumping`, `dribbling`, `fakes`, `ballControl`, `stability`, `positioning`, `vision`, `tackling`, `sliding`, `clearing`, `power`, arqueros `reflexes/gkPositioning/stretch/saveClose/catch`, `injuryResistance?`). Ver [[02-modelo-datos]] §2 y [[Simulador/00-simulador]] §6.
  - **`rating` (0-100) y estrellitas (0.5-6) DERIVADOS**: funciones puras `computePlayerRating(skills, position)` y `ratingToStars(rating)`. No se editan a mano.
- Migrar `by-team` + `historical` + `squad` de frontmatter al JSON central; resolver homónimos una vez con el dueño.
- Crear `src/data/clubs/` (JSON) con `federation`, `budget`, `squad` (solo `coach` + `formation`), `code`, `colors`, `stadiumId`. **Sin badges/logros** en clubes. Plantel **derivado** de `players.json` (ver [[02-modelo-datos]] §8).
- Crear **infraestructura de ligas domésticas**: `src/data/leagues/<federation>.json` (tabla de la última temporada: PJ/PG/PE/PP/GF/GC/Pts) + schema + loader. **Solo infraestructura, sin datos reales** en esta iteración.
- Crear `@data/players/index.ts`, `@data/clubs/index.ts`, `@data/leagues/index.ts` (loaders + getters: `getPlayerById`, `loadCurrentSquad`, `loadHistoricalSquad`).
- Schema `matches`: agregar `assistId` y `team1Type/team2Type: 'national' | 'club'`.
- Schema `tournaments`: `season` (hecho en A3) + validar `type`.
- Normalizar `playerId` en los JSON de partidos (script `players:link`, ver B2).
- Migrar `squad` de federaciones: **eliminar `squad.players`** y completar `teams[]` en `players.json` (el plantel se deriva; el coach queda como campo del squad). Ver [[02-modelo-datos]] §8.
- Migrar lookups de equipos de `teamName` → `teamCode` en utils (ver [[02-modelo-datos]] §10).
- Escribir una **tabla de conversión rating 0-100 → estrellas** en `src/config/` (constante ajustable).

> **Hecho (B1 · Fase 1 — solo el presente, 2026-08):**
> - `src/data/players/players.json`: 239 jugadores centralizados desde `by-team`, cada uno con **id global numérico autoincremental** + `teams[]` (`teamCode`, `teamType: 'national'`, `status: 'active'`), `nationality`, `birthplace` (opcional, null), `skills` (placeholder vacío).
> - `playerId`/`assistId`/`playerOutId`/`playerInId` de los 4 JSON de partidos remapeados a los ids globales (validar con `npm run players:link`).
> - `@data/players/index.ts` reescrito sobre `players.json` (getters `getPlayerById(id)`, `loadCurrentSquad`, `loadHistoricalSquad`→no data aún). `playerUtils` ajustado.
> - **`members.squad` eliminado** (schema + datos, era vestigio). El plantel se deriva de `players.json` `teams[]` (§8).
> - Schema `matches`: `assistId` y `team1Type/team2Type` agregados.
> - **Infraestructura** `@data/clubs` (empty `clubs.json` + getters) y `@data/leagues` (empty + getters). `src/config/rating.ts`: `computePlayerRating` + `ratingToStars` + tabla estimada.
> - **Lookups teamCode**: `getMemberByCode` + `getMemberByMatchTeam(match, side)` en `memberUtils` (código primero, tipo `national|club`, fallback nombre). Aplicado en `getAllParticipants`. `getMemberByName` se mantiene donde la lógica es por nombre (logros, goles).
> - **Pendiente Fase-2**: `historical/*` NO se migra al modelo de ids globales (decisión dueño: solo selecciones, no afecta simuladores; se usa el esquema anterior). Aplicar `getMemberByMatchTeam`/códigos al resto de `tournamentUtils` + logros + páginas forest-cup (lejos, sin tocar el motor de goles por nombre).

### B2 · Tabla de liga doméstica en `member/[slug]`
- Si la federación **tiene** tabla de liga (`leagues/<code>.json`) → mostrar **tabla de la última temporada** en la página del miembro.
- Si **no** tiene tabla pero **tiene clubes** → mostrar **lista de clubes** de su federación.
- Si no tiene nada → no se muestra la sección.
- Componente `DomesticLeagueTable` (tabla) + `MemberClubs` (lista) reutilizables.
- **Sin datos reales** (solo infraestructura + componente).

> **Hecho (B2, infraestructura — sin datos reales, como corresponde):**
> - `src/components/members/DomesticLeagueTable.astro`: tabla de posiciones desde `@data/leagues` (pos, club, PJ/PG/PE/PP/GF/GC/GD/Pts), con link a `/clubs/<code>` cuando el club tiene `clubCode`.
> - `src/components/members/MemberClubs.astro`: lista de clubes de la federación desde `@data/clubs` (link a `/clubs/<code>`).
> - Integrado en `member/[slug]` tras el `MemberHero`: **si hay liga → tabla; si no pero hay clubes → lista; si no → nada**.
> - Sin datos reales, la sección no se muestra todavía (se agregan datos cuando el dueño los tenga).

### B3 · Plantilla (squad) compacta con estrellitas
- Componente `SquadCompact`: **plantel completo** ordenado por posición con dorsal y **estrellitas del jugador** (derivadas del rating). **Sin XI/titulares** (sin boolean de titularidad).
- Se muestra en `member/[slug]` (selección) y en `club/[slug]`.
- El plantel se **deriva de `players.json`** (entradas de `teams[]` con `status: 'active'`); el perfil se resuelve desde el id global.
- **Estrellas de poderío del equipo** (0.5-6) bajo el rating de la federación, calculadas del plantel (tabla del dueño).

### B4 · Página de club (`/clubs/<slug>`)
- Estética CL (negro + rombos lima, ver B7).
- `ClubHero` distinto del `MemberHero`: escudo/colores, federación dueña, **sin badges de logros**, con **rating del club (0-100) + estrellas**.
- Plantel completo (derivado de `players.json`, ver B3).
- **Stats del club solo de torneos FFC** (Forest Cup + CL), **NO** de liga doméstica (esta es solo tabla de contexto).
- Historial FCL y participaciones.
- Índice `/clubs` (galería con rating).

### B5 · Rating de clubes y ranking FCL
- `computeClubRating(squad)` = agregación de ratings de la plantilla (0-100 → estrellas).
- **Ranking de la CL separado e independiente** del ranking de selecciones ([[03-ranking]] §5): no suma al ranking general.
- Se expone en la sección CL (ej. `/forestian-champions-league/ranking`).

### B6 · Script CLI de carga de goles
- `npm run players:link`: autocompleta `playerId` por `team + nombre`, reporta homónimos y escribe de vuelta.
- Modo `--strict` para CI; completar `number` (dorsal) como desambiguador.

### B7 · Layout y estética Champions League + navegación por sección
- `src/layouts/ChampionsLeague.astro` (fondo negro + rombos verde lima).
- Tokens CL (`--color-cl-black`, `--color-cl-lime` `#95ff00`, secundario `#00ff95`) y patrón de rombos CSS.
- **Navbar por sección**: la página principal es FC por defecto; al entrar a la sección CL cambia el navbar a la navegación CL (home, ranking, clubs, etc.). Volver a FC con selector/navbar. Home de CL en `/fcl/index.astro` (o ruta equivalente), con sus derivados (ranking, etc.). `articles`/`sponsors` quedan globales (se resuelve navegación en el plan de detalle de esta fase).
- Reemplazar placeholder `champions-league.astro`.

### B8 · Páginas individuales de partido
- `src/pages/matches/[...match].astro` con `getStaticPaths`.
- Componentes: MatchDetailHeader, Lineups, MatchStatsPanel, MatchTimeline.

### B9 · Páginas de logros por federación
- Ruta `/members/<slug>/achievements` (obtenidos / por obtener / secretos como `?` / progreso / puntaje).

### B10 · Forestian Champions League (contenido)
- Torneo CL con `type: 'forestian-champions-league'` y `season`.
- Rutas de la sección (home, season, fixtures, standings, ranking CL propio).
- Carga de datos de clubes y partidos CL (ida/vuelta, final simple).

### B11 · Simulador de mercado de pases (isla React)
- Isla React en la sección CL: el participante **selecciona el club** con el que opera (cada club tiene su `budget` preasignado en la data, derivado del poder federativo FCL) → sidebar con lista de jugadores (del JSON del mercado) + filtros → cancha central con 11 espacios titulares + banco → drag & drop de jugadores (validando presupuesto) → **exportar plantilla/compras como JSON** o copiar al portapapeles.
- Datos: JSON con los jugadores disponibles para comprar (sin BD ni infraestructura). Formato exacto del JSON de export: se define al desarrollar esta fase (ver [[09-dudas]] §3).
- El output del participante se envía **externamente** (privado/email). Al cerrar el mercado, el dueño aplica las transferencias en `players.json` (`teams[]` + `status`) y hace una nueva build.

---

## FASE C — Simulador de partidos

> **⚠️ NO CONFIRMADA y muy susceptible a cambios.** Es la fase más abierta del roadmap; el diseño puede evolucionar o descartarse. No se planifica en detalle hasta cerrar A/B. Ver diseño objetivo en [[Simulador/00-simulador]] (borrador).
>
> Pre-requisito conceptual: el **generador masivo de jugadores** de la CL (origen de stats reales; mientras no exista, se simula con stats derivadas del `rating`).

### C1 · Motor puro
- `src/lib/simulator/`: RNG con semilla (determinismo), modelado por zonas, cascada de chequeos (d100), stats derivadas del `rating`.
- Perks declarativos y ejecución genérica; pifias/críticos por rangos estrechos.

### C2 · Partido completo simulable
- Forma, química (por capas), stamina, arqueros, árbitro, clima/estado del campo.
- Output 1:1 con el schema de `match` (`goals[]`, `cards[]`, `substitutions[]`, `stats`, `lineup`).

### C3 · Integración
- Render de partidos simulados con los componentes de [[06-partidos]] (B5) sin cambios.
- Generador masivo de jugadores de la CL alimenta stats reales (reemplaza derivadas).

### C4 · Página pública de simulación
- Input (equipos) → sim → output renderizado. (Opcional: predicciones de próxima fecha con seed estable y compartir sims por URL.)

---

## FASE D — Identidad de federaciones por `id` (diferida)

> **⚠️ DIFERIDA hasta que B1 estabilice el modelo de datos.** Hoy todo el dominio compara federaciones por `member.data.name` (61 ocurrencias en `dynamics/*`, además de `tournamentUtils`/`matchUtils`), lo que es frágil ante cambios de nombre. El objetivo es referenciar por `id` global.
>
> Pre-requisito: schema `matches` con `team1Id`/`team2Id` y `tournaments` con `championId`/`hostId`/`prizes.teamId` (parte de B1/B2).

### D1 · Modelo de matches/tournaments por id
- Migrar los 4 JSON de matches: `team1`/`team2` + `team1Code`/`team2Code` → `team1Id`/`team2Id` (id global de member).
- Migrar `tournaments`: `champion`→`championId`, `host`→`hostId`, `prizes.*.team`→`teamId`, `pots.teams`→ids.
- Mantener `team1`/`team2` como display name (denormalizado) o resolver desde el id.

### D2 · Refactor de comparaciones
- Reemplazar `member.data.name` por comparación por `id` en `src/lib/achievements/dynamics/*` (61 ocurrencias), `tournamentUtils.ts`, `matchUtils.ts` y `memberUtils.ts`.
- La función de participación (`getTournamentsByMemberParticipation`) pasa a comparar `team1Id`/`team2Id` === `member.data.id` (deja de matchear por nombre+código).
- Riscos: los 7 códigos de matches que hoy no matchean (`AKE`, `RUI`, `ROL`, etc.) deben resolverse durante la migración (member que corresponda).

---

## Orden recomendado de ejecución

```
1.  Branch "refactor/fase-a1"  →  A1   ✅ mergeado
2.  Branch "refactor/fase-a2"  →  A2   ✅ mergeado
3.  Branch "refactor/fase-a3"  →  A3   ✅ mergeado
4.  Branch "refactor/fase-a4"  →  A4   ✅ mergeado
5.  Branch "refactor/fase-a5"  →  A5   ✅ mergeado
6.  Branch "feature/fase-b1"   →  B1
7.  Branch "feature/fase-b2"   →  B2
8.  Branch "feature/fase-b3"   →  B3
9.  Branch "feature/fase-b4"   →  B4
10. Branch "feature/fase-b5"   →  B5
11. Branch "feature/fase-b6"   →  B6
12. Branch "feature/fase-b7"   →  B7
13. Branch "feature/fase-b8"   →  B8
14. Branch "feature/fase-b9"   →  B9
15. Branch "feature/fase-b10"  →  B10
16. Branch "feature/fase-b11"  →  B11 (mercado de pases)
```

> La Fase C (simulador) **no tiene orden asignado**: está pendiente de confirmación (ver "FASE C — Simulador de partidos" arriba).

> La Fase D (identidad por `id`) **también es diferida**: se ejecuta después de B1/B2, cuando el modelo de matches/tournaments tenga ids estables.

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
