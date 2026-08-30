import { FaBars } from 'react-icons/fa';

const Header = ({ user, onToggleSidebar }) => {
  return (
    <header className="bg-white shadow-sm py-3 px-4" style={{ borderBottom: '1px solid #E5E7EB' }}>
      <div className="d-flex justify-content-between align-items-center">
        <button 
          className="btn btn-link text-dark p-0" 
          onClick={onToggleSidebar}
          style={{ transition: 'all 0.2s ease' }}
          onMouseEnter={(e) => e.target.style.color = '#10B981'}
          onMouseLeave={(e) => e.target.style.color = '#111827'}
        >
          <FaBars size={24} />
        </button>
        <div className="d-flex align-items-center">
          <span className="me-3" style={{ color: '#6B7280', fontWeight: '500' }}>Welcome, {user?.name}</span>
          <span 
            className="badge" 
            style={{ 
              backgroundColor: '#10B981', 
              fontWeight: '500',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '12px'
            }}
          >
            {user?.role?.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Header;
