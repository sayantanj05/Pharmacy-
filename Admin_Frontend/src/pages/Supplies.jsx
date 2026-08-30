import { useState, useEffect } from 'react';
import axios from 'axios';
import { FaDownload } from 'react-icons/fa';

const API_URL = 'http://localhost:5000/api';

const Supplies = ({ user }) => {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupplies = async () => {
      try {
        const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
        const res = await axios.get(`${API_URL}/supplies`, { headers });
        setSupplies(res.data.supplies || []);
      } catch (error) {
        console.error('Error fetching supplies:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSupplies();
  }, []);

  const downloadPDF = async (supplyId) => {
    const headers = { Authorization: `Bearer ${localStorage.getItem('token')}` };
    try {
      const res = await axios.get(`${API_URL}/supplies/${supplyId}/pdf`, { headers, responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `supply-${supplyId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading PDF:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Supplies</h2>
      <div className="table-container">
        <div className="table-responsive">
          <table className="table table-hover">
            <thead>
              <tr>
                <th>Supply ID</th>
                <th>Vendor</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supplies.map((supply) => (
                <tr key={supply._id}>
                  <td>{supply._id}</td>
                  <td>{supply.vendorId?.name || 'N/A'}</td>
                  <td>{supply.items?.length || 0} items</td>
                  <td>${supply.totalAmount}</td>
                  <td>{new Date(supply.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => downloadPDF(supply._id)}>
                      <FaDownload className="me-1" /> PDF
                    </button>
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

export default Supplies;
