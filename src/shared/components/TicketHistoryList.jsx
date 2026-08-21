import { useMemo, useState, useCallback } from 'react';
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
  ArrowRight,
  MessageSquare,
} from 'lucide-react';
import { formatDate } from '../utils/date.js';
import { cn } from '../utils/cn.js';
import { TruncatedText } from './TruncatedText.jsx';

// ─── Event Configuration ───

const DEFAULT_EVENT_STYLE = {
  icon: Clock,
  colorClass: 'text-secondary',
  stageColor: 'border-l-secondary',
  dotClass: 'bg-secondary',
  badgeBg: 'bg-surface-active',
};

const EVENT_CONFIG = {
  'ticket created': {
    icon: PlusCircle,
    colorClass: 'text-success',
    stageColor: 'border-l-success',
    dotClass: 'bg-success',
    badgeBg: 'bg-success-soft',
  },
  'status changed': {
    icon: RefreshCw,
    colorClass: 'text-info',
    stageColor: 'border-l-info',
    dotClass: 'bg-info',
    badgeBg: 'bg-info-soft',
  },
  'ticket assigned': {
    icon: UserPlus,
    colorClass: 'text-warning',
    stageColor: 'border-l-warning',
    dotClass: 'bg-warning',
    badgeBg: 'bg-warning-soft',
  },
  'ticket reopened': {
    icon: RotateCcw,
    colorClass: 'text-purple',
    stageColor: 'border-l-accent',
    dotClass: 'bg-accent',
    badgeBg: 'bg-accent-soft',
  },
  'ticket closed': {
    icon: CheckCircle,
    colorClass: 'text-success',
    stageColor: 'border-l-success',
    dotClass: 'bg-success',
    badgeBg: 'bg-success-soft',
  },
  'escalated': {
    icon: AlertTriangle,
    colorClass: 'text-danger',
    stageColor: 'border-l-danger',
    dotClass: 'bg-danger',
    badgeBg: 'bg-danger-soft',
  },
};

const getEventConfig = (title) => {
  const key = (title || '').toLowerCase().trim();
  return EVENT_CONFIG[key] || DEFAULT_EVENT_STYLE;
};

/**
 * Determine if an event represents a completed lifecycle state.
 * Uses event title and status transition data from the existing API response.
 */
function isCompletedEvent(event) {
  const title = (event.title || '').toLowerCase().trim();
  if (title === 'ticket closed') return true;
  const transition = parseStatusTransition(event.description);
  if (transition) {
    const target = transition.to.toLowerCase();
    if (target === 'closed' || target === 'resolved') return true;
  }
  return false;
}

/**
 * Find the event that represents the current pending/workflow state.
 * Determined by the most recent changedAt timestamp among events
 * that have pendingWith metadata — data-driven, not positional.
 */
function findCurrentPendingEvent(events) {
  let candidate = null;
  for (const event of events) {
    if (event.metadata?.pendingWithUser || event.metadata?.pendingWithRole) {
      if (!candidate || new Date(event.changedAt) > new Date(candidate.changedAt)) {
        candidate = event;
      }
    }
  }
  return candidate;
}

// ─── Stage Configuration ───

const STAGE_CONFIG = {
  helpdesk: { icon: Users, label: 'Helpdesk', color: 'text-info', bg: 'bg-info-soft', border: 'border-info/30' },
  department: { icon: Building2, label: 'Department', color: 'text-warning', bg: 'bg-warning-soft', border: 'border-warning/30' },
  vendor: { icon: Truck, label: 'Vendor', color: 'text-success', bg: 'bg-success-soft', border: 'border-success/30' },
};

const getStageConfig = (stageName) => {
  if (!stageName) {
    return { icon: Zap, label: 'Activity', color: 'text-secondary', bg: 'bg-surface-active', border: 'border-default' };
  }
  const key = stageName.toLowerCase().trim();
  return STAGE_CONFIG[key] || { icon: History, label: stageName, color: 'text-secondary', bg: 'bg-surface-active', border: 'border-default' };
};

// ─── Status Transition Parser ───

/**
 * Parse a description string like "Status changed from 'In Progress' to 'Resolved'"
 * into { from: 'In Progress', to: 'Resolved' }.
 * Returns null if not a status change description.
 */
