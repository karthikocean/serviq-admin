import React from 'react';
import { Modal } from './Modal';

export const AlertTriangleIcon = ({ size = 22, color = '#dc2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const AlertCircleIcon = ({ size = 16, color = '#dc2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const UnlockIcon = ({ size = 16, color = '#16a34a' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="18" height="11" x="3" y="11" rx="2.5" ry="2.5" fill={color} fillOpacity="0.14" />
    <path d="M7 11V7a5 5 0 0 1 9.9-1" />
  </svg>
);

export const LockIcon = ({ size = 16, color = '#dc2626' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle' }}>
    <rect width="18" height="11" x="3" y="11" rx="2.5" ry="2.5" fill={color} fillOpacity="0.14" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// Aliases for compatibility
export const ToggleRightIcon = UnlockIcon;
export const ToggleLeftIcon = LockIcon;
export const LockOpenIcon = UnlockIcon;
export const LockClosedIcon = LockIcon;

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Deletion",
  itemName = "",
  itemType = "",
  message = null,
  warningText = "Warning: This action cannot be undone.",
  confirmText = "Delete",
  isDeleting = false,
  maxWidth = "440px"
}) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => !isDeleting && onClose && onClose()}
      title={title}
      maxWidth={maxWidth}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '6px' }}>
        <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
          <div style={{
            width: '44px',
            height: '44px',
            minWidth: '44px',
            borderRadius: '12px',
            backgroundColor: '#fef2f2',
            border: '1px solid #fee2e2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <AlertTriangleIcon size={22} color="#dc2626" />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: '14.5px', color: '#1e293b', lineHeight: '1.5', fontWeight: 500 }}>
              {message ? message : (
                <>
                  Are you sure you want to delete {itemType ? `${itemType} ` : ''}{itemName ? <strong>"{itemName}"</strong> : 'this item'}?
                </>
              )}
            </p>
          </div>
        </div>

        {warningText && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            padding: '10px 14px',
            borderRadius: '8px',
            fontSize: '12px',
            color: '#dc2626',
            fontWeight: 500
          }}>
            <AlertCircleIcon size={15} color="#dc2626" />
            <span>{warningText}</span>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={onClose}
            disabled={isDeleting}
            style={{
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            style={{
              padding: '8px 20px',
              background: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              cursor: isDeleting ? 'not-allowed' : 'pointer',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'background 0.15s ease'
            }}
            onMouseEnter={e => { if (!isDeleting) e.currentTarget.style.background = '#b91c1c'; }}
            onMouseLeave={e => { if (!isDeleting) e.currentTarget.style.background = '#dc2626'; }}
          >
            {isDeleting ? 'Deleting...' : confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
}
