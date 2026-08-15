import { useEffect, useCallback } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, FileText, ChevronLeft } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

type DebitNoteItem = {
  id: string;
  itemId: string;
  itemName: string;
  uom: string;
  reason: string;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  excise: number;
  total: number;
};

type DebitNoteFormFields = {
  debitNoteNumber: string;
  debitNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  items: DebitNoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
};



const emptyItem: DebitNoteItem = {
  id: '',
  itemId: '',
  itemName: '',
  uom: '',
  reason: '',
  quantity: 1,
  price: 0,
  discount: 0,
  vat: 0,
  net: 0,
  excise: 0,
  total: 0,
};

const defaultValues: DebitNoteFormFields = {
  debitNoteNumber: '',
  debitNoteDate: new Date().toISOString().split('T')[0],
  customerId: '',
  invoiceId: '',
  reason: '',
  items: [{ ...emptyItem, id: '1' }],
  grossTotal: 0,
  vat: 0,
  excise: 0,
  netTotal: 0,
  discount: 0,
  finalTotal: 0,
};

export function DebitNoteAdd() {
  const data: any = {};
  const customers = (data?.customers || []) as SelectOption[];
  const invoices = (data?.invoices || []) as SelectOption[];
  const reasons = (data?.reasons || []) as SelectOption[];
  const items = (data?.items || []) as SelectOption[];
  const uomOptions = (data?.uomOptions || []) as SelectOption[];

  const navigate = useNavigate();

  const { control, register, handleSubmit, setValue, getValues, formState: { errors } } =
    useForm<DebitNoteFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const defaultReasons: SelectOption[] = reasons.length > 0 ? reasons : [
    { value: 'price-adjustment', label: 'Price Adjustment' },
    { value: 'additional-charges', label: 'Additional Charges' },
    { value: 'shipping-charges', label: 'Shipping Charges' },
    { value: 'late-payment', label: 'Late Payment Fee' },
    { value: 'other', label: 'Other' },
  ];

  const defaultUomOptions: SelectOption[] = uomOptions.length > 0 ? uomOptions : [
    { value: 'PCS', label: 'PCS' },
    { value: 'KG', label: 'KG' },
    { value: 'LTR', label: 'LTR' },
    { value: 'BOX', label: 'BOX' },
    { value: 'CTN', label: 'CTN' },
  ];

  // Auto-calculate item net/total and overall totals
  const calculateTotals = useCallback(() => {
    if (!watchedItems) return;
    let grossTotal = 0;
    let vatTotal = 0;
    let exciseTotal = 0;
    let discountTotal = 0;

    const currentItems = getValues('items') || [];

    watchedItems.forEach((item, index) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0;
      const vat = Number(item.vat) || 0;
      const excise = Number(item.excise) || 0;

      const subtotal = qty * price;
      const net = subtotal - discount;
      const total = net + vat + excise;

      const newNet = parseFloat(net.toFixed(2));
      const newTotal = parseFloat(total.toFixed(2));

      if (currentItems[index]?.net !== newNet) setValue(`items.${index}.net`, newNet);
      if (currentItems[index]?.total !== newTotal) setValue(`items.${index}.total`, newTotal);

      grossTotal += subtotal;
      vatTotal += vat;
      exciseTotal += excise;
      discountTotal += discount;
    });

    const netTotal = grossTotal - discountTotal;
    const finalTotal = netTotal + vatTotal + exciseTotal;
    
    const newGross = parseFloat(grossTotal.toFixed(2));
    const newVat = parseFloat(vatTotal.toFixed(2));
    const newExcise = parseFloat(exciseTotal.toFixed(2));
    const newDisc = parseFloat(discountTotal.toFixed(2));
    const newNet = parseFloat(netTotal.toFixed(2));
    const newFin = parseFloat(finalTotal.toFixed(2));

    if (getValues('grossTotal') !== newGross) setValue('grossTotal', newGross);
    if (getValues('vat') !== newVat) setValue('vat', newVat);
    if (getValues('excise') !== newExcise) setValue('excise', newExcise);
    if (getValues('discount') !== newDisc) setValue('discount', newDisc);
    if (getValues('netTotal') !== newNet) setValue('netTotal', newNet);
    if (getValues('finalTotal') !== newFin) setValue('finalTotal', newFin);
  }, [watchedItems, setValue, getValues]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const onSubmit = (formData: DebitNoteFormFields) => {
    console.log('Debit Note form data:', formData);
    navigate('/debit-notes');
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Debit Note</h2>
        </div>
        <button
          onClick={() => navigate('/debit-notes')}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-6">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <select
              {...register('customerId', { required: 'Customer is required' })}
              className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select Customer</option>
              {customers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Invoice <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('invoiceId', { required: 'Invoice is required' })}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Invoice</option>
                  {invoices.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.invoiceId && <p className="text-sm text-red-500 mt-1">{errors.invoiceId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('reason', { required: 'Reason is required' })}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Reason</option>
                  {defaultReasons.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Debit Note Number</label>
                  <OrderCodeSettingsIcon label="Debit Note Number" value="" onChange={() => {}} />
                </div>
                <Input
                label="Debit Note Number"
                {...register('debitNoteNumber')}
                placeholder="Auto-generated"
                disabled
              />
              </div>
              <Input
                label="Debit Note Date"
                type="date"
                {...register('debitNoteDate', { required: 'Date is required' })}
                required
              />
            </div>
          </div>

          {/* Items table */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left">#</th>
                  <th className="px-3 py-2 text-left">Item</th>
                  <th className="px-3 py-2 text-left">UOM</th>
                  <th className="px-3 py-2 text-left">Reason</th>
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Discount</th>
                  <th className="px-3 py-2 text-left">VAT</th>
                  <th className="px-3 py-2 text-left">Net</th>
                  <th className="px-3 py-2 text-left">Total</th>
                  <th className="px-3 py-2 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => (
                  <tr key={field.id} className="border-t border-gray-200 dark:border-gray-700">
                    <td className="px-3 py-2">{index + 1}</td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.itemId`)} className={selectClass}>
                        <option value="">Select Item</option>
                        {items.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.uom`)} className={selectClass}>
                        <option value="">UOM</option>
                        {defaultUomOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.reason`)} className={selectClass}>
                        <option value="">Reason</option>
                        {defaultReasons.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                        className="w-16 px-2 py-1 border rounded text-sm"
                        min="0"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.price`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.discount`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.vat`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        step="0.01"
                      />
                    </td>
                    <td className="px-3 py-2 text-right">
                      {(Number(watchedItems?.[index]?.net) || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      {(Number(watchedItems?.[index]?.total) || 0).toFixed(2)}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        className="text-red-500 hover:text-red-700"
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <Button
              type="button"
              onClick={() => append({ ...emptyItem, id: Date.now().toString() })}
              variant="primary"
            >
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              {([
                ['Gross Total', grossTotal],
                ['VAT', vatTotal],
                ['Excise', exciseTotal],
                ['Net Total', netTotal],
                ['Discount', discountTotal],
              ] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex justify-between">
                  <span>{label}</span>
                  <span>AED {(Number(value) || 0).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>AED {(Number(finalTotal) || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 p-4 flex justify-end gap-3">
          <CancelButton onClick={() => navigate('/debit-notes')}>Cancel</CancelButton>
          <SaveButton type="submit">Save &amp; Submit</SaveButton>
        </div>
      </form>
    </div>
  );
}