function parseStatusTransition(description) {
  if (!description) return null;
  const match = description.match(/(?:status\s+changed\s+)?from\s+['"](.+?)['"]\s+to\s+['"](.+?)['"]/i);
  if (match) {
    return { from: match[1], to: match[2] };
  }
  return null;
}

// ─── Pending With Banner ───

/**
 * PendingWithBanner — Sticky banner showing who the ticket is currently pending with.
 * Extracted from the latest event's metadata.
 */
const PendingWithBanner = ({ pendingWithUser, pendingWithRole }) => {
  if (!pendingWithUser && !pendingWithRole) return null;

  const displayName = pendingWithUser || pendingWithRole;
  const roleText = pendingWithUser && pendingWithRole ? ` (${pendingWithRole})` : '';

  return (
    <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg bg-info-soft/40 border border-info/20 mb-5">
      <Clock className="w-4 h-4 text-info shrink-0" />
      <span className="text-caption text-secondary">Pending with</span>
      <span className="text-caption font-semibold text-primary">
        {displayName}{roleText}
      </span>
    </div>
  );
};

// ─── Stage Divider ───

/**
 * StageDivider — Visual separator between stage groups in the timeline.
 * Shows the stage name with an icon and event count.
 */
const StageDivider = ({ stage, eventCount, isExpanded, onClick }) => {
  const config = getStageConfig(stage);
  const StageIcon = config.icon;

  return (
    <div className="flex items-center gap-2.5 py-2 my-1">
      <button 
        type="button"
        onClick={onClick}
        className={cn('flex items-center gap-2 px-3 py-1 rounded-full border hover:bg-surface-hover transition-colors cursor-pointer', config.bg, config.border)}
      >
        <StageIcon className={cn('w-3.5 h-3.5', config.color)} />
        <span className={cn('text-caption font-semibold', config.color)}>{config.label}</span>
        <span className="text-caption text-secondary">({eventCount})</span>
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform duration-200', config.color, isExpanded ? 'rotate-180' : '')} />
      </button>
      <div className="flex-1 h-px bg-default" />
    </div>
  );
};

// ─── Status Transition Badge ───

/**
 * StatusTransition — Visual before→after badge for status changes.
 */
const StatusTransition = ({ from, to }) => (
  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
    <span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-medium bg-surface-active text-secondary border border-default">
      {from}
    </span>
    <ArrowRight className="w-3 h-3 text-secondary shrink-0" />
    <span className="inline-flex items-center px-2 py-0.5 rounded text-caption font-medium bg-info-soft text-info border border-info/20">
      {to}
    </span>
  </div>
);

// ─── Timeline Event ───

/**
 * TimelineEvent — A single event in the unified timeline.
 * Compact by default, expandable for remarks and full details.
 */
const TimelineEvent = ({ event, isLatest, isCurrentPending = false }) => {
  const [isExpanded, setIsExpanded] = useState(isLatest);
  const { icon: Icon, colorClass, badgeBg } = getEventConfig(event.title);
  const transition = parseStatusTransition(event.description);
  const completed = isCompletedEvent(event);
  const hasRemarks = !!event.remarks;
  const hasDetails = hasRemarks || event.description;

  const toggleExpand = useCallback(() => {
    if (hasDetails) setIsExpanded(prev => !prev);
  }, [hasDetails]);

  return (
    <div className={cn('flex gap-3 group', isLatest && 'mb-1')}>
      {/* Timeline dot + line */}
      <div className="flex flex-col items-center shrink-0 pt-3">
        <span
          className={cn(
            'w-2.5 h-2.5 rounded-full shrink-0 z-10',
            'transition-transform duration-150 group-hover:scale-125',
            cn(
              isCurrentPending && 'ring-4 ring-warning/20',
              isCurrentPending ? 'bg-warning' : 'bg-success'
            )
          )}
        />
        <div className="w-px flex-1 bg-default my-0.5" />
      </div>

      {/* Event card */}
      <div
        className={cn(
          'flex-1 min-w-0 mb-2 p-3 rounded-lg border transition-all duration-150',
          isLatest
            ? 'bg-info-soft/30 border-info/20 shadow-sm'
            : 'bg-surface-hover border-default hover:shadow-sm',
          hasDetails && 'cursor-pointer'
        )}
        onClick={toggleExpand}
        role={hasDetails ? 'button' : undefined}
        tabIndex={hasDetails ? 0 : undefined}
        onKeyDown={hasDetails ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleExpand();
          }
        } : undefined}
      >
        {/* Header: Icon + Title + Timestamp */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className={cn(
                'inline-flex items-center justify-center shrink-0',
                'w-7 h-7 rounded-full',
                badgeBg
              )}
            >
              <Icon className={cn('w-3.5 h-3.5', colorClass)} />
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <TruncatedText as="span" className="text-body font-semibold text-primary">
                  {event.title}
                </TruncatedText>
                {isLatest && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-info text-white shrink-0">
                    Latest
                  </span>
                )}
              </div>
              {/* Status Transition or Description preview */}
              {transition ? (
                <StatusTransition from={transition.from} to={transition.to} />
              ) : (
                !isExpanded && event.description && (
                  <TruncatedText as="p" className="text-caption text-secondary mt-0.5">
                    {event.description}
                  </TruncatedText>
                )
              )}
            </div>
          </div>
          <span className="text-caption text-secondary whitespace-nowrap shrink-0 mt-0.5">
            {formatDate(event.changedAt)}
          </span>
        </div>

        {/* Actor + Pending With — always visible */}
        <div className="flex items-center gap-3 mt-2 pl-9 flex-wrap">
          <div className="flex items-center gap-1 min-w-0">
            <span className="text-caption text-muted shrink-0">By</span>
            <TruncatedText className="text-caption font-medium text-primary">
              {event.changedBy || 'System'}
            </TruncatedText>
          </div>
          {(event.metadata?.pendingWithUser || event.metadata?.pendingWithRole) && (
            <div className="flex items-center gap-1 min-w-0">
              <span className="text-caption text-muted shrink-0">→</span>
              <TruncatedText className="text-caption text-secondary">
                {event.metadata.pendingWithUser || event.metadata.pendingWithRole}
                {event.metadata.pendingWithUser && event.metadata.pendingWithRole
                  ? ` (${event.metadata.pendingWithRole})`
                  : ''}
              </TruncatedText>
            </div>
          )}
        </div>

        {/* Expanded: Description (if not status change) + Remarks */}
        {isExpanded && (
          <div className="mt-2 pl-9 space-y-1.5">
            {/* Description (for non-status-change events) */}
            {event.description && !transition && (
              <TruncatedText as="p" className="text-caption text-secondary">
                {event.description}
              </TruncatedText>
            )}

            {/* Remarks */}
            {hasRemarks && (
              <div className="flex items-start gap-1.5 p-2 bg-surface-active/60 rounded-md border border-default">
                <MessageSquare className="w-3 h-3 text-secondary shrink-0 mt-0.5" />
                <TruncatedText as="span" className="text-caption text-secondary">
                  {event.remarks}
                </TruncatedText>
              </div>
            )}
          </div>
        )}

        {/* Expand indicator */}
        {hasDetails && !isExpanded && (
          <div className="flex items-center gap-1 mt-1.5 pl-9">
            <ChevronRight className="w-3 h-3 text-muted" />
            <span className="text-caption text-muted">Show details</span>
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

// ─── Unified Timeline ───

/**
 * TicketHistoryList — Unified vertical timeline for ticket history.
 *
 * Flattens all stages into a single chronological timeline (newest first).
 * Stage names appear as visual dividers between event groups.
 * The latest event is highlighted at the top.
 * A "Pending With" banner shows the current assignee.
 *
 * @param {Object} props
 * @param {Array} props.stages - Array of { stage, histories[] } from ticketHistoryStages
 */
export const TicketHistoryList = ({ stages = [] }) => {
  // Flatten, sort, and enrich all events
  const { flattenedEvents, latestEvent, pendingWith, currentPendingEvent } = useMemo(() => {
    // Flatten all stages into a single array, tagging each event with its stage
    const allEvents = [];
    for (const stageData of stages) {
      if (!stageData.histories || stageData.histories.length === 0) continue;
      for (const event of stageData.histories) {
        allEvents.push({
          ...event,
          _stage: stageData.stage,
        });
      }
    }

    // Sort by changedAt descending (newest first)
    allEvents.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));

    // Find the latest event
    const latest = allEvents.length > 0 ? allEvents[0] : null;

    // Extract pending-with from the latest event's metadata
    const pending = latest?.metadata
      ? { user: latest.metadata.pendingWithUser, role: latest.metadata.pendingWithRole }
      : null;

    // Find the current pending event (most recent event with pendingWith metadata)
    const currentPending = findCurrentPendingEvent(allEvents);

    return {
      flattenedEvents: allEvents,
      latestEvent: latest,
      pendingWith: pending,
      currentPendingEvent: currentPending,
    };
  }, [stages]);

  // Group consecutive events by stage for dividers
  const groupedEvents = useMemo(() => {
    const groups = [];
    let currentStage = null;
    let groupCounter = 0;

    for (const event of flattenedEvents) {
      if (groups.length === 0 || event._stage !== currentStage) {
        currentStage = event._stage;
        groups.push({ id: `group-${groupCounter++}-${event.changedAt}`, stage: currentStage, events: [] });
      }
      groups[groups.length - 1].events.push(event);
    }

    return groups;
  }, [flattenedEvents]);

  const totalCount = flattenedEvents.length;

  const [expandedGroups, setExpandedGroups] = useState({});

  const toggleGroup = useCallback((groupId, defaultExpanded) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupId]: prev[groupId] !== undefined ? !prev[groupId] : !defaultExpanded
    }));
  }, []);

  if (totalCount === 0) {
    return <EmptyHistory />;
  }

  return (
    <div>
      {/* Pending With Banner */}
      {pendingWith && (
        <PendingWithBanner
          pendingWithUser={pendingWith.user}
          pendingWithRole={pendingWith.role}
        />
      )}

      {/* Unified Timeline */}
      <div className="relative">
        {groupedEvents.map((group, groupIndex) => {
          const defaultExpanded = groupIndex === 0;
          const isExpanded = expandedGroups[group.id] ?? defaultExpanded;
          return (
            <div key={group.id}>
              {/* Stage Divider */}
              <StageDivider 
                stage={group.stage} 
                eventCount={group.events.length} 
                isExpanded={isExpanded}
                onClick={() => toggleGroup(group.id, defaultExpanded)}
              />

              {/* Events in this stage */}
              {isExpanded && group.events.map((event, eventIndex) => {
                const isLatest = event === latestEvent;
                const isCurrentPending = event === currentPendingEvent;
                return (
                  <TimelineEvent
                    key={`${group.stage}-${eventIndex}`}
                    event={event}
                    isLatest={isLatest}
                    isCurrentPending={isCurrentPending}
                  />
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TicketHistoryList;
