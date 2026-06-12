import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export function PrivateRoute({ children }) {
  const { isAuthenticated, loading } = useContext(AuthContext);

  // Wait for AuthProvider to finish loading state from localStorage
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '50px', color: 'var(--text-main)', fontFamily: 'sans-serif' }}>
        <h3>Loading authentication state...</h3>
      </div>
    );
  }

  // Redirect to login if token does not exist
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content if user is authenticated
  return children;
}