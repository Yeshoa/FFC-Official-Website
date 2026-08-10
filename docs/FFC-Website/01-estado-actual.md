# 01 — Estado actual del proyecto

> Documenta cómo funciona hoy el proyecto. Base para los documentos de diseño objetivo.

---

## 1. Stack y estructura

- **Framework**: Astro 5 (`astro:content`, content collections tipadas con Zod).
- **Estilos**: Tailwind CSS 4 (via `@tailwindcss/vite`), config en `tailwind.config.mjs` + `src/styles/global.css` con `@theme`.
- **React**: solo para componentes que lo requieren (`@astrojs/react`, e.g. chat).
- **Deploy**: Netlify (`astro.config.prod.mjs`).
- **Alias TS** (`tsconfig.json`): `@components/*`, `@lib/*`, `@pages/*`, `@content/*`, `@data/*`, `@images/*`, `@styles/*`, `@ty/*`, `@config/*`, `@utils/*`.

### Carpetas clave

| Ruta | Contenido |
|------|-----------|
| `src/content/` | Content collections: `articles` (.mdx) + `_legacy-matches`. Las colecciones de datos (`members`, `tournaments`, `achievements`, `sponsors`, `stadiums`) viven en `src/data/` |
| `src/data/` | JSON fuera de Astro Content: `matches/*.json`, `events.json`, `roleplays.json`, `bonuses.json`, `tournaments.json`, `members.json`, `achievements.json`, `sponsors.json`, `stadiums.json`, `players/` (nuevo, sin commitear) |
| `src/lib/` | Lógica de dominio: `collections.ts` (cache/indexes), `rankingUtils`, `scoreUtils`, `bonusUtils`, `eventUtils`, `roleplayUtils`, `achievements/` |
| `src/utils/` | Helpers: `tournamentUtils`, `matchUtils`, `memberUtils`, `stadiumUtils`, `articleUtils`, `playerUtils` (nuevo, sin commitear) |
| `src/config/` | `routes.ts`, `links.ts`, `features.ts`, `easter-eggs.ts`, `constants.ts` |
| `src/components/` | Componentes por dominio: `members/`, `tournaments/`, `matches/`, `achievements/`, `index/`, `articles/`, `stadiums/`, `champions-league/` (placeholders) |
| `src/pages/` | Rutas. Existen `forest-cup/2026|2024|2022|2020.astro`, `champions-league.astro` (placeholder "Coming soon"), `ranking`, `matches`, `members`, `stadiums`, `sponsors`, `articles` |

---

## 2. Content collections (schema en `src/content/config.ts`)

### `tournaments` (loader `objectLoader` desde `src/data/tournaments.json`)
- Un único JSON por colección (mismo patrón que `matches`/`events`): objeto `{ [id]: data }` donde la key es el entry id (slug) y el valor conserva su `data.id` numérico.
- `id` (número), `type` (`forest-cup` | `forestian-champions-league`), `name`, `shortName`, `host`, `hostCode`, `final`, `image`, `champion`, `championCode`, `edition`, `pots[]`, `heroImg`, `cardImg`, `prizes`.
- El campo `type` **ya existe** (preparado para CL), pero hoy solo hay torneos `forest-cup`.
- `id` numérico **no es un año**: es un secuencial (2020→1, 2022→2, 2024→3, 2026→4). El año real está en `edition`.

### `matches` (loader desde `src/data/matches/*.json`)
- Cada JSON es un torneo (`forest-cup-2020.json`, `-2022`, `-2024`, `-2026`).
- Schema: `tournament_id`, `stage`, `group`, `fixture`, `round`, `leg` (`1|2|single`), `team1/team2` + `team1Code/team2Code`, `stadium_id`, `status`, `date`, `attendance`.
- Detalles: `goals[]`, `penalties[]`, `cards[]`, `substitutions[]`, `lineup` (coach/formation/players por equipo), `stats` (possession, shots, etc.), `link`.
- **Estado del trabajo en curso (sin commitear)**: se agregó `playerId` a goals/penalties/cards/substitutions/lineup y `assistId` se usa en los JSON pero **no está en el schema**. `playerUtils.ts` fue creado pero **no se usa en ninguna página** y hace `import ... from '@data/players/index'` que **no existe** (rompería el build si se usara).

