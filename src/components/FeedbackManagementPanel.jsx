import React, { useState, useMemo } from 'react';
import { useAppState } from '../config/AppContext';
import { Modal } from './Modal';
import ShowNotifications from '../helper/ShowNotifications';
import {
  StarIcon,
  UtensilsIcon,
  UserIcon,
  SparklesIcon,
  DownloadIcon,
  PlusIcon,
  TrashIcon,
  AlertCircleIcon
} from './Icons';

export default function FeedbackManagementPanel() {
  const {
    activeRestaurant,
    selectedBranchId,
    addFeedback,
    deleteFeedback
  } = useAppState();

  const [ratingFilter, setRatingFilter] = useState('ALL'); // ALL | 5 | 4 | 3 | LOW
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedFeedbackDetail, setSelectedFeedbackDetail] = useState(null);

  const [feedbackForm, setFeedbackForm] = useState({
    table: '01',
    orderId: '',
    customerName: '',
    phone: '',
    foodRating: 5,
    serviceRating: 5,
    comments: '',
    branchId: ''
  });

  const rawFeedback = activeRestaurant?.feedback || [];
  const tablesList = activeRestaurant?.tables || [];
  const ordersList = activeRestaurant?.orders || [];

  // Filter feedback by branch if selected
  const branchFilteredFeedback = useMemo(() => {
    if (!selectedBranchId || selectedBranchId === 'ALL') return rawFeedback;
    return rawFeedback.filter(f => !f.branchId || f.branchId === selectedBranchId);
  }, [rawFeedback, selectedBranchId]);

  // Calculations & Analytics
  const totalReviews = branchFilteredFeedback.length;
  
  const avgOverall = totalReviews > 0
    ? (branchFilteredFeedback.reduce((acc, f) => acc + (Number(f.overallRating) || 0), 0) / totalReviews).toFixed(1)
    : '5.0';

  const avgFood = totalReviews > 0
    ? (branchFilteredFeedback.reduce((acc, f) => acc + (Number(f.foodRating) || 0), 0) / totalReviews).toFixed(1)
    : '5.0';

  const avgService = totalReviews > 0
    ? (branchFilteredFeedback.reduce((acc, f) => acc + (Number(f.serviceRating) || 0), 0) / totalReviews).toFixed(1)
    : '5.0';

  // Rating breakdown counts
  const starCounts = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    branchFilteredFeedback.forEach(f => {
      const rounded = Math.round(Number(f.overallRating) || 5);
      if (counts[rounded] !== undefined) {
        counts[rounded]++;
      } else if (rounded >= 5) {
        counts[5]++;
      } else {
        counts[1]++;
      }
    });
    return counts;
  }, [branchFilteredFeedback]);

  // Filtered reviews list
  const filteredReviews = useMemo(() => {
    return branchFilteredFeedback.filter(f => {
      const overall = Number(f.overallRating) || 5;
      if (ratingFilter === '5' && Math.round(overall) !== 5) return false;
      if (ratingFilter === '4' && Math.round(overall) !== 4) return false;
      if (ratingFilter === '3' && Math.round(overall) !== 3) return false;
      if (ratingFilter === 'LOW' && Math.round(overall) > 2) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const tableMatch = String(f.table).toLowerCase().includes(q);
        const orderMatch = String(f.orderId).toLowerCase().includes(q);
        const nameMatch = String(f.customerName || '').toLowerCase().includes(q);
        const commentMatch = String(f.comments || '').toLowerCase().includes(q);
        return tableMatch || orderMatch || nameMatch || commentMatch;
      }
      return true;
    });
  }, [branchFilteredFeedback, ratingFilter, searchQuery]);

  const handleDelete = (feedbackId) => {
    if (window.confirm("Are you sure you want to delete this customer feedback?")) {
      deleteFeedback(activeRestaurant.id, feedbackId);
      ShowNotifications.showAlertNotification("Customer feedback removed.", true);
      if (selectedFeedbackDetail?.id === feedbackId) setSelectedFeedbackDetail(null);
    }
  };

  const handleExportCSV = () => {
    if (branchFilteredFeedback.length === 0) {
      ShowNotifications.showAlertNotification("No feedback data available to export.", false);
      return;
    }

    const headers = ["Feedback ID", "Date", "Time", "Table", "Order ID", "Customer Name", "Phone", "Food Rating", "Service Rating", "Overall Rating", "Comments"];
    const rows = branchFilteredFeedback.map(f => [
      `"${f.id || ''}"`,
      `"${f.date || ''}"`,
      `"${f.time || ''}"`,
      `"Table ${f.table || ''}"`,
      `"#ORD-${f.orderId || ''}"`,
      `"${(f.customerName || '').replace(/"/g, '""')}"`,
      `"${f.phone || ''}"`,
      f.foodRating || 5,
      f.serviceRating || 5,
      f.overallRating || 5,
      `"${(f.comments || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `customer_feedback_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    ShowNotifications.showAlertNotification("Feedback report exported to CSV successfully!", true);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    addFeedback(activeRestaurant.id, {
      ...feedbackForm,
      branchId: selectedBranchId || 'BR-001'
    });

    ShowNotifications.showAlertNotification("Customer feedback logged successfully!", true);
    setShowAddModal(false);
    setFeedbackForm({
      table: '01',
      orderId: '',
      customerName: '',
      phone: '',
      foodRating: 5,
      serviceRating: 5,
      comments: '',
      branchId: ''
    });
  };

  const renderStars = (rating) => {
    const num = Math.round(Number(rating) || 5);
    return (
      <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
        {[1, 2, 3, 4, 5].map(i => (
          <StarIcon
            key={i}
            size={13}
            color={i <= num ? '#f59e0b' : '#cbd5e1'}
            fill={i <= num ? '#f59e0b' : 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div style={{ width: '100%' }}>
      {/* Top Rating Metrics Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 1fr', gap: '16px', marginBottom: '24px' }}>
        {/* Overall Score Card */}
        <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', borderRadius: '16px', padding: '22px 24px', color: '#fff', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Overall Experience</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
                <span style={{ fontSize: '38px', fontWeight: 900, fontFamily: "'Outfit', sans-serif", color: '#fbbf24' }}>
                  {avgOverall}
                </span>
                <span style={{ fontSize: '16px', color: '#94a3b8', fontWeight: 600 }}>/ 5.0</span>
              </div>
            </div>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.15)' }}>
              <StarIcon size={24} color="#fbbf24" fill="#fbbf24" />
            </span>
          </div>

          <div style={{ marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'inline-flex', gap: '2px', alignItems: 'center' }}>
              {[1, 2, 3, 4, 5].map(i => (
                <StarIcon
                  key={i}
                  size={16}
                  color={i <= Math.round(Number(avgOverall)) ? '#fbbf24' : '#475569'}
                  fill={i <= Math.round(Number(avgOverall)) ? '#fbbf24' : 'none'}
                />
              ))}
            </div>
            <span style={{ fontSize: '12px', color: '#cbd5e1', fontWeight: 600 }}>
              Based on {totalReviews} reviews
            </span>
          </div>
        </div>

        {/* Food Rating Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Food Quality</span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#fef3c7' }}>
              <UtensilsIcon size={18} color="#b45309" />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', marginTop: '10px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{avgFood}</span>
            <StarIcon size={16} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ fontSize: '11px', color: '#16a34a', fontWeight: 700, marginTop: '4px' }}>
            {Number(avgFood) >= 4.5 ? 'Exceptional Taste' : 'Good Taste'}
          </div>
        </div>

        {/* Service Rating Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '20px 22px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Staff & Service</span>
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '8px', background: '#eff6ff' }}>
              <UserIcon size={18} color="#1d4ed8" />
            </span>
          </div>
          <div style={{ fontSize: '30px', fontWeight: 900, color: '#0f172a', marginTop: '10px', fontFamily: "'Outfit', sans-serif", display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>{avgService}</span>
            <StarIcon size={16} color="#f59e0b" fill="#f59e0b" />
          </div>
          <div style={{ fontSize: '11px', color: '#2563eb', fontWeight: 700, marginTop: '4px' }}>
            {Number(avgService) >= 4.5 ? 'Highly Responsive' : 'Prompt Service'}
          </div>
        </div>

        {/* Rating Breakdown Card */}
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '16px 20px', border: '1px solid #e2e8f0', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', marginBottom: '8px' }}>Star Distribution</div>
          {[5, 4, 3, 2, 1].map(stars => {
            const count = starCounts[stars] || 0;
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <div key={stars} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', marginBottom: '4px' }}>
                <span style={{ width: '26px', fontWeight: 700, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: '2px' }}>
                  {stars} <StarIcon size={10} color="#f59e0b" fill="#f59e0b" />
                </span>
                <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: stars >= 4 ? '#10b981' : stars === 3 ? '#f59e0b' : '#ef4444', borderRadius: '3px' }}></div>
                </div>
                <span style={{ width: '22px', textAlign: 'right', color: '#94a3b8', fontWeight: 600 }}>{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Feedback List & Controls */}
      <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.04)' }}>
        {/* Actions & Filters Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          {/* Left Rating Chips */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              onClick={() => setRatingFilter('ALL')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: ratingFilter === 'ALL' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                background: ratingFilter === 'ALL' ? '#0f172a' : '#ffffff',
                color: ratingFilter === 'ALL' ? '#ffffff' : '#64748b'
              }}
            >
              All Reviews ({totalReviews})
            </button>
            <button
              onClick={() => setRatingFilter('5')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: ratingFilter === '5' ? '1.5px solid #16a34a' : '1px solid #e2e8f0',
                background: ratingFilter === '5' ? '#dcfce7' : '#ffffff',
                color: ratingFilter === '5' ? '#15803d' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <StarIcon size={12} color={ratingFilter === '5' ? '#15803d' : '#f59e0b'} fill={ratingFilter === '5' ? '#15803d' : '#f59e0b'} />
              5 Stars ({starCounts[5]})
            </button>
            <button
              onClick={() => setRatingFilter('4')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: ratingFilter === '4' ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                background: ratingFilter === '4' ? '#e0f2fe' : '#ffffff',
                color: ratingFilter === '4' ? '#0369a1' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <StarIcon size={12} color={ratingFilter === '4' ? '#0369a1' : '#f59e0b'} fill={ratingFilter === '4' ? '#0369a1' : '#f59e0b'} />
              4 Stars ({starCounts[4]})
            </button>
            <button
              onClick={() => setRatingFilter('3')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: ratingFilter === '3' ? '1.5px solid #d97706' : '1px solid #e2e8f0',
                background: ratingFilter === '3' ? '#fef3c7' : '#ffffff',
                color: ratingFilter === '3' ? '#b45309' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <StarIcon size={12} color={ratingFilter === '3' ? '#b45309' : '#f59e0b'} fill={ratingFilter === '3' ? '#b45309' : '#f59e0b'} />
              3 Stars ({starCounts[3]})
            </button>
            <button
              onClick={() => setRatingFilter('LOW')}
              style={{
                padding: '7px 14px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                border: ratingFilter === 'LOW' ? '1.5px solid #dc2626' : '1px solid #e2e8f0',
                background: ratingFilter === 'LOW' ? '#fee2e2' : '#ffffff',
                color: ratingFilter === 'LOW' ? '#b91c1c' : '#64748b',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <AlertCircleIcon size={12} color={ratingFilter === 'LOW' ? '#b91c1c' : '#ef4444'} />
              Low Ratings ({starCounts[1] + starCounts[2]})
            </button>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Search table, order, review..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12px',
                width: '210px',
                outline: 'none'
              }}
            />

            <button
              onClick={handleExportCSV}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: '#ffffff',
                border: '1.5px solid #cbd5e1',
                color: '#334155',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <DownloadIcon size={14} color="#334155" />
              Export CSV
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                background: 'var(--primary)',
                color: '#fff',
                border: 'none',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <PlusIcon size={14} color="#fff" />
              Log Feedback
            </button>
          </div>
        </div>

        {/* Feedback List Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                <th style={{ padding: '12px 14px', width: '12%' }}>FEEDBACK ID</th>
                <th style={{ padding: '12px 14px', width: '12%' }}>TABLE / ORDER</th>
                <th style={{ padding: '12px 14px', width: '14%' }}>CUSTOMER</th>
                <th style={{ padding: '12px 14px', width: '14%' }}>FOOD RATING</th>
                <th style={{ padding: '12px 14px', width: '14%' }}>SERVICE RATING</th>
                <th style={{ padding: '12px 14px', width: '24%' }}>COMMENTS & NOTES</th>
                <th style={{ padding: '12px 14px', width: '10%', textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredReviews.map((fb) => (
                <tr
                  key={fb.id || fb._id}
                  style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = '#ffffff'}
                >
                  {/* 1. ID & Date */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', fontFamily: 'monospace' }}>{fb.id}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{fb.date} • {fb.time || '1:30 PM'}</div>
                  </td>

                  {/* 2. Table & Order */}
                  <td style={{ padding: '14px 14px' }}>
                    <span style={{ background: '#f1f5f9', color: '#0f172a', fontSize: '11px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px', border: '1px solid #e2e8f0', display: 'inline-block' }}>
                      Table {String(fb.table).replace('Table ', '').padStart(2, '0')}
                    </span>
                    {fb.orderId && (
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', fontWeight: 600 }}>
                        #ORD-{fb.orderId}
                      </div>
                    )}
                  </td>

                  {/* 3. Customer */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                      {fb.customerName || 'Anonymous Guest'}
                    </div>
                    {fb.phone && (
                      <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{fb.phone}</div>
                    )}
                  </td>

                  {/* 4. Food Rating */}
                  <td style={{ padding: '14px 14px' }}>
                    {renderStars(fb.foodRating)}
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', marginLeft: '6px' }}>{fb.foodRating}.0</span>
                  </td>

                  {/* 5. Service Rating */}
                  <td style={{ padding: '14px 14px' }}>
                    {renderStars(fb.serviceRating)}
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a', marginLeft: '6px' }}>{fb.serviceRating}.0</span>
                  </td>

                  {/* 6. Comments */}
                  <td style={{ padding: '14px 14px' }}>
                    <div style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                      {fb.comments ? `"${fb.comments}"` : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No comment provided.</span>}
                    </div>
                  </td>

                  {/* 7. Actions */}
                  <td style={{ padding: '14px 14px', textAlign: 'right' }}>
                    <button
                      onClick={() => handleDelete(fb.id)}
                      title="Delete Feedback"
                      style={{
                        padding: '5px 8px',
                        borderRadius: '6px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        color: '#b91c1c',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <TrashIcon size={12} color="#b91c1c" />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredReviews.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontSize: '13px' }}>
                    No customer reviews found matching the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Feedback Modal */}
      {showAddModal && (
        <Modal title="Log Customer Feedback" onClose={() => setShowAddModal(false)}>
          <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Table Number <span style={{ color: '#ef4444' }}>*</span>
                </label>
                <select
                  value={feedbackForm.table}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, table: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', background: '#fff' }}
                >
                  {tablesList.map(t => (
                    <option key={t.id} value={t.id.replace('T-', '')}>
                      Table {t.id.replace('T-', '')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Order ID (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 847"
                  value={feedbackForm.orderId}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, orderId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Customer Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  value={feedbackForm.customerName}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, customerName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 9876543210"
                  value={feedbackForm.phone}
                  onChange={(e) => setFeedbackForm({ ...feedbackForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                />
              </div>
            </div>

            {/* Ratings Selection */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Food Rating
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, foodRating: star })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '6px',
                        border: feedbackForm.foodRating === star ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                        background: feedbackForm.foodRating >= star ? '#fef3c7' : '#ffffff',
                        color: feedbackForm.foodRating >= star ? '#b45309' : '#94a3b8',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>{star}</span>
                      <StarIcon size={11} color={feedbackForm.foodRating >= star ? '#b45309' : '#94a3b8'} fill={feedbackForm.foodRating >= star ? '#b45309' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                  Service Rating
                </label>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFeedbackForm({ ...feedbackForm, serviceRating: star })}
                      style={{
                        flex: 1,
                        padding: '8px 0',
                        borderRadius: '6px',
                        border: feedbackForm.serviceRating === star ? '2px solid #f59e0b' : '1px solid #cbd5e1',
                        background: feedbackForm.serviceRating >= star ? '#fef3c7' : '#ffffff',
                        color: feedbackForm.serviceRating >= star ? '#b45309' : '#94a3b8',
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontSize: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '3px'
                      }}
                    >
                      <span>{star}</span>
                      <StarIcon size={11} color={feedbackForm.serviceRating >= star ? '#b45309' : '#94a3b8'} fill={feedbackForm.serviceRating >= star ? '#b45309' : 'none'} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '6px' }}>
                Customer Comments
              </label>
              <textarea
                rows="3"
                value={feedbackForm.comments}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, comments: e.target.value })}
                placeholder="What did the customer say about food taste, cleanliness, or staff response?"
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', outline: 'none' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddModal(false)}
                style={{ padding: '8px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-black"
                style={{ padding: '8px 18px' }}
              >
                Save Feedback
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
