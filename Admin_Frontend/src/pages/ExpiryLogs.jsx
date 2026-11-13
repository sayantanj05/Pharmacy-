import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const getExpiryStatus = (expiryDate) => {
  if (!expiryDate) return { labelText: 'N/A', bgColor: '#6b7280', textColor: '#ffffff' };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const exp = new Date(expiryDate);
  exp.setHours(0, 0, 0, 0);

  const diffTime = exp.getTime() - today.getTime();
  const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return {
      labelText: 'Expired',
      bgColor: '#ef4444', // Red
      textColor: '#ffffff',
    };
  } else if (daysLeft === 1 || daysLeft === 2) {
    return {
      labelText: `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} left`,
      bgColor: '#f97316', // Deep Orange
      textColor: '#ffffff',
    };
  } else if (daysLeft >= 3 && daysLeft <= 5) {
    return {
      labelText: `${daysLeft} days left`,
      bgColor: '#f59e0b', // Amber/Orange
      textColor: '#ffffff',
    };
  } else if (daysLeft >= 6 && daysLeft <= 10) {
    return {
      labelText: `${daysLeft} days left`,
      bgColor: '#eab308', // Yellow
      textColor: '#000000',
    };
  } else if (daysLeft >= 11 && daysLeft <= 20) {
    return {
      labelText: `${daysLeft} days left`,
      bgColor: '#0ea5e9', // Sky Blue
      textColor: '#ffffff',
    };
  } else if (daysLeft >= 21 && daysLeft <= 31) {
    return {
      labelText: (daysLeft >= 28 && daysLeft <= 31) ? '1 month left' : `${daysLeft} days left`,
      bgColor: '#8b5cf6', // Purple
      textColor: '#ffffff',
    };
  } else {
    return {
      labelText: `${daysLeft} days left`,
      bgColor: '#10b981', // Emerald Green
      textColor: '#ffffff',
    };
  }
};

const MedicineImage = ({ src, alt }) => {
  const [hasError, setHasError] = useState(false);

  if (!src || hasError) {
    return (
      <div
        style={{
          width: '65px',
          height: '65px',
          backgroundColor: '#f3f4f6',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '11px',
          color: '#6b7280',
          fontWeight: '600',
          flexShrink: 0,
          border: '1px solid #e5e7eb'
        }}
      >
        No Img
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: '65px',
        height: '65px',
        objectFit: 'cover',
        borderRadius: '10px',
        flexShrink: 0,
        boxShadow: '0 2px 6px rgba(0,0,0,0.08)',
        border: '1px solid #f0f0f0'
      }}
      onError={() => setHasError(true)}
    />
  );
};

const ExpiryLogs = ({ user }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`${API_URL}/expiry-logs`, { headers });
        const data = res.data.data?.logs || res.data.logs || res.data.data?.expiryLogs || res.data.expiryLogs || [];
        setLogs(data);
      } catch (error) {
        console.error('Error fetching expiry logs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Expiry Logs</h2>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Expiry Date</th>
                <th>Quantity</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => {
                const med = log.medicineId || log.medicine || log;
                const medicineName = med.name || log.medicineName || 'N/A';
                const imageUrl = med.imageUrl || log.imageUrl;
                const expiryDate = log.expiryDate || med.expiryDate;
                const quantity = log.quantity ?? med.stock ?? log.quantityExpired ?? 0;
                const statusInfo = getExpiryStatus(expiryDate);

                return (
                  <tr key={log._id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <MedicineImage src={imageUrl} alt={medicineName} />
                        <span className="fw-semibold text-dark">{medicineName}</span>
                      </div>
                    </td>
                    <td>{expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}</td>
                    <td>{quantity}</td>
                    <td>
                      <span
                        className="badge px-3 py-2 text-wrap"
                        style={{
                          backgroundColor: statusInfo.bgColor,
                          color: statusInfo.textColor,
                          fontSize: '13px',
                          fontWeight: '600',
                          borderRadius: '6px'
                        }}
                      >
                        {statusInfo.labelText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpiryLogs;
