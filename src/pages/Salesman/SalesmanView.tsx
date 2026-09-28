import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  Loader2,
  Pencil,
  X,
  Mail,
  Phone,
  Map,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Clock
} from 'lucide-react';
import { useSalesmanDetail } from '../../hooks/Salesman/useSalesmanDetail';
import { Tabs } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader, StatCard } from '../../components/ui/Card';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import SalesmanAdd from './SalesmanAdd';

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function SalesmanView() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const { salesman, isLoading, isError, error } = useSalesmanDetail(uuid);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const entityLabel = salesman?.salesmanType?.name === 'Merchandiser' ? 'Merchandiser' : 'Salesman';
  const displayName = salesman?.user?.fullName || 'Unknown';

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm font-medium">Loading {entityLabel.toLowerCase()} details…</p>
        </div>
      </div>
    );
  }

  if (isError || !salesman) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900/50 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {isError ? (error as any)?.response?.data?.message || 'Failed to load details.' : 'No salesman found.'}
        </p>
        <button
          onClick={() => navigate('/salesman')}
          className="mt-2 px-5 py-2 text-sm font-medium bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
        >
          Back to List
        </button>
      </div>
    );
  }

  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      content: (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card hover>
              <CardHeader title="Assignment & Roles" />
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                <DetailItem label={`${entityLabel} Code`} value={salesman.salesmanCode || '—'} />
                <DetailItem label={`${entityLabel} Type`} value={salesman.salesmanType?.name || '—'} />
                <DetailItem label={`${entityLabel} Role`} value={salesman.salesmanRole?.name || '—'} />
                <DetailItem label={`${entityLabel} Category`} value={salesman.salesmanCategory?.name || '—'} />
                <DetailItem label="Assigned Route" value={salesman.route?.name || '—'} />
                <DetailItem label="Supervisor" value={salesman.supervisor?.name || '—'} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card hover>
              <CardHeader title="Security & Access" />
              <CardContent className="space-y-6 pb-2">
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Ordering Status</dt>
                  <dd>
                    {salesman.canTakeOrders ? (
                      <Badge variant="success" size="md">
                        <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Ready for Orders
                      </Badge>
                    ) : (
                      <Badge variant="danger" size="md">
                        <ShieldAlert className="w-3.5 h-3.5 mr-1" /> Cannot Take Orders
                      </Badge>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Block Status</dt>
                  <dd>
                    {salesman.isBlocked ? (
                      <div className="text-sm font-semibold text-red-600 dark:text-red-400">
                        Blocked ({salesman.blockStartDate || '?'} to {salesman.blockEndDate || '?'})
                      </div>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Not Blocked</span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">Login Type</dt>
                  <dd className="text-sm font-semibold text-gray-900 dark:text-white">{salesman.user?.loginType || '—'}</dd>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      key: 'sales',
      label: 'Performance (Mock)',
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total Sales (MTD)"
              value="$124,500"
              icon={<DollarSign className="w-5 h-5" />}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="Active Routes"
              value="12"
              icon={<Map className="w-5 h-5" />}
              description="Routes covered this month"
            />
            <StatCard
              title="Orders Taken"
              value="843"
              icon={<Package className="w-5 h-5" />}
              trend={{ value: 4.2, isPositive: true }}
            />
            <StatCard
              title="Avg. Visit Time"
              value="14m"
              icon={<Clock className="w-5 h-5" />}
              trend={{ value: 2.1, isPositive: false }}
            />
          </div>
          <Card padding="lg">
            <div className="flex items-center justify-center h-64 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                <p>Detailed performance charts will appear here.</p>
              </div>
            </div>
          </Card>
        </div>
      )
    },
    {
      key: 'login-info',
      label: 'Login Info',
      content: (
        <Card>
          <CardHeader title="Device & Login History" subtitle="Recent application access logs." />
          <div className="px-4 pb-4">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Date</span>
                <input
                  type="date"
                  className="pl-3 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors"
                />
              </div>
              <div className="flex gap-2">
                <button className="px-4 cursor-pointer py-1.5 bg-primary-600 text-white font-medium text-sm rounded-lg hover:bg-primary-700 transition-colors shadow-sm">
                  Filter
                </button>
                <button className="px-4 cursor-pointer py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium text-sm rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
                  Clear
                </button>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-semibold text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Version</th>
                    <th className="px-6 py-4">Device Name</th>
                    <th className="px-6 py-4">Device IMEI Number</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                      <Clock className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      No login history available.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900/50 pb-12">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          {entityLabel} Details
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(prev => !prev)}
              className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Actions <ChevronDown className="w-4 h-4" />
            </button>
            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-30 overflow-hidden py-1">
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Suspend User
                </button>
                <button
                  onClick={() => setIsMoreOpen(false)}
                  className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  Delete Record
                </button>
              </div>
            )}
          </div>
          
          <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1" />
          
          <button
            onClick={() => navigate('/salesman')}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Header Profile Area */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-gray-800 border-2 border-white dark:border-gray-900 shadow-md flex items-center justify-center text-gray-400 overflow-hidden shrink-0">
              {salesman.profileImage ? (
                <img src={salesman.profileImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-gray-400 dark:text-gray-500 tracking-wider">
                  {getInitials(displayName)}
                </span>
              )}
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {displayName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" />
                  {salesman.user?.email || 'No email provided'}
                </div>
                <div className="flex items-center gap-1.5">
                  <Phone className="w-4 h-4" />
                  {salesman.user?.mobile || 'No phone provided'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap md:flex-col items-center md:items-end gap-3">
            <StatusBadge 
              status={salesman.status ? 'active' : 'inactive'} 
              size="md" 
            />
            {salesman.isBlocked && (
              <Badge variant="danger" rounded>Access Blocked</Badge>
            )}
            <Badge variant="primary" rounded>
              {salesman.salesmanRole?.name || 'Unassigned Role'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Tabs Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <Tabs tabs={tabs} variant="line" />
      </div>

      <SalesmanAdd 
        isOpen={isEditOpen} 
        onClose={() => setIsEditOpen(false)} 
        data={salesman as any} 
      />
    </div>
  );
}

export default SalesmanView;
