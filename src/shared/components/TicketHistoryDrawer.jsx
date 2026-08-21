import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { History, Maximize2, Info } from 'lucide-react';
import { Drawer } from './Drawer.jsx';
import { Button } from './Button.jsx';
import { TicketHistoryList } from './TicketHistoryList.jsx';
import { selectUserRole } from '../../features/user/store/selectors.js';
import { cn } from '../utils/cn.js';

/**
 * TicketHistoryDrawer — Compact trigger button + slide-out drawer for ticket history.
 * Uses the shared TicketHistoryList for rendering stage-based history.
 *
 * @param {Object} props
 * @param {string|number} props.ticketId - The ticket ID (for expand navigation)
 * @param {Array} props.stages - Array of { stage, histories[] } from ticketHistoryStages
 */
export const TicketHistoryDrawer = ({ ticketId, stages = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);

  // Count total history events across all stages
  const displayCount = stages.reduce((sum, s) => sum + (s.histories?.length || 0), 0);
  const hasHistory = displayCount > 0;

  // Determine expand path based on role (same pattern as TicketCommentsDrawer)
  const expandPath = role === 'L1'
    ? `/vendor/ticket/${ticketId}/history`
    : ['BL1', 'HOD', 'VH', 'MD'].includes(role)
      ? `/department/ticket/${ticketId}/history`
      : `/helpdesk/ticket/${ticketId}/history`;

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(true)}
        className="gap-2 px-4 py-2.5 bg-surface border border-default hover:border-hover text-body text-primary"
      >
        <History className="w-4 h-4 text-info" />
        <span className="font-medium">Ticket History</span>
        {hasHistory && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-info text-white text-caption font-medium">
            {displayCount}
          </span>
        )}
      </Button>

      {/* Drawer */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        resizable
        title={`Ticket History${hasHistory ? ` (${displayCount})` : ''}`}
        icon={<History className="w-5 h-5 text-info" />}
        headerActions={(onClose) => (
          hasHistory && (
            <Button
              variant="ghost"
              onClick={() => {
                onClose();
                navigate(expandPath);
              }}
              className="p-2 text-secondary hover:bg-surface-active hover:text-primary"
              aria-label="Open full page"
              title="Open full page"
            >
              <Maximize2 className="w-5 h-5" />
            </Button>
          )
        )}
        scrollableClassName="px-4 py-4"
        ariaLabel="Close ticket history"
        footer={
          hasHistory && (
            <div className="flex items-center gap-2 px-6 py-3 text-caption text-secondary">
              <Info className="w-4 h-4 shrink-0" />
              <span>Showing {displayCount} of {displayCount} events</span>
            </div>
          )
        }
      >
        <TicketHistoryList stages={stages} />
      </Drawer>
    </>
  );
};

export default TicketHistoryDrawer;
