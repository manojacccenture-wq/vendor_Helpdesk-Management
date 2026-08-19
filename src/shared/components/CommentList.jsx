import { MessageSquare, AlertCircle } from 'lucide-react';
import { CommentItem } from './CommentItem.jsx';

/**
 * CommentList — Reusable component for rendering a list of comments.
 *
 * Handles:
 * - Loading state with spinner
 * - Error state with error message
 * - Empty state with message
 * - Comment list rendering using CommentItem
 *
 * @param {Object} props
 * @param {Array} props.comments - Array of comment objects
 * @param {boolean} props.isLoading - Whether comments are loading
 * @param {boolean} props.isError - Whether an error occurred
 * @param {Object} props.error - Error object if isError is true
 * @param {string} props.className - Additional class for the container
 * @param {string} props.size - 'sm' for compact (drawer) or 'md' for full (page)
 */
export const CommentList = ({
  comments = [],
  isLoading = false,
  isError = false,
  error,
  className,
  size = 'sm',
}) => {
  const commentCount = comments.length;
  const isCompact = size === 'sm';

  return (
    <div className={className}>
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

      {/* Conversation List */}
      {!isLoading && !isError && commentCount > 0 && (
        <div className="divide-y divide-default py-2">
          {comments.map((comment) => (
            <CommentItem key={comment.id || comment.uuid} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentList;
