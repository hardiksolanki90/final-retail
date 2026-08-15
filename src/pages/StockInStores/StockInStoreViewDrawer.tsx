import { useState } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Tabs, TabPanel } from '../../components/ui/Tabs';
import { ChevronDown } from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { AssignInventoryTab } from './tabs/AssignInventoryTab';
import { ViewInventoryPostTab } from './tabs/ViewInventoryPostTab';
import { DamagedTab } from './tabs/DamagedTab';

interface StockInStoreViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedItem: { id: number; activityName: string; dateFrom: string } | null;
}

export function StockInStoreViewDrawer({ isOpen, onClose, selectedItem }: StockInStoreViewDrawerProps) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen || !selectedItem) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={selectedItem.activityName}
      width="w-[80vw]"
      headerActions={
        <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium border border-[var(--border-color)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors text-[var(--text-primary)]">
          More
          <ChevronDown className="w-4 h-4" />
        </button>
      }
    >
      <div className="flex flex-col h-full bg-[var(--bg-card)]">
        {/* We use Tabs but we want to make the navigation sticky at the top if there's scrolling */}
        <div className="border-b border-[var(--border-color)] sticky top-0 bg-[var(--bg-card)] z-10">
          <Tabs
            tabs={[
              { key: 'overview', label: 'Overview', content: null },
              { key: 'assign', label: 'Assign Inventory', content: null },
              { key: 'view-post', label: 'View Inventory Post', content: null },
              { key: 'damaged', label: 'Damaged', content: null },
            ]}
            activeKey={activeTab}
            onChange={setActiveTab}
            variant="line"
            className="px-6"
          />
        </div>

        {/* Tab Panels */}
        <div className="flex-1 overflow-y-auto w-full h-full p-6">
          <TabPanel value="overview" activeValue={activeTab}>
            <OverviewTab selectedItem={selectedItem} />
          </TabPanel>

          <TabPanel value="assign" activeValue={activeTab}>
            <AssignInventoryTab />
          </TabPanel>

          <TabPanel value="view-post" activeValue={activeTab}>
            <ViewInventoryPostTab />
          </TabPanel>

          <TabPanel value="damaged" activeValue={activeTab}>
            <DamagedTab />
          </TabPanel>
        </div>
      </div>
    </Drawer>
  );
}
