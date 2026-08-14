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

> **Hecho (B3, infraestructura — sin skills reales todavía):**
> - `src/components/members/SquadCompact.astro`: plantel completo derivado de `players.json` (por `teamId` global, fallback `teamCode`), **2 columnas** (`# · [pos] nombre [OVR] estrellitas` | `club`/`nacionalidad` con banderita). Sin XI/titulares.
> - `src/components/ui/StarsDisplay.astro`: primitiva de estrellas 0.5–6 (completas/medias/vacías), reutilizable (club hero en B4, ranking en B5).
> - `src/config/positions.ts`: **12 posiciones canónicas** (`GK, CB, LB, RB, CM, CDM, CAM, RM, LM, CF, LW, RW`), `positionToRole` (mapa explícito, no heurística) y **colores de badge por rol** (GK=amarillo, DEF=azul, MID=verde, FWD=rojo). `ALL_SKILLS` (todas las habilidades).
> - `src/config/rating.ts`: `computeTeamRating(squad)` (media 0–100, sin skills → 0) + `TEAM_RATING_TO_STARS` (tabla del dueño "Rating 2" escalada a 0–100 ÷1.6, **thresholds editables a mano**) + `teamRatingToStars`. **`OVR_RATING_COLORS`**: tabla de colores del badge de OVR (thresholds → color, más "wow" a mayor valor), **definida por el dueño** en este archivo.
> - `src/data/players/index.ts`: `loadCurrentSquadByTeamId(teamId)` (id global como fuente de verdad).
> - **Regla: todos los jugadores deben tener TODAS las skills** (sin importar posición); validada por `players:link`. Posiciones legacy (`FWD`/`ST`/null) normalizadas a `CF`.
> - Integrado en `member/[slug]` tras el `MemberHero`: header "Squad" + **Poderío del equipo** (estrellas + rating) a la derecha. También en `club/[slug]` (B4) con `teamType="club"`.
> - **Pendiente**: los 239 jugadores no tienen skills aún (Bilsa se usó de demo).

### B4 · Página de club (`/clubs/<slug>`)
- Estética CL (negro + rombos lima, ver B7).
- `ClubHero` distinto del `MemberHero`: escudo/colores, federación dueña, **sin badges de logros**, con **rating del club (0-100) + estrellas**.
- Plantel completo (derivado de `players.json`, ver B3).
- **Stats del club solo de torneos FFC** (Forest Cup + CL), **NO** de liga doméstica (esta es solo tabla de contexto).
- Historial FCL y participaciones.
- Índice `/clubs` (galería con rating).

> **Hecho (B4, infraestructura + data de ejemplo):**
> - `src/pages/clubs/[slug].astro` + `/clubs/index.astro`: ruta por `club.code` (los links de `MemberClubs`/`DomesticLeagueTable` a `/clubs/<code>` ya resuelven).
> - `src/components/clubs/ClubHero.astro`: escudo con `colors` del club, federación dueña (`getMemberById(federationId)`), **sin badges de logros**, **rating del club (0-100) + estrellas** (`computeTeamRating` + `teamRatingToStars`, reutiliza B3; no hace falta `computeClubRating` separado). Fondo con rombos lima (estética CL parcial; la completa es B7).
> - `src/components/clubs/ClubCard.astro`: tarjeta para la galería con rating/estrellas.
> - `SquadCompact` reutilizado con `teamType="club"` → la 2da columna es **Nacionalidad** (banderita + nombre del país del jugador).
> - **Stats FFC** (Forest Cup + CL, NO liga doméstica): tabla por torneo con `getTeamStatsInTournament(club.id, ...)` + `getTeamFinalResult` (funcionan por id global de equipo). Sin partidos CL aún → filas "Didn't participate".
> - **Data de prueba**: los 6 jugadores de BIL (ids 24-29) asignados a Krulta BK (BILKRA, id 97) y Nordland FC (BILNOR, id 98) con `teamType: 'club'` + dorsal. La columna "Club" de la selección BIL ya muestra el club de cada jugador.
> - `ROUTES.clubs` agregado (`index`, `detail`).
> - `/clubs` y `/clubs/<code>` usan el layout de la sección CL (`src/layouts/FCL.astro`), no el `App`/navbar FC.
> - **Pendiente**: la estética CL completa (layout negro + rombos, home CL real) es **B7**.

