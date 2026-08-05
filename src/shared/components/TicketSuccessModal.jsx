import React from 'react';
import { CheckCircle } from 'lucide-react';
import { Button } from './Button.jsx';

/**
 * Success modal displayed after a ticket is created successfully.
 * Shows the ticket number and provides navigation to view tickets.
 */
export const TicketSuccessModal = ({ 
  isOpen, 
  ticketNo, 
  onViewTickets 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={(e) => e.stopPropagation()}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        
        {/* Green Header */}
        <div className="bg-[#22C55E] px-8 py-8 flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-4">
            <CheckCircle className="w-10 h-10 text-[#22C55E]" strokeWidth={2.5} />
          </div>
          <h2 className="text-white text-[20px] font-[600] text-center">
            Ticket Created Successfully!
          </h2>
        </div>

        {/* Body */}
        <div className="px-8 py-8 flex flex-col items-center text-center">
          
          {/* Ticket Label */}
          <p className="text-[14px] text-[#64748B] mb-2">
            Ticket No:
          </p>
          
          {/* Ticket Number */}
          <p className="text-[28px] font-[700] text-[#2563EB] mb-6">
            {ticketNo || 'N/A'}
          </p>
          
          {/* Description */}
          <p className="text-[14px] text-[#64748B] mb-2">
            Your ticket has been created and will be reviewed shortly.
          </p>
          <p className="text-[14px] text-[#64748B] mb-8">
            You will receive email and SMS notifications.
          </p>
          
          {/* Action Button */}
          <Button
            onClick={onViewTickets}
            className="px-8 py-3 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-[600] rounded-lg"
          >
            VIEW MY TICKETS
          </Button>
          
        </div>
      </div>
    </div>
  );
};
