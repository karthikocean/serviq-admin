import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BranchApi from '../api/Branch.js';
import { useAppState, DEFAULT_ROLES } from '../config/AppContext';
import { Badge } from './Badge';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications.js';
import { OtpPasswordInput } from './OtpPasswordInput';
import {
  sanitizeName,
  sanitizeMobile,
  validateName,
  validateMobile,
  validateEmail,
  validateRequired
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
  branchManager: '',
  mobileNumber: '',
  email: '',
  password: '',
  confirmPassword: '',
  address: '',
  country: 'India',
  state: 'Tamil Nadu',
  city: '',
  pincode: '',
  openingDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  totalTables: 10,
  username: '',
  gstNumber: '',
  fssaiNumber: ''
};

const branchMockData = {
  'BR-CHE-01': {
    orders: [
      { id: '#ORD-1082', table: 'T-03', items: 'Masala Chai x2, Paneer Tikka x1', total: '₹540', status: 'preparing', time: '5 mins ago' },
      { id: '#ORD-1081', table: 'T-07', items: 'Butter Chicken x1, Garlic Naan x3', total: '₹750', status: 'ready', time: '12 mins ago' },
      { id: '#ORD-1080', table: 'T-12', items: 'Veg Biryani x2, Raita x1, Coke x2', total: '₹620', status: 'served', time: '25 mins ago' },
      { id: '#ORD-1079', table: 'T-01', items: 'Mango Lassi x2, Chilli Gobi x1', total: '₹380', status: 'preparing', time: '18 mins ago' }
    ],
    staff: [
      { name: 'Saravana Kumaran', role: 'Branch Manager', status: 'Active', email: 'saravana@serviq.com', initial: 'S' },
      { name: 'Chef Kapoor', role: 'Head Chef', status: 'Active', email: 'kapoor@serviq.com', initial: 'K' },
      { name: 'Ramesh Kumar', role: 'Senior Waiter', status: 'Active', email: 'ramesh@serviq.com', initial: 'R' },
      { name: 'Priya Dharshini', role: 'Waiter', status: 'Active', email: 'priya@serviq.com', initial: 'P' },
      { name: 'Murugan T.', role: 'Kitchen Helper', status: 'On Break', email: 'murugan@serviq.com', initial: 'M' }
    ],
    kitchen: [
      { name: 'Mains & Grill Station', items: 'Biryani, Tandoori, Curries', load: 'High', loadPercent: 80, status: 'Active' },
      { name: 'Appetizers & Fast Food', items: 'Tikka, Gobi, Naan, Breads', load: 'Medium', loadPercent: 50, status: 'Active' },
      { name: 'Beverages & Dessert Counter', items: 'Chai, Lassi, Shakes, Kulfi', load: 'Low', loadPercent: 20, status: 'Active' }
    ]
  },
  'BR-CBE-02': {
    orders: [
      { id: '#ORD-2022', table: 'T-02', items: 'South Indian Thali x2, Filter Coffee x2', total: '₹460', status: 'preparing', time: '8 mins ago' },
      { id: '#ORD-2021', table: 'T-05', items: 'Ghee Roast Dosa x1, Medu Vada x2', total: '₹280', status: 'ready', time: '14 mins ago' },
      { id: '#ORD-2020', table: 'T-09', items: 'Mutton Biryani x1, Parotta x3, Salna', total: '₹680', status: 'served', time: '30 mins ago' }
    ],
    staff: [
      { name: 'Karthik Raja', role: 'Branch Manager', status: 'Active', email: 'karthik@serviq.com', initial: 'K' },
      { name: 'Chef Sundaram', role: 'Head Chef', status: 'Active', email: 'sundaram@serviq.com', initial: 'S' },
      { name: 'Anitha S.', role: 'Senior Waiter', status: 'Active', email: 'anitha@serviq.com', initial: 'A' },
      { name: 'Chef Venkatesh', role: 'Sous Chef', status: 'Active', email: 'venkatesh@serviq.com', initial: 'V' }
    ],
    kitchen: [
      { name: 'South Traditional Section', items: 'Dosa, Idli, Vada, Meals', load: 'Medium', loadPercent: 60, status: 'Active' },
      { name: 'Biryani & Tiffin Station', items: 'Biryani, Parotta, Gravies', load: 'High', loadPercent: 85, status: 'Active' }
    ]
  },
  'BR-MD-03': {
    orders: [
      { id: '#ORD-3011', table: 'T-04', items: 'Kari Dosa x2, Jigarthanda x2', total: '₹580', status: 'preparing', time: '4 mins ago' },
      { id: '#ORD-3010', table: 'T-01', items: 'Bun Parotta x4, Mutton Chukka x1', total: '₹720', status: 'served', time: '16 mins ago' }
    ],
    staff: [
      { name: 'Meenakshi Sundaram', role: 'Branch Manager', status: 'Active', email: 'meenakshi@serviq.com', initial: 'M' },
      { name: 'Chef Marimuthu', role: 'Master Chef', status: 'Active', email: 'marimuthu@serviq.com', initial: 'M' },
      { name: 'Vikram R.', role: 'Waiter', status: 'Active', email: 'vikram@serviq.com', initial: 'V' }
    ],
    kitchen: [
      { name: 'Madurai Speciality Section', items: 'Kari Dosa, Bun Parotta, Chukka', load: 'High', loadPercent: 90, status: 'Active' },
      { name: 'Cold Beverages & Dessert', items: 'Jigarthanda, Falooda, Ice Creams', load: 'Low', loadPercent: 25, status: 'Active' }
    ]
  }
};

