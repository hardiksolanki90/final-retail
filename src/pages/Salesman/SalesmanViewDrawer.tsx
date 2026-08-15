import { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { ChevronDown, Edit } from 'lucide-react';

interface SalesmanViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null; // using any or defining a basic type based on SalesmanData
}

export function SalesmanViewDrawer({ isOpen, onClose, data }: SalesmanViewDrawerProps) {
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

  const detailTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'sales', label: 'Sales' },
    { id: 'login-info', label: 'Login Info' },
  ];

  if (!data) return null;

  const displayName = data.name || 'Unknown';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      width="w-[80%]"
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
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 overflow-y-auto">
        {/* Detail Tabs */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6">
          <div className="flex gap-6 overflow-x-auto">
            {detailTabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveDetailTab(tab.id)}
                className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeDetailTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab Content */}
        {activeDetailTab === 'overview' && (
          <div className="flex-1 p-6">
             <div className="max-w-3xl space-y-4">
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Merchandiser Code:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.code || 'UAREDI01'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700 items-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Profile Image:</div>
                    <div className="col-span-2">
                       <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500">
                           <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                       </div>
                    </div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Name:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.name}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Merchandiser Mobile:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.mobile || ''}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Merchandiser Type:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.type || 'Merchandiser'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Merchandiser Role:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.role || 'Merchandiser'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Date Of Joining:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.dateOfJoining || '20 Mar 2025 11:18 AM'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Is Block:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.isBlock || 'No'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-100 dark:border-gray-700">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Merchandiser Supervisor:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.supervisor || 'Rodolfo Abad'}</div>
                 </div>
                 <div className="grid grid-cols-3 gap-4 py-2 border-b border-gray-900 dark:border-gray-100 border-b-2">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Status:</div>
                    <div className="col-span-2 text-sm font-medium text-gray-900 dark:text-white">{data.status || 'Active'}</div>
                 </div>
             </div>
          </div>
        )}

        {/* Sales Tab Content */}
        {activeDetailTab === 'sales' && (
          <div className="flex-1 p-6">
            <div className="space-y-4">
              <div className="font-bold text-gray-800 dark:text-gray-200 pb-2">Sales 1</div>
              <div className="font-bold text-gray-800 dark:text-gray-200 pb-2">Sales 2</div>
              <div className="font-bold text-gray-800 dark:text-gray-200 pb-2">Sales 3</div>
              <div className="font-bold text-gray-800 dark:text-gray-200 pb-2 border-b-2 border-gray-800 dark:border-gray-200">Sales 4</div>
            </div>
          </div>
        )}

        {/* Login Info Tab Content */}
        {activeDetailTab === 'login-info' && (
          <div className="flex-1 p-6">
            <div className="flex items-center gap-4 mb-6">
              <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Date</span>
              <div className="relative">
                <input 
                  type="date" 
                  defaultValue="2025-03-31" 
                  className="pl-3 pr-4 py-1.5 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
              </div>
              <button className="px-4 py-1.5 bg-primary-600 text-white text-sm rounded hover:bg-primary-700 transition-colors">
                Filter
              </button>
              <button className="px-4 py-1.5 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors">
                All
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="bg-black text-white uppercase text-xs">
                  <tr>
                    <th className="px-6 py-3">DATE</th>
                    <th className="px-6 py-3">VERSION</th>
                    <th className="px-6 py-3">DEVICE NAME</th>
                    <th className="px-6 py-3">DEVICE IMEI NUMBER</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300 font-medium whitespace-nowrap">30 Mar 2025 2:34 PM</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">2.17</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">samsungSM-A346E</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">8b0d60fdb6df89b3</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300 font-medium whitespace-nowrap">29 Mar 2025 1:35 PM</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">2.17</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">samsungSM-A346E</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">8b0d60fdb6df89b3</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300 font-medium whitespace-nowrap">28 Mar 2025 1:27 PM</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">2.17</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">samsungSM-A346E</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">8b0d60fdb6df89b3</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300 font-medium whitespace-nowrap">27 Mar 2025 7:11 AM</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">2.17</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">samsungSM-A346E</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">8b0d60fdb6df89b3</td>
                  </tr>
                  <tr className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300 font-medium whitespace-nowrap">26 Mar 2025 12:34 PM</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">2.17</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">samsungSM-A346E</td>
                    <td className="px-6 py-3 text-gray-900 dark:text-gray-300">8b0d60fdb6df89b3</td>
                  </tr>
                </tbody>
              </table>
              <div className="px-4 py-3 flex items-center justify-end border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <span>Items per page:</span>
                  <select className="border-none bg-transparent focus:ring-0 cursor-pointer">
                    <option>5</option>
                    <option>10</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 ml-6">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">
                    &lt;
                  </button>
                  <span>1 - 5 of 10</span>
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-400">
                    &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Drawer>
  );
}
