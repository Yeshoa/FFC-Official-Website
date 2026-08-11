La idea es crear un simulador de partidos, el cual recibe un input -> simula -> entrega un output.
Ese output luego puede ser leído por cualquier otro sistema (en nuestro caso, en la web), pero no es tan relevante eso en este momento.

## Qué va a recibir el simulador?
- El simulador va a recibir información general como estadio, ciudad, fecha y hora, clima, etc.
- Equipo local y visitante, con atributos cada uno (por ejemplo: presión al rival con cánticos, por definir esto la verdad no se que mas podrían tener)
- Los directores técnicos y sus atributos; filosofía de juego, mentalidad bajo presión, etc.
- Jugadores de los equipos, con sus estadísticas (crítico para el simulador), estado de forma y posiblemente otros atributos temporales que se usarán en partidos específicos.
- _Sugiere más inputs_

## Qué va a entregar el simulador?
- Estadísticas del partido (Pases, Tiros, Faltas, Córners, etc.)
- Eventos del partido (Goles, Tarjetas Rojas y Amarillas, Sustituciones, etc.)
- _Sugiere mas outputs_

## Cómo va a funcionar el simulador?
El simulador debería generar eventos y estadísticas dependiendo de las habilidades de los jugadores. 
- una idea es que se utilice un sistema como el DnD, en donde se definen las situaciones tirando un dado de X caras.
- otra idea es que simplemente tenga una simulación completa, registrando posición de cada jugador y de la pelota con x, y

Mi duda es como puedo implementar esto. Debería hacer este funcionamiento?:
- Inicia el partido, equipo A empieza tirando un dado
- si supera X (definido por qué tan buenos son los jugadores), obtiene un evento, sino, pierde el turno y le toca al rival
- no sé como decidir qué tipo de evento obtendrá el equipo, _necesito sugerencias_
tampoco sé de qué manera simular que los jugadores generan jugadas de gol, quería hacer que no sea tan complejo la verdad. Acá hay varias formas, se me ocurre una en donde se simule la posición de cada jugador y quién tiene la pelota, y entonces según los stats, tienen que pasar la pelota, la cual tambien tiene una posición en X, Y. esa sería la versión realista.
La versión DnD sería algo así como darle iniciativas a los jugadores, y que dependiendo que numero les toque cuando tiran el dado, entonces tienen la oportunidad. aunque no se bien como pensarlo a esto.
el sistema de rol de dados sería similar a baldurs gate y dnd; pueden tener ventaja o desventaja en diferentes situaciones, la "clase de armadura" en este caso sería una habilidad según la situación. por ejemplo si alguien tiene que saltar para dar un cabezazo, primero tiene que superar al defensor en el salto, y después debe superar al arquero con precisión de cabezazo vs. estirada del arquero

### Habilidades pensadas hasta el momento
No tiene qué ser taaan complejo, pero se me ocurren estas para que tengan sentido y cubran las necesidades:
- Presición a corta distancia. _Para pases cortos o tiros en el área chica_
- Precisión a media distancia. _Para pases un poco mas largos y tiros en el área_
- Precisión a larga distancia. _Para pases largos o tiros al arco de fuera del área_
- Presición de cabeza (tanto pase como disparo)
- Velocidad
- Agilidad (Qué tan rápido cambia de ritmo, distinto a velocidad)
- Resistencia (Esta me imagino que cada vez que pasa un minuto se tira un dado, si supera X entonces no pierde puntos de stamina en ese minuto. jugadores con esto alto entonces van a tener que superar numeros bajos y les bajará la stamina más lento.)
- Salto
- Dribble (en carrera)
- Finta (este es distinto a dribble, porque este serían los amagues, engaños, no el control del balon en carrera como si lo es el dribble)
- Control del balón (cuando recibe)
- Estabilidad (Qué tan difícil es que te derriben con el cuerpo)
- Posicionamiento (Qué tan bueno es moviéndose en el campo para aprovechar espacios o ser opción de pase/evitando que los rivales generen espacios o los aprovechen)
- Visión de juego (Qué tan bueno es prediciendo las jugadas para generar ataques/evitar ataques rivales)
- Entradas (Qué tan bueno es metiendo el pie y robando la pelota, también incluye la frecuencia con la que comete faltas, es decir si es alta esta stat, menos faltas comete)
- Barridas (Qué tan bueno es barriendo al piso o exigido, mismo que entradas)
- Despeje (Qué tan bueno es para despejar, y más aún en situaciones peligrosas. NO CONFUNDIR CON POTENCIA, sino con precisión para despejar y no pegarle a un rival/mandarla a un córner)
- Habilidad pierna mala? no se si sea necesario, pero para darle alguna utilidad al asignar pie bueno a los jugadores? _Capaz en cada evento se define el perfil en el que se va a ejecutar la acción... no se como hacerlo bien a esto_
- No se como implementa potencia de tiro? (que afecte a pases, despejes y disparos al arco)
### Para los arqueros
- Reflejos
- Posicionamiento
- Salto (mismo stat que antes, no uno nuevo)
- Estiradas (Posibilidad de salvar cuando la pelota va lejos de donde está posicionado)
- _Algún nombre para la stat contraria a estirada, que sería qué tan bueno es atajando cuando cae cerca suyo_
- Otra stat para qué tan firme ataja, para evitar tiros potentes.
### Atributos que no son habilidades pero están presentes:
- Resistencia a lesiones (Cuando ocurre un evento se tira un dado para ver si va a recibir una lesión o no, una resistencia baja tiene que sacar números mas altos.) _Aún así creo que tendría que ser en determinados eventos, y el dado debe ser muy grande para que sea medianamente realista_
- Estado de forma: No sé como podría afectar a los partidos. no me gusta mucho la idea de simplemente aumentar un par de puntos a alguna que otra habilidad en ese partido específico (o bajarlos dependiendo de la forma). Pensaba que si por ejemplo tiene forma óptima en este partido, obtenga ventaja en algunos tipos de eventos, o no se la verdad, sugerime cosas acá.
- Algo de química con los compañeros, pero no se como implementarlo y además tendría que tener una para cada compañero.... hay que pensar bien eso de las químicas

# Perks
Tengo pensado que cada jugador, entrenador y quizás club, tenga perks. Es decir, skills con efectos únicos o algo así. 

### Ejemplo de Perks para jugadores
- Nadador: Tiene ventaja en tiradas defensivas en partidos con lluvia.
- Payaso: Bonificación de +4 en las tiradas de generar faltas
- Estandarte: Otorga +2 a los stats de velocidad a sus compañeros adyacentes.
- Salvapenaltis: Bonificación de +3 en defender penales (arqueros)

### Ejemplo de Perks para entrenadores
- Mente Fría: Tiene un bonificador de +4 en partidos críticos (probabilidad de descender, necesidad de remontar una serie, etc.)
- Autobús: Aumenta la química del equipo con tácticas defensivas.

cosas así. La idea es que el simulador ejecute perks.

# Cómo se usarían las pifias y los críticos?
no tengo idea la verdad, ayudame a pensar bien esto.

# Química de jugadores?
Bueno la verdad no sé en qué podría afectar esto. podría ser que si un jugador tiene buena quimica con otro tiene bonificacion en los pases a ese jugador? o algo con la visión/posicionamiento.