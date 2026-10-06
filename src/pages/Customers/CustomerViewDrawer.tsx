import { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Mail, Phone, ExternalLink, ChevronDown, ChevronRight, Edit, Plus, Printer, Download, Send } from 'lucide-react';
import type { Customer } from '../../types/Customer';
import { useMoney } from '../../hooks/Currency/useMoney';
import { Skeleton, SkeletonRegion } from '../../components/ui/skeleton';

const PARTNER_FUNCTIONS = [
  { key: 'shipTo', label: 'Ship To Party' },
  { key: 'soldTo', label: 'Sold To Party' },
  { key: 'payer', label: 'Payer' },
  { key: 'billTo', label: 'Bill To Party' },
] as const;

interface CustomerViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Customer | null;
  onEdit?: (customer: Customer) => void;
  isLoading?: boolean;
}

const SECTION_TITLES = ['ADDRESS', 'ATTRIBUTES', 'PARTNER FUNCTION'];

/**
 * Shown while the customer's details load: the Overview layout — tab bar, profile header, the three
 * accordions (section names are real, they don't depend on the record) and the financial / chart column.
 */
function CustomerViewSkeleton() {
  return (
    <SkeletonRegion label="Loading customer details" className="flex h-full flex-col overflow-hidden bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-6">
          {['w-16', 'w-12', 'w-20'].map((w) => (
            <div key={w} className="flex h-[46px] items-center">
              <Skeleton className={`h-3.5 ${w}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="grid min-h-0 flex-1 grid-cols-1 gap-px bg-gray-200 md:grid-cols-2 dark:bg-gray-700">
        <div className="space-y-6 bg-white p-6 dark:bg-gray-800">
          <div className="flex items-start gap-4 border-b border-gray-100 pb-6 dark:border-gray-700">
            <Skeleton className="h-12 w-12 shrink-0 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-7 w-48" />
              <div className="mt-0 flex h-7 items-start pt-0.5">
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="space-y-1">
                <div className="flex h-5 items-center">
                  <Skeleton className="h-4 w-40" />
                </div>
                <div className="flex h-5 items-center">
                  <Skeleton className="h-4 w-32" />
                </div>
                <div className="flex h-4 items-center">
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            {SECTION_TITLES.map((title, i) => (
              <div key={title} className="overflow-hidden rounded-md border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between bg-gray-50 px-4 py-3 dark:bg-gray-800">
                  <span className="text-sm font-semibold tracking-wide text-gray-700 dark:text-gray-300">{title}</span>
                  <ChevronDown className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                </div>
                {i !== 1 && (
                  <div className={i === 0 ? 'space-y-2 p-4' : 'divide-y divide-gray-100 dark:divide-gray-700'}>
                    {i === 0 ? (
                      <>
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </>
                    ) : (
                      [0, 1, 2, 3].map((r) => (
                        <div key={r} className="space-y-1 p-4">
                          <Skeleton className="h-3 w-20" />
                          <Skeleton className="h-4 w-2/3" />
                          <Skeleton className="h-4 w-1/2" />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-8 bg-white p-6 dark:bg-gray-800">
          <div className="grid grid-cols-2 gap-6 border-b border-gray-100 pb-6 dark:border-gray-700">
            <div className="space-y-2">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-7 w-28" />
            </div>
            <div className="space-y-2 border-l border-gray-100 pl-6 dark:border-gray-700">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-5 w-24" />
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="mb-6 h-[34px] w-32" />
            <div className="flex h-6 items-center justify-center">
              <Skeleton className="h-5 w-40" />
            </div>
            <Skeleton className="h-64 w-full" />
            <div className="mt-12 flex h-[15px] items-center justify-center gap-6">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </div>
      </div>
    </SkeletonRegion>
  );
}

export function CustomerViewDrawer({ isOpen, onClose, data, onEdit, isLoading }: CustomerViewDrawerProps) {
  const { format } = useMoney();
  const [activeDetailTab, setActiveDetailTab] = useState('overview');
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

  const [expandedSections, setExpandedSections] = useState({ address: true, attributes: false, partner: true });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: 'Sales' },
    { id: 'statement', label: 'Statement' },
  ];

  if (!isLoading && !data) return null;

  const displayName = data ? data.shopName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown Customer' : '';
  const email = data?.email || 'N/A';
  const phone = data?.phoneNumber || 'N/A';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={isLoading ? 'Customer' : displayName}
      width="w-[70%]"
      headerActions={
        data ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onEdit?.(data)} className="p-2 cursor-pointer border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
              >
                More <ChevronDown className="w-4 h-4" />
              </button>
              {isMoreOpen && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => {
                      setIsMoreOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Inactive
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : undefined
      }
    >
      {isLoading || !data ? (
        <CustomerViewSkeleton />
      ) : (
        <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
          {/* Detail Tabs */}
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
            <div className="flex gap-6 overflow-x-auto">
              {detailTabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveDetailTab(tab.id)}
                  className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                    activeDetailTab === tab.id
                      ? 'border-primary-600 text-gray-900 dark:text-white'
                      : 'border-transparent text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab Content */}
          {activeDetailTab === 'overview' && (
            <div className="flex-1 overflow-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200 dark:bg-gray-700 min-h-full">
                {/* Left Column (Profile & Accordions) */}
                <div className="bg-white dark:bg-gray-800 p-6 space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-start gap-4 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 text-xl font-bold text-gray-500">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white text-lg">{displayName}</h3>
                      {data.code && <p className="text-sm text-gray-500 mb-2">Code: {data.code}</p>}
                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" /> {email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {phone}
                        </p>
                        <a href={`mailto:${email}`} className="text-primary-600 hover:underline flex items-center gap-1 mt-1 text-xs font-medium">
                          Send Email <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Accordions */}
                  <div className="space-y-4">
                    {/* Address Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleSection('address')}
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm tracking-wide">ADDRESS</span>
                        {expandedSections.address ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </button>
                      {expandedSections.address && (
                        <div className="p-4 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                          <p>{data.customerOfficeAddress || 'No address provided'}</p>
                          <p>
                            {data.customerOfficeCity && `${data.customerOfficeCity}, `}
                            {data.customerOfficeState} {data.customerOfficeZipcode}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Attributes Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleSection('attributes')}
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm tracking-wide">ATTRIBUTES</span>
                        {expandedSections.attributes ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </button>
                      {expandedSections.attributes && (
                        <div className="p-4 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">Customer Category</span>
                              <span>{data.customerCategory?.name || '—'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">Customer Channel</span>
                              <span>{data.channel?.name || '—'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">Credit Limit</span>
                              <span>{data.creditLimit ? format(data.creditLimit) : '—'}</span>
                            </div>
                            <div>
                              <span className="block text-gray-400 text-xs mb-1">Credit Days</span>
                              <span>{data.creditDays || '—'}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Partner Function Section */}
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md overflow-hidden">
                      <button
                        onClick={() => toggleSection('partner')}
                        className="w-full flex justify-between items-center px-4 py-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-semibold text-gray-700 dark:text-gray-300 text-sm tracking-wide">PARTNER FUNCTION</span>
                        {expandedSections.partner ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      </button>
                      {expandedSections.partner && (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                          {PARTNER_FUNCTIONS.map(({ key, label }) => {
                            const partner = data.partners?.[key];
                            return (
                              <div key={key} className="p-4">
                                <span className="block text-gray-400 text-xs mb-1">{label}</span>
                                {partner ? (
                                  <div className="space-y-0.5">
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {partner.shopName || partner.fullName || '—'}
                                      {partner.code && <span className="ml-2 font-normal text-gray-500 dark:text-gray-400">{partner.code}</span>}
                                      {partner.isSelf && (
                                        <span className="ml-2 rounded-full bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 text-[11px] font-medium text-primary-700 dark:text-primary-300">
                                          Same customer
                                        </span>
                                      )}
                                    </p>
                                    {partner.fullName && partner.fullName !== partner.shopName && <p>{partner.fullName}</p>}
                                    {(partner.email || partner.phoneNumber) && <p>{[partner.email, partner.phoneNumber].filter(Boolean).join(' · ')}</p>}
                                    {partner.fullAddress && <p>{partner.fullAddress}</p>}
                                  </div>
                                ) : (
                                  <span>—</span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column (Financials & Chart) */}
                <div className="bg-white dark:bg-gray-800 p-6 space-y-8">
                  {/* Financial Summary */}
                  <div className="grid grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <h4 className="text-gray-700 dark:text-gray-300 font-semibold mb-1">Outstanding Receivables</h4>
                      <span className="text-xl font-bold text-orange-500">{format(data.balance)}</span>
                    </div>
                    <div className="pl-6 border-l border-gray-100 dark:border-gray-700">
                      <h4 className="text-gray-500 dark:text-gray-400 text-sm mb-1">Unused Credits</h4>
                      <span className="text-gray-900 dark:text-white font-semibold">{format(data.availableCredit)}</span>
                    </div>
                  </div>

                  {/* Mock Chart Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center mb-6">
                      <select className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500">
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                        <option>This Year</option>
                      </select>
                    </div>

                    <div className="text-center font-bold text-gray-600 dark:text-gray-300 mb-4">Income and Expense</div>

                    {/* Empty State / Mock Chart Grid */}
                    <div className="relative h-64 border-b border-l border-gray-200 dark:border-gray-700 flex ml-8 mt-4">
                      {/* Y-axis Labels */}
                      <div className="absolute -left-8 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-400 hidden sm:flex">
                        <span>1.0</span>
                        <span>0.8</span>
                        <span>0.6</span>
                        <span>0.4</span>
                        <span>0.2</span>
                        <span>0</span>
                        <span>-0.2</span>
                        <span>-0.4</span>
                        <span>-0.6</span>
                        <span>-0.8</span>
                        <span>-1.0</span>
                      </div>

                      {/* Horizontal Grid lines */}
                      <div className="absolute inset-0 flex flex-col justify-between">
                        {Array.from({ length: 11 }).map((_, i) => (
                          <div key={i} className="w-full border-t border-gray-100 dark:border-gray-800 h-0"></div>
                        ))}
                      </div>

                      {/* X-axis Labels */}
                      <div className="absolute -bottom-6 left-0 right-0 flex justify-between px-8 text-xs text-gray-500">
                        <span>Oct 2024</span>
                        <span>Nov 2024</span>
                        <span>Dec 2024</span>
                        <span>Jan 2025</span>
                        <span>Feb 2025</span>
                        <span>Mar 2025</span>
                      </div>
                    </div>

                    <div className="flex justify-center gap-6 mt-12 text-xs text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-3 bg-green-400 rounded-sm inline-block"></span> Income
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-3 bg-blue-400 rounded-sm inline-block"></span> Expense
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Sales Tab Content */}
          {activeDetailTab === 'sales' && (
            <div className="flex-1 p-6 bg-white dark:bg-gray-800">
              <div className="max-w-4xl mx-auto">
                {/* Toolbar */}
                <div className="mb-6">
                  <select className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 w-64">
                    <option>Go to transactions</option>
                    <option>Recent</option>
                    <option>All</option>
                  </select>
                </div>

                {/* Transaction Types List */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-md divide-y divide-gray-200 dark:divide-gray-700">
                  {['Invoice', 'Customer Payment', 'Estimates', 'Deliver Challan', 'Expense', 'Credit Note'].map((type, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                        {type}
                      </div>
                      <button className="flex cursor-pointer cursor-pointer items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
                        <Plus className="w-4 h-4" /> Add New
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Statement Tab Content */}
          {activeDetailTab === 'statement' && (
            <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900 overflow-auto">
              <div className="max-w-5xl mx-auto">
                {/* Toolbar */}
                <div className="flex justify-between items-center mb-6">
                  <select className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 w-48">
                    <option>This Month</option>
                    <option>This Week</option>
                    <option>This Quarter</option>
                    <option>This Year</option>
                  </select>

                  <div className="flex items-center gap-3">
                    <button className="p-2 cursor-pointer cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Printer className="w-4 h-4" />
                    </button>
                    <button className="p-2 cursor-pointer cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="flex cursor-pointer cursor-pointer items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                      <Send className="w-4 h-4" /> Send Email
                    </button>
                  </div>
                </div>

                {/* Document View */}
                <div className="bg-white dark:bg-gray-800 p-10 border border-gray-200 dark:border-gray-700 shadow-sm rounded-sm">
                  {/* Header Info */}
                  <div className="flex justify-end text-sm text-gray-600 dark:text-gray-400 text-right mb-12">
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white mb-1">Retail Chain</div>
                      <div>Company ID : 1</div>
                      <div>Dubai Dubai</div>
                      <div>Dubai Dubai 181529</div>
                      <div>United Arab Emirates</div>
                      <div>GSTIN</div>
                    </div>
                  </div>

                  {/* Title & Dates */}
                  <div className="border-t-2 border-b border-gray-900 dark:border-gray-100 py-3 flex justify-between items-end mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-0">Statement of Accounts</h1>
                    <span className="text-sm text-gray-500">01/03/2025 To 31/03/2025</span>
                  </div>

                  {/* Details Grid */}
                  <div className="flex justify-between items-start">
                    {/* Bill To */}
                    <div className="text-sm">
                      <div className="font-bold text-gray-800 dark:text-gray-200 mb-1">To</div>
                      <div className="text-primary-600 font-medium mb-1">{data.shopName || `${data.firstName || ''} ${data.lastName || ''}`.trim()}</div>
                      <div className="text-gray-600 dark:text-gray-400">
                        {data.code ? `${data.code}, ` : ''}
                        {data.customerOfficeAddress || ''}
                        <br />
                        {data.customerOfficeCity || ''}
                        <br />
                        {data.customerOfficeState || ''}
                      </div>
                    </div>

                    {/* Summary Table */}
                    <div className="w-72">
                      <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded text-sm">
                        <div className="font-bold text-gray-900 dark:text-white mb-3">Account Summary</div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Opening Balance</span>
                            <span className="font-medium">—</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Invoiced Amount</span>
                            <span className="font-medium">—</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Amount Received</span>
                            <span className="font-medium">—</span>
                          </div>
                          <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                            <span className="font-bold text-gray-900 dark:text-white">Balance Due</span>
                            <span className="font-bold text-gray-900 dark:text-white">{format(data.balance)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Other Tabs Empty State */}
          {activeDetailTab !== 'overview' && activeDetailTab !== 'sales' && activeDetailTab !== 'statement' && (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 capitalize">{activeDetailTab}</h3>
              <p>This section is under construction.</p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
