import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, ShoppingCart, ChevronLeft, Settings } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';

type OrderItem = {
  id: string;
  itemId: string;
  uom: string;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  excise: number;
  total: number;
};

type OrderFormFields = {
  orderType: string;
  customerId: string;
  salesmanId: string;
  orderNumber: string;
  deliveryDate: string;
  paymentTerms: string;
  dueDate: string;
  notes: string;
  items: OrderItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
};

const emptyItem: OrderItem = {
  id: '',
  itemId: '',
  uom: '',
  quantity: 1,
  price: 0,
  discount: 0,
  vat: 0,
  net: 0,
  excise: 0,
  total: 0,
};

const defaultValues: OrderFormFields = {
  orderType: 'Cash',
  customerId: '',
  salesmanId: '',
  orderNumber: '',
  deliveryDate: new Date().toISOString().split('T')[0],
  paymentTerms: '',
  dueDate: new Date().toISOString().split('T')[0],
  notes: '',
  items: [{ ...emptyItem, id: '1' }],
  grossTotal: 0,
  vat: 0,
  excise: 0,
  netTotal: 0,
  discount: 0,
  finalTotal: 0,
};

export function OrderAdd() {
  const data: any = {};
  const customers = (data?.customers || []) as SelectOption[];
  const salesmen = (data?.salesmen || []) as SelectOption[];
  const items = (data?.items || []) as SelectOption[];
  const uomOptions = (data?.uomOptions || []) as SelectOption[];

  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [orderPrefix, setOrderPrefix] = useState('');
  const [orderNum, setOrderNum] = useState('');
  const [orderMode, setOrderMode] = useState<'auto' | 'manual'>('auto');

  const { control, register, handleSubmit, setValue, getValues, formState: { errors } } =
    useForm<OrderFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const defaultUomOptions: SelectOption[] = uomOptions.length > 0 ? uomOptions : [
    { value: 'PC', label: 'PC' },
    { value: 'KG', label: 'KG' },
    { value: 'LTR', label: 'LTR' },
    { value: 'BOX', label: 'BOX' },
    { value: 'CTN', label: 'CTN' },
  ];

  const orderTypeOptions: SelectOption[] = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit', label: 'Credit' },
    { value: 'Return', label: 'Return' },
    { value: 'Depot', label: 'Depot' },
  ];

  const paymentTermsOptions: SelectOption[] = [
    { value: '30 Days from Invoice PDC', label: '30 Days from Invoice PDC' },
    { value: 'Net 15 days', label: 'Net 15 days' },
    { value: 'Net 30 Days', label: 'Net 30 Days' },
    { value: 'Cash on Delivery', label: 'Cash on Delivery' },
    { value: 'Advance Payment', label: 'Advance Payment' },
  ];

  const calculateTotals = useCallback(() => {
    if (!watchedItems) return;
    let grossTotal = 0, vatTotal = 0, exciseTotal = 0, discountTotal = 0;

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

      if (currentItems[index]?.net !== newNet) {
        setValue(`items.${index}.net`, newNet);
      }
      if (currentItems[index]?.total !== newTotal) {
        setValue(`items.${index}.total`, newTotal);
      }

      grossTotal += subtotal;
      vatTotal += vat;
      exciseTotal += excise;
      discountTotal += discount;
    });

    const netTotal = grossTotal - discountTotal;
    const finalTotal = netTotal + vatTotal + exciseTotal;

    const newGrossTotal = parseFloat(grossTotal.toFixed(2));
    const newVat = parseFloat(vatTotal.toFixed(2));
    const newExcise = parseFloat(exciseTotal.toFixed(2));
    const newDiscount = parseFloat(discountTotal.toFixed(2));
    const newNetTotal = parseFloat(netTotal.toFixed(2));
    const newFinalTotal = parseFloat(finalTotal.toFixed(2));

    if (getValues('grossTotal') !== newGrossTotal) setValue('grossTotal', newGrossTotal);
    if (getValues('vat') !== newVat) setValue('vat', newVat);
    if (getValues('excise') !== newExcise) setValue('excise', newExcise);
    if (getValues('discount') !== newDiscount) setValue('discount', newDiscount);
    if (getValues('netTotal') !== newNetTotal) setValue('netTotal', newNetTotal);
    if (getValues('finalTotal') !== newFinalTotal) setValue('finalTotal', newFinalTotal);
  }, [watchedItems, setValue, getValues]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const onSubmit = (formData: OrderFormFields) => {
    console.log('Order form data:', formData);
    navigate('/order');
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Order</h2>
        </div>
        <button
          onClick={() => navigate('/order')}
          className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Order Type header */}
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-4">
          <div className="grid grid-cols-2 gap-8 max-w-4xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order Type <span className="text-red-500">*</span>
              </label>
              <select
                {...register('orderType', { required: 'Order Type is required' })}
                className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                {orderTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.orderType && <p className="text-sm text-red-500 mt-1">{errors.orderType.message}</p>}
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Salesman
                </label>
                <select
                  {...register('salesmanId')}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Salesman</option>
                  {salesmen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Payment Terms <span className="text-red-500">*</span>
                </label>
                <select
                  {...register('paymentTerms', { required: 'Payment Terms is required' })}
                  className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select Payment Terms</option>
                  {paymentTermsOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.paymentTerms && <p className="text-sm text-red-500 mt-1">{errors.paymentTerms.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Order Number
                  </label>
                  <button
                    type="button"
                    onClick={() => setSettingsOpen(true)}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    title="order Code"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                </div>
                <Input
                  {...register('orderNumber')}
                  placeholder="Auto-generated"
                  disabled
                />
              </div>
              <Input
                label="Delivery Date"
                type="date"
                {...register('deliveryDate', { required: 'Date is required' })}
                required
              />
              <Input
                label="Due Date"
                type="date"
                {...register('dueDate')}
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
                  <th className="px-3 py-2 text-left">Qty</th>
                  <th className="px-3 py-2 text-left">Price</th>
                  <th className="px-3 py-2 text-left">Discount</th>
                  <th className="px-3 py-2 text-left">VAT</th>
                  <th className="px-3 py-2 text-left">Net</th>
                  <th className="px-3 py-2 text-left">Excise</th>
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
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        {...register(`items.${index}.excise`, { valueAsNumber: true })}
                        className="w-20 px-2 py-1 border rounded text-sm"
                        step="0.01"
                      />
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
          <CancelButton onClick={() => navigate('/order')}>Cancel</CancelButton>
          <SaveButton type="submit">Save &amp; Submit</SaveButton>
        </div>
      </form>

      {/* Order Number Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSettingsOpen(false)} />
          <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Order Code  
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
                Your Order Number are set on auto generate mode to save your time.
                Are you sure about changing this setting?
              </p>

              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="orderMode"
                    value="auto"
                    checked={orderMode === 'auto'}
                    onChange={() => setOrderMode('auto')}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Continue auto-generating Order Number
                  </span>
                </label>
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="orderMode"
                    value="manual"
                    checked={orderMode === 'manual'}
                    onChange={() => setOrderMode('manual')}
                    className="mt-0.5 accent-primary-600"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I will add them manually each time
                  </span>
                </label>
              </div>

              {/* Manual fields — shown only when manual mode selected */}
              {orderMode === 'manual' && (
                <div className="mt-5 flex gap-3 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Prefix
                    </label>
                    <input
                      type="text"
                      value={orderPrefix}
                      onChange={e => setOrderPrefix(e.target.value)}
                      placeholder="e.g. ORD"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number
                    </label>
                    <input
                      type="text"
                      value={orderNum}
                      onChange={e => setOrderNum(e.target.value)}
                      placeholder="e.g. 10000"
                      className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
                  if (orderMode === 'manual') {
                    const combined = [orderPrefix, orderNum].filter(Boolean).join('-');
                    setValue('orderNumber', combined || '');
                  } else {
                    setValue('orderNumber', '');
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
