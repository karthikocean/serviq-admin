import React from 'react';
import { useAppState, DEFAULT_ROLES } from '../../config/AppContext';
import UserListPanel from '../../components/UserListPanel';

export default function Users() {
  const {
    currentUser,
    activeRestaurant,
    addUser,
    updateUser,
    deleteUser,
    addStaff,
    updateStaff,
    deleteStaff
  } = useAppState();

  if (!activeRestaurant) return null;

  const staff = activeRestaurant.staff || [];

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
