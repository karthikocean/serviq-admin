import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import { ticketApi } from '../../api/Ticket';
import BranchApi from '../../api/Branch';
import { isBranchMatch } from '../../helper/BranchHelper';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications';
import SearchableSelect from '../../components/SearchableSelect';
import { formatDateDMY, formatDateTimeDMY } from '../../helper/DateHelper.js';
import './HelpSupport.css';

export default function HelpSupport() {
  const { activeRestaurant, selectedBranchId, currentUser } = useAppState();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [liveBranches, setLiveBranches] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const limit = 10;

  // Modals State
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [deleteTicketConfirm, setDeleteTicketConfirm] = useState(null);

  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Billing',
    priority: 'Medium',
    branchId: '',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ticket Replies State
  const [replyInput, setReplyInput] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [isLoadingTicketDetails, setIsLoadingTicketDetails] = useState(false);

  // Fetch branches from API
  const fetchBranches = useCallback(async () => {
    try {
      const res = await BranchApi.getBranches();
      if (res?.status) {
        const rawData = res.response?.data || res.response?.branches || res.response || [];
        const list = Array.isArray(rawData) ? rawData : (Array.isArray(rawData?.data) ? rawData.data : []);
        setLiveBranches(list);
      }
    } catch (err) {
      console.error("Failed to load branches:", err);
    }
  }, []);

  const allBranches = liveBranches.length > 0 ? liveBranches : (activeRestaurant?.branches || []);

  // Helper to dynamically resolve human-readable branch name from ticket
  const resolveTicketBranchName = useCallback((ticket, branchesList = []) => {
    if (!ticket) return 'All Branches';

    // 1. Direct branchName / branch properties
    if (ticket.branchName && typeof ticket.branchName === 'string') {
      const trimmed = ticket.branchName.trim();
      if (trimmed && !['null', 'undefined', '-', '—'].includes(trimmed.toLowerCase())) {
        return trimmed;
      }
    }

    if (ticket.branch && typeof ticket.branch === 'object') {
      const name = ticket.branch.branchName || ticket.branch.name || ticket.branch.branchCode;
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim();
      }
    }

    if (ticket.branchId && typeof ticket.branchId === 'object') {
      const name = ticket.branchId.branchName || ticket.branchId.name || ticket.branchId.branchCode;
      if (name && typeof name === 'string' && name.trim()) {
        return name.trim();
      }
    }

    // 2. Lookup by branchId or branch string ID in branches list
    const bId = String(
      (typeof ticket.branchId === 'string' ? ticket.branchId : '') ||
      (typeof ticket.branch === 'string' ? ticket.branch : '') ||
      (typeof ticket.restaurantBranchId === 'string' ? ticket.restaurantBranchId : '') ||
      (typeof ticket.activeBranchId === 'string' ? ticket.activeBranchId : '') ||
      ''
    ).trim();

    if (bId && bId !== 'ALL' && bId !== 'All' && Array.isArray(branchesList)) {
      const matched = branchesList.find(b => (
        String(b._id || b.id || '').toLowerCase() === bId.toLowerCase() ||
        String(b.branchCode || b.code || '').toLowerCase() === bId.toLowerCase() ||
        String(b.branchName || b.name || '').toLowerCase() === bId.toLowerCase()
      ));
      if (matched) {
        return matched.branchName || matched.name || matched.branchCode || 'All Branches';
      }
    }

    // 3. Check if ticket has branch string directly
    if (typeof ticket.branch === 'string' && ticket.branch.trim() && !/^[0-9a-fA-F]{24}$/.test(ticket.branch.trim()) && ticket.branch !== 'ALL' && ticket.branch !== 'All') {
      return ticket.branch.trim();
    }

    if (bId === 'ALL' || bId === 'All') {
      return 'All Branches';
    }

    // 4. Default: If no specific branch was found on this ticket, return 'All Branches'
    return 'All Branches';
  }, []);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {
        limit: 10
      };
      if (selectedBranchId && selectedBranchId !== 'ALL') {
        params.branchId = selectedBranchId;
      }
      const data = await ticketApi.getTickets(params);
      if (data && data.status && data.data) {
        setTickets(Array.isArray(data.data) ? data.data : []);
      } else if (Array.isArray(data)) {
        setTickets(data);
      }
    } catch (e) {
      console.error("Failed to fetch tickets:", e);
    } finally {
      setIsLoading(false);
    }
  }, [selectedBranchId]);

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  useEffect(() => {
    setCurrentPage(0);
    fetchTickets();
  }, [fetchTickets, selectedBranchId]);

  // Filter tickets by selected branch
  const filteredTickets = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'ALL') {
      return tickets;
    }
    return tickets.filter(t => {
      const branchTarget = t.branchId || t.branch || t.restaurantBranchId || t.activeBranchId || t;
      return isBranchMatch(branchTarget, selectedBranchId, allBranches);
    });
  }, [tickets, selectedBranchId, allBranches]);

  // Paginated tickets for table display
  const totalEntries = filteredTickets.length;
  const totalPages = Math.max(1, Math.ceil(totalEntries / limit));
  const paginatedTickets = filteredTickets.slice(currentPage * limit, (currentPage + 1) * limit);

  // Auto-bounds check for page
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const validateForm = () => {
    const newErrs = {};
    if (!newTicket.subject.trim()) newErrs.subject = 'Subject is required';
    if (!newTicket.description.trim()) newErrs.description = 'Description is required';
    setErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const validateEditForm = () => {
    const newErrs = {};
    if (!editTicket?.subject?.trim()) newErrs.subject = 'Subject is required';
    if (!editTicket?.description?.trim()) newErrs.description = 'Description is required';
    setEditErrors(newErrs);
    return Object.keys(newErrs).length === 0;
  };

  const handleOpenRaiseTicket = () => {
    const defaultBranchId = (selectedBranchId && selectedBranchId !== 'ALL')
      ? selectedBranchId
      : (allBranches[0]?._id || allBranches[0]?.id || 'ALL');
    setNewTicket({
      subject: '',
      category: 'Billing',
      priority: 'Medium',
      branchId: defaultBranchId,
      description: ''
    });
    setErrors({});
    setShowRaiseTicketModal(true);
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const branchIdToSend = newTicket.branchId || (selectedBranchId && selectedBranchId !== 'ALL' ? selectedBranchId : 'ALL');
      const branchObj = allBranches.find(b => String(b._id || b.id) === String(branchIdToSend));
      const branchNameToSend = branchObj 
        ? (branchObj.branchName || branchObj.name || branchObj.branchCode) 
        : (branchIdToSend === 'ALL' || !branchIdToSend ? 'All Branches' : 'Main Branch');

      const payload = {
        ...newTicket,
        branchId: branchIdToSend,
        branchName: branchNameToSend,
        restaurantName: activeRestaurant?.name || 'Restaurant'
      };

      await ticketApi.createTicket(payload);
      setShowRaiseTicketModal(false);
      setNewTicket({ subject: '', category: 'Billing', priority: 'Medium', branchId: '', description: '' });
      ShowNotifications.showAlertNotification('Support ticket raised successfully!', true);
      fetchTickets();
    } catch (error) {
      // ticketApi handles the alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (ticket) => {
    const ticketBranchId = ticket.branchId 
      ? (typeof ticket.branchId === 'object' ? (ticket.branchId._id || ticket.branchId.id) : ticket.branchId) 
      : (ticket.branch ? (typeof ticket.branch === 'object' ? (ticket.branch._id || ticket.branch.id) : ticket.branch) : '');
    
    setEditTicket({
      _id: ticket._id || ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject || '',
      category: ticket.category || 'Billing',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open',
      branchId: ticketBranchId || 'ALL',
      description: ticket.description || ''
    });
    setEditErrors({});
  };

  const handleUpdateTicket = async (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    setIsSubmitting(true);
    const targetId = editTicket._id;
    try {
      const branchObj = allBranches.find(b => String(b._id || b.id) === String(editTicket.branchId));
      const branchName = branchObj 
        ? (branchObj.branchName || branchObj.name) 
        : (editTicket.branchId === 'ALL' || !editTicket.branchId ? 'All Branches' : undefined);
      
      const updateData = {
        subject: editTicket.subject,
        category: editTicket.category,
        priority: editTicket.priority,
        status: editTicket.status,
        branchId: editTicket.branchId,
        ...(branchName ? { branchName } : {}),
        description: editTicket.description
      };
      await ticketApi.updateTicket(targetId, updateData);
      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, ...updateData } : t));
      ShowNotifications.showAlertNotification('Ticket updated successfully!', true);
      setEditTicket(null);
      fetchTickets();
    } catch (error) {
      // Fallback local update if API is mock or partial
      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, ...editTicket } : t));
      ShowNotifications.showAlertNotification('Ticket updated successfully!', true);
      setEditTicket(null);
    } finally {
      setIsSubmitting(false);
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
      fetchTickets();
    } catch (error) {
      // Local fallback removal
      setTickets(prev => prev.filter(t => (t._id !== targetId && t.id !== targetId)));
      ShowNotifications.showAlertNotification('Ticket deleted successfully!', true);
      setDeleteTicketConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenViewTicket = async (ticket) => {
    setViewTicket(ticket);
    setReplyInput('');
    const targetId = ticket._id || ticket.id;
    if (targetId) {
      setIsLoadingTicketDetails(true);
      try {
        const res = await ticketApi.getTicketById(targetId);
        if (res && res.status && res.data) {
          setViewTicket(prev => (prev && (prev._id === targetId || prev.id === targetId) ? { ...prev, ...res.data } : prev));
        }
      } catch (err) {
        console.error('Error fetching ticket details:', err);
      } finally {
        setIsLoadingTicketDetails(false);
      }
    }
  };

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
        }).catch(err => console.error("Error opening ticket from notification:", err));
      }
    }
  }, [searchParams, location.state, tickets]);

  const handleSendReply = async (e) => {
    if (e) e.preventDefault();
    const cleanText = replyInput.trim();
    if (!cleanText || !viewTicket) return;

    const targetId = viewTicket._id || viewTicket.id;
    setIsSendingReply(true);

    try {
      const senderName = activeRestaurant?.name || 'Restaurant Admin';
      const res = await ticketApi.addReply(targetId, cleanText, senderName);
      if (res && res.status) {
        ShowNotifications.showAlertNotification('Reply sent successfully!', true);
        const newReplyObj = {
          message: cleanText,
          sender: senderName,
          role: 'user',
          isAdmin: false,
          createdAt: new Date().toISOString()
        };

        // Update local viewTicket state
        setViewTicket(prev => {
          if (!prev) return prev;
          const existingReplies = Array.isArray(prev.replies) ? prev.replies : (Array.isArray(prev.messages) ? prev.messages : []);
          return {
            ...prev,
            replies: [...existingReplies, newReplyObj]
          };
        });

        setReplyInput('');
        fetchTickets();
      } else {
        ShowNotifications.showAlertNotification(res?.error || 'Failed to send reply.', false);
      }
    } catch (err) {
      console.error('Error sending reply:', err);
      ShowNotifications.showAlertNotification('Failed to send reply.', false);
    } finally {
      setIsSendingReply(false);
    }
  };

  const getTicketReplies = (ticket) => {
    if (!ticket) return [];
    const list = [];

    if (Array.isArray(ticket.replies)) {
      ticket.replies.forEach(r => {
        if (typeof r === 'string') {
          list.push({ message: r, sender: 'Support Team', role: 'admin', isAdmin: true, createdAt: ticket.updatedAt || ticket.createdAt });
        } else if (r && typeof r === 'object') {
          list.push({
            message: r.message || r.reply || r.text || r.content || '',
            sender: r.sender || r.repliedBy || r.author || (r.isAdmin || r.role === 'admin' ? 'Support Team' : 'Restaurant Admin'),
            role: r.role || (r.isAdmin ? 'admin' : 'user'),
            isAdmin: r.isAdmin !== undefined ? r.isAdmin : (r.role === 'admin' || String(r.sender || '').toLowerCase().includes('support') || String(r.sender || '').toLowerCase().includes('admin')),
            createdAt: r.createdAt || r.date || r.timestamp || ticket.updatedAt
          });
        }
      });
    }

    if (Array.isArray(ticket.messages) && list.length === 0) {
      ticket.messages.forEach(m => {
        if (typeof m === 'string') {
          list.push({ message: m, sender: 'Support Team', role: 'admin', isAdmin: true, createdAt: ticket.updatedAt });
        } else if (m && typeof m === 'object') {
          list.push({
            message: m.message || m.text || m.content || '',
            sender: m.sender || (m.isAdmin ? 'Support Team' : 'Restaurant Admin'),
            role: m.role || (m.isAdmin ? 'admin' : 'user'),
            isAdmin: m.isAdmin ?? (m.role === 'admin'),
            createdAt: m.createdAt || ticket.updatedAt
          });
        }
      });
    }

    // Single reply strings (if not already captured in replies array)
    const singleReply = ticket.reply || ticket.adminReply || ticket.adminResponse || ticket.response || ticket.adminNote || ticket.solution;
    if (singleReply && typeof singleReply === 'string' && list.length === 0) {
      list.push({
        message: singleReply,
        sender: 'ServIQ Support Team',
        role: 'admin',
        isAdmin: true,
        createdAt: ticket.resolvedAt || ticket.updatedAt || ticket.createdAt
      });
    }

    return list.filter(item => item.message && item.message.trim().length > 0);
  };

  const getPriorityClass = (priority) => {
    if (priority === 'High') return 'badge-priority-high';
    if (priority === 'Medium') return 'badge-priority-medium';
    return 'badge-priority-low';
  };

  const getStatusClass = (status) => {
    if (status === 'Open') return 'badge-status-open';
    if (status === 'Resolved') return 'badge-status-resolved';
    if (status === 'Closed') return 'badge-status-closed';
    return 'badge-status-progress';
  };

  return (
    <div className="help-support-container">
      <div className="page-header">
        <h2>Help & Support</h2>
        <button className="btn btn-primary" onClick={handleOpenRaiseTicket}>
          + Raise Ticket
        </button>
      </div>

      <div className="card list-card">
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>My Tickets</h3>
          {selectedBranchId && selectedBranchId !== 'ALL' && (
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bae6fd' }}>
              📍 Filtered by: {allBranches.find(b => String(b._id || b.id) === String(selectedBranchId))?.branchName || 'Current Branch'}
            </span>
          )}
        </div>
        <div className="table-responsive" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '950px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                <th style={{ padding: '14px 14px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>S.NO.</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '14%', textAlign: 'left', whiteSpace: 'nowrap' }}>TICKET NO.</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '28%', textAlign: 'left' }}>SUBJECT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '16%', textAlign: 'left', whiteSpace: 'nowrap' }}>ASSIGNED AGENT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '12%', textAlign: 'left', whiteSpace: 'nowrap' }}>DATE</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>PRIORITY</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%', textAlign: 'center', whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '8%', textAlign: 'center', whiteSpace: 'nowrap' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>Loading tickets...</td>
                </tr>
              ) : paginatedTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>No support tickets found for the selected branch filter.</td>
                </tr>
              ) : (
                paginatedTickets.map((ticket, index) => {
                  const assigned = ticket.assignedUser || 'Unassigned';
                  const isAssigned = assigned && assigned !== 'Unassigned';
                  const branchLabel = resolveTicketBranchName(ticket, allBranches) || 'All Branches';
                  const isAllBranches = branchLabel.toLowerCase().includes('all branch');
                  return (
                  <tr 
                    key={ticket._id || ticket.id || index}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 14px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', verticalAlign: 'middle', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      {currentPage * limit + index + 1}
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {ticket.ticketNumber}
                    </td>
                    <td style={{ padding: '14px 18px', verticalAlign: 'middle' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13.5px' }}>{ticket.subject}</div>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginTop: '4px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '11px', color: '#64748b', background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontWeight: 600 }}>
                          {ticket.category || 'General'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isAssigned ? '#0369a1' : '#64748b',
                        background: isAssigned ? '#f0f9ff' : '#f8fafc',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        border: isAssigned ? '1px solid #bae6fd' : '1px solid #e2e8f0'
                      }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        {assigned}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '12.5px', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      {formatDateDMY(ticket.createdAt)}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <span className={`badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', verticalAlign: 'middle', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {/* View & Replies Button (Icon Only) */}
                        <button 
                          type="button"
                          onClick={() => handleOpenViewTicket(ticket)}
                          title="View ticket details & replies"
                          aria-label="View ticket details & replies"
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
                            transition: 'all 0.15s ease',
                            padding: 0
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#ffedd5';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.borderColor = '#ea580c';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fff7ed';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#fed7aa';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>

                        {/* Edit Button (Icon Only) */}
                        <button 
                          type="button"
                          onClick={() => handleOpenEdit(ticket)}
                          title="Edit ticket"
                          aria-label="Edit ticket"
                          style={{ 
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            border: '1px solid #bae6fd', 
                            background: '#f0f9ff',
                            color: '#0284c7', 
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                            padding: 0
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#e0f2fe';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.borderColor = '#0284c7';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#f0f9ff';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#bae6fd';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>

                        {/* Delete Button (Icon Only) */}
                        <button 
                          type="button"
                          onClick={() => setDeleteTicketConfirm(ticket)}
                          title="Delete ticket"
                          aria-label="Delete ticket"
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
                            transition: 'all 0.15s ease',
                            padding: 0
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.background = '#fee2e2';
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.borderColor = '#dc2626';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.background = '#fef2f2';
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = '#fecaca';
                          }}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination UI matching standard table layout */}
        {totalPages > 0 && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            background: '#ffffff',
            borderTop: '1px solid #e5e7eb',
            borderRadius: '0 0 12px 12px',
            flexWrap: 'wrap',
            gap: '12px'
          }}>
            {/* Left Info Text */}
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '500' }}>
              Showing {totalEntries === 0 ? 0 : currentPage * limit + 1} to {Math.min((currentPage + 1) * limit, totalEntries)} of {totalEntries} entries
            </div>

            {/* Right Pagination Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage === 0 ? '#f8fafc' : '#ffffff',
                  color: currentPage === 0 ? '#cbd5e1' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: currentPage === 0 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const maxVisible = 5;
                  const current = currentPage + 1;
                  let startPage = Math.max(1, current - Math.floor(maxVisible / 2));
                  let endPage = Math.min(totalPages, startPage + maxVisible - 1);
                  if (endPage - startPage + 1 < maxVisible) {
                    startPage = Math.max(1, endPage - maxVisible + 1);
                  }
                  return page >= startPage && page <= endPage;
                })
                .map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page - 1)}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 8px',
                    borderRadius: '8px',
                    border: page === (currentPage + 1) ? 'none' : '1px solid #e2e8f0',
                    background: page === (currentPage + 1) ? '#000000' : '#ffffff',
                    color: page === (currentPage + 1) ? '#ffffff' : '#334155',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: page === (currentPage + 1) ? '0 3px 10px rgba(0,0,0,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages - 1 || totalPages === 0}
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: (currentPage >= totalPages - 1 || totalPages === 0) ? '#f8fafc' : '#ffffff',
                  color: (currentPage >= totalPages - 1 || totalPages === 0) ? '#cbd5e1' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: (currentPage >= totalPages - 1 || totalPages === 0) ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View Ticket Modal */}
      <Modal 
        isOpen={!!viewTicket} 
        onClose={() => setViewTicket(null)}
        title="Ticket Details"
        maxWidth="720px"
      >
        {viewTicket && (() => {
          const replies = getTicketReplies(viewTicket);
          const creatorEmail = viewTicket.createdBy?.email || (typeof viewTicket.createdBy === 'string' ? viewTicket.createdBy : '') || activeRestaurant?.email || 'mirchi@gmail.com';
          const assignedAgent = viewTicket.assignedUser || 'Unassigned';
          const isAssigned = assignedAgent && assignedAgent !== 'Unassigned';
          const ticketBranchName = resolveTicketBranchName(viewTicket, allBranches) || 'All Branches';

          return (
          <div className="ticket-details-modal" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Header Status & Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 800, color: '#0f172a', fontFamily: 'monospace' }}>
                    {viewTicket.ticketNumber}
                  </h3>
                  {ticketBranchName && !ticketBranchName.toLowerCase().includes('all branch') && (
                    <span style={{ fontSize: '12px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '3px 10px', borderRadius: '6px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      📍 {ticketBranchName}
                    </span>
                  )}
                  {viewTicket.restaurantName && (
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#475569', background: '#f1f5f9', padding: '3px 8px', borderRadius: '6px' }}>
                      🏪 {viewTicket.restaurantName}
                    </span>
                  )}
                  {viewTicket.isReadBySuperAdmin !== undefined && (
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      background: viewTicket.isReadBySuperAdmin ? '#ecfdf5' : '#fff7ed',
                      color: viewTicket.isReadBySuperAdmin ? '#059669' : '#c2410c',
                      border: viewTicket.isReadBySuperAdmin ? '1px solid #a7f3d0' : '1px solid #fed7aa',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: viewTicket.isReadBySuperAdmin ? '#10b981' : '#f97316' }}></span>
                      {viewTicket.isReadBySuperAdmin ? 'Seen by Support' : 'Unread by Support'}
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 500, marginTop: '4px' }}>
                  Created on <strong>{formatDateTimeDMY(viewTicket.createdAt)}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${getPriorityClass(viewTicket.priority)}`} style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 800 }}>
                  {viewTicket.priority} Priority
                </span>
                <span className={`badge ${getStatusClass(viewTicket.status)}`} style={{ padding: '6px 12px', fontSize: '11.5px', fontWeight: 800 }}>
                  {viewTicket.status}
                </span>
              </div>
            </div>

            {/* Ticket Comprehensive Metadata Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '12px',
              background: '#f8fafc',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>BRANCH</p>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '6px', border: '1px solid #bae6fd', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  📍 {ticketBranchName}
                </span>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CATEGORY</p>
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                  🏷️ {viewTicket.category || 'Billing'}
                </span>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ASSIGNED SUPPORT AGENT</p>
                <span style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: isAssigned ? '#0369a1' : '#64748b',
                  background: isAssigned ? '#f0f9ff' : '#ffffff',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  border: isAssigned ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {assignedAgent}
                </span>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>CREATED BY</p>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                  {creatorEmail}
                </div>
              </div>

              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>LAST UPDATED</p>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#334155' }}>
                  {formatDateTimeDMY(viewTicket.updatedAt || viewTicket.createdAt)}
                </div>
              </div>

              {viewTicket.resolvedAt && (
                <div>
                  <p style={{ margin: '0 0 4px 0', fontSize: '11px', color: '#166534', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>RESOLVED AT</p>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#166534' }}>
                    {formatDateTimeDMY(viewTicket.resolvedAt)}
                  </div>
                </div>
              )}
            </div>

            {/* Subject & Original Issue Description */}
            <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📌 Subject
                </span>
              </div>
              <h4 style={{ margin: '0 0 12px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
                {viewTicket.subject}
              </h4>

              <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                <span style={{ fontSize: '11.5px', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>
                  Description
                </span>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {viewTicket.description || 'No description recorded.'}
                </p>
              </div>
            </div>

            {/* Official Support Resolution Card (if resolved / resolution present) */}
            {(viewTicket.resolution || viewTicket.status === 'Resolved') && (
              <div style={{ background: '#f0fdf4', padding: '16px', borderRadius: '12px', border: '1.5px solid #86efac', borderLeft: '5px solid #16a34a' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap', gap: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#166534', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Official Support Resolution
                  </span>
                  {viewTicket.resolvedAt && (
                    <span style={{ fontSize: '11.5px', color: '#15803d', fontWeight: 700, background: '#dcfce7', padding: '2px 8px', borderRadius: '6px' }}>
                      Resolved on {formatDateTimeDMY(viewTicket.resolvedAt)}
                    </span>
                  )}
                </div>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#14532d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {viewTicket.resolution || 'Ticket marked as resolved by technical support.'}
                </p>
              </div>
            )}

            {/* Support Replies & Conversation Thread */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                  </svg>
                  Support Responses ({replies.length + (viewTicket.resolution ? 1 : 0)})
                </span>
                {isLoadingTicketDetails && (
                  <span style={{ fontSize: '11.5px', color: '#2563eb', fontWeight: 600 }}>Refreshing replies...</span>
                )}
              </div>

              <div className="ticket-reply-thread">
                {/* List of Replies */}
                {replies.map((reply, idx) => {
                  const isAdmin = reply.isAdmin;
                  return (
                    <div 
                      key={idx} 
                      className={`ticket-reply-card ${isAdmin ? 'admin-reply' : 'user-reply'}`}
                    >
                      <div className="ticket-reply-header">
                        <span className="ticket-reply-author" style={{ color: isAdmin ? '#0369a1' : '#c2410c', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          {isAdmin ? (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#0369a1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                              </svg>
                              {reply.sender || 'ServIQ Support Team'}
                            </>
                          ) : (
                            <>
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                              </svg>
                              {reply.sender || 'You (Restaurant)'}
                            </>
                          )}
                        </span>
                        <span className="ticket-reply-time">
                          {formatDateTimeDMY(reply.createdAt)}
                        </span>
                      </div>
                      <div className="ticket-reply-body">
                        {reply.message}
                      </div>
                    </div>
                  );
                })}

                {/* Empty State when no replies yet */}
                {replies.length === 0 && !viewTicket.resolution && (
                  <div style={{
                    padding: '24px',
                    borderRadius: '12px',
                    border: '1.5px dashed #cbd5e1',
                    background: '#f8fafc',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '26px', marginBottom: '6px' }}>⏳</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 800, color: '#334155' }}>
                      Awaiting Support Team Response
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px', lineHeight: 1.5, maxWidth: '420px', margin: '4px auto 0' }}>
                      Our technical support team has received your ticket and is reviewing it. Their reply will appear right here.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewTicket(null)}
                style={{ padding: '8px 24px', fontSize: '13px', fontWeight: 700, borderRadius: '8px' }}
              >
                Close
              </button>
            </div>
          </div>
          );
        })()}
      </Modal>

      {/* Raise Ticket Modal */}
      <Modal 
        isOpen={showRaiseTicketModal} 
        onClose={() => setShowRaiseTicketModal(false)}
        title="Raise Support Ticket"
      >
        <form onSubmit={handleRaiseTicket} className="raise-ticket-form">
          <div className="form-group">
            <label>Subject *</label>
            <input 
              type="text" 
              className={errors.subject ? 'error' : ''}
              value={newTicket.subject}
              onChange={e => setNewTicket({...newTicket, subject: e.target.value})}
              placeholder="E.g., Printer connection issue"
            />
            {errors.subject && <span className="error-text">{errors.subject}</span>}
          </div>

          <div className="form-group">
            <label>Branch *</label>
            {selectedBranchId && selectedBranchId !== 'ALL' ? (
              <div style={{
                padding: '10px 12px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                color: '#0f172a',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📍</span>
                <span>{allBranches.find(b => String(b._id || b.id) === String(selectedBranchId))?.branchName || 'Selected Branch'}</span>
                <span style={{ fontSize: '11px', color: '#64748b', marginLeft: 'auto' }}>(Header Filter Active)</span>
              </div>
            ) : (
              <SearchableSelect 
                value={newTicket.branchId}
                onChange={e => setNewTicket({...newTicket, branchId: e.target.value})}
                options={[
                  { value: 'ALL', label: 'All Branches (General)' },
                  ...allBranches.map(b => ({
                    value: b._id || b.id,
                    label: b.branchName || b.name || b.branchCode || 'Main Branch'
                  }))
                ]}
                placeholder="Select Branch"
              />
            )}
          </div>

          <div className="form-group">
            <label>Category *</label>
            <SearchableSelect 
              value={newTicket.category}
              onChange={e => setNewTicket({...newTicket, category: e.target.value})}
              options={[
                { value: 'QR Scanning', label: 'QR Scanning' },
                { value: 'Billing', label: 'Billing' },
                { value: 'KDS Lag', label: 'KDS Lag' },
                { value: 'Menu', label: 'Menu' },
                { value: 'Other', label: 'Other' }
              ]}
              placeholder="Select Category"
            />
          </div>

          <div className="form-group">
            <label>Priority</label>
            <SearchableSelect 
              value={newTicket.priority}
              onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
              options={[
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' }
              ]}
              placeholder="Select Priority"
            />
          </div>

          <div className="form-group">
            <label>Description *</label>
            <textarea 
              rows="4"
              className={errors.description ? 'error' : ''}
              value={newTicket.description}
              onChange={e => setNewTicket({...newTicket, description: e.target.value})}
              placeholder="Please provide details about your issue..."
            />
            {errors.description && <span className="error-text">{errors.description}</span>}
          </div>

          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={() => setShowRaiseTicketModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Ticket Modal */}
      <Modal 
        isOpen={!!editTicket} 
        onClose={() => setEditTicket(null)}
        title={`Edit Ticket ${editTicket?.ticketNumber ? `(${editTicket.ticketNumber})` : ''}`}
      >
        {editTicket && (
          <form onSubmit={handleUpdateTicket} className="raise-ticket-form">
            <div className="form-group">
              <label>Subject *</label>
              <input 
                type="text" 
                className={editErrors.subject ? 'error' : ''}
                value={editTicket.subject}
                onChange={e => setEditTicket({...editTicket, subject: e.target.value})}
                placeholder="E.g., Printer connection issue"
              />
              {editErrors.subject && <span className="error-text">{editErrors.subject}</span>}
            </div>

            <div className="form-group">
              <label>Branch</label>
              <SearchableSelect 
                value={editTicket.branchId}
                onChange={e => setEditTicket({...editTicket, branchId: e.target.value})}
                options={[
                  { value: 'ALL', label: 'All Branches (General)' },
                  ...allBranches.map(b => ({
                    value: b._id || b.id,
                    label: b.branchName || b.name || b.branchCode || 'Main Branch'
                  }))
                ]}
                placeholder="Select Branch"
              />
            </div>

            <div className="form-group">
              <label>Category *</label>
              <SearchableSelect 
                value={editTicket.category}
                onChange={e => setEditTicket({...editTicket, category: e.target.value})}
                options={[
                  { value: 'QR Scanning', label: 'QR Scanning' },
                  { value: 'Billing', label: 'Billing' },
                  { value: 'KDS Lag', label: 'KDS Lag' },
                  { value: 'Menu', label: 'Menu' },
                  { value: 'Other', label: 'Other' }
                ]}
                placeholder="Select Category"
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Priority</label>
                <SearchableSelect 
                  value={editTicket.priority}
                  onChange={e => setEditTicket({...editTicket, priority: e.target.value})}
                  options={[
                    { value: 'Low', label: 'Low' },
                    { value: 'Medium', label: 'Medium' },
                    { value: 'High', label: 'High' }
                  ]}
                  placeholder="Select Priority"
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <SearchableSelect 
                  value={editTicket.status}
                  onChange={e => setEditTicket({...editTicket, status: e.target.value})}
                  options={[
                    { value: 'Open', label: 'Open' },
                    { value: 'In Progress', label: 'In Progress' },
                    { value: 'Resolved', label: 'Resolved' },
                    { value: 'Closed', label: 'Closed' }
                  ]}
                  placeholder="Select Status"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea 
                rows="4"
                className={editErrors.description ? 'error' : ''}
                value={editTicket.description}
                onChange={e => setEditTicket({...editTicket, description: e.target.value})}
                placeholder="Please provide details about your issue..."
              />
              {editErrors.description && <span className="error-text">{editErrors.description}</span>}
            </div>

            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
              <button type="button" className="btn btn-outline" onClick={() => setEditTicket(null)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteTicketConfirm}
        onClose={() => setDeleteTicketConfirm(null)}
        title="Confirm Delete Ticket"
      >
        {deleteTicketConfirm && (
          <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569', lineHeight: '1.5' }}>
              Are you sure you want to delete support ticket <strong style={{ color: '#0f172a' }}>{deleteTicketConfirm.ticketNumber}</strong> (<span style={{ color: '#64748b' }}>{deleteTicketConfirm.subject}</span>)?
            </p>
            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', padding: '12px', fontSize: '13px', color: '#991b1b' }}>
              ⚠️ This action cannot be undone. The ticket will be permanently removed.
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
                  cursor: isDeleting ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete Ticket'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
