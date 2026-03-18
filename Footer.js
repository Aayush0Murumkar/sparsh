import React from 'react';
import './Footer.css';

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-icon">🛡️</span>
          <span className="footer-brand-name">SheShield AI</span>
        </div>

        <nav className="footer-links" aria-label="Footer links">
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
          <a href="#privacy">Privacy Policy</a>
        </nav>

        <p className="footer-copy">© 2026 Sparshh – SheShield AI</p>
      </div>
    </footer>
  );
}

export default Footer;
