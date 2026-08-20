import { useMemo, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { BackButton } from './BackButton.jsx';
import { Card, CardHeader, CardTitle } from './Card.jsx';
import { TicketHistoryDrawer } from './TicketHistoryDrawer.jsx';
import { CommentForm } from './CommentForm.jsx';
import { CommentList } from './CommentList.jsx';
import { useGetTicketCommentsQuery, useGetTicketDetailsQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { formatTicketNo } from '../utils/ticket.js';

/**
 * TicketCommentsPage — Full-page comments view for a ticket.
 *
 * Used by:
 * - Vendor ticket comments page
 * - Helpdesk ticket comments page
 *
 * @param {string} backPath - Path to navigate back to (e.g., '/vendor/ticket/123')
 */
export const TicketCommentsPage = ({ backPath }) => {
  const { id } = useParams();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const scrollContainerRef = useRef(null);

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
  const ticketNo = formatTicketNo(ticketDetails?.ticketNo || ticketDetails?.ticketNumber || `#${id}`);
  const subject = ticketDetails?.subject || ticketDetails?.ticketSubject || '';
  const ticketHistoryStages = ticketDetails?.ticketHistoryStages || [];

  // Auto-scroll to bottom when new comments are added
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [commentCount]);

  // Handle comment added callback (refetch is handled by RTK Query invalidation)
  const handleCommentAdded = () => {
    // RTK Query will automatically refetch due to tag invalidation
  };

  return (
    <div className="flex flex-col h-full w-full max-w-[900px] mx-auto">
      
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER
      ═══════════════════════════════════════════════════════════ */}
      <div className="flex items-center gap-4 mb-6">
        <BackButton to={backPath} label="Back to Ticket" />
      </div>

      {/* Ticket Reference */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-success" />
          <h1 className="text-page-title text-primary">
            Conversation
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-success" />
              Conversation {commentCount > 0 && `(${commentCount})`}
            </CardTitle>
            <TicketHistoryDrawer ticketId={id} stages={ticketHistoryStages} />
          </div>
        </CardHeader>

        {/* Conversation List (Scrollable) */}
        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto px-6"
        >
          <CommentList
            comments={comments}
            isLoading={isLoading}
            isError={isError}
            error={error}
            size="md"
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════
            ADD COMMENT SECTION (Fixed at Bottom)
        ═══════════════════════════════════════════════════════════ */}
        <div className="shrink-0 border-t border-default">
          <CommentForm
            ticketId={id}
            ticketNo={ticketNo}
            ticketSubject={subject}
            onCommentAdded={handleCommentAdded}
            canToggleInternal={canToggleInternal}
            userCode={profile?.userCode}
            role={role}
            size="md"
          />
        </div>
      </Card>
    </div>
  );
};

export default TicketCommentsPage;
