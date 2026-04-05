import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import { galleryAPI } from '../services/api';
import config from '../config/config';

function Gallery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || 'all');
  const [error, setError] = useState(null);

  useEffect(() => {
    const categoryFromQuery = searchParams.get('category') || 'all';
    setActiveCategory(categoryFromQuery);
  }, [searchParams]);

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        setLoading(true);
        const params = {};
        if (activeCategory !== 'all') {
          params.category = activeCategory;
        }
        const response = await galleryAPI.getAll(params);
        setItems(response.data?.data || []);
        
        // Extract unique categories
        if (response.data?.data && response.data.data.length > 0) {
          const uniqueCategories = [...new Set(response.data.data.map(item => item.category))];
          setCategories(uniqueCategories);
        } else {
          setCategories([]);
        }
        setError(null);
      } catch (error) {
        console.error('Failed to fetch gallery items:', error);
        setError('Failed to load gallery items. Please try again later.');
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, [activeCategory]);

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    if (category === 'all') {
      setSearchParams({});
      return;
    }
    setSearchParams({ category });
  };

  const formatCategory = (value) => {
    if (!value) return 'General';
    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  const availableCategories = [...new Set([...config.categories.gallery, ...categories])];

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <h1 className="text-center mb-4">Village Gallery</h1>
      
      {/* Category filters */}
      <div className="d-flex flex-wrap justify-content-center mb-4">
        <button 
          className={`btn ${activeCategory === 'all' ? 'btn-primary' : 'btn-outline-primary'} m-1`}
          onClick={() => handleCategoryChange('all')}
        >
          All
        </button>
        {availableCategories.map((category) => (
          <button
            key={category}
            className={`btn ${activeCategory === category ? 'btn-primary' : 'btn-outline-primary'} m-1`}
            onClick={() => handleCategoryChange(category)}
          >
            {formatCategory(category)}
          </button>
        ))}
      </div>

      {error && (
        <div className="alert alert-danger text-center" role="alert">
          {error}
        </div>
      )}

      {items.length === 0 && !error ? (
        <div className="text-center py-5">
          <p className="text-muted">No gallery items available.</p>
        </div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {items.map((item) => (
            <Col key={item._id}>
              <Card className="h-100 shadow-sm">
                <Card.Img
                  variant="top"
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                  onError={(event) => {
                    event.currentTarget.src = 'https://via.placeholder.com/600x400?text=Image+Unavailable';
                  }}
                />
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text>{item.description}</Card.Text>
                  <div className="badge bg-primary bg-opacity-10 text-primary">
                    {formatCategory(item.category)}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}

export default Gallery; 