# 00 — Diseño objetivo: simulador de partidos

> **⚠️ Estado: borrador, NO confirmado.** Esta fase es la más susceptible a cambios de todo el roadmap. El objetivo de este documento es definir cómo será el simulador y qué uso tendrá en la web; **no se implementa todavía**.
>
> El documento hermano [[Simulador/Simulador - Idea]] es el brain-dump original del dueño: se mantiene como referencia y puede crecer con ideas sueltas. Este doc es la versión ordenada y tomada de decisiones.

---

## 1. Visión

Un **motor de simulación de partidos** independiente del framework: recibe un input (partido + equipos) y entrega un output (resultado + eventos + estadísticas).

- Vive como **dominio puro** en `src/lib/simulator/` (sin dependencias de Astro), igual que `rankingUtils`/`scoreUtils` hoy.
- El output es **leíble por cualquier sistema**; en nuestro caso, por la web.
- Uso final en la web: **página pública de simulación** (los visitantes eligen equipos y ven el resultado renderizado con los componentes de partido de [[06-partidos]]).
- Las stats de jugadores son **placeholder** por ahora: vendrán del futuro **generador masivo de jugadores** de la Forestian Champions League (ver [[05-champions-league]]).

---

## 2. Principios de diseño

1. **Determinismo**: toda simulación usa un RNG con semilla (`seed = f(teamCodes, fecha, fixtureId)`). Mismo input → mismo resultado. Esto habilita reproducibilidad, partidos estables en build SSG, compartir un sim por URL y "simular N veces y promediar" para predicciones.
2. **Zonas, no coordenadas**: el campo se modela en **zonas discretas** (3–5), no con posiciones x,y de jugador y pelota. La simulación posicional completa queda descartada por ahora (proyecto de meses).
3. **El evento emerge, no se sortea**: no se tira "qué evento va a pasar"; cada acción se resuelve con una **cascada de chequeos** y el evento surge del resultado.
4. **Perks declarativos**: se ejecutan de forma genérica desde datos (`{ id, condition, modifier }`), no hardcodeados.
5. **Stats derivadas** mientras no exista el generador masivo: el sim genera stats por jugador desde `rating` (0.5–6) + posición + seed, con opción de sobreescribir por jugador.

---

## 3. Inputs

### Generales
- Estadio, ciudad, fecha y hora, **clima** (lluvia, viento, calor) y **estado del campo** (pesado/rápido) — derivado del clima o explícito.
- **Árbitro** (opcional): estilo permisivo/estricto → afecta faltas y tarjetas.
- **Factor localía**: además de los cánticos (presión al rival), puede incluir viaje/altura del visitante.

### Equipos (local y visitante)
- Atributos de equipo: apoyo/ambiente local, moral.
- **Directores técnicos** y sus atributos: filosofía de juego, mentalidad bajo presión.
- **Instrucciones tácticas**: presionar alto, jugar en corto, contragolpear, etc.
- **XI + suplentes** (reusa el `lineup` del schema de partidos: coach, formation, players con `playerId`).
- Designación de tiradores de penales y tiros libres.

### Jugadores
- Stats por habilidad (ver §6). **Placeholder por ahora**; origen futuro: generador masivo de la CL.
- **Estado de forma** (ver §9).
- **Estado físico**: fatiga/lesiones previas, resistencia a lesiones.

---

## 4. Outputs

- **Resultado**: marcador, penales (si los hubo).
- **Stats del partido** (idénticos al `stats` del schema `match`): posesión, tiros, tiros al arco, córners, faltas, fuera de juego.
- **Eventos** (idénticos al schema `match`): goles (con asistencia), tarjetas amarillas/rojas, sustituciones con minuto, lesiones.
- **Cronología** de eventos por minuto (alimenta el `MatchTimeline` de [[06-partidos]]).
- **Extras** (opcional, no bloqueante): xG aproximado, ocasiones claras, MVP del partido, ratings post-partido por jugador, cambio táctico/formación final.

> **Requisito de diseño**: el output debe mapear 1:1 al schema de `match` (`goals[]`, `cards[]`, `substitutions[]`, `stats`, `lineup`) para que un partido simulado se renderice con los componentes existentes de [[06-partidos]] sin cambios.

---

## 5. Diseño del motor

### 5.1 Flujo por zonas

1. El partido transcurre por **ticks** de tiempo; el estado = quién tiene el balón + en qué zona del campo.
2. Cada jugador tiene una **zona base** según la formación del equipo (4-3-3 → dónde juega cada uno).
3. El poseedor elige una intención (avanzar / pasar / tirar) según **visión de juego + posicionamiento + riesgo**.
4. La acción se resuelve con una **cascada de chequeos**:
   `pase → control del receptor → avance → disparo → atajada del arquero`.
5. El resultado de cada chequeo define el siguiente paso y genera (o no) el evento:
   - pase fallido en zona media → pérdida / contraataque rival
   - entrada exitosa → robo y contraataque
   - disparo + atajada fallida → gol

### 5.2 Sistema de dados (estilo DnD, pero con dado d100)

