# 02 — Diseño objetivo: modelo de datos

> Define la estructura de datos canónica hacia donde evoluciona el proyecto.
> Decisiones confirmadas: jugador multi-equipo · JSON central por jugador · 1 club → 1 federación · goles por id con script · **migrar contenido a JSON** · `squad` derivado de `players.json`.

---

## 1. Principios

1. **Una sola fuente de verdad** por entidad (jugador, club, torneo, partido).
2. Todo se referencia por **id estable**; los nombres son solo display.
3. El modelo debe soportar **selecciones nacionales** (Forest Cup) y **clubes** (Champions League) de forma genérica.
4. La temporada es **por año**, no por torneo (ver [[03-ranking]]).
5. **Contenido en JSON, no en Markdown**: la abundancia de `.md` en `/content` es incómoda de mantener. Todo contenido se define en JSON (ver §9).

---

## 2. Jugador (entidad central)

### Ubicación
`src/data/players/players.json` (o `src/content/players/` si se prefiere collection tipada — ver nota abajo).

### Esquema propuesto

```ts
type SkillId =
  // habilidades de campo (simulador [[Simulador/00-simulador]] §6)
  | 'shortRange' | 'mediumRange' | 'longRange'      // precisión corta/media/larga
  | 'heading'                                        // precisión de cabeza
  | 'pace' | 'agility' | 'stamina' | 'jumping'
  | 'dribbling' | 'fakes' | 'ballControl'
  | 'stability' | 'positioning' | 'vision'
  | 'tackling' | 'sliding' | 'clearing' | 'power'
  // arqueros
  | 'reflexes' | 'gkPositioning' | 'stretch' | 'saveClose' | 'catch'
  // no-habilidades (opcional)
  | 'injuryResistance';

interface Player {
  id: number;                 // global autoincremental, único (no por nacionalidad)
  name: string;               // nombre completo
  position: string;           // posición principal (ver "Posiciones" más abajo)
  nationality: string;        // código de federación (ej: "BIL")
  birthdate?: string;
  birthplace?: {              // lugar de nacimiento
    city?: string;
    state?: string;           // estado/provincia/región
  };
  // Habilidades del simulador — escala 0-100 por habilidad
  // REGLA: TODAS las habilidades, sin importar la posición (ver "Posiciones" abajo)
  skills: Partial<Record<SkillId, number>>;
  stars?: { overall: number };        // reservado; ver "Rating / Estrellas" abajo
  // Equipos actuales e históricos
  teams: Array<{
    teamCode: string;         // referencia a federación o club
    teamType: 'national' | 'club';
    number?: number | null;   // dorsal
    from?: string;            // desde cuándo (año o temporada)
    to?: string;              // hasta cuándo (opcional si es actual)
    status: 'active' | 'retired' | 'transferred';
  }>;
  retired?: boolean;          // retirado 100% (fuera del mercado de pases FCL; ver "Jugadores históricos" abajo)
}
```

### Decisiones
- **Un jugador = una entidad**. Estar en selección y en club no duplica la ficha; se resuelve con `teams[]`.
- El `id` de goles/lineups **debe** apuntar a este id global.
- **`id` global autoincremental** (numérico, sin formato por nacionalidad): no hay límite por federación y los ids nunca colisionan. La nacionalidad vive en el campo `nationality`, no en el id.
- Migración: los ids actuales tipo `CAC_009`, `BIL_001` se remapean a los ids globales con una **tabla de conversión determinista** (script `players:link`), y todas las referencias en partidos (`playerId`) y planteles se actualizan. Un jugador que se transfiere mantiene su id.
- **`position` es del jugador** (su posición principal) — sirve para futuras cartas de jugador. El `squad` del equipo puede **sobreescribir** posición/dorsal para ese equipo (ver §8).
- **Lugar de nacimiento**: `city`/`state` se agregan para completar la ficha; opcional en la primera iteración (los datos se completan cuando el dueño los tenga).

### Posiciones (vocabulario canónico)

