import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaChartBar, FaChartPie, FaChartLine } from 'react-icons/fa';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import api from '../services/api';

const COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const Reports = ({ user }) => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [timeGranularity, setTimeGranularity] = useState('daily');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (user?.shopId) params.shopId = user.shopId;
      const res = await api.get('/reports/financial', { params });
      setReport(res.data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [user]);

  const orderTrend = useMemo(() => {
    if (!report?.orders?.length) return [];
    const map = {};
    report.orders.forEach(o => {
      const date = new Date(o.createdAt);
      let key;
      if (timeGranularity === 'daily') {
        key = date.toISOString().split('T')[0];
      } else if (timeGranularity === 'weekly') {
        const d = new Date(date);
        const day = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() - day + 1);
        key = d.toISOString().split('T')[0];
      } else if (timeGranularity === 'monthly') {
        key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
      } else {
        key = String(date.getUTCFullYear());
      }
      map[key] = (map[key] || 0) + o.totalAmount;
    });
    return Object.entries(map)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [report, timeGranularity]);

  const paymentMethodData = useMemo(() => {
    if (!report?.orders?.length) return [];
    const map = {};
    report.orders.forEach(o => {
      const key = o.paymentMethod || 'Unknown';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [report]);

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
          </div>

          <div className="row g-4 mb-4">
            <div className="col-lg-6">
              <div className="card p-4 h-100">
                <div className="d-flex align-items-center mb-3">
                  <FaChartLine className="me-2 text-success" />
                  <h5 className="mb-0">Revenue Trend</h5>
                </div>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <LineChart data={orderTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="card p-4 h-100">
                <div className="d-flex align-items-center mb-3">
                  <FaChartPie className="me-2 text-info" />
                  <h5 className="mb-0">Payment Methods</h5>
                </div>
                <div style={{ width: '100%', height: 320 }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={paymentMethodData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                        {paymentMethodData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
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
