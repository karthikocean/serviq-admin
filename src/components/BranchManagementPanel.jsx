import React, { useState } from 'react';
import { useAppState } from '../config/AppContext';
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
  address: '',
  country: 'India',
  state: 'Tamil Nadu',
  city: '',
  pincode: '',
  openingDate: new Date().toISOString().split('T')[0],
  status: 'Active',
  totalTables: 10,
  username: '',
  password: '1234',
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
      { name: 'Anjali Devi', role: 'Waiter', status: 'Active', email: 'anjali@serviq.com', initial: 'A' },
      { name: 'Ganesh S.', role: 'Waiter', status: 'On Break', email: 'ganesh@serviq.com', initial: 'G' }
    ],
    kitchen: [
      { name: 'Dosa & Tiffin Counter', items: 'Dosa, Idli, Vada, Chutney', load: 'Medium', loadPercent: 60, status: 'Active' },
      { name: 'Meals & Gravies', items: 'Thali, Rice, Poriyal, Sambar', load: 'Low', loadPercent: 30, status: 'Active' }
    ]
  },
  'BR-MDU-03': {
    orders: [
      { id: '#ORD-3012', table: 'T-04', items: 'Jigarthanda x3, Bun Parotta x4', total: '₹510', status: 'preparing', time: '4 mins ago' },
      { id: '#ORD-3011', table: 'T-01', items: 'Madurai Mutton Curry x1, Idiyappam x6', total: '₹580', status: 'ready', time: '11 mins ago' }
    ],
    staff: [
      { name: 'Ramesh V.', role: 'Branch Manager', status: 'Active', email: 'ramesh.v@serviq.com', initial: 'R' },
      { name: 'Chef Muthu', role: 'Head Chef', status: 'Active', email: 'muthu@serviq.com', initial: 'M' },
      { name: 'Selvam A.', role: 'Waiter', status: 'Active', email: 'selvam@serviq.com', initial: 'S' },
      { name: 'Meena K.', role: 'Waiter', status: 'Active', email: 'meena@serviq.com', initial: 'M' }
    ],
    kitchen: [
      { name: 'Parotta & Main Station', items: 'Bun Parotta, Curry, Gravy', load: 'High', loadPercent: 75, status: 'Active' },
      { name: 'Jigarthanda & Beverage Station', items: 'Jigarthanda, Shakes, Soda', load: 'Medium', loadPercent: 45, status: 'Active' }
    ]
  }
};

const getBranchOperationalData = (branch) => {
  if (!branch) return { orders: [], staff: [], kitchen: [] };
  if (branchMockData[branch.branchCode]) {
    return branchMockData[branch.branchCode];
  }
  const managerName = branch.branchManager || 'Branch Manager';
  return {
    orders: [
      { id: '#ORD-101', table: 'T-02', items: 'Steamed Rice x1, Dal Tadka x1', total: '₹220', status: 'preparing', time: '3 mins ago' },
      { id: '#ORD-102', table: 'T-05', items: 'Veg Fried Rice x2, Manchurian x1', total: '₹480', status: 'ready', time: '9 mins ago' }
    ],
    staff: [
      { name: managerName, role: 'Branch Manager', status: 'Active', email: branch.email || 'manager@serviq.com', initial: managerName.charAt(0).toUpperCase() },
      { name: 'Chef Swamy', role: 'Chef', status: 'Active', email: 'swamy@serviq.com', initial: 'S' },
      { name: 'Kumar S.', role: 'Waiter', status: 'Active', email: 'kumar@serviq.com', initial: 'K' }
    ],
    kitchen: [
      { name: 'Main Kitchen Section', items: 'All food categories', load: 'Medium', loadPercent: 50, status: 'Active' }
    ]
  };
};

