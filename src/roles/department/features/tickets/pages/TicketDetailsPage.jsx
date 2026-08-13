import React from 'react';
import { useParams } from 'react-router-dom';
import { TicketDetailsView } from '../../../../../shared/components/TicketDetailsView.jsx';

export const TicketDetailsPage = () => {
  const { id } = useParams();

  return (
    <TicketDetailsView 
      ticketId={id} 
      backPath="/department" 
    />
  );
};

export default TicketDetailsPage;
