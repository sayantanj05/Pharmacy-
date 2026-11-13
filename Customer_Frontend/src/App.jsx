import { useState } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Medicines from './pages/Medicines';
import Cart from './pages/Cart';
import Orders from './pages/Orders';
import Notifications from './pages/Notifications';
import Profile from './pages/Profile';

const AppShell = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="d-flex">
      <Sidebar isOpen={sidebarOpen} />
      <div className="flex-grow-1" style={{ marginLeft: sidebarOpen ? '250px' : '0' }}>
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/medicines" element={<Medicines />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;