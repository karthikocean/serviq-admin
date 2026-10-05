import React, { useEffect } from 'react';

export const Modal = ({ isOpen, onClose, title, maxWidth = '480px', children }) => {
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        boxSizing: 'border-box',
        overflow: 'hidden'
      }}
    >
      <div 
        className="modal-card modal-card-body" 
        style={{ 
          maxWidth, 
          width: '100%', 
          maxHeight: '92vh',
          margin: 'auto',
          boxSizing: 'border-box'
        }}
      >
        <div className="modal-header-flex" style={{ marginBottom: '12px', paddingBottom: '10px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>{title}</h3>}
          {onClose && (
            <span 
              className="modal-close" 
              onClick={onClose} 
              style={{ cursor: 'pointer', fontSize: '18px' }}
            >
              ✕
            </span>
          )}
        </div>
        {children}
      </div>
    </div>
  );
};
