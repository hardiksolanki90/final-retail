import { useState } from 'react';
import { TriangleAlert } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';

const merchandiserOptions = [
  { value: '', label: 'All Merchandisers' },
  { value: 'ahmed', label: 'Ahmed Al-Hassan' },
  { value: 'mohammed', label: 'Mohammed Reza' },
  { value: 'khalid', label: 'Khalid Omar' },
  { value: 'richard', label: 'Richard Musinguzi' },
  { value: 'abdallah', label: 'Abdallah Mohammad' },
];

const selectOptions = [
  { value: '', label: 'Select Options' },
  { value: 'region', label: 'By Region' },
  { value: 'route', label: 'By Route' },
  { value: 'channel', label: 'By Channel' },
];

const filterOptions = [
  { value: 'coverage', label: 'Coverage' },
  { value: 'active-outlets', label: 'Active Outlets' },
  { value: 'journey-plan', label: 'Journey Plan Compliance' },
  { value: 'visit-frequency', label: 'Visit Frequency' },
  { value: 'share-of-shelf', label: 'Share Of Shelf' },
  { value: 'msl-compliance', label: 'MSL Compliance' },
];

const detailData = [
  { merchandiser: 'Ahmed Al-Hassan', visits: 142, totalOutlets: 148, coverage: 95.9 },
  { merchandiser: 'Mohammed Reza', visits: 118, totalOutlets: 136, coverage: 86.8 },
  { merchandiser: 'Khalid Omar', visits: 132, totalOutlets: 142, coverage: 93.0 },
  { merchandiser: 'Yusuf Ibrahim', visits: 98, totalOutlets: 128, coverage: 76.6 },
  { merchandiser: 'Tariq Saeed', visits: 84, totalOutlets: 120, coverage: 70.0 },
  { merchandiser: 'Faisal Noor', visits: 126, totalOutlets: 132, coverage: 95.5 },
  { merchandiser: 'Omar Said', visits: 108, totalOutlets: 124, coverage: 87.1 },
  { merchandiser: 'Hamza Reza', visits: 92, totalOutlets: 116, coverage: 79.3 },
];

function getCoverageColor(value: number): string {
  if (value >= 90) return 'text-green-600';
  if (value >= 80) return 'text-amber-600';
  return 'text-red-600';
}

export function MerchandisingAnalyticsDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [activeFilter, setActiveFilter] = useState('coverage');

  return (
    <div className="space-y-0">
      {/* Top Filter Bar */}
      <div className="bg-white dark:bg-gray-900 rounded-t-xl border border-b-0 border-gray-200 dark:border-gray-800 p-4">
        <div className="flex flex-col md:flex-row items-end gap-3">
          <div className="w-full md:w-auto md:flex-1">
            <Input
              label="From Date"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Input
              label="To Date"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Select
              label="Merchandiser"
              options={merchandiserOptions}
              value={merchandiser}
              onChange={(e) => setMerchandiser(e.target.value)}
            />
          </div>
          <div className="w-full md:w-auto md:flex-1">
            <Select
              label="Select Options"
              options={selectOptions}
              value={selectedOption}
              onChange={(e) => setSelectedOption(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700" />

      {/* Page Header with Filter */}
      <div className="bg-white dark:bg-gray-900 rounded-b-xl border border-t-0 border-gray-200 dark:border-gray-800 px-5 py-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Merchandising
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Select Filter</span>
            <select
              value={activeFilter}
              onChange={(e) => setActiveFilter(e.target.value)}
              className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {filterOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Row 1: Snapshot / Trend / Contribution */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-6">
        {/* Snapshot Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Snapshot
            </h3>
            <TriangleAlert className="w-4 h-4 text-green-500 rotate-180" />
          </div>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            <span className="text-5xl font-bold text-gray-900 dark:text-white">0%</span>
          </div>
        </div>

        {/* Trend Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Trend
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {/* Chart Placeholder - Line/Area chart */}
            <div className="w-full h-full flex flex-col justify-end px-2 pt-4">
              <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3].map((i) => (
                    <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                  ))}
                </div>
                {/* Placeholder label */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Line chart area
                  </span>
                </div>
              </div>
              {/* X-axis labels */}
              <div className="flex justify-between pt-2 px-1">
                {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                  <span key={m} className="text-[10px] text-gray-400 dark:text-gray-500">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Contribution Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
            Contribution
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-[180px]">
            {/* Donut chart placeholder */}
            <div className="relative">
              <svg width="140" height="140" viewBox="0 0 140 140">
                {/* Background ring */}
                <circle
                  cx="70"
                  cy="70"
                  r="55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-gray-100 dark:text-gray-800"
                />
                {/* Foreground ring - 0% so just the background shows */}
                <circle
                  cx="70"
                  cy="70"
                  r="55"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  strokeDasharray="345.6"
                  strokeDashoffset="345.6"
                  strokeLinecap="round"
                  className="text-primary-500"
                  transform="rotate(-90 70 70)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Comparison / Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        {/* Comparison Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
            Comparison
          </h3>
          <div className="min-h-[260px]">
            {/* Bar chart placeholder */}
            <div className="h-full flex flex-col justify-end">
              <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700 min-h-[220px]">
                {/* Grid lines */}
                <div className="absolute inset-0 flex flex-col justify-between">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                  ))}
                </div>
                {/* Y-axis labels */}
                <div className="absolute -left-8 inset-y-0 flex flex-col justify-between py-0.5">
                  {['100', '75', '50', '25', '0'].map((v) => (
                    <span key={v} className="text-[10px] text-gray-400 dark:text-gray-500">{v}</span>
                  ))}
                </div>
                {/* Placeholder bars */}
                <div className="absolute inset-0 flex items-end justify-around px-6 pb-0.5">
                  {['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat E'].map((cat) => (
                    <div key={cat} className="flex flex-col items-center gap-1 flex-1 mx-1">
                      <div className="w-full max-w-[40px] bg-gray-100 dark:bg-gray-800 rounded-t-sm h-4" />
                    </div>
                  ))}
                </div>
                {/* Center placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm text-gray-400 dark:text-gray-500">
                    Bar / Line comparison chart
                  </span>
                </div>
              </div>
              {/* X-axis labels */}
              <div className="flex justify-around pt-2 pl-2">
                {['Cat A', 'Cat B', 'Cat C', 'Cat D', 'Cat E'].map((cat) => (
                  <span key={cat} className="text-[10px] text-gray-400 dark:text-gray-500">{cat}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Card */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
            Detail
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2.5">
                    Merchandiser
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2.5">
                    Visits
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2.5">
                    Total Outlets
                  </th>
                  <th className="text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-4 py-2.5">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((row) => (
                  <tr
                    key={row.merchandiser}
                    className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-4 py-2.5 text-sm text-gray-900 dark:text-white">
                      {row.merchandiser}
                    </td>
                    <td className="text-right px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                      {row.visits}
                    </td>
                    <td className="text-right px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">
                      {row.totalOutlets}
                    </td>
                    <td className={`text-right px-4 py-2.5 text-sm font-semibold ${getCoverageColor(row.coverage)}`}>
                      {row.coverage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
