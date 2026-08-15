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

const trendMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];

const trendSeries = [
  { name: 'Ahmed', color: 'text-amber-500', points: [40, 55, 48, 65, 58, 72] },
  { name: 'Mohammed', color: 'text-blue-500', points: [30, 42, 38, 50, 46, 58] },
  { name: 'Khalid', color: 'text-green-500', points: [20, 35, 30, 45, 40, 50] },
];

const barData = [
  { label: 'Ahmed', visits: 142, orders: 68, height: 96 },
  { label: 'Mohammed', visits: 118, orders: 52, height: 80 },
  { label: 'Khalid', visits: 132, orders: 62, height: 89 },
  { label: 'Yusuf', visits: 98, orders: 40, height: 66 },
  { label: 'Tariq', visits: 84, orders: 34, height: 57 },
];

const contributionSegments = [
  { label: 'Ahmed', pct: 26, color: '#f59e0b' },
  { label: 'Mohammed', pct: 20, color: '#3b82f6' },
  { label: 'Khalid', pct: 22, color: '#10b981' },
  { label: 'Yusuf', pct: 16, color: '#8b5cf6' },
  { label: 'Others', pct: 16, color: '#ef4444' },
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

function buildDonutPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const startRad = (startAngle - 90) * (Math.PI / 180);
  const endRad = (endAngle - 90) * (Math.PI / 180);
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`;
}

export function MerchandisingReachCoverageDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const donutRadius = 44;
  const donutCx = 60;
  const donutCy = 60;

  const donutSegments = contributionSegments.reduce<Array<{ label: string; color: string; startAngle: number; endAngle: number }>>((acc, seg) => {
    const prevEnd = acc.length > 0 ? acc[acc.length - 1].endAngle : 0;
    const endAngle = prevEnd + (seg.pct / 100) * 360;
    acc.push({ label: seg.label, color: seg.color, startAngle: prevEnd, endAngle });
    return acc;
  }, []);

  return (
    <div className="space-y-0 overflow-y-auto">
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
          Merchandising &ndash; Reach-coverage
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
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Trends by Merchandiser
          </h3>
          <div className="flex-1 min-h-[220px] flex flex-col">
            {/* Chart area */}
            <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                ))}
              </div>
              {/* SVG trend lines */}
              <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 500 200">
                {trendSeries.map((series, si) => {
                  const colors = ['#f59e0b', '#3b82f6', '#10b981'];
                  const points = series.points
                    .map((p, i) => `${(i / (series.points.length - 1)) * 500},${200 - (p / 100) * 200}`)
                    .join(' ');
                  return (
                    <polyline
                      key={si}
                      points={points}
                      fill="none"
                      stroke={colors[si]}
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                })}
              </svg>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-between pt-2 px-1">
              {trendMonths.map((m) => (
                <span key={m} className="text-[9px] text-gray-400">{m}</span>
              ))}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-2">
              {trendSeries.map((s) => (
                <div key={s.name} className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${s.color.replace('text-', 'bg-')}`} />
                  <span className="text-[9px] text-gray-500 dark:text-gray-400">{s.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Comparison by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Comparison by Merchandiser
          </h3>
          <div className="flex-1 min-h-[220px] flex flex-col">
            <div className="relative flex-1 border-b border-l border-gray-200 dark:border-gray-700">
              {/* Grid lines */}
              <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                {[0, 1, 2, 3, 4].map((i) => (
                  <div key={i} className="border-t border-dashed border-gray-100 dark:border-gray-800 w-full" />
                ))}
              </div>
              {/* Bars */}
              <div className="absolute inset-0 flex items-end justify-around px-2 pb-0.5 gap-1">
                {barData.map((d) => (
                  <div key={d.label} className="flex items-end gap-0.5 flex-1 max-w-[40px]">
                    <div
                      className="flex-1 bg-amber-400 dark:bg-amber-500/80 rounded-t-sm transition-all"
                      style={{ height: `${d.height}%` }}
                    />
                    <div
                      className="flex-1 bg-blue-400 dark:bg-blue-500/80 rounded-t-sm transition-all"
                      style={{ height: `${Math.round((d.orders / 148) * 100)}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            {/* X-axis labels */}
            <div className="flex justify-around pt-2">
              {barData.map((d) => (
                <span key={d.label} className="text-[9px] text-gray-400">{d.label}</span>
              ))}
            </div>
            {/* Legend */}
            <div className="flex gap-3 mt-2">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Visits</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-[9px] text-gray-500 dark:text-gray-400">Orders</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contribution by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Contribution by Merchandiser
          </h3>
          <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center">
            {/* Donut chart */}
            <div className="relative">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Background circle */}
                <circle
                  cx={donutCx}
                  cy={donutCy}
                  r={donutRadius}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="14"
                  className="text-gray-100 dark:text-gray-800"
                />
                {donutSegments.map((seg) => (
                  <path
                    key={seg.label}
                    d={buildDonutPath(donutCx, donutCy, donutRadius, seg.startAngle, seg.endAngle - 1)}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="14"
                    strokeLinecap="round"
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xs text-gray-400">Total</span>
                <span className="text-xl font-bold text-gray-900 dark:text-white">100%</span>
              </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3">
              {contributionSegments.map((seg) => (
                <div key={seg.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
                  <span className="text-[9px] text-gray-500 dark:text-gray-400">
                    {seg.label} ({seg.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Details by Merchandiser */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm flex flex-col">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-3">
            Details by Merchandiser
          </h3>
          <div className="overflow-y-auto flex-1 max-h-[260px]">
            <table className="w-full">
              <thead className="sticky top-0 bg-white dark:bg-gray-900">
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pr-2 py-1.5">
                    Merchandiser
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 py-1.5">
                    Visits
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1 py-1.5">
                    Total Outlets
                  </th>
                  <th className="text-right text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400 pl-1 py-1.5">
                    Coverage
                  </th>
                </tr>
              </thead>
              <tbody>
                {detailData.map((row) => (
                  <tr
                    key={row.merchandiser}
                    className="border-b border-gray-50 dark:border-gray-800/30 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <td className="pr-2 py-2 text-xs text-gray-900 dark:text-white font-medium truncate max-w-[110px]">
                      {row.merchandiser}
                    </td>
                    <td className="text-right px-1 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {row.visits}
                    </td>
                    <td className="text-right px-1 py-2 text-xs text-gray-600 dark:text-gray-400">
                      {row.totalOutlets}
                    </td>
                    <td className={`text-right pl-1 py-2 text-xs font-semibold ${getCoverageColor(row.coverage)}`}>
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
