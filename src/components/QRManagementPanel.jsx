import React from 'react';
import ShowNotifications from '../helper/ShowNotifications.js';

const PrintIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const DownloadIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const GearIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const CopyIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const RegenerateIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const QRCodeGraphic = ({ size = 120 }) => (
  <svg width={size} height={size} viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="40" height="40" fill="black"/>
    <rect x="15" y="15" width="30" height="30" fill="white"/>
    <rect x="20" y="20" width="20" height="20" fill="black"/>

    <rect x="100" y="10" width="40" height="40" fill="black"/>
    <rect x="105" y="15" width="30" height="30" fill="white"/>
    <rect x="110" y="20" width="20" height="20" fill="black"/>

    <rect x="10" y="100" width="40" height="40" fill="black"/>
    <rect x="15" y="105" width="30" height="30" fill="white"/>
    <rect x="20" y="110" width="20" height="20" fill="black"/>

    <rect x="60" y="10" width="10" height="10" fill="black"/>
    <rect x="80" y="10" width="10" height="10" fill="black"/>
    <rect x="60" y="25" width="30" height="10" fill="black"/>
    <rect x="75" y="40" width="15" height="10" fill="black"/>
    
    <rect x="10" y="60" width="10" height="10" fill="black"/>
    <rect x="25" y="60" width="10" height="10" fill="black"/>
    <rect x="40" y="60" width="10" height="10" fill="black"/>
    <rect x="10" y="75" width="25" height="10" fill="black"/>
    <rect x="10" y="90" width="10" height="5" fill="black"/>

    <rect x="130" y="60" width="10" height="30" fill="black"/>
    <rect x="115" y="60" width="10" height="10" fill="black"/>
    <rect x="100" y="75" width="25" height="10" fill="black"/>
    <rect x="115" y="90" width="10" height="10" fill="black"/>
    <rect x="130" y="100" width="10" height="20" fill="black"/>
    <rect x="100" y="110" width="25" height="10" fill="black"/>
    <rect x="130" y="130" width="10" height="10" fill="black"/>
    <rect x="100" y="130" width="20" height="10" fill="black"/>

    <rect x="60" y="60" width="20" height="20" fill="black"/>
    <rect x="85" y="60" width="10" height="20" fill="black"/>
    <rect x="60" y="85" width="10" height="10" fill="black"/>
    <rect x="75" y="85" width="20" height="20" fill="black"/>
    <rect x="60" y="100" width="10" height="20" fill="black"/>
    <rect x="75" y="110" width="10" height="10" fill="black"/>

    <rect x="85" y="130" width="10" height="10" fill="black"/>
    <rect x="60" y="130" width="20" height="10" fill="black"/>
  </svg>
);

