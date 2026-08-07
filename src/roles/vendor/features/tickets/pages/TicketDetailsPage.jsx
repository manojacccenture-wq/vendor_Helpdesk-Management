import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText, Calendar, User, Building2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '../../../../../shared/components/Card.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { BackButton } from '../../../../../shared/components/BackButton.jsx';
import { StatusBadge } from '../../../../../shared/components/StatusBadge.jsx';
import { useGetTicketDetailsQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';
import { downloadTicketAttachment } from '../../../../../shared/utils/download.js';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return null;
  }
};

// Format file size helper
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Compact metadata cell
const MetaCell = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2 py-2 px-3 bg-surface-hover rounded-control border border-default">
    {Icon && <Icon className="w-4 h-4 text-secondary shrink-0" />}
    <div className="min-w-0">
      <p className="text-caption text-secondary truncate">{label}</p>
      <p className="text-body text-primary truncate">{value || '—'}</p>
    </div>
  </div>
);

// Timeline strip item
const TimelineItem = ({ label, value, icon: Icon }) => (
  <div className="flex items-center gap-2">
    {Icon && <Icon className="w-4 h-4 text-secondary shrink-0" />}
    <span className="text-caption text-secondary">{label}:</span>
    <span className="text-body text-primary">{value || '—'}</span>
  </div>
);

export const TicketDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const profile = useSelector(selectUserProfile);
  const [downloadingAttachments, setDownloadingAttachments] = useState(new Set());

  const { data: ticketDetails, isLoading, isError, error } = useGetTicketDetailsQuery(id, {
    skip: !id
  });

  const handleBack = () => {
    navigate('/vendor');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <BackButton to="/vendor" />
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
          <BackButton to="/vendor" />
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
          <BackButton to="/vendor" />
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

  const ticketNo = ticketDetails.ticketNo || ticketDetails.ticketNumber || `#${id}`;
  const subject = ticketDetails.subject || ticketDetails.ticketSubject || 'No subject';
  const category = ticketDetails.category || ticketDetails.ticketCategory;
  const subcategory = ticketDetails.subcategory;
  const source = ticketDetails.ticketSource;
  const description = ticketDetails.ticketDescription;
  const priority = ticketDetails.priority;

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

  const tags = ticketDetails.tags;
  const btsNo = ticketDetails.btsNo;
  const billSubmittedDate = formatDate(ticketDetails.billSubmittedDate);
  const processingDays = ticketDetails.noProcessingDays;

  const hasAdditionalInfo = tags || btsNo || billSubmittedDate || processingDays;
  const hasAttachments = ticketDetails.attachments && ticketDetails.attachments.length > 0;

  return (
    <div className="flex flex-col gap-4 w-full max-w-[1200px] mx-auto px-4 sm:px-6">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/vendor" />
        <h1 className="text-primary">Ticket Details</h1>
      </div>

      {/* Single Card — Enterprise Layout */}
      <Card className="w-full">
        <CardContent className="p-0">

          {/* ─── Hero Header ─── */}
          <div className="px-6 pt-6 pb-5 bg-surface-hover border-b-2 border-default">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-ticket-id font-mono text-secondary">{ticketNo}</span>
                  <StatusBadge status={ticketDetails.status || 'Unknown'} />
                  {priority && (
                    <span className="px-2 py-0.5 rounded-full text-caption bg-surface-hover border border-default text-secondary">
                      {priority}
                    </span>
                  )}
                </div>
                <h2 className="text-card-title text-primary">{subject}</h2>
              </div>
            </div>
            {/* Category chips */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              {category && (
                <span className="px-3 py-1 rounded-full text-caption bg-surface-hover border border-default text-secondary">
                  {category}
                </span>
              )}
              {subcategory && (
                <span className="px-3 py-1 rounded-full text-caption bg-surface-hover border border-default text-secondary">
                  {subcategory}
                </span>
              )}
              {source && (
                <span className="px-3 py-1 rounded-full text-caption bg-surface-hover border border-default text-secondary">
                  Source: {source}
                </span>
              )}
            </div>
          </div>

          {/* ─── Description ─── */}
          {description && (
            <div className="px-6 py-5 border-b border-default">
              <p className="text-section-label text-secondary mb-2">Description</p>
              <div className="bg-surface-hover rounded-control p-5 border border-default">
                <p className="text-body text-primary whitespace-pre-wrap">{description}</p>
              </div>
            </div>
          )}

          {/* ─── Assignment + Metadata Grid ─── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:divide-x divide-default">
            
            {/* Left: Assignment */}
            <div className="px-6 py-4">
              <p className="text-section-label text-secondary mb-3">Assignment</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <MetaCell label="Department" value={assignedDept ? `Department #${assignedDept}` : null} icon={Building2} />
                <MetaCell label="Agent" value={assignedAgent ? `Agent #${assignedAgent}` : null} icon={User} />
              </div>
            </div>

            {/* Right: Metadata */}
            <div className="px-6 py-4">
              <p className="text-section-label text-secondary mb-3">Details</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <MetaCell label="Created" value={createdAt} icon={Calendar} />
                <MetaCell label="Updated" value={updatedAt} icon={Clock} />
                <MetaCell label="Created By" value={createdBy} icon={User} />
                <MetaCell label="Updated By" value={updatedBy} icon={User} />
              </div>
            </div>
          </div>

          {/* ─── Timeline Strip ─── */}
          <div className="px-6 py-3 border-t border-default bg-background">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              <TimelineItem label="Due" value={dueAt} icon={Calendar} />
              <TimelineItem label="First Response" value={firstResponseAt} icon={Clock} />
              <TimelineItem label="Resolved" value={resolvedAt} icon={Clock} />
              <TimelineItem label="Closed" value={closedAt} icon={Clock} />
            </div>
          </div>

          {/* ─── Additional Info Strip (conditional) ─── */}
          {hasAdditionalInfo && (
            <div className="px-6 py-3 border-t border-default">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                {tags && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-secondary">Tags:</span>
                    <span className="text-body text-primary">{tags}</span>
                  </div>
                )}
                {btsNo && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-secondary">BTS:</span>
                    <span className="text-body text-primary">{btsNo}</span>
                  </div>
                )}
                {billSubmittedDate && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-secondary">Bill Date:</span>
                    <span className="text-body text-primary">{billSubmittedDate}</span>
                  </div>
                )}
                {processingDays && (
                  <div className="flex items-center gap-2">
                    <span className="text-caption text-secondary">Days:</span>
                    <span className="text-body text-primary">{processingDays}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ─── Attachments ─── */}
          <div className="px-6 py-5 border-t border-default">
            <p className="text-section-label text-secondary mb-3">Attachments</p>
            {hasAttachments ? (
              <div className="flex flex-col gap-2">
                {ticketDetails.attachments.map((attachment, index) => (
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
                        } catch (error) {
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

      {/* Footer */}
      <div className="flex justify-end pb-4">
        <Button variant="primary" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </div>

    </div>
  );
};
