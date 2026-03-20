import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
      />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center px-3 md:px-4 py-2 md:py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden mr-3 text-gray-600 hover:text-gray-900 text-xl"
            >
              ☰
            </button>
            <h2 className="text-sm md:text-base font-semibold text-gray-800">
              Dashboard
            </h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-3 md:p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
