import { useState } from 'react';
import type { CSSProperties } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_PRODUCTS_WITH_BATCHES = gql`
  query GetProductsWithBatches {
    products(limit: 200) {
      id
      sku
      name
      category
      batches {
        id
        batchNumber
        quantity
        receivedDate
        expiryDate
        costPrice
      }
    }
  }
`;

const CREATE_BATCH = gql`
  mutation CreateBatch($input: BatchInput!) {
    createBatch(input: $input) {
      id
      batchNumber
      productId
      quantity
      receivedDate
      expiryDate
      costPrice
    }
  }
`;

interface BatchItem {
  id: string;
  batchNumber: string | null;
  quantity: number | null;
  receivedDate: string | null;
  expiryDate: string | null;
  costPrice: number | null;
}

interface ProductWithBatches {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  batches: BatchItem[];
}

type ExpiryFilter = 'ALL' | '3' | '7' | '30';

type BatchFormData = {
  productId: string;
  batchNumber: string;
  quantity: string;
  receivedDate: string;
  expiryDate: string;
  costPrice: string;
};

const EMPTY_BATCH_FORM: BatchFormData = {
  productId: '',
  batchNumber: '',
  quantity: '',
  receivedDate: new Date().toISOString().split('T')[0],
  expiryDate: '',
  costPrice: '',
};

function getDaysUntil(dateStr: string | null): number {
  if (!dateStr) return Infinity;
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(dateStr);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
}

