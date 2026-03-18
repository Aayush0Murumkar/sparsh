import React, { useEffect, useState } from 'react';
import './Header.css';

function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`site-header ${scrolled ? 'site-header--shadow' : ''}`}>
      <div className="header-inner">
        {/* Brand */}
        <a className="brand" href="/">
          <span className="brand-icon">🛡️</span>
          <div className="brand-text">
            <span className="brand-name">SheShield AI</span>
            <span className="brand-tag">Women Safety Route Assistant</span>
          </div>
        </a>

        {/* Nav */}
        <nav className="header-nav" aria-label="Main navigation">
          <a href="#home"    className="nav-link">Home</a>
          <a href="#about"   className="nav-link">About</a>
          <a href="#contact" className="nav-link">Contact</a>
          <a href="#home" className="nav-cta">Get Routes</a>
        </nav>

        {/* Mobile hamburger – CSS only toggle */}
        <label className="hamburger" htmlFor="nav-toggle" aria-label="Toggle menu">
          <span /><span /><span />
        </label>
      </div>
    </header>
  );
}

export default Header;