### B5 · Rating de clubes y ranking FCL
- `computeClubRating(squad)` = agregación de ratings de la plantilla (0-100 → estrellas).
- **Ranking de la CL separado e independiente** del ranking de selecciones ([[03-ranking]] §5): no suma al ranking general.
- Se expone en la sección CL (ej. `/forestian-champions-league/ranking`).

> **Hecho (B5):**
> - El rating de club ya existe como `computeTeamRating(squad)` + `teamRatingToStars` (B4/B3); no hace falta `computeClubRating` aparte (mismo cálculo).
> - `src/pages/forestian-champions-league/ranking.astro`: ranking FCL **propio y separado** del de selecciones (no suma al general). Métrica actual: **rating del club** (agregación del plantel, 0-100 → estrellas); cuando existan partidos de CL se podrá sumar rendimiento FCL (ver [[09-dudas]] §6). Tabla: pos · club (escudo con colores + link) · federación · OVR · estrellas, con `getRankClass`.
> - `ROUTES.championsLeague.ranking` agregado; link "FCL Ranking" desde `/clubs`.
> - `/clubs`, `/clubs/<code>` y el ranking FCL usan el layout de la sección (`src/layouts/FCL.astro`).
> - La estética/navbar CL completa es **B7**.

### B6 · Script CLI de carga de goles
- `npm run players:link`: autocompleta `playerId` por `team + nombre`, reporta homónimos y escribe de vuelta.
- Modo `--strict` para CI; completar `number` (dorsal) como desambiguador.

> **Hecho (B6):**
> - `scripts/players-link.mjs` reescrito como **autocompletador + validador**: autocompleta `playerId`/`assistId` (goles), `playerId` (tarjetas/penales), `playerOutId`/`playerInId` (cambios) y `playerId` (lineup) resolviendo por **equipo + nombre exacto** (id global primero, code de fallback).
> - Ante **homónimos** muestra la lista (id · nombre · posición · dorsal · status) y **pregunta cuál elegir** (interactivo); con Enter saltea. `--dry-run` solo reporta; `--strict` falla si quedan referencias con nombre pero sin id.
> - Valida al final: **huérfanos** (ids que no existen en `players.json`, ERROR) y **skills completas** (WARN / ERROR en strict). Escribe preservando los saltos de línea originales (CRLF).
> - **Datos**: autocompletados 188 `playerId` + 125 `assistId` + 7 tarjetas + 11 penales en una pasada (goles con id: 346/666). Corregidos 5 penales legacy de Lumiose (`LUM_004`→id numérico). **Homónimo `C. Mcarthur`/`C. McArthur` fusionado** en un solo jugador (id 181, `C. McArthur`) con sus 9 goles/asistencias remapeados. Quedan **~123 referencias pendientes de decisión humana** (90 sin match por nombres que no coinciden, 33 sin plantel por equipos sin jugadores en `players.json`).
> - **Instructivo para cargar goles**: [[10-carga-de-goles]].
> - **Pendiente dueño**: cargar planteles faltantes y normalizar nombres de partido vs `players.json`.

### B7 · Layout y estética Champions League + navegación por sección
- `src/layouts/ChampionsLeague.astro` (fondo negro + rombos verde lima).
- Tokens CL (`--color-cl-black`, `--color-cl-lime` `#95ff00`, secundario `#00ff95`) y patrón de rombos CSS.
- **Navbar por sección**: la página principal es FC por defecto; al entrar a la sección CL cambia el navbar a la navegación CL (home, ranking, clubs, etc.). Volver a FC con selector/navbar. Home de CL en `/fcl/index.astro` (o ruta equivalente), con sus derivados (ranking, etc.). `articles`/`sponsors` quedan globales (se resuelve navegación en el plan de detalle de esta fase).
- Reemplazar placeholder `champions-league.astro`.

> NOTA: No se si es posible hacer este diseño para el fondo y los detalles de la FCL: que hayan diamantes (rombos) con grosor delgado, y cuyos vértices sean circulos (como si fueran nodos conectados) y que sean predominantemente verdes (el color del token --color-cl-lime) y con algunas zonas cian (el token secundario). Y que cada diamante no sea solamente un diamante, sino que tenga repetidos diamantes de las mismas proporciones pero mas chicos dentro, entonces queda como un efecto partón.

