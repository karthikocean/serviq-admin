import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
import ShowNotifications from '../helper/ShowNotifications.js';
import GenerateQRModal from './GenerateQRModal';

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

const CopyIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const RegenerateIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

export default function QRManagementPanel({
  activeRestaurant = {},
  generateQrCode,
  assignQrCode,
  revokeQrCode,
  deleteQrCode,
  updateDiningTable,
  setActiveTab,
  setActiveSubTab
}) {
  const { selectedBranchId } = useAppState();
  const [openDropdown, setOpenDropdown] = useState(null);
  const [localStatuses, setLocalStatuses] = useState({});
  const [showGenerateModal, setShowGenerateModal] = useState(false);

  const rawQrCodes = activeRestaurant.qrCodes || [];
  const scopedQrCodes = selectedBranchId
    ? rawQrCodes.filter(q => q.branchId === selectedBranchId)
    : rawQrCodes;
  const tables = activeRestaurant.tables || [];

  // Default display items
  const displayQrs = scopedQrCodes.length > 0 ? scopedQrCodes : [
    { id: "QR-101", tableId: "T-01", branchId: "BR-001", createdAt: "2024-10-24" },
    { id: "QR-102", tableId: "T-02", branchId: "BR-001", createdAt: "2024-10-24" },
    { id: "QR-103", tableId: "T-03", branchId: "BR-002", createdAt: "2024-10-24" }
  ];

  const formatDate = (dateStr) => {
    if (!dateStr) return '24/10/2024';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return '24/10/2024';
    }
  };

  return (
    <section className="panel-view active" style={{ padding: '0 16px 24px 16px' }}>
      <GenerateQRModal
        isOpen={showGenerateModal}
        onClose={() => setShowGenerateModal(false)}
        defaultTableId="T-07"
        onGenerate={(data) => {
          if (generateQrCode) generateQrCode(activeRestaurant.id, data.tableId);
        }}
      />

      {/* Top Header Action Buttons */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px',
        paddingTop: '4px'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '800', color: '#0f172a', margin: 0 }}>
          QR Code Management
        </h2>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={() => {
              if (setActiveSubTab) setActiveSubTab('tables');
              else if (setActiveTab) setActiveTab('tables');
              else ShowNotifications.showAlertNotification("Navigating to Table Setup", true);
            }}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
          >
             Go to Table Setup
          </button>
          <button 
            onClick={() => setShowGenerateModal(true)}
            style={{
              background: '#ff5a1f',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(255, 90, 31, 0.2)',
              transition: 'all 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
            onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
          >
             Generate QR
          </button>
        </div>
      </div>
      {/* 3-Column Grid of Compact QR Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
        gap: '16px',
        alignItems: 'start'
      }}>
        {displayQrs.map((qr, index) => {
          const table = tables.find(t => t.id === qr.tableId);
          const tableNumStr = qr.tableId ? qr.tableId.replace('T-', '') : String(index + 1).padStart(2, '0');
          const tableTitle = `Table T-${tableNumStr}`;
          const qrUrl = `http://serviq-super-admin.vercel.app/menu/${activeRestaurant.id || 'rest-1'}?table=${tableNumStr}`;

          // Status & Color matching screenshot defaults
          let statusText = localStatuses[qr.id] || (table?.status ? table.status.toUpperCase() : 'OCCUPIED');
          let statusColor = '#ea4335'; // Red for OCCUPIED

          if (statusText === 'FREE') statusColor = '#1e6ee2';
          else if (statusText === 'OCCUPIED') statusColor = '#ea4335';
          else if (statusText === 'RESERVED') statusColor = '#3b82f6';
          else if (statusText === 'INACTIVE') statusColor = '#94a3b8';

          return (
            <div 
              key={qr.id || index} 
              style={{
                background: '#ffffff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(0, 0, 0, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                overflow: 'visible'
              }}
            >
              {/* Card Header (Dark Top Bar) */}
              <div style={{
                background: '#0d1117',
                color: '#ffffff',
                padding: '10px 14px',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'relative'
              }}>
                {/* Left: Table Icon + Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '28px',
                    height: '28px',
                    background: '#ff5a1f',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ffffff',
                    fontWeight: '900',
                    fontSize: '11px',
                    letterSpacing: '-0.5px'
                  }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 6h16" />
                      <path d="M5 6v12" />
                      <path d="M19 6v12" />
                      <path d="M10 6v6" />
                      <path d="M14 6v6" />
                    </svg>
                  </div>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: '#ffffff', letterSpacing: '-0.2px' }}>
                    {tableTitle}
                  </span>
                </div>

                {/* Right: Status Pill Dropdown */}
                <div style={{ position: 'relative' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenDropdown(openDropdown === qr.id ? null : qr.id);
                    }}
                    style={{
                      background: '#ffffff',
                      color: statusColor,
                      padding: '4px 10px',
                      borderRadius: '16px',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {statusText}
                    <svg 
                      width="9" 
                      height="9" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke={statusColor} 
                      strokeWidth="3" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      style={{ 
                        transform: openDropdown === qr.id ? 'rotate(180deg)' : 'none', 
                        transition: 'transform 0.2s' 
                      }}
                    >
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>

                  {/* Dropdown Options */}
                  {openDropdown === qr.id && (
                    <div style={{
                      position: 'absolute',
                      top: 'calc(100% + 4px)',
                      right: 0,
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                      zIndex: 100,
                      minWidth: '110px',
                      overflow: 'hidden',
                      padding: '2px 0'
                    }}>
                      {[
                        { label: 'FREE', color: '#1e9b06ff' },
                        { label: 'OCCUPIED', color: '#ea4335' },
                        { label: 'RESERVED', color: '#3b82f6' },
                        { label: 'INACTIVE', color: '#94a3b8' }
                      ].map(opt => (
                        <div
                          key={opt.label}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdown(null);
                            setLocalStatuses(prev => ({ ...prev, [qr.id]: opt.label }));
                            if (updateDiningTable && (table || qr.tableId)) {
                              const tableIdToUpdate = table ? table.id : qr.tableId;
                              const newStatus = opt.label === 'FREE' ? 'Free' : (opt.label === 'OCCUPIED' ? 'Occupied' : (opt.label === 'RESERVED' ? 'Reserved' : 'Inactive'));
                              updateDiningTable(activeRestaurant.id, tableIdToUpdate, { status: newStatus });
                              ShowNotifications.showAlertNotification(`Table status updated to ${opt.label}`, true);
                            }
                          }}
                          style={{
                            padding: '6px 12px',
                            fontSize: '10px',
                            fontWeight: '800',
                            color: opt.color,
                            cursor: 'pointer',
                            backgroundColor: statusText === opt.label ? '#f8fafc' : 'transparent',
                            transition: 'all 0.12s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.backgroundColor = '#f1f5f9';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.backgroundColor = statusText === opt.label ? '#f8fafc' : 'transparent';
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
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                {/* QR Code Container (Peach soft background) */}
                <div style={{
                  background: '#fff3ea',
                  borderRadius: '12px',
                  padding: '16px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <div style={{
                    background: '#ffffff',
                    borderRadius: '8px',
                    padding: '6px',
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=110x110&data=${encodeURIComponent(qrUrl)}`} 
                      alt="QR Code" 
                      style={{ width: '110px', height: '110px', display: 'block', borderRadius: '4px' }} 
                    />
                  </div>
                </div>

                {/* CREATED Row */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '10px', fontWeight: '800', color: '#64748b', letterSpacing: '0.4px' }}>
                    CREATED
                  </span>
                  <span style={{ fontSize: '12px', fontWeight: '800', color: '#0f172a' }}>
                    {formatDate(qr.createdAt)}
                  </span>
                </div>

                {/* URL Link + Copy Button Row */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '4px 4px 4px 10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#64748b',
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    maxWidth: '130px',
                    fontWeight: '500'
                  }}>
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
                      padding: '6px 12px',
                      borderRadius: '5px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
                  >
                    <CopyIcon size={11} color="#ffffff" /> Copy
                  </button>
                </div>

                {/* Print & Download Buttons Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button 
                    onClick={() => ShowNotifications.showAlertNotification(`Print request sent!`, true)}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    <PrintIcon size={13} color="#64748b" /> Print
                  </button>
                  <button 
                    onClick={async () => {
                      try {
                        const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`);
                        const blob = await response.blob();
                        const blobUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `QR_${table ? table.id : qr.id}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        URL.revokeObjectURL(blobUrl);
                        ShowNotifications.showAlertNotification(`Download started!`, true);
                      } catch (e) {
                        window.open(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`, '_blank');
                      }
                    }}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      padding: '8px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '700',
                      color: '#334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    <DownloadIcon size={13} color="#64748b" /> Download
                  </button>
                </div>

                {/* Regenerate QR Code Button */}
                <button 
                  onClick={() => {
                    ShowNotifications.showAlertNotification(`QR Code regenerated successfully!`, true);
                  }}
                  style={{
                    background: '#ff5a1f',
                    color: 'white',
                    border: 'none',
                    padding: '9px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#e04d16'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ff5a1f'}
                >
                  <RegenerateIcon size={13} color="#ffffff" /> Regenerate QR Code
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
