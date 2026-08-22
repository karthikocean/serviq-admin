import React from 'react';

export const Badge = ({ children, status, className = '', style, onClick, ...props }) => {
  let extraClass = '';
  if (status === 'Active' || status === 'Paid' || status === 'On Duty' || status === 'delivered' || status === 'ready') {
    extraClass = 'badge-ready';
  } else if (status === 'Pending' || status === 'new' || status === 'preparing' || status === 'Partial') {
    extraClass = 'badge-preparing';
  } else if (status === 'Suspended' || status === 'Disabled' || status === 'Off Duty' || status === 'cancelled') {
    extraClass = 'badge-suspended';
  } else if (status === 'served') {
    extraClass = 'badge-served';
  } else if (status === 'completed') {
    extraClass = 'badge-completed';
  }

  const badgeStyle = onClick ? { cursor: 'pointer', userSelect: 'none', ...style } : style;
  const clickableClass = onClick ? 'badge-clickable' : '';

  return (
    <span 
      className={`badge-custom ${extraClass} ${clickableClass} ${className}`.trim()} 
      style={badgeStyle}
      onClick={onClick}
      {...props}
    >
      {children || status}
    </span>
  );
};
