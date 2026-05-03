import type { ReactNode } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import StoreSelection from './pages/StoreSelection';
import Login from './pages/Login';
import WarehouseLogin from './pages/WarehouseLogin';
import DashboardLayout from './components/DashboardLayout';
import ProductCatalog from './pages/Warehouse/ProductCatalog';
import BatchTracker from './pages/Warehouse/BatchTracker';
import VendorList from './pages/Warehouse/VendorList';
import TransferOrders from './pages/Warehouse/TransferOrders';

const WAREHOUSE_CARDS = [
  { label: 'Product Catalog',   icon: 'inventory_2',    path: '/dashboard/products',  desc: 'Browse, search and edit products',          color: '#e6f1fb', text: '#0c447c' },
  { label: 'Batch Tracker',     icon: 'layers',         path: '/dashboard/batches',   desc: 'Monitor batch expiry across all products',   color: '#e1f5ee', text: '#085041' },
  { label: 'Vendor List',       icon: 'local_shipping', path: '/dashboard/vendors',   desc: 'Manage your supplier network',               color: '#faeeda', text: '#633806' },
  { label: 'Transfer Orders',   icon: 'swap_horiz',     path: '/dashboard/transfers', desc: 'Dispatch stock from warehouse to branches',  color: '#fbeaf0', text: '#4b1528' },
];

function DashboardHome() {
  const role = localStorage.getItem('role');
  const email = localStorage.getItem('email') || '';
  const navigate = useNavigate();
  const isWarehouse = role === 'WAREHOUSE_MANAGER' || role === 'SUPER_ADMIN';

  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="header-title">Welcome back, {email.split('@')[0]}</h1>
        <p style={{ marginTop: '0.25rem', color: 'var(--on-surface-variant)', fontSize: '0.875rem' }}>
          {role?.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, c => c.toUpperCase())} · {email}
        </p>
      </div>

      {isWarehouse && (
        <>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--outline)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.875rem' }}>
            Warehouse Management
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
            {WAREHOUSE_CARDS.map(card => (
              <div
                key={card.path}
                onClick={() => navigate(card.path)}
                className="glass-panel"
                style={{ padding: '1.25rem', cursor: 'pointer', transition: 'transform 0.15s, box-shadow 0.15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = ''; }}
              >
                <div style={{ width: '40px', height: '40px', borderRadius: '0.625rem', background: card.color, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '1.25rem', color: card.text }}>{card.icon}</span>
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--on-surface)', marginBottom: '0.25rem' }}>{card.label}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>{card.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{ padding: '1rem 1.25rem', background: 'var(--surface-container-low)', borderRadius: '0.75rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)' }}>
        Logged in as <strong style={{ color: 'var(--on-surface)' }}>{email}</strong>
        <span style={{ margin: '0 0.5rem', color: 'var(--outline)' }}>·</span>
        Role: <strong style={{ color: 'var(--on-surface)' }}>{role}</strong>
      </div>
    </div>
  );
}

function WarehouseRoute({ children }: { children: ReactNode }) {
  const role = localStorage.getItem('role');
  if (role !== 'SUPER_ADMIN' && role !== 'WAREHOUSE_MANAGER') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
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
                <Route path="products" element={<WarehouseRoute><ProductCatalog /></WarehouseRoute>} />
                <Route path="batches" element={<WarehouseRoute><BatchTracker /></WarehouseRoute>} />
                <Route path="vendors" element={<WarehouseRoute><VendorList /></WarehouseRoute>} />
                <Route path="transfers" element={<WarehouseRoute><TransferOrders /></WarehouseRoute>} />
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
