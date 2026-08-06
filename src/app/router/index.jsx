import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectAuthStatus, selectUserProfile } from '../../features/user/store/selectors.js';
import { AuthGuard } from '../../shared/guards/AuthGuard.jsx';
import { vendorRoutes } from '../../roles/vendor/routing/index.jsx';
import { helpdeskRoutes } from '../../roles/helpdesk/routing/index.jsx';
import { departmentRoutes } from '../../roles/department/routing/index.jsx';
import { adminRoutes } from '../../roles/admin/routing/index.jsx';

// --- Legacy Preservation Components ---
// These ensure the application layout and logic remains exactly 
// as it was before routing was introduced.

const RootRedirect = () => {
  const role = useSelector(state => state.user.role);
  
  // Route authenticated users from the root to their respective portals
  let redirectPath = '/';
  if (role === 'L1') {
    redirectPath = '/vendor';
  } else if (role === 'L2' || role === 'HelpdeskExecutive') {
    redirectPath = '/helpdesk';
  }
  
  return <Navigate to={redirectPath} replace />;
};

const LegacyLogin = () => {
  const { error, isAuthenticated } = useSelector(selectAuthStatus);
  const role = useSelector(state => state.user.role);
  
  if (isAuthenticated) {
    let redirectPath = '/';
    if (role === 'L1') {
      redirectPath = '/vendor';
    } else if (role === 'L2' || role === 'HelpdeskExecutive') {
      redirectPath = '/helpdesk';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <h1 className="h1ClassName text-primary mb-4">Vendor Helpdesk Application</h1>
      <div className="bg-surface p-6 rounded-card shadow border border-danger">
        <p className="sectionLabelClassName text-danger">Not Authenticated</p>
        <p className="bodyClassName text-secondary mt-[12px]">{error || 'Please login to continue.'}</p>
      </div>
    </div>
  );
};

// --- Global Router Configuration ---
export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LegacyLogin />
  },
  {
    path: '/',
    element: <AuthGuard />,
    children: [
      {
        index: true,
        element: <RootRedirect />
      },
      // The role boundaries are plugged in here, lazy loaded via the RCMA structure
      vendorRoutes,
      helpdeskRoutes,
      departmentRoutes,
      adminRoutes
    ]
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
], {
  basename: import.meta.env.BASE_URL
});
