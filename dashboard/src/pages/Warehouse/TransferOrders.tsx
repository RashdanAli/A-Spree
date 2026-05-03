import { useState } from 'react';
import type { CSSProperties } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_TRANSFER_ORDERS = gql`
  query GetTransferOrders($status: TransferOrderStatus) {
    transferOrders(status: $status) {
      id
      status
      estimatedDeliveryDate
      createdAt
      dispatchedAt
      items {
        productId
        batchId
        quantity
      }
      branch {
        id
        name
      }
      warehouse {
        id
        name
      }
    }
  }
`;

const GET_BRANCHES = gql`
  query GetBranches {
    branches {
      id
      name
    }
  }
`;

const GET_WAREHOUSES = gql`
  query GetWarehouses {
    warehouses {
      id
      name
    }
  }
`;

const GET_PRODUCTS_FOR_ORDER = gql`
  query GetProductsForOrder {
    products(limit: 200) {
      id
      sku
      name
      batches {
        id
        batchNumber
        quantity
        expiryDate
      }
    }
  }
`;

const CREATE_TRANSFER_ORDER = gql`
  mutation CreateTransferOrder($input: TransferOrderInput!) {
    createTransferOrder(input: $input) {
      id
      status
      estimatedDeliveryDate
      createdAt
      branch { id name }
      warehouse { id name }
      items { productId batchId quantity }
    }
  }
`;

const DISPATCH_TRANSFER_ORDER = gql`
  mutation DispatchTransferOrder($id: ID!) {
    dispatchTransferOrder(id: $id) {
      id
      status
      dispatchedAt
    }
  }
`;

type TransferOrderStatus = 'PENDING' | 'DISPATCHED' | 'RECEIVED';
type StatusFilter = 'ALL' | TransferOrderStatus;

interface OrderItem {
  productId: string | null;
  batchId: string | null;
  quantity: number | null;
}

interface TransferOrder {
  id: string;
  status: TransferOrderStatus;
  estimatedDeliveryDate: string | null;
  createdAt: string | null;
  dispatchedAt: string | null;
  items: OrderItem[];
  branch: { id: string; name: string } | null;
  warehouse: { id: string; name: string } | null;
}

interface Branch { id: string; name: string; }
interface Warehouse { id: string; name: string; }
interface BatchOption { id: string; batchNumber: string | null; quantity: number | null; expiryDate: string | null; }
interface ProductOption { id: string; sku: string; name: string; batches: BatchOption[]; }

interface OrderItemRow {
  productId: string;
  batchId: string;
  quantity: string;
}

