import { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);
    try {
      const res = await api.put('/auth/profile', formData);
      updateUser(res.data.data.user);
      setMessage('Profile updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-1">
      <h2 className="mb-4">Profile</h2>
      <div className="row g-4">
        <div className="col-lg-6">
          <form className="table-container" onSubmit={handleSubmit}>
            <h5 className="mb-3">Account details</h5>
            {message && <div className="alert alert-info py-2">{message}</div>}
            {error && <div className="alert alert-danger py-2">{error}</div>}
            <div className="mb-3">
              <label className="form-label">Name</label>
              <input
                type="text"
                className="form-control"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input type="email" className="form-control" value={user?.email || ''} disabled />
            </div>
            <div className="mb-3">
              <label className="form-label">Phone</label>
              <input
                type="tel"
                className="form-control"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : 'Save changes'}
            </button>
          </form>
        </div>
        <div className="col-lg-6">
          <div className="table-container h-100">
            <h5 className="mb-3">Summary</h5>
            <p className="mb-2"><strong>Role:</strong> {user?.role}</p>
            <p className="mb-2"><strong>User ID:</strong> {user?._id}</p>
            <p className="mb-0 text-muted">
              Manage your personal information used for orders and notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;