import { useState } from 'react';
import { useSelector } from 'react-redux';
import { EyeOff } from 'lucide-react';
import { Button } from './Button.jsx';
import { Textarea } from './Textarea.jsx';
import { useAddCommentMutation } from '../api/apiSlice.js';
import { useNotification } from '../notifications/index.js';
import { cn } from '../utils/cn.js';
import { sendNotification, NOTIFICATION_TYPES } from '../services/emailNotifications.js';
import { selectUserProfile } from '../../features/user/store/selectors.js';

/**
 * CommentForm — Reusable comment form with textarea, internal toggle, and submit button.
 *
 * Handles:
 * - Comment text input
 * - Internal/visible-to-vendor toggle (for Helpdesk/Internal users)
 * - Form submission via useAddCommentMutation
 * - Keyboard shortcut (Ctrl/Cmd + Enter)
 * - Loading/disabled states
 *
 * @param {Object} props
 * @param {number|string} props.ticketId - The ticket ID
 * @param {Function} props.onCommentAdded - Callback after successful comment submission
 * @param {boolean} props.canToggleInternal - Whether to show the internal toggle (Helpdesk/Internal users)
 * @param {number|string} props.userCode - Current user's code
 * @param {string} props.role - Current user's role
 * @param {string} props.className - Additional class for the form container
 * @param {string} props.textareaClassName - Additional class for the textarea
 * @param {string} props.size - 'sm' for compact (drawer) or 'md' for full (page)
 */
export const CommentForm = ({
  ticketId,
  ticketNo,
  ticketSubject,
  onCommentAdded,
  canToggleInternal = false,
  userCode,
  role,
  className,
  textareaClassName,
  size = 'sm',
}) => {
  const profile = useSelector(selectUserProfile);
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const { showSuccess, showError } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const trimmedText = commentText.trim();

    if (!trimmedText) {
      showError('Please enter a comment before submitting.');
      return;
    }

    try {
      const response = await addComment({
        ticketId: parseInt(ticketId, 10),
        parentCommentId: 0,
        body: trimmedText,
        isInternal: showInternalToggle ? isInternal : false,
        isEdited: false,
        userCode,
        role,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to add comment. Please try again.');
        return;
      }

      showSuccess('Comment added successfully.');

      // Email notification for non-internal comments
      // Matrix:
      //   Dept Response (role != L1, non-internal) → TO=VHD, CC=Dept User, Vendor=NO
      //   Vendor Clarification Received (role=L1, non-internal) → TO=VHD, CC=Vendor, Vendor=YES
      if (!isInternal) {
        const notificationType = role === 'L1'
          ? NOTIFICATION_TYPES.CLARIFICATION_RECEIVED
          : NOTIFICATION_TYPES.DEPT_RESPONSE;

        sendNotification(notificationType, {
          ticketId,
          ticketNo,
          subject: ticketSubject,
          deptUserEmail: profile?.email,
          vendorEmail: profile?.email,
        });
      }

      setCommentText('');
      setIsInternal(false);
      onCommentAdded?.();
    } catch (err) {
      showError(err?.data?.message || 'Failed to add comment. Please try again.');
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Vendor role (L1) must never see the internal/visibility toggle
  const isVendorRole = role === 'L1';
  const showInternalToggle = canToggleInternal && !isVendorRole;

  const isCompact = size === 'sm';

  return (
    <form onSubmit={handleSubmit} className={cn('flex flex-col gap-3', isCompact ? 'p-4' : 'p-6 gap-4', className)}>
      <Textarea
        placeholder="Type your message here... (Ctrl+Enter to send)"
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isAddingComment}
        className={cn(isCompact ? 'min-h-[80px]' : 'min-h-[100px]', textareaClassName)}
      />

      {/* Internal comment toggle — only for Helpdesk/Internal users */}
      {showInternalToggle && (
        <div className="flex items-center gap-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isInternal}
              onChange={(e) => setIsInternal(e.target.checked)}
              disabled={isAddingComment}
              className="sr-only peer"
            />
            <div className={cn(
              "w-5 h-5 rounded border transition-colors",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-success peer-focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              isInternal
                ? "bg-success border-success"
                : "bg-surface border-hover hover:border-default"
            )}>
              {isInternal && (
                <svg className="w-full h-full text-white p-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </label>
          <span className={cn('flex items-center gap-1.5 select-none', isCompact ? 'text-caption' : 'text-body', 'text-secondary')}>
            {isInternal ? (
              <>
                <EyeOff className="w-3.5 h-3.5 text-warning" />
                <span>Internal (not visible to Vendor)</span>
              </>
            ) : (
              <span>Visible to Vendor</span>
            )}
          </span>
        </div>
      )}

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="black"
          size={isCompact ? 'sm' : 'md'}
          disabled={isAddingComment || !commentText.trim()}
        >
          {isAddingComment ? (
            <span className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            'Send Comment'
          )}
        </Button>
      </div>
    </form>
  );
};

export default CommentForm;
