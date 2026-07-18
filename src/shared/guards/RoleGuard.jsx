import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/user/store/selectors.js';

/**
 * Ensures an authenticated user has the correct role for a nested route boundary.
 */
export const RoleGuard = ({ requiredRole, redirectPath = '/', children }) => {
  const role = useSelector(selectUserRole);

  if (role !== requiredRole) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};
