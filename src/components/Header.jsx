// src/dasboard/Header/Header.jsx
import React from 'react';
import './Header.css'; // Import custom styles

const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black py-3 app-header">
      <div className="container-fluid">
        
        {/* Left Side: Logo and App Name */}
        <a className="navbar-brand d-flex align-items-center text-info" href="#">
          <svg className="logo-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          <span>AI-based Stockfyy</span>
        </a>

        {/* Hamburger Menu Button for Mobile */}
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav" 
          aria-controls="navbarNav" 
          aria-expanded="false" 
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Right Side: Login and Sign Up Buttons */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <div className="navbar-nav ms-auto d-flex align-items-center">
            
            {/* MODIFIED: Removed 'btn-outline-light' class to apply custom styles */}
            <button className="btn btn-login me-lg-2 mb-2 mb-lg-0">
              Login
            </button>
            <button className="btn btn-signup">
              Sign Up
            </button>
          </div>
        </div>
        
      </div>
    </nav>
  );
};

export default Header;

