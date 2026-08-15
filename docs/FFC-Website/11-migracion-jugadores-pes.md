# 11 — Migración de jugadores PES (Forest Cup 2026)

> Plan aprobado por el dueño ([[Plan del usuario/08 - Migración de jugadores y otros cambios]]).
> Traspasa los 832 jugadores del CSV `all_teams_20260501_195001.csv` (generado por
> `D:\HMH\Forest\Forest Cup 2026\generador\PES_2021_Generator`) a `players.json` como **jugadores activos**.

---

## 1. Fuente y alcance

- **CSV**: 832 filas = **32 federaciones × 26 jugadores** (planteles FC 2026, coincide con el draw de 32 equipos).
- **Dict de países**: el que está en el plan del dueño es el `COUNTRY_CODES` de `config.py` del generador
  (códigos PES numéricos 191-245). Son 40 códigos, el CSV solo usa 32 (faltan Zerphen, Columbiqash, New
  Libertalia Kingdom, Otterland, Freistaat Ostpreussen, United Malay Federation, Atsvea, Verdant Haven, Reannia).
- **No se usa**: `OverallStats` (overall PES 40-109, solo referencia), `Curl`, `PlaceKicking`,
  `WeakFootUsage/Acc`, `PhysicalContact` (parcial), y las **40 columnas 0/1 de skills especiales**
  (se reservan para los perks custom del dueño, ver §5).
- **`players.json` actual (238 jugadores)**: se hace **merge conservando ids** — los `playerId` de los
  partidos no se rompen. Ver [[02-modelo-datos]] §2.
- **Nombres**: `teams_data.py` del generador (mismo set, 32×26) es la fuente autoritativa de nombres
  completos (join por `Id` y por `Country`+`Name`); el CSV queda de fallback. Ver §8.

---

## 1b. Modelo de nombre (firstName/lastName)

> Decisión del dueño: **solo `firstName` + `lastName`**, el nombre compuesto se **deriva** en runtime.

- En `players.json` ya **no existe** el campo `name`; se guardan `firstName` y `lastName`.
- Helper `getPlayerName(player)` en `src/data/players/index.ts` compone `"First Last"` para los consumidores
  (matches, mercado, squad, `players:link`).
- `players:link` indexa por nombre compuesto **y** por apellido, para que referencias de un solo apellido
  ("Arhanv") sigan resolviendo.
- `MarketPlayer` agrega `firstName`/`lastName` (la carta FCL muestra apellido grande + nombre arriba).


---

## 2. Mapeo de posiciones (PES → vocabulario canónico)

El vocabulario canónico son las **12 posiciones** de `src/config/positions.ts` ([[02-modelo-datos]] §2).

| PES (POS numérico y columnas) | Nuestro `Position` |
|-------------------------------|--------------------|
| GK | `GK` |
| CB | `CB` |
| LB | `LB` |
| RB | `RB` |
| DMF | `DM` |
| CMF | `CM` |
| LMF | `LM` |
| RMF | `RM` |
| AMF | `AM` |
| LWF | `LW` |
| RWF | `RW` |
| CF | `CF` |
| SS | `CF` (segunda striker; alternativa `AM`) |

- `POS` = posición principal; las **columnas 0/1** (`GK…CF`) = posiciones secundarias → campo nuevo `positions: Position[]`.
- La posición principal se guarda en `position` y **también se incluye** en `positions`.

---

## 3. Mapeo de skills (derivación exacta)

Fuentes PES (columnas base, escala 40-99) → nuestras skills (0-100, [[02-modelo-datos]] §2). El **dueño aprobó** la tabla; nota: `positioning` combina `OffensiveAwareness` + `DefensiveAwareness` (afecta al posicionamiento ofensivo y defensivo).