| Rol (color de badge) | Posiciones | Abreviatura |
|---------------------|------------|-------------|
| Arquero (**amarillo**) | Arquero | `GK` |
| Defensa (**azul/celeste**) | Defensa central · Lateral izq · Lateral der | `CB` · `LB` · `RB` |
| Mediocampo (**verde**) | Mediocentro · Medio defensivo · Medio ofensivo · Medio por derecha · Medio por izquierda | `CM` · `CDM` · `CAM` · `RM` · `LM` |
| Delantera (**rojo**) | Delantero centro · Extremo izq · Extremo der | `CF` · `LW` · `RW` |

- Vocabulario cerrado de **12 posiciones** (`GK, CB, LB, RB, CM, CDM, CAM, RM, LM, CF, LW, RW`), definido en `src/config/positions.ts`.
- El rol (y su color) se resuelve con `positionToRole(position)` (**mapa explícito**, no heurística): `GK`→amarillo · `DEF`→azul · `MID`→verde · `FWD`→rojo.
- El badge de posición se muestra con **fondo del color del rol**.
- Las antiguas siglas (`FWD`, `ST`, etc.) se normalizaron a este vocabulario (script de migración: `FWD`→`CF`, `ST`→`CF`).

### Regla: todas las habilidades, siempre

- **Todos los jugadores, sin importar su posición, deben tener asignadas TODAS las habilidades** (`ALL_SKILLS`, lista canónica en `src/config/positions.ts`). El hecho de que un jugador sea arquero no lo exime de tener skills de campo (y viceversa).
- El `rating` se sigue derivando solo de las skills ponderadas por el rol (ver abajo), pero la **data** debe contener el set completo.
- El dueño puede dejar las del rol con valores reales y el resto como placeholder; **la validación** (`npm run players:link`) reporta jugadores con skills incompletas.

### Rating / Estrellas (derivados, no editables a mano)

- **Skills** se guardan en escala **0–100** (consistente con el d100 del simulador).
- **`rating` del jugador (0–100)** se **calcula automáticamente** desde las skills con una ponderación según `position` (función pura, ej. `computePlayerRating(skills, position)`). No se edita a mano: si cambia una skill, cambia el rating.
- **Estrellitas (0.5–6, pasos de 0.5)** se **derivan del rating 0–100** con una tabla de conversión (`ratingToStars(rating)`). `6` es excepcional/rarísimo. La tabla exacta se define en una constante (config) y se ajusta con el dueño más adelante.
- **Color del badge de OVR** según el valor (más alto = más llamativo): tabla de thresholds `OVR_RATING_COLORS` en `src/config/rating.ts`, **definida por el dueño** junto con los thresholds.
- **Rating de equipo (federación/club)** es la agregación de ratings de su plantel (media ponderada, también 0–100 → estrellas). La tabla de "poderío de selección" del dueño ([[Plan del usuario/02 - Segunda actualización]]) aplica a **equipos**, no a jugadores individuales.
- Se muestran estrellitas junto a cada jugador en el squad (ver [[02-modelo-datos]] §8 y fase B3 del plan).

> Nota: la fuente canónica recomendada es **JSON central** (decisión confirmada). Si más adelante se quiere integración con `astro:content`, se puede envolver el JSON con un `loader` como ya hace `matches`.

### Jugadores históricos (snapshots por torneo)

> Nota del dueño ([[Plan del usuario/05 - Jugadores históricos]]): registrar retiros, que los goles cuenten
> **toda la carrera** (por id global) y guardar los **skills del torneo** en `data/players/historical`
> para futuras **cartas de jugadores históricos**.

- **Retiro**: el jugador se marca retirado **por entrada de `teams[]`** (`status: 'retired'`) **o por flag global
  `retired: true`** (retiro 100%, usado por el mercado de pases FCL). Si no le queda
  ninguna entrada `active`, deja de aparecer en los planteles derivados. El jugador **mantiene su id y sus
  goles de carrera** (los partidos lo siguen referenciando por `playerId`, incluso retirado). Helper de
  conveniencia: `isPlayerRetired(player)` = `retired === true` **o** ninguna entrada `active`.
- **Carrera por id**: los goles ya apuntan al `playerId` global ([[10-carga-de-goles]]); sumar los goles de
  toda la carrera (selección + club + todos los torneos) es agregar por id. Es **deuda de datos** (faltan
  ids en ~314 goles y equipos sin plantel), no de modelo.
