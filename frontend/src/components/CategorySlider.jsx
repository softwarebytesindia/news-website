import { useEffect, useState } from 'react';
import { API_BASE_URL, navigateTo } from '../utils/news';

const CategorySlider = () => {
  const [categories, setCategories] = useState([{ name: 'All', href: '/' }]);
  const [activeCategory, setActiveCategory] = useState(window.location.pathname === '/' ? 'All' : '');

  useEffect(() => {
    const syncActiveCategory = () => {
      setActiveCategory(window.location.pathname === '/' ? 'All' : window.location.pathname.split('/')[1] || 'All');
    };

    syncActiveCategory();
    window.addEventListener('popstate', syncActiveCategory);
    return () => window.removeEventListener('popstate', syncActiveCategory);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);

        if (!response.ok) {
          throw new Error('Failed to load categories');
        }

        const data = await response.json();
        const categoryLinks = Array.isArray(data)
          ? data
            .filter((category) => category?.isActive !== false && category?.slug)
            .map((category) => ({
              name: category.name,
              href: `/${category.slug}`,
            }))
          : [];

        setCategories([{ name: 'All', href: '/' }, ...categoryLinks]);
      } catch (error) {
        console.error('Error fetching homepage categories:', error);
        setCategories([{ name: 'All', href: '/' }]);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="category-scroll md:hidden bg-white border-b border-gray-200 overflow-x-auto">
      <div className="flex items-center gap-2 px-4 py-3 min-w-max">
        {categories.map((category) => (
          <a
            key={category.name}
            href={category.href}
            onClick={(e) => {
              e.preventDefault();
              setActiveCategory(category.href === '/' ? 'All' : category.href.replace('/', ''));
              navigateTo(category.href);
            }}
            className={`px-4 py-1.5 text-xs font-medium rounded-full whitespace-nowrap no-underline transition-all duration-200 ${
              activeCategory === (category.href === '/' ? 'All' : category.href.replace('/', ''))
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
