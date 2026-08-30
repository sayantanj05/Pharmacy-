import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Reports = ({ user }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await axios.get(`${API_URL}/reports/financial`, { headers, params });
      setReport(res.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const res = await axios.get(`${API_URL}/reports/financial/pdf`, { headers, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'financial-report.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="mb-4">Financial Reports</h2>
      <div className="card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Start Date</label>
            <input type="date" className="form-control" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">End Date</label>
            <input type="date" className="form-control" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="col-md-4">
            <button className="btn btn-primary w-100" onClick={fetchReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate Report'}
            </button>
          </div>
        </div>
      </div>

      {report && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="row g-4 mb-4">
            <div className="col-md-4">
              <div className="card stat-card success p-3">
                <p className="mb-1 opacity-75">Total Revenue</p>
                <h3>${report.totalRevenue?.toFixed(2) || '0.00'}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card stat-card info p-3">
                <p className="mb-1 opacity-75">Total Orders</p>
                <h3>{report.orders?.length || 0}</h3>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card p-3">
                <button className="btn btn-outline-primary w-100" onClick={downloadPDF}>
                  <FaDownload className="me-2" /> Download PDF
                </button>
              </div>
            </div>
          </div>

          <div className="table-container">
            <h5 className="mb-3">Order Details</h5>
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {report.orders?.map((order) => (
                    <tr key={order._id}>
                      <td>{order._id}</td>
                      <td>{order.customerName || order.customerId}</td>
                      <td>${order.totalAmount}</td>
                      <td>{order.status}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Reports;
