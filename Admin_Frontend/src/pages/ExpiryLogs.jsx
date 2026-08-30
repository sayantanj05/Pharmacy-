import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const ExpiryLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`${API_URL}/expiry-logs`, { headers });
        setLogs(res.data.logs || []);
      } catch (error) {
        console.error('Error fetching expiry logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

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
                <th>Batch</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log._id}>
                  <td>{log.medicineId?.name || 'N/A'}</td>
                  <td>{log.batchNumber || 'N/A'}</td>
                  <td>{log.expiryDate ? new Date(log.expiryDate).toLocaleDateString() : 'N/A'}</td>
                  <td>{log.quantity}</td>
                  <td><span className={`badge bg-${log.status === 'replaced' ? 'success' : log.status === 'expired' ? 'danger' : 'warning'}`}>{log.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpiryLogs;
