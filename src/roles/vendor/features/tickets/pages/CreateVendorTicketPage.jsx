import React from 'react';
import { useNavigate } from 'react-router-dom';
import { VendorInfoCard } from '../components/VendorInfoCard.jsx';
import { VendorTicketForm } from '../components/VendorTicketForm.jsx';
import { BackButton } from '../../../../../shared/components/BackButton.jsx';

import { useSelector } from 'react-redux';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';

export const CreateVendorTicketPage = () => {
  const profile = useSelector(selectUserProfile) || {};
  const navigate = useNavigate();

  const handleTicketSubmit = (data) => {
    // The ticket was successfully created and the RTK Query cache has been invalidated.
    // Navigate back to the dashboard, which will automatically refetch live data.
    navigate('/vendor');
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/vendor" />
        <div className="flex flex-col gap-1">
          <h1 className="text-primary page-heading">
            Create Vendor Ticket
          </h1>
          <p className="text-secondary">
            Raise a new support ticket for vendor-related issues.
          </p>
        </div>
      </div>

      {/* Composition of Module Components */}
      <div className="flex flex-col gap-6">
        <VendorInfoCard vendor={profile} />
        
        <VendorTicketForm onSubmitTicket={handleTicketSubmit} />
      </div>

    </div>
  );
};
