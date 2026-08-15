# 09 — Dudas y decisiones pendientes

> Archivo de trabajo: acá van las **dudas que plantea el agente** y las **posibilidades** que propone, para que el dueño las revise y tome decisiones. El dueño marca su decisión debajo de cada punto (o en el hilo de la conversación) y el agente la integra a los docs de diseño.
>
> **Reglas**: no borrar dudas ya respondidas sin avisar; cada ducha queda con estado `[abierta]` / `[decidida]`. Este archivo **sí** puede crecer con el agente; la carpeta `Plan del usuario/` es exclusiva del dueño.

---

## Estado

| # | Tema | Estado |
|---|------|--------|
| 1 | Sistema de dados del simulador (d100 vs alternativas) | abierta |
| 2 | Generación de eventos (posicionamiento / visión) | abierta |
| 3 | Presupuesto FCL: manual vs derivado de rendimiento | decidida |
| 4 | Cómo se arma el XI del equipo (explícito vs derivado) | decidida |
| 5 | Tabla de estrellas de jugador (rating 0-100 → 0.5-6) | abierta |
| 6 | Ranking FCL: métricas exactas | abierta |
| 7 | React / SSR vs deploy de Netlify | abierta |
| 8 | Navegación de `articles`/`sponsors` en la sección CL | abierta |
| 9 | Jugadores históricos: snapshots y retiro | decidida |
| 10 | Mercado de pases: elegibilidad, retiro y retención | decidida |

---

## 1. Sistema de dados del simulador — `[abierta]`

La nota `[[Plan del usuario/04 - Sobre como generar eventos]]` y el doc `[[Simulador/00-simulador]]` asumen **d100** (dado de 100). El dueño no está seguro de que sea lo más conveniente. Posibilidades:

### Opción A · d100 (un dado de 0–99 / 1–100)
- **Cómo**: cada chequeo es `d100 + modificadores ≥ dificultad`. Crítico 98–100, pifia 1–2.
- ✅ Probabilidades directas en % (d100 = porcentaje). Grano fino para stats 0–100.
- ✅ Consistente con las skills en escala 0–100 (una skill de 70 = ~70% de base).
- ❌ Sensación "binaria": sin modificadores, el resultado es plano (no hay campana).
- ❌ Los críticos/pifias hay que definirlos como rangos artificiales (raro pero "a mano").

### Opción B · d20 (un dado de 20)
- ✅ Familiar (DnD), simple, crítico natural en 20 y pifia en 1 (rangos automáticos estrechos).
- ✅ Menos números que mirar.
- ❌ Grano de 5%: una skill 72 vs 78 casi no se distingue sin multiplicar. Habría que convertir 0–100 → 0–20 (÷5).

### Opción C · 2d6 / 3d6 (suma de dados)
- ✅ Curva en campana: los valores medios son los más probables; los extremos (crítico/pifia) ya son raros **por la naturaleza del dado**, sin rangos artificiales.
- ✅ Diferencias pequeñas de stat se sienten más cerca de la media y menos en los extremos.
- ❌ El rango no es intuitivo como % (3–18 con 3d6). Convertir stats 0–100 requiere normalizar a la escala del dado.

### Opción D · Piscina de dados (pool de d6, contar éxitos)
- ✅ Simple de leer (cada dado que pasa el umbral = éxito); las cascadas se resuelven rápido.
- ✅ La diferencia de nivel se nota en *cantidad* de dados.
- ❌ Menos control fino sobre probabilidades exactas; requiere definir umbrales por habilidad.

### Opción E · Híbrido por contexto
- ✅ Por ejemplo: **d100 para chequeos de acción** (pase, tiro) y **d20/pool para iniciativa y eventos raros**. Lo mejor de cada uno según el momento del partido.
- ❌ Dos sistemas a explicar y mantener.

> **Recomendación del agente**: mantener **d100 como base** (encaja con skills 0–100 y % directos), y modelar la rareza de crítico/pifia con rangos estrechos configurables por perk. Si se quiere "campana", la opción C es la alternativa más interesante. **Decisión del dueño: pendiente.**

