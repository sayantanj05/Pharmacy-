import { NavLink } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaPills,
  FaShoppingCart,
  FaClipboardList,
  FaBell,
  FaUser,
} from 'react-icons/fa';

const links = [
  { to: '/', label: 'Dashboard', icon: FaTachometerAlt, end: true },
  { to: '/medicines', label: 'Medicines', icon: FaPills },
  { to: '/cart', label: 'Cart', icon: FaShoppingCart },
  { to: '/orders', label: 'Orders', icon: FaClipboardList },
  { to: '/notifications', label: 'Notifications', icon: FaBell },
  { to: '/profile', label: 'Profile', icon: FaUser },
];

const Sidebar = ({ isOpen }) => {
  return (
    <aside className={`sidebar ${isOpen ? '' : 'collapsed'}`}>
      <div className="brand">Pharmacy Customer</div>
      <nav className="mt-3">
        {links.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="nav-link">
            <Icon /> <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;