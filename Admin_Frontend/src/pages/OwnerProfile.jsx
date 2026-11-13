import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSave } from 'react-icons/fa';

const API_URL = 'http://192.168.31.187:5000/api';

const Profile = ({ user, onLogout }) => {
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', licenseNumber: '', gstNumber: '' });

  const fetchShop = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/shops/current`, { headers });
      const payload = res.data.data?.shop || res.data.shop || {};
      setShop(payload);
      setFormData({
        name: payload.name || '',
        email: payload.email || '',
        phone: payload.phone || '',
        address: typeof payload.address === 'string' ? payload.address : (payload.address?.street || ''),
        licenseNumber: payload.licenseNumber || '',
        gstNumber: payload.gstNumber || '',
      });
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShop(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.put(`${API_URL}/shops/${shop._id}`, formData, { headers });
      setEditing(false);
      fetchShop();
    } catch (error) {
      console.error('Error updating shop:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Shop Profile</h2>
      <div className="card p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5>Shop Details</h5>
          <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Shop Name</label>
                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">License Number</label>
                <input type="text" className="form-control" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea className="form-control" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
              </div>
              <div className="col-md-6">
                <label className="form-label">GST Number</label>
                <input type="text" className="form-control" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
              </div>
            </div>
            <div className="mt-3">
              <button type="submit" className="btn btn-primary"><FaSave className="me-2" /> Save Changes</button>
            </div>
          </form>
        ) : (
          <div>
            <p><strong>Name:</strong> {shop.name}</p>
            <p><strong>Email:</strong> {shop.email}</p>
            <p><strong>Phone:</strong> {shop.phone}</p>
            <p><strong>License:</strong> {shop.licenseNumber}</p>
            <p><strong>GST:</strong> {shop.gstNumber}</p>
            <p><strong>Address:</strong> {typeof shop.address === 'string' ? shop.address : shop.address?.street || 'N/A'}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
