import { useState } from 'react';
import { Input } from '../../../../shared/components/Input.jsx';
import { Button } from '../../../../shared/components/Button.jsx';

/**
 * ReportDateFilter — Date range selection component for Ticket Reports.
 *
 * @param {Object} props
 * @param {Function} props.onSearch - Callback invoked with { fromDate, toDate } upon valid submission
 * @param {boolean} props.isLoading - Whether a query is actively loading
 * @param {string} [props.initialFromDate=''] - Optional initial from date (YYYY-MM-DD)
 * @param {string} [props.initialToDate=''] - Optional initial to date (YYYY-MM-DD)
 */
export const ReportDateFilter = ({
  onSearch,
  isLoading = false,
  initialFromDate = '',
  initialToDate = '',
}) => {
  const [fromDate, setFromDate] = useState(initialFromDate);
  const [toDate, setToDate] = useState(initialToDate);
  const [fromDateError, setFromDateError] = useState('');
  const [toDateError, setToDateError] = useState('');

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

  const handleSubmit = (e) => {
    e?.preventDefault?.();
    if (isLoading) return;

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

    onSearch?.({ fromDate, toDate });
  };

  const handleReset = () => {
    setFromDate('');
    setToDate('');
    setFromDateError('');
    setToDateError('');
  };

  return (
    <div className="bg-surface border border-default rounded-card p-6 shadow-sm mb-6">
      <h3 className="text-primary font-semibold text-base mb-1">Select Report Date Range</h3>
      <p className="text-secondary text-sm mb-4">
        Specify a From Date and To Date to query ticket records from the reporting server.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
        {/* From Date */}
        <div className="w-full sm:w-56">
          <Input
            type="date"
            label="From Date *"
            value={fromDate}
            onChange={handleFromDateChange}
            max={today}
            error={fromDateError}
            disabled={isLoading}
          />
        </div>

        {/* To Date */}
        <div className="w-full sm:w-56">
          <Input
            type="date"
            label="To Date *"
            value={toDate}
            onChange={handleToDateChange}
            max={today}
            error={toDateError}
            disabled={isLoading}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto pt-1 sm:pt-0">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="w-full sm:w-auto bg-info hover:bg-info/90 text-white"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
                Fetching...
              </span>
            ) : (
              'View Report'
            )}
          </Button>

          {(fromDate || toDate) && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleReset}
              disabled={isLoading}
              className="text-secondary hover:text-primary whitespace-nowrap"
            >
              Clear
            </Button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ReportDateFilter;

