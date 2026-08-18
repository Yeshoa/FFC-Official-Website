# 04 — Diseño objetivo: logros (achievements)

> Motor de logros más escalable + badges en el MemberHero + página de logros por federación.

---

## 1. Problemas actuales

- Los logros se muestran como **cartas grandes** (`AchievementCard.astro`) → no entran muchas en el `MemberHero`.
- El motor mezcla lógica en `lib/achievements/index.ts` con `dynamics/*` donde cada `def` tiene `evaluate()`; hay caches manuales (`duplicatedUniqueIdsCache`) y `console.log` en producción.
- Los logros "manuales" (`manualAchievements[]`) son ids sueltos sin progreso ni estados.
- No hay forma de mostrar **progreso**, **puntaje** ni logros **secretos ocultos**.

---

## 2. Diseño objetivo: badges en el MemberHero

- Los logros dejan de ser tarjetas grandes en el hero y pasan a ser **badges pequeños con un ícono simple según tipo**.
- Cada badge muestra: ícono del logro (+ tooltip con nombre/descripción al hover).
- Clasificación visual por **categoría** (Basic, Tournament, Streaks, Rivalry, Special, Community, Ranking) con un ícono simple por tipo.
- Se mantiene el color/estilo de rareza para el borde/glow del badge, pero en formato compacto.

### Componentes nuevos
- `MemberBadges.astro` (grid compacto en el `MemberHero`).
- `AchievementBadge.astro` (badge individual reutilizable).

---

## 3. Diseño objetivo: motor de logros más óptimo

### Principios
1. **Separación dato/cálculo**: cada logro es una definición (estática o dinámica) con un **evaluador puro**: `evaluate(context): AchievementResult | null`.
2. **Resultado con progreso**:
   ```ts
   interface AchievementResult {
     id: string;
     achieved: boolean;
     progress?: number;        // 0..100
     current?: number;         // valor actual
     target?: number;          // valor objetivo
     earnedAt?: string;
     visible: boolean;         // false = secreto
   }
   ```
3. **Un solo pipeline** (en vez de loops duplicados en `getAchievementsForMember` y `getMembersWithAchievement`): una función central `evaluateAchievements(member, context)` + indexaciones para consultas inversas (miembro → logros, logro → miembros).
4. **Cache correcto**: cache por `(member, season)` invalidado por un bump de datos, sin `console.log`.
5. **Logros secretos**: se evaluan pero no se revelan; se muestran como `?` en la página de logros y nunca muestran nombre/descripción (ver §4).
6. **Estáticos vs dinámicos**: los estáticos siguen siendo la collection `achievements` (con `id`); los dinámicos pasan a definiciones TS registradas. Ambos terminan como `AchievementResult` en el mismo pipeline.

### Registro de definiciones
- Mantener `dynamics/*` pero unificados bajo una API `register(def)`.
- `hierarchy` (minor→major) y `suppresses` se aplican en el pipeline central, no por archivo.

---

## 4. Diseño objetivo: página de logros por federación

Ruta propuesta: `/members/<slug>/achievements`.

### Contenido
1. **Obtenidos**: grid de badges con nombre, descripción, puntaje, rareza y fecha.
2. **Por obtener**: logros no logrados con su descripción y **progreso** (`progress`, `current/target`).
3. **Secretos**: logros secretos se muestran como **`?`**, sin revelar nombre, descripción, puntaje ni progreso. Solo se insinúa su existencia (icono oculto).
4. **Puntaje**: si un logro otorga puntos, mostrarlo junto a la badge.

### Comportamiento
- La página respeta `visible: false` y `enabled: false` (un logro deshabilitado no se muestra ni como secreto si así se define).
- Se puede alternar entre "Obtenidos" y "Por obtener" (tabs) si el grid se vuelve muy largo.

---

## 5. Impacto en componentes existentes

- `AchievementCard.astro` → se mantiene para contextos "detallados" (página de logros) y/o se simplifica.
- `AchievementStars.astro` → reutilizar en badges/página.
- `styles/` de rareza (`CommonCard`, `Uncommon`, …) → reutilizar tokens de color, pero la UI pasa a badge.

---

## 6. Categorías / subcategorías (mantener)

- `CATEGORIES`: Basic, Tournament, Streaks, Rivalry, Special, Community, Ranking.
- `SUBCATEGORIES`: mantener; se usan para agrupar en la página de logros.
- `ALIGNMENTS`: Neutral, Evil, Negative, Easter Egg, Special.

---

## 7. Pasos de implementación (resumen)

1. Definir `AchievementResult` + pipeline central (`evaluateAchievements`).
2. Migrar `dynamics/*` a la nueva API y quitar caches/console.log.
3. Crear `AchievementBadge` + integrar en `MemberHero`.
4. Crear página de logros por federación con obtenidos/por-obtener/secretos/progreso.
5. Mantener `AchievementCard` para contextos que lo ameriten.
