import { useState, useEffect } from 'react';
import { Select } from './Select.jsx';
import { Button } from './Button.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { useGetTicketStatusesQuery, useUpdateTicketStatusMutation } from '../api/apiSlice.js';
import { useNotification } from '../notifications/index.js';

/**
 * UpdateTicketStatusModal — Reusable modal for updating a ticket's status.
 *
 * Responsibilities:
 * - Displays current status via StatusBadge
 * - Provides a dropdown of available statuses from the ticket-statuses API
 * - Calls the updateTicketStatus mutation on confirm
 * - Handles success/error notifications
 * - Manages its own loading and selection state
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string|number} props.ticketId - The ticket ID to update
 * @param {string} props.currentStatus - The current status text (e.g., "Open")
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSuccess - Callback after successful status update
 */
export const UpdateTicketStatusModal = ({
  isOpen,
  ticketId,
  currentStatus,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery();

  // Reset selection when modal opens with a new ticket/currentStatus
  useEffect(() => {
    if (isOpen) {
      setSelectedStatus('');
    }
  }, [isOpen, ticketId, currentStatus]);

  if (!isOpen || !ticketId) return null;

  // Build status options for the Select dropdown
  const statusOptions = statuses.map(s => ({
    label: s.text ?? s.Text,
    value: s.value ?? s.Value,
  }));

  // Find the current status value for comparison
  const currentStatusObj = statuses.find(
    s => (s.text ?? s.Text)?.toLowerCase() === currentStatus?.toLowerCase()
  );
  const currentStatusValue = currentStatusObj?.value ?? currentStatusObj?.Value;

  // Determine if the selected status is the same as current
  const isSameStatus = String(selectedStatus) === String(currentStatusValue);

  const handleUpdate = async () => {
    if (!selectedStatus || isSameStatus) return;

    try {
      const response = await updateTicketStatus({
        ticketId,
        status: parseInt(selectedStatus, 10),
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to update status. Please try again.');
        return;
      }

      showSuccess(response?.message || 'Status updated successfully!');
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isUpdating ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-primary page-heading mb-4">Update Ticket Status</h2>

          {/* Current Status */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-secondary text-sm">Current Status:</span>
            <StatusBadge status={currentStatus} />
          </div>

          {/* New Status Dropdown */}
          <Select
            label="New Status"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            options={statusOptions}
            placeholder={isLoadingStatuses ? 'Loading statuses...' : 'Select new status'}
            disabled={isUpdating || isLoadingStatuses}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleUpdate}
            disabled={isUpdating || !selectedStatus || isSameStatus}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              'Update Status'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UpdateTicketStatusModal;
