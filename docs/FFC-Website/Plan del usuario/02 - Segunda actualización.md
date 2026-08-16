Cosas que se me vinieron a la mente:
- En la lista del squad actual de las selecciones nacionales (y futuros clubes), tendría que aparecer también las estrellitas de cada jugador (su rating)
- A los miembros estaría bueno que se les muestre estrellas debajo de su rating, indicando el poderío real de su selección nacional. esto se calcula con una función basada en el rating de los equipos, y los tiers. siendo de 0.5 a 6 estrellas, paso a indicar los thresholds: me quedo con la columna de rating 2, es mas justa creo yo. qué pensás?

| Rating  | Rating 2 | Estrellas |
| ------- | -------- | --------- |
| 0-6     | 0-5      | 0.5       |
| 6-12    | 6-11     | 1         |
| 12-20   | 12-17    | 1.5       |
| 20-30   | 18-25    | 2         |
| 30-48   | 26-39    | 2.5       |
| 48-60   | 40-55    | 3         |
| 60-70   | 56-72    | 3.5       |
| 70-80   | 73-90    | 4         |
| 80-100  | 90-108   | 4.5       |
| 100-126 | 108-127  | 5         |
| 126-160 | 128-159  | 5.5       |
| 160+    | 160+     | 6         |
- Otra cosa que se me ocurrió, es que la pagina principal sea basada en la forest cup, pero cuando uno cambie a champions league, también cambie el navbar, y sea la navegación de la champions league. para volver a la navegación anterior, tiene que hacer click en forest cup, o podría haber algún selector para decidir si estar en la sección de champions league o de forest cup(por defecto). entonces si alguien hace click en home desde el navbar de la champions league, lo va /fcl/index.astro, lo mismo con ranking, y bueno... no se como será con articles y sponsors ya que esos son globales..... mmmmmmmmm, dame ideas.
- el verde de la champions sería este: #b4ff00 y puede tener como secundario este: #00ffb4
- el negro champions sería #000014