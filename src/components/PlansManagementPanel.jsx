import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { AVAILABLE_PLANS, getPlanBranchLimit } from '../config/initialData';
import SubscriptionApi from '../api/Subscription';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';

// Icons matching modern UI
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
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-8" />
    <path d="M16 12h-8" />
    <path d="M10 16H8" />
  </svg>
);

const DownloadIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
};

export default function PlansManagementPanel({ hasPermission: hasPermissionProp }) {
  const {
    activeRestaurant,
    upgradeSubscriptionPlan,
    upgradeRestaurantPlan,
    purchaseExtraBranchSlots,
    toggleSubscriptionAutoRenew,
    currentUser
  } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userType = (userTypeStr || roleStr || '').toUpperCase();
  const userRoleLower = (roleStr || '').toLowerCase();
  const isRestaurantOwner = 
    userType === 'RESTAURANT_OWNER' || 
    userType === 'OWNER' || 
    userType === 'SUPER ADMIN' || 
    userType === 'SUPER_ADMIN' || 
    userType === 'ADMIN' ||
    userRoleLower === 'restaurant_owner' || 
    userRoleLower === 'restaurant owner' || 
    userRoleLower === 'owner' || 
    userRoleLower === 'super admin' || 
    userRoleLower === 'super_admin' ||
    userRoleLower === 'admin';

  const role = roleStr || 'Admin';
  const hasPermission = hasPermissionProp || ((moduleName, action = 'view') => {
    if (isRestaurantOwner) return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    return !!userRoleConfig.permissions?.[moduleName]?.[action];
  });

  if (!isRestaurantOwner) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>
          🔒
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', fontFamily: "'Outfit', sans-serif" }}>
          Access Denied
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Plans & Subscription Management is strictly restricted to the <strong>Restaurant Owner</strong> only. Other roles do not have permission to view or manage subscription plans.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: 'var(--primary)', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [extraSlotsToAdd, setExtraSlotsToAdd] = useState(1);
  const [isExtraBranchModalOpen, setIsExtraBranchModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [upgradeBillingCycle, setUpgradeBillingCycle] = useState('monthly'); // 'monthly' | 'annual'
  const [selectedPlanCycles, setSelectedPlanCycles] = useState({
    'plan-premium': 'monthly',
    'plan-standard': 'monthly',
    'plan-basic': 'monthly'
  });
  const [upgradePaymentMethod, setUpgradePaymentMethod] = useState('card');
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState(null);
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'addon'
  const [historySearch, setHistorySearch] = useState('');
  const [localPurchases, setLocalPurchases] = useState([]);

  // Payment Checkout Popup State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [checkoutUpiMode, setCheckoutUpiMode] = useState('qr'); // 'qr' | 'vpa'
  const [checkoutUpiId, setCheckoutUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [checkoutCard, setCheckoutCard] = useState({
    number: '4532 8921 4452 9018',
    name: 'Restaurant Admin',
    expiry: '12/28',
    cvv: '821'
  });
  const [checkoutSelectedBank, setCheckoutSelectedBank] = useState('HDFC Bank');
  const [checkoutAutoRenew, setCheckoutAutoRenew] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Popup Managed Plans State (Ordered: Premium -> Standard -> Basic to match screenshot)
  const [plansList, setPlansList] = useState([
    {
      id: 'plan-premium',
      name: 'Premium Plan',
      status: 'Active',
      tagline: 'Advanced operations with integrated Kitchen KDS displays and advanced billing.',
      monthlyPrice: 4999,
      annualPrice: 49999,
      maxBranches: 8,
      features: [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: true },
        { name: 'Kitchen Management', included: true },
        { name: 'Inventory Management', included: true }
      ]
    },
    {
      id: 'plan-standard',
      name: 'Standard Plan',
      status: 'Active',
      tagline: 'Includes everything in Basic, plus tableside waiter service and app integrations.',
      monthlyPrice: 1999,
      annualPrice: 19999,
      maxBranches: 5,
      features: [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: true },
        { name: 'Kitchen Management', included: true },
        { name: 'Inventory Management', included: false }
      ]
    },
    {
      id: 'plan-basic',
      name: 'Basic Plan',
      status: 'Active',
      tagline: 'Essential tools for small eateries, QR menu ordering and simple table management.',
      monthlyPrice: 999,
      annualPrice: 9999,
      maxBranches: 3,
      features: [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: false },
        { name: 'Kitchen Management', included: false },
        { name: 'Inventory Management', included: false }
      ]
    }
  ]);

  const [editingPlan, setEditingPlan] = useState(null);

  // Fetch live subscription dashboard data
  const fetchDashboardData = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    const res = await SubscriptionApi.getDashboard();
    if (res.status && res.response) {
      const data = res.response.data || res.response;
      setDashboardData(data);
      if (showToast) {
        ShowNotifications.showAlertNotification(res.response.message || "Subscription dashboard data updated successfully.", true);
      }
    }
    setIsLoading(false);
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

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
    baseBranchLimit: 5,
    extraBranchSlots: 0,
    extraBranchPrice: 699,
    userLimit: 15,
    orderLimit: 2000,
    autoRenew: true,
  };

  // API Data breakdown with local fallbacks
  const activePlanData = dashboardData?.activePlan;
  const lastRechargeData = dashboardData?.lastRecharge;
  const branchCapacityData = dashboardData?.branchCapacity;
  const extraBranchRateData = dashboardData?.extraBranchRate;

  // Active Plan fields - Prioritize activeRestaurant and local selections over API fallbacks
  const cleanPlanSlug = String(activeRestaurant?.subscription?.planName || activeRestaurant?.plan || activePlanData?.planName || sub.planName || 'Standard')
    .replace(/^plan-/i, '')
    .replace(/\s*plan$/i, '')
    .trim() || 'Standard';
  const currentPlanName = `${cleanPlanSlug.charAt(0).toUpperCase() + cleanPlanSlug.slice(1)} Plan`;
  const currentBillingCycle = activePlanData?.billingCycle || (sub.billingCycle === 'annual' ? 'Annual' : 'Monthly');

  const matchedActivePlan = AVAILABLE_PLANS.find(p =>
    p.id === sub.planId ||
    p.name.toLowerCase().includes(cleanPlanSlug.toLowerCase()) ||
    cleanPlanSlug.toLowerCase().includes(p.name.toLowerCase().replace(/\s*plan$/i, '').trim())
  ) || AVAILABLE_PLANS[1];

  const currentPlanPrice = currentBillingCycle.toLowerCase().includes('annual')
    ? (matchedActivePlan.annualPrice || 19999)
    : (matchedActivePlan.monthlyPrice || 1999);

  const nextRenewalFormatted = formatDate(activePlanData?.nextRenewal || sub.nextBillingDate || '2026-09-23');
  const validityFormatted = formatDate(activePlanData?.validity || sub.expiryDate || '2026-09-23');

  // Branch Capacity fields - calculated strictly from selected active plan
  const branches = activeRestaurant?.branches || [];
  const activeBranchesCount = branches.length;
  const baseBranchLimit = getPlanBranchLimit(cleanPlanSlug, 5);
  const extraBranchSlots = branchCapacityData?.addons !== undefined 
    ? branchCapacityData.addons 
    : (sub.extraBranchSlots || 0);
  const totalAllowedBranches = baseBranchLimit + extraBranchSlots;
  const usedBranchesCount = activeBranchesCount;
  const remainingSlots = Math.max(0, totalAllowedBranches - usedBranchesCount);
  const branchUsagePercent = Math.min(100, Math.round((usedBranchesCount / (totalAllowedBranches || 1)) * 100));

  const extraBranchUnitPrice = extraBranchRateData?.rate !== undefined ? extraBranchRateData.rate : (matchedActivePlan?.extraBranchPrice || sub.extraBranchPrice || 699);
  const isAutoRenewActive = extraBranchRateData?.autoRenew !== undefined ? extraBranchRateData.autoRenew : (sub.autoRenew !== false);

  const extraBranchSubtotal = extraSlotsToAdd * extraBranchUnitPrice;
  const extraBranchGst = Math.round(extraBranchSubtotal * 0.18);
  const extraBranchTotal = extraBranchSubtotal + extraBranchGst;

  // Helper to normalize any invoice item
  const normalizeInvoice = (item, idx = 0) => {
    if (!item) return null;
    const isAddon =
      item.type === 'addon' ||
      (item.description || '').toLowerCase().includes('branch') ||
      (item.description || '').toLowerCase().includes('slot') ||
      (item.planName || '').toLowerCase().includes('add-on') ||
      (item.planName || '').toLowerCase().includes('addon') ||
      (item.transactionId || '').includes('ADDON') ||
      (item.id || '').includes('SLOT') ||
      (item.id || '').includes('ADDON') ||
      Number(item.amount) === 1650 ||
      Number(item.amount) === 699;

    const invoiceId = item.invoiceNumber || item.invoiceId || item.transactionId || item.id || item._id || `INV-${isAddon ? 'ADDON' : 'PLN'}-${String(idx + 1).padStart(3, '0')}`;
    const amount = Number(item.amount || item.totalAmount || item.price || (isAddon ? 1650 : currentPlanPrice));
    const date = item.date || item.createdAt || item.purchaseDate || item.rechargeDate || new Date().toISOString();
    const paymentMethod = item.paymentMethod || item.method || 'Credit Card (•••• 4242)';
    const status = item.status || 'Paid';
    const slots = item.additionalSlots || item.extraBranches || item.branchesIncluded || item.slots || (isAddon ? 2 : baseBranchLimit);

    const planName = item.planName || item.title || (isAddon ? 'Standard Add-on' : currentPlanName);
    const description = item.description || (isAddon ? `Additional Branch Slot x${slots} (Recurring Add-on)` : `${planName} - Monthly Subscription Renewal`);

    return {
      id: invoiceId,
      planName,
      type: isAddon ? 'addon' : 'subscription',
      description,
      branchesIncluded: slots,
      amount,
      date,
      paymentMethod,
      status
    };
  };

  // Compile full invoices list from all API endpoints, context, lastRecharge, and local purchases
  const allApiInvoices = [
    ...(Array.isArray(dashboardData?.history) ? dashboardData.history : []),
    ...(Array.isArray(dashboardData?.invoices) ? dashboardData.invoices : []),
    ...(Array.isArray(dashboardData?.rechargeHistory) ? dashboardData.rechargeHistory : []),
    ...(Array.isArray(dashboardData?.subscriptionInvoices) ? dashboardData.subscriptionInvoices : []),
    ...(Array.isArray(dashboardData?.addons) ? dashboardData.addons : []),
    ...(Array.isArray(dashboardData?.transactions) ? dashboardData.transactions : []),
    ...(Array.isArray(activeRestaurant?.subscriptionInvoices) ? activeRestaurant.subscriptionInvoices : [])
  ];

  let rawList = [...localPurchases, ...allApiInvoices];

  // If lastRechargeData exists and its transaction/date is not in list yet, include it
  if (lastRechargeData && (lastRechargeData.amount || lastRechargeData.date || lastRechargeData.transactionId)) {
    const isAlreadyPresent = rawList.some(inv => 
      (lastRechargeData.transactionId && (inv.id === lastRechargeData.transactionId || inv.transactionId === lastRechargeData.transactionId || inv.invoiceNumber === lastRechargeData.transactionId)) ||
      (lastRechargeData.date && inv.date === lastRechargeData.date && Number(inv.amount || inv.totalAmount) === Number(lastRechargeData.amount))
    );

    if (!isAlreadyPresent) {
      rawList.unshift({
        id: lastRechargeData.transactionId || lastRechargeData.invoiceId || `INV-SLOT-${Date.now().toString().slice(-6)}`,
        planName: lastRechargeData.planName || ((lastRechargeData.amount === 1650 || (branchCapacityData?.addons && branchCapacityData.addons > 0)) ? 'Standard Add-on' : `${currentPlanName}`),
        type: (lastRechargeData.type === 'addon' || lastRechargeData.amount === 1650 || (branchCapacityData?.addons && branchCapacityData.addons > 0)) ? 'addon' : 'subscription',
        description: lastRechargeData.description || ((lastRechargeData.amount === 1650 || (branchCapacityData?.addons && branchCapacityData.addons > 0)) ? `Additional Branch Slot x${branchCapacityData?.addons || 2} (Recurring Add-on)` : `${currentPlanName} - Monthly Subscription Renewal`),
        branchesIncluded: lastRechargeData.branchesIncluded || branchCapacityData?.addons || 2,
        amount: lastRechargeData.amount || 1650,
        date: lastRechargeData.date || new Date().toISOString(),
        paymentMethod: lastRechargeData.paymentMethod || 'Credit Card (•••• 4242)',
        status: lastRechargeData.status || 'Paid'
      });
    }
  }

  // Deduplicate and normalize
  const seenIds = new Set();
  const invoices = [];
  for (let i = 0; i < rawList.length; i++) {
    const item = normalizeInvoice(rawList[i], i);
    if (item && !seenIds.has(item.id)) {
      seenIds.add(item.id);
      invoices.push(item);
    }
  }

  const addonInvoices = invoices.filter(inv => inv.type === 'addon');
  const subscriptionInvoices = invoices.filter(inv => inv.type !== 'addon');

  const lastRecharge = (lastRechargeData && (lastRechargeData.amount || lastRechargeData.date)) ? {
    id: lastRechargeData.transactionId || lastRechargeData.invoiceId || invoices[0]?.id || 'PLAN-ACTIVE',
    planName: lastRechargeData.planName || invoices[0]?.planName || currentPlanName,
    description: lastRechargeData.description || invoices[0]?.description || `${currentPlanName} Subscription Renewal`,
    amount: lastRechargeData.amount !== undefined ? lastRechargeData.amount : (invoices[0]?.amount || currentPlanPrice),
    date: lastRechargeData.date || invoices[0]?.date || sub.startDate || new Date().toISOString(),
    paymentMethod: lastRechargeData.paymentMethod || invoices[0]?.paymentMethod || 'Online Payment',
    status: lastRechargeData.status || 'Paid'
  } : (invoices[0] || (activeRestaurant?.subscription ? {
    id: "PLAN-ACTIVE",
    planName: currentPlanName,
    description: `${currentPlanName} (${currentBillingCycle})`,
    amount: currentPlanPrice,
    date: sub.startDate || sub.nextBillingDate || new Date().toISOString(),
    paymentMethod: "Online Payment",
    status: "Active"
  } : null));

  const totalSpentOnPlans = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Filtered Invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch =
      (inv.id || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.description || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.planName || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.date || '').toLowerCase().includes(historySearch.toLowerCase()) ||
      (inv.paymentMethod || '').toLowerCase().includes(historySearch.toLowerCase());

    const isAddon = (inv.type === 'addon' || (inv.description || '').toLowerCase().includes('branch') || (inv.description || '').toLowerCase().includes('slot') || (inv.planName || '').toLowerCase().includes('add-on'));

    if (historyFilter === 'addon') {
      return matchesSearch && isAddon;
    }
    if (historyFilter === 'subscription') {
      return matchesSearch && !isAddon;
    }
    return matchesSearch;
  });

  // Handlers
  const handleConfirmExtraBranchPurchase = async () => {
    setIsProcessingPayment(true);
    try {
      let formattedPaymentMethod = 'Credit Card';
      if (paymentMethod === 'upi') {
        formattedPaymentMethod = 'UPI';
      } else if (paymentMethod === 'netbanking') {
        formattedPaymentMethod = 'NetBanking';
      } else if (paymentMethod === 'cash') {
        formattedPaymentMethod = 'Cash';
      }

      const payload = {
        additionalSlots: Number(extraSlotsToAdd),
        paymentMethod: formattedPaymentMethod
      };

      const res = await SubscriptionApi.purchaseAddons(payload);
      if (res && res.status) {
        const paymentInfo = res.response?.data?.payment || res.response?.payment || {};
        const newAddonInvoice = {
          id: paymentInfo.transactionId || `TXN-ADDON-${Date.now()}`,
          planName: `Standard Add-on`,
          description: `Additional Branch Slot x${extraSlotsToAdd} (Recurring Add-on)`,
          branchesIncluded: extraSlotsToAdd,
          amount: paymentInfo.amount || extraBranchTotal,
          date: new Date().toISOString(),
          paymentMethod: formattedPaymentMethod,
          status: paymentInfo.status || 'Paid',
          type: 'addon'
        };

        setLocalPurchases(prev => [newAddonInvoice, ...prev]);

        if (typeof purchaseExtraBranchSlots === 'function' && activeRestaurant?.id) {
          purchaseExtraBranchSlots(
            activeRestaurant.id,
            extraSlotsToAdd,
            formattedPaymentMethod
          );
        }
        setIsExtraBranchModalOpen(false);
        setExtraSlotsToAdd(1);
        await fetchDashboardData(false);
      }
    } catch (err) {
      console.error("Error purchasing addons:", err);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleSelectOrSwitchPlan = (targetPlan, isRenewal = false, cycleOverride = null, customPaymentMethod = null) => {
    if (!targetPlan) return;
    setIsProcessingUpgrade(true);
    const billing = cycleOverride || selectedPlanCycles[targetPlan.id] || upgradeBillingCycle || (currentBillingCycle.toLowerCase().includes('annual') ? 'annual' : 'monthly');
    const methodStr = customPaymentMethod || (upgradePaymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : upgradePaymentMethod === 'netbanking' ? 'HDFC NetBanking' : 'Credit Card (•••• 4242)');
    const cleanName = targetPlan.name.replace(/\s*plan$/i, '').trim();
    const branchLimit = targetPlan.maxBranches || targetPlan.branchLimit || getPlanBranchLimit(cleanName, 5);
    const planPrice = billing === 'annual' ? (targetPlan.annualPrice || 9999) : (targetPlan.monthlyPrice || 999);

    if (upgradeSubscriptionPlan && activeRestaurant?.id) {
      upgradeSubscriptionPlan(activeRestaurant.id, targetPlan.id, billing, methodStr);
    }
    if (upgradeRestaurantPlan && activeRestaurant?.id) {
      upgradeRestaurantPlan(activeRestaurant.id, cleanName);
    }

    const nextBillingDateFormatted = new Date();
    if (billing === 'annual') {
      nextBillingDateFormatted.setFullYear(nextBillingDateFormatted.getFullYear() + 1);
    } else {
      nextBillingDateFormatted.setMonth(nextBillingDateFormatted.getMonth() + 1);
    }

    setDashboardData(prev => ({
      ...prev,
      activePlan: {
        ...(prev?.activePlan || {}),
        planId: targetPlan.id,
        planName: `${cleanName} Plan`,
        billingCycle: billing === 'annual' ? 'Annual' : 'Monthly',
        price: planPrice,
        baseBranchLimit: branchLimit,
        nextRenewal: nextBillingDateFormatted.toISOString(),
        validity: nextBillingDateFormatted.toISOString(),
        status: 'Active'
      },
      branchCapacity: {
        ...(prev?.branchCapacity || {}),
        base: branchLimit,
        total: branchLimit + extraBranchSlots,
        used: activeBranchesCount,
        available: Math.max(0, branchLimit + extraBranchSlots - activeBranchesCount),
        percentUsed: Math.min(100, Math.round((activeBranchesCount / (branchLimit + extraBranchSlots || 1)) * 100))
      }
    }));

    setPlansList(prev => prev.map(p => ({
      ...p,
      status: p.id === targetPlan.id ? 'Active' : 'Available'
    })));

    const newInvoice = {
      id: `INV-PLN-${Date.now().toString().slice(-6)}`,
      planName: `${cleanName} Plan`,
      description: isRenewal ? `${cleanName} Plan - Subscription Renewal (${billing})` : `Plan Upgrade to ${cleanName} Plan (${billing})`,
      branchesIncluded: branchLimit,
      amount: planPrice,
      date: new Date().toISOString(),
      paymentMethod: methodStr,
      status: 'Paid',
      type: 'subscription'
    };
    setLocalPurchases(prev => [newInvoice, ...prev]);

    setIsProcessingUpgrade(false);
    setIsUpgradeModalOpen(false);
    setSelectedPlanForUpgrade(null);
    ShowNotifications.showAlertNotification(
      isRenewal
        ? `Subscription for ${cleanName} Plan successfully renewed (${billing})!`
        : `Subscription tier successfully updated to ${cleanName} Plan (Max ${branchLimit} Outlets)!`,
      true
    );
  };

  const handleInitiatePlanCheckout = (targetPlan, isRenewal = false, cycleOverride = null) => {
    if (!targetPlan) return;
    const cycle = cycleOverride || selectedPlanCycles[targetPlan.id] || upgradeBillingCycle || 'monthly';
    const basePrice = cycle === 'annual' ? (targetPlan.annualPrice || 49999) : (targetPlan.monthlyPrice || 4999);
    const gst = Math.round(basePrice * 0.18);
    const total = basePrice + gst;
    
    setCheckoutData({
      plan: targetPlan,
      isRenewal,
      cycle,
      basePrice,
      gst,
      total
    });
    setCheckoutPaymentMethod('upi');
    setCheckoutUpiMode('qr');
    setIsUpiVerified(false);
    setCheckoutUpiId('');
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmCheckoutPayment = async () => {
    if (!checkoutData || !checkoutData.plan) return;
    setIsProcessingCheckout(true);

    let methodDisplay = 'Credit Card (•••• 9018)';
    if (checkoutPaymentMethod === 'upi') {
      methodDisplay = checkoutUpiMode === 'qr' ? 'UPI / QR (Instant Scan)' : `UPI (${checkoutUpiId.trim() || 'user@upi'})`;
    } else if (checkoutPaymentMethod === 'netbanking') {
      methodDisplay = `${checkoutSelectedBank} NetBanking`;
    }

    // Realistic authorization delay
    await new Promise(resolve => setTimeout(resolve, 900));

    handleSelectOrSwitchPlan(
      checkoutData.plan,
      checkoutData.isRenewal,
      checkoutData.cycle,
      methodDisplay
    );

    setIsProcessingCheckout(false);
    setIsCheckoutModalOpen(false);
  };

  const handleTogglePlanActive = (planId) => {
    setPlansList(prev => prev.map(p => {
      if (p.id === planId) {
        const nextStatus = p.status === 'Active' ? 'Deactivated' : 'Active';
        ShowNotifications.showAlertNotification(`${p.name} has been ${nextStatus.toLowerCase()}!`, true);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleSaveEditPlan = (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setPlansList(prev => prev.map(p => p.id === editingPlan.id ? editingPlan : p));
    const targetIdx = AVAILABLE_PLANS.findIndex(p => p.id === editingPlan.id);
    if (targetIdx !== -1) {
      AVAILABLE_PLANS[targetIdx].branchLimit = Number(editingPlan.maxBranches);
      AVAILABLE_PLANS[targetIdx].monthlyPrice = Number(editingPlan.monthlyPrice);
      AVAILABLE_PLANS[targetIdx].annualPrice = Number(editingPlan.annualPrice);
      AVAILABLE_PLANS[targetIdx].tagline = editingPlan.tagline;
    }
    ShowNotifications.showAlertNotification(`${editingPlan.name} updated successfully!`, true);
    setEditingPlan(null);
  };

  const handleToggleAutoRenew = () => {
    toggleSubscriptionAutoRenew(activeRestaurant.id);
    ShowNotifications.showAlertNotification(
      `Auto-renewal has been ${!isAutoRenewActive ? 'enabled' : 'disabled'}.`,
      true
    );
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
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 16px',
              borderRadius: '10px',
              fontSize: '13px',
              fontWeight: 700,
              borderColor: '#cbd5e1',
              color: '#0f172a',
              background: '#ffffff',
              cursor: isRefreshing ? 'wait' : 'pointer'
            }}
          >
            <span style={{ display: 'inline-block', transform: isRefreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.6s linear' }}>
              🔄
            </span>
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>

          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setExtraSlotsToAdd(1);
              setIsExtraBranchModalOpen(true);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, borderColor: '#cbd5e1', color: '#0f172a', background: '#ffffff' }}
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
                {currentBillingCycle}
              </span>
            </div>
            <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '8px', fontFamily: "'Outfit', sans-serif" }}>
              {currentPlanName}
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              <strong style={{ color: 'var(--primary)', fontSize: '16px' }}>₹{currentPlanPrice ? currentPlanPrice.toLocaleString() : '0'}</strong> / {currentBillingCycle.toLowerCase().includes('annual') || currentBillingCycle.toLowerCase().includes('year') ? 'year' : 'month'}
            </div>
          </div>

          <div>
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
              <span>Next: <strong style={{ color: '#0f172a' }}>{nextRenewalFormatted}</strong></span>
              <span>Valid: <strong style={{ color: '#0f172a' }}>{validityFormatted}</strong></span>
            </div>
            <button
              type="button"
              onClick={() => {
                setUpgradeBillingCycle(currentBillingCycle.toLowerCase().includes('annual') ? 'annual' : 'monthly');
                setIsUpgradeModalOpen(true);
              }}
              style={{
                width: '100%',
                marginTop: '10px',
                padding: '7px 10px',
                borderRadius: '8px',
                border: '1.5px solid var(--primary)',
                background: 'var(--primary-light)',
                color: 'var(--primary)',
                fontSize: '11px',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '5px'
              }}
            >
              ⚡ Renew / Upgrade Plan
            </button>
          </div>
        </div>

        {/* Card 2: LAST RECHARGE SUMMARY */}
        <div style={{ background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)', borderRadius: '16px', border: '1.5px solid #cbd5e1', padding: '18px 20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HistoryIcon size={15} color="var(--primary)" />
                <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {lastRechargeData || invoices.length > 0 ? 'Last Recharge' : 'Active Plan'}
                </span>
              </div>
              <span style={{
                background: (lastRechargeData || invoices.length > 0) ? '#ecfdf5' : '#f0fdf4',
                color: '#166534',
                fontWeight: 800,
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0'
              }}>
                ● {lastRecharge ? (lastRecharge.status || 'Paid') : 'Active'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                ₹{(lastRecharge?.amount !== undefined ? lastRecharge.amount : currentPlanPrice).toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {lastRecharge?.date && (lastRechargeData || invoices.length > 0) ? `on ${formatDate(lastRecharge.date)}` : `Active Tier`}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600, marginTop: '4px', lineHeight: 1.4 }}>
              {lastRecharge?.planName || lastRecharge?.description || currentPlanName}
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>
              {lastRecharge?.id || 'PLAN-ACTIVE'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedInvoiceForView(lastRecharge || {
                id: "PLAN-ACTIVE",
                planName: currentPlanName,
                description: `${currentPlanName} (${currentBillingCycle})`,
                amount: currentPlanPrice,
                date: nextRenewalFormatted,
                paymentMethod: "Online Payment",
                status: "Active"
              })}
              style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '3px 8px', borderRadius: '5px', fontSize: '10px', fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '3px' }}
            >
              <ReceiptIcon size={11} /> {lastRechargeData || invoices.length > 0 ? 'Receipt' : 'Details'}
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
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>{usedBranchesCount}</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>/ {totalAllowedBranches} Outlets</span>
            </div>

            {/* Progress Bar */}
            <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '5px', overflow: 'hidden', marginTop: '8px' }}>
              <div
                style={{
                  width: `${Math.min(100, Math.max(0, branchUsagePercent))}%`,
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
                background: isAutoRenewActive ? '#dcfce7' : '#fee2e2',
                color: isAutoRenewActive ? '#15803d' : '#b91c1c',
                padding: '3px 8px',
                borderRadius: '16px',
                fontSize: '10px',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              {isAutoRenewActive ? '✓ Enabled' : '✕ Disabled'}
            </button>
          </div>
        </div>

      </div>

      {/* 2. PLANS RECHARGE HISTORY & INVOICES LOG */}
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
              <strong style={{ fontSize: '14px', color: '#0f172a' }}>
                {isLoading ? '...' : `${invoices.length} Payments (₹${totalSpentOnPlans.toLocaleString()})`}
              </strong>
            </div>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '8px 14px', borderRadius: '10px', textAlign: 'right' }}>
              <span style={{ fontSize: '11px', color: '#166534', display: 'block' }}>Latest Recharge:</span>
              <strong style={{ fontSize: '14px', color: '#166534' }}>
                {isLoading ? '...' : (lastRecharge?.date && (lastRechargeData || invoices.length > 0) ? `${formatDate(lastRecharge.date)} (₹${(lastRecharge.amount || currentPlanPrice).toLocaleString()})` : 'Active Subscription')}
              </strong>
            </div>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: `All History (${invoices.length})` },
              { id: 'subscription', label: `Plan Subscriptions (${subscriptionInvoices.length})` },
              { id: 'addon', label: `Branch Add-ons (${addonInvoices.length})` }
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

          <div style={{ position: 'relative', width: '320px', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="Search invoice, plan, date..."
              value={historySearch}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setHistorySearch(val);
              }}
              style={{
                width: '100%',
                height: '38px',
                padding: '0 14px 0 34px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
              🔍
            </span>
          </div>
        </div>

        {/* History Table */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <div style={{ width: '100%', overflowX: 'auto', borderRadius: '14px' }}>
            <table style={{ width: '100%', minWidth: '880px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '150px' }}>Recharge Date</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '140px' }}>Invoice #</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '220px' }}>Plan & Recharge Item</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '130px' }}>Amount Paid</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '110px' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '140px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isRefreshing ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading recharge history...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      No recharge records found.
                    </td>
                  </tr>
                ) : (
                  filteredInvoices.map((inv, idx) => {
                    const isLatest = idx === 0;
                    const isAddon = (inv.type === 'addon' || (inv.description || '').toLowerCase().includes('branch') || (inv.description || '').toLowerCase().includes('slot') || (inv.planName || '').toLowerCase().includes('add-on'));

                    return (
                      <tr key={inv.id} style={{ borderBottom: idx !== filteredInvoices.length - 1 ? '1px solid #f1f5f9' : 'none', background: isLatest ? '#fafafa' : '#ffffff' }}>
                        <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{formatDate(inv.date)}</span>
                            {isLatest && (
                              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                Latest
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                            via {inv.paymentMethod}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: 700, color: 'var(--primary)', fontFamily: 'monospace', fontSize: '13px' }}>
                          {inv.id}
                        </td>

                        <td style={{ padding: '14px 18px' }}>
                          <div style={{ color: '#0f172a', fontWeight: 700, fontSize: '13px' }}>
                            {inv.planName || inv.description}
                          </div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                            {inv.description} {isAddon ? '• Add-on Slot' : `• (${inv.branchesIncluded || baseBranchLimit} Outlets)`}
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                          <div style={{ fontSize: '14px', color: '#0f172a' }}>₹{inv.amount ? inv.amount.toLocaleString() : '1,999'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>incl. GST</div>
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', border: '1px solid #bbf7d0', display: 'inline-block' }}>
                            ● {inv.status || 'Paid'}
                          </span>
                        </td>

                        <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                          <button
                            type="button"
                            onClick={() => setSelectedInvoiceForView(inv)}
                            style={{
                              border: '1.5px solid #cbd5e1',
                              background: '#ffffff',
                              color: '#1e293b',
                              padding: '7px 14px',
                              borderRadius: '8px',
                              fontSize: '12px',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                              whiteSpace: 'nowrap',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#ff5a1f';
                              e.currentTarget.style.color = '#ff5a1f';
                              e.currentTarget.style.background = '#fff7ed';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#cbd5e1';
                              e.currentTarget.style.color = '#1e293b';
                              e.currentTarget.style.background = '#ffffff';
                            }}
                          >
                            <ReceiptIcon size={14} />
                            <span>View Receipt</span>
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
      </div>

      {/* MODAL: BRANCH-BASED PLAN CALCULATION & ADD-ON CALCULATOR POPUP (TRIGGERED BY + BUY ADDONS) */}
      {isExtraBranchModalOpen && (
        <Modal
          isOpen={isExtraBranchModalOpen}
          onClose={() => {
            if (!isProcessingPayment) {
              setExtraSlotsToAdd(1);
              setIsExtraBranchModalOpen(false);
            }
          }}
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
                onClick={() => {
                  setExtraSlotsToAdd(1);
                  setIsExtraBranchModalOpen(false);
                }}
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

      {/* MODAL: INVOICE RECEIPT MODAL */}
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
                <strong style={{ color: '#0f172a' }}>{formatDate(selectedInvoiceForView.date)}</strong>
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

      {/* MODAL: SUBSCRIPTION UPGRADE & PLANS MANAGEMENT MODAL */}
      {isUpgradeModalOpen && (
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => !isProcessingUpgrade && setIsUpgradeModalOpen(false)}
          title="Plans Management"
          maxWidth="1140px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '10px 0' }}>

            {/* 3 PLAN COMPARISON CARDS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '22px', alignItems: 'stretch' }}>
              {plansList.map(plan => {
                const planClean = plan.name.toLowerCase().replace(/\s*plan$/i, '').trim();
                const currentClean = cleanPlanSlug.toLowerCase();
                const isCurrentPlan = currentClean === planClean || 
                  plan.id === sub.planId || 
                  (sub.planName && plan.name.toLowerCase().includes(sub.planName.toLowerCase()));

                const planCycle = selectedPlanCycles[plan.id] || 'monthly';
                const isAnnual = planCycle === 'annual';
                const activePrice = isAnnual ? (plan.annualPrice || 9999) : (plan.monthlyPrice || 999);

                return (
                  <div
                    key={plan.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: isCurrentPlan ? '2px solid var(--primary)' : '1.5px solid #eef2f6',
                      padding: '28px 24px 22px 24px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      position: 'relative',
                      boxShadow: isCurrentPlan ? '0 6px 24px rgba(255, 90, 31, 0.12)' : '0 4px 20px rgba(0, 0, 0, 0.03)',
                      transition: 'transform 0.15s, box-shadow 0.15s'
                    }}
                  >
                    <div>
                      {/* Top Row: Title */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                            {plan.name}
                          </h3>
                          {isCurrentPlan && (
                            <span style={{ fontSize: '10px', background: 'var(--primary)', color: '#fff', padding: '1px 6px', borderRadius: '4px', fontWeight: 800 }}>
                              CURRENT
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Active Status Badge */}
                      <div style={{ marginTop: '8px' }}>
                        <span style={{
                          display: 'inline-block',
                          padding: '3px 9px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 800,
                          backgroundColor: isCurrentPlan ? '#e6f9f0' : '#f1f5f9',
                          color: isCurrentPlan ? '#10b981' : '#64748b',
                          border: isCurrentPlan ? '1px solid #bbf7d0' : '1px solid #e2e8f0'
                        }}>
                          {isCurrentPlan ? '● Active' : 'Available'}
                        </span>
                      </div>

                      {/* Tagline Description */}
                      <p style={{ fontSize: '12.5px', color: '#64748b', margin: '14px 0 18px 0', lineHeight: 1.5, minHeight: '38px' }}>
                        {plan.tagline}
                      </p>

                      {/* Billing Cycle & Rate Selector Dropdown */}
                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ display: 'block', fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px', marginBottom: '6px' }}>
                          BILLING CYCLE & RATE
                        </label>
                        <div style={{ position: 'relative' }}>
                          <select
                            value={planCycle}
                            onChange={(e) => setSelectedPlanCycles(prev => ({ ...prev, [plan.id]: e.target.value }))}
                            style={{
                              width: '100%',
                              padding: '10px 36px 10px 14px',
                              borderRadius: '8px',
                              border: '1.5px solid #cbd5e1',
                              background: '#f8fafc',
                              fontSize: '13px',
                              fontWeight: 700,
                              color: '#0f172a',
                              outline: 'none',
                              cursor: 'pointer',
                              appearance: 'none',
                              WebkitAppearance: 'none',
                              MozAppearance: 'none',
                              boxSizing: 'border-box',
                              fontFamily: "'Outfit', sans-serif"
                            }}
                          >
                            <option value="monthly">
                              Monthly Rate — ₹{plan.monthlyPrice ? plan.monthlyPrice.toLocaleString() : '999'}/mo
                            </option>
                            <option value="annual">
                              Annual Rate — ₹{plan.annualPrice ? plan.annualPrice.toLocaleString() : '9,999'}/yr (Save 15%)
                            </option>
                          </select>
                          <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#64748b', display: 'flex', alignItems: 'center' }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Max Branches */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '16px', borderBottom: '1px solid #f1f5f9' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px' }}>
                          MAX BRANCHES
                        </span>
                        <span style={{ fontSize: '16px', fontWeight: 800, color: '#ea580c', fontFamily: "'Outfit', sans-serif" }}>
                          {plan.maxBranches} Outlets
                        </span>
                      </div>

                      {/* Includes Features Section */}
                      <div style={{ marginTop: '18px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', letterSpacing: '0.5px', marginBottom: '14px' }}>
                          INCLUDES FEATURES:
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {plan.features.map((feat, fIdx) => (
                            <li key={fIdx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13px' }}>
                              {feat.included ? (
                                <>
                                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                  </svg>
                                  <span style={{ color: '#0f172a', fontWeight: 700 }}>{feat.name}</span>
                                </>
                              ) : (
                                <>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                  <span style={{ color: '#cbd5e1', fontWeight: 500 }}>{feat.name}</span>
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Bottom Action Button: Renew Current Plan vs Switch to this Plan */}
                    <div style={{ marginTop: '26px' }}>
                      {isCurrentPlan ? (
                        <button
                          type="button"
                          onClick={() => handleInitiatePlanCheckout(plan, true, planCycle)}
                          disabled={isProcessingUpgrade || isProcessingCheckout}
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: '#10b981',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 800,
                            cursor: (isProcessingUpgrade || isProcessingCheckout) ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                            transition: 'all 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
                          </svg>
                          {isProcessingUpgrade ? 'Processing...' : `⚡ Renew Plan (₹${activePrice.toLocaleString()}/${isAnnual ? 'yr' : 'mo'})`}
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleInitiatePlanCheckout(plan, false, planCycle)}
                          disabled={isProcessingUpgrade || isProcessingCheckout}
                          style={{
                            width: '100%',
                            padding: '11px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: '#ffffff',
                            fontSize: '13px',
                            fontWeight: 700,
                            cursor: (isProcessingUpgrade || isProcessingCheckout) ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            transition: 'all 0.15s',
                            boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                          }}
                          onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                          </svg>
                          {isProcessingUpgrade ? 'Processing...' : `Switch to ${plan.name} (₹${activePrice.toLocaleString()}/${isAnnual ? 'yr' : 'mo'})`}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </Modal>
      )}

      {/* MODAL: PAYMENT CHECKOUT POPUP MODAL */}
      {isCheckoutModalOpen && checkoutData && checkoutData.plan && (
        <Modal
          isOpen={isCheckoutModalOpen}
          onClose={() => {
            if (!isProcessingCheckout) {
              setIsCheckoutModalOpen(false);
            }
          }}
          title="💳 Subscription Checkout & Payment"
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '6px' }}>

            {/* Plan Overview Summary Box */}
            <div style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
              padding: '16px 20px',
              borderRadius: '12px',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(15, 23, 42, 0.2)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-15px', top: '-15px', opacity: 0.08, pointerEvents: 'none' }}>
                <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
                </svg>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#ffffff', fontFamily: "'Outfit', sans-serif" }}>
                      {checkoutData.plan.name}
                    </h3>
                    <span style={{
                      background: checkoutData.isRenewal ? '#10b981' : 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '10px',
                      fontWeight: 800,
                      padding: '2px 8px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      {checkoutData.isRenewal ? 'Renewal' : 'Upgrade'}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
                    Billing: <strong>{checkoutData.cycle === 'annual' ? 'Annual (365 Days)' : 'Monthly (30 Days)'}</strong> • Up to <strong>{checkoutData.plan.maxBranches} Outlets</strong>
                  </p>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>Plan Price</div>
                  <div style={{ fontSize: '20px', fontWeight: 900, color: '#38bdf8', fontFamily: "'Outfit', sans-serif" }}>
                    ₹{checkoutData.basePrice.toLocaleString()}
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', gap: '14px', flexWrap: 'wrap', fontSize: '11.5px', color: '#e2e8f0' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  All POS & Menu Features
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  Instant Activation
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  GST Invoice Receipt
                </span>
              </div>
            </div>

            {/* Price Calculation & Tax Breakdown */}
            <div style={{ background: '#f8fafc', padding: '14px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Base Subscription Fee ({checkoutData.cycle === 'annual' ? '1 Year' : '1 Month'}):</span>
                <strong style={{ color: '#0f172a' }}>₹{checkoutData.basePrice.toLocaleString()}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>GST (18% CGST + SGST):</span>
                <strong style={{ color: '#0f172a' }}>₹{checkoutData.gst.toLocaleString()}</strong>
              </div>
              <div style={{ marginTop: '4px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', display: 'block' }}>Total Payable Amount:</span>
                  <span style={{ fontSize: '11px', color: '#64748b' }}>Inclusive of all taxes & charges</span>
                </div>
                <span style={{ fontSize: '22px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                  ₹{checkoutData.total.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Choose Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
                {[
                  { id: 'upi', label: '📱 UPI / QR Code', sub: 'GPay, PhonePe, Paytm' },
                  { id: 'card', label: '💳 Credit / Debit Card', sub: 'Visa, MasterCard, RuPay' },
                  { id: 'netbanking', label: '🏦 Net Banking', sub: 'All Major Banks' }
                ].map(pm => (
                  <div
                    key={pm.id}
                    onClick={() => setCheckoutPaymentMethod(pm.id)}
                    style={{
                      padding: '12px 10px',
                      borderRadius: '10px',
                      border: checkoutPaymentMethod === pm.id ? '2px solid var(--primary)' : '1px solid #cbd5e1',
                      background: checkoutPaymentMethod === pm.id ? '#fff7ed' : '#ffffff',
                      cursor: 'pointer',
                      textAlign: 'center',
                      transition: 'all 0.15s',
                      boxShadow: checkoutPaymentMethod === pm.id ? '0 2px 8px rgba(255, 90, 31, 0.15)' : 'none'
                    }}
                  >
                    <div style={{ fontSize: '12.5px', fontWeight: 800, color: checkoutPaymentMethod === pm.id ? 'var(--primary)' : '#0f172a' }}>{pm.label}</div>
                    <span style={{ fontSize: '10px', color: '#64748b', display: 'block', marginTop: '2px' }}>{pm.sub}</span>
                  </div>
                ))}
              </div>

              {/* METHOD 1: UPI / QR Payment */}
              {checkoutPaymentMethod === 'upi' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Mode switcher: QR vs VPA */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setCheckoutUpiMode('qr')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: checkoutUpiMode === 'qr' ? '#ffffff' : 'transparent',
                        color: checkoutUpiMode === 'qr' ? '#0f172a' : '#64748b',
                        boxShadow: checkoutUpiMode === 'qr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      ⚡ Scan QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setCheckoutUpiMode('vpa')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: checkoutUpiMode === 'vpa' ? '#ffffff' : 'transparent',
                        color: checkoutUpiMode === 'vpa' ? '#0f172a' : '#64748b',
                        boxShadow: checkoutUpiMode === 'vpa' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      🆔 Enter UPI ID
                    </button>
                  </div>

                  {checkoutUpiMode === 'qr' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px', padding: '6px 0' }}>
                      {/* Stylized QR Visual */}
                      <div style={{
                        width: '150px',
                        height: '150px',
                        background: '#ffffff',
                        border: '2px solid #0f172a',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      }}>
                        <svg width="130" height="130" viewBox="0 0 100 100" fill="#0f172a">
                          {/* Corner Top-Left */}
                          <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="10" y="10" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="15" y="15" width="10" height="10" rx="1" fill="#0f172a" />
                          {/* Corner Top-Right */}
                          <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="70" y="10" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="75" y="15" width="10" height="10" rx="1" fill="#0f172a" />
                          {/* Corner Bottom-Left */}
                          <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="10" y="70" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="15" y="75" width="10" height="10" rx="1" fill="#0f172a" />
                          {/* Data points */}
                          <rect x="42" y="10" width="8" height="8" fill="#ff5a1f" />
                          <rect x="42" y="24" width="8" height="8" fill="#0f172a" />
                          <rect x="10" y="42" width="8" height="8" fill="#0f172a" />
                          <rect x="24" y="42" width="8" height="8" fill="#ff5a1f" />
                          <rect x="42" y="42" width="16" height="16" rx="2" fill="#ff5a1f" />
                          <rect x="65" y="42" width="8" height="8" fill="#0f172a" />
                          <rect x="79" y="42" width="8" height="8" fill="#ff5a1f" />
                          <rect x="42" y="65" width="8" height="8" fill="#0f172a" />
                          <rect x="42" y="79" width="8" height="8" fill="#ff5a1f" />
                          <rect x="65" y="65" width="12" height="12" fill="#0f172a" />
                          <rect x="80" y="80" width="10" height="10" fill="#0f172a" />
                        </svg>
                      </div>

                      <div style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>
                        Scan QR with any UPI App: <strong style={{ color: '#0f172a' }}>Google Pay, PhonePe, Paytm, BHIM, CRED</strong>
                      </div>
                      <div style={{ background: '#ecfdf5', color: '#059669', fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px', border: '1px solid #a7f3d0' }}>
                        ⏱️ QR Active • Valid for 10:00 mins
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                        Enter Virtual Payment Address (UPI ID):
                      </label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <input
                          type="text"
                          placeholder="e.g. mobile@okhdfcbank or user@upi"
                          value={checkoutUpiId}
                          onChange={(e) => {
                            setCheckoutUpiId(e.target.value);
                            setIsUpiVerified(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: isUpiVerified ? '1.5px solid #10b981' : '1.5px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (checkoutUpiId.includes('@')) {
                              setIsUpiVerified(true);
                              ShowNotifications.showAlertNotification("UPI ID verified successfully! (Restaurant Admin)", true);
                            } else {
                              ShowNotifications.showAlertNotification("Please enter a valid UPI ID (e.g., username@upi)", false);
                            }
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: isUpiVerified ? '#10b981' : '#0f172a',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {isUpiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>

                      {/* Quick handles */}
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {['@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map(handle => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const prefix = checkoutUpiId.includes('@') ? checkoutUpiId.split('@')[0] : (checkoutUpiId || 'merchant');
                              setCheckoutUpiId(`${prefix}${handle}`);
                              setIsUpiVerified(true);
                            }}
                            style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              border: '1px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '11px',
                              color: '#64748b',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            +{handle}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* METHOD 2: Credit / Debit Card */}
              {checkoutPaymentMethod === 'card' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={checkoutCard.number}
                      onChange={(e) => setCheckoutCard(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="4532 8921 4452 9018"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={checkoutCard.name}
                      onChange={(e) => setCheckoutCard(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Name on card"
                      style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        Expiry (MM/YY)
                      </label>
                      <input
                        type="text"
                        value={checkoutCard.expiry}
                        onChange={(e) => setCheckoutCard(prev => ({ ...prev, expiry: e.target.value }))}
                        placeholder="MM/YY"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                        CVV / CVC
                      </label>
                      <input
                        type="password"
                        maxLength="4"
                        value={checkoutCard.cvv}
                        onChange={(e) => setCheckoutCard(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="•••"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* METHOD 3: Net Banking */}
              {checkoutPaymentMethod === 'netbanking' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    Select Popular Bank:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                      <div
                        key={bank}
                        onClick={() => setCheckoutSelectedBank(bank)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: checkoutSelectedBank === bank ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                          background: checkoutSelectedBank === bank ? 'var(--primary-light)' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: checkoutSelectedBank === bank ? 'var(--primary)' : '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: checkoutSelectedBank === bank ? 'var(--primary)' : '#cbd5e1' }}></span>
                        {bank}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Or Choose Other Bank:
                    </label>
                    <select
                      value={checkoutSelectedBank}
                      onChange={(e) => setCheckoutSelectedBank(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: 600,
                        background: '#ffffff',
                        outline: 'none'
                      }}
                    >
                      <option value="HDFC Bank">HDFC Bank</option>
                      <option value="ICICI Bank">ICICI Bank</option>
                      <option value="State Bank of India">State Bank of India</option>
                      <option value="Axis Bank">Axis Bank</option>
                      <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                      <option value="Punjab National Bank">Punjab National Bank</option>
                      <option value="Bank of Baroda">Bank of Baroda</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Auto-renew checkbox */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <input
                type="checkbox"
                id="checkout-auto-renew"
                checked={checkoutAutoRenew}
                onChange={(e) => setCheckoutAutoRenew(e.target.checked)}
                style={{ width: '16px', height: '16px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="checkout-auto-renew" style={{ fontSize: '12px', color: '#334155', fontWeight: 600, cursor: 'pointer' }}>
                Enable auto-renewal for this plan (Cancel or change anytime from Plans Management)
              </label>
            </div>

            {/* Security Guarantee Note */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '11px', color: '#64748b' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
              <span>256-Bit SSL Encrypted &bull; RBI-Compliant Gateway &bull; Instant Receipt Generated</span>
            </div>

            {/* Bottom Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '4px', paddingTop: '10px', borderTop: '1px solid #f1f5f9' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsCheckoutModalOpen(false)}
                disabled={isProcessingCheckout}
                style={{ padding: '10px 18px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handleConfirmCheckoutPayment}
                disabled={isProcessingCheckout}
                style={{
                  padding: '10px 24px',
                  borderRadius: '8px',
                  background: checkoutData.isRenewal ? '#10b981' : 'var(--primary)',
                  color: '#ffffff',
                  fontWeight: 800,
                  fontSize: '13.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: checkoutData.isRenewal ? '0 4px 12px rgba(16, 185, 129, 0.3)' : '0 4px 12px rgba(255, 90, 31, 0.3)',
                  cursor: isProcessingCheckout ? 'wait' : 'pointer'
                }}
              >
                {isProcessingCheckout ? (
                  <>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                    </svg>
                    Authorizing Payment...
                  </>
                ) : (
                  <>
                    🔒 Pay ₹{checkoutData.total.toLocaleString()} & Activate
                  </>
                )}
              </button>
            </div>

          </div>
        </Modal>
      )}

    </div>
  );
}