---

## 2. Generación de eventos (posicionamiento / visión) — `[abierta]`

De la nota `[[Plan del usuario/04 - Sobre como generar eventos]]`:
- **Posicionamiento** mejora las tiradas de **iniciativa** (mediocampistas altos).
- **Visión** aumenta las chances de ejecutar una acción **más desequilibrante/decisiva**, y a la vez de que salga bien.

El dueño plantea: cuando un jugador tiene la pelota hay muchas acciones posibles (pase corto/medio/largo, tiro, avanzar, gambetear...). La visión sube las chances de elegir una **acción de ataque** (pase filtrado, tiro lejano, gambeta) **y** de que tenga éxito. Posibilidades de implementación:

### Opción A · Selección de acción ponderada
- Cada acción tiene un **peso base** según contexto (zona, presión, marcador).
- La **visión suma peso** a las acciones de ataque (filtrado, tiro lejano, gambeta) y resta a las conservadoras (pase seguro, retroceder).
- El resultado se elige con una tirada ponderada (no un sorteo plano).
- **Posicionamiento** no interviene acá, sino en **quién tiene la pelota** (iniciativa).

### Opción B · Tablas de decisión por contexto (sin pesos)
- Según zona + presión + marcador hay una lista fija de acciones posibles.
- La **visión agrega/desbloquea** acciones de alto riesgo a esa lista.
- ✅ Más predecible y fácil de tunear; ❌ menos "orgánica".

### Opción C · Techo de "desequilibrio"
- Cada jugador tiene un valor de **desequilibrio máximo** que se anima a intentar (deriva de visión + confianza + contexto).
- Al elegir acción, las opciones con factor de desequilibrio > techo quedan fuera.
- **Visión** = sube el techo (intenta jugadas más desequilibrantes) y **además** da bonificador de éxito a esas jugadas.

### Opción D · La visión como "amplificador de riesgo" con recompensa
- Todas las acciones conservan su lista; la visión no cambia qué se elige pero sí el **modificador de éxito** cuando la acción elegida es de ataque.
- ❌ Pierde la parte de "elegir una jugada más decisiva".

> **Recomendación del agente**: combinar **A + C** — pesos ponderados para elegir la acción (visión los mueve) y un techo de desequilibrio que la visión sube, con bonificador de éxito en jugadas de ataque. Posicionamiento queda en iniciativa (quién toca la pelota primero). **Decisión del dueño: pendiente.**

---

## 3. Presupuesto FCL: manual vs derivado — `[decidida]`

Hay **dos fuentes que se contradicen**:
- `[[Forestian Champions League — Formato y reglas base]]` (§4): el presupuesto **se deriva del rendimiento deportivo** (poder de federación → techo → rendimiento relativo del club). El participante **no** decide manualmente cuánto recibe cada club.
- `[[Plan del usuario/03 - Nuevas Notas]]` (mercado de pases): "el usuario **asigna un presupuesto manualmente** (ya va a saber de antemano cuánto asignar)".

Posibilidades:
1. **Manual en el simulador web** (sigue la nota del dueño): cada participante pone el número que quiera; el sistema solo valida que sea coherente (números razonables).
2. **Derivado y luego manual**: la web calcula el presupuesto por fórmula (federación + rendimiento) y el participante **solo administra cómo gastarlo**, sin poder cambiarlo.
3. **Híbrido**: la web sugiere un monto derivado, pero permite override manual (para pruebas).

> **Recomendación del agente**: para la **primera iteración** (simulador de mercado de pases como isla React), lo más simple es **manual** (opción 1). La derivación por rendimiento se puede sumar después como cálculo automático que el participante ve pero no edita. **Decisión del dueño: pendiente.**