function getExpiryBadge(days: number): { bg: string; color: string; label: string; dot: string } {
  if (days < 0) return { bg: 'var(--surface-container-high)', color: 'var(--outline)', label: 'Expired', dot: '#9ca3af' };
  if (days <= 3) return { bg: 'var(--error-container)', color: 'var(--error)', label: `${days}d left`, dot: '#ba1a1a' };
  if (days <= 7) return { bg: '#faeeda', color: '#633806', label: `${days}d left`, dot: '#e07b00' };
  return { bg: '#e1f5ee', color: '#085041', label: `${days}d left`, dot: '#1d9e75' };
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

export default function BatchTracker() {
  const [expiryFilter, setExpiryFilter] = useState<ExpiryFilter>('ALL');
  const [search, setSearch] = useState('');
  const [showAddBatch, setShowAddBatch] = useState(false);
  const [batchForm, setBatchForm] = useState<BatchFormData>(EMPTY_BATCH_FORM);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  const { data, loading, error, refetch } = useQuery<{ products: ProductWithBatches[] }>(GET_PRODUCTS_WITH_BATCHES);
  const [createBatch, { loading: creating }] = useMutation(CREATE_BATCH);

  const allProducts: ProductWithBatches[] = data?.products ?? [];

  const filtered = allProducts
    .filter(p => {
      if (search) {
        const q = search.toLowerCase();
        return (p.name ?? '').toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
      }
      return true;
    })
    .map(p => {
      const batches = (p.batches ?? []).filter(b => {
        if (expiryFilter === 'ALL') return true;
        const days = getDaysUntil(b.expiryDate);
        return days <= Number(expiryFilter);
      });
      return { ...p, batches };
    })
    .filter(p => p.batches.length > 0);

  const totalBatches = filtered.reduce((sum, p) => sum + p.batches.length, 0);
  const criticalCount = allProducts.reduce((sum, p) =>
    sum + (p.batches ?? []).filter(b => getDaysUntil(b.expiryDate) <= 3).length, 0);

  const toggleProduct = (id: string) => {
    setExpandedProducts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleCreateBatch = async () => {
    if (!batchForm.productId || !batchForm.batchNumber || !batchForm.quantity || !batchForm.expiryDate) return;
    await createBatch({
      variables: {
        input: {
          productId: batchForm.productId,
          batchNumber: batchForm.batchNumber,
          quantity: Number(batchForm.quantity),
          receivedDate: batchForm.receivedDate || undefined,
          expiryDate: batchForm.expiryDate,
          costPrice: batchForm.costPrice ? Number(batchForm.costPrice) : undefined,
        },
      },
    });
    setShowAddBatch(false);
    setBatchForm(EMPTY_BATCH_FORM);
    refetch();
  };

  const filterTabs: { key: ExpiryFilter; label: string }[] = [
    { key: 'ALL', label: 'All Batches' },
    { key: '30', label: 'Next 30 days' },
    { key: '7', label: 'Next 7 days' },
    { key: '3', label: 'Critical (≤ 3d)' },
  ];

  return (
    <div className="page-content">
      <div style={styles.pageHeader}>
        <div>
          <h1 className="header-title">Batch Tracker</h1>
          <p style={styles.subtitle}>Monitor batch expiry across all products</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {criticalCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.875rem', background: 'var(--error-container)', borderRadius: '0.625rem' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem', color: 'var(--error)' }}>warning</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--error)' }}>{criticalCount} critical</span>
            </div>
          )}
          <button onClick={() => setShowAddBatch(v => !v)} style={styles.primaryBtn}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
              {showAddBatch ? 'close' : 'add'}
            </span>
            {showAddBatch ? 'Cancel' : 'Add Batch'}
          </button>
        </div>
      </div>

      {/* Add Batch Form */}
      {showAddBatch && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--on-surface)' }}>New Batch Entry</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.875rem' }}>
            <div>
              <label style={styles.fieldLabel}>Product *</label>
              <select
                value={batchForm.productId}
                onChange={e => setBatchForm(f => ({ ...f, productId: e.target.value }))}
                style={styles.input}
              >
                <option value="">Select product</option>
                {allProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                ))}
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>Batch Number *</label>
              <input
                value={batchForm.batchNumber}
                onChange={e => setBatchForm(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="e.g. BCH-2025-001"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.fieldLabel}>Quantity *</label>
              <input
                type="number"
                value={batchForm.quantity}
                onChange={e => setBatchForm(f => ({ ...f, quantity: e.target.value }))}
                placeholder="0"
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.fieldLabel}>Received Date</label>
              <input
                type="date"
                value={batchForm.receivedDate}
                onChange={e => setBatchForm(f => ({ ...f, receivedDate: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.fieldLabel}>Expiry Date *</label>
              <input
                type="date"
                value={batchForm.expiryDate}
                onChange={e => setBatchForm(f => ({ ...f, expiryDate: e.target.value }))}
                style={styles.input}
              />
            </div>
            <div>
              <label style={styles.fieldLabel}>Cost Price</label>
              <input
                type="number"
                value={batchForm.costPrice}
                onChange={e => setBatchForm(f => ({ ...f, costPrice: e.target.value }))}
                placeholder="0.00"
                style={styles.input}
              />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
            <button onClick={() => setShowAddBatch(false)} style={styles.ghostBtn}>Cancel</button>
            <button
              onClick={handleCreateBatch}
              disabled={!batchForm.productId || !batchForm.batchNumber || !batchForm.quantity || !batchForm.expiryDate || creating}
              style={{ ...styles.primaryBtn, opacity: (!batchForm.productId || !batchForm.batchNumber || !batchForm.quantity || !batchForm.expiryDate || creating) ? 0.6 : 1 }}
            >
              {creating ? 'Saving...' : 'Save Batch'}
            </button>
          </div>
        </div>
      )}

      {/* Search + Filter tabs */}
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <div style={styles.searchWrapper}>
          <span className="material-symbols-outlined" style={{ color: 'var(--outline)', fontSize: '1.1rem' }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', background: 'transparent', color: 'var(--on-surface)' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.375rem', background: 'var(--surface-container)', padding: '0.25rem', borderRadius: '0.625rem' }}>
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setExpiryFilter(tab.key)}
              style={{
                padding: '0.375rem 0.75rem',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                fontSize: '0.8rem',
                fontWeight: 500,
                fontFamily: 'inherit',
                background: expiryFilter === tab.key ? 'white' : 'transparent',
                color: expiryFilter === tab.key ? 'var(--sidebar-primary)' : 'var(--on-surface-variant)',
                boxShadow: expiryFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {loading && <p style={{ color: 'var(--on-surface-variant)' }}>Loading batches...</p>}
      {error && <p style={{ color: 'var(--error)' }}>Error: {error.message}</p>}
      {!loading && !error && (
        <>
          <p style={{ fontSize: '0.8rem', color: 'var(--outline)', marginBottom: '1rem' }}>
            {filtered.length} product group{filtered.length !== 1 ? 's' : ''} · {totalBatches} batch{totalBatches !== 1 ? 'es' : ''}
          </p>
          {filtered.length === 0 && (
            <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center' }}>
              <span className="material-symbols-outlined" style={{ display: 'block', fontSize: '2.5rem', color: 'var(--outline)', marginBottom: '0.5rem' }}>layers</span>
              <p style={{ color: 'var(--outline)' }}>No batches match this filter</p>
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(product => {
              const isExpanded = expandedProducts.has(product.id);
              const worstDays = Math.min(...product.batches.map(b => getDaysUntil(b.expiryDate)));
              const worstBadge = getExpiryBadge(worstDays);
              return (
                <div key={product.id} className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
                  {/* Product header row */}
                  <div
                    onClick={() => toggleProduct(product.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                      padding: '0.875rem 1.25rem',
                      cursor: 'pointer',
                      background: 'var(--surface-container-low)',
                      userSelect: 'none',
                    }}
                  >
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: worstBadge.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--on-surface)' }}>{product.name}</span>
                        <code style={{ fontSize: '0.75rem', color: 'var(--outline)', background: 'var(--surface-container)', padding: '0.1rem 0.35rem', borderRadius: '0.2rem' }}>{product.sku}</code>
                        {product.category && <span style={{ fontSize: '0.75rem', color: 'var(--on-surface-variant)' }}>{product.category}</span>}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)', marginRight: '0.5rem' }}>
                      {product.batches.length} batch{product.batches.length !== 1 ? 'es' : ''}
                    </span>
                    <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--outline)', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'none' }}>
                      expand_more
                    </span>
                  </div>

                  {/* Batch rows */}
                  {isExpanded && (
                    <div>
                      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                          <tr>
                            {['', 'Batch #', 'Quantity', 'Received', 'Expiry', 'Cost Price', 'Status'].map(h => (
                              <th key={h} style={{ ...styles.th, background: 'transparent', paddingTop: '0.625rem', paddingBottom: '0.625rem' }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {product.batches.map((batch, idx) => {
                            const days = getDaysUntil(batch.expiryDate);
                            const badge = getExpiryBadge(days);
                            return (
                              <tr key={batch.id} style={{ borderTop: '1px solid var(--outline-variant)', background: idx % 2 === 0 ? 'white' : 'var(--surface-container-lowest)' }}>
                                <td style={{ ...styles.td, width: '4px', padding: '0', paddingLeft: '0' }}>
                                  <div style={{ width: '4px', height: '100%', minHeight: '48px', background: badge.dot }} />
                                </td>
                                <td style={{ ...styles.td, fontFamily: 'monospace', fontSize: '0.85rem' }}>
                                  {batch.batchNumber ?? '—'}
                                </td>
                                <td style={styles.td}>
                                  <span style={{ fontWeight: 600 }}>{batch.quantity?.toLocaleString() ?? '—'}</span>
                                  <span style={{ color: 'var(--outline)', fontSize: '0.8rem' }}> units</span>
                                </td>
                                <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>{formatDate(batch.receivedDate)}</td>
                                <td style={styles.td}>{formatDate(batch.expiryDate)}</td>
                                <td style={styles.td}>{batch.costPrice != null ? `$${batch.costPrice.toFixed(2)}` : '—'}</td>
                                <td style={styles.td}>
                                  <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: badge.bg, color: badge.color }}>
                                    {badge.label}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

const styles: Record<string, CSSProperties> = {
  pageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '1.5rem',
  },
  subtitle: {
    color: 'var(--on-surface-variant)',
    marginTop: '0.25rem',
    fontSize: '0.875rem',
  },
  primaryBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    padding: '0.625rem 1.125rem',
    background: 'var(--sidebar-gradient)',
    color: 'white',
    border: 'none',
    borderRadius: '0.625rem',
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
  },
  ghostBtn: {
    padding: '0.625rem 1rem',
    border: '1px solid var(--outline-variant)',
    background: 'white',
    borderRadius: '0.625rem',
    cursor: 'pointer',
    fontSize: '0.875rem',
    fontFamily: 'inherit',
    color: 'var(--on-surface)',
  },
  searchWrapper: {
    flex: '0 1 260px',
    minWidth: '180px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
  },
  fieldLabel: {
    display: 'block',
    fontSize: '0.75rem',
    fontWeight: 500,
    color: 'var(--on-surface-variant)',
    marginBottom: '0.25rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
    background: 'white',
    outline: 'none',
    color: 'var(--on-surface)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  th: {
    padding: '0.625rem 1rem',
    textAlign: 'left',
    fontSize: '0.7rem',
    fontWeight: 600,
    color: 'var(--on-surface-variant)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--on-surface)',
    whiteSpace: 'nowrap',
  },
};
