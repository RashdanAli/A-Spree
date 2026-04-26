import { useNavigate } from 'react-router-dom';

export default function StoreSelection() {
  const navigate = useNavigate();

  return (
    <div className="platform-selection-container">
      <style>{`
        .platform-selection-container {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          background: radial-gradient(circle at top left, #faeaea 0%, #f8fafb 50%, #e0f2f7 100%);
        }

        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 1.5rem;
          position: relative;
          z-index: 10;
        }

        .logo-section {
          text-align: center;
          margin-bottom: 3rem;
        }

        .logo-icon {
          width: 80px;
          height: 80px;
          border-radius: 1.5rem;
          background: #ca2a2a; /* standard red */
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          box-shadow: 0 8px 32px rgba(202, 42, 42, 0.2);
        }

        .logo-icon .material-symbols-outlined {
          font-size: 3.5rem; /* Make it large */
          color: white;
        }

        .logo-title {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #1a1c1c;
          margin-bottom: 0.5rem;
        }

        .logo-subtitle {
          font-size: 1rem;
          color: #6e5c5b;
          font-weight: 600;
        }

        .cards-container {
          display: flex;
          flex-direction: row;
          gap: 2rem;
          width: 100%;
          max-width: 900px;
          justify-content: center;
          flex-wrap: wrap; /* in case on mobile */
        }

        .platform-card {
          flex: 1;
          min-width: 300px;
          background: rgba(255, 255, 255, 0.8);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 0.5);
          border-radius: 2rem;
          padding: 2.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
        }

        .platform-card:hover {
          background: rgba(255, 255, 255, 1);
          transform: translateY(-4px);
          box-shadow: 0 16px 50px rgba(0, 0, 0, 0.06);
        }

        .platform-card:active {
          transform: translateY(0);
        }

        .platform-icon {
          width: 54px;
          height: 54px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 2rem;
          background: #f1eeec; /* very light grey-brown */
        }

        .platform-icon .material-symbols-outlined {
          font-size: 1.8rem;
          color: #5b403d; /* darker brown-grey */
        }

        .platform-title {
          font-size: 1.35rem;
          font-weight: 700;
          color: #1a1c1c;
          margin-bottom: 1rem;
        }

        .platform-desc {
          font-size: 0.95rem;
          color: #6e5c5b;
          line-height: 1.6;
          margin-bottom: 3rem;
          flex-grow: 1;
        }

        .enter-portal {
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }

        .enter-portal-warehouse {
          color: #c94040;
        }
        
        .platform-card:hover .enter-portal-warehouse {
          color: #af101a;
          gap: 0.75rem;
        }

        .enter-portal-retail {
          color: #4b9cb9;
        }

        .platform-card:hover .enter-portal-retail {
          color: #006684;
          gap: 0.75rem;
        }

        .enter-portal .material-symbols-outlined {
          font-size: 1.1rem;
        }

        @media (max-width: 768px) {
          .cards-container {
            flex-direction: column;
            align-items: center;
          }
          .platform-card {
            width: 100%;
            max-width: 400px;
          }
        }
      `}</style>

      {/* Main Content */}
      <main className="main-content">
        <div className="logo-section">
          <div className="logo-icon">
            <span className="material-symbols-outlined">all_inclusive</span>
          </div>
          <h1 className="logo-title">A-Spree</h1>
          <p className="logo-subtitle">Select your operational domain.</p>
        </div>

        <div className="cards-container">
          <div className="platform-card" onClick={() => navigate('/login/warehouse')}>
            <div className="platform-icon">
              <span className="material-symbols-outlined">warehouse</span>
            </div>
            <h2 className="platform-title">Warehouse Management</h2>
            <p className="platform-desc">
              Access global inventory, logistical routing, and high-volume fulfillment controls.
            </p>
            <div className="enter-portal enter-portal-warehouse">
              ENTER PORTAL <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>

          <div className="platform-card" onClick={() => navigate('/login/retail')}>
            <div className="platform-icon">
              <span className="material-symbols-outlined">storefront</span>
            </div>
            <h2 className="platform-title">Retail Store Management</h2>
            <p className="platform-desc">
              Manage point-of-sale, localized inventory, and frontline staff performance metrics.
            </p>
            <div className="enter-portal enter-portal-retail">
              ENTER PORTAL <span className="material-symbols-outlined">arrow_forward</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
