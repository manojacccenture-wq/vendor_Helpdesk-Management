import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { Button } from './Button.jsx';
import { Select } from './Select.jsx';
import { Textarea } from './Textarea.jsx';
import { useGetSuperiorsQuery, useForwardTicketMutation } from '../api/apiSlice.js';
import { selectUserRole } from '../../features/user/store/selectors.js';
import { useNotification } from '../notifications/index.js';
import { formatTicketNo } from '../utils/ticket.js';

/**
 * ForwardTicketModal — Department role modal for forwarding a ticket to a superior.
 *
 * Flow:
 *   1. Mount → GET /api/Tickets/superiors?role=&ticketId= (role from Redux,
 *      ticket id from the route, both dynamic)
 *   2. Select a superior → keeps their actual userId + role
 *   3. Enter remarks → POST /api/Tickets/forward
 *   4. Success → toast the API message, close; the mutation invalidates the
 *      'Ticket' tag so ticket details/history refetch through RTK Query cache.
 *
 * Mounted only while open (see TicketFooter), so the query runs on open and all
 * local state resets on close — no useEffect required.
 *
 * @param {Object} props
 * @param {string|number} props.ticketId - Current ticket ID (from route params)
 * @param {Object} props.ticketDetails - Adapted ticket details (for header context)
 * @param {Function} props.onClose - Callback when the modal is closed
 */
export const ForwardTicketModal = ({ ticketId, ticketDetails, onClose }) => {
  const role = useSelector(selectUserRole);
  const { showSuccess, showError } = useNotification();

  const [selectedUser, setSelectedUser] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedError, setSelectedError] = useState('');
  const [remarksError, setRemarksError] = useState('');

  // Guards against two submits landing before React re-renders the disabled button
  const submitLockRef = useRef(false);

  const resolvedTicketId = Number.parseInt(ticketId ?? ticketDetails?.ticketId ?? '', 10);

  const {
    data: superiorOptions = [],
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetSuperiorsQuery(
    { role, ticketId: resolvedTicketId },
    { skip: !role || !Number.isInteger(resolvedTicketId) }
  );

  const [forwardTicket, { isLoading: isSubmitting }] = useForwardTicketMutation();

  const isBusy = isLoading || isFetching;
  const hasOptions = superiorOptions.length > 0;
  const isSubmitDisabled = isBusy || isError || !hasOptions || isSubmitting;

  const getErrorMessage = () => {
    if (!error) return 'Failed to load superior users.';
    if (typeof error?.data?.message === 'string') return error.data.message;
    if (typeof error?.data?.Message === 'string') return error.data.Message;
    if (typeof error?.data === 'string' && error.data.trim()) return error.data.trim();
    if (typeof error?.error === 'string' && error.error.trim()) {
      return error.error.replace(/^Error:\s*/i, '');
    }
    if (typeof error?.message === 'string' && error.message.trim()) {
      return error.message.replace(/^Error:\s*/i, '');
    }
    return 'Failed to load superior users.';
  };
  const errorMessage = getErrorMessage();

  const placeholder = isBusy
    ? 'Loading users...'
    : isError
      ? 'Unable to load users'
      : !hasOptions
        ? 'No superior users available'
        : 'Select superior user';

  const handleSelectChange = (e) => {
    setSelectedUser(e.target.value);
    if (selectedError) setSelectedError('');
  };

  const handleRemarksChange = (e) => {
    setRemarks(e.target.value);
    if (remarksError) setRemarksError('');
  };

  const handleForward = async () => {
    if (isSubmitting || submitLockRef.current) return;

    const selected = superiorOptions.find((option) => option.value === selectedUser);
    const trimmedRemarks = remarks.trim();

    if (!selected) {
      setSelectedError('Please select a superior user.');
      return;
    }

    if (!selected.userId) {
      setSelectedError('Unable to determine the selected user. Please reload and try again.');
      return;
    }

    if (!selected.role) {
      setSelectedError('Unable to determine the selected user\'s role. Please reload and try again.');
      return;
    }

    if (!trimmedRemarks) {
      setRemarksError('Remarks are required.');
      return;
    }

    if (!Number.isInteger(resolvedTicketId)) {
      showError('Unable to determine the ticket ID. Please reload the page and try again.');
      return;
    }

    setSelectedError('');
    setRemarksError('');
    submitLockRef.current = true;

    try {
      const response = await forwardTicket({
        ticketId: resolvedTicketId,
        forwardToUserId: selected.userId,
        forwardToRole: selected.role,
        remarks: trimmedRemarks,
      }).unwrap();

      // Treat fulfilled HTTP 2xx response as successful unless response explicitly indicates failure
      const isExplicitFailure =
        response &&
        typeof response === 'object' &&
        (response.isSuccessful === false || response.IsSuccessful === false);

      if (isExplicitFailure) {
        showError(response?.message || response?.Message || 'Failed to forward ticket. Please try again.');
        return;
      }

      const successMessage =
        (typeof response === 'object' && (response?.message || response?.Message)) ||
        (typeof response === 'string' && response.trim() ? response.trim() : '') ||
        'Ticket forwarded successfully.';

      showSuccess(successMessage);

      setSelectedUser('');
      setRemarks('');
      onClose();
    } catch (error) {
      showError(error?.data?.message || error?.message || 'Failed to forward ticket. Please try again.');
    } finally {
      submitLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={isSubmitting ? undefined : onClose} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90dvh] overflow-hidden">
        <div className="px-6 pt-6 pb-4 overflow-y-auto flex-1 overscroll-contain">
          <h2 className="text-primary page-heading mb-4">Forward Ticket</h2>

          {/* Ticket context */}
          <div className="mb-4">
            <code className="text-secondary text-sm block mb-1">
              {ticketDetails?.ticketNo
                ? `#${formatTicketNo(ticketDetails.ticketNo)}`
                : `Ticket ID: ${resolvedTicketId}`}
            </code>
            <p className="text-primary">{ticketDetails?.subject}</p>
          </div>

          {/* Superior users */}
          <div className="mb-4">
            <Select
              label="Forward To *"
              value={selectedUser}
              onChange={handleSelectChange}
              options={superiorOptions}
              placeholder={placeholder}
              disabled={isBusy || isError || !hasOptions || isSubmitting}
              error={selectedError}
            />

            {/* Loading state */}
            {isBusy && (
              <p className="text-xs text-secondary mt-1 flex items-center gap-1">
                <span className="w-3 h-3 border-2 border-secondary border-t-transparent rounded-full animate-spin inline-block" />
                Fetching superior users...
              </p>
            )}

            {/* Error state */}
            {!isBusy && isError && (
              <div className="mt-1 flex items-center justify-between gap-2">
                <p className="text-xs text-danger break-words">{errorMessage}</p>
                <Button variant="ghost" size="sm" onClick={refetch} className="px-2 shrink-0">
                  Retry
                </Button>
              </div>
            )}

            {/* Empty state */}
            {!isBusy && !isError && !hasOptions && (
              <p className="text-xs text-secondary mt-1">
                No superior users are available for this ticket.
              </p>
            )}
          </div>

          {/* Remarks */}
          <Textarea
            label="Remarks *"
            value={remarks}
            onChange={handleRemarksChange}
            placeholder="Enter remarks for forwarding this ticket..."
            disabled={isSubmitting}
            error={remarksError}
          />
        </div>

        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 shrink-0 bg-white">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleForward}
            disabled={isSubmitDisabled}
            className="bg-info hover:bg-info/90"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Forwarding...
              </span>
            ) : (
              'Forward'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForwardTicketModal;
