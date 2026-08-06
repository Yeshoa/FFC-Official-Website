# FFC Website — Documentación

Documentación del proyecto **FFC (Forest Football Confederation) Official Website**, construido con **Astro 5** + **Tailwind CSS 4**. Este documento es la fuente de verdad para el plan de refactorización y evolución del proyecto.

> Estado: **en planificación** · Proyecto en producción.

---

## Estructura de la documentación

> **⚠️ Carpeta "Plan del usuario"**: es de uso **exclusivo del dueño del proyecto**. Los agentes/IA **no deben crear, editar ni borrar** archivos dentro de `Plan del usuario/`. Solo el dueño mete archivos ahí (actualizaciones de contexto). Los documentos `00`, `01`, etc. dentro de esa carpeta se consideran **entrada de usuario**, no documentación técnica.

| Documento | Contenido |
|-----------|-----------|
| [`Plan del usuario/`](Plan%20del%20usuario/) | Entrada del dueño: plan inicial y actualizaciones. **No tocar** |
| [`01-estado-actual.md`](01-estado-actual.md) | Cómo funciona hoy el proyecto: colecciones, datos, ranking, logros, estilos |
| [`02-modelo-datos.md`](02-modelo-datos.md) | **Diseño objetivo**: jugadores, clubes, torneos, partidos |
| [`03-ranking.md`](03-ranking.md) | **Diseño objetivo**: sistema de puntos, temporadas, decay |
| [`04-logros.md`](04-logros.md) | **Diseño objetivo**: motor de logros, badges, página por federación |
| [`05-champions-league.md`](05-champions-league.md) | **Diseño objetivo**: Champions League (formato + estética) |
| [`06-partidos.md`](06-partidos.md) | **Diseño objetivo**: páginas individuales de partido |
| [`07-consistencia.md`](07-consistencia.md) | **Diseño objetivo**: frontmatter, utils/lib, colores, componentes |
| [`08-plan-implementacion.md`](08-plan-implementacion.md) | Plan de implementación por fases |

---

## Decisiones tomadas (confirmadas con el dueño del proyecto)

1. **Fases separadas** para el refactor, cada una con su propia branch y review.
2. **Documentación**: estado actual + diseño objetivo, validar antes de codear.
3. **Champions League**: primero se define el modelo de datos; la carga de datos de CL va después.
4. **Identidad de jugador**: una sola entidad multi-equipo (selección y/o club) con un id global único.
5. **Fuente canónica de jugadores**: JSON central por jugador, con campo `rating` (tier de media estrella a 6 estrellas).
6. **Carga de goles**: script CLI de asistencia. Debido a nombres duplicados reales, la resolución es **por id**, pero el script hace el lookup/autocompletado (ver `02-modelo-datos.md` §Goles).
7. **Ranking**: recálculo dinámico con decay por temporada. La temporada se define por **año**, no por el último torneo.
8. **Club**: pertenece a **una sola federación**; la liga doméstica es por federación.
9. **Formato CL**: igual que la Forest Cup (grupos + playoffs), con **ida y vuelta** en todas las instancias **excepto la final** (formato UCL pre-2024).
10. **Ranking de la CL**: **separado** del ranking general de federaciones.

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
  A3  Sistema de temporada anual + ranking
  A4  Motor de logros (refactor) + badges

FASE B — Nuevo modelo (Champions League + clubes)
  B1  Modelo de datos: jugadores, clubes, torneos, partidos
  B2  Script CLI de carga de goles
  B3  Layout y estética Champions League
  B4  Páginas individuales de partido
  B5  Páginas de logros por federación
```

Detalle completo en [`08-plan-implementacion.md`](08-plan-implementacion.md).
