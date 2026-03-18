import React from 'react';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">📰</span>
          <span className="logo-text">NewsHub</span>
        </div>
        <ul className="navbar-menu">
          <li><a href="/" className="active">Home</a></li>
          <li><a href="#">World</a></li>
          <li><a href="#">Politics</a></li>
          <li><a href="#">Business</a></li>
          <li><a href="#">Technology</a></li>
          <li><a href="#">Sports</a></li>
          <li><a href="#">Entertainment</a></li>
        </ul>
        <div className="navbar-search">
          <input type="text" placeholder="Search news..." />
          <button>🔍</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
