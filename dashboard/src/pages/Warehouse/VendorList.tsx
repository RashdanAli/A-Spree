import { useState } from 'react';
import type { CSSProperties } from 'react';
import { gql } from '@apollo/client';
import { useQuery, useMutation } from '@apollo/client/react';

const GET_VENDORS = gql`
  query GetVendors {
    vendors {
      id
      name
      contactEmail
      contactPhone
      leadTimeDays
      suppliedProductIds
    }
  }
`;

const CREATE_VENDOR = gql`
  mutation CreateVendor($input: VendorInput!) {
    createVendor(input: $input) {
      id
      name
      contactEmail
      contactPhone
      leadTimeDays
      suppliedProductIds
    }
  }
`;

const UPDATE_VENDOR = gql`
  mutation UpdateVendor($id: ID!, $input: VendorInput!) {
    updateVendor(id: $id, input: $input) {
      id
      name
      contactEmail
      contactPhone
      leadTimeDays
      suppliedProductIds
    }
  }
`;

const DELETE_VENDOR = gql`
  mutation DeleteVendor($id: ID!) {
    deleteVendor(id: $id)
  }
`;

interface Vendor {
  id: string;
  name: string;
  contactEmail: string | null;
  contactPhone: string | null;
  leadTimeDays: number | null;
  suppliedProductIds: string[] | null;
}

type VendorFormData = {
  name: string;
  contactEmail: string;
  contactPhone: string;
  leadTimeDays: string;
};

const EMPTY_FORM: VendorFormData = { name: '', contactEmail: '', contactPhone: '', leadTimeDays: '' };

