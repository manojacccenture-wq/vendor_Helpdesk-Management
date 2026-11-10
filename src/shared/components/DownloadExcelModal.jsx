import { useState, useRef } from 'react';
import { Button } from './Button.jsx';
import { Input } from './Input.jsx';
import { downloadTicketsExcel } from '../utils/download.js';
import { formatDateToDDMMYYYY } from '../utils/date.js';

/**
 * DownloadExcelModal — Modal dialog for exporting ticket records to Excel with date range selection.
 *
 * Requirements:
 * - Allows user to pick From Date and To Date
 * - Validates date range (From <= To, required, not in future)
 * - Sends dates in DD/MM/YYYY format to GET /api/Tickets/download-excel
 * - Triggers Excel file download and preserves server filename
 * - Prevents duplicate requests while download is in progress
 * - Closes on success, stays open on error for retry
 * - Avoids useEffect for state resets — unmounted when closed
 *
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Callback when modal is closed
 * @param {string} [props.status] - Optional currently selected ticket status
 * @param {string} [props.vendorCode] - Optional vendor code (for Vendor role)
 */
export const DownloadExcelModal = ({
  isOpen,
  onClose,
  status,
  vendorCode,
}) => {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [fromDateError, setFromDateError] = useState('');
  const [toDateError, setToDateError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  // Guards against concurrent clicks before React state updates
  const downloadLockRef = useRef(false);

  if (!isOpen) return null;

  const today = new Date().toISOString().split('T')[0];

  const handleFromDateChange = (e) => {
    const val = e.target.value;
    setFromDate(val);
    if (fromDateError) setFromDateError('');
    if (toDateError && val && toDate && val <= toDate) {
      setToDateError('');
    }
  };

  const handleToDateChange = (e) => {
    const val = e.target.value;
    setToDate(val);
    if (toDateError) setToDateError('');
    if (fromDateError && fromDate && val && fromDate <= val) {
      setFromDateError('');
    }
  };

  const handleDownload = async () => {
    if (isDownloading || downloadLockRef.current) return;

    let hasError = false;

    if (!fromDate) {
      setFromDateError('From date is required.');
      hasError = true;
    } else if (fromDate > today) {
      setFromDateError('From date cannot be in the future.');
      hasError = true;
    } else {
      setFromDateError('');
    }

    if (!toDate) {
      setToDateError('To date is required.');
      hasError = true;
    } else if (toDate > today) {
      setToDateError('To date cannot be in the future.');
      hasError = true;
    } else {
      setToDateError('');
    }

    if (!hasError && fromDate > toDate) {
      setToDateError('To Date cannot be earlier than From Date.');
      hasError = true;
    }

    if (hasError) return;

    downloadLockRef.current = true;
    setIsDownloading(true);

    try {
      const formattedFromDate = formatDateToDDMMYYYY(fromDate);
      const formattedToDate = formatDateToDDMMYYYY(toDate);

      await downloadTicketsExcel({
        fromDate: formattedFromDate,
        toDate: formattedToDate,
        status: status || undefined,
        vendorCode: (vendorCode && String(vendorCode).trim()) || undefined,
      });

      // Close modal on success
      onClose();
    } catch {
      // Error is already notified via showError in downloadTicketsExcel; keep modal open for retry
    } finally {
      setIsDownloading(false);
      downloadLockRef.current = false;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={isDownloading ? undefined : onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[90dvh] overflow-hidden">
        {/* Header & Body */}
        <div className="px-6 pt-6 pb-4 overflow-y-auto flex-1 overscroll-contain">
          <h2 className="text-primary page-heading mb-2">Download Tickets Report</h2>
          <p className="text-secondary text-sm mb-6">
            Select a date range to export ticket records into an Excel spreadsheet.
          </p>

          <div className="space-y-4">
            {/* From Date */}
            <Input
              type="date"
              label="From Date *"
              value={fromDate}
              onChange={handleFromDateChange}
              max={today}
              error={fromDateError}
              disabled={isDownloading}
            />

            {/* To Date */}
            <Input
              type="date"
              label="To Date *"
              value={toDate}
              onChange={handleToDateChange}
              max={today}
              error={toDateError}
              disabled={isDownloading}
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 px-6 pb-6 pt-2 shrink-0 bg-white">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={isDownloading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleDownload}
            disabled={isDownloading}
            className="bg-info hover:bg-info/90"
          >
            {isDownloading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Downloading...
              </span>
            ) : (
              'Download'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DownloadExcelModal;

