import { useState } from 'react';
import { Download, FileText } from 'lucide-react';
import { SectionHeading, SectionDivider } from './CollapsibleSection.jsx';
import { Button } from './Button.jsx';
import { downloadTicketAttachment } from '../utils/download.js';
import { formatFileSize } from '../utils/date.js';

/**
 * TicketAttachments — Displays ticket attachments with download functionality.
 * Manages its own download-loading state internally.
 */
export const TicketAttachments = ({ attachments = [] }) => {
  const [downloadingAttachments, setDownloadingAttachments] = useState(new Set());
  const hasAttachments = attachments.length > 0;

  return (
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
  );
};
