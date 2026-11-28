import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from './services/api';
import './index.css';

import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Orders from './pages/Orders';
import Vendors from './pages/Vendors';
import Supplies from './pages/Supplies';
import ExpiryLogs from './pages/ExpiryLogs';
import Reports from './pages/Reports';
import Procurement from './pages/Procurement';
import Profile from './pages/Profile';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        if (parsed && typeof parsed === 'object') {
          setUser(parsed);
        } else {
          localStorage.removeItem('user');
        }
      } catch (e) {
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="login-container">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={login} />;
  }

  const routes = [
    { path: '/dashboard', element: <Dashboard user={user} /> },
    { path: '/medicines', element: <Medicines user={user} /> },
    { path: '/orders', element: <Orders user={user} /> },
    { path: '/vendors', element: <Vendors user={user} /> },
    { path: '/supplies', element: <Supplies user={user} /> },
    { path: '/expiry-logs', element: <ExpiryLogs user={user} /> },
    { path: '/reports', element: <Reports user={user} /> },
    { path: '/procurement', element: <Procurement user={user} /> },
    { path: '/profile', element: <Profile user={user} onLogout={logout} /> },
  ];

  const getSidebarItems = () => [
    { path: '/dashboard', label: 'Dashboard', icon: 'FaTachometerAlt' },
    { path: '/medicines', label: 'Medicines', icon: 'FaPills' },
    { path: '/orders', label: 'Orders', icon: 'FaShoppingCart' },
    { path: '/vendors', label: 'Vendors', icon: 'FaTruck' },
    { path: '/supplies', label: 'Supplies', icon: 'FaBoxes' },
    { path: '/expiry-logs', label: 'Expiry Logs', icon: 'FaCalendarTimes' },
    { path: '/reports', label: 'Reports', icon: 'FaChartBar' },
    { path: '/procurement', label: 'Procurement', icon: 'FaClipboardList' },
    { path: '/profile', label: 'Profile', icon: 'FaUser' },
  ];

  return (
    <div className="d-flex">
      <Sidebar items={getSidebarItems()} user={user} onLogout={logout} isOpen={sidebarOpen} />
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? '250px' : '0' }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Routes>
                {routes.map((route) => (
                  <Route key={route.path} path={route.path} element={route.element} />
                ))}
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;