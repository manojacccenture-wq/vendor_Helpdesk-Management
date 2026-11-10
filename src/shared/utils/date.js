/**
 * Format an ISO date string (YYYY-MM-DD) to DD/MM/YYYY for backend API queries
 * @param {string} isoDate - Date string in YYYY-MM-DD format
 * @returns {string} Date string in DD/MM/YYYY format or empty string
 */
export const formatDateToDDMMYYYY = (isoDate) => {
  if (!isoDate || typeof isoDate !== 'string') return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return '';
  const [year, month, day] = parts;
  if (!year || !month || !day) return '';
  return `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
};

/**
 * Format date string to display format
 * @param {string} dateString - ISO date string
 * @returns {string|null} Formatted date string or null
 */
export const formatDate = (dateString) => {
  if (!dateString) return null;
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return null;
  }
};

/**
 * Format file size in bytes to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
