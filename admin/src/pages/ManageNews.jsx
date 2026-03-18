import { useState, useEffect } from 'react'
import './ManageNews.css'

const API_URL = 'http://localhost:5000/api'

function ManageNews() {
  const [news, setNews] = useState([])
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    category: '',
    image: '',
    author: 'Admin',
    isFeatured: false,
    isPublished: true
  })

  useEffect(() => {
    loadNews()
    loadCategories()
  }, [])

  const loadNews = async () => {
    try {
      const res = await fetch(`${API_URL}/news`)
      const data = await res.json()
      setNews(data)
    } catch (error) {
      console.error('Error loading news:', error)
    }
  }

  const loadCategories = async () => {
    try {
      const res = await fetch(`${API_URL}/categories`)
      const data = await res.json()
      setCategories(data)
    } catch (error) {
      console.error('Error loading categories:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_URL}/news/${editingId}` : `${API_URL}/news`

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      setShowModal(false)
      setEditingId(null)
      setFormData({
        title: '',
        description: '',
        content: '',
        category: '',
        image: '',
        author: 'Admin',
        isFeatured: false,
        isPublished: true
      })
      loadNews()
    } catch (error) {
      console.error('Error saving news:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setFormData({
      title: item.title,
      description: item.description,
      content: item.content,
      category: item.category?._id || item.category,
      image: item.image || '',
      author: item.author,
      isFeatured: item.isFeatured,
      isPublished: item.isPublished
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this news?')) {
      try {
        await fetch(`${API_URL}/news/${id}`, { method: 'DELETE' })
        loadNews()
      } catch (error) {
        console.error('Error deleting news:', error)
      }
    }
  }

  const filteredNews = news.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const openModal = () => {
    setEditingId(null)
    setFormData({
      title: '',
      description: '',
      content: '',
      category: '',
      image: '',
      author: 'Admin',
      isFeatured: false,
      isPublished: true
    })
    setShowModal(true)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage News</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Add News</button>
      </div>

      <div className="card">
        <div className="search-bar">
          <input
            type="text"
            placeholder="Search news..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Author</th>
              <th>Featured</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredNews.length > 0 ? (
              filteredNews.map(item => (
                <tr key={item._id}>
                  <td>{item.title}</td>
                  <td>{item.category?.name || '-'}</td>
                  <td>{item.author}</td>
                  <td>
                    <span className={`badge ${item.isFeatured ? 'badge-success' : 'badge-danger'}`}>
                      {item.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${item.isPublished ? 'badge-success' : 'badge-danger'}`}>
                      {item.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-warning btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item._id)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No news found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit News' : 'Add News'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map(cat => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Content</label>
                <textarea
                  value={formData.content}
                  onChange={e => setFormData({ ...formData, content: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Image URL</label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={e => setFormData({ ...formData, image: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={e => setFormData({ ...formData, author: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={e => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  Featured
                </label>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={e => setFormData({ ...formData, isPublished: e.target.checked })}
                  />
                  Published
                </label>
              </div>
              <button type="submit" className="btn btn-success">Save</button>
              <button type="button" className="btn btn-danger" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManageNews
