import React from 'react';
import { HelpdeskStatusBadge } from './HelpdeskStatusBadge.jsx';
import { HelpdeskPriorityBadge } from './HelpdeskPriorityBadge.jsx';

// Static demo data matching the image
const demoTickets = [
  {
    id: 1,
    ticketNo: 'TKT2026000001',
    vendor: 'ABC Suppliers Pvt Ltd',
    subject: 'Payment not received for Invoice INV-2026-001',
    priority: 'High',
    isOverdue: true,
    status: 'In Progress',
    department: 'Finance',
    assignedTo: 'Sarah Department',
  },
  {
    id: 2,
    ticketNo: 'TKT2026000002',
    vendor: 'XYZ Enterprises Ltd',
    subject: 'PO not received for quotation QT-2026-045',
    priority: 'Medium',
    isOverdue: false,
    status: 'Open',
    department: null,
    assignedTo: null,
  },
  {
    id: 3,
    ticketNo: 'TKT2026000003',
    vendor: 'Global Traders Inc',
    subject: 'Unable to login to vendor portal',
    priority: 'Escalate',
    isOverdue: true,
    status: 'In Progress',
    department: 'IT',
    assignedTo: 'Mike Support',
  },
  {
    id: 4,
    ticketNo: 'TKT2026000004',
    vendor: 'ABC Suppliers Pvt Ltd',
    subject: 'IR quantity mismatch for GRN-2026-789',
    priority: 'High',
    isOverdue: true,
    status: 'On Hold',
    department: 'Operations',
    assignedTo: 'Sarah Department',
  },
  {
    id: 5,
    ticketNo: 'TKT2026000005',
    vendor: 'Prime Vendors Co',
    subject: 'GST number mismatch in invoice',
    priority: 'Low',
    isOverdue: false,
    status: 'Resolved',
    department: 'Finance',
    assignedTo: 'Sarah Department',
  },
  {
    id: 6,
    ticketNo: 'TKT2026000006',
    vendor: 'Tech Solutions Pvt Ltd',
    subject: 'Update bank account details',
    priority: 'Medium',
    isOverdue: false,
    status: 'Closed',
    department: 'Finance',
    assignedTo: 'John Helpdesk',
  },
  {
    id: 7,
    ticketNo: 'TKT2026000007',
    vendor: 'XYZ Enterprises Ltd',
    subject: 'Delivery date extension request',
    priority: 'Medium',
    isOverdue: false,
    status: 'In Progress',
    department: 'Purchase',
    assignedTo: 'Sarah Department',
  },
  {
    id: 8,
    ticketNo: 'TKT2026000008',
    vendor: 'Global Traders Inc',
    subject: 'Incorrect TDS deduction in payment',
    priority: 'High',
    isOverdue: true,
    status: 'In Progress',
    department: 'Finance',
    assignedTo: 'Sarah Department',
  },
];

export const HelpdeskTicketsTable = ({ searchTerm, statusFilter, priorityFilter }) => {
  // Filter tickets based on search and filters
  const filteredTickets = demoTickets.filter(ticket => {
    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = 
        ticket.ticketNo?.toLowerCase().includes(lowerSearch) ||
        ticket.vendor?.toLowerCase().includes(lowerSearch) ||
        ticket.subject?.toLowerCase().includes(lowerSearch);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (statusFilter && statusFilter !== 'all') {
      if (ticket.status?.toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }
    }

    // Priority filter
    if (priorityFilter && priorityFilter !== 'all') {
      if (ticket.priority?.toLowerCase() !== priorityFilter.toLowerCase()) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Ticket #</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Vendor</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Subject</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[160px]">Priority</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Status</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Department</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Assigned</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {filteredTickets.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">No tickets found.</span>
                </td>
              </tr>
            ) : (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[13px] font-[500] text-[#64748B]">{ticket.ticketNo}</span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[14px] font-[500] text-[#334155]">
                      {ticket.vendor}
                    </span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="text-[14px] font-[500] text-[#334155] leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <HelpdeskPriorityBadge priority={ticket.priority} isOverdue={ticket.isOverdue} />
                  </td>
                  <td className="py-4 px-6">
                    <HelpdeskStatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    {ticket.department ? (
                      <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-[12px] font-[500] rounded-full whitespace-nowrap">
                        {ticket.department}
                      </span>
                    ) : (
                      <span className="text-[13px] text-[#64748B]">—</span>
                    )}
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[13px] text-[#64748B]">
                      {ticket.assignedTo || '—'}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button className="text-[13px] font-[500] text-[#1E293B] border border-[#E2E8F0] px-4 py-2 rounded-[6px] hover:bg-[#F8FAFC] transition-colors">
                        View
                      </button>
                      <button className="text-[13px] font-[500] text-white bg-[#1E293B] px-4 py-2 rounded-[6px] hover:bg-[#334155] transition-colors">
                        Assign
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
