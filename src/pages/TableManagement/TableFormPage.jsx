import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import ShowNotifications from '../../helper/ShowNotifications';

export default function TableFormPage() {
  const navigate = useNavigate();
  const { tableId } = useParams();
  const { activeRestaurant, addDiningTable, updateDiningTable, selectedBranchId } = useAppState();

  const branches = activeRestaurant?.branches || [];
  const isEdit = !!tableId;
  const existingTable = isEdit && activeRestaurant?.tables 
    ? activeRestaurant.tables.find(t => t.id === tableId || t.id === `T-${tableId}`) 
    : null;

  const [form, setForm] = useState({
    id: tableId ? (tableId.startsWith('T-') ? tableId : `T-${tableId}`) : '',
    branchId: selectedBranchId || (branches.length > 0 ? branches[0].id : 'BR-001'),
    name: '',
    seats: 4,
    section: 'Main Dining',
    status: 'Free'
  });

  useEffect(() => {
    if (existingTable) {
      setForm({
        id: existingTable.id,
        branchId: existingTable.branchId || (selectedBranchId || 'BR-001'),
        name: existingTable.name || '',
        seats: existingTable.seats || 4,
        section: existingTable.section || 'Main Dining',
        status: existingTable.status || 'Free'
      });
    }
  }, [existingTable, selectedBranchId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const idStr = form.id.trim();
    if (!idStr) return;

    if (isEdit) {
      if (updateDiningTable) {
        await updateDiningTable(activeRestaurant.id, idStr, {
          branchId: form.branchId,
          seats: parseInt(form.seats) || 4,
          status: form.status,
          section: form.section,
          name: form.name
        });
      }
      ShowNotifications.showAlertNotification(`Table ${idStr} updated successfully.`, true);
    } else {
      if (addDiningTable) {
        await addDiningTable(activeRestaurant.id, {
          id: idStr,
          branchId: form.branchId,
          seats: parseInt(form.seats) || 4,
          section: form.section,
          name: form.name,
          status: 'Free'
        });
      }
      ShowNotifications.showAlertNotification(`Table ${idStr} created successfully.`, true);
    }

    navigate('/tables');
  };

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Top Header Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '24px 32px',
        marginBottom: '24px',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            onClick={() => navigate('/tables')}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '8px',
              borderRadius: '50%',
              color: '#0f172a'
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
          </button>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
              {isEdit ? 'Edit Dining Table' : 'Add Dining Table'}
            </h2>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0 0' }}>
              {isEdit ? 'Update table capacity, section, and branch attribution' : 'Create new dining table and assign to restaurant branch'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Form Card */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        padding: '36px 40px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Table Number / ID *
              </label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                required
                disabled={isEdit}
                placeholder="e.g. T-08"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: isEdit ? '#f8fafc' : '#ffffff',
                  cursor: isEdit ? 'not-allowed' : 'text'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Branch Assignment *
              </label>
              <select
                value={form.branchId}
                onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                {branches.map(b => (
                  <option key={b.id} value={b.id}>
                    {b.branchName} ({b.branchCode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Seating Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={form.seats}
                onChange={(e) => setForm({ ...form, seats: e.target.value })}
                required
                placeholder="4"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Section / Area
              </label>
              <select
                value={form.section}
                onChange={(e) => setForm({ ...form, section: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Main Dining">Main Dining</option>
                <option value="Main Hall">Main Hall</option>
                <option value="AC Dining">AC Dining</option>
                <option value="Family Section">Family Section</option>
                <option value="Outdoor Terrace">Outdoor Terrace</option>
                <option value="VIP Lounge">VIP Lounge</option>
              </select>
            </div>
          </div>

          {isEdit && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                Occupancy Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: '#ffffff'
                }}
              >
                <option value="Free">Free (Available)</option>
                <option value="Occupied">Occupied</option>
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button
              type="button"
              onClick={() => navigate('/tables')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                color: '#0f172a',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                background: '#ff5a1f',
                border: 'none',
                color: '#ffffff',
                fontWeight: 700,
                borderRadius: '8px',
                padding: '10px 24px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {isEdit ? 'Save Changes' : 'Create Table'}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
