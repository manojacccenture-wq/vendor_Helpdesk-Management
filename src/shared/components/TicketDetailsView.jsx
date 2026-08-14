import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText, Calendar, User, Building2, Clock, AlertCircle, Tag, Layers, Paperclip, Pencil, Star } from 'lucide-react';
import { CollapsibleSection, SectionHeading, SectionDivider } from './CollapsibleSection.jsx';

import { Card, CardContent } from './Card.jsx';
import { Button } from './Button.jsx';
import { BackButton } from './BackButton.jsx';
import { StatusBadge } from './StatusBadge.jsx';
import { UpdateTicketStatusModal } from './UpdateTicketStatusModal.jsx';
import { TicketFeedbackModal } from './TicketFeedbackModal.jsx';
import { TicketCommentsDrawer } from './TicketCommentsDrawer.jsx';
import { TicketHistoryDrawer } from './TicketHistoryDrawer.jsx';
import { useGetTicketDetailsQuery, useGetTicketStatusesQuery, useUpdateTicketStatusMutation } from '../api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../features/user/store/selectors.js';
import { downloadTicketAttachment } from '../utils/download.js';
import { formatDate, formatFileSize } from '../utils/date.js';
import { useNotification } from '../notifications/index.js';

// ─── Internal Helper Components (Compact Bill-Style) ───

/** Compact key-value row for bill-style layout */
const FieldRow = ({ label, value }) => (
  <div className="flex items-baseline gap-2 py-1">
    <span className="text-caption text-secondary whitespace-nowrap">{label}</span>
    <span className="text-caption text-secondary">:</span>
    <span className="text-body text-primary truncate">{value || '—'}</span>
  </div>
);



/** Chip for displaying tags, categories, etc. */
const InfoChip = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-surface-active text-secondary border border-default">
    {children}
  </span>
);

