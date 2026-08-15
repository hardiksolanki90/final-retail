import { useState } from 'react';
import {
  Repeat,
  CalendarClock,
  Users,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
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

interface MerchandiserFrequency {
  name: string;
  planned: number;
  actual: number;
  frequency: number;
  outlets: number;
  avgTimeSpent: string;
}

const merchandiserData: MerchandiserFrequency[] = [
  { name: 'Ahmed Al-Hassan', planned: 148, actual: 142, frequency: 3.4, outlets: 42, avgTimeSpent: '22m' },
  { name: 'Mohammed Reza', planned: 136, actual: 118, frequency: 2.8, outlets: 38, avgTimeSpent: '18m' },
  { name: 'Khalid Omar', planned: 142, actual: 132, frequency: 3.2, outlets: 40, avgTimeSpent: '20m' },
  { name: 'Yusuf Ibrahim', planned: 128, actual: 98, frequency: 2.1, outlets: 34, avgTimeSpent: '15m' },
  { name: 'Tariq Saeed', planned: 120, actual: 84, frequency: 1.8, outlets: 30, avgTimeSpent: '12m' },
  { name: 'Faisal Noor', planned: 132, actual: 126, frequency: 3.6, outlets: 36, avgTimeSpent: '24m' },
  { name: 'Omar Said', planned: 124, actual: 108, frequency: 2.6, outlets: 35, avgTimeSpent: '17m' },
  { name: 'Hamza Reza', planned: 116, actual: 92, frequency: 2.0, outlets: 32, avgTimeSpent: '14m' },
];

const frequencyDistribution = [
  { bucket: '0 visits', outlets: 42, color: 'bg-red-500' },
  { bucket: '1 visit', outlets: 86, color: 'bg-orange-500' },
  { bucket: '2 visits', outlets: 124, color: 'bg-amber-500' },
  { bucket: '3 visits', outlets: 168, color: 'bg-blue-500' },
  { bucket: '4+ visits', outlets: 98, color: 'bg-green-500' },
];

const weeklyTrend = [
  { week: 'W1', avgFreq: 2.4, visits: 186 },
  { week: 'W2', avgFreq: 2.8, visits: 212 },
  { week: 'W3', avgFreq: 2.6, visits: 198 },
  { week: 'W4', avgFreq: 3.1, visits: 238 },
  { week: 'W5', avgFreq: 2.9, visits: 224 },
  { week: 'W6', avgFreq: 3.2, visits: 246 },
  { week: 'W7', avgFreq: 2.7, visits: 208 },
  { week: 'W8', avgFreq: 3.4, visits: 262 },
];

const totalPlanned = merchandiserData.reduce((s, m) => s + m.planned, 0);
const totalActual = merchandiserData.reduce((s, m) => s + m.actual, 0);
const avgFrequency = merchandiserData.reduce((s, m) => s + m.frequency, 0) / merchandiserData.length;
const complianceRate = Math.round((totalActual / totalPlanned) * 100);
const totalOutlets = frequencyDistribution.reduce((s, d) => s + d.outlets, 0);
const maxDistribution = Math.max(...frequencyDistribution.map((d) => d.outlets));
const maxWeeklyVisits = Math.max(...weeklyTrend.map((w) => w.visits));
const underVisited = frequencyDistribution[0].outlets + frequencyDistribution[1].outlets;

interface KpiCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  color: 'green' | 'blue' | 'amber' | 'red' | 'default';
}

const iconBgMap: Record<string, string> = {
  green: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400',
  blue: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400',
  amber: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400',
  red: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  default: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400',
};

const valueColorMap: Record<string, string> = {
  green: 'text-green-600',
  blue: 'text-gray-900 dark:text-white',
  amber: 'text-amber-600',
  red: 'text-red-600',
  default: 'text-gray-900 dark:text-white',
};

