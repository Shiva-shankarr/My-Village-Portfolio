import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { FaCalendar, FaTag, FaImage } from 'react-icons/fa';

const UpdateCard = ({ update, onOpenDetail }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    hover: {
      y: -5,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  const imageVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      development: 'bg-success-subtle text-success-emphasis border',
      education: 'bg-info-subtle text-info-emphasis border',
      health: 'bg-danger-subtle text-danger-emphasis border',
      culture: 'bg-warning-subtle text-warning-emphasis border',
      general: 'bg-light text-secondary border'
    };
    return colors[category] || colors.general;
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  return (
    <>
      <motion.div
        variants={cardVariants}
        whileHover="hover"
        className="col"
      >
        <div className="card h-100 shadow-sm border-0 overflow-hidden update-card">
        {/* Image Section */}
        {update.images && update.images.length > 0 && (
          <div className="position-relative update-card-image-wrap overflow-hidden group">
            {!imageLoaded && (
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-light" />
            )}
            <motion.img
              src={update.images[0]}
              alt={update.title}
              loading="lazy"
              onLoad={handleImageLoad}
              variants={imageVariants}
              initial="hidden"
              animate={imageLoaded ? "visible" : "hidden"}
              className={`w-100 h-100 object-fit-cover transition-custom group-hover-scale ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onClick={() => setSelectedImage(update.images[0])}
            />
            {update.images.length > 1 && imageLoaded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="position-absolute bottom-0 end-0 m-2 px-2 py-1 rounded-pill small d-flex align-items-center gap-1 update-card-count"
              >
                <FaImage />
                <span>+{update.images.length - 1}</span>
              </motion.div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="card-body d-flex flex-column p-3 p-md-4">
          <div className="d-flex align-items-center justify-content-between gap-2 mb-3">
            <span className={`px-3 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-2 ${getCategoryColor(update.category)}`}>
              <FaTag className="text-xs" />
              {update.category.charAt(0).toUpperCase() + update.category.slice(1)}
            </span>
            <span className="small text-muted d-inline-flex align-items-center gap-2">
              <FaCalendar className="text-xs" />
              {format(new Date(update.publishDate || update.createdAt), 'MMM d, yyyy')}
            </span>
          </div>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {update.isPinned && (
              <span className="badge rounded-pill text-bg-warning">
                Pinned
              </span>
            )}
            {update.priority && (
              <span className="badge rounded-pill bg-success-subtle text-success-emphasis border">
                {update.priority}
              </span>
            )}
            {update.tags && update.tags.length > 0 && update.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="badge rounded-pill bg-light text-secondary border">
                {tag}
              </span>
            ))}
          </div>

          <h3
            className="h5 fw-semibold mb-2 update-card-title cursor-pointer"
            onClick={() => onOpenDetail?.(update)}
          >
            {update.title}
          </h3>

          {update.summary && (
            <div
              className="text-secondary mb-3 update-card-summary"
              dangerouslySetInnerHTML={{ __html: update.summary }}
            />
          )}

          <motion.p
            animate={{ height: isExpanded ? "auto" : "4.5rem" }}
            className={`text-muted mb-4 update-card-content ${isExpanded ? '' : 'content-clamp-3'}`}
            dangerouslySetInnerHTML={{ __html: update.content }}
          >
          </motion.p>

          <div className="d-flex flex-wrap gap-3 mt-auto">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-link btn-sm text-success text-decoration-none p-0"
            >
              {isExpanded ? 'Show Less' : 'Read More'}
            </motion.button>
            {onOpenDetail && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onOpenDetail(update)}
                className="btn btn-link btn-sm text-success text-decoration-none p-0"
              >
                View Details
              </motion.button>
            )}
          </div>
        </div>
        </div>
      </motion.div>

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 p-3 updates-image-overlay"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="position-relative w-100 updates-image-modal"
              onClick={e => e.stopPropagation()}
            >
              <img
                src={selectedImage}
                alt="Full size"
                loading="lazy"
                className="w-100 h-auto rounded-3"
              />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="position-absolute top-0 end-0 m-2 btn btn-light rounded-circle p-2"
                onClick={() => setSelectedImage(null)}
              >
                <svg className="update-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default UpdateCard; 
