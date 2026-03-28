import { useEffect } from 'react';
import { navigateTo } from '../utils/news';

const Breadcrumb = ({ items = [] }) => {
  // ── BreadcrumbList JSON-LD Structured Data ─────────────────────────────
  // Enables Google to show breadcrumbs in search results (improves CTR)
  useEffect(() => {
    if (!items || items.length === 0) return;

    const listItems = items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      ...(item.path ? { item: `${window.location.origin}${item.path}` } : {})
    }));

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: listItems
    };

    let el = document.head.querySelector('script[data-type="breadcrumb-jsonld"]');
    if (!el) {
      el = document.createElement('script');
      el.setAttribute('type', 'application/ld+json');
      el.setAttribute('data-type', 'breadcrumb-jsonld');
      document.head.appendChild(el);
    }
    el.textContent = JSON.stringify(jsonLd);

    return () => {
      el?.remove();
    };
  }, [items]);

  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="breadcrumb-scroll text-xs sm:text-sm text-gray-500 overflow-x-auto">
      <ol className="flex items-center gap-2 whitespace-nowrap min-w-max" itemScope itemType="https://schema.org/BreadcrumbList">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={`${item.label}-${index}`}
              className="flex items-center gap-2 min-w-0"
              itemProp="itemListElement"
              itemScope
              itemType="https://schema.org/ListItem"
            >
              {item.path && !isLast ? (
                <a
                  href={item.path}
                  onClick={(event) => {
                    event.preventDefault();
                    navigateTo(item.path);
                  }}
                  className="text-gray-500 no-underline hover:text-red-600"
                  itemProp="item"
                >
                  <span itemProp="name">{item.label}</span>
                </a>
              ) : (
                <span
                  className={isLast ? 'text-gray-900 font-medium truncate max-w-[180px] sm:max-w-[320px] inline-block align-bottom' : 'text-gray-500'}
                  title={item.label}
                  itemProp="name"
                >
                  {item.label}
                </span>
              )}
              <meta itemProp="position" content={String(index + 1)} />
              {!isLast ? <span className="text-gray-300">/</span> : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
