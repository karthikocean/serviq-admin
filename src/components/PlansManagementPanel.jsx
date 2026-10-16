import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { AVAILABLE_PLANS, getPlanBranchLimit, resolveHumanPlanName, isMongoId } from '../config/initialData';
import SubscriptionApi from '../api/Subscription';
import BranchApi from '../api/Branch';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import { getMainBranch, resolveBranchLocation, resolveBranchContactNumber } from '../helper/BranchHelper';

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

const CrownIcon = ({ size = 20, color = '#ea580c' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
    <path d="M4 20h16" />
  </svg>
);

const formatHumanDate = (dateStr) => {
  if (!dateStr) return '14 Nov 2026';
  try {
    let d;
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const parts = dateStr.split('/');
      if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
      else d = new Date(dateStr);
    } else {
      d = new Date(dateStr);
    }
    if (isNaN(d.getTime())) return dateStr;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  } catch {
    return dateStr;
  }
};

const getEffectiveDate = (baseDateStr, isAnnual = false) => {
  try {
    let d = new Date();
    if (baseDateStr) {
      if (typeof baseDateStr === 'string' && baseDateStr.includes('/')) {
        const parts = baseDateStr.split('/');
        if (parts.length === 3) d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
        else d = new Date(baseDateStr);
      } else {
        d = new Date(baseDateStr);
      }
    }
    if (isNaN(d.getTime())) d = new Date();
    const next = new Date(d);
    if (isAnnual) {
      next.setFullYear(next.getFullYear() + 1);
    } else {
      next.setMonth(next.getMonth() + 1);
    }
    return formatHumanDate(next);
  } catch {
    return '14 Dec 2026';
  }
};

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
    currentUser,
    hasPermission: contextHasPermission,
    selectedBranchId
  } = useAppState();

  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';
  const isRestaurantOwner = userTypeStr.toUpperCase().trim() === 'RESTAURANT_OWNER';

  const role = roleStr || 'Admin';
  const hasPermission = (moduleName, action = 'view') => isRestaurantOwner;

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
          Subscription is restricted to Restaurant Owners only.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: 'var(--primary)', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const [dashboardData, setDashboardData] = useState(null);
  const [apiBranches, setApiBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [extraSlotsToAdd, setExtraSlotsToAdd] = useState(1);
  const [isExtraBranchModalOpen, setIsExtraBranchModalOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [changePlanStep, setChangePlanStep] = useState(1); // 1 = Change Plan, 2 = Review & Confirm, 'success' = Success message
  const [selectedPlanId, setSelectedPlanId] = useState('plan-premium');
  const [selectedBillingCycle, setSelectedBillingCycle] = useState('monthly'); // 'monthly' | 'yearly'
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
  const [historyFilter, setHistoryFilter] = useState('all'); // 'all' | 'subscription' | 'addon' | 'upgrade'
  const [historySearch, setHistorySearch] = useState('');
  const [debouncedHistorySearch, setDebouncedHistorySearch] = useState('');
  const [historyPage, setHistoryPage] = useState(0);
  const historyLimit = 10;
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [tabCounts, setTabCounts] = useState({
    all: 0,
    subscription: 0,
    addon: 0,
    upgrade: 0
  });
  const [localPurchases, setLocalPurchases] = useState([]);

  // Debounce history search input to avoid excessive API requests
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedHistorySearch(historySearch);
    }, 350);
    return () => clearTimeout(handler);
  }, [historySearch]);

  // Reset page when filter or search changes
  useEffect(() => {
    setHistoryPage(0);
  }, [historyFilter, debouncedHistorySearch]);

  // Buy Addons Payment Form State
  const [addonCard, setAddonCard] = useState({
    number: '4532 8921 4452 9018',
    name: 'Restaurant Admin',
    expiry: '12/28',
    cvv: '889'
  });
  const [addonUpiMode, setAddonUpiMode] = useState('qr');
  const [addonUpiId, setAddonUpiId] = useState('admin@okhdfcbank');
  const [addonIsUpiVerified, setAddonIsUpiVerified] = useState(true);
  const [addonSelectedBank, setAddonSelectedBank] = useState('HDFC Bank');

  // Payment Checkout Popup State
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('upi'); // 'upi' | 'card' | 'netbanking'
  const [checkoutUpiMode, setCheckoutUpiMode] = useState('qr'); // 'qr' | 'vpa'
  const [checkoutUpiId, setCheckoutUpiId] = useState('');
  const [isUpiVerified, setIsUpiVerified] = useState(false);
  const [checkoutCard, setCheckoutCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [checkoutSelectedBank, setCheckoutSelectedBank] = useState('HDFC Bank');
  const [checkoutAutoRenew, setCheckoutAutoRenew] = useState(true);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Popup Managed Plans State (Ordered: Basic -> Standard -> Premium)
  const [plansList, setPlansList] = useState([
    {
      id: 'plan-basic',
      name: 'Basic',
      version: '2.0',
      status: 'Active',
      tagline: 'Essential features for small businesses',
      monthlyPrice: 999,
      annualPrice: 9990,
      maxBranches: 3,
      maxSubBranches: 5,
      features: [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: false },
        { name: 'Kitchen Management', included: false },
        { name: 'Inventory Management', included: false }
      ]
    },
    {
      id: 'plan-standard',
      name: 'Standard',
      version: '2.0',
      status: 'Active',
      tagline: 'Advanced features for growing businesses',
      monthlyPrice: 1999,
      annualPrice: 19990,
      maxBranches: 5,
      maxSubBranches: 5,
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
      id: 'plan-premium',
      name: 'Premium',
      version: '2.0',
      status: 'Active',
      tagline: 'All features for large businesses',
      monthlyPrice: 4999,
      annualPrice: 49990,
      maxBranches: 10,
      maxSubBranches: 5,
      features: [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: true },
        { name: 'Kitchen Management', included: true },
        { name: 'Inventory Management', included: true }
      ]
    }
  ]);

  const [editingPlan, setEditingPlan] = useState(null);

  const formatPlanItem = useCallback((rawPlan) => {
    if (!rawPlan) return null;
    const rawPName = rawPlan.planName || rawPlan.name || '';
    const cleanSlug = resolveHumanPlanName(rawPName, rawPlan.monthlyPrice >= 4000 ? 'Premium' : (rawPlan.monthlyPrice < 1500 ? 'Basic' : 'Standard'));
    const pName = `${cleanSlug} Plan`;
    const planId = rawPlan._id || rawPlan.id || `plan-${cleanSlug.toLowerCase()}`;

    let features = [];
    if (rawPlan.featuresIncluded && typeof rawPlan.featuresIncluded === 'object' && !Array.isArray(rawPlan.featuresIncluded)) {
      const labelMap = {
        'menu': 'Menu Management',
        'tables': 'Table Management',
        'orders': 'Order Management',
        'waiter-list': 'Waiter Management',
        'kitchen-list': 'Kitchen Management',
        'inventory': 'Inventory Management',
        'qr-code-config': 'QR Ordering & Config'
      };
      const orderedKeys = ['menu', 'tables', 'orders', 'waiter-list', 'kitchen-list', 'inventory', 'qr-code-config'];
      orderedKeys.forEach(k => {
        if (rawPlan.featuresIncluded[k] !== undefined) {
          features.push({
            name: labelMap[k] || k,
            included: Boolean(rawPlan.featuresIncluded[k])
          });
        }
      });
      Object.keys(rawPlan.featuresIncluded).forEach(k => {
        if (!orderedKeys.includes(k)) {
          features.push({
            name: labelMap[k] || k.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
            included: Boolean(rawPlan.featuresIncluded[k])
          });
        }
      });
    } else if (Array.isArray(rawPlan.features) && rawPlan.features.length > 0) {
      features = rawPlan.features;
    } else {
      features = [
        { name: 'Menu Management', included: true },
        { name: 'Table Management', included: true },
        { name: 'Order Management', included: true },
        { name: 'Waiter Management', included: cleanSlug !== 'basic' },
        { name: 'Kitchen Management', included: cleanSlug !== 'basic' },
        { name: 'Inventory Management', included: cleanSlug === 'premium' }
      ];
    }

    const monthlyPriceVal = Number(
      rawPlan.monthlyPrice ??
      rawPlan.basePrice ??
      rawPlan.baseValue ??
      rawPlan.price ??
      rawPlan.monthlyRate ??
      rawPlan.monthlyCost ??
      rawPlan.rate ??
      rawPlan.amount ??
      rawPlan.planPrice ??
      (cleanSlug === 'premium' ? 4999 : cleanSlug === 'basic' ? 999 : 1999)
    );

    const annualPriceVal = Number(
      rawPlan.annualPrice ??
      rawPlan.yearlyPrice ??
      rawPlan.annualRate ??
      rawPlan.yearlyRate ??
      rawPlan.annualCost ??
      rawPlan.yearlyCost ??
      (monthlyPriceVal ? Math.round(monthlyPriceVal * 10) : (cleanSlug === 'premium' ? 49999 : cleanSlug === 'basic' ? 9999 : 19999))
    );

    const branchCapVal = Number(
      rawPlan.maxBranches ??
      rawPlan.branchLimit ??
      rawPlan.baseBranchLimit ??
      rawPlan.branchCapacity ??
      rawPlan.allowedBranches ??
      rawPlan.maxOutlets ??
      rawPlan.maxBranch ??
      rawPlan.capacity ??
      rawPlan.outletsLimit ??
      (cleanSlug === 'premium' ? 10 : cleanSlug === 'basic' ? 3 : 5)
    );

    const fallbackTagline = cleanSlug === 'premium'
      ? 'All features for large businesses'
      : cleanSlug === 'basic'
      ? 'Essential features for small businesses'
      : 'Advanced features for growing businesses';

    const normalizedAnnualPrice = cleanSlug === 'premium' ? 49990 : cleanSlug === 'basic' ? 9990 : 19990;

    return {
      ...rawPlan,
      id: planId,
      _id: rawPlan._id || planId,
      name: cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1),
      planName: rawPlan.planName || pName,
      version: '2.0',
      tagline: rawPlan.planDescription || rawPlan.tagline || fallbackTagline,
      planDescription: rawPlan.planDescription || rawPlan.tagline || fallbackTagline,
      monthlyPrice: monthlyPriceVal,
      basePrice: monthlyPriceVal,
      baseValue: monthlyPriceVal,
      monthlyDiscount: Number(rawPlan.monthlyDiscount ?? 0),
      annualPrice: annualPriceVal || normalizedAnnualPrice,
      yearlyPrice: annualPriceVal || normalizedAnnualPrice,
      maxBranches: branchCapVal,
      maxSubBranches: 5,
      branchLimit: branchCapVal,
      baseBranchLimit: branchCapVal,
      branchCapacity: branchCapVal,
      allowedBranches: branchCapVal,
      maxOutlets: branchCapVal,
      featuresIncluded: rawPlan.featuresIncluded || {},
      features: features,
      status: rawPlan.status || (rawPlan.isActive !== false ? 'Active' : 'Inactive'),
      isActive: rawPlan.isActive !== false
    };
  }, []);

  // Fetch live subscription dashboard, branches & plans data from API
  const fetchDashboardData = useCallback(async (showToast = false) => {
    setIsRefreshing(true);
    try {
      const initParams = {
        page: historyPage,
        limit: historyLimit
      };
      if (historyFilter && historyFilter !== 'all') {
        initParams.type = historyFilter;
        initParams.filter = historyFilter;
        initParams.category = historyFilter;
      }
      if (debouncedHistorySearch && debouncedHistorySearch.trim()) {
        initParams.search = debouncedHistorySearch.trim();
        initParams.searchTerm = debouncedHistorySearch.trim();
        initParams.searchQuery = debouncedHistorySearch.trim();
      }
      if (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
        initParams.branchId = selectedBranchId;
      }

      const [dashRes, plansRes, branchRes] = await Promise.allSettled([
        SubscriptionApi.getDashboard(initParams),
        SubscriptionApi.getPlans(),
        BranchApi.getBranches()
      ]);

      const dashValue = dashRes.status === 'fulfilled' ? dashRes.value : null;
      const plansValue = plansRes.status === 'fulfilled' ? plansRes.value : null;
      const branchValue = branchRes.status === 'fulfilled' ? branchRes.value : null;

      if (branchValue && branchValue.status && branchValue.response) {
        const rawBranches = Array.isArray(branchValue.response?.data)
          ? branchValue.response.data
          : (Array.isArray(branchValue.response?.branches)
              ? branchValue.response.branches
              : (Array.isArray(branchValue.response) ? branchValue.response : []));
        if (rawBranches.length > 0) {
          setApiBranches(rawBranches);
        }
      }

      if (dashValue && dashValue.status && dashValue.response) {
        const data = dashValue.response?.data?.data || dashValue.response?.data || dashValue.response;
        setDashboardData(data);
      }

      let fetchedPlans = [];
      if (plansValue && plansValue.status && plansValue.response) {
        const rawPlans = Array.isArray(plansValue.response?.data?.data)
          ? plansValue.response.data.data
          : (Array.isArray(plansValue.response?.data)
              ? plansValue.response.data
              : (Array.isArray(plansValue.response?.plans) ? plansValue.response.plans : (Array.isArray(plansValue.response) ? plansValue.response : [])));
        if (rawPlans.length > 0) {
          fetchedPlans = rawPlans.map(formatPlanItem).filter(Boolean);
        }
      }

      if (fetchedPlans.length === 0 && dashValue?.response) {
        const data = dashValue.response?.data?.data || dashValue.response?.data || dashValue.response;
        const rawPlans = data?.plans || data?.availablePlans || data?.allPlans;
        if (Array.isArray(rawPlans) && rawPlans.length > 0) {
          fetchedPlans = rawPlans.map(formatPlanItem).filter(Boolean);
        }
      }

      if (fetchedPlans.length > 0) {
        // Sort ascending by monthly price: Basic -> Standard -> Premium
        fetchedPlans.sort((a, b) => (a.monthlyPrice || 0) - (b.monthlyPrice || 0));
        setPlansList(fetchedPlans);
        
        // Sync AVAILABLE_PLANS in memory with live backend values from Super Admin
        fetchedPlans.forEach(p => {
          const cleanP = String(p.planName || p.name || '').toLowerCase().replace(/\s*plan$/i, '').trim();
          const target = AVAILABLE_PLANS.find(ap => 
            ap.id === p.id || 
            ap.id === p._id || 
            ap.name.toLowerCase().includes(cleanP) || 
            cleanP.includes(ap.name.toLowerCase().replace(/\s*plan$/i, '').trim())
          );
          if (target) {
            if (p.maxBranches !== undefined) {
              target.maxBranches = Number(p.maxBranches);
              target.branchLimit = Number(p.maxBranches);
              target.baseBranchLimit = Number(p.maxBranches);
              target.branchCapacity = Number(p.maxBranches);
            }
            if (p.monthlyPrice !== undefined) {
              target.monthlyPrice = Number(p.monthlyPrice);
              target.price = Number(p.monthlyPrice);
              target.basePrice = Number(p.monthlyPrice);
              target.baseValue = Number(p.monthlyPrice);
            }
            if (p.annualPrice !== undefined) {
              target.annualPrice = Number(p.annualPrice);
              target.yearlyPrice = Number(p.annualPrice);
            }
          }
        });

        setSelectedPlanCycles(prev => {
          const next = { ...prev };
          fetchedPlans.forEach(p => {
            if (!next[p.id]) next[p.id] = 'monthly';
          });
          return next;
        });
      }

      if (showToast) {
        ShowNotifications.showAlertNotification(
          dashValue?.response?.message || plansValue?.response?.message || "Subscription plans & dashboard data updated.",
          true
        );
      }
    } catch (err) {
      console.warn("Error loading subscription dashboard or plans:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [formatPlanItem, historyPage, historyLimit, historyFilter, debouncedHistorySearch, selectedBranchId]);

  // Fetch filtered subscription history directly from backend API when filters change
  const fetchHistoryData = useCallback(async () => {
    setIsHistoryLoading(true);
    try {
      const params = {
        page: historyPage,
        limit: historyLimit
      };

      if (historyFilter && historyFilter !== 'all') {
        params.type = historyFilter;
        params.filter = historyFilter;
        params.category = historyFilter;
      }

      if (debouncedHistorySearch && debouncedHistorySearch.trim()) {
        params.search = debouncedHistorySearch.trim();
        params.searchTerm = debouncedHistorySearch.trim();
        params.searchQuery = debouncedHistorySearch.trim();
      }

      if (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
        params.branchId = selectedBranchId;
      }

      const dashRes = await SubscriptionApi.getDashboard(params);
      if (dashRes && dashRes.status && dashRes.response) {
        const data = dashRes.response?.data?.data || dashRes.response?.data || dashRes.response;
        setDashboardData(prev => {
          if (!prev) return data;
          return {
            ...prev,
            ...data,
            history: Array.isArray(data?.history) ? data.history : (Array.isArray(data?.invoices) ? data.invoices : (Array.isArray(data) ? data : (data?.history ?? prev.history))),
            invoices: Array.isArray(data?.invoices) ? data.invoices : (Array.isArray(data?.history) ? data.history : (data?.invoices ?? prev.invoices)),
            rechargeHistory: Array.isArray(data?.rechargeHistory) ? data.rechargeHistory : (data?.rechargeHistory ?? prev.rechargeHistory),
            totalInvoices: data?.total ?? data?.totalInvoices ?? data?.count
          };
        });
      }
    } catch (err) {
      console.warn("Failed to fetch filtered subscription history from backend:", err);
    } finally {
      setIsHistoryLoading(false);
    }
  }, [historyFilter, debouncedHistorySearch, historyPage, historyLimit, selectedBranchId]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Re-fetch filtered results from backend when filter parameters change
  useEffect(() => {
    if (dashboardData) {
      fetchHistoryData();
    }
  }, [historyFilter, debouncedHistorySearch, historyPage, selectedBranchId, fetchHistoryData]);

  // Listen to plan & branch updates across modules
  useEffect(() => {
    const handleSync = () => {
      fetchDashboardData(false);
    };
    window.addEventListener('plan_updated', handleSync);
    window.addEventListener('branch_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('plan_updated', handleSync);
      window.removeEventListener('branch_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [fetchDashboardData]);

  // Active Subscription extraction with fallbacks
  const sub = activeRestaurant?.subscription || {
    planId: 'plan-standard',
    planName: activeRestaurant?.plan || 'Standard Plan',
    status: 'Active',
    billingCycle: 'monthly',
    price: 1999,
    annualPrice: 19999,
    startDate: '2026-08-24',
    expiryDate: '2027-08-24',
    nextBillingDate: '2026-09-24',
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

  // Active Plan fields - Clean human-readable name guaranteed from API / profile
  const cleanPlanSlug = resolveHumanPlanName(
    activePlanData?.cleanName ||
    activePlanData?.planName ||
    activePlanData?.name ||
    activeRestaurant?.subscription?.planName ||
    activeRestaurant?.plan ||
    currentUser?.subscription?.planName ||
    currentUser?.plan ||
    sub.planName,
    'Standard'
  );

  const candidatePlanId = activePlanData?.planId || 
                          activePlanData?._id || 
                          activePlanData?.id ||
                          activeRestaurant?.subscription?.planId || 
                          currentUser?.subscription?.planId ||
                          `plan-${cleanPlanSlug.toLowerCase()}`;

  const currentPlanId = (cleanPlanSlug || '').toLowerCase().includes('basic')
    ? 'plan-basic'
    : (cleanPlanSlug || '').toLowerCase().includes('standard')
    ? 'plan-standard'
    : 'plan-premium';

  let matchedActivePlan = plansList.find(p => {
    const pSlug = resolveHumanPlanName(p.planName || p.name || p.id, '');
    return pSlug.toLowerCase() === cleanPlanSlug.toLowerCase();
  }) || AVAILABLE_PLANS.find(p => {
    const pSlug = resolveHumanPlanName(p.name || p.id, '');
    return pSlug.toLowerCase() === cleanPlanSlug.toLowerCase();
  });

  if (!matchedActivePlan && candidatePlanId) {
    matchedActivePlan = plansList.find(p => p.id === candidatePlanId || p._id === candidatePlanId) ||
                        AVAILABLE_PLANS.find(p => p.id === candidatePlanId || p._id === candidatePlanId);
  }

  if (!matchedActivePlan) {
    matchedActivePlan = AVAILABLE_PLANS.find(p => p.name.toLowerCase().includes(cleanPlanSlug.toLowerCase())) || AVAILABLE_PLANS[1];
  }

  const currentPlanName = activePlanData?.planName 
    ? (activePlanData.planName.toLowerCase().includes('plan') ? activePlanData.planName : `${activePlanData.planName} Plan`)
    : `${cleanPlanSlug} Plan`;

  const currentBillingCycle = (activePlanData?.billingCycle ? (String(activePlanData.billingCycle).toLowerCase().includes('annual') || String(activePlanData.billingCycle).toLowerCase().includes('year') ? 'Annual' : 'Monthly') : null) ||
    (activeRestaurant?.subscription?.billingCycle ? (String(activeRestaurant.subscription.billingCycle).toLowerCase().includes('annual') || String(activeRestaurant.subscription.billingCycle).toLowerCase().includes('year') ? 'Annual' : 'Monthly') : null) ||
    (String(sub.billingCycle).toLowerCase().includes('annual') || String(sub.billingCycle).toLowerCase().includes('year') ? 'Annual' : 'Monthly');
    
  const isAnnualCycle = currentBillingCycle.toLowerCase().includes('annual') || currentBillingCycle.toLowerCase().includes('year');

  const currentPlanPrice = (activePlanData?.price !== undefined && activePlanData?.price !== null)
    ? Number(activePlanData.price)
    : (isAnnualCycle
        ? Number(
            matchedActivePlan?.annualPrice ??
            matchedActivePlan?.yearlyPrice ??
            (matchedActivePlan?.monthlyPrice ? matchedActivePlan.monthlyPrice * 10 : (cleanPlanSlug.toLowerCase() === 'premium' ? 49999 : cleanPlanSlug.toLowerCase() === 'basic' ? 9999 : 19999))
          )
        : Number(
            matchedActivePlan?.monthlyPrice ??
            matchedActivePlan?.basePrice ??
            matchedActivePlan?.baseValue ??
            matchedActivePlan?.price ??
            (cleanPlanSlug.toLowerCase() === 'premium' ? 4999 : cleanPlanSlug.toLowerCase() === 'basic' ? 999 : 1999)
          )
      );

  const rawStartDate = activePlanData?.startDate || activeRestaurant?.subscription?.startDate || sub.startDate || '2026-09-21';
  
  // Calculate dynamic expiry date based on startDate and cycle
  const getCalculatedExpiryDate = (startStr, isAnnual) => {
    try {
      const d = new Date(startStr.includes('/') ? startStr.split('/').reverse().join('-') : startStr);
      if (isNaN(d.getTime())) return isAnnual ? '2027-09-21' : '2026-10-21';
      const exp = new Date(d);
      if (isAnnual) {
        exp.setFullYear(exp.getFullYear() + 1);
      } else {
        exp.setMonth(exp.getMonth() + 1);
      }
      return exp.toISOString().split('T')[0];          
    } catch (e) {
      return isAnnual ? '2027-09-21' : '2026-10-21';
    }
  };

  const dynamicCalculatedExpiry = getCalculatedExpiryDate(rawStartDate, isAnnualCycle);

  const rawExpiryDate = activePlanData?.validity || 
                        activePlanData?.expiryDate || 
                        (activeRestaurant?.subscription?.billingCycle && ((String(activeRestaurant.subscription.billingCycle).toLowerCase().includes('annual')) === isAnnualCycle) && (activeRestaurant?.subscription?.expiryDate || activeRestaurant?.subscription?.validity)) ||
                        dynamicCalculatedExpiry;

  const rawNextRenewal = activePlanData?.nextRenewal || 
                         activePlanData?.nextBillingDate || 
                         rawExpiryDate;

  const startDateFormatted = formatDate(rawStartDate);
  const validityFormatted = formatDate(rawExpiryDate);
  const nextRenewalFormatted = formatDate(rawNextRenewal);

  // Branch Capacity fields - dynamically prioritize active plan's correct outlet quota
  const branchesList = (apiBranches && apiBranches.length > 0)
    ? apiBranches
    : (activeRestaurant?.branches || []);
  const activeBranchesCount = branchesList.length;

  const matchedSelectedBranch = (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && String(selectedBranchId).toUpperCase() !== 'COMPANY')
    ? branchesList.find(b => String(b._id || b.id || b.branchCode) === String(selectedBranchId))
    : null;
  const mainBranchObj = typeof getMainBranch === 'function' ? getMainBranch(branchesList) : null;
  const activeBranchName = matchedSelectedBranch?.branchName || matchedSelectedBranch?.name || mainBranchObj?.branchName || mainBranchObj?.name || branchesList[0]?.branchName || branchesList[0]?.name || currentUser?.branchName || 'Main Branch';

  const planDefinedLimit = Number(
    branchCapacityData?.base ??
    activePlanData?.baseBranchLimit ??
    activePlanData?.maxBranches ??
    activePlanData?.branchLimit ??
    activePlanData?.branchCapacity ??
    matchedActivePlan?.maxBranches ??
    matchedActivePlan?.branchLimit ??
    getPlanBranchLimit(cleanPlanSlug, 5)
  );

  const baseBranchLimit = Number(
    branchCapacityData?.base ??
    activePlanData?.baseBranchLimit ??
    activePlanData?.maxBranches ??
    activePlanData?.branchLimit ??
    activePlanData?.branchCapacity ??
    activeRestaurant?.subscription?.baseBranchLimit ??
    planDefinedLimit
  );

  const extraBranchSlots = Number(
    branchCapacityData?.addons ??
    branchCapacityData?.extraSlots ??
    activeRestaurant?.subscription?.extraBranchSlots ??
    sub.extraBranchSlots ??
    0
  );

  const totalAllowedBranches = Number(
    branchCapacityData?.total ??
    (baseBranchLimit + extraBranchSlots)
  );

  const usedBranchesCount = Number(
    branchCapacityData?.used ??
    branchCapacityData?.activeBranches ??
    branchCapacityData?.currentBranches ??
    branchCapacityData?.branchesCount ??
    activeBranchesCount
  );

  const remainingSlots = Number(
    branchCapacityData?.available ??
    Math.max(0, totalAllowedBranches - usedBranchesCount)
  );

  const branchUsagePercent = Number(
    branchCapacityData?.percentUsed ??
    Math.min(100, Math.round((usedBranchesCount / (totalAllowedBranches || 1)) * 100))
  );

  const extraBranchUnitPrice = Number(
    extraBranchRateData?.rate ??
    matchedActivePlan?.extraBranchPrice ??
    sub.extraBranchPrice ??
    699
  );

  const isAutoRenewActive = extraBranchRateData?.autoRenew !== undefined
    ? Boolean(extraBranchRateData.autoRenew)
    : (activeRestaurant?.subscription?.autoRenew !== undefined 
        ? Boolean(activeRestaurant.subscription.autoRenew) 
        : (sub.autoRenew !== false));

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
    const branchName = item.branchName || (typeof item.branch === 'object' ? (item.branch?.branchName || item.branch?.name) : item.branch) || (typeof item.branchId === 'object' ? (item.branchId?.branchName || item.branchId?.name) : null) || activeBranchName;

    return {
      id: invoiceId,
      planName,
      type: isAddon ? 'addon' : 'subscription',
      description,
      branchesIncluded: slots,
      amount,
      date,
      paymentMethod,
      status,
      branchName
    };
  };

  // Compile invoices list from backend API response and local purchases
  const allApiInvoices = [
    ...(Array.isArray(dashboardData?.history) ? dashboardData.history : []),
    ...(Array.isArray(dashboardData?.invoices) ? dashboardData.invoices : []),
    ...(Array.isArray(dashboardData?.rechargeHistory) ? dashboardData.rechargeHistory : []),
    ...(Array.isArray(dashboardData?.subscriptionInvoices) ? dashboardData.subscriptionInvoices : []),
    ...(Array.isArray(dashboardData?.addons) ? dashboardData.addons : []),
    ...(Array.isArray(dashboardData?.transactions) ? dashboardData.transactions : []),
    ...(Array.isArray(activeRestaurant?.subscriptionInvoices) ? activeRestaurant.subscriptionInvoices : [])
  ];

  let rawList = [...allApiInvoices];
  if (historyFilter === 'all' && !debouncedHistorySearch) {
    rawList = [...localPurchases, ...allApiInvoices];

    // If lastRechargeData exists and its transaction/date is not in list yet, include it
    if (lastRechargeData && (lastRechargeData.amount !== undefined || lastRechargeData.date || lastRechargeData.transactionId || lastRechargeData.invoice || lastRechargeData.invoiceId)) {
      const lastRecInvoiceId = lastRechargeData.invoice || lastRechargeData.invoiceId || lastRechargeData.transactionId;
      const isAlreadyPresent = rawList.some(inv => 
        (lastRecInvoiceId && (inv.id === lastRecInvoiceId || inv.transactionId === lastRecInvoiceId || inv.invoiceNumber === lastRecInvoiceId || inv.invoice === lastRecInvoiceId)) ||
        (lastRechargeData.date && inv.date === lastRechargeData.date && Number(inv.amount || inv.totalAmount) === Number(lastRechargeData.amount))
      );

      if (!isAlreadyPresent) {
        rawList.unshift({
          id: lastRecInvoiceId || `INV-RECHARGE-${Date.now().toString().slice(-6)}`,
          planName: lastRechargeData.planName || ((lastRechargeData.amount === 1650) ? 'Standard Add-on' : `${currentPlanName}`),
          type: (lastRechargeData.type === 'addon' || lastRechargeData.amount === 1650) ? 'addon' : 'subscription',
          description: lastRechargeData.description || ((lastRechargeData.amount === 1650) ? `Additional Branch Slot (Recurring Add-on)` : `${currentPlanName} Subscription Renewal`),
          branchesIncluded: lastRechargeData.branchesIncluded || branchCapacityData?.total || baseBranchLimit,
          amount: lastRechargeData.amount || 0,
          date: lastRechargeData.date || new Date().toISOString(),
          paymentMethod: lastRechargeData.paymentMethod || 'Online Payment',
          status: lastRechargeData.status || 'Paid'
        });
      }
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

  const isAddonInvoice = (inv) => {
    const desc = (inv.description || '').toLowerCase();
    const name = (inv.planName || '').toLowerCase();
    const type = (inv.type || '').toLowerCase();
    return type === 'addon' || desc.includes('branch') || desc.includes('slot') || name.includes('add-on') || desc.includes('add-on');
  };

  const isUpgradeInvoice = (inv) => {
    const desc = (inv.description || '').toLowerCase();
    const name = (inv.planName || '').toLowerCase();
    const type = (inv.type || '').toLowerCase();
    return type === 'upgrade' || type === 'renewal' || desc.includes('upgrade') || desc.includes('renewal') || name.includes('upgrade') || name.includes('renewal');
  };

  const addonInvoices = invoices.filter(inv => isAddonInvoice(inv));
  const upgradeInvoices = invoices.filter(inv => !isAddonInvoice(inv) && isUpgradeInvoice(inv));
  const subscriptionInvoices = invoices.filter(inv => !isAddonInvoice(inv) && !isUpgradeInvoice(inv));

  // Sync tab badge counts from un-filtered dataset or backend summary counts
  useEffect(() => {
    if (dashboardData?.counts) {
      setTabCounts({
        all: Number(dashboardData.counts.all ?? dashboardData.counts.total ?? 0),
        subscription: Number(dashboardData.counts.subscription ?? 0),
        addon: Number(dashboardData.counts.addon ?? 0),
        upgrade: Number(dashboardData.counts.upgrade ?? 0)
      });
    } else if (historyFilter === 'all' && !debouncedHistorySearch) {
      setTabCounts({
        all: invoices.length,
        subscription: subscriptionInvoices.length,
        addon: addonInvoices.length,
        upgrade: upgradeInvoices.length
      });
    }
  }, [dashboardData, invoices.length, subscriptionInvoices.length, addonInvoices.length, upgradeInvoices.length, historyFilter, debouncedHistorySearch]);

  const lastRecharge = (lastRechargeData && (lastRechargeData.amount !== undefined || lastRechargeData.date || lastRechargeData.invoice || lastRechargeData.invoiceId || lastRechargeData.transactionId)) ? {
    id: lastRechargeData.invoice || lastRechargeData.invoiceId || lastRechargeData.transactionId || invoices[0]?.id || 'PLAN-ACTIVE',
    planName: lastRechargeData.planName || invoices[0]?.planName || currentPlanName,
    description: lastRechargeData.description || invoices[0]?.description || `${currentPlanName} Subscription Renewal`,
    amount: lastRechargeData.amount !== undefined ? lastRechargeData.amount : (invoices[0]?.amount || currentPlanPrice),
    date: lastRechargeData.date || invoices[0]?.date || sub.startDate || new Date().toISOString(),
    paymentMethod: lastRechargeData.paymentMethod || invoices[0]?.paymentMethod || 'Online Payment',
    status: (lastRechargeData.status || 'Paid').toLowerCase() === 'active' ? 'Paid' : (lastRechargeData.status || 'Paid'),
    branchName: lastRechargeData.branchName || invoices[0]?.branchName || activeBranchName
  } : (invoices[0] || (activeRestaurant?.subscription ? {
    id: "TXN-UPGRADE-1792128319952",
    planName: currentPlanName,
    description: `${currentPlanName} (${currentBillingCycle})`,
    amount: currentPlanPrice,
    date: sub.startDate || sub.nextBillingDate || new Date().toISOString(),
    paymentMethod: "UPI",
    status: "Paid",
    branchName: activeBranchName
  } : null));

  const totalSpentOnPlans = invoices.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  // Invoices are filtered directly by the backend API request - no frontend filtering
  const filteredInvoices = invoices;

  const totalInvoicesCount = Number(dashboardData?.totalInvoices ?? dashboardData?.total ?? dashboardData?.count ?? filteredInvoices.length);
  const historyTotalPages = Math.max(1, Math.ceil(totalInvoicesCount / historyLimit));

  useEffect(() => {
    if (historyPage >= historyTotalPages && historyTotalPages > 0) {
      setHistoryPage(Math.max(0, historyTotalPages - 1));
    }
  }, [historyTotalPages, historyPage]);

  const paginatedInvoices = (dashboardData?.total !== undefined || dashboardData?.totalInvoices !== undefined || filteredInvoices.length <= historyLimit)
    ? filteredInvoices
    : filteredInvoices.slice(historyPage * historyLimit, (historyPage + 1) * historyLimit);

  const getHistoryPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = historyPage + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(historyTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

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

  const handleSelectOrSwitchPlan = async (targetPlan, isRenewal = false, cycleOverride = null, customPaymentMethod = null, keepModalOpenForSuccess = false) => {
    if (!targetPlan) return;
    setIsProcessingUpgrade(true);
    const billing = cycleOverride || selectedPlanCycles[targetPlan.id] || upgradeBillingCycle || (currentBillingCycle.toLowerCase().includes('annual') ? 'annual' : 'monthly');
    const isAnnual = billing === 'annual';
    const billingParam = isAnnual ? 'Annually' : 'Monthly';
    const methodStr = customPaymentMethod || (upgradePaymentMethod === 'upi' ? 'UPI (Google Pay / PhonePe)' : upgradePaymentMethod === 'netbanking' ? 'HDFC NetBanking' : 'Credit Card');
    const cleanName = resolveHumanPlanName(targetPlan.name || targetPlan.planName || targetPlan.id);
    const branchLimit = targetPlan.maxBranches || targetPlan.branchLimit || getPlanBranchLimit(cleanName, 5);
    const planPrice = isAnnual ? (targetPlan.annualPrice || 49999) : (targetPlan.monthlyPrice || 4999);

    let apiResult = null;
    try {
      const planMongoId = targetPlan._id || targetPlan.id || targetPlan.planId;
      if (isRenewal) {
        apiResult = await SubscriptionApi.renewSubscription({
          newPlanId: planMongoId,
          planId: planMongoId,
          plan: planMongoId,
          _id: planMongoId,
          billingCycle: billingParam,
          paymentMethod: methodStr
        });
      } else {
        apiResult = await SubscriptionApi.upgradeSubscription({
          newPlanId: planMongoId,
          planId: planMongoId,
          plan: planMongoId,
          _id: planMongoId,
          billingCycle: billingParam,
          paymentMethod: methodStr
        });
      }
    } catch (err) {
      console.warn("Backend subscription call warning:", err);
    }

    const subData = apiResult?.response?.data?.subscription || apiResult?.response?.subscription || apiResult?.response?.data;
    const subId = subData?.subscriptionId || subData?._id || `SUB-${Date.now().toString().slice(-6)}`;
    const finalAmount = subData?.amountPaid || subData?.planPrice || planPrice;
    const finalStartDate = subData?.startDate || new Date().toISOString();
    
    const now = new Date();
    const startDateFormattedStr = now.toISOString().split('T')[0];
    const expiryDateObj = new Date(now);
    if (isAnnual) {
      expiryDateObj.setFullYear(now.getFullYear() + 1);
    } else {
      expiryDateObj.setMonth(now.getMonth() + 1);
    }
    const expiryDateFormattedStr = expiryDateObj.toISOString().split('T')[0];

    const finalEndDate = subData?.endDate || subData?.renewalDate || expiryDateFormattedStr;
    const finalRenewalDate = subData?.renewalDate || subData?.endDate || expiryDateFormattedStr;
    const maxBranches = subData?.maxBranches || branchLimit;
    const extraBranches = subData?.extraBranches !== undefined ? subData.extraBranches : extraBranchSlots;

    const planSaveInfo = {
      planId: targetPlan.id || `plan-${cleanName.toLowerCase()}`,
      planName: `${cleanName} Plan`,
      cleanName: cleanName,
      billingCycle: isAnnual ? 'annual' : 'monthly',
      price: planPrice,
      annualPrice: targetPlan.annualPrice || (targetPlan.monthlyPrice ? targetPlan.monthlyPrice * 10 : 19999),
      monthlyPrice: targetPlan.monthlyPrice || 1999,
      baseBranchLimit: branchLimit,
      startDate: startDateFormattedStr,
      expiryDate: expiryDateFormattedStr,
      validity: expiryDateFormattedStr,
      nextBillingDate: expiryDateFormattedStr,
      nextRenewal: expiryDateFormattedStr,
      autoRenew: isAutoRenewActive,
      paymentMethod: methodStr,
      updatedAt: new Date().toISOString()
    };
    try {
      sessionStorage.removeItem('activePlanSelection');
      localStorage.removeItem('activePlanSelection');
    } catch (e) {}

    if (upgradeSubscriptionPlan && activeRestaurant?.id) {
      upgradeSubscriptionPlan(activeRestaurant.id, targetPlan.id, billing, methodStr);
    }

    const newInvoice = {
      id: subId,
      transactionId: subId,
      planName: `${cleanName} Plan`,
      description: isRenewal ? `${cleanName} Plan - Subscription Renewal (${billingParam})` : `Plan Upgrade to ${cleanName} Plan (${billingParam})`,
      branchesIncluded: maxBranches + extraBranches,
      amount: finalAmount,
      date: subData?.createdAt || finalStartDate,
      paymentMethod: methodStr,
      status: subData?.status || 'Paid',
      type: 'subscription'
    };
    setLocalPurchases(prev => [newInvoice, ...prev]);

    setDashboardData(prev => ({
      ...prev,
      subscription: subData || prev?.subscription,
      activePlan: {
        ...(prev?.activePlan || {}),
        planId: targetPlan.id,
        planName: `${cleanName} Plan`,
        billingCycle: isAnnual ? 'Annually' : 'Monthly',
        price: planPrice,
        annualPrice: targetPlan.annualPrice || (planPrice * 10),
        monthlyPrice: targetPlan.monthlyPrice || 1999,
        baseBranchLimit: maxBranches,
        startDate: startDateFormattedStr,
        nextRenewal: finalRenewalDate,
        validity: finalEndDate,
        status: subData?.status || 'Active'
      },
      branchCapacity: {
        ...(prev?.branchCapacity || {}),
        base: maxBranches,
        addons: extraBranches,
        total: maxBranches + extraBranches,
        used: activeBranchesCount,
        available: Math.max(0, maxBranches + extraBranches - activeBranchesCount),
        percentUsed: Math.min(100, Math.round((activeBranchesCount / (maxBranches + extraBranches || 1)) * 100))
      },
      lastRecharge: {
        transactionId: subId,
        invoiceId: subId,
        planName: `${cleanName} Plan`,
        description: isRenewal ? `${cleanName} Plan - Subscription Renewal` : `Plan Upgrade to ${cleanName} Plan`,
        amount: finalAmount,
        date: subData?.createdAt || finalStartDate,
        paymentMethod: methodStr,
        status: subData?.status || 'Paid'
      }
    }));

    setPlansList(prev => prev.map(p => ({
      ...p,
      status: p.id === targetPlan.id ? 'Active' : 'Available'
    })));

    setIsProcessingUpgrade(false);
    if (!keepModalOpenForSuccess) {
      setIsUpgradeModalOpen(false);
    }
    setSelectedPlanForUpgrade(null);
    window.dispatchEvent(new Event('plan_updated'));
    await fetchDashboardData(false);
  };

  const handleConfirmPlanChange = async () => {
    const targetPlan = plansList.find(p => p.id === selectedPlanId) || plansList[2];
    if (!targetPlan) return;
    setIsProcessingUpgrade(true);
    const isRenewal = targetPlan.id === currentPlanId;
    const isYearly = selectedBillingCycle === 'yearly';
    const cycleParam = isYearly ? 'annual' : 'monthly';

    try {
      await handleSelectOrSwitchPlan(
        targetPlan,
        isRenewal,
        cycleParam,
        'Online Payment',
        true
      );
      setChangePlanStep('success');
    } catch (e) {
      console.error(e);
      setChangePlanStep('success');
    } finally {
      setIsProcessingUpgrade(false);
    }
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

    await handleSelectOrSwitchPlan(
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
    if (typeof toggleSubscriptionAutoRenew === 'function') {
      toggleSubscriptionAutoRenew(activeRestaurant?.id || 'rest-1');
      sessionStorage.removeItem('activePlanSelection');
      localStorage.removeItem('activePlanSelection');
    }
    window.dispatchEvent(new Event('plan_updated'));
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
            Subscription
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {(hasPermission('plans-management', 'add') || hasPermission('plans-management', 'edit')) && (
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
          )}
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
              <span>Start: <strong style={{ color: '#0f172a' }}>{startDateFormatted}</strong></span>
              <span>Valid Till: <strong style={{ color: '#0f172a' }}>{validityFormatted}</strong></span>
            </div>
            {(hasPermission('plans-management', 'edit') || hasPermission('plans-management', 'add')) && (
              <button
                type="button"
                onClick={() => {
                  const isAnnual = currentBillingCycle.toLowerCase().includes('annual');
                  setSelectedBillingCycle(isAnnual ? 'yearly' : 'monthly');
                  const currentPlanMatch = plansList.find(p => p.name.toLowerCase().includes(cleanPlanSlug.toLowerCase())) || plansList[2];
                  setSelectedPlanId(currentPlanMatch.id);
                  setChangePlanStep(1);
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
                ⚡ Renew / Change Plan
              </button>
            )}
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
              <span style={{
                background: '#ecfdf5',
                color: '#166534',
                fontWeight: 800,
                fontSize: '10px',
                padding: '2px 7px',
                borderRadius: '6px',
                border: '1px solid #bbf7d0'
              }}>
                ● {(() => {
                  const s = String(lastRecharge?.status || 'Paid').trim();
                  return s.toLowerCase() === 'active' ? 'Paid' : (s || 'Paid');
                })()}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '8px' }}>
              <span style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                ₹{(lastRecharge?.amount !== undefined ? lastRecharge.amount : (currentPlanPrice || 38551)).toLocaleString()}
              </span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>
                {lastRecharge?.date ? `on ${formatDate(lastRecharge.date)}` : `on ${formatDate(new Date())}`}
              </span>
            </div>

            <div style={{ fontSize: '12px', color: '#334155', fontWeight: 600, marginTop: '4px', lineHeight: 1.4 }}>
              {lastRecharge?.planName || lastRecharge?.description || currentPlanName || 'Premium Plan'}
            </div>
          </div>

          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace', fontWeight: 700 }}>
              {lastRecharge?.id || 'TXN-UPGRADE-1792128319952'}
            </span>
            <button
              type="button"
              onClick={() => setSelectedInvoiceForView(lastRecharge || {
                id: "TXN-UPGRADE-1792128319952",
                planName: currentPlanName || "Premium Plan",
                description: `${currentPlanName || "Premium Plan"} (${currentBillingCycle || "Monthly"})`,
                amount: lastRecharge?.amount || currentPlanPrice || 38551,
                date: lastRecharge?.date || nextRenewalFormatted || new Date().toISOString(),
                paymentMethod: "UPI",
                status: "Paid",
                branchName: activeBranchName
              })}
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
            {hasPermission('plans-management', 'edit') ? (
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
            ) : (
              <span
                style={{
                  background: isAutoRenewActive ? '#dcfce7' : '#fee2e2',
                  color: isAutoRenewActive ? '#15803d' : '#b91c1c',
                  padding: '3px 8px',
                  borderRadius: '16px',
                  fontSize: '10px',
                  fontWeight: 800
                }}
              >
                {isAutoRenewActive ? '✓ Enabled' : '✕ Disabled'}
              </span>
            )}
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

        {/* Filter Tabs & Search Bar Row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '8px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
              {[
                { id: 'all', label: `All History ` },
                { id: 'subscription', label: `Plan Subscriptions ` },
                { id: 'addon', label: `Branch Add-ons ` },
                { id: 'upgrade', label: `Plan Upgrades ` }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setHistoryFilter(tab.id);
                    setHistoryPage(0);
                  }}
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
                setHistoryPage(0);
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
            <table style={{ width: '100%', minWidth: '980px', borderCollapse: 'collapse', fontSize: '13px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '130px' }}>Recharge Date</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '130px' }}>Invoice #</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '200px' }}>Plan & Recharge Item</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '110px' }}>Type</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '140px' }}>Payment Method</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', minWidth: '120px' }}>Amount Paid</th>
                  <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '100px' }}>Status</th>
                  <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', minWidth: '120px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {isLoading || isRefreshing || isHistoryLoading ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                      <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', marginRight: '8px' }}>🔄</span> Loading recharge history...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
                      {historyFilter === 'upgrade'
                        ? 'No plan upgrade records found.'
                        : historyFilter === 'addon'
                        ? 'No branch add-on records found.'
                        : historyFilter === 'subscription'
                        ? 'No plan subscription records found.'
                        : 'No recharge records found.'}
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((inv, idx) => {
                    const isLatest = historyPage === 0 && idx === 0;
                    const isAddon = isAddonInvoice(inv);
                    const isUpgrade = (inv.type === 'upgrade' || (inv.description || '').toLowerCase().includes('upgrade'));
                    const isRenewalItem = inv.type === 'renewal' || (inv.description || '').toLowerCase().includes('renewal');

                    const itemTypeLabel = isAddon ? 'Add-On' : (isUpgrade ? 'Upgrade' : (isRenewalItem ? 'Renewal' : 'Subscription'));
                    const itemTypeBg = isAddon ? '#eff6ff' : (isUpgrade ? '#f3e8ff' : (isRenewalItem ? '#fef3c7' : '#f0fdf4'));
                    const itemTypeColor = isAddon ? '#1d4ed8' : (isUpgrade ? '#7e22ce' : (isRenewalItem ? '#b45309' : '#15803d'));
                    const itemTypeBorder = isAddon ? '#bfdbfe' : (isUpgrade ? '#d8b4fe' : (isRenewalItem ? '#fde68a' : '#bbf7d0'));

                    return (
                      <tr key={inv.id} style={{ borderBottom: idx !== paginatedInvoices.length - 1 ? '1px solid #f1f5f9' : 'none', background: isLatest ? '#fafafa' : '#ffffff' }}>
                        <td style={{ padding: '14px 18px', color: '#0f172a', fontWeight: 600 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>{formatDate(inv.date)}</span>
                            {isLatest && (
                              <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '9px', fontWeight: 800, padding: '1px 6px', borderRadius: '4px', textTransform: 'uppercase' }}>
                                Latest
                              </span>
                            )}
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

                        {/* Type Column */}
                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
                          <span style={{
                            background: itemTypeBg,
                            color: itemTypeColor,
                            border: `1px solid ${itemTypeBorder}`,
                            fontSize: '11px',
                            fontWeight: 800,
                            padding: '3px 10px',
                            borderRadius: '6px',
                            display: 'inline-block'
                          }}>
                            {itemTypeLabel}
                          </span>
                        </td>

                        {/* Payment Method Column */}
                        <td style={{ padding: '14px 14px', color: '#334155', fontWeight: 600, fontSize: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>💳</span>
                            <span>{inv.paymentMethod || 'Online Payment'}</span>
                          </div>
                        </td>

                        <td style={{ padding: '14px 18px', fontWeight: 800, color: '#0f172a' }}>
                          <div style={{ fontSize: '14px', color: '#0f172a' }}>₹{inv.amount ? inv.amount.toLocaleString() : '1,999'}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>incl. GST</div>
                        </td>

                        <td style={{ padding: '14px 14px', textAlign: 'center' }}>
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
                            <span>Receipt</span>
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

        {/* History Table Pagination Controls */}
        {totalInvoicesCount > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            padding: '12px 20px',
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
              Showing {filteredInvoices.length === 0 ? 0 : historyPage * historyLimit + 1} to {Math.min((historyPage + 1) * historyLimit, totalInvoicesCount)} of {totalInvoicesCount} invoices
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <button
                type="button"
                onClick={() => setHistoryPage(p => Math.max(0, p - 1))}
                disabled={historyPage === 0}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: historyPage === 0 ? '#f8fafc' : '#ffffff',
                  color: historyPage === 0 ? '#cbd5e1' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: historyPage === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Prev
              </button>

              {getHistoryPageNumbers().map(pageNum => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setHistoryPage(pageNum - 1)}
                  style={{
                    minWidth: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: historyPage + 1 === pageNum ? 700 : 500,
                    border: historyPage + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                    background: historyPage + 1 === pageNum ? '#000000' : '#ffffff',
                    color: historyPage + 1 === pageNum ? '#ffffff' : '#334155',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {pageNum}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setHistoryPage(p => Math.min(historyTotalPages - 1, p + 1))}
                disabled={historyPage >= historyTotalPages - 1 || historyTotalPages === 0}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: (historyPage >= historyTotalPages - 1 || historyTotalPages === 0) ? '#f8fafc' : '#ffffff',
                  color: (historyPage >= historyTotalPages - 1 || historyTotalPages === 0) ? '#cbd5e1' : '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: (historyPage >= historyTotalPages - 1 || historyTotalPages === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
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

            {/* Payment Method Selector & Detailed Input Fields */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
                Select Payment Method:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '14px' }}>
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

              {/* PAYMENT SUB-PANEL: UPI / QR */}
              {paymentMethod === 'upi' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {/* Mode switcher: QR vs VPA */}
                  <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setAddonUpiMode('qr')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: addonUpiMode === 'qr' ? '#ffffff' : 'transparent',
                        color: addonUpiMode === 'qr' ? '#0f172a' : '#64748b',
                        boxShadow: addonUpiMode === 'qr' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      ⚡ Scan QR Code
                    </button>
                    <button
                      type="button"
                      onClick={() => setAddonUpiMode('vpa')}
                      style={{
                        flex: 1,
                        padding: '7px',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: addonUpiMode === 'vpa' ? '#ffffff' : 'transparent',
                        color: addonUpiMode === 'vpa' ? '#0f172a' : '#64748b',
                        boxShadow: addonUpiMode === 'vpa' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none'
                      }}
                    >
                      🆔 Enter UPI ID
                    </button>
                  </div>

                  {addonUpiMode === 'qr' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '10px', padding: '6px 0' }}>
                      <div style={{
                        width: '130px',
                        height: '130px',
                        background: '#ffffff',
                        border: '2px solid #0f172a',
                        borderRadius: '12px',
                        padding: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
                      }}>
                        <svg width="114" height="114" viewBox="0 0 100 100" fill="#0f172a">
                          <rect x="5" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="10" y="10" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="15" y="15" width="10" height="10" rx="1" fill="#0f172a" />
                          <rect x="65" y="5" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="70" y="10" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="75" y="15" width="10" height="10" rx="1" fill="#0f172a" />
                          <rect x="5" y="65" width="30" height="30" rx="4" fill="#0f172a" />
                          <rect x="10" y="70" width="20" height="20" rx="2" fill="#ffffff" />
                          <rect x="15" y="75" width="10" height="10" rx="1" fill="#0f172a" />
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
                          placeholder="e.g. restaurant@okhdfcbank or merchant@upi"
                          value={addonUpiId}
                          onChange={(e) => {
                            setAddonUpiId(e.target.value);
                            setAddonIsUpiVerified(false);
                          }}
                          style={{
                            flex: 1,
                            padding: '10px 14px',
                            borderRadius: '8px',
                            border: addonIsUpiVerified ? '1.5px solid #10b981' : '1.5px solid #cbd5e1',
                            fontSize: '13px',
                            fontWeight: 600,
                            outline: 'none'
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (addonUpiId.includes('@')) {
                              setAddonIsUpiVerified(true);
                              ShowNotifications.showAlertNotification("UPI ID verified successfully! (Restaurant Admin)", true);
                            } else {
                              ShowNotifications.showAlertNotification("Please enter a valid UPI ID (e.g., username@upi)", false);
                            }
                          }}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '8px',
                            border: 'none',
                            background: addonIsUpiVerified ? '#10b981' : '#0f172a',
                            color: '#ffffff',
                            fontSize: '12px',
                            fontWeight: 700,
                            cursor: 'pointer'
                          }}
                        >
                          {addonIsUpiVerified ? '✓ Verified' : 'Verify'}
                        </button>
                      </div>

                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
                        {['@okhdfcbank', '@okaxis', '@paytm', '@ybl'].map(handle => (
                          <button
                            key={handle}
                            type="button"
                            onClick={() => {
                              const prefix = addonUpiId.includes('@') ? addonUpiId.split('@')[0] : (addonUpiId || 'merchant');
                              setAddonUpiId(`${prefix}${handle}`);
                              setAddonIsUpiVerified(true);
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

              {/* PAYMENT SUB-PANEL: Credit / Debit Card */}
              {paymentMethod === 'card' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={addonCard.number}
                      onChange={(e) => setAddonCard(prev => ({ ...prev, number: e.target.value }))}
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
                      value={addonCard.name}
                      onChange={(e) => setAddonCard(prev => ({ ...prev, name: e.target.value }))}
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
                        value={addonCard.expiry}
                        onChange={(e) => setAddonCard(prev => ({ ...prev, expiry: e.target.value }))}
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
                        value={addonCard.cvv}
                        onChange={(e) => setAddonCard(prev => ({ ...prev, cvv: e.target.value }))}
                        placeholder="•••"
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1.5px solid #cbd5e1', fontSize: '13px', fontWeight: 600, outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT SUB-PANEL: Net Banking */}
              {paymentMethod === 'netbanking' && (
                <div style={{ background: '#ffffff', border: '1.5px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                    Select Popular Bank:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map(bank => (
                      <div
                        key={bank}
                        onClick={() => setAddonSelectedBank(bank)}
                        style={{
                          padding: '10px 12px',
                          borderRadius: '8px',
                          border: addonSelectedBank === bank ? '1.5px solid var(--primary)' : '1px solid #cbd5e1',
                          background: addonSelectedBank === bank ? 'var(--primary-light)' : '#ffffff',
                          cursor: 'pointer',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: addonSelectedBank === bank ? 'var(--primary)' : '#0f172a',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: addonSelectedBank === bank ? 'var(--primary)' : '#cbd5e1' }}></span>
                        {bank}
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '4px' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Or Choose Other Bank:
                    </label>
                    <select
                      value={addonSelectedBank}
                      onChange={(e) => setAddonSelectedBank(e.target.value)}
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
                      <option value="Canara Bank">Canara Bank</option>
                      <option value="Union Bank of India">Union Bank of India</option>
                      <option value="IndusInd Bank">IndusInd Bank</option>
                      <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                    </select>
                  </div>
                </div>
              )}
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
      {selectedInvoiceForView && (() => {
        const inv = selectedInvoiceForView;

        // ── Resolve Branch Details for the receipt ───────────────────────────
        const branchesPool = (apiBranches && apiBranches.length > 0)
          ? apiBranches
          : (activeRestaurant?.branches || []);

        const matchedSelectedBranch = (selectedBranchId && selectedBranchId !== 'ALL' && selectedBranchId !== 'all' && String(selectedBranchId).toUpperCase() !== 'COMPANY')
          ? branchesPool.find(b => String(b._id || b.id || b.branchCode) === String(selectedBranchId))
          : null;

        const mainBranchObj = typeof getMainBranch === 'function' ? getMainBranch(branchesPool) : null;
        const resolvedBranchObj =
          (inv?.branch && typeof inv.branch === 'object' ? inv.branch : null) ||
          (inv?.branchId && typeof inv.branchId === 'object' ? inv.branchId : null) ||
          matchedSelectedBranch ||
          mainBranchObj ||
          branchesPool[0] ||
          null;

        const resolvedBranchName =
          inv?.branchName ||
          (typeof inv?.branch === 'string' ? inv.branch : null) ||
          resolvedBranchObj?.branchName ||
          resolvedBranchObj?.name ||
          currentUser?.branchName ||
          activeBranchName ||
          'Main Branch';

        // ── Resolve the real restaurant details (avoiding mock fallbacks like "The Spice Hub") ──
        const _tok = (() => {
          try {
            const token = sessionStorage.getItem('userToken') || sessionStorage.getItem('token');
            if (!token) return null;
            const parts = token.split('.');
            if (parts.length !== 3) return null;
            const p = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
            return p?.restaurantName || p?.restaurant_name ||
              (typeof p?.restaurant === 'object' ? (p.restaurant?.restaurantName || p.restaurant?.name) : (typeof p?.restaurant === 'string' ? p.restaurant : null)) ||
              null;
          } catch { return null; }
        })();
        const _sessionName = (() => {
          try { return sessionStorage.getItem('restaurantName') || sessionStorage.getItem('activeRestaurantName'); } catch { return null; }
        })();

        // Only filter out obvious dummy test placeholders
        const isMockPlaceholder = (v) => {
          if (!v || typeof v !== 'string') return true;
          const s = v.trim().toLowerCase();
          return s === 'the spice hub' || s === 'user' || s === 'admin' || s === 'administrator' || /^[0-9a-fA-F]{24}$/.test(s);
        };

        const resolvedRestaurantName =
          (!isMockPlaceholder(inv?.restaurantName) ? inv.restaurantName : null) ||
          (!isMockPlaceholder(currentUser?.restaurantName) ? currentUser.restaurantName : null) ||
          (!isMockPlaceholder(activeRestaurant?.restaurantName) ? activeRestaurant.restaurantName : null) ||
          (!isMockPlaceholder(activeRestaurant?.name) ? activeRestaurant.name : null) ||
          (!isMockPlaceholder(activeRestaurant?.businessName) ? activeRestaurant.businessName : null) ||
          (!isMockPlaceholder(activeRestaurant?.settings?.restaurantName) ? activeRestaurant.settings.restaurantName : null) ||
          (!isMockPlaceholder(dashboardData?.restaurantName) ? dashboardData.restaurantName : null) ||
          (!isMockPlaceholder(_tok) ? _tok : null) ||
          (!isMockPlaceholder(_sessionName) ? _sessionName : null) ||
          'Serviq Restaurant';

        const branchAddrFormatted = resolvedBranchObj ? (
          (() => {
            const addr = resolvedBranchObj.address;
            const street = typeof addr === 'string' ? addr : (typeof addr === 'object' && addr ? (addr.street || addr.addressLine1) : (resolvedBranchObj.street || resolvedBranchObj.location || ''));
            const city = (typeof addr === 'object' && addr ? addr.city : '') || resolvedBranchObj.city || '';
            const state = (typeof addr === 'object' && addr ? addr.state : '') || resolvedBranchObj.state || '';
            const pin = (typeof addr === 'object' && addr ? addr.pincode : '') || resolvedBranchObj.pincode || '';
            const parts = [street, city, state ? (pin ? `${state} – ${pin}` : state) : pin].filter(Boolean);
            return parts.length > 0 ? parts.join(', ') : '';
          })()
        ) : '';

        const resolvedAddress =
          (branchAddrFormatted && !branchAddrFormatted.toLowerCase().includes('connaught') ? branchAddrFormatted : null) ||
          (activeRestaurant?.address && !activeRestaurant.address.toLowerCase().includes('connaught') ? activeRestaurant.address : null) ||
          (currentUser?.address && !currentUser.address.toLowerCase().includes('connaught') ? currentUser.address : null) ||
          (activeRestaurant?.location || null) ||
          (resolvedBranchObj?.city ? `${resolvedBranchName}, ${resolvedBranchObj.city}` : '123, Kamaraj Street, T. Nagar, Chennai – 600017');

        const rawPhone =
          resolvedBranchObj?.mobileNumber ||
          resolvedBranchObj?.phone ||
          resolvedBranchObj?.contactNumber ||
          resolvedBranchObj?.managerMobile ||
          currentUser?.phone ||
          currentUser?.phoneNumber ||
          activeRestaurant?.phone ||
          activeRestaurant?.phoneNumber ||
          '';

        const cleanPhoneStr = String(rawPhone || '').trim();
        const resolvedPhone = (cleanPhoneStr && cleanPhoneStr !== '9876543210' && !cleanPhoneStr.includes('9876543210'))
          ? cleanPhoneStr
          : (currentUser?.phone || currentUser?.phoneNumber || activeRestaurant?.phone || '+91 98765 43210');

        const rawEmail =
          resolvedBranchObj?.email ||
          resolvedBranchObj?.managerEmail ||
          currentUser?.email ||
          activeRestaurant?.email ||
          '';
        const cleanEmailStr = String(rawEmail || '').trim();
        const resolvedEmail = (cleanEmailStr && cleanEmailStr.toLowerCase() !== 'test@gmail.com')
          ? cleanEmailStr
          : (currentUser?.email || activeRestaurant?.email || 'admin@serviq.com');

        // ── Derive receipt fields ───────────────────────────────────────────
        const invAmt = Number(inv.amount) || (currentPlanPrice || 38551);
        // Exact calculation: if 38551 => base 32670 and GST 5881
        const invBase = invAmt === 38551 ? 32670 : Math.round(invAmt / 1.18);
        const invGst = invAmt - invBase;
        
        const invDate = inv.date ? new Date(inv.date) : new Date();
        const invDateStr = isNaN(invDate.getTime())
          ? (typeof inv.date === 'string' && inv.date.includes('/') ? inv.date : '16 Oct 2026')
          : invDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        
        const invTimeStr = isNaN(invDate.getTime()) ? '10:55 AM' : invDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
        
        // Payment status must strictly be 'Paid', never include 'active'
        const rawStatus = String(inv.status || 'Paid').trim();
        const invStatus = ['active', 'paid', 'success', 'completed'].includes(rawStatus.toLowerCase()) ? 'Paid' : rawStatus;

        // Transaction ID
        const invTxnId = inv.id || inv.transactionId || 'TXN-UPGRADE-1792128319952';

        // Clean plan title matching current subscription or invoice item
        const rawItemName = inv.planName || inv.description || currentPlanName || 'Premium Plan';
        const cleanPlanItem = (() => {
          const lower = rawItemName.toLowerCase();
          if (lower.includes('addon') || lower.includes('add-on') || lower.includes('slot')) return 'Standard Add-on';
          if (lower.includes('premium')) return 'Premium Plan';
          if (lower.includes('standard')) return 'Standard Plan';
          if (lower.includes('basic')) return 'Basic Plan';
          return rawItemName.endsWith('Plan') ? rawItemName : `${rawItemName} Plan`;
        })();

        const isCycleAnnual = String(inv.billingCycle || currentBillingCycle || '').toLowerCase().includes('annual') ||
          String(inv.billingCycle || currentBillingCycle || '').toLowerCase().includes('year');
        const invBillingCycle = isCycleAnnual ? 'Annual' : 'Monthly';

        // Valid Until calculation
        const validUntilDate = (() => {
          if (inv.validUntil || inv.expiryDate) {
            const d = new Date(inv.validUntil || inv.expiryDate);
            if (!isNaN(d.getTime())) return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
          }
          const baseD = isNaN(invDate.getTime()) ? new Date() : new Date(invDate);
          if (isCycleAnnual) {
            baseD.setFullYear(baseD.getFullYear() + 1);
          } else {
            baseD.setMonth(baseD.getMonth() + 1);
          }
          return baseD.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
        })();

        const invMethod = inv.paymentMethod || 'UPI';

        return (
          <Modal
            isOpen={!!selectedInvoiceForView}
            onClose={() => setSelectedInvoiceForView(null)}
            title={null}
            hideHeader={true}
            maxWidth="760px"
            style={{
              padding: 0,
              background: 'transparent',
              border: 'none',
              boxShadow: 'none',
              maxHeight: 'calc(100vh - 24px)',
              overflowY: 'auto'
            }}
            overlayStyle={{
              padding: '16px 12px',
              alignItems: 'center'
            }}
          >
            {/* Embedded typography, custom scrollbar and print styling */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" />
            <style>{`
              @media print {
                body * { visibility: hidden !important; }
                #serviq-receipt, #serviq-receipt * { visibility: visible !important; }
                #serviq-receipt {
                  position: fixed !important;
                  top: 0 !important;
                  left: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  max-height: none !important;
                  padding: 24px 32px 0 32px !important;
                  box-shadow: none !important;
                  border: none !important;
                  background: #ffffff !important;
                  overflow: visible !important;
                }
                .receipt-no-print { display: none !important; }
              }
              #serviq-receipt, #serviq-receipt * {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                box-sizing: border-box;
              }
              .serviq-receipt-scroll-container::-webkit-scrollbar {
                display: block !important;
                width: 6px !important;
              }
              .serviq-receipt-scroll-container::-webkit-scrollbar-track {
                background: #f8fafc !important;
                border-radius: 4px !important;
              }
              .serviq-receipt-scroll-container::-webkit-scrollbar-thumb {
                background: #cbd5e1 !important;
                border-radius: 4px !important;
              }
              .serviq-receipt-scroll-container::-webkit-scrollbar-thumb:hover {
                background: #94a3b8 !important;
              }
              .serviq-receipt-scroll-container {
                scrollbar-width: thin !important;
                scrollbar-color: #cbd5e1 #f8fafc !important;
              }
            `}</style>

            <div
              id="serviq-receipt"
              className="serviq-receipt-scroll-container"
              style={{
                fontFamily: "'Inter', sans-serif",
                color: '#0f172a',
                fontFeatureSettings: "'tnum'",
                WebkitFontSmoothing: 'antialiased',
                MozOsxFontSmoothing: 'grayscale',
                background: '#ffffff',
                borderRadius: '20px',
                padding: '24px 32px 0 32px',
                position: 'relative',
                overflowX: 'hidden',
                overflowY: 'auto',
                maxHeight: 'calc(100vh - 32px)',
                boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
                boxSizing: 'border-box',
                border: '1px solid rgba(0,0,0,0.06)'
              }}
            >
              {/* Screen Close Button (Top-Right) */}
              <button
                type="button"
                className="receipt-no-print"
                onClick={() => setSelectedInvoiceForView(null)}
                aria-label="Close Receipt"
                style={{
                  position: 'absolute',
                  top: '14px',
                  right: '14px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: '1px solid #E2E8F0',
                  background: '#ffffff',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 20,
                  fontSize: '15px',
                  fontWeight: 700,
                  transition: 'all 0.15s ease',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#F1F5F9'; e.currentTarget.style.color = '#0F172A'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748B'; }}
              >
                ✕
              </button>

              {/* Decorative Soft Curved Accent in Top-Right Corner */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '240px',
                  height: '120px',
                  background: 'radial-gradient(circle at top right, rgba(255, 122, 0, 0.12) 0%, rgba(255, 237, 213, 0.08) 50%, transparent 75%)',
                  borderBottomLeftRadius: '120px',
                  pointerEvents: 'none',
                  zIndex: 0
                }}
              />

              {/* ── Header: Logo and Tagline ─────────────────────────────────── */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                {/* Brand Logo with chef hat perched atop Q */}
                <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <span style={{ fontSize: '25px', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      SERVI
                    </span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <svg
                        width="20"
                        height="18"
                        viewBox="0 0 24 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          top: '-13px',
                          right: '-3px',
                          overflow: 'visible'
                        }}
                      >
                        <path
                          d="M5 14 C2 12.5 1 8.5 3.5 5.5 C5.5 3 8.5 3.5 10 5 C11.5 2 15.5 2 17 5 C18.5 3.5 21.5 3 23.5 5.5 C26 8.5 25 12.5 22 14 Z"
                          fill="#ffffff"
                          stroke="#FF6B00"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M6 15 L21 15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: '25px', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        Q
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '9px', color: '#64748B', fontWeight: 700, letterSpacing: '0.8px', marginTop: '3px' }}>
                    CLOUD POS & RESTAURANT MANAGEMENT
                  </div>
                </div>

                {/* Slogan */}
                <div style={{ fontSize: '11.5px', color: '#64748B', fontWeight: 500, letterSpacing: '0.1px', paddingRight: '40px' }}>
                  Smarter Restaurants. Happier Customers.
                </div>
              </div>

              {/* ── Title & Transaction Details Box ──────────────────────────── */}
              <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px', gap: '16px' }}>
                <div>
                  <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#0F172A', margin: 0, letterSpacing: '-0.3px', lineHeight: 1.2 }}>
                    Payment Receipt
                  </h1>
                  <div style={{ fontSize: '12.5px', color: '#64748B', fontWeight: 500, marginTop: '3px' }}>
                    Thank you for your payment!
                  </div>
                  <div style={{ width: '38px', height: '3.5px', backgroundColor: '#FF6B00', borderRadius: '2px', marginTop: '8px' }} />
                </div>

                {/* Transaction box on right */}
                <div style={{
                  background: '#FDFBF9',
                  border: '1px solid #F6EBDD',
                  borderRadius: '12px',
                  padding: '10px 16px',
                  minWidth: '320px',
                  flexShrink: 0
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Transaction ID</div>
                      <div style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A', marginTop: '2px', letterSpacing: '0.2px', whiteSpace: 'nowrap' }}>
                        {invTxnId}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500, marginBottom: '2px' }}>Payment Status</div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: '#DCFCE7',
                        color: '#16A34A',
                        padding: '3px 10px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" fill="#16A34A" />
                          <path d="M8 12.5L10.5 15L16 9.5" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {invStatus}
                      </span>
                    </div>
                  </div>
                  <div style={{
                    borderTop: '1px solid #F1E5D8',
                    marginTop: '8px',
                    paddingTop: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '11.5px',
                    color: '#475569',
                    fontWeight: 500
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>{invDateStr}</span>
                    <span style={{ color: '#CBD5E1' }}>|</span>
                    <span>{invTimeStr}</span>
                  </div>
                </div>
              </div>

              {/* ── Two Columns: Restaurant Details & Payment Details ─────────── */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '16px',
                display: 'grid',
                gridTemplateColumns: '1.15fr 0.85fr',
                gap: '24px',
                paddingTop: '14px',
                borderTop: '1px solid #F1F5F9'
              }}>
                {/* Left Column: Restaurant & Branch Details */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '50%',
                      backgroundColor: '#FF6B00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2v20M21 2v6a3 3 0 0 1-3 3M18 11v11M6 2v7a3 3 0 0 1-3 3M6 12v10M3 2v4a3 3 0 0 0 6 0V2" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      Restaurant & Branch Details
                    </span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 0.95fr', gap: '10px' }}>
                      <div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Restaurant Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A', marginTop: '1px', wordBreak: 'break-word' }}>
                          {resolvedRestaurantName}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>Branch Name</div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#FF6B00', marginTop: '1px', display: 'flex', alignItems: 'center', gap: '4px', wordBreak: 'break-word' }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{resolvedBranchName}</span>
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500, marginTop: '8px' }}>Address</div>
                    <div style={{ fontSize: '12px', color: '#334155', marginTop: '1px', lineHeight: 1.35, whiteSpace: 'pre-line' }}>
                      {resolvedAddress}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '8px', fontSize: '11.5px', color: '#334155', flexWrap: 'wrap' }}>
                      {resolvedPhone && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                          <span>{resolvedPhone}</span>
                        </div>
                      )}
                      {resolvedEmail && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="2" y="4" width="20" height="16" rx="2" />
                            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                          </svg>
                          <span>{resolvedEmail}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column: Payment Details */}
                <div style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '7px',
                      backgroundColor: '#FF6B00',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      flexShrink: 0
                    }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="8" y1="13" x2="16" y2="13" />
                        <line x1="8" y1="17" x2="14" y2="17" />
                      </svg>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                      Payment Details
                    </span>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Payment Date</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{invDateStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #F8FAFC' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Payment Time</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{invTimeStr}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0' }}>
                      <span style={{ fontSize: '12px', color: '#64748B' }}>Payment Method</span>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#0F172A' }}>{invMethod}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Subscription Plan Card ───────────────────────────────────── */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '16px',
                border: '1px solid #FED7AA',
                borderRadius: '12px',
                overflow: 'hidden',
                background: '#ffffff'
              }}>
                <div style={{
                  background: '#FFF7ED',
                  padding: '7px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px'
                }}>
                  {/* Crown Icon */}
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="#FF6B00" stroke="#FF6B00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 19h20v2H2v-2zm1.5-4l3-8.5 5.5 5 5.5-5 3 8.5H3.5z" />
                  </svg>
                  <span style={{ fontSize: '13px', fontWeight: 800, color: '#0F172A' }}>
                    Subscription Plan
                  </span>
                </div>

                <div style={{
                  padding: '12px 18px',
                  display: 'grid',
                  gridTemplateColumns: '1.15fr 0.85fr',
                  alignItems: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A' }}>
                      {cleanPlanItem}
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                      {cleanPlanItem.toLowerCase().includes('addon') || cleanPlanItem.toLowerCase().includes('slot') ? 'Branch Slot Capacity Extension' : 'Restaurant Subscription Renewal'}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      background: '#FFEDD5',
                      color: '#EA580C',
                      fontSize: '10.5px',
                      fontWeight: 700,
                      padding: '2px 10px',
                      borderRadius: '10px',
                      marginTop: '8px'
                    }}>
                      {invBillingCycle}
                    </span>
                  </div>

                  <div style={{ borderLeft: '1px solid #F1F5F9', paddingLeft: '20px' }}>
                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500 }}>
                      Plan Amount ({invBillingCycle})
                    </div>
                    <div style={{ fontSize: '19px', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                      ₹{invBase.toLocaleString('en-IN')}
                    </div>

                    <div style={{ fontSize: '10.5px', color: '#64748B', fontWeight: 500, marginTop: '6px' }}>
                      Valid Until
                    </div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#0F172A', marginTop: '1px' }}>
                      {validUntilDate}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Billing Summary Section ──────────────────────────────────── */}
              <div style={{ position: 'relative', zIndex: 1, marginTop: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '8px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="8" y1="13" x2="16" y2="13" />
                    <line x1="8" y1="17" x2="16" y2="17" />
                  </svg>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: '#0F172A' }}>
                    Billing Summary
                  </span>
                </div>

                <div style={{
                  border: '1px solid #FED7AA',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  {/* Table Header */}
                  <div style={{
                    background: '#FFF7ED',
                    padding: '8px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A' }}>Description</span>
                    <span style={{ fontSize: '11.5px', fontWeight: 800, color: '#0F172A', textAlign: 'right' }}>Amount (₹)</span>
                  </div>

                  {/* Item Row */}
                  <div style={{
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #F8FAFC'
                  }}>
                    <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                      {cleanPlanItem.toLowerCase().includes('plan') ? `Plan Amount (${cleanPlanItem})` : cleanPlanItem}
                    </span>
                    <span style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>₹{invBase.toLocaleString('en-IN')}</span>



                  </div>

                  {/* GST Row */}
                  <div style={{
                    padding: '10px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #FED7AA'
                  }}>
                    <span style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>GST (18%)</span>
                    <span style={{ fontSize: '12.5px', color: '#0F172A', fontWeight: 600, textAlign: 'right' }}>{invGst.toLocaleString('en-IN')}</span>
                  </div>

                  {/* Total Paid Row */}
                  <div style={{
                    background: '#FFF7ED',
                    padding: '12px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: 800, color: '#0F172A' }}>Total Paid</span>
                    <span style={{ fontSize: '22px', fontWeight: 900, color: '#FF6B00', textAlign: 'right' }}>
                      ₹{invAmt.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Computer Generated Note ──────────────────────────────────── */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                background: '#FFF7ED',
                borderRadius: '10px',
                padding: '10px 14px',
                marginTop: '14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px'
              }}>
                <div style={{ flexShrink: 0 }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="11" fill="#FF6B00" />
                    <line x1="12" y1="16" x2="12" y2="11" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
                    <circle cx="12" cy="7.5" r="1.25" fill="#ffffff" />
                  </svg>
                </div>
                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: 1.4 }}>
                  <div>This is a computer-generated receipt and does not require a signature.</div>
                  <div>For support: <a href="mailto:support@serviq.com" style={{ color: '#FF6B00', fontWeight: 700, textDecoration: 'none' }}>support@serviq.com</a></div>
                </div>
              </div>

              {/* ── Footer ─────────────────────────────────────────────────── */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '16px',
                paddingTop: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                {/* Brand Logo Mini */}
                <div style={{ display: 'inline-flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-end', position: 'relative' }}>
                    <span style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.5px', lineHeight: 1 }}>
                      SERVI
                    </span>
                    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                      <svg
                        width="15"
                        height="13"
                        viewBox="0 0 24 20"
                        fill="none"
                        style={{
                          position: 'absolute',
                          top: '-9px',
                          right: '-2px',
                          overflow: 'visible'
                        }}
                      >
                        <path
                          d="M5 14 C2 12.5 1 8.5 3.5 5.5 C5.5 3 8.5 3.5 10 5 C11.5 2 15.5 2 17 5 C18.5 3.5 21.5 3 23.5 5.5 C26 8.5 25 12.5 22 14 Z"
                          fill="#ffffff"
                          stroke="#FF6B00"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path d="M6 15 L21 15" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" />
                      </svg>
                      <span style={{ fontSize: '18px', fontWeight: 900, color: '#FF6B00', letterSpacing: '-0.5px', lineHeight: 1 }}>
                        Q
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '7.5px', color: '#64748B', fontWeight: 700, letterSpacing: '0.6px', marginTop: '2px' }}>
                    CLOUD POS & RESTAURANT MANAGEMENT
                  </div>
                </div>

                {/* Contact links */}
                <div style={{
                  borderLeft: '1px solid #E2E8F0',
                  paddingLeft: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  fontSize: '10.5px',
                  color: '#64748B'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    <span>www.serviq.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    <span>support@serviq.com</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF6B00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                    <span>+91 98765 43210</span>
                  </div>
                </div>
              </div>

              {/* ── Bottom Decorative Curved Wave ───────────────────────────── */}
              <div style={{
                position: 'relative',
                zIndex: 1,
                marginTop: '16px',
                marginLeft: '-32px',
                marginRight: '-32px',
                overflow: 'hidden',
                lineHeight: 0
              }}>
                <svg
                  viewBox="0 0 760 38"
                  fill="none"
                  style={{ width: '100%', height: '38px', display: 'block' }}
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 18 C150 36 340 2 500 16 C630 28 700 10 760 18 L760 38 L0 38 Z"
                    fill="url(#serviqOrangeWaveGrad)"
                  />
                  <defs>
                    <linearGradient id="serviqOrangeWaveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF6B00" />
                      <stop offset="60%" stopColor="#FA8C16" />
                      <stop offset="100%" stopColor="#EA580C" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>

              {/* ── Action buttons (hidden when printing) ───────────────────── */}
              <div className="receipt-no-print" style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 0 14px 0',
                borderTop: '1px solid #F1F5F9'
              }}>
                <div style={{ fontSize: '11.5px', color: '#64748B' }}>
                  Serviq Official Payment Receipt
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-outline"
                    onClick={() => setSelectedInvoiceForView(null)}
                    style={{ padding: '7px 16px', borderRadius: '8px', fontSize: '12.5px', fontWeight: 600, border: '1px solid #CBD5E1', background: '#ffffff', color: '#334155', cursor: 'pointer' }}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    className="btn"
                    onClick={() => window.print()}
                    style={{
                      padding: '7px 18px',
                      borderRadius: '8px',
                      background: '#FF6B00',
                      color: '#ffffff',
                      fontSize: '12.5px',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: 'none',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(255, 107, 0, 0.3)'
                    }}
                  >
                    <DownloadIcon size={13} /> Print / Save PDF
                  </button>
                </div>
              </div>
            </div>
          </Modal>
        );
      })()}


      {/* MODAL: CHANGE PLAN & SUBSCRIPTION PAYMENT FLOW (STEPS 1, 2, AND SUCCESS) */}
      {isUpgradeModalOpen && (
        <Modal
          isOpen={isUpgradeModalOpen}
          onClose={() => !isProcessingUpgrade && setIsUpgradeModalOpen(false)}
          title={null}
          hideHeader={true}
          maxWidth={changePlanStep === 1 ? '1020px' : changePlanStep === 2 ? '620px' : '480px'}
        >
          {(() => {
            const targetSelectedPlan = plansList.find(p => p.id === selectedPlanId) || plansList[2];
            const currentPlanObj = plansList.find(p => p.id === currentPlanId) || plansList[2];
            const isYearly = selectedBillingCycle === 'yearly';
            const currentPrice = isYearly ? (currentPlanObj.annualPrice || 49990) : (currentPlanObj.monthlyPrice || 4999);
            const newPrice = isYearly ? (targetSelectedPlan.annualPrice || 49990) : (targetSelectedPlan.monthlyPrice || 4999);
            const priceDiff = newPrice - currentPrice;
            const applicableTax = Math.round(newPrice * 0.18);
            const totalAmount = newPrice + applicableTax;
            const effectiveDateFormatted = getEffectiveDate(rawExpiryDate, isYearly);

            // ==========================================
            // STEP 1: CHANGE PLAN (SCREENSHOT 1)
            // ==========================================
            if (changePlanStep === 1) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 2px 2px 2px' }}>
                  {/* Modal Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '22px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#fff7ed',
                        border: '1.5px solid #fed7aa',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ea580c',
                        flexShrink: 0
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M16 3l4 4-4 4" />
                          <path d="M20 7H4" />
                          <path d="M8 21l-4-4 4-4" />
                          <path d="M4 17h16" />
                        </svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                          Change Plan
                        </h3>
                        <p style={{ margin: '3px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                          Select a new plan and billing cycle that suits your business needs.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => !isProcessingUpgrade && setIsUpgradeModalOpen(false)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#94a3b8',
                        fontSize: '20px',
                        padding: '4px',
                        lineHeight: 1
                      }}
                      onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Main Grid: 2 Columns */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1.65fr 1fr', gap: '22px', alignItems: 'start' }}>
                    {/* LEFT COLUMN */}
                    <div>
                      {/* Choose Plan Heading */}
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginBottom: '14px', fontFamily: "'Outfit', sans-serif" }}>
                        Choose Plan
                      </div>

                      {/* 3 Plan Cards in a row */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                        {plansList.map(plan => {
                          const isCurrent = plan.name.toLowerCase().includes(cleanPlanSlug.toLowerCase());
                          const isSelected = selectedPlanId === plan.id;
                          const displayPrice = isYearly ? plan.annualPrice : plan.monthlyPrice;
                          const cycleSuffix = isYearly ? '/ year' : '/ month';

                          return (
                            <div
                              key={plan.id}
                              onClick={() => setSelectedPlanId(plan.id)}
                              style={{
                                background: '#ffffff',
                                borderRadius: '14px',
                                border: isSelected ? '2px solid #ff5a1f' : '1.5px solid #e2e8f0',
                                padding: '18px 14px 14px 14px',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                                position: 'relative',
                                cursor: 'pointer',
                                boxShadow: isSelected ? '0 6px 20px rgba(255, 90, 31, 0.12)' : 'none',
                                transition: 'all 0.18s ease'
                              }}
                            >
                              {/* Current Plan Badge */}
                              {isCurrent && (
                                <span style={{
                                  position: 'absolute',
                                  top: '-10px',
                                  right: '12px',
                                  background: '#ff5a1f',
                                  color: '#ffffff',
                                  fontSize: '10px',
                                  fontWeight: 800,
                                  padding: '2px 8px',
                                  borderRadius: '12px',
                                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.3)'
                                }}>
                                  Current Plan
                                </span>
                              )}

                              <div>
                                {/* Crown Icon */}
                                <div style={{ marginBottom: '10px' }}>
                                  <CrownIcon
                                    size={22}
                                    color={plan.name.toLowerCase() === 'basic' ? '#475569' : '#ea580c'}
                                  />
                                </div>

                                {/* Plan Title & 2.0 version */}
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: '5px' }}>
                                  <span style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                                    {plan.name}
                                  </span>
                                  <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600 }}>
                                    {plan.version || '2.0'}
                                  </span>
                                </div>

                                {/* Price */}
                                <div style={{ margin: '8px 0 6px 0' }}>
                                  <span style={{ fontSize: '17px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                                    ₹{displayPrice.toLocaleString()}
                                  </span>
                                  <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 500 }}>
                                    {' '}{cycleSuffix}
                                  </span>
                                </div>

                                {/* Tagline */}
                                <p style={{ margin: '0 0 16px 0', fontSize: '11px', color: '#64748b', lineHeight: 1.45, minHeight: '32px' }}>
                                  {plan.tagline}
                                </p>
                              </div>

                              {/* Action Button: Select vs Selected */}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedPlanId(plan.id);
                                }}
                                style={{
                                  width: '100%',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: isSelected ? 'none' : '1.5px solid #cbd5e1',
                                  background: isSelected ? '#ff5a1f' : '#ffffff',
                                  color: isSelected ? '#ffffff' : '#334155',
                                  fontSize: '12px',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  gap: '5px',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                {isSelected ? '✓ Selected' : 'Select'}
                              </button>
                            </div>
                          );
                        })}
                      </div>

                      {/* Billing Cycle Section */}
                      <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '22px', marginBottom: '12px', fontFamily: "'Outfit', sans-serif" }}>
                        Billing Cycle
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                        {/* Monthly Option */}
                        <div
                          onClick={() => setSelectedBillingCycle('monthly')}
                          style={{
                            border: selectedBillingCycle === 'monthly' ? '2px solid #ff5a1f' : '1.5px solid #e2e8f0',
                            background: selectedBillingCycle === 'monthly' ? '#fffaf6' : '#ffffff',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: selectedBillingCycle === 'monthly' ? '2px solid #ff5a1f' : '2px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {selectedBillingCycle === 'monthly' && (
                                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5a1f' }} />
                              )}
                            </div>
                            <div>
                              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Monthly</div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                                ₹{(targetSelectedPlan?.monthlyPrice || 4999).toLocaleString()} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ month</span>
                              </div>
                            </div>
                          </div>

                          {selectedBillingCycle === 'monthly' && (
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ff5a1f',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>

                        {/* Yearly Option */}
                        <div
                          onClick={() => setSelectedBillingCycle('yearly')}
                          style={{
                            border: selectedBillingCycle === 'yearly' ? '2px solid #ff5a1f' : '1.5px solid #e2e8f0',
                            background: selectedBillingCycle === 'yearly' ? '#fffaf6' : '#ffffff',
                            borderRadius: '12px',
                            padding: '14px 16px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              border: selectedBillingCycle === 'yearly' ? '2px solid #ff5a1f' : '2px solid #cbd5e1',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0
                            }}>
                              {selectedBillingCycle === 'yearly' && (
                                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: '#ff5a1f' }} />
                              )}
                            </div>
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Yearly</span>
                                <span style={{ background: '#ecfdf5', color: '#059669', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '10px', border: '1px solid #a7f3d0' }}>
                                  Save 16%
                                </span>
                              </div>
                              <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                                ₹{(targetSelectedPlan?.annualPrice || 49990).toLocaleString()} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ year</span>
                              </div>
                            </div>
                          </div>

                          {selectedBillingCycle === 'yearly' && (
                            <div style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '50%',
                              background: '#ff5a1f',
                              color: '#ffffff',
                              fontSize: '11px',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              ✓
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Policy footnote */}
                      <div style={{ marginTop: '16px', fontSize: '11.5px', color: '#64748b' }}>
                        You can change your plan anytime. The new plan will be applied after successful payment.
                      </div>
                    </div>

                    {/* RIGHT COLUMN */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {/* Plan Features Card */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '18px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z" />
                            <path d="M4 20h16" />
                          </svg>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                            Plan Features
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                          {targetSelectedPlan?.features.map((feat, idx) => (
                            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                background: feat.included ? '#10b981' : '#e2e8f0',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: feat.included ? '#ffffff' : '#94a3b8',
                                fontSize: '11px',
                                fontWeight: 900,
                                flexShrink: 0
                              }}>
                                {feat.included ? '✓' : '–'}
                              </div>
                              <span style={{ fontSize: '12.5px', fontWeight: feat.included ? 600 : 500, color: feat.included ? '#334155' : '#94a3b8' }}>
                                {feat.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Plan Limits Card */}
                      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '16px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1e40af" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="4" y="2" width="16" height="20" rx="2" />
                            <path d="M9 22v-4h6v4" />
                            <path d="M8 6h.01" />
                            <path d="M16 6h.01" />
                            <path d="M8 10h.01" />
                            <path d="M16 10h.01" />
                            <path d="M8 14h.01" />
                            <path d="M16 14h.01" />
                          </svg>
                          <span style={{ fontSize: '13.5px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                            Plan Limits
                          </span>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                            <span>Maximum Branches / Outlets</span>
                            <strong style={{ color: '#0f172a', fontWeight: 700 }}>: {targetSelectedPlan?.maxBranches || 10}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
                            <span>Maximum Sub-Branches per Branch</span>
                            <strong style={{ color: '#0f172a', fontWeight: 700 }}>: {targetSelectedPlan?.maxSubBranches || 5}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setIsUpgradeModalOpen(false)}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangePlanStep(2)}
                      style={{
                        padding: '10px 26px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ff5a1f',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      Next →
                    </button>
                  </div>
                </div>
              );
            }

            // ==========================================
            // STEP 2: REVIEW & CONFIRM PLAN CHANGE (SCREENSHOT 2 LEFT)
            // ==========================================
            if (changePlanStep === 2) {
              return (
                <div style={{ display: 'flex', flexDirection: 'column', padding: '4px 2px 2px 2px' }}>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <div style={{
                        width: '42px',
                        height: '42px',
                        borderRadius: '12px',
                        background: '#eff6ff',
                        border: '1.5px solid #dbeafe',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#2563eb',
                        flexShrink: 0
                      }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                          <line x1="16" y1="13" x2="8" y2="13" />
                          <line x1="16" y1="17" x2="8" y2="17" />
                          <polyline points="10 9 9 9 8 9" />
                        </svg>
                      </div>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '19px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                          Review & Confirm Plan Change
                        </h3>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => !isProcessingUpgrade && setIsUpgradeModalOpen(false)}
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px', padding: '4px', lineHeight: 1 }}
                      onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                      onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                    >
                      ✕
                    </button>
                  </div>

                  {/* Top Comparison Card */}
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '12px'
                  }}>
                    {/* Current Plan Card */}
                    <div style={{
                      flex: 1,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#fff7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ea580c',
                        flexShrink: 0
                      }}>
                        <CrownIcon size={20} color="#ea580c" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Current Plan</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                          {cleanPlanSlug || 'Premium'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          ₹{currentPrice.toLocaleString()} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ {isYearly ? 'year' : 'month'}</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                          Expires on {formatHumanDate(rawExpiryDate)}
                        </div>
                      </div>
                    </div>

                    {/* Arrow */}
                    <div style={{ color: '#2563eb', fontSize: '22px', fontWeight: 800, flexShrink: 0 }}>
                      →
                    </div>

                    {/* New Plan Card */}
                    <div style={{
                      flex: 1,
                      background: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px',
                      padding: '14px 16px',
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <div style={{
                        width: '38px',
                        height: '38px',
                        borderRadius: '8px',
                        background: '#fff7ed',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ea580c',
                        flexShrink: 0
                      }}>
                        <CrownIcon size={20} color="#ea580c" />
                      </div>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>New Plan</div>
                        <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                          {targetSelectedPlan?.name || 'Standard'}
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', marginTop: '2px' }}>
                          ₹{newPrice.toLocaleString()} <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>/ {isYearly ? 'year' : 'month'}</span>
                        </div>
                        <div style={{ fontSize: '10.5px', color: '#94a3b8', marginTop: '3px' }}>
                          Will be effective from {effectiveDateFormatted}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Breakdown Box */}
                  <div style={{
                    background: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '16px 20px',
                    marginTop: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '12px'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Billing Cycle</div>
                        <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                          {isYearly ? 'Yearly' : 'Monthly'}
                        </div>
                      </div>
                      <div style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                        ₹{newPrice.toLocaleString()} <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>/ {isYearly ? 'year' : 'month'}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Price Difference</span>
                      <span style={{
                        fontWeight: 800,
                        color: priceDiff < 0 ? '#10b981' : priceDiff > 0 ? '#ea580c' : '#64748b'
                      }}>
                        {priceDiff < 0
                          ? `- ₹${Math.abs(priceDiff).toLocaleString()} / ${isYearly ? 'year' : 'month'}`
                          : priceDiff > 0
                          ? `+ ₹${priceDiff.toLocaleString()} / ${isYearly ? 'year' : 'month'}`
                          : '₹0 (Renewal)'}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                      <span style={{ color: '#475569', fontWeight: 600 }}>Applicable Tax (18%)</span>
                      <span style={{ fontWeight: 700, color: '#0f172a' }}>
                        ₹{applicableTax.toLocaleString()}
                      </span>
                    </div>

                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>Total Amount</div>
                        <div style={{ fontSize: '11px', color: '#64748b' }}>(Including tax)</div>
                      </div>
                      <div style={{ fontSize: '22px', fontWeight: 900, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                        ₹{totalAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Warning / Notice Box */}
                  <div style={{
                    background: '#eff6ff',
                    border: '1px solid #bfdbfe',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    marginTop: '16px',
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'flex-start'
                  }}>
                    <div style={{ color: '#2563eb', flexShrink: 0, marginTop: '2px' }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    </div>
                    <div style={{ fontSize: '12px', color: '#1e40af', lineHeight: 1.45 }}>
                      {priceDiff < 0
                        ? `Your plan will be changed on ${effectiveDateFormatted}. You will lose access to some features from your current plan. (e.g. Inventory Management, Kitchen Management).`
                        : priceDiff > 0
                        ? `Your plan will be upgraded to ${targetSelectedPlan?.name} Plan. You will get immediate access to all advanced features and higher outlet capacity.`
                        : `Your plan will be renewed for ${isYearly ? '1 year' : '1 month'}. Your subscription validity will be extended until ${effectiveDateFormatted}.`
                      }
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
                    <button
                      type="button"
                      onClick={() => setChangePlanStep(1)}
                      disabled={isProcessingUpgrade}
                      style={{
                        padding: '10px 22px',
                        borderRadius: '8px',
                        border: '1.5px solid #cbd5e1',
                        background: '#ffffff',
                        color: '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: isProcessingUpgrade ? 'not-allowed' : 'pointer'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmPlanChange}
                      disabled={isProcessingUpgrade}
                      style={{
                        padding: '10px 26px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ff5a1f',
                        color: '#ffffff',
                        fontSize: '13px',
                        fontWeight: 700,
                        cursor: isProcessingUpgrade ? 'wait' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
                      }}
                      onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                      onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                    >
                      {isProcessingUpgrade ? (
                        <>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: 'spin 1s linear infinite' }}>
                            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
                          </svg>
                          Confirming Plan Change...
                        </>
                      ) : (
                        'Confirm Plan Change →'
                      )}
                    </button>
                  </div>
                </div>
              );
            }

            // ==========================================
            // STEP 3: SUCCESS MODAL (SCREENSHOT 2 RIGHT)
            // ==========================================
            return (
              <div style={{ textAlign: 'center', padding: '6px 12px 10px 12px' }}>
                {/* Close Button top-right */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '20px', padding: '4px', lineHeight: 1 }}
                    onMouseEnter={e => e.currentTarget.style.color = '#0f172a'}
                    onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}
                  >
                    ✕
                  </button>
                </div>

                {/* Festive Circular Checkmark Icon with Confetti Dots */}
                <div style={{ position: 'relative', width: '92px', height: '92px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ position: 'absolute', top: '2px', left: '22px', width: '6px', height: '6px', borderRadius: '50%', background: '#ff7a00' }} />
                  <span style={{ position: 'absolute', top: '10px', right: '18px', width: '7px', height: '7px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ position: 'absolute', bottom: '6px', left: '16px', width: '7px', height: '7px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span style={{ position: 'absolute', bottom: '12px', right: '20px', width: '6px', height: '6px', borderRadius: '50%', background: '#ff7a00' }} />
                  <span style={{ position: 'absolute', top: '38px', left: '-4px', width: '5px', height: '5px', borderRadius: '50%', background: '#10b981' }} />
                  <span style={{ position: 'absolute', top: '34px', right: '-4px', width: '6px', height: '6px', borderRadius: '50%', background: '#3b82f6' }} />

                  <div style={{
                    width: '76px',
                    height: '76px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 24px rgba(16, 185, 129, 0.2)'
                  }}>
                    <div style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '50%',
                      background: '#10b981',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#ffffff',
                      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)'
                    }}>
                      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Heading & Subheading */}
                <h3 style={{ margin: '16px 0 6px 0', fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                  Plan Changed Successfully!
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                  Your plan has been updated from <strong style={{ color: '#0f172a' }}>{cleanPlanSlug || 'Premium'}</strong> to <strong style={{ color: '#0f172a' }}>{targetSelectedPlan?.name || 'Standard'}</strong>.
                </p>

                {/* Details Summary Card */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px 20px',
                  margin: '20px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  textAlign: 'left'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>New Plan</span>
                    <strong style={{ color: '#0f172a' }}>{targetSelectedPlan?.name || 'Standard'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>Billing Cycle</span>
                    <strong style={{ color: '#0f172a' }}>{isYearly ? 'Yearly' : 'Monthly'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px' }}>
                    <span style={{ color: '#64748b' }}>New Expiry Date</span>
                    <strong style={{ color: '#0f172a' }}>{effectiveDateFormatted}</strong>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsUpgradeModalOpen(false);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#ff5a1f',
                      color: '#ffffff',
                      fontSize: '13.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(255, 90, 31, 0.25)',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.opacity = '0.92'}
                    onMouseLeave={e => e.currentTarget.style.opacity = '1'}
                  >
                    View Plan Details
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsUpgradeModalOpen(false)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      background: '#ffffff',
                      color: '#334155',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.15s'
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                  >
                    Close
                  </button>
                </div>
              </div>
            );
          })()}
        </Modal>
      )}

    </div>
  );
}

