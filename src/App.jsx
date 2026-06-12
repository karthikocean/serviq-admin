import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppState } from './config/AppContext';
import Login from './pages/Login';
import Admin from './pages/Admin';

// Guard for authenticated pages
function ProtectedRoute({ children }) {
  const { currentUser } = useAppState();
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// Guard for login page (prevent visiting login if already logged in)
function PublicRoute({ children }) {
  const { currentUser } = useAppState();
  if (currentUser) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route 
          path="/login" 
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } 
        />
        <Route 
          path="/*" 
          element={
            <ProtectedRoute>
              <Admin />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

