import React, { useState, useEffect } from 'react';
import VideoGrid from '../components/videos/VideoGrid';
import { videosAPI } from '../services/api';
import { Container, Spinner } from 'react-bootstrap';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const response = await videosAPI.getAll();
        setVideos(response.data?.data || []);
        
        // Extract unique categories from videos
        if (response.data?.data && response.data.data.length > 0) {
          const uniqueCategories = [...new Set(response.data.data.map(video => video.category))];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <div className="videos-page py-4 py-md-5">
      <div className="container">
        <div className="text-center mb-4 mb-md-5">
          <h1 className="display-6 fw-bold mb-3">
            Village Videos
          </h1>
          <p className="lead text-muted mx-auto videos-page-subtitle">
            Watch videos showcasing the vibrant culture, traditions, and daily
            life of our village.
          </p>
        </div>

        {videos.length > 0 ? (
          <VideoGrid videos={videos} categories={categories} />
        ) : (
          <div className="text-center py-5">
            <p className="text-muted mb-0">No videos available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Videos; 