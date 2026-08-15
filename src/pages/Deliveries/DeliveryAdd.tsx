import { useCallback, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, Truck, ChevronLeft } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

type DeliveryItem = {
  id: string; itemId: string; uom: string; quantity: number; reason: string;
  price: number; excise: number; discount: number; net: number; vat: number; total: number;
};

type DeliveryFormFields = {
  deliveryType: string; customerId: string; customerLob: string; warehouse: string;
  deliveryNumber: string; deliveryDate: string; deliveryTime: string; customerNote: string;
  items: DeliveryItem[];
  grossTotal: number; discount: number; netTotal: number; excise: number; vat: number; finalTotal: number;
};

const emptyItem: DeliveryItem = {
  id: '', itemId: '', uom: '', quantity: 1, reason: '', price: 0, excise: 0, discount: 0, net: 0, vat: 0, total: 0,
};

const defaultValues: DeliveryFormFields = {
  deliveryType: 'Credit', customerId: '', customerLob: '', warehouse: '',
  deliveryNumber: '', deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTime: '', customerNote: '', items: [{ ...emptyItem, id: '1' }],
  grossTotal: 0, discount: 0, netTotal: 0, excise: 0, vat: 0, finalTotal: 0,
};

export function DeliveryAdd() {
  const data: any = {};
  const customers = (data?.customers || []) as SelectOption[];
  const customerLobs = (data?.customerLobs || []) as SelectOption[];
  const warehouses = (data?.warehouses || []) as SelectOption[];
  const items = (data?.items || []) as SelectOption[];
  const navigate = useNavigate();

  const { control, register, handleSubmit, setValue, getValues, formState: { errors } } =
    useForm<DeliveryFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const deliveryTypes: SelectOption[] = [
    { value: 'Credit', label: 'Credit' }, { value: 'Cash', label: 'Cash' },
    { value: 'Return', label: 'Return' }, { value: 'Sample', label: 'Sample' },
  ];
  const uomOpts: SelectOption[] = [
    { value: 'CT', label: 'CT' }, { value: 'PCS', label: 'PCS' },
    { value: 'KG', label: 'KG' }, { value: 'BOX', label: 'BOX' },
  ];
  const reasonOpts: SelectOption[] = [
    { value: 'damaged', label: 'Damaged' }, { value: 'expired', label: 'Expired' },
    { value: 'customer-request', label: 'Customer Request' }, { value: 'wrong-item', label: 'Wrong Item' },
  ];

  const calculateTotals = useCallback(() => {
    if (!watchedItems) return;
    let gross = 0, vat = 0, excise = 0, disc = 0;
    const currentItems = getValues('items') || [];
    watchedItems.forEach((item, index) => {
      const qty = Number(item.quantity) || 0, price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0, vatAmt = Number(item.vat) || 0;
      const exciseAmt = Number(item.excise) || 0;
      const subtotal = qty * price, net = subtotal - discount, total = net + vatAmt + exciseAmt;
      
      const newNet = parseFloat(net.toFixed(2));
      const newTotal = parseFloat(total.toFixed(2));

      if (currentItems[index]?.net !== newNet) setValue(`items.${index}.net`, newNet);
      if (currentItems[index]?.total !== newTotal) setValue(`items.${index}.total`, newTotal);
      
      gross += subtotal; vat += vatAmt; excise += exciseAmt; disc += discount;
    });
    const net = gross - disc, fin = net + vat + excise;
    
    const newGross = parseFloat(gross.toFixed(2));
    const newVat = parseFloat(vat.toFixed(2));
    const newExcise = parseFloat(excise.toFixed(2));
    const newDisc = parseFloat(disc.toFixed(2));
    const newNet = parseFloat(net.toFixed(2));
    const newFin = parseFloat(fin.toFixed(2));

    if (getValues('grossTotal') !== newGross) setValue('grossTotal', newGross);
    if (getValues('vat') !== newVat) setValue('vat', newVat);
    if (getValues('excise') !== newExcise) setValue('excise', newExcise);
    if (getValues('discount') !== newDisc) setValue('discount', newDisc);
    if (getValues('netTotal') !== newNet) setValue('netTotal', newNet);
    if (getValues('finalTotal') !== newFin) setValue('finalTotal', newFin);
  }, [watchedItems, setValue, getValues]);

  useEffect(() => { calculateTotals(); }, [calculateTotals]);

  const onSubmit = (formData: DeliveryFormFields) => { console.log(formData); navigate('/delivery'); };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const fieldClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Truck className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Delivery</h2>
        </div>
        <button onClick={() => navigate('/delivery')} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-4">
          <div className="grid grid-cols-2 gap-8 max-w-4xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Delivery Type <span className="text-red-500">*</span></label>
              <select {...register('deliveryType', { required: true })} className={fieldClass}>
                {deliveryTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div className="space-y-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer <span className="text-red-500">*</span></label>
              <select {...register('customerId', { required: 'Customer is required' })} className={fieldClass}>
                <option value="">Select Customer</option>
                {customers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
            </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer LOB <span className="text-red-500">*</span></label>
                <select {...register('customerLob', { required: true })} className={fieldClass}>
                  <option value="">Select Customer LOB</option>
                  {customerLobs.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Warehouse <span className="text-red-500">*</span></label>
                <select {...register('warehouse', { required: true })} className={fieldClass}>
                  <option value="">Select Warehouse</option>
                  {warehouses.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input label="Delivery Number" {...register('deliveryNumber')} placeholder="Auto-generated" disabled />
                <OrderCodeSettingsIcon label="Delivery Number" value="" onChange={() => {}} />
              </div>
              <Input label="Delivery Date" type="date" {...register('deliveryDate', { required: true })} required />
              <Input label="Delivery Time" type="time" {...register('deliveryTime')} />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['#','Item','UOM','Qty','Reason','Price','Excise','Discount','Net','VAT','Total','Action'].map(h => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
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
                        {uomOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-16 px-2 py-1 border rounded text-sm" min="0" /></td>
                    <td className="px-3 py-2">
                      <select {...register(`items.${index}.reason`)} className={selectClass}>
                        <option value="">Reason</option>
                        {reasonOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.price`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.excise`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.discount`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2 text-right">{(Number(watchedItems?.[index]?.net) || 0).toFixed(2)}</td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.vat`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2 text-right">{(Number(watchedItems?.[index]?.total) || 0).toFixed(2)}</td>
                    <td className="px-3 py-2">
                      <button type="button" onClick={() => fields.length > 1 && remove(index)} className="text-red-500 hover:text-red-700" disabled={fields.length === 1}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <Button type="button" onClick={() => append({ ...emptyItem, id: Date.now().toString() })} variant="primary">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="w-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              {([['Gross Total', grossTotal], ['VAT', vatTotal], ['Excise', exciseTotal], ['Net Total', netTotal], ['Discount', discountTotal]] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex justify-between"><span>{label}</span><span>AED {(Number(value) || 0).toFixed(2)}</span></div>
              ))}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>AED {(Number(finalTotal) || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 p-4 flex justify-end gap-3">
          <CancelButton onClick={() => navigate('/delivery')}>Cancel</CancelButton>
          <SaveButton type="submit">Save &amp; Submit</SaveButton>
        </div>
      </form>
    </div>
  );
}
