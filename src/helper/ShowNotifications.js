class ShowNotifications {
  showAlertNotification(message, status) {
    if (typeof document === 'undefined') return;

    // 1. Get or create container
    let container = document.getElementById('antigravity-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'antigravity-toast-container';
      Object.assign(container.style, {
        position: 'fixed',
        top: '24px',
        right: '24px',
        zIndex: '999999',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        pointerEvents: 'none',
        fontFamily: "'Outfit', 'Inter', sans-serif"
      });
      document.body.appendChild(container);
    }

    // 2. Create toast element
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      padding: '14px 20px',
      borderRadius: '12px',
      fontSize: '14px',
      fontWeight: '600',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
      backdropFilter: 'blur(10px)',
      opacity: '0',
      transform: 'translateY(-20px)',
      transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      pointerEvents: 'auto',
      maxWidth: '350px',
      lineHeight: '1.4'
    });

    // Theme color based on status
    if (status) {
      // Success: Emerald Green
      toast.style.background = 'rgba(16, 185, 129, 0.95)';
      toast.style.borderLeft = '4px solid #047857';
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span>${message}</span>
      `;
    } else {
      // Error: Crimson/Rose Red
      toast.style.background = 'rgba(239, 68, 68, 0.95)';
      toast.style.borderLeft = '4px solid #b91c1c';
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span>${message}</span>
      `;
    }

    // 3. Append and animate entrance
    container.appendChild(toast);
    
    // Force reflow
    toast.offsetHeight;

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    // 4. Animate exit and remove
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px) scale(0.9)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, 3500);
  }
}

export default new ShowNotifications();
