# AGENTS.md — FFC Official Website

Guía para agentes y desarrolladores que trabajan en este repositorio. **Leer antes de tocar código.**

---

## Proyecto

- Sitio estático **Astro 5** + **Tailwind CSS 4** + React (solo donde hace falta), deploy en **Netlify**.
- En producción. **No romper lo visual**: los artículos y la estética general se ven perfectos y no se tocan (salvo consistencia de colores/márgenes/padding).
- Documentación de diseño: ver [`docs/FFC-Website/README.md`](docs/FFC-Website/README.md) y sus subdocumentos.

## Comandos

```bash
npm run dev           # servidor de desarrollo
npm run build         # build de producción (usa astro.config.prod.mjs)
npm run preview       # previsualizar build
npm run astro         # CLI de astro
```

- **Siempre verificar `npm run build` tras un cambio.** Es el único "lint/typecheck" efectivo del proyecto (Astro compila TS + valida schemas Zod de content collections en build).

## Convenciones de código

- **No agregar comentarios** salvo que aporten contexto real (el código usa comentarios en español para dominio; mantener tono).
- **Sin `any` ni `as any`**: tipar con `CollectionEntry<'<colección>'>` o tipos de `src/types/collections.d.ts`.
- **Sin `console.log` en producción** (existen restos en `src/lib/achievements/index.ts`; no replicar).
- **Preferir editar archivos existentes** antes de crear nuevos; seguir patrones de componentes vecinos.
- **No crear documentación/README nuevos salvo que se pida.**
- **Documentación en `docs/FFC-Website/`**: usar **wikilinks de Obsidian** (`[[02-modelo-datos]]`) para todas las referencias entre documentos, no links de ruta markdown.

## Arquitectura

### Carpetas y su rol (regla de oro)

| Carpeta | Rol |
|---------|-----|
| `src/content/<collection>` | Datos de contenido (members, tournaments, articles, achievements, sponsors, stadiums). Schemas en `src/content/config.ts`. |
| `src/data/` | Datos JSON fuera de Astro Content: `matches/*.json` (partidos por torneo), `events.json`, `roleplays.json`, `bonuses.json`, `players/` (by-team + historical). |
| `src/lib/` | **Dominio**: ranking, scores, logros, eventos/roleplays/bonus, colecciones con cache (`lib/collections.ts`). |
| `src/utils/` | **Helpers puros de datos**: matches, tournaments, members, players, stadiums, articles. |
| `src/components/` | Componentes por dominio (`members/`, `tournaments/`, `matches/`, `achievements/`, `index/`, ...) + futura `ui/` para primitivos reutilizables. |
| `src/pages/` | Rutas. Existen: `index`, `ranking`, `ranking-detailed`, `members/[slug]`, `forest-cup/{2020,2022,2024,2026}`, `matches`, `stadiums`, `sponsors`, `articles`, `champions-league` (placeholder). |
| `src/config/` | `routes.ts`, `links.ts`, `features.ts`, `easter-eggs.ts`, `constants.ts` (+ futura `season.ts`). |
| `src/types/` | Tipos reutilizables (`collections.d.ts`). |
| `src/styles/global.css` | Tailwind 4 `@theme`: tokens de color y breakpoints. |

### Alias (tsconfig.json)

`@components/*`, `@layouts/*`, `@lib/*`, `@pages/*`, `@content/*`, `@data/*`, `@images/*`, `@styles/*`, `@ty/*`, `@config/*`, `@utils/*`.

### Modelo de datos clave

- **Member** = federación (selección nacional). Tiene `code` (3 letras, ej `BIL`), `score` (rp/events/bonus por temporada), `squad` (coach/formation/players sin id), `manualAchievements[]`, `verified`, `founder`.
- **Tournament**: `id` (secuencial), `type` (`forest-cup` | `forestian-champions-league`), `edition` (año del torneo), `pots`, `prizes`. El campo `season` (año de temporada) es parte del refactor objetivo.
- **Match** (desde `src/data/matches/*.json`): `tournament_id`, `team1/team2` + `team1Code/team2Code`, `leg` (`1|2|single`), `status` (`scheduled|played|canceled`), `date`, y detalle: `goals[]`, `penalties[]`, `cards[]`, `substitutions[]`, `lineup`, `stats`, `link`.
- **Players** (refactor en curso): JSON central por jugador (multi-equipo, con `rating` 0.5–6). El `playerId` de los partidos debe apuntar al id global.

### Ranking (importante, en refactor)

- `src/lib/scoreUtils.ts` → `SCORING_CONFIG` (porcentajes, máximos, `DECAY_FACTORS`), `TIERS`, `normalizePoints`.
- `src/lib/rankingUtils.ts` → `getMemberScoreDetails`, `getRankedMembers`.
- `CURRENT_TOURNAMENT_ID` está en `src/utils/tournamentUtils.ts` (último torneo por id). **Objetivo**: reemplazar por temporada por año (`CURRENT_SEASON`), decay por años, y ranking de CL separado. Ver `docs/FFC-Website/03-ranking.md`.

### Logros

- Estáticos: collection `achievements` + `manualAchievements[]` en el miembro.
- Dinámicos: `src/lib/achievements/dynamics/*` con `evaluate(...)`. Pipeline en `src/lib/achievements/index.ts`. Refactor objetivo en `docs/FFC-Website/04-logros.md`.

---

## Reglas de trabajo / trampas conocidas

1. **`src/data/players/index.ts` NO existe** pero `src/utils/playerUtils.ts` lo importa. Si vas a usar `playerUtils`, primero creá ese index (ver `docs/FFC-Website/02-modelo-datos.md`).
2. **`assistId`** está en los JSON de partidos pero **no está en el schema** de `config.ts` (Zod lo ignora). Si lo vas a usar, agregalo al schema.
3. **No tocar** `_legacy-matches` ni los backups `_backup_*` salvo que se pida explícitamente.
4. Los partidos referencian equipos por **nombre** (`team1/team2`) y por **código** (`team1Code/team2Code`). Al comparar contra `members`, se usa `getMemberByName`.
5. `matches` se cargan con un `loader` que compone `forest-cup-{2020,2022,2024,2026}.json` y asigna `id: match-<tournament_id>-<match_id>`.
6. El ranking solo incluye miembros **`verified`**.
7. Git: solo commitear cuando se pida explícitamente. Las fases del refactor van en branches separadas (ver `docs/FFC-Website/08-plan-implementacion.md`).

---

## Flujo de trabajo para cambios

1. Leer el doc de diseño relevante en `docs/FFC-Website/` (01 = estado actual, 02–07 = diseño objetivo, 08 = plan de fases).
2. Identificar la fase/branch a la que pertenece el cambio.
3. Implementar siguiendo convenciones (tipos, sin `any`, sin logs, sin comentarios salvo contexto).
4. Correr `npm run build` y corregir errores hasta que compile.
5. No commitear salvo pedido explícito.
