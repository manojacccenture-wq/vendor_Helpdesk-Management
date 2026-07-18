import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';

export const departmentRoutes = {
  path: 'department',
  element: <RoleGuard requiredRole="DEPT" redirectPath="/" />,
  children: [
    // Future Department specific routes will be lazily loaded here
  ]
};
