import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FaSyncAlt } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

const API_URL = 'http://192.168.31.187:5000/api';

const ExpiryLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [replacementData, setReplacementData] = useState({ vendorId: '', notes: '' });
  const refreshToken = useRefreshOnFocus();

  const fetchLogs = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
      const res = await axios.get(`${API_URL}/expiry-logs${shopFilter}`, { headers });
      const payload = res.data.data?.expiryLogs || res.data.expiryLogs || res.data.data?.logs || res.data.logs || [];
      setLogs(payload);
    } catch (error) {
      console.error('Error fetching expiry logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, [user, refreshToken]);

  const handleReplacement = async (e) => {
    e.preventDefault();
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.post(`${API_URL}/expiry-logs/${selectedLog._id}/replacement`, replacementData, { headers });
      setShowModal(false);
      setSelectedLog(null);
      fetchLogs();
    } catch (error) {
      console.error('Error requesting replacement:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Expiry Logs</h2>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Replacement</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const med = log.medicineId || log.medicine || log;
                const medicineName = med.name || log.medicineName || 'N/A';
                const expiryDate = log.expiryDate || med.expiryDate;
                const quantity = log.quantity ?? log.quantityExpired ?? med.stock ?? 0;

                return (
                  <tr key={log._id}>
                    <td>{medicineName}</td>
                    <td>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{quantity}</td>
                    <td>
                      <span className={`badge bg-${log.status === 'replaced' ? 'success' : log.status === 'requested' ? 'warning' : 'danger'}`}>
                        {log.status}
                      </span>
                    </td>
                    <td>{log.replacementRequested ? 'Yes' : 'No'}</td>
                    <td>
                      {!log.replacementRequested && (
                        <button className="btn btn-sm btn-outline-warning" onClick={() => { setSelectedLog(log); setReplacementData({ vendorId: '', notes: '' }); setShowModal(true); }}>
                          <FaSyncAlt className="me-1" /> Request Replacement
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && selectedLog && (
          <motion.div className="modal show d-block" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Request Replacement</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <form onSubmit={handleReplacement}>
                  <div className="modal-body">
                    <p><strong>Medicine:</strong> {selectedLog.medicineName}</p>
                    <p><strong>Expiry Date:</strong> {new Date(selectedLog.expiryDate).toLocaleDateString()}</p>
                    <div className="mb-3">
                      <label className="form-label">Vendor</label>
                      <select className="form-select" value={replacementData.vendorId} onChange={(e) => setReplacementData({ ...replacementData, vendorId: e.target.value })} required>
                        <option value="">Select Vendor</option>
                        {/* vendors could be loaded here */}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Notes</label>
                      <textarea className="form-control" rows="2" value={replacementData.notes} onChange={(e) => setReplacementData({ ...replacementData, notes: e.target.value })}></textarea>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                    <button type="submit" className="btn btn-primary">Submit Request</button>
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

export default ExpiryLogs;