function KpiCard({ title, value, description, icon, color }: KpiCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${iconBgMap[color]}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${valueColorMap[color]}`}>{value}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function getComplianceKpiColor(rate: number): KpiCardProps['color'] {
  if (rate >= 90) return 'green';
  if (rate >= 75) return 'amber';
  return 'red';
}

function getFrequencyColor(value: number): string {
  if (value >= 3.0) return 'text-green-600';
  if (value >= 2.5) return 'text-amber-600';
  return 'text-red-600';
}

function getComplianceColor(planned: number, actual: number): string {
  const rate = (actual / planned) * 100;
  if (rate >= 90) return 'text-green-600';
  if (rate >= 75) return 'text-amber-600';
  return 'text-red-600';
}

function getComplianceBg(planned: number, actual: number): string {
  const rate = (actual / planned) * 100;
  if (rate >= 90) return 'bg-green-500';
  if (rate >= 75) return 'bg-amber-500';
  return 'bg-red-500';
}

function getFrequencyBarColor(frequency: number): string {
  if (frequency >= 3.0) return 'bg-green-500';
  if (frequency >= 2.5) return 'bg-amber-500';
  return 'bg-red-500';
}

export function VisitFrequencyDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const sorted = [...merchandiserData].sort((a, b) => b.frequency - a.frequency);

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

      {/* Page Header */}
      <div className="pt-5 pb-1">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchandising &ndash; Reach-visitFrequency
        </h2>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiCard
          title="Avg Visit Frequency"
          value={avgFrequency.toFixed(1)}
          description="Average visits per outlet per week across all merchandisers"
          icon={<Repeat className="w-6 h-6" />}
          color="blue"
        />
        <KpiCard
          title="Visit Compliance"
          value={`${complianceRate}%`}
          description={`${totalActual} actual vs ${totalPlanned} planned visits this period`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color={getComplianceKpiColor(complianceRate)}
        />
        <KpiCard
          title="Under-Visited Outlets"
          value={String(underVisited)}
          description="Outlets with 0 or 1 visit this period (needs attention)"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <KpiCard
          title="Total Outlets Covered"
          value={String(totalOutlets - frequencyDistribution[0].outlets)}
          description={`Out of ${totalOutlets} total outlets in the market`}
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Row 2: Weekly Trend + Frequency Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
        {/* Weekly Visit Trend */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Weekly Visit Trend
            </h3>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                Visits
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                Avg Freq
              </span>
            </div>
          </div>
          <div className="flex items-end gap-2 h-48">
            {weeklyTrend.map((week) => (
              <div key={week.week} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-[9px] font-medium text-amber-600">
                  {week.avgFreq}
                </span>
                <div className="w-full flex items-end gap-0.5 h-36">
                  <div
                    className="flex-1 bg-blue-500 rounded-t-sm transition-all hover:opacity-80"
                    style={{ height: `${(week.visits / maxWeeklyVisits) * 100}%` }}
                    title={`${week.visits} visits`}
                  />
                </div>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">{week.week}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Frequency Distribution */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
            Outlet Frequency Distribution
          </h3>
          {/* Stacked bar */}
          <div className="flex rounded-full h-3.5 overflow-hidden mb-5">
            {frequencyDistribution.map((d) => (
              <div
                key={d.bucket}
                className={`${d.color} transition-all`}
                style={{ width: `${(d.outlets / totalOutlets) * 100}%` }}
                title={`${d.bucket}: ${d.outlets} outlets`}
              />
            ))}
          </div>
          {/* Horizontal bars */}
          <div className="space-y-3">
            {frequencyDistribution.map((d) => (
              <div key={d.bucket}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${d.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{d.bucket}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {d.outlets}
                    </span>
                    <span className="text-xs text-gray-400">
                      ({Math.round((d.outlets / totalOutlets) * 100)}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                  <div
                    className={`${d.color} h-1.5 rounded-full transition-all`}
                    style={{ width: `${(d.outlets / maxDistribution) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Merchandiser Frequency Table + Top/Bottom Performers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-6">
        {/* Merchandiser Detail Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm lg:col-span-2">
          <div className="p-5 pb-0">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500">
              Frequency by Merchandiser
            </h3>
            <p className="text-xs text-gray-400 mt-1">Planned vs actual visits and average frequency per outlet</p>
          </div>
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-5 py-3">Merchandiser</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Outlets</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Planned</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Actual</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Compliance</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Frequency</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-3">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((row) => {
                  const rate = Math.round((row.actual / row.planned) * 100);
                  return (
                    <tr
                      key={row.name}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{row.name}</span>
                      </td>
                      <td className="text-center px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {row.outlets}
                      </td>
                      <td className="text-right px-3 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {row.planned}
                      </td>
                      <td className="text-right px-3 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {row.actual}
                      </td>
                      <td className="text-center px-3 py-3">
                        <div className="flex items-center justify-center gap-1.5">
                          <div className="w-14 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full ${getComplianceBg(row.planned, row.actual)}`}
                              style={{ width: `${Math.min(rate, 100)}%` }}
                            />
                          </div>
                          <span className={`text-xs font-semibold ${getComplianceColor(row.planned, row.actual)}`}>
                            {rate}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-sm font-bold ${getFrequencyColor(row.frequency)}`}>
                          {row.frequency.toFixed(1)}
                        </span>
                      </td>
                      <td className="text-center px-3 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {row.avgTimeSpent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Frequency Ranking */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
            Frequency Ranking
          </h3>
          <div className="space-y-3">
            {sorted.map((m, index) => {
              const isTop = index === 0;
              const isBottom = index === sorted.length - 1;
              return (
                <div
                  key={m.name}
                  className={`
                    flex items-center gap-3 p-2.5 rounded-lg
                    ${isTop ? 'bg-green-50 dark:bg-green-900/10' : isBottom ? 'bg-red-50 dark:bg-red-900/10' : ''}
                  `}
                >
                  <span className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                    ${isTop ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                      : isBottom ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
                  `}>
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                      {m.name}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${getFrequencyBarColor(m.frequency)}`}
                          style={{ width: `${(m.frequency / 4.0) * 100}%` }}
                        />
                      </div>
                      <span className={`text-xs font-bold shrink-0 ${getFrequencyColor(m.frequency)}`}>
                        {m.frequency.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  {isTop && <TrendingUp className="w-3.5 h-3.5 text-green-500 shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
