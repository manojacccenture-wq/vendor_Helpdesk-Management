import React from 'react';
import { StatusBadge } from './StatusBadge.jsx';
import { PipelineStepper } from './PipelineStepper.jsx';

const TICKET_DATA = [];

export const TicketsTable = () => {
  return (
    <div className="w-full bg-white border border-[#E2E8F0] rounded-[8px] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="border-b border-[#E2E8F0] bg-[#F8FAFC]">
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Ticket #</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B]">Subject</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[220px]">Category</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Status</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Pipeline</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[120px]">Created</th>
              <th className="py-4 px-6 text-[13px] font-[600] text-[#64748B] w-[140px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {TICKET_DATA.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <span className="text-[14px] font-[500] text-[#64748B]">No tickets found.</span>
                </td>
              </tr>
            ) : (
              TICKET_DATA.map((ticket, idx) => (
                <tr key={ticket.id} className="hover:bg-[#F8FAFC]/50 transition-colors">
                  <td className="py-4 px-6">
                    <span className="text-[13px] font-[500] text-[#64748B]">{ticket.id}</span>
                  </td>
                  <td className="py-4 px-6 pr-12">
                    <span className="text-[14px] font-[500] text-[#334155] leading-snug block">
                      {ticket.subject}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="inline-block px-3 py-1 bg-[#F1F5F9] text-[#64748B] text-[12px] font-[500] rounded-full whitespace-nowrap">
                      {ticket.category}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <StatusBadge status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    <PipelineStepper currentStep={ticket.pipelineStep} status={ticket.status} />
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-[13px] text-[#64748B] whitespace-nowrap">{ticket.created}</span>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <button className="text-[13px] font-[600] text-[#1E293B] hover:underline">
                        View
                      </button>
                      {ticket.hasFeedback && (
                        <button className="px-3 py-1 bg-[#D97706] text-white text-[12px] font-[500] rounded-[4px] hover:bg-[#B45309] transition-colors">
                          Feedback
                        </button>
                      )}
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
