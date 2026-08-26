import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppState } from '../../config/AppContext';
import InventoryPanel from '../../components/InventoryPanel';
import ShowNotifications from '../../helper/ShowNotifications';

export default function InventoryManagement() {
  const navigate = useNavigate();
  const { activeRestaurant, upgradeSubscriptionPlan } = useAppState();

  const planName = (activeRestaurant?.subscription?.planName || activeRestaurant?.plan || '').toLowerCase();
  const planId = (activeRestaurant?.subscription?.planId || '').toLowerCase();
  const isPremium = planName.includes('premium') || planId.includes('premium') || planName.includes('enterprise') || planId.includes('enterprise');

  // Interactive live preview toggle for admins
  const [isPreviewUnlocked, setIsPreviewUnlocked] = useState(true);

  const handleInstantUpgradeToPremium = () => {
    if (upgradeSubscriptionPlan && activeRestaurant?.id) {
      upgradeSubscriptionPlan(activeRestaurant.id, 'plan-premium', 'monthly', 'Credit Card (•••• 4242)');
      ShowNotifications.showAlertNotification("Congratulations! Your account has been upgraded to Premium Plan with Inventory Unlocked!", true);
    } else {
      navigate('/plans-management');
    }
  };

  // If on Premium plan OR preview unlocked, render the full Inventory Panel
  if (isPremium || isPreviewUnlocked) {
    return (
      <div style={{ width: '100%' }}>
        {!isPremium && isPreviewUnlocked && (
          <div style={{
            background: 'linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%)',
            border: '1px solid #fde68a',
            borderRadius: '12px',
            padding: '12px 20px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>⚡</span>
              <div>
                <span style={{ fontSize: '13px', fontWeight: 800, color: '#92400e', display: 'block' }}>
                  Interactive Preview Mode Active (Premium Plan Exclusive Feature)
                </span>
                <span style={{ fontSize: '12px', color: '#b45309' }}>
                  You are exploring all features of the Inventory Management module.
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setIsPreviewUnlocked(false)}
                style={{
                  background: '#ffffff',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                  padding: '7px 14px',
                  borderRadius: '7px',
                  fontWeight: 700,
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                Close Preview
              </button>
              <button
                type="button"
                onClick={handleInstantUpgradeToPremium}
                style={{
                  background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '7px 18px',
                  borderRadius: '7px',
                  fontWeight: 800,
                  fontSize: '12px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(255, 90, 31, 0.25)'
                }}
              >
                Upgrade to Premium
              </button>
            </div>
          </div>
        )}
        <InventoryPanel />
      </div>
    );
  }

  // Otherwise, render the Full-Width Premium Upgrade Gate Page
  return (
    <section className="panel-view active" style={{ padding: '0 0 40px 0', width: '100%', boxSizing: 'border-box' }}>
      {/* 1. FULL WIDTH HERO BANNER */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        padding: '48px 40px',
        marginBottom: '24px',
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Top Floating Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: 'linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)',
          border: '1px solid #fed7aa',
          color: '#c2410c',
          fontSize: '12px',
          fontWeight: 800,
          padding: '6px 16px',
          borderRadius: '30px',
          letterSpacing: '0.8px',
          textTransform: 'uppercase',
          marginBottom: '20px'
        }}>
          <span style={{ fontSize: '14px' }}>⭐</span>
          <span>Premium Plan Exclusive</span>
        </div>

        {/* Hero Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: 900,
          color: '#0f172a',
          margin: '0 0 14px 0',
          fontFamily: "'Outfit', sans-serif",
          letterSpacing: '-0.5px',
          maxWidth: '800px'
        }}>
          Automate Restaurant Stock & Raw Materials
        </h1>

        {/* Hero Subtitle */}
        <p style={{
          fontSize: '15px',
          color: '#64748b',
          maxWidth: '720px',
          margin: '0 auto 32px auto',
          lineHeight: 1.6
        }}>
          Take full control of your kitchen with intelligent ingredient tracking, live reorder alerts, automated food wastage logs, and supplier purchase valuation.
        </p>

        {/* Upgrade & Preview Actions */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleInstantUpgradeToPremium}
            style={{
              background: 'linear-gradient(135deg, #ff5a1f 0%, #ea580c 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '10px',
              padding: '14px 32px',
              fontSize: '15px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(255, 90, 31, 0.35)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
          >
            <span>Upgrade to Premium Plan (₹4,999/mo)</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
          </button>

          <button
            type="button"
            onClick={() => setIsPreviewUnlocked(true)}
            style={{
              background: '#f8fafc',
              color: '#0f172a',
              border: '1.5px solid #cbd5e1',
              borderRadius: '10px',
              padding: '14px 26px',
              fontSize: '14px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '16px' }}>⚡</span>
            <span>Try Interactive Demo</span>
          </button>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a' }}></span>
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            Current Active Plan: <strong style={{ color: '#0f172a' }}>{activeRestaurant?.subscription?.planName || activeRestaurant?.plan || 'Standard Plan'}</strong>
          </span>
        </div>
      </div>

      {/* 2. FULL WIDTH 4-COLUMN FEATURE GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
        gap: '16px',
        marginBottom: '24px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        {/* Card 1 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Live Stock Tracking
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Monitor live kg, liters, grams, and pack quantities across dairy, vegetables, meats, grains, oils, and packaging materials.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', fontWeight: 700, color: '#2563eb' }}>
            ✓ Multi-branch stock segregation
          </div>
        </div>

        {/* Card 2 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#fef2f2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Low Stock Reorder Alerts
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Automated safety threshold indicators warn you before essential ingredients run out during peak dining hours.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', fontWeight: 700, color: '#dc2626' }}>
            ✓ Visual progress bars & warnings
          </div>
        </div>

        {/* Card 3 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#ecfdf5', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Stock In / Out Adjustments
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Quickly record inbound vendor purchases, recipe kitchen issues, transfers, and food wastage with invoice references.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', fontWeight: 700, color: '#059669' }}>
            ✓ Full audit trail & historical logs
          </div>
        </div>

        {/* Card 4 */}
        <div style={{
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          borderRadius: '16px',
          padding: '28px 24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.02)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: '#faf5ff', color: '#9333ea', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>
            </div>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', fontWeight: 800, color: '#0f172a' }}>
              Valuation & Suppliers
            </h3>
            <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: 1.6 }}>
              Real-time calculations of total stock valuation in ₹ alongside full supplier contact directories for one-click reorders.
            </p>
          </div>
          <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', fontSize: '12px', fontWeight: 700, color: '#9333ea' }}>
            ✓ Dynamic valuation ledger
          </div>
        </div>
      </div>

      {/* 3. FULL WIDTH PLAN COMPARISON CARD */}
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.03)',
        padding: '32px 36px',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: '0 0 4px 0', fontFamily: "'Outfit', sans-serif" }}>
            Compare Plan Features & Module Access
          </h3>
         
        </div>

        <div style={{ overflowX: 'auto', borderRadius: '14px', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.04)', paddingBottom: '6px' }}>
          <table className="admin-table" style={{ width: '100%', minWidth: '850px', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#000000', borderBottom: '3px solid #ff5a1f' }}>
                <th style={{ padding: '14px 18px', fontWeight: 800, color: '#ffffff' }}>FEATURES & MODULES</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'center', color: '#ffffff' }}>BASIC (₹999/mo)</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'center', color: '#ffffff' }}>STANDARD (₹1,999/mo)</th>
                <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'center', color: '#ff7a00' }}>PREMIUM (₹4,999/mo)</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: 'QR Ordering & Digital Menu', basic: true, standard: true, premium: true },
                { feature: 'Table Management & QR Linking', basic: true, standard: true, premium: true },
                { feature: 'Order Management & Status Flow', basic: true, standard: true, premium: true },
                { feature: 'Tableside Waiter Management', basic: false, standard: true, premium: true },
                { feature: 'Kitchen KDS Display Credentials', basic: false, standard: false, premium: true },
                { feature: 'Inventory & Raw Material Management', basic: false, standard: false, premium: true, highlight: true },
                { feature: 'Low Stock Safety Alerts & Audits', basic: false, standard: false, premium: true, highlight: true },
                { feature: 'Multi-Branch Support', basic: '1 Branch', standard: '3 Branches', premium: '10 Branches' }
              ].map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9', background: row.highlight ? '#fffcf9' : 'transparent' }}>
                  <td style={{ padding: '12px 18px', fontWeight: row.highlight ? 800 : 600, color: row.highlight ? '#ea580c' : '#0f172a' }}>
                    {row.feature}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'center', color: '#64748b' }}>
                    {typeof row.basic === 'boolean' ? (row.basic ? '✓' : '—') : row.basic}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'center', color: '#64748b' }}>
                    {typeof row.standard === 'boolean' ? (row.standard ? '✓' : '—') : row.standard}
                  </td>
                  <td style={{ padding: '12px 18px', textAlign: 'center', background: '#fff7ed', fontWeight: 800, color: '#16a34a' }}>
                    {typeof row.premium === 'boolean' ? (row.premium ? '✓ Included' : '—') : row.premium}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer CTA inside Card */}
        <div style={{
          marginTop: '28px',
          paddingTop: '20px',
          borderTop: '1px solid #f1f5f9',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h4 style={{ margin: '0 0 2px 0', fontSize: '15px', fontWeight: 800, color: '#0f172a' }}>
              Ready to automate your restaurant inventory?
            </h4>
            <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
              Instant activation with zero downtime. Upgrade your active subscription plan in one click.
            </p>
          </div>
          <button
            type="button"
            onClick={handleInstantUpgradeToPremium}
            style={{
              background: '#ff5a1f',
              color: '#ffffff',
              border: 'none',
              padding: '12px 28px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(255, 90, 31, 0.25)'
            }}
          >
            Upgrade to Premium Now
          </button>
        </div>
      </div>
    </section>
  );
}
