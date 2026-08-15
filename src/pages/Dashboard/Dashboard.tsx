import { useState } from 'react';
import { BarChart3, Users, Store, Truck, ClipboardList, Target, PieChart, Radar, TableProperties, Navigation, MapPin, Repeat } from 'lucide-react';
import { Tabs } from '../../components/ui/Tabs';
import { SalesDashboard } from './SalesDashboard';
import { CustomerDashboard } from './CustomerDashboard';
import { MerchandisingDashboard } from './MerchandisingDashboard';
import { LogisticsDashboard } from './LogisticsDashboard';
import { MslAuditDashboard } from './MslAuditDashboard';
import { SalesTargetDashboard } from './SalesTargetDashboard';
import { MerchandisingAnalyticsDashboard } from './MerchandisingAnalyticsDashboard';
import { ReachCoverageDashboard } from './ReachCoverageDashboard';
import { PositioningDashboard } from './PositioningDashboard';
import { RouteComplianceDashboard } from './RouteComplianceDashboard';
import { MerchandisingReachCoverageDashboard } from './MerchandisingReachCoverageDashboard';
import { PreSaleReachCoverageDashboard } from './PreSaleReachCoverageDashboard';
import { VisitFrequencyDashboard } from './VisitFrequencyDashboard';

const dashboardTabs = [
  {
    key: 'sales',
    label: 'Sales Performance',
    icon: <BarChart3 className="w-4 h-4" />,
    content: <SalesDashboard />,
  },
  {
    key: 'customers',
    label: 'Customer Insights',
    icon: <Users className="w-4 h-4" />,
    content: <CustomerDashboard />,
  },
  {
    key: 'merchandising',
    label: 'Merchandising HUB',
    icon: <Store className="w-4 h-4" />,
    content: <MerchandisingDashboard />,
  },
  {
    key: 'logistics',
    label: 'Logistics Command Center',
    icon: <Truck className="w-4 h-4" />,
    content: <LogisticsDashboard />,
  },
  {
    key: 'msl-audit',
    label: 'Audit & Compliance',
    icon: <ClipboardList className="w-4 h-4" />,
    content: <MslAuditDashboard />,
  },
  {
    key: 'sales-target',
    label: 'Targets & Quotas',
    icon: <Target className="w-4 h-4" />,
    content: <SalesTargetDashboard />,
  },
  {
    key: 'merchandising-analytics',
    label: 'Merchandising Analytics',
    icon: <PieChart className="w-4 h-4" />,
    content: <MerchandisingAnalyticsDashboard />,
  },
  {
    key: 'reach-coverage',
    label: 'Market Reach',
    icon: <Radar className="w-4 h-4" />,
    content: <ReachCoverageDashboard />,
  },
  {
    key: 'positioning',
    label: 'Product Positioning',
    icon: <TableProperties className="w-4 h-4" />,
    content: <PositioningDashboard />,
  },
  {
    key: 'route-compliance',
    label: 'Route Compliance',
    icon: <Navigation className="w-4 h-4" />,
    content: <RouteComplianceDashboard />,
  },
  {
    key: 'merchandising-reach-coverage',
    label: 'Coverage Intelligence',
    icon: <MapPin className="w-4 h-4" />,
    content: <MerchandisingReachCoverageDashboard />,
  },
  {
    key: 'presale-reach-coverage',
    label: 'PreSale ReachCoverage',
    icon: <MapPin className="w-4 h-4" />,
    content: <PreSaleReachCoverageDashboard />,
  },
  {
    key: 'visit-frequency',
    label: 'Visit Frequency',
    icon: <Repeat className="w-4 h-4" />,
    content: <VisitFrequencyDashboard />,
  },
];

export function Dashboard() {
  const [activeTab, setActiveTab] = useState('sales');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Overview of your merchandising operations and business performance.
        </p>
      </div>

      <Tabs
        tabs={dashboardTabs}
        activeKey={activeTab}
        onChange={setActiveTab}
        variant="line"
      />
    </div>
  );
}
