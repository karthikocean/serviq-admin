import React from 'react';

export const Modal = ({ isOpen, onClose, title, maxWidth = '480px', children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="modal-overlay" 
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div 
        className="modal-card" 
        style={{ 
          maxWidth, 
          width: '95%', 
          maxHeight: '90vh', 
          overflowY: 'auto'
        }}
      >
        <div className="modal-header-flex">
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
