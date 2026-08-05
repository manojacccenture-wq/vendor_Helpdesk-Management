import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectUserRole } from '../../features/user/store/selectors.js';

/**
 * Ensures an authenticated user has the correct role for a nested route boundary.
 * @param {string|string[]} requiredRole - A single role string or an array of allowed roles.
 * @param {string} redirectPath - Path to redirect if role doesn't match.
 */
export const RoleGuard = ({ requiredRole, redirectPath = '/', children }) => {
  const role = useSelector(selectUserRole);

  // Support both single role string and array of roles
  const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const isAuthorized = allowedRoles.includes(role);

  if (!isAuthorized) {
    return <Navigate to={redirectPath} replace />;
  }

  return children ? children : <Outlet />;
};
