import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText, Calendar, User, Building2, Clock, AlertCircle, Tag, Layers, Paperclip } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../../shared/components/Card.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { BackButton } from '../../../../../shared/components/BackButton.jsx';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { useGetTicketDetailsQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile, selectUserRole } from '../../../../../features/user/store/selectors.js';
import { downloadTicketAttachment } from '../../../../../shared/utils/download.js';
import { formatDate, formatFileSize } from '../../../../../shared/utils/date.js';
import { AddComment } from '../../../../../shared/components/AddComment.jsx';
import { TicketComments } from '../../../../../shared/components/TicketComments.jsx';

// Field display with label and value — gracefully handles null
const DetailField = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-2.5">
    {Icon && <Icon className="w-4 h-4 text-secondary shrink-0 mt-0.5" />}
    <div className="min-w-0 flex-1">
      <p className="text-caption text-secondary">{label}</p>
      <p className="text-body text-primary">{value || '—'}</p>
    </div>
  </div>
);

// Compact metadata cell for processing card
const MetaCell = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2 py-2 px-3 bg-surface-hover rounded-control border border-default">
    {Icon && <Icon className="w-4 h-4 text-secondary shrink-0" />}
    <div className="min-w-0">
      <p className="text-caption text-secondary truncate">{label}</p>
      <p className="text-body text-primary truncate">{value || '—'}</p>
    </div>
  </div>
);

// Timeline item for the processing card
const TimelineItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2">
    {Icon && <Icon className="w-4 h-4 text-secondary shrink-0" />}
    <span className="text-caption text-secondary">{label}:</span>
    <span className="text-body text-primary">{value || '—'}</span>
  </div>
);

// Chip for displaying tags, categories, etc.
const InfoChip = ({ children }) => (
  <span className="inline-flex items-center px-3 py-1 rounded-full text-caption bg-surface-active text-secondary border border-default">
    {children}
  </span>
);

/**
 * HelpdeskTicketView — Ticket details page for Helpdesk role (L2/HelpdeskExecutive)
 *
 * Card 1 (Primary): Ticket Information
 * Card 2 (Secondary): Processing Information
 * Card 3: Add Comment
 */