> **Decisión del dueño (2026):**
> - El presupuesto **deriva del puntaje/poder de la federación para la FCL**, que es un dato **externo** (no proviene de nada de esta web). El dueño lo materializa como un **`budget` preasignado por club** en la data (normalización según `[[Forestian Champions League — Formato y reglas base]]` §4.3). La asignación manual desaparece.
> - **Flujo del mercado**: el simulador de mercado de pases (isla React) lee los **clubes + presupuestos preasignados** de la data del sitio → el participante **selecciona el club** con el que quiere operar → hace sus compras con ese presupuesto → al terminar **exporta un JSON** (o copia el texto) y lo envía **externamente** (mensaje privado o email).
> - Al cerrar el mercado, el dueño coloca a los jugadores en sus clubes (`teams[]` + `status`) y hace una nueva build.
> - **Formato del JSON de export (definido en B11)** — el simulador lo arma y permite copiar/descargar:
>
> ```json
> {
>   "season": 2027,
>   "club": { "id": 97, "code": "BILKRA", "name": "Krulta BK" },
>   "formation": "4-4-2",
>   "budget": { "total": 82, "spent": 35, "remaining": 47 },
>   "signings": [
>     { "playerId": 150, "name": "S. Blair", "position": "CF", "usedAs": "CB", "rating": 62, "price": 15 }
>   ],
>   "starters": [ { "playerId": 24, "name": "A. Arhanv", "position": "GK", "usedAs": "GK", "rating": 77, "price": 12 }, null ],
>   "bench": [ null, { "playerId": 28, "name": "Hajan", "position": "AM", "usedAs": "AM", "rating": 79, "price": 13 } ],
>   "reservas": [ null ]
> }
> ```
> - `starters` = 11 slots (formación), `bench` = 12, `reservas` = 9 (opcionales). `signings` = todos los jugadores colocados. `usedAs` = posición donde se usó (para banca/reservas = posición natural), `rating` = overall **recalculado para esa posición**. `playerId` es el id global en `players.json` si existe, si no `null`.

---

## 4. Cómo se arma el XI del equipo — `[decidida]`

El doc [[02-modelo-datos]] §8 deja dos formas:
1. **`squad.players[]` explícito** en el equipo (lista con `playerId` + dorsal + posición en el equipo). Control total.
2. **Derivado de `players.json`**: se genera la lista tomando los jugadores cuyo `teams[]` referencia ese `teamCode`. Cero mantenimiento extra.

Problema: el XI/suplentes (quiénes juegan, quiénes van al banco) necesita un orden o un marcador `starter` que la lista derivada no tiene.

Posibilidades:
- **A**: squad explícito con campo `starter: boolean` y orden (recomendado para selecciones y clubes).
- **B**: squad derivado + campos de "XI" por separado (lista de ids con orden).
- **C**: la lista derivada **solo muestra el plantel** (sin distinguir XI/banco) y el XI se define en cada partido vía `lineup` (que ya existe en el schema de matches).

> **Recomendación del agente**: **C** para lo visual (el plantel completo se muestra desde `players.json`, sin duplicar), y el XI concreto vive en el `lineup` del partido (que ya está en el schema). **Decisión del dueño: pendiente.**

> **Decisión del dueño (2026):**
> - **Opción C**. `squad.players[]` es vestigio y se elimina como fuente del plantel. Se mantiene la estructura **`teams[]` multi-equipo** de `[[02-modelo-datos]]` §2.
> - El **plantel** de un club o selección se obtiene **derivado de `players.json`**: se filtran los jugadores con una entrada en `teams[]` con ese `teamCode` y `status: 'active'`.
> - **Sin boolean de titularidad**: la página muestra la **lista del plantel completo ordenada por posición** (no por XI/titulares). El XI concreto, cuando existan partidos, vive en el `lineup` del partido.

---

## 5. Tabla de estrellas de jugador — `[abierta]`

El dueño decidió: skills 0–100 → `rating` 0–100 derivado → **estrellitas 0.5–6** por tabla de conversión. La tabla de `[[Plan del usuario/02 - Segunda actualización]]` es para **equipos**, no para jugadores; para jugadores "hacela como te parezca y después veo".

