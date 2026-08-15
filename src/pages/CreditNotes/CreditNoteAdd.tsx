import { useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, FileText, ChevronLeft } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import type { CreditNoteFormData, CreditNoteItem } from '../../types/CreditNote';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

const initialItem: CreditNoteItem = {
  id: '', itemId: '', itemName: '', uom: '', reason: '',
  quantity: 1, price: 0, discount: 0, vat: 0, net: 0, excise: 0, total: 0,
};

const initialFormData: CreditNoteFormData = {
  creditNoteNumber: '', creditNoteDate: new Date().toISOString().split('T')[0],
  customerId: '', invoiceId: '', reason: '',
  items: [{ ...initialItem, id: '1' }],
  grossTotal: 0, vat: 0, excise: 0, netTotal: 0, discount: 0, finalTotal: 0,
};

export function CreditNoteAdd() {
  const data: any = {};
  let onEvent: ((e: any) => void) | undefined = undefined;
  const initialData = data?.initialData;
  const customers = (data?.customers || []) as SelectOption[];
  const invoices = (data?.invoices || []) as SelectOption[];
  const reasons = (data?.reasons || []) as SelectOption[];
  const items = (data?.items || []) as SelectOption[];
  const uomOptions = (data?.uomOptions || []) as SelectOption[];
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, control, setValue, getValues, setError } =
    useForm<CreditNoteFormData>({ defaultValues: initialFormData });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const watchedTotals = useWatch({ control, name: ['grossTotal', 'vat', 'excise', 'netTotal', 'discount', 'finalTotal'] });

  const defaultReasons: SelectOption[] = reasons.length > 0 ? reasons : [
    { value: 'damaged', label: 'Damaged Product' },
    { value: 'wrong-delivery', label: 'Wrong Delivery' },
    { value: 'quality-issue', label: 'Quality Issue' },
    { value: 'expired', label: 'Expired Product' },
    { value: 'customer-return', label: 'Customer Return' },
  ];

  const defaultUomOptions: SelectOption[] = uomOptions.length > 0 ? uomOptions : [
    { value: 'PCS', label: 'PCS' }, { value: 'KG', label: 'KG' },
    { value: 'LTR', label: 'LTR' }, { value: 'BOX', label: 'BOX' }, { value: 'CTN', label: 'CTN' },
  ];

  useEffect(() => {
    if (initialData) reset(initialData);
    else reset(initialFormData);
  }, [initialData, reset]);

  useEffect(() => {
    if (!watchedItems) return;
    let grossTotal = 0, vat = 0, excise = 0, discount = 0;
    watchedItems.forEach((item: CreditNoteItem) => {
      grossTotal += (item.quantity || 0) * (item.price || 0);
      vat += item.vat || 0;
      excise += item.excise || 0;
      discount += item.discount || 0;
    });
    const netTotal = grossTotal - discount;
    const finalTotal = netTotal + vat + excise;
    
    if (getValues('grossTotal') !== grossTotal) setValue('grossTotal', grossTotal);
    if (getValues('vat') !== vat) setValue('vat', vat);
    if (getValues('excise') !== excise) setValue('excise', excise);
    if (getValues('discount') !== discount) setValue('discount', discount);
    if (getValues('netTotal') !== netTotal) setValue('netTotal', netTotal);
    if (getValues('finalTotal') !== finalTotal) setValue('finalTotal', finalTotal);
  }, [watchedItems, setValue, getValues]);

  const [grossTotal, vat, excise, netTotal, discount, finalTotal] = watchedTotals;

  const onFormSubmit = async (formData: CreditNoteFormData) => {
    try {
      if (onEvent) {
        onEvent({ eventType: initialData ? 'CreditNoteUpdated' : 'CreditNoteCreated', creditNote: formData });
      } else {
        navigate('/credit-note');
      }
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving credit note' });
    }
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const fieldClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {initialData ? 'Edit Credit Note' : 'Add Credit Note'}
          </h2>
        </div>
        <button onClick={() => navigate('/credit-note')} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form id="creditnote-form" onSubmit={handleSubmit(onFormSubmit)}>
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3">
            <strong>Error:</strong> {errors.root.message}
          </div>
        )}

        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Customer <span className="text-red-500">*</span></label>
            <select {...register('customerId', { required: 'Customer is required' })} className={fieldClass}>
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice <span className="text-red-500">*</span></label>
                <select {...register('invoiceId', { required: 'Invoice is required' })} className={fieldClass}>
                  <option value="">Select Invoice</option>
                  {invoices.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.invoiceId && <p className="text-sm text-red-500 mt-1">{errors.invoiceId.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason <span className="text-red-500">*</span></label>
                <select {...register('reason', { required: 'Reason is required' })} className={fieldClass}>
                  <option value="">Select Reason</option>
                  {defaultReasons.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                {errors.reason && <p className="text-sm text-red-500 mt-1">{errors.reason.message}</p>}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Credit Note Number</label>
                  <OrderCodeSettingsIcon label="Credit Note Number" value="" onChange={() => {}} />
                </div>
                <Input label="Credit Note Number" {...register('creditNoteNumber')} placeholder="Auto-generated" disabled />
              </div>
              <Input label="Credit Note Date" type="date" {...register('creditNoteDate', { required: 'Date is required' })} required />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['#','Item','UOM','Reason','Qty','Price','Discount','VAT','Net','Total','Action'].map(h => (
                    <th key={h} className="px-3 py-2 text-left">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fields.map((field, index) => {
                  const item = watchedItems?.[index];
                  const net = ((item?.quantity || 0) * (item?.price || 0)) - (item?.discount || 0);
                  const total = net + (item?.vat || 0) + (item?.excise || 0);
                  return (
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
                      <td className="px-3 py-2"><input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-16 px-2 py-1 border rounded text-sm" min="0" /></td>
                      <td className="px-3 py-2"><input type="number" {...register(`items.${index}.price`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                      <td className="px-3 py-2"><input type="number" {...register(`items.${index}.discount`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                      <td className="px-3 py-2"><input type="number" {...register(`items.${index}.vat`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                      <td className="px-3 py-2 text-right">{net.toFixed(2)}</td>
                      <td className="px-3 py-2 text-right">{total.toFixed(2)}</td>
                      <td className="px-3 py-2">
                        <button type="button" onClick={() => fields.length > 1 && remove(index)} className="text-red-500 hover:text-red-700" disabled={fields.length === 1}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex justify-end mb-6">
            <Button type="button" onClick={() => append({ ...initialItem, id: Date.now().toString() })} variant="primary">
              <Plus className="w-4 h-4 mr-1" /> Add Item
            </Button>
          </div>

          <div className="flex justify-end">
            <div className="w-80 bg-gray-50 dark:bg-gray-700 p-4 rounded-lg space-y-2">
              {([['Gross Total', grossTotal], ['VAT', vat], ['Excise', excise], ['Net Total', netTotal], ['Discount', discount]] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex justify-between"><span>{label}</span><span>AED {(Number(value) || 0).toFixed(2)}</span></div>
              ))}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>AED {(Number(finalTotal) || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 p-4 flex justify-end gap-3">
          <CancelButton onClick={() => navigate('/credit-note')} disabled={isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : initialData ? 'Update Credit Note' : 'Save & Submit'}
          </SaveButton>
        </div>
      </form>
    </div>
  );
}