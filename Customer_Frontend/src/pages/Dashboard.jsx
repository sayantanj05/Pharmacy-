import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FaClipboardList,
  FaClock,
  FaShoppingCart,
  FaBell,
  FaPills,
} from 'react-icons/fa';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const [ordersRes, cartRes, notifRes] = await Promise.all([
          api.get('/orders'),
          api.get('/cart'),
          api.get('/notifications'),
        ]);
        if (!active) return;
        setOrders(ordersRes.data.data.orders || []);
        setCartCount((cartRes.data.data.cartItems || []).length);
        setUnread((notifRes.data.data.notifications || []).filter((n) => !n.isRead).length);
      } catch (error) {
        console.error('Dashboard load failed:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, []);

  const pending = orders.filter((o) => o.status === 'pending').length;
  const delivered = orders.filter((o) => o.status === 'delivered').length;

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="p-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1">Welcome, {user?.name}</h2>
          <p className="text-muted mb-0">Here is your pharmacy activity.</p>
        </div>
        <Link to="/medicines" className="btn btn-primary">
          <FaPills className="me-2" /> Browse Medicines
        </Link>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <div className="stat-card p-3">
            <FaClipboardList size={22} className="mb-2" />
            <div className="fs-4 fw-bold">{orders.length}</div>
            <div>Total Orders</div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card warning p-3">
            <FaClock size={22} className="mb-2" />
            <div className="fs-4 fw-bold">{pending}</div>
            <div>Pending</div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card success p-3">
            <FaClipboardList size={22} className="mb-2" />
            <div className="fs-4 fw-bold">{delivered}</div>
            <div>Delivered</div>
          </div>
        </div>
        <div className="col-md-3 col-sm-6">
          <div className="stat-card info p-3">
            <FaShoppingCart size={22} className="mb-2" />
            <div className="fs-4 fw-bold">{cartCount}</div>
            <div>Cart Items</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="table-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Recent Orders</h5>
              <Link to="/orders" className="btn btn-sm btn-outline-primary">View all</Link>
            </div>
            {orders.length === 0 ? (
              <p className="text-muted mb-0">No orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id.toString().slice(-6)}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        <td>₹{order.totalAmount}</td>
                        <td><span className="badge bg-secondary">{order.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="table-container h-100">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0"><FaBell className="me-2" />Notifications</h5>
              <span className="badge bg-danger">{unread} unread</span>
            </div>
            <p className="text-muted mb-0">
              You have {unread} unread notification(s).
              <br />
              <Link to="/notifications">Open notification center</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;