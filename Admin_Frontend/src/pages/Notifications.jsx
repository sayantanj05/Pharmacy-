import { useState, useEffect } from 'react';
import api from '../services/api';
import { FaCheck, FaTrash } from 'react-icons/fa';

const Notifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        setNotifications(res.data.notifications || res.data.data?.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const deleteNotification = async (id) => {
    try {
      await api.delete(`/notifications/${id}`);
      setNotifications(notifications.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="p-4">
      <h2 className="mb-4">Notifications</h2>
      <div className="table-container">
        {notifications.length === 0 ? (
          <p className="text-center text-muted">No notifications</p>
        ) : (
          <div className="list-group">
            {notifications.map((notification) => (
              <div key={notification._id} className={`list-group-item list-group-item-action ${notification.isRead ? '' : 'list-group-item-warning'}`}>
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h6 className="mb-1">{notification.title}</h6>
                    <p className="mb-1">{notification.message}</p>
                    <small className="text-muted">{new Date(notification.createdAt).toLocaleString()}</small>
                  </div>
                  <div>
                    {!notification.isRead && (
                      <button className="btn btn-sm btn-outline-success btn-action me-1" onClick={() => markAsRead(notification._id)}>
                        <FaCheck />
                      </button>
                    )}
                    <button className="btn btn-sm btn-outline-danger btn-action" onClick={() => deleteNotification(notification._id)}>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;
