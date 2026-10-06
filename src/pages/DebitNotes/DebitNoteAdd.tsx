import { useEffect, useCallback, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { FileText } from 'lucide-react';
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
  fieldGridCls,
  wideCellCls,
} from '../shared/DocumentForm';
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
  notes: string;
  items: DebitNoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
};

const emptyItem: DebitNoteItem = { id: '', itemId: '', itemName: '', uom: '', reason: '', quantity: 1, price: 0, discount: 0, vat: 0, net: 0, excise: 0, total: 0 };

const defaultValues: DebitNoteFormFields = {
  debitNoteNumber: '',
  debitNoteDate: new Date().toISOString().split('T')[0],
  customerId: '',
  invoiceId: '',
  reason: '',
  notes: '',
  items: [{ ...emptyItem, id: '1' }],
  grossTotal: 0,
  vat: 0,
  excise: 0,
  netTotal: 0,
  discount: 0,
  finalTotal: 0,
};

export function DebitNoteAdd() {
  const { customers, invoices, reasons: reasonTypes } = useDocumentFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const createDebitNote = useCreateDocument('debit-note', 'Debit note');
  // debit_notes.reason is free text, not an FK — store the reason's name.
  const reasons = reasonTypes.map((r) => ({ value: r.label, label: r.label }));

  const navigate = useNavigate();
  const [codeLocked, setCodeLocked] = useState(false);

  const { control, register, handleSubmit, setValue, getValues, watch } = useForm<DebitNoteFormFields>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  // Auto-calculate item net/total and overall totals
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
    if (getValues('grossTotal') !== totals.gross) setValue('grossTotal', totals.gross);
    if (getValues('vat') !== totals.tax) setValue('vat', totals.tax);
    if (getValues('excise') !== totals.excise) setValue('excise', totals.excise);
    if (getValues('discount') !== totals.discount) setValue('discount', totals.discount);
    if (getValues('netTotal') !== totals.net) setValue('netTotal', totals.net);
    if (getValues('finalTotal') !== totals.total) setValue('finalTotal', totals.total);
  }, [watchedItems, setValue, getValues, digits, taxRates]);

  useEffect(() => {
    calculateTotals();
  }, [calculateTotals]);

  const onSubmit = async (formData: DebitNoteFormFields) => {
    try {
      const debitNoteNumber = await reserveCodeIfAuto('debit_note', formData.debitNoteNumber);
      if (debitNoteNumber !== formData.debitNoteNumber) {
        setValue('debitNoteNumber', debitNoteNumber ?? '');
        setCodeLocked(true);
      }

      await createDebitNote.mutateAsync({
        customerId: formData.customerId,
        invoiceId: formData.invoiceId || undefined,
        debitNoteNumber: debitNoteNumber || undefined,
        debitNoteDate: formData.debitNoteDate || undefined,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({
            itemId: item.itemId,
            itemUomId: item.uom || undefined,
            reason: item.reason || undefined,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
          })),
      });
      navigate('/debit-notes');
    } catch {
      // toast already shown by useCreateDocument's onError
    }
  };

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell icon={FileText} eyebrow="Field Sales · New" title="Add Debit Note" onBack={() => navigate('/debit-notes')} onSubmit={handleSubmit(onSubmit)}>
      <SectionPair>
        <DocSection index={1} title="Reference">
          <div className={fieldGridCls}>
            <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customers} placeholder="Select Customer" />
            <ControlledSelect control={control} name="invoiceId" rules={{ required: 'Invoice is required' }} label="Invoice" options={invoices} placeholder="Select Invoice" />
          </div>
        </DocSection>

        <DocSection index={2} title="Document">
          <div className={fieldGridCls}>
            <CodeField
              label="Debit Note Number"
              registration={register('debitNoteNumber')}
              disabled={codeLocked}
              action={
                <OrderCodeSettingsIcon
                  label="Debit Note Number"
                  entityKey="debit_note"
                  value={watch('debitNoteNumber') || ''}
                  onChange={(v) => setValue('debitNoteNumber', v)}
                  onLockChange={setCodeLocked}
                />
              }
            />
            <ControlledDate control={control} name="debitNoteDate" rules={{ required: 'Date is required' }} label="Debit Note Date" />
            <ControlledSelect control={control} name="reason" rules={{ required: 'Reason is required' }} label="Reason" options={reasons} placeholder="Select Reason" />
          </div>
        </DocSection>
      </SectionPair>

      <TaxNotice supported={taxRates.supported} country={taxRates.country} taxCode={taxRates.taxCode} missingRate={taxRates.missingRate} regionAssumed={taxRates.regionAssumed} />

      <DocSection index={3} title="Items" flush>
        <LineHeader
          cols={cols}
          labels={['Item', 'UOM', 'Reason', 'Qty', 'Price', 'Discount', 'Net', ...(taxRates.hasExcise ? ['Excise'] : []), taxRates.taxCode, 'Total']}
          numericLabels={[taxRates.taxCode]}
        />
        {fields.map((field, index) => (
          <LineStrip key={field.id} index={index} cols={cols} onRemove={() => fields.length > 1 && remove(index)} canRemove={fields.length > 1}>
            <LineCell label="Item" className={wideCellCls}>
              <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} disabled={!customerId} />
            </LineCell>
            <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} />
            <LineCell label="Reason">
              <ControlledSelect control={control} name={`items.${index}.reason`} options={reasons} placeholder="Reason" />
            </LineCell>
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
        gross={grossTotal}
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
        noteRegister={register('notes')}
      >
        <SaveButton type="submit" fullWidth>
          Save &amp; Submit
        </SaveButton>
        <CancelButton type="button" fullWidth onClick={() => navigate('/debit-notes')}>
          Cancel
        </CancelButton>
      </ReceiptRail>
    </DocumentShell>
  );
}
