import { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import useRefreshOnFocus from '../hooks/useRefreshOnFocus';

const API_URL = 'http://192.168.31.187:5000/api';

const Orders = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const refreshToken = useRefreshOnFocus();

  const fetchOrders = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const shopFilter = user?.shopId ? `?shopId=${user.shopId}` : '';
      const res = await axios.get(`${API_URL}/orders${shopFilter ? '?shopId=' + user.shopId : ''}`, { headers });
      const payload = res.data.data?.orders || res.data.orders || [];
      setOrders(payload);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOrders(); }, [user, refreshToken]);

  const updateStatus = async (orderId, status) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.put(`${API_URL}/orders/${orderId}`, { status }, { headers });
      fetchOrders();
    } catch (error) {
      console.error('Error updating order:', error);
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id}>
                  <td>{order._id}</td>
                  <td>{order.customerName || order.customerId}</td>
                  <td>${order.totalAmount}</td>
                  <td>
                    <span className={`badge bg-${order.status === 'cancelled' ? 'danger' : order.status === 'delivered' ? 'success' : 'warning'}`}>
                      {order.status}
                    </span>
                  </td>
                  <td>{order.paymentStatus}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      onChange={(e) => updateStatus(order._id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
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
