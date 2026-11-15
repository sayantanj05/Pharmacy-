import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaBoxOpen } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

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

const Procurement = ({ user }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/procurement`, {
        headers,
        params: status ? { status } : {},
      });
      setRequests(res.data.data.procurements || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load procurement requests.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [status]);

  const updateStatus = async (id, nextStatus) => {
    setError('');
    setMessage('');
    try {
      await axios.put(`${API_URL}/procurement/${id}/status`, { status: nextStatus }, { headers });
      setMessage(`Request ${nextStatus}.`);
      fetchRequests();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update request.');
    }
  };

  const isAdmin = user?.role === 'super_admin';

  return (
    <div className="p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Procurement Requests</h2>
        <select
          className="form-select"
          style={{ width: 200 }}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="rejected">Rejected</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {message && <div className="alert alert-info py-2">{message}</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="table-container">
        {loading ? (
          <div className="text-center py-3">Loading...</div>
        ) : requests.length === 0 ? (
          <p className="text-muted mb-0">No procurement requests.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Shop</th>
                  <th>Requested by</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {requests.map((request) => (
                  <tr key={request._id}>
                    <td>{new Date(request.createdAt).toLocaleString()}</td>
                    <td>{request.shopId?.name || '-'}</td>
                    <td>{request.requestedBy?.name || '-'}</td>
                    <td>
                      {request.items.map((item) => (
                        <div key={`${request._id}-${item.name}`} className="small">
                          {item.name} × {item.quantity} (₹{item.price})
                        </div>
                      ))}
                    </td>
                    <td>₹{request.totalAmount}</td>
                    <td>
                      <span className={`badge ${statusBadge(request.status)}`}>{request.status}</span>
                      {request.rejectionReason ? (
                        <div className="small text-danger">{request.rejectionReason}</div>
                      ) : null}
                    </td>
                    <td>
                      {isAdmin && request.status === 'pending' ? (
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-success"
                            onClick={() => updateStatus(request._id, 'approved')}
                            title="Approve"
                          >
                            <FaCheck />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => updateStatus(request._id, 'rejected')}
                            title="Reject"
                          >
                            <FaTimes />
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => updateStatus(request._id, 'fulfilled')}
                            title="Fulfill (adds stock)"
                          >
                            <FaBoxOpen />
                          </button>
                        </div>
                      ) : isAdmin && request.status === 'approved' ? (
                        <button
                          className="btn btn-sm btn-primary"
                          onClick={() => updateStatus(request._id, 'fulfilled')}
                        >
                          <FaBoxOpen className="me-1" /> Fulfill
                        </button>
                      ) : (
                        '-'
                      )}
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