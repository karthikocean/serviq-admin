import React, { useState } from 'react';
import { Modal } from './Modal';
import GenerateQRModal from './GenerateQRModal';

// Clean SVG Icons
const WaiterIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UserIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersGroupIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M9 21v-2a4 4 0 0 1 4-4h1" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const QrIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
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
  const [tableToDelete, setTableToDelete] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedQrTableId, setSelectedQrTableId] = useState('T-07');

  // Default sample tables matching screenshot if tables prop is empty
  const sampleTables = [
    { id: 'T-01', status: 'Free', seats: 4, assignedWaiterName: 'Rahul S.' },
    { id: 'T-02', status: 'Occupied', seats: 2, assignedWaiterName: 'Arjun K.' },
    { id: 'T-03', status: 'Occupied', seats: 4, assignedWaiterName: 'Ravi M.' },
    { id: 'T-04', status: 'Free', seats: 6, assignedWaiterName: null },
    { id: 'T-05', status: 'Occupied', seats: 2, assignedWaiterName: 'Priya M.' }
  ];

  const displayTables = tables.length > 0 ? tables : sampleTables;

  const getWaiterName = (table) => {
    if (table.assignedWaiterName) return table.assignedWaiterName;
    if (table.assignedWaiter) return table.assignedWaiter;
    if (table.assignedWaiterId) {
      const found = staff.find(s => s.id === table.assignedWaiterId);
      if (found) return found.name;
    }
    return null;
  };

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px' }}>
      <GenerateQRModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        defaultTableId={selectedQrTableId}
      />

      {/* Top Header Row */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        paddingTop: '8px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          Tables list
        </h2>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => {
              if (setActivePage) setActivePage('waiter-list');
              else if (handleOpenAssignTablesModal) handleOpenAssignTablesModal();
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
            <WaiterIcon size={16} color="#0f172a" /> Waiter List
          </button>
          
          <button 
            onClick={() => { setAddTableForm({ id: '', seats: 4 }); setActivePage('table-form'); }}
            style={{
              background: '#ff5a1f',
              border: 'none',
              padding: '10px 18px',
              borderRadius: '10px',
              fontSize: '14px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 90, 31, 0.2)',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
          >
            <PlusIcon size={16} color="#ffffff" /> Add Dining Table
          </button>
        </div>
      </div>

      {/* List of Table Row Cards Stacked Vertically */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {displayTables.map((table, index) => {
          const isFree = table.status?.toLowerCase() === 'free';
          const statusText = isFree ? 'FREE' : 'OCCUPIED';
          
          const accentColor = isFree ? '#22c55e' : '#ef4444';
          const bgBadgeColor = isFree ? '#e6f4ea' : '#fce8e6';
          const textBadgeColor = isFree ? '#16a34a' : '#dc2626';

          const tableIdStr = table.id?.startsWith('T-') ? table.id : `T-${String(table.id || index + 1).padStart(2, '0')}`;
          const waiterName = getWaiterName(table);

          return (
            <div 
              key={table.id || index}
              style={{
                background: '#ffffff',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                borderLeft: `5px solid ${accentColor}`,
                boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
                padding: '14px 24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '16px',
                transition: 'transform 0.15s, box-shadow 0.15s'
              }}
            >
              {/* Left Column: Icon Square + Table ID & Subtitle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', minWidth: '180px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: bgBadgeColor,
                  color: textBadgeColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '900',
                  fontSize: '13px',
                  letterSpacing: '-0.5px'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={textBadgeColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 6h16" />
                    <path d="M5 6v12" />
                    <path d="M19 6v12" />
                    <path d="M10 6v6" />
                    <path d="M14 6v6" />
                  </svg>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '16px', fontWeight: '800', color: '#0f172a', lineHeight: '1.2' }}>
                    {tableIdStr}
                  </span>
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#64748b', marginTop: '2px' }}>
                    Main Dining
                  </span>
                </div>
              </div>

              {/* Status Badge Column */}
              <div style={{ minWidth: '130px' }}>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.4px',
                  backgroundColor: bgBadgeColor,
                  color: textBadgeColor
                }}>
                  <span style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: textBadgeColor,
                    display: 'inline-block'
                  }}></span>
                  {statusText}
                </span>
              </div>

              {/* Seats Capacity Column */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: '#64748b',
                fontSize: '14px',
                fontWeight: '600',
                minWidth: '110px'
              }}>
                <UsersGroupIcon size={16} color="#64748b" />
                <span>{table.seats || 4} seats</span>
              </div>

              {/* Assigned Waiter Column */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                minWidth: '180px',
                flex: 1
              }}>
                {waiterName ? (
                  <>
                    <UserIcon size={15} color="#334155" />
                    <span style={{ fontWeight: '600', color: '#334155' }}>
                      {waiterName}
                    </span>
                  </>
                ) : (
                  <span style={{ color: '#94a3b8', fontStyle: 'italic', fontWeight: '500' }}>
                    No waiter assigned
                  </span>
                )}
              </div>

              {/* Actions Column */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <button 
                  onClick={() => {
                    setSelectedQrTableId(tableIdStr);
                    setShowGenerateModal(true);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ff5a1f',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#e04d16'}
                  onMouseLeave={e => e.currentTarget.style.color = '#ff5a1f'}
                  title="Generate QR Code"
                >
                  <QrIcon size={17} />
                </button>

                <button 
                  onClick={() => {
                    setAddTableForm({ id: table.id, seats: table.seats || 4, status: table.status || 'Free', isEdit: true });
                    setActivePage('table-form');
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  title="Edit Table"
                >
                  <PencilIcon size={17} />
                </button>

                <button 
                  onClick={() => setTableToDelete(table)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#ea4335',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#b91c1c'}
                  onMouseLeave={e => e.currentTarget.style.color = '#ea4335'}
                  title="Delete Table"
                >
                  <TrashIcon size={17} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
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
              <p style={{ margin: 0, fontWeight: 600, color: '#0f172a', fontSize: '15px' }}>Delete Dining Table</p>
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
                if (tableToDelete && deleteDiningTable) {
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
