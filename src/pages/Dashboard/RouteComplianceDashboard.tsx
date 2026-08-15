import { useState } from 'react';
import {
  Trophy,
  TrendingDown,
  Route,
  Users,
  Target,
  CheckCircle2,
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

interface PerformerData {
  name: string;
  score: number;
  type: 'top' | 'lower' | 'standard';
  routes: number;
  visits: number;
}

const performers: PerformerData[] = [
  { name: 'Muhammad Irfan Abbasi', score: 16.67, type: 'top', routes: 6, visits: 42 },
  { name: 'Mohammed Dalowar Hossan Ibrahim', score: 0.0, type: 'lower', routes: 8, visits: 0 },
  { name: 'Sanjib Meche', score: 16.67, type: 'standard', routes: 6, visits: 38 },
  { name: 'Herbert Kimbugwe', score: 16.67, type: 'standard', routes: 6, visits: 36 },
  { name: 'Richard Musinguzi', score: 16.67, type: 'standard', routes: 6, visits: 41 },
  { name: 'Adeel Qasim Muhammad Qasim', score: 12.50, type: 'standard', routes: 8, visits: 28 },
  { name: 'Osman Ahmed', score: 11.11, type: 'standard', routes: 9, visits: 24 },
  { name: 'Aneesh Erinjeri', score: 5.56, type: 'standard', routes: 18, visits: 12 },
];

const totalMerchandisers = performers.length;
const avgCompliance = performers.reduce((sum, p) => sum + p.score, 0) / totalMerchandisers;
const totalVisits = performers.reduce((sum, p) => sum + p.visits, 0);
const aboveTarget = performers.filter((p) => p.score >= 15).length;

const accentMap: Record<string, { border: string; bg: string; text: string; bar: string; badge: string; badgeText: string }> = {
  top: {
    border: 'border-l-green-500',
    bg: 'bg-green-50 dark:bg-green-900/10',
    text: 'text-green-700 dark:text-green-400',
    bar: 'bg-green-500',
    badge: 'bg-green-100 dark:bg-green-900/30',
    badgeText: 'text-green-700 dark:text-green-400',
  },
  lower: {
    border: 'border-l-red-500',
    bg: 'bg-red-50 dark:bg-red-900/10',
    text: 'text-red-700 dark:text-red-400',
    bar: 'bg-red-500',
    badge: 'bg-red-100 dark:bg-red-900/30',
    badgeText: 'text-red-700 dark:text-red-400',
  },
  standard: {
    border: 'border-l-blue-500',
    bg: 'bg-white dark:bg-gray-900',
    text: 'text-blue-700 dark:text-blue-400',
    bar: 'bg-blue-500',
    badge: 'bg-blue-100 dark:bg-blue-900/30',
    badgeText: 'text-blue-700 dark:text-blue-400',
  },
};

function getPerformerLabel(type: PerformerData['type']): string {
  if (type === 'top') return 'Top Performer';
  if (type === 'lower') return 'Needs Improvement';
  return 'Performer';
}

function getRankBadgeClass(type: PerformerData['type']): string {
  if (type === 'top') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
  if (type === 'lower') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
  return 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400';
}

function PerformerCard({ performer, rank }: { performer: PerformerData; rank: number }) {
  const accent = accentMap[performer.type];
  const isHighlighted = performer.type === 'top' || performer.type === 'lower';

  return (
    <div
      className={`
        ${accent.bg} rounded-xl border border-gray-200 dark:border-gray-800
        border-l-4 ${accent.border} p-5 shadow-sm hover:shadow-md transition-shadow
      `}
    >
      {/* Header: Rank + Label */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className={`
            w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
            ${isHighlighted ? accent.badge + ' ' + accent.badgeText : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'}
          `}>
            {rank}
          </span>
          <span className={`text-[10px] font-semibold uppercase tracking-widest ${accent.badgeText}`}>
            {getPerformerLabel(performer.type)}
          </span>
        </div>
        {performer.type === 'top' && <Trophy className="w-4 h-4 text-amber-500" />}
        {performer.type === 'lower' && <TrendingDown className="w-4 h-4 text-red-400" />}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight truncate" title={performer.name}>
        {performer.name}
      </p>

      {/* Score + Bar */}
      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 dark:text-gray-400">Route Compliance</span>
          <span className={`text-sm font-bold ${accent.text}`}>{performer.score.toFixed(2)}%</span>
        </div>
        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
          <div
            className={`${accent.bar} h-2 rounded-full transition-all`}
            style={{ width: `${Math.max(performer.score, 1)}%` }}
          />
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800/50">
        <div className="flex items-center gap-1.5">
          <Route className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {performer.routes} routes
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {performer.visits} visits
          </span>
        </div>
      </div>
    </div>
  );
}

function KpiStat({ title, value, icon, color }: { title: string; value: string; icon: React.ReactNode; color: string }) {
  const colorMap: Record<string, { iconBg: string; valueText: string }> = {
    green: { iconBg: 'bg-green-50 text-green-500 dark:bg-green-900/20 dark:text-green-400', valueText: 'text-green-600' },
    blue: { iconBg: 'bg-blue-50 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400', valueText: 'text-gray-900 dark:text-white' },
    amber: { iconBg: 'bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400', valueText: 'text-amber-600' },
    default: { iconBg: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400', valueText: 'text-gray-900 dark:text-white' },
  };
  const c = colorMap[color] || colorMap.default;

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-xl shrink-0 ${c.iconBg}`}>{icon}</div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <p className={`text-2xl font-bold mt-1 ${c.valueText}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

export function RouteComplianceDashboard() {
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [merchandiser, setMerchandiser] = useState('');
  const [selectedOption, setSelectedOption] = useState('');

  const sorted = [...performers].sort((a, b) => b.score - a.score);
  const topPerformer = sorted.find((p) => p.type === 'top');
  const lowerPerformer = sorted.find((p) => p.type === 'lower');
  const standardPerformers = sorted.filter((p) => p.type === 'standard');

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
      <div className="pt-5 pb-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Merchandising – Reach-routeCompliance
        </h2>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
        <KpiStat
          title="Overall Compliance"
          value={`${avgCompliance.toFixed(1)}%`}
          icon={<Target className="w-6 h-6" />}
          color="amber"
        />
        <KpiStat
          title="Total Merchandisers"
          value={String(totalMerchandisers)}
          icon={<Users className="w-6 h-6" />}
          color="blue"
        />
        <KpiStat
          title="Total Route Visits"
          value={String(totalVisits)}
          icon={<Route className="w-6 h-6" />}
          color="default"
        />
        <KpiStat
          title="Above Target (15%)"
          value={`${aboveTarget} / ${totalMerchandisers}`}
          icon={<CheckCircle2 className="w-6 h-6" />}
          color="green"
        />
      </div>

      {/* Top & Lower Performer Highlight */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {topPerformer && <PerformerCard performer={topPerformer} rank={1} />}
        {lowerPerformer && <PerformerCard performer={lowerPerformer} rank={totalMerchandisers} />}
      </div>

      {/* All Performers Grid */}
      <div className="mt-6">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          All Performers
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {standardPerformers.map((performer, index) => (
            <PerformerCard
              key={performer.name}
              performer={performer}
              rank={index + 2}
            />
          ))}
        </div>
      </div>

      {/* Compliance Ranked Bar Chart */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-5 shadow-sm mt-6">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-amber-500 mb-4">
          Compliance Ranking
        </h3>
        <div className="space-y-3">
          {sorted.map((performer, index) => {
            const accent = accentMap[performer.type];
            return (
              <div key={performer.name} className="flex items-center gap-3">
                <span className={`
                  w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0
                  ${getRankBadgeClass(performer.type)}
                `}>
                  {index + 1}
                </span>
                <span className="text-sm text-gray-900 dark:text-white w-56 truncate shrink-0" title={performer.name}>
                  {performer.name}
                </span>
                <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                  <div
                    className={`${accent.bar} h-2.5 rounded-full transition-all`}
                    style={{ width: `${Math.max(performer.score, 0.5)}%` }}
                  />
                </div>
                <span className={`text-sm font-bold w-16 text-right shrink-0 ${accent.text}`}>
                  {performer.score.toFixed(2)}%
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
