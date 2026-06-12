import React from 'react';

export const Badge = ({ children, status, className = '', style, onClick, ...props }) => {
  let extraClass = '';
  if (status === 'Active' || status === 'Paid' || status === 'On Duty' || status === 'delivered' || status === 'done') {
    extraClass = 'badge-ready'; // custom ready styles or green
  } else if (status === 'Pending' || status === 'new' || status === 'preparing' || status === 'Partial') {
    extraClass = 'badge-preparing'; // custom preparing styles or yellow/orange
  } else if (status === 'Suspended' || status === 'Disabled' || status === 'Off Duty') {
    extraClass = 'badge-suspended'; // custom suspended/red styles
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
