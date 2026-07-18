import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthStatus } from '../../features/user/store/selectors.js';

/**
 * Ensures a user is authenticated before accessing nested routes.
 */
export const AuthGuard = () => {
  const { isAuthenticated } = useSelector(selectAuthStatus);

  if (!isAuthenticated) {
    // Secure redirect logic without layout flashing
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
