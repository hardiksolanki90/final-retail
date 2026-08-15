import { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Mail, Phone, ExternalLink, ChevronDown, ChevronRight, Edit, Plus, Printer, Download, Send, MessageSquare } from 'lucide-react';
import type { Customer } from '../../types/Customer';

interface CustomerViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: Customer | null;
}

export function CustomerViewDrawer({ isOpen, onClose, data }: CustomerViewDrawerProps) {
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

  const [expandedSections, setExpandedSections] = useState({
    address: true,
    attributes: false,
    partner: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'comments', label: 'Comments' },
    { id: 'sales', label: 'Sales' },
    { id: 'statement', label: 'Statement' },
    { id: 'custom-fields', label: 'Custom Fields' },
  ];

  if (!data) return null;

  const displayName = data.shopName || `${data.firstName || ''} ${data.lastName || ''}`.trim() || 'Unknown Customer';
  const email = data.email || 'N/A';
  const phone = data.phoneNumber || 'N/A';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      width="w-[70%]"
      headerActions={
        <div className="flex items-center gap-2">
          <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
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
                  onClick={() => { setIsMoreOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Active
                </button>
                <button
                  onClick={() => { setIsMoreOpen(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Inactive
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 overflow-y-auto">
        {/* Detail Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {detailTabs.map(tab => (
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
                        <p>{data.address || 'No address provided'}</p>
                        <p>{data.city && `${data.city}, `}{data.state} {data.zipcode}</p>
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
                            <span>{data.creditLimit ? `AED ${data.creditLimit.toFixed(2)}` : '—'}</span>
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
                      <div className="p-4 bg-white dark:bg-gray-800 text-sm text-gray-600 dark:text-gray-400">
                        <p>Partner function details not currently linked.</p>
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
                    <span className="text-xl font-bold text-orange-500">
                      ₹{data.balance ? data.balance.toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <div className="pl-6 border-l border-gray-100 dark:border-gray-700">
                    <h4 className="text-gray-500 dark:text-gray-400 text-sm mb-1">Unused Credits</h4>
                    <span className="text-gray-900 dark:text-white font-semibold">
                      ₹0.00
                    </span>
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
                  
                  <div className="text-center font-bold text-gray-600 dark:text-gray-300 mb-4">
                    Income and Expense
                  </div>

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
                      {Array.from({length: 11}).map((_, i) => (
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
                {[
                  'Invoice',
                  'Customer Payment',
                  'Estimates',
                  'Deliver Challan',
                  'Expense',
                  'Credit Note'
                ].map((type, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                      {type}
                    </div>
                    <button className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300">
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
                  <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Printer className="w-4 h-4" />
                  </button>
                  <button className="p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Download className="w-4 h-4" />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
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
                      {data.code ? `${data.code}, ` : ''}{data.address || ''}<br/>
                      {data.city || 'Mirfa'}<br/>
                      {data.state || 'Dubai'}
                    </div>
                  </div>

                  {/* Summary Table */}
                  <div className="w-72">
                    <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded text-sm">
                      <div className="font-bold text-gray-900 dark:text-white mb-3">Account Summary</div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Opening Balance</span>
                          <span className="font-medium">₹ 0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Invoiced Amount</span>
                          <span className="font-medium">₹ 0.00</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 dark:text-gray-400">Amount Received</span>
                          <span className="font-medium">₹ 0.00</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
                          <span className="font-bold text-gray-900 dark:text-white">Balance Due</span>
                          <span className="font-bold text-gray-900 dark:text-white">₹ 0.00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* Comments Tab Content */}
        {activeDetailTab === 'comments' && (
          <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Add Comment Box */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add a Note</h3>
                <textarea 
                  rows={3} 
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 mb-3"
                  placeholder="Enter your comment or note here..."
                ></textarea>
                <div className="flex justify-end">
                  <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                    Post Comment
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Recent Comments</h3>
                
                {/* Empty State */}
                <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
                  <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
                  <p>No comments yet. Be the first to leave a note on this customer!</p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Other Tabs Empty State */}
        {activeDetailTab !== 'overview' && activeDetailTab !== 'sales' && activeDetailTab !== 'statement' && activeDetailTab !== 'comments' && (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 capitalize">{activeDetailTab}</h3>
            <p>This section is under construction.</p>
          </div>
        )}

      </div>
    </Drawer>
  );
}