const getBranchOperationalData = (branch) => {
  if (!branch) return null;
  const mockKey = Object.keys(branchMockData).find(k => k === branch.branchCode || branch.branchCode?.includes(k));
  if (mockKey && branchMockData[mockKey]) {
    return branchMockData[mockKey];
  }
  return {
    orders: [
      { id: '#ORD-001', table: 'T-01', items: 'Sample Items x2', total: '₹450', status: 'preparing', time: '10 mins ago' },
      { id: '#ORD-002', table: 'T-05', items: 'Special Dish x1', total: '₹320', status: 'ready', time: '15 mins ago' }
    ],
    staff: [
      { name: branch.branchManager || 'Branch In-Charge', role: 'Branch Manager', status: 'Active', email: branch.email || 'manager@serviq.com', initial: (branch.branchManager || 'M').charAt(0).toUpperCase() },
      { name: 'Senior Staff', role: 'Operations', status: 'Active', email: 'ops@serviq.com', initial: 'O' }
    ],
    kitchen: [
      { name: 'Main Kitchen Section', items: 'All food categories', load: 'Medium', loadPercent: 50, status: 'Active' }
    ]
  };
};

export default function BranchManagementPanel({ hasPermission: hasPermissionProp }) {
  const navigate = useNavigate();
  const { currentUser, activeRestaurant, addBranch, updateBranch, deleteBranch, purchaseExtraBranchSlots } = useAppState();

  const userType = (currentUser?.userType || currentUser?.role || '').toUpperCase();
  const userRoleLower = (currentUser?.role || '').toLowerCase();
  const isAdmin = userRoleLower === 'admin' || userRoleLower === 'super admin' || userRoleLower === 'owner' || userType === 'ADMIN' || userType === 'SUPER ADMIN' || userType === 'RESTAURANT_OWNER' || userType === 'OWNER';

  const role = currentUser?.role || 'Admin';
  const hasPermission = hasPermissionProp || ((moduleName, action = 'view') => {
    if (isAdmin) return true;
    const rolesConfig = activeRestaurant?.roles || DEFAULT_ROLES;
    const userRoleConfig = rolesConfig[role] || DEFAULT_ROLES[role] || { permissions: {} };
    const modulePermissions = userRoleConfig.permissions?.[moduleName] || {};
    return !!modulePermissions[action];
  });

  if (!isAdmin) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', margin: '20px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', margin: '0 auto 16px auto' }}>
          🔒
        </div>
        <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', margin: '0 0 8px 0', fontFamily: "'Outfit', sans-serif" }}>
          Access Denied
        </h2>
        <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.5, margin: '0 0 24px 0' }}>
          Branch Management is strictly restricted to the <strong>Admin</strong> role. Non-admin roles (Manager, Staff, Kitchen, Waiter, Viewer) do not have permission to view or manage branches.
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

  const fetchBranches = async () => {
    setIsLoading(true);
    const res = await BranchApi.getBranches();
    if (res && res.status && res.response && res.response.data) {
      const mappedBranches = res.response.data.map(b => ({
        id: b._id,
        branchName: b.branchName,
        branchCode: b.branchCode,
        branchManager: b.managerName,
        mobileNumber: b.contactNumber,
        email: b.email,
        password: '',
        confirmPassword: '',
        address: b.address?.street || '',
        country: b.address?.country || '',
        state: b.address?.state || '',
        city: b.address?.city || '',
        pincode: b.address?.pincode || '',
        openingDate: b.branchOpeningDate ? b.branchOpeningDate.split('T')[0] : '',
        status: b.status || 'Active',
        totalTables: 10
      }));
      setApiBranches(mappedBranches);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isAdmin) {
      fetchBranches();
    }
  }, [isAdmin]);

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
    const matchesSearch = 
      (b.branchName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.branchCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.city || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.branchManager || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'All' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalBranchesCount = branches.length;
  const activeBranchesCount = branches.filter(b => b.status === 'Active').length;
  const totalTablesCount = branches.reduce((sum, b) => sum + (parseInt(b.totalTables) || 0), 0);
  const totalManagersCount = new Set(branches.map(b => b.branchManager).filter(Boolean)).size;

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

  const handlePayAndUnlockBranchSlot = () => {
    setIsProcessingSlotPayment(true);
    setTimeout(() => {
      purchaseExtraBranchSlots(activeRestaurant.id, 1, 'Credit Card (•••• 4242)');
      setIsProcessingSlotPayment(false);
      setIsPlanLimitModalOpen(false);
      ShowNotifications.showAlertNotification("Additional branch slot purchased and activated successfully!", true);
      openAddBranchFormDirectly();
    }, 900);
  };

  const handleOpenEditForm = (branch) => {
    if (!hasPermission('branch-management', 'edit')) {
      ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
      return;
    }
    setBranchForm({
      id: branch.id,
      branchName: branch.branchName || '',
      branchCode: branch.branchCode || '',
      branchManager: branch.branchManager || '',
      mobileNumber: branch.mobileNumber || '',
      email: branch.email || '',
      password: branch.password || '',
      confirmPassword: branch.password || '',
      address: branch.address || '',
      country: branch.country || 'India',
      state: branch.state || 'Tamil Nadu',
      city: branch.city || '',
      pincode: branch.pincode || '',
      openingDate: branch.openingDate || new Date().toISOString().split('T')[0],
      status: branch.status || 'Active',
      totalTables: branch.totalTables || 10,
      username: branch.username || '',
      gstNumber: branch.gstNumber || '',
      fssaiNumber: branch.fssaiNumber || ''
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

    // Branch Name validation (characters only)
    const nameErr = validateName(branchForm.branchName);
    if (nameErr) errors.branchName = nameErr;

    // Branch Code
    const codeErr = validateRequired(branchForm.branchCode, 'Branch Code');
    if (codeErr) errors.branchCode = codeErr;

    // Branch Manager (characters only if provided)
    if (branchForm.branchManager.trim()) {
      const mgrErr = validateName(branchForm.branchManager);
      if (mgrErr) errors.branchManager = 'Manager name must contain letters only';
    }

    // Mobile Number (exactly 10 digits)
    const mobileErr = validateMobile(branchForm.mobileNumber);
    if (mobileErr) errors.mobileNumber = mobileErr;

    // Email Address (format validation)
    const emailErr = validateEmail(branchForm.email);
    if (emailErr) errors.email = emailErr;

    // Password validation (required only when creating)
    if (!isEditing) {
      if (!branchForm.password || !branchForm.password.trim()) {
        errors.password = 'Password is required';
      } else if (branchForm.password.length < 4) {
        errors.password = 'Password must be at least 4 characters';
      }

      // Confirm Password validation
      if (!branchForm.confirmPassword || !branchForm.confirmPassword.trim()) {
        errors.confirmPassword = 'Confirm password is required';
      } else if (branchForm.password !== branchForm.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match';
      }
    }

    // City & State (characters only if provided)
    if (branchForm.city && !/^[a-zA-Z\s]+$/.test(branchForm.city.trim())) {
      errors.city = 'City must contain letters only';
    }
    if (branchForm.state && !/^[a-zA-Z\s]+$/.test(branchForm.state.trim())) {
      errors.state = 'State must contain letters only';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      ShowNotifications.showAlertNotification('Please fix the errors in the form before submitting.', false);
      return;
    }

    const payload = {
      branchName: branchForm.branchName,
      branchCode: branchForm.branchCode,
      branchOpeningDate: branchForm.openingDate,
      contactNumber: branchForm.mobileNumber,
      email: branchForm.email,
      street: branchForm.address,
      city: branchForm.city,
      state: branchForm.state,
      country: branchForm.country,
      pincode: branchForm.pincode,
      managerName: branchForm.branchManager,
      managerMobile: branchForm.mobileNumber,
      managerEmail: branchForm.email,
      managerPassword: branchForm.password,
      status: branchForm.status
    };

    if (isEditing) {
      if (!hasPermission('branch-management', 'edit')) {
        ShowNotifications.showAlertNotification("You do not have permission to edit branches.", false);
        return;
      }
      const res = await BranchApi.updateBranch(branchForm.id, payload);
      if (res && res.status) {
        fetchBranches();
        setActiveView('list');
      }
    } else {
      if (!hasPermission('branch-management', 'add')) {
        ShowNotifications.showAlertNotification("You do not have permission to add new branches.", false);
        return;
      }
      const res = await BranchApi.createBranch(payload);
      if (res && res.status) {
        fetchBranches();
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
  const opData = getBranchOperationalData(currentViewBranch);

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
                Location: {currentViewBranch?.address || 'Main Road'}, {currentViewBranch?.city || 'Chennai'}, {currentViewBranch?.state || 'Tamil Nadu'}
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
              <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary) 0%, #ea580c 100%)', color: '#fff', fontSize: '18px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {(currentViewBranch?.branchManager || 'M').charAt(0).toUpperCase()}
              </div>
              <div>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Branch Manager</span>
                <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>{currentViewBranch?.branchManager || 'Unassigned Manager'}</div>
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
                {currentViewBranch?.address}, {currentViewBranch?.city}, {currentViewBranch?.state} - {currentViewBranch?.pincode} ({currentViewBranch?.country || 'India'})
              </div>
            </div>
          </div>

          {/* Right Column: Clean 2x2 Metrics Grid */}
          <div style={{ flex: '1.2', minWidth: '320px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            
            {/* Card 1: Seating Capacity */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Seating Capacity</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', marginTop: '8px' }}>
                {currentViewBranch?.totalTables || 15} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Dining Tables</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>✓ Operational</span>
            </div>

            {/* Card 2: Active Orders */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Active Live Orders</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#f59e0b', marginTop: '8px' }}>
                {currentViewBranch?.operationalData?.activeOrders || 8} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>In Queue</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Real-time POS activity</span>
            </div>

            {/* Card 3: Assigned Staff */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Assigned Staff</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#6366f1', marginTop: '8px' }}>
                {currentViewBranch?.operationalData?.staffCount || 10} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Staff Members</span>
              </div>
              <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600, marginTop: '4px' }}>Waiters & Kitchen team</span>
            </div>

            {/* Card 4: KDS Stations */}
            <div style={{ background: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kitchen KDS Stations</span>
              <div style={{ fontSize: '24px', fontWeight: 800, color: '#ea580c', marginTop: '8px' }}>
                {currentViewBranch?.operationalData?.kitchenStations || 2} <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Active Displays</span>
              </div>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, marginTop: '4px' }}>Order routing active</span>
            </div>

          </div>

        </div>

        {/* Operational Sub-Tabs (Tables, Orders, Staff, Kitchen) */}
        <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '2px solid #f1f5f9', paddingBottom: '16px', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => setOpSubTab('tables')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'tables' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'tables' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Tables ({currentViewBranch?.totalTables || 15})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('orders')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'orders' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'orders' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Live Orders Queue
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('staff')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'staff' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'staff' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Staff ({currentViewBranch?.operationalData?.staffCount || 10})
            </button>

            <button
              type="button"
              onClick={() => setOpSubTab('kitchen')}
              style={{ padding: '8px 20px', borderRadius: '8px', border: 'none', background: opSubTab === 'kitchen' ? 'var(--primary)' : '#f1f5f9', color: opSubTab === 'kitchen' ? '#fff' : '#475569', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}
            >
              Kitchen KDS
            </button>
          </div>

          {/* Sub Tab Content */}
          {opSubTab === 'tables' && (
            <div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>Configured Dining Tables</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '12px' }}>
                {Array.from({ length: currentViewBranch?.totalTables || 15 }).map((_, i) => (
                  <div key={i} style={{ background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a' }}>T-0{i + 1}</div>
                    <span style={{ fontSize: '11px', color: '#10b981', fontWeight: 600 }}>4 Seats</span>
                  </div>
                ))}
              </div>
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
              <div style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflowX: 'auto' }}>
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
                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', fontWeight: 700 }}>
                      <th style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>Order ID</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>Table</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>Ordered Items</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>Amount</th>
                      <th style={{ padding: '12px 14px', textAlign: 'left', verticalAlign: 'middle' }}>Time Elapsed</th>
                      <th style={{ padding: '12px 14px', textAlign: 'center', verticalAlign: 'middle' }}>Status</th>
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
                        const val = sanitizeName(e.target.value);
                        setBranchForm({ ...branchForm, branchName: val });
                        if (formErrors.branchName) setFormErrors({ ...formErrors, branchName: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.branchName ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px'
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
                        setBranchForm({ ...branchForm, branchCode: e.target.value });
                        if (formErrors.branchCode) setFormErrors({ ...formErrors, branchCode: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.branchCode ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        fontFamily: 'monospace'
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Branch Opening Date</label>
                    <input
                      type="date"
                      value={branchForm.openingDate}
                      onChange={e => setBranchForm({ ...branchForm, openingDate: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                    />
                  </div>

                  {/* Field 4: Status */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Status</label>
                    <select
                      value={branchForm.status}
                      onChange={e => setBranchForm({ ...branchForm, status: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', backgroundColor: '#fff' }}
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
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
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Branch Manager</label>
                    <input
                      type="text"
                      placeholder="e.g. Saravana Kumaran"
                      value={branchForm.branchManager}
                      onChange={e => {
                        const val = sanitizeName(e.target.value);
                        setBranchForm({ ...branchForm, branchManager: val });
                        if (formErrors.branchManager) setFormErrors({ ...formErrors, branchManager: '' });
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: formErrors.branchManager ? '1.5px solid #ef4444' : '1px solid var(--border)',
                        fontSize: '14px',
                        boxSizing: 'border-box'
                      }}
                    />
                    {formErrors.branchManager && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.branchManager}
                      </span>
                    )}
                  </div>

                  {/* Field 6: Mobile Number (10 Digits Only) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                      Mobile Number <span style={{ color: '#ef4444' }}>*</span>
                    </label>
                    <input
                      type="text"
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

                  {/* Field 8 & 9: Password & Confirm Password (Hidden in Edit Mode) */}
                  {!isEditing && (
                    <>
                      <div>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>
                          Password <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ position: 'relative' }}>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Enter password"
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
                          Confirm Password <span style={{ color: '#ef4444' }}>*</span>
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
                    </>
                  )}

                </div>
              </div>

              {/* Section 3: Address & Location */}
              <div style={{ background: '#f8fafc', padding: '20px 24px', borderRadius: '14px', border: '1px solid #e2e8f0' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  3. Address & Location
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: '#0f172a' }}>Street Address</label>
                    <input
                      type="text"
                      placeholder="e.g. 12 Connaught Place, T. Nagar"
                      value={branchForm.address}
                      onChange={e => setBranchForm({ ...branchForm, address: e.target.value })}
                      style={{ width: '100%', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>City</label>
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
                          fontSize: '13px'
                        }}
                      />
                      {formErrors.city && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.city}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>State</label>
                      <input
                        type="text"
                        placeholder="Tamil Nadu"
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
                          fontSize: '13px'
                        }}
                      />
                      {formErrors.state && (
                        <span style={{ color: '#ef4444', fontSize: '11px', marginTop: '2px', display: 'block' }}>{formErrors.state}</span>
                      )}
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Country</label>
                      <input
                        type="text"
                        placeholder="India"
                        value={branchForm.country}
                        onChange={e => setBranchForm({ ...branchForm, country: e.target.value })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: '4px', color: '#0f172a' }}>Pincode</label>
                      <input
                        type="text"
                        placeholder="600017"
                        value={branchForm.pincode}
                        onChange={e => setBranchForm({ ...branchForm, pincode: e.target.value.replace(/[^0-9]/g, '').slice(0, 6) })}
                        style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px' }}
                      />
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
              onChange={e => setSearchTerm(e.target.value)}
              style={{ width: '100%', padding: '10px 16px 10px 38px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '14px', outline: 'none' }}
            />
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Status:</span>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: '8px', border: '1px solid var(--border)', fontSize: '13px', fontWeight: 600, backgroundColor: '#fff', cursor: 'pointer' }}
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* 4. Branch List Table */}
      <div style={{ background: '#fff', borderRadius: '14px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.03)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', minWidth: '1000px', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '14px' }}>
            <colgroup>
              <col style={{ width: '13%' }} />
              <col style={{ width: '23%' }} />
              <col style={{ width: '17%' }} />
              <col style={{ width: '15%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '10%' }} />
              <col style={{ width: '10%' }} />
            </colgroup>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid var(--border)', color: '#475569', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Branch Code</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Branch Name</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Location</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Manager</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Contact</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Tables</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'left', verticalAlign: 'middle' }}>Status</th>
                <th style={{ padding: '14px 16px', fontWeight: 700, textAlign: 'center', verticalAlign: 'middle' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontSize: '14px' }}>
                    No branches found matching your search.
                  </td>
                </tr>
              ) : (
                filteredBranches.map(b => (
                  <tr key={b.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }} onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    
                    {/* 1. Branch Code */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: 'var(--primary)', verticalAlign: 'middle' }}>
                      <span style={{ background: 'var(--primary-light)', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontFamily: 'monospace' }}>
                        {b.branchCode}
                      </span>
                    </td>

                    {/* 2. Branch Name */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.branchName}</div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{b.address}</div>
                    </td>

                    {/* 3. Location */}
                    <td style={{ padding: '14px 16px', color: '#334155', fontWeight: 600, verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {b.city ? `${b.city}, ${b.state || 'Tamil Nadu'}` : 'Not Specified'}
                    </td>

                    {/* 4. Manager */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontWeight: 600, color: '#1e293b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#e0e7ff', color: '#4338ca', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800 }}>
                          {(b.branchManager || 'M').charAt(0).toUpperCase()}
                        </span>
                        {b.branchManager || 'Unassigned'}
                      </div>
                    </td>

                    {/* 5. Contact */}
                    <td style={{ padding: '14px 16px', fontSize: '13px', verticalAlign: 'middle', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      <div style={{ fontWeight: 600, color: '#334155' }}>{b.mobileNumber || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{b.email || ''}</div>
                    </td>

                    {/* 6. Tables */}
                    <td style={{ padding: '14px 16px', fontWeight: 700, color: '#0f172a', verticalAlign: 'middle' }}>
                      {b.totalTables} Tables
                    </td>

                    {/* 7. Status */}
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                      <Badge status={b.status === 'Active' ? 'Active' : 'Inactive'} />
                    </td>

                    {/* 8. Actions */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        
                        <button
                          title="View Operational Details"
                          onClick={() => handleOpenHierarchy(b)}
                          style={{ border: 'none', background: '#eff6ff', color: '#2563eb', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                          <EyeIcon size={16} />
                        </button>

                        {hasPermission('branch-management', 'edit') && (
                          <button
                            title="Edit Branch"
                            onClick={() => handleOpenEditForm(b)}
                            style={{ border: 'none', background: '#f1f5f9', color: '#475569', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          >
                            <PencilIcon size={16} />
                          </button>
                        )}

                        {hasPermission('branch-management', 'delete') && (
                          <button
                            title="Delete Branch"
                            onClick={() => handleDeleteBranchClick(b)}
                            style={{ border: 'none', background: '#fef2f2', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                          >
                            <TrashIcon size={16} />
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
      </div>

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
