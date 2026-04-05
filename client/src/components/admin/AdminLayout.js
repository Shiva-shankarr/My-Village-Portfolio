import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Container, Nav, Navbar, Button, Offcanvas } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faGaugeHigh,
  faImages,
  faVideo,
  faNewspaper,
  faBars,
  faSignOutAlt,
  faUser
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../store/slices/authSlice';

const AdminLayout = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector(state => state.auth.user);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navItems = [
    { path: '/admin/dashboard', icon: faGaugeHigh, label: 'Dashboard' },
    { path: '/admin/gallery', icon: faImages, label: 'Gallery' },
    { path: '/admin/videos', icon: faVideo, label: 'Videos' },
    { path: '/admin/updates', icon: faNewspaper, label: 'Updates' }
  ];

  const closeSidebar = () => setShowSidebar(false);

  const renderSidebarContent = (closeOnNavigate = false) => (
    <>
      <div className="d-flex align-items-center mb-3 text-white text-decoration-none">
        <span className="fs-5 fw-semibold">Admin Panel</span>
      </div>
      <hr className="border-secondary" />
      <Nav className="flex-column mb-auto">
        {navItems.map((item) => (
          <Nav.Item key={item.path}>
            <NavLink
              to={item.path}
              onClick={closeOnNavigate ? closeSidebar : undefined}
              className={({ isActive }) =>
                `nav-link text-white admin-nav-link ${isActive ? 'active bg-success' : ''}`
              }
            >
              <FontAwesomeIcon icon={item.icon} className="me-2" />
              {item.label}
            </NavLink>
          </Nav.Item>
        ))}
      </Nav>
      <hr className="border-secondary" />
      <div>
        <div className="d-flex align-items-center text-white text-decoration-none">
          <FontAwesomeIcon icon={faUser} className="me-2" />
          <strong className="text-truncate">{user?.name || 'Admin'}</strong>
        </div>
        <Button
          variant="link"
          className="nav-link text-white px-0 mt-2"
          onClick={handleLogout}
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="me-2" />
          Sign out
        </Button>
      </div>
    </>
  );

  return (
    <div className="d-flex admin-layout">
      {/* Desktop Sidebar */}
      <aside className="d-none d-lg-flex bg-dark text-white flex-column flex-shrink-0 p-3 admin-sidebar">
        {renderSidebarContent(false)}
      </aside>

      {/* Mobile Sidebar */}
      <Offcanvas
        show={showSidebar}
        onHide={closeSidebar}
        placement="start"
        className="d-lg-none admin-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Admin Menu</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body className="bg-dark text-white d-flex flex-column p-3">
          {renderSidebarContent(true)}
        </Offcanvas.Body>
      </Offcanvas>

      {/* Main content */}
      <div className="flex-grow-1 bg-light min-vh-100 admin-main">
        <Navbar bg="white" className="shadow-sm mb-4">
          <Container fluid>
            <Button
              variant="link"
              className="text-dark px-0 me-2 d-lg-none"
              onClick={() => setShowSidebar(true)}
              aria-label="Open admin navigation"
            >
              <FontAwesomeIcon icon={faBars} />
            </Button>
            <Navbar.Brand className="mb-0 text-truncate">Village Portfolio Admin</Navbar.Brand>
            <div className="d-none d-lg-flex align-items-center text-muted small ms-auto">
              Signed in as {user?.name || 'Admin'}
            </div>
          </Container>
        </Navbar>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminLayout; 