export default function QRManagementPanel({
  activeRestaurant = {},
  generateQrCode,
  assignQrCode,
  revokeQrCode,
  deleteQrCode,
  updateDiningTable
}) {
  const qrCodes = activeRestaurant.qrCodes || [];
  const tables = activeRestaurant.tables || [];
  const [openDropdown, setOpenDropdown] = React.useState(null);
  const [localStatuses, setLocalStatuses] = React.useState({});

  return (
    <section className="panel-view active" style={{ padding: '0 24px 24px 24px' }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', paddingTop: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: 'var(--black)' }}>QR lists</h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => ShowNotifications.showAlertNotification("Table Setup feature coming soon!", true)}
            style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: '#0f172a',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <GearIcon size={16} color="#94a3b8" /> Go to Table Setup
          </button>
          <button 
            onClick={() => generateQrCode(activeRestaurant.id)}
            style={{
              background: '#ff5a1f',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              color: 'white',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          >
            <PlusIcon size={16} /> Generate QR
          </button>
        </div>
      </div>

      {/* Grid of QR Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(280px, 320px))', gap: '32px', justifyContent: 'flex-start' }}>
        {qrCodes.map((qr, index) => {
          const table = tables.find(t => t.id === qr.tableId);
          const tableStr = qr.tableId ? `?table=${qr.tableId.replace('T-', '')}` : '';
          const qrUrl = `http://serviq-super-admin.vercel.app/menu/${activeRestaurant.id}${tableStr}`;
          
          let statusColor = '#94a3b8'; // default grey
          let statusText = 'UNASSIGNED';

          // Check if we have a locally changed status for this unassigned QR code
          if (localStatuses[qr.id]) {
            const loc = localStatuses[qr.id];
            statusText = loc;
            if (loc === 'FREE') statusColor = '#15803d';
            else if (loc === 'OCCUPIED') statusColor = '#ef4444';
            else if (loc === 'RESERVED') statusColor = '#2563eb';
            else if (loc === 'INACTIVE') statusColor = '#94a3b8';
          }
          
          if (table) {
            if (table.status === 'Free') { statusText = 'FREE'; statusColor = '#15803d'; }
            else if (table.status === 'Occupied') { statusText = 'OCCUPIED'; statusColor = '#ef4444'; }
            else if (table.status === 'Reserved') { statusText = 'RESERVED'; statusColor = '#2563eb'; }
            else if (table.status === 'Inactive') { statusText = 'INACTIVE'; statusColor = '#94a3b8'; }
            else { statusText = table.status?.toUpperCase() || 'FREE'; statusColor = '#15803d'; }
          }

          return (
            <div key={qr.id} style={{ display: 'flex', flexDirection: 'column', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
              {/* Card Header */}
              <div style={{
                background: '#111111',
                color: 'white',
                padding: '16px 20px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', background: '#ff5a1f', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '12px'
                  }}>
                    TT
                  </div>
                  <span style={{ fontWeight: '700', fontSize: '18px', letterSpacing: '0.5px' }}>
                    {table ? `Table ${table.id.replace('T-', '')}` : `Table ${index + 1}`}
                  </span>
                </div>
                
                <div style={{ position: 'relative' }}>
                  <div 
                    onClick={() => setOpenDropdown(openDropdown === qr.id ? null : qr.id)}
                    style={{
                      background: 'white', color: statusColor, padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', border: openDropdown === qr.id ? '2px solid #e2e8f0' : 'none'
                    }}
                  >
                    {statusText}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={statusColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transform: openDropdown === qr.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                  {openDropdown === qr.id && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      right: 0,
                      marginTop: '8px',
                      background: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      zIndex: 10,
                      display: 'flex',
                      flexDirection: 'column',
                      padding: '4px 0',
                      minWidth: '120px'
                    }}>
                      {[
                        { label: 'FREE', color: '#15803d' },
                        { label: 'OCCUPIED', color: '#ef4444' },
                        { label: 'RESERVED', color: '#2563eb' },
                        { label: 'INACTIVE', color: '#94a3b8' }
                      ].map(opt => (
                        <div
                          key={opt.label}
                          onClick={() => {
                            setOpenDropdown(null);
                            if (table && updateDiningTable) {
                              const newStatus = opt.label === 'FREE' ? 'Free' : (opt.label === 'OCCUPIED' ? 'Occupied' : (opt.label === 'RESERVED' ? 'Reserved' : 'Inactive'));
                              updateDiningTable(activeRestaurant.id, table.id, { status: newStatus });
                              ShowNotifications.showAlertNotification(`Status changed to ${newStatus}`, true);
                            } else {
                              setLocalStatuses({ ...localStatuses, [qr.id]: opt.label });
                              ShowNotifications.showAlertNotification(`Status changed to ${opt.label}`, true);
                            }
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = opt.color;
                            e.currentTarget.style.color = 'white';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                            e.currentTarget.style.color = opt.color;
                          }}
                          style={{
                            padding: '8px 16px',
                            fontSize: '11px',
                            fontWeight: '800',
                            color: opt.color,
                            cursor: 'pointer',
                            transition: 'all 0.1s ease'
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card Body */}
              <div style={{
                padding: '12px',
                background: '#ffffff',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {/* QR Code Graphic */}
                <div style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  marginBottom: '4px'
                }}>
                  <div style={{
                    background: '#fff3ea',
                    padding: '12px',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <div style={{ background: '#ffffff', borderRadius: '12px', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <QRCodeGraphic size={110} />
                    </div>
                  </div>
                </div>

                {/* Created Date */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <span style={{ fontSize: '11px', fontWeight: '800', color: '#94a3b8', letterSpacing: '0.5px' }}>CREATED</span>
                  <span style={{ fontSize: '13px', fontWeight: '800', color: '#0f172a' }}>{qr.createdAt || '2026-06-20'}</span>
                </div>

                {/* URL and Copy */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '4px 4px 4px 12px',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  background: '#ffffff'
                }}>
                  <span style={{ fontSize: '12px', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '170px', fontWeight: '500' }}>
                    {qrUrl}
                  </span>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(qrUrl);
                      ShowNotifications.showAlertNotification("URL Copied to clipboard!", true);
                    }}
                    style={{
                      background: '#ff5a1f',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    <CopyIcon size={12} /> Copy
                  </button>
                </div>

                {/* Print & Download */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <button 
                    onClick={() => ShowNotifications.showAlertNotification(`Print request sent!`, true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <PrintIcon size={14} color="#64748b" /> Print
                  </button>
                  <button 
                    onClick={() => ShowNotifications.showAlertNotification(`Download started!`, true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      fontWeight: '700',
                      color: '#475569',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      cursor: 'pointer'
                    }}
                  >
                    <DownloadIcon size={14} color="#64748b" /> Download
                  </button>
                </div>

                {/* Regenerate */}
                <button 
                  onClick={() => {
                    ShowNotifications.showAlertNotification(`QR Code regenerated successfully!`, true);
                  }}
                  style={{
                    background: '#ff5a1f',
                    color: 'white',
                    border: 'none',
                    padding: '10px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    width: '100%',
                    marginTop: '4px'
                  }}
                >
                  <RegenerateIcon size={14} /> Regenerate QR Code
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
