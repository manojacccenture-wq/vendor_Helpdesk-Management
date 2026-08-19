import { useMemo } from 'react';
import {
  History,
  PlusCircle,
  RefreshCw,
  UserPlus,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { formatDate } from '../utils/date.js';
import { cn } from '../utils/cn.js';
import { TruncatedText } from './TruncatedText.jsx';

// ─── Event Configuration ───

const DEFAULT_EVENT_STYLE = {
  icon: Clock,
  colorClass: 'text-secondary',
  dotClass: 'border-secondary/40 bg-secondary/10',
  dotFilledClass: 'border-secondary bg-secondary',
  badgeBg: 'bg-surface-active',
};

const EVENT_CONFIG = {
  'ticket created':  {
    icon: PlusCircle,
    colorClass: 'text-success',
    dotClass: 'border-success/40 bg-success/10',
    dotFilledClass: 'border-success bg-success',
    badgeBg: 'bg-success-soft',
  },
  'status changed':  {
    icon: RefreshCw,
    colorClass: 'text-info',
    dotClass: 'border-info/40 bg-info/10',
    dotFilledClass: 'border-info bg-info',
    badgeBg: 'bg-info-soft',
  },
  'ticket assigned': {
    icon: UserPlus,
    colorClass: 'text-warning',
    dotClass: 'border-warning/40 bg-warning/10',
    dotFilledClass: 'border-warning bg-warning',
    badgeBg: 'bg-warning-soft',
  },
  'ticket reopened': {
    icon: RotateCcw,
    colorClass: 'text-purple',
    dotClass: 'border-accent/40 bg-accent/10',
    dotFilledClass: 'border-accent bg-accent',
    badgeBg: 'bg-accent-soft',
  },
  'ticket closed':   {
    icon: CheckCircle,
    colorClass: 'text-success',
    dotClass: 'border-success/40 bg-success/10',
    dotFilledClass: 'border-success bg-success',
    badgeBg: 'bg-success-soft',
  },
  'escalated':       {
    icon: AlertTriangle,
    colorClass: 'text-danger',
    dotClass: 'border-danger/40 bg-danger/10',
    dotFilledClass: 'border-danger bg-danger',
    badgeBg: 'bg-danger-soft',
  },
};

const getEventConfig = (title) => {
  const key = (title || '').toLowerCase().trim();
  return EVENT_CONFIG[key] || DEFAULT_EVENT_STYLE;
};

// ─── Single History Event ───

const HistoryEvent = ({ event, isLatest }) => {
  const { icon: Icon, colorClass, badgeBg } = getEventConfig(event.title);

  return (
    <div className="flex gap-3 group">
      {/* Timeline column: open dot + connecting line */}
      <div className="flex flex-col items-center shrink-0 pt-3.5">
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-full border-[1.5px] shrink-0 z-10',
            'transition-transform duration-150 group-hover:scale-125',
            isLatest ? 'border-warning bg-warning' : 'border-success bg-success'
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
              <TruncatedText as="span" className="text-body font-semibold text-primary block">
                {event.title}
              </TruncatedText>
              {event.description && (
                <TruncatedText as="p" className="text-caption text-secondary mt-0.5">
                  {event.description}
                </TruncatedText>
              )}
            </div>
          </div>
          <span className="text-caption text-secondary whitespace-nowrap shrink-0 mt-0.5">
            {formatDate(event.changedAt)}
          </span>
        </div>

        {/* Changed By */}
        <div className="flex items-center gap-1.5 mt-2 pl-10 min-w-0 truncate">
          <span className="text-caption text-muted shrink-0">By:</span>
          <TruncatedText className="text-caption font-medium text-primary min-w-0">
            {event.changedBy || 'System'}
          </TruncatedText>
        </div>

        {/* Pending With (only when metadata available) */}
        {(event.metadata?.pendingWithUser || event.metadata?.pendingWithRole) && (
          <div className="flex items-center gap-1.5 mt-1 pl-10 min-w-0 truncate">
            <span className="text-caption text-muted shrink-0">Pending with:</span>
            <TruncatedText className="text-caption font-medium text-primary min-w-0">
              {event.metadata.pendingWithUser || event.metadata.pendingWithRole}
              {event.metadata.pendingWithUser && event.metadata.pendingWithRole
                ? ` (${event.metadata.pendingWithRole})`
                : ''}
            </TruncatedText>
          </div>
        )}

        {/* Remarks (only when present) */}
        {event.remarks && (
          <TruncatedText as="div" className="mt-1.5 ml-10 p-2 bg-surface-active rounded-md border border-default">
            <span className="text-caption font-semibold text-primary">Remarks: </span>
            <span className="text-caption text-secondary">{event.remarks}</span>
          </TruncatedText>
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

// ─── Shared History List ───

/**
 * TicketHistoryList — Reusable ticket history timeline renderer.
 * Used by both the Drawer and the full-screen page.
 *
 * @param {Object} props
 * @param {Array} props.history - Array of ticketHistoryViewModels
 */
export const TicketHistoryList = ({ history = [] }) => {
  const sorted = useMemo(
    () => [...history]
      .filter(item => item.title !== "Status Changed")
      .sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt)),
    [history]
  );

  if (sorted.length === 0) {
    return <EmptyHistory />;
  }

  return (
    <div>
      {sorted.map((event, index) => (
        <HistoryEvent key={index} event={event} isLatest={index === 0} />
      ))}
    </div>
  );
};

export default TicketHistoryList;