Propuesta provisional (constante ajustable en `src/config/`):

| Rating (0–100) | Estrellas |
|----------------|-----------|
| 0–20          | 0.5 |
| 21–35         | 1   |
| 36–50         | 1.5 |
| 51–60         | 2   |
| 61–70         | 2.5 |
| 71–78         | 3   |
| 79–85         | 3.5 |
| 86–91         | 4   |
| 92–95         | 4.5 |
| 96–99         | 5   |
| 100           | 5.5–6 (excepcional) |

La idea: la mayoría queda en 2–3.5, 4+ es muy bueno, 5+ rarísimo. Se puede repensar cuando el dueño revise. **Decisión del dueño: pendiente.**

> **Decisión (B3, 2026):** las **estrellas de poderío del equipo** usan la tabla del dueño ([[Plan del usuario/02 - Segunda actualización]], columna **"Rating 2"**) pero en escala **0–100** (media del plantel activo), **escalando los thresholds de la tabla del dueño ÷1.6** y dejando `TEAM_RATING_TO_STARS` en `src/config/rating.ts` **ajustable a mano**. Mientras no haya skills reales el poderío queda en 0.5★ (placeholder).

---

## 6. Ranking FCL: métricas exactas — `[abierta]`

El doc `[[03-ranking]]` §5 dice que la CL tiene ranking **propio y separado**, pero no define con qué métricas. Posibilidades:
1. **Por rating del club** (media ponderada del plantel) — simple, sin datos de partidos.
2. **Por rendimiento FCL** (puntos de la competición, con decay por temporada como el ranking de selecciones).
3. **Híbrido**: rating como base + puntos por participación/rendimiento FCL.
4. **Coeficiente estilo UEFA**: puntos FCL de las últimas N temporadas (con pesos).

> **Recomendación del agente**: arrancar con la **opción 1 (rating)** para el índice `/clubs`, y sumar rendimiento FCL cuando existan partidos de CL (opción 3 a futuro). **Decisión del dueño: pendiente.**

---

## 7. React / SSR vs deploy de Netlify — `[abierta]`

Nota `[[Plan del usuario/03 - Nuevas Notas]]`: React está desactivado; el dueño sospecha que activar SSR rompe el deploy de Netlify. El mercado de pases (B11) y quizás el simulador necesitan React.

Posibilidades:
1. **Isla React en SSG** (sin SSR): `@astrojs/react` solo para componentes con `client:load`/`client:only`. No requiere server; el deploy actual no cambia.
2. **Activar SSR solo en rutas puntuales** (hybrid output) y verificar en Netlify.
3. **Seguir SSG y usar solo JS vanilla / Web Components** para el mercado (evitar React).

> **Recomendación del agente**: probar la **opción 1** (SSG + islas) en un branch de prueba antes de B11; si el build de Netlify sigue verde, no hace falta tocar SSR. **Decisión del dueño: pendiente.**

---

## 8. Navegación de `articles` / `sponsors` en la sección CL — `[abierta]`

Nota `[[Plan del usuario/02 - Segunda actualización]]`: al entrar a la sección CL cambia el navbar (home, ranking, clubs, etc.). El dueño duda cómo quedan `articles`/`sponsors` (globales).

Posibilidades:
1. **Solo navbar**: `articles`/`sponsors` siguen globales y el navbar CL los enlaza con la estética CL.
2. **Dos navbars completas**: la sección CL tiene su propio footer/navbar con sus versiones de todo.
3. **Navbar CL sin articles/sponsors** y se acceden desde el footer/global.

> **Recomendación del agente**: la **opción 1** (navbar CL + links globales con estética CL) es la más simple y no duplica contenido. **Decisión del dueño: pendiente.**

---

## 9. Jugadores históricos: snapshots y retiro — `[decidida]`

Nota del dueño `[[Plan del usuario/05 - Jugadores históricos]]`: retiro de jugadores, goles por id que cuenten
**toda la carrera**, y skills por torneo en `data/players/historical` para cartas de jugadores históricos.

