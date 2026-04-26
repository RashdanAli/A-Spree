import { useEffect } from 'react';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const platform = localStorage.getItem('platform') as 'warehouse' | 'retail' || 'retail';
  const isWarehouse = platform === 'warehouse';

  useEffect(() => {
    const root = document.documentElement;
    if (isWarehouse) {
      root.style.setProperty('--sidebar-primary', '#af101a');
      root.style.setProperty('--sidebar-primary-container', '#d32f2f');
      root.style.setProperty('--sidebar-gradient', 'linear-gradient(135deg, #af101a 0%, #d32f2f 100%)');
      root.style.setProperty('--active-nav-bg', 'rgba(175, 16, 26, 0.1)');
      root.style.setProperty('--active-nav-color', '#af101a');
    } else {
      root.style.setProperty('--sidebar-primary', '#006684');
      root.style.setProperty('--sidebar-primary-container', '#3f9bbf');
      root.style.setProperty('--sidebar-gradient', 'linear-gradient(135deg, #006684 0%, #3f9bbf 100%)');
      root.style.setProperty('--active-nav-bg', 'rgba(0, 102, 132, 0.1)');
      root.style.setProperty('--active-nav-color', '#006684');
    }
  }, [isWarehouse]);

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-content">
        {children}
      </div>
    </div>
  );
}