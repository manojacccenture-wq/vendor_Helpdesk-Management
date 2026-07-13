import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProfileThunk } from '../features/user/store/thunks.js';
import { selectAuthStatus, selectUserProfile } from '../features/user/store/selectors.js';

export const App = () => {
  const dispatch = useDispatch();
  const { initialized, loading, isAuthenticated, error } = useSelector(selectAuthStatus);
  const profile = useSelector(selectUserProfile);

  useEffect(() => {
    // Phase 5 Bootstrap: Fetch profile exactly when app mounts
    dispatch(fetchProfileThunk());
  }, [dispatch]);

  if (!initialized || loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#F8F7F4]">
        <div className="text-[14px] font-[400] text-[#64748B]">Initializing Enterprise App...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F4] p-8">
      <h1 className="text-[18px] font-[600] text-[#1E293B] mb-4">Vendor Helpdesk Application</h1>
      
      {isAuthenticated ? (
        <div className="bg-[#FFFFFF] p-6 rounded-[12px] shadow border border-[#E2E8F0]">
          <p className="text-[#0F766E] font-[500] text-[14px]">Authentication Successful!</p>
          <p className="text-[#64748B] text-[14px] mt-[12px]">Welcome, {profile.name} ({profile.username}).</p>
        </div>
      ) : (
        <div className="bg-[#FFFFFF] p-6 rounded-[12px] shadow border border-[#E11D48]">
          <p className="text-[#E11D48] font-[500] text-[14px]">Not Authenticated</p>
          <p className="text-[#64748B] text-[14px] mt-[12px]">{error || 'Please login to continue.'}</p>
        </div>
      )}
    </div>
  );
};
