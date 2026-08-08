import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { CommentItem } from './CommentItem.jsx';
import { useGetTicketCommentsQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';

/**
 * TicketComments — Reusable component for displaying comments on ticket view pages.
 *
 * Used by:
 * - Vendor Ticket Details page
 * - Helpdesk Ticket View page
 * - Any future ticket view page
 *
 * @param {number|string} ticketId - The ID of the current ticket
 */
export const TicketComments = ({ ticketId }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);

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
  // Vendor users (L1) should NOT see internal comments
  // Helpdesk/Internal users (L2/HelpdeskExecutive) should see all comments
  const comments = useMemo(() => {
    const allComments = commentsResponse?.data || [];
    const isVendorUser = role === 'L1';
    
    if (isVendorUser) {
      // Filter out internal comments for Vendor users
      // visibility !== 'VENDOR' means it's an internal comment
      return allComments.filter(comment => comment.visibility === 'VENDOR');
    }
    
    // Helpdesk/Internal users see all comments
    return allComments;
  }, [commentsResponse, role]);

  const commentCount = comments.length;

  // Loading state
  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-success" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 border-2 border-success border-t-transparent rounded-full animate-spin" />
              <span className="text-secondary text-body">Loading comments...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-success" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-3">
            <AlertCircle className="w-8 h-8 text-danger" />
            <p className="text-body text-secondary text-center">
              {error?.data?.message || error?.data || 'Failed to load comments. Please try again.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Empty state
  if (commentCount === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-success" />
            Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 gap-2">
            <MessageSquare className="w-8 h-8 text-muted" />
            <p className="text-body text-secondary text-center">
              No comments yet. Be the first to comment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Comments list
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-success" />
          Comments ({commentCount})
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-default px-6">
          {comments.map((comment) => (
            <CommentItem key={comment.id || comment.uuid} comment={comment} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TicketComments;
