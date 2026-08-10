import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, ArrowLeft, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle } from './Card.jsx';
import { Button } from './Button.jsx';
import { Textarea } from './Textarea.jsx';
import { CommentItem } from './CommentItem.jsx';
import { useGetTicketCommentsQuery, useAddCommentMutation, useGetTicketDetailsQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { useNotification } from '../notifications/index.js';
import { cn } from '../utils/cn.js';

/**
 * TicketCommentsPage — Full-page comments view for a ticket.
 *
 * Used by:
 * - Vendor ticket comments page
 * - Helpdesk ticket comments page
 *
 * @param {string} backPath - Path to navigate back to (e.g., '/vendor/ticket/123')
 * @param {string} ticketLabel - Optional ticket label to display (e.g., ticket number)
 */
export const TicketCommentsPage = ({ backPath }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { showSuccess, showError } = useNotification();
  const scrollContainerRef = useRef(null);

  // Comment input state
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();

  // Determine if user can see the internal comment checkbox (Helpdesk/Internal users only)
  const canToggleInternal = role === 'L2' || role === 'HelpdeskExecutive';

  // Fetch ticket details for display
  const { data: ticketDetails } = useGetTicketDetailsQuery(
    {
      ticketId: id,
      role,
      userCode: profile?.userCode,
    },
    {
      skip: !id || !profile?.userCode || !role,
    }
  );

  // Fetch comments
  const {
    data: commentsResponse,
    isLoading,
    isError,
    error,
  } = useGetTicketCommentsQuery(
    {
      ticketId: id,
      role,
      userCode: profile?.userCode,
    },
    {
      skip: !id || !profile?.userCode || !role,
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

  // Get ticket number for display
  const ticketNo = ticketDetails?.ticketNo || ticketDetails?.ticketNumber || `#${id}`;
  const subject = ticketDetails?.subject || ticketDetails?.ticketSubject || '';

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [commentCount]);

  // Handle back navigation
  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else {
      navigate(-1);
    }
  };

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
        ticketId: parseInt(id, 10),
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
    <div className="flex flex-col h-full w-full max-w-[900px] mx-auto">
      
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={handleBack}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-body font-medium">Back to Ticket</span>
        </button>
      </div>

      {/* Ticket Reference */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-success" />
          <h1 className="text-page-title text-primary">
            Comments
          </h1>
        </div>
        {ticketNo && (
          <span className="text-caption text-secondary font-mono">
            {ticketNo}
          </span>
        )}
        {subject && (
          <span className="text-caption text-secondary truncate max-w-[300px]">
            — {subject}
          </span>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          COMMENTS CARD
      ═══════════════════════════════════════════════════════════ */}
      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="shrink-0">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-success" />
            Comments {commentCount > 0 && `(${commentCount})`}
          </CardTitle>
        </CardHeader>

        {/* Comments List (Scrollable) */}
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

        {/* ═══════════════════════════════════════════════════════════
            ADD COMMENT SECTION (Fixed at Bottom)
        ═══════════════════════════════════════════════════════════ */}
        <div className="shrink-0 border-t border-default">
          <form onSubmit={handleSubmitComment} className="p-6 flex flex-col gap-4">
            <Textarea
              placeholder="Type your message here... (Ctrl+Enter to send)"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isAddingComment}
              className="min-h-[100px]"
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
                <span className="flex items-center gap-1.5 text-body text-secondary select-none">
                  {isInternal ? (
                    <>
                      <span className="text-warning">🔒</span>
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
      </Card>
    </div>
  );
};

export default TicketCommentsPage;
