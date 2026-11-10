import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Download, FileText, AlertCircle, RefreshCw } from 'lucide-react';
import { selectUserRole, selectUserProfile } from '../../../../features/user/store/selectors.js';
import { useLazyGetTicketReportQuery } from '../../../api/apiSlice.js';
import { BackButton } from '../../../components/BackButton.jsx';
import { Button } from '../../../components/Button.jsx';
import { ReportDateFilter } from '../components/ReportDateFilter.jsx';
import { TicketReportTable } from '../components/TicketReportTable.jsx';
import { formatDateToDDMMYYYY } from '../../../utils/date.js';
import { downloadTicketsExcel } from '../../../utils/download.js';

/**
 * TicketReportsPage — Dedicated reports view for Helpdesk and Department users.
 *
 * User Journey:
 * Existing Ticket Page → View Button → Ticket Reports Page → Date Selection → View Report → Report Table → Download Excel
 *
 * Role Restriction:
 * Strictly restricted for Vendor (L1). Only Helpdesk (L2, HelpdeskExecutive)
 * and Department (BL1, HOD, VH, MD) are allowed.
 *
 * @param {Object} props
 * @param {string} [props.backPath] - Route to navigate back to (e.g. '/helpdesk' or '/department')
 */
export const TicketReportsPage = ({ backPath }) => {
  const navigate = useNavigate();
  const role = useSelector(selectUserRole);
  const profile = useSelector(selectUserProfile);
  // const userCode = profile?.userCode ? String(profile.userCode).trim() : '';

  // Vendor restriction safeguard
  const isVendor = role === 'L1';

  // ─── Query Hook ───
  const [fetchReport, { data: reportRawData, isFetching, isError, error }] = useLazyGetTicketReportQuery();

  // ─── Local State ───
  const [activeDateRange, setActiveDateRange] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);

  // ─── Normalized Report Data ───
  const reportData = useMemo(() => {
    if (!reportRawData) return [];
    if (Array.isArray(reportRawData)) return reportRawData;
    if (Array.isArray(reportRawData.data)) return reportRawData.data;
    return [];
  }, [reportRawData]);

  // ─── Search Trigger ───
  const handleSearch = async ({ fromDate, toDate }) => {
    const apiFromDate = formatDateToDDMMYYYY(fromDate);
    const apiToDate = formatDateToDDMMYYYY(toDate);

    const reportParams = {
      fromDate: apiFromDate,
      toDate: apiToDate,
    };
    // if (userCode) {
    //   reportParams.vendorCode = userCode;
    // }

    setActiveDateRange({
      fromDate,
      toDate,
      apiFromDate,
      apiToDate,
      // vendorCode: userCode || undefined,
    });

    try {
      await fetchReport(reportParams).unwrap();
    } catch (err) {
      // Error state captured by RTK Query
      console.error('Failed to fetch ticket report:', err);
    }
  };

  // ─── Retry Handler ───
  const handleRetry = () => {
    if (activeDateRange?.apiFromDate && activeDateRange?.apiToDate) {
      const retryParams = {
        fromDate: activeDateRange.apiFromDate,
        toDate: activeDateRange.apiToDate,
      };
      if (activeDateRange.vendorCode) {
        retryParams.vendorCode = activeDateRange.vendorCode;
      }
      fetchReport(retryParams);
    }
  };

  // ─── Excel Download Trigger ───
  const handleDownloadExcel = async () => {
    if (!activeDateRange?.apiFromDate || !activeDateRange?.apiToDate) return;

    setIsDownloading(true);
    try {
      await downloadTicketsExcel({
        fromDate: activeDateRange.apiFromDate,
        toDate: activeDateRange.apiToDate,
        vendorCode: activeDateRange.vendorCode || undefined,
      });
    } catch (err) {
      console.error('Download Excel report failed:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // ─── Resolve Back Route ───
  const resolvedBackPath = backPath || (role === 'L2' || role === 'HelpdeskExecutive' ? '/helpdesk' : '/department');

  // ─── Vendor Access Guard ───
  if (isVendor) {
    return (
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="bg-surface border border-danger/20 rounded-card p-8 text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-danger-soft text-danger flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-primary font-semibold text-lg mb-2">Access Restricted</h2>
          <p className="text-secondary text-sm max-w-md mx-auto mb-6">
            The Ticket Reports and Excel export module is not accessible for Vendor accounts.
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/vendor')}
          >
            Return to Vendor Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
      {/* Top Navigation */}
      <div className="mb-4">
        <BackButton to={resolvedBackPath} label="Back to Tickets" />
      </div>

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary tracking-tight">Ticket Reports</h1>
          <p className="text-secondary text-sm mt-1">
            Query, analyze, and export complete ticket records across departments and vendors.
          </p>
        </div>
      </div>

      {/* Date Filter Card */}
      <ReportDateFilter
        onSearch={handleSearch}
        isLoading={isFetching}
        initialFromDate={activeDateRange?.fromDate || ''}
        initialToDate={activeDateRange?.toDate || ''}
      />

      {/* Initial State (No search performed yet) */}
      {!activeDateRange && !isFetching && (
        <div className="bg-surface border border-default rounded-card p-12 text-center shadow-sm">
          <div className="w-14 h-14 rounded-full bg-surface-active flex items-center justify-center mx-auto mb-4 text-secondary">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-primary font-semibold text-base mb-1.5">No Report Generated Yet</h3>
          <p className="text-secondary text-sm max-w-md mx-auto">
            Choose a starting <strong>From Date</strong> and ending <strong>To Date</strong> above and click <strong>View Report</strong> to view ticket records.
          </p>
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-surface border border-danger/30 rounded-card p-6 text-center shadow-sm mb-6">
          <div className="flex items-center justify-center gap-2 text-danger font-medium mb-2">
            <AlertCircle className="w-5 h-5" />
            <span>Failed to load ticket report</span>
          </div>
          <p className="text-secondary text-sm mb-4">
            {error?.data?.message || error?.error || 'An error occurred while fetching the ticket report from the server.'}
          </p>
          <Button
            variant="secondary"
            onClick={handleRetry}
            className="inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      )}

      {/* Report Results */}
      {activeDateRange && !isError && (
        <div className="space-y-4">
          {/* Summary and Download Bar */}
          <div className="bg-surface border border-default rounded-card px-5 py-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="text-sm">
              <span className="font-semibold text-primary">{reportData.length}</span>
              <span className="text-secondary ml-1.5">
                ticket {reportData.length === 1 ? 'record' : 'records'} found for range
              </span>
              <span className="font-medium text-primary ml-1.5">
                {activeDateRange.apiFromDate} — {activeDateRange.apiToDate}
              </span>
            </div>

            <Button
              variant="secondary"
              onClick={handleDownloadExcel}
              disabled={isDownloading || reportData.length === 0}
              title={reportData.length === 0 ? 'No records to download' : 'Download Excel report'}
              className="w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>{isDownloading ? 'Downloading Excel...' : 'Download Excel'}</span>
            </Button>
          </div>

          {/* Report Table */}
          <TicketReportTable
            data={reportData}
            isLoading={isFetching}
            emptyMessage={`No ticket records found between ${activeDateRange.apiFromDate} and ${activeDateRange.apiToDate}.`}
          />
        </div>
      )}
    </div>
  );
};

export default TicketReportsPage;

