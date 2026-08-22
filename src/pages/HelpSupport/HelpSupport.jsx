import React, { useState, useEffect } from 'react';
import { useAppState } from '../../config/AppContext';
import { ticketApi } from '../../api/Ticket';
import { Modal } from '../../components/Modal';
import ShowNotifications from '../../helper/ShowNotifications';
import './HelpSupport.css';

export default function HelpSupport() {
  const { activeRestaurant } = useAppState();
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);
  const limit = 10;

  // Modals State
  const [showRaiseTicketModal, setShowRaiseTicketModal] = useState(false);
  const [viewTicket, setViewTicket] = useState(null);
  const [newTicket, setNewTicket] = useState({
    subject: '',
    category: 'Billing',
    priority: 'Medium',
    description: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (activeRestaurant) {
      fetchTickets(currentPage);
    }
  }, [activeRestaurant, currentPage]);

  const fetchTickets = async (page = 1) => {
    setIsLoading(true);
    try {
      const data = await ticketApi.getTickets({ page: currentPage, limit });
      if (data.status && data.data) {
        setTickets(data.data);
        setCurrentPage(data.currentPage || 1);
        setTotalPages(data.totalPages || 1);
        setTotalEntries(data.total || 0);
      }
    } catch (e) {
      console.error(e);
      // ticketApi handles the alert, but just in case
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrs = {};
    if (!newTicket.subject.trim()) newErrs.subject = 'Subject is required';
    if (!newTicket.description.trim()) newErrs.description = 'Description is required';
    setErrors(newErrs);
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
      // ticketApi handles the alert now
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="card-header">
          <h3>My Tickets</h3>
        </div>
        <div className="table-responsive">
          <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>TICKET NO.</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>SUBJECT</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>PRIORITY</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS</th>
                <th style={{ padding: '14px 18px', color: '#ffffff', fontWeight: 800, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center">Loading tickets...</td>
                </tr>
              ) : tickets.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center">No support tickets found.</td>
                </tr>
              ) : (
                tickets.map(ticket => (
                  <tr key={ticket._id}>
                    <td>{ticket.ticketNumber}</td>
                    <td>{ticket.subject}</td>
                    <td>
                      <span className={`badge ${getPriorityClass(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${getStatusClass(ticket.status)}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline" 
                        onClick={() => setViewTicket(ticket)}
                        style={{ border: '1px solid #f97316', color: '#f97316' }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))
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
              Showing {totalEntries === 0 ? 0 : (currentPage - 1) * limit + 1} to {Math.min(currentPage * limit, totalEntries)} of {totalEntries} entries
            </div>

            {/* Right Pagination Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage <= 1 ? '#f8fafc' : '#ffffff',
                  color: currentPage <= 1 ? '#cbd5e1' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(page => {
                  const maxVisible = 5;
                  let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
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
                  onClick={() => setCurrentPage(page)}
                  style={{
                    minWidth: '34px',
                    height: '34px',
                    padding: '0 8px',
                    borderRadius: '8px',
                    border: page === currentPage ? 'none' : '1px solid #e2e8f0',
                    background: page === currentPage ? '#000000' : '#ffffff',
                    color: page === currentPage ? '#ffffff' : '#334155',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: page === currentPage ? '0 3px 10px rgba(0,0,0,0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  background: currentPage >= totalPages ? '#f8fafc' : '#ffffff',
                  color: currentPage >= totalPages ? '#cbd5e1' : '#334155',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
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
      >
        {viewTicket && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>{viewTicket.ticketNumber}</h3>
              <span className={`badge ${getStatusClass(viewTicket.status)}`}>{viewTicket.status}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>SUBJECT</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{viewTicket.subject}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>CATEGORY</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{viewTicket.category}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>PRIORITY</p>
                <span className={`badge ${getPriorityClass(viewTicket.priority)}`}>{viewTicket.priority}</span>
              </div>
              <div>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>CREATED ON</p>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: '500' }}>{new Date(viewTicket.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div style={{ background: '#f9fafb', padding: '14px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
              <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#6b7280', fontWeight: '600' }}>DESCRIPTION</p>
              <p style={{ margin: 0, fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
                {viewTicket.description}
              </p>
            </div>

            {viewTicket.resolution && (
              <div style={{ background: '#f0fdf4', padding: '14px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#166534', fontWeight: '600' }}>RESOLUTION</p>
                <p style={{ margin: 0, fontSize: '14px', color: '#14532d', lineHeight: '1.5' }}>
                  {viewTicket.resolution}
                </p>
                {viewTicket.resolvedAt && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '11px', color: '#166534' }}>
                    Resolved on {new Date(viewTicket.resolvedAt).toLocaleString()}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
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
            <div className="custom-select-wrapper">
                <select 
                value={newTicket.category}
                onChange={e => setNewTicket({...newTicket, category: e.target.value})}
                >
                <option value="QR Scanning">QR Scanning</option>
                <option value="Billing">Billing</option>
                <option value="KDS Lag">KDS Lag</option>
                <option value="Menu">Menu</option>
                <option value="Other">Other</option>
                </select>
            </div>
          </div>

          <div className="form-group">
            <label>Priority</label>
            <div className="custom-select-wrapper">
                <select 
                value={newTicket.priority}
                onChange={e => setNewTicket({...newTicket, priority: e.target.value})}
                >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                </select>
            </div>
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
    </div>
  );
}
