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
| [[09-dudas]] | **Dudas y decisiones pendientes**: posibilidades y problemas que plantea el agente para que el dueño decida |
| [[Simulador/00-simulador]] | **Diseño objetivo (borrador, NO confirmado)**: simulador de partidos |
| [[Simulador/Simulador - Idea]] | Brain-dump del dueño sobre el simulador (referencia) |

---

## Decisiones tomadas (confirmadas con el dueño del proyecto)

1. **Fases separadas** para el refactor, cada una con su propia branch y review.
2. **Documentación**: estado actual + diseño objetivo, validar antes de codear.
3. **Champions League**: primero se define el modelo de datos; la carga de datos de CL va después.
4. **Identidad de jugador**: una sola entidad multi-equipo (selección y/o club) con un id global único.
5. **Fuente canónica de jugadores**: JSON central por jugador, con `skills` (0-100), `rating` (0-100, **derivado** de skills) y `position` principal. Las **estrellitas (0.5-6)** se derivan del rating (función pura, no se editan a mano).
6. **Carga de goles**: script CLI de asistencia. Debido a nombres duplicados reales, la resolución es **por id**, pero el script hace el lookup/autocompletado (ver [[02-modelo-datos]] §Goles).
7. **Ranking de selecciones**: **no se le agrega nada** — ya tiene los cálculos deseados. Solo se refactoriza *cómo* se detecta la temporada actual y los torneos anteriores para el decay (por **año**, no por último torneo). La CL **NO suma** a este ranking.
8. **Club**: pertenece a **una sola federación**; la liga doméstica es por federación. **Sin badges/logros** en clubes.
9. **Formato CL**: igual que la Forest Cup (grupos + playoffs), con **ida y vuelta** en todas las instancias **excepto la final** (formato UCL pre-2024).
10. **Ranking de la CL**: **separado e independiente** del ranking de selecciones (de clubes, por rating/rendimiento).
11. **Contenido en JSON**: migrar todo `/content` de `.md` a JSON (manteniendo schemas Zod), para facilitar el mantenimiento.
12. **Squad por referencia**: el `squad` de un equipo referencia `playerId` + dorsal/posición en ese equipo; el perfil del jugador (nombre, `position`, `rating`, `skills`, `birthplace`) vive en `players.json`. El coach queda como campo del squad.
13. **Referencias por id**: resolver equipos por **código** (`teamCode`) en vez de `teamName`.
14. **Ligas domésticas**: tablas **hardcodeadas en JSON** (`src/data/leagues/`), última temporada. **Solo infraestructura primero** (sin datos). La página del miembro muestra tabla → si no, lista de clubes → si no, nada. Las **stats de club solo cuentan torneos FFC**, no la liga doméstica.
15. **Jugador + lugar de nacimiento**: se agregan `birthplace.city` y `birthplace.state` a la ficha (opcional en la primera iteración).
16. **Navbar por sección**: la home es FC por defecto; al entrar a la sección CL cambia el navbar a la navegación CL. Verde CL `#95ff00` (secundario `#00ff95`).

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
FASE A — Consistencia de lo existente (no toca visual)   ✅ mergeada
  A1  Frontmatter + utils/lib
  A2  Colores y variables CSS
  A3  Sistema de temporada anual + decay (ranking de selecciones intacto)
  A4  Motor de logros (refactor) + badges
  A5  Contenido .md → JSON (colección por colección)

FASE B — Nuevo modelo (Champions League + clubes)
  B1  Modelo de datos: jugadores (skills 0-100 + rating derivado + birthplace),
      clubes, ligas domésticas (infraestructura), torneos, partidos
  B2  Tabla de liga doméstica + lista de clubes en member/[slug]
  B3  Squad compacta con estrellitas (member + club)
  B4  Página de club (/clubs, ClubHero, stats solo FFC)
  B5  Rating de clubes + ranking FCL
  B6  Script CLI de carga de goles (players:link)
  B7  Layout y estética CL + navbar por sección FC/CL
  B8  Páginas individuales de partido
  B9  Páginas de logros por federación
  B10 Forestian Champions League (contenido)
  B11 Simulador de mercado de pases (isla React)

FASE C — Simulador de partidos ⚠️ NO CONFIRMADA, muy susceptible a cambios
  C1  Motor puro (RNG con semilla, zonas, cascada de chequeos)
  C2  Partido completo simulable (output = schema de match)
  C3  Integración + generador masivo de jugadores CL
  C4  Página pública de simulación
```

Detalle completo en [[08-plan-implementacion]]. Diseño del simulador en [[Simulador/00-simulador]].
