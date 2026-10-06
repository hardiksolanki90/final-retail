import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { FileText } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import {
  AddLineButton,
  CodeField,
  ControlledDate,
  ControlledSelect,
  DocSection,
  DocumentShell,
  LineCell,
  LineFigure,
  LineHeader,
  QtyStepper,
  LineStrip,
  LineUomCell,
  ReceiptRail,
  SectionPair,
  TaxNotice,
  TypeSwitch,
  fieldGridCls,
  wideCellCls,
} from '../shared/DocumentForm';
import { documentTypeId } from '../../constants/documentTypes';
import { lineCols } from '../shared/DocumentForm/lineCols';
import { LineItemSelect } from '../shared/DocumentForm/LineItemSelect';
import { useKnownItems } from '../../hooks/useKnownItems';
import { PdpDiscountCell, PdpPriceCell } from '../shared/DocumentForm/PdpLineCells';
import { usePdpLinePreview } from '../../hooks/usePdpLinePreview';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
import { useCreateDocument, useDocumentFormOptions } from '../../hooks/useDocumentForm';
import { useMoney } from '../../hooks/Currency/useMoney';
import { computeLine, sumLines } from '../../utils/documentMath';
import { useLineTaxRates } from '../../hooks/Tax/useLineTaxRates';

type InvoiceItem = { id: string; itemId: string; uom: string; quantity: number; price: number; excise: number; discount: number; vat: number; net: number; total: number };

type InvoiceFormFields = {
  invoiceType: string;
  customerId: string;
  salesmanId: string;
  invoiceNumber: string;
  invoiceDate: string;
  paymentTerms: string;
  dueDate: string;
  customerNote: string;
  items: InvoiceItem[];
  totalGross: number;
  discount: number;
  netTotal: number;
  excise: number;
  vat: number;
  finalTotal: number;
};

const emptyItem: InvoiceItem = { id: '', itemId: '', uom: '', quantity: 1, price: 0, excise: 0, discount: 0, vat: 0, net: 0, total: 0 };

const defaultValues: InvoiceFormFields = {
  invoiceType: 'Credit',
  customerId: '',
  salesmanId: '',
  invoiceNumber: '',
  invoiceDate: new Date().toISOString().split('T')[0],
  paymentTerms: '',
  dueDate: new Date().toISOString().split('T')[0],
  customerNote: '',
  items: [{ ...emptyItem, id: '1' }],
  totalGross: 0,
  discount: 0,
  netTotal: 0,
  excise: 0,
  vat: 0,
  finalTotal: 0,
};

