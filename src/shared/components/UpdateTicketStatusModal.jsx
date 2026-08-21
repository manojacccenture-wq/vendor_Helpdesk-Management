import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { Select } from './Select.jsx';
import { Textarea } from './Textarea.jsx';
import { Button } from './Button.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { useGetTicketStatusesQuery, useUpdateTicketStatusMutation } from '../api/apiSlice.js';
import { useNotification } from '../notifications/index.js';
import { sendNotification, detectStatusChangeType, getSectionField } from '../services/emailNotifications.js';
import { selectUserProfile } from '../../features/user/store/selectors.js';

/**
 * UpdateTicketStatusModal — Reusable modal for updating a ticket's status.
 *
 * Responsibilities:
 * - Displays current status via StatusBadge
 * - Provides a dropdown of available statuses from the ticket-statuses API
 * - Collects required remarks before submitting
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
  ticketDetails,
  onClose,
  onSuccess,
}) => {
  const profile = useSelector(selectUserProfile);
  const { showSuccess, showError } = useNotification();
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();
  const { data: statuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery();

  // Centralized form reset — called on every exit path that should clear state
  const resetForm = useCallback(() => {
    setSelectedStatus('');
    setRemarks('');
    setRemarksError('');
  }, []);

  // Close handler — reset form before closing (Cancel, overlay click)
  // MUST be declared before the early return to satisfy Rules of Hooks
  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

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

    // Validate remarks
    const trimmedRemarks = remarks.trim();
    if (!trimmedRemarks) {
      setRemarksError('Remarks are required.');
      return;
    }

    setRemarksError('');

    try {
      const response = await updateTicketStatus({
        ticketId,
        status: parseInt(selectedStatus, 10),
        remarks: trimmedRemarks,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to update status. Please try again.');
        return;
      }

      // Success: reset form, then close and notify parent
      resetForm();
      showSuccess(response?.message || 'Status updated successfully!');

      // Determine notification type from status change
      const selectedStatusObj = statuses.find(
        s => String(s.value ?? s.Value) === String(parseInt(selectedStatus, 10))
      );
      const selectedStatusText = (selectedStatusObj?.text ?? selectedStatusObj?.Text) || '';
      const notificationType = detectStatusChangeType(selectedStatusText, currentStatus);

      if (notificationType) {
        const sections = ticketDetails?.sections || [];
        const assignedEmail = getSectionField(sections, 'Processing & Assignment', 'Assigned To Email');
        const vendorEmail = getSectionField(sections, 'Ticket Information', 'Vendor Email');

        sendNotification(notificationType, {
          ticketNo: ticketDetails?.ticketNo,
          subject: ticketDetails?.subject,
          status: selectedStatusText,
          remarks: trimmedRemarks,
          vendorEmail,
          assignedEmail,
          deptUserEmail: profile?.email,
        });
      }

      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      // Error: keep form values so user can retry
      showError(error?.data?.message || 'Failed to update status. Please try again.');
    }
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    if (remarksError) setRemarksError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isUpdating ? undefined : handleClose}
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
          <div className="mb-4">
            <Select
              label="New Status"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              options={statusOptions}
              placeholder={isLoadingStatuses ? 'Loading statuses...' : 'Select new status'}
              disabled={isUpdating || isLoadingStatuses}
            />
          </div>

          {/* Remarks Textarea */}
          <Textarea
            label="Remarks *"
            value={remarks}
            onChange={handleRemarksChange}
            placeholder="Enter remarks for this status update..."
            disabled={isUpdating}
            error={remarksError}
            className="min-h-[120px]"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6">
          <Button
            variant="ghost"
            onClick={handleClose}
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
