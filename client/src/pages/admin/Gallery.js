import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { galleryAPI } from '../../services/api';
import { toast } from 'react-toastify';

function AdminGallery() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  const categories = [
    'Nature',
    'Culture',
    'Events',
    'People',
    'Infrastructure',
    'Development'
  ];

  // Search is submitted manually, so this effect intentionally tracks filter changes.
  useEffect(() => {
    fetchGalleryItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const params = {
        category: filter !== 'all' ? filter : undefined,
        search: search || undefined
      };
      const response = await galleryAPI.getAll(params);
      setItems(response.data?.data || []);
    } catch (error) {
      console.error('Gallery fetch error:', error);
      toast.error('Failed to fetch gallery items');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (selectedItem) {
        await galleryAPI.update(selectedItem._id, formDataToSend);
        toast.success('Gallery item updated successfully');
        setShowEditModal(false);
      } else {
        await galleryAPI.create(formDataToSend);
        toast.success('Gallery item added successfully');
        setShowAddModal(false);
      }

      setFormData({ title: '', description: '', category: '', image: null });
      setSelectedItem(null);
      fetchGalleryItems();
    } catch (error) {
      toast.error(selectedItem ? 'Failed to update gallery item' : 'Failed to add gallery item');
    }
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setFormData({
      title: item.title,
      description: item.description,
      category: item.category,
      image: null
    });
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await galleryAPI.delete(id);
        toast.success('Gallery item deleted successfully');
        fetchGalleryItems();
      } catch (error) {
        toast.error('Failed to delete gallery item');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchGalleryItems();
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
        <Form.Label>Image</Form.Label>
        <Form.Control
          type="file"
          accept="image/*"
          onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
          required={!isEdit}
        />
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedItem(null);
            setFormData({ title: '', description: '', category: '', image: null });
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Add'} Image
        </Button>
      </div>
    </Form>
  );

  if (loading && !items.length) {
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
          <h1 className="h3 mb-0">Gallery Management</h1>
          <p className="text-muted">Manage your village gallery images here.</p>
        </div>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Image
        </Button>
      </div>

      {/* Filters and Search */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={6}>
              <div className="d-flex gap-2 flex-wrap">
                <Button
                  variant={filter === 'all' ? 'primary' : 'light'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={filter === category ? 'primary' : 'light'}
                    onClick={() => setFilter(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </Col>
            <Col md={6}>
              <Form onSubmit={handleSearch}>
                <div className="d-flex gap-2">
                  <Form.Control
                    type="text"
                    placeholder="Search images..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                  <Button variant="primary" type="submit">
                    <FontAwesomeIcon icon={faSearch} />
                  </Button>
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Gallery Grid */}
      <Row xs={1} md={2} lg={3} xl={4} className="g-4">
        {Array.isArray(items) && items.map((item) => (
          <Col key={item._id}>
            <Card className="h-100 shadow-sm">
              <div className="position-relative">
                <Card.Img
                  variant="top"
                  src={item.imageUrl}
                  alt={item.title}
                  style={{ height: '200px', objectFit: 'cover' }}
                />
                <div className="position-absolute top-0 end-0 p-2">
                  <Button
                    variant="light"
                    size="sm"
                    className="me-1"
                    onClick={() => handleEdit(item)}
                  >
                    <FontAwesomeIcon icon={faEdit} />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(item._id)}
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </Button>
                </div>
              </div>
              <Card.Body>
                <Card.Title>{item.title}</Card.Title>
                <Card.Text className="text-muted">{item.description}</Card.Text>
                <span className="badge bg-primary bg-opacity-10 text-primary">
                  {item.category}
                </span>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm()}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm(true)}
        </Modal.Body>
      </Modal>
    </Container>
  );
}

export default AdminGallery; 