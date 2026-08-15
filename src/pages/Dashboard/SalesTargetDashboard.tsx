import {
  Target,
  TrendingUp,
  Medal,
  Banknote,
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const salesmanTargets = [
  { name: 'Ahmed Al-Hassan', route: 'Route-N1', target: 120000, actual: 134400, collection: 118200, outlets: 48, visitRate: 94 },
  { name: 'Mohammed Reza', route: 'Route-N2', target: 105000, actual: 98700, collection: 86400, outlets: 42, visitRate: 89 },
  { name: 'Khalid Omar', route: 'Route-S1', target: 98000, actual: 108780, collection: 96800, outlets: 38, visitRate: 92 },
  { name: 'Yusuf Ibrahim', route: 'Route-E1', target: 85000, actual: 72250, collection: 64200, outlets: 35, visitRate: 78 },
  { name: 'Tariq Saeed', route: 'Route-W1', target: 78000, actual: 62400, collection: 54800, outlets: 32, visitRate: 72 },
  { name: 'Faisal Noor', route: 'Route-C1', target: 92000, actual: 96600, collection: 88400, outlets: 28, visitRate: 96 },
  { name: 'Omar Said', route: 'Route-N3', target: 88000, actual: 81840, collection: 72600, outlets: 36, visitRate: 85 },
  { name: 'Hamza Reza', route: 'Route-S2', target: 75000, actual: 82500, collection: 74800, outlets: 30, visitRate: 91 },
];

const regionTargets = [
  { region: 'North', target: 420000, actual: 386400, achievement: 92 },
  { region: 'South', target: 340000, actual: 312800, achievement: 92 },
  { region: 'East', target: 280000, actual: 246400, achievement: 88 },
  { region: 'West', target: 240000, actual: 196800, achievement: 82 },
  { region: 'Central', target: 180000, actual: 158400, achievement: 88 },
  { region: 'Metro', target: 140000, actual: 134400, achievement: 96 },
];

const monthlyAchievement = [
  { month: 'Jan', target: 1200000, actual: 1044000, achievement: 87 },
  { month: 'Feb', target: 1250000, actual: 1137500, achievement: 91 },
  { month: 'Mar', target: 1300000, actual: 1235000, achievement: 95 },
  { month: 'Apr', target: 1280000, actual: 1075200, achievement: 84 },
  { month: 'May', target: 1350000, actual: 1282500, achievement: 95 },
  { month: 'Jun', target: 1400000, actual: 1218000, achievement: 87 },
  { month: 'Jul', target: 1380000, actual: 1297200, achievement: 94 },
  { month: 'Aug', target: 1420000, actual: 1334800, achievement: 94 },
  { month: 'Sep', target: 1450000, actual: 1261500, achievement: 87 },
  { month: 'Oct', target: 1500000, actual: 1440000, achievement: 96 },
  { month: 'Nov', target: 1480000, actual: 1376400, achievement: 93 },
  { month: 'Dec', target: 1550000, actual: 1441500, achievement: 93 },
];

const collectionAging = [
  { bucket: '0-30 days', amount: 1240000, percentage: 52, color: 'bg-green-500' },
  { bucket: '31-60 days', amount: 620000, percentage: 26, color: 'bg-amber-500' },
  { bucket: '61-90 days', amount: 312000, percentage: 13, color: 'bg-orange-500' },
  { bucket: '90+ days', amount: 228000, percentage: 9, color: 'bg-red-500' },
];

const totalTarget = 1550000;
const totalActual = 1441500;
const overallAchievement = Math.round((totalActual / totalTarget) * 100);
const totalCollection = salesmanTargets.reduce((sum, s) => sum + s.collection, 0);
const maxMonthlyTarget = Math.max(...monthlyAchievement.map((m) => m.target));

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getAchievementColor(value: number): string {
  if (value >= 95) return 'bg-green-500';
  if (value >= 85) return 'bg-amber-500';
  return 'bg-red-500';
}

function getAchievementTextColor(value: number): string {
  if (value >= 95) return 'text-green-600';
  if (value >= 85) return 'text-amber-600';
  return 'text-red-600';
}

function getAchievementBadge(value: number): 'success' | 'warning' | 'danger' {
  if (value >= 95) return 'success';
  if (value >= 85) return 'warning';
  return 'danger';
}

export function SalesTargetDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Monthly Target"
          value={formatCurrency(totalTarget)}
          icon={<Target className="w-6 h-6" />}
          trend={{ value: 4.7, isPositive: true }}
        />
        <StatCard
          title="Actual Sales"
          value={formatCurrency(totalActual)}
          icon={<TrendingUp className="w-6 h-6" />}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Achievement"
          value={`${overallAchievement}%`}
          icon={<Medal className="w-6 h-6" />}
          trend={{ value: 3.4, isPositive: true }}
        />
        <StatCard
          title="Collection"
          value={formatCurrency(totalCollection)}
          icon={<Banknote className="w-6 h-6" />}
          trend={{ value: 5.1, isPositive: true }}
        />
      </div>

      {/* Monthly Achievement Trend + Region Targets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Achievement */}
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader
            title="Monthly Achievement"
            subtitle="Target vs actual sales (12 months)"
            action={
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary-500" />
                  Actual
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
                  Target
                </span>
              </div>
            }
          />
          <CardContent className="mt-6">
            <div className="flex items-end gap-1.5 h-52">
              {monthlyAchievement.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-medium text-gray-500 dark:text-gray-400">
                    {item.achievement}%
                  </span>
                  <div className="w-full flex items-end gap-0.5 h-44">
                    <div
                      className={`flex-1 rounded-t-sm transition-all hover:opacity-80 ${getAchievementColor(item.achievement)}`}
                      style={{ height: `${(item.actual / maxMonthlyTarget) * 100}%` }}
                      title={`Actual: ${formatCurrency(item.actual)}`}
                    />
                    <div
                      className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-sm"
                      style={{ height: `${(item.target / maxMonthlyTarget) * 100}%` }}
                      title={`Target: ${formatCurrency(item.target)}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Region Targets */}
        <Card padding="lg">
          <CardHeader title="Region Achievement" subtitle="Target achievement by region" />
          <CardContent className="mt-4 space-y-3">
            {regionTargets.map((item) => (
              <div key={item.region}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.region}</span>
                  <span className={`text-sm font-semibold ${getAchievementTextColor(item.achievement)}`}>
                    {item.achievement}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`${getAchievementColor(item.achievement)} h-2 rounded-full transition-all`}
                    style={{ width: `${item.achievement}%` }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-xs text-gray-400">{formatCurrency(item.actual)}</span>
                  <span className="text-xs text-gray-400">/ {formatCurrency(item.target)}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Salesman Target Table + Collection Aging */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Salesman Leaderboard */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-6 pb-0">
            <CardHeader title="Salesman Performance" subtitle="Individual target achievement & collection" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Salesman</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Target</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Actual</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Achievement</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Collection</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Visit Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {salesmanTargets
                    .sort((a, b) => (b.actual / b.target) - (a.actual / a.target))
                    .map((person, index) => {
                      const achievement = Math.round((person.actual / person.target) * 100);
                      const collectionRate = Math.round((person.collection / person.actual) * 100);
                      return (
                        <tr
                          key={person.name}
                          className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                        >
                          <td className="px-6 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                                index < 3
                                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                                  : 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{person.route} | {person.outlets} outlets</p>
                              </div>
                            </div>
                          </td>
                          <td className="text-right px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {formatCurrency(person.target)}
                          </td>
                          <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(person.actual)}
                          </td>
                          <td className="text-center px-6 py-3">
                            <Badge variant={getAchievementBadge(achievement)} size="sm">
                              {achievement}%
                            </Badge>
                          </td>
                          <td className="text-right px-6 py-3">
                            <div>
                              <span className="text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(person.collection)}
                              </span>
                              <span className="text-xs text-gray-400 ml-1">({collectionRate}%)</span>
                            </div>
                          </td>
                          <td className="text-center px-6 py-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <div className="w-12 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full ${
                                    person.visitRate >= 90 ? 'bg-green-500' : person.visitRate >= 80 ? 'bg-amber-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${person.visitRate}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                                {person.visitRate}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Collection Aging */}
        <Card padding="lg">
          <CardHeader title="Collection Aging" subtitle="Outstanding receivables by age" />
          <CardContent className="mt-4">
            {/* Stacked bar */}
            <div className="flex rounded-full h-4 overflow-hidden mb-5">
              {collectionAging.map((item) => (
                <div
                  key={item.bucket}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.bucket}: ${formatCurrency(item.amount)}`}
                />
              ))}
            </div>

            <div className="space-y-4">
              {collectionAging.map((item) => (
                <div key={item.bucket}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.bucket}</span>
                    </div>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                    <div
                      className={`${item.color} h-1.5 rounded-full transition-all`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-5 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Outstanding</span>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(collectionAging.reduce((s, c) => s + c.amount, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
