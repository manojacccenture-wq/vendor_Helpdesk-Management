import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText, Calendar, User, Building2, Clock, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../../../shared/components/Card.jsx';
import { Button } from '../../../../../shared/components/Button.jsx';
import { BackButton } from '../../../../../shared/components/BackButton.jsx';
import { StatusBadge } from '../components/StatusBadge.jsx';
import { useGetTicketDetailsQuery } from '../../../../../shared/api/apiSlice.js';
import { selectUserProfile } from '../../../../../features/user/store/selectors.js';
import { downloadTicketAttachment } from '../../../../../shared/utils/download.js';

// Format date helper
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'N/A';
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

// Detail Field component
const DetailField = ({ label, value, icon: Icon, className = '' }) => (
  <div className={`flex flex-col gap-1 ${className}`}>
    <div className="flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4 text-[#64748B]" />}
      <p className="text-[12px] font-[500] text-[#64748B] uppercase tracking-wide">{label}</p>
    </div>
    <p className="text-[14px] font-[500] text-[#1E293B] leading-relaxed">{value || '---'}</p>
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

  // Handle back navigation
  const handleBack = () => {
    navigate('/vendor');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4">
          <BackButton to="/vendor" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-[600] text-[#1E293B]">Ticket Details</h1>
            <p className="text-[14px] text-[#64748B]">Loading ticket information...</p>
          </div>
        </div>
        
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-[#0F766E] border-t-transparent rounded-full animate-spin" />
              <span className="text-[14px] font-[500] text-[#64748B]">Loading ticket details...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4">
          <BackButton to="/vendor" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-[600] text-[#1E293B]">Ticket Details</h1>
            <p className="text-[14px] text-[#64748B]">Error loading ticket</p>
          </div>
        </div>
        
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <AlertCircle className="w-12 h-12 text-[#EF4444]" />
            <div className="text-center">
              <h3 className="text-[16px] font-[600] text-[#1E293B] mb-2">Failed to load ticket details</h3>
              <p className="text-[14px] text-[#64748B] mb-4">
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
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4">
          <BackButton to="/vendor" />
          <div className="flex flex-col gap-1">
            <h1 className="text-[22px] font-[600] text-[#1E293B]">Ticket Details</h1>
            <p className="text-[14px] text-[#64748B]">Ticket not found</p>
          </div>
        </div>
        
        <Card className="w-full">
          <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
            <FileText className="w-12 h-12 text-[#64748B]" />
            <div className="text-center">
              <h3 className="text-[16px] font-[600] text-[#1E293B] mb-2">Ticket not found</h3>
              <p className="text-[14px] text-[#64748B] mb-4">
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

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto">
      
      {/* Page Header */}
      <div className="flex items-center gap-4">
        <BackButton to="/vendor" />
        <div className="flex flex-col gap-1">
          <h1 className="text-[22px] font-[600] text-[#1E293B]">
            Ticket Details
          </h1>
          <p className="text-[14px] text-[#64748B]">
            Viewing ticket {ticketDetails.ticketNo || `#${id}`}
          </p>
        </div>
      </div>

      {/* Main Ticket Information */}
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Ticket Information</CardTitle>
            <StatusBadge status={ticketDetails.status || 'Unknown'} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <DetailField 
              label="Ticket Number" 
              value={ticketDetails.ticketNo || ticketDetails.ticketNumber || `#${id}`} 
              icon={FileText}
            />
            <DetailField 
              label="Subject" 
              value={ticketDetails.subject || ticketDetails.ticketSubject || 'No subject'}
              className="md:col-span-2"
            />
            <DetailField 
              label="Category" 
              value={ticketDetails.category || ticketDetails.ticketCategory || 'N/A'}
            />
            <DetailField 
              label="Sub Category" 
              value={ticketDetails.subcategory || 'N/A'}
            />
            <DetailField 
              label="Source" 
              value={ticketDetails.ticketSource || 'N/A'}
            />
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Description</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-[#F8FAFC] rounded-[8px] p-4 border border-[#E2E8F0]">
            <p className="text-[14px] text-[#1E293B] leading-relaxed whitespace-pre-wrap">
              {ticketDetails.ticketDescription || 'No description provided.'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Dates and Timeline */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <DetailField 
              label="Created At" 
              value={formatDate(ticketDetails.ticketCreatedAt || ticketDetails.createdAt || ticketDetails.createAt)}
              icon={Calendar}
            />
            <DetailField 
              label="Last Updated" 
              value={formatDate(ticketDetails.ticketUpdatedAt)}
              icon={Clock}
            />
            <DetailField 
              label="Created By" 
              value={ticketDetails.ticketCreatedBy}
              icon={User}
            />
            <DetailField 
              label="Updated By" 
              value={ticketDetails.ticketUpdatedBy}
              icon={User}
            />
            <DetailField 
              label="Due Date" 
              value={formatDate(ticketDetails.dueAt)}
              icon={Calendar}
            />
            <DetailField 
              label="First Response" 
              value={formatDate(ticketDetails.firstResponseAt)}
              icon={Clock}
            />
            <DetailField 
              label="Resolved At" 
              value={formatDate(ticketDetails.resolvedAt)}
              icon={Clock}
            />
            <DetailField 
              label="Closed At" 
              value={formatDate(ticketDetails.closedAt)}
              icon={Clock}
            />
          </div>
        </CardContent>
      </Card>

      {/* Assignment Information */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Assignment</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailField 
              label="Assigned Department" 
              value={ticketDetails.assignedDepartmentId ? `Department #${ticketDetails.assignedDepartmentId}` : 'Unassigned'}
              icon={Building2}
            />
            <DetailField 
              label="Assigned Agent" 
              value={ticketDetails.assignedAgentId ? `Agent #${ticketDetails.assignedAgentId}` : 'Unassigned'}
              icon={User}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      {(ticketDetails.tags || ticketDetails.billSubmittedDate || ticketDetails.btsNo || ticketDetails.noProcessingDays) && (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Additional Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {ticketDetails.tags && (
                <DetailField 
                  label="Tags" 
                  value={ticketDetails.tags}
                />
              )}
              {ticketDetails.billSubmittedDate && (
                <DetailField 
                  label="Bill Submitted Date" 
                  value={formatDate(ticketDetails.billSubmittedDate)}
                  icon={Calendar}
                />
              )}
              {ticketDetails.btsNo && (
                <DetailField 
                  label="BTS Number" 
                  value={ticketDetails.btsNo}
                />
              )}
              {ticketDetails.noProcessingDays && (
                <DetailField 
                  label="Processing Days" 
                  value={`${ticketDetails.noProcessingDays} days`}
                  icon={Clock}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Attachments */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Attachments</CardTitle>
        </CardHeader>
        <CardContent>
          {ticketDetails.attachments && ticketDetails.attachments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ticketDetails.attachments.map((attachment, index) => (
                <div 
                  key={attachment.uuid || index}
                  className="flex items-center justify-between p-4 bg-[#F8FAFC] rounded-[8px] border border-[#E2E8F0] hover:bg-[#F1F5F9] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-[#64748B]" />
                    <div className="flex flex-col">
                      <span className="text-[13px] font-[500] text-[#1E293B]">
                        {attachment.originalFileName}
                      </span>
                      <span className="text-[12px] text-[#64748B]">
                        {formatFileSize(attachment.fileSizeBytes)} • {attachment.mimeType}
                      </span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="p-2"
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
                      <div className="w-4 h-4 border-2 border-[#64748B] border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Download className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 gap-2">
              <FileText className="w-8 h-8 text-[#64748B]" />
              <p className="text-[14px] text-[#64748B]">No attachments</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Back to Dashboard */}
      <div className="flex justify-end">
        <Button variant="primary" onClick={handleBack}>
          Back to Dashboard
        </Button>
      </div>

    </div>
  );
};
