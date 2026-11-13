import MedicineCard from './MedicineCard';
import './MedicineCards.css';

const MedicineCardsContainer = ({ medicines, onEdit, onDelete, emptyMessage = 'No medicines found' }) => {
  if (!medicines || medicines.length === 0) {
    return (
      <div className="medicine-cards__empty">
        <div className="medicine-cards__empty-icon">💊</div>
        <h4 className="medicine-cards__empty-title">No Medicines Found</h4>
        <p className="medicine-cards__empty-text">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="medicine-cards-container">
      <div className="medicine-cards-grid" role="list" aria-label="Medicines list">
        {medicines.map((medicine) => (
          <MedicineCard
            key={medicine._id}
            medicine={medicine}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default MedicineCardsContainer;