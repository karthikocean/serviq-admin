import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BranchApi from '../api/Branch.js';
import SubscriptionApi from '../api/Subscription.js';
import UserApi from '../api/User.js';
import OrderApi from '../api/Order.js';
import TableApi from '../api/Table.js';
import MenuApi from '../api/Menu.js';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { Badge } from './Badge';
import { Modal } from './Modal';
import DeleteConfirmationModal, { ToggleRightIcon, ToggleLeftIcon, UnlockIcon, LockIcon } from './DeleteConfirmationModal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import { OtpPasswordInput } from './OtpPasswordInput';
import PasswordRequirements from './common/PasswordRequirements';
import { 
  resolveBranchManagerName, 
  resolveBranchContactNumber,
  getUserAssignedBranchId,
  isUserCompanyUser,
  isBranchMatch
} from '../helper/BranchHelper.js';
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
  validatePassword,
  validateGstin
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

const BuildingStoreIcon = ({ size = 16, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
    <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
    <path d="M2 7h20" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const MapPinIcon = ({ size = 12, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
    <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
    <circle cx="12" cy="10" r="3" />
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
const KeyIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15.5 7.5 2.3 2.3a1 1 0 0 0 1.4 0l2.1-2.1a1 1 0 0 0 0-1.4L19 4.1a1 1 0 0 0-1.4 0l-2.1 2.1a1 1 0 0 0 0 1.3Z" />
    <path d="m15.5 7.5-3 3" />
    <path d="M10.5 12.5 3 20v1a1 1 0 0 0 1 1h1v-1a1 1 0 0 1 1-1h1v-1a1 1 0 0 1 1-1h1v-1a1 1 0 0 1 1-1h1v-1a1 1 0 0 0 0-1.4l-1.5-1.6" />
  </svg>
);

const PowerIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2v10" />
    <path d="M18.4 6.6a9 9 0 1 1-12.8 0" />
  </svg>
);

const saveBranchMetadataToStorage = (branchId, data, branchCode = '') => {
  if (!branchId && !branchCode) return;
  try {
    const existing = JSON.parse(localStorage.getItem('serviq_branch_metadata') || '{}');
    const idKey = branchId ? String(branchId) : '';
    const codeKey = branchCode ? String(branchCode).trim().toUpperCase() : '';
    const metadataToSave = {
      ...(idKey && existing[idKey] ? existing[idKey] : {}),
      ...(codeKey && existing[codeKey] ? existing[codeKey] : {}),
      ...data
    };
    if (idKey) existing[idKey] = metadataToSave;
    if (data?.id) existing[String(data.id)] = metadataToSave;
    if (data?._id) existing[String(data._id)] = metadataToSave;
    if (codeKey) existing[codeKey] = metadataToSave;
    if (data?.branchCode) existing[String(data.branchCode).trim().toUpperCase()] = metadataToSave;
    if (data?.code) existing[String(data.code).trim().toUpperCase()] = metadataToSave;
    localStorage.setItem('serviq_branch_metadata', JSON.stringify(existing));
  } catch (e) {}
};

const getBranchMetadataFromStorage = (branchId, branchCode = '') => {
  try {
    const existing = JSON.parse(localStorage.getItem('serviq_branch_metadata') || '{}');
    const idKey = branchId ? String(branchId) : '';
    const codeKey = branchCode ? String(branchCode).trim().toUpperCase() : '';
    const byId = idKey ? (existing[idKey] || {}) : {};
    const byCode = codeKey ? (existing[codeKey] || {}) : {};
    return { ...byCode, ...byId };
  } catch (e) {
    return {};
  }
};

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
  billPrefix: '',
  isMainBranch: false,
  useCustomMenu: false
};

export default function BranchManagementPanel({ hasPermission: hasPermissionProp }) {
  const navigate = useNavigate();
  const { currentUser, activeRestaurant, selectedBranchId, addBranch, updateBranch, deleteBranch, purchaseExtraBranchSlots, fetchOrders, hasPermission: contextHasPermission } = useAppState();

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
          Branch Management is restricted to Restaurant Owners only.
        </p>
        <Link to="/dashboard" style={{ display: 'inline-block', background: 'var(--primary)', color: '#ffffff', padding: '10px 24px', borderRadius: '8px', textDecoration: 'none', fontWeight: 700, fontSize: '14px' }}>
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const storedBranchId = (() => {
    try {
      return sessionStorage.getItem('selectedBranchId') || '';
    } catch (e) {
      return '';
    }
  })();

  const userAssignedBranchId = getUserAssignedBranchId(currentUser);
  const isCompany = isUserCompanyUser(currentUser);
  const isBranchLogin = !isCompany && Boolean(userAssignedBranchId);
  const effectiveSelectedBranch = selectedBranchId || storedBranchId;
  const cleanSelectedBranch = (effectiveSelectedBranch && effectiveSelectedBranch !== 'ALL' && effectiveSelectedBranch !== 'All' && String(effectiveSelectedBranch).toUpperCase() !== 'COMPANY' && String(effectiveSelectedBranch).toLowerCase() !== 'all branches') ? effectiveSelectedBranch : null;

  // Active branch context if logged in to a branch or if a specific branch is selected
  const activeBranchContextId = isBranchLogin 
    ? userAssignedBranchId 
    : (cleanSelectedBranch || (!isCompany ? (currentUser?.branchName || currentUser?.branch) : null));

  const isBranchCurrentActive = (b) => {
    if (!activeBranchContextId) return false;
    if (isBranchMatch(b, activeBranchContextId)) return true;
    if (userAssignedBranchId && isBranchMatch(b, userAssignedBranchId)) return true;
    if (cleanSelectedBranch && isBranchMatch(b, cleanSelectedBranch)) return true;
    if (currentUser?.branchName && isBranchMatch(b, currentUser.branchName)) return true;
    if (currentUser?.branch && typeof currentUser.branch === 'object' && isBranchMatch(b, currentUser.branch)) return true;
    if (currentUser?.email && b?.email && String(currentUser.email).toLowerCase() === String(b.email).toLowerCase()) return true;
    if (currentUser?.username && b?.username && String(currentUser.username).toLowerCase() === String(b.username).toLowerCase()) return true;
    return false;
  };

  const [activeView, setActiveView] = useState('list'); // 'list' | 'form' | 'hierarchy'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Form state & Validation Errors state
  const [branchForm, setBranchForm] = useState(initialBranchState);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showEditPasswordFields, setShowEditPasswordFields] = useState(false);

  // Subscription Quota & Plan Limit Modal state
  const [isPlanLimitModalOpen, setIsPlanLimitModalOpen] = useState(false);
  const [isProcessingSlotPayment, setIsProcessingSlotPayment] = useState(false);

  // View page operational sub-tab state
  const [selectedBranchForTree, setSelectedBranchForTree] = useState(null);
  const [opSubTab, setOpSubTab] = useState('tables');
  const viewTopRef = useRef(null);

  // Auto-scroll to top ONLY ONCE when switching into branch view page or form
  const lastScrolledViewRef = useRef('');

  useEffect(() => {
    if ((activeView === 'hierarchy' || activeView === 'form') && lastScrolledViewRef.current !== activeView) {
      lastScrolledViewRef.current = activeView;
      const resetScrollToTop = () => {
        const contentBody = document.querySelector('.content-body');
        if (contentBody) contentBody.scrollTop = 0;
        const mainContent = document.querySelector('.main-content');
        if (mainContent) mainContent.scrollTop = 0;
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      };

      resetScrollToTop();
      const timer = setTimeout(resetScrollToTop, 50);
      return () => clearTimeout(timer);
    } else if (activeView === 'list') {
      lastScrolledViewRef.current = 'list';
    }
  }, [activeView]);

  // Delete modal state
  const [branchToDelete, setBranchToDelete] = useState(null);

  // Reset password modal state
  const [resetPasswordBranch, setResetPasswordBranch] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetPasswordError, setResetPasswordError] = useState('');
  const [resetPasswordErrors, setResetPasswordErrors] = useState({ newPassword: '', confirmPassword: '', general: '' });
  const [isSavingResetPassword, setIsSavingResetPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [showResetConfirmPassword, setShowResetConfirmPassword] = useState(false);

  const [apiBranches, setApiBranches] = useState([]);
  const [apiUsers, setApiUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [liveBranchStaff, setLiveBranchStaff] = useState([]);
  const [liveBranchOrders, setLiveBranchOrders] = useState([]);
  const [liveBranchTables, setLiveBranchTables] = useState([]);
  const [liveBranchCategories, setLiveBranchCategories] = useState([]);
  const [isLoadingOpData, setIsLoadingOpData] = useState(false);

  // View page operational tables & orders & staff & kitchen pagination & filters
  const [tablesPage, setTablesPage] = useState(0);
  const [tablesViewMode, setTablesViewMode] = useState('table'); // 'table' | 'grid'
  const [liveTablesPagination, setLiveTablesPagination] = useState(null);
  const [ordersPage, setOrdersPage] = useState(0);
  const [ordersFilter, setOrdersFilter] = useState('all'); // 'all' | 'queue' | 'preparing' | 'ready' | 'completed' | 'cancelled'
  const [staffPage, setStaffPage] = useState(0);
  const [kdsPage, setKdsPage] = useState(0);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [liveOrdersPagination, setLiveOrdersPagination] = useState(null);
  const [page, setPage] = useState(0);
  const [totalBranchRecords, setTotalBranchRecords] = useState(0);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const branchParams = {
        search: searchTerm ? searchTerm.trim() : undefined,
        status: statusFilter !== 'All' ? statusFilter : undefined,
        page: page,
        limit: 10
      };
      const [res, usersRes] = await Promise.allSettled([
        BranchApi.getBranches(branchParams),
        UserApi.getUsers({ limit: 10 })
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
          const contactNum = resolveBranchContactNumber(b, usersList, staffList);
          const resolvedMgr = (mgr && mgr !== 'Unassigned') ? mgr : ((b.managerName && b.managerName !== 'Unassigned') ? b.managerName : ((b.branchManager && b.branchManager !== 'Unassigned') ? b.branchManager : 'Unassigned'));

          const addr = typeof b.address === 'object' && b.address !== null ? b.address : {};
          const streetStr = typeof b.address === 'string' ? b.address : (addr.street || b.street || '');
          const cityStr = b.city || addr.city || '';
          const stateStr = b.state || addr.state || '';
          const countryStr = b.country || addr.country || '';
          const pincodeStr = b.pincode || addr.pincode || '';

          const bCodeStr = b.branchCode || b.code || '';
          const meta = getBranchMetadataFromStorage(bId, bCodeStr);
          const resolvedGst = b.gstNumber || b.gstinNumber || b.gstin || b.taxId || b.taxNumber || meta.gstNumber || meta.gstinNumber || meta.gstin || '';
          const resolvedFssai = b.fssaiNumber || b.fssaiLicense || b.fssai || b.fssaiNo || meta.fssaiNumber || meta.fssaiLicense || '';
          const autoCodePref = bCodeStr ? `${String(bCodeStr).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-` : 'INV-';
          let resolvedBillPrefix = b.billPrefix || b.invoicePrefix || b.billingPrefix || b.prefix || meta.billPrefix || meta.invoicePrefix || '';
          if (resolvedBillPrefix && (resolvedBillPrefix === autoCodePref || resolvedBillPrefix === `${bCodeStr}-` || resolvedBillPrefix === 'INV-')) {
            resolvedBillPrefix = '';
          }

          return {
            id: bId,
            _id: bId,
              rawManagerId: b.managerId || b.branchManagerId || b.userId || b.adminId || (typeof b.manager === 'object' ? (b.manager?._id || b.manager?.id) : b.manager) || '',
              managerId: b.managerId || b.branchManagerId || b.userId || b.adminId || '',
              branchName: b.branchName || b.name || '',
              branchCode: b.branchCode || b.code || '',
              branchManager: resolvedMgr,
              managerName: resolvedMgr,
              mobileNumber: contactNum !== 'N/A' ? contactNum : (b.contactNumber || b.mobileNumber || b.phone || b.managerMobile || ''),
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
              totalTables: b.totalTables || b.tablesCount || b.capacity || b.seatingCapacity || b.tableCount || (Array.isArray(b.tables) && b.tables.length > 0 ? b.tables.length : 0) || meta.totalTables || meta.tablesCount || meta.capacity || 10,
              gstNumber: resolvedGst,
              gstinNumber: resolvedGst,
              gstin: resolvedGst,
              fssaiNumber: resolvedFssai,
              fssaiLicense: resolvedFssai,
              fssai: resolvedFssai,
              billPrefix: resolvedBillPrefix,
              invoicePrefix: resolvedBillPrefix,
              isMainBranch: Boolean(b.isMainBranch || b.branchType === 'MAIN' || b.type === 'MAIN' || meta.isMainBranch),
              useCustomMenu: Boolean(b.useCustomMenu ?? b.customMenu ?? b.hasCustomMenu ?? meta.useCustomMenu ?? meta.customMenu ?? false)
            };
        });
        setApiBranches(mappedBranches);
        const serverTotal = branchResponse.response?.pagination?.total 
          ?? branchResponse.response?.total 
          ?? branchResponse.response?.totalRecords 
          ?? branchResponse.response?.count 
          ?? (branchResponse.response?.data?.total || mappedBranches.length);
        setTotalBranchRecords(Number(serverTotal) || mappedBranches.length);
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
      const [branchDetailsRes, usersRes, globalUsersRes, ordersRes, tablesRes, categoriesRes] = await Promise.allSettled([
        BranchApi.getBranchDetails(branchId),
        UserApi.getUsers({ branchId, limit: 10 }),
        UserApi.getUsers({ limit: 10}),
        OrderApi.getOrders({ branchId, limit: 10}),
        TableApi.getTables({ branchId, limit: 10}),
        MenuApi.getCategories({ limit: 10 })
      ]);

      if (branchDetailsRes.status === 'fulfilled' && branchDetailsRes.value?.status && branchDetailsRes.value?.response) {
        const d = branchDetailsRes.value.response.data || branchDetailsRes.value.response.branch || branchDetailsRes.value.response;
        if (d && typeof d === 'object') {
          const gst = d.gstNumber || d.gstinNumber || d.gstin || d.taxId || d.taxNumber || '';
          const fssai = d.fssaiNumber || d.fssaiLicense || d.fssai || d.fssaiNo || '';
          const bPref = d.billPrefix || d.invoicePrefix || d.billingPrefix || '';
          setSelectedBranchForTree(prev => {
            if (!prev) return prev;
            const newGst = gst || prev.gstNumber || '';
            const newFssai = fssai || prev.fssaiNumber || '';
            const newPref = bPref || prev.billPrefix || '';
            if (
              prev.gstNumber === newGst &&
              prev.fssaiNumber === newFssai &&
              prev.billPrefix === newPref &&
              (!d.email || prev.email === d.email) &&
              (!d.mobileNumber || prev.mobileNumber === d.mobileNumber) &&
              (!d.branchManager || prev.branchManager === d.branchManager)
            ) {
              return prev;
            }
            return {
              ...prev,
              ...d,
              ...(newGst ? { gstNumber: newGst, gstinNumber: newGst, gstin: newGst } : {}),
              ...(newFssai ? { fssaiNumber: newFssai, fssaiLicense: newFssai, fssai: newFssai } : {}),
              ...(newPref ? { billPrefix: newPref, invoicePrefix: newPref } : {})
            };
          });
        }
      }

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

      if (categoriesRes.status === 'fulfilled' && categoriesRes.value?.status) {
        const resp = categoriesRes.value.response;
        const d = resp?.data || resp;
        let catList = [];
        if (Array.isArray(d)) catList = d;
        else if (Array.isArray(d?.categories)) catList = d.categories;
        else if (Array.isArray(d?.data)) catList = d.data;
        else if (Array.isArray(resp?.categories)) catList = resp.categories;
        if (catList.length > 0) {
          setLiveBranchCategories(catList);
        }
      }
    } catch (e) {
      console.error("Error fetching branch operational data:", e);
    } finally {
      setIsLoadingOpData(false);
    }
  }, []);

  const [subDashboard, setSubDashboard] = useState(null);
  const [livePlansList, setLivePlansList] = useState([]);

  const fetchLiveSubscription = useCallback(async () => {
    try {
      const [dashRes, plansRes] = await Promise.allSettled([
        SubscriptionApi.getDashboard(),
        SubscriptionApi.getPlans()
      ]);

      if (dashRes.status === 'fulfilled' && dashRes.value?.status && dashRes.value?.response) {
        setSubDashboard(dashRes.value.response.data || dashRes.value.response);
      }

      if (plansRes.status === 'fulfilled' && plansRes.value?.status && plansRes.value?.response) {
        const rawPlans = Array.isArray(plansRes.value.response?.data) 
          ? plansRes.value.response.data 
          : (Array.isArray(plansRes.value.response) ? plansRes.value.response : (plansRes.value.response?.plans || []));
        if (rawPlans.length > 0) {
          setLivePlansList(rawPlans);
        }
      }
    } catch (err) {
      console.warn("BranchManagementPanel: Failed to fetch subscription dashboard or plans", err);
    }
  }, []);

  useEffect(() => {
    setPage(0);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    if (isRestaurantOwner) {
      const timer = setTimeout(() => {
        fetchBranches();
      }, 300);
      fetchLiveSubscription();
      return () => clearTimeout(timer);
    }
  }, [isRestaurantOwner, searchTerm, statusFilter, page, fetchLiveSubscription]);

  // Listen to plan updates across modules
  useEffect(() => {
    const handlePlanUpdate = () => {
      fetchLiveSubscription();
    };
    window.addEventListener('plan_updated', handlePlanUpdate);
    window.addEventListener('storage', handlePlanUpdate);
    return () => {
      window.removeEventListener('plan_updated', handlePlanUpdate);
      window.removeEventListener('storage', handlePlanUpdate);
    };
  }, [fetchLiveSubscription]);

  const branches = (apiBranches && apiBranches.length > 0)
    ? apiBranches
    : (activeRestaurant?.branches || []);

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
  const rawPlanName = activePlanData?.planName || activeRestaurant?.subscription?.planName || activeRestaurant?.plan || currentUser?.subscription?.planName || currentUser?.plan || 'Standard';
  const cleanPlanName = String(rawPlanName).replace(/^plan-/i, '').replace(/\s*plan$/i, '').trim() || 'Standard';
  const planName = cleanPlanName;

  // Matched live plan from Super Admin
  const matchedLivePlan = livePlansList.find(p => {
    const pName = String(p.planName || p.name || '').toLowerCase().replace(/\s*plan$/i, '').trim();
    return pName === planName.toLowerCase() || p._id === sub.planId || p.id === sub.planId;
  });

  // Base limit dynamically derived from Super Admin backend plan, active restaurant, or saved plan
  const baseBranchLimit = Number(
    matchedLivePlan?.maxBranches ??
    matchedLivePlan?.branchLimit ??
    matchedLivePlan?.baseBranchLimit ??
    matchedLivePlan?.branchCapacity ??
    matchedLivePlan?.allowedBranches ??
    matchedLivePlan?.maxOutlets ??
    activePlanData?.baseBranchLimit ??
    activePlanData?.maxBranches ??
    activePlanData?.branchLimit ??
    activePlanData?.branchCapacity ??
    activePlanData?.allowedBranches ??
    activePlanData?.maxOutlets ??
    branchCap?.baseLimit ??
    branchCap?.base ??
    branchCap?.maxBranches ??
    branchCap?.branchLimit ??
    branchCap?.branchCapacity ??
    branchCap?.capacity ??
    activeRestaurant?.subscription?.baseBranchLimit ??
    activeRestaurant?.subscription?.maxBranches ??
    activeRestaurant?.subscription?.branchLimit ??
    savedPlanInfo?.baseBranchLimit ??
    savedPlanInfo?.maxBranches ??
    sub.baseBranchLimit ??
    sub.maxBranches ??
    getPlanBranchLimit(planName, 5)
  );

  const extraBranchSlots = Number(
    activeRestaurant?.subscription?.extraBranchSlots !== undefined
      ? activeRestaurant.subscription.extraBranchSlots
      : (branchCap?.extraSlots !== undefined 
          ? branchCap.extraSlots 
          : (branchCap?.addons !== undefined ? branchCap.addons : (sub.extraBranchSlots || 0)))
  );

  const totalAllowedBranches = baseBranchLimit + extraBranchSlots;
  const remainingBranchSlots = Math.max(0, totalAllowedBranches - branches.length);
  const extraBranchUnitPrice = extraRate?.rate !== undefined 
    ? extraRate.rate 
    : (sub.extraBranchPrice || (planName.toLowerCase().includes('premium') ? 499 : (planName.toLowerCase().includes('basic') ? 799 : 699)));
  const extraBranchTotalWithGst = Math.round(extraBranchUnitPrice * 1.18);

  // Branches filtered by status and search term
  const filteredBranches = useMemo(() => {
    return (branches || []).filter(b => {
      if (statusFilter && statusFilter !== 'All') {
        const bStatus = String(b.status || 'Active').toLowerCase();
        if (bStatus !== statusFilter.toLowerCase()) return false;
      }
      if (searchTerm && searchTerm.trim()) {
        const q = searchTerm.trim().toLowerCase();
        const bName = String(b.branchName || b.name || '').toLowerCase();
        const bCode = String(b.branchCode || b.code || '').toLowerCase();
        const bMgr = String(b.managerName || b.branchManager || '').toLowerCase();
        const bCity = String(b.city || '').toLowerCase();
        const bPhone = String(b.mobileNumber || b.contactNumber || '').toLowerCase();
        return bName.includes(q) || bCode.includes(q) || bMgr.includes(q) || bCity.includes(q) || bPhone.includes(q);
      }
      return true;
    });
  }, [branches, statusFilter, searchTerm]);

  const limit = 10;
  const totalPages = Math.max(1, Math.ceil(filteredBranches.length / limit));
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

  React.useEffect(() => {
    if (page >= totalPages && totalPages > 0) {
      setPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, page]);

  // Metrics
  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter(b => b.status === 'Active').length;
  const totalTablesCount = branches.reduce((sum, b) => sum + (parseInt(b.totalTables) || 0), 0);
  const totalManagersCount = new Set(branches.map(b => (b.managerName || b.branchManager || '').trim()).filter(x => x && !['unassigned', 'null', 'undefined'].includes(x.toLowerCase()))).size;

  const openAddBranchFormDirectly = () => {
    const existingCodes = new Set((branches || []).map(b => (b.branchCode || b.code || '').toUpperCase()));
    let autoCode = `BR-${Math.floor(100 + Math.random() * 900)}`;
    let attempts = 0;
    while (existingCodes.has(autoCode) && attempts < 50) {
      autoCode = `BR-${Math.floor(100 + Math.random() * 900)}`;
      attempts++;
    }

    setBranchForm({
      ...initialBranchState,
      branchCode: autoCode,
      country: 'India',
      state: 'Tamil Nadu',
      city: '',
      username: `branch_${autoCode.toLowerCase().replace('-', '_')}`,
      password: '',
      confirmPassword: '',
      useCustomMenu: false
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEditPasswordFields(false);
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

  const handleOpenEditForm = async (branch) => {
    if (!hasPermission('branch-management', 'edit')) {
      ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
      return;
    }

    const targetId = branch.id || branch._id;
    const targetCode = (branch.branchCode || branch.code || '').trim();
    let freshBranch = { ...branch };
    try {
      const detailsRes = await BranchApi.getBranchDetails(targetId);
      if (detailsRes?.status && detailsRes.response) {
        const d = detailsRes.response.data || detailsRes.response.branch || detailsRes.response;
        if (d && typeof d === 'object') {
          // Merge keeping existing non-empty values from branch if d has empty/null/undefined
          const merged = { ...branch };
          Object.keys(d).forEach(k => {
            if (d[k] !== undefined && d[k] !== null && d[k] !== '') {
              merged[k] = d[k];
            } else if (merged[k] === undefined || merged[k] === null) {
              merged[k] = d[k];
            }
          });
          freshBranch = merged;
        }
      }
    } catch (err) {
      console.warn("Could not fetch fresh branch details, using local data:", err);
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

    const resolvedFallbackMgr = resolveBranchManagerName(freshBranch, apiUsers, []);
    const managerNameFromBranch = (
      extractRawManagerName(freshBranch.managerName) ||
      extractRawManagerName(freshBranch.branchManager) ||
      extractRawManagerName(freshBranch.manager) ||
      extractRawManagerName(freshBranch.branchManagerName) ||
      extractRawManagerName(freshBranch.contactPerson) ||
      extractRawManagerName(branch.managerName) ||
      extractRawManagerName(branch.branchManager) ||
      (resolvedFallbackMgr !== 'Unassigned' ? resolvedFallbackMgr : '') ||
      ''
    );

    const cachedMeta = {
      ...getBranchMetadataFromStorage(targetCode),
      ...getBranchMetadataFromStorage(branch.id),
      ...getBranchMetadataFromStorage(branch._id),
      ...getBranchMetadataFromStorage(targetId)
    };
    const restBranches = activeRestaurant?.branches || [];
    const matchedRestBranch = restBranches.find(rb => String(rb.id || rb._id) === String(targetId)) || {};

    const isCustomMenuVal = Boolean(
      freshBranch.useCustomMenu ||
      freshBranch.customMenu ||
      freshBranch.hasCustomMenu ||
      freshBranch.menuConfig ||
      freshBranch.isCustomMenu ||
      branch.useCustomMenu ||
      branch.customMenu ||
      branch.hasCustomMenu ||
      cachedMeta.useCustomMenu ||
      cachedMeta.customMenu ||
      matchedRestBranch.useCustomMenu ||
      matchedRestBranch.customMenu ||
      false
    );

    const resolvedGst = (
      (freshBranch.gstNumber && String(freshBranch.gstNumber).trim()) ||
      (freshBranch.gstinNumber && String(freshBranch.gstinNumber).trim()) ||
      (freshBranch.gstin && String(freshBranch.gstin).trim()) ||
      (freshBranch.taxId && String(freshBranch.taxId).trim()) ||
      (freshBranch.taxNumber && String(freshBranch.taxNumber).trim()) ||
      (branch.gstNumber && String(branch.gstNumber).trim()) ||
      (branch.gstinNumber && String(branch.gstinNumber).trim()) ||
      (branch.gstin && String(branch.gstin).trim()) ||
      (matchedRestBranch.gstNumber && String(matchedRestBranch.gstNumber).trim()) ||
      (matchedRestBranch.gstinNumber && String(matchedRestBranch.gstinNumber).trim()) ||
      (matchedRestBranch.gstin && String(matchedRestBranch.gstin).trim()) ||
      (cachedMeta?.gstNumber && String(cachedMeta.gstNumber).trim()) ||
      (cachedMeta?.gstinNumber && String(cachedMeta.gstinNumber).trim()) ||
      (cachedMeta?.gstin && String(cachedMeta.gstin).trim()) ||
      ''
    );

    const resolvedFssai = (
      (freshBranch.fssaiNumber && String(freshBranch.fssaiNumber).trim()) ||
      (freshBranch.fssaiLicense && String(freshBranch.fssaiLicense).trim()) ||
      (freshBranch.fssai && String(freshBranch.fssai).trim()) ||
      (freshBranch.fssaiNo && String(freshBranch.fssaiNo).trim()) ||
      (branch.fssaiNumber && String(branch.fssaiNumber).trim()) ||
      (branch.fssaiLicense && String(branch.fssaiLicense).trim()) ||
      (branch.fssai && String(branch.fssai).trim()) ||
      (matchedRestBranch.fssaiNumber && String(matchedRestBranch.fssaiNumber).trim()) ||
      (matchedRestBranch.fssaiLicense && String(matchedRestBranch.fssaiLicense).trim()) ||
      (matchedRestBranch.fssai && String(matchedRestBranch.fssai).trim()) ||
      (cachedMeta?.fssaiNumber && String(cachedMeta.fssaiNumber).trim()) ||
      (cachedMeta?.fssaiLicense && String(cachedMeta.fssaiLicense).trim()) ||
      ''
    );

    const rawBillPrefix = (
      (freshBranch.billPrefix && String(freshBranch.billPrefix).trim()) ||
      (freshBranch.invoicePrefix && String(freshBranch.invoicePrefix).trim()) ||
      (freshBranch.billingPrefix && String(freshBranch.billingPrefix).trim()) ||
      (freshBranch.prefix && String(freshBranch.prefix).trim()) ||
      (freshBranch.bill_prefix && String(freshBranch.bill_prefix).trim()) ||
      (freshBranch.invoice_prefix && String(freshBranch.invoice_prefix).trim()) ||
      (freshBranch.billNoPrefix && String(freshBranch.billNoPrefix).trim()) ||
      (freshBranch.invoiceNoPrefix && String(freshBranch.invoiceNoPrefix).trim()) ||
      (freshBranch.billingConfig?.billPrefix && String(freshBranch.billingConfig.billPrefix).trim()) ||
      (freshBranch.billingConfig?.prefix && String(freshBranch.billingConfig.prefix).trim()) ||
      (freshBranch.billing?.billPrefix && String(freshBranch.billing.billPrefix).trim()) ||
      (freshBranch.billing?.prefix && String(freshBranch.billing.prefix).trim()) ||
      (freshBranch.settings?.billPrefix && String(freshBranch.settings.billPrefix).trim()) ||
      (freshBranch.settings?.prefix && String(freshBranch.settings.prefix).trim()) ||
      (branch.billPrefix && String(branch.billPrefix).trim()) ||
      (branch.invoicePrefix && String(branch.invoicePrefix).trim()) ||
      (branch.billingPrefix && String(branch.billingPrefix).trim()) ||
      (branch.prefix && String(branch.prefix).trim()) ||
      (branch.bill_prefix && String(branch.bill_prefix).trim()) ||
      (branch.invoice_prefix && String(branch.invoice_prefix).trim()) ||
      (matchedRestBranch.billPrefix && String(matchedRestBranch.billPrefix).trim()) ||
      (matchedRestBranch.invoicePrefix && String(matchedRestBranch.invoicePrefix).trim()) ||
      (matchedRestBranch.billingPrefix && String(matchedRestBranch.billingPrefix).trim()) ||
      (matchedRestBranch.prefix && String(matchedRestBranch.prefix).trim()) ||
      (cachedMeta?.billPrefix && String(cachedMeta.billPrefix).trim()) ||
      (cachedMeta?.invoicePrefix && String(cachedMeta.invoicePrefix).trim()) ||
      (cachedMeta?.billingPrefix && String(cachedMeta.billingPrefix).trim()) ||
      (cachedMeta?.prefix && String(cachedMeta.prefix).trim()) ||
      ''
    );

    const branchCodeVal = (
      freshBranch.branchCode ||
      freshBranch.code ||
      branch.branchCode ||
      branch.code ||
      targetCode ||
      matchedRestBranch.branchCode ||
      matchedRestBranch.code ||
      cachedMeta?.branchCode ||
      ''
    ).trim();

    const cleanCode = branchCodeVal.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    const autoPrefix1 = cleanCode ? `${cleanCode}-` : '';
    const autoPrefix2 = branchCodeVal ? `${branchCodeVal.toUpperCase()}-` : '';

    let resolvedBillPrefix = (rawBillPrefix && String(rawBillPrefix).trim())
      ? String(rawBillPrefix).trim().toUpperCase()
      : '';

    // If resolvedBillPrefix was just the auto-generated code prefix (e.g. BR473- or INV-) that was automatically injected, clear it so it stays empty
    if (resolvedBillPrefix && (resolvedBillPrefix === autoPrefix1 || resolvedBillPrefix === autoPrefix2 || resolvedBillPrefix === 'INV-')) {
      resolvedBillPrefix = '';
    }

    const rawAddress = (typeof freshBranch.address === 'string' && freshBranch.address.trim()) ? freshBranch.address.trim() : ((typeof branch.address === 'string' && branch.address.trim()) ? branch.address.trim() : ((typeof matchedRestBranch.address === 'string' && matchedRestBranch.address.trim()) ? matchedRestBranch.address.trim() : ''));
    const streetFallback = freshBranch.address?.street || freshBranch.address?.addressLine1 || freshBranch.street || branch.address?.street || branch.street || matchedRestBranch.address?.street || cachedMeta?.address || '';
    const resolvedAddress = rawAddress || streetFallback || '';

    const resolvedCity = freshBranch.city || freshBranch.address?.city || branch.city || branch.address?.city || matchedRestBranch.city || matchedRestBranch.address?.city || cachedMeta?.city || '';
    const resolvedState = freshBranch.state || freshBranch.address?.state || branch.state || branch.address?.state || matchedRestBranch.state || matchedRestBranch.address?.state || cachedMeta?.state || '';
    const resolvedCountry = freshBranch.country || freshBranch.address?.country || branch.country || branch.address?.country || matchedRestBranch.country || cachedMeta?.country || '';
    const resolvedPincode = freshBranch.pincode || freshBranch.address?.pincode || freshBranch.postalCode || branch.pincode || branch.address?.pincode || branch.postalCode || matchedRestBranch.pincode || cachedMeta?.pincode || '';

    const rawTables = freshBranch.totalTables || freshBranch.tablesCount || freshBranch.capacity || branch.totalTables || branch.tablesCount || cachedMeta.totalTables || cachedMeta.tablesCount || cachedMeta.capacity || matchedRestBranch.totalTables || (Array.isArray(freshBranch.tables) && freshBranch.tables.length > 0 ? freshBranch.tables.length : (Array.isArray(branch.tables) && branch.tables.length > 0 ? branch.tables.length : ''));

    setBranchForm({
      id: freshBranch.id || freshBranch._id || targetId,
      managerId: freshBranch.managerId || freshBranch.rawManagerId || branch.managerId || branch.rawManagerId || '',
      branchName: freshBranch.branchName || freshBranch.name || branch.branchName || branch.name || matchedRestBranch.branchName || matchedRestBranch.name || '',
      branchCode: branchCodeVal,
      managerName: managerNameFromBranch,
      branchManager: managerNameFromBranch,
      mobileNumber: freshBranch.mobileNumber || freshBranch.contactNumber || freshBranch.phone || freshBranch.managerMobile || branch.mobileNumber || branch.contactNumber || branch.phone || matchedRestBranch.mobileNumber || matchedRestBranch.contactNumber || '',
      email: freshBranch.email || freshBranch.managerEmail || branch.email || branch.managerEmail || matchedRestBranch.email || '',
      password: '',
      confirmPassword: '',
      address: resolvedAddress,
      country: resolvedCountry,
      state: resolvedState,
      city: resolvedCity,
      pincode: resolvedPincode,
      openingDate: freshBranch.openingDate ? String(freshBranch.openingDate).split('T')[0] : (freshBranch.branchOpeningDate ? String(freshBranch.branchOpeningDate).split('T')[0] : (branch.openingDate ? String(branch.openingDate).split('T')[0] : '')),
      status: freshBranch.status || branch.status || matchedRestBranch.status || 'Active',
      totalTables: rawTables !== '' && rawTables !== undefined && rawTables !== null ? Number(rawTables) : '',
      username: freshBranch.username || branch.username || '',
      gstNumber: resolvedGst,
      fssaiNumber: resolvedFssai,
      billPrefix: resolvedBillPrefix,
      isMainBranch: Boolean(freshBranch.isMainBranch || freshBranch.branchType === 'MAIN' || branch.isMainBranch || matchedRestBranch.isMainBranch),
      useCustomMenu: isCustomMenuVal
    });
    setFormErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowEditPasswordFields(false);
    setIsEditing(true);
    setActiveView('form');
  };

  const handleOpenHierarchy = async (branch = null) => {
    const targetBranch = branch || (branches.length > 0 ? branches[0] : null);
    setSelectedBranchForTree(targetBranch);
    setOpSubTab('tables');
    setTablesPage(0);
    setOrdersPage(0);
    setStaffPage(0);
    setKdsPage(0);
    setOrdersFilter('all');
    setActiveView('hierarchy');

    // Immediate scroll reset
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const contentBody = document.querySelector('.content-body');
    if (contentBody) contentBody.scrollTop = 0;

    const targetId = targetBranch?.id || targetBranch?._id;
    if (targetId) {
      try {
        const detailsRes = await BranchApi.getBranchDetails(targetId);
        if (detailsRes?.status && detailsRes.response) {
          const d = detailsRes.response.data || detailsRes.response.branch || detailsRes.response;
          if (d && typeof d === 'object') {
            const gst = d.gstNumber || d.gstinNumber || d.gstin || d.taxId || d.taxNumber || targetBranch?.gstNumber || targetBranch?.gstinNumber || targetBranch?.gstin || '';
            const fssai = d.fssaiNumber || d.fssaiLicense || d.fssai || d.fssaiNo || targetBranch?.fssaiNumber || targetBranch?.fssaiLicense || targetBranch?.fssai || '';
            const bPref = d.billPrefix || d.invoicePrefix || d.billingPrefix || targetBranch?.billPrefix || targetBranch?.invoicePrefix || '';
            setSelectedBranchForTree(prev => ({
              ...prev,
              ...d,
              ...(gst ? { gstNumber: gst, gstinNumber: gst, gstin: gst } : {}),
              ...(fssai ? { fssaiNumber: fssai, fssaiLicense: fssai, fssai: fssai } : {}),
              ...(bPref ? { billPrefix: bPref, invoicePrefix: bPref } : {})
            }));
          }
        }
      } catch (err) {
        console.warn("Could not fetch fresh branch details for view:", err);
      }
    }
  };

  const handleDeleteBranchClick = (branch) => {
    if (branch.isMainBranch) {
      ShowNotifications.showAlertNotification("Main branch cannot be deleted.", false);
      return;
    }
    if (!hasPermission('branch-management', 'delete')) {
      ShowNotifications.showAlertNotification("You do not have permission to delete branches.", false);
      return;
    }
    setBranchToDelete(branch);
  };

  const handleToggleBranchStatus = async (branch) => {
    const branchId = branch.id || branch._id;
    const newStatus = branch.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await BranchApi.updateBranch(branchId, { status: newStatus });
      if (typeof updateBranch === 'function') {
        updateBranch(branchId, { status: newStatus });
      }
      if (newStatus === 'Inactive') {
        try {
          localStorage.setItem('serviq_branch_status_change', JSON.stringify({ branchId: String(branchId), status: 'Inactive', timestamp: Date.now() }));
          window.dispatchEvent(new CustomEvent('serviq_branch_status_change', { detail: { branchId: String(branchId), status: 'Inactive' } }));
        } catch (_) {}
      }
      ShowNotifications.showAlertNotification(
        `Branch "${branch.branchName || branch.name}" is now ${newStatus}.`,
        true
      );
      fetchBranches();
    } catch (err) {
      console.error("Failed to update branch status", err);
      setApiBranches(prev => prev.map(b => (b.id === branchId || b._id === branchId) ? { ...b, status: newStatus } : b));
      if (newStatus === 'Inactive') {
        try {
          localStorage.setItem('serviq_branch_status_change', JSON.stringify({ branchId: String(branchId), status: 'Inactive', timestamp: Date.now() }));
          window.dispatchEvent(new CustomEvent('serviq_branch_status_change', { detail: { branchId: String(branchId), status: 'Inactive' } }));
        } catch (_) {}
      }
      ShowNotifications.showAlertNotification(
        `Branch "${branch.branchName || branch.name}" is now ${newStatus}.`,
        true
      );
    }
  };

  const handlePromoteToMain = async (targetBranch) => {
    const targetId = targetBranch.id || targetBranch._id;
    try {
      // 1. Demote any currently active main branch
      const currentMain = (apiBranches || []).find(b => {
        const bId = b.id || b._id;
        return String(bId) !== String(targetId) && Boolean(b.isMainBranch || b.branchType === 'MAIN');
      });
      if (currentMain) {
        const cId = currentMain.id || currentMain._id;
        try {
          await BranchApi.updateBranch(cId, { isMainBranch: false, branchType: 'SUB' });
        } catch (_) {}
        saveBranchMetadataToStorage(cId, { isMainBranch: false, branchType: 'SUB' }, currentMain.branchCode);
      }
      // 2. Promote target branch to main branch
      await BranchApi.updateBranch(targetId, { isMainBranch: true, branchType: 'MAIN' });
      saveBranchMetadataToStorage(targetId, { isMainBranch: true, branchType: 'MAIN' }, targetBranch.branchCode);
      setApiBranches(prev => prev.map(b => {
        const bId = b.id || b._id;
        if (String(bId) === String(targetId)) return { ...b, isMainBranch: true, branchType: 'MAIN' };
        if (currentMain && String(bId) === String(currentMain.id || currentMain._id)) return { ...b, isMainBranch: false, branchType: 'SUB' };
        return b;
      }));
      ShowNotifications.showAlertNotification(`"${targetBranch.branchName || targetBranch.name}" is now the Main Branch.`, true);
      fetchBranches();
    } catch (err) {
      console.error("Failed to promote branch to main:", err);
      ShowNotifications.showAlertNotification("Failed to update branch type. Please try again.", false);
    }
  };

  const handleDemoteToSub = async (targetBranch) => {
    const targetId = targetBranch.id || targetBranch._id;
    try {
      await BranchApi.updateBranch(targetId, { isMainBranch: false, branchType: 'SUB' });
      saveBranchMetadataToStorage(targetId, { isMainBranch: false, branchType: 'SUB' }, targetBranch.branchCode);
      setApiBranches(prev => prev.map(b => (String(b.id || b._id) === String(targetId)) ? { ...b, isMainBranch: false, branchType: 'SUB' } : b));
      ShowNotifications.showAlertNotification(`"${targetBranch.branchName || targetBranch.name}" is now a Sub Branch.`, true);
      fetchBranches();
    } catch (err) {
      console.error("Failed to demote branch to sub:", err);
      ShowNotifications.showAlertNotification("Failed to update branch type. Please try again.", false);
    }
  };

  const handleOpenResetPasswordModal = (branch) => {
    setResetPasswordBranch(branch);
    setNewPassword('');
    setConfirmNewPassword('');
    setResetPasswordError('');
    setResetPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
    setShowResetPassword(false);
    setShowResetConfirmPassword(false);
  };

  const handleSaveResetPassword = async (e) => {
    e.preventDefault();
    const newErrors = { newPassword: '', confirmPassword: '', general: '' };
    if (!newPassword || !String(newPassword).trim()) {
      newErrors.newPassword = 'New password is required.';
    } else {
      const pwdErr = validatePassword(newPassword, 'New Password');
      if (pwdErr) {
        newErrors.newPassword = pwdErr;
      }
    }
    if (!confirmNewPassword || !String(confirmNewPassword).trim()) {
      newErrors.confirmPassword = 'Confirm new password is required.';
    } else if (newPassword !== confirmNewPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (newErrors.newPassword || newErrors.confirmPassword) {
      setResetPasswordErrors(newErrors);
      setResetPasswordError('');
      return;
    }

    setIsSavingResetPassword(true);
    try {
      const branchId = resetPasswordBranch.id || resetPasswordBranch._id;

      // 1. Primary: Direct reset endpoint on BranchApi
      const branchRes = await BranchApi.resetPassword(branchId, newPassword);
      if (branchRes?.status) {
        ShowNotifications.showAlertNotification(
          `Password reset successfully for branch "${resetPasswordBranch.branchName || resetPasswordBranch.name}".`,
          true
        );
        setResetPasswordBranch(null);
        setNewPassword('');
        setConfirmNewPassword('');
        setResetPasswordError('');
        setResetPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
        return;
      }

      // 2. Fallback: try UserApi.changePassword if candidate user ID is known
      const targetBranch = apiBranches.find(b => (b.id === branchId || b._id === branchId));
      const uId = resetPasswordBranch.managerId || resetPasswordBranch.rawManagerId || targetBranch?.managerId || targetBranch?.rawManagerId;
      if (uId) {
        const res = await UserApi.changePassword(uId, newPassword);
        if (res?.status) {
          ShowNotifications.showAlertNotification(
            `Password reset successfully for branch "${resetPasswordBranch.branchName || resetPasswordBranch.name}".`,
            true
          );
          setResetPasswordBranch(null);
          setNewPassword('');
          setConfirmNewPassword('');
          setResetPasswordError('');
          setResetPasswordErrors({ newPassword: '', confirmPassword: '', general: '' });
          return;
        }
      }

      const failMsg = branchRes?.message || "Could not update password. Please check the branch manager account and try again.";
      setResetPasswordErrors(prev => ({ ...prev, general: failMsg }));
      setResetPasswordError(failMsg);
      ShowNotifications.showAlertNotification(failMsg, false);
    } catch (err) {
      console.error("Failed to reset password:", err);
      const errDetail = err?.response?.data?.message || err?.message || "An unexpected error occurred while resetting password.";
      setResetPasswordErrors(prev => ({ ...prev, general: errDetail }));
      setResetPasswordError(errDetail);
    } finally {
      setIsSavingResetPassword(false);
    }
  };

  // Form Validation logic
  const validateForm = () => {
    const errors = {};

    // 1. Branch Name validation
    const branchNameTrimmed = (branchForm.branchName || branchForm.name || '').trim();
    const branchNameErr = validateBranchName(branchNameTrimmed);
    if (branchNameErr) {
      errors.branchName = branchNameErr;
    }

    // 2. Branch Code validation (3 to 6 uppercase alphanumeric)
    const branchCodeTrimmed = (branchForm.branchCode || branchForm.code || '').trim();
    const branchCodeErr = validateBranchCode(branchCodeTrimmed);
    if (branchCodeErr) {
      errors.branchCode = branchCodeErr;
    } else {
      // Check for code uniqueness locally among branches (exclude current editing branch)
      const isDuplicateCode = branches.some(b => {
        if (isEditing && (b.id === branchForm.id || b._id === branchForm.id)) return false;
        return (b.branchCode || b.code || '').trim().toLowerCase() === branchCodeTrimmed.toLowerCase();
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

    // 4. Total Tables Capacity validation (Required, at least 1)
    if (!branchForm.totalTables || Number(branchForm.totalTables) < 1) {
      errors.totalTables = 'Total Tables Capacity is required (at least 1 table).';
    }

    // 5. Branch Manager (Manager Name) validation (Letters & spaces only)
    const managerTrimmed = (branchForm.managerName || branchForm.branchManager || '').trim();
    if (!managerTrimmed || managerTrimmed.toLowerCase() === 'unassigned') {
      errors.managerName = 'Branch Manager name is required.';
    } else if (managerTrimmed.length < 2) {
      errors.managerName = 'Branch Manager name must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.,'’-]+$/.test(managerTrimmed)) {
      errors.managerName = 'Branch Manager name must contain letters only (no numbers or special symbols).';
    }

    // 6. Mobile Number (Exactly 10 digits) - Single manager can handle multiple branches
    const mobileTrimmed = (branchForm.mobileNumber || '').trim();
    const mobileErr = validateMobile(mobileTrimmed);
    if (mobileErr) {
      errors.mobileNumber = mobileErr;
    } else if (!/^[0-9]{10}$/.test(mobileTrimmed)) {
      errors.mobileNumber = 'Please enter a valid 10-digit mobile number.';
    }

    // 7. Email Address validation - Single manager can handle multiple branches
    const emailTrimmed = (branchForm.email || '').trim().toLowerCase();
    const emailErr = validateEmail(emailTrimmed);
    if (emailErr) {
      errors.email = emailErr;
    }

    // 8. Address (Street Address) - Required
    const addressTrimmed = (branchForm.address || '').trim();
    if (!addressTrimmed) {
      errors.address = 'Street Address is required.';
    } else if (addressTrimmed.length < 3) {
      errors.address = 'Street Address must be at least 3 characters.';
    }

    // 9. City validation (Letters & spaces only)
    const cityTrimmed = (branchForm.city || '').trim();
    if (!cityTrimmed) {
      errors.city = 'City is required.';
    } else if (cityTrimmed.length < 2) {
      errors.city = 'City must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.,'’-]+$/.test(cityTrimmed)) {
      errors.city = 'City must contain letters only (no numbers or special symbols).';
    }

    // 10. State validation (Letters & spaces only)
    const stateTrimmed = (branchForm.state || '').trim();
    if (!stateTrimmed) {
      errors.state = 'State is required.';
    } else if (stateTrimmed.length < 2) {
      errors.state = 'State must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.,'’&-]+$/.test(stateTrimmed)) {
      errors.state = 'State must contain letters only (no numbers or special symbols).';
    }

    // 11. Country validation (Letters & spaces only)
    const countryTrimmed = (branchForm.country || '').trim();
    if (!countryTrimmed) {
      errors.country = 'Country is required.';
    } else if (countryTrimmed.length < 2) {
      errors.country = 'Country must be at least 2 characters.';
    } else if (!/^[a-zA-Z\s.,'’-]+$/.test(countryTrimmed)) {
      errors.country = 'Country must contain letters only (no numbers or special symbols).';
    }

    // 12. Pincode (Postal Code) - Exactly 6 digits
    const pincodeTrimmed = (branchForm.pincode || '').trim();
    const pinErr = validatePincode(pincodeTrimmed);
    if (pinErr) {
      errors.pincode = pinErr;
    }

    // 13. GSTIN validation (if entered, valid 15-character format)
    const gstTrimmed = (branchForm.gstNumber || '').trim();
    if (gstTrimmed) {
      const gstErr = validateGstin(gstTrimmed);
      if (gstErr) errors.gstNumber = gstErr;
    }

    // 14. FSSAI License validation (if entered, exactly 14 digits)
    const fssaiTrimmed = (branchForm.fssaiNumber || '').trim();
    if (fssaiTrimmed && fssaiTrimmed.length !== 14) {
      errors.fssaiNumber = 'FSSAI License Number must contain exactly 14 digits.';
    }

    // 15. Manager Password validation (Required on Add Branch only)
    if (!isEditing) {
      if (!branchForm.password) {
        errors.password = 'Manager Password is required.';
      } else {
        const passErr = validatePassword(branchForm.password, 'Manager Password');
        if (passErr) {
          errors.password = passErr;
        }
      }
      if (!branchForm.confirmPassword) {
        errors.confirmPassword = 'Please confirm the password.';
      } else if (branchForm.password !== branchForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      const firstError = Object.values(errors)[0];
      ShowNotifications.showAlertNotification(firstError || "Please check the required fields in the form.", false);
      return;
    }

    // Check if another branch is currently Main Branch so we can seamlessly switch upon save
    let previousMainBranchToDemote = null;
    if (branchForm.isMainBranch) {
      const allExisting = (apiBranches && apiBranches.length > 0)
        ? apiBranches
        : (activeRestaurant?.branches || []);
      const currentIdStr = String(branchForm.id || '');
      previousMainBranchToDemote = allExisting.find(b => {
        const bId = String(b.id || b._id || '');
        const isOther = !currentIdStr || bId !== currentIdStr;
        return isOther && Boolean(b.isMainBranch || b.branchType === 'MAIN' || b.type === 'MAIN');
      });
    }

    const branchNameTrimmed = (branchForm.branchName || branchForm.name || '').trim();
    const managerVal = (branchForm.managerName || branchForm.branchManager || '').trim();
    const addressStr = (branchForm.address || '').trim();
    const cityStr = (branchForm.city || '').trim();
    const stateStr = (branchForm.state || '').trim();
    const countryStr = (branchForm.country || '').trim();
    const pincodeStr = (branchForm.pincode || '').trim();
    const phoneStr = (branchForm.mobileNumber || '').trim();
    const emailStr = (branchForm.email || '').trim();
    const branchCodeStr = (branchForm.branchCode || '').trim();
    const openingDateStr = branchForm.openingDate || new Date().toISOString().split('T')[0];
    const totalTablesVal = Number(branchForm.totalTables) || 10;

    const addressObj = {
      street: addressStr,
      city: cityStr,
      state: stateStr,
      country: countryStr,
      pincode: pincodeStr
    };

    const restId = activeRestaurant?._id || activeRestaurant?.id || currentUser?.restaurantId || currentUser?.restaurant?._id || currentUser?.restaurant;

    const managerPasswordVal = (!isEditing && branchForm.password && String(branchForm.password).trim()) 
      ? String(branchForm.password).trim() 
      : '';

    const payload = {
      name: branchNameTrimmed,
      branchName: branchNameTrimmed,
      branchCode: branchCodeStr,
      code: branchCodeStr,
      branchOpeningDate: openingDateStr,
      openingDate: openingDateStr,
      contactNumber: phoneStr,
      mobileNumber: phoneStr,
      phone: phoneStr,
      phoneNumber: phoneStr,
      email: emailStr,
      managerEmail: emailStr,
      managerPhone: phoneStr,
      managerMobile: phoneStr,
      managerName: managerVal,
      branchManager: managerVal,
      manager: managerVal,
      ...(!isEditing && managerPasswordVal ? {
        managerPassword: managerPasswordVal,
        password: managerPasswordVal,
        newPassword: managerPasswordVal,
        pin: managerPasswordVal,
        managerPin: managerPasswordVal,
        confirmPassword: managerPasswordVal,
      } : {}),
      street: addressStr,
      address: addressObj,
      addressObj: addressObj,
      addressLine1: addressStr,
      city: cityStr,
      state: stateStr,
      country: countryStr,
      pincode: pincodeStr,
      postalCode: pincodeStr,
      zipCode: pincodeStr,
      status: branchForm.status || 'Active',
      totalTables: totalTablesVal,
      tablesCount: totalTablesVal,
      capacity: totalTablesVal,
      seatingCapacity: totalTablesVal,
      branchCapacity: totalTablesVal,
      isMainBranch: !!branchForm.isMainBranch,
      branchType: branchForm.isMainBranch ? 'MAIN' : 'SUB',
      useCustomMenu: !!branchForm.useCustomMenu,
      gstNumber: (branchForm.gstNumber || '').trim().toUpperCase(),
      gstinNumber: (branchForm.gstNumber || '').trim().toUpperCase(),
      gstin: (branchForm.gstNumber || '').trim().toUpperCase(),
      fssaiNumber: (branchForm.fssaiNumber || '').trim(),
      fssaiLicense: (branchForm.fssaiNumber || '').trim(),
      fssai: (branchForm.fssaiNumber || '').trim(),
      billPrefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      invoicePrefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      billingPrefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      prefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      bill_prefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      invoice_prefix: (branchForm.billPrefix || '').trim().toUpperCase(),
      billingConfig: {
        billPrefix: (branchForm.billPrefix || '').trim().toUpperCase(),
        invoicePrefix: (branchForm.billPrefix || '').trim().toUpperCase()
      },
      ...(restId ? { restaurantId: restId, restaurant: restId } : {})
    };

    if (isEditing) {
      if (!hasPermission('branch-management', 'edit')) {
        ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
        return;
      }

      const res = await BranchApi.updateBranch(branchForm.id, payload);
      if (res && res.status) {
        if (payload.status === 'Inactive') {
          try {
            localStorage.setItem('serviq_branch_status_change', JSON.stringify({ branchId: String(branchForm.id), status: 'Inactive', timestamp: Date.now() }));
            window.dispatchEvent(new CustomEvent('serviq_branch_status_change', { detail: { branchId: String(branchForm.id), status: 'Inactive' } }));
          } catch (_) {}
        }

        if (previousMainBranchToDemote) {
          const prevId = previousMainBranchToDemote.id || previousMainBranchToDemote._id;
          try {
            await BranchApi.updateBranch(prevId, { isMainBranch: false, branchType: 'SUB' });
          } catch (_) {}
          saveBranchMetadataToStorage(prevId, { isMainBranch: false, branchType: 'SUB' }, previousMainBranchToDemote.branchCode);
          setApiBranches(prev => prev.map(b => (b.id === prevId || b._id === prevId) ? { ...b, isMainBranch: false, branchType: 'SUB' } : b));
        }

        // Synchronize manager name, email, phone with associated manager user record
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
            console.warn("Could not query branch users for sync:", e);
          }
        }

        const targetUserId = matchedUser?._id || matchedUser?.id;
        if (targetUserId) {
          const userUpdatePayload = {
            name: managerVal,
            email: branchForm.email,
            phone: branchForm.mobileNumber,
            phoneNumber: branchForm.mobileNumber,
            mobileNumber: branchForm.mobileNumber
          };
          if (branchForm.password && String(branchForm.password).trim()) {
            const pinVal = String(branchForm.password).trim();
            userUpdatePayload.password = pinVal;
            try {
              await UserApi.changePassword(targetUserId, pinVal);
            } catch (passErr) {
              console.warn("Could not update manager password via UserApi:", passErr);
            }
          }
          try {
            await UserApi.updateUser(targetUserId, userUpdatePayload);
          } catch (passErr) {
            console.warn("Could not update manager user info via UserApi:", passErr);
          }
        } else if (managerVal && branchForm.email) {
          // If no user exists for this branch manager yet, create one silently if not already in system
          const userAlreadyExists = (apiUsers || []).some(u => {
            const uEmail = String(u.email || '').toLowerCase().trim();
            const uPhone = String(u.phone || u.phoneNumber || u.mobileNumber || '').trim();
            return (uEmail && uEmail === branchForm.email?.toLowerCase().trim()) || (branchForm.mobileNumber && uPhone === branchForm.mobileNumber);
          });
          if (!userAlreadyExists) {
            try {
              await UserApi.createUser({
                name: managerVal,
                email: branchForm.email,
                phoneNumber: branchForm.mobileNumber,
                password: branchForm.password && String(branchForm.password).trim() ? String(branchForm.password).trim() : '123456',
                role: 'Manager',
                branchId: branchForm.id
              }, { silent: true });
            } catch (createErr) {
              console.warn("Could not create manager user on branch edit:", createErr);
            }
          }
        }

        const autoPrefix = (branchForm.branchCode || 'INV').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() + '-';
        const gstVal = (branchForm.gstNumber || '').trim().toUpperCase();
        const fssaiVal = (branchForm.fssaiNumber || '').trim();
        const billPrefixVal = (branchForm.billPrefix || '').trim().toUpperCase();

        const updatedBranchObj = {
          ...payload,
          id: branchForm.id,
          _id: branchForm.id,
          name: branchNameTrimmed,
          branchName: branchNameTrimmed,
          managerName: managerVal,
          branchManager: managerVal,
          totalTables: totalTablesVal,
          tablesCount: totalTablesVal,
          capacity: totalTablesVal,
          isMainBranch: Boolean(branchForm.isMainBranch),
          branchType: branchForm.isMainBranch ? 'MAIN' : 'SUB',
          gstNumber: gstVal,
          gstinNumber: gstVal,
          gstin: gstVal,
          fssaiNumber: fssaiVal,
          fssaiLicense: fssaiVal,
          fssai: fssaiVal,
          billPrefix: billPrefixVal,
          invoicePrefix: billPrefixVal,
          billingPrefix: billPrefixVal,
          prefix: billPrefixVal,
          useCustomMenu: Boolean(branchForm.useCustomMenu),
          customMenu: Boolean(branchForm.useCustomMenu)
        };

        // Cache immediately so entered metadata is never lost
        saveBranchMetadataToStorage(branchForm.id, updatedBranchObj, branchForm.branchCode);

        setApiBranches(prev => prev.map(b => (b.id === branchForm.id || b._id === branchForm.id) ? { ...b, ...updatedBranchObj } : b));
        const restIdForState = activeRestaurant?._id || activeRestaurant?.id || 'mirchi';
        if (updateBranch) {
          updateBranch(restIdForState, branchForm.id, updatedBranchObj);
        }
        await fetchBranches();
        setActiveView('list');
      } else {
        ShowNotifications.showAlertNotification(res?.message || res?.response?.message || "Failed to update branch. Please try again.", false);
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
      let res;
      try {
        res = await BranchApi.createBranch(payload);
      } catch (createErr) {
        console.warn("BranchApi create error:", createErr);
      }

      if (res?.status || res?.data?.success || res?.success) {
        const createdData = res?.response?.data || res?.response || res?.data || {};
        const branchDoc = createdData?.branch || createdData?.data?.branch || createdData;
        const createdId = branchDoc?._id || branchDoc?.id || createdData?._id || createdData?.id;

        if (payload.status === 'Inactive') {
          try {
            localStorage.setItem('serviq_branch_status_change', JSON.stringify({ branchId: String(createdId), status: 'Inactive', timestamp: Date.now() }));
            window.dispatchEvent(new CustomEvent('serviq_branch_status_change', { detail: { branchId: String(createdId), status: 'Inactive' } }));
          } catch (_) {}
        }

        if (previousMainBranchToDemote) {
          const prevId = previousMainBranchToDemote.id || previousMainBranchToDemote._id;
          try {
            await BranchApi.updateBranch(prevId, { isMainBranch: false, branchType: 'SUB' });
          } catch (_) {}
          saveBranchMetadataToStorage(prevId, { isMainBranch: false, branchType: 'SUB' }, previousMainBranchToDemote.branchCode);
          setApiBranches(prev => prev.map(b => (b.id === prevId || b._id === prevId) ? { ...b, isMainBranch: false, branchType: 'SUB' } : b));
        }

        // Create manager user if manager details were provided and user doesn't already exist
        // Note: Call with { silent: true } to prevent spurious error notifications overriding the branch success toast
        if (managerVal && emailStr) {
          const userAlreadyExists = (apiUsers || []).some(u => {
            const uEmail = String(u.email || '').toLowerCase().trim();
            const uPhone = String(u.phone || u.phoneNumber || u.mobileNumber || '').trim();
            return (uEmail && uEmail === emailStr.toLowerCase().trim()) || (phoneStr && uPhone === phoneStr);
          });
          if (!userAlreadyExists) {
            try {
              await UserApi.createUser({
                name: managerVal,
                email: emailStr,
                phoneNumber: phoneStr,
                mobileNumber: phoneStr,
                password: String(branchForm.password).trim(),
                role: 'Manager',
                branchId: createdId,
                status: 'Active'
              }, { silent: true });
            } catch (mgrErr) {
              console.warn("Manager user sync note:", mgrErr);
            }
          }
        }

        const autoPrefix = (branchForm.branchCode || 'INV').replace(/[^a-zA-Z0-9]/g, '').toUpperCase() + '-';
        const gstVal = (branchForm.gstNumber || '').trim().toUpperCase();
        const fssaiVal = (branchForm.fssaiNumber || '').trim();
        const billPrefixVal = (branchForm.billPrefix || '').trim().toUpperCase();

        const newBranchObj = {
          ...payload,
          id: createdId,
          _id: createdId,
          branchManager: managerVal,
          managerName: managerVal,
          totalTables: totalTablesVal,
          tablesCount: totalTablesVal,
          capacity: totalTablesVal,
          isMainBranch: Boolean(branchForm.isMainBranch),
          branchType: branchForm.isMainBranch ? 'MAIN' : 'SUB',
          gstNumber: gstVal,
          gstinNumber: gstVal,
          gstin: gstVal,
          fssaiNumber: fssaiVal,
          fssaiLicense: fssaiVal,
          fssai: fssaiVal,
          billPrefix: billPrefixVal,
          invoicePrefix: billPrefixVal,
          billingPrefix: billPrefixVal,
          prefix: billPrefixVal,
          useCustomMenu: Boolean(branchForm.useCustomMenu),
          customMenu: Boolean(branchForm.useCustomMenu)
        };

        // Cache immediately so entered metadata is never lost
        saveBranchMetadataToStorage(createdId, newBranchObj, branchForm.branchCode);

        setApiBranches(prev => [...(prev || []), newBranchObj]);
        const restIdForState = activeRestaurant?._id || activeRestaurant?.id || currentUser?.restaurantId || 'mirchi';
        if (addBranch) {
          addBranch(restIdForState, newBranchObj);
        }
        await fetchBranches();
        setActiveView('list');
      } else {
        ShowNotifications.showAlertNotification(res?.message || res?.response?.message || "Failed to create branch. Please try again.", false);
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
      const branchId = branchToDelete.id || branchToDelete._id;
      const res = await BranchApi.deleteBranch(branchId);
      if (res && res.status) {
        if (typeof deleteBranch === 'function') {
          deleteBranch(activeRestaurant?.id || activeRestaurant?._id, branchId);
        }
        fetchBranches();
      }
      setBranchToDelete(null);
    }
  };

  // Target branch currently viewed in hierarchy mode
  const baseCurrentViewBranch = selectedBranchForTree || (branches.length > 0 ? branches[0] : null);
  const currentViewBranch = useMemo(() => {
    if (!baseCurrentViewBranch) return null;
    const bId = baseCurrentViewBranch.id || baseCurrentViewBranch._id;
    const bCode = (baseCurrentViewBranch.branchCode || baseCurrentViewBranch.code || '').trim();
    const meta = getBranchMetadataFromStorage(bId, bCode);
    const autoCodePref = bCode ? `${String(bCode).replace(/[^a-zA-Z0-9]/g, '').toUpperCase()}-` : 'INV-';
    return {
      ...meta,
      ...baseCurrentViewBranch,
      gstNumber: baseCurrentViewBranch.gstNumber || baseCurrentViewBranch.gstinNumber || baseCurrentViewBranch.gstin || meta.gstNumber || meta.gstinNumber || meta.gstin || '',
      fssaiNumber: baseCurrentViewBranch.fssaiNumber || baseCurrentViewBranch.fssaiLicense || baseCurrentViewBranch.fssai || meta.fssaiNumber || meta.fssaiLicense || '',
      billPrefix: (() => {
        const pref = baseCurrentViewBranch.billPrefix || baseCurrentViewBranch.invoicePrefix || meta.billPrefix || meta.invoicePrefix || '';
        return (pref === autoCodePref || pref === `${bCode}-` || pref === 'INV-') ? '' : pref;
      })()
    };
  }, [baseCurrentViewBranch]);

  const currentViewBranchId = String(currentViewBranch?.id || currentViewBranch?._id || currentViewBranch?.branchCode || '');
  const lastFetchedBranchIdRef = useRef('');

  useEffect(() => {
    if (activeView === 'hierarchy' && currentViewBranchId) {
      if (lastFetchedBranchIdRef.current !== currentViewBranchId) {
        lastFetchedBranchIdRef.current = currentViewBranchId;
        fetchBranchOperationalData(currentViewBranch);
      }
    } else if (activeView !== 'hierarchy') {
      lastFetchedBranchIdRef.current = '';
    }
  }, [activeView, currentViewBranchId, fetchBranchOperationalData]);

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
      const ordId = ord.orderId || ord.id || (ord._id ? `#${String(ord._id).slice(-5).toUpperCase()}` : '-');
      const tableStr = ord.tableNumber || ord.tableNo || (typeof ord.table === 'object' ? (ord.table?.tableNumber || ord.table?.name) : ord.table) || (typeof ord.tableId === 'object' ? (ord.tableId?.tableNumber || ord.tableId?.name) : ord.tableId) || '-';
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
      : [];

    // 4. Kitchen KDS stations & live channels
    const kitchenStaffList = mappedStaff.filter(s => {
      const r = String(s.role || '').toLowerCase();
      return r.includes('kitchen') || r.includes('chef') || r.includes('cook');
    });

    const categoryMap = new Map();

    // Collect from liveBranchCategories
    (liveBranchCategories || []).forEach(c => {
      const catName = (typeof c === 'string' ? c : (c.name || c.categoryName || '')).trim();
      if (catName && !categoryMap.has(catName.toLowerCase())) {
        categoryMap.set(catName.toLowerCase(), {
          name: catName,
          description: typeof c === 'object' && c.description ? c.description : `Live kitchen channel for ${catName}`
        });
      }
    });

    // Collect from activeRestaurant categories
    const restaurantCats = [
      ...(activeRestaurant?.menuCategories || []),
      ...(activeRestaurant?.categories || [])
    ];
    restaurantCats.forEach(c => {
      const catName = (typeof c === 'string' ? c : (c.name || c.categoryName || '')).trim();
      if (catName && !categoryMap.has(catName.toLowerCase())) {
        categoryMap.set(catName.toLowerCase(), {
          name: catName,
          description: typeof c === 'object' && c.description ? c.description : `Live kitchen channel for ${catName}`
        });
      }
    });

    // If no categories in DB/Restaurant, supply standard restaurant kitchen channels
    if (categoryMap.size === 0) {
      const standardStations = [
        { name: 'Hot Kitchen (Main Courses)', description: 'Curry, Biryani, Rice, Tandoor & Gravies' },
        { name: 'Appetizers & Starters', description: 'Soups, Salads, Crispy Fries & Starters' },
        { name: 'Beverages & Bar', description: 'Juices, Shakes, Mocktails & Soft Drinks' },
        { name: 'Desserts & Bakery', description: 'Pastries, Cakes, Ice Creams & Sweets' }
      ];
      standardStations.forEach(s => categoryMap.set(s.name.toLowerCase(), s));
    }

    const prepCount = mappedOrders.filter(o => o.status === 'preparing').length;
    const qCount = mappedOrders.filter(o => o.isInQueue).length;

    const mappedKitchen = Array.from(categoryMap.values()).map((cat, idx) => {
      const catName = typeof cat === 'string' ? cat : (cat.name || cat.categoryName || `Kitchen Channel ${idx + 1}`);
      const catDesc = typeof cat === 'object' && cat.description ? cat.description : `Live orders for ${catName}`;
      
      const stationOrders = mappedOrders.filter(o => {
        const itemStr = String(o.items || '').toLowerCase();
        return itemStr.includes(catName.toLowerCase()) || o.status === 'preparing';
      });

      const stationPrepCount = stationOrders.filter(o => o.status === 'preparing').length;
      const stationQueueCount = stationOrders.filter(o => o.isInQueue).length;

      let load = 'Normal';
      let loadPercent = 25;
      if (stationPrepCount >= 4 || prepCount >= 6) {
        load = 'High';
        loadPercent = 85;
      } else if (stationPrepCount >= 2 || prepCount >= 3) {
        load = 'Medium';
        loadPercent = 55;
      } else if (qCount > 0) {
        load = 'Normal';
        loadPercent = 35;
      }

      return {
        id: `kds-channel-${idx + 1}`,
        name: catName.includes('KDS') || catName.includes('Station') ? catName : `${catName} KDS`,
        stationName: catName,
        items: catDesc,
        load,
        loadPercent,
        activeOrdersCount: stationPrepCount,
        queueCount: stationQueueCount,
        assignedStaff: kitchenStaffList.length > 0 ? kitchenStaffList.map(s => s.name).join(', ') : 'Kitchen Team',
        staffCount: kitchenStaffList.length,
        status: 'Active'
      };
    });

    return {
      staff: mappedStaff,
      orders: mappedOrders,
      tables: mappedTables,
      kitchen: mappedKitchen
    };
  })();

  // Operational View Pagination: Tables (10 per page, starting at 0)
  const tablesLimit = 10;
  const tablesTotal = opData.tables.length;
  const tablesTotalPages = Math.max(1, Math.ceil(tablesTotal / tablesLimit));
  const tablesCurrentPage = Math.max(0, Math.min(tablesPage, Math.max(0, tablesTotalPages - 1)));
  const tablesFrom = tablesTotal === 0 ? 0 : tablesCurrentPage * tablesLimit + 1;
  const tablesTo = Math.min((tablesCurrentPage + 1) * tablesLimit, tablesTotal);

  const paginatedTables = opData.tables.slice(
    tablesCurrentPage * tablesLimit,
    (tablesCurrentPage + 1) * tablesLimit
  );

  const handleTablesPageChange = (newPage) => {
    setTablesPage(newPage);
  };

  const getTablesPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = tablesCurrentPage + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(tablesTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i - 1);
    }
    return pages;
  };

  // Operational View: Orders calculation, filtering & pagination (limit 10, starting at 0)
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
  const ordersCurrentPage = Math.max(0, Math.min(ordersPage, Math.max(0, ordersTotalPages - 1)));
  const ordersFrom = ordersTotal === 0 ? 0 : ordersCurrentPage * ordersLimit + 1;
  const ordersTo = Math.min((ordersCurrentPage + 1) * ordersLimit, ordersTotal);

  const paginatedOrders = filteredOrders.slice(
    ordersCurrentPage * ordersLimit,
    (ordersCurrentPage + 1) * ordersLimit
  );

  const handleOrdersPageChange = (newPage) => {
    setOrdersPage(newPage);
  };

  const getOrdersPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = ordersCurrentPage + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(ordersTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i - 1);
    }
    return pages;
  };

  const handleRefreshOrders = async () => {
    if (!currentViewBranch) return;
    setIsRefreshingOrders(true);
    await fetchBranchOperationalData(currentViewBranch);
    if (typeof fetchOrders === 'function') {
      await fetchOrders();
    }
    setTimeout(() => setIsRefreshingOrders(false), 400);
    ShowNotifications.showAlertNotification("Order queue refreshed successfully.", true);
  };

  // Operational View: Staff Pagination (10 per page, starting at 0)
  const staffLimit = 10;
  const staffTotal = (opData.staff || []).length;
  const staffTotalPages = Math.max(1, Math.ceil(staffTotal / staffLimit));
  const staffCurrentPage = Math.max(0, Math.min(staffPage, Math.max(0, staffTotalPages - 1)));
  const staffFrom = staffTotal === 0 ? 0 : staffCurrentPage * staffLimit + 1;
  const staffTo = Math.min((staffCurrentPage + 1) * staffLimit, staffTotal);

  const paginatedStaff = (opData.staff || []).slice(
    staffCurrentPage * staffLimit,
    (staffCurrentPage + 1) * staffLimit
  );

  const handleStaffPageChange = (newPage) => {
    setStaffPage(newPage);
  };

  const getStaffPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = staffCurrentPage + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(staffTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i - 1);
    }
    return pages;
  };

  // Operational View: Kitchen KDS Pagination (10 per page, starting at 0)
  const kdsLimit = 10;
  const kdsTotal = (opData.kitchen || []).length;
  const kdsTotalPages = Math.max(1, Math.ceil(kdsTotal / kdsLimit));
  const kdsCurrentPage = Math.max(0, Math.min(kdsPage, Math.max(0, kdsTotalPages - 1)));
  const kdsFrom = kdsTotal === 0 ? 0 : kdsCurrentPage * kdsLimit + 1;
  const kdsTo = Math.min((kdsCurrentPage + 1) * kdsLimit, kdsTotal);

  const paginatedKds = (opData.kitchen || []).slice(
    kdsCurrentPage * kdsLimit,
    (kdsCurrentPage + 1) * kdsLimit
  );

  const handleKdsPageChange = (newPage) => {
    setKdsPage(newPage);
  };

  const getKdsPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    const current = kdsCurrentPage + 1;
    let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
    let endPage = Math.min(kdsTotalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
      startPage = Math.max(1, endPage - maxVisible + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i - 1);
    }
    return pages;
  };

  // ==========================================
  // VIEW 1: REDESIGNED BRANCH VIEW PAGE UI
  // ==========================================
  if (activeView === 'hierarchy') {
    return (
      <div ref={viewTopRef} style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
        
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

          {hasPermission('branch-management', 'edit') && (
            <button
              type="button"
              onClick={() => handleOpenEditForm(currentViewBranch)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '9px 18px',
                background: 'var(--primary)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)',
                transition: 'all 0.2s'
              }}
            >
              <PencilIcon size={14} color="#ffffff" />
              Edit Branch
            </button>
          )}
        </div>

        {/* Full-Width Branch Information Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '22px 26px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', marginBottom: '24px', width: '100%', boxSizing: 'border-box' }}>
          
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '14px', marginBottom: '16px' }}>
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              Branch Information
            </h3>
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
                    {resolveBranchContactNumber(currentViewBranch, apiUsers, liveBranchStaff) || currentViewBranch?.mobileNumber || 'N/A'}
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

          {/* Tax, Compliance & Billing Configuration Section */}
          <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f1f5f9' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  Tax, Compliance & Billing
                </span>
              </div>
             
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', background: '#f8fafc', padding: '16px 22px', borderRadius: '12px', border: '1px solid #eef2f6' }}>
              
              {/* 1. GSTIN */}
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  GSTIN (Tax ID)
                </span>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    {currentViewBranch?.gstNumber || currentViewBranch?.gstinNumber || currentViewBranch?.gstin || currentViewBranch?.taxId || currentViewBranch?.taxNumber || 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* 2. FSSAI License */}
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  FSSAI License No.
                </span>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                  <span style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    {currentViewBranch?.fssaiNumber || currentViewBranch?.fssaiLicense || currentViewBranch?.fssai || currentViewBranch?.fssaiNo || 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* 3. Invoice / Bill Prefix */}
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Invoice / Bill Prefix
                </span>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#ea580c', fontFamily: 'monospace' }}>
                  <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', display: 'inline-block' }}>
                    {currentViewBranch?.billPrefix || currentViewBranch?.invoicePrefix || currentViewBranch?.billingPrefix || 'Not Configured'}
                  </span>
                </div>
              </div>

              {/* 4. Branch Type */}
              <div>
                <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Branch Type
                </span>
                <div style={{ minHeight: '27px', display: 'flex', alignItems: 'center' }}>
                  {(currentViewBranch?.isMainBranch || currentViewBranch?.branchType === 'MAIN') ? (
                    <span style={{ background: '#fef3c7', border: '1px solid #fde68a', color: '#b45309', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      ★ Main Branch
                    </span>
                  ) : (
                    <span style={{ background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1d4ed8', padding: '3px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      Sub Branch
                    </span>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Operational Sub-Tabs (Tables, Orders, Staff, Kitchen) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            <button
              type="button"
              onClick={() => { setOpSubTab('tables'); setTablesPage(0); }}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'tables' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'tables' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tables 
            </button>

            <button
              type="button"
              onClick={() => { setOpSubTab('orders'); setOrdersPage(0); }}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'orders' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'orders' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Orders 
            </button>

            <button
              type="button"
              onClick={() => { setOpSubTab('staff'); setStaffPage(0); }}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'staff' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'staff' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Staff 
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
                        <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>S/NO</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Table Name / No</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Seating Capacity</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Floor / Area</th>
                          <th style={{ padding: '12px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', backgroundColor: '#f95e10' }}>Status</th>
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
                    Showing <strong style={{ color: '#0f172a' }}>{tablesFrom}</strong> to <strong style={{ color: '#0f172a' }}>{tablesTo}</strong> of <strong style={{ color: '#0f172a' }}>{tablesTotal}</strong> tables (Page {tablesCurrentPage + 1} of {tablesTotalPages})
                  </div>

                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleTablesPageChange(Math.max(0, tablesCurrentPage - 1))}
                      disabled={tablesCurrentPage === 0}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: tablesCurrentPage === 0 ? '#f8fafc' : '#ffffff',
                        color: tablesCurrentPage === 0 ? '#cbd5e1' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: tablesCurrentPage === 0 ? 'not-allowed' : 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      Prev
                    </button>

                    {getTablesPageNumbers().map(pageNum => (
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
                        {pageNum + 1}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => handleTablesPageChange(Math.min(tablesTotalPages - 1, tablesCurrentPage + 1))}
                      disabled={tablesCurrentPage >= tablesTotalPages - 1 || tablesTotalPages === 0}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: (tablesCurrentPage >= tablesTotalPages - 1 || tablesTotalPages === 0) ? '#f8fafc' : '#ffffff',
                        color: (tablesCurrentPage >= tablesTotalPages - 1 || tablesTotalPages === 0) ? '#cbd5e1' : '#334155',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: (tablesCurrentPage >= tablesTotalPages - 1 || tablesTotalPages === 0) ? 'not-allowed' : 'pointer',
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                    Order Queue & History
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '3px' }}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: inQueueCount > 0 ? '#22c55e' : '#94a3b8', display: 'inline-block' }}></span>
                    <strong style={{ color: '#0f172a' }}>{inQueueCount} Orders</strong> currently in queue • <span style={{ color: '#64748b' }}>{allOrdersCount} total records</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRefreshOrders}
                  disabled={isRefreshingOrders}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#334155',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ animation: isRefreshingOrders ? 'spin 1s linear infinite' : 'none' }}>🔄</span>
                  <span>Refresh Queue</span>
                </button>
              </div>

              {/* Status Filter Chips */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                {[
                  { key: 'all', label: 'All History'},
                  { key: 'queue', label: 'Order Queue' },
                  { key: 'preparing', label: 'Preparing' },
                  { key: 'ready', label: 'Ready to Serve' }
                ].map(chip => {
                  const isSelected = ordersFilter === chip.key;
                  return (
                    <button
                      key={chip.key}
                      type="button"
                      onClick={() => {
                        setOrdersFilter(chip.key);
                        setOrdersPage(0);
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
                      <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Order ID</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Date / Time</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Table</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Ordered Items</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', backgroundColor: '#f95e10' }}>Amount</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 700, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', backgroundColor: '#f95e10' }}>Status</th>
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
                    Showing <strong>{ordersFrom}</strong> to <strong>{ordersTo}</strong> of <strong>{ordersTotal}</strong> orders (Page {ordersCurrentPage + 1} of {ordersTotalPages})
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleOrdersPageChange(Math.max(0, ordersCurrentPage - 1))}
                      disabled={ordersCurrentPage === 0}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: ordersCurrentPage === 0 ? '#f8fafc' : '#ffffff',
                        color: ordersCurrentPage === 0 ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: ordersCurrentPage === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Prev
                    </button>
                    {getOrdersPageNumbers().map(pageNum => (
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
                        {pageNum + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleOrdersPageChange(Math.min(ordersTotalPages - 1, ordersCurrentPage + 1))}
                      disabled={ordersCurrentPage >= ordersTotalPages - 1 || ordersTotalPages === 0}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: (ordersCurrentPage >= ordersTotalPages - 1 || ordersTotalPages === 0) ? '#f8fafc' : '#ffffff',
                        color: (ordersCurrentPage >= ordersTotalPages - 1 || ordersTotalPages === 0) ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: (ordersCurrentPage >= ordersTotalPages - 1 || ordersTotalPages === 0) ? 'not-allowed' : 'pointer'
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
                      borderRadius: '8px', 
                      background: 'var(--primary-light, #fff7ed)', 
                      color: 'var(--primary, #ea580c)', 
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
                    Showing <strong>{staffFrom}</strong> to <strong>{staffTo}</strong> of <strong>{staffTotal}</strong> staff (Page {staffCurrentPage + 1} of {staffTotalPages})
                  </div>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <button
                      type="button"
                      onClick={() => handleStaffPageChange(Math.max(0, staffCurrentPage - 1))}
                      disabled={staffCurrentPage === 0}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: staffCurrentPage === 0 ? '#f8fafc' : '#ffffff',
                        color: staffCurrentPage === 0 ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: staffCurrentPage === 0 ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Prev
                    </button>
                    {getStaffPageNumbers().map(pageNum => (
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
                        {pageNum + 1}
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => handleStaffPageChange(Math.min(staffTotalPages - 1, staffCurrentPage + 1))}
                      disabled={staffCurrentPage >= staffTotalPages - 1 || staffTotalPages === 0}
                      style={{
                        padding: '4px 10px', borderRadius: '6px', border: '1px solid #e2e8f0',
                        background: (staffCurrentPage >= staffTotalPages - 1 || staffTotalPages === 0) ? '#f8fafc' : '#ffffff',
                        color: (staffCurrentPage >= staffTotalPages - 1 || staffTotalPages === 0) ? '#cbd5e1' : '#334155', fontSize: '12px', fontWeight: 600,
                        cursor: (staffCurrentPage >= staffTotalPages - 1 || staffTotalPages === 0) ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
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
      <div ref={viewTopRef} style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
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
                        backgroundColor: formErrors.branchName ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.branchName ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                        backgroundColor: formErrors.branchCode ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.branchCode ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                        backgroundColor: formErrors.openingDate ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.openingDate ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                        backgroundColor: formErrors.totalTables ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.totalTables ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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

                  {/* Field 6: Main Branch Checkbox */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '6px' }}>
                    <label style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '14px 18px',
                      background: branchForm.isMainBranch ? '#fff7ed' : '#ffffff',
                      border: branchForm.isMainBranch ? '1.5px solid #ea580c' : '1px solid #cbd5e1',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                      boxShadow: branchForm.isMainBranch ? '0 2px 10px rgba(234, 88, 12, 0.08)' : 'none'
                    }}>
                      <input
                        type="checkbox"
                        checked={!!branchForm.isMainBranch}
                        onChange={e => {
                          const willBeMain = e.target.checked;
                          setBranchForm({ ...branchForm, isMainBranch: willBeMain });
                          if (formErrors.isMainBranch) setFormErrors({ ...formErrors, isMainBranch: '' });
                        }}
                        style={{
                          width: '18px',
                          height: '18px',
                          accentColor: '#ea580c',
                          cursor: 'pointer',
                          marginTop: '2px',
                          flexShrink: 0
                        }}
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                            {branchForm.isMainBranch ? 'Main Branch (Headquarter)' : 'Set as Main Branch'}
                          </span>
                          {branchForm.isMainBranch ? (
                            <span style={{ fontSize: '10px', background: '#fef3c7', color: '#b45309', padding: '1px 7px', borderRadius: '12px', fontWeight: 800, border: '1px solid #fde68a' }}>
                              ★ Primary Headquarter
                            </span>
                          ) : (
                            <span style={{ fontSize: '10px', background: '#f1f5f9', color: '#475569', padding: '1px 7px', borderRadius: '12px', fontWeight: 700, border: '1px solid #e2e8f0' }}>
                              Sub Branch
                            </span>
                          )}
                        </div>
                        <span style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.4 }}>
                          {branchForm.isMainBranch
                            ? '★ Designated as Main Branch. (If another branch was currently Main Branch, saving will automatically set it as a Sub Branch).'
                            : 'Currently set as a Sub Branch. Check this box to convert this location into the primary Main Branch.'}
                        </span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Manager & Contact */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Branch Manager & Contact Information
                </h3>
                {/* Top Row: Manager Name, Mobile, Email */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: !isEditing ? '16px' : '0' }}>
                  
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
                        setBranchForm({ ...branchForm, managerName: e.target.value, branchManager: e.target.value });
                        if (formErrors.managerName) setFormErrors({ ...formErrors, managerName: '' });
                      }}
                      onBlur={() => {
                        const val = (branchForm.managerName || '').trim();
                        if (!val) {
                          setFormErrors(prev => ({ ...prev, managerName: 'Branch Manager name is required.' }));
                        } else if (val.length < 2) {
                          setFormErrors(prev => ({ ...prev, managerName: 'Branch Manager name must be at least 2 characters.' }));
                        } else if (!/^[a-zA-Z\s.,'’-]+$/.test(val)) {
                          setFormErrors(prev => ({ ...prev, managerName: 'Branch Manager name must contain letters only (no numbers or special symbols).' }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.managerName ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        backgroundColor: formErrors.managerName ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.managerName ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                        backgroundColor: formErrors.mobileNumber ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.mobileNumber ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                        backgroundColor: formErrors.email ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.email ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                </div>

                {/* Bottom Row: Manager Password & Confirm Password Side-by-Side */}
                {!isEditing && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                        Manager Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name="branch_mgr_password_field"
                          autoComplete="new-password"
                          placeholder="Enter manager password"
                          value={branchForm.password}
                          onChange={e => {
                            setBranchForm({ ...branchForm, password: e.target.value });
                            if (formErrors.password) setFormErrors({ ...formErrors, password: '' });
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 42px 12px 16px',
                            borderRadius: '8px',
                            border: formErrors.password ? '1.5px solid #ef4444' : '1px solid var(--border)',
                            backgroundColor: formErrors.password ? '#fef2f2' : '#ffffff',
                            boxShadow: formErrors.password ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          {formErrors.password}
                        </span>
                      )}
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                        Confirm Password <span style={{ color: '#ef4444' }}>*</span>
                      </label>
                      <div style={{ position: 'relative' }}>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          name="branch_mgr_confirm_password_field"
                          autoComplete="new-password"
                          placeholder="Re-enter password"
                          value={branchForm.confirmPassword}
                          onChange={e => {
                            setBranchForm({ ...branchForm, confirmPassword: e.target.value });
                            if (formErrors.confirmPassword) setFormErrors({ ...formErrors, confirmPassword: '' });
                          }}
                          style={{
                            width: '100%',
                            padding: '12px 42px 12px 16px',
                            borderRadius: '8px',
                            border: formErrors.confirmPassword ? '1.5px solid #ef4444' : '1px solid var(--border)',
                            backgroundColor: formErrors.confirmPassword ? '#fef2f2' : '#ffffff',
                            boxShadow: formErrors.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                            color: '#64748b',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '4px'
                          }}
                          title={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                          {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                          {formErrors.confirmPassword}
                        </span>
                      )}
                    </div>

                    <div style={{ gridColumn: '1 / -1' }}>
                      <PasswordRequirements
                        password={branchForm.password}
                        confirmPassword={branchForm.confirmPassword}
                        showConfirmMatch={true}
                      />
                    </div>
                  </div>
                )}
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
                        backgroundColor: formErrors.address ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.address ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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
                          setBranchForm({ ...branchForm, city: e.target.value });
                          if (formErrors.city) setFormErrors({ ...formErrors, city: '' });
                        }}
                        onBlur={() => {
                          const val = (branchForm.city || '').trim();
                          if (!val) {
                            setFormErrors(prev => ({ ...prev, city: 'City is required.' }));
                          } else if (val.length < 2) {
                            setFormErrors(prev => ({ ...prev, city: 'City must be at least 2 characters.' }));
                          } else if (!/^[a-zA-Z\s.,'’-]+$/.test(val)) {
                            setFormErrors(prev => ({ ...prev, city: 'City must contain letters only (no numbers or special symbols).' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.city ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          backgroundColor: formErrors.city ? '#fef2f2' : '#ffffff',
                          boxShadow: formErrors.city ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.city && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block', fontWeight: 600 }}>{formErrors.city}</span>
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
                          setBranchForm({ ...branchForm, state: e.target.value });
                          if (formErrors.state) setFormErrors({ ...formErrors, state: '' });
                        }}
                        onBlur={() => {
                          const val = (branchForm.state || '').trim();
                          if (!val) {
                            setFormErrors(prev => ({ ...prev, state: 'State is required.' }));
                          } else if (val.length < 2) {
                            setFormErrors(prev => ({ ...prev, state: 'State must be at least 2 characters.' }));
                          } else if (!/^[a-zA-Z\s.,'’&-]+$/.test(val)) {
                            setFormErrors(prev => ({ ...prev, state: 'State must contain letters only (no numbers or special symbols).' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.state ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          backgroundColor: formErrors.state ? '#fef2f2' : '#ffffff',
                          boxShadow: formErrors.state ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.state && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block', fontWeight: 600 }}>{formErrors.state}</span>
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
                          setBranchForm({ ...branchForm, country: e.target.value });
                          if (formErrors.country) setFormErrors({ ...formErrors, country: '' });
                        }}
                        onBlur={() => {
                          const val = (branchForm.country || '').trim();
                          if (!val) {
                            setFormErrors(prev => ({ ...prev, country: 'Country is required.' }));
                          } else if (val.length < 2) {
                            setFormErrors(prev => ({ ...prev, country: 'Country must be at least 2 characters.' }));
                          } else if (!/^[a-zA-Z\s.,'’-]+$/.test(val)) {
                            setFormErrors(prev => ({ ...prev, country: 'Country must contain letters only (no numbers or special symbols).' }));
                          }
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 14px',
                          borderRadius: '8px',
                          border: formErrors.country ? '1.5px solid #ef4444' : '1px solid var(--border)',
                          backgroundColor: formErrors.country ? '#fef2f2' : '#ffffff',
                          boxShadow: formErrors.country ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                          fontSize: '13px',
                          boxSizing: 'border-box'
                        }}
                      />
                      {formErrors.country && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block', fontWeight: 600 }}>{formErrors.country}</span>
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
                          backgroundColor: formErrors.pincode ? '#fef2f2' : '#ffffff',
                          boxShadow: formErrors.pincode ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
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

              {/* Section 4: Tax & Compliance */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  4. Tax & Compliance
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      GSTIN (GST Identification Number)
                    </label>
                    <input
                      type="text"
                      maxLength={15}
                      placeholder="15-character GSTIN (e.g. 33AAAAA0000A1Z5)"
                      value={branchForm.gstNumber}
                      onChange={e => {
                        const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 15);
                        setBranchForm({ ...branchForm, gstNumber: val });
                        if (formErrors.gstNumber) setFormErrors({ ...formErrors, gstNumber: '' });
                      }}
                      onBlur={() => {
                        const val = (branchForm.gstNumber || '').trim();
                        if (val) {
                          const gstErr = validateGstin(val);
                          if (gstErr) setFormErrors(prev => ({ ...prev, gstNumber: gstErr }));
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.gstNumber ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        backgroundColor: formErrors.gstNumber ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.gstNumber ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.gstNumber && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.gstNumber}
                      </span>
                    )}
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      FSSAI License Number
                    </label>
                    <input
                      type="text"
                      maxLength={14}
                      inputMode="numeric"
                      placeholder="14-digit FSSAI number (e.g. 12421008000123)"
                      value={branchForm.fssaiNumber}
                      onChange={e => {
                        const val = e.target.value.replace(/[^0-9]/g, '').slice(0, 14);
                        setBranchForm({ ...branchForm, fssaiNumber: val });
                        if (formErrors.fssaiNumber) setFormErrors({ ...formErrors, fssaiNumber: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.fssaiNumber ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        backgroundColor: formErrors.fssaiNumber ? '#fef2f2' : '#ffffff',
                        boxShadow: formErrors.fssaiNumber ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.fssaiNumber && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.fssaiNumber}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 5: Billing Configuration */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  5. Billing Configuration
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Invoice / Bill Prefix
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. INV- or BILL- or SR-"
                      value={branchForm.billPrefix}
                      onChange={e => setBranchForm({ ...branchForm, billPrefix: e.target.value.toUpperCase() })}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Menu Configuration */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  6. Menu Configuration
                </h3>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <input
                    type="checkbox"
                    id="branchUseCustomMenu"
                    checked={!!branchForm.useCustomMenu}
                    onChange={e => setBranchForm({ ...branchForm, useCustomMenu: e.target.checked })}
                    style={{ width: '18px', height: '18px', marginTop: '2px', accentColor: 'var(--primary)', cursor: 'pointer' }}
                  />
                  <label htmlFor="branchUseCustomMenu" style={{ cursor: 'pointer', userSelect: 'none' }}>
                    <span style={{ display: 'block', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                      Create separate / custom menu for this branch
                    </span>
                    <span style={{ display: 'block', fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: 1.4 }}>
                      If unchecked, this branch will use the standard company menu. Enable this to create and manage an independent custom menu for this branch.
                    </span>
                  </label>
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
    <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '80px' }}>
      
      {/* 1. Header & Actions Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 600, color: 'var(--text-main)', fontFamily: "'Outfit', sans-serif" }}>
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

      {/* 1. Branch Metrics & Quota Cards (First) */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '16px', width: '100%', boxSizing: 'border-box' }}>
        
        {/* Card 1: Total Branches */}
        <div 
          className="stat-card" 
          style={{ 
            borderLeft: '5px solid var(--primary)', 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '18px 20px',
            borderRadius: '12px'
          }}
        >
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info" style={{ width: '100%', minWidth: 0 }}>
              <div className="stat-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Total Branches
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0', color: 'var(--black)', fontFamily: "'Outfit', sans-serif" }}>
                {totalBranchesCount}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>All registered outlets</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', flexShrink: 0 }}>
              <BuildingStoreIcon size={20} color="var(--primary)" />
            </div>
          </div>
        </div>

        {/* Card 2: Active Branches */}
        <div 
          className="stat-card" 
          style={{ 
            borderLeft: '5px solid #16a34a', 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '18px 20px',
            borderRadius: '12px'
          }}
        >
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info" style={{ width: '100%', minWidth: 0 }}>
              <div className="stat-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Active Branches
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0', color: '#16a34a', fontFamily: "'Outfit', sans-serif" }}>
                {activeBranchesCount}
              </h3>
              <div style={{ fontSize: '12px', color: '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>● Operational & Live</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16a34a', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 3: Inactive Branches */}
        <div 
          className="stat-card" 
          style={{ 
            borderLeft: '5px solid #64748b', 
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            padding: '18px 20px',
            borderRadius: '12px'
          }}
        >
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info" style={{ width: '100%', minWidth: 0 }}>
              <div className="stat-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Inactive Branches
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0', color: '#64748b', fontFamily: "'Outfit', sans-serif" }}>
                {Math.max(0, branches.length - activeBranchesCount)}
              </h3>
              <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>Paused / offline</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', flexShrink: 0 }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="10" y1="15" x2="10" y2="9" />
                <line x1="14" y1="15" x2="14" y2="9" />
              </svg>
            </div>
          </div>
        </div>

        {/* Card 4: Plan Quota / Capacity */}
        <div 
          className="stat-card" 
          onClick={() => {
            if (branches.length >= totalAllowedBranches) {
              handleOpenAddForm();
            } else {
              navigate('/plans-management');
            }
          }}
          style={{ 
            borderLeft: `5px solid ${remainingBranchSlots === 0 ? '#ea580c' : '#8b5cf6'}`, 
            cursor: 'pointer',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            transition: 'all 0.2s ease',
            padding: '18px 20px',
            borderRadius: '12px'
          }}
          title="Click to view subscription plan details or manage branch quota"
        >
          <div className="stat-main-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div className="stat-info" style={{ width: '100%', minWidth: 0 }}>
              <div className="stat-label" style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>
                Plan Capacity ({planName})
              </div>
              <h3 style={{ fontSize: '26px', fontWeight: 800, margin: '6px 0', color: remainingBranchSlots === 0 ? '#ea580c' : '#8b5cf6', fontFamily: "'Outfit', sans-serif" }}>
                {branches.length} <span style={{ fontSize: '16px', fontWeight: 600, color: '#94a3b8' }}>/ {totalAllowedBranches}</span>
              </h3>
              <div style={{ fontSize: '12px', color: remainingBranchSlots === 0 ? '#ea580c' : '#16a34a', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{remainingBranchSlots === 0 ? '⚠️ Limit Reached (Upgrade)' : `✓ ${remainingBranchSlots} Slot${remainingBranchSlots === 1 ? '' : 's'} Remaining`}</span>
              </div>
            </div>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: remainingBranchSlots === 0 ? '#fff7ed' : '#f5f3ff', display: 'flex', alignItems: 'center', justifyContent: 'center', color: remainingBranchSlots === 0 ? '#ea580c' : '#8b5cf6', flexShrink: 0 }}>
              <TreeIcon size={20} color={remainingBranchSlots === 0 ? '#ea580c' : '#8b5cf6'} />
            </div>
          </div>
        </div>

      </div>

      {/* 2. Branch Search & Filter Bar (Next) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap', background: '#fff', padding: '16px 20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '260px', maxWidth: '380px' }}>
          <input
            type="search"
            data-search="true"
            placeholder="Search branch by name, code or city..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value.replace(/\s+/g, ''))}
            onKeyDown={(e) => { if (e.key === ' ' || e.code === 'Space') e.preventDefault(); }}
            style={{ width: '100%', height: '38px', padding: '0 12px 0 34px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
          />
          <span style={{ position: 'absolute', left: '11px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none', fontSize: '14px' }}>🔍</span>
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '14px', padding: 0 }}
            >
              ✕
            </button>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ height: '38px', padding: '0 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff', cursor: 'pointer', fontWeight: 600 }}
          >
            <option value="All">All Branches</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* 3. Branch List Table (Third) */}
      <div style={{ width: '100%', overflowX: 'auto', paddingBottom: '6px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <table style={{ width: '100%', minWidth: '1500px', borderCollapse: 'collapse', fontSize: '13px' }}>
          <colgroup>
            <col style={{ width: '60px' }} />
            <col style={{ width: '135px' }} />
            <col style={{ width: '280px' }} />
            <col style={{ width: '160px' }} />
            <col style={{ width: '180px' }} />
            <col style={{ width: '135px' }} />
            <col style={{ width: '130px' }} />
            <col style={{ width: '85px' }} />
            <col style={{ width: '105px' }} />
            <col style={{ width: '125px' }} />
            <col style={{ width: '125px' }} />
          </colgroup>
          <thead>
            <tr style={{ backgroundColor: '#f95e10', color: '#ffffff' }}>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>S/NO</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Branch Code</th>
              <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Branch Name</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Menu Type</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Manager</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Mobile</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>City</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Tables</th>
              <th style={{ padding: '14px 10px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Status</th>
              <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Created Date</th>
              <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 600, fontSize: '14px', textTransform: 'uppercase', letterSpacing: '0.6px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap', backgroundColor: '#f95e10' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredBranches.length === 0 ? (
              <tr>
                <td colSpan="11" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                  No branches found matching your search.
                </td>
              </tr>
            ) : (
              paginatedBranches.map((b, idx) => {
                const sNo = page * limit + idx + 1;
                const createdDateStr = b.openingDate ? b.openingDate.split('T')[0] : (b.createdAt ? b.createdAt.split('T')[0] : 'N/A');

                return (
                <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  
                  {/* S/NO */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center', fontWeight: 700, color: '#64748b', fontSize: '12px' }}>
                    {sNo}
                  </td>

                  {/* 1. Branch Code */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <span style={{ background: '#fff7ed', color: '#ea580c', border: '1px solid #fed7aa', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, fontFamily: 'monospace', display: 'inline-block' }}>
                      {b.branchCode}
                    </span>
                  </td>

                  {/* 2. Branch Name (Professional Style) */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle', textAlign: 'left' }}>
                    {/* Name and Address info */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'nowrap' }}>
                        <span style={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '13.5px',
                          letterSpacing: '-0.1px',
                          whiteSpace: 'nowrap'
                        }}>
                          {b.branchName || b.name}
                        </span>
                          {b.isMainBranch && (
                            <span style={{
                              fontSize: '10px',
                              background: '#fef3c7',
                              color: '#b45309',
                              padding: '2px 7px',
                              borderRadius: '12px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                              border: '1px solid #fde68a',
                              flexShrink: 0,
                              lineHeight: 1.2
                            }} title="Main Branch">
                              ★ Main
                            </span>
                          )}
                        </div>
                        {b.address && (
                          <div
                            style={{
                              fontSize: '12px',
                              color: '#64748b',
                              lineHeight: '1.35',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              maxWidth: '240px'
                            }}
                            title={typeof b.address === 'object' && b.address !== null
                              ? (b.address.street || b.address.city || '')
                              : b.address}
                          >
                            <MapPinIcon size={12} color="#94a3b8" />
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {typeof b.address === 'object' && b.address !== null
                                ? (b.address.street || b.address.city || '')
                                : b.address}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                  {/* 3. Menu Type (Dedicated Column) */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {(() => {
                      // If logged in to a specific branch or a branch is selected:
                      // Only show menu type for that branch. Don't show other branch menu types!
                      if (activeBranchContextId && !isBranchCurrentActive(b)) {
                        return (
                          <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: 600 }} title="Menu type hidden for other branches">
                            —
                          </span>
                        );
                      }

                      return b.useCustomMenu ? (
                        <span style={{
                          fontSize: '11px',
                          background: '#ecfdf5',
                          color: '#065f46',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          border: '1px solid #a7f3d0',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }} title="This branch has its own independent menu">
                          <span style={{ fontSize: '12px' }}>🍽️</span> Custom Menu
                        </span>
                      ) : (
                        <span style={{
                          fontSize: '11px',
                          background: '#eff6ff',
                          color: '#1e40af',
                          padding: '5px 12px',
                          borderRadius: '20px',
                          fontWeight: 700,
                          border: '1px solid #bfdbfe',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
                        }} title="This branch uses Company Menu">
                          <span style={{ fontSize: '12px' }}>🏢</span> Company Menu
                        </span>
                      );
                    })()}
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

                  {/* 4. Mobile */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left', whiteSpace: 'nowrap' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                      {b.mobileNumber || 'N/A'}
                    </div>
                  </td>

                  {/* 5. City */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'left' }}>
                    <div style={{ color: '#334155', fontWeight: 600, fontSize: '13px' }}>
                      {b.city || 'N/A'}
                    </div>
                  </td>

                  {/* 6. Tables */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center' }}>
                    <span style={{ background: '#f1f5f9', color: '#334155', padding: '3px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
                      {b.totalTables || b.tablesCount || b.capacity || b.seatingCapacity || (Array.isArray(b.tables) && b.tables.length > 0 ? b.tables.length : 0) || getBranchMetadataFromStorage(b.id || b._id, b.branchCode)?.totalTables || getBranchMetadataFromStorage(b.id || b._id, b.branchCode)?.tablesCount || 0}
                    </span>
                  </td>

                  {/* 7. Status */}
                  <td style={{ padding: '14px 10px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <Badge status={b.status === 'Active' ? 'Active' : 'Inactive'} />
                    </div>
                  </td>

                  {/* 8. Created Date */}
                  <td style={{ padding: '14px 14px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap', color: '#64748b', fontSize: '12px', fontWeight: 600 }}>
                    {createdDateStr}
                  </td>

                  {/* 9. Actions */}
                  <td style={{ padding: '14px 12px', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                      {hasPermission('branch-management', 'view') && (
                      <button
                        type="button"
                        title="View Details"
                        onClick={() => handleOpenHierarchy(b)}
                        style={{ border: 'none', background: '#eff6ff', color: '#2563eb', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                        onMouseEnter={e => e.currentTarget.style.background = '#dbeafe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#eff6ff'}
                      >
                        <EyeIcon size={14} />
                      </button>
                      )}

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


                      {hasPermission('branch-management', 'edit') && (
                        <button
                          type="button"
                          title={b.status === 'Active' ? 'Deactivate / Lock Branch' : 'Activate / Unlock Branch'}
                          onClick={() => handleToggleBranchStatus(b)}
                          style={{
                            border: `1px solid ${b.status === 'Active' ? '#bbf7d0' : '#fecaca'}`,
                            background: b.status === 'Active' ? '#f0fdf4' : '#fef2f2',
                            color: b.status === 'Active' ? '#16a34a' : '#dc2626',
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                            flexShrink: 0
                          }}
                          onMouseEnter={e => e.currentTarget.style.background = b.status === 'Active' ? '#dcfce7' : '#fee2e2'}
                          onMouseLeave={e => e.currentTarget.style.background = b.status === 'Active' ? '#f0fdf4' : '#fef2f2'}
                        >
                          {b.status === 'Active' ? <UnlockIcon size={15} color="#16a34a" /> : <LockIcon size={15} color="#dc2626" />}
                        </button>
                      )}

                      {hasPermission('branch-management', 'edit') && (
                        <button
                          type="button"
                          title="Forgot / Reset Password"
                          onClick={() => handleOpenResetPasswordModal(b)}
                          style={{ border: 'none', background: '#f5f3ff', color: '#7c3aed', width: '30px', height: '30px', borderRadius: '6px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.15s', flexShrink: 0 }}
                          onMouseEnter={e => e.currentTarget.style.background = '#ede9fe'}
                          onMouseLeave={e => e.currentTarget.style.background = '#f5f3ff'}
                        >
                          <KeyIcon size={14} />
                        </button>
                      )}

                      {hasPermission('branch-management', 'delete') && (
                        <button
                          type="button"
                          title={b.isMainBranch ? "Main Branch cannot be deleted" : "Delete Branch"}
                          disabled={b.isMainBranch}
                          onClick={() => handleDeleteBranchClick(b)}
                          style={{
                            border: 'none',
                            background: b.isMainBranch ? '#f8fafc' : '#fef2f2',
                            color: b.isMainBranch ? '#94a3b8' : '#ef4444',
                            width: '30px',
                            height: '30px',
                            borderRadius: '6px',
                            cursor: b.isMainBranch ? 'not-allowed' : 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.15s',
                            flexShrink: 0,
                            opacity: b.isMainBranch ? 0.6 : 1
                          }}
                          onMouseEnter={e => {
                            if (!b.isMainBranch) {
                              e.currentTarget.style.color = '#b91c1c';
                              e.currentTarget.style.background = '#fee2e2';
                            }
                          }}
                          onMouseLeave={e => {
                            if (!b.isMainBranch) {
                              e.currentTarget.style.color = '#ef4444';
                              e.currentTarget.style.background = '#fef2f2';
                            }
                          }}
                        >
                          <TrashIcon size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                  </tr>
                );
              })
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
      <DeleteConfirmationModal
        isOpen={!!branchToDelete}
        onClose={() => setBranchToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Branch Deletion"
        itemType="branch"
        itemName={branchToDelete?.branchName ? `${branchToDelete.branchName} (${branchToDelete.branchCode})` : branchToDelete?.branchCode}
        confirmText="Delete Branch"
      />

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

      {/* RESET BRANCH MANAGER PASSWORD MODAL */}
      {resetPasswordBranch && (
        <Modal
          isOpen={Boolean(resetPasswordBranch)}
          onClose={() => {
            if (!isSavingResetPassword) {
              setResetPasswordBranch(null);
              setNewPassword('');
              setConfirmNewPassword('');
              setResetPasswordError('');
              setShowResetPassword(false);
              setShowResetConfirmPassword(false);
            }
          }}
          title={`🔑 Reset / Forgot Password — ${resetPasswordBranch.branchName || resetPasswordBranch.name}`}
          maxWidth="460px"
        >
          <form onSubmit={handleSaveResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
              Set or reset the login password for branch manager <strong>{resetPasswordBranch.branchManager || resetPasswordBranch.managerName || 'Manager'}</strong> ({resetPasswordBranch.branchCode}).
            </p>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={e => {
                    setNewPassword(e.target.value);
                    if (resetPasswordErrors?.newPassword) setResetPasswordErrors(prev => ({ ...prev, newPassword: '' }));
                    if (resetPasswordError) setResetPasswordError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    borderRadius: '8px',
                    border: resetPasswordErrors?.newPassword ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: resetPasswordErrors?.newPassword ? '#fef2f2' : '#ffffff',
                    boxShadow: resetPasswordErrors?.newPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowResetPassword(!showResetPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  title={showResetPassword ? "Hide password" : "Show password"}
                >
                  {showResetPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {resetPasswordErrors?.newPassword && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {resetPasswordErrors.newPassword}
                </span>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                Confirm New Password <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showResetConfirmPassword ? 'text' : 'password'}
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={e => {
                    setConfirmNewPassword(e.target.value);
                    if (resetPasswordErrors?.confirmPassword) setResetPasswordErrors(prev => ({ ...prev, confirmPassword: '' }));
                    if (resetPasswordError) setResetPasswordError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '10px 40px 10px 14px',
                    borderRadius: '8px',
                    border: resetPasswordErrors?.confirmPassword ? '1.5px solid #ef4444' : '1px solid #cbd5e1',
                    backgroundColor: resetPasswordErrors?.confirmPassword ? '#fef2f2' : '#ffffff',
                    boxShadow: resetPasswordErrors?.confirmPassword ? '0 0 0 3px rgba(239, 68, 68, 0.15)' : 'none',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowResetConfirmPassword(!showResetConfirmPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748b'
                  }}
                  title={showResetConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showResetConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
              {resetPasswordErrors?.confirmPassword && (
                <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                  {resetPasswordErrors.confirmPassword}
                </span>
              )}
              {resetPasswordErrors?.general && (
                <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '6px', padding: '6px 10px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', display: 'block', fontWeight: 600 }}>
                  {resetPasswordErrors.general}
                </span>
              )}
            </div>

            {/* Real-time Password Requirements Checklist */}
            <PasswordRequirements
              password={newPassword}
              confirmPassword={confirmNewPassword}
              showConfirmMatch={true}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <button
                type="button"
                onClick={() => {
                  setResetPasswordBranch(null);
                  setNewPassword('');
                  setConfirmNewPassword('');
                  setResetPasswordError('');
                  setShowResetPassword(false);
                  setShowResetConfirmPassword(false);
                }}
                style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#ffffff', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSavingResetPassword}
                style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: 'var(--primary)', color: '#ffffff', fontSize: '12px', fontWeight: 700, cursor: isSavingResetPassword ? 'wait' : 'pointer' }}
              >
                {isSavingResetPassword ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          </form>
        </Modal>
      )}

    </div>
  );
}
