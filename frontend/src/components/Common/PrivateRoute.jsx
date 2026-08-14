import React from 'react';
import { Navigate } from 'react-router-dom';

export const PrivateRoute = ({ children }) => {
  const isAuthenticated =
    localStorage.getItem('ems_authenticated') === 'true' ||
    sessionStorage.getItem('ems_authenticated') === 'true';

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
