import { useEffect, useState } from 'react';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import api from '../services/api';
import MedicineCard from '../components/MedicineCard';

const Medicines = () => {
  const [medicines, setMedicines] = useState([]);
  const [shops, setShops] = useState([]);
  const [shopId, setShopId] = useState('');
  const [search, setSearch] = useState('');
  const [medicineType, setMedicineType] = useState('');
  const [medicineSystem, setMedicineSystem] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState('');

  const [alternativesFor, setAlternativesFor] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [altLoading, setAltLoading] = useState(false);

  useEffect(() => {
    api
      .get('/medicines/shops')
      .then((res) => setShops(res.data.data.shops || []))
      .catch(() => setShops([]));
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const res = await api.get('/medicines', {
          params: {
            shopId: shopId || undefined,
            search: search || undefined,
            medicineType: medicineType || undefined,
            medicineSystem: medicineSystem || undefined,
            inStock: inStockOnly ? 'true' : undefined,
          },
        });
        if (active) setMedicines(res.data.data.medicines || []);
      } catch (error) {
        console.error('Error fetching medicines:', error);
      } finally {
        if (active) setLoading(false);
      }
    };

    const timer = setTimeout(load, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [shopId, search, medicineType, medicineSystem, inStockOnly]);

  const addToCart = async (medicine) => {
    setFeedback('');
    try {
      await api.post('/cart', { medicineId: medicine._id, quantity: 1 });
      setFeedback(`${medicine.name} added to cart.`);
    } catch (error) {
      setFeedback(error.response?.data?.message || 'Could not add to cart.');
    }
  };

  const showAlternatives = async (medicine) => {
    setAlternativesFor(medicine);
    setAlternatives([]);
    setAltLoading(true);
    try {
      const res = await api.get('/alternatives', { params: { medicineId: medicine._id } });
      setAlternatives(res.data.data.alternatives || []);
    } catch (error) {
      setAlternatives([]);
    } finally {
      setAltLoading(false);
    }
  };

  return (
    <div className="p-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Medicines</h2>
      </div>

      {feedback && <div className="alert alert-info py-2">{feedback}</div>}

      <div className="card p-4 mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Search</label>
            <div className="input-group">
              <span className="input-group-text"><FaSearch /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <label className="form-label">Shop</label>
            <select className="form-select" value={shopId} onChange={(e) => setShopId(e.target.value)}>
              <option value="">All shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>{shop.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Type</label>
            <select className="form-select" value={medicineType} onChange={(e) => setMedicineType(e.target.value)}>
              <option value="">All types</option>
              <option>Tablet</option>
              <option>Capsule</option>
              <option>Syrup</option>
              <option>Suspension</option>
              <option>Sachet</option>
              <option>Cream</option>
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">System</label>
            <select className="form-select" value={medicineSystem} onChange={(e) => setMedicineSystem(e.target.value)}>
              <option value="">All systems</option>
              <option>Allopathy</option>
              <option>Homeopathy</option>
              <option>Ayurvedic</option>
            </select>
          </div>
          <div className="col-md-3">
            <div className="form-check mt-2">
              <input
                className="form-check-input"
                type="checkbox"
                id="inStockOnly"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="inStockOnly">In stock only</label>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-center mt-5">Loading...</div>
      ) : medicines.length === 0 ? (
        <div className="table-container text-center py-5">
          <p className="text-muted mb-0">No medicines match your search.</p>
        </div>
      ) : (
        <div className="medicine-grid">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine._id}
              medicine={medicine}
              onAddToCart={addToCart}
              onShowAlternatives={showAlternatives}
            />
          ))}
        </div>
      )}

      {alternativesFor && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Alternatives for {alternativesFor.name}</h5>
                <button type="button" className="btn-close" onClick={() => setAlternativesFor(null)} />
              </div>
              <div className="modal-body">
                {altLoading ? (
                  <div className="text-center py-3">Loading alternatives...</div>
                ) : alternatives.length === 0 ? (
                  <div className="alert alert-warning mb-0">
                    No alternatives available right now. Please check back later.
                  </div>
                ) : (
                  <div className="list-group">
                    {alternatives.map((alt) => (
                      <div key={alt._id} className="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                          <div className="fw-semibold">{alt.name}</div>
                          <div className="small text-muted">
                            {alt.medicineType} · {alt.medicineSystem} · ₹{alt.price} · Stock: {alt.stock}
                          </div>
                          <div className="small text-primary">{alt.reason}</div>
                        </div>
                        <button className="btn btn-sm btn-primary" onClick={() => addToCart(alt)}>
                          <FaShoppingCart className="me-1" /> Add
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setAlternativesFor(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Medicines;