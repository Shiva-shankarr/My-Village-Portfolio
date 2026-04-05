import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { galleryAPI, videosAPI, updatesAPI } from '../services/api';

const Search = () => {
  const [params] = useSearchParams();
  const query = params.get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({
    updates: [],
    gallery: [],
    videos: []
  });

  useEffect(() => {
    let isMounted = true;
    const fetchResults = async () => {
      setLoading(true);
      const requests = [
        updatesAPI.getAll({ search: query, limit: 6, sortBy: 'newest', isPublished: true }),
        galleryAPI.getAll({ search: query, limit: 6 }),
        videosAPI.getAll({ search: query, limit: 6 })
      ];

      const [updatesRes, galleryRes, videosRes] = await Promise.allSettled(requests);
      if (!isMounted) return;

      setResults({
        updates: updatesRes.status === 'fulfilled' ? updatesRes.value.data?.data || [] : [],
        gallery: galleryRes.status === 'fulfilled' ? galleryRes.value.data?.data || [] : [],
        videos: videosRes.status === 'fulfilled' ? videosRes.value.data?.data || [] : []
      });
      setLoading(false);
    };

    if (query.trim()) {
      fetchResults();
    } else {
      setResults({ updates: [], gallery: [], videos: [] });
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [query]);

  const stripHtml = (value) => value?.replace(/<[^>]*>/g, '') || '';
  const lowerQuery = query.toLowerCase();
  const highlight = (value) => {
    const text = stripHtml(value);
    if (!lowerQuery) return text;
    const escaped = lowerQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, index) =>
      part.toLowerCase() === lowerQuery ? <mark key={index}>{part}</mark> : part
    );
  };

  const totalResults = results.updates.length + results.gallery.length + results.videos.length;

  return (
    <div className="container py-5">
      <div className="mb-4">
        <h1 className="h3 mb-1">Search Results</h1>
        <p className="text-muted mb-0">Query: "{query || 'All'}"</p>
      </div>

      {loading ? (
        <div className="py-5 text-center">
          <div className="spinner-border text-primary" role="status"></div>
        </div>
      ) : totalResults === 0 ? (
        <div className="text-center py-5">
          <h4 className="mb-2">No results found</h4>
          <p className="text-muted">Try a different keyword.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-4">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Updates</h5>
              {results.updates.length === 0 ? (
                <p className="text-muted mb-0">No updates match this search.</p>
              ) : (
                <div className="list-group">
                  {results.updates.map((item) => (
                    <Link
                      key={item._id}
                      to={`/updates?update=${item._id}`}
                      className="list-group-item list-group-item-action"
                    >
                      <div className="fw-semibold">{highlight(item.title)}</div>
                      {item.summary && <div className="text-muted small">{highlight(item.summary)}</div>}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Gallery</h5>
              {results.gallery.length === 0 ? (
                <p className="text-muted mb-0">No gallery items match this search.</p>
              ) : (
                <div className="row g-3">
                  {results.gallery.map((item) => (
                    <div key={item._id} className="col-md-4">
                      <Link to="/gallery" className="text-decoration-none text-dark">
                        <div className="border rounded p-3 h-100">
                          <div className="fw-semibold mb-2">{highlight(item.title || item.name)}</div>
                          <div className="text-muted small">{highlight(item.description)}</div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Videos</h5>
              {results.videos.length === 0 ? (
                <p className="text-muted mb-0">No videos match this search.</p>
              ) : (
                <div className="row g-3">
                  {results.videos.map((item) => (
                    <div key={item._id} className="col-md-6">
                      <Link to="/videos" className="text-decoration-none text-dark">
                        <div className="border rounded p-3 h-100">
                          <div className="fw-semibold mb-2">{highlight(item.title)}</div>
                          <div className="text-muted small">{highlight(item.description)}</div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;
