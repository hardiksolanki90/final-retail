import {
  MapPin,
  Store,
  CalendarDays,
  Repeat,
  Target,
  Clock,
} from 'lucide-react';

import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

/* -------------------------
   MOCK DATA
-------------------------- */

const kpis = [
  {
    title: 'Outlet Coverage %',
    value: '72.4%',
    description: 'Visited outlets vs total outlets',
    icon: <MapPin className="w-6 h-6" />,
    trend: { value: 4.2, isPositive: true },
  },
  {
    title: 'Active Outlets',
    value: '1,248',
    description: 'Outlets with at least one order',
    icon: <Store className="w-6 h-6" />,
    trend: { value: 2.1, isPositive: true },
  },
  {
    title: 'Visits Per Day',
    value: '28.6',
    description: 'Avg visits per rep per day',
    icon: <CalendarDays className="w-6 h-6" />,
    trend: { value: 1.4, isPositive: true },
  },
  {
    title: 'Visit Frequency',
    value: '3.2x',
    description: 'Avg visits per outlet',
    icon: <Repeat className="w-6 h-6" />,
    trend: { value: 0.6, isPositive: true },
  },
  {
    title: 'Strike Rate',
    value: '64%',
    description: 'Orders vs total visits',
    icon: <Target className="w-6 h-6" />,
    trend: { value: 3.8, isPositive: true },
  },
  {
    title: 'Time Spent',
    value: '18 min',
    description: 'Avg time per visit',
    icon: <Clock className="w-6 h-6" />,
    trend: { value: 1.2, isPositive: false },
  },
];

const merchandiserTable = [
  {
    name: 'Ahmed Khan',
    totalOutlets: 180,
    visitedOutlets: 142,
    visits: 386,
    orders: 248,
    strikeRate: 64,
    avgTime: '17 min',
  },
  {
    name: 'Ravi Patel',
    totalOutlets: 165,
    visitedOutlets: 128,
    visits: 342,
    orders: 198,
    strikeRate: 58,
    avgTime: '19 min',
  },
  {
    name: 'Mohammed Ali',
    totalOutlets: 210,
    visitedOutlets: 176,
    visits: 428,
    orders: 296,
    strikeRate: 69,
    avgTime: '16 min',
  },
];

/* -------------------------
   COMPONENT
-------------------------- */

export function PreSaleReachCoverageDashboard() {
  return (
    <div className="space-y-6">

      {/* ================= FILTER BAR ================= */}
      <Card padding="lg">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div>
            <label className="text-xs text-gray-500">From Date</label>
            <input type="date" className="w-full input" />
          </div>
          <div>
            <label className="text-xs text-gray-500">To Date</label>
            <input type="date" className="w-full input" />
          </div>
          <div>
            <label className="text-xs text-gray-500">Territory</label>
            <select className="w-full input">
              <option>All Territories</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500">Merchandiser</label>
            <select className="w-full input">
              <option>All Merchandisers</option>
            </select>
          </div>
          <button className="btn-primary w-full">Apply</button>
        </div>
      </Card>

      {/* ================= KPI GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpis.map((kpi) => (
          <StatCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            icon={kpi.icon}
            description={kpi.description}
            trend={kpi.trend}
          />
        ))}
      </div>

      {/* ================= ANALYTICS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card padding="lg">
          <CardHeader
            title="Outlet Coverage Trend"
            subtitle="Coverage percentage over time"
          />
          <CardContent className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Line / Area Chart Placeholder
          </CardContent>
        </Card>

        <Card padding="lg">
          <CardHeader
            title="Visits vs Strike Rate"
            subtitle="Visits compared with order conversion"
          />
          <CardContent className="h-64 flex items-center justify-center text-gray-400 text-sm">
            Bar + Line Combo Chart Placeholder
          </CardContent>
        </Card>
      </div>

      {/* ================= DETAIL TABLE ================= */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <CardHeader
            title="Merchandiser Performance"
            subtitle="Coverage and visit effectiveness"
          />
        </div>

        <CardContent className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="th">Merchandiser</th>
                  <th className="th text-center">Total Outlets</th>
                  <th className="th text-center">Visited</th>
                  <th className="th text-center">Coverage %</th>
                  <th className="th text-center">Visits</th>
                  <th className="th text-center">Orders</th>
                  <th className="th text-center">Strike Rate</th>
                  <th className="th text-center">Avg Time</th>
                </tr>
              </thead>
              <tbody>
                {merchandiserTable.map((row) => {
                  const coverage = Math.round(
                    (row.visitedOutlets / row.totalOutlets) * 100
                  );

                  return (
                    <tr key={row.name} className="tr">
                      <td className="td font-medium">{row.name}</td>
                      <td className="td text-center">{row.totalOutlets}</td>
                      <td className="td text-center">{row.visitedOutlets}</td>
                      <td className="td text-center">
                        <Badge
                          variant={coverage >= 70 ? 'success' : 'warning'}
                          size="sm"
                        >
                          {coverage}%
                        </Badge>
                      </td>
                      <td className="td text-center">{row.visits}</td>
                      <td className="td text-center">{row.orders}</td>
                      <td className="td text-center">
                        <span
                          className={`font-medium ${
                            row.strikeRate >= 60
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}
                        >
                          {row.strikeRate}%
                        </span>
                      </td>
                      <td className="td text-center">{row.avgTime}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