function formatDate(str: string | null): string {
  if (!str) return '—';
  return new Date(str).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

const STATUS_CONFIG: Record<TransferOrderStatus, { bg: string; color: string; icon: string }> = {
  PENDING: { bg: '#faeeda', color: '#633806', icon: 'schedule' },
  DISPATCHED: { bg: '#e6f1fb', color: '#0c447c', icon: 'local_shipping' },
  RECEIVED: { bg: '#e1f5ee', color: '#085041', icon: 'check_circle' },
};

export default function TransferOrders() {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [dispatchConfirmId, setDispatchConfirmId] = useState<string | null>(null);

  const [formBranchId, setFormBranchId] = useState('');
  const [formWarehouseId, setFormWarehouseId] = useState('');
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItemRow[]>([{ productId: '', batchId: '', quantity: '1' }]);

  const { data: ordersData, loading: ordersLoading, error: ordersError, refetch } = useQuery<{ transferOrders: TransferOrder[] }>(GET_TRANSFER_ORDERS, {
    variables: { status: statusFilter === 'ALL' ? undefined : statusFilter },
  });

  const { data: branchesData } = useQuery<{ branches: Branch[] }>(GET_BRANCHES);
  const { data: warehousesData } = useQuery<{ warehouses: Warehouse[] }>(GET_WAREHOUSES);
  const { data: productsData } = useQuery<{ products: ProductOption[] }>(GET_PRODUCTS_FOR_ORDER);

  const [createTransferOrder, { loading: creating }] = useMutation(CREATE_TRANSFER_ORDER);
  const [dispatchTransferOrder] = useMutation(DISPATCH_TRANSFER_ORDER);

  const orders: TransferOrder[] = ordersData?.transferOrders ?? [];
  const branches: Branch[] = branchesData?.branches ?? [];
  const warehouses: Warehouse[] = warehousesData?.warehouses ?? [];
  const products: ProductOption[] = productsData?.products ?? [];

  const getProductBatches = (productId: string): BatchOption[] => {
    const product = products.find(p => p.id === productId);
    return product?.batches ?? [];
  };

  const addItemRow = () => setOrderItems(rows => [...rows, { productId: '', batchId: '', quantity: '1' }]);
  const removeItemRow = (index: number) => setOrderItems(rows => rows.filter((_, i) => i !== index));

  const updateItem = (index: number, field: keyof OrderItemRow, value: string) => {
    setOrderItems(rows => rows.map((row, i) => {
      if (i !== index) return row;
      if (field === 'productId') return { ...row, productId: value, batchId: '' };
      return { ...row, [field]: value };
    }));
  };

  const resetForm = () => {
    setFormBranchId('');
    setFormWarehouseId('');
    setFormDeliveryDate('');
    setOrderItems([{ productId: '', batchId: '', quantity: '1' }]);
    setShowCreateForm(false);
  };

  const isFormValid = formBranchId && formWarehouseId && orderItems.every(r => r.productId && r.batchId && Number(r.quantity) > 0);

  const handleCreate = async () => {
    if (!isFormValid) return;
    await createTransferOrder({
      variables: {
        input: {
          branchId: formBranchId,
          warehouseId: formWarehouseId,
          estimatedDeliveryDate: formDeliveryDate || undefined,
          items: orderItems.map(r => ({
            productId: r.productId,
            batchId: r.batchId,
            quantity: Number(r.quantity),
          })),
        },
      },
    });
    resetForm();
    refetch();
  };

  const handleDispatch = async (id: string) => {
    await dispatchTransferOrder({ variables: { id } });
    setDispatchConfirmId(null);
  };

  const statusTabs: { key: StatusFilter; label: string }[] = [
    { key: 'ALL', label: 'All Orders' },
    { key: 'PENDING', label: 'Pending' },
    { key: 'DISPATCHED', label: 'Dispatched' },
    { key: 'RECEIVED', label: 'Received' },
  ];

  return (
    <div className="page-content">
      <div style={styles.pageHeader}>
        <div>
          <h1 className="header-title">Transfer Orders</h1>
          <p style={styles.subtitle}>Dispatch stock from warehouse to branches</p>
        </div>
        <button onClick={() => setShowCreateForm(v => !v)} style={styles.primaryBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>
            {showCreateForm ? 'close' : 'add'}
          </span>
          {showCreateForm ? 'Cancel' : 'Create Order'}
        </button>
      </div>

      {/* Create Order Form */}
      {showCreateForm && (
        <div className="glass-panel" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
          <h3 style={{ fontWeight: 600, marginBottom: '1.25rem', color: 'var(--on-surface)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '1.1rem', color: 'var(--sidebar-primary)' }}>swap_horiz</span>
            New Transfer Order
          </h3>

          {/* Warehouse / Branch / Date row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label style={styles.fieldLabel}>From Warehouse *</label>
              <select value={formWarehouseId} onChange={e => setFormWarehouseId(e.target.value)} style={styles.input}>
                <option value="">Select warehouse</option>
                {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>To Branch *</label>
              <select value={formBranchId} onChange={e => setFormBranchId(e.target.value)} style={styles.input}>
                <option value="">Select branch</option>
                {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.fieldLabel}>Estimated Delivery</label>
              <input
                type="date"
                value={formDeliveryDate}
                onChange={e => setFormDeliveryDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          {/* Items section */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <label style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--on-surface)' }}>
                Order Items *
              </label>
              <button onClick={addItemRow} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.375rem 0.75rem', background: 'var(--surface-container)', border: '1px solid var(--outline-variant)', borderRadius: '0.5rem', cursor: 'pointer', fontSize: '0.8rem', color: 'var(--on-surface-variant)', fontFamily: 'inherit' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>add</span>
                Add item
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {orderItems.map((item, idx) => {
                const batches = getProductBatches(item.productId);
                return (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 100px 36px', gap: '0.625rem', alignItems: 'end' }}>
                    <div>
                      {idx === 0 && <label style={styles.fieldLabel}>Product</label>}
                      <select
                        value={item.productId}
                        onChange={e => updateItem(idx, 'productId', e.target.value)}
                        style={styles.input}
                      >
                        <option value="">Select product</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      {idx === 0 && <label style={styles.fieldLabel}>Batch</label>}
                      <select
                        value={item.batchId}
                        onChange={e => updateItem(idx, 'batchId', e.target.value)}
                        disabled={!item.productId}
                        style={{ ...styles.input, opacity: !item.productId ? 0.5 : 1 }}
                      >
                        <option value="">Select batch</option>
                        {batches.map(b => (
                          <option key={b.id} value={b.id}>
                            {b.batchNumber ?? b.id.slice(-6)} — {b.quantity} units{b.expiryDate ? ` · exp ${new Date(b.expiryDate).toLocaleDateString()}` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      {idx === 0 && <label style={styles.fieldLabel}>Qty</label>}
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={e => updateItem(idx, 'quantity', e.target.value)}
                        style={styles.input}
                      />
                    </div>
                    <div style={{ paddingBottom: idx === 0 ? '0' : '0' }}>
                      {idx === 0 && <div style={{ height: '1.25rem' }} />}
                      <button
                        onClick={() => removeItemRow(idx)}
                        disabled={orderItems.length === 1}
                        title="Remove item"
                        style={{
                          width: '36px',
                          height: '38px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          border: 'none',
                          borderRadius: '0.5rem',
                          background: orderItems.length === 1 ? 'var(--surface-container)' : 'var(--error-container)',
                          color: orderItems.length === 1 ? 'var(--outline-variant)' : 'var(--error)',
                          cursor: orderItems.length === 1 ? 'default' : 'pointer',
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>remove</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--outline-variant)' }}>
            <button onClick={resetForm} style={styles.ghostBtn}>Cancel</button>
            <button
              onClick={handleCreate}
              disabled={!isFormValid || creating}
              style={{ ...styles.primaryBtn, opacity: !isFormValid || creating ? 0.6 : 1 }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>send</span>
              {creating ? 'Creating...' : 'Create Order'}
            </button>
          </div>
        </div>
      )}

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: '0.375rem', background: 'var(--surface-container)', padding: '0.25rem', borderRadius: '0.625rem', alignSelf: 'flex-start', marginBottom: '1.25rem', width: 'fit-content' }}>
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            style={{
              padding: '0.375rem 0.875rem',
              border: 'none',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: 500,
              fontFamily: 'inherit',
              background: statusFilter === tab.key ? 'white' : 'transparent',
              color: statusFilter === tab.key ? 'var(--sidebar-primary)' : 'var(--on-surface-variant)',
              boxShadow: statusFilter === tab.key ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Orders table */}
      {ordersLoading && <p style={{ color: 'var(--on-surface-variant)' }}>Loading orders...</p>}
      {ordersError && <p style={{ color: 'var(--error)' }}>Error: {ordersError.message}</p>}
      {!ordersLoading && !ordersError && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Order ID', 'From', 'To Branch', 'Items', 'Est. Delivery', 'Created', 'Status', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>
                      <span className="material-symbols-outlined" style={{ display: 'block', fontSize: '2.5rem', marginBottom: '0.5rem' }}>swap_horiz</span>
                      No transfer orders{statusFilter !== 'ALL' ? ` with status ${statusFilter.toLowerCase()}` : ''}
                    </td>
                  </tr>
                )}
                {orders.map((order, idx) => {
                  const cfg = STATUS_CONFIG[order.status];
                  return (
                    <tr key={order.id} style={{ borderTop: '1px solid var(--outline-variant)', background: idx % 2 === 0 ? 'white' : 'var(--surface-container-lowest)' }}>
                      <td style={styles.td}>
                        <code style={{ fontSize: '0.78rem', background: 'var(--surface-container)', padding: '0.1rem 0.375rem', borderRadius: '0.25rem', color: 'var(--on-surface-variant)' }}>
                          #{order.id.slice(-8).toUpperCase()}
                        </code>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>{order.warehouse?.name ?? '—'}</td>
                      <td style={{ ...styles.td, fontWeight: 500 }}>{order.branch?.name ?? '—'}</td>
                      <td style={styles.td}>
                        <span style={{ padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'var(--surface-container)', fontSize: '0.8rem', fontWeight: 500 }}>
                          {(order.items ?? []).length} item{(order.items ?? []).length !== 1 ? 's' : ''}
                        </span>
                      </td>
                      <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>{formatDate(order.estimatedDeliveryDate)}</td>
                      <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>{formatDate(order.createdAt)}</td>
                      <td style={styles.td}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                          padding: '0.25rem 0.625rem',
                          borderRadius: '9999px',
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          background: cfg.bg,
                          color: cfg.color,
                        }}>
                          <span className="material-symbols-outlined" style={{ fontSize: '0.875rem' }}>{cfg.icon}</span>
                          {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {order.status === 'PENDING' && (
                          dispatchConfirmId === order.id ? (
                            <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', color: '#0c447c', whiteSpace: 'nowrap' }}>Dispatch?</span>
                              <button onClick={() => handleDispatch(order.id)} style={{ padding: '0.25rem 0.5rem', background: 'var(--sidebar-primary)', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>Yes</button>
                              <button onClick={() => setDispatchConfirmId(null)} style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-container)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDispatchConfirmId(order.id)}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                                padding: '0.375rem 0.75rem',
                                background: 'var(--sidebar-gradient)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                fontFamily: 'inherit',
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: '0.9rem' }}>local_shipping</span>
                              Dispatch
                            </button>
                          )
                        )}
                        {order.status === 'DISPATCHED' && (
                          <span style={{ fontSize: '0.8rem', color: 'var(--on-surface-variant)' }}>
                            {order.dispatchedAt ? `Sent ${formatDate(order.dispatchedAt)}` : 'In transit'}
                          </span>
                        )}
                        {order.status === 'RECEIVED' && (
                          <span style={{ fontSize: '0.8rem', color: '#085041' }}>Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--outline-variant)', fontSize: '0.8rem', color: 'var(--outline)', background: 'var(--surface-container-lowest)' }}>
            {orders.length} order{orders.length !== 1 ? 's' : ''}
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
    padding: '0.875rem 1rem',
    fontSize: '0.875rem',
    color: 'var(--on-surface)',
    whiteSpace: 'nowrap',
  },
};
