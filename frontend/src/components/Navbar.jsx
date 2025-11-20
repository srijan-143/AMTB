import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import './Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo" onClick={closeMobileMenu}>
          🍽️ MTBS
        </Link>
        
        <button 
          className="mobile-menu-btn" 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
        
        {user ? (
          <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/dashboard" className="nav-link" onClick={closeMobileMenu}>
              📊 Dashboard
            </Link>
            <Link to="/book" className="nav-link" onClick={closeMobileMenu}>
              ➕ Book Meal
            </Link>
            <Link to="/bookings" className="nav-link" onClick={closeMobileMenu}>
              📋 My Bookings
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="nav-link" onClick={closeMobileMenu}>
                👤 Admin
              </Link>
            )}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => { logout(); closeMobileMenu(); }} className="nav-btn">
              Logout
            </button>
          </div>
        ) : (
          <div className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`}>
            <Link to="/login" className="nav-link" onClick={closeMobileMenu}>
              Login
            </Link>
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              aria-label="Toggle theme"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <Link to="/register" className="nav-btn" onClick={closeMobileMenu}>
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}
