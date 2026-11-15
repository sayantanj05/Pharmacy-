import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

const API_URL = 'http://192.168.31.187:5000/api';

const Medicines = ({ user }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const refreshToken = useRefreshOnFocus();
  const [formData, setFormData] = useState({
    name: '', codeNumber: '', category: '', medicineType: 'Tablet', medicineSystem: 'Allopathy',
    manufacturer: '', batchNumber: '', price: '', stock: '', minStockLevel: 10,
    description: '', imageUrl: '', prescriptionRequired: false, isActive: true,
  });

  const fetchMedicines = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
      const res = await axios.get(`${API_URL}/medicines${shopFilter}`, { headers });
      const payload = res.data.data?.medicines || res.data.medicines || [];
      setMedicines(payload);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMedicines(); }, [user, refreshToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    const data = { ...formData, price: Number(formData.price), stock: Number(formData.stock), minStockLevel: Number(formData.minStockLevel) };
    try {
      if (editingMedicine) {
        await axios.put(`${API_URL}/medicines/${editingMedicine._id}`, data, { headers });
      } else {
        await axios.post(`${API_URL}/medicines`, data, { headers });
      }
      setShowModal(false);
      setEditingMedicine(null);
      setFormData({ name: '', codeNumber: '', category: '', medicineType: 'Tablet', medicineSystem: 'Allopathy', manufacturer: '', batchNumber: '', price: '', stock: '', minStockLevel: 10, description: '', imageUrl: '', prescriptionRequired: false, isActive: true });
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({ ...medicine, price: String(medicine.price), stock: String(medicine.stock), minStockLevel: String(medicine.minStockLevel) });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.delete(`${API_URL}/medicines/${id}`, { headers });
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const filtered = medicines.filter(m =>
    m.name?.toLowerCase().includes(search.toLowerCase()) ||
    m.codeNumber?.toLowerCase().includes(search.toLowerCase()) ||
    m.category?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Medicines</h2>
        <button className="btn btn-primary" onClick={() => { setEditingMedicine(null); setFormData({ name: '', codeNumber: '', category: '', medicineType: 'Tablet', medicineSystem: 'Allopathy', manufacturer: '', batchNumber: '', price: '', stock: '', minStockLevel: 10, description: '', imageUrl: '', prescriptionRequired: false, isActive: true }); setShowModal(true); }}>
          <FaPlus className="me-2" /> Add Medicine
        </button>
      </div>
      <div className="card p-4 mb-4">
        <div className="input-group">
          <span className="input-group-text"><FaSearch /></span>
          <input type="text" className="form-control" placeholder="Search medicines..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Name</th>
                <th>Code</th>
                <th>Type</th>
                <th>System</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((medicine) => (
                <tr key={medicine._id}>
                  <td>{medicine.name}</td>
                  <td>{medicine.codeNumber}</td>
                  <td>{medicine.medicineType}</td>
                  <td>{medicine.medicineSystem}</td>
                  <td>{medicine.stock}</td>
                  <td>₹{medicine.price}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(medicine)}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(medicine._id)}><FaTrash /></button>
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</h5>
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
                        <label className="form-label">Code Number</label>
                        <input type="text" className="form-control" value={formData.codeNumber} onChange={(e) => setFormData({ ...formData, codeNumber: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Category</label>
                        <input type="text" className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Medicine Type</label>
                        <select className="form-select" value={formData.medicineType} onChange={(e) => setFormData({ ...formData, medicineType: e.target.value })}>
                          <option>Tablet</option><option>Capsule</option><option>Syrup</option><option>Suspension</option><option>Sachet</option><option>Cream</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Medicine System</label>
                        <select className="form-select" value={formData.medicineSystem} onChange={(e) => setFormData({ ...formData, medicineSystem: e.target.value })}>
                          <option>Allopathy</option><option>Homeopathy</option><option>Ayurvedic</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Manufacturer</label>
                        <input type="text" className="form-control" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Batch Number</label>
                        <input type="text" className="form-control" value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Price</label>
                        <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Stock</label>
                        <input type="number" className="form-control" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Min Stock Level</label>
                        <input type="number" className="form-control" value={formData.minStockLevel} onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label">Image URL</label>
                        <input type="text" className="form-control" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Description</label>
                        <textarea className="form-control" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })}></textarea>
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

export default Medicines;
