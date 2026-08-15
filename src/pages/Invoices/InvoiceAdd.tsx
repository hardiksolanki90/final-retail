import { useCallback, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Input } from '../../components/ui/Input';
import { Button, SaveButton, CancelButton } from '../../components/ui/Button';
import { Plus, Trash2, FileText, ChevronLeft } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import type { InvoiceFormData } from '../../types/Invoice';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

type InvoiceItem = {
  id: string; itemId: string; uom: string; quantity: number;
  price: number; excise: number; discount: number; vat: number; net: number; total: number;
};

type InvoiceFormFields = {
  invoiceType: string; customerId: string; customerLob: string; salesmanId: string;
  invoiceNumber: string; invoiceDate: string; paymentTerms: string; dueDate: string;
  customerNote: string; items: InvoiceItem[];
  totalGross: number; discount: number; netTotal: number; excise: number; vat: number; finalTotal: number;
};

const emptyItem: InvoiceItem = {
  id: '', itemId: '', uom: '', quantity: 1, price: 0, excise: 0, discount: 0, vat: 0, net: 0, total: 0,
};

const defaultValues: InvoiceFormFields = {
  invoiceType: 'Credit', customerId: '', customerLob: '', salesmanId: '',
  invoiceNumber: '', invoiceDate: new Date().toISOString().split('T')[0],
  paymentTerms: '', dueDate: new Date().toISOString().split('T')[0],
  customerNote: '', items: [{ ...emptyItem, id: '1' }],
  totalGross: 0, discount: 0, netTotal: 0, excise: 0, vat: 0, finalTotal: 0,
};

export function InvoiceAdd() {
  const data: any = {};
  const onEvent: ((e: any) => void) | undefined = undefined;
  const customers = (data?.customers || []) as SelectOption[];
  const customerLobs = (data?.customerLobs || []) as SelectOption[];
  const salesmen = (data?.salesmen || []) as SelectOption[];
  const items = (data?.items || []) as SelectOption[];
  const navigate = useNavigate();

  const { control, register, handleSubmit, setValue, getValues, formState: { errors } } =
    useForm<InvoiceFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const totalGross = useWatch({ control, name: 'totalGross' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const invoiceTypes: SelectOption[] = [
    { value: 'Credit', label: 'Credit' }, { value: 'Cash', label: 'Cash' },
    { value: 'Return', label: 'Return' }, { value: 'Proforma', label: 'Proforma' },
  ];
  const paymentTermsOptions: SelectOption[] = [
    { value: 'cod', label: 'Cash on Delivery' }, { value: 'net30', label: 'Net 30 Days' },
    { value: 'net15', label: 'Net 15 Days' }, { value: 'net7', label: 'Net 7 Days' },
    { value: 'advance', label: 'Advance Payment' },
  ];
  const uomOpts: SelectOption[] = [
    { value: 'PCS', label: 'PCS' }, { value: 'KG', label: 'KG' },
    { value: 'LTR', label: 'LTR' }, { value: 'BOX', label: 'BOX' }, { value: 'CTN', label: 'CTN' },
  ];

  const calculateTotals = useCallback(() => {
    if (!watchedItems) return;
    let gross = 0, vat = 0, excise = 0, disc = 0;
    const currentItems = getValues('items') || [];
    watchedItems.forEach((item, index) => {
      const qty = Number(item.quantity) || 0, price = Number(item.price) || 0;
      const discount = Number(item.discount) || 0, vatAmt = Number(item.vat) || 0, exciseAmt = Number(item.excise) || 0;
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

    if (getValues('totalGross') !== newGross) setValue('totalGross', newGross);
    if (getValues('vat') !== newVat) setValue('vat', newVat);
    if (getValues('excise') !== newExcise) setValue('excise', newExcise);
    if (getValues('discount') !== newDisc) setValue('discount', newDisc);
    if (getValues('netTotal') !== newNet) setValue('netTotal', newNet);
    if (getValues('finalTotal') !== newFin) setValue('finalTotal', newFin);
  }, [watchedItems, setValue, getValues]);

  useEffect(() => { calculateTotals(); }, [calculateTotals]);

  const onSubmit = (formData: InvoiceFormFields) => {
    const invoiceData: InvoiceFormData = {
      orderId: '', deliveryId: '', customerId: formData.customerId,
      invoiceDate: formData.invoiceDate, dueDate: formData.dueDate,
      notes: formData.customerNote, terms: formData.paymentTerms,
      paymentMethod: '', invoiceItems: [],
    };
    if (onEvent) { onEvent({ eventType: 'InvoiceCreated', invoice: invoiceData }); }
    else { navigate('/invoice'); }
  };

  const selectClass = 'w-full px-2 py-1 border rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-primary-500';
  const fieldClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6 text-gray-900 dark:text-white" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add Invoice</h2>
        </div>
        <button onClick={() => navigate('/invoice')} className="flex items-center gap-1 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="bg-gray-200 dark:bg-gray-700 px-4 py-4">
          <div className="grid grid-cols-2 gap-8 max-w-4xl">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Type <span className="text-red-500">*</span></label>
              <select {...register('invoiceType', { required: true })} className={fieldClass}>
                {invoiceTypes.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
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
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Salesman <span className="text-red-500">*</span></label>
                <select {...register('salesmanId', { required: true })} className={fieldClass}>
                  <option value="">Select Salesman</option>
                  {salesmen.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Terms <span className="text-red-500">*</span></label>
                <select {...register('paymentTerms', { required: true })} className={fieldClass}>
                  <option value="">Select Payment Terms</option>
                  {paymentTermsOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Input label="Invoice Number" {...register('invoiceNumber')} placeholder="Auto-generated" disabled />
                <OrderCodeSettingsIcon label="Invoice Number" value="" onChange={() => {}} />
              </div>
              <Input label="Invoice Date" type="date" {...register('invoiceDate', { required: true })} required />
              <Input label="Due Date" type="date" {...register('dueDate', { required: true })} required />
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden mb-4">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['#','Item','UOM','Qty','Price','Excise','Discount','VAT','Net','Total','Action'].map(h => (
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
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.price`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.excise`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.discount`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2"><input type="number" {...register(`items.${index}.vat`, { valueAsNumber: true })} className="w-20 px-2 py-1 border rounded text-sm" step="0.01" /></td>
                    <td className="px-3 py-2 text-right">{(Number(watchedItems?.[index]?.net) || 0).toFixed(2)}</td>
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
              {([['Gross Total', totalGross], ['VAT', vatTotal], ['Excise', exciseTotal], ['Net Total', netTotal], ['Discount', discountTotal]] as [string, number][]).map(([label, value]) => (
                <div key={label} className="flex justify-between"><span>{label}</span><span>AED {(Number(value) || 0).toFixed(2)}</span></div>
              ))}
              <div className="border-t border-gray-300 dark:border-gray-600 pt-2 mt-2">
                <div className="flex justify-between font-bold text-lg"><span>Total</span><span>AED {(Number(finalTotal) || 0).toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 p-4 flex justify-end gap-3">
          <CancelButton onClick={() => navigate('/invoice')}>Cancel</CancelButton>
          <SaveButton type="submit">Save &amp; Submit</SaveButton>
        </div>
      </form>
    </div>
  );
}
