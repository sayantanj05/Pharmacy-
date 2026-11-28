import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FaPills, FaShoppingCart, FaTruck, FaBoxes, FaChartBar, FaChartPie, FaChartLine, FaCircle } from 'react-icons/fa';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';
import api from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';

const COLORS = ['#10B981', '#0EA5E9', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1', '#14B8A6'];

const Dashboard = ({ user }) => {
  const [stats, setStats] = useState({
    totalMedicines: 0,
    totalOrders: 0,
    totalVendors: 0,
    totalSupplies: 0,
  });
  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeGranularity, setTimeGranularity] = useState('daily');
  const refreshToken = useRefreshOnFocus();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
        const [medicinesRes, ordersRes, vendorsRes, suppliesRes] = await Promise.all([
          api.get(`/medicines${shopFilter}`),
          api.get(`/orders${shopFilter}`),
          api.get(`/vendors${shopFilter}`),
          api.get(`/supplies${shopFilter}`),
        ]);
        const medicinesPayload = medicinesRes.data.data?.medicines || medicinesRes.data.medicines || [];
        const ordersPayload = ordersRes.data.data?.orders || ordersRes.data.orders || [];
        const vendorsPayload = vendorsRes.data.data?.vendors || vendorsRes.data.vendors || [];
        const suppliesPayload = suppliesRes.data.data?.supplies || suppliesRes.data.supplies || [];
        setMedicines(medicinesPayload);
        setOrders(ordersPayload);
        setStats({
          totalMedicines: medicinesPayload.length,
          totalOrders: ordersPayload.length,
          totalVendors: vendorsPayload.length,
          totalSupplies: suppliesPayload.length,
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user, refreshToken]);

  const topMedicinesByStock = useMemo(() => {
    return [...medicines]
      .sort((a, b) => (b.stock || 0) - (a.stock || 0))
      .slice(0, 10)
      .map(m => ({ name: m.name, stock: m.stock || 0 }));
  }, [medicines]);

  const medicinesBySystem = useMemo(() => {
    const map = {};
    medicines.forEach(m => {
      const key = m.medicineSystem || 'Other';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const medicinesByType = useMemo(() => {
    const map = {};
    medicines.forEach(m => {
      const key = m.medicineType || 'Other';
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [medicines]);

  const orderTrend = useMemo(() => {
    const map = {};
    orders.forEach(o => {
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
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [orders, timeGranularity]);

  const statCards = [
    { title: 'Total Medicines', value: stats.totalMedicines, icon: FaPills, color: 'primary' },
    { title: 'Total Orders', value: stats.totalOrders, icon: FaShoppingCart, color: 'success' },
    { title: 'Total Vendors', value: stats.totalVendors, icon: FaTruck, color: 'warning' },
    { title: 'Total Supplies', value: stats.totalSupplies, icon: FaBoxes, color: 'info' },
  ];

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="mb-4">Dashboard</h2>
      <div className="row g-4 mb-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            className="col-md-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={`card stat-card ${stat.color} p-3`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="mb-1 opacity-75">{stat.title}</p>
                  <h3 className="mb-0">{stat.value}</h3>
                </div>
                <stat.icon size={40} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="row g-4">
        <div className="col-lg-6">
          <div className="card p-4 h-100">
            <div className="d-flex align-items-center mb-3">
              <FaChartBar className="me-2 text-primary" />
              <h5 className="mb-0">Top Medicines by Stock</h5>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <BarChart data={topMedicinesByStock}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} angle={-35} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="stock" radius={[4, 4, 0, 0]}>
                    {topMedicinesByStock.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-lg-6">
          <div className="card p-4 h-100">
            <div className="d-flex align-items-center mb-3">
              <FaChartPie className="me-2 text-info" />
              <h5 className="mb-0">Medicines by System</h5>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={medicinesBySystem}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {medicinesBySystem.map((entry, index) => (
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

        <div className="col-lg-6">
          <div className="card p-4 h-100">
            <div className="d-flex align-items-center mb-3">
              <FaCircle className="me-2 text-warning" />
              <h5 className="mb-0">Medicine Type Breakdown</h5>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={medicinesByType}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {medicinesByType.map((entry, index) => (
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

        <div className="col-lg-6">
          <div className="card p-4 h-100">
            <div className="d-flex align-items-center justify-content-between mb-3">
              <div className="d-flex align-items-center">
                <FaChartLine className="me-2 text-success" />
                <h5 className="mb-0">Order Trend Over Time</h5>
              </div>
              <select
                className="form-select form-select-sm"
                style={{ width: 'auto' }}
                value={timeGranularity}
                onChange={(e) => setTimeGranularity(e.target.value)}
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div style={{ width: '100%', height: 320 }}>
              <ResponsiveContainer>
                <LineChart data={orderTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;