import { useEffect, useState } from 'react';
import CategoryNewsPage from './CategoryNewsPage';
import NewsDetailPage from './NewsDetailPage';
import { NEWS_API_URL } from '../utils/news';

const CategoryOrArticlePage = ({ categorySlug, slugOrSubCategory }) => {
  const [resolvedType, setResolvedType] = useState('loading');

  useEffect(() => {
    const resolvePath = async () => {
      try {
        setResolvedType('loading');
        const response = await fetch(
          `${NEWS_API_URL}/path/${encodeURIComponent(categorySlug)}/${encodeURIComponent(slugOrSubCategory)}`
        );

        if (response.ok) {
          setResolvedType('article');
          return;
        }

        setResolvedType('subcategory');
      } catch (error) {
        console.error('Error resolving category or article path:', error);
        setResolvedType('subcategory');
      }
    };

    resolvePath();
  }, [categorySlug, slugOrSubCategory]);

  if (resolvedType === 'loading') {
    return <CategoryNewsPage categorySlug={categorySlug} subCategorySlug={slugOrSubCategory} />;
  }

  if (resolvedType === 'article') {
    return <NewsDetailPage categorySlug={categorySlug} slug={slugOrSubCategory} />;
  }

  return <CategoryNewsPage categorySlug={categorySlug} subCategorySlug={slugOrSubCategory} />;
};

export default CategoryOrArticlePage;
