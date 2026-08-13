import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../../../shared/components/Header.jsx';

export const DepartmentLayout = () => {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header portalName="Department Helpdesk Portal" />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
