import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { videosAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    embedUrl: ''
  });

  const categories = [
    'Cultural Events',
    'Development Projects',
    'Festivals',
    'Youth Activities',
    'Educational',
    'Sports'
  ];

  // Videos are fetched initially and on explicit search submit.
  useEffect(() => {
    fetchVideos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined
      };
      const response = await videosAPI.getAll(params);
      setVideos(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch videos');
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedVideo) {
        await videosAPI.update(selectedVideo._id, formData);
        toast.success('Video updated successfully');
        setShowEditModal(false);
      } else {
        await videosAPI.create(formData);
        toast.success('Video added successfully');
        setShowAddModal(false);
      }

      setFormData({ title: '', description: '', category: '', embedUrl: '' });
      setSelectedVideo(null);
      fetchVideos();
    } catch (error) {
      toast.error(selectedVideo ? 'Failed to update video' : 'Failed to add video');
    }
  };

  const handleEdit = (video) => {
    setSelectedVideo(video);
    setFormData({
      title: video.title,
      description: video.description,
      category: video.category,
      embedUrl: video.embedUrl
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      try {
        await videosAPI.delete(id);
        toast.success('Video deleted successfully');
        fetchVideos();
      } catch (error) {
        toast.error('Failed to delete video');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const getVideoId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const renderForm = (isEdit = false) => (
    <Form onSubmit={handleSubmit}>
      <Form.Group className="mb-3">
        <Form.Label>Title</Form.Label>
        <Form.Control
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Description</Form.Label>
        <Form.Control
          as="textarea"
          rows={3}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Category</Form.Label>
        <Form.Select
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          required
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>YouTube URL</Form.Label>
        <Form.Control
          type="url"
          value={formData.embedUrl}
          onChange={(e) => {
            const videoId = getVideoId(e.target.value);
            setFormData({
              ...formData,
              embedUrl: videoId ? `https://www.youtube.com/embed/${videoId}` : e.target.value
            });
          }}
          placeholder="https://www.youtube.com/watch?v=..."
          required
        />
        <Form.Text className="text-muted">
          Enter a valid YouTube video URL
        </Form.Text>
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedVideo(null);
            setFormData({ title: '', description: '', category: '', embedUrl: '' });
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Add'} Video
        </Button>
      </div>
    </Form>
  );

  if (loading && !videos.length) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="py-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h1 className="h3 mb-0">Video Management</h1>
          <p className="text-muted">Manage your village video gallery here.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Video
        </Button>
      </div>

      {/* Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row>
              <Col md={8} lg={10}>
                <Form.Control
                  type="text"
                  placeholder="Search videos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </Col>
              <Col md={4} lg={2}>
                <Button variant="primary" type="submit" className="w-100">
                  <FontAwesomeIcon icon={faSearch} className="me-2" />
                  Search
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Videos Grid */}
      <Row xs={1} md={2} lg={3} className="g-4">
        {videos.map((video) => (
          <Col key={video._id}>
            <Card className="h-100 shadow-sm">
              <div className="position-relative">
                <div className="ratio ratio-16x9">
                  <iframe
                    src={video.embedUrl}
                    title={video.title}
                    allowFullScreen
                  ></iframe>
                </div>
                <div className="position-absolute top-0 end-0 p-2">
                  <Button
                    variant="light"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEdit(video)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(video._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </div>
              <Card.Body>
                <Card.Title>{video.title}</Card.Title>
                <Card.Text className="text-muted">{video.description}</Card.Text>
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  {video.category}
                </span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm()}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm(true)}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Videos; 