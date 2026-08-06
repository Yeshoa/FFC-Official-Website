# 02 — Diseño objetivo: modelo de datos

> Define la estructura de datos canónica hacia donde evoluciona el proyecto.
> Decisiones confirmadas: jugador multi-equipo · JSON central por jugador · 1 club → 1 federación · goles por id con script.

---

## 1. Principios

1. **Una sola fuente de verdad** por entidad (jugador, club, torneo, partido).
2. Todo se referencia por **id estable**; los nombres son solo display.
3. El modelo debe soportar **selecciones nacionales** (Forest Cup) y **clubes** (Champions League) de forma genérica.
4. La temporada es **por año**, no por torneo (ver `03-ranking.md`).

---

## 2. Jugador (entidad central)

### Ubicación
`src/data/players/players.json` (o `src/content/players/` si se prefiere collection tipada — ver nota abajo).

### Esquema propuesto

```ts
interface Player {
  id: string;                 // global único, ej: "P-0001" o "CAC_009" normalizado
  name: string;               // nombre completo
  rating: number;             // 0.5 … 6 (media estrella a 6 estrellas). Raro > 5.
  position: string;           // posición principal (GK, CB, CF, …)
  nationality: string;        // código de federación (ej: "BIL")
  birthdate?: string;
  // Equipos actuales e históricos
  teams: Array<{
    teamCode: string;         // referencia a federación o club
    teamType: 'national' | 'club';
    number?: number | null;   // dorsal
    from?: string;            // desde cuándo (año o temporada)
    to?: string;              // hasta cuándo (opcional si es actual)
    status: 'active' | 'retired' | 'transferred';
  }>;
}
```

### Decisiones
- **Un jugador = una entidad**. Estar en selección y en club no duplica la ficha; se resuelve con `teams[]`.
- El `id` de goles/lineups **debe** apuntar a este id global.
- Migración: los ids actuales (`CAC_009`, `BIL_001`) se conservan como el id de la entidad, pero dejan de estar "atados" al equipo (un jugador que se transfiere mantiene su id).

### Rating
- Escala **0.5 a 6** estrellas (0.5 = media estrella). `6` es excepcional/rarísimo.
- Se guarda como número: `rating: 0.5 | 1 | 1.5 | … | 6`.
- Puede haber un `ratingHistory` (opcional) para reflejar evolución por temporada, pero **no es requerido** en la primera iteración.

> Nota: la fuente canónica recomendada es **JSON central** (decisión confirmada). Si más adelante se quiere integración con `astro:content`, se puede envolver el JSON con un `loader` como ya hace `matches`.

---

## 3. Club

### Ubicación
`src/content/clubs/<slug>.md` (content collection tipada) o `src/data/clubs/*.json`. Se recomienda collection Astro para aprovechar esquema + imágenes.

### Esquema propuesto

```ts
interface Club {
  id: number;
  code: string;            // ej: "BILS_FC" — identificador de equipo en partidos
  name: string;
  shortName?: string;
  federation: string;      // código de federación dueña (1 club → 1 federación)
  logoPath?: string;
  founded?: number;
  stadiumId?: number;      // opcional
  colors?: { primary: string; secondary: string };
  squad?: { coach?: string; formation?: string; players: Array<{ playerId: string; number?: number; position?: string }> };
}
```

### Reglas
- Un club pertenece a **una sola federación** (`federation`).
- La **liga doméstica** es el conjunto de clubes de una misma federación → se muestra en la página del miembro ("su liga doméstica, si la tiene").
- En partidos, los equipos pueden ser **federación** o **club**: se identifica por `teamCode` con un prefijo o por un campo `teamType`/`entityType` en el partido.

---

## 4. Torneo

### Cambios a `tournaments`
- Ya existe `type: 'forest-cup' | 'forestian-champions-league'`. Mantener.
- Agregar **`season: number`** (año) explícito. `edition` sigue como "edición del torneo" (1, 2, 3, 4).
- `id` numérico **deja de ser la fuente de la temporada**: pasa a ser solo un identificador de colección.

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
3. Mantener `leg`, `aggregate`, `penalties`, `cards`, `substitutions`, `lineup` (con `playerId`), `stats`, `link` — ya están definidos y quedan listos para las páginas de partido (`06-partidos.md`).
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

- Desde `club.federation = <código miembro>` se listan los clubes de esa federación.
- Si el club tiene `squad`, se muestra su plantel; si el jugador de la federación está en un club, se cruza por `playerId`.

---

## 8. Migración (resumen)

1. Crear `players.json` central fusionando `by-team` + `historical` + `squad` de frontmatter; resolver homónimos una sola vez con el dueño.
2. Agregar `club` collection + schema.
3. Agregar `assistId` y `team*Type` al schema de matches; normalizar ids de jugadores en los JSON.
4. Agregar `season` a torneos; mantener `id` como secuencial.
5. Ajustar `playerUtils.ts` para importar la fuente real (y crear `@data/players/index.ts` que hoy falta).
