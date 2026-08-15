import { useState } from 'react';
import {
  MapPin,
  Zap,
  Store,
  CalendarClock,
  Target,
  Repeat,
  Clock,
  Route,
} from 'lucide-react';
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

interface KpiCardData {
  title: string;
  value: string;
  description: string;
  valueColor: 'red' | 'green' | 'default';
  icon: React.ReactNode;
}

const row1Cards: KpiCardData[] = [
  {
    title: 'Coverage',
    value: '0%',
    description: 'Outlets visited at least once this month vs all outlets in the market',
    valueColor: 'red',
    icon: <MapPin className="w-6 h-6" />,
  },
  {
    title: 'Execution',
    value: '0%',
    description: 'Outlets influenced by a sales rep',
    valueColor: 'default',
    icon: <Zap className="w-6 h-6" />,
  },
  {
    title: 'Active Outlets',
    value: '0%',
    description: 'Where at least one invoice was made from a visit this month',
    valueColor: 'green',
    icon: <Store className="w-6 h-6" />,
  },
  {
    title: 'Visits Per Day',
    value: '0.0',
    description: 'Average number of visits made by a salesman in a day',
    valueColor: 'default',
    icon: <CalendarClock className="w-6 h-6" />,
  },
];

const row2Cards: KpiCardData[] = [
  {
    title: 'Strike Rate',
    value: '0%',
    description: 'Orders received vs visits per day',
    valueColor: 'default',
    icon: <Target className="w-6 h-6" />,
  },
  {
    title: 'Visit Frequency',
    value: '0.0',
    description: 'Visit frequency per outlet',
    valueColor: 'default',
    icon: <Repeat className="w-6 h-6" />,
  },
  {
    title: 'Time Spent',
    value: '0.0',
    description: 'Average time spent per visit',
    valueColor: 'default',
    icon: <Clock className="w-6 h-6" />,
  },
  {
    title: 'Route Compliance',
    value: '0%',
    description: 'Compliance to route plan',
    valueColor: 'default',
    icon: <Route className="w-6 h-6" />,
  },
];

const valueColorMap: Record<string, string> = {
  red: 'text-red-600',
  green: 'text-green-600',
  default: 'text-gray-800 dark:text-gray-200',
};

const iconBgMap: Record<string, string> = {
  red: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  green: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
  default: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

function KpiCard({ card }: { card: KpiCardData }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${iconBgMap[card.valueColor]}`}>
          {card.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              {card.title}
            </p>
            <p className={`text-2xl font-bold leading-none ${valueColorMap[card.valueColor]}`}>
              {card.value}
            </p>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
            {card.description}
          </p>
        </div>
      </div>
    </div>
  );
}

function getCoverageColor(value: number): string {
  if (value >= 90) return 'text-green-600';
  if (value >= 80) return 'text-amber-600';
  return 'text-red-600';
}

export function ReachCoverageDashboard() {
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
          <div className="hidden md:block">
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Last Reload Date: 12/12/2020
            </span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-gray-200 dark:border-gray-700 my-0" />

      {/* Page Title */}
      <div className="pt-5 pb-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchandising – Reach-coverage
        </h2>
      </div>

      {/* Row 1 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {row1Cards.map((card) => (
          <KpiCard key={card.title} card={card} />
        ))}
      </div>

      {/* Row 2 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        {row2Cards.map((card) => (
          <KpiCard key={card.title} card={card} />
        ))}
      </div>

      {/* Row 3 Analytics Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {/* Trends by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Trends by Merchandiser
          </h3>
          <div className="min-h-[180px] flex flex-col justify-end">
            <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">Line / Area chart</span>
              </div>
            </div>
            <div className="flex justify-between pt-2 px-1">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m) => (
                <span key={m} className="text-[9px] text-gray-400">{m}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Comparison by Merchandiser
          </h3>
          <div className="min-h-[180px] flex flex-col justify-end">
            <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700">
              <div className="absolute inset-0 flex flex-col justify-between">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                ))}
              </div>
              <div className="absolute inset-0 flex items-end justify-around px-3 pb-0.5">
                {[60, 40, 75, 30, 55].map((h, i) => (
                  <div
                    key={i}
                    className="w-4 bg-primary-200 dark:bg-primary-900/40 rounded-t-sm"
                    style={{ height: `${h}%` }}
                  />
                ))}
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs text-gray-400 dark:text-gray-500">Bar comparison</span>
              </div>
            </div>
            <div className="flex justify-around pt-2">
              {['A', 'B', 'C', 'D', 'E'].map((l) => (
                <span key={l} className="text-[9px] text-gray-400">{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Contribution by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Contribution by Merchandiser
          </h3>
          <div className="min-h-[180px] flex items-center justify-center">
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  className="text-gray-100 dark:text-gray-800"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="12"
                  strokeDasharray="301.6"
                  strokeDashoffset="301.6"
                  strokeLinecap="round"
                  className="text-primary-500"
                  transform="rotate(-90 60 60)"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Details by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Details by Merchandiser
          </h3>
          <div className="overflow-y-auto max-h-[200px]">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pr-2 py-1.5">
                    Merchandiser
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 py-1.5">
                    Visits
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 py-1.5">
                    Outlets
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1 py-1.5">
                    Cov.
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((row) => (
                  <tr
                    key={row.merchandiser}
                    className="border-b border-gray-50 dark:border-gray-800/30 last:border-0"
                  >
                    <td className="pr-2 py-1.5 text-xs text-gray-900 dark:text-white truncate max-w-[100px]">
                      {row.merchandiser.split(' ')[0]}
                    </td>
                    <td className="text-right px-1 py-1.5 text-xs text-gray-600 dark:text-gray-400">
                      {row.visits}
                    </td>
                    <td className="text-right px-1 py-1.5 text-xs text-gray-600 dark:text-gray-400">
                      {row.totalOutlets}
                    </td>
                    <td className={`text-right pl-1 py-1.5 text-xs font-semibold ${getCoverageColor(row.coverage)}`}>
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
