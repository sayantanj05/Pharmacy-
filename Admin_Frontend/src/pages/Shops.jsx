import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Shops = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingShop, setEditingShop] = useState(null);
  const [formData, setFormData] = useState({ shopId: '', name: '', address: { street: '', city: '', state: '', pincode: '' }, phone: '', email: '', licenseNumber: '', gstNumber: '' });

  const fetchShops = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/shops`, { headers });
      console.log('Shops response:', res.data);
      const shopsData = res.data.data?.shops || res.data.shops || [];
      console.log('Setting shops with:', shopsData.length, 'items');
      setShops(shopsData);
    } catch (error) {
      console.error('Error fetching shops:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShops(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      console.log('Submitting shop data:', formData);
      if (editingShop) {
        await axios.put(`${API_URL}/shops/${editingShop._id}`, formData, { headers });
      } else {
        await axios.post(`${API_URL}/shops`, formData, { headers });
      }
      console.log('Shop saved successfully');
      setShowModal(false);
      setEditingShop(null);
      setFormData({ shopId: '', name: '', address: { street: '', city: '', state: '', pincode: '' }, phone: '', email: '', licenseNumber: '', gstNumber: '' });
      fetchShops();
    } catch (error) {
      console.error('Error saving shop:', error.response?.data || error.message);
    }
  };

  const handleEdit = (shop) => {
    console.log('Editing shop:', shop);
    setEditingShop(shop);
    setFormData({ ...shop, address: shop.address || { street: '', city: '', state: '', pincode: '' } });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      console.log('Deleting shop:', id);
      await axios.delete(`${API_URL}/shops/${id}`, { headers });
      console.log('Shop deleted successfully');
      fetchShops();
    } catch (error) {
      console.error('Error deleting shop:', error.response?.data || error.message);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Shops</h2>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FaPlus className="me-2" /> Add Shop
        </button>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingShop ? 'Edit Shop' : 'Add Shop'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Shop ID *</label>
                    <input type="text" className="form-control" value={formData.shopId} onChange={(e) => setFormData({ ...formData, shopId: e.target.value })} required placeholder="e.g., SHOP001" />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Shop Name *</label>
                    <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Street</label>
                    <input type="text" className="form-control" value={formData.address.street} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, street: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">City</label>
                    <input type="text" className="form-control" value={formData.address.city} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, city: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">State</label>
                    <input type="text" className="form-control" value={formData.address.state} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, state: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Pincode</label>
                    <input type="text" className="form-control" value={formData.address.pincode} onChange={(e) => setFormData({ ...formData, address: { ...formData.address, pincode: e.target.value } })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" className="form-control" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" className="form-control" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">License Number *</label>
                    <input type="text" className="form-control" value={formData.licenseNumber} onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })} required />
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
                <th>Shop ID</th>
                <th>Name</th>
                <th>Address</th>
                <th>Phone</th>
                <th>Email</th>
                <th>License</th>
                <th>GST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shops.map((shop) => (
                <tr key={shop._id}>
                  <td>{shop.shopId}</td>
                  <td>{shop.name}</td>
                  <td>{shop.address ? `${shop.address.street}, ${shop.address.city}` : 'N/A'}</td>
                  <td>{shop.phone}</td>
                  <td>{shop.email}</td>
                  <td>{shop.licenseNumber}</td>
                  <td>{shop.gstNumber}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary btn-action" onClick={() => handleEdit(shop)}>
                      <FaEdit />
                    </button>
                    <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => handleDelete(shop._id)}>
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

export default Shops;
