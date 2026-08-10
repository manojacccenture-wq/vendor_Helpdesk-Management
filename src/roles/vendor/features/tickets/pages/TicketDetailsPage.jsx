import { useParams } from 'react-router-dom';
import { TicketDetailsView } from '../../../../../shared/components/TicketDetailsView.jsx';

/**
 * TicketDetailsPage — Thin wrapper for Vendor role.
 * Uses the shared TicketDetailsView with Vendor-specific configuration.
 */
export const TicketDetailsPage = () => {
  const { id } = useParams();

  return (
    <TicketDetailsView
      ticketId={id}
      backPath="/vendor"
      showUpdatedBy={true}
    />
  );
};

export default TicketDetailsPage;
