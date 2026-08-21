import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectUserProfile } from '../../features/user/store/selectors.js';
import { Button } from './Button.jsx';
import { AuthApi } from '../../features/auth/api/auth.api.js';
import { clearUser } from '../../features/user/store/userSlice.js';
import { TokenService } from '../api/auth.js';
import { useNotification } from '../notifications/index.js';

export const Header = ({ portalName = "Vendor helpdesk portal" }) => {
  const profile = useSelector(selectUserProfile);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { showError } = useNotification();

  const handleLogout = async () => {
    try {
      // Clear Redux state and localStorage BEFORE redirect
      // (window.location.href causes immediate navigation,
      // so code after it never executes)
      dispatch(clearUser());
      TokenService.clearAll();

      // Redirect to server-side logout endpoint
      AuthApi.logout();
    } catch (error) {
      const errorMessage = error?.response?.data?.message
        || error?.response?.data?.detail
        || error?.response?.data?.title
        || error?.message
        || 'Logout failed. Please try again.';
      showError(errorMessage);
    }
  };

  return (
    <header className="h-[64px] bg-primary flex items-center justify-between px-6 shrink-0 w-full">
      {/* Left: Branding */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-[8px] border border-white/20 bg-white/10 flex items-center justify-center">
          <span className="text-white">TS</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-white brand-title">
            Tata Steel Utilities and Infrastructure Services Limited
          </h1>
          <p className="text-slate-400">
            {portalName}
          </p>
        </div>
      </div>

      {/* Right: User Actions */}
      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative cursor-pointer w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
          <Bell className="text-slate-300 w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-primary"></span>
        </div>
        
        {/* Profile */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-slate-500 flex items-center justify-center">
            <span className="text-white">
              {profile?.name?.charAt(0) || 'A'}
            </span>
          </div>
          <span className="text-white">
            {profile?.name || 'ABC Suppliers Pvt Ltd'}
          </span>
        </div>

        {/* Logout */}
        <Button
          variant="black"
          className="flex items-center gap-2 "
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </Button>
      </div>
    </header>
  );
};
