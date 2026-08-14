# Selector de club
Hacer elegir primero, de un componente compacto, la federación -> Luego muestra los clubes disponibles de esa federación, ordenados según la tabla de clasificación de su última liga. En caso de que no haya tenido liga, entonces se muestran en orden alfabético

# Filtros
Como está ahora está muy bien (filtro por búsqueda y posiciónes GK, DEF, MID, FWD), aunque creo que sería mejor que sea mas específico y permita filtrar por posición exacta.

# Lista de jugadores
Acá hay que hacer brillar a los stats, debería poder verse las estrellitas del jugador, y la valoración general. Además antes del nombre Mostrar la bandera de su nacionalidad.
Si un jugador no entra en nuestro presupuesto, debería verse más oscuro y no tengo que poder seleccionarlo directamente.

# Formación
Las 3 formaciones actuales están muy bien, aunque creo que deberían haber muchas más opciones (podría haber un archivo en donde defina todas las posiciones posibles). Para no llenar la pantalla de botones, sugiero algún componente más compacto para la selección de formación. 
Además, noté que la canchita limita el colocar jugadores que no son de esa posición, no debería tener límite. Los usuarios deberían poder armar el equipo a gusto.
- Los slots de la cancha deberían tener la abreviación de la posición exacta, en vez de "DEF, MID, FWD"
- Cuando un jugador es puesto en una posición, sea o no sea su natural, se tiene que recalcular el overall rating que tiene ese jugador en dicha posición (va a cambiar si no es su posición).
  Ejemplo: Un delantero de 90 puesto de defensor, debería bajar a 60 o algo así.
- No me gusta el drag and drop, no es intuitivo para mobile tampoco. Prefiero un método distinto: Click en la posición -> Click en el jugador, O viceversa. Además añade un pequeño instructivo de cómo usarlo.
- Cartas de jugador: Cuando se agrega un jugador a la posición en la cancha o en la banca, debe mostrarse una carta completa y mas grande de lo que hay ahora.
- La banca debería ser de 12 jugadores, (11+12=23 Mínimo. Forzar 1 arquero en la banca) y después las reservas tienen que ser opcionales, hasta 32 jugadores máximo (serían 9 reservas).

# Cartas de jugador

**Estructura general**

- Rectángulo vertical, aproximadamente **2:3**.
    
- Fondo de color dependiendo de su valoración, cuanto más alto mas efectos.
    
- Borde fino de color dependiendo del fondo, quizá con un pequeño efecto de glow.
    
- Esquinas apenas redondeadas.
    
- Algún patrón geométrico muy sutil en el fondo, siguiendo los diamantes/nodos de la FCL.
    

**Cabecera**

- Arriba a la izquierda: **posición** (GK, CB, RB, LB, etc.).
    
- Arriba a la derecha: **overall grande**, por ejemplo `84`.
      
- Opcional: **edad** debajo del overall.
    

**Centro**

- Bandera de nacionalidad, con abreviación (CODE, aca se usa el code) al lado en mayusculas
    
- Debajo, nombre del Jugador:
  **ARHANV**
    
- Podés agregar detrás forma geométrica muy tenue, o las iniciales del jugador con baja opacidad.
    

**Stats**  
Una sección inferior con 4–6 atributos importantes debajo, por ejemplo (no es nuestro caso):

`PAC 82` · `SHO 76` · `PAS 88`  
`DRI 84` · `DEF 71` · `PHY 79`

Debería adaptar esto a nuestros skills. Evitar usar skills específicos y en su lugar usar "categorías de skill" o algo así? Como por ejemplo Físico, Técnica, Táctica, no tengo idea.

**Valor / mercado**  
En la parte inferior:

`VALOR €12.4M`  

---

### Estrellitas

Sugerime donde colocar las estrellitas y donde crees que quedarían mejor. Pensaba por encima de los stats, y que queden centradas.

---

### Un detalle que puede quedar MUY bien en tu estética

En vez de hacer una carta tradicional con bordes rectos, podés poner **pequeños nodos circulares en las esquinas conectados por líneas diagonales**, como si la carta fuera un módulo de la interfaz FCL.

Algo así conceptualmente:

```text
      ○──────────────○
      │  MC       84 │
      │              │
      │   🏴 BIL     │
      │              │
      │  MATEO       │
      │  VARELA      │
      │              │
      │   ★★★★☆   │
      │ PAC 82  SHO 76
      │ PAS 88  DRI 84
      │              │
      │              │
      │ €12.4M       │
      ○──────────────○
```

Para finalizar, una pregunta. cómo podemos mostrar esta carta antes de que el usuario lo coloque en el campo/banca/reserva? porque siento que es un feature importantísimo las cartas, y con la lista compacta actual no se puede apreciar. (no digo que saquemos la lista compacta actual, pero alguna forma de previsualizar la carta antes de colocar al jugador)