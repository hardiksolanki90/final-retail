import {
  MapPin,
  ClipboardCheck,
  LayoutGrid,
  Megaphone,
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const dailyVisits = [
  { day: 'Mon', completed: 28, planned: 32 },
  { day: 'Tue', completed: 30, planned: 30 },
  { day: 'Wed', completed: 25, planned: 34 },
  { day: 'Thu', completed: 32, planned: 35 },
  { day: 'Fri', completed: 22, planned: 28 },
  { day: 'Sat', completed: 18, planned: 20 },
  { day: 'Sun', completed: 5, planned: 8 },
];

const planogramCompliance = [
  { category: 'Beverages', compliance: 94, stores: 186 },
  { category: 'Snacks', compliance: 88, stores: 172 },
  { category: 'Dairy', compliance: 82, stores: 164 },
  { category: 'Personal Care', compliance: 79, stores: 158 },
  { category: 'Cleaning', compliance: 75, stores: 148 },
  { category: 'Confectionery', compliance: 72, stores: 142 },
  { category: 'Frozen Foods', compliance: 68, stores: 136 },
];

const shareOfShelf = [
  { brand: 'Our Brand', percentage: 34.2, change: 2.1, color: 'bg-primary-500' },
  { brand: 'Competitor A', percentage: 26.8, change: -1.4, color: 'bg-red-500' },
  { brand: 'Competitor B', percentage: 18.5, change: 0.8, color: 'bg-amber-500' },
  { brand: 'Competitor C', percentage: 12.3, change: -0.6, color: 'bg-purple-500' },
  { brand: 'Others', percentage: 8.2, change: -0.9, color: 'bg-gray-400' },
];

const campaigns = [
  { name: 'Summer Refresh Promo', type: 'Display', stores: 245, compliance: 89, status: 'Active', startDate: 'Jan 15', endDate: 'Mar 15' },
  { name: 'Buy 2 Get 1 Free', type: 'Promotion', stores: 180, compliance: 76, status: 'Active', startDate: 'Feb 01', endDate: 'Feb 28' },
  { name: 'New Product Launch', type: 'Launch', stores: 320, compliance: 92, status: 'Active', startDate: 'Jan 20', endDate: 'Apr 30' },
  { name: 'End Cap Display', type: 'Display', stores: 156, compliance: 65, status: 'Review', startDate: 'Feb 10', endDate: 'Mar 10' },
  { name: 'Loyalty Points Double', type: 'Promotion', stores: 420, compliance: 81, status: 'Active', startDate: 'Jan 01', endDate: 'Mar 31' },
];

const merchandiserPerformance = [
  { name: 'Ahmed Al-Hassan', route: 'Route-N1', visits: 28, planned: 30, compliance: 96, issues: 1 },
  { name: 'Mohammed Reza', route: 'Route-N2', visits: 25, planned: 28, compliance: 92, issues: 2 },
  { name: 'Khalid Omar', route: 'Route-S1', visits: 30, planned: 30, compliance: 88, issues: 3 },
  { name: 'Yusuf Ibrahim', route: 'Route-E1', visits: 22, planned: 26, compliance: 85, issues: 2 },
  { name: 'Tariq Saeed', route: 'Route-W1', visits: 18, planned: 24, compliance: 78, issues: 5 },
  { name: 'Faisal Noor', route: 'Route-C1', visits: 26, planned: 28, compliance: 91, issues: 1 },
];

const competitorActivity = [
  { competitor: 'Competitor A', activity: 'New shelf display at Al Madina outlets', region: 'North', date: '2 hours ago', impact: 'High' },
  { competitor: 'Competitor B', activity: 'Price reduction on cooking oil range', region: 'South', date: '5 hours ago', impact: 'Medium' },
  { competitor: 'Competitor C', activity: 'BOGO promotion on snacks category', region: 'East', date: '1 day ago', impact: 'High' },
  { competitor: 'Competitor A', activity: 'New product launch - flavored water', region: 'Metro', date: '1 day ago', impact: 'Low' },
  { competitor: 'Competitor B', activity: 'Increased facings in dairy section', region: 'West', date: '2 days ago', impact: 'Medium' },
];

const maxPlanned = Math.max(...dailyVisits.map((d) => d.planned));

function getComplianceColor(value: number): string {
  if (value >= 90) return 'bg-green-500';
  if (value >= 75) return 'bg-amber-500';
  return 'bg-red-500';
}

function getComplianceTextColor(value: number): string {
  if (value >= 90) return 'text-green-600';
  if (value >= 75) return 'text-amber-600';
  return 'text-red-600';
}

function getImpactVariant(impact: string): 'danger' | 'warning' | 'default' {
  if (impact === 'High') return 'danger';
  if (impact === 'Medium') return 'warning';
  return 'default';
}

export function MerchandisingDashboard() {
  const totalCompleted = dailyVisits.reduce((sum, d) => sum + d.completed, 0);
  const totalPlanned = dailyVisits.reduce((sum, d) => sum + d.planned, 0);

  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Store Visits (This Week)"
          value={`${totalCompleted}/${totalPlanned}`}
          icon={<MapPin className="w-6 h-6" />}
          trend={{ value: 5.4, isPositive: true }}
        />
        <StatCard
          title="Planogram Compliance"
          value="87.3%"
          icon={<ClipboardCheck className="w-6 h-6" />}
          trend={{ value: 3.2, isPositive: true }}
        />
        <StatCard
          title="Share of Shelf"
          value="34.2%"
          icon={<LayoutGrid className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: true }}
        />
        <StatCard
          title="Active Campaigns"
          value="12"
          icon={<Megaphone className="w-6 h-6" />}
          trend={{ value: 4, isPositive: true }}
        />
      </div>

      {/* Visit Completion + Planogram Compliance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Visit Completion */}
        <Card padding="lg">
          <CardHeader
            title="Daily Visit Completion"
            subtitle="This week's store visits"
            action={
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-green-500" />
                  Completed
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-gray-300 dark:bg-gray-600" />
                  Planned
                </span>
              </div>
            }
          />
          <CardContent className="mt-6">
            <div className="flex items-end gap-3 h-44">
              {dailyVisits.map((item) => (
                <div key={item.day} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-36">
                    <div
                      className="flex-1 bg-green-500 rounded-t-sm transition-all hover:bg-green-600"
                      style={{ height: `${(item.completed / maxPlanned) * 100}%` }}
                      title={`Completed: ${item.completed}`}
                    />
                    <div
                      className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-sm"
                      style={{ height: `${(item.planned / maxPlanned) * 100}%` }}
                      title={`Planned: ${item.planned}`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Planogram Compliance by Category */}
        <Card padding="lg">
          <CardHeader title="Planogram Compliance" subtitle="Compliance by product category" />
          <CardContent className="mt-4 space-y-3">
            {planogramCompliance.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.category}</span>
                  <span className={`text-sm font-semibold ${getComplianceTextColor(item.compliance)}`}>
                    {item.compliance}%
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className={`${getComplianceColor(item.compliance)} h-2 rounded-full transition-all`}
                    style={{ width: `${item.compliance}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Share of Shelf + Campaigns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Share of Shelf */}
        <Card padding="lg">
          <CardHeader title="Share of Shelf" subtitle="Brand visibility breakdown" />
          <CardContent className="mt-4">
            {/* Stacked bar */}
            <div className="flex rounded-full h-5 overflow-hidden mb-5">
              {shareOfShelf.map((item) => (
                <div
                  key={item.brand}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.brand}: ${item.percentage}%`}
                />
              ))}
            </div>
            <div className="space-y-3">
              {shareOfShelf.map((item) => (
                <div key={item.brand} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.brand}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {item.percentage}%
                    </span>
                    <span
                      className={`text-xs ${item.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {item.change >= 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Campaign Performance */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-6 pb-0">
            <CardHeader title="Campaign Performance" subtitle="Active merchandising campaigns" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Campaign</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Type</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Stores</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Compliance</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {campaigns.map((campaign) => (
                    <tr
                      key={campaign.name}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{campaign.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {campaign.startDate} - {campaign.endDate}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <Badge variant="primary" size="sm">{campaign.type}</Badge>
                      </td>
                      <td className="text-right px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {campaign.stores}
                      </td>
                      <td className="text-right px-6 py-3">
                        <span className={`text-sm font-semibold ${getComplianceTextColor(campaign.compliance)}`}>
                          {campaign.compliance}%
                        </span>
                      </td>
                      <td className="text-center px-6 py-3">
                        <Badge
                          variant={campaign.status === 'Active' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {campaign.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Merchandiser Performance + Competitor Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Merchandiser Performance */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-6 pb-0">
            <CardHeader title="Merchandiser Performance" subtitle="Field team activity this week" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Merchandiser</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Route</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Visits</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Compliance</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {merchandiserPerformance.map((person) => (
                    <tr
                      key={person.name}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                              {person.name.split(' ').map((n) => n[0]).join('')}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{person.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{person.route}</td>
                      <td className="text-center px-6 py-3">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {person.visits}/{person.planned}
                        </span>
                      </td>
                      <td className="text-center px-6 py-3">
                        <span className={`text-sm font-semibold ${getComplianceTextColor(person.compliance)}`}>
                          {person.compliance}%
                        </span>
                      </td>
                      <td className="text-center px-6 py-3">
                        {person.issues > 3 ? (
                          <Badge variant="danger" size="sm">{person.issues}</Badge>
                        ) : person.issues > 0 ? (
                          <Badge variant="warning" size="sm">{person.issues}</Badge>
                        ) : (
                          <Badge variant="success" size="sm">0</Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Competitor Activity */}
        <Card padding="lg">
          <CardHeader title="Competitor Activity" subtitle="Recent intelligence" />
          <CardContent className="mt-4 space-y-4">
            {competitorActivity.map((item, index) => (
              <div
                key={index}
                className="pb-4 border-b border-gray-100 dark:border-gray-800/50 last:border-0 last:pb-0"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {item.competitor}
                  </span>
                  <Badge variant={getImpactVariant(item.impact)} size="sm">
                    {item.impact}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{item.activity}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-xs text-gray-500">{item.region}</span>
                  <span className="text-xs text-gray-400">|</span>
                  <span className="text-xs text-gray-500">{item.date}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
