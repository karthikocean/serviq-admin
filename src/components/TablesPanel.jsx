import React from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';

// Clean SVG Icons to replace raw emojis
const WaiterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const WarningIcon = ({ size = 14, color = '#f59e0b' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

export default function TablesPanel({
  tables = [],
  staff = [],
  activeRestaurant = {},
  updateDiningTable,
  deleteDiningTable,
  handleOpenAssignTablesModal,
  setAddTableForm,
  setActivePage
}) {
  const [tableToDelete, setTableToDelete] = React.useState(null);
  const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;

  const getTableWaiterInfo = (t) => {
    const primary = staff.find(s => s.id === t.assignedWaiterId);
    return { primary };
  };

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Tables list</h2>
          <p className="panel-inner-desc">Manage seating capacity, waiters, and link tables to active ordering QR codes.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="btn btn-outline" 
            onClick={handleOpenAssignTablesModal}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <WaiterIcon size={16} />
            Assign Tables
          </button>
          <button 
            className="btn btn-black" 
            onClick={() => { setAddTableForm({ id: '', seats: 4 }); setActivePage('table-form'); }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon size={16} />
            Add Dining Table
          </button>
        </div>
      </div>

      <div className="tables-list-column" style={{ width: '100%' }}>
        {/* Metrics Cards */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="stat-main-row">
              <div className="stat-info">
                <div className="stat-label" style={{ color: '#64748b' }}>Total Tables</div>
                <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{tables.length}</h3>
                <div className="stat-sub-label green-label">Active terminals</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="stat-main-row">
              <div className="stat-info">
                <div className="stat-label" style={{ color: '#64748b' }}>Occupied</div>
                <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{occupiedTablesCount}</h3>
                <div className={`stat-sub-label ${occupiedTablesCount > 0 ? 'red-label' : 'green-label'}`}>{occupiedTablesCount} in session</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="stat-main-row">
              <div className="stat-info">
                <div className="stat-label" style={{ color: '#64748b' }}>Total Seats</div>
                <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{tables.reduce((acc, t) => acc + (t.seats || 4), 0)}</h3>
                <div className="stat-sub-label green-label">Capacity</div>
              </div>
            </div>
          </div>

          <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
            <div className="stat-main-row">
              <div className="stat-info">
                <div className="stat-label" style={{ color: '#64748b' }}>Available</div>
                <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{tables.length - occupiedTablesCount}</h3>
                <div className="stat-sub-label green-label">{tables.length - occupiedTablesCount} free</div>
              </div>
            </div>
          </div>
        </div>

        {/* Table List View */}
        <div className="menu-table-wrapper" style={{ overflowX: 'auto', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr>
                <th style={{ padding: '12px 14px' }}>TABLE ID</th>
                <th style={{ padding: '12px 14px' }}>SEATS CAPACITY</th>
                <th style={{ padding: '12px 14px' }}>STATUS</th>
                <th style={{ padding: '12px 14px' }}>PRIMARY WAITER</th>
                <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => {
                const { primary } = getTableWaiterInfo(table);
                
                return (
                  <tr key={table.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Table ID */}
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{table.id}</td>
                    
                    {/* Inline Seats Capacity Edit */}
                    <td style={{ padding: '14px' }}>
                      <input
                        type="number"
                        min="1"
                        value={table.seats || 4}
                        onChange={e => {
                          const val = parseInt(e.target.value) || 1;
                          updateDiningTable(activeRestaurant.id, table.id, { seats: val });
                        }}
                        style={{
                          width: '70px',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--bg-primary)',
                          color: 'var(--text-main)',
                          textAlign: 'center',
                          fontWeight: '600'
                        }}
                      />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '8px', 
                        fontSize: '11px', 
                        fontWeight: 700, 
                        backgroundColor: table.status === 'Occupied' ? '#fef3c7' : '#dcfce7', 
                        color: table.status === 'Occupied' ? '#d97706' : '#15803d' 
                      }}>
                        {table.status}
                      </span>
                    </td>

                    {/* Primary Waiter - Click to Assign */}
                    <td 
                      style={{ padding: '14px', cursor: 'pointer', transition: 'background-color 0.15s' }} 
                      onClick={() => handleOpenAssignTablesModal(primary?.id)}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      title="Assign Waiter"
                    >
                      {primary ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: primary.status === 'Off Duty' ? 'line-through' : 'none', opacity: primary.status === 'Off Duty' ? 0.7 : 1 }}>
                            {primary.name}
                          </span>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            backgroundColor: primary.status === 'On Duty' ? '#dcfce7' : '#fee2e2', 
                            color: primary.status === 'On Duty' ? '#15803d' : '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: primary.status === 'On Duty' ? '#2ebd59' : '#ef4444', display: 'inline-block' }}></span>
                            {primary.status === 'On Duty' ? 'On Duty' : 'Off Duty'}
                          </span>
                          {primary.status === 'Off Duty' && (
                            <span style={{ display: 'inline-flex', alignItems: 'center' }} title="Primary waiter is off duty. Cover waiter will handle tables.">
                              <WarningIcon />
                            </span>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px', fontStyle: 'italic' }}>Unassigned</span>
                      )}
                    </td>                    {/* Unified Actions Column (consistently styled, prevents button wrap) */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <button 
                          className="table-action-btn" 
                          title="Edit Table"
                          onClick={() => {
                            setAddTableForm({ id: table.id, seats: table.seats || 4, status: table.status || 'Free', isEdit: true });
                            setActivePage('table-form');
                          }}
                          style={{ padding: '6px' }}
                        >
                          <PencilIcon size={12} />
                        </button>
                        <button 
                          className="table-action-btn delete-btn" 
                          title="Delete Table"
                          onClick={() => {
                            setTableToDelete(table);
                          }}
                          style={{ padding: '6px' }}
                        >
                          <TrashIcon size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={!!tableToDelete}
        onClose={() => setTableToDelete(null)}
        title="Confirm Deletion"
        maxWidth="400px"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '10px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#fef2f2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--black)', fontSize: '15px' }}>Delete Dining Table</p>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                Are you sure you want to delete Table {tableToDelete?.id}? This action cannot be undone.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button 
              className="btn btn-outline" 
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setTableToDelete(null)}
            >
              Cancel
            </button>
            <button 
              className="btn btn-black" 
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={() => {
                if (tableToDelete) {
                  deleteDiningTable(activeRestaurant.id, tableToDelete.id);
                  setTableToDelete(null);
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
