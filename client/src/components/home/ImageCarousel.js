import React, { useState, useEffect } from 'react';

const ImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto slide every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  // Manual navigation
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  return (
    <div className="position-relative h-100 overflow-hidden">
      {/* Images */}
      <div
        className="h-100 d-flex transition-custom"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {images.map((image, index) => (
          <div
            key={index}
            className="h-100 w-100 flex-shrink-0"
            style={{
              backgroundImage: `url(${image.url})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            <div className="h-100 w-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50">
              <div className="text-center p-4">
                <h2 className="text-white display-4 fw-bold mb-4 animate-float">
                  {image.title}
                </h2>
                <p className="text-white lead mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                  {image.description}
                </p>
                {image.cta && (
                  <button className="btn btn-light btn-lg">
                    {image.cta}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="position-absolute start-0 top-50 translate-middle-y btn btn-light bg-opacity-75 rounded-circle p-2 ms-3"
      >
        <i className="bi bi-chevron-left fs-4"></i>
      </button>
      <button
        onClick={goToNext}
        className="position-absolute end-0 top-50 translate-middle-y btn btn-light bg-opacity-75 rounded-circle p-2 me-3"
      >
        <i className="bi bi-chevron-right fs-4"></i>
      </button>

      {/* Dots */}
      <div className="position-absolute bottom-0 start-50 translate-middle-x d-flex gap-2 mb-4">
        {images.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`btn btn-sm rounded-circle p-2 ${
              index === currentIndex ? 'btn-light' : 'btn-light opacity-50'
            }`}
            style={{ width: '12px', height: '12px', padding: '0' }}
          />
        ))}
      </div>
    </div>
  );
};

export default ImageCarousel; 