import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StoreSelection from './pages/StoreSelection';
import Login from './pages/Login';
import WarehouseLogin from './pages/WarehouseLogin';
import DashboardLayout from './components/DashboardLayout';

function DashboardHome() {
  const role = localStorage.getItem('role');
  return (
    <div className="page-content">
      <h1 className="header-title">Dashboard</h1>
      <p style={{ marginTop: '1rem', color: 'var(--on-surface-variant)' }}>
        Welcome to A-Spree Retail Management System
      </p>
      <div style={{
        marginTop: '2rem',
        padding: '1.5rem',
        backgroundColor: 'var(--surface-container-low)',
        borderRadius: '0.75rem',
      }}>
        <p><strong>Logged in as:</strong> {localStorage.getItem('email')}</p>
        <p><strong>Role:</strong> {role}</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<StoreSelection />} />
      <Route path="/login/retail" element={<Login />} />
      <Route path="/login/warehouse" element={<WarehouseLogin />} />
      <Route
        path="/dashboard/*"
        element={
          <ProtectedRoute>
            <DashboardLayout>
              <Routes>
                <Route path="/" element={<DashboardHome />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;