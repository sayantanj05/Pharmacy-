import { FaEdit, FaTrash, FaPills, FaCapsules, FaTint, FaLeaf, FaPrescriptionBottleAlt, FaBox, FaIndustry, FaCalendarAlt, FaWarehouse, FaTag, FaRupeeSign } from 'react-icons/fa';

const MedicineCard = ({ medicine, onEdit, onDelete }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Tablet': return <FaPills className="medicine-card__detail-icon" />;
      case 'Capsule': return <FaCapsules className="medicine-card__detail-icon" />;
      case 'Syrup':
      case 'Suspension': return <FaTint className="medicine-card__detail-icon" />;
      case 'Sachet': return <FaBox className="medicine-card__detail-icon" />;
      case 'Cream': return <FaPrescriptionBottleAlt className="medicine-card__detail-icon" />;
      default: return <FaPills className="medicine-card__detail-icon" />;
    }
  };

  const getSystemIcon = (system) => {
    switch (system) {
      case 'Allopathy': return <FaPills className="medicine-card__detail-icon" />;
      case 'Homeopathy': return <FaLeaf className="medicine-card__detail-icon" />;
      case 'Ayurvedic': return <FaLeaf className="medicine-card__detail-icon" />;
      default: return <FaPills className="medicine-card__detail-icon" />;
    }
  };

  const isLowStock = medicine.stock <= (medicine.minStockLevel || 10);
  const stockClass = isLowStock ? 'medicine-card__detail-value--stock-low' : 'medicine-card__detail-value--stock-ok';

  const renderImage = () => {
    if (medicine.imageUrl) {
      return (
        <img
          src={medicine.imageUrl}
          alt={medicine.name}
          className="medicine-card__image"
          onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
        />
      );
    }
    return (
      <>
        <img src="" alt="" className="medicine-card__image" style={{ display: 'none' }} />
        <div className="medicine-card__image-placeholder">
          <FaPills />
        </div>
      </>
    );
  };

  return (
    <article className="medicine-card">
      {renderImage()}
      <div className="medicine-card__content">
        <header className="medicine-card__header">
          <h3 className="medicine-card__name">{medicine.name}</h3>
          <span className="medicine-card__code">{medicine.codeNumber}</span>
        </header>

        <div className="medicine-card__badges">
          <span className="medicine-card__badge medicine-card__badge--type">
            {getTypeIcon(medicine.medicineType)}
            {medicine.medicineType}
          </span>
          <span className="medicine-card__badge medicine-card__badge--system">
            {getSystemIcon(medicine.medicineSystem)}
            {medicine.medicineSystem}
          </span>
          {medicine.prescriptionRequired && (
            <span className="medicine-card__badge medicine-card__badge--prescription">
              <FaPrescriptionBottleAlt style={{ fontSize: '0.625rem', marginRight: '0.25rem' }} />
              Rx Required
            </span>
          )}
        </div>

        <div className="medicine-card__details">
          {medicine.category && (
            <div className="medicine-card__detail">
              <FaTag className="medicine-card__detail-icon" />
              <span className="medicine-card__detail-label">Category</span>
              <span className="medicine-card__detail-value">{medicine.category}</span>
            </div>
          )}
          {medicine.manufacturer && (
            <div className="medicine-card__detail">
              <FaIndustry className="medicine-card__detail-icon" />
              <span className="medicine-card__detail-label">Mfr</span>
              <span className="medicine-card__detail-value">{medicine.manufacturer}</span>
            </div>
          )}
          {medicine.batchNumber && (
            <div className="medicine-card__detail">
              <FaBox className="medicine-card__detail-icon" />
              <span className="medicine-card__detail-label">Batch</span>
              <span className="medicine-card__detail-value">{medicine.batchNumber}</span>
            </div>
          )}
          {medicine.expiryDate && (
            <div className="medicine-card__detail">
              <FaCalendarAlt className="medicine-card__detail-icon" />
              <span className="medicine-card__detail-label">Expiry</span>
              <span className="medicine-card__detail-value">
                {new Date(medicine.expiryDate).toLocaleDateString()}
              </span>
            </div>
          )}
          <div className="medicine-card__detail">
            <FaWarehouse className="medicine-card__detail-icon" />
            <span className="medicine-card__detail-label">Stock</span>
            <span className={`medicine-card__detail-value ${stockClass}`}>
              {medicine.stock} {medicine.quantityUnit || 'units'}
              {medicine.minStockLevel && (
                <span className="text-muted" style={{ fontSize: '0.75rem', marginLeft: '0.25rem', fontWeight: 400 }}>
                  (min: {medicine.minStockLevel})
                </span>
              )}
            </span>
          </div>
          <div className="medicine-card__detail">
            <FaRupeeSign className="medicine-card__detail-icon" />
            <span className="medicine-card__detail-label">Price</span>
            <span className="medicine-card__detail-value medicine-card__detail-value--price">
              ₹{Number(medicine.price).toFixed(2)}
              {medicine.discountPrice && Number(medicine.discountPrice) < Number(medicine.price) && (
                <span style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: 400, 
                  color: '#dc3545', 
                  marginLeft: '0.5rem',
                  textDecoration: 'line-through'
                }}>
                  ₹{Number(medicine.price).toFixed(2)}
                </span>
              )}
            </span>
          </div>
        </div>

        <footer className="medicine-card__footer">
          <button
            className="medicine-card__action-btn medicine-card__action-btn--edit"
            onClick={() => onEdit(medicine)}
            title="Edit medicine"
            aria-label={`Edit ${medicine.name}`}
          >
            <FaEdit style={{ fontSize: '0.875rem' }} />
          </button>
          <button
            className="medicine-card__action-btn medicine-card__action-btn--delete"
            onClick={() => onDelete(medicine._id)}
            title="Delete medicine"
            aria-label={`Delete ${medicine.name}`}
          >
            <FaTrash style={{ fontSize: '0.875rem' }} />
          </button>
        </footer>
      </div>
    </article>
  );
};

export default MedicineCard;