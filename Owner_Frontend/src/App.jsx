import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Supplies from './pages/Supplies';
import Vendors from './pages/Vendors';
import Orders from './pages/Orders';
import ExpiryLogs from './pages/ExpiryLogs';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

const API_URL = 'http://192.168.31.187:5000/api';

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
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      const { token, user } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || 'Login failed' };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
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
    return <Login onLogin={(u) => { setUser(u); }} />;
  }

  const ownerRoutes = [
    { path: '/dashboard', element: <Dashboard user={user} /> },
    { path: '/medicines', element: <Medicines user={user} /> },
    { path: '/supplies', element: <Supplies user={user} /> },
    { path: '/vendors', element: <Vendors user={user} /> },
    { path: '/orders', element: <Orders user={user} /> },
    { path: '/expiry-logs', element: <ExpiryLogs user={user} /> },
    { path: '/reports', element: <Reports user={user} /> },
    { path: '/profile', element: <Profile user={user} onLogout={logout} /> },
  ];

  return (
    <div className="d-flex">
      <Sidebar items={[]} user={user} onLogout={logout} isOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? '250px' : '0' }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              {ownerRoutes.map((route) => (
                <Route key={route.path} path={route.path} element={route.element} />
              ))}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
