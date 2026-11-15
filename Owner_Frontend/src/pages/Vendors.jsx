import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

const API_URL = 'http://192.168.31.187:5000/api';

const Vendors = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const refreshToken = useRefreshOnFocus();
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', licenseNumber: '', gstNumber: '', isActive: true });

  const fetchVendors = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
      const res = await axios.get(`${API_URL}/vendors${shopFilter}`, { headers });
      const payload = res.data.data?.vendors || res.data.vendors || [];
      setVendors(payload);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, [user, refreshToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      if (editingVendor) {
        await axios.put(`${API_URL}/vendors/${editingVendor._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/vendors`, formData, { headers });
      }
      setShowModal(false);
      setEditingVendor(null);
      setFormData({ name: '', email: '', phone: '', address: '', licenseNumber: '', gstNumber: '', isActive: true });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error);
    }
  };

  const handleEdit = (vendor) => {
    setEditingVendor(vendor);
    setFormData({ ...vendor });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.delete(`${API_URL}/vendors/${id}`, { headers });
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Vendors</h2>
        <button className="btn btn-primary" onClick={() => { setEditingVendor(null); setFormData({ name: '', email: '', phone: '', address: '', licenseNumber: '', gstNumber: '', isActive: true }); setShowModal(true); }}>
          <FaPlus className="me-2" /> Add Vendor
        </button>
      </div>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.gstNumber}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(vendor)}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(vendor._id)}><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="modal show d-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Name</label>
                        <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Phone</label>
                        <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">GST Number</label>
                        <input type="text" className="form-control" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Address</label>
                        <textarea className="form-control" rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                    <button type="submit" className="btn btn-primary">Save</button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Vendors;
