import { useState } from 'react';
import { Button } from './Button.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { Textarea } from './Textarea.jsx';
import { useUpdateTicketStatusMutation } from '../api/apiSlice.js';
import { useNotification } from '../notifications/index.js';

/**
 * RemarksConfirmationModal — Self-contained modal for department role status updates.
 * Manages its own remarks state, validation, and API call.
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string|number} props.ticketId - The ticket ID to update
 * @param {string} props.targetStatusText - The target status label (e.g., "Resolved")
 * @param {number} props.targetStatusId - The target status ID
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSuccess - Callback after successful status update
 */
export const RemarksConfirmationModal = ({
  isOpen,
  ticketId,
  targetStatusText,
  targetStatusId,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState('');
  const [updateTicketStatus, { isLoading: isUpdating }] = useUpdateTicketStatusMutation();

  if (!isOpen || !ticketId || !targetStatusText) return null;

  const handleConfirm = async () => {
    const trimmedRemarks = remarks.trim();
    if (!trimmedRemarks) {
      setRemarksError('Remarks are required.');
      return;
    }

    setRemarksError('');

    try {
      const response = await updateTicketStatus({
        ticketId,
        status: targetStatusId,
        remarks: trimmedRemarks,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || `Failed to update status to ${targetStatusText}.`);
        return;
      }

      showSuccess(response?.message || `Status successfully updated to ${targetStatusText}.`);
      setRemarks('');
      setRemarksError('');
      onClose();
      if (onSuccess) onSuccess();
    } catch (err) {
      showError(err?.data?.message || `Failed to update status. Please try again.`);
    }
  };

  const handleClose = () => {
    setRemarks('');
    setRemarksError('');
    onClose();
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    if (remarksError) setRemarksError('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isUpdating ? undefined : handleClose}
      />
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
        <div className="px-6 pt-6 pb-4">
          <h2 className="text-primary page-heading mb-4">Update Ticket Status</h2>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-secondary text-sm">New Status:</span>
            <StatusBadge status={targetStatusText} />
          </div>

          <Textarea
            label="Remarks *"
            value={remarks}
            onChange={handleRemarksChange}
            placeholder="Enter remarks for this status update..."
            disabled={isUpdating}
            error={remarksError}
          />
        </div>

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
            onClick={handleConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Updating...
              </span>
            ) : (
              `Confirm ${targetStatusText}`
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