- **Snapshot histórico** (`src/data/players/historical/<torneo>/<code>.json`): hoy guarda jugadores con id
  legacy (`ROL_001`), `position` legacy (`FWD`) y **sin skills**. El formato objetivo agrega `playerId`
  **global** (vincula con `players.json` y la carrera) + `skills` (snapshot 0–100, todas las skills) y
  normaliza `position` al vocabulario canónico ([[02-modelo-datos]] "Posiciones"):

```json
{
  "teamCode": "ROL",
  "teamName": "Roless",
  "tournament": "forest-cup-2026",
  "tournamentEdition": 3,
  "snapshotDate": "2026-05-13",
  "players": [
    {
      "playerId": 181,
      "name": "C. McArthur",
      "position": "CF",
      "number": 9,
      "skills": { }
    }
  ]
}
```

- La **carta histórica** (futuro) combina **stats de carrera** (goles/partidos agregados por `playerId` desde los
  partidos) + **skills del torneo** (del snapshot). No está planeada aún; el formato del snapshot queda listo.
- `playerId` es opcional si el jugador no existe en `players.json` (ej. planteles de torneos viejos sin
  ficha): la carta se arma igual del snapshot.
- **`skills` es obligatorio para TODOS los jugadores del snapshot** (misma regla ALL_SKILLS 0–100): el dueño
  planea un **álbum de figuritas** (o similar) que use toda la data histórica. La validación de completitud
  se puede sumar a `npm run players:link`.
- Decisiones confirmadas: [[09-dudas]] §9.

---

## 3. Club

### Ubicación
`src/data/clubs/<code>.json` (o collection con `loader` de JSON como `matches`). **En JSON**, no `.md`.

### Esquema propuesto

```ts
interface Club {
  id: number;              // id global (fuente de verdad, Fase D)
  code: string;            // SOLO VISUAL. Libre, puede repetirse. NO se usa como key/ruta.
  name: string;
  shortName?: string;
  federation: string;      // código de federación dueña (1 club → 1 federación, display)
  federationId?: number;   // id global de la federación dueña (fuente de verdad)
  logoPath?: string;
  founded?: number;
  stadiumId?: number;      // opcional
  colors?: { primary: string; secondary: string };
  budget?: number;         // presupuesto FCL (derivado del poder federativo, se carga por el dueño)
  squad?: { coach?: string; formation?: string };
  slug: string;            // ruta única DERIVADA del nombre (slugify + sufijo numérico si hay duplicado)
}
```

### Reglas
- Un club pertenece a **una sola federación** (`federationId`).
- **`code` es solo display** (decisión del dueño): puede repetirse y no tiene reglas de formato. No se usa como key ni como ruta. La **ruta del club es un `slug` derivado del nombre** (`/clubs/<slug>`); si dos clubes se llaman igual, se agrega un sufijo numérico (`-2`, `-3`).
- El **`budget`** es el presupuesto FCL del club: se carga por el dueño, derivado del poder federativo para la FCL (dato externo, normalizado según el formato FCL §4.3). No lo edita el participante; este solo lo gasta en el simulador de mercado de pases.
- El **plantel del club se deriva de `players.json`** (ver §8): no se repite en `club.squad`.
- La **liga doméstica** se define en `src/data/leagues/` por **`clubId`** (no por code) y con **divisiones** (ver §7). La página del miembro muestra la **primera división** de su federación; la del club muestra la división donde juega ese club.
- En partidos, los equipos pueden ser **federación** o **club**: se identifica por `team1Id/team2Id` (id global) + `team1Type/team2Type`.
- **Sin badges/logros** en la página del club: los logros son de federaciones, no de clubes (decisión del dueño).
- El **rating del club** se deriva de su plantel (mismo mecanismo que el rating de federación), para el ranking FCL.

---

## 4. Torneo

### Cambios a `tournaments`
- Ya existe `type: 'forest-cup' | 'forestian-champions-league'`. Mantener.
- **`season: number` = año (canónico)**; **`edition` = ordinal (1, 2, 3…)**. Normalizado (2026): FC migró `edition` de año a ordinal (2020→1, 2022→2, 2024→3, 2026→4). **Todo lo que significa "año" usa `season`** (URLs con `getTournamentUrl`, display, orden, decay, logros). FC y CL quedan iguales: `{edition: ordinal, season: año}`.
- `id` numérico **deja de ser la fuente de la temporada**: pasa a ser solo un identificador de colección.
- Nota: `events`/`roleplays`/`bonuses` y `tierHistory.edition` (miembros) usan `edition` = año/temporada; es otra colección y se mantiene así.

