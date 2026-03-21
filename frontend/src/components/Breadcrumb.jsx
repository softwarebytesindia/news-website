import { navigateTo } from '../utils/news';

const Breadcrumb = ({ items = [] }) => (
  <nav aria-label="Breadcrumb" className="text-xs sm:text-sm text-gray-500">
    <ol className="flex flex-wrap items-center gap-2">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2">
            {item.path && !isLast ? (
              <a
                href={item.path}
                onClick={(event) => {
                  event.preventDefault();
                  navigateTo(item.path);
                }}
                className="text-gray-500 no-underline hover:text-red-600"
              >
                {item.label}
              </a>
            ) : (
              <span className={isLast ? 'text-gray-900 font-medium' : 'text-gray-500'}>{item.label}</span>
            )}
            {!isLast ? <span className="text-gray-300">/</span> : null}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
