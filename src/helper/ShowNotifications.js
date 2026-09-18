class ShowNotificationsManager {
  constructor() {
    this.lastNotification = {
      message: '',
      isSuccess: false,
      timestamp: 0
    };
    this.dismissTimer = null;
    this.removeTimer = null;
  }

  showAlertNotification(message, status) {
    if (typeof document === 'undefined' || !message) return;

    const now = Date.now();
    const cleanMsg = String(message).trim();
    if (!cleanMsg) return;

    const isSuccess = Boolean(status === true || status === 1 || status === 'true' || status === 'success');

    // 1. Deduplicate identical messages triggered within 4 seconds
    const isIdentical = this.lastNotification.message.toLowerCase() === cleanMsg.toLowerCase();
    if (isIdentical && now - this.lastNotification.timestamp < 4000) {
      return;
    }

    // 2. Suppress multiple consecutive success notifications within 3.5 seconds
    // (Prevents double toasts from API layer + UI layer + hooks/effects across all modules)
    if (isSuccess && this.lastNotification.isSuccess && (now - this.lastNotification.timestamp < 3500)) {
      return;
    }

    // Update last notification record
    this.lastNotification = {
      message: cleanMsg,
      isSuccess: isSuccess,
      timestamp: now
    };

    // 3. Get or create container (ensure only one exists in the DOM)
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
        alignItems: 'flex-end',
        gap: '12px',
        pointerEvents: 'none',
        fontFamily: "'Outfit', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
      });
      document.body.appendChild(container);
    }

    // Clear any existing dismissal timers
    if (this.dismissTimer) {
      clearTimeout(this.dismissTimer);
      this.dismissTimer = null;
    }
    if (this.removeTimer) {
      clearTimeout(this.removeTimer);
      this.removeTimer = null;
    }

    // 4. Strict Single Toast: Clear any existing toast elements immediately
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }

    // 5. Create new toast element
    const toast = document.createElement('div');
    Object.assign(toast.style, {
      padding: '12px 18px',
      borderRadius: '10px',
      fontSize: '13.5px',
      fontWeight: '600',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      boxShadow: '0 8px 24px rgba(0,0,0,0.16)',
      backdropFilter: 'blur(10px)',
      opacity: '0',
      transform: 'translateY(-16px)',
      transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
      pointerEvents: 'auto',
      maxWidth: '400px',
      lineHeight: '1.4',
      wordBreak: 'break-word'
    });

    if (isSuccess) {
      // Success: Emerald Green
      toast.style.background = 'rgba(16, 185, 129, 0.96)';
      toast.style.borderLeft = '4px solid #047857';
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
        <span style="flex:1;">${cleanMsg}</span>
        <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;padding:0 0 0 8px;display:flex;align-items:center;opacity:0.8;" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    } else {
      // Error: Crimson / Red
      toast.style.background = 'rgba(239, 68, 68, 0.96)';
      toast.style.borderLeft = '4px solid #b91c1c';
      toast.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <span style="flex:1;">${cleanMsg}</span>
        <button type="button" style="background:none;border:none;color:#fff;cursor:pointer;padding:0 0 0 8px;display:flex;align-items:center;opacity:0.8;" title="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;
    }

    const closeBtn = toast.querySelector('button');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px) scale(0.95)';
        setTimeout(() => {
          if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 200);
      });
    }

    // 6. Append and animate entrance
    container.appendChild(toast);

    // Force reflow
    toast.offsetHeight;

    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';

    // 7. Auto-dismiss
    this.dismissTimer = setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-10px) scale(0.95)';
      this.removeTimer = setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 250);
    }, 3200);
  }
}

// Attach to global window object so all bundles/chunks share the EXACT same manager instance
const globalManager = (typeof window !== 'undefined' && window.__SERVIQ_NOTIFICATION_MANAGER__) 
  ? window.__SERVIQ_NOTIFICATION_MANAGER__ 
  : new ShowNotificationsManager();

if (typeof window !== 'undefined') {
  window.__SERVIQ_NOTIFICATION_MANAGER__ = globalManager;
}

export default globalManager;
