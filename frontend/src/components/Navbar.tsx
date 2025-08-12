import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="navbar-content">
          <Link to="/" className="navbar-brand">
            Todo App
          </Link>
          <ul className="navbar-nav">
            {isAuthenticated ? (
              <>
                <li>
                  <span style={{ color: '#6b7280' }}>
                    Welcome, {user?.email}
                  </span>
                </li>
                <li>
                  <button
                    onClick={handleLogout}
                    className="nav-link"
                    style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', color: '#1f2937' }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" className="nav-link">
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/register" className="nav-link">
                    Register
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 