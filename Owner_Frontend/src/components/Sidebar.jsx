import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaPills, FaBoxes, FaTruck, FaShoppingCart, FaCalendarTimes, FaChartBar, FaUser, FaBars, FaSignOutAlt } from 'react-icons/fa';

const API_URL = 'http://192.168.31.187:5000/api';

const Sidebar = ({ user, onLogout, isOpen, onToggle }) => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: FaTachometerAlt },
    { path: '/medicines', label: 'Medicines', icon: FaPills },
    { path: '/supplies', label: 'Supplies', icon: FaBoxes },
    { path: '/vendors', label: 'Vendors', icon: FaTruck },
    { path: '/orders', label: 'Orders', icon: FaShoppingCart },
    { path: '/expiry-logs', label: 'Expiry Logs', icon: FaCalendarTimes },
    { path: '/reports', label: 'Reports', icon: FaChartBar },
    { path: '/profile', label: 'Profile', icon: FaUser },
  ];

  return (
    <div className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="p-3 border-bottom border-secondary">
        <div className="d-flex align-items-center justify-content-between">
          {isOpen && <h5 className="mb-0 text-white">Pharmacy Owner</h5>}
          <button
            className="btn btn-link text-white p-0"
            onClick={onToggle}
            style={{ marginLeft: isOpen ? 'auto' : '0' }}
          >
            <FaBars />
          </button>
        </div>
      </div>
      <nav className="mt-3">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <item.icon className="me-2" />
            {isOpen && item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto p-3 border-top border-secondary" style={{ position: 'absolute', bottom: 0, width: '100%' }}>
        <button className="nav-link text-danger" onClick={handleLogout}>
          <FaSignOutAlt className="me-2" />
          {isOpen && 'Logout'}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
