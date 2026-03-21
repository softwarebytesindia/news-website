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

  if (pathname.startsWith('/news/')) {
    const slug = decodeURIComponent(pathname.replace('/news/', '').split('/')[0] || '');
    return <NewsDetailPage slug={slug} />;
  }

  return <NewsHome />;
}

export default App;
