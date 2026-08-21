import { useState, useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Maximize2 } from 'lucide-react';
import { Drawer } from './Drawer.jsx';
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
 * @param {string} [ticketNo] - Formatted ticket number for email notifications
 * @param {string} [ticketSubject] - Ticket subject for email notifications
 * @param {string} [vendorEmail] - Vendor's email address for notification recipients
 */
export const TicketCommentsDrawer = ({ ticketId, ticketNo, ticketSubject, vendorEmail }) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const scrollContainerRef = useRef(null);

  // Determine the expand path based on role
  const expandPath = role === 'L1'
    ? `/vendor/ticket/${ticketId}/comments`
    : ['BL1', 'HOD', 'VH', 'MD'].includes(role)
      ? `/department/ticket/${ticketId}/comments`
      : `/helpdesk/ticket/${ticketId}/comments`;

  // Determine if user can see the internal comment checkbox (enabled for everyone, disabled for Vendor inside CommentForm)
  const canToggleInternal = true;

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
        <span className="font-medium">Conversation</span>
        {commentCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-success text-white text-caption font-medium">
            {commentCount}
          </span>
        )}
      </button>

      {/* ═══════════════════════════════════════════════════════════
          DRAWER OVERLAY
      ═══════════════════════════════════════════════════════════ */}
      <Drawer
        open={isOpen}
        onClose={() => setIsOpen(false)}
        resizable
        title={
          <span className="text-body font-semibold">
            Conversation {commentCount > 0 ? `(${commentCount})` : ''}
          </span>
        }
        icon={<MessageSquare className="w-5 h-5 text-success" />}
        headerActions={(onClose) => (
          <button
            type="button"
            onClick={() => {
              onClose();
              navigate(expandPath);
            }}
            className="p-2 rounded-control text-secondary hover:bg-surface-active hover:text-primary transition-colors"
            aria-label="Open full page"
            title="Open full page"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
        )}
        scrollableRef={scrollContainerRef}
        scrollableClassName="px-6"
        ariaLabel="Close comments"
        footer={
          <CommentForm
            ticketId={ticketId}
            ticketNo={ticketNo}
            ticketSubject={ticketSubject}
            onCommentAdded={handleCommentAdded}
            canToggleInternal={canToggleInternal}
            userCode={profile?.userCode}
            role={role}
            vendorEmail={vendorEmail}
            size="sm"
          />
        }
      >
        <CommentList
          comments={comments}
          isLoading={isLoading}
          isError={isError}
          error={error}
          size="sm"
        />
      </Drawer>
    </>
  );
};

export default TicketCommentsDrawer;
