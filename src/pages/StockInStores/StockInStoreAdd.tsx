import { useState, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { MultiSelect, SelectOption } from '../../components/ui/MultiSelect';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface StockInStoreAddProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddedItem = {
  id: string; // unique internal id for the grid
  itemId: string;
  itemName: string;
  itemUom: string;
  capacity: string;
};

// Dummy data for dropdowns
const CUSTOMER_OPTIONS: SelectOption[] = [
  { value: '132299', label: 'Union Co-Op-Mirdif - 132299' },
  { value: '179630', label: 'Union Co-Op(Branch)-Al Warqa - 179630' },
  { value: '100001', label: 'Lulu Hypermarket - Qusais' },
];

const ITEM_OPTIONS = [
  { value: 'itm1', label: 'Oasis LL Plain 4G1X1' },
  { value: 'itm2', label: 'Oasis Sparkling 500ml' },
  { value: 'itm3', label: 'Oasis Zero 330ml' },
];

const UOM_OPTIONS = [
  { value: 'BT', label: 'BT' },
  { value: 'CTN', label: 'CTN' },
  { value: 'PC', label: 'PC' },
];

export function StockInStoreAdd({ isOpen, onClose }: StockInStoreAddProps) {
  // Main form state
  const [activityName, setActivityName] = useState('asd');
  const [dateFrom, setDateFrom] = useState('2025-03-31');
  const [dateTo, setDateTo] = useState('2025-03-31');
  const [assignedCustomers, setAssignedCustomers] = useState<string[]>(['132299', '179630']);
  
  // Item entry state
  const [selectedItemId, setSelectedItemId] = useState('');
  const [selectedUom, setSelectedUom] = useState('');
  const [capacity, setCapacity] = useState('');

  // Items grid state
  const [addedItems, setAddedItems] = useState<AddedItem[]>([
    {
      id: '1',
      itemId: 'itm1',
      itemName: 'Oasis LL Plain 4G1X1',
      itemUom: 'BT',
      capacity: '33',
    }
  ]);

  // Validation
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (!isOpen) {
      setErrors({});
      // We keep the preset data here just to match the screenshot visually when opening
    }
  }, [isOpen]);

  const handleAddItem = () => {
    if (!selectedItemId || !selectedUom || !capacity) {
      alert('Please fill all item fields before adding.');
      return;
    }
    
    const itemOption = ITEM_OPTIONS.find((i) => i.value === selectedItemId);
    const uomOption = UOM_OPTIONS.find((i) => i.value === selectedUom);

    const newItem: AddedItem = {
      id: Math.random().toString(36).substr(2, 9),
      itemId: selectedItemId,
      itemName: itemOption?.label || '',
      itemUom: uomOption?.label || '',
      capacity: capacity,
    };

    setAddedItems([...addedItems, newItem]);
    
    // Reset item form
    setSelectedItemId('');
    setSelectedUom('');
    setCapacity('');
  };

  const handleRemoveItem = (id: string) => {
    setAddedItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSave = () => {
    const newErrors: Record<string, string> = {};
    if (!activityName) newErrors.activityName = 'Activity Name is required';
    if (!dateFrom) newErrors.dateFrom = 'Date From is required';
    if (!dateTo) newErrors.dateTo = 'Date To is required';
    if (assignedCustomers.length === 0) newErrors.assignedCustomers = 'At least one customer is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    console.log('Saving Data:', {
      activityName,
      dateFrom,
      dateTo,
      assignedCustomers,
      items: addedItems,
    });
    
    onClose();
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Add Inventory"
      width="w-[500px] md:w-[700px] lg:w-[800px]"
    >
      <div className="flex flex-col h-full">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Form Fields */}
          <div className="space-y-4">
            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <label className="text-sm text-[var(--text-secondary)]">
                Activity Name<span className="text-red-500">*</span>
              </label>
              <Input 
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                error={errors.activityName}
              />
            </div>

            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <label className="text-sm text-[var(--text-secondary)]">
                Date From<span className="text-red-500">*</span>
              </label>
              <Input 
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                error={errors.dateFrom}
              />
            </div>

            <div className="grid grid-cols-[160px_1fr] items-center gap-4">
              <label className="text-sm text-[var(--text-secondary)]">
                Date TO<span className="text-red-500">*</span>
              </label>
              <Input 
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                error={errors.dateTo}
              />
            </div>

            <div className="grid grid-cols-[160px_1fr] items-start gap-4">
              <label className="text-sm text-[var(--text-secondary)] mt-2">
                Assign Customers<span className="text-red-500">*</span>
              </label>
              <div>
                <MultiSelect
                  options={CUSTOMER_OPTIONS}
                  value={assignedCustomers}
                  onChange={setAssignedCustomers}
                  error={errors.assignedCustomers}
                />
              </div>
            </div>
          </div>

          <hr className="border-[var(--border-color)]" />

          {/* Select Item Section */}
          <div>
            <h3 className="text-sm font-medium text-[var(--text-primary)] mb-4">Select Item</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm text-[var(--text-secondary)]">Item</label>
                <Select
                  value={selectedItemId}
                  onChange={(e) => setSelectedItemId(e.target.value)}
                  options={ITEM_OPTIONS}
                  placeholder="Select Item"
                />
              </div>
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm text-[var(--text-secondary)]">Item Uom</label>
                <Select
                  value={selectedUom}
                  onChange={(e) => setSelectedUom(e.target.value)}
                  options={UOM_OPTIONS}
                  placeholder="Select UOM"
                />
              </div>
              <div className="grid grid-cols-[160px_1fr] items-center gap-4">
                <label className="text-sm text-[var(--text-secondary)]">Capacity</label>
                <Input
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="Enter capacity"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-[#20B2AA] text-white text-sm font-medium rounded-md hover:bg-[#1C9B94] transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Added Items Grid */}
          <div className="bg-[var(--bg-card)] rounded-xl border border-[var(--border-color)] overflow-hidden shadow-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] w-24">ITEM UOM</th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)]">ITEM NAME</th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] w-32">CAPACITY</th>
                  <th className="px-4 py-3 text-xs font-bold text-[var(--text-muted)] w-24 text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-color)]">
                {addedItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-center text-[var(--text-muted)] text-sm">
                      No items added yet.
                    </td>
                  </tr>
                ) : (
                  addedItems.map((item) => (
                    <tr key={item.id} className="hover:bg-[var(--bg-secondary)] transition-colors">
                      <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{item.itemUom}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{item.itemName}</td>
                      <td className="px-4 py-3 text-sm text-[var(--text-primary)]">{item.capacity}</td>
                      <td className="px-4 py-3 text-sm text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            className="text-[var(--text-secondary)] hover:text-blue-600 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            className="text-[var(--text-secondary)] hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[var(--border-color)] bg-[var(--bg-card)] flex justify-end gap-3 rounded-b-xl">
          <CancelButton onClick={onClose}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave}>
            Save
          </SaveButton>
        </div>
      </div>
    </Drawer>
  );
}
