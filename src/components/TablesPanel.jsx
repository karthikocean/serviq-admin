import React from 'react';
import { useAppState } from '../config/AppContext';

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

const PrintIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
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
  orders = [],
  activeRestaurant = {},
  updateDiningTable,
  deleteDiningTable,
  handleOpenAssignTablesModal,
  setAddTableForm,
  setActivePage
}) {
  const { assignQrCode, revokeQrCode } = useAppState();
  const occupiedTablesCount = tables.filter(t => t.status === 'Occupied').length;
  
  const qrCodes = activeRestaurant.qrCodes || [];
  const unassignedQrCodes = qrCodes.filter(q => q.status === 'Unassigned');

  const getTableWaiterInfo = (t) => {
    const primary = staff.find(s => s.id === t.assignedWaiterId);
    const cover = staff.find(s => s.id === t.tempWaiterId);
    return { primary, cover };
  };

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">Dining Tables Registry</h2>
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
              <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>TABLE ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SEATS CAPACITY</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PRIMARY WAITER</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>COVER WAITER</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>ACTIVE SESSION</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '220px' }}>LINKED QR CODE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', width: '280px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {tables.map(table => {
                const { primary, cover } = getTableWaiterInfo(table);
                const tableNum = table.id.replace('T-', '');
                const activeTableOrder = orders.find(o => (o.table === tableNum || parseInt(o.table) === parseInt(tableNum)) && o.billingStatus === 'unpaid');
                
                return (
                  <tr key={table.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* Table ID */}
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{table.id}</td>
                    
                    {/* Inline Seats Capacity Edit */}
                    <td style={{ padding: '14px' }}>
                      <input
                        type="number"
                        min="1"
                        max="20"
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

                    {/* Read-Only Primary Waiter */}
                    <td style={{ padding: '14px' }}>
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
                    </td>

                    {/* Read-Only Cover Waiter */}
                    <td style={{ padding: '14px' }}>
                      {cover ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: '600', color: 'var(--text-main)', textDecoration: cover.status === 'Off Duty' ? 'line-through' : 'none', opacity: cover.status === 'Off Duty' ? 0.7 : 1 }}>
                            {cover.name}
                          </span>
                          <span style={{ 
                            padding: '2px 8px', 
                            borderRadius: '12px', 
                            fontSize: '10px', 
                            fontWeight: '700', 
                            backgroundColor: cover.status === 'On Duty' ? '#dcfce7' : '#fee2e2', 
                            color: cover.status === 'On Duty' ? '#15803d' : '#ef4444',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: cover.status === 'On Duty' ? '#2ebd59' : '#ef4444', display: 'inline-block' }}></span>
                            {cover.status === 'On Duty' ? 'On Duty' : 'Off Duty'}
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>None</span>
                      )}
                    </td>

                    {/* Active Session info */}
                    <td style={{ padding: '14px', color: 'var(--text-main)' }}>
                      {activeTableOrder ? (
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: 600 }}>#ORD-{activeTableOrder.id}</span>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>₹{activeTableOrder.total}</span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>-</span>
                      )}
                    </td>

                    {/* Linked QR Code (dropdown to map to unassigned QRs) */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {table.assignedQrId ? (
                          <>
                            <span style={{
                              fontWeight: '700',
                              fontSize: '12px',
                              backgroundColor: 'var(--primary-light)',
                              color: 'var(--primary)',
                              padding: '4px 10px',
                              borderRadius: '6px',
                              border: '1px solid var(--primary-light)'
                            }}>
                              {table.assignedQrId}
                            </span>
                            <button
                              title="Unlink QR Code"
                              onClick={() => revokeQrCode(activeRestaurant.id, table.assignedQrId)}
                              style={{
                                border: '1px solid var(--border)',
                                background: '#fef2f2',
                                color: '#ef4444',
                                padding: '4px 8px',
                                fontSize: '11px',
                                fontWeight: 700,
                                borderRadius: '6px',
                                cursor: 'pointer'
                              }}
                            >
                              Unlink
                            </button>
                          </>
                        ) : (
                          <select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                assignQrCode(activeRestaurant.id, e.target.value, table.id);
                              }
                            }}
                            style={{
                              padding: '6px 8px',
                              borderRadius: '6px',
                              border: '1px solid var(--border)',
                              backgroundColor: 'var(--bg-primary)',
                              color: 'var(--text-muted)',
                              fontSize: '12px',
                              fontWeight: '600',
                              width: '100%',
                              cursor: 'pointer'
                            }}
                          >
                            <option value="">Link QR Code...</option>
                            {unassignedQrCodes.map(q => (
                              <option key={q.id} value={q.id}>
                                {q.id}
                              </option>
                            ))}
                          </select>
                        )}
                      </div>
                    </td>

                    {/* Unified Actions Column (consistently styled, prevents button wrap) */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <button 
                          className="table-action-btn" 
                          title="Print Table QR Sticker"
                          onClick={() => {
                            if (table.assignedQrId) {
                              alert(`Sticker template print sent for Table ${tableNum} (${table.assignedQrId})!`);
                            } else {
                              alert(`Please link a QR Code to Table ${tableNum} first.`);
                            }
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                        >
                          <PrintIcon size={12} />
                          Print
                        </button>
                        <button 
                          className="table-action-btn" 
                          title="Download Table QR vector SVG"
                          onClick={() => {
                            if (table.assignedQrId) {
                              alert(`SVG downloaded for Table ${tableNum} (${table.assignedQrId})!`);
                            } else {
                              alert(`Please link a QR Code to Table ${tableNum} first.`);
                            }
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                        >
                          <DownloadIcon size={12} />
                          SVG
                        </button>
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
                            if (window.confirm(`Are you sure you want to delete Table ${table.id}?`)) {
                              deleteDiningTable(activeRestaurant.id, table.id);
                            }
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
    </section>
  );
}