| Nuestra skill | Deriva de |
|---|---|
| `shortRange` | `Finishing` |
| `mediumRange` | avg(`Finishing`, `KickingPower`) |
| `longRange` | `KickingPower` |
| `heading` | `Heading` |
| `pace` | avg(`Speed`, `Acceleration`) |
| `agility` | `TightPossession` |
| `stamina` | `Stamina` |
| `jumping` | `Jump` |
| `dribbling` | `Dribbling` |
| `fakes` | avg(`Dribbling`, `TightPossession`) |
| `ballControl` | `BallControl` |
| `stability` | `Balance` |
| `positioning` | avg(`OffensiveAwareness`, `DefensiveAwareness`) |
| `vision` | avg(`LowPass`, `LoftedPass`) |
| `tackling` | `BallWinning` |
| `sliding` | `Aggression` |
| `clearing` | `DefensiveAwareness` |
| `power` | avg(`KickingPower`, `PhysicalContact`) |
| `reflexes` | `GKReflexes` |
| `gkPositioning` | `GKAwareness` |
| `stretch` | `GKReach` |
| `saveClose` | `GKClearing` |
| `catch` | `GKCatching` |

- Se deriva **todas las skills** para todos los jugadores (cumple la regla de `players:link`: ALL_SKILLS presentes).
- Los promedios se redondean al entero.

---

## 4. Conversiones de escala y campos nuevos

| Campo nuevo | Fuente CSV | Conversión |
|---|---|---|
| `height?: number` | `Height` (cm) | directo (int) |
| `foot?: 'left' \| 'right'` | `Foot` (`False` = derecha, `True` = izquierda) | directo |
| `form?: number` (0-100) | `Form` (1-8) | `round((form-1)*100/7)` — lineal, como el resto de habilidades |
| `playingStyle?: string` | `PlayingStyle` (id PES 1-21) | nombre (tabla del generador, `basics.py`) |
| `positions?: Position[]` | columnas 0/1 por posición | ver §2 |
| `perks?: number[]` | — (no se deriva del CSV) | manual, ver §5 |
| `pesId?: number` | `Id` (id PES) | directo — trazabilidad, **no** es nuestro id |

- `skills.injuryResistance` (ya existe como skill 0-100): `InjuryResistance` CSV 1-3 → **`1:30, 2:60, 3:90`**.
- `age` / `birthdate`: el CSV trae `Age`; se guarda en `age` (fallback de precio que ya soporta el modelo).
- **`OverallStats` se ignora** para el cálculo de overall; el dueño calibra el overall después ([[06 - Market]]).

---

## 5. Perks

Modelo nuevo (solo display + efecto de precio; **sin funcionalidad de simulador**):

```ts
interface Perk {
  id: number;
  name: string;      // nombre mostrable
  image: string;     // SVG propio (hexágono + dibujito), único por perk
  description: string;
}
```

- Definciones en `src/data/perks.ts` (8-12 perks para arrancar, SVGs simples).
- `Player.perks: number[]` = ids de perks del jugador (ej `[1, 5, 12, 24, 55]`), para mostrarse en las cartas.
- **Efecto de precio**: multiplicador por perk, configurable en `src/config/market.ts` (mismo patrón que `ageFactor`/`injuryFactor`). Se integra en `computeMarketPrice`.

---

## 6. Script de importación

`scripts/import-pes-players.mjs` (CSV en `scripts/import/all_teams_20260501_195001.csv`):

1. Parsear CSV (`;`).
2. Parsear `teams_data.py` del generador (nombres completos autoritativos).
3. Resolver federación: código PES → **miembro** (normalizando nombres como `players-link`): `ForFishing→Fish`, `Glo→Glo XI`, `Anxious and Kevin→A&K`, etc.
4. Asignar `teams[]` (entrada `active`, `teamType: 'national'`, `teamCode` + `teamId` de la federación, dorsal si lo trae `teams_data`) y `nationalityId`.
5. Derivar skills/posiciones/campos según §2-§4.
6. **Merge** contra `players.json`: cruzar por **apellido + nacionalidad** contra jugadores **preexistentes** (cada uno se consume una vez); si existe exactamente 1, actualizar campos; si no, agregar con id autoincremental (`maxId+1`). Conservar ids existentes.
7. **Nombres**: `firstName`/`lastName` de `teams_data.py`/CSV; si el jugador no tiene nombre de pila explícito, se **genera** por pool de idioma (ver §8).
8. Escribir `players.json` (sin el campo `name`).