```ts
{
  id: 5,
  type: 'forestian-champions-league',
  season: 2027,       // año de la temporada
  edition: 1,         // 1ra Champions League
  name: 'Forestian Champions League 2027',
  ...
}
```

### Formato CL
- Igual que Forest Cup (grupos → R32/R16 → QF → SF → Final), con **ida y vuelta** en todas las instancias **excepto la Final**.
- Esto se modela con el campo `leg: '1' | '2' | 'single'` que **ya existe** en `matches`. El "aggregate" ya está soportado en `goals[].aggregate`.

---

## 5. Partido

### Cambios a `matches`
1. **Agregar `assistId` al schema** (ya está en los JSON, Zod lo ignora por ser no-estricto). Además `assistId` en `goals[]`.
2. Asegurar que `team1/team2` referencien de forma consistente federaciones **o** clubes. Propuesta: mantener `team1/team2` (nombre) + `team1Code/team2Code`, y agregar `team1Type/team2Type: 'national' | 'club'` para resolver entidad correcta.
3. Mantener `leg`, `aggregate`, `penalties`, `cards`, `substitutions`, `lineup` (con `playerId`), `stats`, `link` — ya están definidos y quedan listos para las páginas de partido ([[06-partidos]]).
4. Los `playerId` de goles/lineups apuntan al **id global de jugador**.

---

## 6. Carga de goles (solución al dolor reportado)

### Problema
Cargar un gol pide el `playerId` y hay que buscarlo a mano. No se puede resolver solo por nombre: **existen jugadores con el mismo nombre** (confirmado por el dueño).

### Solución: Script CLI de asistencia + id como fuente de verdad
- Se mantiene **`playerId` como fuente de verdad** (no resolver por nombre en runtime).
- Un script `npm run players:link` (o `goals:assist`) hace:
  1. Lee el JSON de partido y el JSON central de jugadores.
  2. Para cada gol/tarjeta/sustitución que tenga `player` pero **no** `playerId` (o esté marcado como pendiente), busca candidatos por **`team` + nombre normalizado**.
  3. Si hay **1 candidato exacto** → autocompleta el `playerId` y reporta.
  4. Si hay **múltiples candidatos con el mismo nombre** en el mismo equipo → escribe al terminal la lista (con `id`, posición, dorsal, status) para que el humano elija por índice, o **falla con error** para que se complete a mano (modo CI).
  5. Escribe los ids de vuelta al JSON y valida que no queden huérfanos.
- Guardias: nombres normalizados (sin acentos/case), `number` para desambiguar cuando exista, y `--strict` en CI para no commitear ids faltantes.
- **No** reemplaza la decisión humana cuando hay homónimos: el script solo la hace más fácil (muestra la lista en vez de que busques en otro archivo).

### Mejora complementaria (recomendada)
- Completar el campo `number` (dorsal) de los jugadores: convierte homónimos en desambiguables y habilita lineups reales.

---

## 7. Cómo se resuelve "la página del miembro muestra su liga doméstica"

- Desde `club.federationId` se listan los clubes de esa federación.
- Si el club tiene plantel, se muestra (derivado de `players.json`, ver §8); si el jugador de la federación está en un club, se cruza por `playerId`.

### Ligas domésticas (hardcodeadas en JSON, con divisiones)
- Las **tablas de liga se hardcodean en JSON** (sin calcularse): `src/data/leagues/leagues.json` → **array de ligas**.
- Cada liga pertenece a una federación (`federationId`), tiene **`division`** (una federación puede tener varias divisiones) y su **`season`**.
- Los clubes se referencian por **`clubId`** (id global, NO por code: el code es visual y puede repetirse).
- Campos de zonas: **`relegationPositions: number[]`** (posiciones que descienden) y **`championsLeaguePositions: number[]`** (posiciones que clasifican a la Champions League). En la tabla, las filas de descenso se muestran en **tono rojo**, las de clasificación a CL en **tono verde/brilloso**, con **leyenda**.
- Getters en `@data/leagues`: `getFirstDivision(federationId)`, `getLeaguesByFederation(federationId)`, `getLeagueForClub(clubId)`.

