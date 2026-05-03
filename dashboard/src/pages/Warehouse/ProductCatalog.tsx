import { useState } from 'react';
import type { CSSProperties } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_PRODUCTS = gql`
  query GetProducts($category: String) {
    products(category: $category, limit: 200) {
      id
      sku
      name
      category
      unitOfMeasurement
      nutritionalInfo
      basePrice
      effectivePrice
      isArchived
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct($input: ProductInput!) {
    createProduct(input: $input) {
      id
      sku
      name
      category
      unitOfMeasurement
      nutritionalInfo
      basePrice
      effectivePrice
      isArchived
    }
  }
`;

const UPDATE_PRODUCT = gql`
  mutation UpdateProduct($id: ID!, $input: ProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      sku
      name
      category
      unitOfMeasurement
      nutritionalInfo
      basePrice
      effectivePrice
      isArchived
    }
  }
`;

const ARCHIVE_PRODUCT = gql`
  mutation ArchiveProduct($id: ID!) {
    archiveProduct(id: $id) {
      id
      isArchived
    }
  }
`;

interface Product {
  id: string;
  sku: string;
  name: string;
  category: string | null;
  unitOfMeasurement: string | null;
  nutritionalInfo: string | null;
  basePrice: number | null;
  effectivePrice: number | null;
  isArchived: boolean | null;
}

type FormData = {
  name: string;
  sku: string;
  category: string;
  unitOfMeasurement: string;
  nutritionalInfo: string;
  basePrice: string;
};

const EMPTY_FORM: FormData = { name: '', sku: '', category: '', unitOfMeasurement: '', nutritionalInfo: '', basePrice: '' };
const CATEGORIES = ['Beverages', 'Dairy', 'Bakery', 'Produce', 'Meat', 'Snacks', 'Frozen', 'Other'];

