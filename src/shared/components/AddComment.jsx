import { useState } from 'react';
import { useSelector } from 'react-redux';
import { MessageSquarePlus, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card.jsx';
import { Textarea } from './Textarea.jsx';
import { Button } from './Button.jsx';
import { useAddCommentMutation } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { useNotification } from '../notifications/index.js';
import { cn } from '../utils/cn.js';

/**
 * AddComment — Reusable component for adding comments to ticket view pages.
 * 
 * Used by:
 * - Vendor Ticket Details page
 * - Helpdesk Ticket View page
 * - Any future ticket view page
 * 
 * @param {number|string} ticketId - The ID of the current ticket
 */
export const AddComment = ({ ticketId }) => {
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const { showSuccess, showError } = useNotification();
  
  const [commentText, setCommentText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [addComment, { isLoading }] = useAddCommentMutation();

  // Determine if user can see the internal comment checkbox (Helpdesk/Internal users only)
  const canToggleInternal = role === 'L2' || role === 'HelpdeskExecutive';

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedText = commentText.trim();
    
    // Validate non-empty comment
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

      // Check the response's success flag
      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to add comment. Please try again.');
        return;
      }

      // Success
      showSuccess('Comment added successfully.');
      setCommentText('');
      setIsInternal(false);
    } catch (error) {
      showError(error?.data?.message || 'Failed to add comment. Please try again.');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-success" />
          Add Comment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Textarea
            placeholder="Type your message here..."
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            disabled={isLoading}
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
                  disabled={isLoading}
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
              <span className="flex items-center gap-1.5 text-body text-primary select-none">
                {isInternal ? (
                  <>
                    <EyeOff className="w-4 h-4 text-warning" />
                    <span>Internal comment (not visible to Vendor)</span>
                  </>
                ) : (
                  <>
                    <span>Visible to Vendor</span>
                  </>
                )}
              </span>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              type="submit"
              variant="black"
              disabled={isLoading || !commentText.trim()}
            >
              {isLoading ? (
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
      </CardContent>
    </Card>
  );
};

export default AddComment;
