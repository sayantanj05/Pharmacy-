import { useEffect, useState } from 'react';
import { FaCheck, FaTrash } from 'react-icons/fa';
import api from '../services/api';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data.data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markRead = async (id) => {
    await api.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  const markAllRead = async () => {
    await api.put('/notifications/read-all');
    fetchNotifications();
  };

  const remove = async (id) => {
    await api.delete(`/notifications/${id}`);
    fetchNotifications();
  };

  if (loading) {
    return <div className="text-center mt-5">Loading...</div>;
  }

  return (
    <div className="p-1">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Notifications</h2>
        {notifications.some((n) => !n.isRead) ? (
          <button className="btn btn-sm btn-outline-primary" onClick={markAllRead}>
            <FaCheck className="me-1" /> Mark all as read
          </button>
        ) : null}
      </div>

      {notifications.length === 0 ? (
        <div className="table-container text-center py-5">
          <p className="text-muted mb-0">No notifications.</p>
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              className={`card p-3 ${n.isRead ? '' : 'border-start border-3 border-primary'}`}
            >
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h6 className="mb-1">{n.title}</h6>
                    <span className="badge bg-secondary">{n.type}</span>
                    {!n.isRead ? <span className="badge bg-primary">New</span> : null}
                  </div>
                  <p className="mb-1 text-muted">{n.message}</p>
                  <small className="text-muted">{new Date(n.createdAt).toLocaleString()}</small>
                </div>
                <div className="d-flex gap-2">
                  {!n.isRead ? (
                    <button className="btn btn-sm btn-outline-success" onClick={() => markRead(n._id)}>
                      <FaCheck />
                    </button>
                  ) : null}
                  <button className="btn btn-sm btn-outline-danger" onClick={() => remove(n._id)}>
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;