import { navigateTo } from '../utils/news';

const Breadcrumb = ({ items = [] }) => (
  <nav aria-label="Breadcrumb" className="breadcrumb-scroll text-xs sm:text-sm text-gray-500 overflow-x-auto">
    <ol className="flex items-center gap-2 whitespace-nowrap min-w-max">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <li key={`${item.label}-${index}`} className="flex items-center gap-2 min-w-0">
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
              <span
                className={isLast ? 'text-gray-900 font-medium truncate max-w-[180px] sm:max-w-[320px] inline-block align-bottom' : 'text-gray-500'}
                title={item.label}
              >
                {item.label}
              </span>
            )}
            {!isLast ? <span className="text-gray-300">/</span> : null}
          </li>
        );
      })}
    </ol>
  </nav>
);

export default Breadcrumb;
