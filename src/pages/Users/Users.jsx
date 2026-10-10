import React from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import UserListPanel from '../../components/UserListPanel';
import { isBranchMatch, isBranchFilterActive } from '../../helper/BranchHelper';

export default function Users() {
  const {
    currentUser,
    activeRestaurant,
    selectedBranchId,
    addUser,
    updateUser,
    deleteUser,
    addStaff,
    updateStaff,
    deleteStaff
  } = useAppState();

  if (!activeRestaurant) return null;

  const rawStaff = activeRestaurant.staff || [];
  const isBranchFiltered = isBranchFilterActive(selectedBranchId);
  const staff = isBranchFiltered
    ? rawStaff.filter(s => isBranchMatch(s, selectedBranchId, activeRestaurant.branches || []))
    : rawStaff;

  return (
    <UserListPanel
      activeRestaurant={activeRestaurant}
      staff={staff}
      addUser={addUser}
      updateUser={updateUser}
      deleteUser={deleteUser}
      addStaff={addStaff}
      updateStaff={updateStaff}
      deleteStaff={deleteStaff}
    />
  );
}
