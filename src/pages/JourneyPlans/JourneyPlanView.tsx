import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ChevronDown,
  Loader2,
  Pencil,
  Map,
  ShieldAlert,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { getJourneyPlanByUuid } from '../../api/JourneyPlanApi';
import { Tabs } from '../../components/ui/Tabs';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';

function DetailItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">{label}</dt>
      <dd className="text-sm font-semibold text-gray-900 dark:text-white">{value}</dd>
    </div>
  );
}

export function JourneyPlanView() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<any>(null);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
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

  useEffect(() => {
    if (uuid) {
      const fetchDetails = async () => {
        setIsLoading(true);
        setIsError(false);
        try {
          const response = await getJourneyPlanByUuid(uuid);
          setData(response);
        } catch (err) {
          setIsError(true);
          setError(err);
        } finally {
          setIsLoading(false);
        }
      };
      fetchDetails();
    }
  }, [uuid]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-col items-center gap-4 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
          <p className="text-sm font-medium">Loading journey plan details…</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900/50 gap-4">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {error?.response?.data?.message || 'Failed to load details.'}
        </p>
        <button
          onClick={() => navigate('/journey-plan')}
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
              <CardHeader title="General Details" />
              <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                <DetailItem label="Journey Name" value={data.journeyName || '—'} />
                <DetailItem label="Description" value={data.description || '—'} />
                <DetailItem label="Plan Base" value={data.journeyPlanBase?.replace('_', ' ') || '—'} />
                <DetailItem label="Merchandiser" value={data.merchandiserName || '—'} />
                <DetailItem 
                  label="Status" 
                  value={
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full ${data.status ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {data.status ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                      {data.status ? 'Active' : 'Inactive'}
                    </span>
                  } 
                />
                <DetailItem label="Enforced Sequence" value={data.enforceFlag ? 'Yes' : 'No'} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card hover>
              <CardHeader title="Timing Details" />
              <CardContent className="space-y-6 pb-2">
                <DetailItem label="Start Date" value={data.startDate || '—'} />
                <DetailItem label="End Date" value={data.noEnd ? 'No End Date' : (data.endDate || '—')} />
                <DetailItem label="Start Time" value={data.startTime || '—'} />
                <DetailItem label="End Time" value={data.endTime || '—'} />
              </CardContent>
            </Card>
          </div>
        </div>
      )
    },
    {
      key: 'schedule',
      label: 'Schedule & Customers',
      content: (
        <div className="space-y-6">
          {data.dayCustomers && Object.keys(data.dayCustomers).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(data.dayCustomers).map(([dayKey, customers]: [string, any]) => {
                if (!customers || customers.length === 0) return null;
                
                let displayDay = dayKey;
                if (dayKey.includes('-')) {
                  const [week, day] = dayKey.split('-');
                  displayDay = `Week ${week} - ${day.charAt(0).toUpperCase() + day.slice(1)}`;
                } else {
                  displayDay = dayKey.charAt(0).toUpperCase() + dayKey.slice(1);
                }

                return (
                  <Card key={dayKey} hover>
                    <div className="bg-gray-50 dark:bg-gray-800/50 px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary-500" />
                        {displayDay}
                      </h3>
                      <span className="text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-400 px-3 py-1 rounded-full">
                        {customers.length} Customers
                      </span>
                    </div>
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {customers.map((c: any, index: number) => (
                        <div key={c.id || index} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-sm font-bold text-gray-700 dark:text-gray-300 shadow-sm">
                              {c.sequence || index + 1}
                            </div>
                            <div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">{c.customerName || 'Unknown Customer'}</div>
                              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">Code: {c.code || '—'}</div>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-1">
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-700 dark:text-gray-300">
                              <Clock className="w-3.5 h-3.5" />
                              {c.startTime && c.endTime ? `${c.startTime} - ${c.endTime}` : 'All Day'}
                            </div>
                            <div className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                              MSL Perform: <span className={c.mslPerform ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}>{c.mslPerform ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                );
              })}
              
              {!Object.values(data.dayCustomers).some((arr: any) => arr && arr.length > 0) && (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
                    <Map className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Schedule</h3>
                    <p>There are no customers scheduled in this plan yet.</p>
                  </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700">
              <Map className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Schedule</h3>
              <p>No customer data available for this Journey Plan.</p>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 dark:bg-gray-900/50 pb-12">
      {/* Top Toolbar */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Journey Plan Details
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/journey-plan/edit/${data.id || uuid}`)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
          >
            <Pencil className="w-4 h-4" /> Edit
          </button>
          
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              More <ChevronDown className="w-4 h-4" />
            </button>
            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsMoreOpen(false)}
                >
                  Mark Active
                </button>
                <button
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsMoreOpen(false)}
                >
                  Mark Inactive
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Header Section */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-800 pt-8 pb-0">
        <div className="px-6 max-w-7xl mx-auto mb-8">
          <div className="flex flex-col md:flex-row md:items-end gap-6 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-inner">
                {data.journeyName ? data.journeyName.substring(0, 2).toUpperCase() : 'JP'}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{data.journeyName || '—'}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-2.5 py-1 rounded-md font-medium">
                    {data.journeyPlanBase?.replace('_', ' ').toUpperCase() || '—'}
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-gray-600"></span>
                    {data.merchandiserName || 'Unassigned'}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-800">
                <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Customers</div>
                <div className="text-xl font-bold text-gray-900 dark:text-white">
                  {Object.values(data.dayCustomers || {}).reduce((acc: number, arr: any) => acc + (arr?.length || 0), 0)}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs inside Header */}
        <div className="px-6 max-w-7xl mx-auto">
          <Tabs tabs={tabs} defaultActiveKey="overview" />
        </div>
      </div>
    </div>
  );
}
