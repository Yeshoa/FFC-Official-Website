# FFC Website — Documentación

Documentación del proyecto **FFC (Forest Football Confederation) Official Website**, construido con **Astro 5** + **Tailwind CSS 4**. Este documento es la fuente de verdad para el plan de refactorización y evolución del proyecto.

> Estado: **en planificación** · Proyecto en producción.

---

## Estructura de la documentación

> **⚠️ Carpeta "Plan del usuario"**: es de uso **exclusivo del dueño del proyecto**. Los agentes/IA **no deben crear, editar ni borrar** archivos dentro de `Plan del usuario/`. Solo el dueño mete archivos ahí (actualizaciones de contexto). Los documentos `00`, `01`, etc. dentro de esa carpeta se consideran **entrada de usuario**, no documentación técnica.

---

## Convenciones de la documentación

- **Obsidian**: esta documentación se lee en Obsidian. **Toda referencia entre documentos se escribe con wikilinks**: `[[01-estado-actual]]`, `[[02-modelo-datos]]`, `[[Plan del usuario/00 - Plan inicial]]`. Evitar links de ruta estilo markdown (`(01-estado-actual.md)`) cuando sea posible.
- Los wikilinks se resuelven por nombre de archivo; un título en negrita no es un enlace navegable.
- Mantener un documento por tema y enlazarlos entre sí con wikilinks para navegar sin salir de Obsidian.

| Documento | Contenido |
|-----------|-----------|
| [[Plan del usuario/00 - Plan inicial]] | Entrada del dueño: plan inicial y actualizaciones. **No tocar** |
| [[01-estado-actual]] | Cómo funciona hoy el proyecto: colecciones, datos, ranking, logros, estilos |
| [[02-modelo-datos]] | **Diseño objetivo**: jugadores, clubes, torneos, partidos |
| [[03-ranking]] | **Diseño objetivo**: sistema de puntos, temporadas, decay |
| [[04-logros]] | **Diseño objetivo**: motor de logros, badges, página por federación |
| [[05-champions-league]] | **Diseño objetivo**: Champions League (formato + estética) |
| [[06-partidos]] | **Diseño objetivo**: páginas individuales de partido |
| [[07-consistencia]] | **Diseño objetivo**: frontmatter, utils/lib, colores, componentes |
| [[08-plan-implementacion]] | Plan de implementación por fases |

---

## Decisiones tomadas (confirmadas con el dueño del proyecto)

1. **Fases separadas** para el refactor, cada una con su propia branch y review.
2. **Documentación**: estado actual + diseño objetivo, validar antes de codear.
3. **Champions League**: primero se define el modelo de datos; la carga de datos de CL va después.
4. **Identidad de jugador**: una sola entidad multi-equipo (selección y/o club) con un id global único.
5. **Fuente canónica de jugadores**: JSON central por jugador, con campo `rating` (tier de media estrella a 6 estrellas) y `position` principal.
6. **Carga de goles**: script CLI de asistencia. Debido a nombres duplicados reales, la resolución es **por id**, pero el script hace el lookup/autocompletado (ver [[02-modelo-datos]] §Goles).
7. **Ranking de selecciones**: **no se le agrega nada** — ya tiene los cálculos deseados. Solo se refactoriza *cómo* se detecta la temporada actual y los torneos anteriores para el decay (por **año**, no por último torneo). La CL **NO suma** a este ranking.
8. **Club**: pertenece a **una sola federación**; la liga doméstica es por federación.
9. **Formato CL**: igual que la Forest Cup (grupos + playoffs), con **ida y vuelta** en todas las instancias **excepto la final** (formato UCL pre-2024).
10. **Ranking de la CL**: **separado e independiente** del ranking de selecciones.
11. **Contenido en JSON**: migrar todo `/content` de `.md` a JSON (manteniendo schemas Zod), para facilitar el mantenimiento.
12. **Squad por referencia**: el `squad` de un equipo referencia `playerId` + dorsal/posición en ese equipo; el perfil del jugador (nombre, `position`, `rating`) vive en `players.json`. El coach queda como campo del squad.
13. **Referencias por id**: resolver equipos por **código** (`teamCode`) en vez de `teamName`.

---

## Glosario

- **Miembro / Federación**: nación participante (ej: Bilsa, Einswenn). Tiene selección nacional. Es la entidad "team" actual de la Forest Cup.
- **Club**: equipo de fútbol de clubes que pertenece a una federación. Nueva entidad.
- **Torneo**: competición (Forest Cup o Champions League). Identificado por `id` numérico.
- **Temporada**: período anual (año calendario). Reemplaza el concepto actual de "último torneo".
- **Jugador**: persona/ficha deportiva. Entidad única con uno o más equipos asociados.

---

## Roadmap resumido

```
FASE A — Consistencia de lo existente (no toca visual)
  A1  Frontmatter + utils/lib
  A2  Colores y variables CSS
  A3  Sistema de temporada anual + decay (ranking de selecciones intacto)
  A4  Motor de logros (refactor) + badges

FASE B — Nuevo modelo (Champions League + clubes)
  B1  Modelo de datos: jugadores (JSON central), clubes, torneos, partidos
  B2  Script CLI de carga de goles
  B3  Layout y estética Champions League
  B4  Páginas individuales de partido
  B5  Páginas de logros por federación
  B6  Migración de contenido .md → JSON (colección por colección)
```

Detalle completo en [[08-plan-implementacion]].
