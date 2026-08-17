import { useState, useEffect } from 'react';
import { Star, ThumbsUp, ThumbsDown, CheckCircle } from 'lucide-react';
import { Button } from './Button.jsx';
import { Textarea } from './Textarea.jsx';
import { Input } from './Input.jsx';
import { useSubmitFeedbackMutation } from '../api/apiSlice.js';
import { useNotification } from '../notifications/index.js';
import { cn } from '../utils/cn.js';
import { formatTicketNo } from '../utils/ticket.js';

/**
 * TicketFeedbackModal — Reusable modal for submitting ticket feedback.
 *
 * Used from both:
 * - Vendor Ticket List (TicketsTable)
 * - Vendor Ticket Details (TicketDetailsView)
 *
 * Features:
 * - 1–5 star rating (required)
 * - Helpful / Not Helpful toggle (required)
 * - Rating comment textarea (optional)
 * - Tags input — comma-separated text (optional)
 * - Submit with loading state
 * - Success confirmation state
 * - Duplicate submission prevention
 * - API success/business-failure/network-error handling
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {string|number} props.ticketId - The ticket ID to submit feedback for
 * @param {string} props.ticketNo - Optional ticket number for display in header
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {Function} props.onSuccess - Callback after successful submission
 */
export const TicketFeedbackModal = ({
  isOpen,
  ticketId,
  ticketNo,
  onClose,
  onSuccess,
}) => {
  const { showSuccess, showError } = useNotification();
  const [submitFeedback, { isLoading: isSubmitting }] = useSubmitFeedbackMutation();

  // Form state
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isHelpful, setIsHelpful] = useState(null); // null = no selection, true/false
  const [ratingComment, setRatingComment] = useState('');
  const [tags, setTags] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setRating(0);
      setHoveredStar(0);
      setIsHelpful(null);
      setRatingComment('');
      setTags('');
      setSubmitted(false);
    }
  }, [isOpen, ticketId]);

  if (!isOpen || !ticketId) return null;

  const isFormValid = rating > 0 && isHelpful !== null;

  const handleSubmit = async () => {
    if (!isFormValid || isSubmitting) return;

    try {
      const response = await submitFeedback({
        ticketId: parseInt(ticketId, 10),
        rating,
        ratingComment: ratingComment.trim(),
        isHelpful,
        tags: tags.trim(),
      }).unwrap();

      if (response?.isSuccessful === false) {
        showError(response?.message || 'Failed to submit feedback. Please try again.');
        return;
      }

      showSuccess('Thank you for your feedback!');
      setSubmitted(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      showError(error?.data?.message || 'Failed to submit feedback. Please try again.');
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isSubmitting ? undefined : handleClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 overflow-hidden max-h-[90vh] flex flex-col">

        {/* ─── Header ─── */}
        <div className="px-6 pt-6 pb-4 border-b border-default shrink-0">
          <h2 className="text-primary page-heading">
            {submitted ? 'Feedback Submitted' : 'Submit Feedback'}
          </h2>
          {ticketNo && (
            <p className="text-secondary text-sm mt-1">
              Ticket: <code>{formatTicketNo(ticketNo)}</code>
            </p>
          )}
        </div>

        {/* ─── Body ─── */}
        <div className="px-6 py-6 overflow-y-auto flex-1">

          {/* ─── Success State ─── */}
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-full bg-success-soft flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-success" />
              </div>
              <p className="text-primary text-center font-medium">
                Thank you for your feedback!
              </p>
              <div className="flex items-center gap-4 text-sm text-secondary">
                <span>Rating: {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
                <span>•</span>
                <span>Helpful: {isHelpful ? 'Yes' : 'No'}</span>
              </div>
              <Button variant="primary" onClick={handleClose} className="mt-2">
                Close
              </Button>
            </div>
          ) : (
            <>
              {/* ─── Star Rating ─── */}
              <div className="mb-6">
                <label className="block text-secondary text-sm mb-2">
                  Rating <span className="text-danger">*</span>
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredStar(star)}
                      onMouseLeave={() => setHoveredStar(0)}
                      disabled={isSubmitting}
                      className="p-0.5 transition-transform hover:scale-110 disabled:cursor-not-allowed"
                      aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                    >
                      <Star
                        className={cn(
                          'w-7 h-7 transition-colors',
                          (hoveredStar || rating) >= star
                            ? 'text-warning fill-warning'
                            : 'text-muted fill-transparent'
                        )}
                      />
                    </button>
                  ))}
                  {rating > 0 && (
                    <span className="ml-2 text-sm text-secondary">
                      {rating}/5
                    </span>
                  )}
                </div>
              </div>

              {/* ─── Was this helpful? ─── */}
              <div className="mb-6">
                <label className="block text-secondary text-sm mb-2">
                  Was this helpful? <span className="text-danger">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setIsHelpful(true)}
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-control border transition-all cursor-pointer disabled:cursor-not-allowed',
                      isHelpful === true
                        ? 'bg-success-soft border-success text-success'
                        : 'bg-surface border-hover hover:border-default text-secondary'
                    )}
                  >
                    <ThumbsUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Yes</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsHelpful(false)}
                    disabled={isSubmitting}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2.5 rounded-control border transition-all cursor-pointer disabled:cursor-not-allowed',
                      isHelpful === false
                        ? 'bg-danger-soft border-danger text-danger'
                        : 'bg-surface border-hover hover:border-default text-secondary'
                    )}
                  >
                    <ThumbsDown className="w-4 h-4" />
                    <span className="text-sm font-medium">No</span>
                  </button>
                </div>
              </div>

              {/* ─── Rating Comment ─── */}
              <div className="mb-6">
                <Textarea
                  label="Comment"
                  placeholder="Share your experience (optional)"
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={500}
                />
                <p className="text-xs text-secondary mt-1">
                  {ratingComment.length}/500
                </p>
              </div>

              {/* ─── Tags ─── */}
              <div className="mb-2">
                <Input
                  label="Tags"
                  placeholder="e.g. fast, helpful, resolved (optional)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  disabled={isSubmitting}
                  maxLength={200}
                />
                <p className="text-xs text-secondary mt-1">
                  Comma-separated tags
                </p>
              </div>
            </>
          )}
        </div>

        {/* ─── Footer (only when form is active) ─── */}
        {!submitted && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-default shrink-0">
            <Button
              variant="ghost"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                'Submit Feedback'
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketFeedbackModal;
