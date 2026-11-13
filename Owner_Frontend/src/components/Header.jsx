import { FaBell, FaUserCircle } from 'react-icons/fa';

const Header = ({ user, onToggleSidebar }) => {
  return (
    <header className="header bg-white shadow-sm py-3 px-4 d-flex align-items-center justify-content-between">
      <div className="d-flex align-items-center">
        <button className="btn btn-link text-dark me-3 p-0" onClick={onToggleSidebar}>
          <FaBell size={20} />
        </button>
        <h5 className="m-0 d-none d-md-block">Shop Owner Portal</h5>
      </div>
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted d-none d-md-block">{user?.name} ({user?.role})</span>
        <FaUserCircle size={28} className="text-primary" />
      </div>
    </header>
  );
};

export default Header;
