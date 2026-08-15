import {
  Package,
  Warehouse,
  AlertTriangle,
  Truck,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardHeader, CardContent, StatCard } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';

const stockByCategory = [
  { category: 'Beverages', value: 2450000, units: 48200, percentage: 30 },
  { category: 'Snacks', value: 1820000, units: 36400, percentage: 22 },
  { category: 'Dairy', value: 1340000, units: 26800, percentage: 16 },
  { category: 'Personal Care', value: 980000, units: 19600, percentage: 12 },
  { category: 'Cleaning', value: 740000, units: 14800, percentage: 9 },
  { category: 'Frozen Foods', value: 520000, units: 10400, percentage: 6 },
  { category: 'Others', value: 350000, units: 7000, percentage: 5 },
];

const lowStockItems = [
  { name: 'Sunflower Oil 5L', sku: 'SKU-023', current: 45, minimum: 200, warehouse: 'Main WH', severity: 'Critical' },
  { name: 'Basmati Rice 25kg', sku: 'SKU-045', current: 82, minimum: 300, warehouse: 'Main WH', severity: 'Critical' },
  { name: 'Milk Powder 1kg', sku: 'SKU-089', current: 156, minimum: 400, warehouse: 'North WH', severity: 'Warning' },
  { name: 'Tea Leaves 500g', sku: 'SKU-034', current: 98, minimum: 250, warehouse: 'South WH', severity: 'Critical' },
  { name: 'Sugar Refined 50kg', sku: 'SKU-012', current: 220, minimum: 350, warehouse: 'Main WH', severity: 'Warning' },
  { name: 'Instant Noodles Pack', sku: 'SKU-056', current: 340, minimum: 500, warehouse: 'East WH', severity: 'Warning' },
  { name: 'Cooking Salt 25kg', sku: 'SKU-067', current: 48, minimum: 150, warehouse: 'Central WH', severity: 'Critical' },
  { name: 'Tomato Paste 400g', sku: 'SKU-101', current: 180, minimum: 300, warehouse: 'Main WH', severity: 'Warning' },
];

const warehouseUtilization = [
  { name: 'Main Warehouse', capacity: 50000, used: 42500, inbound: 1200, outbound: 1800 },
  { name: 'North Warehouse', capacity: 30000, used: 21600, inbound: 800, outbound: 950 },
  { name: 'South Warehouse', capacity: 25000, used: 22750, inbound: 650, outbound: 720 },
  { name: 'East Warehouse', capacity: 20000, used: 13000, inbound: 400, outbound: 580 },
  { name: 'Central Warehouse', capacity: 15000, used: 12750, inbound: 300, outbound: 450 },
];

const deliveryPerformance = [
  { route: 'Route-N1', totalDeliveries: 48, onTime: 45, delayed: 2, failed: 1, onTimePercent: 93.8 },
  { route: 'Route-N2', totalDeliveries: 42, onTime: 40, delayed: 1, failed: 1, onTimePercent: 95.2 },
  { route: 'Route-S1', totalDeliveries: 38, onTime: 34, delayed: 3, failed: 1, onTimePercent: 89.5 },
  { route: 'Route-E1', totalDeliveries: 35, onTime: 33, delayed: 2, failed: 0, onTimePercent: 94.3 },
  { route: 'Route-W1', totalDeliveries: 30, onTime: 25, delayed: 4, failed: 1, onTimePercent: 83.3 },
  { route: 'Route-C1', totalDeliveries: 28, onTime: 27, delayed: 1, failed: 0, onTimePercent: 96.4 },
];

const truckUtilization = [
  { truck: 'TRK-001', driver: 'Ali Hassan', capacity: '8 Ton', utilization: 92, trips: 6, status: 'In Transit' },
  { truck: 'TRK-002', driver: 'Omar Said', capacity: '5 Ton', utilization: 87, trips: 8, status: 'Loading' },
  { truck: 'TRK-003', driver: 'Yusuf Ali', capacity: '8 Ton', utilization: 78, trips: 5, status: 'In Transit' },
  { truck: 'TRK-004', driver: 'Rashid Khan', capacity: '3 Ton', utilization: 95, trips: 10, status: 'Delivered' },
  { truck: 'TRK-005', driver: 'Salim Noor', capacity: '5 Ton', utilization: 64, trips: 4, status: 'Maintenance' },
  { truck: 'TRK-006', driver: 'Hamza Reza', capacity: '8 Ton', utilization: 88, trips: 6, status: 'In Transit' },
];

