import { useEffect, useState } from 'react';
import api from '../services/api';

const statusBadge = (status) => {
  const map = {
    pending: 'bg-warning',
    confirmed: 'bg-info',
    processing: 'bg-info',
    shipped: 'bg-primary',
    delivered: 'bg-success',
    cancelled: 'bg-danger',
  };
  return map[status] || 'bg-secondary';
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const cancelOrder = async (id) => {
    setMessage('');
    try {
      await api.post(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      fetchOrders();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not cancel order.');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="p-1">
      <h2 className="mb-4">My Orders</h2>
      {message && <div className="alert alert-danger py-2">{message}</div>}
      <div className="table-container">
        {orders.length === 0 ? (
          <p className="text-muted mb-0">You have not placed any orders yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Shop</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id.toString().slice(-6)}</td>
                    <td>{order.shopId?.name || '-'}</td>
                    <td>{new Date(order.createdAt).toLocaleString()}</td>
                    <td>
                      {(order.items || [])
                        .map((item) => `${item.medicineName || 'Item'} x${item.quantity}`)
                        .join(', ') || '-'}
                    </td>
                    <td>₹{order.totalAmount}</td>
                    <td>{order.paymentStatus}</td>
                    <td><span className={`badge ${statusBadge(order.status)}`}>{order.status}</span></td>
                    <td>
                      {order.status !== 'cancelled' && order.status !== 'delivered' ? (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => cancelOrder(order._id)}>
                          Cancel
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;