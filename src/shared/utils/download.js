import { axiosClient } from '../api/axiosClient.js';
import { showSuccess, showError } from '../notifications/notificationService.js';

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

export default downloadFile;