/**
 * TicketDetailsView — Single shared Ticket Details component.
 * Compact bill/invoice-style layout.
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
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const [downloadingAttachments, setDownloadingAttachments] = useState(new Set());
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const { showSuccess, showError } = useNotification();

  const { data: ticketDetails, isLoading, isError, error } = useGetTicketDetailsQuery({
    ticketId,
    role,
    userCode: profile?.userCode
  }, {
    skip: !ticketId || !profile?.userCode || !role
  });

  const isDepartmentRole = ['BL1', 'HOD', 'VH', 'MD'].includes(role);

  // Fetch ticket statuses for Department roles dynamic button mapping
  const { data: ticketStatuses = [], isLoading: isLoadingStatuses } = useGetTicketStatusesQuery(undefined, {
    skip: !isDepartmentRole
  });
  
  const [updateTicketStatus, { isLoading: isUpdatingStatus }] = useUpdateTicketStatusMutation();

  const handleStatusAction = async (targetStatusText) => {
    // Find the correct status ID from the dynamic list
    const statusObj = ticketStatuses.find(s => (s.text ?? s.Text)?.toLowerCase() === targetStatusText.toLowerCase());
    if (!statusObj) {
      showError(`Status '${targetStatusText}' is not currently available from the server.`);
      return;
    }
    
    const statusId = parseInt(statusObj.value ?? statusObj.Value, 10);
    
    try {
      const response = await updateTicketStatus({ ticketId, status: statusId }).unwrap();
      if (response?.isSuccessful === false) {
        showError(response?.message || `Failed to update status to ${targetStatusText}.`);
        return;
      }
      showSuccess(response?.message || `Status successfully updated to ${targetStatusText}.`);
    } catch (err) {
      showError(err?.data?.message || `Failed to update status. Please try again.`);
    }
  };

  const canUpdateStatus = role === 'L2' || role === 'HelpdeskExecutive';

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1000px] mx-auto px-4 sm:px-6">
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
      <div className="flex flex-col gap-4 w-full max-w-[1000px] mx-auto px-4 sm:px-6">
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
      <div className="flex flex-col gap-4 w-full max-w-[1000px] mx-auto px-4 sm:px-6">
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

  // ─── Extract fields from API response ───
  const ticketNo = ticketDetails.ticketNo || ticketDetails.ticketNumber || `#${ticketId}`;
  const subject = ticketDetails.subject || ticketDetails.ticketSubject || 'No subject';
  const category = ticketDetails.category || ticketDetails.ticketCategory;
  const subcategory = ticketDetails.subcategory;
  const source = ticketDetails.ticketSource;
  const description = ticketDetails.ticketDescription;
  const priority = ticketDetails.priority;
  const status = ticketDetails.status || 'Unknown';
  const statusColorHex = ticketDetails.statusColorHex;

  // Vendor-submitted fields
  const vendorName = ticketDetails.vendorName;
  const refNo = ticketDetails.refNo;
  const tags = ticketDetails.tags;
  const btsNo = ticketDetails.btsNo;
  const billSubmittedDate = ticketDetails.billSubmittedDate;
  const processingDays = ticketDetails.noProcessingDays;

  // Workflow/system-generated fields
  const createdAt = formatDate(ticketDetails.ticketCreatedAt || ticketDetails.createdAt || ticketDetails.createAt);
  const updatedAt = formatDate(ticketDetails.ticketUpdatedAt);
  const createdBy = ticketDetails.ticketCreatedBy;
  const updatedBy = ticketDetails.ticketUpdatedBy;
  const dueAt = formatDate(ticketDetails.dueAt);
  const firstResponseAt = formatDate(ticketDetails.firstResponseAt);
  const resolvedAt = formatDate(ticketDetails.resolvedAt);
  const closedAt = formatDate(ticketDetails.closedAt);

  const assignedDept = ticketDetails.assignedDepartmentId;
  const assignedAgent = ticketDetails.assignedAgentId;

  // Escalation fields
  const isEscalated = ticketDetails.isEscalated;
  const escalationLevel = ticketDetails.escalationLevel;
  const reopenedCount = ticketDetails.reopenedCount;

  const attachments = ticketDetails.attachments || [];
  const hasAttachments = attachments.length > 0;

  const ticketHistoryViewModels = ticketDetails.ticketHistoryViewModels || [];


  return (
    <div className="flex flex-col w-full max-w-[1000px] mx-auto px-4 sm:px-6">

      {/* Page Header */}
      <div className="flex items-center gap-4 mb-4">
        <BackButton to={backPath} />
        <h1 className="text-primary">Ticket Details</h1>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          SINGLE CARD — Compact Bill-Style Layout
      ═══════════════════════════════════════════════════════════ */}
      <Card className="w-full">
        <CardContent className="p-0">

          {/* ─── Hero: Ticket Number + Status + Subject (UNCHANGED) ─── */}
          <div className="px-5 pt-4 pb-3 border-b border-default">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-3">
                <span className="text-ticket-id font-mono text-secondary">{ticketNo}</span>
                <StatusBadge status={status} colorHex={statusColorHex} />
                {canUpdateStatus && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsStatusModalOpen(true)}
                    className="p-1 h-auto hover:text-primary"
                    title="Update status"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  {priority && (
                    <InfoChip>{priority}</InfoChip>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <TicketCommentsDrawer ticketId={ticketId} />
                <TicketHistoryDrawer history={ticketHistoryViewModels} />
              </div>
            </div>

            <h2 className="text-card-title text-primary">{subject}</h2>
          </div>

          {/* ─── Description (Compact) ─── */}
          <div className="px-5 py-3 border-b border-default">
            <SectionHeading>Description</SectionHeading>
            <div className="bg-surface-hover rounded-control px-4 py-3 border border-default">
              <p className="text-body text-primary whitespace-pre-wrap">{description || '—'}</p>
            </div>
          </div>

          {/* ─── Ticket Information (2-Column Key-Value) ─── */}
          <CollapsibleSection title="Ticket Information" defaultOpen={true}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <FieldRow label="Vendor" value={vendorName} />
                <FieldRow label="Reference No" value={refNo} />
                <FieldRow label="Source" value={source} />
                <FieldRow label="BTS Number" value={btsNo} />
                <FieldRow label="Processing Days" value={processingDays} />
              </div>
              <div>
                <FieldRow label="Category" value={category} />
                <FieldRow label="Sub Category" value={subcategory} />
                <FieldRow label="Tags" value={tags} />
                <FieldRow label="Bill Submitted" value={billSubmittedDate ? formatDate(billSubmittedDate) : null} />
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── Processing & Assignment (2-Column Key-Value) ─── */}
          <CollapsibleSection title="Processing & Assignment" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
              <div>
                <FieldRow label="Assigned Dept" value={assignedDept ? `Department #${assignedDept}` : null} />
                <FieldRow label="Assigned Agent" value={assignedAgent ? `Agent #${assignedAgent}` : null} />
                <FieldRow label="Escalated" value={isEscalated === true ? 'Yes' : isEscalated === false ? 'No' : null} />
                <FieldRow label="Escalation Level" value={escalationLevel ?? null} />
              </div>
              <div>
                <FieldRow label="Created By" value={createdBy} />
                {/* {showUpdatedBy && (
                  <FieldRow label="Updated By" value={updatedBy} />
                )} */}
                <FieldRow label="Reopened" value={reopenedCount ?? null} />
              </div>
            </div>
          </CollapsibleSection>

          {/* ─── Timeline (2-Column Key-Value & History) ─── */}
          <CollapsibleSection title="Timeline" defaultOpen={false}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 mb-6">
              <div>
                <FieldRow label="Created" value={createdAt} />
                <FieldRow label="Due Date" value={dueAt} />
                <FieldRow label="Resolved" value={resolvedAt} />
              </div>
              <div>
                <FieldRow label="Updated" value={updatedAt} />
                <FieldRow label="First Response" value={firstResponseAt} />
                <FieldRow label="Closed" value={closedAt} />
              </div>
            </div>


          </CollapsibleSection>

          {/* ─── Attachments (Compact) ─── */}
          <div className="px-5 py-3 border-b border-default">
            <SectionHeading>Attachments</SectionHeading>
            <SectionDivider />
            {hasAttachments ? (
              <div className="flex flex-col gap-1">
                {attachments.map((attachment, index) => (
                  <div
                    key={attachment.uuid || index}
                    className="flex items-center justify-between py-1.5"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-secondary shrink-0" />
                      <span className="text-body text-primary truncate">{attachment.originalFileName}</span>
                      <span className="text-caption text-secondary">
                        {formatFileSize(attachment.fileSizeBytes)} • {attachment.mimeType}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Download ${attachment.originalFileName}`}
                      disabled={downloadingAttachments.has(attachment.uuid)}
                      onClick={async () => {
                        if (downloadingAttachments.has(attachment.uuid)) return;

                        setDownloadingAttachments(prev => new Set([...prev, attachment.uuid]));
                        try {
                          await downloadTicketAttachment(
                            attachment.uuid,
                            attachment.originalFileName
                          );
                        } catch {
                          // Error already handled in download utility
                        } finally {
                          setDownloadingAttachments(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(attachment.uuid);
                            return newSet;
                          });
                        }
                      }}
                    >
                      {downloadingAttachments.has(attachment.uuid) ? (
                        <div className="w-4 h-4 border-2 border-secondary border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 py-1">
                <FileText className="w-4 h-4 text-secondary" />
                <span className="text-caption text-secondary">No attachments available</span>
              </div>
            )}
          </div>

          {/* ─── Feedback (Vendor only, Closed status only) ─── */}
          {role === 'L1' && ticketDetails?.statusId === 5 && (
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
      <div className="flex justify-between items-center py-4">
        <div className="flex-1">
          {isDepartmentRole && (
            <div className="flex flex-wrap gap-2">
              <Button 
                className="bg-priority-medium text-priority-medium-text hover:opacity-90"
                onClick={() => handleStatusAction('On Hold')}
                disabled={isUpdatingStatus || isLoadingStatuses}
              >
                Put on hold
              </Button>
              <Button 
                className="bg-info text-white hover:opacity-90"
                onClick={() => handleStatusAction('Resolved')}
                disabled={isUpdatingStatus || isLoadingStatuses}
              >
                Resolved
              </Button>
              {/* Only render Cancel button if the backend provides a Cancel status */}
              {ticketStatuses.some(s => {
                const txt = (s.text ?? s.Text)?.toLowerCase();
                return txt === 'cancel' || txt === 'cancelled';
              }) && (
                <Button 
                  className="bg-priority-escalate text-priority-escalate-text hover:opacity-90"
                  onClick={() => {
                    const cancelStr = ticketStatuses.find(s => {
                      const txt = (s.text ?? s.Text)?.toLowerCase();
                      return txt === 'cancel' || txt === 'cancelled';
                    });
                    handleStatusAction(cancelStr?.text ?? cancelStr?.Text);
                  }}
                  disabled={isUpdatingStatus || isLoadingStatuses}
                >
                  Cancel
                </Button>
              )}
            </div>
          )}
        </div>
        <Button variant="black" onClick={() => navigate(backPath)} className="ml-4">
          Back to Dashboard
        </Button>
      </div>

      {/* Status Update Modal (Helpdesk Executive only) */}
      {canUpdateStatus && (
        <UpdateTicketStatusModal
          isOpen={isStatusModalOpen}
          ticketId={ticketId}
          currentStatus={status}
          onClose={() => setIsStatusModalOpen(false)}
        />
      )}

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
