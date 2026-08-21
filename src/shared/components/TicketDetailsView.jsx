import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FileText, AlertCircle, Star } from 'lucide-react';
import { SectionHeading, SectionDivider } from './CollapsibleSection.jsx';

import { Card, CardContent } from './Card.jsx';
import { Button } from './Button.jsx';
import { BackButton } from './BackButton.jsx';
import { TicketHero } from './TicketHero.jsx';
import { DynamicSection } from './DynamicSection.jsx';
import { TicketAttachments } from './TicketAttachments.jsx';
import { TicketFooter } from './TicketFooter.jsx';
import { RemarksConfirmationModal } from './RemarksConfirmationModal.jsx';
import { TicketFeedbackModal } from './TicketFeedbackModal.jsx';
import { useGetTicketDetailsQuery, useGetTicketStatusesQuery } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { formatTicketNo } from '../utils/ticket.js';

/**
 * TicketDetailsView — Single shared Ticket Details component.
 * Compact bill/invoice-style layout.
 *
 * Orchestrates child components for each logical section.
 *
 * @param {Object} props
 * @param {string|number} props.ticketId - The ticket ID (from useParams)
 * @param {string} props.backPath - Navigation path for back button
 * @param {boolean} props.showUpdatedBy - Whether to show "Updated By" in Ownership
 */
