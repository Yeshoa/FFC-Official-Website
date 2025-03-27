import React, { useState } from 'react';

const Carousel = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const visibleSlides = 4;

  const handleNext = () => {
    if (currentIndex < slides.length - visibleSlides) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prevIndex) => prevIndex - 1);
    }
  };

  return (
    <div className="relative w-full max-w-7xl max-h-1/2 mx-auto">
      <div className="flex overflow-hidden space-x-6">
        {slides.slice(currentIndex, currentIndex + visibleSlides).map((slide, index) => (
          <div key={index} className="w-1/4 flex-shrink-0">
            {
              <a 
                href={`https://www.youtube.com/embed/${slide.videoId}`}
                target="_blank"
              >
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-64 object-cover rounded-2xl"
                />
              </a>
            }
          </div>
        ))}
      </div>

      {/* Botón de anterior */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <button
          className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-500 ${
            currentIndex === 0 && "opacity-50 cursor-not-allowed"
          }`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          &#8249;
        </button>
      </div>

      {/* Botón de siguiente */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2">
        <button
          className={`p-2 bg-gray-700 text-white rounded-full hover:bg-gray-500 ${
            currentIndex >= slides.length - visibleSlides && "opacity-50 cursor-not-allowed"
          }`}
          onClick={handleNext}
          disabled={currentIndex >= slides.length - visibleSlides}
        >
          &#8250;
        </button>
      </div>

      {/* Indicadores de paginación */}
      <div className="flex justify-center mt-2">
        {slides.slice(0, slides.length - visibleSlides + 1).map((_, index) => (
          <div
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 mx-1 rounded-full cursor-pointer ${
              currentIndex === index ? "bg-green-500" : "bg-green-300"
            }`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
