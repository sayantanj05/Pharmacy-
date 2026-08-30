import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Cart = ({ user }) => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCart = async () => {
    try {
      const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
      const res = await axios.get(`${API_URL}/cart`, { headers });
      setCartItems(res.data.cartItems || []);
    } catch (error) {
      console.error('Error fetching cart:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const removeFromCart = async (id) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      await axios.delete(`${API_URL}/cart/${id}`, { headers });
      setCartItems(cartItems.filter(item => item._id !== id));
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const checkout = async () => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const items = cartItems.map(item => ({
        medicineId: item.medicineId._id,
        quantity: item.quantity,
        shopId: item.medicineId.shopId
      }));
      await axios.post(`${API_URL}/orders`, { items }, { headers });
      setCartItems([]);
      alert('Order placed successfully!');
    } catch (error) {
      console.error('Error placing order:', error);
      alert(error.response?.data?.message || 'Failed to place order');
    }
  };

  const total = cartItems.reduce((sum, item) => sum + (item.medicineId?.price || 0) * item.quantity, 0);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <div className="alert alert-info">Your cart is empty</div>
      ) : (
        <div className="table-container">
          <div className="table-responsive">
            <table className="table table-hover">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => (
                  <tr key={item._id}>
                    <td>{item.medicineId?.name || 'Unknown'}</td>
                    <td>${item.medicineId?.price || 0}</td>
                    <td>{item.quantity}</td>
                    <td>${(item.medicineId?.price || 0) * item.quantity}</td>
                    <td>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => removeFromCart(item._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>Total: ${total.toFixed(2)}</h4>
            <button className="btn btn-success btn-lg" onClick={checkout}>
              Proceed to Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
