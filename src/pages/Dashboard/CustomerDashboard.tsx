import {
  Users,
  UserPlus,
  Percent,
  Banknote,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const customerByChannel = [
  { channel: 'Supermarket', count: 482, revenue: 1240000, percentage: 34 },
  { channel: 'Grocery', count: 624, revenue: 860000, percentage: 24 },
  { channel: 'Convenience', count: 312, revenue: 520000, percentage: 14 },
  { channel: 'Wholesale', count: 186, revenue: 480000, percentage: 13 },
  { channel: 'Hypermarket', count: 98, revenue: 340000, percentage: 10 },
  { channel: 'Others', count: 154, revenue: 180000, percentage: 5 },
];

const weeklyOrders = [
  { week: 'W1', orders: 412, value: 124600 },
  { week: 'W2', orders: 386, value: 118200 },
  { week: 'W3', orders: 458, value: 142800 },
  { week: 'W4', orders: 392, value: 128400 },
  { week: 'W5', orders: 476, value: 156200 },
  { week: 'W6', orders: 445, value: 138600 },
  { week: 'W7', orders: 502, value: 168400 },
  { week: 'W8', orders: 468, value: 152800 },
];

const collectionStatus = [
  { status: 'Collected', amount: 1840000, percentage: 62, color: 'bg-green-500' },
  { status: 'Pending', amount: 680000, percentage: 23, color: 'bg-amber-500' },
  { status: 'Overdue', amount: 320000, percentage: 11, color: 'bg-red-500' },
  { status: 'PDC', amount: 120000, percentage: 4, color: 'bg-blue-500' },
];

const creditUtilization = [
  { customer: 'Al Madina Supermarket', code: 'CUST-001', creditLimit: 50000, used: 42500, outstanding: 18200, daysOverdue: 0 },
  { customer: 'City Fresh Mart', code: 'CUST-015', creditLimit: 35000, used: 33250, outstanding: 12400, daysOverdue: 5 },
  { customer: 'Royal Grocery Chain', code: 'CUST-023', creditLimit: 40000, used: 38000, outstanding: 22800, daysOverdue: 12 },
  { customer: 'Green Valley Store', code: 'CUST-008', creditLimit: 25000, used: 22500, outstanding: 8600, daysOverdue: 0 },
  { customer: 'Quick Stop Express', code: 'CUST-042', creditLimit: 20000, used: 19400, outstanding: 14200, daysOverdue: 28 },
  { customer: 'Sunrise Grocery', code: 'CUST-031', creditLimit: 30000, used: 12000, outstanding: 4800, daysOverdue: 0 },
  { customer: 'Metro Mart Plus', code: 'CUST-055', creditLimit: 45000, used: 41850, outstanding: 28400, daysOverdue: 15 },
];

const topRoutes = [
  { route: 'Route-N1', salesman: 'Ahmed Al-Hassan', customers: 48, orders: 186, revenue: 342000, growth: 14.2 },
  { route: 'Route-S1', salesman: 'Khalid Omar', customers: 42, orders: 164, revenue: 298000, growth: 8.6 },
  { route: 'Route-N2', salesman: 'Mohammed Reza', customers: 38, orders: 152, revenue: 264000, growth: -2.4 },
  { route: 'Route-E1', salesman: 'Yusuf Ibrahim', customers: 35, orders: 138, revenue: 228000, growth: 11.8 },
  { route: 'Route-W1', salesman: 'Tariq Saeed', customers: 32, orders: 124, revenue: 196000, growth: 5.2 },
  { route: 'Route-C1', salesman: 'Faisal Noor', customers: 28, orders: 108, revenue: 168000, growth: -4.6 },
];

const recentActivity = [
  { customer: 'Al Madina Supermarket', action: 'New order placed', value: '$2,480', time: '15 min ago', type: 'order' },
  { customer: 'City Fresh Mart', action: 'Payment received', value: '$5,200', time: '42 min ago', type: 'payment' },
  { customer: 'Green Valley Store', action: 'New customer registered', value: null, time: '1 hour ago', type: 'registration' },
  { customer: 'Royal Grocery Chain', action: 'Credit limit exceeded', value: '$38,000', time: '2 hours ago', type: 'alert' },
  { customer: 'Quick Stop Express', action: 'Order delivered', value: '$1,840', time: '3 hours ago', type: 'delivery' },
  { customer: 'Sunrise Grocery', action: 'Return requested', value: '$420', time: '4 hours ago', type: 'return' },
  { customer: 'Metro Mart Plus', action: 'Payment overdue notice', value: '$28,400', time: '5 hours ago', type: 'alert' },
];

const maxWeeklyOrders = Math.max(...weeklyOrders.map((w) => w.orders));
const maxChannelPercentage = Math.max(...customerByChannel.map((c) => c.percentage));

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getActivityBadgeVariant(type: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    order: 'primary',
    payment: 'success',
    registration: 'info',
    alert: 'danger',
    delivery: 'success',
    return: 'warning',
  };
  return map[type] || 'primary';
}

function getActivityLabel(type: string): string {
  const map: Record<string, string> = {
    order: 'Order',
    payment: 'Payment',
    registration: 'New',
    alert: 'Alert',
    delivery: 'Delivery',
    return: 'Return',
  };
  return map[type] || type;
}

