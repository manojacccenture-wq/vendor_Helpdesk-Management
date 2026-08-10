import { useParams } from 'react-router-dom';
import { TicketDetailsView } from '../../../../../shared/components/TicketDetailsView.jsx';

/**
 * HelpdeskTicketView — Thin wrapper for Helpdesk role.
 * Uses the shared TicketDetailsView with Helpdesk-specific configuration.
 */
export const HelpdeskTicketView = () => {
  const { id } = useParams();

  return (
    <TicketDetailsView
      ticketId={id}
      backPath="/helpdesk"
      showUpdatedBy={false}
    />
  );
};

export default HelpdeskTicketView;
