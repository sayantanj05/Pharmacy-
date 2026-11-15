import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaTrash, FaMinus, FaPlus, FaStore, FaExclamationTriangle } from 'react-icons/fa';
import api from '../services/api';

const itemIssue = (item) => {
  const medicine = item.medicineId;
  if (!medicine) {
    return { reason: 'unavailable', label: 'This medicine is no longer available.' };
  }
  if (medicine.isActive === false) {
    return { reason: 'unavailable', label: `${medicine.name} is no longer available.` };
  }
  if (!medicine.shopId && !item.shopId) {
    return { reason: 'no-shop', label: `${medicine.name} is not assigned to a shop yet.` };
  }
  if (medicine.stock < item.quantity) {
    return {
      reason: 'insufficient-stock',
      label:
        medicine.stock === 0
          ? `${medicine.name} is out of stock.`
          : `Only ${medicine.stock} of ${medicine.name} left in stock.`,
    };
  }
  return null;
};

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

  const groups = useMemo(() => {
    const map = new Map();
    cartItems.forEach((item) => {
      const shop = item.shopId || item.medicineId?.shopId || null;
      const key = shop?._id || 'unknown';
      if (!map.has(key)) {
        map.set(key, { shop, items: [], subtotal: 0 });
      }
      const group = map.get(key);
      const issue = itemIssue(item);
      const lineTotal = (item.medicineId?.price || 0) * item.quantity;
      group.items.push({ item, issue });
      if (!issue) group.subtotal += lineTotal;
    });
    return Array.from(map.values());
  }, [cartItems]);

  const blockedItems = useMemo(
    () => cartItems.filter((item) => itemIssue(item)).map((item) => itemIssue(item).label),
    [cartItems]
  );

  const grandTotal = groups.reduce((sum, group) => sum + group.subtotal, 0);

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

  const placeOrder = async (e) => {
    e.preventDefault();
    setMessage('');
    setPlacing(true);
    try {
      const res = await api.post('/orders', {
        useCart: true,
        shippingAddress,
        paymentMethod,
      });
      const count = res.data.data.count || 1;
      navigate('/orders');
      setMessage(`${count} order(s) placed.`);
    } catch (error) {
      const unavailable = error.response?.data?.details?.unavailable;
      if (unavailable?.length) {
        setMessage(
          `${error.response?.data?.message || 'Some items could not be ordered.'} Remove them from the cart and try again.`
        );
      } else {
        setMessage(error.response?.data?.message || 'Could not place order.');
      }
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
      {message && <div className="alert alert-info py-2">{message}</div>}

      <div className="row g-4">
        <div className="col-lg-7">
          {groups.map((group, index) => (
            <div className="table-container mb-3" key={group.shop?._id || index}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0">
                  <FaStore className="me-2 text-primary" />
                  {group.shop?.name || 'Pharmacy'}
                </h6>
                <span className="badge bg-secondary">Subtotal ₹{group.subtotal}</span>
              </div>
              {group.shop?.address?.city ? (
                <p className="small text-muted mb-3">
                  {group.shop.address.street ? `${group.shop.address.street}, ` : ''}
                  {group.shop.address.city}
                  {group.shop.address.state ? `, ${group.shop.address.state}` : ''}
                </p>
              ) : null}
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
                    {group.items.map(({ item, issue }) => (
                      <tr key={item._id} className={issue ? 'table-warning' : undefined}>
                        <td>
                          <div className="fw-semibold">{item.medicineId?.name || 'Medicine'}</div>
                          <div className="small text-muted">{item.medicineId?.medicineType}</div>
                          {issue && (
                            <div className="small text-danger d-flex align-items-center gap-1 mt-1">
                              <FaExclamationTriangle />
                              {issue.label}
                            </div>
                          )}
                        </td>
                        <td>₹{item.medicineId?.price || 0}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => updateQuantity(item, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <FaMinus />
                            </button>
                            <span>{item.quantity}</span>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => updateQuantity(item, item.quantity + 1)}
                              disabled={
                                item.medicineId
                                  ? item.quantity >= (item.medicineId.stock || 0)
                                  : false
                              }
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
          ))}
          <div className="alert alert-info mb-0">
            Items from different shops are split into separate orders at checkout.
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
            <div className="d-flex justify-content-between mb-2">
              <span className="text-muted">Orders to create</span>
              <span>{groups.length}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold mb-3">
              <span>Grand total</span>
              <span>₹{grandTotal}</span>
            </div>
            {blockedItems.length > 0 && (
              <div className="alert alert-warning py-2">
                <FaExclamationTriangle className="me-1" />
                {blockedItems.length} item(s) cannot be ordered. Remove or fix them before checkout.
              </div>
            )}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={placing || blockedItems.length > 0}
            >
              {placing
                ? 'Placing orders...'
                : `Place ${groups.length} order(s)`}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Cart;