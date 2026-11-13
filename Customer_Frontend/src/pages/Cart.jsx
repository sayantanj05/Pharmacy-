import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus } from 'react-icons/fa';
import api from '../services/api';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [placing, setPlacing] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const fetchCart = async () => {
    try {
      const res = await api.get('/cart');
      setCartItems(res.data.data.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const updateQuantity = async (item, quantity) => {
    if (quantity < 1) return;
    try {
      await api.put(`/cart/${item._id}`, { quantity });
      fetchCart();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not update cart.');
    }
  };

  const removeItem = async (id) => {
    try {
      await api.delete(`/cart/${id}`);
      fetchCart();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not remove item.');
    }
  };

  const total = cartItems.reduce((sum, item) => {
    const price = item.medicineId?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  const placeOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    setPlacing(true);
    try {
      const items = cartItems.map((item) => ({
        medicineId: item.medicineId._id,
        quantity: item.quantity,
      }));
      await api.post('/orders', { items, shippingAddress, paymentMethod });
      navigate('/orders');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Could not place order.');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="p-1">
        <h2 className="mb-4">My Cart</h2>
        <div className="table-container text-center py-5">
          <p className="text-muted mb-3">Your cart is empty.</p>
          <Link to="/medicines" className="btn btn-primary">Browse medicines</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1">
      <h2 className="mb-4">My Cart</h2>
      {message && <div className="alert alert-danger py-2">{message}</div>}
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="table-container">
            <div className="table-responsive">
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Price</th>
                    <th>Qty</th>
                    <th>Total</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {cartItems.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <div className="fw-semibold">{item.medicineId?.name || 'Medicine'}</div>
                        <div className="small text-muted">{item.medicineId?.medicineType}</div>
                      </td>
                      <td>₹{item.medicineId?.price || 0}</td>
                      <td>
                        <div className="d-flex align-items-center gap-2">
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item, item.quantity - 1)}
                          >
                            <FaMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => updateQuantity(item, item.quantity + 1)}
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </td>
                      <td>₹{(item.medicineId?.price || 0) * item.quantity}</td>
                      <td>
                        <button className="btn btn-sm btn-outline-danger" onClick={() => removeItem(item._id)}>
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-5">
          <form className="table-container" onSubmit={placeOrder}>
            <h5 className="mb-3">Checkout</h5>
            <div className="mb-3">
              <label className="form-label">Shipping address</label>
              <textarea
                className="form-control"
                rows="3"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Payment method</label>
              <select
                className="form-select"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <option value="cod">Cash on Delivery</option>
                <option value="upi">UPI</option>
                <option value="card">Card</option>
              </select>
            </div>
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Total</span>
              <span>₹{total}</span>
            </div>
            <button type="submit" className="btn btn-primary w-100" disabled={placing}>
              {placing ? 'Placing order...' : 'Place order'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;