```json
{
  "id": "bil-div1",
  "name": "Bilsa First Division",
  "division": 1,
  "federationId": 1,
  "season": 2026,
  "relegationPositions": [17, 18],
  "championsLeaguePositions": [1, 2, 3, 4],
  "standings": [
    { "position": 1, "clubId": 97, "played": 2, "won": 1, "drawn": 1, "lost": 0, "goalsFor": 4, "goalsAgainst": 2, "points": 4 }
  ]
}
```

- **Página del miembro**: muestra la **primera división** de su federación (`getFirstDivision`). Si no hay liga pero tiene clubes → **lista de clubes**; si no tiene nada → no se muestra sección.
- **Página del club**: muestra la **división donde juega ese club** (`getLeagueForClub`); si no hay liga → mensaje "aún no hay registro de liga local".
- **Las stats del club solo cuentan torneos FFC** (Forest Cup + Champions League), **NO** la liga doméstica: esta es solo una tabla estática de contexto.

### Infraestructura primero (decisión dueño 2026)
- En la primera iteración se implementa el **schema, loader y componentes** de la liga doméstica (tabla + lista de clubes), **sin cargar datos reales**. Se agregan datos cuando el dueño los tenga.

---

## 8. Squad derivado de `players.json`

> Decisión del dueño: `squad.players[]` es vestigio y se elimina. El plantel se obtiene de la data de jugadores; no hay marcador de titularidad.

### Problema
El `squad.players[]` actual del frontmatter repite `name/position/age` de cada jugador, cuando esa info ya vive (o va a vivir) en `players.json`. Además el **coach no está en la data de jugadores**.

### Solución
- El **plantel** de un equipo (federación o club) se **deriva de `players.json`**: se filtran los jugadores con una entrada en su `teams[]` cuyo `teamCode` coincida con el equipo y `status: 'active'`. Cero mantenimiento extra: el plantel se actualiza solo cuando se edita `teams[]`.
- El `squad` del equipo queda solo con lo que **no es un jugador**:

```ts
squad: {
  coach?: string;                    // el coach queda acá (no es un jugador)
  formation?: string;                // ej: "4-3-3"
}
```

- Lo **específico del equipo** por jugador (dorsal, etc.) vive en la entrada de `teams[]` del jugador (ya existe `number`); la posición usada en el equipo es la `position` principal del jugador salvo que se decida agregar un override.
- **No hay boolean de titularidad**: la página del club/selección muestra el **plantel completo ordenado por posición** (no por XI/titulares).
- El **XI concreto** de cada partido (quiénes juegan, quiénes van al banco) vive en el `lineup` del partido, que ya está en el schema de matches ([[06-partidos]]).
- **Coach**: se mantiene como campo suelto del squad (no es jugador, no va a `players.json`).

### Display del squad (tabla compacta, `SquadCompact`)
- **2 columnas**, sin columnas sueltas de Pos/OVR/Estrellas:
  1. **Jugador**: `dorsal · [badge posición] nombre [badge OVR] ☆estrellitas` (todo en una celda).
  2. **Club / Nacionalidad**:
     - Si es **selección nacional** (`teamType: 'national'`): el **club** activo del jugador (entrada de `teams[]` con `teamType: 'club'`); sin club → `—`.
     - Si es **club** (`teamType: 'club'`): la **nacionalidad** del jugador con **banderita** (flag del miembro) junto al nombre.
- **Badge de posición**: fondo del color del rol (amarillo/azul/verde/rojo, ver "Posiciones").
- **Badge de OVR**: fondo según `OVR_RATING_COLORS` (a mayor valor, color más llamativo).
- Orden del plantel por rol `GK→DEF→MID→FWD`.

---

## 9. Migración de contenido a JSON

> Decisión del dueño: migrar todo el contenido de `/content` a JSON.

### Alcance
- Colecciones que hoy son `.md`: `members`, `tournaments`, `achievements`, `sponsors`, `stadiums`, `clubs` (futura).
- Los `.md` actuales tienen **frontmatter** + **cuerpo markdown**. Para las que tienen cuerpo (p.ej. descripciones de `members`), el cuerpo se mantiene como string en el JSON (markdown) o como campo separado.
- **`articles` NO se migran**: son `.mdx` con componentes MDX e imports; quedan como están (decisión del dueño).
- `matches`, `events`, `roleplays`, `bonuses` ya son JSON.

