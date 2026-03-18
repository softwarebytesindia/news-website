import { useState } from 'react'
import './App.css'
import ManageNews from './pages/ManageNews'
import ManageCategory from './pages/ManageCategory'

function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { id: 'news', label: 'Manage News', icon: '📰' },
    { id: 'category', label: 'Manage Category', icon: '📂' }
  ]

  return (
    <div className="sidebar">
      <h2 className="sidebar-title">News Admin</h2>
      <ul className="sidebar-menu">
        {menuItems.map(item => (
          <li
            key={item.id}
            className={`sidebar-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => setActivePage(item.id)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            {item.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function App() {
  const [activePage, setActivePage] = useState('news')

  return (
    <div className="app-container">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      {activePage === 'news' && <ManageNews />}
      {activePage === 'category' && <ManageCategory />}
    </div>
  )
}

export default App
