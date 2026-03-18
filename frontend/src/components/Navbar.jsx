import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'World', href: '/world' },
    { name: 'Politics', href: '/politics' },
    { name: 'Business', href: '/business' },
    { name: 'Technology', href: '/technology' },
    { name: 'Sports', href: '/sports' },
    { name: 'Entertainment', href: '/entertainment' },
    { name: 'Science', href: '/science' },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between h-16">
        <div className="flex-shrink-0">
          <a href="/" className="flex items-center gap-2 text-gray-900 no-underline">
            <span className="text-2xl">📰</span>
            <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-gray-900 to-red-600 bg-clip-text text-transparent">
              DailyNews
            </span>
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

        <ul className={`md:flex items-center gap-2 list-none m-0 p-0 ${isMenuOpen ? 'absolute top-16 left-0 right-0 bg-white flex-col py-4 px-4 shadow-md' : 'hidden'}`}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <a href={link.href} className="block px-4 py-2 text-gray-600 no-underline text-sm font-medium rounded-md transition-all duration-200 hover:text-red-600 hover:bg-red-50 md:py-2">
                {link.name}
              </a>
            </li>
          ))}
        </ul>

        <div className={`md:flex items-center gap-3 ${isMenuOpen ? 'hidden' : ''}`}>
          <button className="w-10 h-10 border-none bg-gray-100 rounded-full cursor-pointer flex items-center justify-center text-gray-600 transition-all duration-200 hover:bg-gray-200 hover:text-gray-900" aria-label="Search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
          </button>
          <button className="px-5 py-2.5 bg-red-600 text-white border-none rounded-md font-semibold text-sm cursor-pointer transition-all duration-200 hover:bg-red-700 hover:-translate-y-0.5">Subscribe</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