export default function VendorList() {
  const [showForm, setShowForm] = useState(false);
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [formData, setFormData] = useState<VendorFormData>(EMPTY_FORM);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const { data, loading, error, refetch } = useQuery<{ vendors: Vendor[] }>(GET_VENDORS);
  const [createVendor, { loading: creating }] = useMutation(CREATE_VENDOR);
  const [updateVendor, { loading: updating }] = useMutation(UPDATE_VENDOR);
  const [deleteVendor] = useMutation(DELETE_VENDOR);

  const allVendors: Vendor[] = data?.vendors ?? [];
  const vendors = allVendors.filter(v =>
    !search || (v.name ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (v.contactEmail ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditingVendor(null);
    setFormData(EMPTY_FORM);
    setShowForm(true);
  };

  const openEdit = (vendor: Vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor.name ?? '',
      contactEmail: vendor.contactEmail ?? '',
      contactPhone: vendor.contactPhone ?? '',
      leadTimeDays: vendor.leadTimeDays != null ? String(vendor.leadTimeDays) : '',
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingVendor(null);
    setFormData(EMPTY_FORM);
  };

  const handleSubmit = async () => {
    if (!formData.name) return;
    const input = {
      name: formData.name,
      contactEmail: formData.contactEmail || undefined,
      contactPhone: formData.contactPhone || undefined,
      leadTimeDays: formData.leadTimeDays ? Number(formData.leadTimeDays) : undefined,
    };
    if (editingVendor) {
      await updateVendor({ variables: { id: editingVendor.id, input } });
    } else {
      await createVendor({ variables: { input } });
      refetch();
    }
    closeForm();
  };

  const handleDelete = async (id: string) => {
    await deleteVendor({ variables: { id } });
    setDeleteConfirmId(null);
    refetch();
  };

  const isSaving = creating || updating;
  const isEditing = editingVendor != null;

  return (
    <div className="page-content">
      <div style={styles.pageHeader}>
        <div>
          <h1 className="header-title">Vendor List</h1>
          <p style={styles.subtitle}>Manage your supplier network</p>
        </div>
        <button onClick={openCreate} style={styles.primaryBtn}>
          <span className="material-symbols-outlined" style={{ fontSize: '1.1rem' }}>add</span>
          Add Vendor
        </button>
      </div>

      {/* Slide-in form panel */}
      {showForm && (
        <>
          <div
            onClick={closeForm}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.25)', zIndex: 40, backdropFilter: 'blur(2px)' }}
          />
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '420px',
            maxWidth: '90vw',
            background: 'var(--surface)',
            boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Panel header */}
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--outline-variant)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--on-surface)' }}>
                {isEditing ? 'Edit Vendor' : 'New Vendor'}
              </h2>
              <button onClick={closeForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: '0.25rem' }}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Panel body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={styles.fieldLabel}>Vendor Name *</label>
                <input
                  value={formData.name}
                  onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Global Foods Ltd."
                  style={styles.input}
                  autoFocus
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Contact Email</label>
                <input
                  type="email"
                  value={formData.contactEmail}
                  onChange={e => setFormData(f => ({ ...f, contactEmail: e.target.value }))}
                  placeholder="contact@vendor.com"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Contact Phone</label>
                <input
                  value={formData.contactPhone}
                  onChange={e => setFormData(f => ({ ...f, contactPhone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  style={styles.input}
                />
              </div>
              <div>
                <label style={styles.fieldLabel}>Lead Time (days)</label>
                <input
                  type="number"
                  value={formData.leadTimeDays}
                  onChange={e => setFormData(f => ({ ...f, leadTimeDays: e.target.value }))}
                  placeholder="e.g. 3"
                  style={styles.input}
                />
              </div>

              {isEditing && editingVendor && (
                <div style={{ marginTop: '0.5rem', padding: '0.875rem', background: 'var(--surface-container-low)', borderRadius: '0.5rem' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--outline)', marginBottom: '0.25rem' }}>Vendor ID</p>
                  <code style={{ fontSize: '0.78rem', color: 'var(--on-surface-variant)' }}>{editingVendor.id}</code>
                </div>
              )}
            </div>

            {/* Panel footer */}
            <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--outline-variant)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button onClick={closeForm} style={styles.ghostBtn}>Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!formData.name || isSaving}
                style={{ ...styles.primaryBtn, opacity: !formData.name || isSaving ? 0.6 : 1 }}
              >
                {isSaving ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Vendor')}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Search */}
      <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
        <div style={styles.searchWrapper}>
          <span className="material-symbols-outlined" style={{ color: 'var(--outline)', fontSize: '1.1rem' }}>search</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search vendors..."
            style={{ border: 'none', outline: 'none', flex: 1, fontSize: '0.875rem', background: 'transparent', color: 'var(--on-surface)' }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--outline)', display: 'flex', padding: 0 }}>
              <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>close</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading && <p style={{ color: 'var(--on-surface-variant)' }}>Loading vendors...</p>}
      {error && <p style={{ color: 'var(--error)' }}>Error: {error.message}</p>}
      {!loading && !error && (
        <div className="glass-panel" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: 'var(--surface-container-low)' }}>
                  {['Vendor', 'Email', 'Phone', 'Lead Time', 'Products', 'Actions'].map(h => (
                    <th key={h} style={styles.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {vendors.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--outline)' }}>
                      <span className="material-symbols-outlined" style={{ display: 'block', fontSize: '2.5rem', marginBottom: '0.5rem' }}>local_shipping</span>
                      {search ? 'No vendors match your search' : 'No vendors yet — add your first supplier'}
                    </td>
                  </tr>
                )}
                {vendors.map((vendor, idx) => (
                  <tr key={vendor.id} style={{ borderTop: '1px solid var(--outline-variant)', background: idx % 2 === 0 ? 'white' : 'var(--surface-container-lowest)' }}>
                    <td style={styles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '0.5rem',
                          background: 'var(--sidebar-gradient)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.875rem',
                          flexShrink: 0,
                        }}>
                          {(vendor.name ?? '?').charAt(0).toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 500 }}>{vendor.name}</span>
                      </div>
                    </td>
                    <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>
                      {vendor.contactEmail ? (
                        <a href={`mailto:${vendor.contactEmail}`} style={{ color: 'var(--sidebar-primary)', textDecoration: 'none' }}>
                          {vendor.contactEmail}
                        </a>
                      ) : '—'}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>{vendor.contactPhone ?? '—'}</td>
                    <td style={styles.td}>
                      {vendor.leadTimeDays != null ? (
                        <span style={{ padding: '0.2rem 0.625rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 500, background: '#e6f1fb', color: '#0c447c' }}>
                          {vendor.leadTimeDays}d
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ ...styles.td, color: 'var(--on-surface-variant)' }}>
                      {(vendor.suppliedProductIds ?? []).length > 0
                        ? `${vendor.suppliedProductIds!.length} product${vendor.suppliedProductIds!.length !== 1 ? 's' : ''}`
                        : '—'}
                    </td>
                    <td style={styles.td}>
                      {deleteConfirmId === vendor.id ? (
                        <div style={{ display: 'flex', gap: '0.375rem', alignItems: 'center' }}>
                          <span style={{ fontSize: '0.75rem', color: 'var(--error)', whiteSpace: 'nowrap' }}>Delete?</span>
                          <button onClick={() => handleDelete(vendor.id)} style={{ padding: '0.25rem 0.5rem', background: 'var(--error)', color: 'white', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>Yes</button>
                          <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '0.25rem 0.5rem', background: 'var(--surface-container)', border: 'none', borderRadius: '0.375rem', cursor: 'pointer', fontSize: '0.75rem', fontFamily: 'inherit' }}>No</button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '0.375rem' }}>
                          <button onClick={() => openEdit(vendor)} title="Edit" style={styles.iconBtn}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>edit</span>
                          </button>
                          <button onClick={() => setDeleteConfirmId(vendor.id)} title="Delete" style={{ ...styles.iconBtn, color: 'var(--error)', background: 'var(--error-container)' }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>delete</span>
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--outline-variant)', fontSize: '0.8rem', color: 'var(--outline)', background: 'var(--surface-container-lowest)' }}>
            {vendors.length} vendor{vendors.length !== 1 ? 's' : ''}
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
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    flex: 1,
    maxWidth: '360px',
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
    padding: '0.625rem 0.875rem',
    border: '1px solid var(--outline-variant)',
    borderRadius: '0.625rem',
    fontSize: '0.875rem',
    background: 'white',
    outline: 'none',
    color: 'var(--on-surface)',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
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
