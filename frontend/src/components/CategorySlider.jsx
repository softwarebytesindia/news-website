import { useState } from 'react';

const CategorySlider = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = [
    { name: 'All', href: '/' },
    { name: 'Bollywood', href: '/bollywood' },
    { name: 'Politics', href: '/politics' },
    { name: 'Business', href: '/business' },
    { name: 'Technology', href: '/technology' },
    { name: 'Sports', href: '/sports' },
    { name: 'Entertainment', href: '/entertainment' },
    { name: 'Science', href: '/science' },
    { name: 'World', href: '/world' },
    { name: 'Health', href: '/health' },
    { name: 'Lifestyle', href: '/lifestyle' },
  ];

  return (
    <div className="md:hidden bg-white border-b border-gray-200 overflow-x-auto scrollbar-hide">
      <div className="flex items-center gap-2 px-4 py-3 min-w-max">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory(category.name);
            }}
            className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap no-underline transition-all duration-200 ${
              activeCategory === category.name
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-red-600 hover:text-white'
            }`}
          >
            {category.name}
          </a>
        ))}
      </div>
    </div>
  );
};

export default CategorySlider;
