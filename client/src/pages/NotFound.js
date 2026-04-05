import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <Container className="min-vh-100 d-flex align-items-center justify-content-center">
      <div className="text-center">
        <h1 className="display-1 fw-bold">404</h1>
        <h2 className="mb-4">Page Not Found</h2>
        <p className="lead mb-5">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="d-flex justify-content-center gap-3">
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="px-4"
          >
            <FontAwesomeIcon icon={faHome} className="me-2" />
            Go Home
          </Button>
          <Button
            variant="outline-primary"
            onClick={() => navigate(-1)}
            className="px-4"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-2" />
            Go Back
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default NotFound; 