export const TicketDetailsView = ({
  ticketId,
  backPath,
  showUpdatedBy = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [remarksModalOpen, setRemarksModalOpen] = useState(false);
  const [pendingStatusText, setPendingStatusText] = useState('');
  const [pendingStatusId, setPendingStatusId] = useState(null);

  const { data: ticketDetails, isLoading, isError, error } = useGetTicketDetailsQuery({
    ticketId,
    role,
    userCode: profile?.userCode
  }, {
    skip: !ticketId || !profile?.userCode || !role
  });

  const isDepartmentRole = ['BL1', 'HOD', 'VH', 'MD'].includes(role);

  const { data: ticketStatuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery(undefined, {
    skip: !isDepartmentRole
  });

  const handleStatusAction = (targetStatusText) => {
    const statusObj = ticketStatuses.find(s => (s.text ?? s.Text)?.toLowerCase() === targetStatusText.toLowerCase());
    if (!statusObj) return;

    const statusId = parseInt(statusObj.value ?? statusObj.Value, 10);
    setPendingStatusText(targetStatusText);
    setPendingStatusId(statusId);
    setRemarksModalOpen(true);
  };

  const canUpdateStatus = role === 'L2' || role === 'HelpdeskExecutive';

  // Visibility flags passed from ticket list via route state
  const visibilityFlags = location.state || {};

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to={backPath} />
          <div className="flex flex-col gap-1">
            <h1 className="text-primary">Ticket Details</h1>
            <p className="text-secondary">Loading ticket information...</p>
          </div>
        </div>
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-success border-t-transparent rounded-full animate-spin" />
              <span className="text-secondary">Loading ticket details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Error State ───
  if (isError) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to={backPath} />
          <h1 className="text-primary">Ticket Details</h1>
        </div>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-12 h-12 text-danger" />
            <div className="text-center">
              <h3 className="text-primary mb-2">Failed to load ticket details</h3>
              <p className="text-secondary mb-4">
                {error?.data || 'An error occurred while loading the ticket details.'}
              </p>
              <Button variant="primary" onClick={() => navigate(backPath)}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Ticket Not Found ───
  if (!ticketDetails) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to={backPath} />
          <h1 className="text-primary">Ticket Details</h1>
        </div>
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <FileText className="w-12 h-12 text-secondary" />
            <div className="text-center">
              <h3 className="text-primary mb-2">Ticket not found</h3>
              <p className="text-secondary mb-4">
                The ticket you're looking for doesn't exist or has been removed.
              </p>
              <Button variant="primary" onClick={() => navigate(backPath)}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Extract top-level fields from API response ───
  const ticketNo = formatTicketNo(ticketDetails.ticketNo || ticketDetails.ticketNumber || `#${ticketId}`);
  const subject = ticketDetails.subject || ticketDetails.ticketSubject || 'No subject';
  const description = ticketDetails.description || ticketDetails.ticketDescription;
  const priority = ticketDetails.priority;
  const status = ticketDetails.status || 'Unknown';
  const statusColorHex = ticketDetails.statusColorHex;

  const attachments = ticketDetails.attachments || [];
  const ticketHistoryStages = ticketDetails.ticketHistoryStages || [];
  const sections = ticketDetails.sections || [];

  // Hide "Processing & Assignment" section from Vendor role
  const visibleSections = role === 'L1'
    ? sections.filter(s => s.title !== 'Processing & Assignment')
    : sections;

  return (
    <div className="flex flex-col w-full max-w-[1200px] mx-auto px-4 sm:px-6">

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton to={backPath} />
        <h1 className="text-primary">Ticket Details</h1>
      </div>

      {/* Single Card — Compact Bill-Style Layout */}
      <Card className="w-full">
        <CardContent className="p-0">

          {/* Hero */}
          <TicketHero
            ticketId={ticketId}
            ticketNo={ticketNo}
            status={status}
            statusColorHex={statusColorHex}
            priority={priority}
            canUpdateStatus={canUpdateStatus}
            ticketDetails={ticketDetails}
            subject={subject}
            ticketHistoryStages={ticketHistoryStages}
            visibleCommentButton={visibilityFlags.visibleCommentButton}
            visibleAssignButton={visibilityFlags.visibleAssignButton}
            visibleFeedbackButton={visibilityFlags.visibleFeedbackButton}
          />

          {/* Description */}
          <div className="px-5 py-3 border-b border-default">
            <SectionHeading>Description</SectionHeading>
            <div className="bg-surface-hover rounded-control px-4 py-3 border border-default">
              <p className="text-body text-primary whitespace-pre-wrap">{description || '—'}</p>
            </div>
          </div>

          {/* Dynamic Sections from API */}
          {visibleSections.map((section, index) => (
            <DynamicSection
              key={section.title || index}
              title={section.title}
              fields={section.fields || []}
              defaultOpen={index === 0}
            />
          ))}

          {/* Attachments */}
          <TicketAttachments attachments={attachments} />

          {/* Feedback (Vendor only, Closed status only) */}
          {role === 'L1' && (ticketDetails?.statusId === 5 || status?.toLowerCase() === 'closed') && (
            <div className="px-5 py-3">
              <SectionHeading>Feedback</SectionHeading>
              <SectionDivider />
              <div className="flex items-center justify-between">
                <p className="text-secondary text-sm">Share your experience with this ticket resolution.</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsFeedbackModalOpen(true)}
                  className="shrink-0"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Leave Feedback
                </Button>
              </div>
            </div>
          )}

        </CardContent>
      </Card>

      {/* Footer */}
      <TicketFooter
        isDepartmentRole={isDepartmentRole}
        onStatusAction={handleStatusAction}
        isUpdatingStatus={false}
        isLoadingStatuses={isLoadingStatuses}
        ticketStatuses={ticketStatuses}
        backPath={backPath}
      />

      {/* Remarks Confirmation Modal (Department roles) */}
      <RemarksConfirmationModal
        isOpen={remarksModalOpen}
        ticketId={ticketId}
        targetStatusText={pendingStatusText}
        targetStatusId={pendingStatusId}
        ticketDetails={ticketDetails}
        onClose={() => setRemarksModalOpen(false)}
      />

      {/* Feedback Modal (Vendor only) */}
      {role === 'L1' && (
        <TicketFeedbackModal
          isOpen={isFeedbackModalOpen}
          ticketId={ticketId}
          ticketNo={ticketNo}
          onClose={() => setIsFeedbackModalOpen(false)}
        />
      )}

    </div>
  );
};

export default TicketDetailsView;
