# 06 — Diseño objetivo: páginas individuales de partido

> Actualmente los partidos no tienen página propia, pero el schema ya define muchos datos listos para mostrar.

---

## 1. Problema actual

- Los partidos viven en `src/data/matches/*.json` con schema completo: `goals`, `penalties`, `cards`, `substitutions`, `lineup` (coach/formation/players con `playerId`), `stats`, `leg`, `aggregate`, `link`, `stadium_id`.
- No hay ruta por partido: se muestran en listas/tablas (`matches/index.astro`, `MatchCard*`), pero no en detalle.

---

## 2. Ruta propuesta

- `/matches/<tournament_id>/<match_id>` — o `/matches/[slug]` generado desde el id compuesto `match-<tournament_id>-<match_id>` que ya asigna el loader de `config.ts`.

```ts
// src/pages/matches/[...match].astro  (getStaticPaths)
getStaticPaths() => matches.map(m => ({
  params: { match: m.id },               // "match-3-12"
  props: { match: m, ... }
}))
```

---

## 3. Contenido de la página de partido

### Header
- Torneo + etapa (grupo/llave), fecha, estadio (`stadium_id` → `stadiums` collection), asistencia.
- Marcador final (incl. penales), agregado si es ida/vuelta, link al video.

### Cuerpo
1. **Resultado**: marcador, penales (si hubo), goleadores con minuto/asistencia (resuelto por `playerId` → `players.json`).
2. **Alineaciones**: por equipo, formación + XI + suplentes (con dorsal, posición, capitán), coach.
3. **Stats**: posesión, tiros, tiros al arco, córners, faltas, fuera de juego (ya definidos en `match.stats`).
4. **Eventos**: tarjetas (amarilla/roja/segunda amarilla), sustituciones (con minuto).
5. **Cronología** (opcional): línea de tiempo unificando goles/tarjetas/sustituciones por minuto.

### Sidebar / extras
- Partidos relacionados (misma jornada/llave), próximos partidos del mismo equipo, historial.

---

## 4. Componentes

- `MatchDetailHeader.astro` — marcador + contexto.
- `Lineups.astro` — alineaciones con formación.
- `MatchStatsPanel.astro` — tabla de stats comparativas.
- `MatchTimeline.astro` — eventos por minuto.
- Reutilizar `MatchCard*` para enlazar desde listas.

---

## 5. Datos necesarios / deuda

- Resolver nombres por `playerId` (requiere `players.json` central, ver `02-modelo-datos.md`).
- Completar `assistId` en schema (hoy en JSON pero sin validar).
- El `lineup` ya tiene `playerId`; sin `players.json` solo se puede mostrar el nombre embebido.
- `stadium_id` → resolver contra `stadiums`.

---

## 6. Pasos de implementación (resumen)

1. Asegurar `players.json` + resolución de nombres (fase B modelo de datos).
2. Agregar `assistId` al schema de matches.
3. Crear `src/pages/matches/[...match].astro` con `getStaticPaths`.
4. Construir componentes de detalle y enlazarlos desde listas/tablas/cards.