Estado del modelo (lo que ya existe y lo que falta):
- **Retiro**: `teams[].status: 'active' | 'retired' | 'transferred'` ya existe (por equipo); no hay flag global.
- **Carrera por id**: los goles apuntan al `playerId` global (diseño B1/B6); es deuda de datos, no de modelo.
- **Snapshots**: `historical/<torneo>/<code>.json` guarda `id` legacy (`ROL_001`), `name`, `position` legacy
  (`FWD`), `number`, `status` — **sin skills** y **sin vínculo al id global**.

> **Decisiones del dueño (2026):**
> 1. **Vínculo con el jugador**: referenciar el **`playerId` global** en cada entrada del snapshot (opcional
>    si el jugador no existe en `players.json`). "No es 100% necesario, pero estaría perfecto que lo haga
>    para poder hacer cosas en el futuro."
> 2. **Skills obligatorias**: **TODOS** los jugadores del snapshot deben tener las skills del torneo (regla
>    ALL_SKILLS 0–100). El dueño planea un **álbum de figuritas** (o similar) que use toda la data.
> 3. **Retiro**: se mantiene el `teams[].status` por entrada **y se suma un flag global `retired`** en el
>    jugador para el retiro 100% (ver [[09-dudas]] §10).
> 4. **Carta histórica**: **no está planeada aún**; el formato del snapshot queda listo para el futuro.

> Diseño integrado en [[02-modelo-datos]] §2 "Jugadores históricos".

---

## 10. Mercado de pases: elegibilidad, retiro y retención entre temporadas — `[decidida]`

Decisiones del dueño (2026) sobre el mercado FCL (B11) y su flujo entre temporadas.

### Elegibilidad: los jugadores con club son comprables
- Un jugador es comprable **salvo que esté retirado 100%**. **Tener club activo no lo excluye**: los jugadores
  con club aparecen en el mercado (con su club actual en la card).
- Se elimina la lógica previa que excluía a quienes tenían club; `transferListed` queda **sin efecto** en el filtro.

### Retiro 100% = flag explícito
- Nuevo campo `retired?: boolean` en el jugador ([[02-modelo-datos]] §2), default `false`.
- `isPlayerRetired` = `retired === true` **o** ninguna entrada `teams[]` con `status: 'active'` (fallback legacy).
- Resuelve la ambigüedad *"no tiene club ≠ está retirado"*: un jugador sin club pero activo es un **agente libre**, comprable.

### Retención entre temporadas (Modelo A: retención con costo)
- Para que mantener un jugador ya comprado **no salga gratis** en la siguiente ventana, se usará una
  **retención con costo**: mantener a un jugador cuesta un **% fijo de su valor de mercado** (sueldo derivado
  por fórmula, sin dato extra) que descuenta del presupuesto de la temporada.
- No renovado → vuelve al pool abierto.
- El **% de retención queda pendiente de afinado** (constante en `src/config/market.ts`). Implementación en el
  simulador (panel "plantel actual" + renovaciones + export `renewals`): pendiente (B11-3).

### Mercado extranjero: `allowsForeignMarket`
- Nuevo booleano en la **federación** (member): `allowsForeignMarket`, **default `false`** (el dueño lo activa
  manualmente).
- Regla de elegibilidad en el simulador, según el club elegido:
  - Un jugador aparece para un club de su **misma federación**: **siempre**.
  - Un jugador aparece para un club **extranjero**: solo si su federación tiene `allowsForeignMarket: true`.
  - **Sin club elegido** (modo exploración): se muestra todo.

---

## Cómo se cierra una duda

El dueño responde en el chat (o edita este archivo) con su decisión. El agente entonces:
1. Cambia el estado a `[decidida]` y deja anotada la resolución.
2. Integra la decisión en `[[02-modelo-datos]]`, `[[03-ranking]]`, `[[05-champions-league]]`, `[[Simulador/00-simulador]]` o `[[08-plan-implementacion]]` según corresponda.
3. Actualiza este registro.
