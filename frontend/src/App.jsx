import { useEffect, useState } from 'react';
import About from './pages/About';
import CategoryNewsPage from './pages/CategoryNewsPage';
import CategoryOrArticlePage from './pages/CategoryOrArticlePage';
import Contact from './pages/Contact';
import NewsHome from './pages/NewsHome';
import NewsDetailPage from './pages/NewsDetailPage';
import PrivacyPolicy from './pages/PrivacyPolicy';

const getCurrentPath = () => window.location.pathname;

function App() {
  const [pathname, setPathname] = useState(getCurrentPath());

  useEffect(() => {
    const handlePathChange = () => {
      setPathname(getCurrentPath());
    };

    window.addEventListener('popstate', handlePathChange);
    return () => {
      window.removeEventListener('popstate', handlePathChange);
    };
  }, []);

  const pathSegments = pathname.split('/').filter(Boolean).map((segment) => decodeURIComponent(segment));
  if (pathname === '/about') {
    return <About />;
  }

  if (pathname === '/privacy') {
    return <PrivacyPolicy />;
  }

  if (pathname === '/contact') {
    return <Contact />;
  }

  if (pathSegments.length === 1) {
    const [categorySlug] = pathSegments;
    return <CategoryNewsPage categorySlug={categorySlug} />;
  }

  if (pathSegments.length === 2) {
    const [categorySlug, slugOrSubCategory] = pathSegments;
    return <CategoryOrArticlePage categorySlug={categorySlug} slugOrSubCategory={slugOrSubCategory} />;
  }

  if (pathSegments.length === 3) {
    const [categorySlug, subCategorySlug, slug] = pathSegments;
    return <NewsDetailPage categorySlug={categorySlug} subCategorySlug={subCategorySlug} slug={slug} />;
  }

  return <NewsHome />;
}

export default App;
