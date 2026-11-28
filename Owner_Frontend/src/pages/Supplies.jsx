import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaEdit, FaTrash, FaDownload } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';
import api from '../services/api';

const Supplies = ({ user }) => {
  const [supplies, setSupplies] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupply, setEditingSupply] = useState(null);
  const refreshToken = useRefreshOnFocus();
  const [formData, setFormData] = useState({ medicineId: '', vendorId: '', items: [{ medicineId: '', medicineName: '', quantity: '', unitPrice: '', totalPrice: '', batchNumber: '', expiryDate: '' }], totalAmount: '', notes: '' });

  const fetchData = async () => {
    try {
      const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
      const [suppliesRes, medicinesRes, vendorsRes] = await Promise.all([
        api.get(`/supplies${shopFilter}`),
        api.get(`/medicines${shopFilter}`),
        api.get(`/vendors${shopFilter}`),
      ]);
      setSupplies(suppliesRes.data.data?.supplies || suppliesRes.data.supplies || []);
      setMedicines(medicinesRes.data.data?.medicines || medicinesRes.data.medicines || []);
      setVendors(vendorsRes.data.data?.vendors || vendorsRes.data.vendors || []);
    } catch (error) {
      console.error('Error fetching supplies:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user, refreshToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      items: formData.items.map(item => ({
        ...item,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.quantity) * Number(item.unitPrice),
      })),
      totalAmount: Number(formData.totalAmount),
    };
    try {
      if (editingSupply) {
        await api.put(`/supplies/${editingSupply._id}`, payload);
      } else {
        await api.post('/supplies', payload);
      }
      setShowModal(false);
      setEditingSupply(null);
      fetchData();
    } catch (error) {
      console.error('Error saving supply:', error);
    }
  };

  const handleEdit = (supply) => {
    setEditingSupply(supply);
    setFormData({ ...supply, items: supply.items || [{ medicineId: '', medicineName: '', quantity: '', unitPrice: '', totalPrice: '', batchNumber: '', expiryDate: '' }], totalAmount: String(supply.totalAmount || '') });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/supplies/${id}`);
      fetchData();
    } catch (error) {
      console.error('Error deleting supply:', error);
    }
  };

  const downloadPDF = async (id) => {
    try {
      const res = await api.get(`/supplies/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `supply-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Supplies</h2>
        <button className="btn btn-primary" onClick={() => { setEditingSupply(null); setFormData({ medicineId: '', vendorId: '', items: [{ medicineId: '', medicineName: '', quantity: '', unitPrice: '', totalPrice: '', batchNumber: '', expiryDate: '' }], totalAmount: '', notes: '' }); setShowModal(true); }}>
          <FaPlus className="me-2" /> Add Supply
        </button>
      </div>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Date</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply) => (
                <tr key={supply._id}>
                  <td>{new Date(supply.date || supply.createdAt).toLocaleDateString()}</td>
                  <td>{supply.vendorId?.name || 'N/A'}</td>
                  <td>{supply.items?.length || 0} items</td>
                  <td>${supply.totalAmount}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(supply)}><FaEdit /></button>
                    <button className="btn btn-sm btn-outline-success me-2" onClick={() => downloadPDF(supply._id)}><FaDownload /></button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(supply._id)}><FaTrash /></button>
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
                  <h5 className="modal-title">{editingSupply ? 'Edit Supply' : 'Add Supply'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label">Vendor</label>
                        <select className="form-select" value={formData.vendorId} onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })} required>
                          <option value="">Select Vendor</option>
                          {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label">Total Amount</label>
                        <input type="number" className="form-control" value={formData.totalAmount} onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })} required />
                      </div>
                      <div className="col-12">
                        <label className="form-label">Notes</label>
                        <textarea className="form-control" rows="2" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}></textarea>
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

export default Supplies;