> **Hecho (B7):**
> - **Patrón CL global** `.cl-pattern` en `src/styles/global.css`: rombos (diamantes) de grosor delgado con **vértices circulares** (nodos conectados), verde lima (`--color-cl-lime`) con **acentos cian** (`--color-cl-lime-secondary`) en zonas alternadas, y **diamantes anidados más chicos** dentro (efecto patrón). Implementado como SVG data-uri ligero (sin assets). Es la **nota del dueño** de esta fase.
> - **`FCL.astro`**: fondo `bg-cl-black` + patrón a baja opacidad (reutilizable en toda la sección).
> - **`Navbar`/`Footer` CL** restyling a paleta cl (negro + lima, hover cian).
> - **Home real de CL en `/forestian-champions-league/`** (`src/pages/forestian-champions-league/index.astro`): hero con estética CL, ranking preview (top clubes por rating), sección formato (grupos → llaves → final) y nota de season 2027.
> - **Rutas**: `ROUTES.championsLeague.index` → `/forestian-champions-league/`; `champions-league.astro` (placeholder) pasa a **redirect** a la home.
> - `ClubHero` reutiliza `.cl-pattern` (se eliminó el patrón local).
> - **Pendiente**: `articles`/`sponsors` globales en la sección CL (ver [[09-dudas]] §8) y contenido de temporada/partidos CL en B10.

### B8 · Páginas individuales de partido
- `src/pages/matches/[...match].astro` con `getStaticPaths`.
- Componentes: MatchDetailHeader, Lineups, MatchStatsPanel, MatchTimeline.

> **Hecho (B8):**
> - `src/pages/matches/[match].astro` con `getStaticPaths` sobre todas las colecciones de matches (**236 páginas**, `/matches/match-<torneo>-<match>`). Layout `App` (FC). Redirige a `/404` si el id no existe.
> - Componentes en `src/components/matches/`:
>   - `MatchDetailHeader.astro`: breadcrumb, torneo/etapa/grupo/fixture, fecha/hora, estadio + capacidad, marcador con ganador resaltado, **penales** (si hubo), leg (ida/vuelta), link al video.
>   - `PenaltyShootout.astro`: detalle de la **tanda de penales** — cada pateador por equipo con ✓ (convirtió) / ✗ (falló) y resultado final.
>   - `MatchTimeline.astro`: eventos (goles con asistencia/penal/OG, tarjetas amarilla/roja/2ª amarilla, cambios) ordenados por minuto.
>   - `Lineups.astro`: formación + coach + XI/suplentes por equipo con **badges de posición** por rol (`@config/positions`) y dorsal.
>   - `MatchStatsPanel.astro`: tabla comparativa (posesión, tiros, tiros al arco, córners, faltas, offsides).
> - **Equipos resueltos por id global** con `getTeamById` (selección **o** club) → vista normalizada `TeamView` en `src/types/matchDetail.ts` (`@ty/matchDetail`). Links a `/members/<slug>` o `/clubs/<code>`.
> - `MatchCardDetailed` ahora enlaza a la página de detalle (link "Details" junto a Watch).
> - **Datos actuales**: sin lineups/stats/cambios todavía → estados vacíos ("not available"). Goles/tarjetas/penales sí renderizan (verificado en las 4 definiciones por penales).
> - Sección "More matches" (mismo torneo) al final.

### B9 · Páginas de logros por federación
- Ruta `/members/<slug>/achievements` (obtenidos / por obtener / secretos como `?` / progreso / puntaje).

> **Hecho (B9):**
> - `src/pages/members/[slug]/achievements.astro` (**96 páginas**, `/members/<slug>/achievements/`).
> - **Obtenidos**: grid de `AchievementCard` (flip cards con nombre, descripción, rareza y estrellas). **Todos los logros obtenidos se ven con su nombre/ícono**, incluso los marcados `visible:false` en la data (corrección del dueño: un secreto se revela al obtenerlo).
> - **Por obtener**: logros no logrados agrupados por categoría; los **visibles** como cards locked con tooltip, y los **secretos** (`visible:false`) como **`?`** sin revelar detalles (solo se ocultan hasta obtenerlos).
> - **Progreso**: barra de completitud (obtenidos/total, %) en el header.
> - Link "View all achievements →" en la página del miembro + `ROUTES.members.achievements(slug)`.
> - **Pendiente**: progreso `current/target` en los logros NO logrados — hoy los evaluadores dinámicos devuelven `null` cuando no se alcanza el umbral, así que los locked no muestran barra de progreso todavía (requiere refactor del engine para exponer progreso en estado no logrado).

