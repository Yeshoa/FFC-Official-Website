bueno a ver. primero arreglemos los filtros: 
- botón de clear filters 
- NO UTILIZAR EL SIMBOLO DE EUROS POR FAVOR, usar $ SIEMPRE 
- los inputs de valores no tienen validación, por ejemplo puedo poner precios negativos (no tiene sentido) 
- cambiá el selector de nacionalidades por un componente nuevo, en donde se enlisten en un grid con pequeños botones que contengan la banderita y el code (abreviación) del país. además ese componente va a tener una barrita de búsqueda para buscar el país, filtrando por NOMBRES que CONTENGAN las letras introducidas. es decir si alguien se confunde y busca "BLISA" debería aparecer bilsa de todas formas 
- algo similar ccon las posiciones, pero sin necesidad de filtro por busqueda. que aparezca un cuadrito con las posiciones ubicadas en el lugar que les corresponde en la cancha. (a continuación coloco la estructura aproximada en texto)
# Filtros por posición
Una caja 3x6 así (| es vacío)

LWF - CF - RWF
|-CAM-|
LM-CM-RM
|-CDM-|
LB-CB-RB
|-GK-|

# La lista
La lista está sticky, bien, pero no la hiciste alta como para que cuando uno baje un poco scrolleando, ocupe todo el alto. solamente ocupa el viewport. la idea es que ocupe todo el alto de la pantalla. (sería del tamaño del viewport - el navbar)
que sea del tamaño del viewport no significa que debe entrar si o si cuando estoy arriba de todo, es normal que sea vea como que sigue de largo un poco porque hay objetos arriba que ocupan espacio.