- Cada chequeo compara la stat del actor contra la del rival (con los modificadores del caso): **d100 + modifiers ≥ dificultad**.
- **Crítico** (rango alto, ej. 98–100) y **pifia** (rango bajo, ej. 1–2): rangos **estrechos** para que sean raros como en la vida real. Los perks pueden ampliar/achicar los rangos.
  - Crítico → éxito reforzado: disparo = gol asegurado; pase = queda en el mejor lugar; entrada = roba y contraataca.
  - Pifia → fallo reforzado: disparo = afuera o contraataque rival; pase = intercepción; entrada = falta (y cartón según el árbitro).
- **Ventaja/desventaja** (tirar 2 dados y tomar mejor/peor) para situaciones de confianza (penales, mano a mano, presión).
- **Stamina**: cada minuto se tira contra la resistencia; los jugadores gastan/stabilizan puntos de stamina según el resultado. Baja stamina → penalizadores en las tiradas.

---

## 6. Habilidades (stats de jugador)

> **Placeholder**: mientras no exista el generador masivo de la CL, el sim deriva estas stats desde `rating` (0.5–6) + posición + seed. El generador futuro cargará valores reales ([[05-champions-league]]).

### Habilidades de campo
- Precisión a corta / media / larga distancia (pases y tiros según la distancia).
- Precisión de cabeza (pase y disparo).
- Velocidad · Agilidad (cambio de ritmo) · Resistencia (stamina).
- Salto · Dribble (en carrera) · Finta (amagues) · Control del balón (al recibir).
- Estabilidad (resistirse a ser derribado).
- Posicionamiento (generar/ocupar espacios, evitar los rivales).
- Visión de juego (predecir jugadas para atacar/defender).
- Entradas (robo; alta = menos faltas) · Barridas (al piso/exigido) · Despeje (precisión para despejar, no potencia).
- Potencia (separada de precisión): define hasta dónde llegan pases/despejes y la fuerza de disparos.
- Pierna mala: **no es un stat**, es una **penalización situacional** — probabilidad fija de que la jugada obligue a usar la pierna mala, con modificador negativo en esa tirada.

### Arqueros
- Reflejos · Posicionamiento · Salto (mismo stat) · **Estirada** (salvar pelotas lejos del cuerpo).
- **Atajada** (control cerca del cuerpo — la stat contraria a estirada).
- **Seguridad** (retener la pelota con firmeza ante tiros potentes, no dejar rebote).

### No-habilidades
- **Resistencia a lesiones**: se tira solo en eventos determinados, con dado muy grande para que sea realista.
- **Estado de forma**: ver §9.
- **Química**: ver §8.

---

## 7. Perks

Cada jugador, entrenador y (quizás) club puede tener perks: habilidades con efectos únicos. **Declarativos**, como datos:

```ts
type Perk = {
  id: string;
  target: 'player' | 'coach' | 'club';
  condition: string;      // ej: "rain", "critical-match", "adjacent-ally"
  modifier: Partial<Record<'advantage' | 'penalty' | 'critRange' | 'fumbleRange', number>>;
};
```

Ejemplos del dueño: *Nadador* (ventaja defensiva en lluvia), *Payaso* (+4 en generar faltas), *Estandarte* (+2 velocidad a compañeros adyacentes), *Salvapenaltis* (+3 al arquero en penales), *Mente Fría* (+4 en partidos críticos), *Autobús* (sube química con tácticas defensivas). El motor ejecuta perks genéricamente según `condition`.

---

## 8. Química

No se modela **por cada par** de jugadores (explosión combinatoria). Por capas:

- **Química de equipo** (tiempo jugando juntos) → modifica pases entre todos.
- **Química por línea** (defensa / medio / ataque).
- **Dúos/tríos clave** (opcional): solo los explícitos que quiera el dueño (ej. "Arhanv ↔ Muniv"), con bonus en pases/posicionamiento entre ellos.

Puede **derivarse automáticamente**: jugadores del mismo club o con varias temporadas juntos en la selección → química alta. Cero data entry manual.

---

## 9. Estado de forma

No se implementa como "+X a stats" en ese partido. Se modela con:

- **Ventaja/desventaja** en tiradas de confianza (tiros, penales, mano a mano): forma óptima → ventaja; forma mala → desventaja.
- **Stamina**: mala forma → se pierde más stamina por minuto (se apaga en el 2º tiempo).
- **Consistencia**: buena forma = menos varianza (tiradas estables); mala forma = más límites (más críticos y más pifias).
- **Lesiones**: mala forma → más propenso a lesionarse.

---

## 10. Integración futura (NO en esta fase)

1. **Generador masivo de jugadores** (CL): carga stats reales por jugador; reemplaza las derivadas del rating.
2. **Página pública de simulación**: input (equipos) → sim → output renderizado con componentes de [[06-partidos]].
3. (Opcional) Predicciones de próxima fecha con seed estable, y compartir sims por URL.

---

## 11. Estado actual

- Definido: visión, inputs/outputs, diseño del motor (zonas + cascada + d100 con semilla), lista de stats, perks declarativos, forma, química.
- Pendiente de decisión: cómo se eligen las intenciones (tablas de riesgo por contexto), valores de la cascada por zona, y detalles de los rangos de crítico/pifia por stat.
