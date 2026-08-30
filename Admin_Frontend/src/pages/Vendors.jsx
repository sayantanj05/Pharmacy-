import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Vendors = ({ user }) => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', gstNumber: '' });

  const fetchVendors = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/vendors`, { headers });
      console.log('Vendors response:', res.data);
      const vendorsData = res.data.data?.vendors || res.data.vendors || [];
      console.log('Setting vendors with:', vendorsData.length, 'items');
      setVendors(vendorsData);
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchVendors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      console.log('Submitting vendor data:', formData);
      if (editingVendor) {
        await axios.put(`${API_URL}/vendors/${editingVendor._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/vendors`, formData, { headers });
      }
      console.log('Vendor saved successfully');
      setShowModal(false);
      setEditingVendor(null);
      setFormData({ name: '', email: '', phone: '', address: '', gstNumber: '' });
      fetchVendors();
    } catch (error) {
      console.error('Error saving vendor:', error.response?.data || error.message);
    }
  };

  const handleEdit = (vendor) => {
    console.log('Editing vendor:', vendor);
    setEditingVendor(vendor);
    setFormData({ ...vendor });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      console.log('Deleting vendor:', id);
      await axios.delete(`${API_URL}/vendors/${id}`, { headers });
      console.log('Vendor deleted successfully');
      fetchVendors();
    } catch (error) {
      console.error('Error deleting vendor:', error.response?.data || error.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Vendors</h2>
        {user.role !== 'customer' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FaPlus className="me-2" /> Add Vendor
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingVendor ? 'Edit Vendor' : 'Add Vendor'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone *</label>
                    <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <textarea className="form-control" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })}></textarea>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">GST Number</label>
                    <input type="text" className="form-control" value={formData.gstNumber} onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })} />
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
                <th>Phone</th>
                <th>GST Number</th>
                {user.role !== 'customer' && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {vendors.map((vendor) => (
                <tr key={vendor._id}>
                  <td>{vendor.name}</td>
                  <td>{vendor.email}</td>
                  <td>{vendor.phone}</td>
                  <td>{vendor.gstNumber}</td>
                  {user.role !== 'customer' && (
                    <td>
                      <button className="btn btn-sm btn-outline-primary btn-action" onClick={() => handleEdit(vendor)}>
                        <FaEdit />
                      </button>
                      <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(vendor._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Vendors;
