import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';

export const adminRoutes = {
  path: 'admin',
  element: <RoleGuard requiredRole="ADMIN" redirectPath="/" />,
  children: [
    // Future Admin specific routes will be lazily loaded here
  ]
};
