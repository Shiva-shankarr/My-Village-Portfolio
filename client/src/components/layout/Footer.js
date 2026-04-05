import React from 'react';
import { Link } from 'react-router-dom';
import { FaGithub, FaInstagram, FaLinkedin, FaGlobe, FaMapMarkerAlt, FaPhone } from 'react-icons/fa';
import { BiHomeAlt, BiPhotoAlbum, BiVideo, BiNews } from 'react-icons/bi';
import developerPic from '../../assets/Images/Developer_Pic.jpg';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const contactEmail = process.env.REACT_APP_CONTACT_EMAIL || 'contact@villageportfolio.com';

  return (
    <footer style={{ backgroundColor: '#08406B' }} className="text-white py-5">
      <div className="container">
        <div className="row justify-content-center text-center text-md-start">
          {/* Quick Links */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading h5 mb-4">Quick Links</h3>
            <ul className="list-unstyled">
              <li className="mb-3">
                <Link to="/" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <BiHomeAlt className="me-2" size={20} />Home
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/gallery" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <BiPhotoAlbum className="me-2" size={20} />Gallery
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/videos" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <BiVideo className="me-2" size={20} />Videos
                </Link>
              </li>
              <li className="mb-3">
                <Link to="/updates" className="text-white text-decoration-none d-flex align-items-center justify-content-center justify-content-md-start">
                  <BiNews className="me-2" size={20} />Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading h5 mb-4">Contact Us</h3>
            <div className="d-flex flex-column align-items-center align-items-md-start">
              <p className="mb-3 d-flex align-items-center">
                <i className="bi bi-envelope-fill me-2" style={{ fontSize: '1.2em' }}></i>
                <a href={`mailto:${contactEmail}`} className="text-white text-decoration-none">
                  {contactEmail}
                </a>
              </p>
              <p className="mb-3 d-flex align-items-center">
                <FaPhone className="me-2" size={20} />
                <a href="tel:+919553927751" className="text-white text-decoration-none">
                  +91 9553927751
                </a>
              </p>
            </div>
          </div>

          {/* Address */}
          <div className="col-lg-3 col-md-6 mb-4">
            <h3 className="footer-heading h5 mb-4">Address</h3>
            <address className="d-flex flex-column align-items-center align-items-md-start">
              <p className="mb-2 d-flex align-items-center">
                <FaMapMarkerAlt className="me-2" size={20} />
                <span>Puriya Thanda,</span>
              </p>
              <p className="mb-2">Bodiya Thanda Panchayat,</p>
              <p className="mb-2">Kusumanchi Mandal,</p>
              <p className="mb-2">Khammam District,</p>
              <p className="mb-0">Telangana, India</p>
            </address>
          </div>

          {/* Developer Info */}
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="developer-card p-4 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}>
              <h3 className="footer-heading h5 mb-4">Website Developer</h3>
              <div className="developer-info">
                <div className="d-flex align-items-center justify-content-center justify-content-md-start mb-3">
                  <img
                    src={developerPic}
                    alt="B. Shiva Shankar"
                    className="developer-image rounded-circle me-3"
                    style={{ width: '60px', height: '60px', objectFit: 'cover' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'https://via.placeholder.com/60?text=Developer';
                    }}
                  />
                  <div>
                    <h5 className="mb-1" style={{ color: '#4CAF50' }}>B. Shiva Shankar</h5>
                    <p className="mb-0 text-light">Full Stack Developer</p>
                  </div>
                </div>
                <div className="social-links d-flex justify-content-center justify-content-md-start gap-3">
                  <a href="https://github.com/Shiva-shankarr" target="_blank" rel="noopener noreferrer" className="text-white hover-opacity">
                    <FaGithub size={22} />
                  </a>
                  <a href="https://www.linkedin.com/in/b-shiva-shankar-3b1b68290/" target="_blank" rel="noopener noreferrer" className="text-white hover-opacity">
                    <FaLinkedin size={22} />
                  </a>
                  <a href="https://www.instagram.com/___shiv____08/" target="_blank" rel="noopener noreferrer" className="text-white hover-opacity">
                    <FaInstagram size={22} />
                  </a>
                  <a href="https://my-portfolio-nine-omega-91.vercel.app/" target="_blank" rel="noopener noreferrer" className="text-white hover-opacity">
                    <FaGlobe size={22} />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="map-container rounded overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d226.35152138223202!2d79.91127779431217!3d17.26010945347395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a34ef30b27ece05%3A0xf1a015b7888f9fc4!2sPuriyathanda!5e1!3m2!1sen!2sin!4v1750159819057!5m2!1sen!2sin"
                width="100%"
                height="300"
                style={{ border: 0 }}
                title="Puriya Thanda Location"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <hr className="bg-light opacity-25" />
            <p className="mb-0">© {currentYear} Puriya Thanda. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 