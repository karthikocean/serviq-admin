import React, { useState } from 'react';
import { useAppState } from '../../config/AppContext';
import KitchenListPanel from '../../components/KitchenListPanel';
import KitchenReportsPanel from '../../components/KitchenReportsPanel';

export default function KitchenManagement({ activeSubTab }) {
  const {
    activeRestaurant,
    upgradeRestaurantPlan,
    updateOrderItemStatus,
    updateStaff,
    deleteStaff,
    addStaff,
    updateKitchenPassword
  } = useAppState();

  const [activePage, setActivePage] = useState(null); // null | 'staff-form' | 'kitchen-form'
  const [staffForm, setStaffForm] = useState({ id: '', name: '', role: 'Kitchen', phone: '', email: '', password: '', status: 'On Duty' });
  const [kitchenPasswordForm, setKitchenPasswordForm] = useState('');

  if (!activeRestaurant) return null;

  const { plan = 'Standard', orders = [], staff = [], menu = [], kitchenLogin = { email: '', password: '' } } = activeRestaurant;

  const openAddStaffModal = (defaultRole = 'Kitchen') => {
    setStaffForm({
      id: '',
      name: '',
      role: defaultRole,
      phone: '',
      email: '',
      password: '',
      status: 'On Duty'
    });
    setActivePage('staff-form');
  };

  const openEditStaffModal = (staffMember) => {
    setStaffForm({
      id: staffMember.id,
      name: staffMember.name,
      role: staffMember.role,
      phone: staffMember.phone || '',
      email: staffMember.email,
      password: staffMember.password,
      status: staffMember.status || 'On Duty'
    });
    setActivePage('staff-form');
  };

  const openKitchenModal = () => {
    setKitchenPasswordForm(kitchenLogin?.password || '');
    setActivePage('kitchen-form');
  };

  const handleStaffSubmit = (e) => {
    e.preventDefault();
    const staffData = {
      name: staffForm.name,
      role: staffForm.role,
      phone: staffForm.phone,
      email: staffForm.email,
      password: staffForm.password,
      status: staffForm.status
    };

    if (staffForm.id) {
      updateStaff(activeRestaurant.id, {
        ...staffData,
        id: staffForm.id
      });
      alert('Staff details updated successfully!');
    } else {
      const newId = 'S-' + Math.floor(1000 + Math.random() * 9000);
      addStaff(activeRestaurant.id, {
        ...staffData,
        id: newId
      });
      alert('New staff registered successfully!');
    }
    setActivePage(null);
  };

  const handleKitchenPasswordSubmit = (e) => {
    e.preventDefault();
    updateKitchenPassword(activeRestaurant.id, kitchenPasswordForm);
    alert('Kitchen password updated successfully!');
    setActivePage(null);
  };

  const sty = {
    pageInlineHeader: { display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '2px solid var(--primary-light)' },
    pageBackBtn: { background: '#fff', border: '1.5px solid var(--border)', borderRadius: '10px', width: '38px', height: '38px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: '16px', transition: 'all 0.2s', flexShrink: 0 },
    pageCard: { background: '#fff', borderRadius: '16px', padding: '32px', border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' },
    formGrid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' },
  };

  const PageHeader = ({ title, subtitle }) => (
    <div style={sty.pageInlineHeader}>
      <button style={sty.pageBackBtn} onClick={() => setActivePage(null)}
        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.color = 'var(--primary)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'inherit'; }}
      >→</button>
      <div>
        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 800, fontFamily: "'Outfit', sans-serif" }}>{title}</h2>
        {subtitle && <span style={{ fontSize: '12px', color: '#64748b' }}>{subtitle}</span>}
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%' }}>
      {activePage === 'staff-form' ? (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader
              title={staffForm.id ? 'Edit Staff Details' : 'Register New Staff'}
              subtitle={staffForm.id ? 'Update employee profile' : 'Add a new member to the restaurant staff'}
            />
            <div style={sty.pageCard}>
              <form onSubmit={handleStaffSubmit} style={{ width: '100%' }}>
                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Full Name</label>
                    <input type="text" value={staffForm.name} onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })} required placeholder="e.g. Ramesh Kumar" />
                  </div>

                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Role</label>
                    <select value={staffForm.role} onChange={(e) => setStaffForm({ ...staffForm, role: e.target.value })} required>
                      <option value="Waiter">Waiter</option>
                      <option value="Kitchen">Kitchen</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '16px', marginTop: '16px' }}>
                  <label>Phone Number</label>
                  <input type="tel" value={staffForm.phone} onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })} required placeholder="e.g. 9876543210" />
                </div>

                <div style={sty.formGrid2}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Email Address</label>
                    <input type="email" value={staffForm.email} onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })} required placeholder="e.g. ramesh@serviq.com" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label>Password</label>
                    <input type="text" value={staffForm.password} onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })} required placeholder="e.g. waiter123" />
                  </div>
                </div>

                <div className="form-group" style={{ marginBottom: '20px', marginTop: '16px' }}>
                  <label>Duty Status</label>
                  <select value={staffForm.status} onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value })} required>
                    <option value="On Duty">On Duty</option>
                    <option value="Off Duty">Off Duty</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : activePage === 'kitchen-form' ? (
        <section>
          <div style={{ width: '100%' }}>
            <PageHeader title="Kitchen Shared Credentials" subtitle="Update the password shared by kitchen station screens" />
            <div style={sty.pageCard}>
              <form onSubmit={handleKitchenPasswordSubmit} style={{ width: '100%' }}>
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label>Kitchen Login Email</label>
                  <input type="email" value={kitchenLogin.email} readOnly style={{ backgroundColor: 'var(--bg-tertiary)', cursor: 'not-allowed' }} />
                </div>
                <div className="form-group" style={{ marginBottom: '20px' }}>
                  <label>Kitchen Login Password</label>
                  <input
                    type="text"
                    value={kitchenPasswordForm}
                    onChange={(e) => setKitchenPasswordForm(e.target.value)}
                    required
                    placeholder="e.g. kitchen123"
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                  <button type="button" className="btn btn-outline" style={{ padding: '10px 24px' }} onClick={() => setActivePage(null)}>Cancel</button>
                  <button type="submit" className="btn btn-black" style={{ padding: '10px 24px' }}>Update Password</button>
                </div>
              </form>
            </div>
          </div>
        </section>
      ) : activeSubTab === 'kitchen-reports' ? (
        <KitchenReportsPanel
          orders={orders}
          staff={staff}
          menu={menu}
        />
      ) : (
        <KitchenListPanel
          plan={plan}
          orders={orders}
          staff={staff}
          activeRestaurant={activeRestaurant}
          upgradeRestaurantPlan={upgradeRestaurantPlan}
          updateOrderItemStatus={updateOrderItemStatus}
          updateStaff={updateStaff}
          deleteStaff={deleteStaff}
          openAddStaffModal={openAddStaffModal}
          openEditStaffModal={openEditStaffModal}
          openKitchenModal={openKitchenModal}
        />
      )}
    </div>
  );
}