const recentGrn = [
  { grnNo: 'GRN-2024-1842', supplier: 'Al Marai Industries', items: 24, value: 48500, date: '2 hours ago', status: 'Verified' },
  { grnNo: 'GRN-2024-1841', supplier: 'Gulf Food Supplies', items: 18, value: 32200, date: '5 hours ago', status: 'Verified' },
  { grnNo: 'GRN-2024-1840', supplier: 'National Flour Mills', items: 8, value: 68400, date: '8 hours ago', status: 'Pending' },
  { grnNo: 'GRN-2024-1839', supplier: 'Fresh Dairy Co.', items: 32, value: 24800, date: '1 day ago', status: 'Verified' },
  { grnNo: 'GRN-2024-1838', supplier: 'Eastern Spice Trading', items: 15, value: 18600, date: '1 day ago', status: 'Discrepancy' },
];

const maxStockPercentage = Math.max(...stockByCategory.map((s) => s.percentage));

function formatCurrency(value: number): string {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getUtilizationColor(value: number): string {
  if (value >= 90) return 'bg-red-500';
  if (value >= 75) return 'bg-amber-500';
  return 'bg-green-500';
}

function getUtilizationTextColor(value: number): string {
  if (value >= 90) return 'text-red-600';
  if (value >= 75) return 'text-amber-600';
  return 'text-green-600';
}

function getTruckStatusVariant(status: string): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const map: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    'In Transit': 'primary',
    'Loading': 'info',
    'Delivered': 'success',
    'Maintenance': 'danger',
  };
  return map[status] || 'default' as 'primary';
}

