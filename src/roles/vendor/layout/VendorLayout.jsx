import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../../shared/components/Header.jsx';

export const VendorLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Reusable Top Header */}
      <Header portalName="Vendor helpdesk portal" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-12">
        <div className="max-w-[1200px] mx-auto px-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
