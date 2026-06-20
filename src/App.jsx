import React from 'react';
import { useAppState } from './config/AppContext';
import Login from './pages/Login';
import Admin from './pages/Admin';

function AppContent() {
  const { currentUser } = useAppState();

  return (
    <div className="app-container">
      {/* 1. Login panel */}
      {!currentUser && <Login />}

      {/* 2. Restaurant Admin / Staff panel */}
      {currentUser && <Admin />}
    </div>
  );
}

export default function App() {
  return (
    <AppContent />
  );
}
