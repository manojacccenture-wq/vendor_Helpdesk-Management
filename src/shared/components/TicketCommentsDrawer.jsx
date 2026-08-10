import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, X, Maximize2 } from 'lucide-react';
import { CommentForm } from './CommentForm.jsx';
import { CommentList } from './CommentList.jsx';
import { useGetTicketCommentsQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
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
  const scrollContainerRef = useRef(null);

  // Determine the expand path based on role
  const expandPath = role === 'L1'
    ? `/vendor/ticket/${ticketId}/comments`
    : `/helpdesk/ticket/${ticketId}/comments`;

  // Determine if user can see the internal comment checkbox (Helpdesk/Internal users only)
  const canToggleInternal = role === 'L2' || role === 'HelpdeskExecutive';

  // Fetch comments — only when drawer is opened (lazy loading)
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
      skip: !isOpen || !ticketId || !profile?.userCode || !role,
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

  // Handle comment added callback (refetch is handled by RTK Query invalidation)
  const handleCommentAdded = () => {
    // RTK Query will automatically refetch due to tag invalidation
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
              <CommentList
                comments={comments}
                isLoading={isLoading}
                isError={isError}
                error={error}
                size="sm"
              />
            </div>

            {/* ─── Add Comment Section (Fixed at Bottom) ─── */}
            <div className="shrink-0 border-t border-default bg-surface">
              <CommentForm
                ticketId={ticketId}
                onCommentAdded={handleCommentAdded}
                canToggleInternal={canToggleInternal}
                userCode={profile?.userCode}
                role={role}
                size="sm"
              />
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TicketCommentsDrawer;
