import { useState, type ReactNode } from 'react';
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

const tableColumns = [
  { key: 'outlet', label: 'Outlet', wide: true },
  { key: 'code', label: 'Code', wide: false },
  { key: 'outletCoverage', label: 'Outlet Coverage', wide: false },
  { key: 'outletExec', label: 'Outlet Exec', wide: false },
  { key: 'activeOutlet', label: 'Active Outlet', wide: false },
  { key: 'visitsPerDay', label: 'Visits Per Day', wide: false },
  { key: 'visitFreq', label: 'Visit Freq', wide: false },
  { key: 'timeSpent', label: 'Time Spent', wide: false },
  { key: 'routeComp', label: 'Route Comp', wide: false },
  { key: 'shelfPrice', label: 'Shelf Price', wide: false },
  { key: 'assortment', label: 'Assortment', wide: false },
  { key: 'shelfShare', label: 'Shelf Share', wide: false },
  { key: 'planogramCompl', label: 'Planogram Compl', wide: false },
];

const placeholderRows = [
  { outlet: 'Al Madina Supermarket', code: 'OUT-001', outletCoverage: '94%', outletExec: '88%', activeOutlet: 'Yes', visitsPerDay: '2.4', visitFreq: '3.2', timeSpent: '18m', routeComp: '96%', shelfPrice: '92%', assortment: '86%', shelfShare: '34%', planogramCompl: '91%' },
  { outlet: 'City Fresh Mart', code: 'OUT-015', outletCoverage: '87%', outletExec: '76%', activeOutlet: 'Yes', visitsPerDay: '1.8', visitFreq: '2.8', timeSpent: '14m', routeComp: '82%', shelfPrice: '88%', assortment: '79%', shelfShare: '28%', planogramCompl: '84%' },
  { outlet: 'Royal Grocery Chain', code: 'OUT-023', outletCoverage: '91%', outletExec: '84%', activeOutlet: 'Yes', visitsPerDay: '2.1', visitFreq: '3.0', timeSpent: '22m', routeComp: '90%', shelfPrice: '90%', assortment: '82%', shelfShare: '31%', planogramCompl: '88%' },
  { outlet: 'Green Valley Store', code: 'OUT-008', outletCoverage: '78%', outletExec: '72%', activeOutlet: 'Yes', visitsPerDay: '1.5', visitFreq: '2.4', timeSpent: '12m', routeComp: '74%', shelfPrice: '85%', assortment: '74%', shelfShare: '22%', planogramCompl: '76%' },
  { outlet: 'Quick Stop Express', code: 'OUT-042', outletCoverage: '65%', outletExec: '58%', activeOutlet: 'No', visitsPerDay: '1.2', visitFreq: '1.8', timeSpent: '10m', routeComp: '62%', shelfPrice: '78%', assortment: '68%', shelfShare: '18%', planogramCompl: '64%' },
  { outlet: 'Sunrise Grocery', code: 'OUT-031', outletCoverage: '82%', outletExec: '78%', activeOutlet: 'Yes', visitsPerDay: '1.9', visitFreq: '2.6', timeSpent: '16m', routeComp: '86%', shelfPrice: '86%', assortment: '76%', shelfShare: '25%', planogramCompl: '80%' },
  { outlet: 'Metro Mart Plus', code: 'OUT-055', outletCoverage: '96%', outletExec: '92%', activeOutlet: 'Yes', visitsPerDay: '2.8', visitFreq: '3.6', timeSpent: '25m', routeComp: '98%', shelfPrice: '94%', assortment: '90%', shelfShare: '38%', planogramCompl: '95%' },
  { outlet: 'Oasis Mini Market', code: 'OUT-067', outletCoverage: '72%', outletExec: '64%', activeOutlet: 'No', visitsPerDay: '1.0', visitFreq: '1.6', timeSpent: '8m', routeComp: '58%', shelfPrice: '72%', assortment: '62%', shelfShare: '14%', planogramCompl: '58%' },
  { outlet: 'Palm Heights Store', code: 'OUT-078', outletCoverage: '88%', outletExec: '82%', activeOutlet: 'Yes', visitsPerDay: '2.0', visitFreq: '2.8', timeSpent: '15m', routeComp: '84%', shelfPrice: '89%', assortment: '80%', shelfShare: '29%', planogramCompl: '82%' },
  { outlet: 'Golden Basket', code: 'OUT-089', outletCoverage: '74%', outletExec: '68%', activeOutlet: 'Yes', visitsPerDay: '1.4', visitFreq: '2.0', timeSpent: '11m', routeComp: '70%', shelfPrice: '80%', assortment: '70%', shelfShare: '20%', planogramCompl: '72%' },
];

function getCellColor(value: string): string {
  const num = parseFloat(value);
  if (isNaN(num)) {
    if (value === 'Yes') return 'text-green-600';
    if (value === 'No') return 'text-red-600';
    return 'text-gray-700 dark:text-gray-300';
  }
  if (num >= 90) return 'text-green-600';
  if (num >= 75) return 'text-amber-600';
  if (num >= 60) return 'text-orange-500';
  return 'text-red-600';
}

function renderCellContent(columnKey: string, value: string): ReactNode {
  if (columnKey === 'outlet') {
    return <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>;
  }
  if (columnKey === 'code') {
    return <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">{value}</span>;
  }
  return <span className={`text-xs font-semibold ${getCellColor(value)}`}>{value}</span>;
}

export function PositioningDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  return (
    <div className="space-y-0">
      {/* Top Filter Section */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 shadow-sm">
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
      <div className="border-t border-gray-200 dark:border-gray-700 my-0" />

      {/* Page Header */}
      <div className="pt-5 pb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchandising Positioning
        </h2>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/60">
                {tableColumns.map((col) => (
                  <th
                    key={col.key}
                    className={`
                      text-center border-b border-r border-gray-200 dark:border-gray-700
                      last:border-r-0 px-2 py-3
                      ${col.wide ? 'min-w-[160px] text-left px-4' : 'min-w-[80px]'}
                    `}
                  >
                    <div className="flex flex-col items-center justify-end h-16">
                      <span
                        className={`
                          text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400
                          leading-tight text-center
                          ${!col.wide ? '[writing-mode:vertical-lr] rotate-180' : ''}
                        `}
                      >
                        {col.label}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {placeholderRows.map((row, rowIndex) => (
                <tr
                  key={row.code}
                  className={`
                    border-b border-gray-100 dark:border-gray-800/50 last:border-0
                    hover:bg-gray-50 dark:hover:bg-gray-800/30
                    ${rowIndex % 2 === 0 ? '' : 'bg-gray-50/30 dark:bg-gray-800/10'}
                  `}
                >
                  {tableColumns.map((col) => {
                    const value = row[col.key as keyof typeof row];

                    return (
                      <td
                        key={col.key}
                        className={`
                          border-r border-gray-100 dark:border-gray-800/50 last:border-r-0
                          px-2 py-2.5
                          ${col.wide ? 'px-4 text-left' : 'text-center'}
                        `}
                      >
                        {renderCellContent(col.key, value)}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Empty rows placeholder for dynamic data */}
              {Array.from({ length: 5 }).map((_, i) => (
                <tr
                  key={`empty-${i}`}
                  className="border-b border-gray-100 dark:border-gray-800/50 last:border-0"
                >
                  {tableColumns.map((col) => (
                    <td
                      key={col.key}
                      className="border-r border-gray-100 dark:border-gray-800/50 last:border-r-0 px-2 py-2.5 text-center"
                    >
                      <span className="text-xs text-gray-300 dark:text-gray-700">—</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
