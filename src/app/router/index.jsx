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

const LegacyDashboard = () => {
  const profile = useSelector(selectUserProfile);
  return (
    <div className="min-h-screen bg-[#F8F7F4] p-8">
      <h1 className="text-[18px] font-[600] text-[#1E293B] mb-4">Vendor Helpdesk Application</h1>
      <div className="bg-[#FFFFFF] p-6 rounded-[12px] shadow border border-[#E2E8F0]">
        <p className="text-[#0F766E] font-[500] text-[14px]">Authentication Successful!</p>
        <p className="text-[#64748B] text-[14px] mt-[12px]">Welcome, {profile.name} ({profile.username}).</p>
      </div>
    </div>
  );
};

const LegacyLogin = () => {
  const { error, isAuthenticated } = useSelector(selectAuthStatus);
  const role = useSelector(state => state.user.role);
  
  if (isAuthenticated) {
    const redirectPath = role === 'L1' ? '/vendor' : '/';
    return <Navigate to={redirectPath} replace />;
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-8">
      <h1 className="text-[18px] font-[600] text-[#1E293B] mb-4">Vendor Helpdesk Application</h1>
      <div className="bg-[#FFFFFF] p-6 rounded-[12px] shadow border border-[#E11D48]">
        <p className="text-[#E11D48] font-[500] text-[14px]">Not Authenticated</p>
        <p className="text-[#64748B] text-[14px] mt-[12px]">{error || 'Please login to continue.'}</p>
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
        element: <LegacyDashboard />
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
