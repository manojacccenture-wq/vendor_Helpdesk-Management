import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, AlertCircle, EyeOff, Maximize2 } from 'lucide-react';
import { Button } from './Button.jsx';
import { Textarea } from './Textarea.jsx';
import { CommentItem } from './CommentItem.jsx';
import { useGetTicketCommentsQuery, useAddCommentMutation } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { useNotification } from '../notifications/index.js';
import { cn } from '../utils/cn.js';

/**
 * TicketCommentsDrawer — Reusable component that provides a compact comments trigger
 * and a slide-out drawer for viewing and adding comments.
 *
 * Used by:
 * - Vendor Ticket Details page
 * - Helpdesk Ticket View page
 * - Any future ticket view page
 *
 * @param {number|string} ticketId - The ID of the current ticket
 */
export const TicketCommentsDrawer = ({ ticketId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { showSuccess, showError } = useNotification();
  const scrollContainerRef = useRef(null);

  // Determine the expand path based on role
  const expandPath = role === 'L1'
    ? `/vendor/ticket/${ticketId}/comments`
    : `/helpdesk/ticket/${ticketId}/comments`;

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  // Determine if user can see the internal comment checkbox (Helpdesk/Internal users only)
  const canToggleInternal = role === 'L2' || role === 'HelpdeskExecutive';

  // Fetch comments
  const {
    data: commentsResponse,
    isLoading,
    isError,
    error,
  } = useGetTicketCommentsQuery(
    {
      ticketId,
      role,
      userCode: profile?.userCode,
    },
    {
      skip: !ticketId || !profile?.userCode || !role,
    }
  );

  // Filter comments based on role
  const comments = useMemo(() => {
    const allComments = commentsResponse?.data || [];
    const isVendorUser = role === 'L1';
    
    if (isVendorUser) {
      return allComments.filter(comment => comment.visibility === 'VENDOR');
    }
    return allComments;
  }, [commentsResponse, role]);

  const commentCount = comments.length;

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (isOpen && scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [commentCount, isOpen]);

  // Handle comment submission
  const handleSubmitComment = async (e) => {
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
        isInternal: canToggleInternal ? isInternal : false,
        isEdited: false,
        userCode: profile?.userCode,
        role,
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to add comment. Please try again.');
        return;
      }

      showSuccess('Comment added successfully.');
      setCommentText('');
      setIsInternal(false);
    } catch (err) {
      showError(err?.data?.message || 'Failed to add comment. Please try again.');
    }
  };

  // Handle keyboard shortcut (Ctrl/Cmd + Enter to submit)
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmitComment(e);
    }
  };

  return (
    <>
      {/* ═══════════════════════════════════════════════════════════
          COMPACT TRIGGER BUTTON
      ═══════════════════════════════════════════════════════════ */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-control",
          "bg-surface border border-default hover:border-hover",
          "transition-colors cursor-pointer",
          "text-body text-primary"
        )}
      >
        <MessageSquare className="w-4 h-4 text-success" />
        <span className="font-medium">Comments</span>
        {commentCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-success text-white text-caption font-medium">
            {commentCount}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER OVERLAY
      ═══════════════════════════════════════════════════════════ */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 transition-opacity"
            onClick={() => setIsOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative flex flex-col h-full w-full max-w-[480px] sm:w-[480px] bg-surface shadow-xl animate-slide-in-right">
            
            {/* ─── Drawer Header (Fixed) ─── */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-default bg-surface shrink-0">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-success" />
                <h2 className="text-card-title text-primary">
                  Comments {commentCount > 0 && `(${commentCount})`}
                </h2>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    navigate(expandPath);
                  }}
                  className="p-2 rounded-control text-secondary hover:bg-surface-active hover:text-primary transition-colors"
                  aria-label="Open full page"
                  title="Open full page"
                >
                  <Maximize2 className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-control text-secondary hover:bg-surface-active hover:text-primary transition-colors"
                  aria-label="Close comments"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ─── Comments List (Scrollable) ─── */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto px-6"
            >
              {/* Loading State */}
              {isLoading && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
                    <span className="text-secondary text-body">Loading comments...</span>
                  </div>
                </div>
              )}

              {/* Error State */}
              {isError && (
                <div className="flex flex-col items-center justify-center py-12 gap-3">
                  <AlertCircle className="w-8 h-8 text-danger" />
                  <p className="text-body text-secondary text-center">
                    {error?.data?.message || error?.data || 'Failed to load comments.'}
                  </p>
                </div>
              )}

              {/* Empty State */}
              {!isLoading && !isError && commentCount === 0 && (
                <div className="flex flex-col items-center justify-center py-12 gap-2">
                  <MessageSquare className="w-8 h-8 text-muted" />
                  <p className="text-body text-secondary text-center">
                    No comments yet. Be the first to comment.
                  </p>
                </div>
              )}

              {/* Comments List */}
              {!isLoading && !isError && commentCount > 0 && (
                <div className="divide-y divide-default py-2">
                  {comments.map((comment) => (
                    <CommentItem key={comment.id || comment.uuid} comment={comment} />
                  ))}
                </div>
              )}
            </div>

            {/* ─── Add Comment Section (Fixed at Bottom) ─── */}
            <div className="shrink-0 border-t border-default bg-surface">
              <form onSubmit={handleSubmitComment} className="p-4 flex flex-col gap-3">
                <Textarea
                  placeholder="Type your message here... (Ctrl+Enter to send)"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={isAddingComment}
                  className="min-h-[80px]"
                />

                {/* Visible to Vendor checkbox - only for Helpdesk/Internal users */}
                {canToggleInternal && (
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
                    <span className="flex items-center gap-1.5 text-caption text-secondary select-none">
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
                    size="sm"
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
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TicketCommentsDrawer;
