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

- `/clubs/<slug>`: escudo, nombre, federación dueña, liga doméstica, plantel (de `club.squad` con `playerId`), historial CL, estadios.
- Se enlaza desde la página del miembro (federación) que lo posee.
- Estética CL (negro + lima) aunque el club participe o no de la CL, ya que es parte de la sección clubes.

---

## 5. Ranking de la CL (separado)

- La CL tiene su **propio ranking/tabla** (ver `03-ranking.md` §5), no mezclado con el ranking general de federaciones.
- Se expone en la sección CL (ej: `/forestian-champions-league/ranking`).

---

## 6. Integración con el modelo

- Clubes: ver `02-modelo-datos.md` §3.
- Torneos: `type: 'forestian-champions-league'` + `season` (año).
- Partidos: `team1Type/team2Type: 'club'`, `leg`, `aggregate`.

---

## 7. Pasos de implementación (resumen)

1. Layout CL + tokens de color (negro/lima) + patrón de rombos.
2. Navegación/footer de la sección CL.
3. Páginas de clubes (modelo de datos primero, ver fase B).
4. Home + season + fixtures/standings de la CL.
5. Ranking CL propio.
6. Reemplazar placeholder `champions-league.astro`.
