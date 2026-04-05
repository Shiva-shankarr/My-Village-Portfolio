import React from 'react';
import config from '../../config/config';

const ContactSection = () => {
  // Get contact email from config or environment variable
  const contactEmail = process.env.REACT_APP_CONTACT_EMAIL || 'contact@villageportfolio.com';
  
  return (
    <section id="contact" className="contact-section">
      <div className="container">
        <h2 className="text-center display-5 fw-bold mb-5">Contact Us</h2>
        
        <div className="row g-4 mb-5">
          {/* Contact Information */}
          <div className="col-lg-4">
            <div className="contact-info-card">
              <div className="contact-icon">
                <i className="bi bi-person-fill"></i>
              </div>
              <h3 className="fs-4 fw-semibold mb-3">Contact Person</h3>
              <p className="mb-0 text-muted">B. Shiva Shankar</p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="contact-info-card">
              <div className="contact-icon">
                <i className="bi bi-envelope-fill"></i>
              </div>
              <h3 className="fs-4 fw-semibold mb-3">Email</h3>
              <p className="mb-0">
                <a href={`mailto:${contactEmail}`} className="text-muted text-decoration-none">
                  {contactEmail}
                </a>
              </p>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="contact-info-card">
              <div className="contact-icon">
                <i className="bi bi-telephone-fill"></i>
              </div>
              <h3 className="fs-4 fw-semibold mb-3">Phone</h3>
              <p className="mb-0">
                <a href="tel:+919553927751" className="text-muted text-decoration-none">
                  +91 9553927751
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="row g-4">
          {/* Address */}
          <div className="col-lg-6">
            <div className="contact-info-card">
              <div className="contact-icon">
                <i className="bi bi-geo-alt-fill"></i>
              </div>
              <h3 className="fs-4 fw-semibold mb-3">Address</h3>
              <address className="mb-0 text-muted">
                Puriya Thanda,<br />
                Bodiya Thanda Panchayat,<br />
                Kusumanchi Mandal,<br />
                Khammam District,<br />
                Telangana, India
              </address>
            </div>
          </div>

          {/* Map */}
          <div className="col-lg-6">
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d226.35152138223202!2d79.91127779431217!3d17.26010945347395!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a34ef30b27ece05%3A0xf1a015b7888f9fc4!2sPuriyathanda!5e1!3m2!1sen!2sin!4v1750159819057!5m2!1sen!2sin"
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Puriya Thanda Location"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection; 