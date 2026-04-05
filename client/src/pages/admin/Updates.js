import React, { useState, useEffect, useRef } from 'react';
import { Container, Row, Col, Card, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faPlus,
  faEdit,
  faTrash,
  faSearch
} from '@fortawesome/free-solid-svg-icons';
import { updatesAPI } from '../../services/api';
import { toast } from 'react-toastify';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    category: 'general',
    tags: '',
    priority: 'normal',
    isPinned: false,
    isPublished: true,
    publishDate: ''
  });
  const [imageItems, setImageItems] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [dragIndex, setDragIndex] = useState(null);
  const editorRef = useRef(null);

  // Updates list refreshes on explicit actions; initial fetch runs once.
  useEffect(() => {
    fetchUpdates();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep editor hydration tied to modal lifecycle to avoid cursor jump while typing.
  useEffect(() => {
    if ((showAddModal || showEditModal) && editorRef.current) {
      editorRef.current.innerHTML = formData.content || '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showAddModal, showEditModal, selectedUpdate]);

  const fetchUpdates = async () => {
    try {
      setLoading(true);
      const params = {
        search: search || undefined,
        published: 'all',
        sortBy: 'newest'
      };
      const response = await updatesAPI.getAll(params);
      setUpdates(response.data?.data || []);
    } catch (error) {
      toast.error('Failed to fetch updates');
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      imageItems.forEach((item) => {
        formDataToSend.append('images', item.file);
      });

      if (selectedUpdate) {
        await updatesAPI.update(selectedUpdate._id, formDataToSend);
        toast.success('Update modified successfully');
        setShowEditModal(false);
      } else {
        await updatesAPI.create(formDataToSend);
        toast.success('Update added successfully');
        setShowAddModal(false);
      }

      setFormData({
        title: '',
        summary: '',
        content: '',
        category: 'general',
        tags: '',
        priority: 'normal',
        isPinned: false,
        isPublished: true,
        publishDate: ''
      });
      setImageItems([]);
      setExistingImages([]);
      setSelectedUpdate(null);
      fetchUpdates();
    } catch (error) {
      toast.error(selectedUpdate ? 'Failed to modify update' : 'Failed to add update');
    }
  };

  const handleEdit = (update) => {
    setSelectedUpdate(update);
    setFormData({
      title: update.title,
      summary: update.summary || '',
      content: update.content,
      category: update.category || 'general',
      tags: update.tags ? update.tags.join(', ') : '',
      priority: update.priority || 'normal',
      isPinned: Boolean(update.isPinned),
      isPublished: update.isPublished !== false,
      publishDate: update.publishDate ? new Date(update.publishDate).toISOString().slice(0, 16) : ''
    });
    setExistingImages(update.images || []);
    setImageItems([]);
    setShowEditModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this update?')) {
      try {
        await updatesAPI.delete(id);
        toast.success('Update deleted successfully');
        fetchUpdates();
      } catch (error) {
        toast.error('Failed to delete update');
      }
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchUpdates();
  };

  const handleFormat = (command, value = null) => {
    document.execCommand(command, false, value);
    const html = editorRef.current?.innerHTML || '';
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleContentInput = () => {
    const html = editorRef.current?.innerHTML || '';
    setFormData(prev => ({ ...prev, content: html }));
  };

  const handleImagesSelected = (files) => {
    const nextItems = Array.from(files).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      preview: URL.createObjectURL(file)
    }));
    setImageItems((prev) => [...prev, ...nextItems]);
  };

  const handleRemoveImage = (id) => {
    setImageItems((prev) => {
      const item = prev.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.preview);
      }
      return prev.filter((entry) => entry.id !== id);
    });
  };

  const handleDragStart = (index) => {
    setDragIndex(index);
  };

  const handleDrop = (index) => {
    if (dragIndex === null || dragIndex === index) return;
    setImageItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
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
        <Form.Label>Summary</Form.Label>
        <Form.Control
          type="text"
          value={formData.summary}
          onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
          maxLength={200}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            >
              <option value="general">General</option>
              <option value="development">Development</option>
              <option value="education">Education</option>
              <option value="health">Health</option>
              <option value="culture">Culture</option>
            </Form.Select>
          </Form.Group>
        </Col>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Form.Select>
          </Form.Group>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Tags</Form.Label>
        <Form.Control
          type="text"
          value={formData.tags}
          onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          placeholder="comma,separated,tags"
        />
      </Form.Group>

      <Form.Group className="mb-3">
        <Form.Label>Content</Form.Label>
        <div className="d-flex flex-wrap gap-2 mb-2">
          <Button variant="light" size="sm" onClick={() => handleFormat('bold')}>
            Bold
          </Button>
          <Button variant="light" size="sm" onClick={() => handleFormat('italic')}>
            Italic
          </Button>
          <Button variant="light" size="sm" onClick={() => handleFormat('underline')}>
            Underline
          </Button>
          <Button variant="light" size="sm" onClick={() => handleFormat('insertUnorderedList')}>
            Bullets
          </Button>
          <Button variant="light" size="sm" onClick={() => handleFormat('insertOrderedList')}>
            Numbered
          </Button>
          <Button
            variant="light"
            size="sm"
            onClick={() => {
              const url = window.prompt('Enter URL');
              if (url) handleFormat('createLink', url);
            }}
          >
            Link
          </Button>
        </div>
        <div
          ref={editorRef}
          className="border rounded p-3 updates-editor"
          contentEditable
          onInput={handleContentInput}
          onBlur={handleContentInput}
        />
      </Form.Group>

      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Publish Date</Form.Label>
            <Form.Control
              type="datetime-local"
              value={formData.publishDate}
              onChange={(e) => setFormData({ ...formData, publishDate: e.target.value })}
            />
          </Form.Group>
        </Col>
        <Col md={6} className="d-flex align-items-center">
          <div className="d-flex gap-4">
            <Form.Check
              type="checkbox"
              label="Pinned"
              checked={formData.isPinned}
              onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
            />
            <Form.Check
              type="checkbox"
              label="Published"
              checked={formData.isPublished}
              onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
            />
          </div>
        </Col>
      </Row>

      <Form.Group className="mb-3">
        <Form.Label>Images</Form.Label>
        <Form.Control
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => handleImagesSelected(e.target.files)}
          required={!isEdit && imageItems.length === 0}
        />
        <Form.Text className="text-muted">You can select multiple images and drag to reorder</Form.Text>
        {existingImages.length > 0 && (
          <div className="mt-3">
            <div className="fw-semibold mb-2">Existing Images</div>
            <Row xs={2} md={3} lg={4} className="g-2">
              {existingImages.map((image, index) => (
                <Col key={`${image}-${index}`}>
                  <div className="ratio ratio-16x9">
                    <img
                      src={image}
                      alt={`Existing update ${index + 1}`}
                      className="img-fluid rounded object-fit-cover"
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
        {imageItems.length > 0 && (
          <div className="mt-3">
            <div className="fw-semibold mb-2">New Images</div>
            <Row xs={2} md={3} lg={4} className="g-2">
              {imageItems.map((image, index) => (
                <Col key={image.id}>
                  <div
                    className="ratio ratio-16x9 border rounded overflow-hidden position-relative"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(index)}
                  >
                    <img
                      src={image.preview}
                      alt={`New upload ${index + 1}`}
                      className="img-fluid object-fit-cover"
                    />
                    <Button
                      variant="light"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => handleRemoveImage(image.id)}
                    >
                      ×
                    </Button>
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Form.Group>

      <div className="d-flex justify-content-end gap-2">
        <Button variant="outline-secondary" onClick={() => setShowPreviewModal(true)}>
          Preview
        </Button>
        <Button
          variant="secondary"
          onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            setSelectedUpdate(null);
            setFormData({
              title: '',
              summary: '',
              content: '',
              category: 'general',
              tags: '',
              priority: 'normal',
              isPinned: false,
              isPublished: true,
              publishDate: ''
            });
            setImageItems([]);
            setExistingImages([]);
          }}
        >
          Cancel
        </Button>
        <Button variant="primary" type="submit">
          {isEdit ? 'Update' : 'Add'} Update
        </Button>
      </div>
    </Form>
  );

  if (loading && !updates.length) {
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
          <h1 className="h3 mb-0">Updates Management</h1>
          <p className="text-muted">Manage your village updates and news here.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedUpdate(null);
            setFormData({
              title: '',
              summary: '',
              content: '',
              category: 'general',
              tags: '',
              priority: 'normal',
              isPinned: false,
              isPublished: true,
              publishDate: ''
            });
            setImageItems([]);
            setExistingImages([]);
            setShowAddModal(true);
          }}
        >
          <FontAwesomeIcon icon={faPlus} className="me-2" />
          Add New Update
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
                  placeholder="Search updates..."
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

      {/* Updates List */}
      <Row className="g-4">
        {updates.map((update) => (
          <Col key={update._id} xs={12}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h5 className="mb-1">{update.title}</h5>
                    <p className="text-muted small mb-2">
                      Posted on {new Date(update.createdAt).toLocaleDateString()}
                    </p>
                    <div className="d-flex gap-2 mb-2">
                      {update.isPinned && <span className="badge bg-warning text-dark">Pinned</span>}
                      {update.isPublished === false && <span className="badge bg-secondary">Draft</span>}
                      {update.priority && <span className="badge bg-info text-dark">{update.priority}</span>}
                    </div>
                  </div>
                  <div>
                    <Button
                      variant="light"
                      size="sm"
                      className="me-1"
                      onClick={() => handleEdit(update)}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDelete(update._id)}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </Button>
                  </div>
                </div>
                {update.summary && <div className="mb-2" dangerouslySetInnerHTML={{ __html: update.summary }} />}
                <div className="mb-3" dangerouslySetInnerHTML={{ __html: update.content }} />
                {update.images && update.images.length > 0 && (
                  <Row xs={2} md={3} lg={4} className="g-2">
                    {update.images.map((image, index) => (
                      <Col key={index}>
                        <div className="ratio ratio-16x9">
                          <img
                            src={image}
                            alt={`Update ${index + 1}`}
                            className="img-fluid rounded object-fit-cover"
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Add New Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm()}
        </Modal.Body>
      </Modal>

      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Edit Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {renderForm(true)}
        </Modal.Body>
      </Modal>

      <Modal show={showPreviewModal} onHide={() => setShowPreviewModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Preview Update</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3">
            <h4 className="mb-2">{formData.title || 'Untitled Update'}</h4>
            <div className="text-muted small mb-3">
              {formData.publishDate
                ? new Date(formData.publishDate).toLocaleString()
                : 'Publish date not set'}
            </div>
            {formData.summary && (
              <div className="mb-3" dangerouslySetInnerHTML={{ __html: formData.summary }} />
            )}
            <div dangerouslySetInnerHTML={{ __html: formData.content }} />
          </div>
          {existingImages.length > 0 && (
            <div className="mb-4">
              <div className="fw-semibold mb-2">Existing Images</div>
              <Row xs={2} md={3} className="g-2">
                {existingImages.map((image, index) => (
                  <Col key={`${image}-${index}`}>
                    <div className="ratio ratio-16x9">
                      <img src={image} alt={`Existing ${index + 1}`} className="img-fluid rounded object-fit-cover" />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
          {imageItems.length > 0 && (
            <div>
              <div className="fw-semibold mb-2">New Images</div>
              <Row xs={2} md={3} className="g-2">
                {imageItems.map((image, index) => (
                  <Col key={image.id}>
                    <div className="ratio ratio-16x9">
                      <img src={image.preview} alt={`New ${index + 1}`} className="img-fluid rounded object-fit-cover" />
                    </div>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default Updates; 
