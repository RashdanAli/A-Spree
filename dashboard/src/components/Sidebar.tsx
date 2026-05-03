import { useNavigate, useLocation } from 'react-router-dom';
import { getRoleFromToken } from '../apollo';

interface NavItem {
  label: string;
  icon: string;
  path: string;
  roles: string[];
  badge?: number;
}

const navItems: NavItem[] = [
  // Dashboard
  { label: 'Dashboard', icon: 'dashboard', path: '/dashboard', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER', 'CASHIER'] },
  // Inventory
  { label: 'Products', icon: 'inventory_2', path: '/dashboard/products', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER'] },
  { label: 'Batch Management', icon: 'layers', path: '/dashboard/batches', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER'] },
  { label: 'Branch Inventory', icon: 'store', path: '/dashboard/inventory', roles: ['BRANCH_MANAGER', 'CASHIER'] },
  // Orders
  { label: 'Orders', icon: 'shopping_cart', path: '/dashboard/orders', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER', 'CASHIER'] },
  { label: 'Transfer Orders', icon: 'swap_horiz', path: '/dashboard/transfers', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER'] },
  // Operations
  { label: 'POS Terminal', icon: 'point_of_sale', path: '/dashboard/pos', roles: ['CASHIER', 'BRANCH_MANAGER'] },
  { label: 'Wastage & Returns', icon: 'delete', path: '/dashboard/wastage', roles: ['SUPER_ADMIN', 'BRANCH_MANAGER'] },
  { label: 'Scan Logs', icon: 'qr_code_scanner', path: '/dashboard/scans', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER'] },
  // Master Data
  { label: 'Branches', icon: 'location_on', path: '/dashboard/branches', roles: ['SUPER_ADMIN'] },
  { label: 'Warehouses', icon: 'warehouse', path: '/dashboard/warehouses', roles: ['SUPER_ADMIN'] },
  { label: 'Vendors', icon: 'local_shipping', path: '/dashboard/vendors', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER'] },
  // Admin
  { label: 'Users', icon: 'people', path: '/dashboard/users', roles: ['SUPER_ADMIN'] },
  { label: 'Notifications', icon: 'notifications', path: '/dashboard/notifications', roles: ['SUPER_ADMIN', 'WAREHOUSE_MANAGER', 'BRANCH_MANAGER', 'CASHIER'] },
  // Customer
  { label: 'My Orders', icon: 'receipt_long', path: '/dashboard/my-orders', roles: ['CUSTOMER'] },
];

const sectionTitles: Record<string, string> = {
  'Dashboard': 'Main',
  'Products': 'Inventory',
  'Batch Management': 'Inventory',
  'Branch Inventory': 'Inventory',
  'Orders': 'Operations',
  'Transfer Orders': 'Operations',
  'POS Terminal': 'Operations',
  'Wastage & Returns': 'Operations',
  'Scan Logs': 'Operations',
  'Branches': 'Master Data',
  'Warehouses': 'Master Data',
  'Vendors': 'Master Data',
  'Users': 'Admin',
  'Notifications': 'Admin',
  'My Orders': 'Customer',
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = getRoleFromToken();

  const filteredNavItems = navItems.filter(item => item.roles.includes(role || ''));

  const sections = filteredNavItems.reduce((acc, item) => {
    const section = sectionTitles[item.label] || 'Other';
    if (!acc[section]) acc[section] = [];
    acc[section].push(item);
    return acc;
  }, {} as Record<string, NavItem[]>);

  const userEmail = localStorage.getItem('email') || '';
  const userInitial = userEmail.charAt(0).toUpperCase() || 'U';
  const userName = userEmail.split('@')[0] || 'User';

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('platform');
    navigate('/');
  };

  const formatRole = (role: string | null) => {
    if (!role) return '';
    return role.replace('_', ' ').toLowerCase();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="material-symbols-outlined">storefront</span>
        </div>
        <span className="sidebar-brand">A-Spree</span>
      </div>

      <nav className="sidebar-nav">
        {Object.entries(sections).map(([section, items]) => (
          <div key={section} className="nav-section">
            <div className="nav-section-title">{section}</div>
            {items.map((item) => (
              <div
                key={item.path}
                className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                onClick={() => navigate(item.path)}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </div>
            ))}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{userInitial}</div>
          <div className="user-details">
            <div className="user-name">{userName}</div>
            <div className="user-role">{formatRole(role)}</div>
          </div>
          <button className="logout-button" onClick={handleLogout} title="Logout">
            <span className="material-symbols-outlined">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
