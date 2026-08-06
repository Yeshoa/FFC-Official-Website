antes que nada me gustaría que a los cambios actuales (git status) los commitees en una branch nueva especifica para este plan de refactorización, sacalos de la branch actual.

Este proyecto funciona perfecto y ya está en producción.
Sin embargo, como fue parte de un aprendizaje mio para Astro, hay malas prácticas a lo largo de todo el proyecto, además de que no es muy escalable y es bastante incómodo mantenerlo actualizado.
La idea es solucionar estos problemas y mejorar mi experiencia a la hora de actualizar datos o implementar mejoras.
Para ello voy a sugerir una lista de pasos a seguir para obtener el mejor resultado posible:
Primero y principal debemos **generar una documentación en /docs de la situación actual del proyecto y de los cambios que se quieren realizar**
Acá dejo una lista de cosas que quiero mejorar del proyecto:
- Optimizar el ==**Frontmatter**== de las vistas (no tocar nada de lo visual, se ve todo perfecto por ahora) y los componentes a la hora de utilizar los datos que reciben, actualmente puede que hayan cosas que no se estén aprovechando al máximo, o que no se estén reutilizando correctamente. Esto también incluye archivos de la carpeta /Utils o /Lib
- Perfeccionar el sistema de puntos del ranking, en todas sus categorías, para que sea consistente a la hora de pasar a una nueva temporada.
- Luego de todo eso, necesito refactorizar la página para que tenga soporte para 2 tipos de torneos: los actuales (Forest Cup, torneo de selecciones nacionales), y la Forestian Champions League (torneo de clubes). Esto tambien implica la creación de clubes en las entradas de datos, que pertenecerán a ciertas federaciones. O sea que va a haber que agregar más cosas en las páginas de cada miembro, mostrando su liga doméstica (si la tiene).
- Crear un layout con una estética única para la champions league, esta será con un fondo negro y rombos verde lima fuerte. Esta estética estará en /forestian-champions-league y derivados, así como en las páginas de clubes y derivados de la champions.
- Mejorar la forma en que se definen los jugadores. actualmente funciona separados por seleccion nacional, lo cual no está mal, pero cómo va a ser si agregamos clubes? cómo organizamos a los jugadores?
- Otra cosa muy tediosa es a la hora de asignar goles a los partidos, hay que poner el id del jugador, y tener que andar buscando el id de cada jugador es un dolor de huevos. propones algun cambio al respecto para mejorar la experiencia? por eso pensaba en hacer una api para gestionar a los jugadores/partidos/equipos/etc. (lo dejé para lo último)
- Implementar páginas individuales para cada partido, mostrando los detalles completos. (actualmente los partidos no tienen página, pero tienen reservados en su definicion de /content/config.ts muchos datos).
- Será posible cambiar los datos (actualmente funciona con una carpeta content) y reemplazar la toma de datos con una api real? esto requeriría un proyecto nuevo aparte con una base datos y una sección de administración global de equipos, torneos, etc. (muy complejo). Ni hablar si hablamos de la posibilidad de permitir la creación de cuentas para administrar cada uno su federación, e incluso publicar artículos/sponsors. (dejemos esto para un futuro lejano).
- Los colores, por dios. No hago uso de --color-primary o variables reutilizables para mantener consistencia a lo largo de la página. quisiera mejorar eso para que haya consistencia. Además tratar de aprovechar más componentes reutilizables cuando sea posible (como tablas).
- Implementar los logros (para federaciones), pero en vez de ser cartas como ahora mismo, que sean pequeñas badges con un ícono símple según tipo, esto permite que entren muchas en el memberHero.
- Hablando de logros, posibilidad de rehacer o de refaccionar el motor de logros para que sea más óptimo y escalable.
- También me encantaría que haya una página de logros para cada federación, que muestre los logros obtenidos y por obtener (los logros secretos se muestran como un ? y no revelan ningún dato), su puntaje/descripción y el progreso (si aplica).

# Cosas que no se tocan
- Los artículos así están perfectos, son una joya
- Lo visual, a menos que sea para ajustar consistencias a lo largo del proyecto (como ligeros cambios de margenes o padding) pero la verdad todo eso funciona perfectísimo.

A raíz de esto me gustaría que empieces a planificar la documentación y me hagas las preguntas necesarias para hacerla.

Luego de hacer bien eso, procederemos a crear el plan de implementación completo para cada cosa separado, y bien dividido por pasos.

Además me gustaría que generes un AGENTS.md para todo el proyecto.
