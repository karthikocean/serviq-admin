import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BranchApi from '../api/Branch.js';
import SubscriptionApi from '../api/Subscription.js';
import UserApi from '../api/User.js';
import OrderApi from '../api/Order.js';
import TableApi from '../api/Table.js';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import { OtpPasswordInput } from './OtpPasswordInput';
import { resolveBranchManagerName } from '../helper/BranchHelper.js';
import { getPlanBranchLimit } from '../config/initialData';
import {
  sanitizeName,
  sanitizeMobile,
  validateName,
  validateMobile,
  validateEmail,
  validateRequired,
  validatePincode,
  validateBranchName,
  validateBranchCode,
  validatePassword
} from '../helper/ValidationHelper';

const TableIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M4 6h16" />
    <path d="M5 6v12" />
    <path d="M19 6v12" />
    <path d="M10 6v6" />
    <path d="M14 6v6" />
  </svg>
);

const UserIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const EyeIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
    <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
    <line x1="2" y1="2" x2="22" y2="22" />
  </svg>
);

const PencilIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" x2="10" y1="11" y2="17" />
    <line x1="14" x2="14" y1="11" y2="17" />
  </svg>
);

const TreeIcon = ({ size = 18, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"></rect>
    <rect x="14" y="3" width="7" height="7"></rect>
    <rect x="14" y="14" width="7" height="7"></rect>
    <rect x="3" y="14" width="7" height="7"></rect>
    <line x1="10" y1="6.5" x2="14" y2="6.5"></line>
    <line x1="6.5" y1="10" x2="6.5" y2="14"></line>
    <line x1="17.5" y1="10" x2="17.5" y2="14"></line>
  </svg>
);

const initialBranchState = {
  id: '',
  branchName: '',
  branchCode: '',
  managerName: '',
  branchManager: '',
  mobileNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  country: '',
  state: '',
  city: '',
  pincode: '',
  openingDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  totalTables: 10,
  username: '',
  gstNumber: '',
  fssaiNumber: '',
  isMainBranch: false
};

export default function BranchManagementPanel({ hasPermission: hasPermissionProp }) {
  const navigate = useNavigate();
  const { currentUser, activeRestaurant, addBranch, updateBranch, deleteBranch, purchaseExtraBranchSlots, fetchOrders } = useAppState();

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
    userRoleLower === 'restaurant_owner' || 
    userRoleLower === 'restaurant owner' || 
    userRoleLower === 'owner' || 
    userRoleLower === 'super admin' || 
    userRoleLower === 'super_admin';

  const role = roleStr || 'Admin';
  const hasPermission = hasPermissionProp || ((moduleName, action = 'view') => {
    if (isRestaurantOwner) return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
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
          Branch Management is strictly restricted to the <strong>Restaurant Owner</strong> only. Other roles do not have permission to view or manage branches.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: 'var(--primary)', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const [activeView, setActiveView] = useState('list'); // 'list' | 'form' | 'hierarchy'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Form state & Validation Errors state
  const [branchForm, setBranchForm] = useState(initialBranchState);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Subscription Quota & Plan Limit Modal state
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [isProcessingSlotPayment, setIsProcessingSlotPayment] = useState(false);

  // View page operational sub-tab state
  const [selectedBranchForTree, setSelectedBranchForTree] = useState(null);
  const [opSubTab, setOpSubTab] = useState('tables');

  // Delete modal state
  const [branchToDelete, setBranchToDelete] = useState(null);

  const [apiBranches, setApiBranches] = useState([]);
  const [apiUsers, setApiUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveBranchStaff, setLiveBranchStaff] = useState([]);
  const [liveBranchOrders, setLiveBranchOrders] = useState([]);
  const [liveBranchTables, setLiveBranchTables] = useState([]);
  const [isLoadingOpData, setIsLoadingOpData] = useState(false);

  // View page operational tables & orders & staff pagination & filters
  const [tablesPage, setTablesPage] = useState(1);
  const [tablesViewMode, setTablesViewMode] = useState('table'); // 'table' | 'grid'
  const [liveTablesPagination, setLiveTablesPagination] = useState(null);
  const [ordersPage, setOrdersPage] = useState(1);
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all' | 'queue' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  const [staffPage, setStaffPage] = useState(1);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [liveOrdersPagination, setLiveOrdersPagination] = useState(null);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const branchParams = {
        search: searchTerm ? searchTerm.trim() : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        limit: 1000
      };
      const [res, usersRes] = await Promise.allSettled([
        BranchApi.getBranches(branchParams),
        UserApi.getUsers({ limit: 1000 })
      ]);

      const branchResponse = res.status === 'fulfilled' ? res.value : null;
      const usersList = (usersRes.status === 'fulfilled' && usersRes.value?.status && Array.isArray(usersRes.value.response?.data))
        ? usersRes.value.response.data
        : ((usersRes.status === 'fulfilled' && usersRes.value?.status && Array.isArray(usersRes.value.response?.users))
            ? usersRes.value.response.users
            : (Array.isArray(usersRes.value?.response) ? usersRes.value.response : []));
      const staffList = usersList;
      setApiUsers(usersList);

      if (branchResponse && branchResponse.status && branchResponse.response) {
        const rawList = Array.isArray(branchResponse.response) 
          ? branchResponse.response 
          : (Array.isArray(branchResponse.response.data) ? branchResponse.response.data : (branchResponse.response.data?.branches || branchResponse.response?.branches || []));

        const mappedBranches = rawList.map(b => {
          const bId = b._id || b.id;
          const mgr = resolveBranchManagerName(b, usersList, staffList);
          const resolvedMgr = (mgr && mgr !== 'Unassigned') ? mgr : ((b.managerName && b.managerName !== 'Unassigned') ? b.managerName : ((b.branchManager && b.branchManager !== 'Unassigned') ? b.branchManager : 'Unassigned'));

          const addr = typeof b.address === 'object' && b.address !== null ? b.address : {};
          const streetStr = typeof b.address === 'string' ? b.address : (addr.street || b.street || '');
          const cityStr = b.city || addr.city || '';
          const stateStr = b.state || addr.state || '';
          const countryStr = b.country || addr.country || '';
          const pincodeStr = b.pincode || addr.pincode || '';

          return {
            id: bId,
            _id: bId,
            rawManagerId: b.managerId || b.branchManagerId || b.userId || b.adminId || (typeof b.manager === 'object' ? (b.manager?._id || b.manager?.id) : b.manager) || '',
            managerId: b.managerId || b.branchManagerId || b.userId || b.adminId || '',
            branchName: b.branchName || b.name || '',
            branchCode: b.branchCode || b.code || '',
            branchManager: resolvedMgr,
            managerName: resolvedMgr,
            mobileNumber: b.contactNumber || b.mobileNumber || b.phone || b.managerMobile || '',
            email: b.email || b.managerEmail || '',
            password: '',
            confirmPassword: '',
            address: streetStr,
            country: countryStr,
            state: stateStr,
            city: cityStr,
            pincode: pincodeStr,
            openingDate: b.branchOpeningDate ? b.branchOpeningDate.split('T')[0] : (b.openingDate ? b.openingDate.split('T')[0] : ''),
            status: b.status || 'Active',
            totalTables: b.totalTables || (Array.isArray(b.tables) ? b.tables.length : 0),
            isMainBranch: b.isMainBranch || false
          };
        });
        setApiBranches(mappedBranches);
      }
    } catch (e) {
      console.error("Failed to fetch branches or managers", e);
    }
    setIsLoading(false);
  };

  const fetchBranchOperationalData = useCallback(async (targetBranch) => {
    if (!targetBranch) return;
    const branchId = targetBranch._id || targetBranch.id;
    setIsLoadingOpData(true);
    try {
      const [usersRes, globalUsersRes, ordersRes, tablesRes] = await Promise.allSettled([
        UserApi.getUsers({ branchId, limit: 1000 }),
        UserApi.getUsers({ limit: 1000 }),
        OrderApi.getOrders({ branchId, limit: 1000 }),
        TableApi.getTables({ branchId, limit: 1000 })
      ]);

      let branchUsers = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.status) {
        const raw = usersRes.value.response?.data || usersRes.value.response?.users || usersRes.value.response?.staff || (Array.isArray(usersRes.value.response) ? usersRes.value.response : []);
        branchUsers = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.users) ? raw.users : []));
      }

      if (globalUsersRes.status === 'fulfilled' && globalUsersRes.value?.status) {
        const gRaw = globalUsersRes.value.response?.data || globalUsersRes.value.response?.users || globalUsersRes.value.response?.staff || (Array.isArray(globalUsersRes.value.response) ? globalUsersRes.value.response : []);
        const gUsers = Array.isArray(gRaw) ? gRaw : (Array.isArray(gRaw?.data) ? gRaw.data : (Array.isArray(gRaw?.users) ? gRaw.users : []));
        if (gUsers.length > 0) {
          setApiUsers(gUsers);
        }
      }

      setLiveBranchStaff(branchUsers);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.status) {
        const resp = ordersRes.value.response;
        const d = resp?.data || resp;
        let orderList = [];
        if (Array.isArray(d)) {
          orderList = d;
        } else if (Array.isArray(d?.orders)) {
          orderList = d.orders;
        } else if (Array.isArray(d?.data)) {
          orderList = d.data;
        } else if (Array.isArray(d?.data?.orders)) {
          orderList = d.data.orders;
        } else if (Array.isArray(resp?.orders)) {
          orderList = resp.orders;
        }
        setLiveBranchOrders(orderList);

        const pag = resp?.pagination || d?.pagination || resp?.data?.pagination;
        if (pag) {
          setLiveOrdersPagination(pag);
        } else if (resp?.total || d?.total || resp?.totalOrders || d?.totalOrders) {
          const tot = resp?.total || d?.total || resp?.totalOrders || d?.totalOrders || orderList.length;
          setLiveOrdersPagination({
            total: tot,
            from: resp?.from || d?.from || 1,
            to: resp?.to || d?.to || Math.min(10, tot),
            totalPages: resp?.totalPages || d?.totalPages || Math.ceil(tot / 10),
            currentPage: resp?.currentPage || d?.currentPage || 1
          });
        }
      }

      if (tablesRes.status === 'fulfilled' && tablesRes.value?.status) {
        const resp = tablesRes.value.response;
        const d = resp?.data || resp;
        let tableList = [];
        if (Array.isArray(d)) {
          tableList = d;
        } else if (Array.isArray(d?.tables)) {
          tableList = d.tables;
        } else if (Array.isArray(d?.data)) {
          tableList = d.data;
        } else if (Array.isArray(d?.data?.tables)) {
          tableList = d.data.tables;
        } else if (Array.isArray(resp?.tables)) {
          tableList = resp.tables;
        }
        setLiveBranchTables(tableList);

        const pag = resp?.pagination || d?.pagination || resp?.data?.pagination;
        if (pag) {
          setLiveTablesPagination(pag);
        } else if (resp?.total || d?.total || resp?.totalTables || d?.totalTables) {
          const tot = resp?.total || d?.total || resp?.totalTables || d?.totalTables || tableList.length;
          setLiveTablesPagination({
            total: tot,
            from: resp?.from || d?.from || 1,
            to: resp?.to || d?.to || Math.min(10, tot),
            totalPages: resp?.totalPages || d?.totalPages || Math.ceil(tot / 10),
            currentPage: resp?.currentPage || d?.currentPage || 1
          });
        }
      }
    } catch (e) {
      console.error("Error fetching branch operational data:", e);
    } finally {
      setIsLoadingOpData(false);
    }
  }, []);

  const [subDashboard, setSubDashboard] = useState(null);

  const fetchLiveSubscription = useCallback(async () => {
    try {
      const res = await SubscriptionApi.getDashboard();
      if (res && res.status && res.response) {
        setSubDashboard(res.response.data || res.response);
      }
    } catch (err) {
      console.warn("BranchManagementPanel: Failed to fetch subscription dashboard", err);
    }
  }, []);

  useEffect(() => {
    if (isRestaurantOwner) {
      const timer = setTimeout(() => {
        fetchBranches();
      }, 300);
      fetchLiveSubscription();
      return () => clearTimeout(timer);
    }
  }, [isRestaurantOwner, searchTerm, statusFilter, fetchLiveSubscription]);

  const branches = apiBranches;

  // Subscription Plan details & calculations (Basic: max 3, Standard: max 5, Premium: max 8)
  const activePlanData = subDashboard?.activePlan;
  const branchCap = subDashboard?.branchCapacity;
  const extraRate = subDashboard?.extraBranchRate;

  const sub = activeRestaurant?.subscription || {
    planName: activeRestaurant?.plan || 'Standard',
    baseBranchLimit: 5,
    extraBranchSlots: 0,
    extraBranchPrice: 699
  };

  // Prioritize activeRestaurant subscription and plan over API dashboard fallbacks
  const rawPlanName = activeRestaurant?.subscription?.planName || activeRestaurant?.plan || activePlanData?.planName || 'Standard';
  const cleanPlanName = String(rawPlanName).replace(/^plan-/i, '').replace(/\s*plan$/i, '').trim() || 'Standard';
  const planName = cleanPlanName;

  // Base limit strictly derived from active plan (Basic: 3, Standard: 5, Premium: 8)
  const baseBranchLimit = getPlanBranchLimit(planName, 5);
  const extraBranchSlots = (activeRestaurant?.subscription?.extraBranchSlots !== undefined)
    ? activeRestaurant.subscription.extraBranchSlots
    : (branchCap?.extraSlots || 0);

  const totalAllowedBranches = baseBranchLimit + extraBranchSlots;
  const remainingBranchSlots = Math.max(0, totalAllowedBranches - branches.length);
  const extraBranchUnitPrice = extraRate?.rate !== undefined 
    ? extraRate.rate 
    : (sub.extraBranchPrice || (planName.toLowerCase().includes('premium') ? 499 : (planName.toLowerCase().includes('basic') ? 799 : 699)));
  const extraBranchTotalWithGst = Math.round(extraBranchUnitPrice * 1.18);

  // Filtered branches
  const filteredBranches = branches.filter(b => {
    const matchesSearch = !searchTerm ||
      (b.branchName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.branchCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.managerName || b.branchManager || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Pagination for branches
  const [page, setPage] = useState(0);
  const limit = 10;
  const totalPages = Math.ceil(filteredBranches.length / limit) || 1;
  const paginatedBranches = filteredBranches.slice(page * limit, (page + 1) * limit);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = page + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  React.useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  // Metrics
  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter(b => b.status === 'Active').length;
  const totalTablesCount = branches.reduce((sum, b) => sum + (parseInt(b.totalTables) || 0), 0);
  const totalManagersCount = new Set(branches.map(b => (b.managerName || b.branchManager || '').trim()).filter(x => x && !['unassigned', 'null', 'undefined'].includes(x.toLowerCase()))).size;

  const openAddBranchFormDirectly = () => {
    const autoCode = `BR-${Math.floor(100 + Math.random() * 900)}`;
    setBranchForm({
      ...initialBranchState,
      branchCode: autoCode,
      username: `branch_${autoCode.toLowerCase().replace('-', '_')}`,
     password: '',
      confirmPassword: ''
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsEditing(false);
    setActiveView('form');
  };

  const handleOpenAddForm = () => {
    if (!hasPermission('branch-management', 'add')) {
      ShowNotifications.showAlertNotification("You do not have permission to add new branches.", false);
      return;
    }

    // Check Plan Limits (Premium: max 8, Standard: max 5, Basic: max 3 + add-ons)
    if (branches.length >= totalAllowedBranches) {
      ShowNotifications.showAlertNotification(
        `Branch limit reached: Your ${planName} Plan allows a maximum of ${totalAllowedBranches} branch${totalAllowedBranches > 1 ? 'es' : ''}. Upgrade plan or add slots to continue.`,
        false
      );
      setIsPlanLimitModalOpen(true);
      return;
    }

    openAddBranchFormDirectly();
  };

  const handlePayAndUnlockBranchSlot = async () => {
    setIsProcessingSlotPayment(true);
    try {
      const res = await SubscriptionApi.purchaseAddons({
        additionalSlots: 1,
        paymentMethod: 'Credit Card'
      });
      if (res && res.status) {
        if (typeof purchaseExtraBranchSlots === 'function' && activeRestaurant?.id) {
          purchaseExtraBranchSlots(activeRestaurant.id, 1, 'Credit Card');
        }
        setIsPlanLimitModalOpen(false);
        openAddBranchFormDirectly();
      }
    } catch (err) {
      console.error("Error purchasing branch slot:", err);
    } finally {
      setIsProcessingSlotPayment(false);
    }
  };

  const handleOpenEditForm = (branch) => {
    if (!hasPermission('branch-management', 'edit')) {
      ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
      return;
    }
    const extractRawManagerName = (val) => {
      if (!val) return '';
      if (typeof val === 'object') {
        const n = val.name || val.managerName || val.username || val.fullName;
        return typeof n === 'string' && n.trim() && n.trim().toLowerCase() !== 'unassigned' ? n.trim() : '';
      }
      if (typeof val === 'string') {
        const t = val.trim();
        return t && t.toLowerCase() !== 'unassigned' ? t : '';
      }
      return '';
    };

    const managerNameFromBranch = (
      extractRawManagerName(branch.managerName) ||
      extractRawManagerName(branch.branchManager) ||
      extractRawManagerName(branch.manager) ||
      extractRawManagerName(branch.branchManagerName) ||
      extractRawManagerName(branch.contactPerson) ||
      ''
    );

    setBranchForm({
      id: branch.id || branch._id,
      managerId: branch.managerId || branch.rawManagerId || '',
      branchName: branch.branchName || branch.name || '',
      branchCode: branch.branchCode || branch.code || '',
      managerName: managerNameFromBranch,
      branchManager: managerNameFromBranch,
      mobileNumber: branch.mobileNumber || branch.contactNumber || branch.phone || branch.managerMobile || '',
      email: branch.email || branch.managerEmail || '',
      password: '',
      confirmPassword: '',
      address: typeof branch.address === 'string' ? branch.address : (branch.address?.street || ''),
      country: branch.country || branch.address?.country || 'India',
      state: branch.state || branch.address?.state || 'Tamil Nadu',
      city: branch.city || branch.address?.city || '',
      pincode: branch.pincode || branch.address?.pincode || '',
      openingDate: branch.openingDate ? branch.openingDate.split('T')[0] : (branch.branchOpeningDate ? branch.branchOpeningDate.split('T')[0] : new Date().toISOString().split('T')[0]),
      status: branch.status || 'Active',
      totalTables: branch.totalTables || 10,
      username: branch.username || '',
      gstNumber: branch.gstNumber || '',
      fssaiNumber: branch.fssaiNumber || '',
      isMainBranch: branch.isMainBranch || false
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setIsEditing(true);
    setActiveView('form');
  };

  const handleOpenHierarchy = (branch = null) => {
    const targetBranch = branch || (branches.length > 0 ? branches[0] : null);
    setSelectedBranchForTree(targetBranch);
    setOpSubTab('tables');
    setTablesPage(1);
    setOrdersPage(1);
    setStaffPage(1);
    setOrdersFilter('all');
    setActiveView('hierarchy');
  };

  const handleDeleteBranchClick = (branch) => {
    if (!hasPermission('branch-management', 'delete')) {
      ShowNotifications.showAlertNotification("You do not have permission to delete branches.", false);
      return;
    }
    setBranchToDelete(branch);
  };

  // Form Validation logic
  const validateForm = () => {
    const errors = {};

    // 1. Branch Name validation
    const branchNameTrimmed = (branchForm.branchName || '').trim();
    const branchNameErr = validateBranchName(branchNameTrimmed);
    if (branchNameErr) {
      errors.branchName = branchNameErr;
    }

    // 2. Branch Code validation (3 to 6 uppercase alphanumeric)
    const branchCodeTrimmed = (branchForm.branchCode || '').trim();
    const branchCodeErr = validateBranchCode(branchCodeTrimmed);
    if (branchCodeErr) {
      errors.branchCode = branchCodeErr;
    } else {
      // Check for code uniqueness locally among branches (exclude current editing branch)
      const isDuplicateCode = branches.some(b => {
        if (isEditing && (b.id === branchForm.id || b._id === branchForm.id)) return false;
        return (b.branchCode || '').trim().toLowerCase() === branchCodeTrimmed.toLowerCase();
      });
      if (isDuplicateCode) {
        errors.branchCode = 'A branch with this code already exists.';
      }
    }

    // 3. Branch Opening Date validation
    const dateErr = validateRequired(branchForm.openingDate, 'Branch Opening Date');
    if (dateErr) {
      errors.openingDate = dateErr;
    }

    // 4. Branch Manager (Manager Name) validation
    const managerTrimmed = (branchForm.managerName || branchForm.branchManager || '').trim();
    if (!managerTrimmed || managerTrimmed.toLowerCase() === 'unassigned') {
      errors.managerName = 'Branch Manager name is required.';
      errors.branchManager = 'Branch Manager name is required.';
    } else if (managerTrimmed.length < 2) {
      errors.managerName = 'Branch Manager name must be at least 2 characters.';
      errors.branchManager = 'Branch Manager name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.'-]+$/.test(managerTrimmed)) {
      errors.managerName = 'Branch Manager name must contain letters and spaces only.';
      errors.branchManager = 'Branch Manager name must contain letters and spaces only.';
    }

    // 5. Mobile Number (Exactly 10 digits, starts with 6-9)
    const mobileTrimmed = (branchForm.mobileNumber || '').trim();
    const mobileErr = validateMobile(mobileTrimmed);
    if (mobileErr) {
      errors.mobileNumber = mobileErr;
    } else if (!/^[6-9][0-9]{9}$/.test(mobileTrimmed)) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number starting with 6, 7, 8, or 9.';
    } else {
      const cleanPhone = mobileTrimmed.replace(/\D/g, '').slice(-10);
      const allBranchSources = [
        ...(apiBranches || []),
        ...(branches || []),
        ...(activeRestaurant?.branches || [])
      ];
      let isDuplicate = allBranchSources.some(b => {
        const bId = String(b.id || b._id || '');
        const currentId = String(branchForm.id || '');
        if (isEditing && bId && currentId && (bId === currentId || String(bId) === String(currentId))) {
          return false;
        }
        const rawPhone = String(b.mobileNumber || b.contactNumber || b.phone || b.managerMobile || '').replace(/\D/g, '');
        const existingPhone = rawPhone.slice(-10);
        return Boolean(existingPhone && cleanPhone && existingPhone === cleanPhone);
      });

      if (!isDuplicate && Array.isArray(apiUsers)) {
        isDuplicate = apiUsers.some(u => {
          const uBranchId = typeof u.branchId === 'object' ? String(u.branchId?._id || u.branchId?.id || '') : String(u.branchId || '');
          const currentId = String(branchForm.id || '');
          if (isEditing && uBranchId && currentId && uBranchId === currentId) {
            return false;
          }
          const rawPhone = String(u.phone || u.phoneNumber || u.mobile || u.mobileNumber || '').replace(/\D/g, '');
          const existingPhone = rawPhone.slice(-10);
          return Boolean(existingPhone && cleanPhone && existingPhone === cleanPhone);
        });
      }

      if (isDuplicate) {
        errors.mobileNumber = 'This mobile number is already registered to another branch/user.';
      }
    }

    // 6. Email Address validation
    const emailTrimmed = (branchForm.email || '').trim().toLowerCase();
    const emailErr = validateEmail(emailTrimmed);
    if (emailErr) {
      errors.email = emailErr;
    } else {
      const allBranchSources = [
        ...(apiBranches || []),
        ...(branches || []),
        ...(activeRestaurant?.branches || [])
      ];
      let isDuplicateEmail = allBranchSources.some(b => {
        const bId = String(b.id || b._id || '');
        const currentId = String(branchForm.id || '');
        if (isEditing && bId && currentId && (bId === currentId || String(bId) === String(currentId))) {
          return false;
        }
        const existingEmail = String(b.email || b.managerEmail || '').trim().toLowerCase();
        return Boolean(existingEmail && existingEmail === emailTrimmed);
      });

      if (!isDuplicateEmail && Array.isArray(apiUsers)) {
        isDuplicateEmail = apiUsers.some(u => {
          const uBranchId = typeof u.branchId === 'object' ? String(u.branchId?._id || u.branchId?.id || '') : String(u.branchId || '');
          const currentId = String(branchForm.id || '');
          if (isEditing && uBranchId && currentId && uBranchId === currentId) {
            return false;
          }
          const existingEmail = String(u.email || '').trim().toLowerCase();
          return Boolean(existingEmail && existingEmail === emailTrimmed);
        });
      }

      if (isDuplicateEmail) {
        errors.email = 'This email is already registered to another branch/user.';
      }
    }

    // 7. Password & Confirm Password validation (Nivetha@123 format)
    const hasPassword = Boolean(branchForm.password && String(branchForm.password).trim());
    const hasConfirm = Boolean(branchForm.confirmPassword && String(branchForm.confirmPassword).trim());

    if (!isEditing) {
      if (!hasPassword) {
        errors.password = 'Password is required.';
      } else {
        const pErr = validatePassword(branchForm.password, 'Password');
        if (pErr) errors.password = pErr;
      }

      // Confirm Password validation
      if (!hasConfirm) {
        errors.confirmPassword = 'Confirm Password is required.';
      } else if (String(branchForm.password).trim() !== String(branchForm.confirmPassword).trim()) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    } else {
      // In edit mode: validate if user types a new password or confirm password
      if (hasPassword || hasConfirm) {
        if (!hasPassword) {
          errors.password = 'New Password is required.';
        } else {
          const pErr = validatePassword(branchForm.password, 'New Password');
          if (pErr) errors.password = pErr;
        }

        if (!hasConfirm) {
          errors.confirmPassword = 'Confirm Password is required.';
        } else if (String(branchForm.password).trim() !== String(branchForm.confirmPassword).trim()) {
          errors.confirmPassword = 'Passwords do not match.';
        }
      }
    }

    // 8. Address (Street Address) - Required
    const addressTrimmed = (branchForm.address || '').trim();
    if (!addressTrimmed) {
      errors.address = 'Street Address is required.';
    } else if (addressTrimmed.length < 3) {
      errors.address = 'Street Address must be at least 3 characters.';
    }

    // 9. City validation
    const cityTrimmed = (branchForm.city || '').trim();
    if (!cityTrimmed) {
      errors.city = 'City is required.';
    } else if (cityTrimmed.length < 2) {
      errors.city = 'City must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(cityTrimmed)) {
      errors.city = 'City must contain letters and spaces only.';
    }

    // 10. State validation
    const stateTrimmed = (branchForm.state || '').trim();
    if (!stateTrimmed) {
      errors.state = 'State is required.';
    } else if (stateTrimmed.length < 2) {
      errors.state = 'State must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(stateTrimmed)) {
      errors.state = 'State must contain letters and spaces only.';
    }

    // 11. Country validation
    const countryTrimmed = (branchForm.country || '').trim();
    if (!countryTrimmed) {
      errors.country = 'Country is required.';
    } else if (countryTrimmed.length < 2) {
      errors.country = 'Country must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s]+$/.test(countryTrimmed)) {
      errors.country = 'Country must contain letters and spaces only.';
    }

    // 12. Pincode (Postal Code) - Exactly 6 digits
    const pincodeTrimmed = (branchForm.pincode || '').trim();
    const pinErr = validatePincode(pincodeTrimmed);
    if (pinErr) {
      errors.pincode = pinErr;
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const managerVal = (branchForm.branchManager || branchForm.managerName || '').trim();

    const payload = {
      branchName: (branchForm.branchName || '').trim(),
      branchCode: (branchForm.branchCode || '').trim(),
      branchOpeningDate: branchForm.openingDate,
      contactNumber: (branchForm.mobileNumber || '').trim(),
      mobileNumber: (branchForm.mobileNumber || '').trim(),
      phone: (branchForm.mobileNumber || '').trim(),
      email: (branchForm.email || '').trim(),
      street: (branchForm.address || '').trim(),
      address: (branchForm.address || '').trim(),
      city: (branchForm.city || '').trim(),
      state: (branchForm.state || '').trim(),
      country: (branchForm.country || '').trim(),
      pincode: (branchForm.pincode || '').trim(),
      managerName: managerVal,
      branchManager: managerVal,
      manager: managerVal,
      contactPerson: managerVal,
      branchManagerName: managerVal,
      managerMobile: (branchForm.mobileNumber || '').trim(),
      managerEmail: (branchForm.email || '').trim(),
      status: branchForm.status || 'Active',
      isMainBranch: !!branchForm.isMainBranch
    };

    if (branchForm.password && String(branchForm.password).trim()) {
      const pinVal = String(branchForm.password).trim();
      payload.managerPassword = pinVal;
      payload.password = pinVal;
      payload.newPassword = pinVal;
      payload.pin = pinVal;
      payload.managerPin = pinVal;
      payload.confirmPassword = pinVal;
    }

    if (isEditing) {
      if (!hasPermission('branch-management', 'edit')) {
        ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
        return;
      }

      const res = await BranchApi.updateBranch(branchForm.id, payload);
      if (res && res.status) {
        // If a new password was set, synchronize with associated manager user record
        if (branchForm.password && String(branchForm.password).trim()) {
          const pinVal = String(branchForm.password).trim();
          const targetBranch = apiBranches.find(b => (b.id === branchForm.id || b._id === branchForm.id));
          
          // Match manager user across current user pool
          let matchedUser = (apiUsers || []).find(u => {
            const uId = String(u._id || u.id || '');
            if (targetBranch?.rawManagerId && uId === String(targetBranch.rawManagerId)) return true;
            if (branchForm.managerId && uId === String(branchForm.managerId)) return true;
            const uBranchId = typeof u.branchId === 'object' && u.branchId !== null
              ? String(u.branchId._id || u.branchId.id || '')
              : String(u.branchId || u.branch || '');
            if (uBranchId && uBranchId === String(branchForm.id)) {
              const roleStr = String(typeof u.role === 'object' && u.role !== null ? (u.role.roleName || u.role.name || '') : (u.role || u.userType || '')).toLowerCase();
              if (roleStr.includes('manager') || roleStr.includes('admin') || roleStr.includes('owner')) return true;
            }
            const uEmail = String(u.email || '').toLowerCase().trim();
            const uPhone = String(u.phone || u.mobileNumber || u.mobile || u.phoneNumber || '').replace(/\D/g, '');
            const bEmail = String(branchForm.email || '').toLowerCase().trim();
            const bPhone = String(branchForm.mobileNumber || '').replace(/\D/g, '');
            if (bEmail && uEmail && bEmail === uEmail) return true;
            if (bPhone && uPhone && bPhone === uPhone) return true;
            return false;
          });

          // If not found in apiUsers, query backend for users assigned to this branch
          if (!matchedUser) {
            try {
              const branchUsersRes = await UserApi.getUsers({ branchId: branchForm.id, limit: 10 });
              const branchUsers = branchUsersRes?.status && Array.isArray(branchUsersRes.response?.data)
                ? branchUsersRes.response.data
                : (Array.isArray(branchUsersRes?.response) ? branchUsersRes.response : []);
              matchedUser = branchUsers.find(u => {
                const roleStr = String(typeof u.role === 'object' && u.role !== null ? (u.role.roleName || u.role.name || '') : (u.role || u.userType || '')).toLowerCase();
                return roleStr.includes('manager') || roleStr.includes('admin');
              }) || branchUsers[0];
            } catch (e) {
              console.warn("Could not query branch users for password sync:", e);
            }
          }

          const targetUserId = matchedUser?._id || matchedUser?.id;
          if (targetUserId) {
            try {
              await Promise.allSettled([
                UserApi.changePassword(targetUserId, pinVal),
                UserApi.updateUser(targetUserId, { password: pinVal })
              ]);
            } catch (passErr) {
              console.warn("Could not update manager password via UserApi:", passErr);
            }
          } else {
            // If no user exists for this branch manager yet, create one
            try {
              await UserApi.createUser({
                name: managerVal,
                email: branchForm.email,
                phoneNumber: branchForm.mobileNumber,
                password: pinVal,
                role: 'Manager',
                branchId: branchForm.id
              });
            } catch (createErr) {
              console.warn("Could not create manager user on branch edit:", createErr);
            }
          }
        }

        setApiBranches(prev => prev.map(b => (b.id === branchForm.id || b._id === branchForm.id) ? { ...b, ...payload, branchManager: managerVal, managerName: managerVal } : b));
        if (activeRestaurant?.id && updateBranch) {
          updateBranch(activeRestaurant.id, branchForm.id, {
            ...payload,
            branchManager: managerVal,
            managerName: managerVal
          });
        }
        await fetchBranches();
        ShowNotifications.showAlertNotification("Branch updated successfully!", true);
        setActiveView('list');
      } else {
        const rawErr = String(
          res?.message ||
          res?.response?.message ||
          res?.response?.data?.message ||
          res?.response?.data?.error ||
          res?.response?.error ||
          (typeof res?.response === 'string' ? res.response : '') ||
          ''
        );
        const hasEmailErr = /email/i.test(rawErr);
        const hasMobileErr = /mobile|phone|contact/i.test(rawErr);
        const hasDuplicateErr = /duplicate|already exists/i.test(rawErr);

        if (hasEmailErr && hasMobileErr) {
          setFormErrors(prev => ({
            ...prev,
            email: 'A user with this email already exists.',
            mobileNumber: 'A user with this mobile number already exists.'
          }));
        } else if (hasEmailErr) {
          setFormErrors(prev => ({
            ...prev,
            email: 'This email is already registered to another branch/user.'
          }));
        } else if (hasMobileErr || (hasDuplicateErr && !/name|code/i.test(rawErr))) {
          setFormErrors(prev => ({
            ...prev,
            mobileNumber: 'This mobile number is already registered to another branch/user.'
          }));
        }
      }
    } else {
      if (branches.length >= totalAllowedBranches) {
        ShowNotifications.showAlertNotification(
          `Branch limit reached: Your ${planName} Plan allows a maximum of ${totalAllowedBranches} branch${totalAllowedBranches > 1 ? 'es' : ''}. Upgrade plan or purchase add-on slots to add more branches.`,
          false
        );
        setIsPlanLimitModalOpen(true);
        return;
      }
      if (!hasPermission('branch-management', 'add')) {
        ShowNotifications.showAlertNotification("You do not have permission to add new branches.", false);
        return;
      }
      const res = await BranchApi.createBranch(payload);
      if (res && res.status) {
        const createdId = res.response?.data?._id || res.response?.data?.id || `BR-${Date.now()}`;

        setApiBranches(prev => [...prev, { ...payload, id: createdId, _id: createdId, branchManager: managerVal, managerName: managerVal }]);
        if (activeRestaurant?.id && addBranch) {
          addBranch(activeRestaurant.id, {
            ...payload,
            id: createdId,
            branchManager: managerVal,
            managerName: managerVal
          });
        }
        await fetchBranches();
        ShowNotifications.showAlertNotification("Branch created successfully!", true);
        setActiveView('list');
      } else {
        const rawErr = String(
          res?.message ||
          res?.response?.message ||
          res?.response?.data?.message ||
          res?.response?.data?.error ||
          res?.response?.error ||
          (typeof res?.response === 'string' ? res.response : '') ||
          ''
        );
        const hasEmailErr = /email/i.test(rawErr);
        const hasMobileErr = /mobile|phone|contact/i.test(rawErr);
        const hasDuplicateErr = /duplicate|already exists/i.test(rawErr);

        if (hasEmailErr && hasMobileErr) {
          setFormErrors(prev => ({
            ...prev,
            email: 'A user with this email already exists.',
            mobileNumber: 'A user with this mobile number already exists.'
          }));
        } else if (hasEmailErr) {
          setFormErrors(prev => ({
            ...prev,
            email: 'This email is already registered to another branch/user.'
          }));
        } else if (hasMobileErr || (hasDuplicateErr && !/name|code/i.test(rawErr))) {
          setFormErrors(prev => ({
            ...prev,
            mobileNumber: 'This mobile number is already registered to another branch/user.'
          }));
        }
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (branchToDelete) {
      if (!hasPermission('branch-management', 'delete')) {
        ShowNotifications.showAlertNotification("You do not have permission to delete branches.", false);
        setBranchToDelete(null);
        return;
      }
      const res = await BranchApi.deleteBranch(branchToDelete.id);
      if (res && res.status) {
        fetchBranches();
      }
      setBranchToDelete(null);
    }
  };

  // Target branch currently viewed in hierarchy mode
  const currentViewBranch = selectedBranchForTree || (branches.length > 0 ? branches[0] : null);

  useEffect(() => {
    if (activeView === 'hierarchy' && currentViewBranch) {
      fetchBranchOperationalData(currentViewBranch);
      const pollTimer = setInterval(() => {
        fetchBranchOperationalData(currentViewBranch);
        if (typeof fetchOrders === 'function') {
          fetchOrders();
        }
      }, 10000);
      return () => clearInterval(pollTimer);
    }
  }, [activeView, currentViewBranch, fetchBranchOperationalData, fetchOrders]);

  // Live computed operational data for current branch
  const opData = (() => {
    const curBranch = currentViewBranch;
    const curBranchId = String(curBranch?.id || curBranch?._id || '').toLowerCase();
    const curBranchCode = String(curBranch?.branchCode || curBranch?.code || '').toLowerCase();
    const curBranchName = String(curBranch?.branchName || curBranch?.name || '').toLowerCase();

    const matchesBranch = (item) => {
      if (!item || !curBranch) return false;
      const curKeys = new Set([curBranchId, curBranchCode, curBranchName].filter(Boolean));
      
      const candidates = [
        item.branchId,
        item.branch,
        item.branch_id,
        item.assignedBranch,
        item.activeBranchId,
        item.restaurantBranchId,
        item.outletId,
        item.branchCode,
        item.branchName
      ];

      if (Array.isArray(item.branches)) item.branches.forEach(b => candidates.push(b));
      if (Array.isArray(item.branchIds)) item.branchIds.forEach(b => candidates.push(b));
      if (typeof item === 'string' || typeof item === 'number') candidates.push(item);

      return candidates.some(c => {
        if (!c) return false;
        if (typeof c === 'string' || typeof c === 'number') {
          const s = String(c).trim().toLowerCase();
          return curKeys.has(s);
        }
        if (typeof c === 'object' && c !== null) {
          const cId = String(c._id || c.id || '').trim().toLowerCase();
          const cCode = String(c.branchCode || c.code || '').trim().toLowerCase();
          const cName = String(c.branchName || c.name || '').trim().toLowerCase();
          return (cId && curKeys.has(cId)) || (cCode && curKeys.has(cCode)) || (cName && curKeys.has(cName));
        }
        return false;
      });
    };

    // 1. Staff list - combine live branch staff, global apiUsers for this branch, and activeRestaurant staff
    const allStaffCandidates = [
      ...liveBranchStaff,
      ...(apiUsers || []).filter(u => matchesBranch(u)),
      ...(activeRestaurant?.staff || []).filter(s => matchesBranch(s))
    ];

    const uniqueStaffMap = new Map();
    allStaffCandidates.forEach((person, pIdx) => {
      const pName = String(person.name || person.userName || person.fullName || 'Staff Member').trim();
      const pEmail = String(person.email || person.phoneNumber || person.phone || `${pName.toLowerCase().replace(/\s+/g, '.')}@serviq.in`).trim();
      const key = (person._id || person.id || pEmail || pName).toLowerCase();

      if (!uniqueStaffMap.has(key)) {
        const roleName = person.roleId?.roleName || person.role?.roleName || person.role || person.userType || person.designation || 'Staff';
        const pStatus = (person.status || (person.isActive !== false ? 'Active' : 'Inactive'));
        uniqueStaffMap.set(key, {
          _id: person._id || person.id || `staff-${pIdx}`,
          id: person._id || person.id || `staff-${pIdx}`,
          name: pName,
          role: roleName,
          email: pEmail,
          status: pStatus,
          initial: (pName.charAt(0) || 'S').toUpperCase()
        });
      }
    });

    const mappedStaff = Array.from(uniqueStaffMap.values());

    // Auto-include Branch Manager if assigned to this branch and not yet in list
    const managerName = curBranch?.branchManager || curBranch?.managerName;
    if (managerName && managerName.trim() && !['unassigned', 'null', 'undefined'].includes(managerName.trim().toLowerCase()) && !mappedStaff.some(s => s.name.toLowerCase() === managerName.trim().toLowerCase())) {
      mappedStaff.unshift({
        name: managerName.trim(),
        role: 'Branch Manager',
        email: curBranch.email || `${managerName.toLowerCase().replace(/\s+/g, '.')}@serviq.in`,
        status: 'Active',
        initial: (managerName.trim().charAt(0) || 'M').toUpperCase()
      });
    }

    // 2. Orders list - Merge live branch orders and activeRestaurant orders to display complete history
    const localOrders = (activeRestaurant?.orders || []).filter(o => matchesBranch(o.branchId || o.branch));
    const combinedOrdersMap = new Map();

    localOrders.forEach(ord => {
      const key = String(ord.orderId || ord.id || ord._id || '').toLowerCase();
      if (key) combinedOrdersMap.set(key, ord);
    });

    liveBranchOrders.forEach(ord => {
      const key = String(ord.orderId || ord.id || ord._id || '').toLowerCase();
      if (key) combinedOrdersMap.set(key, ord);
      else combinedOrdersMap.set(`live_ord_${Math.random()}`, ord);
    });

    const branchOrdersRaw = Array.from(combinedOrdersMap.values());
    branchOrdersRaw.sort((a, b) => {
      const timeA = new Date(a.createdAt || a.date || a.timestamp || 0).getTime();
      const timeB = new Date(b.createdAt || b.date || b.timestamp || 0).getTime();
      return timeB - timeA;
    });

    const mappedOrders = branchOrdersRaw.map((ord, idx) => {
      const ordId = ord.orderId || ord.id || (ord._id ? `#${String(ord._id).slice(-5).toUpperCase()}` : `#ORD-${String(idx + 1).padStart(3, '0')}`);
      const tableStr = ord.tableNumber || ord.tableNo || (typeof ord.table === 'object' ? (ord.table?.tableNumber || ord.table?.name) : ord.table) || (typeof ord.tableId === 'object' ? (ord.tableId?.tableNumber || ord.tableId?.name) : ord.tableId) || 'Table 1';
      const itemsStr = Array.isArray(ord.items)
        ? ord.items.map(i => `${i.quantity || i.qty || 1}x ${i.name || i.menuItem?.name || 'Item'}`).join(', ')
        : (typeof ord.items === 'string' ? ord.items : 'Items Ordered');
      const totalAmount = typeof ord.total === 'number' ? `₹${ord.total.toLocaleString('en-IN')}` : (ord.total || '₹0');

      const rawDate = ord.createdAt || ord.date || ord.timestamp;
      const formattedTime = rawDate 
        ? new Date(rawDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'Just now';
      const formattedDate = rawDate
        ? new Date(rawDate).toLocaleDateString([], { day: '2-digit', month: 'short' })
        : 'Today';

      const rawSt = String(ord.status || '').toLowerCase().trim();
      let st = 'preparing';
      let statusLabel = 'Preparing';
      let badgeBg = '#fff7ed';
      let badgeColor = '#c2410c';
      let badgeBorder = '#ffedd5';

      if (rawSt === 'ready' || rawSt === 'ready to serve' || rawSt === 'prepared') {
        st = 'ready';
        statusLabel = 'Ready to Serve';
        badgeBg = '#fefce8';
        badgeColor = '#854d0e';
        badgeBorder = '#fef9c3';
      } else if (rawSt === 'served' || rawSt === 'delivered') {
        st = 'served';
        statusLabel = 'Served';
        badgeBg = '#f0fdf4';
        badgeColor = '#166534';
        badgeBorder = '#dcfce7';
      } else if (rawSt === 'completed' || rawSt === 'paid') {
        st = 'completed';
        statusLabel = 'Completed';
        badgeBg = '#ecfdf5';
        badgeColor = '#047857';
        badgeBorder = '#a7f3d0';
      } else if (rawSt === 'cancelled' || rawSt === 'rejected') {
        st = 'cancelled';
        statusLabel = 'Cancelled';
        badgeBg = '#fef2f2';
        badgeColor = '#b91c1c';
        badgeBorder = '#fecaca';
      } else if (rawSt === 'new' || rawSt === 'pending' || rawSt === 'in queue' || rawSt === 'placed') {
        st = 'new';
        statusLabel = 'New Order';
        badgeBg = '#eff6ff';
        badgeColor = '#1d4ed8';
        badgeBorder = '#bfdbfe';
      }

      const isInQueue = st === 'new' || st === 'preparing' || st === 'ready';

      return {
        id: ordId,
        rawId: ord._id || ord.id,
        table: String(tableStr).startsWith('Table') ? tableStr : `Table ${tableStr}`,
        items: itemsStr,
        total: totalAmount,
        time: `${formattedDate}, ${formattedTime}`,
        status: st,
        statusLabel,
        badgeBg,
        badgeColor,
        badgeBorder,
        isInQueue,
        createdAt: rawDate
      };
    });

    // 3. Tables list
    const branchTablesRaw = (liveBranchTables.length > 0)
      ? liveBranchTables
      : (activeRestaurant?.tables || []).filter(t => matchesBranch(t.branchId || t.branch));

    const mappedTables = branchTablesRaw.length > 0
      ? branchTablesRaw.map((t, i) => {
          const seatingVal = t.seatingCapacity ?? t.seats ?? t.capacity ?? t.tableCapacity ?? 4;
          return {
            _id: t._id || t.id || `tbl-${i + 1}`,
            id: t._id || t.id || `tbl-${i + 1}`,
            name: t.tableNo || t.tableNumber || (t.name ? t.name : `T-${String(i + 1).padStart(2, '0')}`),
            tableNo: t.tableNo || t.tableNumber || (t.name ? t.name : `T-${String(i + 1).padStart(2, '0')}`),
            seats: Number(seatingVal) || 4,
            capacity: Number(seatingVal) || 4,
            seatingCapacity: Number(seatingVal) || 4,
            status: t.status || 'Available',
            floor: t.floor || t.section || 'Main Dining Area',
            qrUrl: t.qrUrl || t.qrCode || '',
            assignedQrId: t.assignedQrId || ''
          };
        })
      : Array.from({ length: currentViewBranch?.totalTables || 10 }).map((_, i) => ({
          _id: `tbl-${i + 1}`,
          id: `tbl-${i + 1}`,
          name: `T-${String(i + 1).padStart(2, '0')}`,
          tableNo: `T-${String(i + 1).padStart(2, '0')}`,
          seats: 4,
          capacity: 4,
          seatingCapacity: 4,
          status: 'Available',
          floor: 'Main Dining Area',
          qrUrl: '',
          assignedQrId: ''
        }));

    // 4. Kitchen KDS stations
    const activeCount = mappedOrders.filter(o => o.status === 'preparing').length;
    const mappedKitchen = [
      {
        name: 'Main Hot Kitchen KDS',
        items: 'Biryani, Curries, Rice Platters, Main Course',
        load: activeCount > 5 ? 'High' : (activeCount > 2 ? 'Medium' : 'Normal'),
        loadPercent: Math.min(100, Math.max(25, activeCount * 18))
      },
      {
        name: 'Grill, Tandoor & Starters KDS',
        items: 'Kebabs, Tandoori, Starters, Fried Items',
        load: activeCount > 4 ? 'Medium' : 'Normal',
        loadPercent: Math.min(100, Math.max(20, activeCount * 14))
      },
      {
        name: 'Beverages & Mocktail Bar KDS',
        items: 'Fresh Juices, Shakes, Mocktails, Hot Teas',
        load: activeCount > 6 ? 'High' : 'Normal',
        loadPercent: Math.min(100, Math.max(15, activeCount * 12))
      },
      {
        name: 'Desserts & Bakery KDS',
        items: 'Ice Creams, Pastries, Puddings, Sweets',
        load: 'Normal',
        loadPercent: Math.min(100, Math.max(10, activeCount * 8))
      }
    ];

    return {
      staff: mappedStaff,
      orders: mappedOrders,
      tables: mappedTables,
      kitchen: mappedKitchen
    };
  })();

  // Operational View Pagination: Tables (10 per page, matching "total": 16, "from": 1, "to": 10, "totalPages": 2, "currentPage": 1)
  const tablesLimit = 10;
  const tablesTotal = liveTablesPagination?.total || opData.tables.length;
  const tablesTotalPages = liveTablesPagination?.totalPages || Math.max(1, Math.ceil(tablesTotal / tablesLimit));
  const tablesCurrentPage = Math.min(tablesPage, tablesTotalPages);
  const tablesFrom = liveTablesPagination?.from || (tablesTotal === 0 ? 0 : (tablesCurrentPage - 1) * tablesLimit + 1);
  const tablesTo = liveTablesPagination?.to || Math.min(tablesCurrentPage * tablesLimit, tablesTotal);

  const paginatedTables = (liveTablesPagination && opData.tables.length <= tablesLimit)
    ? opData.tables
    : opData.tables.slice(
        (tablesCurrentPage - 1) * tablesLimit,
        tablesCurrentPage * tablesLimit
      );

  // Operational View: Orders calculation, filtering & pagination
  const filteredOrders = (opData.orders || []).filter(ord => {
    if (ordersFilter === 'all') return true;
    if (ordersFilter === 'queue') return ord.isInQueue;
    if (ordersFilter === 'preparing') return ord.status === 'preparing';
    if (ordersFilter === 'ready') return ord.status === 'ready';
    if (ordersFilter === 'completed') return ord.status === 'completed' || ord.status === 'served';
    if (ordersFilter === 'cancelled') return ord.status === 'cancelled';
    return true;
  });

  const allOrdersCount = (opData.orders || []).length;
  const inQueueCount = (opData.orders || []).filter(o => o.isInQueue).length;
  const preparingCount = (opData.orders || []).filter(o => o.status === 'preparing').length;
  const readyCount = (opData.orders || []).filter(o => o.status === 'ready').length;
  const completedCount = (opData.orders || []).filter(o => o.status === 'completed' || o.status === 'served').length;
  const cancelledCount = (opData.orders || []).filter(o => o.status === 'cancelled').length;

  const ordersLimit = 10;
  const ordersTotal = filteredOrders.length;
  const ordersTotalPages = Math.max(1, Math.ceil(ordersTotal / ordersLimit));
  const ordersCurrentPage = Math.min(ordersPage, ordersTotalPages);
  const ordersFrom = ordersTotal === 0 ? 0 : (ordersCurrentPage - 1) * ordersLimit + 1;
  const ordersTo = Math.min(ordersCurrentPage * ordersLimit, ordersTotal);

  const paginatedOrders = filteredOrders.slice(
    (ordersCurrentPage - 1) * ordersLimit,
    ordersCurrentPage * ordersLimit
  );

  const handleOrdersPageChange = (newPage) => {
    setOrdersPage(newPage);
  };

  const handleRefreshOrders = async () => {
    if (!currentViewBranch) return;
    setIsRefreshingOrders(true);
    await fetchBranchOperationalData(currentViewBranch);
    if (typeof fetchOrders === 'function') {
      await fetchOrders();
    }
    setTimeout(() => setIsRefreshingOrders(false), 400);
    ShowNotifications.showAlertNotification("Live orders queue refreshed successfully.", true);
  };

  // Operational View: Staff Pagination (8 per page)
  const staffLimit = 10;
  const staffTotal = (opData.staff || []).length;
  const staffTotalPages = Math.max(1, Math.ceil(staffTotal / staffLimit));
  const staffCurrentPage = Math.min(staffPage, staffTotalPages);
  const staffFrom = staffTotal === 0 ? 0 : (staffCurrentPage - 1) * staffLimit + 1;
  const staffTo = Math.min(staffCurrentPage * staffLimit, staffTotal);

  const paginatedStaff = (opData.staff || []).slice(
    (staffCurrentPage - 1) * staffLimit,
    staffCurrentPage * staffLimit
  );

  const handleStaffPageChange = (newPage) => {
    setStaffPage(newPage);
  };

  const handleTablesPageChange = async (newPage) => {
    setTablesPage(newPage);
    if (currentViewBranch && liveTablesPagination) {
      const branchId = currentViewBranch._id || currentViewBranch.id;
      try {
        const res = await TableApi.getTables({ branchId, page: newPage, limit: tablesLimit });
        if (res?.status && res?.response) {
          const d = res.response.data || res.response;
          let list = [];
          if (Array.isArray(d)) list = d;
          else if (Array.isArray(d?.tables)) list = d.tables;
          else if (Array.isArray(d?.data?.tables)) list = d.data.tables;
          else if (Array.isArray(d?.data)) list = d.data;
          if (list.length > 0) setLiveBranchTables(list);
          const pag = res.response.pagination || d.pagination;
          if (pag) setLiveTablesPagination(pag);
        }
      } catch (e) {
        console.warn("Failed to fetch next tables page:", e);
      }
    }
  };

  // ==========================================
  // VIEW 1: REDESIGNED BRANCH VIEW PAGE UI
  // ==========================================
  if (activeView === 'hierarchy') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Top Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '10px',
                width: '38px',
                height: '38px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: '700',
                color: '#0f172a',
                boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                flexShrink: 0
              }}
            >
              ←
            </button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                  {currentViewBranch?.branchName || 'Branch Operational Details'}
                </h2>
                <span style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 800, padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontFamily: 'monospace' }}>
                  {currentViewBranch?.branchCode || 'BR-CHE-01'}
                </span>
                <Badge status={currentViewBranch?.status === 'Active' ? 'Active' : 'Inactive'} />
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Location: {typeof currentViewBranch?.address === 'object' && currentViewBranch?.address !== null ? (currentViewBranch.address.street || currentViewBranch.address.city || 'Main Road') : (currentViewBranch?.address || 'Main Road')}, {currentViewBranch?.city || (typeof currentViewBranch?.address === 'object' ? currentViewBranch.address?.city : '') || 'Chennai'}, {currentViewBranch?.state || (typeof currentViewBranch?.address === 'object' ? currentViewBranch.address?.state : '') || 'Tamil Nadu'}
              </p>
            </div>
          </div>
        </div>

        {/* Full-Width Branch Information Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px 26px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Branch Information
            </h3>
            <button
              type="button"
              onClick={() => handleOpenEditForm(currentViewBranch)}
              style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#0f172a', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', transition: 'all 0.15s ease' }}
              onMouseOver={e => { e.currentTarget.style.background = '#0f172a'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.color = '#0f172a'; }}
            >
              <PencilIcon size={13} /> Edit
            </button>
          </div>

          {/* Clean 4-Column Structured Metadata Row - Perfectly Top-Aligned Headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 0.9fr 1.5fr', gap: '20px', alignItems: 'start', background: '#f8fafc', padding: '16px 22px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
            
            {/* 1. Branch Manager */}
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px', lineHeight: '14px' }}>
                Branch Manager
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)', color: '#fff', fontSize: '15px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 2px 6px rgba(255, 90, 31, 0.2)' }}>
                  {((currentViewBranch?.managerName || currentViewBranch?.branchManager) && (currentViewBranch?.managerName || currentViewBranch?.branchManager).trim() && !['unassigned', 'null', 'undefined'].includes((currentViewBranch?.managerName || currentViewBranch?.branchManager).trim().toLowerCase()) ? (currentViewBranch.managerName || currentViewBranch.branchManager).trim().charAt(0) : 'U').toUpperCase()}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {(!currentViewBranch?.managerName && !currentViewBranch?.branchManager) || ['unassigned', 'null', 'undefined'].includes((currentViewBranch?.managerName || currentViewBranch?.branchManager || '').toLowerCase()) ? 'Unassigned Manager' : (currentViewBranch?.managerName || currentViewBranch?.branchManager)}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: 700, marginTop: '2px' }}>
                    {currentViewBranch?.mobileNumber || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Email Address */}
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px', lineHeight: '14px' }}>
                Email Address
              </span>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                {currentViewBranch?.email || 'N/A'}
              </div>
            </div>

            {/* 3. Opening Date */}
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px', lineHeight: '14px' }}>
                Opening Date
              </span>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', minHeight: '36px', display: 'flex', alignItems: 'center' }}>
                {currentViewBranch?.openingDate || '2026-01-15'}
              </div>
            </div>

            {/* 4. Full Street Address */}
            <div>
              <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '8px', lineHeight: '14px' }}>
                Full Street Address
              </span>
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', lineHeight: 1.4 }}>
                {typeof currentViewBranch?.address === 'object' && currentViewBranch?.address !== null
                  ? `${currentViewBranch.address.street || ''}${currentViewBranch.address.city ? `, ${currentViewBranch.address.city}` : ''}${currentViewBranch.address.state ? `, ${currentViewBranch.address.state}` : ''}${currentViewBranch.address.pincode ? ` - ${currentViewBranch.address.pincode}` : ''}`
                  : `${currentViewBranch?.address || ''}, ${currentViewBranch?.city || ''}, ${currentViewBranch?.state || ''} - ${currentViewBranch?.pincode || ''} (${currentViewBranch?.country || 'India'})`}
              </div>
            </div>

          </div>
        </div>

        {/* Operational Sub-Tabs (Tables, Orders, Staff, Kitchen) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => setOpSubTab('tables')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'tables' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'tables' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tables ({tablesTotal})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('orders')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'orders' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'orders' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Live Orders Queue ({inQueueCount})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('staff')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'staff' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'staff' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Staff ({staffTotal})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('kitchen')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'kitchen' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'kitchen' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Kitchen KDS ({opData.kitchen.length})
            </button>
          </div>

          {/* Sub Tab Content */}
          {opSubTab === 'tables' && (
            <div>
              {/* Sub-tab Header with Count and View Mode Toggle */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>Configured Dining Tables</h4>
                  <span style={{ 
                    background: 'var(--primary-light, #fff0e6)', 
                    color: 'var(--primary, #ff7a00)', 
                    fontSize: '12px', 
                    fontWeight: 700, 
                    padding: '2px 10px', 
                    borderRadius: '20px' 
                  }}>
                    {tablesTotal} Total Tables
                  </span>
                </div>

                {/* View Switcher: Table List / Cards Grid */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setTablesViewMode('table')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: tablesViewMode === 'table' ? '#ffffff' : 'transparent',
                      color: tablesViewMode === 'table' ? '#0f172a' : '#64748b',
                      boxShadow: tablesViewMode === 'table' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>☰</span> Table View
                  </button>
                  <button
                    type="button"
                    onClick={() => setTablesViewMode('grid')}
                    style={{
                      padding: '5px 12px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '12px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      background: tablesViewMode === 'grid' ? '#ffffff' : 'transparent',
                      color: tablesViewMode === 'grid' ? '#0f172a' : '#64748b',
                      boxShadow: tablesViewMode === 'grid' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>⊞</span> Grid View
                  </button>
                </div>
              </div>

              {/* Table / Grid Render */}
              {opData.tables.length === 0 ? (
                <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8', background: '#f8fafc', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                    <TableIcon size={22} color="#64748b" />
                  </div>
                  <div style={{ fontWeight: 700, color: '#475569' }}>No tables configured for this branch</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>Add dining tables in Table Management to see them here.</div>
                </div>
              ) : tablesViewMode === 'table' ? (
                <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                  <div style={{ width: '100%', overflowX: 'auto' }}>
                    <table style={{ width: '100%', minWidth: '700px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
                      <colgroup>
                        <col style={{ width: '10%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '22%' }} />
                        <col style={{ width: '25%' }} />
                        <col style={{ width: '18%' }} />
                      </colgroup>
                      <thead>
                        <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid var(--primary, #ff7a00)' }}>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>#</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Table Name / No</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Seating Capacity</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Floor / Area</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paginatedTables.map((tbl, idx) => {
                          const rowNum = tablesFrom + idx;
                          const isOccupied = String(tbl.status).toLowerCase() === 'occupied';
                          const isReserved = String(tbl.status).toLowerCase() === 'reserved';
                          const statusBg = isOccupied ? '#fef2f2' : (isReserved ? '#fefce8' : '#f0fdf4');
                          const statusColor = isOccupied ? '#dc2626' : (isReserved ? '#ca8a04' : '#16a34a');
                          const statusBorder = isOccupied ? '#fee2e2' : (isReserved ? '#fef08a' : '#dcfce7');

                          return (
                            <tr key={tbl._id || tbl.id || idx} style={{ borderBottom: '1px solid #f1f5f9', background: idx % 2 === 0 ? '#ffffff' : '#fafafa' }}>
                              <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 600 }}>{rowNum}</td>
                              <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                                <span style={{ color: 'var(--primary, #ff7a00)', marginRight: '6px', display: 'inline-flex', verticalAlign: 'middle' }}>
                                  <TableIcon size={15} color="var(--primary, #ff7a00)" />
                                </span>
                                {tbl.name || tbl.tableNo}
                              </td>
                              <td style={{ padding: '12px 16px', color: '#334155', fontWeight: 600 }}>
                                <span style={{ background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                                  <UserIcon size={13} color="#64748b" />
                                  <span>{tbl.seatingCapacity ?? tbl.seats ?? tbl.capacity ?? 4} seats</span>
                                </span>
                              </td>
                              <td style={{ padding: '12px 16px', color: '#64748b', fontWeight: 500 }}>
                                {tbl.floor || 'Main Dining Area'}
                              </td>
                              <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 10px',
                                  borderRadius: '9999px',
                                  fontSize: '11px',
                                  fontWeight: 700,
                                  backgroundColor: statusBg,
                                  color: statusColor,
                                  border: `1px solid ${statusBorder}`
                                }}>
                                  {tbl.status || 'Available'}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '14px' }}>
                  {paginatedTables.map((tbl, i) => {
                    const isOccupied = String(tbl.status).toLowerCase() === 'occupied';
                    const isReserved = String(tbl.status).toLowerCase() === 'reserved';
                    const statusBg = isOccupied ? '#fef2f2' : (isReserved ? '#fefce8' : '#f0fdf4');
                    const statusColor = isOccupied ? '#dc2626' : (isReserved ? '#ca8a04' : '#16a34a');

                    return (
                      <div key={tbl._id || tbl.id || i} style={{ background: '#ffffff', padding: '16px 12px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 2px 6px rgba(0,0,0,0.02)', transition: 'transform 0.15s ease' }}>
                        <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary-light, #fff0e6)', color: 'var(--primary, #ff7a00)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px auto' }}>
                          <TableIcon size={18} color="var(--primary, #ff7a00)" />
                        </div>
                        <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{tbl.name || tbl.tableNo}</div>
                        <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>{tbl.seatingCapacity ?? tbl.seats ?? tbl.capacity ?? 4} seats</div>
                        <div style={{ marginTop: '8px' }}>
                          <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '9999px', fontWeight: 700, background: statusBg, color: statusColor }}>
                            {tbl.status || 'Available'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PAGINATION CONTROLS ("total": 16, "from": 1, "to": 10, "totalPages": 2, "currentPage": 1) */}
              {tablesTotal > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '18px',
                  padding: '12px 18px',
                  background: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
                    Showing <strong style={{ color: '#0f172a' }}>{tablesFrom}</strong> to <strong style={{ color: '#0f172a' }}>{tablesTo}</strong> of <strong style={{ color: '#0f172a' }}>{tablesTotal}</strong> tables (Page {tablesCurrentPage} of {tablesTotalPages})
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleTablesPageChange(Math.max(1, tablesCurrentPage - 1))}
                      disabled={tablesCurrentPage <= 1}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: tablesCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                        color: tablesCurrentPage <= 1 ? '#cbd5e1' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: tablesCurrentPage <= 1 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Prev
                    </button>

                    {Array.from({ length: tablesTotalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleTablesPageChange(pageNum)}
                        style={{
                          minWidth: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: tablesCurrentPage === pageNum ? 700 : 500,
                          border: tablesCurrentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                          background: tablesCurrentPage === pageNum ? '#000000' : '#ffffff',
                          color: tablesCurrentPage === pageNum ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleTablesPageChange(Math.min(tablesTotalPages, tablesCurrentPage + 1))}
                      disabled={tablesCurrentPage >= tablesTotalPages}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: tablesCurrentPage >= tablesTotalPages ? '#f8fafc' : '#ffffff',
                        color: tablesCurrentPage >= tablesTotalPages ? '#cbd5e1' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: tablesCurrentPage >= tablesTotalPages ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {opSubTab === 'orders' && (
            <div style={{ padding: '8px 0' }}>
              {/* Header with Title, Live Indicator & Manual Refresh Button */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                    Live Orders Queue & History
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: inQueueCount > 0 ? '#22c55e' : '#94a3b8', display: 'inline-block' }}></span>
                    <strong style={{ color: '#0f172a' }}>{inQueueCount} Orders</strong> currently in queue • <span style={{ color: '#64748b' }}>{allOrdersCount} total records</span>
                  </div>
                </div>


              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { key: 'all', label: 'All History', count: allOrdersCount },
                  { key: 'queue', label: 'Live Queue', count: inQueueCount },
                  { key: 'preparing', label: 'Preparing', count: preparingCount },
                  { key: 'ready', label: 'Ready to Serve', count: readyCount }
                ].map(chip => {
                  const isSelected = ordersFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => {
                        setOrdersFilter(chip.key);
                        setOrdersPage(1);
                      }}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: isSelected ? '1.5px solid var(--primary)' : '1px solid #e2e8f0',
                        background: isSelected ? 'var(--primary)' : '#ffffff',
                        color: isSelected ? '#ffffff' : '#475569',
                        fontSize: '12px',
                        fontWeight: isSelected ? 800 : 600,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{chip.label}</span>
                      <span style={{
                        padding: '1px 6px',
                        borderRadius: '10px',
                        fontSize: '10px',
                        fontWeight: 800,
                        background: isSelected ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                        color: isSelected ? '#ffffff' : '#64748b'
                      }}>
                        {chip.count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Table */}
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '850px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <colgroup>
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '36%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '14%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Order ID</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Date / Time</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Table</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Ordered Items</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left' }}>Amount</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
                            No orders found matching the selected filter.
                          </td>
                        </tr>
                      ) : (
                        paginatedOrders.map(order => (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)', verticalAlign: 'middle' }}>{order.id}</td>
                            <td style={{ padding: '12px 14px', color: '#64748b', fontSize: '12px', verticalAlign: 'middle' }}>{order.time}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, color: '#0f172a', verticalAlign: 'middle' }}>{order.table}</td>
                            <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 500, verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.items}>{order.items}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', verticalAlign: 'middle' }}>{order.total}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{ 
                                display: 'inline-block', 
                                padding: '4px 10px', 
                                borderRadius: '9999px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                backgroundColor: order.badgeBg, 
                                color: order.badgeColor, 
                                border: `1px solid ${order.badgeBorder}` 
                              }}>
                                {order.statusLabel}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Orders Pagination Controls */}
              {ordersTotal > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  padding: '10px 16px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing <strong>{ordersFrom}</strong> to <strong>{ordersTo}</strong> of <strong>{ordersTotal}</strong> orders (Page {ordersCurrentPage} of {ordersTotalPages})
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOrdersPageChange(Math.max(1, ordersCurrentPage - 1))}
                      disabled={ordersCurrentPage <= 1}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: ordersCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                        color: ordersCurrentPage <= 1 ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: ordersCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Prev
                    </button>
                    {Array.from({ length: ordersTotalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleOrdersPageChange(pageNum)}
                        style={{
                          minWidth: '28px', height: '28px', borderRadius: '6px', fontSize: '12px',
                          fontWeight: ordersCurrentPage === pageNum ? 700 : 500,
                          border: ordersCurrentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                          background: ordersCurrentPage === pageNum ? '#000000' : '#ffffff',
                          color: ordersCurrentPage === pageNum ? '#ffffff' : '#334155', cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleOrdersPageChange(Math.min(ordersTotalPages, ordersCurrentPage + 1))}
                      disabled={ordersCurrentPage >= ordersTotalPages}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: ordersCurrentPage >= ordersTotalPages ? '#f8fafc' : '#ffffff',
                        color: ordersCurrentPage >= ordersTotalPages ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: ordersCurrentPage >= ordersTotalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {opSubTab === 'staff' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                  Assigned Personnel & Roster
                </h4>
                <div style={{ fontSize: '12px', color: '#64748b' }}>
                  {staffTotal} Total Staff Members
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {paginatedStaff.map(person => (
                  <div key={person.name} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                    <div style={{ 
                      width: '40px', 
                      height: '40px', 
                      borderRadius: '50%', 
                      background: person.role === 'Branch Manager' ? 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', 
                      color: '#ffffff', 
                      fontWeight: 800, 
                      fontSize: '15px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      {person.initial}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.name}</h5>
                        <span style={{ 
                          fontSize: '9px', 
                          fontWeight: 700, 
                          color: person.status === 'Active' ? '#166534' : '#854d0e', 
                          background: person.status === 'Active' ? '#f0fdf4' : '#fefce8', 
                          padding: '2px 6px', 
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px'
                        }}>
                          <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: person.status === 'Active' ? '#22c55e' : '#eab308' }}></span>
                          {person.status}
                        </span>
                      </div>
                      <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: '#64748b', fontWeight: 600 }}>{person.role}</p>
                      <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#3b82f6', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{person.email}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Staff Pagination Controls */}
              {staffTotal > 0 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '16px',
                  padding: '10px 16px',
                  background: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}>
                  <div style={{ fontSize: '12px', color: '#64748b' }}>
                    Showing <strong>{staffFrom}</strong> to <strong>{staffTo}</strong> of <strong>{staffTotal}</strong> staff (Page {staffCurrentPage} of {staffTotalPages})
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleStaffPageChange(Math.max(1, staffCurrentPage - 1))}
                      disabled={staffCurrentPage <= 1}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: staffCurrentPage <= 1 ? '#f8fafc' : '#ffffff',
                        color: staffCurrentPage <= 1 ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: staffCurrentPage <= 1 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Prev
                    </button>
                    {Array.from({ length: staffTotalPages }, (_, i) => i + 1).map(pageNum => (
                      <button
                        key={pageNum}
                        type="button"
                        onClick={() => handleStaffPageChange(pageNum)}
                        style={{
                          minWidth: '28px', height: '28px', borderRadius: '6px', fontSize: '12px',
                          fontWeight: staffCurrentPage === pageNum ? 700 : 500,
                          border: staffCurrentPage === pageNum ? 'none' : '1px solid #e2e8f0',
                          background: staffCurrentPage === pageNum ? '#000000' : '#ffffff',
                          color: staffCurrentPage === pageNum ? '#ffffff' : '#334155', cursor: 'pointer'
                        }}
                      >
                        {pageNum}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleStaffPageChange(Math.min(staffTotalPages, staffCurrentPage + 1))}
                      disabled={staffCurrentPage >= staffTotalPages}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: staffCurrentPage >= staffTotalPages ? '#f8fafc' : '#ffffff',
                        color: staffCurrentPage >= staffTotalPages ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: staffCurrentPage >= staffTotalPages ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {opSubTab === 'kitchen' && (
            <div style={{ padding: '8px 0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Kitchen Display System (KDS) Channels</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                {opData.kitchen.map(station => {
                  let progressColor = '#22c55e'; // Green
                  if (station.load === 'High') progressColor = '#ef4444'; // Red
                  else if (station.load === 'Medium') progressColor = '#f59e0b'; // Amber

                  return (
                    <div key={station.name} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.01)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h5 style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>{station.name}</h5>
                        <span style={{ fontSize: '10px', background: '#dcfce7', color: '#15803d', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>Active</span>
                      </div>
                      
                      <div>
                        <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Routed Categories:</span>
                        <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#0f172a', fontWeight: 700 }}>{station.items}</p>
                      </div>

                      <div style={{ marginTop: '4px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px', fontSize: '11px', fontWeight: 700 }}>
                          <span style={{ color: '#475569' }}>Load Status</span>
                          <span style={{ color: progressColor }}>{station.load} ({station.loadPercent}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                          <div style={{ width: `${station.loadPercent}%`, height: '100%', background: progressColor, borderRadius: '3px', transition: 'width 0.5s ease-in-out' }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>

      </div>
    );
  }

  // ==========================================
  // VIEW 2: PAGE STYLE - ADD / EDIT BRANCH FORM
  // ==========================================
  if (activeView === 'form') {
    return (
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Header Card with Back Button */}
        <div style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '24px 32px',
          marginBottom: '24px',
          border: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setActiveView('list')}
              style={{
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 800,
                color: '#0f172a',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
              }}
            >
              ←
            </button>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                {isEditing ? `Edit Branch - ${branchForm.branchName}` : 'Add New Restaurant Branch'}
              </h2>
            </div>
          </div>
        </div>

        {/* Page Style Form Card (noValidate disabled HTML browser popups) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px 36px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleSubmit} noValidate autoComplete="off" style={{ width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              
              {/* Section 1: Basic Information */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  1. Basic Branch Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Field 1: Branch Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Branch Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Serviq Chennai Main Branch"
                      value={branchForm.branchName}
                      onChange={e => {
                        setBranchForm({ ...branchForm, branchName: e.target.value });
                        if (formErrors.branchName) setFormErrors({ ...formErrors, branchName: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.branchName ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.branchName && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.branchName}
                      </span>
                    )}
                  </div>

                  {/* Field 2: Branch Code */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Branch Code <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BR-CHE-01"
                      value={branchForm.branchCode}
                      onChange={e => {
                        setBranchForm({ ...branchForm, branchCode: e.target.value.toUpperCase() });
                        if (formErrors.branchCode) setFormErrors({ ...formErrors, branchCode: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.branchCode ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        fontFamily: 'monospace',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.branchCode && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.branchCode}
                      </span>
                    )}
                  </div>

                  {/* Field 3: Branch Opening Date */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Branch Opening Date <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="date"
                      value={branchForm.openingDate}
                      onChange={e => {
                        setBranchForm({ ...branchForm, openingDate: e.target.value });
                        if (formErrors.openingDate) setFormErrors({ ...formErrors, openingDate: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.openingDate ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.openingDate && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.openingDate}
                      </span>
                    )}
                  </div>

                  {/* Field 4: Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Status
                    </label>
                    <SearchableSelect
                      value={branchForm.status}
                      onChange={e => setBranchForm({ ...branchForm, status: e.target.value })}
                      options={[
                        { value: 'Active', label: 'Active' },
                        { value: 'Inactive', label: 'Inactive' }
                      ]}
                      placeholder="Select Status..."
                    />
                  </div>

                  {/* Field 5: Total Tables Capacity */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Total Tables Capacity <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="number"
                      min="1"
                      placeholder="e.g. 15"
                      value={branchForm.totalTables}
                      onChange={e => {
                        setBranchForm({ ...branchForm, totalTables: Math.max(1, parseInt(e.target.value) || 0) });
                        if (formErrors.totalTables) setFormErrors({ ...formErrors, totalTables: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.totalTables ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.totalTables && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.totalTables}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Manager & Contact */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Branch Manager & Contact Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  
                  {/* Field 5: Manager Name */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Branch Manager Name <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Suresh Kumar"
                      value={branchForm.managerName}
                      onChange={e => {
                        setBranchForm({ ...branchForm, managerName: e.target.value });
                        if (formErrors.managerName) setFormErrors({ ...formErrors, managerName: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.managerName ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.managerName && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.managerName}
                      </span>
                    )}
                  </div>

                  {/* Field 6: Mobile Number (Strict 10 Digits) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Contact Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      value={branchForm.mobileNumber}
                      onChange={e => {
                        const val = sanitizeMobile(e.target.value);
                        setBranchForm({ ...branchForm, mobileNumber: val });
                        if (formErrors.mobileNumber) setFormErrors({ ...formErrors, mobileNumber: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.mobileNumber ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.mobileNumber && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.mobileNumber}
                      </span>
                    )}
                  </div>

                  {/* Field 7: Email Address (Email Format Validation) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Email Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="email"
                      name="branch_mgr_email_field"
                      autoComplete="new-password"
                      autoCorrect="off"
                      spellCheck="false"
                      placeholder="chennai@serviq.com"
                      value={branchForm.email}
                      onChange={e => {
                        setBranchForm({ ...branchForm, email: e.target.value });
                        if (formErrors.email) setFormErrors({ ...formErrors, email: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.email ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.email && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.email}
                      </span>
                    )}
                  </div>

                  {/* Field 8: Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      {isEditing ? 'New Password' : 'Password'} {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ec4899',
                        pointerEvents: 'none'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="branch_mgr_password_field"
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        value={branchForm.password}
                        onChange={e => {
                          setBranchForm({ ...branchForm, password: e.target.value });
                          if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 42px 12px 40px',
                          borderRadius: '8px',
                          border: formErrors.password ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b'
                        }}
                        title={showPassword ? "Hide Password" : "Show Password"}
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Field 9: Confirm Password */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Confirm Password {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '14px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ec4899',
                        pointerEvents: 'none'
                      }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <rect width="18" height="11" x="3" y="11" rx="2" />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                      </span>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="branch_mgr_confirm_password_field"
                        autoComplete="new-password"
                        placeholder="••••••••••••"
                        value={branchForm.confirmPassword}
                        onChange={e => {
                          setBranchForm({ ...branchForm, confirmPassword: e.target.value });
                          if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '12px 42px 12px 40px',
                          borderRadius: '8px',
                          border: formErrors.confirmPassword ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '14px',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#64748b'
                        }}
                        title={showConfirmPassword ? "Hide Password" : "Show Password"}
                      >
                        {showConfirmPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
                      </button>
                    </div>
                    {formErrors.confirmPassword && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.confirmPassword}
                      </span>
                    )}
                  </div>

                </div>
              </div>

              {/* Section 3: Address & Location */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Address & Location
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Street Address <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Connaught Place, T. Nagar"
                      value={branchForm.address}
                      onChange={e => {
                        setBranchForm({ ...branchForm, address: e.target.value });
                        if (formErrors.address) setFormErrors({ ...formErrors, address: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.address ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.address && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.address}
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
                        City <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Chennai"
                        value={branchForm.city}
                        onChange={e => {
                          const val = sanitizeName(e.target.value);
                          setBranchForm({ ...branchForm, city: val });
                          if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.city ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.city && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.city}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
                        State <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Tamil Nadu"
                        value={branchForm.state}
                        onChange={e => {
                          const val = sanitizeName(e.target.value);
                          setBranchForm({ ...branchForm, state: val });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.state ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.state && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.state}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
                        Country <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. India"
                        value={branchForm.country}
                        onChange={e => {
                          const val = sanitizeName(e.target.value);
                          setBranchForm({ ...branchForm, country: val });
                          if (formErrors.country) setFormErrors({ ...formErrors, country: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.country ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.country && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.country}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>
                        Pincode <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="600017"
                        value={branchForm.pincode}
                        onChange={e => {
                          const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 6);
                          setBranchForm({ ...branchForm, pincode: val });
                          if (formErrors.pincode) setFormErrors({ ...formErrors, pincode: '' });
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.pincode ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.pincode && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.pincode}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '28px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveView('list')}
                style={{ padding: '12px 28px', borderRadius: '8px', fontWeight: '600' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-black"
                style={{ padding: '12px 32px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 700 }}
              >
                {isEditing ? 'Save Branch Changes' : 'Create Branch'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 3: MAIN BRANCH LIST VIEW
  // ==========================================
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* 1. Header & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
            Branch List
          </h2>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {hasPermission('branch-management', 'add') && (
            branches.length >= totalAllowedBranches ? (
              <button
                type="button"
                className="btn"
                onClick={handleOpenAddForm}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '10px',
                  background: '#ea580c',
                  color: '#fff',
                  fontSize: '13px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
                title={`Branch limit reached (${branches.length}/${totalAllowedBranches}). Click to upgrade plan or purchase branch slots.`}
              >
                🔒 Branch Limit Reached ({branches.length}/{totalAllowedBranches})
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-black"
                onClick={handleOpenAddForm}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700 }}
              >
                + Add New Branch
              </button>
            )
          )}
        </div>
      </div>

      {/* 2. Branch Quota & Plan Status Banner */}
      <div style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--primary-light)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <TreeIcon size={20} color="var(--primary)" />
          </div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>
              Subscription Tier: <span style={{ color: 'var(--primary)' }}>{planName} Plan (Max {baseBranchLimit} Outlets)</span>
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
              Branch Capacity: <strong>{branches.length}</strong> of <strong>{totalAllowedBranches}</strong> Outlets Permitted
              {remainingBranchSlots === 0 ? (
                <span style={{ color: '#ef4444', fontWeight: 700, marginLeft: '6px' }}>• (0 Slots Remaining)</span>
              ) : (
                <span style={{ color: '#10b981', fontWeight: 700, marginLeft: '6px' }}>• ({remainingBranchSlots} Slot{remainingBranchSlots > 1 ? 's' : ''} Available)</span>
              )}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setIsPlanLimitModalOpen(true)}
            style={{ border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', padding: '8px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            + Buy Branch Slot (₹{extraBranchUnitPrice}/mo)
          </button>
          <button
            type="button"
            onClick={() => navigate('/plans-management')}
            style={{ border: 'none', background: 'var(--primary-light)', color: 'var(--primary)', padding: '8px 16px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}
          >
            Manage Plan Quotas →
          </button>
        </div>
      </div>


      {/* 3. Search & Filter Bar */}
      <div style={{ background: '#fff', padding: '16px 20px', borderRadius: '14px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
            <input
              type="text"
              placeholder="Search branch name, code, manager, city..."
              value={searchTerm}
              onKeyDown={e => {
                if (e.key === ' ' && !e.currentTarget.value) {
                  e.preventDefault();
                }
              }}
              onChange={e => {
                const val = e.target.value.replace(/^\s+/, '');
                setSearchTerm(val);
              }}
              style={{ width: '100%', height: '38px', padding: '0 16px 0 38px', borderRadius: '8px', border: '1.5px solid var(--border)', fontSize: '13px', outline: 'none', boxSizing: 'border-box' }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '200px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Status:</span>
          <div style={{ flex: 1 }}>
            <SearchableSelect
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              options={[
                { value: 'All', label: 'All Status' },
                { value: 'Active', label: 'Active Only' },
                { value: 'Inactive', label: 'Inactive Only' }
              ]}
              placeholder="Filter Status..."
            />
          </div>
        </div>
      </div>

      {/* 4. Branch List Table */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Branch Code</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Branch Name</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Location</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Manager</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Contact</th>
              <th style={{ padding: '14px 10px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Status</th>
              <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#000000' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No branches found matching your search.
                </td>
              </tr>
            ) : (
              paginatedBranches.map(b => (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* 1. Branch Code */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', display: 'inline-block' }}>
                      {b.branchCode}
                    </span>
                  </td>

                  {/* 2. Branch Name */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span>{b.branchName}</span>
                        {b.isMainBranch && (
                          <span style={{ fontSize: '10px', background: '#fef3c7', color: '#d97706', padding: '1px 6px', borderRadius: '4px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '2px', border: '1px solid #fde68a', flexShrink: 0 }} title="Main Branch">
                            ★ Main
                          </span>
                        )}
                      </div>
                      {b.address && (
                        <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.4' }}>
                          {typeof b.address === 'object' && b.address !== null
                            ? (b.address.street || b.address.city || '')
                            : b.address}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 3. Location */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ color: '#334155', fontWeight: 600, fontSize: '13px', lineHeight: '1.4' }}>
                      {b.city ? `${b.city}${b.state ? `, ${b.state}` : ''}` : (b.state || 'Not Specified')}
                    </div>
                  </td>

                  {/* 4. Manager */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(() => {
                        const raw = (b.managerName || b.branchManager || b.manager || '').trim();
                        const isUnassigned = !raw || ['unassigned', 'null', 'undefined', 'none', '-'].includes(raw.toLowerCase());
                        const managerDisplayName = isUnassigned ? 'Unassigned' : raw;
                        const initialLetter = isUnassigned ? 'U' : managerDisplayName.charAt(0).toUpperCase();

                        return (
                          <>
                            <span style={{
                              width: '28px',
                              height: '28px',
                              minWidth: '28px',
                              minHeight: '28px',
                              borderRadius: '50%',
                              background: isUnassigned ? '#f1f5f9' : '#e0e7ff',
                              color: isUnassigned ? '#64748b' : '#4338ca',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 800,
                              flexShrink: 0,
                              lineHeight: 1
                            }}>
                              {initialLetter}
                            </span>
                            <span style={{ fontWeight: 600, color: isUnassigned ? '#64748b' : '#1e293b', fontSize: '13px', lineHeight: '1.4' }}>
                              {managerDisplayName}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  </td>

                  {/* 5. Contact */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px', whiteSpace: 'nowrap' }}>
                        {b.mobileNumber || 'N/A'}
                      </div>
                      {b.email && (
                        <div style={{ fontSize: '11px', color: '#64748b', wordBreak: 'break-all' }}>
                          {b.email}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* 6. Status */}
                  <td style={{ padding: '14px 10px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Badge status={b.status === 'Active' ? 'Active' : 'Inactive'} />
                    </div>
                  </td>

                  {/* 7. Actions */}
                  <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      <button
                        type="button"
                        title="View Operational Details"
                        onClick={() => handleOpenHierarchy(b)}
                        style={{ border: 'none', background: '#eff6ff', color: '#2563eb', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                      >
                        <EyeIcon size={14} />
                      </button>

                      {hasPermission('branch-management', 'edit') && (
                        <button
                          type="button"
                          title="Edit Branch"
                          onClick={() => handleOpenEditForm(b)}
                          style={{ border: 'none', background: '#f1f5f9', color: '#475569', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#0f172a'; e.currentTarget.style.background = '#e2e8f0'; }}
                          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; e.currentTarget.style.background = '#f1f5f9'; }}
                        >
                          <PencilIcon size={14} />
                        </button>
                      )}

                      {hasPermission('branch-management', 'delete') && (
                        <button
                          type="button"
                          title="Delete Branch"
                          onClick={() => handleDeleteBranchClick(b)}
                          style={{ border: 'none', background: '#fef2f2', color: '#ef4444', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {filteredBranches.length > 0 && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 500 }}>
            Showing {filteredBranches.length === 0 ? 0 : page * limit + 1} to {Math.min((page + 1) * limit, filteredBranches.length)} of {filteredBranches.length} branches
          </div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: page === 0 ? '#f8fafc' : '#ffffff',
                color: page === 0 ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: page === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Prev
            </button>

            {getPageNumbers().map(pageNum => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setPage(pageNum - 1)}
                style={{
                  minWidth: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: page + 1 === pageNum ? 700 : 500,
                  border: page + 1 === pageNum ? 'none' : '1px solid #e2e8f0',
                  background: page + 1 === pageNum ? '#000000' : '#ffffff',
                  color: page + 1 === pageNum ? '#ffffff' : '#334155',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || totalPages === 0}
              style={{
                padding: '6px 14px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                background: (page >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                color: (page >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155',
                fontSize: '13px',
                fontWeight: 600,
                cursor: (page >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* 5. DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        title="Confirm Branch Deletion"
        maxWidth="450px"
      >
        <div style={{ marginTop: '10px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-main)' }}>
            Are you sure you want to delete branch <strong>"{branchToDelete?.branchName}"</strong> ({branchToDelete?.branchCode})?
          </p>
          <p style={{ fontSize: '12px', color: '#ef4444', background: '#fef2f2', padding: '10px 12px', borderRadius: '8px' }}>
            Warning: This action cannot be undone.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setBranchToDelete(null)}
              style={{ padding: '8px 18px' }}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-black"
              onClick={handleDeleteConfirm}
              style={{ padding: '8px 20px', background: '#dc2626', color: '#fff' }}
            >
              Delete Branch
            </button>
          </div>
        </div>
      </Modal>

      {/* 6. BRANCH LIMIT EXCEEDED / ADD-ON REQUIRED MODAL */}
      {isPlanLimitModalOpen && (
        <Modal
          isOpen={isPlanLimitModalOpen}
          onClose={() => !isProcessingSlotPayment && setIsPlanLimitModalOpen(false)}
          title="Branch Subscription Quota Reached"
          maxWidth="520px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', paddingTop: '10px' }}>
            <div style={{ textAlign: 'center', padding: '18px', background: '#fff7ed', borderRadius: '12px', border: '1px solid #fed7aa' }}>
              <div style={{ fontSize: '32px', marginBottom: '4px' }}>🏢</div>
              <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: 800, color: '#c2410c' }}>
                Branch Capacity Reached
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#9a3412', lineHeight: 1.4 }}>
                Your current <strong>{planName} Plan</strong> allows up to <strong>{totalAllowedBranches} branch outlet{totalAllowedBranches > 1 ? 's' : ''}</strong> ({branches.length} currently in use).
              </p>
            </div>

            {/* Plan Calculation Breakdown */}
            <div style={{ background: '#f8fafc', padding: '16px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Active Branch Count:</span>
                <strong style={{ color: '#0f172a' }}>{branches.length} Outlets</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Included in Plan:</span>
                <strong style={{ color: '#0f172a' }}>{baseBranchLimit} Outlets</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>Additional Branch Charge:</span>
                <strong style={{ color: '#0f172a' }}>₹{extraBranchUnitPrice} / month</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                <span>GST (18%):</span>
                <strong style={{ color: '#0f172a' }}>₹{Math.round(extraBranchUnitPrice * 0.18)}</strong>
              </div>
              <div style={{ marginTop: '6px', paddingTop: '10px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '14px' }}>Total to Activate 1 Branch Slot:</span>
                <span style={{ fontSize: '18px', fontWeight: 900, color: 'var(--primary)', fontFamily: "'Outfit', sans-serif" }}>
                  ₹{extraBranchTotalWithGst.toLocaleString()}
                </span>
              </div>
            </div>

            <p style={{ margin: 0, fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
              To add branch #{branches.length + 1}, purchase an additional branch add-on slot or upgrade your subscription plan.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setIsPlanLimitModalOpen(false)}
                disabled={isProcessingSlotPayment}
                style={{ padding: '9px 16px', borderRadius: '8px', fontWeight: 600, fontSize: '13px' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsPlanLimitModalOpen(false);
                  navigate('/plans-management');
                }}
                disabled={isProcessingSlotPayment}
                style={{ padding: '9px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', color: '#0f172a', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}
              >
                View Plans
              </button>
              <button
                type="button"
                className="btn btn-black"
                onClick={handlePayAndUnlockBranchSlot}
                disabled={isProcessingSlotPayment}
                style={{ padding: '9px 20px', borderRadius: '8px', background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '13px' }}
              >
                {isProcessingSlotPayment ? 'Processing...' : `Pay ₹${extraBranchTotalWithGst} & Add Branch`}
              </button>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
}