### B10 · Forestian Champions League (contenido)
- Torneo CL con `type: 'forestian-champions-league'` y `season`.
- Rutas de la sección (home, season, fixtures, standings, ranking CL propio).
- Carga de datos de clubes y partidos CL (ida/vuelta, final simple).

> **Hecho (B10):**
> - **Torneo CL 2027** en `tournaments.json` (`id: 4`, `type: 'forestian-champions-league'`, `edition: 1`, `season: 2027`) con `pots.teamIds` = ids de clubes (97, 98).
> - **Partidos CL** `src/data/matches/champions-league-2027.json` (Grupo A, ida/vuelta con `leg`, `team1Type/team2Type: 'club'`, goles con `playerId`) + agregado al loader de `config.ts` (`players:link` valida 5 archivos, OK).
> - **Página de temporada**: `/forestian-champions-league/<season>/` es **una sola página por edición** (espejo de `/forest-cup/<edition>`): **Hero → Stats → Standings (`#standings`) → Fixtures (`#matches`)** todo inline. Se eliminaron `/…/standings` y `/…/matches`.
> - **`CLSeasonHero`** (sin imágenes, fuente Space Grotesk): edición **finalizada** → campeón (escudo + nombre) + "CHAMPIONS" + **estrellas = títulos CL acumulados**; edición **en curso/sin empezar** → texto "Forestian Champions League" + **año grande**. Botones → anclas `#standings`/`#matches`.
> - **`SeasonSwitcher`** compartido (FC y CL): filtra al tipo del torneo actual, muestra **solo el año**, y con 5+ ediciones enmarca la actual al centro (2 previas, 2 siguientes). Reemplaza el nav inline de `TournamentHero`.
> - **Fuente CL**: Space Grotesk (token `--font-cl`) aplicada al layout `FCL` → toda la sección CL se diferencia tipográficamente de la Forest Cup.
> - **Conexión con clubes**: `/clubs/<slug>` muestra la participación CL 2027, últimos partidos, goleadores (A. Arhanv), H2H y récords. Los links de torneo van a `/forestian-champions-league/<season>/` (fix del bug `…/1`).
> - **Pendiente**: más clubes/equipos y fase de knockout (R32→Final con ida/vuelta, `leg`) cuando existan más datos.

> **Hecho (2026): normalización `edition`/`season`**
> - **`season` = año (canónico)**, **`edition` = ordinal (1, 2, 3…)** para FC y CL por igual. Se migró **FC `edition` → 1..4** (antes era el año). Las URLs/display no cambian (usan `season`).
> - `getTournamentUrl(t)` en `tournamentUtils` centraliza los links (CL → season, FC → season). `ROUTES.forestCup.edition` → `season`; `ROUTES.championsLeague.standings/matches` eliminados.
> - Código que usaba `edition` como año → `season`: MatchCard* (labels/links), MatchDetailHeader, TournamentParticipationTable, TournamentHistoryTable, TournamentTopFour, FCCard*, Legend, `members/[slug]` (títulos), filterTags de forest-cup, logros (`dynamics/tournament.ts`, `awards.ts`). `events`/`roleplays`/`bonuses` y `tierHistory.edition` ya usaban `edition` = año (se mantienen, es otra colección).

> **Hecho (adelanto post-B9, 2026): paridad de la página de club + ligas domésticas v2**
> - **Ruta de clubes por slug** (el `code` es visual y puede repetirse): `@data/clubs` deriva `slug` del nombre con dedup (`-2`, `-3`), `getClubBySlug`, y se migraron todos los links (`ClubCard`, ranking FCL, matches, MemberClubs, liga). Ruta `/clubs/<slug>`.
> - **Ligas domésticas v2** (`src/data/leagues/leagues.json` → array): campo `division` (varias divisiones por federación), `federationId`, y zonas **`relegationPositions`** / **`championsLeaguePositions`** (listas de posiciones). Los clubes se referencian por **`clubId`** (nunca por code). Getters: `getFirstDivision`, `getLeaguesByFederation`, `getLeagueForClub`.
> - **`DomesticLeagueTable`** con filas de descenso en **rojo**, clasificación a CL en **verde**, **leyenda**, header "Division {n} · Season {año}", links por slug. Miembro → **primera división**; club → la división donde juega ese club (o mensaje "aún no hay registro de liga local").
> - **Refactor "team-agnostic"** (por id global): `getTeamView`/`getMatchTeamViews` en `memberUtils`; `MatchCardDetailed` y `MatchCardCompact` resuelven equipos por id (bandera para selección, inicial con color para club); `getTeamHeadToHeadStats` en `matchUtils`; nuevos `TeamLastMatches` y `TeamHeadToHead`; `ScorersTable`, `RecordsAndStats` y `TournamentParticipationTable` con `teamId`/`teamName`.
> - **`/clubs/<slug>` espeja a la selección** (sin hero nuevo, sin logros, sin noticias): Hero → Squad → Liga doméstica → Participaciones **Champions League** (solo CL; sin torneos CL → estado vacío; **se eliminó la tabla de "FFC Tournaments" que listaba Forest Cup**) → Últimos partidos → H2H → Goleadores/Asistidores → Récords. `ClubStats.astro` eliminado.
> - `member/[slug]` usa los componentes compartidos (visual idéntico) + liga primera división con zonas/leyenda.

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

