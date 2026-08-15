import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Menu, SlidersHorizontal, Printer, ChevronDown } from 'lucide-react';
import { ConsolidatedLoadReport } from './ConsolidatedLoadReport';
import { ReportTemplate } from './ReportTemplate';
import { reportsMenu } from '../../data/menuData';

export function ReportsLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleReportClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-[var(--bg-secondary)]">
      {/* Reports Sidebar */}
      <aside className="w-60 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 overflow-y-auto flex-shrink-0">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Reports
          </h2>
          <nav>
            <ul className="space-y-0">
              {reportsMenu.map((report) => (
                <li key={report.path}>
                  <button
                    onClick={() => handleReportClick(report.path)}
                    className={`w-full text-left px-3 py-2.5 text-sm transition-colors ${
                      isActive(report.path)
                        ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    {report.name}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Action Bar */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
          <div className="flex items-center justify-between">
            {/* Left Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                Filter
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <SlidersHorizontal className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                <span className="text-lg">⚙</span>
                Schedule Report
              </button>
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <Printer className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors flex items-center gap-2">
                Export As
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <main className="flex-1 overflow-auto bg-white dark:bg-gray-900">
          <Routes>
            <Route index element={<ReportsHome />} />
            <Route path="consolidated-load" element={<ConsolidatedLoadReport />} />
            <Route
              path="consolidated-load-return"
              element={
                <ReportTemplate
                  title="Consolidated Load Return"
                  subtitle="From To"
                  columns={['SR NO.', 'ITEM CODE', 'ITEM DESCRIPTION', 'QTY', 'UOM', 'RETURN DATE', 'WAREHOUSE']}
                />
              }
            />
            <Route
              path="loading-chart-warehouse"
              element={
                <ReportTemplate
                  title="Loading Chart By Warehouse"
                  subtitle="Warehouse Loading Analysis"
                  columns={['SR NO.', 'WAREHOUSE', 'ITEM CODE', 'ITEM DESCRIPTION', 'QTY', 'UOM', 'LOAD DATE']}
                />
              }
            />
            <Route
              path="order-details"
              element={
                <ReportTemplate
                  title="Order Details"
                  subtitle="Complete Order Information"
                  columns={['ORDER NO.', 'DATE', 'CUSTOMER', 'ITEM', 'QTY', 'AMOUNT', 'STATUS']}
                />
              }
            />
            <Route
              path="daily-operation"
              element={
                <ReportTemplate
                  title="Daily Operation"
                  subtitle="Daily Operations Summary"
                  columns={['DATE', 'OPERATION', 'LOCATION', 'QTY', 'STATUS', 'REMARKS']}
                />
              }
            />
            <Route
              path="time-sheets"
              element={
                <ReportTemplate
                  title="Time Sheets"
                  subtitle="Employee Time Tracking"
                  columns={['EMPLOYEE', 'DATE', 'CHECK IN', 'CHECK OUT', 'HOURS', 'STATUS']}
                />
              }
            />
            <Route
              path="salesman-performance"
              element={
                <ReportTemplate
                  title="Salesman Performance"
                  subtitle="Sales Performance Analysis"
                  columns={['SALESMAN', 'ORDERS', 'AMOUNT', 'TARGET', 'ACHIEVEMENT %', 'RANK']}
                />
              }
            />
            <Route
              path="truck-utilisation"
              element={
                <ReportTemplate
                  title="Truck Utilisation"
                  subtitle="Fleet Utilization Report"
                  columns={['TRUCK NO.', 'DATE', 'CAPACITY', 'LOADED', 'UTILIZATION %', 'STATUS']}
                />
              }
            />
            <Route
              path="daily-crf"
              element={
                <ReportTemplate
                  title="Daily CRF"
                  subtitle="Customer Return Form"
                  columns={['DATE', 'CUSTOMER', 'ITEM', 'QTY', 'REASON', 'STATUS']}
                />
              }
            />
            <Route
              path="sales-vs-grv"
              element={
                <ReportTemplate
                  title="Sales Vs GRV"
                  subtitle="Sales vs Goods Received"
                  columns={['DATE', 'SALES', 'GRV', 'VARIANCE', 'VARIANCE %', 'REMARKS']}
                />
              }
            />
            <Route
              path="difot"
              element={
                <ReportTemplate
                  title="DIFOT"
                  subtitle="Delivery In Full On Time"
                  columns={['ORDER NO.', 'DATE', 'CUSTOMER', 'ON TIME', 'IN FULL', 'DIFOT %']}
                />
              }
            />
            <Route
              path="loading-chart-route"
              element={
                <ReportTemplate
                  title="Loading Chart Final By Route"
                  subtitle="Route-wise Loading Analysis"
                  columns={['ROUTE', 'ITEM CODE', 'ITEM DESCRIPTION', 'QTY', 'UOM', 'LOAD DATE']}
                />
              }
            />
            <Route
              path="daily-grv"
              element={
                <ReportTemplate
                  title="Daily GRV Report"
                  subtitle="Goods Received Voucher"
                  columns={['DATE', 'GRV NO.', 'SUPPLIER', 'ITEM', 'QTY', 'AMOUNT']}
                />
              }
            />
            <Route
              path="daily-spot-return"
              element={
                <ReportTemplate
                  title="Daily Spot Return"
                  subtitle="Spot Return Analysis"
                  columns={['DATE', 'CUSTOMER', 'ITEM', 'QTY', 'REASON', 'AMOUNT']}
                />
              }
            />
            <Route
              path="driver-loaded-qty"
              element={
                <ReportTemplate
                  title="Driver Loaded Qty"
                  subtitle="Driver Loading Quantity"
                  columns={['DRIVER', 'DATE', 'VEHICLE', 'ITEM', 'QTY', 'UOM']}
                />
              }
            />
            <Route
              path="daily-cancel-order"
              element={
                <ReportTemplate
                  title="Daily Cancel Order"
                  subtitle="Cancelled Orders Report"
                  columns={['ORDER NO.', 'DATE', 'CUSTOMER', 'AMOUNT', 'REASON', 'CANCELLED BY']}
                />
              }
            />
            <Route
              path="monthly-kpi"
              element={
                <ReportTemplate
                  title="Monthly KPI"
                  subtitle="Monthly Key Performance Indicators"
                  columns={['KPI', 'TARGET', 'ACTUAL', 'ACHIEVEMENT %', 'STATUS']}
                />
              }
            />
            <Route
              path="ytd-kpi"
              element={
                <ReportTemplate
                  title="YTD KPI"
                  subtitle="Year To Date Key Performance Indicators"
                  columns={['KPI', 'ANNUAL TARGET', 'YTD ACTUAL', 'ACHIEVEMENT %', 'PROJECTION']}
                />
              }
            />
            <Route
              path="geo-approval"
              element={
                <ReportTemplate
                  title="Geo Approval"
                  subtitle="Geographic Approval Status"
                  columns={['LOCATION', 'REQUEST', 'REQUESTED BY', 'STATUS', 'APPROVED BY', 'DATE']}
                />
              }
            />
            <Route
              path="delivery-export"
              element={
                <ReportTemplate
                  title="Delivery Export Report"
                  subtitle="Export Delivery Information"
                  columns={['DELIVERY NO.', 'DATE', 'CUSTOMER', 'ITEMS', 'AMOUNT', 'STATUS']}
                />
              }
            />
            <Route path="*" element={<ReportsHome />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function ReportsHome() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Select a report
        </h3>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          Choose a report from the sidebar to view details
        </p>
      </div>
    </div>
  );
}
