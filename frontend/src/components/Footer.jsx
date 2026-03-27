import { useEffect, useState } from 'react';
import { CATEGORIES_API_URL, navigateTo } from '../utils/news';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(CATEGORIES_API_URL);
        const data = await response.json();
        if (Array.isArray(data)) {
          const activeCategories = data
            .filter((cat) => cat?.isActive !== false && cat?.slug)
            .map((cat) => ({ name: cat.name, href: `/${cat.slug}` }));
          setCategories(activeCategories);
        }
      } catch (error) {
        console.error('Error fetching footer categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const company = [
    { name: 'About Us', href: '/about' },
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Disclaimer', href: '/disclaimer' },
  ];

  const socialLinks = [
    { name: 'Facebook', icon: 'facebook', href: 'https://facebook.com' },
    { name: 'Twitter', icon: 'twitter', href: 'https://twitter.com' },
    { name: 'Instagram', icon: 'instagram', href: 'https://instagram.com' },
    { name: 'LinkedIn', icon: 'linkedin', href: 'https://linkedin.com' },
    { name: 'YouTube', icon: 'youtube', href: 'https://youtube.com' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 py-5 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 gap-6 pb-5 border-b border-gray-700">
          <div>
            <a href="/" className="inline-flex items-center gap-2 text-white no-underline mb-2">
              <img src="/news.webp" alt="New Bharat Digital" className="h-6 w-auto" />
            </a>
            <p className="text-xs leading-5 text-gray-400 mb-3">
              Your trusted source for breaking news.
            </p>
            <div className="flex gap-2">
              {socialLinks.map((social) => (
                <a 
                  key={social.name}
                  href={social.href}
                  className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded-lg text-gray-300 no-underline transition-all duration-200 hover:bg-red-600 hover:text-white hover:-translate-y-0.5"
                  aria-label={social.name}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon === 'facebook' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                    </svg>
                  )}
                  {social.icon === 'twitter' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path>
                    </svg>
                  )}
                  {social.icon === 'instagram' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                    </svg>
                  )}
                  {social.icon === 'linkedin' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                      <rect x="2" y="9" width="4" height="12"></rect>
                      <circle cx="4" cy="4" r="2"></circle>
                    </svg>
                  )}
                  {social.icon === 'youtube' && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                      <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"></polygon>
                    </svg>
                  )}
                </a>
              ))}
            </div>
          </div>

        </div>

        <div className="grid grid-cols-3 gap-3 pt-4 pb-4">
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Categories</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {categories.map((item) => (
                <li key={item.name}>
                  <a 
                    href={item.href} 
                    onClick={(e) => { e.preventDefault(); navigateTo(item.href); }}
                    className="text-gray-400 no-underline text-xs hover:text-white transition-colors duration-200"
                  >{item.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">Company</h4>
            <ul className="list-none p-0 m-0 flex flex-col gap-1">
              {company.map((item) => (
                <li key={item.name}>
                  <a href={item.href} className="text-gray-400 no-underline text-xs hover:text-white transition-colors duration-200">{item.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-2 border-t border-gray-700">
          <p className="text-xs text-gray-400 m-0">
            © {currentYear} New Bharat Digital. All rights reserved.
          </p>
          <p className="text-xs text-gray-500 m-0 italic">
            Trusted News. Every Day.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
