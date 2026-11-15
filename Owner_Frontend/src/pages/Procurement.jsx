import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaPlus, FaTrash, FaPaperPlane, FaSyncAlt } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

const API_URL = 'http://192.168.31.187:5000/api';

const emptyItem = {
  name: '',
  medicineType: 'Tablet',
  medicineSystem: 'Allopathy',
  manufacturer: '',
  batchNumber: '',
  expiryDate: '',
  quantity: 1,
  price: '',
};

const statusBadge = (status) => {
  const map = {
    pending: 'bg-warning',
    approved: 'bg-info',
    fulfilled: 'bg-success',
    rejected: 'bg-danger',
    cancelled: 'bg-secondary',
  };
  return map[status] || 'bg-secondary';
};

const Procurement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([{ ...emptyItem }]);
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const refreshToken = useRefreshOnFocus();

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${API_URL}/procurement`, { headers });
      setRequests(res.data.data.procurements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load procurement requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [refreshToken]);

  const updateItem = (index, field, value) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const addItem = () => setItems((prev) => [...prev, { ...emptyItem }]);

  const removeItem = (index) => {
    setItems((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)));
  };

  const total = items.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.price || 0), 0);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      const payload = {
        notes,
        items: items.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
          price: Number(item.price),
          expiryDate: item.expiryDate || null,
        })),
      };
      await axios.post(`${API_URL}/procurement`, payload, { headers });
      setItems([{ ...emptyItem }]);
      setNotes('');
      setMessage('Procurement request sent to the super admin.');
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit request.');
    } finally {
      setSubmitting(false);
    }
  };

  const cancelRequest = async (id) => {
    try {
      await axios.post(`${API_URL}/procurement/${id}/cancel`, {}, { headers });
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not cancel request.');
    }
  };

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Procurement</h2>
        <div className="d-flex align-items-center gap-2">
          <span className="text-muted">Order medicines from the super admin</span>
          <button type="button" className="btn btn-outline-secondary btn-sm" onClick={fetchRequests} title="Refresh">
            <FaSyncAlt />
          </button>
        </div>
      </div>

      {message && <div className="alert alert-info py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form className="table-container mb-4" onSubmit={submit}>
        <h5 className="mb-3">New request</h5>
        <div className="table-responsive">
          <table className="table align-middle">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Type</th>
                <th>System</th>
                <th>Manufacturer</th>
                <th>Batch</th>
                <th>Expiry</th>
                <th>Qty</th>
                <th>Price</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      className="form-control"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={item.medicineType}
                      onChange={(e) => updateItem(index, 'medicineType', e.target.value)}
                    >
                      <option>Tablet</option>
                      <option>Capsule</option>
                      <option>Syrup</option>
                      <option>Suspension</option>
                      <option>Sachet</option>
                      <option>Cream</option>
                    </select>
                  </td>
                  <td>
                    <select
                      className="form-select"
                      value={item.medicineSystem}
                      onChange={(e) => updateItem(index, 'medicineSystem', e.target.value)}
                    >
                      <option>Allopathy</option>
                      <option>Homeopathy</option>
                      <option>Ayurvedic</option>
                    </select>
                  </td>
                  <td>
                    <input
                      className="form-control"
                      value={item.manufacturer}
                      onChange={(e) => updateItem(index, 'manufacturer', e.target.value)}
                    />
                  </td>
                  <td style={{ minWidth: 120 }}>
                    <input
                      className="form-control"
                      value={item.batchNumber}
                      onChange={(e) => updateItem(index, 'batchNumber', e.target.value)}
                      placeholder="Batch no."
                    />
                  </td>
                  <td style={{ minWidth: 150 }}>
                    <input
                      type="date"
                      className="form-control"
                      value={item.expiryDate}
                      onChange={(e) => updateItem(index, 'expiryDate', e.target.value)}
                      title="Expiry date — required for expiry tracking"
                    />
                  </td>
                  <td style={{ width: 100 }}>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                      required
                    />
                  </td>
                  <td style={{ width: 120 }}>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => removeItem(index)}
                      disabled={items.length === 1}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center mt-2">
          <button type="button" className="btn btn-outline-primary" onClick={addItem}>
            <FaPlus className="me-2" /> Add item
          </button>
          <div className="fw-bold">Total: ₹{total}</div>
        </div>

        <div className="mb-3 mt-3">
          <label className="form-label">Notes</label>
          <textarea
            className="form-control"
            rows="2"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          <FaPaperPlane className="me-2" /> {submitting ? 'Sending...' : 'Send request'}
        </button>
      </form>

      <div className="table-container">
        <h5 className="mb-3">My requests</h5>
        {loading ? (
          <div className="text-center py-3">Loading...</div>
        ) : requests.length === 0 ? (
          <p className="text-muted mb-0">No procurement requests yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{new Date(request.createdAt).toLocaleString()}</td>
                    <td>
                      {request.items.map((item) => (
                        <div key={`${request._id}-${item.name}`} className="small">
                          {item.name} × {item.quantity}
                          {item.expiryDate ? ` (exp ${new Date(item.expiryDate).toLocaleDateString()})` : ''}
                        </div>
                      ))}
                    </td>
                    <td>₹{request.totalAmount}</td>
                    <td>
                      <span className={`badge ${statusBadge(request.status)}`}>{request.status}</span>
                      {request.rejectionReason ? (
                        <div className="small text-danger">{request.rejectionReason}</div>
                      ) : null}
                      {request.status === 'fulfilled' ? (
                        <div className="small text-success">Stock added to your inventory</div>
                      ) : null}
                    </td>
                    <td>{request.notes || '-'}</td>
                    <td>
                      {request.status === 'pending' ? (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => cancelRequest(request._id)}
                        >
                          Cancel
                        </button>
                      ) : null}
                    </td>
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

export default Procurement;