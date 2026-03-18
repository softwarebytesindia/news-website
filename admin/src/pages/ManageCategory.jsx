import { useState, useEffect } from 'react'
import './ManageCategory.css'

const API_URL = 'http://localhost:5000/api'

function ManageCategory() {
  const [categories, setCategories] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isActive: true
  })

  useEffect(() => {
    loadCategories()
  }, [])

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
      const slug = formData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
      const data = { ...formData, slug }
      
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `${API_URL}/categories/${editingId}` : `${API_URL}/categories`

      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      setShowModal(false)
      setEditingId(null)
      setFormData({ name: '', description: '', isActive: true })
      loadCategories()
    } catch (error) {
      console.error('Error saving category:', error)
    }
  }

  const handleEdit = (item) => {
    setEditingId(item._id)
    setFormData({
      name: item.name,
      description: item.description || '',
      isActive: item.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this category?')) {
      try {
        await fetch(`${API_URL}/categories/${id}`, { method: 'DELETE' })
        loadCategories()
      } catch (error) {
        console.error('Error deleting category:', error)
      }
    }
  }

  const openModal = () => {
    setEditingId(null)
    setFormData({ name: '', description: '', isActive: true })
    setShowModal(true)
  }

  return (
    <div className="page-content">
      <div className="page-header">
        <h1>Manage Category</h1>
        <button className="btn btn-primary" onClick={openModal}>+ Add Category</button>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length > 0 ? (
              categories.map(item => (
                <tr key={item._id}>
                  <td>{item.name}</td>
                  <td>{item.slug}</td>
                  <td>{item.description || '-'}</td>
                  <td>
                    <span className={`badge ${item.isActive ? 'badge-success' : 'badge-danger'}`}>
                      {item.isActive ? 'Active' : 'Inactive'}
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
                <td colSpan="5" style={{ textAlign: 'center' }}>No categories found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={e => setFormData({ ...formData, isActive: e.target.checked })}
                  />
                  Active
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

export default ManageCategory
