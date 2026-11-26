import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaPills, FaShoppingCart, FaTruck, FaBoxes, FaCalendarTimes, FaChartBar, FaBell, FaShoppingBasket, FaUsers, FaStore, FaUser, FaSignOutAlt, FaClipboardList } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Sidebar.css';

const iconMap = {
  FaTachometerAlt,
  FaPills,
  FaShoppingCart,
  FaTruck,
  FaBoxes,
  FaCalendarTimes,
  FaChartBar,
  FaBell,
  FaShoppingBasket,
  FaUsers,
  FaStore,
  FaUser,
  FaSignOutAlt,
  FaClipboardList,
};

const Sidebar = ({ items, user, onLogout, isOpen }) => {
  return (
    <motion.div
      className={`sidebar ${isOpen ? 'open' : 'collapsed'}`}
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="p-4" style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <h4 className="text-white mb-2" style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' }}>Pharmacy Admin</h4>
        <p className="small mb-0" style={{ color: '#9CA3AF', fontWeight: '500', fontSize: '11px', letterSpacing: '1px' }}>{user?.role?.replace('_', ' ').toUpperCase()}</p>
      </div>
      <nav className="nav flex-column px-2">
        {items.map((item) => {
          const IconComponent = iconMap[item.icon];
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              {IconComponent && <IconComponent className="me-2" />}
              {item.label}
            </NavLink>
          );
        })}
        <button className="nav-link btn btn-link text-start p-0 mt-3" onClick={onLogout}>
          <FaSignOutAlt className="me-2" />
          Logout
        </button>
      </nav>
    </motion.div>
  );
};

export default Sidebar;
