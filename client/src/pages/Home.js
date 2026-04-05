import React from 'react';
import Navigation from '../components/layout/Navigation';
import ImageCarousel from '../components/home/ImageCarousel';
import AboutSection from '../components/home/AboutSection';
import Footer from '../components/layout/Footer';

const Home = () => {
  // Sample carousel images (replace with actual images)
  const carouselImages = [
    {
      url: '/carousel/village1.jpg',
      title: 'Welcome to Puriya Thanda',
      description: 'Discover the beauty, culture, and unity of our village',
      cta: 'Explore More'
    },
    {
      url: '/carousel/festivals.jpg',
      title: 'Vibrant Festivals',
      description: 'Experience our rich cultural celebrations and traditions',
      cta: 'View Gallery'
    },
    {
      url: '/carousel/nature.jpg',
      title: 'Natural Beauty',
      description: 'Surrounded by pristine landscapes and scenic views',
      cta: 'Learn More'
    }
  ];

  return (
    <div className="min-vh-100 home-page">
      <Navigation />
      
      {/* Hero Section with Carousel */}
      <section id="home" className="hero-section">
        <div className="container hero-content-wrap">
          <div className="row align-items-center">
            <div className="col-md-6 mb-4 mb-md-0">
              <h1 className="display-4 fw-bold mb-4">
                Welcome to Puriya Thanda
              </h1>
              <p className="lead mb-4">
                Discover the beauty, culture, and unity of our village
              </p>
              <button className="btn btn-custom-primary btn-lg">
                Explore More
              </button>
            </div>
            <div className="col-md-6">
              <div className="carousel-container">
                <ImageCarousel images={carouselImages} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <AboutSection />
      </section>

     

      {/* Gallery Preview Section */}
      <section id="gallery" className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">
            Gallery
          </h2>
          <div className="grid-gallery">
            {['Youth', 'Marriage Vibes', 'Festival Vibes', 'Nature', 'Unity'].map((category, index) => (
              <div
                key={index}
                className="image-container hover-scale"
              >
                <img
                  src={`/gallery/${category.toLowerCase()}.jpg`}
                  alt={category}
                  className="img-fluid"
                />
                <div className="overlay">
                  <h3 className="text-white fs-4 fw-bold">{category}</h3>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-5">
            <button className="btn btn-custom-primary">
              View All Photos
            </button>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section id="videos" className="py-5 bg-light">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">
            Featured Videos
          </h2>
          <div className="video-grid">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="video-card">
                <div className="video-thumbnail">
                  <div className="play-button">
                    <i className="bi bi-play-circle fs-1 text-white"></i>
                  </div>
                </div>
                <div className="p-3">
                  <h3 className="fs-5 fw-semibold">Video Title</h3>
                  <p className="text-muted">Video description goes here</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


 
      <Footer />
    </div>
  );
};

export default Home; 