import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BranchApi from '../api/Branch.js';
import SubscriptionApi from '../api/Subscription.js';
import UserApi from '../api/User.js';
import StaffApi from '../api/Staff.js';
import OrderApi from '../api/Order.js';
import TableApi from '../api/Table.js';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import SearchableSelect from './SearchableSelect.jsx';
import { OtpPasswordInput } from './OtpPasswordInput';
import { resolveBranchManagerName } from '../helper/BranchHelper.js';
import {
  sanitizeName,
  sanitizeMobile,
  validateName,
  validateMobile,
  validateEmail,
  validateRequired,
  validatePincode,
  validateBranchName,
  validateBranchCode
} from '../helper/ValidationHelper';

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
  const { currentUser, activeRestaurant, addBranch, updateBranch, deleteBranch, purchaseExtraBranchSlots } = useAppState();

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
  const [isLoading, setIsLoading] = useState(false);
  const [liveBranchStaff, setLiveBranchStaff] = useState([]);
  const [liveBranchOrders, setLiveBranchOrders] = useState([]);
  const [liveBranchTables, setLiveBranchTables] = useState([]);
  const [isLoadingOpData, setIsLoadingOpData] = useState(false);

  const fetchBranches = async () => {
    setIsLoading(true);
    try {
      const [res, usersRes, staffRes] = await Promise.allSettled([
        BranchApi.getBranches(),
        UserApi.getUsers({ limit: 100 }),
        StaffApi.getStaff()
      ]);

      const branchResponse = res.status === 'fulfilled' ? res.value : null;
      const usersList = (usersRes.status === 'fulfilled' && usersRes.value?.status && Array.isArray(usersRes.value.response?.data))
        ? usersRes.value.response.data
        : [];
      const staffList = (staffRes.status === 'fulfilled' && staffRes.value?.status && Array.isArray(staffRes.value.response?.data))
        ? staffRes.value.response.data
        : [];

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
      const [usersRes, staffApiRes, ordersRes, tablesRes] = await Promise.allSettled([
        UserApi.getUsers({ branchId, limit: 100 }),
        StaffApi.getStaff(branchId),
        OrderApi.getOrders({ branchId, limit: 100 }),
        TableApi.getTables({ branchId, limit: 100 })
      ]);

      let finalStaff = [];
      if (usersRes.status === 'fulfilled' && usersRes.value?.status) {
        const raw = usersRes.value.response?.data || usersRes.value.response?.users || usersRes.value.response?.staff || (Array.isArray(usersRes.value.response) ? usersRes.value.response : []);
        finalStaff = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : (Array.isArray(raw?.users) ? raw.users : []));
      }
      if (finalStaff.length === 0 && staffApiRes.status === 'fulfilled' && staffApiRes.value?.status) {
        const rawStaff = staffApiRes.value.response?.data || (Array.isArray(staffApiRes.value.response) ? staffApiRes.value.response : []);
        finalStaff = Array.isArray(rawStaff) ? rawStaff : [];
      }
      setLiveBranchStaff(finalStaff);

      if (ordersRes.status === 'fulfilled' && ordersRes.value?.status) {
        const rawOrders = ordersRes.value.response?.data || ordersRes.value.response?.orders || (Array.isArray(ordersRes.value.response) ? ordersRes.value.response : []);
        setLiveBranchOrders(Array.isArray(rawOrders) ? rawOrders : (Array.isArray(rawOrders?.data) ? rawOrders.data : []));
      }
      if (tablesRes.status === 'fulfilled' && tablesRes.value?.status) {
        const rawTables = tablesRes.value.response?.data || tablesRes.value.response?.tables || (Array.isArray(tablesRes.value.response) ? tablesRes.value.response : []);
        setLiveBranchTables(Array.isArray(rawTables) ? rawTables : (Array.isArray(rawTables?.data) ? rawTables.data : []));
      }
    } catch (e) {
      console.error("Error fetching branch operational data:", e);
    } finally {
      setIsLoadingOpData(false);
    }
  }, []);

  useEffect(() => {
    if (isRestaurantOwner) {
      fetchBranches();
    }
  }, [isRestaurantOwner]);

  const branches = apiBranches;

  // Subscription Plan details & calculations
  const sub = activeRestaurant?.subscription || {
    planName: activeRestaurant?.plan || 'Standard',
    baseBranchLimit: 3,
    extraBranchSlots: 0,
    extraBranchPrice: 699
  };
  const baseBranchLimit = sub.baseBranchLimit || 3;
  const extraBranchSlots = sub.extraBranchSlots || 0;
  const totalAllowedBranches = baseBranchLimit + extraBranchSlots;
  const remainingBranchSlots = Math.max(0, totalAllowedBranches - branches.length);
  const extraBranchUnitPrice = sub.extraBranchPrice || 699;
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

    // Check Plan Limits
    if (branches.length >= totalAllowedBranches) {
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
    }

    // 6. Email Address validation
    const emailTrimmed = (branchForm.email || '').trim();
    const emailErr = validateEmail(emailTrimmed);
    if (emailErr) {
      errors.email = emailErr;
    }

    // 7. Password & Confirm Password validation
    const hasPassword = Boolean(branchForm.password && branchForm.password.trim());
    const hasConfirm = Boolean(branchForm.confirmPassword && branchForm.confirmPassword.trim());

    if (!isEditing) {
      if (!hasPassword) {
        errors.password = 'Password is required.';
      } else if (branchForm.password.length < 6) {
        errors.password = 'Password must be at least 6 characters.';
      }

      // Confirm Password validation
      if (!hasConfirm) {
        errors.confirmPassword = 'Confirm password is required.';
      } else if (branchForm.password !== branchForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    } else {
      // In edit mode: validate if user types a new password or confirm password
      if (hasPassword || hasConfirm) {
        if (!hasPassword) {
          errors.password = 'New password is required.';
        } else if (branchForm.password.length < 6) {
          errors.password = 'New password must be at least 6 characters.';
        }

        if (!hasConfirm) {
          errors.confirmPassword = 'Confirm password is required.';
        } else if (branchForm.password !== branchForm.confirmPassword) {
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

    // 12. Pincode validation
    const pincodeTrimmed = (branchForm.pincode || '').trim();
    const pincodeErr = validatePincode(pincodeTrimmed);
    if (pincodeErr) {
      errors.pincode = pincodeErr;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      const hasEmptyRequiredField = 
        !branchForm.branchName?.trim() ||
        !branchForm.branchCode?.trim() ||
        !branchForm.openingDate ||
        !(branchForm.managerName?.trim() || branchForm.branchManager?.trim()) ||
        !branchForm.mobileNumber?.trim() ||
        !branchForm.email?.trim() ||
        (!isEditing && (!branchForm.password?.trim() || !branchForm.confirmPassword?.trim())) ||
        !branchForm.address?.trim() ||
        !branchForm.city?.trim() ||
        !branchForm.state?.trim() ||
        !branchForm.country?.trim() ||
        !branchForm.pincode?.trim();

      if (hasEmptyRequiredField) {
        ShowNotifications.showAlertNotification('Please fill in the all required fields', false);
      } else {
        ShowNotifications.showAlertNotification('Please fix the errors in the form before submitting.', false);
      }
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

    if (branchForm.password && branchForm.password.trim()) {
      payload.managerPassword = branchForm.password.trim();
      payload.password = branchForm.password.trim();
    }

    if (isEditing) {
      if (!hasPermission('branch-management', 'edit')) {
        ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
        return;
      }

      const res = await BranchApi.updateBranch(branchForm.id, payload);
      if (res && res.status) {
        setApiBranches(prev => prev.map(b => (b.id === branchForm.id || b._id === branchForm.id) ? { ...b, ...payload, branchManager: managerVal, managerName: managerVal } : b));
        if (activeRestaurant?.id && updateBranch) {
          updateBranch(activeRestaurant.id, branchForm.id, {
            ...payload,
            branchManager: managerVal,
            managerName: managerVal
          });
        }
        await fetchBranches();
        setActiveView('list');
      }
    } else {
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
        setActiveView('list');
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
    }
  }, [activeView, currentViewBranch, fetchBranchOperationalData]);

  // Live computed operational data for current branch
  const opData = (() => {
    const curBranch = currentViewBranch;
    const curBranchId = String(curBranch?.id || curBranch?._id || '').toLowerCase();
    const curBranchCode = String(curBranch?.branchCode || curBranch?.code || '').toLowerCase();
    const curBranchName = String(curBranch?.branchName || curBranch?.name || '').toLowerCase();

    const matchesBranch = (itemBranch) => {
      if (!itemBranch || !curBranch) return false;
      let targetId = '';
      let targetCode = '';
      let targetName = '';
      if (typeof itemBranch === 'object' && itemBranch !== null) {
        targetId = String(itemBranch._id || itemBranch.id || '').toLowerCase();
        targetCode = String(itemBranch.branchCode || itemBranch.code || '').toLowerCase();
        targetName = String(itemBranch.branchName || itemBranch.name || '').toLowerCase();
      } else {
        targetId = String(itemBranch).toLowerCase();
      }
      return (
        (curBranchId && targetId && curBranchId === targetId) ||
        (curBranchCode && targetCode && curBranchCode === targetCode) ||
        (curBranchCode && targetId && curBranchCode === targetId) ||
        (curBranchName && targetName && curBranchName === targetName) ||
        (curBranchName && targetId && curBranchName === targetId)
      );
    };

    // 1. Staff list
    const branchStaffRaw = (liveBranchStaff.length > 0)
      ? liveBranchStaff
      : (activeRestaurant?.staff || []).filter(s => matchesBranch(s.branchId || s.branch));

    const mappedStaff = branchStaffRaw.map(person => {
      const pName = person.name || 'Staff Member';
      const roleName = person.roleId?.roleName || person.role?.roleName || person.role || person.userType || 'Staff';
      const pEmail = person.email || person.phoneNumber || `${pName.toLowerCase().replace(/\s+/g, '.')}@serviq.in`;
      const pStatus = (person.status || (person.isActive !== false ? 'Active' : 'Inactive'));

      return {
        name: pName,
        role: roleName,
        email: pEmail,
        status: pStatus,
        initial: (pName.trim().charAt(0) || 'S').toUpperCase()
      };
    });

    // Auto-include Branch Manager if assigned to this branch and not yet in list
    const managerName = curBranch?.branchManager || curBranch?.managerName;
    if (managerName && managerName.trim() && !mappedStaff.some(s => s.name.toLowerCase() === managerName.trim().toLowerCase())) {
      mappedStaff.unshift({
        name: managerName.trim(),
        role: 'Branch Manager',
        email: curBranch.email || `${managerName.toLowerCase().replace(/\s+/g, '.')}@serviq.in`,
        status: 'Active',
        initial: (managerName.trim().charAt(0) || 'M').toUpperCase()
      });
    }

    // 2. Orders list
    const branchOrdersRaw = (liveBranchOrders.length > 0)
      ? liveBranchOrders
      : (activeRestaurant?.orders || []).filter(o => matchesBranch(o.branchId || o.branch));

    const activeOrders = branchOrdersRaw.filter(o => {
      const st = String(o.status || '').toLowerCase();
      return st !== 'cancelled' && st !== 'rejected';
    });

    const mappedOrders = activeOrders.map(ord => {
      const ordId = ord.orderId || ord.id || (ord._id ? `#${String(ord._id).slice(-5).toUpperCase()}` : '#ORD-101');
      const tableStr = ord.tableNumber || ord.tableNo || (typeof ord.table === 'object' ? (ord.table?.tableNumber || ord.table?.name) : ord.table) || (typeof ord.tableId === 'object' ? (ord.tableId?.tableNumber || ord.tableId?.name) : ord.tableId) || 'Table 1';
      const itemsStr = Array.isArray(ord.items)
        ? ord.items.map(i => `${i.quantity || i.qty || 1}x ${i.name || i.menuItem?.name || 'Item'}`).join(', ')
        : (typeof ord.items === 'string' ? ord.items : 'Items Ordered');
      const totalAmount = typeof ord.total === 'number' ? `₹${ord.total.toLocaleString('en-IN')}` : (ord.total || '₹0');
      const timeStr = ord.createdAt ? new Date(ord.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '5 mins ago';

      let st = 'preparing';
      const rawSt = String(ord.status || '').toLowerCase();
      if (rawSt === 'ready' || rawSt === 'ready to serve') st = 'ready';
      else if (rawSt === 'served' || rawSt === 'delivered' || rawSt === 'completed') st = 'served';

      return {
        id: ordId,
        table: String(tableStr).startsWith('Table') ? tableStr : `Table ${tableStr}`,
        items: itemsStr,
        total: totalAmount,
        time: timeStr,
        status: st
      };
    });

    // 3. Tables list
    const branchTablesRaw = (liveBranchTables.length > 0)
      ? liveBranchTables
      : (activeRestaurant?.tables || []).filter(t => matchesBranch(t.branchId || t.branch));

    const mappedTables = branchTablesRaw.length > 0
      ? branchTablesRaw.map((t, i) => ({
          name: t.tableNo || t.tableNumber || (t.name ? t.name : `T-0${i + 1}`),
          seats: t.capacity || t.seats || 4,
          status: t.status || 'Available'
        }))
      : Array.from({ length: currentViewBranch?.totalTables || 10 }).map((_, i) => ({
          name: `T-${String(i + 1).padStart(2, '0')}`,
          seats: 4,
          status: 'Available'
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

        {/* Simplified 2-Column Info & Metrics Section */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
          
          {/* Left Column: Branch Info & Compliance Card */}
          <div style={{ flex: '1', minWidth: '320px', background: '#ffffff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
                Branch Information
              </h3>
              <button
                type="button"
                onClick={() => handleOpenEditForm(currentViewBranch)}
                style={{ border: 'none', background: '#f1f5f9', color: '#334155', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <PencilIcon size={12} /> Edit
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '40px', height: '40px', minWidth: '40px', minHeight: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)', color: '#fff', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, lineHeight: 1 }}>
                {((currentViewBranch?.managerName || currentViewBranch?.branchManager) && (currentViewBranch?.managerName || currentViewBranch?.branchManager).trim() && !['unassigned', 'null', 'undefined'].includes((currentViewBranch?.managerName || currentViewBranch?.branchManager).trim().toLowerCase()) ? (currentViewBranch.managerName || currentViewBranch.branchManager).trim().charAt(0) : 'U').toUpperCase()}
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Manager</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{(!currentViewBranch?.managerName && !currentViewBranch?.branchManager) || ['unassigned', 'null', 'undefined'].includes((currentViewBranch?.managerName || currentViewBranch?.branchManager || '').toLowerCase()) ? 'Unassigned Manager' : (currentViewBranch?.managerName || currentViewBranch?.branchManager)}</div>
                <div style={{ fontSize: '12px', color: '#3b82f6', fontWeight: 600 }}>{currentViewBranch?.mobileNumber}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700 }}>Email Address</span>
                <strong style={{ color: '#0f172a', wordBreak: 'break-all' }}>{currentViewBranch?.email || 'N/A'}</strong>
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', display: 'block', fontWeight: 700 }}>Opening Date</span>
                <strong style={{ color: '#0f172a' }}>{currentViewBranch?.openingDate || '2026-01-15'}</strong>
              </div>
            </div>

            <div style={{ fontSize: '12px', color: '#475569' }}>
              <strong>Full Street Address:</strong>
              <div style={{ color: '#0f172a', fontWeight: 600, marginTop: '4px' }}>
                {typeof currentViewBranch?.address === 'object' && currentViewBranch?.address !== null
                  ? `${currentViewBranch.address.street || ''}${currentViewBranch.address.city ? `, ${currentViewBranch.address.city}` : ''}${currentViewBranch.address.state ? `, ${currentViewBranch.address.state}` : ''}${currentViewBranch.address.pincode ? ` - ${currentViewBranch.address.pincode}` : ''}`
                  : `${currentViewBranch?.address || ''}, ${currentViewBranch?.city || ''}, ${currentViewBranch?.state || ''} - ${currentViewBranch?.pincode || ''} (${currentViewBranch?.country || 'India'})`}
              </div>
            </div>
          </div>

          {/* Right Column: Clean 2x2 Metrics Grid */}
          <div style={{ flex: '1.2', minWidth: '320px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Card 1: Seating Capacity */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seating Capacity</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
                {opData.tables.length} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Dining Tables</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>✓ Operational</span>
            </div>

            {/* Card 2: Active Orders */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Live Orders</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
                {opData.orders.filter(o => o.status !== 'served').length} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>In Queue</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Real-time POS activity</span>
            </div>

            {/* Card 3: Assigned Staff */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Staff</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1', marginTop: '8px' }}>
                {opData.staff.length} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Staff Members</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Waiters & Kitchen team</span>
            </div>

            {/* Card 4: KDS Stations */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kitchen KDS Stations</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', marginTop: '8px' }}>
                {opData.kitchen.length} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Active Displays</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Order routing active</span>
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
              Tables ({opData.tables.length})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('orders')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'orders' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'orders' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Live Orders Queue ({opData.orders.filter(o => o.status !== 'served').length})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('staff')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'staff' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'staff' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Staff ({opData.staff.length})
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
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Configured Dining Tables</h4>
              {opData.tables.length === 0 ? (
                <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No tables configured for this branch.</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px' }}>
                  {opData.tables.map((tbl, i) => (
                    <div key={i} style={{ background: '#f8fafc', padding: '14px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{tbl.name}</div>
                      <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>{tbl.seats} Seats</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {opSubTab === 'orders' && (
            <div style={{ padding: '8px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Active Live Orders Queue</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#16a34a', fontWeight: 700 }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', display: 'inline-block' }}></span>
                  {opData.orders.filter(o => o.status !== 'served').length} Orders Processing
                </div>
              </div>
              <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                  <table style={{ width: '100%', minWidth: '800px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <colgroup>
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '10%' }} />
                      <col style={{ width: '40%' }} />
                      <col style={{ width: '12%' }} />
                      <col style={{ width: '14%' }} />
                      <col style={{ width: '12%' }} />
                    </colgroup>
                    <thead>
                      <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', verticalAlign: 'middle' }}>Order ID</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', verticalAlign: 'middle' }}>Table</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', verticalAlign: 'middle' }}>Ordered Items</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', verticalAlign: 'middle' }}>Amount</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', verticalAlign: 'middle' }}>Time Elapsed</th>
                        <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', verticalAlign: 'middle' }}>Status</th>
                      </tr>
                    </thead>
                  <tbody>
                    {opData.orders.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ padding: '24px', textAlign: 'center', color: '#94a3b8' }}>No active orders.</td>
                      </tr>
                    ) : (
                      opData.orders.map(order => {
                        let badgeBg = '#fff7ed';
                        let badgeColor = '#c2410c';
                        let badgeBorder = '#ffedd5';
                        let statusText = 'Preparing';

                        if (order.status === 'ready') {
                          badgeBg = '#fefce8';
                          badgeColor = '#854d0e';
                          badgeBorder = '#fef9c3';
                          statusText = 'Ready to Serve';
                        } else if (order.status === 'served') {
                          badgeBg = '#f0fdf4';
                          badgeColor = '#166534';
                          badgeBorder = '#dcfce7';
                          statusText = 'Served';
                        }

                        return (
                          <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: 'var(--primary)', verticalAlign: 'middle' }}>{order.id}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 800, verticalAlign: 'middle' }}>{order.table}</td>
                            <td style={{ padding: '12px 14px', color: '#334155', fontWeight: 500, verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={order.items}>{order.items}</td>
                            <td style={{ padding: '12px 14px', fontWeight: 700, color: '#0f172a', verticalAlign: 'middle' }}>{order.total}</td>
                            <td style={{ padding: '12px 14px', color: '#64748b', verticalAlign: 'middle' }}>{order.time}</td>
                            <td style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>
                              <span style={{ 
                                display: 'inline-block', 
                                padding: '4px 10px', 
                                borderRadius: '9999px', 
                                fontSize: '11px', 
                                fontWeight: 700, 
                                backgroundColor: badgeBg, 
                                color: badgeColor, 
                                border: `1px solid ${badgeBorder}` 
                              }}>
                                {statusText}
                              </span>
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
          )}

          {opSubTab === 'staff' && (
            <div style={{ padding: '8px 0' }}>
              <h4 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Assigned Personnel & Roster</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '16px' }}>
                {opData.staff.map(person => (
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
        {/* Header Row with Back Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            type="button"
            onClick={() => setActiveView('list')}
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '18px',
              fontWeight: '700',
              color: '#0f172a',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              flexShrink: 0
            }}
          >
            ←
          </button>
          <div>
            <h2 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', fontFamily: "'Outfit', sans-serif" }}>
              {isEditing ? `Edit Branch - ${branchForm.branchName}` : 'Add New Restaurant Branch'}
            </h2>

          </div>
        </div>

        {/* Page Style Form Card (noValidate disabled HTML browser popups) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '32px 36px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          <form onSubmit={handleFormSubmit} noValidate style={{ width: '100%' }}>
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Status</label>
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

                  {/* Field 5: Is Main Branch Checkbox */}
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '24px' }}>
                    <input
                      type="checkbox"
                      id="isMainBranch"
                      checked={branchForm.isMainBranch}
                      onChange={e => setBranchForm({ ...branchForm, isMainBranch: e.target.checked })}
                      style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--primary)' }}
                    />
                    <label htmlFor="isMainBranch" style={{ marginLeft: '8px', fontSize: '14px', fontWeight: 700, color: '#0f172a', cursor: 'pointer' }}>
                      Main Branch
                    </label>
                  </div>
                </div>
              </div>

              {/* Section 2: Manager & Contact */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  2. Manager & Contact Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                  
                  {/* Field 5: Branch Manager (Characters Only) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Branch Manager <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Saravana Kumaran"
                      value={branchForm.managerName || branchForm.branchManager || ''}
                      onChange={e => {
                        const val = e.target.value.replace(/[^a-zA-Z\s.'-]/g, '');
                        setBranchForm({ ...branchForm, managerName: val, branchManager: val });
                        if (formErrors.managerName || formErrors.branchManager) {
                          setFormErrors({ ...formErrors, managerName: '', branchManager: '' });
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: (formErrors.managerName || formErrors.branchManager) ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {(formErrors.managerName || formErrors.branchManager) && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.managerName || formErrors.branchManager}
                      </span>
                    )}
                  </div>

                  {/* Field 6: Mobile Number (10 Digits Only) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10 digit mobile number"
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

                  {/* Field 8 & 9: Password & Confirm Password (Available in Create & Edit Mode) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      {isEditing ? 'New Password' : 'Password'} {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        placeholder={isEditing ? "Enter new password" : "Enter password (min 6 characters)"}
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
                        title={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
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
                      Confirm Password {!isEditing && <span style={{ color: '#ef4444' }}>*</span>}
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirm password"
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
                        title={showConfirmPassword ? "Hide password" : "Show password"}
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
            <button
              type="button"
              className="btn btn-black"
              onClick={handleOpenAddForm}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700 }}
            >
              + Add New Branch
            </button>
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
              Subscription Tier: <span style={{ color: 'var(--primary)' }}>{sub.planName || 'Standard'} Plan</span>
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
          <div style={{ position: 'relative', width: '100%', maxWidth: '380px' }}>
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
              style={{ width: '100%', padding: '10px 16px 10px 38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
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
                { value: 'All', label: 'All Statuses' },
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
                Your current <strong>{sub.planName} Plan</strong> allows up to <strong>{totalAllowedBranches} branch outlet{totalAllowedBranches > 1 ? 's' : ''}</strong> ({branches.length} currently in use).
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