### Forma de implementación (implementada en A5)
- **Resultado final**: un **único JSON por colección** en `src/data/` — `members.json`, `tournaments.json`, `achievements.json`, `sponsors.json`, `stadiums.json` — con formato objeto `{ [id]: data }` (la key es el entry id/slug; el valor conserva su `data.id` numérico si existe).
- Cargadas en `src/content/config.ts` con un **loader custom** (`objectLoader`) que itera el objeto y hace `store.set({ id, data })`. Se usa loader custom (no el atajo `loader: () => data`) porque el atajo simple acopla `entry.id` con `data.id` del schema, y en `members`/`tournaments`/`stadiums` el entry id es el slug pero `data.id` es un número.
- **`articles` NO se migran**: son `.mdx` con componentes MDX e imports; quedan como están (decisión del dueño).
- **Body markdown de members descartado** (solo existía en `bilsa.md`) por decisión del dueño.
- Se mantienen los **mismos schemas Zod** intactos; solo cambia el formato de origen.
- El contenido se convirtió campo a campo (script de migración).
- `matches`, `events`, `roleplays`, `bonuses` ya eran JSON con loader.

### Impacto
- Menos archivos, más fácil de mantener/editar a mano.
- Posibilita generar/validar datos con scripts (CLI).
- Requiere actualizar `01-estado-actual.md` (cómo se cargan hoy) al migrar cada colección.

---

## 10. Referencias por id (eliminar `teamName` como key)

> Decisión del dueño: el patrón actual de resolver equipos por **nombre** (`getMemberByName`, `team1/team2`) es una mala práctica.

### Problema
- `teamName` se usa como parámetro de lookup en varios utils (`tournamentUtils`, `matchUtils`, etc.). Cualquier typo o cambio de nombre rompe la resolución.
- Los partidos guardan `team1/team2` (nombre) + `team1Code/team2Code` (código).
- **`code` no es único globalmente**: puede haber dos equipos (selección o club) con el mismo code. El `code` es solo display.

### Solución (Fase D)
- **`id` numérico global = identificador canónico de todo equipo** (selección **o** club), en **una sola secuencia** compartida entre `members.json` y `clubs.json`. Un id identifica a un único equipo en todo el universo (no hace falta el tipo para desambiguar).
- `matches` ganan `team1Id/team2Id`; `tournaments` `hostId/championId` y pots `teamIds`/prizes `teamId`; `leagues` `clubId`; `clubs` `federationId` (id del miembro dueño); `players` `teams[].teamId` + `nationalityId`.
- `code`/`name` quedan **solo para display**; no se usan como key de resolución.
- Resolver central: `getTeamById(id)` → `{ type, member?, club? }`, `getMemberById(id)`, `getMemberByMatchTeam` (id primero, fallback code→name durante la migración).
- `getMemberByName` se mantiene solo donde no queda otra (logros/goles), pero el objetivo es migrar a lookups por id.
- Validación: `npm run teams:link` chequea unicidad global de ids (`members.json` + `clubs.json`) y referencias.

---

## 11. Migración (resumen)

1. Crear `players.json` central fusionando `by-team` + `historical` + `squad` de frontmatter; **reasignar ids globales autoincrementales** (tabla de conversión desde `CAC_009`-style) y resolver homónimos una sola vez con el dueño. Agregar `skills` (0-100, placeholder) y `birthplace` al schema.
2. Crear `club` collection + schema (JSON).
3. Crear infraestructura de **ligas domésticas** (`src/data/leagues/`) con schema + loader + componentes (sin datos en la primera iteración).
4. Agregar `assistId` y `team*Type` al schema de matches; normalizar ids de jugadores en los JSON.
5. Agregar `season` a torneos; mantener `id` como secuencial.
6. Ajustar `playerUtils.ts` para importar la fuente real (y crear `@data/players/index.ts` que hoy falta).
7. Eliminar `squad.players` del frontmatter y completar `teams[]` en `players.json` (el plantel se deriva, ver §8).
8. Migrar contenido de `.md` a JSON (ver §9).
8. Migrar lookups de `teamName` a códigos (ver §10).
