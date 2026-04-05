import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlay } from 'react-icons/fa';

const VideoPlayer = ({ embedUrl, title }) => (
  <div className="relative pt-[56.25%]">
    <iframe
      src={embedUrl}
      title={title}
      className="absolute top-0 left-0 w-full h-full"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
    />
  </div>
);

// Extract YouTube video ID from embedUrl
const getYouTubeId = (embedUrl) => {
  if (!embedUrl) return null;
  const match = embedUrl.match(/embed\/([^/?]+)/);
  return match ? match[1] : null;
};

const VideoGrid = ({ videos, categories = [] }) => {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // If categories aren't provided, extract them from videos
  const allCategories = categories.length > 0 
    ? ['all', ...categories] 
    : ['all', ...new Set(videos.map(video => video.category))];
  
  const filteredVideos = selectedCategory === 'all' 
    ? videos 
    : videos.filter(video => video.category === selectedCategory);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5
      }
    }
  };

  const itemVariants = {
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
      scale: 1.03,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    }
  };

  return (
    <div className="video-grid-wrap py-2 py-md-3">
      {/* Category Filter */}
      <div className="d-flex flex-wrap gap-2 mb-4 justify-content-center">
        {allCategories.map(category => (
          <motion.button
            key={category}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(category)}
            className={`btn btn-sm rounded-pill px-3 py-2 ${
              selectedCategory === category
              ? 'btn-success'
              : 'btn-outline-secondary'
            }`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </motion.button>
        ))}
      </div>

      {/* Video Grid */}
      <AnimatePresence>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row row-cols-1 row-cols-md-2 row-cols-xl-3 g-4"
        >
          {filteredVideos.map((video) => {
            const youtubeId = getYouTubeId(video.embedUrl);
            return (
              <motion.div
                key={video._id}
                variants={itemVariants}
                whileHover="hover"
                className="col"
              >
                <div className="card h-100 shadow-sm border-0 overflow-hidden">
                <div 
                  className="position-relative ratio ratio-16x9 cursor-pointer video-thumb-group"
                  onClick={() => setSelectedVideo(video)}
                >
                  {youtubeId && (
                    <img
                      src={`https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`}
                      alt={video.title}
                      className="w-100 h-100 object-fit-cover video-thumb-image"
                      onError={(e) => {
                        // Fallback to medium quality thumbnail if maxresdefault fails
                        e.target.src = `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
                      }}
                    />
                  )}
                  <div className="position-absolute top-0 start-0 w-100 h-100 video-thumb-overlay d-flex align-items-center justify-content-center">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      whileHover={{ opacity: 1, scale: 1 }}
                      className="video-play-button d-flex align-items-center justify-content-center text-white"
                    >
                      <FaPlay className="ms-1" />
                    </motion.div>
                  </div>
                </div>
                <div className="card-body d-flex flex-column">
                  <h3 className="h5 mb-2 video-title-clamp">{video.title}</h3>
                  <p className="text-muted small mb-3 video-description-clamp">{video.description}</p>
                  <div className="mt-auto d-flex align-items-center justify-content-between gap-2">
                    <span className="badge rounded-pill text-bg-light border">
                      {video.category}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="btn btn-link btn-sm text-success text-decoration-none p-0"
                      onClick={() => setSelectedVideo(video)}
                    >
                      Watch Now
                    </motion.button>
                  </div>
                </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Video Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center z-3 p-3 video-modal-overlay"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3 overflow-hidden w-100 video-modal-content"
              onClick={e => e.stopPropagation()}
            >
              <VideoPlayer
                embedUrl={selectedVideo.embedUrl}
                title={selectedVideo.title}
              />
              <div className="p-3 p-md-4">
                <h2 className="h4 fw-bold mb-2">{selectedVideo.title}</h2>
                <p className="text-muted mb-0">{selectedVideo.description}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoGrid; 