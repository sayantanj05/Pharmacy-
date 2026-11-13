import { Link, useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaBars } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const titles = {
  '/': 'Dashboard',
  '/medicines': 'Medicines',
  '/cart': 'My Cart',
  '/orders': 'My Orders',
  '/notifications': 'Notifications',
  '/profile': 'Profile',
};

const Header = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const title = titles[window.location.pathname] || 'Customer Portal';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header bg-white shadow-sm py-3 px-4 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button className="btn btn-link text-dark me-3 p-0" onClick={onToggleSidebar} aria-label="Toggle sidebar">
          <FaBars size={18} />
        </button>
        <h5 className="m-0 d-none d-md-block">{title}</h5>
      </div>
      <div className="d-flex align-items-center gap-3">
        <Link to="/notifications" className="btn btn-link text-dark p-0 position-relative" aria-label="Notifications">
          <FaBell size={20} />
        </Link>
        <span className="text-muted d-none d-md-block">{user?.name}</span>
        <FaUserCircle size={28} className="text-primary" />
        <button className="btn btn-sm btn-outline-danger" onClick={handleLogout} title="Logout">
          <FaSignOutAlt className="me-1" /> Logout
        </button>
      </div>
    </header>
  );
};

export default Header;