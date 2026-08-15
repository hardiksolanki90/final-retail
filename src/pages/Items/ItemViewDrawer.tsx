import { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { ChevronDown, Edit, MessageSquare } from 'lucide-react';

interface ItemViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null; // using any since type Item from List is limited currently
}

export function ItemViewDrawer({ isOpen, onClose, data }: ItemViewDrawerProps) {
  const [activeTab, setActiveTab] = useState('general');
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

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'catalog', label: 'Product Catalog' },
    { id: 'uom', label: 'UOM' },
    { id: 'custom-fields', label: 'Custom Fields' },
    { id: 'comments', label: 'Comments' },
  ];

  if (!data) return null;

  const displayName = data.name || 'Unknown Item';

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
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">

        {/* Tabs Row */}
        <div className="px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto">
          
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="p-8 max-w-4xl">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                
                {/* Left Column Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Item code</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.code || '—'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item name</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.name || '—'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item barcode</div>
                    <div className="font-semibold text-gray-900 dark:text-white">—</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item description</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.name || '—'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item Lob</div>
                    <div className="font-semibold text-gray-900 dark:text-white">—</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item Weight</div>
                    <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item Shelf life</div>
                    <div className="font-semibold text-gray-900 dark:text-white">—</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Item Group</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Group1</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Category</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.category || '—'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Brand</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.brand || '—'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Volume</div>
                    <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Tax status</div>
                    <div className="font-semibold text-gray-900 dark:text-white">Tax applicable</div>
                  </div>
                </div>

                {/* Right Column: Base UOM */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Base UOM</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Base UOM</div>
                    <div className="font-semibold text-gray-900 dark:text-white">PC</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Base UPC</div>
                    <div className="font-semibold text-gray-900 dark:text-white">1</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Base Price</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.price ? data.price.toFixed(2) : '0.00'}</div>
                    
                    <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                    <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* UOM Tab */}
          {activeTab === 'uom' && (
            <div className="p-8 max-w-4xl">
              <div className="space-y-8">
                
                {/* Secondary UOMs Block 1 */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    Secondary UOMs
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">2</span>
                  </h3>
                  <div className="grid grid-cols-2 col-span-2 gap-12 text-sm pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-500 dark:text-gray-400">Item UOM</div>
                      <div className="font-semibold text-gray-900 dark:text-white">OT</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Item UPC</div>
                      <div className="font-semibold text-gray-900 dark:text-white">6</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Item Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                    </div>
                  </div>
                </div>

                {/* Secondary UOMs Block 2 */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    Secondary UOMs
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">3</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-12 text-sm pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-500 dark:text-gray-400">Item UOM</div>
                      <div className="font-semibold text-gray-900 dark:text-white">CT</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Item UPC</div>
                      <div className="font-semibold text-gray-900 dark:text-white">24</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Item Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                      
                      <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">0.00</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Comments Tab Content */}
          {activeTab === 'comments' && (
            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 min-h-full">
              <div className="max-w-3xl mx-auto space-y-6">
                
                {/* Add Comment Box */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Add a Note</h3>
                  <textarea 
                    rows={3} 
                    className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 mb-3"
                    placeholder="Enter your comment or note about this item here..."
                  ></textarea>
                  <div className="flex justify-end">
                    <button className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors">
                      Post Comment
                    </button>
                  </div>
                </div>

                {/* Comments List Empty State */}
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-6 border-b border-gray-100 dark:border-gray-700 pb-2">Recent Comments</h3>
                  
                  <div className="flex flex-col items-center justify-center py-8 text-gray-500 text-sm">
                    <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-3" />
                    <p>No comments yet. Be the first to leave a note on this item!</p>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Other Tabs Empty State */}
          {(activeTab === 'catalog' || activeTab === 'custom-fields') && (
            <div className="flex flex-col items-center justify-center p-16 text-gray-500">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2 capitalize">{tabs.find(t => t.id === activeTab)?.label}</h3>
              <p>This section is currently under construction.</p>
            </div>
          )}

        </div>

      </div>
    </Drawer>
  );
}
