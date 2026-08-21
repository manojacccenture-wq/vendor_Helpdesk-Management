import { useState } from 'react';
import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { StatusBadge } from '../../../components/StatusBadge.jsx';
import { HelpdeskPriorityBadge } from '../../../../roles/helpdesk/features/tickets/components/HelpdeskPriorityBadge.jsx';
import { Button } from '../../../components/Button.jsx';
import { AssignTicketModal } from '../../../components/AssignTicketModal.jsx';
import { useGetDepartmentsQuery, useAssignTicketMutation } from '../../../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../features/user/store/selectors.js';
import { useNotification } from '../../../notifications/index.js';
import { sendNotification, NOTIFICATION_TYPES } from '../../../services/emailNotifications.js';
import { formatDate } from '../../../utils/date.js';
import { formatTicketNo } from '../../../utils/ticket.js';

/**
 * Helpdesk-specific Dashboard configuration.
 *
 * Encapsulates all differences between Helpdesk and other roles:
 * - 8 metric cards (includes SLA overdue)
 * - Status + Priority filters
 * - Priority column with HelpdeskPriorityBadge
 * - View + Assign row actions (Assign only when status === 'open')
 * - AssignTicketModal with full assign logic
 * - No Pipeline column, no Category filter
 * - Status option values coerced to String (HelpdeskToolbar behavior)
 */

/**
 * HelpdeskMetricsValue — resolves the "Total tickets" count value.
 * Helpdesk uses tickets.length (not countData.total like Vendor).
 */
const resolveTotalValue = (counts, _countData) => counts.total;

/**
 * HelpdeskExtraMetricCards — additional metric cards beyond the standard 6 statuses.
 * Returns the SLA overdue card configuration.
 */
const getExtraMetricCards = () => [
  {
    label: 'SLA overdue',
    key: 'slaOverdue',
    icon: AlertTriangle,
    iconBg: 'bg-surface/50',
    iconColor: 'text-warning',
    valueColor: 'text-warning',
    labelColor: 'text-warning',
    cardClassName: 'bg-warning-soft',
  },
];

/**
 * Resolve the value for extra metric cards.
 */
const resolveExtraMetricValue = (card, counts, countData) => {
  if (card.key === 'slaOverdue') {
    return countData?.slaOverdue ?? countData?.overdue;
  }
  return counts[card.key] ?? 0;
};

// ─── Assign Modal Component (self-contained for Helpdesk) ───
const HelpdeskAssignModal = ({ isOpen, ticket, onClose, profile, role }) => {
  const { showSuccess, showError } = useNotification();
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();
  const { data: departments = [] } = useGetDepartmentsQuery(
    { role, userCode: profile?.userCode },
    { skip: !profile?.userCode || !role }
  );

  const handleAssign = async (assignmentData) => {
    try {
      const extractedCode = assignmentData.agent?.match(/\(([^)]+)\)/)?.[1] || assignmentData.agent;

      const response = await assignTicket({
        ticketId: parseInt(assignmentData.ticketId, 10),
        assignedDepartmentId: parseInt(assignmentData.department, 10),
        assignedDeptBL1UserCode: extractedCode,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to assign ticket. Please try again.');
        return;
      }

      showSuccess('Ticket assigned successfully.');

      sendNotification(NOTIFICATION_TYPES.ASSIGNED, {
        ticketNo: ticket?.ticketNo,
        subject: ticket?.subject,
        assignedEmail: assignmentData.agentEmail,
      });

      onClose();
    } catch (error) {
      showError(error?.data?.message || 'Failed to assign ticket. Please try again.');
    }
  };

  return (
    <AssignTicketModal
      isOpen={isOpen}
      ticket={ticket}
      departments={departments}
      onAssign={handleAssign}
      onCancel={onClose}
      isSubmitting={isAssigning}
    />
  );
};

export const helpdeskConfig = {
  roleId: 'helpdesk',
  roleValues: ['L2', 'HelpdeskExecutive'],
  pageTitle: 'All Tickets',
  containerClassName: 'max-w-[1400px] mx-auto px-6 py-8',

  // ─── Use tickets.length for total (not countData) ───
  useCountDataTotal: false,

  // ─── Extra metric cards (beyond the standard 6 statuses) ───
  getExtraMetricCards,
  resolveExtraMetricValue,

  // ─── Metric Cards: standard 6 statuses ───
  metricCards: [
    { label: 'Total tickets', key: 'total', icon: Ticket, iconBg: 'bg-surface-active', iconColor: 'text-primary' },
    { label: 'Open', key: 'open', icon: CircleDot, iconBg: 'bg-info-soft', iconColor: 'text-info' },
    { label: 'In progress', key: 'inProgress', icon: Hourglass, iconBg: 'bg-warning-soft', iconColor: 'text-warning' },
    { label: 'On hold', key: 'onHold', icon: Clock, iconBg: 'bg-secondary-soft', iconColor: 'text-secondary' },
    { label: 'Resolved', key: 'resolved', icon: Check, iconBg: 'bg-success-soft', iconColor: 'text-success' },
    { label: 'Closed', key: 'closed', icon: CheckCircle2, iconBg: 'bg-secondary-soft', iconColor: 'text-secondary' },
    { label: 'Escalated', key: 'escalated', icon: AlertTriangle, iconBg: 'bg-danger-soft', iconColor: 'text-danger' },
  ],

  // ─── Filter Types ───
  filterTypes: ['status', 'priority'],

  // ─── Filter Widths (override defaults when needed) ───
  filterWidths: {
    status: 'sm:min-w-[160px]',
  },

  // ─── Status option value coercion (Helpdesk uses String()) ───
  coerceStatusValues: true,

  // ─── Table Columns ───
  getColumns: (navigate, { onAssignClick }) => [
    {
      key: 'ticketNo',
      header: 'Ticket No',
      width: '160px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <code className='text-secondary text-sm'>{formatTicketNo(row.ticketNo)}</code>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      flex: 0.9,
      truncate: true,
      render: (row) => (
        <span className='text-primary-hover leading-snug block' title={row.subject}>
          {row.subject}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <StatusBadge status={row.status} colorHex={row.statusColorHex} />
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <HelpdeskPriorityBadge priority={row.priority} colorHex={row.priorityColorHex} />
      ),
    },
    {
      key: 'createAt',
      header: 'Created At',
      width: '150px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <small className='text-secondary whitespace-nowrap'>
          {formatDate(row.createAt) || '—'}
        </small>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '130px',
      nowrap: true,
      truncate: false,
      align: 'left',
      render: (row) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate(`/helpdesk/ticket/${row.id}`, {
              state: {
                visibleCommentButton: row.visibleCommentButton,
                visibleAssignButton: row.visibleAssignButton,
                visibleFeedbackButton: row.visibleFeedbackButton,
              }
            })}
          >
            👁 View
          </Button>
          {Boolean(row.visibleAssignButton) && (
            <Button
              variant='black'
              size='sm'
              onClick={() => onAssignClick(row)}
            >
              Assign
            </Button>
          )}
        </div>
      ),
    },
  ],

  // ─── No toolbar actions (Helpdesk has no "Raise Ticket" button) ───
  getToolbarActions: () => [],

  // ─── Row Action Modal: Assign ───
  RowActionModals: HelpdeskAssignModal,
};
