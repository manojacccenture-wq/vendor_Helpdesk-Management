import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../../shared/components/Header.jsx';

export const HelpdeskLayout = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col font-sans">
      {/* Reusable Top Header */}
      <Header portalName="Helpdesk admin portal" />

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto pb-12">
        <Outlet />
      </main>
    </div>
  );
};
