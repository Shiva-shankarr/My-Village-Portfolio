import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const navigate = useNavigate();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('vp_search_history');
    if (stored) {
      try {
        setSearchHistory(JSON.parse(stored));
      } catch (error) {
        setSearchHistory([]);
      }
    }
  }, []);

  const menuItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Gallery', href: '#gallery' },
    { label: 'Videos', href: '#videos' },
    { label: 'Updates', href: '#updates' },
  ];

  const filteredSuggestions = searchValue
    ? searchHistory.filter((item) =>
        item.toLowerCase().includes(searchValue.toLowerCase())
      )
    : searchHistory.slice(0, 5);

  const saveSearchHistory = (value) => {
    const normalized = value.trim();
    if (!normalized) return;
    const next = [normalized, ...searchHistory.filter((item) => item !== normalized)].slice(0, 6);
    setSearchHistory(next);
    localStorage.setItem('vp_search_history', JSON.stringify(next));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (!searchValue.trim()) return;
    saveSearchHistory(searchValue);
    setShowSuggestions(false);
    setIsMenuOpen(false);
    navigate(`/search?q=${encodeURIComponent(searchValue.trim())}`);
  };

  return (
    <nav className={`navbar navbar-expand-lg navbar-custom fixed-top ${isScrolled ? 'shadow-sm' : ''}`}>
      <div className="container">
        <Link to="/" className="navbar-brand text-white fs-4 fw-bold">
          Puriya Thanda
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`collapse navbar-collapse ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <form className="d-flex me-lg-3 position-relative" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              className="form-control"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => {
                setSearchValue(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
              aria-label="Search"
            />
            <button className="btn btn-outline-light ms-2" type="submit">
              Search
            </button>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="position-absolute top-100 start-0 mt-1 w-100 bg-white border rounded shadow-sm z-3">
                {filteredSuggestions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="list-group-item list-group-item-action border-0 w-100 text-start"
                    onMouseDown={() => {
                      setSearchValue(item);
                      saveSearchHistory(item);
                      setShowSuggestions(false);
                      setIsMenuOpen(false);
                      navigate(`/search?q=${encodeURIComponent(item)}`);
                    }}
                  >
                    {item}
                  </button>
                ))}
              </div>
            )}
          </form>
          <ul className="navbar-nav ms-auto">
            {menuItems.map((item) => (
              <li key={item.href} className="nav-item">
                <a
                  href={item.href}
                  className="nav-link"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
            <li className="nav-item">
              <Link
                to="/login"
                className="nav-link"
                onClick={() => setIsMenuOpen(false)}
              >
                Admin
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 