export function LogisticsDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total SKUs"
          value="3,247"
          icon={<Package className="w-6 h-6" />}
          trend={{ value: 4.8, isPositive: true }}
        />
        <StatCard
          title="Inventory Value"
          value="$8.2M"
          icon={<Warehouse className="w-6 h-6" />}
          trend={{ value: 6.2, isPositive: true }}
        />
        <StatCard
          title="Low Stock Alerts"
          value="47"
          icon={<AlertTriangle className="w-6 h-6" />}
          trend={{ value: 12, isPositive: false }}
        />
        <StatCard
          title="On-Time Delivery"
          value="94.2%"
          icon={<Truck className="w-6 h-6" />}
          trend={{ value: 1.8, isPositive: true }}
        />
      </div>

      {/* Stock by Category + Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stock by Category */}
        <Card padding="lg">
          <CardHeader title="Stock by Category" subtitle="Inventory value distribution" />
          <CardContent className="mt-4">
            <div className="flex items-end gap-2 h-40 mb-4">
              {stockByCategory.map((item) => (
                <div key={item.category} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary-500 rounded-t-sm transition-all hover:bg-primary-600"
                    style={{ height: `${(item.percentage / maxStockPercentage) * 100}%` }}
                    title={`${item.category}: ${formatCurrency(item.value)}`}
                  />
                  <span className="text-[9px] text-gray-500 dark:text-gray-400 truncate w-full text-center">
                    {item.category.split(' ')[0]}
                  </span>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              {stockByCategory.slice(0, 4).map((item) => (
                <div key={item.category} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">{item.category}</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card padding="none" className="lg:col-span-2">
          <div className="p-6 pb-0">
            <CardHeader
              title="Low Stock Alerts"
              subtitle="Items below minimum threshold"
              action={
                <Badge variant="danger" size="sm">
                  {lowStockItems.filter((i) => i.severity === 'Critical').length} Critical
                </Badge>
              }
            />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Item</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Current</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Minimum</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Stock Level</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Warehouse</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Severity</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr
                      key={item.sku}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{item.sku}</p>
                        </div>
                      </td>
                      <td className="text-center px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {item.current}
                      </td>
                      <td className="text-center px-6 py-3 text-sm text-gray-500 dark:text-gray-400">
                        {item.minimum}
                      </td>
                      <td className="px-6 py-3">
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              item.current / item.minimum < 0.3 ? 'bg-red-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min((item.current / item.minimum) * 100, 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">
                        {item.warehouse}
                      </td>
                      <td className="text-center px-6 py-3">
                        <Badge
                          variant={item.severity === 'Critical' ? 'danger' : 'warning'}
                          size="sm"
                        >
                          {item.severity}
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

      {/* Warehouse Utilization + Delivery Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Warehouse Utilization */}
        <Card padding="lg">
          <CardHeader title="Warehouse Utilization" subtitle="Storage capacity usage" />
          <CardContent className="mt-4 space-y-4">
            {warehouseUtilization.map((wh) => {
              const utilization = Math.round((wh.used / wh.capacity) * 100);
              return (
                <div key={wh.name}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{wh.name}</span>
                    <span className={`text-sm font-semibold ${getUtilizationTextColor(utilization)}`}>
                      {utilization}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2.5">
                    <div
                      className={`${getUtilizationColor(utilization)} h-2.5 rounded-full transition-all`}
                      style={{ width: `${utilization}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 mt-1.5">
                    <span className="text-xs text-gray-500">
                      {wh.used.toLocaleString()} / {wh.capacity.toLocaleString()} units
                    </span>
                    <span className="text-xs text-green-600">
                      <ArrowUpRight className="w-3 h-3 inline" /> {wh.inbound} in
                    </span>
                    <span className="text-xs text-blue-600">
                      <ArrowDownRight className="w-3 h-3 inline" /> {wh.outbound} out
                    </span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Delivery Performance */}
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardHeader title="Delivery Performance" subtitle="On-time delivery by route" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Route</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Total</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      <span className="inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-green-500" /> On Time
                      </span>
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-500" /> Delayed
                      </span>
                    </th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">
                      <span className="inline-flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-red-500" /> Failed
                      </span>
                    </th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">OTD %</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryPerformance.map((route) => (
                    <tr
                      key={route.route}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">{route.route}</td>
                      <td className="text-center px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{route.totalDeliveries}</td>
                      <td className="text-center px-6 py-3 text-sm text-green-600 font-medium">{route.onTime}</td>
                      <td className="text-center px-6 py-3 text-sm text-amber-600 font-medium">{route.delayed}</td>
                      <td className="text-center px-6 py-3 text-sm text-red-600 font-medium">{route.failed}</td>
                      <td className="text-right px-6 py-3">
                        <span className={`text-sm font-semibold ${
                          route.onTimePercent >= 90 ? 'text-green-600' : route.onTimePercent >= 80 ? 'text-amber-600' : 'text-red-600'
                        }`}>
                          {route.onTimePercent}%
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

      {/* Truck Utilization + Recent GRN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Truck Utilization */}
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardHeader title="Truck Utilization" subtitle="Fleet performance today" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Truck</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Driver</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Utilization</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Trips</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {truckUtilization.map((truck) => (
                    <tr
                      key={truck.truck}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{truck.truck}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{truck.capacity}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{truck.driver}</td>
                      <td className="text-center px-6 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${getUtilizationColor(truck.utilization)}`}
                              style={{ width: `${truck.utilization}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-900 dark:text-white w-8">
                            {truck.utilization}%
                          </span>
                        </div>
                      </td>
                      <td className="text-center px-6 py-3 text-sm text-gray-600 dark:text-gray-400">{truck.trips}</td>
                      <td className="text-center px-6 py-3">
                        <Badge variant={getTruckStatusVariant(truck.status)} size="sm">
                          {truck.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Recent GRN */}
        <Card padding="none">
          <div className="p-6 pb-0">
            <CardHeader title="Recent GRN" subtitle="Goods receipt notes" />
          </div>
          <CardContent className="mt-4">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">GRN No.</th>
                    <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Supplier</th>
                    <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Value</th>
                    <th className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentGrn.map((grn) => (
                    <tr
                      key={grn.grnNo}
                      className="border-b border-gray-100 dark:border-gray-800/50 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30"
                    >
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{grn.grnNo}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{grn.date}</p>
                        </div>
                      </td>
                      <td className="px-6 py-3">
                        <div>
                          <p className="text-sm text-gray-900 dark:text-white">{grn.supplier}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{grn.items} items</p>
                        </div>
                      </td>
                      <td className="text-right px-6 py-3 text-sm font-medium text-gray-900 dark:text-white">
                        {formatCurrency(grn.value)}
                      </td>
                      <td className="text-center px-6 py-3">
                        <Badge
                          variant={
                            grn.status === 'Verified' ? 'success' : grn.status === 'Pending' ? 'warning' : 'danger'
                          }
                          size="sm"
                        >
                          {grn.status}
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
    </div>
  );
}
