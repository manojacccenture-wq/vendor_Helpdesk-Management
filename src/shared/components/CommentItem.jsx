import { User, Clock, Edit3, Bot, EyeOff } from 'lucide-react';
import { cn } from '../utils/cn.js';
import { formatDate } from '../utils/date.js';

// Role badge configuration
const roleBadgeConfig = {
  VENDOR: {
    label: 'Vendor',
    className: 'bg-success-soft text-success border-success/20',
  },
  HelpdeskExecutive: {
    label: 'Helpdesk',
    className: 'bg-info-soft text-info border-info/20',
  },
  L2: {
    label: 'Helpdesk',
    className: 'bg-info-soft text-info border-info/20',
  },
  SYSTEM: {
    label: 'System',
    className: 'bg-surface-active text-secondary border-default',
  },
};

// Get role badge config
const getRoleBadgeConfig = (comment) => {
  // Check if it's a system-generated comment
  if (comment.isSystemGenerated) {
    return roleBadgeConfig.SYSTEM;
  }

  // Check visibility field
  if (comment.visibility === 'VENDOR') {
    return roleBadgeConfig.VENDOR;
  }

  // Default to helpdesk for other roles
  return roleBadgeConfig.HelpdeskExecutive;
};

/**
 * CommentItem — Displays a single comment with role badge, author, timestamp, and body.
 *
 * @param {Object} comment - The comment object from the API
 */
export const CommentItem = ({ comment }) => {
  const badgeConfig = getRoleBadgeConfig(comment);
  const formattedDate = formatDate(comment.createdAt);
  const author = comment.authorUserId || comment.createdBy || 'Unknown';
  
  // Determine if comment is internal (not visible to vendor)
  const isInternal = comment.visibility !== 'VENDOR';

  return (
    <div className="flex flex-col gap-2 py-4 border-b border-default last:border-b-0">
      {/* Header: Badge + Author + Timestamp */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Role Badge */}
        <span
          className={cn(
            'inline-flex items-center px-2 py-0.5 rounded text-badge font-medium border',
            badgeConfig.className
          )}
        >
          {comment.isSystemGenerated ? (
            <Bot className="w-3 h-3 mr-1" />
          ) : (
            <User className="w-3 h-3 mr-1" />
          )}
          {badgeConfig.label}
        </span>

        {/* Internal Badge - only for internal comments */}
        {isInternal && (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-badge font-medium border bg-warning-soft text-warning border-warning/20">
            <EyeOff className="w-3 h-3 mr-1" />
            Internal
          </span>
        )}

        {/* Author */}
        <span className="text-body font-medium text-primary">{author}</span>

        {/* Separator dot */}
        <span className="text-muted">·</span>

        {/* Timestamp */}
        <span className="flex items-center gap-1 text-caption text-secondary">
          <Clock className="w-3 h-3" />
          {formattedDate || '—'}
        </span>

        {/* Edited indicator */}
        {comment.isEdited && (
          <span className="flex items-center gap-1 text-caption text-muted">
            <Edit3 className="w-3 h-3" />
            (edited)
          </span>
        )}
      </div>

      {/* Comment Body */}
      <div className="pl-0">
        <p className="text-body text-primary whitespace-pre-wrap break-words">
          {comment.body || '—'}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