Validación: `npm run players:link` (dry-run primero) + `npm run build`.

---

## 8. Nombres de pila generados

- **Fuentes (prioridad)**: `teams_data.py` → CSV → generación por idioma. Solo se genera a quienes no tienen nombre de pila explícito (apellidos de un solo token y legacy con inicial "B.").
- **Pools de nombres de pila por idioma** (`POOLS` en el script): nórdico, islandés, alemán, eslavo, inglés, japonés, internacional, fantasy, y los **joke** con la misma onda: Realize (verduras), Clown Town City (payasos), ForFishing (peces), Chan Island (isla/pirata).
- **Asignación nacionalidad → idioma** (`STYLE_BY_NATION`): A&K/Glo/Sehir/Nordustra → nórdico · Furilisca → islandés · Einswenn/Ruinenlust → alemán · Nardin/Bextoria/Zane Farbe → eslavo · Roless/Cacusia/Chaplin/Klaus/Lumiose → inglés · Garbelia → japonés · resto mixto → internacional · Oseao/Azure Mines/Bisofeyr/Mozolephies/Jutsa → fantasy · **Bilsa y Stralla → generador bilsano**.
- **Bilsan**: lista pre-generada con `src/lib/bilsaNameGenerator.py` → `scripts/import/bilsan-names.json` (nombres ≤ 10 letras).
- **Determinista**: RNG con semilla `apellido|nacionalidad|id` (id evita que compañeros con el mismo apellido reciban el mismo nombre). Si había inicial ("B."), se elige un nombre que empiece con esa letra.

---

## 7. Impacto (ejecutado)

- `players.json`: 238 → **948** (122 merged + 710 creados; 514 primeros nombres generados).
- Todas las skills de los 832 del CSV derivadas (0-100) según §3; `height/foot/form/positions/pesId` cargados.
- El **mercado FCL** ([[06 - Market]]) escala a ~948 jugadores.
- Los 122 jugadores legacy que existían en el CSV se **actualizan** (mismo id, skills re-derivadas, nombre completo).
- Deuda pre-existente: ~113 legacy sin skills (jugadores de otras ediciones no cubiertos por el CSV) y ~103 referencias de partidos por nombre sin id — no bloquean el build.

---

## 9. Backfill de históricos + refs por id (ejecutado)

- `scripts/backfill-players.mjs`: crea en `players.json` como **retirados** los jugadores de ediciones
  anteriores que aparecen en partidos/premios y no existían (goles, asistencias, tarjetas, penales y
  `prizes`). Con la data actual: **19 retirados** (967 jugadores totales).
- `players-link.mjs`: ahora matchea por **último token** ("S. Granberg" → Granberg) y desempata homónimos
  por inicial ("O. Vydra" → Ote Vydra). Resultado: **0 referencias sin resolver** en los 5 JSON de partidos.
- Goles/asistencias/tarjetas/penales con nombre ahora apuntan a su `playerId`; las tablas de goleadores
  (`ScorersTable`, `TournamentStats`, `getTopScorers`, `getTopScorerOfTeamInTournament`) agrupan por **id**.
- **Premios por id**: `prizes.*.playerId` en `tournaments.json` + schema Zod + display resuelto por perfil
  (`TournamentStats`, `TournamentHistoryTable`, texto de logros en `awards.ts`).
- `FinalCard` muestra el nombre completo del goleador **solo en lg+** (nombre corto en pantallas chicas).
