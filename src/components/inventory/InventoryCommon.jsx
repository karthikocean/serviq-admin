import React from 'react';

// SVG Icons
export const BoxIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

export const PlusIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

export const SearchIcon = ({ size = 15, color = '#64748b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

export const PencilIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
    <path d="m15 5 4 4"></path>
  </svg>
);

export const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

export const EyeIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

export const CheckCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
    <polyline points="22 4 12 14.01 9 11.01"></polyline>
  </svg>
);

export const XCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="15" y1="9" x2="9" y2="15"></line>
    <line x1="9" y1="9" x2="15" y2="15"></line>
  </svg>
);

export const TruckIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

export const ArrowLeftIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);

export const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

// Uniform filter input styling for table bars
export const filterInputStyle = {
  width: '100%',
  height: '38px',
  padding: '0 12px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '13px',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#0f172a'
};

// Form Input Styling matching system design system
export const formInputStyle = {
  width: '100%',
  height: '44px',
  padding: '0 16px',
  borderRadius: '8px',
  border: '1px solid #cbd5e1',
  fontSize: '14px',
  fontWeight: '500',
  background: '#ffffff',
  outline: 'none',
  boxSizing: 'border-box',
  color: '#0f172a'
};

// Form Label Styling
export const formLabelStyle = {
  display: 'block',
  fontSize: '14px',
  fontWeight: '700',
  color: '#0f172a',
  marginBottom: '8px'
};

// Stock status helper
export const getStockStatus = (cur, min) => {
  if (cur <= 0) return { label: 'Out of Stock', bg: '#fef2f2', color: '#dc2626' };
  if (cur <= min) return { label: 'Low Stock', bg: '#fef3c7', color: '#d97706' };
  return { label: 'In Stock', bg: '#e6f4ea', color: '#16a34a' };
};

// Pagination bar helper
export const PaginationBar = ({ currentPage, totalItems, pageSize = 10, onPageChange }) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const startItem = totalItems === 0 ? 0 : currentPage * pageSize + 1;
  const endItem = Math.min((currentPage + 1) * pageSize, totalItems);

  if (totalItems === 0) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '10px 16px',
      borderTop: '1px solid #e2e8f0',
      background: '#f8fafc',
      fontSize: '12px',
      color: '#64748b',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      <div>
        Showing <strong style={{ color: '#0f172a' }}>{startItem}</strong> to <strong style={{ color: '#0f172a' }}>{endItem}</strong> of <strong style={{ color: '#0f172a' }}>{totalItems}</strong> entries
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button
          type="button"
          disabled={currentPage === 0}
          onClick={() => onPageChange(currentPage - 1)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: currentPage === 0 ? '#f1f5f9' : '#ffffff',
            color: currentPage === 0 ? '#94a3b8' : '#0f172a',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: currentPage === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          Previous
        </button>
        {Array.from({ length: totalPages }, (_, i) => i)
          .filter(pIndex => {
            if (totalPages <= 7) return true;
            if (pIndex === 0 || pIndex === totalPages - 1) return true;
            return Math.abs(pIndex - currentPage) <= 1;
          })
          .map((pIndex, idx, arr) => {
            const prev = arr[idx - 1];
            const showEllipsis = prev !== undefined && pIndex - prev > 1;
            return (
              <React.Fragment key={pIndex}>
                {showEllipsis && <span style={{ padding: '0 4px', color: '#94a3b8' }}>...</span>}
                <button
                  type="button"
                  onClick={() => onPageChange(pIndex)}
                  style={{
                    minWidth: '26px',
                    height: '26px',
                    borderRadius: '6px',
                    border: currentPage === pIndex ? '1px solid #ff5a1f' : '1px solid #cbd5e1',
                    background: currentPage === pIndex ? '#ff5a1f' : '#ffffff',
                    color: currentPage === pIndex ? '#ffffff' : '#0f172a',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0 4px'
                  }}
                >
                  {pIndex + 1}
                </button>
              </React.Fragment>
            );
          })}
        <button
          type="button"
          disabled={currentPage >= totalPages - 1}
          onClick={() => onPageChange(currentPage + 1)}
          style={{
            padding: '4px 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: currentPage >= totalPages - 1 ? '#f1f5f9' : '#ffffff',
            color: currentPage >= totalPages - 1 ? '#94a3b8' : '#0f172a',
            fontSize: '11.5px',
            fontWeight: 700,
            cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer'
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
};
