import { Ticket, CircleDot, Hourglass, Clock, Check, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../../../components/StatusBadge.jsx';
import { Button } from '../../../components/Button.jsx';
import { PipelineStepper } from '../../../../roles/vendor/features/tickets/components/PipelineStepper.jsx';
import { formatTicketNo } from '../../../utils/ticket.js';

/**
 * Department-specific Dashboard configuration.
 *
 * Encapsulates all differences between Department and other roles:
 * - 7 metric cards (no SLA overdue)
 * - Status + Category filters
 * - Pipeline column in table
 * - View-only row actions (no Feedback, no Assign)
 * - No toolbar actions
 * - No extra UI sections
 * - Container: max-w-[1200px] mx-auto px-6 py-8
 */
export const departmentConfig = {
  roleId: 'department',
  roleValues: ['BL1', 'HOD', 'VH', 'MD'],
  pageTitle: 'My Department Tickets',
  containerClassName: 'max-w-[1200px] mx-auto px-6 py-8',

  // ─── Use tickets.length for total (not countData) ───
  useCountDataTotal: false,

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
  getColumns: (navigate) => [
    {
      key: 'ticketNo',
      header: 'Ticket #',
      width: '150px',
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
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    // {
    //   key: 'pipeline',
    //   header: 'Pipeline',
    //   width: '120px',
    //   render: (row) => (
    //     <PipelineStepper status={row.status} />
    //   ),
    // },
    {
      key: 'createAt',
      header: 'Created',
      width: '130px',
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
      width: '100px',
      render: (row) => (
        <Button variant='ghost' size='sm' onClick={() => navigate(`/department/ticket/${row.id}`, {
          state: {
            visibleCommentButton: row.visibleCommentButton,
            visibleAssignButton: row.visibleAssignButton,
            visibleFeedbackButton: row.visibleFeedbackButton,
          }
        })}>
          👁 View
        </Button>
      ),
    },
  ],

  // ─── No toolbar actions (Department is view-only) ───
  getToolbarActions: () => [],

  // ─── No row action modals ───
  RowActionModals: null,
};
