import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import { ticketApi } from '../../api/Ticket';
import BranchApi from '../../api/Branch';
import UploadApi from '../../api/Upload';
import { notificationApi } from '../../api/Notification';
import { isBranchMatch } from '../../helper/BranchHelper';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications';
import SearchableSelect from '../../components/SearchableSelect';
import { formatDateDMY, formatDateTimeDMY } from '../../helper/DateHelper.js';
import './HelpSupport.css';

// Professional SVG Icons (No Emojis)
const StoreIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const UserIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const ShieldIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const BuildingIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
    <path d="M9 22v-4h6v4" />
    <line x1="8" y1="6" x2="10" y2="6" />
    <line x1="14" y1="6" x2="16" y2="6" />
    <line x1="8" y1="10" x2="10" y2="10" />
    <line x1="14" y1="10" x2="16" y2="10" />
    <line x1="8" y1="14" x2="10" y2="14" />
    <line x1="14" y1="14" x2="16" y2="14" />
  </svg>
);

const TagIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
    <line x1="7" y1="7" x2="7.01" y2="7" />
  </svg>
);

const ClockIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const SearchIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const PlusIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const PaperclipIcon = ({ size = 15, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
  </svg>
);

const SendIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);

const MessageSquareIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const CheckCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const XCircleIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

