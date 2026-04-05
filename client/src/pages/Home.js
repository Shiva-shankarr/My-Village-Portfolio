import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/layout/Navigation';
import ImageCarousel from '../components/home/ImageCarousel';
import AboutSection from '../components/home/AboutSection';
import Footer from '../components/layout/Footer';
import { updatesAPI, videosAPI } from '../services/api';
import youthCover from '../assets/Images/Youth Pic.png';
import marriageCover from '../assets/Images/Marriage Vibes.png';
import festCover from '../assets/Images/Fest Vibes.png';
import natureCover from '../assets/Images/Nature Pic.png';
import unityCover from '../assets/Images/Unity.png';
import { FaPlayCircle } from 'react-icons/fa';

const Home = () => {
  const [featuredVideos, setFeaturedVideos] = useState([]);
  const [latestUpdates, setLatestUpdates] = useState([]);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        const [videosRes, updatesRes] = await Promise.all([
          videosAPI.getAll({ limit: 3 }),
          updatesAPI.getAll({ limit: 3, sortBy: 'newest', published: 'true' })
        ]);

        setFeaturedVideos(videosRes.data?.data || []);
        setLatestUpdates(updatesRes.data?.data || []);
      } catch (error) {
        console.error('Failed to load home preview data:', error);
      }
    };

    fetchPreviewData();
  }, []);

  const carouselImages = [
    {
      url: natureCover,
      title: 'Welcome to Puriya Thanda',
      description: 'Discover the beauty, culture, and unity of our village',
      cta: 'Explore More'
    },
    {
      url: festCover,
      title: 'Vibrant Festivals',
      description: 'Experience our rich cultural celebrations and traditions',
      cta: 'View Gallery'
    },
    {
      url: youthCover,
      title: 'Natural Beauty',
      description: 'Surrounded by pristine landscapes and scenic views',
      cta: 'Learn More'
    }
  ];

  const categoryCovers = [
    { key: 'youth', title: 'Youth', image: youthCover },
    { key: 'marriages', title: 'Marriage Vibes', image: marriageCover },
    { key: 'festivals', title: 'Festival Vibes', image: festCover },
    { key: 'nature', title: 'Nature', image: natureCover },
    { key: 'unity', title: 'Unity', image: unityCover }
  ];

  const getYouTubeThumb = (embedUrl) => {
    const match = embedUrl?.match(/embed\/([^/?]+)/);
    return match ? `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg` : null;
  };

  const stripHtml = (value) => (value || '').replace(/<[^>]+>/g, '');

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
            {categoryCovers.map((category) => (
              <Link
                key={category.key}
                to={`/gallery?category=${category.key}`}
                className="image-container hover-scale text-decoration-none"
              >
                <img src={category.image} alt={category.title} className="img-fluid" />
                <div className="overlay">
                  <h3 className="text-white fs-4 fw-bold">{category.title}</h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-5">
            <Link to="/gallery" className="btn btn-custom-primary">
              View All Photos
            </Link>
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
            {featuredVideos.length > 0 ? featuredVideos.map((video) => (
              <div key={video._id} className="video-card">
                <div className="video-thumbnail">
                  {getYouTubeThumb(video.embedUrl) ? (
                    <img
                      src={getYouTubeThumb(video.embedUrl)}
                      alt={video.title}
                      className="w-100 h-100 object-fit-cover"
                    />
                  ) : (
                    <div className="w-100 h-100 bg-secondary-subtle d-flex align-items-center justify-content-center">
                      <FaPlayCircle className="text-success" size={46} />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <h3 className="fs-5 fw-semibold">{video.title}</h3>
                  <p className="text-muted mb-0">{video.description}</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-muted w-100">No featured videos available yet.</div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link to="/videos" className="btn btn-custom-outline">View All Videos</Link>
          </div>
        </div>
      </section>

      {/* Updates Preview Section */}
      <section id="updates" className="py-5 bg-white">
        <div className="container">
          <h2 className="text-center display-5 fw-bold mb-5">Latest Updates</h2>
          <div className="row g-4">
            {latestUpdates.length > 0 ? latestUpdates.map((item) => (
              <div key={item._id} className="col-md-6 col-lg-4">
                <div className="card h-100 shadow-sm border-0">
                  <div className="card-body">
                    <h3 className="h5 fw-semibold mb-2">{item.title}</h3>
                    <p className="text-muted small mb-3">
                      {new Date(item.publishDate || item.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-secondary mb-0">
                      {(stripHtml(item.summary || item.content)).slice(0, 120)}
                      {(stripHtml(item.summary || item.content)).length > 120 ? '...' : ''}
                    </p>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-12 text-center text-muted">No updates available yet.</div>
            )}
          </div>
          <div className="text-center mt-4">
            <Link to="/updates" className="btn btn-custom-outline">View All Updates</Link>
          </div>
        </div>
      </section>
 

      <Footer />
    </div>
  );
};

export default Home; 