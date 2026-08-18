# Implementar react en la web
Actualmente está desactivado, sin embargo si activo el ssr creo que se rompe el deploy de netlify o no se que pasa. quisiera revisar eso bien, pero más tarde, después de realizado los cambios
### Sobre las ligas
Parece que es buena idea implementar en la pagina de las federaciones un componente simple que muestre la tabla de la última temporada de la liga local. esto necesita tener datos de la liga de esa federacion, y además tener a todoss los clubes (almenos de esa division). por supuesto las ligas son opcionales y algunas federaciones no tendrán.

# Simulador mercado de pases champions league
hacer un simulador del mercado de pases de la champions league
tiene que ser simple y divertido, no es necesario base de datos ni infraestructura compleja. simplemente va a haber un JSON con todos los jugadores disponibles para comprar.
Flujo de uso: el usuario entra a la pagina del simulador -> asigna un presupuesto manualmente (ya va a saber de antemano cuanto asignar) -> le aparece una sidebar con la lista de jugadores, en el centro una imagen de una cancha de futbol y 11 espacios vacíos a rellenar (los titulares) y el banco de suplentes a rellenar -> empieza a buscar jugadores con algunos filtros, y los puede arrastrar hacia los espacios, a menos que no esten dentro del presupuesto actual -> una vez completo el equipo, hace click en un botón para descargar la plantilla como un JSON, o en su defecto un botón de copiar al portapapeles -> los participantes me envian ese archivo por privado o lo suben a un formulario (por verse)

entonces de esta forma, no necesita tanta infraestructura, solo una isla react. El flujo no tiene por que ser 100% exacto, puede cambiar cosas como la forma de meter a los jugadores en el equipo