export function CustomerDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value="1,856"
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="New Customers (Month)"
          value="124"
          icon={<UserPlus className="w-6 h-6" />}
          trend={{ value: 22.5, isPositive: true }}
        />
        <StatCard
          title="Order Conversion Rate"
          value="68.4%"
          icon={<Percent className="w-6 h-6" />}
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Outstanding Collection"
          value="$1.12M"
          icon={<Banknote className="w-6 h-6" />}
          trend={{ value: 8.6, isPositive: false }}
        />
      </div>

      {/* Customer by Channel + Weekly Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer by Channel */}
        <Card padding="lg">
          <CardHeader title="Customers by Channel" subtitle="Distribution across trade channels" />
          <CardContent className="mt-4 space-y-3">
            {customerByChannel.map((item) => (
              <div key={item.channel}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.channel}</span>
                    <span className="text-xs text-gray-400">({item.count})</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${(item.percentage / maxChannelPercentage) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Weekly Order Trends */}
        <Card padding="lg">
          <CardHeader
            title="Weekly Order Trends"
            subtitle="Order count over last 8 weeks"
            action={
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total: {weeklyOrders.reduce((s, w) => s + w.orders, 0).toLocaleString()} orders
              </span>
            }
          />
          <CardContent className="mt-6">
            <div className="flex items-end gap-2 h-44">
              {weeklyOrders.map((item) => (
                <div key={item.week} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] font-medium text-gray-900 dark:text-white">
                    {item.orders}
                  </span>
                  <div className="w-full flex items-end h-32">
                    <div
                      className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                      style={{ height: `${(item.orders / maxWeeklyOrders) * 100}%` }}
                      title={`${item.week}: ${item.orders} orders (${formatCurrency(item.value)})`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.week}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Collection Status + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Collection Status */}
        <Card padding="lg">
          <CardHeader title="Collection Status" subtitle="Payment breakdown this month" />
          <CardContent className="mt-4">
            {/* Stacked bar */}
            <div className="flex rounded-full h-4 overflow-hidden mb-4">
              {collectionStatus.map((item) => (
                <div
                  key={item.status}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.status}: ${formatCurrency(item.amount)}`}
                />
              ))}
            </div>
            <div className="space-y-3">
              {collectionStatus.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                    <span className="text-xs text-gray-500 w-8 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-sm font-bold text-gray-900 dark:text-white">
                  {formatCurrency(collectionStatus.reduce((s, c) => s + c.amount, 0))}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Customer Activity */}
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader title="Recent Activity" subtitle="Latest customer interactions" />
          <CardContent className="mt-4 space-y-3">
            {recentActivity.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-gray-800/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={getActivityBadgeVariant(item.type)} size="sm">
                    {getActivityLabel(item.type)}
                  </Badge>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.customer}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.action}</p>
                  </div>
                </div>
                <div className="text-right">
                  {item.value && (
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Credit Utilization */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <CardHeader
            title="Credit Utilization"
            subtitle="Customer credit limit usage and outstanding"
            action={
              <Badge variant="danger" size="sm">
                {creditUtilization.filter((c) => c.daysOverdue > 0).length} Overdue
              </Badge>
            }
          />
        </div>
        <CardContent className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Customer</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Credit Limit</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Utilization</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Outstanding</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Overdue</th>
                </tr>
              </thead>
              <tbody>
                {creditUtilization.map((item) => {
                  const utilPercent = Math.round((item.used / item.creditLimit) * 100);
                  return (
                    <tr
                      key={item.code}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.customer}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.code}</p>
                        </div>
                      </td>
                      <td className="text-right px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {formatCurrency(item.creditLimit)}
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                utilPercent >= 90 ? 'bg-red-500' : utilPercent >= 75 ? 'bg-amber-500' : 'bg-green-500'
                              }`}
                              style={{ width: `${utilPercent}%` }}
                            />
                          </div>
                          <span className={`text-xs font-medium ${
                            utilPercent >= 90 ? 'text-red-600' : utilPercent >= 75 ? 'text-amber-600' : 'text-green-600'
                          }`}>
                            {utilPercent}%
                          </span>
                        </div>
                      </td>
                      <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(item.outstanding)}
                      </td>
                      <td className="text-center px-6 py-3">
                        {item.daysOverdue > 0 ? (
                          <Badge variant={item.daysOverdue >= 15 ? 'danger' : 'warning'} size="sm">
                            {item.daysOverdue} days
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">Current</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Top Routes */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <CardHeader title="Top Performing Routes" subtitle="Route-level sales performance this month" />
        </div>
        <CardContent className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Route</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Salesman</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Customers</th>
                  <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Orders</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Revenue</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Growth</th>
                </tr>
              </thead>
              <tbody>
                {topRoutes.map((item) => (
                  <tr
                    key={item.route}
                    className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {item.route}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                          <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400">
                            {item.salesman.split(' ').map((n) => n[0]).join('')}
                          </span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.salesman}</span>
                      </div>
                    </td>
                    <td className="text-center px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.customers}
                    </td>
                    <td className="text-center px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {item.orders}
                    </td>
                    <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(item.revenue)}
                    </td>
                    <td className="text-right px-6 py-3">
                      <span
                        className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                          item.growth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {item.growth >= 0 ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                        {Math.abs(item.growth)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
