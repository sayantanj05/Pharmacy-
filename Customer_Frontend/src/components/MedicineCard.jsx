import { FaShoppingCart, FaInfoCircle, FaStore } from 'react-icons/fa';

const PLACEHOLDER_IMAGE = '/medicine-placeholder.svg';

const MedicineCard = ({ medicine, onAddToCart, onShowAlternatives }) => {
  const outOfStock = medicine.stock <= 0;
  const noShop = !medicine.shopId && !medicine.shop;
  const shopName = medicine.shopId?.name || medicine.shop?.name || 'Shop not assigned';

  return (
    <div className="card h-100">
      <img
        src={medicine.imageUrl || PLACEHOLDER_IMAGE}
        alt={medicine.name}
        className="medicine-card-img"
        loading="lazy"
        onError={(e) => {
          const img = e.currentTarget;
          if (img.dataset.fallbackApplied === 'true') return;
          img.dataset.fallbackApplied = 'true';
          img.src = PLACEHOLDER_IMAGE;
        }}
      />
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start">
          <h6 className="card-title mb-1">{medicine.name}</h6>
          <span className={`badge ${outOfStock ? 'bg-danger' : 'bg-success'}`}>
            {outOfStock ? 'Out of stock' : `Stock: ${medicine.stock}`}
          </span>
        </div>
        <div className="small text-muted mb-2 d-flex align-items-center gap-1">
          <FaStore /> {shopName}
        </div>
        <div className="text-muted small mb-2">
          {medicine.medicineType} · {medicine.medicineSystem}
        </div>
        <div className="mb-2">
          <span className="fw-bold text-primary">₹{medicine.price}</span>
          {medicine.discountPrice ? (
            <span className="text-muted text-decoration-line-through ms-2">₹{medicine.discountPrice}</span>
          ) : null}
        </div>
        {medicine.prescriptionRequired ? (
          <div className="small text-warning mb-2">Prescription required</div>
        ) : null}
        <div className="mt-auto d-flex gap-2">
          <button
            className="btn btn-sm btn-primary flex-grow-1"
            onClick={() => onAddToCart(medicine)}
            disabled={outOfStock || noShop}
          >
            <FaShoppingCart className="me-1" /> {noShop ? 'Not orderable' : outOfStock ? 'Unavailable' : 'Add to Cart'}
          </button>
          {outOfStock ? (
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => onShowAlternatives(medicine)}
              title="Show alternatives"
            >
              <FaInfoCircle />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;