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
    <div className="relative w-full mx-auto flex items-center justify-center p-6 bg-green-800">
      {/* Botón de anterior */}
      <div className="absolute top-1/2 left-0 transform -translate-y-1/2">
        <button
          className={`p-2 bg-green-700 text-white rounded-full hover:bg-green-500 ${
            currentIndex === 0 && "opacity-50 cursor-not-allowed"
          }`}
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <svg class="w-4 h-4 text-white rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
          </svg>
        </button>
      </div>

      {/* Botón de siguiente */}
      <div className="absolute top-1/2 right-0 transform -translate-y-1/2 z-1">
        <button
          className={`p-2 bg-green-700 text-white rounded-full hover:bg-green-500 ${
            currentIndex >= slides.length - visibleSlides && "opacity-50 cursor-not-allowed"
          }`}
          onClick={handleNext}
          disabled={currentIndex >= slides.length - visibleSlides}
        >
          <svg class="w-4 h-4 text-white rtl:rotate-180" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 6 10">
              <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
          </svg>
        </button>
      </div>

      <div className="flex space-x-4 max-w-10/12 justify-center">
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
                  className="w-72 h-auto object-center rounded-2xl hover:brightness-120 hover:scale-105 transition duration-300"
                />
              </a>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default Carousel;
