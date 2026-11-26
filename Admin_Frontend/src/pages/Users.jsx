import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Users = ({ user }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', shopId: '' });
  const [error, setError] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      const usersData = res.data.data?.users || [];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setError(error.response?.data?.message || error.message || 'Failed to fetch users. You may not have permission.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setShowModal(false);
      setEditingUser(null);
      setFormData({ name: '', email: '', password: '', role: 'customer', shopId: '' });
      await fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error.response?.data || error.message);
      setError(error.response?.data?.message || 'Failed to save user. You may not have permission.');
    }
  };

  const handleEdit = (u) => {
    setEditingUser(u);
    setFormData({ name: u.name, email: u.email, password: '', role: u.role, shopId: u.shopId || '' });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/${id}`);
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  console.log('Rendering Users component with', users.length, 'users:', users);

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Users</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add User
        </button>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingUser ? 'Edit User' : 'Add User'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email *</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
                  </div>
                  {!editingUser && (
                    <div className="mb-3">
                      <label className="form-label">Password *</label>
                      <input type="password" className="form-control" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} required />
                    </div>
                  )}
                  <div className="mb-3">
                    <label className="form-label">Role *</label>
                    <select className="form-select" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} required>
                      <option value="customer">Customer</option>
                      <option value="shop_owner">Shop Owner</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Shop ID</label>
                    <input type="text" className="form-control" value={formData.shopId} onChange={(e) => setFormData({ ...formData, shopId: e.target.value })} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Shop ID</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td><span className="badge bg-primary">{u.role}</span></td>
                  <td>{u.shopId || 'N/A'}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary btn-action" onClick={() => handleEdit(u)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(u._id)}>
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