### `members` (loader `objectLoader` desde `src/data/members.json`)
- Identifica a cada **federación**: `id`, `code` (3 letras, ej: `BIL`), `name`, `region`, `founded`, `affiliation`, `verified`, `founder`, `flagPath`, `logoPath`, `nslink`, `feddispatch`.
- **Score**: `score.rp/events/bonus` — records dinámicos indexados por **tournament id como string** (`"2": { history: 20 }`).
- `additionalPoints`, `tierHistory[]` (tier + edition).
- **`squad`**: coach, formation, `players[]` con `number/name/position/age` — **sin `id`**. Esta es la definición de plantel actual.
- `manualAchievements[]` — lista de ids de logros manuales.
- Migrado de `.md` a JSON en fase A5; el body markdown (solo existía en `bilsa.md`) se descartó por decisión del dueño.

### `achievements` (loader `objectLoader` desde `src/data/achievements.json`)
- `id`, `name`, `icon`, `description`, `rarity` (número), `stars`, `enabled`, `category`, `subcategory`, `alignment`, `unique`, `visible`, `cardStyle`.

### Otras colecciones
- `sponsors` (tier global/supplier/national) y `stadiums` → JSON consolidado con loader `objectLoader` (fase A5): `src/data/sponsors.json`, `src/data/stadiums.json`.
- `articles` → **quedan `.mdx`** (no se migran; decisión del dueño, usan componentes MDX).
- `events`, `roleplays`, `bonuses` cargados desde JSON con loader.

---

## 3. Sistema de puntos / ranking (`src/lib/`)

### Configuración (`scoreUtils.ts`)
- `SCORING_CONFIG`:
  - Categorías por porcentaje: Roleplay 30% · Eventos 50% · Bonus 20% → máximos 60/100/40 (sobre `MAX_RAW_POINTS = 200`).
  - Límites: `RP_MAX: 15`, `EV_MAX: 15`, `BO_MAX: 15`; pasados `PRP_MAX: 10`, `PEV_MAX: 40`, `PBO_MAX: 20`, `PED_MAX: 40`.
  - `DECAY_FACTORS`: edición -1 → 1.0, -2 → 0.5, -3 → 0.25, -4 → 0.1.
- `TIERS`: F 0, E 6, D 16, C 30, B 48, A 70, S 96, SS 126, X 160.
- `normalizePoints(raw, rawMax, normMax)` y `getCategoryMaxPoints`.

### Cálculo (`rankingUtils.ts`)
- `getMemberScoreDetails(member, currentTournamentId)` → desglose por current/past en rp, events, bonus + `tournamentDecayPoints`.
- `getRankedMembers(members)` → ranking completo de miembros **`verified`**.
- Decay de torneos: `calculateTournamentDecayPoints` usa los **últimos 4 ids** (`getLastFourTournamentIds`) con factores `[1.0, 0.5, 0.25, 0.1]`.
- `CURRENT_TOURNAMENT_ID` se define en `src/utils/tournamentUtils.ts` como `sortedTournaments[0]?.data.id` — **el torneo de mayor id**, no el año.

### Problemas detectados en ranking
1. `CURRENT_TOURNAMENT_ID = id más alto` mezcla "último torneo" con "temporada actual". Con la CL anual esto se rompe (ver [[03-ranking]]).
2. Los points se indexan por **tournament id string** en frontmatter; un cambio de `id` rompe el historial.
3. Decay se basa en *cantidad de torneos*, no en *años*: si hay 2 torneos por temporada (FC bianual + CL anual) los factores no corresponden a años reales.
4. `getCurrentRoleplayDataWithDefaults` recibe `memberName` sin usarlo (código muerto menor).

