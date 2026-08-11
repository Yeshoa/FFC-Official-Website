## 1. Concepto

La **Forestian Champions League (FCL)** es una competición internacional anual de clubes dentro del Forest Universe.

Cada participante representa una **federación**, que puede contener uno o varios clubes. Los clubes compiten en torneos domésticos e internacionales y poseen plantillas de jugadores generadas para el universo.

La fuerza de los clubes **no se asigna manualmente**. Surge principalmente de:

1. Rendimiento deportivo previo.
2. Presupuesto disponible.
3. Decisiones del participante en el mercado de pases.
4. Calidad de los jugadores obtenidos.

---

# 2. Ciclo anual

El ciclo general de una temporada es:

```text
Temporadas domésticas
        ↓
Resultados deportivos
        ↓
Determinación de presupuestos FCL
        ↓
Generación / disponibilidad de jugadores
        ↓
Mercado de pases
        ↓
Plantillas de los clubes
        ↓
Competición FCL
        ↓
Resultados y estadísticas
        ↓
Nueva temporada
```

La evolución detallada de jugadores y otros sistemas de simulación se definirán posteriormente.

---

# 3. Federaciones y clubes

* Cada participante representa una federación.
* Una federación puede tener uno o varios clubes.
* Cada club tiene su propia plantilla y presupuesto.
* El presupuesto pertenece al club, no al participante.
* Un participante con varios clubes no recibe un único presupuesto que pueda redistribuir libremente.

El objetivo es que dos clubes de una misma federación puedan ser equilibrados o muy diferentes, pero que esa diferencia surja de su historial deportivo y no de una decisión arbitraria tomada justo antes del mercado.

---

# 4. Sistema de presupuesto

## 4.1 Principio general

El presupuesto de los clubes se deriva de **resultados deportivos reales dentro del universo**, evitando que el participante pueda decidir manualmente cuánto dinero recibe cada club.

La fórmula tiene dos niveles:

```text
Poder de federación
        ↓
Presupuesto máximo de referencia
        ↓
Rendimiento relativo de cada club
        ↓
Presupuesto individual
```

## 4.2 Poder de federación

Cada federación posee un **puntaje/poder federativo**.

Este valor determina el presupuesto máximo o techo económico de referencia de la federación.

La fórmula exacta para calcular el puntaje de federación queda fuera de este documento y será definida por separado.

## 4.3 Distribución entre clubes

El club de referencia de la federación establece el techo presupuestario.

Los demás clubes reciben un presupuesto proporcional a su rendimiento deportivo relativo respecto de dicho techo.

El rendimiento debe estar **normalizado** para permitir comparar ligas con distinta cantidad de partidos.

No se utilizarán puntos brutos de liga directamente.

Posibles métricas de normalización:

* porcentaje de puntos obtenidos sobre puntos posibles;
* percentil de posición final;
* combinación de ambas métricas.

La fórmula definitiva queda pendiente de definición.

## 4.4 Temporada utilizada

Para cada club se utiliza:

> La última temporada completada que haya disputado en su competición doméstica principal.

Esta regla debe estar definida previamente y aplicarse automáticamente.

Los participantes no pueden elegir qué temporada o competición utilizar para obtener ventaja.

## 4.5 Clubes sin historial

Si un club no tiene ninguna temporada doméstica válida:

1. Se recomienda al participante realizar una temporada antes del mercado.
2. Si no existe historial igualmente, el club recibe un presupuesto base/default.
3. El club no queda bloqueado ni excluido del mercado.

---

# 5. Jugadores

Antes del mercado se genera un pool de jugadores considerablemente superior a la cantidad necesaria para completar todos los clubes.

Cada club debe terminar con:

* mínimo: **23 jugadores**
* máximo: **32 jugadores**

Los jugadores poseen atributos y características que permiten evaluar su utilidad para los clubes.

La generación exacta de jugadores y sus atributos será definida por separado.

---

# 6. Mercado de pases inicial

El mercado es una instancia interactiva en la que cada participante construye las plantillas de sus clubes.

No requiere simultaneidad.

## 6.1 Precompras

Cada participante puede:

* buscar jugadores;
* consultar sus características;
* seleccionar jugadores de interés;
* realizar ofertas;
* establecer prioridades entre sus ofertas.

Las ofertas se mantienen ocultas durante el período del mercado.

Ejemplo:

```text
Presupuesto: 100M

Prioridad 1 — Jugador A — 20M
Prioridad 2 — Jugador B — 15M
Prioridad 3 — Jugador C — 10M
Prioridad 4 — Jugador D —  8M
```

## 6.2 Resolución

Al finalizar el período de mercado:

1. Se procesan las ofertas.
2. Cada jugador es adjudicado al club que haya realizado la mejor oferta válida.
3. El dinero correspondiente se descuenta del presupuesto del club ganador.
4. Las ofertas perdedoras no consumen presupuesto.
5. Las prioridades permiten determinar qué jugadores intenta conseguir primero cada club cuando existen múltiples ofertas y recursos limitados.
6. El proceso debe ser completamente determinista y reproducible.

Las reglas exactas para empates, ofertas mínimas y resolución de prioridades quedan pendientes de definición.

## 6.3 Restricciones de plantilla

El sistema debe impedir que un club termine con una plantilla inválida.

Reglas definitivas pendientes:

* cantidad mínima por posición;
* cantidad máxima de jugadores;
* requisitos obligatorios para completar una plantilla;
* tratamiento de clubes que no consiguen suficientes jugadores durante el mercado.

---

# 7. Filosofía del sistema

La FCL no busca asignar artificialmente una "fuerza" fija a cada club.

El objetivo es que la calidad de un club emerja de su propia historia y de las decisiones de su participante:

```text
Rendimiento histórico
        ↓
Presupuesto
        ↓
Decisiones de mercado
        ↓
Plantilla
        ↓
Rendimiento FCL
```

Esto permite que:

* clubes de una misma federación sean equilibrados;
* una federación pueda tener clubes de niveles muy diferentes;
* un club con mucho presupuesto pueda hacer malas compras;
* un club con menos presupuesto pueda construir una plantilla eficiente;
* los participantes tengan decisiones estratégicas reales;
* el sistema conserve el componente de roleplay.

---

# 8. Decisiones todavía abiertas

No forman parte de las reglas definitivas hasta ser especificadas:

* fórmula exacta del puntaje de federación;
* fórmula exacta de normalización del rendimiento doméstico;
* definición exacta del club de referencia/techo;
* generación y distribución inicial de jugadores;
* precio mínimo o valor inicial de los jugadores;
* reglas exactas de las ofertas;
* resolución de empates;
* funcionamiento detallado de prioridades;
* restricciones de posiciones;
* tratamiento de plantillas incompletas;
* evolución de jugadores;
* transferencias posteriores;
* simulación de partidos;
* sistema de puntos y clasificación FCL.

Estas decisiones deben diseñarse sin modificar innecesariamente las reglas base ya establecidas.
