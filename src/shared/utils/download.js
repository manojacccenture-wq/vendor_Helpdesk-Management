import { axiosClient } from '../api/axiosClient.js';
import { showSuccess, showError } from '../notifications/notificationService.js';

/**
 * Extract filename from Content-Disposition header
 * @param {string} contentDisposition - Content-Disposition header value
 * @param {string} fallback - Fallback filename
 * @returns {string} Extracted filename or fallback
 */
export const extractFilenameFromContentDisposition = (contentDisposition, fallback = 'VendorHelpdeskReport.xlsx') => {
  if (!contentDisposition || typeof contentDisposition !== 'string') return fallback;

  // 1. Try RFC 5987/6266 filename*=UTF-8''filename.ext
  const filenameStarMatch = contentDisposition.match(/filename\*=(?:UTF-8''|utf-8'')?([^;]+)/i);
  if (filenameStarMatch && filenameStarMatch[1]) {
    try {
      return decodeURIComponent(filenameStarMatch[1].trim().replace(/^["']|["']$/g, ''));
    } catch {
      return filenameStarMatch[1].trim().replace(/^["']|["']$/g, '');
    }
  }

  // 2. Try standard filename="filename.ext" or filename=filename.ext
  const filenameMatch = contentDisposition.match(/filename=(?:["']([^"']+)["']|([^;\s]+))/i);
  if (filenameMatch) {
    const rawFilename = filenameMatch[1] || filenameMatch[2];
    if (rawFilename) {
      return rawFilename.trim();
    }
  }

  return fallback;
};

/**
 * Download a file from the API
 * 
 * This utility reuses the existing centralized axiosClient which:
 * - Automatically includes authentication cookies (withCredentials: true)
 * - Automatically includes the X-API-KEY header
 * - Handles token refresh via interceptors
 * - Handles errors via interceptors
 * 
 * @param {string} url - API endpoint URL (e.g., '/api/Tickets/attachments/{uuid}')
 * @param {string} filename - Original filename to preserve during download
 * @param {object} options - Optional configuration
 * @param {boolean} options.showNotification - Show success/error notifications (default: true)
 * @returns {Promise<void>}
 */
export const downloadFile = async (url, filename, options = {}) => {
  const { showNotification = true } = options;
  
  try {
    // Use axiosClient which already has:
    // - baseURL configured
    // - withCredentials: true (sends cookies)
    // - X-API-KEY header
    // - Request/response interceptors for auth and error handling
    const response = await axiosClient.get(url, {
      responseType: 'blob',
    });
    
    // The interceptor returns response.data which for blob responses is the Blob object
    // Create blob URL and trigger download
    const blob = new Blob([response]);
    const blobUrl = window.URL.createObjectURL(blob);
    
    // Create temporary link element
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    
    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);
    
    if (showNotification) {
      showSuccess(`Downloaded ${filename} successfully`);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Download failed:', error);
    
    if (showNotification) {
      // Extract meaningful error message
      let errorMessage = 'Please try again.';
      
      if (error?.response?.data instanceof Blob) {
        // If error response is a blob, try to read it as text
        try {
          const errorText = await error.response.data.text();
          const errorJson = JSON.parse(errorText);
          errorMessage = errorJson.message || errorJson.error || errorMessage;
        } catch {
          // Ignore parsing errors
        }
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      showError(`Failed to download ${filename}. ${errorMessage}`);
    }
    
    throw error;
  }
};

/**
 * Download a ticket attachment
 * 
 * @param {string} attachmentUuid - The attachment UUID
 * @param {string} filename - Original filename
 * @param {object} options - Optional configuration
 * @returns {Promise<void>}
 */
export const downloadTicketAttachment = async (attachmentUuid, filename, options = {}) => {
  const url = `/api/Tickets/attachments/${attachmentUuid}`;
  return downloadFile(url, filename, options);
};

/**
 * Download tickets report as an Excel file based on date range and optional filters.
 *
 * @param {Object} params
 * @param {string} params.fromDate - Starting date (DD/MM/YYYY)
 * @param {string} params.toDate - Ending date (DD/MM/YYYY)
 * @param {string} [params.status] - Optional ticket status filter
 * @param {string} [params.vendorCode] - Optional vendor code
 * @param {Object} [options]
 * @param {boolean} [options.showNotification=true] - Whether to show notifications
 * @returns {Promise<{ success: boolean, filename: string }>}
 */
export const downloadTicketsExcel = async (params, options = {}) => {
  const { showNotification = true } = options;
  const { fromDate, toDate, status, vendorCode } = params;

  try {
    const queryParams = {
      fromDate,
      toDate,
    };
    if (status) queryParams.status = status;
    if (vendorCode && String(vendorCode).trim()) {
      queryParams.vendorCode = String(vendorCode).trim();
    }

    const response = await axiosClient.get('/api/Tickets/download-excel', {
      params: queryParams,
      responseType: 'blob',
      returnFullResponse: true,
    });

    const contentDisposition = response.headers?.['content-disposition'] || response.headers?.['Content-Disposition'];
    const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fallbackFilename = `VendorHelpdeskReport_${timestamp}.xlsx`;
    const filename = extractFilenameFromContentDisposition(contentDisposition, fallbackFilename);

    // Create blob URL and trigger download
    const blob = response.data instanceof Blob ? response.data : new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });
    const blobUrl = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();

    // Clean up
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    if (showNotification) {
      showSuccess(`Report downloaded successfully`);
    }

    return { success: true, filename };
  } catch (error) {
    console.error('Download tickets excel failed:', error);

    let errorMessage = 'Failed to generate Excel report. Please try again.';

    if (error?.response?.data instanceof Blob) {
      try {
        const errorText = await error.response.data.text();
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.message || errorJson.title || errorJson.error || errorMessage;
      } catch {
        // Fall back to default
      }
    } else if (error?.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error?.response?.data?.title) {
      errorMessage = error.response.data.title;
    } else if (error?.message) {
      errorMessage = error.message;
    }

    if (showNotification) {
      showError(errorMessage);
    }

    throw new Error(errorMessage, { cause: error });
  }
};

export default downloadFile;
