# Codigos numericos de nacionalidades

COUNTRY_CODES = {

    "Zerphen": "191",
    "Stralla": "192",
    "Columbiqash": "193",
    "Nardin": "194",
    "New Libertalia Kingdom": "195",
    "Otterland": "196",
    "Nordustra": "197",
    "Furilisca": "198",
    "Jutsa": "199",
    "Realize": "200",
    "Ruinenlust": "201",
    "Garbelia": "202",
    "Einswenn": "203",
    "Cacusia": "204",
    "Freistaat Ostpreussen": "205",
    "Bisofeyr": "206",
    "Ecologist Hegemony": "207",
    "Roless": "208",
    "Zane Farbe Eslanudial": "209",
    "Anxious and Kevin": "210",
    "Chaplin": "213",
    "United Malay Federation": "214",
    "Lumiose": "215",
    "Green Empire Karaa": "216",
    "Azure Mines": "217",
    "Atsvea": "218",
    "Valentine Z": "219",
    "Chan Island": "220",
    "ForFishing": "221",
    "Sehir": "222",
    "Glo": "223",
    "Verdant Haven": "224",
    "Klaus Devestatorie": "225",
    "Ownzone": "229",
    "Reannia": "230",
    "Clown Town City": "231",
    "Bextoria": "232",
    "Oseao": "234",
    "Bilsa": "236",
    "Woodland Green": "239",
    "Mozolephies": "245",
}
escuchame una cosa, agregué un archivo csv que contiene a todos los jugadores que participaron de las Forest Cup 2026, y que quiero traspasar a players.json (como jugadores activos). 

serías capaz de, traspasar toda la info? incluyendo: 
- Nombre y Apellido
- Edad
- Altura (lo agregamos a este proyecto y podemos hacer que jugadores mas altos tengan mas chances de cabezazos en el simulador?)
- Nacionalidad (Preparé los códigos de los países que tenemos en la FFC para que sepas cuales son)
- Pierna buena (es la columna foot: false = derecha, true = izquierda) (esto deberíamos tenerlo en el proyecto, aunque no creo que sea muy necesario mostrarlo en las cartas por ahora)
- POS es la posición principal de ese jugador. 
- Después hay columnas que se llaman como cada posición, y que tienen un 0 o 1 dependiendo de si dominan esa posición o no. (no estoy seguro de implementar esto a este proyecto)
- Form: es para determinar la posibilidad de estar en buena o mala forma, va del 1 hasta el 8: 1 suele estar en mala forma, 8 en buena. Esto lo deberíamos implementas en el modelo de jugadores de este proyecto. aunque no me gusta mucho es del 1 al 8, usemos algo más lineal como las demas habilidades. (también podríamos agregarlo a la fórmula del precio de mercado)
- InjuryResistance: no hace falta aclarar creo, 1 se lesiona seguido, 3 es resistente
- PlayingStyle: esta es interesante, podemos agregar ese campo a nuesto modelo de jugadores, pero no sé como lo podríamos utilizar en el simulador....
- después hay skills, pero no me interesa utilizarlas en nuestro simulador, ya que vamos a utilizar perks custom que quiero hacer yo manualmente mas tarde.
- finalmente tienen una columna que se llama overallstats, podrías usarlas como referencia para saber mas o menos por donde anda cada jugador. en pes va de 40 a 109 asi que solo usalo de simple referencia, NO vamos a utilizar la misma escala ni de broma, yo despues lo calibro al cálculo de overall.
- Respecto a las habilidades en sí, tratá de ver cuales matchean con nuestro motor.

quizás te convenga leer la carpeta del proyecto en donde generaba todas los valores de las columnas. está en D:\HMH\Forest\Forest Cup 2026\generador\PES_2021_Generator

# Cartas de jugadores
Olvidé por completo los PERKS, pensaba que fueran hexágonos con un dibujito svg encima, el tema es no se donde podrían incluirse en la carta.
También hay que crear el modelo de perks, con id, nombre, imagen (como dije, pensaba un svg o algo para que sean únicas) y descripción (en esta web no van a tener funcionalidad las perks mas allá de ser asignadas a los jugadores) y los jugadores tienen que tener un atributo array de perks (.perks[1,5,12,24,55] ejemplo) para ser mostrados en sus cartas y que aumenten su valor de mercado.