export default function ProductCatalog() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showArchived, setShowArchived] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<FormData>(EMPTY_FORM);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState<FormData>(EMPTY_FORM);
  const [archiveConfirmId, setArchiveConfirmId] = useState<string | null>(null);

  const { data, loading, error, refetch } = useQuery<{ products: Product[] }>(GET_PRODUCTS, {
    variables: { category: categoryFilter || undefined },
  });

  const [updateProduct] = useMutation(UPDATE_PRODUCT);
  const [archiveProduct] = useMutation(ARCHIVE_PRODUCT);
  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT);

  const allProducts: Product[] = data?.products ?? [];
  const products = allProducts.filter(p => {
    if (!showArchived && p.isArchived) return false;
    if (search) {
      const q = search.toLowerCase();
      return (p.name ?? '').toLowerCase().includes(q) || (p.sku ?? '').toLowerCase().includes(q);
    }
    return true;
  });

  const startEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({
      name: p.name ?? '',
      sku: p.sku ?? '',
      category: p.category ?? '',
      unitOfMeasurement: p.unitOfMeasurement ?? '',
      nutritionalInfo: p.nutritionalInfo ?? '',
      basePrice: p.basePrice != null ? String(p.basePrice) : '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await updateProduct({
      variables: {
        id: editingId,
        input: {
          name: editForm.name,
          sku: editForm.sku || undefined,
          category: editForm.category || undefined,
          unitOfMeasurement: editForm.unitOfMeasurement || undefined,
          nutritionalInfo: editForm.nutritionalInfo || undefined,
          basePrice: editForm.basePrice ? Number(editForm.basePrice) : undefined,
        },
      },
    });
    setEditingId(null);
  };

  const confirmArchive = async (id: string) => {
    await archiveProduct({ variables: { id } });
    setArchiveConfirmId(null);
  };

  const handleCreate = async () => {
    if (!createForm.name) return;
    await createProduct({
      variables: {
        input: {
          name: createForm.name,
          sku: createForm.sku || undefined,
          category: createForm.category || undefined,
          unitOfMeasurement: createForm.unitOfMeasurement || undefined,
          nutritionalInfo: createForm.nutritionalInfo || undefined,
          basePrice: createForm.basePrice ? Number(createForm.basePrice) : undefined,
        },
      },
    });
    setShowCreate(false);
    setCreateForm(EMPTY_FORM);
    refetch();
  };

  return (
    <div className="page-content">
      <div style={styles.pageHeader}>
        <div>
          <h1 className="header-title">Product Catalog</h1>
          <p style={styles.subtitle}>Manage your product master catalog</p>
        </div>
        <button onClick={() => setShowCreate(v => !v)} style={styles.primaryBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
            {showCreate ? 'close' : 'add'}
          </span>
          {showCreate ? 'Cancel' : 'Add Product'}
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1rem', color: 'var(--on-surface)' }}>New Product</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '0.875rem' }}>
            {([
              { label: 'Name *', key: 'name', placeholder: 'Product name' },
              { label: 'SKU', key: 'sku', placeholder: 'Auto-generated if empty' },
              { label: 'Unit', key: 'unitOfMeasurement', placeholder: 'e.g. kg, pcs, L' },
              { label: 'Base Price', key: 'basePrice', placeholder: '0.00' },
              { label: 'Nutritional Info', key: 'nutritionalInfo', placeholder: 'Optional' },
            ] as { label: string; key: keyof FormData; placeholder: string }[]).map(f => (
              <div key={f.key}>
                <label style={styles.fieldLabel}>{f.label}</label>
                <input
                  value={createForm[f.key]}
                  onChange={e => setCreateForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={styles.input}
                />
              </div>
            ))}
            <div>
              <label style={styles.fieldLabel}>Category</label>
              <select
                value={createForm.category}
                onChange={e => setCreateForm(prev => ({ ...prev, category: e.target.value }))}
                style={styles.input}
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCreate(false)} style={styles.ghostBtn}>Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!createForm.name || creating}
              style={{ ...styles.primaryBtn, opacity: !createForm.name || creating ? 0.6 : 1 }}
            >
              {creating ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={styles.searchWrapper}>
            <span className="material-symbols-outlined" style={{ color: 'var(--outline)', fontSize: '1.1rem' }}>search</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or SKU..."
              style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', background: 'transparent', color: 'var(--on-surface)' }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: 0 }}>
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
              </button>
            )}
          </div>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={styles.filterSelect}
          >
            <option value="">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: 'var(--on-surface-variant)', cursor: 'pointer', userSelect: 'none' }}>
            <input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} />
            Show archived
          </label>
        </div>
      </div>

      {/* Table */}
      {loading && <p style={{ color: 'var(--on-surface-variant)', padding: '1rem 0' }}>Loading products...</p>}
      {error && <p style={{ color: 'var(--error)', padding: '1rem 0' }}>Error: {error.message}</p>}
      {!loading && !error && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['SKU', 'Name', 'Category', 'Unit', 'Base Price', 'Effective Price', 'Status', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {products.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>
                      <span className="material-symbols-outlined" style={{ display: 'block', fontSize: '2.5rem', marginBottom: '0.5rem' }}>inventory_2</span>
                      No products found
                    </td>
                  </tr>
                )}
                {products.map((product, idx) => (
                  <tr
                    key={product.id}
                    style={{
                      borderTop: '1px solid var(--outline-variant)',
                      background: product.isArchived ? 'var(--surface-container)' : (idx % 2 === 0 ? 'white' : 'var(--surface-container-lowest)'),
                      opacity: product.isArchived ? 0.6 : 1,
                    }}
                  >
                    {editingId === product.id ? (
                      <>
                        <td style={styles.editTd}>
                          <input value={editForm.sku} onChange={e => setEditForm(f => ({ ...f, sku: e.target.value }))} style={styles.inlineInput} />
                        </td>
                        <td style={styles.editTd}>
                          <input value={editForm.name} onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))} style={{ ...styles.inlineInput, minWidth: '140px' }} />
                        </td>
                        <td style={styles.editTd}>
                          <select value={editForm.category} onChange={e => setEditForm(f => ({ ...f, category: e.target.value }))} style={styles.inlineInput}>
                            <option value="">—</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </td>
                        <td style={styles.editTd}>
                          <input value={editForm.unitOfMeasurement} onChange={e => setEditForm(f => ({ ...f, unitOfMeasurement: e.target.value }))} style={{ ...styles.inlineInput, width: '70px' }} />
                        </td>
                        <td style={styles.editTd}>
                          <input type="number" value={editForm.basePrice} onChange={e => setEditForm(f => ({ ...f, basePrice: e.target.value }))} style={{ ...styles.inlineInput, width: '80px' }} />
                        </td>
                        <td style={styles.editTd}><span style={{ color: 'var(--outline)', fontSize: '0.8rem' }}>recalculates on save</span></td>
                        <td style={styles.editTd}></td>
                        <td style={styles.editTd}>
                          <div style={{ display: 'flex', gap: '0.375rem' }}>
                            <button onClick={saveEdit} style={{ ...styles.primaryBtn, padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>Save</button>
                            <button onClick={() => setEditingId(null)} style={{ ...styles.ghostBtn, padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>Cancel</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td style={styles.td}>
                          <code style={{ fontSize: '0.78rem', background: 'var(--surface-container)', padding: '0.125rem 0.375rem', borderRadius: '0.25rem', color: 'var(--on-surface-variant)' }}>
                            {product.sku}
                          </code>
                        </td>
                        <td style={{ ...styles.td, fontWeight: 500 }}>{product.name}</td>
                        <td style={styles.td}>{product.category ?? '—'}</td>
                        <td style={styles.td}>{product.unitOfMeasurement ?? '—'}</td>
                        <td style={styles.td}>{product.basePrice != null ? `$${product.basePrice.toFixed(2)}` : '—'}</td>
                        <td style={{ ...styles.td, fontWeight: 600, color: 'var(--sidebar-primary)' }}>
                          {product.effectivePrice != null ? `$${product.effectivePrice.toFixed(2)}` : '—'}
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '9999px',
                            fontSize: '0.75rem',
                            fontWeight: 500,
                            background: product.isArchived ? 'var(--surface-container-high)' : '#e1f5ee',
                            color: product.isArchived ? 'var(--outline)' : '#085041',
                          }}>
                            {product.isArchived ? 'Archived' : 'Active'}
                          </span>
                        </td>
                        <td style={styles.td}>
                          {archiveConfirmId === product.id ? (
                            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: 'var(--error)', whiteSpace: 'nowrap' }}>Archive?</span>
                              <button onClick={() => confirmArchive(product.id)} style={{ padding: '0.25rem 0.5rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}>Yes</button>
                              <button onClick={() => setArchiveConfirmId(null)} style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-container)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem' }}>No</button>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', gap: '0.375rem' }}>
                              <button onClick={() => startEdit(product)} title="Edit" style={styles.iconBtn}>
                                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                              </button>
                              {!product.isArchived && (
                                <button onClick={() => setArchiveConfirmId(product.id)} title="Archive" style={{ ...styles.iconBtn, color: 'var(--outline)' }}>
                                  <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>archive</span>
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--outline-variant)', fontSize: '0.8rem', color: 'var(--outline)', background: 'var(--surface-container-lowest)' }}>
            {products.length} product{products.length !== 1 ? 's' : ''} shown
          </div>
        </div>
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
    flex: 1,
    minWidth: '220px',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'white',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.5rem',
    padding: '0.5rem 0.75rem',
  },
  filterSelect: {
    padding: '0.5rem 0.75rem',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.5rem',
    background: 'white',
    fontSize: '0.875rem',
    color: 'var(--on-surface)',
    cursor: 'pointer',
    fontFamily: 'inherit',
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    padding: '0.75rem 1rem',
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
  editTd: {
    padding: '0.5rem 0.75rem',
    whiteSpace: 'nowrap',
  },
  inlineInput: {
    padding: '0.375rem 0.5rem',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.375rem',
    fontSize: '0.85rem',
    outline: 'none',
    background: 'white',
    fontFamily: 'inherit',
    color: 'var(--on-surface)',
  },
  iconBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    border: 'none',
    borderRadius: '0.375rem',
    background: 'var(--surface-container-low)',
    cursor: 'pointer',
    color: 'var(--sidebar-primary)',
  },
};
