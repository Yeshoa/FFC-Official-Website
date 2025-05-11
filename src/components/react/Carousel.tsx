import React, { useState, useEffect, useCallback, useRef } from 'react';

// Define la forma de un elemento del carrusel
export type CarouselItem = {
  src: { src: string }; // Estructura original: src es un objeto con una cadena src
  alt: string;
  caption: string;
  href?: string;
};

// Props para el componente Carousel
type Props = {
  items: CarouselItem[];
  intervalSec?: number; // Intervalo de reproducción automática en segundos
};

// Constante para la duración del bloqueo de interacción
const INTERACTION_LOCKOUT_DURATION = 100; // ms

const Carousel = ({ items, intervalSec = 5 }: Props) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false); // Para prevenir clics rápidos
  
  // Refs para el desplazamiento personalizado
  const thumbnailsContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  // Refs para obtener los valores más recientes de isAnimating y currentIndex en los callbacks.
  const isAnimatingRef = useRef(isAnimating);
  useEffect(() => {
    isAnimatingRef.current = isAnimating;
  }, [isAnimating]);

  const currentIndexRef = useRef(currentIndex);
  useEffect(() => {
    currentIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Comprobar si necesitamos mostrar los botones de desplazamiento
  useEffect(() => {
    if (!thumbnailsContainerRef.current) return;
    
    const checkScrollButtons = () => {
      const container = thumbnailsContainerRef.current;
      if (!container) return;
      
      const { scrollTop, scrollHeight, clientHeight } = container;
      
      setShowScrollUp(scrollTop > 0);
      setShowScrollDown(scrollTop + clientHeight < scrollHeight - 5); // 5px de margen para evitar problemas de redondeo
    };

    // Inicializar la comprobación
    checkScrollButtons();
    
    // Agregar event listener
    const container = thumbnailsContainerRef.current;
    container.addEventListener('scroll', checkScrollButtons);
    
    // Limpiar
    return () => {
      container.removeEventListener('scroll', checkScrollButtons);
    };
  }, [items.length]);

  // Desplazamiento a la miniatura activa
  useEffect(() => {
    if (!thumbnailsContainerRef.current) return;
    
    const container = thumbnailsContainerRef.current;
    const activeThumb = container.querySelector(`[data-index="${currentIndex}"]`) as HTMLElement;
    
    if (activeThumb) {
      // Calcular la posición para centrar el elemento
      const containerHeight = container.clientHeight;
      const activeThumbHeight = activeThumb.clientHeight;
      const activeThumbTop = activeThumb.offsetTop;
      
      container.scrollTo({
        top: activeThumbTop - (containerHeight - activeThumbHeight) / 2,
        behavior: 'smooth'
      });
    }
  }, [currentIndex]);

  // Función para desplazarse hacia arriba en la lista de miniaturas
  const scrollThumbnailsUp = () => {
    if (!thumbnailsContainerRef.current) return;
    
    const container = thumbnailsContainerRef.current;
    container.scrollBy({
      top: -150,
      behavior: 'smooth'
    });
  };

  // Función para desplazarse hacia abajo en la lista de miniaturas
  const scrollThumbnailsDown = () => {
    if (!thumbnailsContainerRef.current) return;
    
    const container = thumbnailsContainerRef.current;
    container.scrollBy({
      top: 150,
      behavior: 'smooth'
    });
  };

  // Función memoizada para ir a la diapositiva anterior
  const goToPrev = useCallback(() => {
    if (isAnimatingRef.current || items.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex((prevIdx) => (prevIdx - 1 + items.length) % items.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, INTERACTION_LOCKOUT_DURATION);
  }, [items.length]);

  // Función memoizada para ir a la diapositiva siguiente
  const goToNext = useCallback(() => {
    if (isAnimatingRef.current || items.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex((prevIdx) => (prevIdx + 1) % items.length);

    setTimeout(() => {
      setIsAnimating(false);
    }, INTERACTION_LOCKOUT_DURATION);
  }, [items.length]);

  // Función memoizada para ir a una diapositiva específica
  const goToSlide = useCallback((index: number) => {
    if (isAnimatingRef.current || index === currentIndexRef.current || items.length <= 1) return;

    setIsAnimating(true);
    setCurrentIndex(index);

    setTimeout(() => {
      setIsAnimating(false);
    }, INTERACTION_LOCKOUT_DURATION);
  }, [items.length]);

  // useEffect para transiciones automáticas de diapositivas (reproducción automática)
  useEffect(() => {
    if (items.length <= 1 || intervalSec <= 0) return;

    const timerId = setInterval(() => {
      goToNext();
    }, intervalSec * 1000);

    return () => clearInterval(timerId);
  }, [currentIndex, items.length, intervalSec, goToNext]);

  if (!items || items.length === 0) {
    return <div className="w-full max-w-7xl mx-auto p-4 text-center text-gray-500">No hay elementos para mostrar.</div>;
  }

  const currentItem = items[currentIndex];

  return (
    <div className="w-full max-w-7xl mx-auto p-4 font-sans">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Panel de Imagen Principal */}
        <div className="relative w-full lg:w-3/4 h-[500px] md:h-[600px] lg:h-[700px] rounded-xl overflow-hidden shadow-2xl group bg-gray-200 dark:bg-gray-800">
          <a href={currentItem.href || '#'} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            <img
              key={currentIndex} // Clave importante para que React reemplace el elemento img en lugar de solo actualizar props
              src={currentItem.src.src}
              alt={currentItem.alt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out" // Eliminada transition-opacity
            />
            {/* Superposición de gradiente */}
            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/50 to-transparent z-10" />
            
            {/* Texto de la Leyenda */}
            <div className="absolute bottom-6 left-6 md:bottom-10 md:left-10 z-20 text-white p-2">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold drop-shadow-md">
                {currentItem.caption.split('\n').map((line, idx) => (
                  <span key={idx}>
                    {line}
                    <br />
                  </span>
                ))}
              </h2>
            </div>
          </a>

          {/* Botones de Navegación */}
          {items.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); goToPrev(); }}
                aria-label="Diapositiva anterior"
                className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 z-30 text-white bg-black/40 hover:bg-black/60 focus:bg-black/60 p-2.5 sm:p-3 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); goToNext(); }}
                aria-label="Siguiente diapositiva"
                className="absolute top-1/2 -translate-y-1/2 right-2 sm:right-3 z-30 text-white bg-black/40 hover:bg-black/60 focus:bg-black/60 p-2.5 sm:p-3 rounded-full transition-all duration-300 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 md:w-6 md:h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Panel de Miniaturas con Desplazamiento Personalizado */}
        {items.length > 1 && (
          <div className="w-full lg:w-1/4 relative">
            {/* Botón de desplazamiento hacia arriba */}
            {showScrollUp && (
              <button
                onClick={scrollThumbnailsUp}
                aria-label="Desplazar miniaturas hacia arriba"
                className="absolute top-0 left-1/2 -translate-x-1/2 z-20 hidden lg:block bg-black/50 hover:bg-black/70 text-white rounded-b-lg px-6 py-1 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                </svg>
              </button>
            )}
            
            {/* Contenedor de miniaturas con desplazamiento personalizado */}
            <div 
              ref={thumbnailsContainerRef}
              className="w-full flex-row lg:flex-col items-center gap-3 lg:gap-4 overflow-x-auto lg:overflow-y-auto lg:max-h-[700px] pb-2 lg:pb-0 scrollbar-hide hidden lg:flex"
              style={{ 
                scrollbarWidth: 'none', /* Firefox */
                msOverflowStyle: 'none', /* IE and Edge */
              }}
            >
              {items.map((item, index) => (
                <div
                  key={index}
                  data-index={index}
                  onClick={() => goToSlide(index)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToSlide(index); }}
                  aria-label={`Ir a la diapositiva ${index + 1}: ${item.caption}`}
                  className={`cursor-pointer w-32 lg:w-[250px] xl:w-full flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 ease-in-out relative group/thumb bg-gray-100 dark:bg-gray-700
                    ${ index === currentIndex
                        ? 'shadow-xl scale-100'
                        : 'opacity-70 hover:opacity-100 hover:shadow-md scale-95'
                    }`}
                >
                  <img
                    src={item.src.src}
                    alt={`Miniatura: ${item.alt}`}
                    className="w-full h-20 lg:h-30 lg:w-[250px] xl:w-full object-cover transition-transform duration-300"
                  />
                  <div className={`absolute inset-x-0 bottom-0 text-white text-xs px-2 py-1.5 text-center truncate transition-all duration-300 
                    ${index === currentIndex 
                      ? 'bg-green-600/90 font-semibold' 
                      : 'bg-black/60 opacity-0 group-hover/thumb:opacity-100 lg:opacity-100'
                    }` }
                  >
                    {item.caption}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Botón de desplazamiento hacia abajo */}
            {showScrollDown && (
              <button
                onClick={scrollThumbnailsDown}
                aria-label="Desplazar miniaturas hacia abajo"
                className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 hidden lg:block bg-black/50 hover:bg-black/70 text-white rounded-t-lg px-6 py-1 transition-all duration-300"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>
            )}
            
            {/* Degradados de desvanecimiento para indicar desplazamiento */}
            {showScrollUp && (
              <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10 hidden lg:block dark:from-gray-900/80"></div>
            )}
            {showScrollDown && (
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white/80 to-transparent pointer-events-none z-10 hidden lg:block dark:from-gray-900/80"></div>
            )}
          </div>
        )}
      </div>
      
      {/* Indicadores de Página (móvil) */}
      {items.length > 1 && (
        <div className="flex lg:hidden justify-center gap-2.5 mt-6">
          {items.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ease-in-out
                ${ index === currentIndex ? 'bg-green-500 scale-125 w-6' : 'bg-gray-400 hover:bg-gray-500 focus-visible:bg-gray-500'
                }`}
              aria-label={`Ir a la diapositiva ${index + 1}`}
            />
          ))}
        </div>
      )}
      
      {/* Estilos CSS para ocultar las barras de desplazamiento */}
      <style jsx>{`
        /* Ocultar scrollbar para Chrome, Safari y Opera */
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default Carousel;