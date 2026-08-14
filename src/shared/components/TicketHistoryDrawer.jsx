import { useState, useMemo } from 'react';
import {
  History,
  PlusCircle,
  RefreshCw,
  UserPlus,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
} from 'lucide-react';
import { formatDate } from '../utils/date.js';
import { Drawer } from './Drawer.jsx';
import { cn } from '../utils/cn.js';

// ─── Event Configuration ───

const DEFAULT_EVENT_STYLE = {
  icon: Clock,
  colorClass: 'text-secondary',
  dotClass: 'border-secondary bg-transparent',
  badgeBg: 'bg-surface-active',
};

const EVENT_CONFIG = {
  'ticket created':  {
    icon: PlusCircle,
    colorClass: 'text-success',
    dotClass: 'border-success bg-transparent',
    badgeBg: 'bg-success-soft',
  },
  'status changed':  {
    icon: RefreshCw,
    colorClass: 'text-info',
    dotClass: 'border-info bg-transparent',
    badgeBg: 'bg-info-soft',
  },
  'ticket assigned': {
    icon: UserPlus,
    colorClass: 'text-warning',
    dotClass: 'border-warning bg-transparent',
    badgeBg: 'bg-warning-soft',
  },
  'ticket reopened': {
    icon: RotateCcw,
    colorClass: 'text-purple',
    dotClass: 'border-accent bg-transparent',
    badgeBg: 'bg-accent-soft',
  },
  'ticket closed':   {
    icon: CheckCircle,
    colorClass: 'text-success',
    dotClass: 'border-success bg-transparent',
    badgeBg: 'bg-success-soft',
  },
  'escalated':       {
    icon: AlertTriangle,
    colorClass: 'text-danger',
    dotClass: 'border-danger bg-transparent',
    badgeBg: 'bg-danger-soft',
  },
};

const getEventConfig = (title) => {
  const key = (title || '').toLowerCase().trim();
  return EVENT_CONFIG[key] || DEFAULT_EVENT_STYLE;
};

// ─── Single History Event ───

const HistoryEvent = ({ event }) => {
  const { icon: Icon, colorClass, dotClass, badgeBg } = getEventConfig(event.title);

  return (
    <div className="flex gap-3 group">
      {/* Timeline column: open dot + connecting line */}
      <div className="flex flex-col items-center shrink-0 pt-3.5">
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-full border-[1.5px] shrink-0 z-10',
            'transition-transform duration-150 group-hover:scale-125',
            dotClass
          )}
        />
        <div className="w-px flex-1 bg-default my-0.5" />
      </div>

      {/* Event card */}
      <div
        className={cn(
          'flex-1 min-w-0 mb-2.5 p-3',
          'bg-surface-hover rounded-lg border border-default',
          'transition-shadow duration-200 hover:shadow-sm'
        )}
      >
        {/* Header: Icon badge + Title + Date */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Circular icon badge */}
            <span
              className={cn(
                'inline-flex items-center justify-center shrink-0',
                'w-8 h-8 rounded-full',
                badgeBg
              )}
            >
              <Icon className={cn('w-4 h-4', colorClass)} />
            </span>
            <div className="min-w-0">
              <span className="text-body font-semibold text-primary block">
                {event.title}
              </span>
              {event.description && (
                <p className="text-caption text-secondary mt-0.5">
                  {event.description}
                </p>
              )}
            </div>
          </div>
          <span className="text-caption text-secondary whitespace-nowrap shrink-0 mt-0.5">
            {formatDate(event.changedAt)}
          </span>
        </div>

        {/* Changed By */}
        <div className="flex items-center gap-1.5 mt-2 pl-10">
          <span className="text-caption text-muted">By:</span>
          <span className="text-caption font-medium text-primary">
            {event.changedBy || 'System'}
          </span>
        </div>

        {/* Remarks (only when present) */}
        {event.remarks && (
          <div className="mt-1.5 ml-10 p-2 bg-surface-active rounded-md border border-default">
            <span className="text-caption font-semibold text-primary">Remarks: </span>
            <span className="text-caption text-secondary">{event.remarks}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Empty State ───

const EmptyHistory = () => (
  <div className="flex flex-col items-center justify-center py-16 gap-3">
    <div className="w-12 h-12 rounded-full bg-surface-active flex items-center justify-center">
      <History className="w-5 h-5 text-secondary" />
    </div>
    <div className="text-center">
      <p className="text-caption font-medium text-primary">No history records</p>
      <p className="text-caption text-secondary mt-0.5">Timeline of all actions performed on this ticket</p>
    </div>
  </div>
);

// ─── Main Drawer Component ───

/**
 * TicketHistoryDrawer — Ticket history drawer matching the reference design.
 * Uses the shared Drawer component for the overlay/panel structure.
 *
 * @param {Object} props
 * @param {Array} props.history - Array of ticketHistoryViewModels
 */
export const TicketHistoryDrawer = ({ history = [] }) => {
  const [isOpen, setIsOpen] = useState(false);

  const sorted = useMemo(
    () => [...history].sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)),
    [history]
  );

  const hasHistory = sorted.length > 0;

  return (
    <>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-control",
          "bg-surface border border-default hover:border-hover",
          "transition-colors cursor-pointer",
          "text-body text-primary"
        )}
      >
        <History className="w-4 h-4 text-info" />
        <span className="font-medium">Ticket History</span>
        {hasHistory && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-info text-white text-caption font-medium">
            {sorted.length}
          </span>
        )}
      </button>

      {/* Drawer */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title={`Ticket History${hasHistory ? ` (${sorted.length})` : ''}`}
        icon={<History className="w-5 h-5 text-info" />}
        scrollableClassName="px-5 py-4"
        ariaLabel="Close ticket history"
        footer={
          hasHistory && (
            <div className="flex items-center gap-2 px-6 py-3 text-caption text-secondary">
              <Info className="w-4 h-4 shrink-0" />
              <span>Showing {sorted.length} of {sorted.length} events</span>
            </div>
          )
        }
      >
        {hasHistory ? (
          <div>
            {sorted.map((event, index) => (
              <HistoryEvent key={index} event={event} />
            ))}
          </div>
        ) : (
          <EmptyHistory />
        )}
      </Drawer>
    </>
  );
};

export default TicketHistoryDrawer;
