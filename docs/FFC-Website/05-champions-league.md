# 05 — Diseño objetivo: Forestian Champions League

> Nueva competición de clubes con estética propia (fondo negro + rombos verde lima).

---

## 1. Contexto

- Hoy `champions-league.astro` es un placeholder "Coming soon" que usa el layout `App` estándar.
- Ya existe `tournament.type = 'forestian-champions-league'` en el schema, sin uso.
- El objetivo es una estética **única** para toda la sección: `/forestian-champions-league` y derivados, páginas de clubes y sus derivados.

---

## 2. Formato de la competición (confirmado)

- **Misma estructura que la Forest Cup**: grupos → R32/R16 → QF → SF → Final.
- Con **ida y vuelta** (dos partidos por llave) en todas las instancias **excepto la Final** (un solo partido).
- Equivalente al formato de la UEFA Champions League pre-2024.

### Modelado
- Usa el campo `leg: '1' | '2' | 'single'` que ya existe en `matches`.
- Los goles tienen `aggregate` y `penalties` para definir clasificados.
- En partidos de ida y vuelta, el ganador se define por agregado (y penales si hace falta).

---

## 3. Estética

### Identidad visual
- **Fondo negro** como base de la sección.
- **Rombos verde lima fuerte** como motivo decorativo (pattern/acentos).
- Toda la sección CL usa esta estética, distinta del verde bosque del sitio general.

### Implementación
- Nuevo layout `src/layouts/ChampionsLeague.astro` (extiende/reutiliza `App` o `Layout` pero con su propia paleta y fondo).
- Tokens CSS dedicados en `src/styles/global.css` (o un `champions-league.css`):
  - `--color-cl-black`, `--color-cl-lime` (verde lima fuerte), acentos.
- Patrón de rombos: CSS `background` con `linear-gradient`s repetidos o SVG data-uri (ligero, sin assets extra).
- Componentes base CL reutilizables: `CLNavbar.astro`, `CLFooter.astro`, tarjetas de club, headers de torneo.

### Rutas
| Ruta | Contenido |
|------|-----------|
| `/forestian-champions-league` | Home de la competición |
| `/forestian-champions-league/<season>` | Edición/season |
| `/forestian-champions-league/<season>/matches` | Partidos de la edición |
| `/forestian-champions-league/<season>/standings` | Posiciones |
| `/forestian-champions-league/<season>/...` | Grupos, playoffs, etc. |
| `/clubs` | Índice de clubes |
| `/clubs/<slug>` | Página de un club (estética CL) |

> Las rutas exactas se ajustan en el plan de implementación (fase B).

---

## 4. Páginas de clubes

- `/clubs/<slug>`: escudo, nombre, federación dueña, liga doméstica, plantel (derivado de `players.json`, ver [[02-modelo-datos]] §8), historial CL, estadios.
- Se enlaza desde la página del miembro (federación) que lo posee.
- Estética CL (negro + lima) aunque el club participe o no de la CL, ya que es parte de la sección clubes.

---

## 5. Ranking de la CL (separado)

- La CL tiene su **propio ranking/tabla** (ver [[03-ranking]] §5), no mezclado con el ranking general de federaciones.
- Se expone en la sección CL (ej: `/forestian-champions-league/ranking`).
- **Hecho (B5)**: la página `/forestian-champions-league/ranking` ordena los clubes por **rating del club** (agregación del plantel, 0-100 → estrellas), separado del ranking de selecciones. Cuando existan partidos de CL se podrá sumar rendimiento FCL (ver [[09-dudas]] §6).

---

## 6. Ranking de ligas (domésticas)

> Diseño del ranking de ligas de la sección CL (ver [[Plan del usuario/09 - Sección champions league]]): análogo al ranking de federaciones, pero con **inputs propios de la liga** (rp/events/bonus por temporada). El dueño carga los datos; mientras no haya, las ligas quedan en 0.

### Modelo de datos
- Cada liga (`src/data/leagues/<fed>/division-<n>.json`) puede tener `score`: `{ rp, events, bonus }` indexados por **temporada** (`{ season: { activity: points } }`), mismo esquema que el `score` de los miembros ([[02-modelo-datos]]). Tipo `LeagueScore` en `@data/leagues`.

### Cálculo
- `src/lib/leagueRankingUtils.ts`: `getLeagueSeasonScore(league, season)` suma rp/events/bonus de la temporada; `getRankedLeagues` ordena por total (desc, tiebreak nombre); `getTopLeagues` para vistas compactas.
- Por ahora **sin decay ni normalización** (suma directa); extensible cuando haya data real.

### UI
- Página `/forestian-champions-league/leagues` (`ROUTES.championsLeague.leagues`): tabla con posición, liga (logo + nombre), federación, división, RP/EV/BO y total.
- Navbar FCL: botón **Leagues** (Home · Leagues · Clubs · Ranking · Market).
- Home FCL: panel compacto de rankings con toggle **Clubs/Leagues**.

### Clasificación a la CL (pots)
- Los clubes clasificados a la edición actual se derivan de las ligas: cada liga define `championsLeaguePositions` → `clubId`s de esas posiciones en su `standings`.
- `npm run qualify:cl` (scripts/qualify-cl.mjs) agrega los clasificados y llena `pots[0].teamIds/teamCodes/teams` del torneo CL más reciente en `tournaments-cl.json`.
- La página `/clubs` solo muestra los clubes en `pots.teamIds` de la edición actual.

---

## 7. Integración con el modelo

- Clubes: ver [[02-modelo-datos]] §3.
- Torneos: `type: 'forestian-champions-league'` + `season` (año).
- Partidos: `team1Type/team2Type: 'club'`, `leg`, `aggregate`.

---

## 8. Pasos de implementación (resumen)

1. Layout CL + tokens de color (negro/lima) + patrón de rombos.
2. Navegación/footer de la sección CL.
3. Páginas de clubes (modelo de datos primero, ver fase B).
4. Home + season + fixtures/standings de la CL.
5. Ranking CL propio. ✅ (B5) — `/forestian-champions-league/ranking` por rating de club.
6. Reemplazar placeholder `champions-league.astro`.
