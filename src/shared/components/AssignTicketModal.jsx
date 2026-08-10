import React, { useState, useEffect } from 'react';
import { Select } from './Select.jsx';
import { Button } from './Button.jsx';
import { useGetUsersByDepartmentQuery } from '../api/apiSlice.js';

/**
 * Modal for assigning a ticket to a helpdesk agent.
 * Displays ticket details and allows selecting department, assignee, and priority.
 *
 * Assign To dropdown is dynamically populated via GET /api/user/users?role=BL1&deptId={deptId}
 * When department changes, agent selection is cleared and users are re-fetched.
 */
export const AssignTicketModal = ({
  isOpen,
  ticket,
  departments = [],
  onAssign,
  onCancel,
  isSubmitting = false
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('high');

  // Fetch users for the selected department
  // Query is skipped until a department is selected
  const { data: users = [], isLoading: isLoadingUsers, isFetching: isFetchingUsers, error: usersError } =
    useGetUsersByDepartmentQuery(selectedDepartment, { skip: !selectedDepartment });

  // When department changes, clear the previously selected agent
  useEffect(() => {
    setSelectedAgent('');
  }, [selectedDepartment]);

  // Reset state when modal opens with a new ticket
  useEffect(() => {
    if (isOpen) {
      setSelectedDepartment('');
      setSelectedAgent('');
      setSelectedPriority('high');
    }
  }, [isOpen, ticket?.id]);

  if (!isOpen || !ticket) return null;

  // Map departments to Select-compatible format { label, value }
  const departmentOptions = (departments || []).map(d => ({
    label: d.label || d.deptName || d.name || d.text || '',
    value: d.value ?? d.deptId ?? d.id ?? ''
  }));

  // Map users to Select-compatible format
  // Display: "Name (userCode)"  |  Value: "Name(userCode)" (payload-ready)
  const userOptions = (users || []).map(u => ({
    label: `${u.name || u.username || ''} (${u.userCode || ''})`,
    value: `${u.name || u.username || ''}(${u.userCode || ''})`
  }));

  // Determine Assign To placeholder and disabled state
  const assignToPlaceholder = !selectedDepartment
    ? 'Select department first'
    : isLoadingUsers || isFetchingUsers
      ? 'Loading agents...'
      : userOptions.length === 0
        ? 'No agents available'
        : 'Select agent';

  const isAssignToDisabled = !selectedDepartment || isLoadingUsers || isFetchingUsers || userOptions.length === 0;

  const priorityOptions = [
    { value: 'low', label: 'LOW', bgColor: 'bg-priority-low', textColor: 'text-priority-low-text' },
    { value: 'medium', label: 'MEDIUM', bgColor: 'bg-priority-medium', textColor: 'text-priority-medium-text' },
    { value: 'high', label: 'High', bgColor: 'bg-priority-high', textColor: 'text-priority-high-text' },
    { value: 'escalate', label: 'ESCALATE', bgColor: 'bg-priority-escalate', textColor: 'text-priority-escalate-text' }
  ];

  const handleAssign = () => {
    if (onAssign && !isSubmitting && selectedDepartment && selectedAgent) {
      onAssign({
        ticketId: ticket.id,
        department: selectedDepartment,
        agent: selectedAgent, // Already in "Name(userCode)" format
        priority: selectedPriority
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isSubmitting ? undefined : onCancel}
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
              options={departmentOptions}
              placeholder="Select department"
            />
          </div>

          {/* Assign To Select — populated from users API */}
          <div className="mb-6">
            <Select
              label="Assign To"
              value={selectedAgent}
              onChange={(e) => setSelectedAgent(e.target.value)}
              options={userOptions}
              placeholder={assignToPlaceholder}
              disabled={isAssignToDisabled}
            />
            {/* Loading indicator */}
            {(isLoadingUsers || isFetchingUsers) && selectedDepartment && (
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin inline-block" />
                Fetching agents...
              </p>
            )}
            {/* Error state — API call failed */}
            {!isLoadingUsers && !isFetchingUsers && selectedDepartment && usersError && (
              <p className="text-xs text-danger mt-1">Failed to load agents. Please try again.</p>
            )}
            {/* Empty state — API succeeded but no users found */}
            {!isLoadingUsers && !isFetchingUsers && selectedDepartment && !usersError && userOptions.length === 0 && (
              <p className="text-xs text-secondary mt-1">No agents found for this department.</p>
            )}
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
              disabled={isSubmitting}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAssign}
              disabled={isSubmitting || !selectedDepartment || !selectedAgent}
              className="px-6 bg-info hover:bg-info/90"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Assigning...
                </span>
              ) : (
                'Assign Ticket'
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
