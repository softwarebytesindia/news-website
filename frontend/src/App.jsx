import { useEffect, useState } from 'react';
import NewsHome from './pages/NewsHome';
import NewsDetailPage from './pages/NewsDetailPage';

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
  if (pathSegments.length === 2) {
    const [categorySlug, slug] = pathSegments;
    return <NewsDetailPage categorySlug={categorySlug} slug={slug} />;
  }

  if (pathSegments.length === 3) {
    const [categorySlug, subCategorySlug, slug] = pathSegments;
    return <NewsDetailPage categorySlug={categorySlug} subCategorySlug={subCategorySlug} slug={slug} />;
  }

  return <NewsHome />;
}

export default App;
