import {
  DollarSign,
  ShoppingCart,
  Users,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';

const monthlyRevenue = [
  { month: 'Jan', value: 186000, target: 200000 },
  { month: 'Feb', value: 205000, target: 200000 },
  { month: 'Mar', value: 237000, target: 220000 },
  { month: 'Apr', value: 198000, target: 220000 },
  { month: 'May', value: 264000, target: 240000 },
  { month: 'Jun', value: 241000, target: 240000 },
  { month: 'Jul', value: 228000, target: 250000 },
  { month: 'Aug', value: 275000, target: 250000 },
  { month: 'Sep', value: 259000, target: 260000 },
  { month: 'Oct', value: 312000, target: 270000 },
  { month: 'Nov', value: 298000, target: 280000 },
  { month: 'Dec', value: 342000, target: 300000 },
];

const salesByRegion = [
  { region: 'North', revenue: 842000, percentage: 28 },
  { region: 'South', revenue: 724000, percentage: 24 },
  { region: 'East', revenue: 596000, percentage: 20 },
  { region: 'West', revenue: 478000, percentage: 16 },
  { region: 'Central', revenue: 245000, percentage: 8 },
  { region: 'Metro', revenue: 160000, percentage: 4 },
];

const orderStatusData = [
  { status: 'Delivered', count: 5842, percentage: 66.8, color: 'bg-green-500' },
  { status: 'Processing', count: 1264, percentage: 14.5, color: 'bg-blue-500' },
  { status: 'Confirmed', count: 876, percentage: 10.0, color: 'bg-amber-500' },
  { status: 'Pending', count: 512, percentage: 5.9, color: 'bg-orange-500' },
  { status: 'Cancelled', count: 248, percentage: 2.8, color: 'bg-red-500' },
];

const topProducts = [
  { name: 'Premium Wheat Flour 50kg', sku: 'SKU-001', revenue: 184200, units: 3684, growth: 12.4 },
  { name: 'Sunflower Oil 5L', sku: 'SKU-023', revenue: 156800, units: 7840, growth: 8.7 },
  { name: 'Basmati Rice 25kg', sku: 'SKU-045', revenue: 142500, units: 2850, growth: -3.2 },
  { name: 'Sugar Refined 50kg', sku: 'SKU-012', revenue: 128400, units: 2568, growth: 15.1 },
  { name: 'Cooking Salt 25kg', sku: 'SKU-067', revenue: 98600, units: 4930, growth: 5.8 },
  { name: 'Milk Powder 1kg', sku: 'SKU-089', revenue: 87200, units: 8720, growth: -1.4 },
  { name: 'Tea Leaves 500g', sku: 'SKU-034', revenue: 76400, units: 15280, growth: 22.3 },
  { name: 'Instant Noodles Pack', sku: 'SKU-056', revenue: 68900, units: 34450, growth: 18.6 },
];

const topCustomers = [
  { name: 'Al Madina Supermarket', code: 'CUST-001', orders: 342, revenue: 245800, lastOrder: '2 hours ago' },
  { name: 'City Fresh Mart', code: 'CUST-015', orders: 287, revenue: 198400, lastOrder: '5 hours ago' },
  { name: 'Royal Grocery Chain', code: 'CUST-023', orders: 256, revenue: 176200, lastOrder: '1 day ago' },
  { name: 'Green Valley Store', code: 'CUST-008', orders: 198, revenue: 142800, lastOrder: '3 hours ago' },
  { name: 'Quick Stop Express', code: 'CUST-042', orders: 176, revenue: 124600, lastOrder: '6 hours ago' },
];

const maxRevenue = Math.max(...monthlyRevenue.map((m) => Math.max(m.value, m.target)));

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

export function SalesDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value="$2.45M"
          icon={<DollarSign className="w-6 h-6" />}
          trend={{ value: 18.2, isPositive: true }}
        />
        <StatCard
          title="Total Orders"
          value="8,742"
          icon={<ShoppingCart className="w-6 h-6" />}
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Active Customers"
          value="1,856"
          icon={<Users className="w-6 h-6" />}
          trend={{ value: 8.3, isPositive: true }}
        />
        <StatCard
          title="Avg Order Value"
          value="$274.50"
          icon={<BarChart3 className="w-6 h-6" />}
          trend={{ value: 2.1, isPositive: false }}
        />
      </div>

      {/* Revenue Trend + Sales by Region */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Bar Chart */}
        <Card padding="lg" className="lg:col-span-2">
          <CardHeader
            title="Revenue Trend"
            subtitle="Monthly revenue vs target"
            action={
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-primary-500" />
                  Revenue
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
              {monthlyRevenue.map((item) => (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex items-end gap-0.5 h-44">
                    <div
                      className="flex-1 bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                      style={{ height: `${(item.value / maxRevenue) * 100}%` }}
                      title={`Revenue: ${formatCurrency(item.value)}`}
                    />
                    <div
                      className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-sm"
                      style={{ height: `${(item.target / maxRevenue) * 100}%` }}
                      title={`Target: ${formatCurrency(item.target)}`}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{item.month}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Sales by Region */}
        <Card padding="lg">
          <CardHeader title="Sales by Region" subtitle="Revenue distribution" />
          <CardContent className="mt-4 space-y-3">
            {salesByRegion.map((item) => (
              <div key={item.region}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{item.region}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatCurrency(item.revenue)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-primary-500 h-2 rounded-full transition-all"
                    style={{ width: `${item.percentage * (100 / 28)}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Order Status + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Status Distribution */}
        <Card padding="lg">
          <CardHeader title="Order Status" subtitle="Current order breakdown" />
          <CardContent className="mt-4">
            {/* Stacked bar */}
            <div className="flex rounded-full h-4 overflow-hidden mb-4">
              {orderStatusData.map((item) => (
                <div
                  key={item.status}
                  className={`${item.color} transition-all`}
                  style={{ width: `${item.percentage}%` }}
                  title={`${item.status}: ${item.count}`}
                />
              ))}
            </div>
            <div className="space-y-2.5">
              {orderStatusData.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.status}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      {item.count.toLocaleString()}
                    </span>
                    <span className="text-xs text-gray-500 w-10 text-right">{item.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-6 pb-0">
            <CardHeader title="Top Products" subtitle="By revenue this month" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      Product
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      Revenue
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      Units
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      Growth
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {topProducts.map((product) => (
                    <tr
                      key={product.sku}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{product.sku}</p>
                        </div>
                      </td>
                      <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(product.revenue)}
                      </td>
                      <td className="text-right px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {product.units.toLocaleString()}
                      </td>
                      <td className="text-right px-6 py-3">
                        <span
                          className={`inline-flex items-center gap-0.5 text-sm font-medium ${
                            product.growth >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {product.growth >= 0 ? (
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          ) : (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          )}
                          {Math.abs(product.growth)}%
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

      {/* Top Customers */}
      <Card padding="none">
        <div className="p-6 pb-0">
          <CardHeader title="Top Customers" subtitle="Highest revenue contributors this month" />
        </div>
        <CardContent className="mt-4">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    Customer
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    Orders
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    Revenue
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    Revenue Share
                  </th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                    Last Order
                  </th>
                </tr>
              </thead>
              <tbody>
                {topCustomers.map((customer, index) => (
                  <tr
                    key={customer.code}
                    className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                  >
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-sm font-bold text-primary-600 dark:text-primary-400">
                          {index + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {customer.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{customer.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {customer.orders}
                    </td>
                    <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      {formatCurrency(customer.revenue)}
                    </td>
                    <td className="text-right px-6 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-1.5">
                          <div
                            className="bg-primary-500 h-1.5 rounded-full"
                            style={{ width: `${(customer.revenue / 245800) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-500 w-8 text-right">
                          {((customer.revenue / 2450000) * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                      {customer.lastOrder}
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
