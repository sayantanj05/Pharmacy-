import { useState } from 'react';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Profile = ({ user, onLogout }) => {
  const [formData, setFormData] = useState({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.put(`${API_URL}/auth/profile`, formData, { headers });
      setMessage('Profile updated successfully');
      localStorage.setItem('user', JSON.stringify(res.data.user));
    } catch (error) {
      setMessage(error.response?.data?.message || 'Update failed');
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Profile</h2>
      <div className="card p-4" style={{ maxWidth: '500px' }}>
        {message && <div className="alert alert-info">{message}</div>}
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Name</label>
            <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Email</label>
            <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          </div>
          <div className="mb-3">
            <label className="form-label">Phone</label>
            <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary"><FaSave className="me-2" /> Save Changes</button>
        </form>
        <hr />
        <button className="btn btn-outline-danger" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Profile;
