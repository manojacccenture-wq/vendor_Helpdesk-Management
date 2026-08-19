import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { History } from 'lucide-react';
import { BackButton } from './BackButton.jsx';
import { Card, CardHeader, CardTitle, CardContent } from './Card.jsx';
import { TicketHistoryList } from './TicketHistoryList.jsx';
import { useGetTicketDetailsQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { formatTicketNo } from '../utils/ticket.js';

/**
 * TicketHistoryPage — Full-page ticket history view.
 *
 * Used by:
 * - Vendor ticket history page
 * - Helpdesk ticket history page
 * - Department ticket history page
 *
 * @param {string} backPath - Path to navigate back to (e.g., '/vendor')
 */
export const TicketHistoryPage = ({ backPath }) => {
  const { id } = useParams();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

  const { data: ticketDetails, isLoading } = useGetTicketDetailsQuery(
    {
      ticketId: id,
      role,
      userCode: profile?.userCode,
    },
    {
      skip: !id || !profile?.userCode || !role,
    }
  );

  const ticketNo = formatTicketNo(ticketDetails?.ticketNo || ticketDetails?.ticketNumber || `#${id}`);
  const subject = ticketDetails?.subject || ticketDetails?.ticketSubject || '';
  const ticketHistoryViewModels = ticketDetails?.ticketHistoryViewModels || [];

  return (
    <div className="flex flex-col h-full w-full max-w-[1200px] mx-auto">

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton to={`${backPath}/ticket/${id}`} label="Back to Ticket" />
      </div>

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-info" />
          <h1 className="text-page-title text-primary">
            Ticket History
          </h1>
        </div>
        {ticketNo && (
          <span className="text-caption text-secondary font-mono">
            {ticketNo}
          </span>
        )}
        {subject && (
          <span className="text-caption text-secondary truncate max-w-[300px]">
            — {subject}
          </span>
        )}
      </div>

      {/* History Card */}
      <Card className="flex-1 flex flex-col min-h-0">
  

        <CardContent className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-success border-t-transparent rounded-full animate-spin" />
                <span className="text-secondary">Loading history...</span>
              </div>
            </div>
          ) : (
            <TicketHistoryList history={ticketHistoryViewModels} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TicketHistoryPage;
