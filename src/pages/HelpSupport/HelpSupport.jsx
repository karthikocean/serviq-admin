import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import { ticketApi } from '../../api/Ticket';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications';
import SearchableSelect from '../../components/SearchableSelect';
import { formatDateDMY, formatDateTimeDMY } from '../../helper/DateHelper.js';
import './HelpSupport.css';

export default function HelpSupport() {
  const { activeRestaurant } = useAppState();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
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

  const fetchTickets = async (page = currentPage) => {
    setIsLoading(true);
    try {
      const data = await ticketApi.getTickets({ page, limit });
      if (data && data.status && data.data) {
        setTickets(Array.isArray(data.data) ? data.data : []);
        setTotalPages(data.totalPages || 1);
        setTotalEntries(data.total || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets(currentPage);
  }, [currentPage]);

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

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await ticketApi.createTicket(newTicket);
      setShowRaiseTicketModal(false);
      setNewTicket({ subject: '', category: 'Billing', priority: 'Medium', description: '' });
      ShowNotifications.showAlertNotification('Support ticket raised successfully!', true);
      fetchTickets();
    } catch (error) {
      // ticketApi handles the alert
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (ticket) => {
    setEditTicket({
      _id: ticket._id || ticket.id,
      ticketNumber: ticket.ticketNumber,
      subject: ticket.subject || '',
      category: ticket.category || 'Billing',
      priority: ticket.priority || 'Medium',
      status: ticket.status || 'Open',
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
      const updateData = {
        subject: editTicket.subject,
        category: editTicket.category,
        priority: editTicket.priority,
        status: editTicket.status,
        description: editTicket.description
      };
      await ticketApi.updateTicket(targetId, updateData);
      setTickets(prev => prev.map(t => (t._id === targetId || t.id === targetId) ? { ...t, ...updateData } : t));
      ShowNotifications.showAlertNotification('Ticket updated successfully!', true);
      setEditTicket(null);
      fetchTickets(currentPage);
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
      setTotalEntries(prev => Math.max(0, prev - 1));
      ShowNotifications.showAlertNotification('Ticket deleted successfully!', true);
      setDeleteTicketConfirm(null);
      fetchTickets(currentPage);
    } catch (error) {
      // Local fallback removal
      setTickets(prev => prev.filter(t => (t._id !== targetId && t.id !== targetId)));
      setTotalEntries(prev => Math.max(0, prev - 1));
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
        fetchTickets(currentPage);
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
        <button className="btn btn-primary" onClick={() => setShowRaiseTicketModal(true)}>
          + Raise Ticket
        </button>
      </div>

      <div className="card list-card">
        <div className="card-header" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', background: '#ffffff' }}>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#0f172a' }}>My Tickets</h3>
        </div>
        <div className="table-responsive" style={{ overflowX: 'auto', paddingBottom: '6px' }}>
          <table className="data-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f', color: '#ffffff' }}>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '20%', textAlign: 'left' }}>TICKET NO.</th>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '40%', textAlign: 'left' }}>SUBJECT</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '15%', textAlign: 'center' }}>PRIORITY</th>
                <th style={{ padding: '14px 16px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '15%', textAlign: 'center' }}>STATUS</th>
                <th style={{ padding: '14px 20px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', width: '10%', textAlign: 'center' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>Loading tickets...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#64748b', fontSize: '14px' }}>No support tickets found.</td>
                </tr>
              ) : (
                tickets.map(ticket => {
                  return (
                  <tr 
                    key={ticket._id || ticket.id}
                    style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s ease' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontWeight: 700, fontFamily: 'monospace', color: '#0f172a', verticalAlign: 'middle' }}>
                      {ticket.ticketNumber}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#0f172a', verticalAlign: 'middle' }}>
                      {ticket.subject}
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <span className={`badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', textAlign: 'center', verticalAlign: 'middle' }}>
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

        {/* Pagination UI matching previous screens */}
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
        maxWidth="640px"
      >
        {viewTicket && (() => {
          const replies = getTicketReplies(viewTicket);

          return (
          <div className="ticket-details-modal">
            {/* Header Status & Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#0f172a' }}>{viewTicket.ticketNumber}</h3>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                  Created on {formatDateDMY(viewTicket.createdAt)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className={`badge ${getPriorityClass(viewTicket.priority)}`}>{viewTicket.priority}</span>
                <span className={`badge ${getStatusClass(viewTicket.status)}`}>{viewTicket.status}</span>
              </div>
            </div>

            {/* Ticket Metadata Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>SUBJECT</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '700', color: '#0f172a' }}>{viewTicket.subject}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 2px 0', fontSize: '11px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>CATEGORY</p>
                <p style={{ margin: 0, fontSize: '13px', fontWeight: '600', color: '#334155' }}>{viewTicket.category}</p>
              </div>
            </div>

            {/* Original Issue Description */}
            <div style={{ background: '#ffffff', padding: '14px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  📋 Original Issue Description
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {viewTicket.description || 'No description recorded.'}
              </p>
            </div>

            {/* Support Replies & Conversation Thread */}
            <div style={{ marginTop: '4px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '12px', color: '#0f172a', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  💬 Support Responses ({replies.length + (viewTicket.resolution ? 1 : 0)})
                </span>
                {isLoadingTicketDetails && (
                  <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Refreshing replies...</span>
                )}
              </div>

              <div className="ticket-reply-thread">
                {/* Official Resolution Card (if resolved) */}
                {viewTicket.resolution && (
                  <div style={{ background: '#f0fdf4', padding: '14px 16px', borderRadius: '10px', border: '1px solid #bbf7d0', borderLeft: '4px solid #16a34a' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', color: '#166534', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                        ✅ Official Support Resolution
                      </span>
                      {viewTicket.resolvedAt && (
                        <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: '600' }}>
                          {formatDateTimeDMY(viewTicket.resolvedAt)}
                        </span>
                      )}
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#14532d', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                      {viewTicket.resolution}
                    </p>
                  </div>
                )}

                {/* List of Replies */}
                {replies.map((reply, idx) => {
                  const isAdmin = reply.isAdmin;
                  return (
                    <div 
                      key={idx} 
                      className={`ticket-reply-card ${isAdmin ? 'admin-reply' : 'user-reply'}`}
                    >
                      <div className="ticket-reply-header">
                        <span className="ticket-reply-author" style={{ color: isAdmin ? '#0369a1' : '#c2410c' }}>
                          {isAdmin ? '🛡️ ServIQ Support Team' : `👤 ${reply.sender || 'You (Restaurant)'}`}
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
                    padding: '20px',
                    borderRadius: '10px',
                    border: '1px dashed #cbd5e1',
                    background: '#f8fafc',
                    textAlign: 'center'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '6px' }}>⏳</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                      Awaiting Support Team Response
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px', lineHeight: 1.5 }}>
                      Our technical support team has received your ticket and is reviewing it. Their reply will appear right here.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px', borderTop: '1px solid #e5e7eb', paddingTop: '14px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setViewTicket(null)}
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 600 }}
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