export function InvoiceAdd() {
  const { customers, salesmen: salesman, paymentTerms } = useDocumentFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const createInvoice = useCreateDocument('invoice', 'Invoice');
  const navigate = useNavigate();
  const [codeLocked, setCodeLocked] = useState(false);

  const { control, register, handleSubmit, setValue, getValues, watch } = useForm<InvoiceFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const totalGross = useWatch({ control, name: 'totalGross' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const invoiceTypes: SelectOption[] = [
    { value: 'Credit', label: 'Credit' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Return', label: 'Return' },
    { value: 'Proforma', label: 'Proforma' },
  ];

  const customerId = useWatch({ control, name: 'customerId' });
  const resolutions = usePdpLinePreview({ customerId, fields, watchedItems, setLine: (index, key, value) => setValue(`items.${index}.${key}`, value) });

  const { digits } = useMoney();
  const taxRates = useLineTaxRates(
    (watchedItems ?? []).map((item) => item?.itemId),
    customerId
  );
  const calculateTotals = useCallback(() => {
    if (!watchedItems) return;
    const currentItems = getValues('items') || [];
    const lines = watchedItems.map((item) => computeLine(item, digits, taxRates.forItem(item?.itemId)));

    lines.forEach((line, index) => {
      if (currentItems[index]?.net !== line.net) setValue(`items.${index}.net`, line.net);
      if (currentItems[index]?.total !== line.total) setValue(`items.${index}.total`, line.total);
      if (currentItems[index]?.vat !== line.tax) setValue(`items.${index}.vat`, line.tax);
      if (currentItems[index]?.excise !== line.excise) setValue(`items.${index}.excise`, line.excise);
    });

    const totals = sumLines(lines, digits);
    if (getValues('totalGross') !== totals.gross) setValue('totalGross', totals.gross);
    if (getValues('vat') !== totals.tax) setValue('vat', totals.tax);
    if (getValues('excise') !== totals.excise) setValue('excise', totals.excise);
    if (getValues('discount') !== totals.discount) setValue('discount', totals.discount);
    if (getValues('netTotal') !== totals.net) setValue('netTotal', totals.net);
    if (getValues('finalTotal') !== totals.total) setValue('finalTotal', totals.total);
  }, [watchedItems, setValue, getValues, digits, taxRates]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const onSubmit = async (formData: InvoiceFormFields) => {
    try {
      const invoiceNumber = await reserveCodeIfAuto('invoice', formData.invoiceNumber);
      if (invoiceNumber !== formData.invoiceNumber) {
        setValue('invoiceNumber', invoiceNumber ?? '');
        setCodeLocked(true);
      }

      await createInvoice.mutateAsync({
        customerId: formData.customerId,
        salesmanId: formData.salesmanId || undefined,
        orderTypeId: documentTypeId(formData.invoiceType),
        paymentTermId: formData.paymentTerms || undefined,
        invoiceNumber: invoiceNumber || undefined,
        invoiceDate: formData.invoiceDate || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.customerNote || undefined,
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({ itemId: item.itemId, itemUomId: item.uom || undefined, quantity: Number(item.quantity) || 0, price: Number(item.price) || 0, discount: Number(item.discount) || 0 })),
      });
      navigate('/invoice');
    } catch {
      // toast already shown by useCreateDocument's onError
    }
  };

  const cols = lineCols({ reason: false, excise: taxRates.hasExcise });

  return (
    <DocumentShell icon={FileText} eyebrow="Field Sales · New" title="Add Invoice" onBack={() => navigate('/invoice')} onSubmit={handleSubmit(onSubmit)}>
      <DocSection index={1} title="Invoice Type" aside={<TypeSwitch label="Invoice Type" options={invoiceTypes} registration={register('invoiceType', { required: true })} />} />

      <SectionPair>
        <DocSection index={2} title="Customer">
          <div className={fieldGridCls}>
            <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customers} placeholder="Select Customer" />
            <ControlledSelect control={control} name="salesmanId" rules={{ required: true }} label="Salesman" options={salesman} placeholder="Select Salesman" />
          </div>
        </DocSection>

        <DocSection index={3} title="Document">
          <div className={fieldGridCls}>
            <CodeField
              label="Invoice Number"
              registration={register('invoiceNumber')}
              disabled={codeLocked}
              action={
                <OrderCodeSettingsIcon label="Invoice Number" entityKey="invoice" value={watch('invoiceNumber') || ''} onChange={(v) => setValue('invoiceNumber', v)} onLockChange={setCodeLocked} />
              }
            />
            <ControlledSelect control={control} name="paymentTerms" rules={{ required: true }} label="Payment Terms" options={paymentTerms} placeholder="Select Payment Terms" />
            <ControlledDate control={control} name="invoiceDate" rules={{ required: true }} label="Invoice Date" />
            <ControlledDate control={control} name="dueDate" rules={{ required: true }} label="Due Date" />
          </div>
        </DocSection>
      </SectionPair>

      <TaxNotice supported={taxRates.supported} country={taxRates.country} taxCode={taxRates.taxCode} missingRate={taxRates.missingRate} regionAssumed={taxRates.regionAssumed} />

      <DocSection index={4} title="Items" flush>
        <LineHeader cols={cols} labels={['Item', 'UOM', 'Qty', 'Price', 'Discount', 'Net', ...(taxRates.hasExcise ? ['Excise'] : []), taxRates.taxCode, 'Total']} numericLabels={[taxRates.taxCode]} />
        {fields.map((field, index) => (
          <LineStrip key={field.id} index={index} cols={cols} onRemove={() => fields.length > 1 && remove(index)} canRemove={fields.length > 1}>
            <LineCell label="Item" className={wideCellCls}>
              <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} disabled={!customerId} />
            </LineCell>
            <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} />
            <LineCell label="Qty">
              <QtyStepper aria-label={`Line ${index + 1} quantity`} {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
            </LineCell>
            <PdpPriceCell resolution={resolutions[field.id]} aria-label={`Line ${index + 1} price`} {...register(`items.${index}.price`, { valueAsNumber: true })} />
            <PdpDiscountCell resolution={resolutions[field.id]} aria-label={`Line ${index + 1} discount`} {...register(`items.${index}.discount`, { valueAsNumber: true })} />
            <LineCell label="Net">
              <LineFigure value={Number(watchedItems?.[index]?.net) || 0} />
            </LineCell>
            {taxRates.hasExcise && (
              <LineCell label="Excise">
                <LineFigure value={Number(watchedItems?.[index]?.excise) || 0} />
              </LineCell>
            )}
            <LineCell label={taxRates.taxCode}>
              <LineFigure value={Number(watchedItems?.[index]?.vat) || 0} />
            </LineCell>
            <LineCell label="Total">
              <LineFigure value={Number(watchedItems?.[index]?.total) || 0} strong />
            </LineCell>
          </LineStrip>
        ))}
        <AddLineButton onClick={() => append({ ...emptyItem, id: Date.now().toString() })} disabled={!customerId} disabledHint="Select a customer first" />
      </DocSection>

      <ReceiptRail
        gross={totalGross}
        discount={discountTotal}
        net={netTotal}
        vat={vatTotal}
        excise={exciseTotal}
        taxLabel={taxRates.taxCode}
        taxRate={taxRates.uniformRate}
        taxRows={taxRates.taxRows(watchedItems ?? [], digits)}
        showExcise={taxRates.hasExcise}
        total={finalTotal}
        lineCount={fields.length}
        noteRegister={register('customerNote')}
      >
        <SaveButton type="submit" fullWidth>
          Save &amp; Submit
        </SaveButton>
        <CancelButton type="button" fullWidth onClick={() => navigate('/invoice')}>
          Cancel
        </CancelButton>
      </ReceiptRail>
    </DocumentShell>
  );
}