export default function BranchManagementPanel() {
  const { activeRestaurant, addBranch, updateBranch, deleteBranch } = useAppState();

  const [activeView, setActiveView] = useState('list'); // 'list' | 'form' | 'hierarchy'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Form state & Validation Errors state
  const [branchForm, setBranchForm] = useState(initialBranchState);
  const [formErrors, setFormErrors] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  // View page operational sub-tab state
  const [selectedBranchForTree, setSelectedBranchForTree] = useState(null);
  const [opSubTab, setOpSubTab] = useState('tables');

  // Delete modal state
  const [branchToDelete, setBranchToDelete] = useState(null);

  const branches = activeRestaurant?.branches || [];

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

  const handleOpenAddForm = () => {
    const autoCode = `BR-${Math.floor(100 + Math.random() * 900)}`;
    setBranchForm({
      ...initialBranchState,
      branchCode: autoCode,
      username: `branch_${autoCode.toLowerCase().replace('-', '_')}`,
      password: '1234'
    });
    setFormErrors({});
    setIsEditing(false);
    setActiveView('form');
  };

  const handleOpenEditForm = (branch) => {
    setBranchForm({
      id: branch.id,
      branchName: branch.branchName || '',
      branchCode: branch.branchCode || '',
      branchManager: branch.branchManager || '',
      mobileNumber: branch.mobileNumber || '',
      email: branch.email || '',
      address: branch.address || '',
      country: branch.country || 'India',
      state: branch.state || 'Tamil Nadu',
      city: branch.city || '',
      pincode: branch.pincode || '',
      openingDate: branch.openingDate || new Date().toISOString().split('T')[0],
      status: branch.status || 'Active',
      totalTables: branch.totalTables || 10,
      username: branch.username || '',
      password: branch.password || '1234',
      gstNumber: branch.gstNumber || '',
      fssaiNumber: branch.fssaiNumber || ''
    });
    setFormErrors({});
    setIsEditing(true);
    setActiveView('form');
  };

  const handleOpenHierarchy = (branch = null) => {
    const targetBranch = branch || (branches.length > 0 ? branches[0] : null);
    setSelectedBranchForTree(targetBranch);
    setOpSubTab('tables');
    setActiveView('hierarchy');
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

    // City & State (characters only if provided)
    if (branchForm.city && !/^[a-zA-Z\s]+$/.test(branchForm.city.trim())) {
      errors.city = 'City must contain letters only';
    }
    if (branchForm.state && !/^[a-zA-Z\s]+$/.test(branchForm.state.trim())) {
      errors.state = 'State must contain letters only';
    }

    // Password validation (4 digits/chars required)
    if (!branchForm.password || branchForm.password.length < 4) {
      errors.password = 'Branch password must be 4 digits/characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      ShowNotifications.showAlertNotification('Please fix the errors in the form before submitting.', false);
      return;
    }

    if (isEditing) {
      updateBranch(activeRestaurant.id, branchForm.id, branchForm);
      ShowNotifications.showAlertNotification(`Branch "${branchForm.branchName}" updated successfully!`, true);
    } else {
      addBranch(activeRestaurant.id, branchForm);
      ShowNotifications.showAlertNotification(`New branch "${branchForm.branchName}" created successfully!`, true);
    }

    setActiveView('list');
  };

  const handleDeleteConfirm = () => {
    if (branchToDelete) {
      deleteBranch(activeRestaurant.id, branchToDelete.id);
      ShowNotifications.showAlertNotification(`Branch "${branchToDelete.branchName}" deleted successfully.`, true);
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
                <Badge status={currentViewBranch?.status === 'Active' ? 'Active' : 'Offline'} />
              </div>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                Location: {currentViewBranch?.address || 'Main Road'}, {currentViewBranch?.city || 'Chennai'}, {currentViewBranch?.state || 'Tamil Nadu'}
              </p>
            </div>
          </div>

          {/* Branch Switcher Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#475569' }}>Switch Outlet:</span>
            <select
              value={currentViewBranch?.id || ''}
              onChange={e => {
                const b = branches.find(item => item.id === e.target.value);
                if (b) setSelectedBranchForTree(b);
              }}
              style={{ padding: '10px 16px', borderRadius: '10px', border: '1.5px solid var(--primary)', fontSize: '13px', fontWeight: 700, backgroundColor: '#fff', color: '#0f172a', cursor: 'pointer', outline: 'none' }}
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.branchName} ({b.city || 'Branch'})</option>
              ))}
            </select>
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
                        fontSize: '14px'
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
                        fontSize: '14px'
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
                        fontSize: '14px'
                      }}
                    />
                    {formErrors.email && (
                      <span style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'block', fontWeight: 600 }}>
                        {formErrors.email}
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
          <button
            type="button"
            className="btn btn-black"
            onClick={() => handleOpenHierarchy(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px', borderRadius: '10px', background: '#1e293b', color: '#fff', fontSize: '13px', fontWeight: 700 }}
          >
            <TreeIcon size={16} />
            View Operational Hierarchy
          </button>

          <button
            type="button"
            className="btn btn-black"
            onClick={handleOpenAddForm}
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '10px', background: 'var(--primary)', color: '#fff', fontSize: '13px', fontWeight: 700 }}
          >
            + Add New Branch
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
                      <Badge status={b.status === 'Active' ? 'Active' : 'Offline'} />
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

                        <button
                          title="Edit Branch"
                          onClick={() => handleOpenEditForm(b)}
                          style={{ border: 'none', background: '#f1f5f9', color: '#475569', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                          <PencilIcon size={16} />
                        </button>

                        <button
                          title="Delete Branch"
                          onClick={() => setBranchToDelete(b)}
                          style={{ border: 'none', background: '#fef2f2', color: '#ef4444', width: '32px', height: '32px', borderRadius: '8px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                        >
                          <TrashIcon size={16} />
                        </button>
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

    </div>
  );
}
