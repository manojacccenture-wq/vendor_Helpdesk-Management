import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../../../shared/utils/cn.js';

export const VendorTabs = () => {
  const tabs = [
    { label: 'MY TICKETS', path: '/vendor' },
    { label: 'CREATE TICKET', path: '/vendor/create' },
    { label: 'PROFILE', path: '/vendor/profile' }
  ];

  return (
    <div className="border-b border-[#E2E8F0] mb-6">
      <div className="flex items-center gap-8 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end
            className={({ isActive }) => cn(
              "pb-3 text-[13px] font-[600] transition-colors relative",
              isActive ? "text-[#1E293B]" : "text-[#94A3B8] hover:text-[#64748B]"
            )}
          >
            {({ isActive }) => (
              <>
                {tab.label}
                {isActive && (
                  <div className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-[#1E293B] rounded-t-full"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
};