---

## 4. Logros (`src/lib/achievements/`)

- **Estáticos**: collection `achievements` + asignación manual vía `manualAchievements` en el miembro.
- **Dinámicos**: definidos en `dynamics/` (`tournament`, `streaks`, `rivalry`, `ranking`, `community`, `awards`, `special`) con `evaluate(matches, tournaments, member, members)`.
- `utils.ts`: `CATEGORIES`, `SUBCATEGORIES`, `ALIGNMENTS`, `hierarchy` (minor→major, p.ej. `3-win-streak → 5-win-streak`), `rarityStylesByAlignment`.
- `index.ts`: `getAchievementsForMember(name)` une estáticos+dinámicos, aplica supresiones y jerarquía, y ordena.
- **UI**: `AchievementCard.astro` (tarjetas grandes), `AchievementStars.astro`, estilos por rareza en `styles/` (`CommonCard`, `Uncommon`, `UltraRare`, `Ultimate`, etc.). Están pensados para **cartas**.
- El objetivo del plan es: **badges pequeños con ícono** en el `MemberHero` + **página de logros por federación** con progreso y logros secretos ocultos.

---

## 5. Jugadores (fuentes de verdad actuales)

Hay **tres fuentes desconectadas**:

1. **`squad.players[]`** en el frontmatter de cada miembro (`.md`) — sin ids, solo nombre/posición/número.
2. **`src/data/players/by-team/<code>.json`** (nuevo, sin commitear) — planteles actuales con `id` (`BIL_001`), `name`, `position`, `number` (casi siempre `null`), `status`.
3. **`src/data/players/historical/<torneo>/<code>.json`** (nuevo, sin commitear) — planteles por edición (2020/2022/2024/2026).

Los partidos ya referencian `playerId` en goles (ej: `CAC_009`). No existe `src/data/players/index.ts` aunque `playerUtils.ts` lo importa.

### Problemas detectados en jugadores
1. 3 fuentes de verdad sin sincronizar; los `id` de `by-team` no están conectados al `squad` del frontmatter.
2. No hay forma de expresar que un jugador pertenece a selección **y** a club.
3. Cargar goles exige buscar el id a mano (molestia principal reportada).
4. `number` está mayormente en `null` → desambiguar jugadores por camiseta hoy es imposible.

### Mala práctica transversal (confirmada por el dueño)
- Los equipos se resuelven por **`teamName`** en varios utils (`getMemberByName`, `team1/team2` en matches, `tournamentUtils`). Cualquier typo o cambio de nombre rompe la resolución. **Objetivo**: migrar a lookup por **código** (`teamCode` → `member.code`/`club.code`), ver [[02-modelo-datos]] §10.
- El `squad` del frontmatter repite nombre/posición/edad de cada jugador en vez de referenciar ids (ver [[02-modelo-datos]] §8).
- El contenido vive en muchos `.md` (abrumador); objetivo: migrar a JSON (ver [[02-modelo-datos]] §9). Ya migrado: 5 colecciones de datos en `src/data/*.json` (fase A5); `articles` quedan `.mdx`.

---

## 6. Estilos y colores

- `src/styles/global.css`:
  - `@theme` con `--color-mint-500`, `--color-forest`, `--color-forest-light`, `--color-forest-dark`, `--color-green-1000`, breakpoints custom, spacing `--spacing-8xl`.
- `App.astro` aplica `bg-gradient-to-br from-green-1000 to-green-900 to-80% text-white` como fondo global.
- **No existe `--color-primary` ni una paleta de tokens consistente**: los colores se usan de forma ad-hoc con clases Tailwind (ver [[07-consistencia]]).
- `champions-league.astro` es un placeholder "Coming soon" que usa el layout `App` estándar (verde). No hay layout negro/verde lima todavía.

---

## 7. Cosas que NO se tocan (por requerimiento)

- **Artículos**: se ven perfectos.
- **Lo visual**, salvo ajustes de consistencia (márgenes/padding/colores).
