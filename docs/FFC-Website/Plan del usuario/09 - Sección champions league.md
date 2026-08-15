# tournamentHero (de la Forest Cup solamente) 
se muestra una lista horizontal de las ediciones subsecuentes, con el año. al menos en la forest cup, me gustaría que muestre el nombre de esa edición (Cacusia 2026, Anxious & Kevin 2024....) como antes. en la de la FCL se mantiene como ahora. 

# Navegación de la sección champions league:
actualmente el navbar en modo champions league es: Home, Ranking, Clubs, Market y Forest Cup creo que hay que cambiar cosas. 

- primero es el toggler entre la sección normal y la champions league, para mi debería haber algo como "return to FFC", y en la FFC, un botón similar para "Go to FCL" 
- la home de la forestian champions league tendría que ser algo similar a /forest-cup, pero con:- 
	- un hero que ocupe el viewport (como el index) con botones call to action (similar al actual): uno que envíe a la temporada actual, otro que mande a la sección de historia. 
	- después debería haber una sección de articulos a la izquierda, la misma que hay en el index, obviamente con otros articulos destacados sobre la champions league. al costado derecho, en vez de resultados recientes, podría entrar el ranking de clubes o **ranking de ligas**, pero más compacto que el actual, no me gusta nada lo grande que es.
	- Debajo deberían haber componentes similares a los que hay en /forest-cup, pero para la champions league: tabla histórica de clubes (cappeado hasta el top 30), goleadores y asistidores (top 10, exactamente como está ahora en /forest-cup), una lista compacta de las últimas ediciones y quién salió campeón (nuevo componente, porque usamos uno como el de /forest-cup, quedaría inmenso)
- hablando de ranking de ligas, preparate para agregarlo a la documentación e implementarlo. (el ranking de ligas va a ser similar al ranking de federaciones, pero con otros inputs (eventos, bonuses, etc.) prepara el terreno para ese ranking.
- el segundo botón del navbar debería se para las ligas, que aparezcan las ligas ordenadas por ranking
- el tercer botón debería ser de clubes, pero deberían mostrarse solo los clubes que están clasificados a la edición actual de la champions, no todos como lo hace ahora. (Creo que lo ideal para asegurarse de que equipos están clasificados a la champions, sería corroborarlo desde los pots en tournaments.json)
- Las tarjetas de los clubes deberían ser iguales a las memberCards, escudos más grandes, bandera y code del país, y bueno me gusta que se agregue el nombre del equipo y las estrellas.
- el cuarto ahora si, el ranking. deberían haber 2 rankings. el de ligas y el de clubes. en este caso. PD: hay un error ahora mismo, si voy a ranking, aparece como activo en el navbar tanto ranking como home. lo mismo pasa en la pagina de market, pero con market y home
- actualmente el último botón es el que lleva a /forest-cup. como vamos a agregar un "Go To FFC" no tiene sentido mantener ese botón.
- Abajo de TODAS las páginas, tiene que estar el mísmo componente de artículos que se utiliza por toda la página, filtrando por los tags que corresponden. en el caso de la FCL, se filtra por ese mismo tag, FCL.

# Página de un club clubs/[slug]
- la tabla de participación en champions leagues solo debe mostrar las ediciones que participó, no debe mostrar ediciones que no haya participado. esto es porque van a haber muchisimas.
- El componente que muestra el squad y el componente que muestra la tabla de posiciones de la liga doméstica deben mostrarse a la misma altura, o sea deberían estar en 2 columnas, cada componente en una columna. y además deberían ser más compactos y tener colores de la FCL. actualmente tienen colores de la FFC que son los verdes.
- el componente del squad no debería tener el nombre del equipo al lado, y tampoco debería tener la palabra "power" explícita. La lista de jugadores en los clubes quiero que tenga cambios. Así debería verse cada fila de jugador: Posición Dorsal Banderita(sin code, sin nombre de país) Nombre de pila **Apellido**
  después pegado a la derecha: ++++ 80 (las estrellas y el overall en negrita y con color dependiendo el valor, igual que en el market).
  Hacé que las columnas sean compactas. la de nombres tiene que estar alineada a la izquierda.
- La tabla de posiciones no debería decir "Domestic League" ni division 1. debería decir literal el nombre de la liga. El "Season 2026" tiene que ser más visible, actualmente es re chiquito.
- Cada fila de club debería mostrar al lado izquierdo del nombre, en vez de un puntito de color, literalmente el logo del club. Si no tiene logo, mostrar el puntito.
- Si es necesario hacer mas compacta la tabla para que entre en una columna de 1/2, hacelo.
# Cambios en la página normal (fuera de la sección FCL)
- Acá hay que hacer los mismos cambios que en la pagina de clubs/[slug], para lo del squad y la tabla de posiciones de la liga local. Literalmente lo mismo, a la lista de jugadores solamente se le adiciona a la derecha una columna que muestre el club al que pertenece, con LOGO y CODE (generalmente de 3 o 4 letras), solo eso cambiaría. después es todo igual, pero con los colores de la FFC.
- Las member cards ahora pueden mostrar las estrellas de su equipo como lo hacen las de la champions (sin el numero del poderío)
- también quisiera cambiar el hero del index de la FFC, que tenga 2 botones CTA: uno que vaya a /forest-cup y otro a la home de la forestian champions league. 
- En las páginas de la FFC, excepto en el index y en las paginas de federaciones (members/[slug]), filtrar los articulos con tags de FCL (no mostrarlos).
- Retirar el botón de sponsors en el navbar.
# Tournaments.json
separarlo en 2 archivos uno para las forest cups y otro para las champions leagues