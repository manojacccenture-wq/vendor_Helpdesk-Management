import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../../components/StatusBadge.jsx';
import { Button } from '../../../components/Button.jsx';
import { PipelineStepper } from '../../../../roles/vendor/features/tickets/components/PipelineStepper.jsx';
import { VendorTabs } from '../../../../roles/vendor/features/dashboard/components/VendorTabs.jsx';
import { TicketFeedbackModal } from '../../../components/TicketFeedbackModal.jsx';
import { formatTicketNo } from '../../../utils/ticket.js';

/**
 * Vendor-specific Dashboard configuration.
 *
 * Encapsulates all differences between Vendor and other roles:
 * - 7 metric cards (no SLA overdue)
 * - Status + Category filters
 * - Pipeline column in table
 * - View + Feedback row actions
 * - "Raise Ticket" toolbar action
 * - VendorTabs navigation
 * - TicketFeedbackModal
 *
 * The `total` count uses countData?.total when available (Vendor-specific behavior).
 */
export const vendorConfig = {
  roleId: 'vendor',
  roleValues: ['L1'],
  pageTitle: 'My Tickets',
  containerClassName: 'py-8',

  // ─── Use countData.total for the "Total tickets" card ───
  // Vendor DashboardMetrics originally used: countData?.total ?? countData?.totalCount ?? tickets.length
  // Other roles used: tickets.length
  useCountDataTotal: true,

  // ─── Metric Cards ───
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
  filterTypes: ['status', 'category'],

  // ─── Table Columns ───
  getColumns: (navigate, { onFeedbackClick }) => [
    {
      key: 'ticketNo',
      header: 'Ticket #',
      width: '150px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <code className='text-secondary text-sm'>{formatTicketNo(row.ticketNo)}</code>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      flex: 1,
      truncate: true,
      render: (row) => (
        <span className='text-primary-hover leading-snug block' title={row.subject}>
          {row.subject}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '180px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <small className='inline-block px-3 py-1 bg-surface-active text-secondary rounded-full whitespace-nowrap'>
          {row.category}
        </small>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '110px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: 'pipeline',
      header: 'Pipeline',
      width: '120px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <PipelineStepper status={row.status} />
      ),
    },
    {
      key: 'createAt',
      header: 'Created',
      width: '130px',
      nowrap: true,
      truncate: false,
      align: 'center',
      render: (row) => (
        <small className='text-secondary whitespace-nowrap'>
          {row.createAt ? new Date(row.createAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
        </small>
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      width: '180px',
      nowrap: true,
      truncate: false,
      render: (row) => (
        <div className='flex items-center gap-2'>
          <Button
            variant='ghost'
            size='sm'
            onClick={() => navigate(`/vendor/ticket/${row.id}`, {
              state: {
                visibleCommentButton: row.visibleCommentButton,
                visibleAssignButton: row.visibleAssignButton,
                visibleFeedbackButton: row.visibleFeedbackButton,
              }
            })}
          >
            👁 View
          </Button>
          {Boolean(row.visibleFeedbackButton) && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => onFeedbackClick(row)}
            >
              ★ Feedback
            </Button>
          )}
        </div>
      ),
    },
  ],

  // ─── Toolbar Actions ───
  getToolbarActions: (navigate) => [
    {
      label: '+ Raise ticket',
      onClick: () => navigate('/vendor/create'),
      variant: 'primary',
      className: 'bg-primary',
    },
  ],

  // ─── Extra UI: renders above the page title ───
  beforeTitle: () => <VendorTabs />,

  // ─── Row action modals ───
  RowActionModals: TicketFeedbackModal,
};
