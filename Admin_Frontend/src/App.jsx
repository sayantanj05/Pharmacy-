import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import './index.css';
import api from './services/api';

// Components
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
import Users from './pages/Users';
import Shops from './pages/Shops';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
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

  const getRoutes = () => {
    const commonRoutes = [
      { path: '/dashboard', element: <Dashboard user={user} /> },
      { path: '/medicines', element: <Medicines user={user} /> },
      { path: '/orders', element: <Orders user={user} /> },
      { path: '/vendors', element: <Vendors user={user} /> },
      { path: '/supplies', element: <Supplies user={user} /> },
      { path: '/expiry-logs', element: <ExpiryLogs user={user} /> },
      { path: '/reports', element: <Reports user={user} /> },
      { path: '/procurement', element: <Procurement user={user} /> },
      { path: '/notifications', element: <Notifications user={user} /> },
      { path: '/cart', element: <Cart user={user} /> },
      { path: '/profile', element: <Profile user={user} onLogout={logout} /> },
    ];

    const adminRoutes = [
      { path: '/users', element: <Users user={user} /> },
      { path: '/shops', element: <Shops user={user} /> },
    ];

    const allRoutes = user.role === 'super_admin' ? [...commonRoutes, ...adminRoutes] : commonRoutes;

    return allRoutes.map((route) => (
      <Route key={route.path} path={route.path} element={route.element} />
    ));
  };

  const getSidebarItems = () => {
    const items = [
      { path: '/dashboard', label: 'Dashboard', icon: 'FaTachometerAlt' },
      { path: '/medicines', label: 'Medicines', icon: 'FaPills' },
      { path: '/orders', label: 'Orders', icon: 'FaShoppingCart' },
      { path: '/vendors', label: 'Vendors', icon: 'FaTruck' },
      { path: '/supplies', label: 'Supplies', icon: 'FaBoxes' },
      { path: '/expiry-logs', label: 'Expiry Logs', icon: 'FaCalendarTimes' },
      { path: '/reports', label: 'Reports', icon: 'FaChartBar' },
      { path: '/procurement', label: 'Procurement', icon: 'FaClipboardList' },
      { path: '/notifications', label: 'Notifications', icon: 'FaBell' },
    ];

    if (user.role === 'customer') {
      items.push({ path: '/cart', label: 'Cart', icon: 'FaShoppingBasket' });
    }

    if (user.role === 'super_admin') {
      items.push({ path: '/users', label: 'Users', icon: 'FaUsers' });
      items.push({ path: '/shops', label: 'Shops', icon: 'FaStore' });
    }

    items.push({ path: '/profile', label: 'Profile', icon: 'FaUser' });
    return items;
  };

  return (
    <div className="d-flex">
      <Sidebar items={getSidebarItems()} user={user} onLogout={logout} isOpen={sidebarOpen} />
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? '250px' : '0' }}>
        <Header user={user} onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <AnimatePresence mode="wait">
            <Routes>
              {getRoutes()}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default App;