export const HelpdeskTicketView = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const profile = useSelector(selectUserProfile);
  const role = useSelector(selectUserRole);
  const [downloadingAttachments, setDownloadingAttachments] = useState(new Set());

  const { data: ticketDetails, isLoading, isError, error } = useGetTicketDetailsQuery({
    ticketId: id,
    role,
    userCode: profile?.userCode
  }, {
    skip: !id || !profile?.userCode || !role
  });

  const handleBack = () => {
    navigate('/helpdesk');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to="/helpdesk" />
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

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to="/helpdesk" />
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
              <Button variant="primary" onClick={handleBack}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Ticket not found
  if (!ticketDetails) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to="/helpdesk" />
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
              <Button variant="primary" onClick={handleBack}>
                Back to Dashboard
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Extract fields from API response ───
  const ticketNo = ticketDetails.ticketNo || ticketDetails.ticketNumber || `#${id}`;
  const subject = ticketDetails.subject || ticketDetails.ticketSubject || 'No subject';
  const category = ticketDetails.category || ticketDetails.ticketCategory;
  const subcategory = ticketDetails.subcategory;
  const source = ticketDetails.ticketSource;
  const description = ticketDetails.ticketDescription;
  const priority = ticketDetails.priority;
  const status = ticketDetails.status || 'Unknown';

  // Vendor-submitted fields
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

  const attachments = ticketDetails.attachments || [];
  const hasAttachments = attachments.length > 0;

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto px-4 sm:px-6">

      {/* Page Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/helpdesk" />
        <h1 className="text-primary">Ticket Details</h1>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CARD 1 — PRIMARY: Ticket Information
      ═══════════════════════════════════════════════════════════ */}
      <Card className="w-full">
        <CardContent className="p-0">

          {/* ─── Hero: Ticket Number + Status + Subject ─── */}
          <div className="px-6 pt-5 pb-4 border-b border-default">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-ticket-id font-mono text-secondary">{ticketNo}</span>
                <StatusBadge status={status} />
                <div className="flex items-center gap-2">
                  {priority && (
                    <InfoChip>{priority}</InfoChip>
                  )}
                </div>
              </div>
            </div>

            <h2 className="text-card-title text-primary">{subject}</h2>
          </div>

          {/* ─── Description ─── */}
          <div className="px-6 py-5 border-b border-default">
            <p className="text-section-label text-secondary mb-2">Description</p>
            <div className="bg-surface-hover rounded-control p-5 border border-default">
              <p className="text-body text-primary whitespace-pre-wrap">{description || '—'}</p>
            </div>
          </div>

          {/* ─── Vendor-Submitted Fields Grid ─── */}
          <div className="px-6 py-4 border-b border-default">
            <p className="text-section-label text-secondary mb-3">Submission Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6">
              <DetailField label="Category" value={category} icon={Tag} />
              <DetailField label="Sub Category" value={subcategory} icon={Tag} />
              <DetailField label="Source" value={source} icon={Layers} />
              <DetailField label="Tags" value={tags} icon={Tag} />
              <DetailField label="BTS Number" value={btsNo} icon={FileText} />
              <DetailField
                label="Bill Submitted Date"
                value={billSubmittedDate ? formatDate(billSubmittedDate) : null}
                icon={Calendar}
              />
              <DetailField label="Number of Processing Days" value={processingDays} icon={Clock} />
            </div>
          </div>

          {/* ─── Attachments ─── */}
          <div className="px-6 py-5">
            <div className="flex items-center gap-2 mb-3">
              <Paperclip className="w-4 h-4 text-secondary" />
              <p className="text-section-label text-secondary">Attachments</p>
            </div>
            {hasAttachments ? (
              <div className="flex flex-col gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={attachment.uuid || index}
                    className="flex items-center justify-between py-2 px-3 bg-surface-hover rounded-control border border-default"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <FileText className="w-4 h-4 text-secondary shrink-0" />
                      <div className="min-w-0">
                        <p className="text-body text-primary truncate">{attachment.originalFileName}</p>
                        <p className="text-caption text-secondary">
                          {formatFileSize(attachment.fileSizeBytes)} • {attachment.mimeType}
                        </p>
                      </div>
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
              <div className="flex items-center gap-3 py-2">
                <FileText className="w-4 h-4 text-secondary" />
                <p className="text-caption text-secondary">No attachments available</p>
              </div>
            )}
          </div>

        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          CARD 2 — SECONDARY: Processing Information
      ═══════════════════════════════════════════════════════════ */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-success" />
            Processing Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">

          {/* ─── Assignment ─── */}
          <div className="px-6 py-4 border-b border-default">
            <p className="text-section-label text-secondary mb-3">Assignment</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <MetaCell label="Assigned Department" value={assignedDept ? `Department #${assignedDept}` : null} icon={Building2} />
              <MetaCell label="Assigned Agent" value={assignedAgent ? `Agent #${assignedAgent}` : null} icon={User} />
            </div>
          </div>

          {/* ─── Ownership ─── */}
          <div className="px-6 py-4 border-b border-default">
            <p className="text-section-label text-secondary mb-3">Ownership</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <MetaCell label="Created By" value={createdBy} icon={User} />
              <MetaCell label="Updated By" value={updatedBy} icon={User} />
            </div>
          </div>

          {/* ─── Timeline ─── */}
          <div className="px-6 py-4">
            <p className="text-section-label text-secondary mb-3">Timeline</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <TimelineItem label="Created" value={createdAt} icon={Calendar} />
              <TimelineItem label="Updated" value={updatedAt} icon={Clock} />
              <TimelineItem label="Due Date" value={dueAt} icon={Calendar} />
              <TimelineItem label="First Response" value={firstResponseAt} icon={Clock} />
              <TimelineItem label="Resolved" value={resolvedAt} icon={Clock} />
              <TimelineItem label="Closed" value={closedAt} icon={Clock} />
            </div>
          </div>

        </CardContent>
      </Card>

      {/* ═══════════════════════════════════════════════════════════
          CARD 3 — COMMENTS
      ═══════════════════════════════════════════════════════════ */}
      <TicketComments ticketId={id} />

      {/* ═══════════════════════════════════════════════════════════
          CARD 4 — ADD COMMENT
      ═══════════════════════════════════════════════════════════ */}
      <AddComment ticketId={id} />

      {/* Footer */}
      <div className="flex justify-end pb-4">
        <Button variant="black" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </div>

    </div>
  );
};