## FASE D — Identidad global por `id` (selecciones + clubes)

> El diseño objetivo es referenciar por **`id` numérico global único** (una sola secuencia compartida entre `members.json` y `clubs.json`). El `code` queda solo para display (puede haber equipos con el mismo code). Hoy el dominio compara federaciones por `member.data.name`/`member.data.code` (61 ocurrencias en `dynamics/*`, además de `tournamentUtils`/`matchUtils`), lo que es frágil ante cambios de nombre/code.
>
> Pre-requisito cumplido: schema `matches` con `team1Id`/`team2Id` y `tournaments` con `hostId`/`championId`/`teamIds`/`prizes.teamId` (D1).

### D1 · Fuente de verdad: ids globales únicos (schema + datos + resolver) ✅
- Renumerar `members.json` (ids únicos 1..96, arreglando los 44×`9999` y los duplicados `17/34/35/39/40/41`) y `clubs.json` (97.., secuencia compartida), **preservando el orden visual** de `/members` (founders por id asc).
- Schema: `matches.team1Id/team2Id`, `tournaments.hostId/championId/teamIds/prizes.teamId`, `leagues.clubId`, `clubs.federationId`, `players.teams[].teamId` + `nationalityId`. `code`/`name` quedan solo display.
- Migración de datos con `scripts/teams-migrate.mjs`: resuelve `team1Id/team2Id` en los 4 JSON de matches (incluye los 7 códigos alias: `xVND`, `RUI`, `xOWN`, `xCHI`, `AKE`, `TRZ`, `ROL`), `hostId/championId/teamIds/teamId` en tournaments, `clubId` en leagues, `teamId/nationalityId` en players.
- Resolver: `getMemberById`, `getTeamById` (→ `{ type, member?, club? }`), `getMemberByMatchTeam` (id primero, fallback code→name), cache `memberByIdCache` en `collections.ts`.

### D2 · Refactor de comparaciones
- Reemplazar `member.data.name` por comparación por `id` en `src/lib/achievements/dynamics/*` (61 ocurrencias), `tournamentUtils.ts`, `matchUtils.ts` y `memberUtils.ts`.
- La función de participación (`getTournamentsByMemberParticipation`) pasa a comparar `team1Id`/`team2Id` === `member.data.id` (deja de matchear por nombre+código).

### D3 · Script `npm run teams:link` (validador de unicidad)
- Verifica **unicidad global** de ids entre `members.json` + `clubs.json` (evita que el dueño ponga dos `id: 5` sin darse cuenta).
- Reporta referencias huérfanas (`team1Id`/`hostId`/`teamId`/`clubId` sin entidad) y códigos no mapeados. Modo `--strict` para CI.

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
17. Branch "feature/fase-d1"   →  D1   (ids globales únicos: schema + datos + resolver)  ✅ mergeado
18. Branch "feature/fase-d2"   →  D2   (refactor de comparaciones por id)
19. Branch "feature/fase-d3"   →  D3   (script teams:link validador de unicidad)
```

> La Fase C (simulador) **no tiene orden asignado**: está pendiente de confirmación (ver "FASE C — Simulador de partidos" arriba).

> La Fase D (identidad por `id`) **ya no está diferida**: D1 está hecho (ids globales únicos en members+clubs, schema con `team1Id/team2Id`/`hostId`/`teamId`/`clubId`, resolver central). Quedan D2 (comparaciones por id) y D3 (validador).

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
