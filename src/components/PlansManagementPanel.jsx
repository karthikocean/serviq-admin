import React, { useState } from 'react';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { AVAILABLE_PLANS } from '../config/initialData';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

// Icons matching screenshot & modern UI
const ZapIcon = ({ size = 18, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const TrendingUpIcon = ({ size = 18, color = '#3b82f6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
    <polyline points="17 6 23 6 23 12"></polyline>
  </svg>
);

const SparklesIcon = ({ size = 18, color = '#8b5cf6' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z"/>
  </svg>
);

const CrownIcon = ({ size = 18, color = '#f59e0b' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14v2H5v-2z"/>
  </svg>
);

const PencilIcon = ({ size = 15, color = '#94a3b8' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);

const CheckIcon = ({ size = 15, color = '#10b981' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const CrossIcon = ({ size = 15, color = '#cbd5e1' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const BuildingIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const HistoryIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const ReceiptIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z"/>
    <path d="M16 8h-8"/>
    <path d="M16 12h-8"/>
    <path d="M10 16H8"/>
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const CreditCardIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="4" width="20" height="16" rx="2"></rect>
    <line x1="2" y1="10" x2="22" y2="10"></line>
  </svg>
);

export default function PlansManagementPanel({ hasPermission: hasPermissionProp }) {
  const {
    activeRestaurant,
    upgradeSubscriptionPlan,
    purchaseExtraBranchSlots,
    toggleSubscriptionAutoRenew,
    currentUser
  } = useAppState();

  const role = currentUser?.role || 'Admin';
  const hasPermission = hasPermissionProp || ((moduleName, action = 'view') => {
    if (role === 'Admin' || role === 'Super Admin' || currentUser?.userType === 'RESTAURANT_OWNER') return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    return !!userRoleConfig.permissions?.[moduleName]?.[action];
  });

  const [plansList, setPlansList] = useState(AVAILABLE_PLANS);
  const [extraSlotsToAdd, setExtraSlotsToAdd] = useState(1);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isExtraBranchModalOpen, setIsExtraBranchModalOpen] = useState(false);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'plan' | 'addon'
  const [historySearch, setHistorySearch] = useState('');

  // Edit Plan Configuration Modal (Super Admin / Admin)
  const [editingPlan, setEditingPlan] = useState(null);
  const [editMonthlyPrice, setEditMonthlyPrice] = useState(0);
  const [editAnnualPrice, setEditAnnualPrice] = useState(0);
  const [editBranchLimit, setEditBranchLimit] = useState(1);
  const [editExtraBranchPrice, setEditExtraBranchPrice] = useState(799);

  // Active Subscription extraction with fallbacks
  const sub = activeRestaurant?.subscription || {
    planId: 'plan-standard',
    planName: activeRestaurant?.plan || 'Standard Plan',
    status: 'Active',
    billingCycle: 'monthly',
    price: 1999,
    annualPrice: 19999,
    startDate: '2026-01-15',
    expiryDate: '2027-01-15',
    nextBillingDate: '2026-09-15',
    baseBranchLimit: 3,
    extraBranchSlots: 0,
    extraBranchPrice: 699,
    userLimit: 15,
    orderLimit: 2000,
    autoRenew: true,
    
  };

  const branches = activeRestaurant?.branches || [];
  const activeBranchesCount = branches.length;
  const baseBranchLimit = sub.baseBranchLimit || 3;
  const extraBranchSlots = sub.extraBranchSlots || 0;
  const totalAllowedBranches = baseBranchLimit + extraBranchSlots;
  const remainingSlots = Math.max(0, totalAllowedBranches - activeBranchesCount);
  const branchUsagePercent = Math.min(100, Math.round((activeBranchesCount / (totalAllowedBranches || 1)) * 100));

  const matchedActivePlan = plansList.find(p => 
    p.id === sub.planId || 
    p.name.toLowerCase().includes((sub.planName || '').toLowerCase().replace(' plan', '')) ||
    (sub.planName || '').toLowerCase().includes(p.name.toLowerCase().replace(' plan', ''))
  );
  const extraBranchUnitPrice = matchedActivePlan?.extraBranchPrice || sub.extraBranchPrice || 699;
  const extraBranchSubtotal = extraSlotsToAdd * extraBranchUnitPrice;
  const extraBranchGst = Math.round(extraBranchSubtotal * 0.18);
  const extraBranchTotal = extraBranchSubtotal + extraBranchGst;

  const invoices = activeRestaurant?.subscriptionInvoices || [
    { id: "INV-PLN-2026-003", planName: `${sub.planName}`, type: "subscription", description: `${sub.planName} - Monthly Subscription Renewal`, branchesIncluded: baseBranchLimit, amount: sub.price, date: "2026-08-15", paymentMethod: "Credit Card (•••• 4242)", status: "Paid" },
    { id: "INV-PLN-2026-002", planName: `${sub.planName}`, type: "subscription", description: `${sub.planName} - Monthly Subscription Renewal`, branchesIncluded: baseBranchLimit, amount: sub.price, date: "2026-07-15", paymentMethod: "Credit Card (•••• 4242)", status: "Paid" },
    { id: "INV-PLN-2026-001", planName: `${sub.planName}`, type: "subscription", description: `${sub.planName} - Initial Subscription Activation`, branchesIncluded: baseBranchLimit, amount: sub.price, date: "2026-06-15", paymentMethod: "Razorpay UPI", status: "Paid" }
  ];

  const lastRecharge = invoices[0] || {
    id: "INV-PLN-2026-003",
    planName: `${sub.planName}`,
    description: `${sub.planName} - Monthly Subscription Renewal`,
    amount: sub.price || 1999,
    date: "2026-08-15",
    paymentMethod: sub.paymentMethod ,
    status: "Paid"
  };

  const totalSpentOnPlans = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      (inv.id || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.planName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.date || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.paymentMethod || '').toLowerCase().includes(historySearch.toLowerCase());

    const isAddon = (inv.type === 'addon' || (inv.description || '').toLowerCase().includes('branch') || (inv.description || '').toLowerCase().includes('slot'));
    
    if (historyFilter === 'plan') {
      return matchesSearch && !isAddon;
    }
    if (historyFilter === 'addon') {
      return matchesSearch && isAddon;
    }
    return matchesSearch;
  });

  // Handlers
  const handleOpenUpgradeModal = (plan) => {
    if (!hasPermission('plans-management', 'edit')) {
      ShowNotifications.showAlertNotification("You do not have permission to change subscription plans.", false);
      return;
    }
    setSelectedPlanForUpgrade(plan);
    setIsUpgradeModalOpen(true);
  };

  const handleConfirmUpgrade = () => {
    if (!selectedPlanForUpgrade) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      upgradeSubscriptionPlan(
        activeRestaurant.id,
        selectedPlanForUpgrade.id,
        'monthly',
        paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'netbanking' ? 'HDFC NetBanking' : 'Credit Card (•••• 4242)'
      );
      setIsProcessingPayment(false);
      setIsUpgradeModalOpen(false);
      ShowNotifications.showAlertNotification(`Successfully switched to ${selectedPlanForUpgrade.name}!`, true);
    }, 900);
  };

  const handleConfirmExtraBranchPurchase = () => {
    setIsProcessingPayment(true);

    setTimeout(() => {
      purchaseExtraBranchSlots(
        activeRestaurant.id,
        extraSlotsToAdd,
        paymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : paymentMethod === 'netbanking' ? 'HDFC NetBanking' : 'Credit Card (•••• 4242)'
      );
      setIsProcessingPayment(false);
      setIsExtraBranchModalOpen(false);
      ShowNotifications.showAlertNotification(`Successfully added ${extraSlotsToAdd} additional branch slot!`, true);
    }, 900);
  };

  const handleToggleAutoRenew = () => {
    toggleSubscriptionAutoRenew(activeRestaurant.id);
    ShowNotifications.showAlertNotification(
      `Auto-renewal has been ${!sub.autoRenew ? 'enabled' : 'disabled'}.`,
      true
    );
  };

  const handleOpenEditPlanModal = (plan) => {
    setEditingPlan(plan);
    setEditMonthlyPrice(plan.monthlyPrice);
    setEditAnnualPrice(plan.annualPrice);
    setEditBranchLimit(plan.branchLimit);
    setEditExtraBranchPrice(plan.extraBranchPrice);
  };

  const handleSavePlanEdit = () => {
    if (!editingPlan) return;
    setPlansList(prev => prev.map(p => {
      if (p.id === editingPlan.id) {
        return {
          ...p,
          monthlyPrice: Number(editMonthlyPrice),
          annualPrice: Number(editAnnualPrice),
          branchLimit: Number(editBranchLimit),
          extraBranchPrice: Number(editExtraBranchPrice)
        };
      }
      return p;
    }));
    setEditingPlan(null);
    ShowNotifications.showAlertNotification(`Plan settings for "${editingPlan.name}" updated successfully!`, true);
  };

  const getPlanIcon = (iconName) => {
    switch (iconName) {
      case 'zap': return <ZapIcon size={20} color="#10b981" />;
      case 'trending-up': return <TrendingUpIcon size={20} color="#3b82f6" />;
      case 'sparkles': return <SparklesIcon size={20} color="#8b5cf6" />;
      case 'crown': default: return <CrownIcon size={20} color="#f59e0b" />;
    }
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
            Plans Management
          </h2>
        
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => setIsExtraBranchModalOpen(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, borderColor: '#cbd5e1', color: '#0f172a' }}
          >
            <BuildingIcon size={16} /> + Buy Addons
          </button>
        </div>
      </div>

      {/* 1. TOP METRICS & LAST RECHARGE SUMMARY ROW (4 CARDS - SINGLE ROW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '16px', alignItems: 'stretch' }}>
        
        {/* Card 1: Active Subscription Plan */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Active Plan</span>
              <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, fontSize: '10px', padding: '2px 7px', borderRadius: '6px' }}>
                {sub.billingCycle === 'annual' ? 'Annual' : 'Monthly'}
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
              {sub.planName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>₹{sub.price ? sub.price.toLocaleString() : '1,999'}</strong> / month
            </div>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
            <span>Next: <strong style={{ color: '#0f172a' }}>{sub.nextBillingDate || '2026-09-15'}</strong></span>
            <span>Valid: <strong style={{ color: '#0f172a' }}>{sub.expiryDate || '2027-01-15'}</strong></span>
          </div>
        </div>

        {/* Card 2: LAST RECHARGE SUMMARY */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', border: '1.5px solid #cbd5e1', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HistoryIcon size={15} color="var(--primary)" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Last Recharge
                </span>
              </div>
              <span style={{ background: '#ecfdf5', color: '#059669', fontWeight: 800, fontSize: '10px', padding: '2px 7px', borderRadius: '6px', border: '1px solid #a7f3d0' }}>
                ● {lastRecharge.status}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                ₹{lastRecharge.amount ? lastRecharge.amount.toLocaleString() : '1,999'}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>on {lastRecharge.date}</span>
            </div>

            <div style={{ fontSize: '11px', color: '#334155', fontWeight: 600, marginTop: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              📦 {lastRecharge.planName || lastRecharge.description}
            </div>
           
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', fontWeight: 600 }}>{lastRecharge.id}</span>
            <button
              type="button"
              onClick={() => setSelectedInvoiceForView(lastRecharge)}
              style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ReceiptIcon size={11} /> Receipt
            </button>
          </div>
        </div>

        {/* Card 3: Branch Quota & Capacity Meter */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Capacity</span>
              <span style={{ fontSize: '11px', fontWeight: 800, color: branchUsagePercent >= 100 ? '#ef4444' : '#10b981' }}>
                {branchUsagePercent}% Used
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>{activeBranchesCount}</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>/ {totalAllowedBranches} Outlets</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginTop: '8px' }}>
              <div
                style={{
                  width: `${branchUsagePercent}%`,
                  height: '100%',
                  background: branchUsagePercent >= 100 ? 'linear-gradient(90deg, #f97316, #ef4444)' : 'linear-gradient(90deg, #10b981, var(--primary))',
                  borderRadius: '5px',
                  transition: 'width 0.4s ease'
                }}
              />
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
            <span>Base: <strong style={{ color: '#0f172a' }}>{baseBranchLimit}</strong></span>
            <span>Add-ons: <strong style={{ color: 'var(--primary)' }}>+{extraBranchSlots}</strong></span>
            <span>Avail: <strong style={{ color: remainingSlots > 0 ? '#10b981' : '#ef4444' }}>{remainingSlots} Left</strong></span>
          </div>
        </div>

        {/* Card 4: Additional Branch Unit Pricing & Auto-Renewal */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Extra Branch Rate</span>
              <span style={{ background: '#f0fdf4', color: '#166534', fontWeight: 700, fontSize: '10px', padding: '2px 7px', borderRadius: '6px', border: '1px solid #bbf7d0' }}>
                Add-on
              </span>
            </div>

            <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
              ₹{extraBranchUnitPrice} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>/ br / mo</span>
            </div>

            <p style={{ margin: '3px 0 0 0', fontSize: '10px', color: '#64748b', lineHeight: 1.3 }}>
              Add branch slots anytime.
            </p>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
            <span style={{ fontSize: '10px', color: '#0f172a', fontWeight: 600 }}>Auto-Renew:</span>
            <button
              type="button"
              onClick={handleToggleAutoRenew}
              style={{
                border: 'none',
                background: sub.autoRenew ? '#dcfce7' : '#fee2e2',
                color: sub.autoRenew ? '#15803d' : '#b91c1c',
                padding: '3px 8px',
                borderRadius: '16px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {sub.autoRenew ? '✓ Enabled' : '✕ Disabled'}
            </button>
          </div>
        </div>

      </div>

      {/* 2. PLANS CARDS GRID (EXACT SCREENSHOT STYLE - 3 CARDS IN SINGLE ROW) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '20px', alignItems: 'stretch' }}>
        {plansList.map((plan) => {
          const isCurrent = sub.planName.toLowerCase().includes(plan.name.toLowerCase().replace(' plan', ''));

          return (
            <div
              key={plan.id}
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: isCurrent ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isCurrent ? '0 8px 30px rgba(249, 115, 22, 0.08)' : '0 2px 10px rgba(0,0,0,0.02)',
                position: 'relative'
              }}
            >
              <div>
                {/* Header: Icon + Title + Edit Pencil */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {getPlanIcon(plan.icon)}
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                      {plan.name}
                    </h3>
                  </div>

                  {/* Super Admin Edit Pen */}
                  <button
                    type="button"
                    onClick={() => handleOpenEditPlanModal(plan)}
                    title="Edit Plan Configuration"
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <PencilIcon size={16} />
                  </button>
                </div>

                {/* Status Badge */}
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ background: '#ecfdf5', color: '#059669', border: '1px solid #a7f3d0', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px' }}>
                    ● {plan.status || 'Active'}
                  </span>
                </div>

                {/* Tagline */}
                <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.5, minHeight: '40px' }}>
                  {plan.tagline}
                </p>

                {/* Pricing Block */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '18px', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      MONTHLY RATE
                    </span>
                    <strong style={{ fontSize: '18px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                      ₹{plan.monthlyPrice.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/mo</span>
                    </strong>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      ANNUAL RATE
                    </span>
                    <strong style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                      ₹{plan.annualPrice.toLocaleString()}<span style={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }}>/yr</span>
                    </strong>
                  </div>
                </div>

                {/* INCLUDES FEATURES */}
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
                    INCLUDES FEATURES:
                  </div>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {plan.featuresList.map((feat, idx) => (
                      <li key={idx} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: feat.included ? '#1e293b' : '#94a3b8' }}>
                        {feat.included ? <CheckIcon size={15} color="#10b981" /> : <CrossIcon size={15} color="#cbd5e1" />}
                        <span style={{ fontWeight: feat.included ? 600 : 400 }}>{feat.name}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isCurrent ? (
                  <button
                    type="button"
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1.5px solid var(--primary)',
                      background: 'var(--primary-light)',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'default'
                    }}
                  >
                    ✓ Current Active Plan
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleOpenUpgradeModal(plan)}
                    style={{
                      width: '100%',
                      padding: '11px',
                      borderRadius: '10px',
                      border: '1px solid #fee2e2',
                      background: '#fff1f2',
                      color: '#e11d48',
                      fontWeight: 700,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>🛡 Deactivate Plan / Switch</span>
                  </button>
                )}
              </div>

            </div>
          );
        })}
      </div>

      {/* 4. PLANS RECHARGE HISTORY & INVOICES LOG */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' }}>
        
        {/* Header & Meta Summary Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ display: 'inline-flex', padding: '6px', background: 'var(--primary-light)', color: 'var(--primary)', borderRadius: '8px' }}>
                <HistoryIcon size={18} color="var(--primary)" />
              </span>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Plans & Recharge History
              </h3>
            </div>

          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '8px 14px', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Total Recharges:</span>
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>{invoices.length} Payments (₹{totalSpentOnPlans.toLocaleString()})</strong>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#166534', display: 'block' }}>Latest Recharge:</span>
              <strong style={{ fontSize: '14px', color: '#166534' }}>{lastRecharge.date} (₹{lastRecharge.amount.toLocaleString()})</strong>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {[
              { id: 'all', label: `All History (${invoices.length})` },
             
              { id: 'addon', label: 'Branch Add-ons' }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHistoryFilter(tab.id)}
                style={{
                  border: 'none',
                  padding: '6px 14px',
                  borderRadius: '7px',
                  background: historyFilter === tab.id ? '#ffffff' : 'transparent',
                  color: historyFilter === tab.id ? '#0f172a' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: historyFilter === tab.id ? '0 1px 4px rgba(0,0,0,0.06)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <input
              type="text"
              placeholder="Search invoice, plan, date..."
              value={historySearch}
              onChange={e => setHistorySearch(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none'
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
          </div>
        </div>

        {/* History Table */}
        <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '780px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
            <colgroup>
              <col style={{ width: '16%' }} />
              <col style={{ width: '16%' }} />
              <col style={{ width: '28%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                <th style={{ padding: '14px 16px', textAlign: 'left' }}>Recharge Date</th>
                <th style={{ padding: '14px 16px', textAlign: 'left' }}>Invoice #</th>
                <th style={{ padding: '14px 16px', textAlign: 'left' }}>Plan & Recharge Item</th>
                <th style={{ padding: '14px 16px', textAlign: 'left' }}>Amount Paid</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '32px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                    No recharge records found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => {
                  const isLatest = idx === 0;
                  const isAddon = (inv.type === 'addon' || (inv.description || '').toLowerCase().includes('branch') || (inv.description || '').toLowerCase().includes('slot'));

                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9', background: isLatest ? '#fafafa' : '#ffffff' }}>
                      <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 600 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>{inv.date}</span>
                          {isLatest && (
                            <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                              Latest
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                          via {inv.paymentMethod}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {inv.id}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ color: '#0f172a', fontWeight: 700 }}>
                          {inv.planName || inv.description}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                          {inv.description} {isAddon ? '• Add-on Slot' : `• (${inv.branchesIncluded || baseBranchLimit} Outlets)`}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', fontWeight: 800, color: '#0f172a' }}>
                        <span style={{ fontSize: '14px', color: '#0f172a' }}>₹{inv.amount ? inv.amount.toLocaleString() : '1,999'}</span>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>incl. GST</div>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                          ● {inv.status || 'Paid'}
                        </span>
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceForView(inv)}
                          style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                        >
                          <ReceiptIcon size={12} /> View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT PLAN CONFIGURATION MODAL (SUPER ADMIN / ADMIN PENCIL) */}
      {editingPlan && (
        <Modal
          isOpen={!!editingPlan}
          onClose={() => setEditingPlan(null)}
          title={`Edit ${editingPlan.name} Settings`}
          maxWidth="500px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Monthly Rate (₹):
              </label>
              <input
                type="number"
                value={editMonthlyPrice}
                onChange={e => setEditMonthlyPrice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Annual Rate (₹):
              </label>
              <input
                type="number"
                value={editAnnualPrice}
                onChange={e => setEditAnnualPrice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Included Branches Limit:
              </label>
              <input
                type="number"
                value={editBranchLimit}
                onChange={e => setEditBranchLimit(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Extra Branch Add-on Rate (₹/month):
              </label>
              <input
                type="number"
                value={editExtraBranchPrice}
                onChange={e => setEditExtraBranchPrice(e.target.value)}
                style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setEditingPlan(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handleSavePlanEdit}
                style={{ padding: '8px 20px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700 }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: PLAN UPGRADE CONFIRMATION MODAL */}
      {isUpgradeModalOpen && selectedPlanForUpgrade && (
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => !isProcessingPayment && setIsUpgradeModalOpen(false)}
          title={`Switch to ${selectedPlanForUpgrade.name}`}
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '10px' }}>
            <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Target Tier:</span>
                <strong style={{ fontSize: '14px', color: 'var(--primary)' }}>{selectedPlanForUpgrade.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Included Outlets:</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>{selectedPlanForUpgrade.branchLimit} Branch Outlets</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: '#64748b' }}>Extra Branch Rate:</span>
                <strong style={{ fontSize: '14px', color: '#0f172a' }}>₹{selectedPlanForUpgrade.extraBranchPrice}/mo</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid #cbd5e1' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Monthly Payable:</span>
                <strong style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)' }}>
                  ₹{selectedPlanForUpgrade.monthlyPrice.toLocaleString()}
                </strong>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Select Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'card', label: 'Credit Card', sub: '•••• 4242' },
                  { id: 'upi', label: 'UPI / QR', sub: 'GPay, PhonePe' },
                  { id: 'netbanking', label: 'NetBanking', sub: 'Instant Bank' }
                ].map(pm => (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '10px',
                      border: paymentMethod === pm.id ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                      background: paymentMethod === pm.id ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: paymentMethod === pm.id ? 'var(--primary)' : '#0f172a' }}>{pm.label}</div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{pm.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsUpgradeModalOpen(false)}
                disabled={isProcessingPayment}
                style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handleConfirmUpgrade}
                disabled={isProcessingPayment}
                style={{ padding: '10px 24px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
              >
                {isProcessingPayment ? 'Processing...' : `Confirm & Switch Plan`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 3: BRANCH-BASED PLAN CALCULATION & ADD-ON CALCULATOR POPUP (TRIGGERED BY + BUY ADDONS) */}
      {isExtraBranchModalOpen && (
        <Modal
          isOpen={isExtraBranchModalOpen}
          onClose={() => !isProcessingPayment && setIsExtraBranchModalOpen(false)}
          title="Branch-Based Plan Calculation & Add-on Calculator"
          maxWidth="580px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '10px 14px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Active Tier: <strong>{sub.planName}</strong></span>
              <span style={{ background: '#fff7ed', border: '1px solid #fed7aa', padding: '3px 10px', borderRadius: '8px', fontSize: '11px', color: '#c2410c', fontWeight: 700 }}>
                {remainingSlots === 0 ? '⚠️ Current Branch Limit Reached' : `✓ ${remainingSlots} Free Slot Available`}
              </span>
            </div>

            {/* Interactive Slot Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Select Number of Additional Branch Slots to Add:
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => setExtraSlotsToAdd(Math.max(1, extraSlotsToAdd - 1))}
                  style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '18px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  -
                </button>
                <div style={{ width: '70px', height: '40px', borderRadius: '10px', border: '1.5px solid var(--primary)', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 800, color: 'var(--primary)' }}>
                  +{extraSlotsToAdd}
                </div>
                <button
                  type="button"
                  onClick={() => setExtraSlotsToAdd(extraSlotsToAdd + 1)}
                  style={{ width: '40px', height: '40px', borderRadius: '10px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '18px', fontWeight: 800, color: '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  +
                </button>
                <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Branch Outlet Slot</span>
              </div>

              <div style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 5].map(num => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setExtraSlotsToAdd(num)}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '8px',
                      border: extraSlotsToAdd === num ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                      background: extraSlotsToAdd === num ? 'var(--primary-light)' : '#ffffff',
                      color: extraSlotsToAdd === num ? 'var(--primary)' : '#475569',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    +{num} Branch{num > 1 ? 'es' : ''}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Calculation Breakdown */}
            <div style={{ background: '#f8fafc', padding: '14px 16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Additional Slots:</span>
                <strong style={{ color: '#0f172a' }}>{extraSlotsToAdd} Outlet</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Extra Branch Rate:</span>
                <strong style={{ color: '#0f172a' }}>₹{extraBranchUnitPrice}/mo each</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Subtotal ({extraSlotsToAdd} × ₹{extraBranchUnitPrice}):</span>
                <strong style={{ color: '#0f172a' }}>₹{extraBranchSubtotal.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>GST (18%):</span>
                <strong style={{ color: '#0f172a' }}>₹{extraBranchGst.toLocaleString()}</strong>
              </div>
              <div style={{ marginTop: '4px', paddingTop: '8px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Total Amount to Pay:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                  ₹{extraBranchTotal.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Select Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
                {[
                  { id: 'card', label: 'Credit Card', sub: '•••• 4242' },
                  { id: 'upi', label: 'UPI / QR', sub: 'Instant UPI' },
                  { id: 'netbanking', label: 'NetBanking', sub: 'Instant' }
                ].map(pm => (
                  <div
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id)}
                    style={{
                      padding: '10px',
                      borderRadius: '10px',
                      border: paymentMethod === pm.id ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                      background: paymentMethod === pm.id ? 'var(--primary-light)' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center'
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: 800, color: paymentMethod === pm.id ? 'var(--primary)' : '#0f172a' }}>{pm.label}</div>
                    <span style={{ fontSize: '10px', color: '#64748b' }}>{pm.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsExtraBranchModalOpen(false)}
                disabled={isProcessingPayment}
                style={{ padding: '10px 20px', borderRadius: '8px', fontWeight: 600 }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handleConfirmExtraBranchPurchase}
                disabled={isProcessingPayment}
                style={{ padding: '10px 22px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
              >
                {isProcessingPayment ? 'Processing...' : `Confirm & Pay ₹${extraBranchTotal.toLocaleString()}`}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 4: INVOICE RECEIPT MODAL */}
      {selectedInvoiceForView && (
        <Modal
          isOpen={!!selectedInvoiceForView}
          onClose={() => setSelectedInvoiceForView(null)}
          title="Subscription Recharge Receipt"
          maxWidth="480px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center', padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>SERVIQ CLOUD SUBSCRIPTION RECHARGE</span>
              <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--primary)', margin: '6px 0', fontFamily: "'Outfit', sans-serif" }}>
                ₹{selectedInvoiceForView.amount ? selectedInvoiceForView.amount.toLocaleString() : '1,999'}
              </div>
              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '3px 10px', borderRadius: '20px' }}>
                ● Recharge Successful
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Receipt / Invoice #:</span>
                <strong style={{ color: '#0f172a', fontFamily: 'monospace' }}>{selectedInvoiceForView.id}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Restaurant Name:</span>
                <strong style={{ color: '#0f172a' }}>{activeRestaurant.name}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Recharge Item:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoiceForView.planName || selectedInvoiceForView.description}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Description:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoiceForView.description}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Recharge Date:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoiceForView.date}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Payment Mode:</span>
                <strong style={{ color: '#0f172a' }}>{selectedInvoiceForView.paymentMethod}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
                <span style={{ color: '#64748b' }}>Status:</span>
                <strong style={{ color: '#059669' }}>● Paid / Active</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setSelectedInvoiceForView(null)}
                style={{ padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
              >
                Close
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={() => {
                  window.print();
                }}
                style={{ padding: '8px 18px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <DownloadIcon size={14} /> Print / Save PDF
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
