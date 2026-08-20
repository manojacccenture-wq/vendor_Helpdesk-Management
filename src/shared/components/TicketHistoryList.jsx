import { useMemo, useState } from 'react';
import {
  History,
  PlusCircle,
  RefreshCw,
  UserPlus,
  RotateCcw,
  CheckCircle,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronRight,
  Users,
  Building2,
  Truck,
  Zap,
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

// ─── Stage Icon Mapping ───

const STAGE_ICONS = {
  helpdesk: Users,
  department: Building2,
  vendor: Truck,
};

const getStageIcon = (stageName) => {
  const key = (stageName || '').toLowerCase().trim();
  return STAGE_ICONS[key] || History;
};

// ─── Current Activity Card ───

/**
 * CurrentActivityCard — Prominent display of the most recent history event.
 * Always fully expanded, visually distinct from older events.
 */
const CurrentActivityCard = ({ event, stage }) => {
  const { icon: Icon, colorClass, badgeBg } = getEventConfig(event.title);

  return (
    <div className="mb-5">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-2.5">
        <Zap className="w-3.5 h-3.5 text-info" />
        <span className="text-section-label text-secondary uppercase tracking-wide">
          Current Activity
        </span>
        {stage && (
          <span className="text-caption text-muted">· {stage}</span>
        )}
      </div>

      {/* Card */}
      <div
        className={cn(
          'relative p-4 rounded-lg border',
          'bg-info-soft/30 border-info/20',
          'shadow-sm'
        )}
      >
        {/* Left accent bar */}
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg bg-info" />

        <div className="pl-3">
          {/* Header: Icon + Title + Date */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
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
          <div className="flex items-center gap-1.5 mt-2.5 min-w-0 truncate">
            <span className="text-caption text-muted shrink-0">By:</span>
            <TruncatedText className="text-caption font-medium text-primary min-w-0">
              {event.changedBy || 'System'}
            </TruncatedText>
          </div>

          {/* Pending With */}
          {(event.metadata?.pendingWithUser || event.metadata?.pendingWithRole) && (
            <div className="flex items-center gap-1.5 mt-1 min-w-0 truncate">
              <span className="text-caption text-muted shrink-0">Pending with:</span>
              <TruncatedText className="text-caption font-medium text-primary min-w-0">
                {event.metadata.pendingWithUser || event.metadata.pendingWithRole}
                {event.metadata.pendingWithUser && event.metadata.pendingWithRole
                  ? ` (${event.metadata.pendingWithRole})`
                  : ''}
              </TruncatedText>
            </div>
          )}

          {/* Remarks */}
          {event.remarks && (
            <TruncatedText as="div" className="mt-2 p-2 bg-surface-active/60 rounded-md border border-default">
              <span className="text-caption font-semibold text-primary">Remarks: </span>
              <span className="text-caption text-secondary">{event.remarks}</span>
            </TruncatedText>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Single History Event ───

const HistoryEvent = ({ event, isLatest, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
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
          'transition-shadow duration-200 hover:shadow-sm',
          'cursor-pointer'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
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
              {!isExpanded && event.description && (
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

        {/* Expanded content */}
        {isExpanded && (
          <>
            {/* Description */}
            {event.description && (
              <TruncatedText as="p" className="text-caption text-secondary mt-2 pl-10">
                {event.description}
              </TruncatedText>
            )}

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
          </>
        )}
      </div>
    </div>
  );
};

// ─── Stage Section ───

/**
 * StageSection — Renders a single stage (Helpdesk/Department/Vendor)
 * with its header and history events underneath.
 */
const StageSection = ({ stage, histories, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const StageIcon = getStageIcon(stage);

  // Sort histories within stage by changedAt ascending (chronological)
  const sorted = useMemo(
    () => [...histories].sort((a, b) => new Date(a.changedAt) - new Date(b.changedAt)),
    [histories]
  );

  if (sorted.length === 0) return null;

  return (
    <div className="mb-4 last:mb-0">
      {/* Stage Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2.5',
          'bg-surface-hover rounded-lg border border-default',
          'transition-colors duration-150',
          'hover:border-hover cursor-pointer',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          isOpen ? 'rounded-b-none border-b-0' : ''
        )}
      >
        <div className="flex items-center gap-2.5">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-secondary shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-secondary shrink-0" />
          )}
          <StageIcon className="w-4 h-4 text-info shrink-0" />
          <span className="text-body font-semibold text-primary">{stage}</span>
        </div>
        <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-info text-white text-caption font-medium">
          {sorted.length}
        </span>
      </button>

      {/* Stage Content — Histories */}
      {isOpen && (
        <div className="pl-2 pt-2 pb-1 border-l-2 border-default ml-5">
          {sorted.map((event, index) => (
            <HistoryEvent
              key={index}
              event={event}
              isLatest={index === sorted.length - 1}
              defaultExpanded={index === sorted.length - 1}
            />
          ))}
        </div>
      )}
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

// ─── Shared History List (Current Activity + Stage-Based) ───

/**
 * TicketHistoryList — Reusable ticket history timeline renderer.
 *
 * Layout:
 *   1. Current Activity card (global latest event across all stages)
 *   2. History section with stage-based grouped events
 *
 * Used by both the Drawer and the full-screen page.
 *
 * @param {Object} props
 * @param {Array} props.stages - Array of { stage, histories[] } from ticketHistoryStages
 */
export const TicketHistoryList = ({ stages = [] }) => {
  // Filter out stages with no histories
  const activeStages = useMemo(
    () => stages.filter(s => s.histories && s.histories.length > 0),
    [stages]
  );

  // Find the global latest event across all stages and build stages without it
  const { latestEvent, latestStageName, stagesWithoutLatest } = useMemo(() => {
    let latest = null;
    let latestStageIdx = -1;
    let latestHistIdx = -1;

    for (let si = 0; si < activeStages.length; si++) {
      const stage = activeStages[si];
      for (let hi = 0; hi < stage.histories.length; hi++) {
        const h = stage.histories[hi];
        if (!latest || new Date(h.changedAt) > new Date(latest.changedAt)) {
          latest = h;
          latestStageIdx = si;
          latestHistIdx = hi;
        }
      }
    }

    const stagesWithoutLatest = activeStages.map((stage, si) => {
      if (si !== latestStageIdx) return stage;
      return {
        ...stage,
        histories: stage.histories.filter((_, hi) => hi !== latestHistIdx),
      };
    }).filter(s => s.histories.length > 0);

    return {
      latestEvent: latest,
      latestStageName: latestStageIdx >= 0 ? activeStages[latestStageIdx]?.stage : null,
      stagesWithoutLatest,
    };
  }, [activeStages]);

  const hasHistory = stagesWithoutLatest.some(s => s.histories.length > 0) || latestEvent;

  if (!hasHistory) {
    return <EmptyHistory />;
  }

  return (
    <div>
      {/* Current Activity */}
      {latestEvent && (
        <CurrentActivityCard event={latestEvent} stage={latestStageName} />
      )}

      {/* History label */}
      {stagesWithoutLatest.length > 0 && (
        <div className="flex items-center gap-2 mb-3">
          <History className="w-3.5 h-3.5 text-secondary" />
          <span className="text-section-label text-secondary uppercase tracking-wide">
            History
          </span>
        </div>
      )}

      {/* Stage-based history */}
      {stagesWithoutLatest.map((stageData, index) => (
        <StageSection
          key={stageData.stage || index}
          stage={stageData.stage}
          histories={stageData.histories}
          defaultOpen={true}
        />
      ))}
    </div>
  );
};

export default TicketHistoryList;
