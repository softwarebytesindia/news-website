import { useEffect, useState } from 'react';
import { API_BASE_URL, navigateTo } from '../utils/news';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState([{ name: 'Home', href: '/' }]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);

        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        const categories = await response.json();
        const categoryLinks = Array.isArray(categories)
          ? categories
            .filter((category) => category?.isActive !== false && category?.slug)
            .map((category) => ({
              name: category.name,
              href: `/${category.slug}`,
            }))
          : [];

        setNavLinks([{ name: 'Home', href: '/' }, ...categoryLinks]);
      } catch (error) {
        console.error('Error fetching navbar categories:', error);
        setNavLinks([{ name: 'Home', href: '/' }]);
      }
    };

    fetchCategories();
  }, []);

  const handleNavigate = (event, href) => {
    event.preventDefault();
    setIsMenuOpen(false);
    navigateTo(href);
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <a
            href="/"
            className="flex items-center gap-2 text-gray-900 no-underline"
            onClick={(event) => handleNavigate(event, '/')}
          >
            <img src="/news.webp" alt="New Bharat Digital" className="h-7 sm:h-8 w-auto" />
          </a>
        </div>

        <button 
          className="md:hidden bg-none border-none cursor-pointer p-2"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <div className={`flex flex-col gap-1.5 w-6 ${isMenuOpen ? 'open' : ''}`}>
            <span className={`block h-0.5 bg-gray-900 rounded transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-2' : ''}`}></span>
            <span className={`block h-0.5 bg-gray-900 rounded transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`}></span>
            <span className={`block h-0.5 bg-gray-900 rounded transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-2' : ''}`}></span>
          </div>
        </button>

        <ul className={`nav-scroll md:flex-1 md:min-w-0 md:flex md:items-center md:justify-center md:gap-2 md:overflow-x-auto md:whitespace-nowrap list-none m-0 p-0 ${isMenuOpen ? 'absolute top-16 left-0 right-0 bg-white flex-col py-4 px-4 shadow-md' : 'hidden'}`}>
          {navLinks.map((link) => (
            <li key={link.name} className="md:flex-shrink-0">
              <a
                href={link.href}
                className="block px-4 py-2 text-gray-600 no-underline text-sm font-medium rounded-md transition-all duration-200 hover:text-red-600 hover:bg-red-50 md:py-2"
                onClick={(event) => handleNavigate(event, link.href)}
              >
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <div className={`md:flex items-center gap-3 flex-shrink-0 ${isMenuOpen ? 'hidden' : ''}`}>
          <button className="w-10 h-10 border-none bg-gray-100 rounded-full cursor-pointer flex items-center justify-center text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
