import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSearch, FaFilter, FaTimes } from 'react-icons/fa';
import { updatesAPI } from '../services/api';
import UpdateCard from '../components/updates/UpdateCard';
import LoadingSkeleton from '../components/common/LoadingSkeleton';

const Updates = () => {
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tags, setTags] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [selectedUpdate, setSelectedUpdate] = useState(null);
  const [detailImage, setDetailImage] = useState(null);
  const [shareStatus, setShareStatus] = useState('');
  const searchTimeout = useRef(null);
  const { ref, inView } = useInView({
    threshold: 0,
  });

  const containerVariants = {
    hidden: {
      opacity: 0,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const filterVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
        ease: 'easeInOut',
      },
    },
  };

  const fetchUpdates = useCallback(async (pageNum = 1, isNewSearch = false) => {
    try {
      if (isNewSearch) {
        setLoading(true);
      } else {
        setIsLoadingMore(true);
      }

      const params = {
        page: pageNum,
        limit: 9,
        sortBy,
        isPublished: true
      };

      if (search) params.search = search;
      if (category) params.category = category;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (tags) params.tags = tags;

      const response = await updatesAPI.getAll(params);
      const { data, pagination, metadata } = response.data;

      if (isNewSearch) {
        setUpdates(data);
      } else {
        setUpdates(prev => [...prev, ...data]);
      }

      setHasMore(pagination.hasMore);
      setCategories(metadata.categories);
      setError(null);
    } catch (err) {
      setError('Failed to load updates. Please try again later.');
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  }, [search, category, sortBy, startDate, endDate, tags]);

  useEffect(() => {
    setPage(1);
    fetchUpdates(1, true);
  }, [search, category, sortBy, startDate, endDate, tags, fetchUpdates]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const updateId = params.get('update');
    if (updateId) {
      updatesAPI
        .getById(updateId)
        .then((response) => {
          const update = response.data?.data;
          if (update) {
            setSelectedUpdate(update);
            setDetailImage(update.images?.[0] || null);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (inView && hasMore && !loading && !isLoadingMore) {
      const nextPage = page + 1;
      fetchUpdates(nextPage, false);
      setPage(nextPage);
    }
  }, [inView, hasMore, loading, isLoadingMore, page, fetchUpdates]);

  const handleReset = () => {
    setCategory('');
    setSortBy('newest');
    setSearch('');
    setStartDate('');
    setEndDate('');
    setTags('');
  };

  const handleSearch = (value) => {
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = setTimeout(() => {
      setSearch(value);
    }, 500);
  };

  const handleOpenDetail = (update) => {
    setSelectedUpdate(update);
    setDetailImage(update.images?.[0] || null);
    setShareStatus('');
  };

  const handleCloseDetail = () => {
    setSelectedUpdate(null);
    setDetailImage(null);
    setShareStatus('');
  };

  const getShareUrl = (update) => `${window.location.origin}/updates?update=${update._id}`;

  const handleCopyLink = async (update) => {
    const shareUrl = getShareUrl(update);
    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareStatus('Link copied');
      setTimeout(() => setShareStatus(''), 2000);
    } catch (error) {
      setShareStatus('Copy failed');
      setTimeout(() => setShareStatus(''), 2000);
    }
  };

  const orderedUpdates = [...updates].sort((a, b) => {
    const pinnedDiff = (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0);
    if (pinnedDiff !== 0) return pinnedDiff;
    const aDate = new Date(a.publishDate || a.createdAt);
    const bDate = new Date(b.publishDate || b.createdAt);
    return bDate - aDate;
  });

  return (
    <div className="container updates-page py-4 py-md-5">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="display-6 fw-bold text-center mb-4"
      >
        Village Updates
      </motion.h1>

      {/* Search and Filter Section */}
      <div className="mb-4">
        <div className="d-flex flex-column flex-md-row gap-3 align-items-stretch align-items-md-center">
          <div className="position-relative flex-grow-1 w-100">
            <FaSearch className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
            <input
              type="text"
              placeholder="Search updates..."
              defaultValue={search}
              onChange={(e) => handleSearch(e.target.value)}
              className="form-control ps-5"
              aria-label="Search updates"
            />
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="btn btn-success d-inline-flex align-items-center justify-content-center gap-2"
            aria-expanded={isFilterOpen}
            aria-controls="filter-panel"
          >
            {isFilterOpen ? <FaTimes /> : <FaFilter />}
            Filters
          </motion.button>
        </div>

        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              id="filter-panel"
              variants={filterVariants}
              initial="closed"
              animate="open"
              exit="closed"
              className="updates-filter-panel mt-3 p-3 rounded-3"
            >
              <div className="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-3">
                <div>
                  <label
                    htmlFor="category"
                    className="form-label fw-semibold mb-1"
                  >
                    Category
                  </label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-select"
                    aria-label="Category"
                  >
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="sortBy"
                    className="form-label fw-semibold mb-1"
                  >
                    Sort By
                  </label>
                  <select
                    id="sortBy"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="form-select"
                    aria-label="Sort By"
                  >
                    <option value="newest">Most Recent</option>
                    <option value="oldest">Oldest</option>
                    <option value="popular">Most Viewed</option>
                    <option value="title">Title</option>
                    <option value="category">Category</option>
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="startDate"
                    className="form-label fw-semibold mb-1"
                  >
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="form-control"
                    aria-label="Start Date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="endDate"
                    className="form-label fw-semibold mb-1"
                  >
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="form-control"
                    aria-label="End Date"
                  />
                </div>
                <div>
                  <label
                    htmlFor="tags"
                    className="form-label fw-semibold mb-1"
                  >
                    Tags
                  </label>
                  <input
                    id="tags"
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder="comma,separated"
                    className="form-control"
                    aria-label="Tags"
                  />
                </div>
                <div className="d-flex align-items-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReset}
                    className="btn btn-outline-secondary w-100"
                  >
                    Reset Filters
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="alert alert-danger text-center mb-4"
            role="alert"
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Updates Grid */}
      {loading && !isLoadingMore ? (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="col"><LoadingSkeleton /></div>
          ))}
        </div>
      ) : updates.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5 mb-0">No updates found</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4"
        >
          {orderedUpdates.map((update) => (
            <UpdateCard key={update._id} update={update} onOpenDetail={handleOpenDetail} />
          ))}
        </motion.div>
      )}

      {/* Loading More Indicator */}
      {isLoadingMore && (
        <div className="d-flex justify-content-center mt-4">
          <div className="spinner-border text-success" role="status" aria-label="Loading more"></div>
        </div>
      )}

      {/* Intersection Observer Target */}
      {hasMore && !loading && !isLoadingMore && (
        <div ref={ref} className="mt-3" style={{ height: '12px' }}></div>
      )}

      <AnimatePresence>
        {selectedUpdate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="updates-detail-overlay position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="updates-detail-modal bg-white rounded-4 w-100 overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-3 p-md-4">
                <div className="d-flex align-items-start justify-content-between gap-3">
                  <div>
                    <h2 className="h4 fw-bold mb-2">{selectedUpdate.title}</h2>
                    <div className="small text-muted mb-3">
                      {new Date(selectedUpdate.createdAt).toLocaleDateString()}
                    </div>
                    <div className="d-flex flex-wrap gap-2 mb-4">
                      {selectedUpdate.isPinned && (
                        <span className="badge rounded-pill text-bg-warning">
                          Pinned
                        </span>
                      )}
                      {selectedUpdate.category && (
                        <span className="badge rounded-pill bg-success-subtle text-success-emphasis border">
                          {selectedUpdate.category}
                        </span>
                      )}
                      {selectedUpdate.tags?.map((tag) => (
                        <span key={tag} className="badge rounded-pill bg-light text-secondary border">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={handleCloseDetail}
                    className="btn btn-link text-muted fs-4 p-0"
                    aria-label="Close"
                  >
                    ×
                  </button>
                </div>

                {selectedUpdate.images?.length > 0 && (
                  <div className="mb-4">
                    <div className="rounded-3 overflow-hidden mb-3">
                      <img
                        src={detailImage || selectedUpdate.images[0]}
                        alt={selectedUpdate.title}
                        className="w-100 updates-detail-main-image object-fit-cover"
                      />
                    </div>
                    {selectedUpdate.images.length > 1 && (
                      <div className="d-flex gap-2 overflow-auto pb-1">
                        {selectedUpdate.images.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setDetailImage(image)}
                            className={`updates-thumb-btn ${detailImage === image ? 'active' : ''}`}
                          >
                            <img src={image} alt={`${selectedUpdate.title} ${index + 1}`} className="w-100 h-100 object-fit-cover" />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {selectedUpdate.summary && (
                  <div className="mb-3 text-secondary" dangerouslySetInnerHTML={{ __html: selectedUpdate.summary }} />
                )}
                <div className="text-secondary updates-content" dangerouslySetInnerHTML={{ __html: selectedUpdate.content }} />

                <div className="mt-4 pt-3 border-top">
                  <div className="d-flex flex-wrap align-items-center gap-2">
                    <a
                      href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(getShareUrl(selectedUpdate))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Share on Facebook
                    </a>
                    <a
                      href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(getShareUrl(selectedUpdate))}&text=${encodeURIComponent(selectedUpdate.title)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Share on X
                    </a>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(`${selectedUpdate.title} ${getShareUrl(selectedUpdate)}`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Share on WhatsApp
                    </a>
                    <button
                      onClick={() => handleCopyLink(selectedUpdate)}
                      className="btn btn-sm btn-outline-secondary"
                    >
                      Copy Link
                    </button>
                    {shareStatus && <span className="small text-muted">{shareStatus}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Updates; 
