import { NavLink } from 'react-router-dom';

const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    { path: '/manage-news', label: 'Manage News', icon: 'N' },
    { path: '/manage-category', label: 'Manage Category', icon: 'C' },
    { path: '/manage-subcategory', label: 'Manage Subcategory', icon: 'S' },
    { path: '/manage-author', label: 'Manage Author', icon: 'A' }
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-52 bg-gray-900 text-white
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        flex flex-col
      `}>
        <div className="p-3 md:p-4 border-b border-gray-700 flex items-center justify-between">
          <h1 className="text-base md:text-lg font-bold">Admin Panel</h1>
          <button
            onClick={onClose}
            className="md:hidden text-gray-300 hover:text-white text-xl"
          >
            x
          </button>
        </div>

        <nav className="flex-1 py-3 md:py-4">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) => `
                flex items-center gap-2 px-4 py-2 md:py-3
                text-xs md:text-sm
                transition-colors duration-200
                ${isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
              `}
            >
              <span className="text-sm md:text-base">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 md:p-4 border-t border-gray-700">
          <p className="text-[10px] md:text-xs text-gray-400">News Admin v1.0</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
