import React from 'react';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const categories = [
    { name: 'World', link: '#' },
    { name: 'Politics', link: '#' },
    { name: 'Business', link: '#' },
    { name: 'Technology', link: '#' },
    { name: 'Science', link: '#' },
    { name: 'Health', link: '#' },
    { name: 'Sports', link: '#' },
    { name: 'Entertainment', link: '#' }
  ];

  const company = [
    { name: 'About Us', link: '#' },
    { name: 'Careers', link: '#' },
    { name: 'Contact', link: '#' },
    { name: 'Advertise', link: '#' },
    { name: 'Press', link: '#' }
  ];

  const legal = [
    { name: 'Privacy Policy', link: '#' },
    { name: 'Terms of Service', link: '#' },
    { name: 'Cookie Policy', link: '#' }
  ];

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-top">
          <div className="footer-brand">
            <div className="footer-logo">
              <span className="logo-icon">📰</span>
              <span className="logo-text">NewsHub</span>
            </div>
            <p className="footer-description">
              Your trusted source for breaking news, in-depth analysis, and stories that matter. Stay informed with NewsHub.
            </p>
            <div className="footer-social">
              <a href="#" className="social-link">𝕏</a>
              <a href="#" className="social-link">in</a>
              <a href="#" className="social-link">f</a>
              <a href="#" className="social-link">📺</a>
            </div>
          </div>

          <div className="footer-links">
            <div className="footer-column">
              <h4>Categories</h4>
              <ul>
                {categories.map((item, index) => (
                  <li key={index}><a href={item.link}>{item.name}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                {company.map((item, index) => (
                  <li key={index}><a href={item.link}>{item.name}</a></li>
                ))}
              </ul>
            </div>

            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                {legal.map((item, index) => (
                  <li key={index}><a href={item.link}>{item.name}</a></li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-newsletter">
          <div className="newsletter-content">
            <h4>Subscribe to Our Newsletter</h4>
            <p>Get the latest news delivered to your inbox daily.</p>
          </div>
          <form className="newsletter-form">
            <input type="email" placeholder="Enter your email" />
            <button type="submit">Subscribe</button>
          </form>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} NewsHub. All rights reserved.</p>
          <div className="footer-bottom-links">
            <a href="#">Sitemap</a>
            <a href="#">RSS</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
