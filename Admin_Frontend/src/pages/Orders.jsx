import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`${API_URL}/orders`, { headers });
        setOrders(res.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.post(`${API_URL}/orders/${orderId}/cancel`, {}, { headers });
      setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Orders</h2>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Date</th>
                {(user.role === 'customer' || user.role === 'shop_owner') && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName || order.customerId}</td>
                  <td>${order.totalAmount}</td>
                  <td><span className={`badge bg-${order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : 'warning'}`}>{order.status}</span></td>
                  <td>{order.paymentStatus}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  {(user.role === 'customer' || user.role === 'shop_owner') && order.status !== 'cancelled' && (
                    <td>
                      {user.role === 'customer' && (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => handleCancel(order._id)}>Cancel</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Orders;
