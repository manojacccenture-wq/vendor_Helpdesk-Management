import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../features/user/store/selectors.js';

export const Header = ({ portalName = "Vendor helpdesk portal" }) => {
  const profile = useSelector(selectUserProfile);

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
        <button className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
