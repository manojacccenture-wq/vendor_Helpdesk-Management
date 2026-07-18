import React from 'react';
import { RoleGuard } from '../../../shared/guards/RoleGuard.jsx';

export const helpdeskRoutes = {
  path: 'helpdesk',
  element: <RoleGuard requiredRole="L2" redirectPath="/" />,
  children: [
    // Future Helpdesk specific routes will be lazily loaded here
  ]
};
