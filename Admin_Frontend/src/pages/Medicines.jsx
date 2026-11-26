import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const Medicines = ({ user }) => {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [formData, setFormData] = useState({
    name: '', codeNumber: '', medicineType: 'Tablet', quantityUnit: '', medicineSystem: 'Allopathy',
    price: '', stock: '', category: '', manufacturer: '', batchNumber: '',
    manufactureDate: '', expiryDate: '', description: '', imageUrl: '', minStockLevel: '10'
  });
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMedicines = async () => {
    try {
      const res = await api.get('/medicines');
      const medicinesData = res.data.data?.medicines || res.data.medicines || [];
      setMedicines(medicinesData);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = medicines.filter(medicine =>
    medicine.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.codeNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    medicine.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => { fetchMedicines(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMedicine) {
        await api.put(`/medicines/${editingMedicine._id}`, formData);
      } else {
        await api.post('/medicines', formData);
      }
      setShowModal(false);
      setEditingMedicine(null);
      setFormData({ name: '', codeNumber: '', medicineType: 'Tablet', quantityUnit: '', medicineSystem: 'Allopathy', price: '', stock: '', category: '', manufacturer: '', batchNumber: '', manufactureDate: '', expiryDate: '', description: '', imageUrl: '', minStockLevel: '10' });
      fetchMedicines();
    } catch (error) {
      console.error('Error saving medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setFormData({ ...medicine });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/medicines/${id}`);
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  return (
    <div className="p-2">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0" style={{ fontWeight: 700, letterSpacing: '-0.5px' }}>Medicines</h2>
        <div className="d-flex gap-3 align-items-center">
          <div className="position-relative" style={{ minWidth: '280px' }}>
            <FaSearch className="position-absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search medicines..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '36px', borderRadius: '10px', boxShadow: 'none', border: '1px solid #E5E7EB' }}
            />
          </div>
          {user.role !== 'customer' && (
            <button className="btn btn-primary d-flex align-items-center gap-2" onClick={() => setShowModal(true)} style={{ borderRadius: '10px', fontWeight: '600' }}>
              <FaPlus size={14} /> Add Medicine
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{editingMedicine ? 'Edit Medicine' : 'Add Medicine'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Name *</label>
                      <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Code Number *</label>
                      <input type="text" className="form-control" value={formData.codeNumber} onChange={(e) => setFormData({ ...formData, codeNumber: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Medicine Type *</label>
                      <select className="form-select" value={formData.medicineType} onChange={(e) => setFormData({ ...formData, medicineType: e.target.value })} required>
                        <option value="Tablet">Tablet</option>
                        <option value="Capsule">Capsule</option>
                        <option value="Syrup">Syrup</option>
                        <option value="Suspension">Suspension</option>
                        <option value="Sachet">Sachet</option>
                        <option value="Cream">Cream</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Quantity Unit *</label>
                      <input type="text" className="form-control" value={formData.quantityUnit} onChange={(e) => setFormData({ ...formData, quantityUnit: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Medicine System *</label>
                      <select className="form-select" value={formData.medicineSystem} onChange={(e) => setFormData({ ...formData, medicineSystem: e.target.value })} required>
                        <option value="Allopathy">Allopathy</option>
                        <option value="Homeopathy">Homeopathy</option>
                        <option value="Ayurvedic">Ayurvedic</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Price *</label>
                      <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Stock *</label>
                      <input type="number" className="form-control" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: e.target.value })} required />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Manufacture Date</label>
                      <input type="date" className="form-control" value={formData.manufactureDate} onChange={(e) => setFormData({ ...formData, manufactureDate: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Expiry Date</label>
                      <input type="date" className="form-control" value={formData.expiryDate} onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })} />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Image URL</label>
                      <input type="url" className="form-control" value={formData.imageUrl} onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })} placeholder="https://example.com/medicine-image.jpg" />
                      <small className="text-muted">
                        <strong>Note:</strong> Google Images URLs won't work due to security restrictions. Use direct image URLs from:
                        <br/>• Unsplash (unsplash.com)
                        <br/>• Wikimedia Commons
                        <br/>• Your own image hosting
                        <br/>• Or upload images to a service like Imgur
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Manufacturer</label>
                      <input type="text" className="form-control" value={formData.manufacturer} onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Min Stock Level</label>
                      <input type="number" className="form-control" value={formData.minStockLevel} onChange={(e) => setFormData({ ...formData, minStockLevel: e.target.value })} />
                    </div>
                    <div className="col-md-12 mb-3">
                      <label className="form-label">Description</label>
                      <textarea className="form-control" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows="3" />
                    </div>
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
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Type</th>
                  <th>System</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Min Stock</th>
                  <th>Manufacturer</th>
                  <th>Description</th>
                  <th>Expiry</th>
                  {user.role !== 'customer' && <th className="text-center" style={{ width: '120px' }}>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine) => (
                  <tr key={medicine._id}>
                    <td>
                      {medicine.imageUrl ? (
                        <img 
                          src={medicine.imageUrl} 
                          alt={medicine.name} 
                          style={{ width: '65px', height: '65px', objectFit: 'cover', borderRadius: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.08)', border: '1px solid #f0f0f0' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) e.target.nextElementSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div style={{ width: '65px', height: '65px', backgroundColor: '#f3f4f6', borderRadius: '10px', border: '1px solid #e5e7eb', display: medicine.imageUrl ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', color: '#6b7280', fontWeight: '600', textAlign: 'center', padding: '2px' }}>
                        {medicine.imageUrl ? 'Load Err' : 'No Img'}
                      </div>
                    </td>
                    <td>{medicine.name}</td>
                    <td>{medicine.codeNumber}</td>
                    <td>{medicine.medicineType}</td>
                    <td>{medicine.medicineSystem}</td>
                    <td>₹{medicine.price}</td>
                    <td style={{ color: medicine.stock <= (medicine.minStockLevel || 10) ? '#EF4444' : 'inherit', fontWeight: medicine.stock <= (medicine.minStockLevel || 10) ? 'bold' : 'normal' }}>
                      {medicine.stock}
                    </td>
                    <td>{medicine.minStockLevel || 10}</td>
                    <td>{medicine.manufacturer || 'N/A'}</td>
                    <td style={{ maxWidth: '150px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={medicine.description}>
                      {medicine.description || 'N/A'}
                    </td>
                    <td>{medicine.expiryDate ? new Date(medicine.expiryDate).toLocaleDateString() : 'N/A'}</td>
                    {user.role !== 'customer' && (
                      <td>
                        <div className="d-flex gap-2 justify-content-center align-items-center">
                          <button className="btn btn-sm btn-outline-primary btn-action d-flex align-items-center justify-content-center" onClick={() => handleEdit(medicine)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="btn btn-sm btn-outline-danger btn-action d-flex align-items-center justify-content-center" onClick={() => handleDelete(medicine._id)} title="Delete">
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Medicines;
