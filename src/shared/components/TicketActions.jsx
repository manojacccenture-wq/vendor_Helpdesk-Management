import { useState, useEffect, useRef, useCallback } from 'react';
import { Zap, ChevronDown, UserPlus, RefreshCw } from 'lucide-react';
import { useSelector } from 'react-redux';
import { Button } from './Button.jsx';
import { AssignTicketModal } from './AssignTicketModal.jsx';
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal.jsx';
import {
  useGetDepartmentsQuery,
  useGetTicketStatusesQuery,
  useAssignTicketMutation,
} from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { useNotification } from '../notifications/index.js';
import { sendNotification, NOTIFICATION_TYPES } from '../services/emailNotifications.js';

/**
 * TicketActions — Reusable dropdown menu for ticket-editing actions.
 *
 * Renders a trigger button that opens a dropdown menu with available actions:
 * - Assign Ticket (opens AssignTicketModal)
 * - Change Status (opens UpdateTicketStatusModal)
 *
 * @param {Object} props
 * @param {string|number} props.ticketId - The ticket ID
 * @param {Object} props.ticket - Full ticket object (for AssignTicketModal display)
 * @param {string} props.currentStatus - Current status text (for UpdateTicketStatusModal)
 * @param {Function} props.onActionComplete - Callback after any action succeeds
 * @param {string} props.className - Additional classes for the trigger button
 */
export const TicketActions = ({
  ticketId,
  ticket,
  currentStatus,
  onActionComplete,
  className,
}) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const menuRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'assign' | 'status' | null

  // Fetch data needed by the modals
  const { data: departments = [] } = useGetDepartmentsQuery(
    { role, userCode: profile?.userCode },
    { skip: !profile?.userCode || !role }
  );

  // Assignment mutation
  const [assignTicket, { isLoading: isAssigning }] = useAssignTicketMutation();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMenuOpen]);

  const handleActionSelect = useCallback((action) => {
    setIsMenuOpen(false);
    setActiveModal(action);
  }, []);

  const handleModalClose = useCallback(() => {
    setActiveModal(null);
  }, []);

  const handleActionComplete = useCallback(() => {
    setActiveModal(null);
    if (onActionComplete) onActionComplete();
  }, [onActionComplete]);

  // Assign handler — mirrors HelpdeskTicketsTable pattern
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

      // Matrix: Ticket Assigned/Reassigned → TO=Assigned Person, CC=VHD, Vendor=NO
      sendNotification(NOTIFICATION_TYPES.ASSIGNED, {
        ticketNo: ticket?.ticketNo,
        subject: ticket?.subject,
        assignedEmail: assignmentData.agentEmail,
      });

      handleActionComplete();
    } catch (error) {
      showError(error?.data?.message || 'Failed to assign ticket. Please try again.');
    }
  };

  const actions = [
    {
      key: 'assign',
      label: 'Assign Ticket',
      icon: UserPlus,
      onClick: () => handleActionSelect('assign'),
    },
    {
      key: 'status',
      label: 'Change Status',
      icon: RefreshCw,
      onClick: () => handleActionSelect('status'),
    },
  ];

  return (
    <>
      {/* Dropdown Trigger + Menu */}
      <div className="relative" ref={menuRef}>
        <Button
          variant="black"
          size="sm"
          onClick={() => setIsMenuOpen(prev => !prev)}
          className={`flex items-center gap-1.5 ${className || ''}`}
        >
          <Zap className="w-4 h-4" />
          <span className="hidden sm:inline">Ticket Actions</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isMenuOpen ? 'rotate-180' : ''}`} />
        </Button>

        {/* Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute right-0 top-full mt-1 w-52 bg-surface border border-default rounded-card shadow-lg z-50 overflow-hidden">
            <div className="py-1">
              {actions.map((action) => {
                const Icon = action.icon;
                return (
                  <button
                    key={action.key}
                    type="button"
                    onClick={action.onClick}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-primary hover:bg-surface-active transition-colors text-left cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-secondary shrink-0" />
                    {action.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Assign Ticket Modal (existing component, reused) */}
      <AssignTicketModal
        isOpen={activeModal === 'assign'}
        ticket={ticket}
        ticketId={ticketId}
        departments={departments}
        onAssign={handleAssign}
        onCancel={handleModalClose}
        isSubmitting={isAssigning}
      />

      {/* Change Status Modal (existing component, reused) */}
      <UpdateTicketStatusModal
        isOpen={activeModal === 'status'}
        ticketId={ticketId}
        currentStatus={currentStatus}
        ticketDetails={ticket}
        onClose={handleModalClose}
        onSuccess={handleActionComplete}
      />
    </>
  );
};

export default TicketActions;