const LockIcon = ({ size = 13, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

const TrashIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EyeIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const RefreshCwIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

const ForwardIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <polyline points="15 14 20 9 15 4" />
    <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
  </svg>
);

const ShareIcon = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const STATUS_LIST = ['Open', 'In Progress', 'Waiting for Response', 'Resolved', 'Closed'];

export default function HelpSupport() {
  const { activeRestaurant, selectedBranchId, currentUser } = useAppState();
  const [searchParams] = useSearchParams();
  const location = useLocation();

  // Role detection
  const roleStr = typeof currentUser?.role === 'object' && currentUser?.role !== null
    ? (currentUser?.role?.roleName || currentUser?.role?.name || '')
    : (typeof currentUser?.role === 'string' ? currentUser.role : '');
  const userTypeStr = typeof currentUser?.userType === 'string' ? currentUser.userType : '';

  const userRole = (roleStr || '').toLowerCase().trim();
  const userType = (userTypeStr || '').toUpperCase().trim();

  // Hierarchy Roles
  const isSuperAdmin = userType === 'SUPER ADMIN' || userType === 'SUPER_ADMIN' || userRole === 'super admin' || userRole === 'super_admin';

  const userBranchId = (typeof currentUser?.branchId === 'object' && currentUser?.branchId !== null
    ? (currentUser?.branchId?._id || currentUser?.branchId?.id)
    : (currentUser?.branchId || currentUser?.activeBranchId)) || '';

  const hasSpecificBranch = Boolean(userBranchId && userBranchId !== 'ALL' && userBranchId !== 'All' && String(userBranchId).toUpperCase() !== 'COMPANY');

  // Branch Admin: Anyone assigned to a specific branch OR has branch-level role
  const isBranchAdmin = !isSuperAdmin && (
    hasSpecificBranch ||
    userType === 'BRANCH_ADMIN' ||
    userType === 'BRANCH' ||
    userRole === 'branch_admin' ||
    userRole === 'branch admin' ||
    userRole === 'branch'
  );

  // Company Admin: Restaurant Owner / HQ Admin not tied to a single branch
  const isCompanyAdmin = !isSuperAdmin && !isBranchAdmin;

  // Header branch filter active state
  const isBranchFilterActive = Boolean(
    selectedBranchId &&
    selectedBranchId !== 'ALL' &&
    selectedBranchId !== 'All' &&
    selectedBranchId !== 'all' &&
    String(selectedBranchId).toUpperCase() !== 'COMPANY'
  );

  const [tickets, setTickets] = useState([]);
  const [liveBranches, setLiveBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch branches from API
  const fetchBranches = useCallback(async () => {
    try {
      const res = await BranchApi.getBranches({ limit: 50 });
      if (res?.status) {
        const rawData = res.response?.data || res.response?.branches || res.response || [];
        const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
        setLiveBranches(list);
      }
    } catch (err) {
      console.warn("Failed to load branches in HelpSupport:", err);
    }
  }, []);

  const allBranches = useMemo(() => {
    return liveBranches.length > 0 ? liveBranches : (activeRestaurant?.branches || []);
  }, [liveBranches, activeRestaurant]);

  // Branch object for logged-in user if assigned to a branch
  const userAssignedBranch = useMemo(() => {
    if (!userBranchId || userBranchId === 'ALL' || userBranchId === 'All' || String(userBranchId).toUpperCase() === 'COMPANY') {
      return null;
    }
    return allBranches.find(b => 
      String(b._id || b.id) === String(userBranchId) ||
      String(b.branchCode) === String(userBranchId)
    );
  }, [userBranchId, allBranches]);

  // Check if assigned branch is flagged as a Main Branch
  const isUserBranchMain = Boolean(
    currentUser?.isMainBranch === true ||
    currentUser?.branchId?.isMainBranch === true ||
    currentUser?.branch?.isMainBranch === true ||
    currentUser?.branchType === 'MAIN' ||
    currentUser?.branchId?.branchType === 'MAIN' ||
    currentUser?.branch?.branchType === 'MAIN' ||
    userAssignedBranch?.isMainBranch === true ||
    String(userAssignedBranch?.branchType).toUpperCase() === 'MAIN'
  );

  // A login is considered a "Main Branch" login if:
  // 1. It is Super Admin
  // 2. It is Company Admin (Restaurant Owner / HQ Admin not bound to a specific sub-branch)
  // 3. Or it is assigned to a branch that is explicitly configured as the Main Branch (isMainBranch: true / branchType: 'MAIN')
  const isMainBranchLogin = isSuperAdmin || (isCompanyAdmin && !hasSpecificBranch) || isUserBranchMain;

  // Auto Selection Rules for "Ticket Raised To":
  // - Non-Main Branch -> Automatically set "Raised To" = Company (Read Only)
  // - Main Branch -> Automatically set "Raised To" = Super Admin (Read Only)
  const defaultRaisedTo = !isMainBranchLogin ? 'Company' : 'Super Admin';

  // Filters State
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [targetFilter, setTargetFilter] = useState('All'); // 'All' | 'Company' | 'Super Admin'
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;

  // Modals State
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [deleteTicketConfirm, setDeleteTicketConfirm] = useState(null);

  // New Ticket Form State
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Billing',
    priority: 'Medium',
    raisedTo: defaultRaisedTo,
    branchId: '',
    description: '',
    attachment: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const fileInputRef = useRef(null);

  // Conversation Reply State
  const [replyText, setReplyText] = useState('');
  const [replyStatus, setReplyStatus] = useState('');
  const [replyAttachment, setReplyAttachment] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isUploadingReplyAttachment, setIsUploadingReplyAttachment] = useState(false);
  const [isLoadingTicketDetails, setIsLoadingTicketDetails] = useState(false);
  const replyFileInputRef = useRef(null);
  const chatBottomRef = useRef(null);

  // Dedicated Resolve Ticket Modal State
  const [resolveTicketModal, setResolveTicketModal] = useState(null);
  const [resolutionStatus, setResolutionStatus] = useState('Resolved');
  const [resolutionNote, setResolutionNote] = useState('');
  const [resolutionAttachment, setResolutionAttachment] = useState('');
  const [isResolving, setIsResolving] = useState(false);
  const [isUploadingResolutionFile, setIsUploadingResolutionFile] = useState(false);
  const resolutionFileInputRef = useRef(null);

  // Dedicated Share / Forward Ticket to Super Admin Modal State
  const [forwardTicketModal, setForwardTicketModal] = useState(null);
  const [forwardNote, setForwardNote] = useState('');
  const [isForwarding, setIsForwarding] = useState(false);

  // Dynamic branch name resolution
  const resolveTicketBranchName = useCallback((ticket, branchesList = []) => {
    if (!ticket) return 'Main Branch';

    if (ticket.branchName && typeof ticket.branchName === 'string') {
      const trimmed = ticket.branchName.trim();
      if (trimmed && !['null', 'undefined', '-', '—'].includes(trimmed.toLowerCase())) {
        return trimmed;
      }
    }

    if (ticket.branch && typeof ticket.branch === 'object') {
      const name = ticket.branch.branchName || ticket.branch.name || ticket.branch.branchCode;
      if (name && typeof name === 'string' && name.trim()) return name.trim();
    }

    if (ticket.branchId && typeof ticket.branchId === 'object') {
      const name = ticket.branchId.branchName || ticket.branchId.name || ticket.branchId.branchCode;
      if (name && typeof name === 'string' && name.trim()) return name.trim();
    }

    const bId = String(
      (typeof ticket.branchId === 'string' ? ticket.branchId : '') ||
      (typeof ticket.branch === 'string' ? ticket.branch : '') ||
      ''
    ).trim();

    if (bId && bId !== 'ALL' && bId !== 'All' && String(bId).toUpperCase() !== 'COMPANY' && Array.isArray(branchesList)) {
      const matched = branchesList.find(b => (
        String(b._id || b.id || '').toLowerCase() === bId.toLowerCase() ||
        String(b.branchCode || b.code || '').toLowerCase() === bId.toLowerCase() ||
        String(b.branchName || b.name || '').toLowerCase() === bId.toLowerCase()
      ));
      if (matched) {
        return matched.branchName || matched.name || matched.branchCode || 'Branch';
      }
    }

    if (bId === 'ALL' || bId === 'All' || String(bId).toUpperCase() === 'COMPANY') {
      return 'All Branches';
    }

    return activeRestaurant?.name || 'Main Branch';
  }, [activeRestaurant]);

  // Resolving Raised To: 'Company' or 'Super Admin'
  const resolveTicketRaisedTo = useCallback((ticket) => {
    if (ticket?.raisedTo) {
      const str = String(ticket.raisedTo).toLowerCase().trim();
      if (str.includes('super')) return 'Super Admin';
      if (str.includes('company') || str.includes('admin')) return 'Company';
    }
    // Check if ticket originated from branch assignment or branch user
    const bId = ticket?.branchId || ticket?.branch;
    if (bId && bId !== 'ALL' && bId !== 'All' && String(bId).toUpperCase() !== 'COMPANY') {
      return 'Company';
    }
    const bName = String(ticket?.branchName || '').trim();
    if (bName && !['null', 'undefined', '-', '—', 'all branches'].includes(bName.toLowerCase()) && bName !== activeRestaurant?.name) {
      return 'Company';
    }
    const creatorRole = String(ticket?.raisedByRole || ticket?.raisedBy?.role || ticket?.userRole || '').toLowerCase();
    if (creatorRole.includes('branch') || creatorRole.includes('staff') || creatorRole.includes('waiter') || creatorRole.includes('cashier')) {
      return 'Company';
    }
    // In restaurant company portal, tickets default to Company unless explicitly raised/escalated to Super Admin
    return 'Company';
  }, [activeRestaurant]);

  // Resolving Raised By: Name, Email & Role
  const resolveTicketRaisedBy = useCallback((ticket) => {
    if (ticket?.raisedBy && typeof ticket.raisedBy === 'object') {
      return {
        name: ticket.raisedBy.name || ticket.raisedBy.userName || 'Admin',
        role: ticket.raisedBy.role || ticket.raisedBy.userType || 'User',
        email: ticket.raisedBy.email || ''
      };
    }
    const name = ticket?.raisedByName || (typeof ticket?.raisedBy === 'string' ? ticket.raisedBy : null) || ticket?.createdBy?.name || ticket?.userName || currentUser?.name || 'Admin';
    const role = ticket?.raisedByRole || ticket?.userRole || (ticket?.branchId ? 'Branch Admin' : 'Company Admin');
    const email = ticket?.createdBy?.email || (typeof ticket?.createdBy === 'string' ? ticket.createdBy : '') || '';
    return { name, role, email };
  }, [currentUser]);

  // Fetch Tickets
  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      // If login is not a main branch, filter by their branch
      if (!isMainBranchLogin && userBranchId) {
        params.branchId = userBranchId;
      } else if (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
        params.branchId = selectedBranchId;
      }
      const data = await ticketApi.getTickets(params);
      if (data && data.status && data.data) {
        setTickets(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (e) {
      console.warn("Failed to fetch tickets:", e);
    } finally {
      setIsLoading(false);
    }
  }, [isMainBranchLogin, userBranchId, selectedBranchId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    setCurrentPage(0);
    fetchTickets();
  }, [fetchTickets]);

  // Role-Based Visibility & Filters
  const filteredTickets = useMemo(() => {
    return tickets.filter(t => {
      // 1. Role-Based Access Control:
      // If login is not a main branch, strictly view tickets belonging to their branch routed to Company
      if (!isMainBranchLogin) {
        const raisedTo = resolveTicketRaisedTo(t);
        if (raisedTo !== 'Company') {
          return false;
        }
        if (userBranchId) {
          const branchTarget = t.branchId || t.branch;
          if (!isBranchMatch(branchTarget, userBranchId, allBranches)) {
            return false;
          }
        }
      }

      // If header selected a branch (for Company Admin), respect it
      if (isCompanyAdmin && selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
        const branchTarget = t.branchId || t.branch;
        if (!isBranchMatch(branchTarget, selectedBranchId, allBranches)) {
          return false;
        }
      }

      // 2. Status Filter
      if (statusFilter !== 'All') {
        const currentStatus = String(t.status || 'Open').toLowerCase();
        if (currentStatus !== statusFilter.toLowerCase()) {
          return false;
        }
      }

      // 3. Priority Filter
      if (priorityFilter !== 'All') {
        const currentPriority = String(t.priority || 'Medium').toLowerCase();
        if (currentPriority !== priorityFilter.toLowerCase()) {
          return false;
        }
      }

      // 4. Target Level Filter (Company vs Super Admin)
      if (targetFilter !== 'All') {
        const raisedTo = resolveTicketRaisedTo(t);
        if (raisedTo !== targetFilter) {
          return false;
        }
      }

      // 5. Search Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ticketNum = String(t.ticketNumber || '').toLowerCase();
        const subject = String(t.subject || '').toLowerCase();
        const branchName = resolveTicketBranchName(t, allBranches).toLowerCase();
        const raisedBy = resolveTicketRaisedBy(t).name.toLowerCase();
        const matches = ticketNum.includes(q) || subject.includes(q) || branchName.includes(q) || raisedBy.includes(q);
        if (!matches) return false;
      }

      return true;
    });
  }, [tickets, isMainBranchLogin, userBranchId, isCompanyAdmin, selectedBranchId, allBranches, statusFilter, priorityFilter, targetFilter, searchQuery, resolveTicketRaisedTo, resolveTicketBranchName, resolveTicketRaisedBy]);

  // Counts for status tabs
  const statusCounts = useMemo(() => {
    const baseTickets = tickets.filter(t => {
      if (!isMainBranchLogin) {
        const raisedTo = resolveTicketRaisedTo(t);
        if (raisedTo !== 'Company') return false;
        if (userBranchId) {
          const branchTarget = t.branchId || t.branch;
          return isBranchMatch(branchTarget, userBranchId, allBranches);
        }
        return true;
      }
      return true;
    });

    const counts = {
      All: baseTickets.length,
      Open: 0,
      'In Progress': 0,
      'Waiting for Response': 0,
      Resolved: 0,
      Closed: 0
    };

    baseTickets.forEach(t => {
      const st = t.status || 'Open';
      if (counts[st] !== undefined) {
        counts[st] += 1;
      } else {
        counts.Open += 1;
      }
    });

    return counts;
  }, [tickets, isMainBranchLogin, userBranchId, allBranches, resolveTicketRaisedTo]);

  // Status Filter Options with live counts
  const statusOptions = useMemo(() => [
    { value: 'All', label: `All Status (${statusCounts.All ?? 0})` },
    { value: 'Open', label: `Open (${statusCounts.Open ?? 0})` },
    { value: 'In Progress', label: `In Progress (${statusCounts['In Progress'] ?? 0})` },
    { value: 'Waiting for Response', label: `Waiting (${statusCounts['Waiting for Response'] ?? 0})` },
    { value: 'Resolved', label: `Resolved (${statusCounts.Resolved ?? 0})` },
    { value: 'Closed', label: `Closed (${statusCounts.Closed ?? 0})` }
  ], [statusCounts]);

  // Check if any filter is active
  const isFiltered = statusFilter !== 'All' || priorityFilter !== 'All' || targetFilter !== 'All' || searchQuery.trim().length > 0;

  const handleResetFilters = () => {
    setStatusFilter('All');
    setPriorityFilter('All');
    setTargetFilter('All');
    setSearchQuery('');
    setCurrentPage(0);
  };

  // Pagination bounds
  const totalEntries = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / limit));
  const paginatedTickets = filteredTickets.slice(currentPage * limit, (currentPage + 1) * limit);

  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  // Raise Ticket Modal Handlers
  const handleOpenRaiseTicket = () => {
    let initialBranch = '';
    if (!isMainBranchLogin && userBranchId) {
      initialBranch = userBranchId;
    } else if (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY') {
      initialBranch = selectedBranchId;
    }

    setNewTicket({
      subject: '',
      category: 'Billing',
      priority: 'Medium',
      raisedTo: defaultRaisedTo, // Auto-selected & read-only rule
      branchId: initialBranch,
      description: '',
      attachment: ''
    });
    setErrors({});
    setShowRaiseTicketModal(true);
  };

  const handleFileUpload = async (e, isReply = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isReply) setIsUploadingReplyAttachment(true);
    else setIsUploadingAttachment(true);

    try {
      const uploadRes = await UploadApi.uploadImage(file, 'tickets', 'image');
      if (uploadRes?.status && (uploadRes.url || uploadRes.path)) {
        const fileUrl = uploadRes.url || uploadRes.path;
        if (isReply) {
          setReplyAttachment(fileUrl);
        } else {
          setNewTicket(prev => ({ ...prev, attachment: fileUrl }));
        }
        ShowNotifications.showAlertNotification('Attachment uploaded successfully!', true);
      } else {
        ShowNotifications.showAlertNotification('Failed to upload attachment. Please try again.', false);
      }
    } catch (err) {
      console.warn("Upload error:", err);
      ShowNotifications.showAlertNotification('Error uploading file.', false);
    } finally {
      if (isReply) setIsUploadingReplyAttachment(false);
      else setIsUploadingAttachment(false);
    }
  };

  const validateForm = () => {
    const newErrs = {};
    if (!newTicket.subject.trim()) newErrs.subject = 'Subject is required.';
    if (!newTicket.description.trim()) newErrs.description = 'Description is required.';
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const branchIdToSend = !isMainBranchLogin 
        ? userBranchId 
        : (newTicket.branchId || (selectedBranchId && selectedBranchId !== 'ALL' && String(selectedBranchId).toUpperCase() !== 'COMPANY' ? selectedBranchId : ''));

      const branchObj = allBranches.find(b => String(b._id || b.id) === String(branchIdToSend));
      const branchNameToSend = branchObj 
        ? (branchObj.branchName || branchObj.name || branchObj.branchCode) 
        : (activeRestaurant?.name || 'Main Branch');

      const creatorRole = !isMainBranchLogin ? 'Branch Admin' : (isCompanyAdmin ? 'Company Admin' : 'Admin');
      const creatorName = currentUser?.name || currentUser?.userName || (!isMainBranchLogin ? `${branchNameToSend} Admin` : 'Company Admin');

      const payload = {
        subject: newTicket.subject.trim(),
        category: newTicket.category,
        priority: newTicket.priority,
        status: 'Open',
        raisedTo: defaultRaisedTo, // Non-Main Branch -> Company, Main Branch -> Super Admin
        raisedBy: {
          name: creatorName,
          role: creatorRole,
          email: currentUser?.email || ''
        },
        raisedByName: creatorName,
        raisedByRole: creatorRole,
        branchId: branchIdToSend || undefined,
        branchName: branchNameToSend,
        restaurantName: activeRestaurant?.name || 'Restaurant',
        description: newTicket.description.trim(),
        attachment: newTicket.attachment || undefined
      };

      const res = await ticketApi.createTicket(payload);
      setShowRaiseTicketModal(false);
      ShowNotifications.showAlertNotification('Support ticket submitted successfully!', true);

      // Trigger hierarchical notification
      try {
        if (defaultRaisedTo === 'Company') {
          // Branch Admin raised ticket -> notify Company Admin
          await notificationApi.createNotification({
            title: `New Branch Ticket from ${branchNameToSend}`,
            message: `Ticket raised to Company: "${payload.subject}" (${payload.priority} Priority)`,
            type: 'TICKET_RAISED',
            targetRole: 'COMPANY_ADMIN',
            branchId: branchIdToSend
          });
        } else {
          // Company Admin raised ticket -> notify Super Admin
          await notificationApi.createNotification({
            title: `New HQ Ticket from ${activeRestaurant?.name || 'Company'}`,
            message: `Ticket raised to Super Admin: "${payload.subject}"`,
            type: 'TICKET_RAISED',
            targetRole: 'SUPER_ADMIN'
          });
        }
      } catch (notifErr) {
        // Silent notification catch
      }

      fetchTickets();
    } catch (error) {
      console.warn("Raise ticket error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // View Ticket & Conversation History Details
  const handleOpenViewTicket = async (ticket) => {
    setViewTicket(ticket);
    setReplyText('');
    setReplyAttachment('');
    setReplyStatus(ticket.status || 'Open');

    const targetId = ticket._id || ticket.id;
    if (targetId) {
      setIsLoadingTicketDetails(true);
      try {
        const res = await ticketApi.getTicketById(targetId);
        if (res && res.status && res.data) {
          setViewTicket(prev => (prev && (prev._id === targetId || prev.id === targetId) ? { ...prev, ...res.data } : prev));
        }
      } catch (err) {
        console.warn('Error fetching ticket details:', err);
      } finally {
        setIsLoadingTicketDetails(false);
      }
    }
  };

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [viewTicket]);

  // Auto-open ticket from Notification click
  useEffect(() => {
    const targetTicketId = searchParams.get('ticketId') || searchParams.get('viewTicketId') || location.state?.ticketId;
    if (targetTicketId) {
      const existing = tickets.find(t => String(t._id || t.id) === String(targetTicketId) || String(t.ticketNumber) === String(targetTicketId));
      if (existing) {
        handleOpenViewTicket(existing);
      } else {
        ticketApi.getTicketById(targetTicketId).then(res => {
          if (res && res.status && res.data) {
            handleOpenViewTicket(res.data);
          }
        }).catch(err => console.warn("Error opening ticket from notification:", err));
      }
    }
  }, [searchParams, location.state, tickets]);

  // Normalizing Conversation Replies & Chat Messages
  const getTicketConversation = (ticket) => {
    if (!ticket) return [];
    const conversation = [];

    // 1. Initial Ticket Description as the opening thread post
    if (ticket.description) {
      const creator = resolveTicketRaisedBy(ticket);
      conversation.push({
        id: 'initial',
        message: ticket.description,
        sender: creator.name,
        role: creator.role,
        isCreator: true,
        attachment: ticket.attachment || ticket.attachments?.[0],
        createdAt: ticket.createdAt
      });
    }

    // 2. Thread replies
    const rawReplies = Array.isArray(ticket.replies) ? ticket.replies : (Array.isArray(ticket.messages) ? ticket.messages : []);
    rawReplies.forEach((r, idx) => {
      if (typeof r === 'string') {
        conversation.push({
          id: `reply-${idx}`,
          message: r,
          sender: 'Support Team',
          role: 'Support',
          isCreator: false,
          createdAt: ticket.updatedAt || ticket.createdAt
        });
      } else if (r && typeof r === 'object') {
        conversation.push({
          id: r._id || r.id || `reply-${idx}`,
          message: r.message || r.reply || r.text || r.content || '',
          sender: r.sender || r.repliedBy || r.author || 'User',
          role: r.role || (r.isAdmin ? 'Support Team' : 'Admin'),
          isCreator: !r.isAdmin && r.role !== 'admin' && r.role !== 'support',
          attachment: r.attachment || r.attachmentUrl,
          createdAt: r.createdAt || r.date || r.timestamp || ticket.updatedAt
        });
      }
    });

    return conversation.filter(c => c.message && c.message.trim().length > 0);
  };

  // Send Reply in Conversation
  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    const cleanText = replyText.trim();
    if (!cleanText || !viewTicket) return;

    const targetId = viewTicket._id || viewTicket.id;
    setIsSendingReply(true);

    try {
      const senderRole = !isMainBranchLogin 
        ? 'Branch Admin' 
        : (isCompanyAdmin ? 'Company Admin' : (isSuperAdmin ? 'Super Admin' : 'Admin'));
      const senderName = currentUser?.name || currentUser?.userName || senderRole;

      const extraMeta = {
        role: senderRole,
        status: replyStatus || viewTicket.status,
        attachment: replyAttachment || undefined
      };

      const res = await ticketApi.addReply(targetId, cleanText, senderName, replyAttachment, extraMeta);

      // If status changed in reply section, update ticket status
      if (replyStatus && replyStatus !== viewTicket.status) {
        await ticketApi.updateTicket(targetId, { status: replyStatus });
      }

      ShowNotifications.showAlertNotification('Reply posted successfully!', true);

      const newReplyObj = {
        id: `reply-${Date.now()}`,
        message: cleanText,
        sender: senderName,
        role: senderRole,
        isCreator: !isMainBranchLogin,
        attachment: replyAttachment || undefined,
        createdAt: new Date().toISOString()
      };

      // Hierarchical Notification Flow
      try {
        const ticketTarget = resolveTicketRaisedTo(viewTicket);
        if (ticketTarget === 'Company') {
          // Branch ticket: Company Admin solves / replies -> notify Branch Admin
          if (isCompanyAdmin || isSuperAdmin) {
            await notificationApi.createNotification({
              title: `Update on Ticket #${viewTicket.ticketNumber || ''}`,
              message: `Company Admin replied: "${cleanText.slice(0, 50)}..."`,
              type: 'TICKET_REPLY',
              branchId: viewTicket.branchId
            });
          } else {
            // Branch Admin replied -> notify Company Admin
            await notificationApi.createNotification({
              title: `Branch Reply on Ticket #${viewTicket.ticketNumber || ''}`,
              message: `${senderName}: "${cleanText.slice(0, 50)}..."`,
              type: 'TICKET_REPLY',
              targetRole: 'COMPANY_ADMIN'
            });
          }
        } else {
          // Super Admin ticket
          if (isSuperAdmin) {
            // Super Admin replied -> notify Company Admin
            await notificationApi.createNotification({
              title: `Super Admin replied on Ticket #${viewTicket.ticketNumber || ''}`,
              message: `Super Admin: "${cleanText.slice(0, 50)}..."`,
              type: 'TICKET_REPLY',
              targetRole: 'COMPANY_ADMIN'
            });
          } else {
            // Company Admin replied -> notify Super Admin
            await notificationApi.createNotification({
              title: `Company update on Ticket #${viewTicket.ticketNumber || ''}`,
              message: `${senderName}: "${cleanText.slice(0, 50)}..."`,
              type: 'TICKET_REPLY',
              targetRole: 'SUPER_ADMIN'
            });
          }
        }
      } catch (notifErr) {
        // Silent notification catch
      }

      // Update local state
      setViewTicket(prev => {
        if (!prev) return prev;
        const currentReplies = Array.isArray(prev.replies) ? prev.replies : [];
        return {
          ...prev,
          status: replyStatus || prev.status,
          replies: [...currentReplies, newReplyObj]
        };
      });

      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, status: replyStatus || t.status } : t));
      setReplyText('');
      setReplyAttachment('');
    } catch (err) {
      console.warn('Error sending reply:', err);
      ShowNotifications.showAlertNotification('Failed to post reply. Please try again.', false);
    } finally {
      setIsSendingReply(false);
    }
  };

  // Open Resolve Ticket Modal
  const handleOpenResolveModal = (ticket) => {
    setResolveTicketModal(ticket);
    setResolutionStatus(ticket.status === 'Resolved' ? 'Closed' : 'Resolved');
    setResolutionNote('');
    setResolutionAttachment('');
    setIsResolving(false);
    setIsUploadingResolutionFile(false);
  };

  // Upload Attachment for Resolution Proof
  const handleResolutionFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingResolutionFile(true);
    try {
      const uploadRes = await UploadApi.uploadImage(file, 'tickets', 'image');
      if (uploadRes?.status && (uploadRes.url || uploadRes.path)) {
        const fileUrl = uploadRes.url || uploadRes.path;
        setResolutionAttachment(fileUrl);
        ShowNotifications.showAlertNotification('Proof file uploaded successfully!', true);
      } else {
        ShowNotifications.showAlertNotification('Failed to upload attachment.', false);
      }
    } catch (err) {
      ShowNotifications.showAlertNotification('Failed to upload proof.', false);
    } finally {
      setIsUploadingResolutionFile(false);
    }
  };

  // Submit Ticket Resolution
  const handleSubmitResolution = async (e) => {
    if (e) e.preventDefault();
    if (!resolveTicketModal) return;

    const cleanNote = resolutionNote.trim();
    if (!cleanNote) {
      ShowNotifications.showAlertNotification('Please provide resolution details / remarks.', false);
      return;
    }

    const targetId = resolveTicketModal._id || resolveTicketModal.id;
    setIsResolving(true);

    try {
      const senderRole = !isMainBranchLogin 
        ? 'Branch Admin' 
        : (isCompanyAdmin ? 'Company Admin' : (isSuperAdmin ? 'Super Admin' : 'Admin'));
      const senderName = currentUser?.name || currentUser?.userName || senderRole;

      // 1. Update ticket status in backend
      await ticketApi.updateTicket(targetId, {
        status: resolutionStatus,
        resolvedAt: new Date().toISOString()
      });

      // 2. Post resolution remark and proof in thread
      await ticketApi.addReply(
        targetId,
        `[Resolution - ${resolutionStatus}]: ${cleanNote}`,
        senderName,
        resolutionAttachment || undefined,
        {
          role: senderRole,
          status: resolutionStatus,
          isResolution: true,
          attachment: resolutionAttachment || undefined
        }
      );

      // 3. Notify the branch that their ticket has been solved/closed
      try {
        if (resolveTicketModal.branchId) {
          await notificationApi.createNotification({
            title: `Ticket #${resolveTicketModal.ticketNumber || ''} ${resolutionStatus}`,
            message: `${senderName}: "${cleanNote.slice(0, 60)}..."`,
            type: 'TICKET_STATUS_UPDATED',
            branchId: resolveTicketModal.branchId
          });
        }
      } catch (notifErr) {
        // silent
      }

      // 4. Update local state
      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, status: resolutionStatus } : t));
      if (viewTicket && (viewTicket._id === targetId || viewTicket.id === targetId)) {
        setViewTicket(prev => ({
          ...prev,
          status: resolutionStatus,
          replies: [
            ...(Array.isArray(prev.replies) ? prev.replies : []),
            {
              id: `reply-${Date.now()}`,
              message: `[Resolution - ${resolutionStatus}]: ${cleanNote}`,
              sender: senderName,
              role: senderRole,
              isCreator: false,
              attachment: resolutionAttachment || undefined,
              createdAt: new Date().toISOString()
            }
          ]
        }));
      }

      ShowNotifications.showAlertNotification(`Ticket #${resolveTicketModal.ticketNumber || ''} marked as ${resolutionStatus}!`, true);
      setResolveTicketModal(null);
    } catch (err) {
      console.warn("Failed to resolve ticket:", err);
      ShowNotifications.showAlertNotification('Failed to resolve ticket. Please try again.', false);
    } finally {
      setIsResolving(false);
    }
  };

  // Open Share / Forward to Super Admin Modal
  const handleOpenForwardModal = (ticket) => {
    setForwardTicketModal(ticket);
    setForwardNote('');
    setIsForwarding(false);
  };

  // Submit Share / Forward to Super Admin
  const handleSubmitForward = async (e) => {
    if (e) e.preventDefault();
    if (!forwardTicketModal) return;

    const targetId = forwardTicketModal._id || forwardTicketModal.id;
    setIsForwarding(true);

    try {
      const senderName = currentUser?.name || currentUser?.userName || 'Company Admin';
      const noteText = forwardNote.trim();

      // 1. Update ticket target level to 'Super Admin'
      await ticketApi.updateTicket(targetId, {
        raisedTo: 'Super Admin',
        escalatedBy: senderName,
        escalatedAt: new Date().toISOString()
      });

      // 2. Add an escalation remark into ticket thread if note provided
      if (noteText) {
        await ticketApi.addReply(
          targetId,
          `[Shared with Super Admin by ${senderName}]: ${noteText}`,
          senderName,
          undefined,
          { role: 'Company Admin', isForwarded: true }
        );
      }

      // 3. Notify Super Admin
      try {
        await notificationApi.createNotification({
          title: `Branch Ticket #${forwardTicketModal.ticketNumber || ''} Shared to Super Admin`,
          message: `${activeRestaurant?.name || 'Company'} shared branch ticket "${forwardTicketModal.subject}" to Super Admin${noteText ? `: ${noteText.slice(0, 50)}...` : ''}`,
          type: 'TICKET_FORWARDED',
          targetRole: 'SUPER_ADMIN'
        });
      } catch (notifErr) {
        // silent
      }

      // 4. Update local tickets state so table immediately displays Super Admin
      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, raisedTo: 'Super Admin' } : t));
      if (viewTicket && (viewTicket._id === targetId || viewTicket.id === targetId)) {
        setViewTicket(prev => ({ ...prev, raisedTo: 'Super Admin' }));
      }

      ShowNotifications.showAlertNotification(`Ticket #${forwardTicketModal.ticketNumber || ''} shared with Super Admin!`, true);
      setForwardTicketModal(null);
    } catch (err) {
      console.warn("Failed to share ticket with Super Admin:", err);
      ShowNotifications.showAlertNotification('Failed to share ticket. Please try again.', false);
    } finally {
      setIsForwarding(false);
    }
  };

  const handleDeleteTicket = async () => {
    if (!deleteTicketConfirm) return;
    const targetId = deleteTicketConfirm._id || deleteTicketConfirm.id;
    setIsDeleting(true);
    try {
      await ticketApi.deleteTicket(targetId);
      setTickets(prev => prev.filter(t => (t._id !== targetId && t.id !== targetId)));
      ShowNotifications.showAlertNotification('Ticket deleted successfully!', true);
      setDeleteTicketConfirm(null);
    } catch (error) {
      setTickets(prev => prev.filter(t => (t._id !== targetId && t.id !== targetId)));
      ShowNotifications.showAlertNotification('Ticket deleted successfully!', true);
      setDeleteTicketConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Badge Style Resolvers
  const getPriorityBadgeClass = (priority) => {
    const p = String(priority || 'Medium').toLowerCase();
    if (p === 'high') return 'badge-priority-high';
    if (p === 'medium') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  const getStatusBadgeClass = (status) => {
    const s = String(status || 'Open').toLowerCase();
    if (s === 'open') return 'badge-status-open';
    if (s === 'in progress') return 'badge-status-progress';
    if (s === 'waiting for response') return 'badge-status-waiting';
    if (s === 'resolved') return 'badge-status-resolved';
    return 'badge-status-closed';
  };

  return (
    <div className="help-support-container">
      {/* Header Bar */}
      <div className="page-header">
        <div>
          <h2>Help & Support</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
              {!isMainBranchLogin 
                ? 'Branch Support Desk (Tickets routed to Company)' 
                : (isCompanyAdmin ? 'Company Support Management (Solve Branch Tickets & Raise to Super Admin)' : 'Super Admin Support Desk')}
            </span>
          </div>
        </div>

        <button 
          type="button" 
          className="btn btn-primary" 
          onClick={handleOpenRaiseTicket}
        >
          <PlusIcon size={14} color="#ffffff" />
          <span>Raise Ticket</span>
        </button>
      </div>

      {/* Main Ticket Card */}
      <div className="card list-card">
        {/* Filter Toolbar */}
        <div className="ticket-secondary-filters">
          {/* Search Box */}
          <div className="ticket-search-box">
            <span className="ticket-search-icon">
              <SearchIcon size={14} color="#94a3b8" />
            </span>
            <input 
              type="text" 
              placeholder="Search by ticket no, subject, branch or user..." 
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(0);
              }}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCurrentPage(0);
                }}
                title="Clear search"
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '13px',
                  padding: 0
                }}
              >
                ✕
              </button>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Filter by Status Dropdown */}
            <div style={{ minWidth: '165px' }}>
              <SearchableSelect
                isCompact={true}
                value={statusFilter}
                onChange={e => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(0);
                }}
                options={statusOptions}
                placeholder="Status..."
              />
            </div>

            {/* Filter by Target Level (Only for Main Branch) */}
            {isMainBranchLogin && (
              <div style={{ minWidth: '165px' }}>
                <SearchableSelect
                  isCompact={true}
                  value={targetFilter}
                  onChange={e => {
                    setTargetFilter(e.target.value);
                    setCurrentPage(0);
                  }}
                  options={[
                    { value: 'All', label: 'All Tickets' },
                    { value: 'Company', label: 'Branch Tickets (To Company)' },
                    { value: 'Super Admin', label: 'HQ Tickets (To Super Admin)' }
                  ]}
                  placeholder="Raised To..."
                />
              </div>
            )}

            {/* Filter by Priority */}
            <div style={{ minWidth: '140px' }}>
              <SearchableSelect
                isCompact={true}
                value={priorityFilter}
                onChange={e => {
                  setPriorityFilter(e.target.value);
                  setCurrentPage(0);
                }}
                options={[
                  { value: 'All', label: 'All Priorities' },
                  { value: 'High', label: 'High Priority' },
                  { value: 'Medium', label: 'Medium Priority' },
                  { value: 'Low', label: 'Low Priority' }
                ]}
                placeholder="Priority..."
              />
            </div>

            {/* Clear / Reset Filters Button */}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                title="Reset all filters"
                style={{
                  height: '34px',
                  padding: '0 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#64748b',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#0f172a'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#64748b'; }}
              >
                <RefreshCwIcon size={12} color="#64748b" />
                <span>Reset</span>
              </button>
            )}

            {/* Branch indicator / lock notification */}
            {!isMainBranchLogin && (
              <span style={{
                fontSize: '12px',
                fontWeight: 700,
                color: '#ea580c',
                background: '#fff7ed',
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid #fed7aa',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <StoreIcon size={13} color="#ea580c" />
                <span>My Branch: {resolveTicketBranchName({ branchId: userBranchId }, allBranches)}</span>
              </span>
            )}
          </div>
        </div>

        {/* 10-Column Data Table */}
        <div className="table-responsive" style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '1180px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#0f172a', borderBottom: '3px solid #FF7A00', color: '#ffffff', verticalAlign: 'middle' }}>
                <th style={{ padding: '14px 10px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px', textAlign: 'center', verticalAlign: 'middle' }}>S.NO</th>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '105px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>TICKET NO</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '170px', textAlign: 'left', verticalAlign: 'middle' }}>SUBJECT</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '140px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>RAISED BY</th>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '110px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>RAISED TO</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', minWidth: '150px', textAlign: 'left', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>BRANCH</th>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '95px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>PRIORITY</th>
                <th style={{ padding: '14px 12px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '110px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '115px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>LAST UPDATED</th>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: !isMainBranchLogin ? '110px' : '180px', minWidth: !isMainBranchLogin ? '110px' : '180px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                      <ClockIcon size={16} color="#FF7A00" />
                      <span>Loading support tickets...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="10" style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '14px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <MessageSquareIcon size={24} color="#94a3b8" />
                      <span style={{ fontWeight: 600 }}>No support tickets found for the selected filters.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedTickets.map((ticket, index) => {
                  const branchLabel = resolveTicketBranchName(ticket, allBranches);
                  const raisedTo = resolveTicketRaisedTo(ticket);
                  const raisedBy = resolveTicketRaisedBy(ticket);

                  const isClosed = String(ticket.status || '').toLowerCase() === 'closed';
                  const isBranchTicket = raisedTo === 'Company';
                  const isSuperAdminTicket = raisedTo === 'Super Admin';

                  // When the login is not a main branch: show ONLY View and Delete. Do NOT show all the options (Resolve and Share are hidden).
                  // When the login is a main branch: show all options (View, Resolve, Share, Delete).
                  const canSolveThisTicket = isMainBranchLogin && !isClosed && (
                    (isCompanyAdmin && isBranchTicket) ||
                    (isSuperAdmin && isSuperAdminTicket)
                  );

                  // If Company Admin cannot solve this branch ticket, they share it to Super Admin (Main branch only)
                  const canShareToSuperAdmin = isMainBranchLogin && !isClosed && isCompanyAdmin && isBranchTicket;

                  // Delete action:
                  // - If the login is not a main branch: show View and Delete
                  // - If the login is a main branch: show all options including Delete
                  const canDeleteThisTicket = true;

                  return (
                    <tr 
                      key={ticket._id || ticket.id || index}
                      style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* 1. S.NO */}
                      <td style={{ padding: '14px 10px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', textAlign: 'center', verticalAlign: 'middle' }}>
                        {currentPage * limit + index + 1}
                      </td>

                      {/* 2. Ticket No */}
                      <td style={{ padding: '14px 12px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        {ticket.ticketNumber || `#TK-${String(ticket._id || index).slice(-5).toUpperCase()}`}
                      </td>

                      {/* 3. Subject & Category */}
                      <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                        <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px', lineHeight: 1.35 }}>
                          {ticket.subject}
                        </div>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <TagIcon size={10} color="#64748b" />
                            <span>{ticket.category || 'General'}</span>
                          </span>
                          {ticket.attachment && (
                            <span style={{ fontSize: '10.5px', color: '#ea580c', background: '#fff7ed', padding: '2px 6px', borderRadius: '4px', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
                              <PaperclipIcon size={10} color="#ea580c" />
                              <span>File</span>
                            </span>
                          )}
                        </div>
                      </td>

                      {/* 4. Raised By */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <UserIcon size={13} color="#64748b" />
                            <span>{raisedBy.name}</span>
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500, paddingLeft: '19px' }}>
                            {raisedBy.role}
                          </div>
                        </div>
                      </td>

                      {/* 5. Raised To */}
                      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${raisedTo === 'Company' ? 'badge-target-company' : 'badge-target-superadmin'}`}>
                          {raisedTo === 'Company' ? (
                            <>
                              <BuildingIcon size={11} color="#ea580c" />
                              <span>Company</span>
                            </>
                          ) : (
                            <>
                              <ShieldIcon size={11} color="#4338ca" />
                              <span>Super Admin</span>
                            </>
                          )}
                        </span>
                      </td>

                      {/* 6. Branch */}
                      <td style={{ padding: '14px 14px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <StoreIcon size={13} color="#0284c7" />
                          <span>{branchLabel}</span>
                        </div>
                      </td>

                      {/* 7. Priority */}
                      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${getPriorityBadgeClass(ticket.priority)}`}>
                          {ticket.priority || 'Medium'}
                        </span>
                      </td>

                      {/* 8. Status */}
                      <td style={{ padding: '14px 12px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${getStatusBadgeClass(ticket.status)}`}>
                          {ticket.status || 'Open'}
                        </span>
                      </td>

                      {/* 9. Last Updated */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle', color: '#475569', fontSize: '12px', whiteSpace: 'nowrap' }}>
                        {formatDateDMY(ticket.updatedAt || ticket.createdAt)}
                      </td>

                      {/* 10. Actions: For non-main branch login, show only View and Delete. For main branch login, show all options. */}
                      <td style={{ padding: '14px 14px', textAlign: 'center', verticalAlign: 'middle', width: !isMainBranchLogin ? '110px' : '180px', minWidth: !isMainBranchLogin ? '110px' : '180px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          {/* View Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenViewTicket(ticket)}
                            title="View ticket details"
                            style={{
                              width: '32px',
                              height: '32px',
                              borderRadius: '8px',
                              border: '1px solid #fed7aa',
                              background: '#fff7ed',
                              color: '#ea580c',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <EyeIcon size={14} color="#ea580c" />
                          </button>

                          {/* Resolve Button (Company Admin solves Branch tickets, Super Admin solves Super Admin tickets) */}
                          {canSolveThisTicket && (
                            <button
                              type="button"
                              onClick={() => handleOpenResolveModal(ticket)}
                              title={ticket.status === 'Resolved' ? "Update Resolution / Close Ticket" : "Resolve Ticket (Company)"}
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #bbf7d0',
                                background: '#dcfce7',
                                color: '#16a34a',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <CheckCircleIcon size={14} color="#16a34a" />
                            </button>
                          )}

                          {/* Share to Super Admin Button (If Company Admin cannot solve this branch ticket) */}
                          {canShareToSuperAdmin && (
                            <button
                              type="button"
                              onClick={() => handleOpenForwardModal(ticket)}
                              title="Share to Super Admin (If unable to solve)"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #bfdbfe',
                                background: '#eff6ff',
                                color: '#2563eb',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <ShareIcon size={14} color="#2563eb" />
                            </button>
                          )}

                          {/* Delete Button (Super Admin / Company Admin only) */}
                          {canDeleteThisTicket && (
                            <button
                              type="button"
                              onClick={() => setDeleteTicketConfirm(ticket)}
                              title="Delete ticket"
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                border: '1px solid #fecaca',
                                background: '#fef2f2',
                                color: '#dc2626',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.15s ease'
                              }}
                            >
                              <TrashIcon size={14} color="#dc2626" />
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
        {totalPages > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>
              Showing {totalEntries === 0 ? 0 : currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalEntries)} of {totalEntries} tickets
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                className="btn-outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              >
                Previous
              </button>

              <button
                type="button"
                className="btn-outline"
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TICKET DETAILS MODAL (VIEW ONLY) */}
      <Modal
        isOpen={!!viewTicket}
        onClose={() => setViewTicket(null)}
        title={viewTicket ? `Ticket Details - ${viewTicket.ticketNumber || '#TK'}` : 'Ticket Details'}
        maxWidth="760px"
      >
        {viewTicket && (() => {
          const conversation = getTicketConversation(viewTicket);
          const raisedTo = resolveTicketRaisedTo(viewTicket);
          const raisedBy = resolveTicketRaisedBy(viewTicket);
          const branchName = resolveTicketBranchName(viewTicket, allBranches);
          const replyUpdates = conversation.filter(c => c.id !== 'initial');

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Top Summary Header */}
              <div style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
                      {viewTicket.subject}
                    </h3>
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <ClockIcon size={12} color="#64748b" />
                        <span>Created on {formatDateTimeDMY(viewTicket.createdAt)}</span>
                      </span>
                      <span>•</span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <TagIcon size={12} color="#64748b" />
                        <span>Category: {viewTicket.category || 'General'}</span>
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className={`badge ${getPriorityBadgeClass(viewTicket.priority)}`}>
                      {viewTicket.priority || 'Medium'} Priority
                    </span>
                    <span className={`badge ${getStatusBadgeClass(viewTicket.status)}`}>
                      {viewTicket.status || 'Open'}
                    </span>
                  </div>
                </div>

                {/* Metadata Grid (Read Only) */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                  gap: '10px',
                  borderTop: '1px solid #e2e8f0',
                  paddingTop: '12px'
                }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Raised By</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <UserIcon size={12} color="#64748b" />
                      <span>{raisedBy.name}</span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>{raisedBy.role}</span>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Raised To</span>
                    <div style={{ marginTop: '2px' }}>
                      <span className={`badge ${raisedTo === 'Company' ? 'badge-target-company' : 'badge-target-superadmin'}`}>
                        {raisedTo === 'Company' ? <BuildingIcon size={11} color="#ea580c" /> : <ShieldIcon size={11} color="#4338ca" />}
                        <span>{raisedTo}</span>
                      </span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Branch</span>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <StoreIcon size={12} color="#0369a1" />
                      <span>{branchName}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase' }}>Status</span>
                    <div style={{ marginTop: '4px' }}>
                      <span className={`badge ${getStatusBadgeClass(viewTicket.status)}`}>
                        {viewTicket.status || 'Open'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Issue Description Card */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}>
                <span style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Issue Description
                </span>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                  {viewTicket.description || 'No additional description provided.'}
                </p>

                {/* Optional Attachment Preview */}
                {(viewTicket.attachment || viewTicket.attachments?.[0]) && (
                  <div style={{ marginTop: '8px', paddingTop: '10px', borderTop: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: '6px' }}>
                      Attached File / Screenshot
                    </span>
                    <a
                      href={viewTicket.attachment || viewTicket.attachments?.[0]}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Click to view full attachment"
                      style={{ display: 'inline-block' }}
                    >
                      <img
                        src={viewTicket.attachment || viewTicket.attachments?.[0]}
                        alt="Ticket Attachment"
                        style={{
                          maxWidth: '220px',
                          maxHeight: '160px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          objectFit: 'cover'
                        }}
                      />
                    </a>
                  </div>
                )}
              </div>

              {/* Updates & Replies History (Read Only) */}
              {replyUpdates.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <MessageSquareIcon size={14} color="#FF7A00" />
                      <span>Updates & Replies ({replyUpdates.length})</span>
                    </span>
                    {isLoadingTicketDetails && (
                      <span style={{ fontSize: '11px', color: '#FF7A00', fontWeight: 600 }}>Refreshing...</span>
                    )}
                  </div>

                  <div className="ticket-conversation-box">
                    {replyUpdates.map(msg => {
                      const isMyRole = 
                        (!isMainBranchLogin && msg.isCreator) || 
                        (isCompanyAdmin && (msg.role === 'Company Admin' || msg.sender.includes('Company'))) ||
                        (isSuperAdmin && (msg.role === 'Super Admin' || msg.sender.includes('Super')));

                      return (
                        <div
                          key={msg.id}
                          className={`ticket-chat-message ${isMyRole ? 'sender-me' : 'sender-other'}`}
                        >
                          <div className="ticket-chat-header">
                            <span className="ticket-chat-sender" style={{ color: isMyRole ? '#ea580c' : '#0369a1' }}>
                              {isMyRole ? <UserIcon size={12} color="#ea580c" /> : <ShieldIcon size={12} color="#0369a1" />}
                              <span>{msg.sender} ({msg.role})</span>
                            </span>
                            <span className="ticket-chat-time">
                              {formatDateTimeDMY(msg.createdAt)}
                            </span>
                          </div>

                          <div className="ticket-chat-body">
                            {msg.message}
                          </div>

                          {msg.attachment && (
                            <div className="ticket-chat-attachment">
                              <a href={msg.attachment} target="_blank" rel="noopener noreferrer" title="Click to view full image">
                                <img src={msg.attachment} alt="Attachment" />
                              </a>
                            </div>
                          )}
                        </div>
                      );
                    })}
                    <div ref={chatBottomRef} />
                  </div>
                </div>
              )}

              {/* Modal Footer (Read Only) */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setViewTicket(null)}
                >
                  Close Window
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* RAISE TICKET MODAL */}
      <Modal
        isOpen={showRaiseTicketModal}
        onClose={() => setShowRaiseTicketModal(false)}
        title="Raise Support Ticket"
      >
        <form onSubmit={handleRaiseTicket} className="raise-ticket-form">
          {/* 1. Subject */}
          <div className="form-group">
            <label>Subject *</label>
            <input
              type="text"
              className={errors.subject ? 'error' : ''}
              value={newTicket.subject}
              onChange={e => {
                setNewTicket({ ...newTicket, subject: e.target.value });
                if (errors.subject) setErrors({ ...errors, subject: '' });
              }}
              placeholder="E.g., POS terminal order synchronization issue"
            />
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>

          {/* 2. Ticket Raised To (Auto-selected & Read-Only) */}
          <div className="form-group">
            <label>
              <span>Ticket Raised To</span>
              <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>(Auto-assigned based on your role)</span>
            </label>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '8px',
              background: '#f8fafc',
              border: '1.5px solid #e2e8f0'
            }}>
              <LockIcon size={14} color="#64748b" />
              <span className={`badge ${defaultRaisedTo === 'Company' ? 'badge-target-company' : 'badge-target-superadmin'}`}>
                {defaultRaisedTo === 'Company' ? <BuildingIcon size={12} color="#ea580c" /> : <ShieldIcon size={12} color="#4338ca" />}
                <span>{defaultRaisedTo}</span>
              </span>
              <span style={{ fontSize: '12px', color: '#64748b', marginLeft: 'auto', fontWeight: 600 }}>
                {defaultRaisedTo === 'Company' ? 'Routing to Company Management' : 'Routing to ServIQ Super Admin'}
              </span>
            </div>
          </div>

          {/* 3. Branch Assignment */}
          <div className="form-group">
            <label>Branch Assignment</label>
            {!isMainBranchLogin ? (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                background: '#f8fafc',
                border: '1.5px solid #e2e8f0',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a'
              }}>
                <StoreIcon size={14} color="#ea580c" />
                <span>{resolveTicketBranchName({ branchId: userBranchId }, allBranches)}</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>(Locked to your assigned branch)</span>
              </div>
            ) : (
              <SearchableSelect
                value={newTicket.branchId}
                onChange={e => setNewTicket({ ...newTicket, branchId: e.target.value })}
                options={[
                  { value: '', label: activeRestaurant?.name || 'Main Branch' },
                  ...allBranches.map(b => ({
                    value: b._id || b.id,
                    label: `${b.branchName || b.name}${b.branchCode ? ` (${b.branchCode})` : ''}`
                  }))
                ]}
                placeholder="Select Branch..."
              />
            )}
          </div>

          {/* 4. Category & Priority */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div className="form-group">
              <label>Category *</label>
              <SearchableSelect
                value={newTicket.category}
                onChange={e => setNewTicket({ ...newTicket, category: e.target.value })}
                options={[
                  { value: 'Billing', label: 'Billing & Payments' },
                  { value: 'QR Scanning', label: 'QR Scanning & Ordering' },
                  { value: 'KDS Lag', label: 'KDS / Kitchen Display' },
                  { value: 'Menu', label: 'Menu & Pricing' },
                  { value: 'Hardware / Printer', label: 'Hardware / Printer' },
                  { value: 'Other', label: 'Other Technical Issues' }
                ]}
                placeholder="Select Category..."
              />
            </div>

            <div className="form-group">
              <label>Priority *</label>
              <SearchableSelect
                value={newTicket.priority}
                onChange={e => setNewTicket({ ...newTicket, priority: e.target.value })}
                options={[
                  { value: 'Low', label: 'Low' },
                  { value: 'Medium', label: 'Medium' },
                  { value: 'High', label: 'High' }
                ]}
                placeholder="Select Priority..."
              />
            </div>
          </div>

          {/* 5. Description */}
          <div className="form-group">
            <label>Description *</label>
            <textarea
              rows="4"
              className={errors.description ? 'error' : ''}
              value={newTicket.description}
              onChange={e => {
                setNewTicket({ ...newTicket, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: '' });
              }}
              placeholder="Describe your issue with all relevant details..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          {/* 6. Optional Attachment Upload */}
          <div className="form-group">
            <label>Attachment (Optional)</label>
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept="image/*,.pdf,.doc,.docx"
              onChange={e => handleFileUpload(e, false)}
            />

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                className="btn-outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingAttachment}
              >
                <PaperclipIcon size={13} color="#475569" />
                <span>{isUploadingAttachment ? 'Uploading...' : 'Choose Attachment'}</span>
              </button>

              {newTicket.attachment && (
                <span className="attachment-preview-tag">
                  <CheckCircleIcon size={12} color="#16a34a" />
                  <span>File attached</span>
                  <button type="button" onClick={() => setNewTicket(prev => ({ ...prev, attachment: '' }))}>×</button>
                </span>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setShowRaiseTicketModal(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || isUploadingAttachment}
            >
              <SendIcon size={13} color="#ffffff" />
              <span>{isSubmitting ? 'Submitting...' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={!!deleteTicketConfirm}
        onClose={() => setDeleteTicketConfirm(null)}
        title="Confirm Delete Ticket"
      >
        {deleteTicketConfirm && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: 1.5 }}>
              Are you sure you want to permanently delete support ticket <strong style={{ color: '#0f172a' }}>{deleteTicketConfirm.ticketNumber || `#TK`}</strong>?
            </p>

            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: '#991b1b',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <XCircleIcon size={16} color="#dc2626" />
              <span>This action cannot be undone. The ticket conversation will be permanently removed.</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setDeleteTicketConfirm(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTicket}
                disabled={isDeleting}
                style={{
                  background: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Ticket'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* DEDICATED RESOLVE TICKET MODAL */}
      <Modal
        isOpen={!!resolveTicketModal}
        onClose={() => setResolveTicketModal(null)}
        title={resolveTicketModal ? `Resolve Ticket - ${resolveTicketModal.ticketNumber || '#TK'}` : 'Resolve Ticket'}
        maxWidth="660px"
      >
        {resolveTicketModal && (
          <form onSubmit={handleSubmitResolution} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Ticket Summary Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {resolveTicketModal.ticketNumber || '#TK'} • {resolveTicketModal.category || 'General'}
                  </div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                    {resolveTicketModal.subject}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <span className={`badge ${getPriorityBadgeClass(resolveTicketModal.priority)}`}>
                    {resolveTicketModal.priority || 'Medium'}
                  </span>
                  <span className={`badge ${getStatusBadgeClass(resolveTicketModal.status)}`}>
                    {resolveTicketModal.status || 'Open'}
                  </span>
                </div>
              </div>

              {/* Branch & Raised By row */}
              <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '12px', color: '#475569', borderTop: '1px solid #e2e8f0', paddingTop: '8px' }}>
                <div>
                  <strong style={{ color: '#0f172a' }}>Branch:</strong> {resolveTicketBranchName(resolveTicketModal, allBranches)}
                </div>
                <div>
                  <strong style={{ color: '#0f172a' }}>Raised By:</strong> {resolveTicketRaisedBy(resolveTicketModal).name} ({resolveTicketRaisedBy(resolveTicketModal).role})
                </div>
              </div>

              {/* Original Description */}
              {resolveTicketModal.description && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '12.5px',
                  color: '#334155',
                  lineHeight: 1.5,
                  maxHeight: '90px',
                  overflowY: 'auto'
                }}>
                  <div style={{ fontSize: '10.5px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '2px' }}>Issue Description:</div>
                  {resolveTicketModal.description}
                </div>
              )}
            </div>

            {/* Resolution Status Selection */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                Update Ticket Status
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setResolutionStatus('Resolved')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: resolutionStatus === 'Resolved' ? '2px solid #16a34a' : '1px solid #cbd5e1',
                    background: resolutionStatus === 'Resolved' ? '#dcfce7' : '#ffffff',
                    color: resolutionStatus === 'Resolved' ? '#15803d' : '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <CheckCircleIcon size={15} color={resolutionStatus === 'Resolved' ? '#15803d' : '#64748b'} />
                  <span>Mark as Resolved</span>
                </button>
                <button
                  type="button"
                  onClick={() => setResolutionStatus('Closed')}
                  style={{
                    flex: 1,
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: resolutionStatus === 'Closed' ? '2px solid #0f172a' : '1px solid #cbd5e1',
                    background: resolutionStatus === 'Closed' ? '#f1f5f9' : '#ffffff',
                    color: resolutionStatus === 'Closed' ? '#0f172a' : '#475569',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <LockIcon size={14} color={resolutionStatus === 'Closed' ? '#0f172a' : '#64748b'} />
                  <span>Close Ticket</span>
                </button>
              </div>
            </div>

            {/* Resolution Note / Solution Details */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Resolution Details & Solution Remarks <span style={{ color: '#dc2626' }}>*</span>
                </label>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Shared with branch</span>
              </div>
              <textarea
                rows={4}
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                placeholder="Explain the solution provided, steps taken to resolve the issue, or instructions for the branch staff..."
                required
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Attachment / Proof of Resolution */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '12.5px', fontWeight: 700, color: '#334155' }}>
                  Proof / Resolution Attachment (Optional)
                </label>
                {resolutionAttachment && (
                  <button
                    type="button"
                    onClick={() => setResolutionAttachment('')}
                    style={{ background: 'none', border: 'none', color: '#dc2626', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
                  >
                    Remove
                  </button>
                )}
              </div>

              {resolutionAttachment ? (
                <div style={{
                  padding: '8px 12px',
                  background: '#f8fafc',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '12px'
                }}>
                  <PaperclipIcon size={14} color="#16a34a" />
                  <a href={resolutionAttachment} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'underline' }}>
                    View Attached Proof
                  </a>
                </div>
              ) : (
                <div>
                  <input
                    type="file"
                    ref={resolutionFileInputRef}
                    onChange={handleResolutionFileUpload}
                    accept="image/*,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => resolutionFileInputRef.current?.click()}
                    disabled={isUploadingResolutionFile}
                    className="btn btn-outline"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <PaperclipIcon size={14} color="#64748b" />
                    <span>{isUploadingResolutionFile ? 'Uploading file...' : 'Upload Screenshot / Proof'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setResolveTicketModal(null)}
                disabled={isResolving}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isResolving || !resolutionNote.trim() || isUploadingResolutionFile}
                style={{
                  background: resolutionStatus === 'Closed' ? '#0f172a' : '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: (isResolving || !resolutionNote.trim() || isUploadingResolutionFile) ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: (isResolving || !resolutionNote.trim() || isUploadingResolutionFile) ? 0.6 : 1,
                  boxShadow: resolutionStatus === 'Closed' ? '0 2px 8px rgba(15, 23, 42, 0.25)' : '0 2px 8px rgba(22, 163, 74, 0.25)'
                }}
              >
                <CheckCircleIcon size={14} color="#ffffff" />
                <span>{isResolving ? 'Updating...' : `Save & Mark as ${resolutionStatus}`}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* DEDICATED SHARE / FORWARD TICKET TO SUPER ADMIN MODAL */}
      <Modal
        isOpen={!!forwardTicketModal}
        onClose={() => setForwardTicketModal(null)}
        title={forwardTicketModal ? `Share Ticket to Super Admin - ${forwardTicketModal.ticketNumber || '#TK'}` : 'Share Ticket'}
        maxWidth="600px"
      >
        {forwardTicketModal && (
          <form onSubmit={handleSubmitForward} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Info Notice Banner */}
            <div style={{
              background: '#eff6ff',
              border: '1px solid #bfdbfe',
              borderRadius: '10px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: '#1e40af',
              fontSize: '12.5px',
              lineHeight: 1.5
            }}>
              <ShieldIcon size={18} color="#2563eb" />
              <div>
                <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '2px', color: '#1d4ed8' }}>
                  Forward Ticket to Super Admin
                </div>
                <div>
                  This ticket from <strong>{resolveTicketBranchName(forwardTicketModal, allBranches)}</strong> will be shared directly with Super Admin with all conversation history intact.
                </div>
              </div>
            </div>

            {/* Ticket Preview Card */}
            <div style={{
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', fontWeight: 800, fontFamily: 'monospace', color: '#0f172a' }}>
                  {forwardTicketModal.ticketNumber || '#TK'}
                </span>
                <span className={`badge ${getPriorityBadgeClass(forwardTicketModal.priority)}`}>
                  {forwardTicketModal.priority || 'Medium'}
                </span>
              </div>
              <div style={{ fontSize: '14.5px', fontWeight: 800, color: '#0f172a' }}>
                {forwardTicketModal.subject}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>
                <strong>Branch:</strong> {resolveTicketBranchName(forwardTicketModal, allBranches)} • <strong>Raised By:</strong> {resolveTicketRaisedBy(forwardTicketModal).name}
              </div>
            </div>

            {/* Optional Escalation Note */}
            <div>
              <label style={{ display: 'block', fontSize: '12.5px', fontWeight: 700, color: '#334155', marginBottom: '6px' }}>
                Note for Super Admin (Optional)
              </label>
              <textarea
                rows={3}
                value={forwardNote}
                onChange={e => setForwardNote(e.target.value)}
                placeholder="Add an optional reason or remark for Super Admin (e.g., Escalating for hardware replacement or system-level support)..."
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setForwardTicketModal(null)}
                disabled={isForwarding}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isForwarding}
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: isForwarding ? 'not-allowed' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)'
                }}
              >
                <ShareIcon size={14} color="#ffffff" />
                <span>{isForwarding ? 'Sharing...' : 'Share with Super Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
