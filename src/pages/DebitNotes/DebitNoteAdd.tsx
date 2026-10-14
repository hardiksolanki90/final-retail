import { useEffect, useCallback } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
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
import { emptyNoteItem, noteLinesPayload, type NoteItem } from '../shared/DocumentForm/noteLines';
import { useKnownItems } from '../../hooks/useKnownItems';
import { PdpDiscountCell, PdpPriceCell } from '../shared/DocumentForm/PdpLineCells';
import { usePdpLinePreview } from '../../hooks/usePdpLinePreview';
import { useDocumentNumber } from '../../hooks/CodeSetting/useDocumentNumber';
import { useCreateDocument, useDocumentFormOptions, useUpdateDocument } from '../../hooks/useDocumentForm';
import { useMoney } from '../../hooks/Currency/useMoney';
import { computeLine, sumLines } from '../../utils/documentMath';
import { useLineTaxRates } from '../../hooks/Tax/useLineTaxRates';
import { useDocumentEditing } from '../../hooks/useDocumentEditing';
import { usePresetCustomer } from '../../hooks/usePresetCustomer';
import { ensureOption, toFormLine } from '../../utils/documentEdit';
import { DocumentEditSkeleton } from '../shared/DocumentForm/EditSkeleton';
import { getDebitNoteByUuid } from '../../api/DebitNoteApi';
import type { DebitNoteView } from '../../types/DocumentView';

type DebitNoteFormFields = {
  debitNoteNumber: string;
  debitNoteDate: string;
  customerId: string;
  invoiceId: string;
  reason: string;
  notes: string;
  items: NoteItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
};

const defaultValues: DebitNoteFormFields = {
  debitNoteNumber: '',
  debitNoteDate: new Date().toISOString().split('T')[0],
  customerId: '',
  invoiceId: '',
  reason: '',
  notes: '',
  items: [{ ...emptyNoteItem, id: '1' }],
  grossTotal: 0,
  vat: 0,
  excise: 0,
  netTotal: 0,
  discount: 0,
  finalTotal: 0,
};

export function DebitNoteAdd() {
  const { customers, invoices, reasonNames: reasons } = useDocumentFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const createDebitNote = useCreateDocument('debit-note', 'Debit note');
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const preset = usePresetCustomer(isEdit);

  const { control, register, handleSubmit, setValue, getValues, watch, reset, formState } = useForm<DebitNoteFormFields>({
    defaultValues: preset ? { ...defaultValues, customerId: preset.id } : defaultValues,
  });
  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber('debit_note', (value) => setValue('debitNoteNumber', value), !isEdit);

  const { isLoading: loadingSaved, saved } = useDocumentEditing<DebitNoteView, DebitNoteFormFields>({
    label: 'debit note',
    uuid,
    fetcher: getDebitNoteByUuid,
    toForm: (saved) => ({
      debitNoteNumber: saved.debitNoteNumber,
      debitNoteDate: saved.debitNoteDate ?? '',
      customerId: saved.customerId ?? '',
      invoiceId: saved.invoiceId ?? '',
      reason: saved.reason ?? '',
      notes: saved.notes ?? '',
      items: saved.items.map(toFormLine),
      grossTotal: saved.totalGross,
      vat: saved.totalVat,
      excise: saved.totalExcise,
      netTotal: saved.totalNet,
      discount: saved.totalDiscountAmount,
      finalTotal: saved.grandTotal,
    }),
    reset,
    remember: rememberItems,
    listPath: '/debit-note',
  });
  const updateDoc = useUpdateDocument('debit-note', 'Debit note');
  const customersWithSaved = ensureOption(
    customers,
    saved?.customerId ?? preset?.id,
    saved ? (saved.customerCode && saved.customerName ? `${saved.customerCode} - ${saved.customerName}` : saved.customerName) : preset?.label
  );
  const invoicesWithSaved = ensureOption(invoices, saved?.invoiceId, saved?.invoiceNumber);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const customerId = useWatch({ control, name: 'customerId' });
  usePdpLinePreview({ customerId, fields, watchedItems, setLine: (index, key, value) => setValue(`items.${index}.${key}`, value) });

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
      const debitNoteNumber = isEdit ? formData.debitNoteNumber : await reserveNumber(formData.debitNoteNumber);

      const payload = {
        customerId: formData.customerId,
        invoiceId: formData.invoiceId || undefined,
        debitNoteNumber: debitNoteNumber || undefined,
        debitNoteDate: formData.debitNoteDate || undefined,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
        items: noteLinesPayload(formData.items),
      };
      if (isEdit && uuid) await updateDoc.mutateAsync({ uuid, payload: { ...payload, debitNoteNumber: undefined } });
      else await createDebitNote.mutateAsync(payload);
      navigate('/debit-note');
    } catch {
      // toast already shown by useCreateDocument's onError
    }
  };

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell
      icon={FileText}
      eyebrow={isEdit ? 'Field Sales · Edit' : 'Field Sales · New'}
      title={isEdit ? 'Edit Debit Note' : 'Add Debit Note'}
      onBack={() => navigate('/debit-note')}
      onSubmit={handleSubmit(onSubmit)}
    >
      {loadingSaved ? (
        <DocumentEditSkeleton />
      ) : (
        <>
          <SectionPair>
            <DocSection index={1} title="Reference">
              <div className={fieldGridCls}>
                <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customersWithSaved} placeholder="Select Customer" />
                <ControlledSelect control={control} name="invoiceId" rules={{ required: 'Invoice is required' }} label="Invoice" options={invoicesWithSaved} placeholder="Select Invoice" />
              </div>
            </DocSection>

            <DocSection index={2} title="Document">
              <div className={fieldGridCls}>
                <CodeField
                  label="Debit Note Number"
                  registration={register('debitNoteNumber', { validate: (value) => !manualNumbering || Boolean(value) || 'Debit Note Number is required' })}
                  required={manualNumbering}
                  error={formState.errors.debitNoteNumber?.message}
                  disabled={codeLocked || isEdit}
                  action={
                    isEdit ? null : <OrderCodeSettingsIcon label="Debit Note Number" entityKey="debit_note" value={watch('debitNoteNumber') || ''} onChange={(v) => setValue('debitNoteNumber', v)} />
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
                  <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} known={knownItems} disabled={!customerId} />
                </LineCell>
                <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} />
                <LineCell label="Reason">
                  <ControlledSelect control={control} name={`items.${index}.reason`} options={reasons} placeholder="Reason" />
                </LineCell>
                <LineCell label="Qty">
                  <QtyStepper aria-label={`Line ${index + 1} quantity`} {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
                </LineCell>
                <PdpPriceCell aria-label={`Line ${index + 1} price`} {...register(`items.${index}.price`, { valueAsNumber: true })} />
                <PdpDiscountCell aria-label={`Line ${index + 1} discount`} {...register(`items.${index}.discount`, { valueAsNumber: true })} />
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
            <AddLineButton onClick={() => append({ ...emptyNoteItem, id: Date.now().toString() })} disabled={!customerId} disabledHint="Select a customer first" />
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
            <SaveButton type="submit" fullWidth isLoading={createDebitNote.isPending}>
              Save &amp; Submit
            </SaveButton>
            <CancelButton type="button" fullWidth onClick={() => navigate('/debit-note')}>
              Cancel
            </CancelButton>
          </ReceiptRail>
        </>
      )}
    </DocumentShell>
  );
}
