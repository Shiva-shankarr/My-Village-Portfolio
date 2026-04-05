import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faImage,
  faVideo,
  faNewspaper
} from '@fortawesome/free-solid-svg-icons';
import api from '../../services/api';

const ContentManager = ({ type, categories, onRefreshStats }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    file: null
  });
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
  }, [type, selectedCategory]);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/admin/${type}${selectedCategory !== 'all' ? `?category=${selectedCategory}` : ''}`);
      setItems(response.data);
      setError(null);
    } catch (err) {
      setError(`Failed to load ${type}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });

      await api.post(`/admin/${type}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowAddModal(false);
      setFormData({ title: '', description: '', category: '', file: null });
      fetchItems();
      onRefreshStats();
    } catch (err) {
      setError(`Failed to add ${type}`);
    }
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      file: null
    });
    setShowEditModal(true);
  };

  const handleUpdateItem = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          formDataToSend.append(key, formData[key]);
        }
      });

      await api.put(`/admin/${type}/${editingItem._id}`, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setShowEditModal(false);
      setFormData({ title: '', description: '', category: '', file: null });
      setEditingItem(null);
      fetchItems();
      onRefreshStats();
    } catch (err) {
      setError(`Failed to update ${type}`);
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await api.delete(`/admin/${type}/${id}`);
        fetchItems();
        onRefreshStats();
      } catch (err) {
        setError(`Failed to delete ${type}`);
      }
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'gallery':
        return faImage;
      case 'videos':
        return faVideo;
      case 'updates':
        return faNewspaper;
      default:
        return faImage;
    }
  };

  const renderForm = (handleSubmit, isEdit = false) => (
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
          {categories?.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Form.Select>
      </Form.Group>

      {type !== 'updates' && (
        <Form.Group className="mb-3">
          <Form.Label>{type === 'gallery' ? 'Image' : 'Video URL'}</Form.Label>
          {type === 'gallery' ? (
            <Form.Control
              type="file"
              accept="image/*"
              onChange={(e) => setFormData({ ...formData, file: e.target.files[0] })}
              required={!isEdit}
            />
          ) : (
            <Form.Control
              type="url"
              value={formData.file || ''}
              onChange={(e) => setFormData({ ...formData, file: e.target.value })}
              placeholder="YouTube or Vimeo URL"
              required={!isEdit}
            />
          )}
        </Form.Group>
      )}

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={() => isEdit ? setShowEditModal(false) : setShowAddModal(false)}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Add'} {type.slice(0, -1)}
        </Button>
      </div>
    </Form>
  );

  return (
    <Container fluid className="py-3">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="h4 mb-1 d-flex align-items-center">
            <FontAwesomeIcon icon={getIcon()} className="me-2" />
            {type.charAt(0).toUpperCase() + type.slice(1)} Manager
          </h2>
          <p className="text-muted mb-0">
            Manage your {type} content here
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowAddModal(true)}
          className="d-flex align-items-center"
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New
        </Button>
      </div>

      {/* Category Filter */}
      <div className="mb-4">
        <Button
          variant={selectedCategory === 'all' ? 'primary' : 'light'}
          onClick={() => setSelectedCategory('all')}
          className="me-2 mb-2"
        >
          All
        </Button>
        {categories?.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'light'}
            onClick={() => setSelectedCategory(category)}
            className="me-2 mb-2"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Content Grid */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-danger text-center py-5">{error}</div>
      ) : (
        <Row xs={1} md={2} lg={3} className="g-4">
          {items.map((item) => (
            <Col key={item._id}>
              <Card className="h-100 shadow-sm">
                {type === 'gallery' && item.imageUrl && (
                  <Card.Img
                    variant="top"
                    src={item.imageUrl}
                    alt={item.title}
                    style={{ height: '200px', objectFit: 'cover' }}
                  />
                )}
                {type === 'videos' && item.embedUrl && (
                  <div className="ratio ratio-16x9">
                    <iframe
                      src={item.embedUrl}
                      title={item.title}
                      allowFullScreen
                    />
                  </div>
                )}
                <Card.Body>
                  <Card.Title>{item.title}</Card.Title>
                  <Card.Text className="text-muted">{item.description}</Card.Text>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="badge bg-primary bg-opacity-10 text-primary">
                      {item.category}
                    </span>
                    <div>
                      <Button
                        variant="link"
                        className="text-primary p-0 me-3"
                        onClick={() => handleEditItem(item)}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </Button>
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => handleDeleteItem(item._id)}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add New {type.slice(0, -1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm(handleAddItem)}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit {type.slice(0, -1)}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm(handleUpdateItem, true)}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default ContentManager; 