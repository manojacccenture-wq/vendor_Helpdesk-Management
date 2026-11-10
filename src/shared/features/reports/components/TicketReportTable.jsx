import { useMemo } from 'react';
import { Table } from '../../../../shared/components/Table.jsx';
import { Pagination } from '../../../../shared/components/Pagination.jsx';
import { StatusBadge } from '../../../../shared/components/StatusBadge.jsx';
import { usePagination } from '../../../../shared/hooks/usePagination.js';
import { formatTicketNo } from '../../../../shared/utils/ticket.js';
import { formatDate } from '../../../../shared/utils/date.js';

/**
 * Priority pill style helper based on design tokens.
 */
const getPriorityBadgeClass = (priority) => {
  const norm = String(priority || '').toLowerCase();
  switch (norm) {
    case 'critical':
      return 'bg-priority-escalate text-priority-escalate-text';
    case 'high':
      return 'bg-priority-high text-priority-high-text';
    case 'medium':
      return 'bg-priority-medium text-priority-medium-text';
    case 'low':
      return 'bg-priority-low text-priority-low-text';
    default:
      return 'bg-surface-active text-secondary';
  }
};

/**
 * SLA Status badge style helper.
 */
const getSlaBadgeClass = (slaStatus) => {
  const norm = String(slaStatus || '').toLowerCase();
  if (norm.includes('within') || norm.includes('met') || norm.includes('ok')) {
    return 'bg-success-soft text-success border border-success/20';
  }
  if (norm.includes('breach') || norm.includes('overdue') || norm.includes('escalat')) {
    return 'bg-danger-soft text-danger border border-danger/20';
  }
  return 'bg-info-soft text-info border border-info/20';
};

/**
 * TicketReportTable — Tabular report view for ticket records.
 *
 * @param {Object} props
 * @param {Array} props.data - Array of ticket report records from API
 * @param {boolean} [props.isLoading=false] - Whether data is loading
 * @param {string} [props.emptyMessage='No ticket records found.'] - Empty state message
 */
export const TicketReportTable = ({
  data = [],
  isLoading = false,
  emptyMessage = 'No ticket records found for the selected date range.',
}) => {
  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    nextPage,
    prevPage,
    setItemsPerPage,
  } = usePagination(data, 10);

  const columns = useMemo(() => [
    {
      key: 'ticketNo',
      header: 'Ticket #',
      width: '140px',
      render: (row) => (
        <code className="text-secondary text-sm font-mono font-medium">
          #{formatTicketNo(row.ticketNo)}
        </code>
      ),
    },
    {
      key: 'ticketDateTime',
      header: 'Date',
      width: '120px',
      render: (row) => {
        if (!row.ticketDateTime) return <span className="text-muted">—</span>;
        const formatted = formatDate(row.ticketDateTime);
        const dateOnly = formatted ? formatted.split(',')[0] : row.ticketDateTime.slice(0, 10);
        return <span className="text-secondary text-sm whitespace-nowrap">{dateOnly}</span>;
      },
    },
    {
      key: 'subject',
      header: 'Subject',
      flex: 1,
      truncate: true,
      render: (row) => (
        <span className="text-primary font-medium block truncate max-w-xs" title={row.subject}>
          {row.subject || '—'}
        </span>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      width: '180px',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="inline-block px-2.5 py-0.5 bg-surface-active text-secondary rounded-full text-xs font-medium whitespace-nowrap w-fit">
            {row.category || 'General'}
          </span>
          {row.subCategory && (
            <span className="text-xs text-muted truncate max-w-[160px]" title={row.subCategory}>
              {row.subCategory}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'contactPerson',
      header: 'Contact / Vendor',
      width: '160px',
      render: (row) => (
        <div className="text-sm">
          <span className="text-primary block font-medium truncate max-w-[150px]" title={row.vendorName || row.contactPerson || row.vendorCode}>
            {row.vendorName || row.contactPerson || row.vendorCode || '—'}
          </span>
          {row.emailId && (
            <span className="text-xs text-muted block truncate max-w-[150px]" title={row.emailId}>
              {row.emailId}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'assignedDepartment',
      header: 'Assigned Dept',
      width: '160px',
      render: (row) => (
        <div>
          <span className="text-primary text-sm block truncate max-w-[150px]" title={row.assignedDepartment}>
            {row.assignedDepartment || '—'}
          </span>
          {row.assignedExecutive && (
            <span className="text-xs text-secondary font-mono block">
              {row.assignedExecutive}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      width: '110px',
      render: (row) => {
        if (!row.priority) return <span className="text-muted">—</span>;
        return (
          <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold tracking-wide uppercase ${getPriorityBadgeClass(row.priority)}`}>
            {row.priority}
          </span>
        );
      },
    },
    {
      key: 'currentStatus',
      header: 'Status',
      width: '120px',
      render: (row) => <StatusBadge status={row.currentStatus} />,
    },
    {
      key: 'slaStatus',
      header: 'SLA Status',
      width: '120px',
      render: (row) => {
        if (!row.slaStatus) return <span className="text-muted">—</span>;
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${getSlaBadgeClass(row.slaStatus)}`}>
            {row.slaStatus}
          </span>
        );
      },
    },
    {
      key: 'openAgingDays',
      header: 'Aging',
      width: '90px',
      align: 'center',
      render: (row) => (
        <span className="px-2 py-0.5 bg-surface-active text-secondary rounded text-xs font-medium">
          {row.openAgingDays != null ? `${row.openAgingDays}d` : '—'}
        </span>
      ),
    },
    {
      key: 'invoiceNo',
      header: 'Invoice / PO',
      width: '130px',
      render: (row) => {
        const hasInv = row.invoiceNo && row.invoiceNo !== 'string';
        const hasPO = row.relatedPONo && row.relatedPONo !== 'string';
        if (!hasInv && !hasPO) return <span className="text-muted">—</span>;
        return (
          <div className="text-xs text-secondary space-y-0.5">
            {hasInv && <div>Inv: <span className="font-mono text-primary">{row.invoiceNo}</span></div>}
            {hasPO && <div>PO: <span className="font-mono text-primary">{row.relatedPONo}</span></div>}
          </div>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        data={paginatedData}
        rowKey={(row, index) => row.ticketNo || index}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
      />

      {!isLoading && data.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onNext={nextPage}
          onPrev={prevPage}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      )}
    </div>
  );
};

export default TicketReportTable;

