import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';

// Clean SVG Icons
const TableIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M4 6h16" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M10 6v6" />
    <path d="M14 6v6" />
  </svg>
);

const UserIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const UsersGroupIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M17 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M9 21v-2a4 4 0 0 1 4-4h1" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const QrIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const PrintIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const SearchIcon = ({ size = 14, color = '#94a3b8' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
  setActivePage,
  hasPermission,
  generateQrCode,
  assignQrCode,
  revokeQrCode,
  deleteQrCode
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All' | 'Free' | 'Occupied'
  const [tableToDelete, setTableToDelete] = useState(null);
  const [viewingQrTable, setViewingQrTable] = useState(null);
  const [showBatchPrintModal, setShowBatchPrintModal] = useState(false);

  const displayTables = tables;

  const getWaiterName = (table) => {
    if (table.assignedWaiterName) return table.assignedWaiterName;
    if (table.assignedWaiter) {
      if (typeof table.assignedWaiter === 'object' && table.assignedWaiter !== null) {
        return table.assignedWaiter.name || '';
      }
      return table.assignedWaiter;
    }
    if (table.assignedWaiterId) {
      const found = staff.find(s => s.id === table.assignedWaiterId);
      if (found) return found.name;
    }
    return null;
  };


  // Filtered tables based on search and status
  const filteredTables = displayTables.filter(t => {
    const q = searchTerm.toLowerCase().trim();
    const tableIdStr = (t.id || '').toLowerCase();
    const waiter = (getWaiterName(t) || '').toLowerCase();
    const section = (t.section || '').toLowerCase();
    const matchesSearch = !q || tableIdStr.includes(q) || waiter.includes(q) || section.includes(q);

    const matchesStatus =
      statusFilter === 'All' ? true :
        statusFilter === 'Free' ? (t.status?.toLowerCase() === 'free' || t.status?.toLowerCase() === 'available') :
          statusFilter === 'Occupied' ? (t.status?.toLowerCase() === 'occupied') : true;

    return matchesSearch && matchesStatus;
  });

  // Pagination for tables (10 tables per page)
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(filteredTables.length / limit) || 1;
  const paginatedTables = filteredTables.slice((page - 1) * limit, page * limit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm, statusFilter]);

  const totalCount = displayTables.length;
  const occupiedCount = displayTables.filter(t => t.status?.toLowerCase() === 'occupied').length;
  const freeCount = displayTables.filter(t => t.status?.toLowerCase() === 'free' || t.status?.toLowerCase() === 'available').length;
  const qrCount = displayTables.filter(t => t.assignedQrId || t.qrUrl).length;
  const qrPercentage = totalCount > 0 ? Math.round((qrCount / totalCount) * 100) : 0;

  const handleCopyQrLink = (url) => {
    navigator.clipboard.writeText(url);
    ShowNotifications.showAlertNotification("Table QR Link copied to clipboard!", true);
  };

  const handleBatchPrint = () => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    document.body.appendChild(iframe);

    const qrItemsHtml = displayTables.map((t, idx) => {
      const tableIdStr = t.tableNumber || t.tableNum || `T-${String(idx + 1).padStart(2, '0')}`;
      const qrUrl = t.qrUrl || '';
      const restaurantName = activeRestaurant?.name || 'SERVIQ DINING';
      const seatsText = `${t.seatingCapacity ?? t.seats ?? 4} seats`;
      const sectionText = t.section || 'Main Dining';

      return `
        <div style="background: #ffffff; border: 1.5px solid #0f172a; border-radius: 12px; padding: 16px; text-align: center; box-shadow: 0 2px 6px rgba(0,0,0,0.03); page-break-inside: avoid;">
          <div style="font-size: 10px; font-weight: 800; color: #ff7a00; letter-spacing: 0.8px; text-transform: uppercase;">
            ${restaurantName}
          </div>
          <div style="font-size: 18px; font-weight: 900; color: #0f172a; margin: 2px 0 8px 0; font-family: 'Outfit', sans-serif;">
            TABLE ${tableIdStr}
          </div>
          <div style="background: #ffffff; border: 1px dashed #cbd5e1; border-radius: 8px; padding: 10px; display: inline-block; margin: 0 auto 8px auto;">
            <img 
              src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}" 
              alt="QR ${tableIdStr}" 
              style="width: 110px; height: 110px; display: block;" 
            />
          </div>
          <div style="font-size: 11px; font-weight: 700; color: #0f172a;">
            Scan to Order
          </div>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
            ${seatsText} • ${sectionText}
          </div>
        </div>
      `;
    }).join('');

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(`
      <html>
        <head>
          <title>Batch QR Standees - ${activeRestaurant?.name || 'Serviq'}</title>
          <style>
            body { font-family: 'Inter', system-ui, sans-serif; padding: 20px; color: #0f172a; background: #fff; }
            h2 { font-family: 'Outfit', sans-serif; text-align: center; margin-bottom: 20px; }
            .grid-container {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
            }
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <h2>Batch QR Standees Sheet</h2>
          <div class="grid-container">
            ${qrItemsHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(() => {
                window.focus();
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `);
    doc.close();

    // Clean up the iframe after a reasonable time for the print dialog to open and close
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 15000);
  };

  return (
    <section className="panel-view active" style={{ padding: '0 24px 40px 24px', width: '100%', boxSizing: 'border-box' }}>

      {/* 1. TOP HEADER ROW */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        paddingTop: '6px'
      }}>
        <div>
          <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: 0, fontFamily: "'Outfit', sans-serif" }}>
            Table Management
          </h2>

        </div>

        {/* Header Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleBatchPrint}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#0f172a',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
            onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
            title="Batch print all QR codes"
          >
            <PrintIcon size={14} color="#0f172a" /> Print All QR Codes
          </button>

          <button
            type="button"
            onClick={() => {
              if (setAddTableForm) setAddTableForm({ id: '', seats: 4 });
              if (setActivePage) setActivePage('table-form');
            }}
            style={{
              background: 'var(--primary)',
              border: 'none',
              padding: '9px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 700,
              color: '#ffffff',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 122, 0, 0.25)',
              transition: 'all 0.15s'
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.9'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            <PlusIcon size={15} color="#ffffff" /> Add Dining Table
          </button>
        </div>
      </div>

      {/* 2. STATS KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '22px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px' }}>TOTAL TABLES</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#0f172a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {totalCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Tables</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.4px' }}>AVAILABLE (FREE)</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#16a34a', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {freeCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Ready</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.4px' }}>OCCUPIED</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: '#dc2626', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {occupiedCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Dining</span>
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '16px 20px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.4px' }}>QR CODES ACTIVE</div>
          <div style={{ fontSize: '24px', fontWeight: 900, color: 'var(--primary)', marginTop: '4px', fontFamily: "'Outfit', sans-serif" }}>
            {qrCount} <span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>Live ({qrPercentage}%)</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & STATUS FILTER BAR */}
      <div style={{
        background: '#ffffff',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        padding: '12px 18px',
        marginBottom: '18px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Search Bar */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#f8fafc',
          border: '1px solid #cbd5e1',
          borderRadius: '8px',
          padding: '8px 12px',
          width: '320px',
          boxSizing: 'border-box'
        }}>
          <SearchIcon size={15} color="#64748b" />
          <input
            type="text"
            placeholder="Search by table #, waiter, section..."
            value={searchTerm}
            onKeyDown={e => {
              if (e.key === ' ' && !e.currentTarget.value) {
                e.preventDefault();
              }
            }}
            onChange={e => {
              const val = e.target.value.replace(/^\s+/, '');
              setSearchTerm(val);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: '13px',
              width: '100%',
              color: '#0f172a'
            }}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {[
            { id: 'All', label: `All Tables (${totalCount})` },
            { id: 'Free', label: `Free (${freeCount})` },
            { id: 'Occupied', label: `Occupied (${occupiedCount})` }
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '7px',
                border: 'none',
                background: statusFilter === tab.id ? '#0f172a' : '#f1f5f9',
                color: statusFilter === tab.id ? '#ffffff' : '#475569',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. UNIFIED MODULAR TABLE VIEW */}
      <div style={{
        background: '#ffffff',
        borderRadius: '14px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
        overflow: 'hidden',
        width: '100%'
      }}>
        <div style={{ width: '100%', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px' }}>S.NO.</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TABLE & SECTION</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>SEATING CAPACITY</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNED WAITER</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>QR CODE</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredTables.length > 0 ? (
                paginatedTables.map((table, index) => {
                  const isFree = table.status?.toLowerCase() === 'free' || table.status?.toLowerCase() === 'available';
                  const statusText = isFree ? 'FREE' : 'OCCUPIED';

                  const accentColor = isFree ? '#22c55e' : '#ef4444';
                  const bgBadgeColor = isFree ? '#e6f4ea' : '#fce8e6';
                  const textBadgeColor = isFree ? '#16a34a' : '#dc2626';

                  const tableIdStr = table.tableNumber || table.tableNum || table.tableNo || table.name || (table.id && String(table.id).startsWith('T-') ? table.id : null) || table.id || `T-${String((page - 1) * limit + index + 1).padStart(2, '0')}`;
                  const waiterName = getWaiterName(table);
                  const qrUrl = table.qrUrl || '';
                  const qrImgSrc = qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(qrUrl)}` : '';

                  return (
                    <tr
                      key={table._id || table.id || index}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background 0.15s ease'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* S.NO */}
                      <td style={{ padding: '14px 16px', fontWeight: 700, fontSize: '12px', color: '#0f172a', fontFamily: 'monospace' }}>
                        {(page - 1) * limit + index + 1}
                      </td>

                      {/* 1. Table ID & Section */}
                      <td style={{ padding: '14px 18px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '38px',
                            height: '38px',
                            borderRadius: '10px',
                            background: bgBadgeColor,
                            color: textBadgeColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexShrink: 0
                          }}>
                            <TableIcon size={18} color={textBadgeColor} />
                          </div>

                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                              {tableIdStr}
                            </span>
                            <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748b' }}>
                              {table.section || 'Main Dining'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2. Seating Capacity */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#475569',
                          fontSize: '13px',
                          fontWeight: 600
                        }}>
                          <UsersGroupIcon size={14} color="#64748b" />
                          <span>{table.seatingCapacity ?? table.seats ?? 4} seats</span>
                        </div>
                      </td>

                      {/* 3. Assigned Waiter */}
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {waiterName ? (
                            <>
                              <UserIcon size={14} color="#0f172a" />
                              <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px' }}>
                                {waiterName}
                              </span>
                            </>
                          ) : (
                            <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '12px' }}>
                              Unassigned
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Status Badge */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: bgBadgeColor,
                          color: textBadgeColor,
                          whiteSpace: 'nowrap'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            backgroundColor: textBadgeColor,
                            display: 'inline-block'
                          }}></span>
                          {statusText}
                        </span>
                      </td>

                      {/* 5. QR Code */}
                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        {table.qrUrl || table.assignedQrId ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <div
                              onClick={() => setViewingQrTable({ tableId: tableIdStr, qrUrl, qrImgSrc })}
                              style={{
                                width: '32px',
                                height: '32px',
                                background: '#ffffff',
                                borderRadius: '6px',
                                border: '1px solid #cbd5e1',
                                padding: '2px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              title="Click to expand QR Code"
                            >
                              <img
                                src={qrImgSrc}
                                alt={`QR ${tableIdStr}`}
                                style={{ width: '26px', height: '26px', display: 'block', borderRadius: '4px' }}
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => setViewingQrTable({ tableId: tableIdStr, qrUrl, qrImgSrc })}
                              style={{
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                color: '#ff5a1f',
                                cursor: 'pointer',
                                padding: '4px 8px',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontSize: '11px',
                                fontWeight: 700
                              }}
                            >
                              <QrIcon size={13} /> View
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', color: '#94a3b8', fontStyle: 'italic' }}>
                            No QR
                          </span>
                        )}
                      </td>

                      {/* 6. Actions */}
                      <td style={{ padding: '14px 18px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            onClick={() => {
                              if (setAddTableForm) setAddTableForm(table);
                              if (setActivePage) setActivePage('table-form');
                            }}
                            style={{
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              color: '#475569',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#0f172a';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#0f172a';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#f8fafc';
                              e.currentTarget.style.color = '#475569';
                              e.currentTarget.style.borderColor = '#cbd5e1';
                            }}
                            title="Edit Table"
                          >
                            <PencilIcon size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() => setTableToDelete(table)}
                            style={{
                              background: '#fef2f2',
                              border: '1px solid #fecaca',
                              color: '#dc2626',
                              cursor: 'pointer',
                              padding: '6px',
                              borderRadius: '6px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#dc2626';
                              e.currentTarget.style.color = '#ffffff';
                              e.currentTarget.style.borderColor = '#dc2626';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#fef2f2';
                              e.currentTarget.style.color = '#dc2626';
                              e.currentTarget.style.borderColor = '#fecaca';
                            }}
                            title="Delete Table"
                          >
                            <TrashIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No dining tables match your current filter "{searchTerm}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {filteredTables.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: '20px',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {filteredTables.length === 0 ? 0 : (page - 1) * limit + 1} to {Math.min(page * limit, filteredTables.length)} of {filteredTables.length} tables
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page <= 1 ? '#f8fafc' : '#ffffff',
                color: page <= 1 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: page === pageNum ? 700 : 500,
                  border: page === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: page === pageNum ? '#000000' : '#ffffff',
                  color: page === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (page >= totalPages || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (page >= totalPages || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & PRINT TABLE QR CODE */}
      {viewingQrTable && (
        <Modal
          isOpen={!!viewingQrTable}
          onClose={() => setViewingQrTable(null)}
          title={`Table QR Code: ${viewingQrTable.tableId}`}
          maxWidth="420px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', paddingTop: '8px' }}>

            {/* Standee QR Box preview */}
            <div style={{
              background: '#ffffff',
              border: '2px solid #0f172a',
              borderRadius: '16px',
              padding: '24px 20px',
              textAlign: 'center',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)'
            }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {activeRestaurant?.name || 'SERVIQ DINING'}
              </span>
              <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', margin: '4px 0 14px 0', fontFamily: "'Outfit', sans-serif" }}>
                TABLE {viewingQrTable.tableId}
              </div>

              <div style={{
                background: '#ffffff',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '16px',
                display: 'inline-block',
                margin: '0 auto 14px auto'
              }}>
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(viewingQrTable.qrUrl)}`}
                  alt="QR Standee"
                  style={{ width: '180px', height: '180px', display: 'block' }}
                />
              </div>

              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                Scan to View Menu & Place Order
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', width: '100%' }}>
              <button
                type="button"
                onClick={() => {
                  window.print();
                }}
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: 'none',
                  background: 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <PrintIcon size={15} /> Print Standee
              </button>

              <a
                href={viewingQrTable.qrImgSrc}
                download={`QR-Table-${viewingQrTable.tableId}.png`}
                target="_blank"
                rel="noreferrer"
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#0f172a',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  textDecoration: 'none'
                }}
              >
                <DownloadIcon size={15} /> Download PNG
              </a>
            </div>

            <button
              type="button"
              onClick={() => setViewingQrTable(null)}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: '#f8fafc',
                color: '#64748b',
                fontWeight: 600,
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              Close Window
            </button>
          </div>
        </Modal>
      )}

      {/* MODAL: DELETE DINING TABLE MODAL */}
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
                Are you sure you want to delete Table {tableToDelete?.id}? This will also delete its linked QR ordering configuration.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: '13px' }}
              onClick={() => setTableToDelete(null)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              style={{ padding: '8px 16px', fontSize: '13px', backgroundColor: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
              onClick={() => {
                if (tableToDelete && deleteDiningTable) {
                  deleteDiningTable(activeRestaurant.id, tableToDelete.id);
                  setTableToDelete(null);
                }
              }}
            >
              Delete Table
            </button>
          </div>
        </div>
      </Modal>

    </section>
  );
}