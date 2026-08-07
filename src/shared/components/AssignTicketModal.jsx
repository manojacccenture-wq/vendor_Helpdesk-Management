import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Select } from './Select.jsx';
import { Input } from './Input.jsx';
import { Button } from './Button.jsx';

/**
 * Modal for assigning a ticket to a helpdesk agent.
 * Displays ticket details and allows selecting department, assignee, and priority.
 */
export const AssignTicketModal = ({
  isOpen,
  ticket,
  departments = [],
  onAssign,
  onCancel
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [assignTo, setAssignTo] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('high');

  if (!isOpen || !ticket) return null;

  const priorityOptions = [
    { value: 'low', label: 'LOW', bgColor: 'bg-priority-low', textColor: 'text-priority-low-text' },
    { value: 'medium', label: 'MEDIUM', bgColor: 'bg-priority-medium', textColor: 'text-priority-medium-text' },
    { value: 'high', label: 'High', bgColor: 'bg-priority-high', textColor: 'text-priority-high-text' },
    { value: 'escalate', label: 'ESCALATE', bgColor: 'bg-priority-escalate', textColor: 'text-priority-escalate-text' }
  ];

  const handleAssign = () => {
    if (onAssign) {
      onAssign({
        ticketId: ticket.id,
        department: selectedDepartment,
        assignTo,
        priority: selectedPriority
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-primary page-heading">Assign Ticket</h2>
            <span className="px-3 py-1 bg-surface-active text-secondary rounded-full text-sm">
              {ticket.category || 'General'}
            </span>
          </div>

          {/* Ticket Info */}
          <div className="mb-4">
            <code className="text-secondary text-sm block mb-1">{ticket.ticketNo}</code>
            <p className="text-primary">{ticket.subject}</p>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6">
          {/* Department Select */}
          <div className="mb-4">
            <Select
              label="Department"
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              options={departments}
              placeholder="Select department"
            />
          </div>

          {/* Assign To Input */}
          <div className="mb-6">
            <Input
              label="Assign to"
              type="text"
              value={assignTo}
              onChange={(e) => setAssignTo(e.target.value)}
              placeholder="Enter agent name"
            />
          </div>

          {/* Change Priority */}
          <div className="mb-6">
            <label className="block text-secondary mb-3 text-sm font-medium uppercase tracking-wide">CHANGE PRIORITY</label>
            <div className="grid grid-cols-4 gap-3">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => setSelectedPriority(priority.value)}
                  className={`
                    py-3 px-4 rounded-lg font-medium transition-all font-size-floating-label
                    ${selectedPriority === priority.value
                      ? priority.value === 'high'
                        ? 'bg-priority-high-active '
                        : `${priority.bgColor} ${priority.textColor}`
                      : `${priority.bgColor} ${priority.textColor} `
                    }
                  `}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={onCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              className="px-6 bg-info hover:bg-info/90"
            >
              Assign Ticket
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
