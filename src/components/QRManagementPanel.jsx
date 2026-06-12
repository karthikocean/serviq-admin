import React, { useState, useEffect } from 'react';
import { Modal } from './Modal';

// Custom inline SVG icons to keep the panel free of raw emojis
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


const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const PlusIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LinkIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const ScanIcon = ({ size = 20, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
    <rect x="7" y="7" width="10" height="10" rx="1" />
  </svg>
);

export default function QRManagementPanel({
  activeRestaurant = {},
  generateQrCode,
  assignQrCode,
  revokeQrCode,
  deleteQrCode
})  
{
  const [previewQR, setPreviewQR] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  const qrCodes = activeRestaurant.qrCodes || [];
  const tables = activeRestaurant.tables || [];

  useEffect(() => {
    if (previewQR) {
      const tableStr = previewQR.tableId ? `?table=${previewQR.tableId.replace('T-', '')}` : '';
      setQrUrl(`https://serviq.com/menu/${activeRestaurant.id}${tableStr}`);
    }
  }, [previewQR, activeRestaurant.id]);

  const totalQrs = qrCodes.length;
  const assignedQrs = qrCodes.filter(q => q.status === 'Assigned').length;
  const unassignedQrs = totalQrs - assignedQrs;

  // Filter dining tables that are not assigned to any QR code (except current mapping)
  const getAvailableTables = (currentTableId) => {
    return tables.filter(t => !t.assignedQrId || t.id === currentTableId);
  };

  return (
    <section className="panel-view active">
      <div className="panel-header-flex" style={{ marginBottom: '20px' }}>
        <div className="panel-title-desc">
          <h2 className="panel-inner-title">QR Code Management</h2>
          <p className="panel-inner-desc">First generate QR codes, then map dining tables to them. QR codes link guests directly to your digital menu.</p>
        </div>
        <div>
          <button 
            className="btn btn-black" 
            onClick={() => generateQrCode(activeRestaurant.id)}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}
          >
            <PlusIcon size={16} />
            Generate QR Code
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="stat-card" style={{ borderLeft: '5px solid var(--primary)' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Total QR Codes</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{totalQrs}</h3>
              <div className="stat-sub-label green-label">In system</div>
            </div>
            <div className="stat-icon-wrapper" style={{ color: 'var(--primary)' }}>
              <ScanIcon size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #16a34a' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Assigned</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{assignedQrs}</h3>
              <div className="stat-sub-label green-label">Linked to tables</div>
            </div>
            <div className="stat-icon-wrapper" style={{ color: '#16a34a' }}>
              <LinkIcon size={24} />
            </div>
          </div>
        </div>

        <div className="stat-card" style={{ borderLeft: '5px solid #64748b' }}>
          <div className="stat-main-row">
            <div className="stat-info">
              <div className="stat-label" style={{ color: '#64748b' }}>Unassigned</div>
              <h3 style={{ color: 'var(--black)', marginTop: '4px', marginBottom: '4px', fontSize: '24px', fontWeight: '700' }}>{unassignedQrs}</h3>
              <div className="stat-sub-label" style={{ color: '#64748b', fontSize: '11px', fontWeight: 600 }}>Ready to map</div>
            </div>
            <div className="stat-icon-wrapper" style={{ color: '#64748b' }}>
              <PlusIcon size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* QR Code List */}
      <div className="menu-table-wrapper" style={{ overflowX: 'auto', backgroundColor: '#ffffff', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px' }}>
        {qrCodes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: '16px' }}>
              <ScanIcon size={48} />
            </div>
            <h4 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '8px' }}>No QR Codes Generated</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '380px', margin: '0 auto 16px auto' }}>
              Begin by generating a new QR code sticker. Once generated, you can assign it to any dining table.
            </p>
            <button 
              className="btn btn-black"
              onClick={() => generateQrCode(activeRestaurant.id)}
            >
              Generate First QR Code
            </button>
          </div>
        ) : (
          <table className="menu-items-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border)', backgroundColor: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>QR CODE ID</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>PREVIEW</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>STATUS</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', width: '280px' }}>ASSIGNED TABLE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>SCANS COUNT</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)' }}>CREATED DATE</th>
                <th style={{ padding: '12px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textAlign: 'right', width: '260px' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {qrCodes.map(qr => {
                const availableTables = getAvailableTables(qr.tableId);
                return (
                  <tr key={qr.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    {/* QR Code ID */}
                    <td style={{ padding: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{qr.id}</td>

                    {/* QR Code Preview Block */}
                    <td style={{ padding: '14px' }}>
                      <div 
                        onClick={() => setPreviewQR(qr)}
                        title="Click to preview QR"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '6px',
                          border: '1px solid var(--border)',
                          background: '#fafafa',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.02)',
                          cursor: 'pointer'
                        }}>
                        <div style={{
                          width: '24px',
                          height: '24px',
                          display: 'grid',
                          gridTemplateColumns: 'repeat(3, 1fr)',
                          gridTemplateRows: 'repeat(3, 1fr)',
                          gap: '2px',
                          padding: '2px'
                        }}>
                          {/* Stylized QR dots */}
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                          <div style={{ background: 'transparent' }}></div>
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                          <div style={{ background: 'transparent' }}></div>
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                          <div style={{ background: 'transparent' }}></div>
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                          <div style={{ background: '#1e293b', borderRadius: '1px' }}></div>
                        </div>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '14px' }}>
                      <span style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        backgroundColor: qr.status === 'Assigned' ? '#dcfce7' : '#f1f5f9',
                        color: qr.status === 'Assigned' ? '#15803d' : '#64748b'
                      }}>
                        {qr.status}
                      </span>
                    </td>

                    {/* Assigned Dining Table Selection */}
                    <td style={{ padding: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '240px' }}>
                        <select
                          value={qr.tableId || ''}
                          onChange={(e) => assignQrCode(activeRestaurant.id, qr.id, e.target.value || null)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: '1px solid var(--border)',
                            backgroundColor: 'var(--bg-primary)',
                            color: 'var(--text-main)',
                            fontWeight: '600',
                            fontSize: '13px',
                            flex: '1',
                            minWidth: '160px',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="">Unassigned (None)</option>
                          {availableTables.map(t => (
                            <option key={t.id} value={t.id}>
                              Table {t.id.replace('T-', '')} ({t.seats} Seats)
                            </option>
                          ))}
                        </select>
                        {qr.tableId && (
                          <button
                            title="Unlink Dining Table"
                            onClick={() => revokeQrCode(activeRestaurant.id, qr.id)}
                            style={{
                              border: '1px solid var(--border)',
                              background: '#fef2f2',
                              color: '#ef4444',
                              padding: '6px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <span style={{ fontSize: '11px', fontWeight: 700 }}>Unlink</span>
                          </button>
                        )}
                      </div>
                    </td>

                    {/* Scan Count */}
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                      {qr.scansCount || 0} scans
                    </td>

                    {/* Created Date */}
                    <td style={{ padding: '14px', color: 'var(--text-muted)', fontSize: '13px' }}>
                      {qr.createdAt || '2026-06-10'}
                    </td>

                    {/* Actions Column */}
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end', alignItems: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          className="table-action-btn"
                          title="Print QR Sticker"
                          onClick={() => alert(`QR code sticker template sent to printer for ${qr.id}!`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                        >
                          <PrintIcon size={14} />
                          Print
                        </button>
                        <button
                          className="table-action-btn"
                          title="Download Vector SVG"
                          onClick={() => alert(`Vector SVG downloaded for ${qr.id}!`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '6px 10px' }}
                        >
                          <DownloadIcon size={14} />
                          SVG
                        </button>
                        <button
                          className="table-action-btn delete-btn"
                          title="Delete QR Code"
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete QR Code ${qr.id}? This will also unlink any assigned dining table.`)) {
                              deleteQrCode(activeRestaurant.id, qr.id);
                            }
                          }}
                          style={{ padding: '6px' }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {previewQR && (
        <Modal 
          isOpen={!!previewQR} 
          onClose={() => setPreviewQR(null)} 
          title={`Preview QR Code: ${previewQR.id}`}
        >
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '180px',
              height: '180px',
              margin: '0 auto 24px auto',
              background: '#ffffff',
              border: '2px solid var(--border)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
              position: 'relative'
            }}>
              <div style={{
                width: '140px',
                height: '140px',
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gridTemplateRows: 'repeat(5, 1fr)',
                gap: '4px'
              }}>
                {Array.from({ length: 25 }).map((_, i) => (
                  <div key={i} style={{ 
                    background: (i % 2 === 0 || i % 3 === 0) && i !== 12 ? '#1e293b' : 'transparent',
                    borderRadius: '2px'
                  }}></div>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'left', marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-main)' }}>
                Destination URL for this QR Code
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="text" 
                  value={qrUrl}
                  onChange={(e) => setQrUrl(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid var(--border)',
                    fontSize: '13px',
                    color: 'var(--text-main)',
                    background: 'var(--bg-secondary)'
                  }}
                />
                <button 
                  className="btn btn-outline"
                  onClick={() => {
                    navigator.clipboard.writeText(qrUrl);
                    alert("URL Copied to clipboard!");
                  }}
                >
                  Copy
                </button>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px' }}>
                When customers scan this QR code, they will be directed to this URL. The system automatically pre-fills the table number if assigned.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button className="btn btn-outline" onClick={() => setPreviewQR(null)}>
                Close Preview
              </button>
              <button className="btn btn-black" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <DownloadIcon size={16} /> Download SVG
              </button>
            </div>
          </div>
        </Modal>
      )}
    </section>
  );
}
