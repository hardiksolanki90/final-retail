import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, ClipboardList, ChevronLeft, Settings } from 'lucide-react';

type SelectOption = {
  value: string;
  label: string;
};

type GRNItem = {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  quantity: number;
  reason: string;
  returnReason: string;
};

type GRNFormFields = {
  sourceWarehouseId: string;
  destinationWarehouseId: string;
  grnNumber: string;
  grnDate: string;
  items: GRNItem[];
  remark: string;
};

const emptyItem: GRNItem = {
  id: '',
  itemId: '',
  itemName: '',
  uom: '',
  quantity: 1,
  reason: '',
  returnReason: '',
};

const defaultValues: GRNFormFields = {
  sourceWarehouseId: '',
  destinationWarehouseId: '',
  grnNumber: '',
  grnDate: new Date().toISOString().split('T')[0],
  items: [{ ...emptyItem, id: '1' }],
  remark: '',
};

export function GRNAdd() {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [grnMode, setGrnMode] = useState<'auto' | 'manual'>('auto');
  const [grnPrefix, setGrnPrefix] = useState('');
  const [grnNumVal, setGrnNumVal] = useState('');

  // Mock data for dropdowns
  const warehouses: SelectOption[] = [
    { value: 'WH01', label: 'Main Warehouse' },
    { value: 'WH02', label: 'Secondary Warehouse' },
  ];
  
  const items: SelectOption[] = [
    { value: 'ITM-001', label: 'Apple' },
    { value: 'ITM-002', label: 'Banana' },
  ];

  const uomOptions: SelectOption[] = [
    { value: 'PC', label: 'PC' },
    { value: 'KG', label: 'KG' },
    { value: 'BOX', label: 'BOX' },
    { value: 'CTN', label: 'CTN' },
  ];

  const reasonOptions: SelectOption[] = [
    { value: 'Damaged', label: 'Damaged' },
    { value: 'Expired', label: 'Expired' },
    { value: 'Excess', label: 'Excess' },
    { value: 'Other', label: 'Other' },
  ];

  const returnReasonOptions: SelectOption[] = [
    { value: 'Quality Issue', label: 'Quality Issue' },
    { value: 'Not Ordered', label: 'Not Ordered' },
    { value: 'Other', label: 'Other' },
  ];

  const { control, register, handleSubmit, setValue, formState: { errors } } =
    useForm<GRNFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const onSubmit = (formData: GRNFormFields) => {
    console.log('GRN form data:', formData);
    navigate('/grn'); // Assuming route to GRN list is /grn
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Goods Receipt Note</h2>
        </div>
        <button
          onClick={() => navigate('/grn')}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-white dark:bg-gray-800 p-6 shadow-sm mb-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Source Warehouse
                </label>
                <select
                  {...register('sourceWarehouseId')}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {warehouses.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Destination Warehouse
                </label>
                <select
                  {...register('destinationWarehouseId')}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select</option>
                  {warehouses.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    GRN Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title="GRN Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  {...register('grnNumber')}
                  placeholder="Auto-generated"
                  disabled
                />
              </div>
              <div>
                <Input
                  label="GRN Date"
                  type="date"
                  {...register('grnDate', { required: 'Date is required' })}
                  required
                />
                {errors.grnDate && <p className="text-sm text-red-500 mt-1">{errors.grnDate.message}</p>}
              </div>
            </div>
          </div>

          {/* Items table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-x-auto mb-4">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left w-12">#</th>
                  <th className="px-3 py-2 text-left w-64">Item Code</th>
                  <th className="px-3 py-2 text-left w-64">Item Name</th>
                  <th className="px-3 py-2 text-left w-32">UOM</th>
                  <th className="px-3 py-2 text-left w-24">Qty</th>
                  <th className="px-3 py-2 text-left w-48">Reason</th>
                  <th className="px-3 py-2 text-left w-48">Return Reason</th>
                  <th className="px-3 py-2 text-center w-20">Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select 
                        {...register(`items.${index}.itemId`)} 
                        className={selectClass}
                        onChange={(e) => {
                          const selectedItem = items.find(i => i.value === e.target.value);
                          if (selectedItem) {
                            setValue(`items.${index}.itemName`, selectedItem.label);
                          } else {
                            setValue(`items.${index}.itemName`, '');
                          }
                        }}
                      >
                        <option value="">Search an item *</option>
                        {items.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                       <input
                        type="text"
                        {...register(`items.${index}.itemName`)}
                        className="w-full px-2 py-1 border rounded text-sm bg-gray-100 dark:bg-gray-800 disabled:opacity-75"
                        readOnly
                      />
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.uom`)} className={selectClass}>
                        <option value="">Select</option>
                        {uomOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-full px-2 py-1 border rounded text-sm"
                        min="1"
                      />
                    </td>
                    <td className="px-3 py-2">
                       <select {...register(`items.${index}.reason`)} className={selectClass}>
                        <option value="">Select</option>
                        {reasonOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                       <select {...register(`items.${index}.returnReason`)} className={selectClass}>
                        <option value="">Select</option>
                        {returnReasonOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2 text-center">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full border border-gray-300 hover:border-red-500 inline-flex items-center justify-center"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-start mb-6">
            <Button
              type="button"
              onClick={() => append({ ...emptyItem, id: Date.now().toString() })}
              variant="secondary"
              className="flex items-center text-sm bg-gray-100 dark:bg-gray-700"
            >
               <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>
          
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              GRN Remark
            </label>
            <textarea
              {...register('remark')}
              rows={4}
              className="w-full max-w-2xl px-3 py-2 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
            ></textarea>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 flex justify-end gap-3 sticky bottom-0 border-t border-gray-200 dark:border-gray-700 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] text-sm">
          <CancelButton onClick={() => navigate('/grn')}>Cancel</CancelButton>
          <SaveButton type="submit">Save &amp; Submit</SaveButton>
        </div>
      </form>

      {/* GRN Number Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                GRN Settings  
              </h3>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                Your GRN Numbers are set to auto generate mode to save time.
                Are you sure about changing this setting?
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="grnMode"
                    value="auto"
                    checked={grnMode === 'auto'}
                    onChange={() => setGrnMode('auto')}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Continue auto-generating GRN Number
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="grnMode"
                    value="manual"
                    checked={grnMode === 'manual'}
                    onChange={() => setGrnMode('manual')}
                    className="mt-0.5"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I will add them manually each time
                  </span>
                </label>
              </div>

              {/* Manual fields — shown only when manual mode selected */}
              {grnMode === 'manual' && (
                <div className="mt-5 flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={grnPrefix}
                      onChange={e => setGrnPrefix(e.target.value)}
                      placeholder="e.g. GRN"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={grnNumVal}
                      onChange={e => setGrnNumVal(e.target.value)}
                      placeholder="e.g. 10000"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none text-sm"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
              <button
                type="button"
                onClick={() => {
                  if (grnMode === 'manual') {
                     const combined = [grnPrefix, grnNumVal].filter(Boolean).join('-');
                     setValue('grnNumber', combined || '');
                  } else {
                     setValue('grnNumber', '');
                  }
                  setSettingsOpen(false);
                }}
                className="px-5 py-2 text-sm rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium transition-colors"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                className="px-5 py-2 text-sm rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
