import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, FileText } from 'lucide-react';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { CreditNoteFormData, CreditNoteItem } from '../../types/CreditNote';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { useCreditNoteFormOptions, useCreditNoteMutations } from '../../hooks/CreditNotes/useCreditNotes';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
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
import { useMoney } from '../../hooks/Currency/useMoney';
import { computeLine, sumLines } from '../../utils/documentMath';
import { useLineTaxRates } from '../../hooks/Tax/useLineTaxRates';

const initialItem: CreditNoteItem = { id: '', itemId: '', itemName: '', uom: '', reason: '', quantity: 1, price: 0, discount: 0, vat: 0, net: 0, excise: 0, total: 0 };

const initialFormData: CreditNoteFormData = {
  creditNoteNumber: '',
  creditNoteDate: new Date().toISOString().split('T')[0],
  customerId: '',
  invoiceId: '',
  reason: '',
  notes: '',
  items: [{ ...initialItem, id: '1' }],
  grossTotal: 0,
  vat: 0,
  excise: 0,
  netTotal: 0,
  discount: 0,
  finalTotal: 0,
};

export function CreditNoteAdd() {
  const navigate = useNavigate();
  const { customers, invoices, reasons, isLoading: optionsLoading } = useCreditNoteFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const { createMutation } = useCreditNoteMutations();
  const [codeLocked, setCodeLocked] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    setValue,
    getValues,
    setError,
    watch,
  } = useForm<CreditNoteFormData>({ defaultValues: initialFormData });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const watchedTotals = useWatch({ control, name: ['grossTotal', 'vat', 'excise', 'netTotal', 'discount', 'finalTotal'] });

  const customerId = useWatch({ control, name: 'customerId' });
  const resolutions = usePdpLinePreview({ customerId, fields, watchedItems, setLine: (index, key, value) => setValue(`items.${index}.${key}`, value) });

  const { digits } = useMoney();
  const taxRates = useLineTaxRates(
    (watchedItems ?? []).map((item) => item?.itemId),
    customerId
  );

  useEffect(() => {
    if (!watchedItems) return;
    const currentItems = getValues('items') || [];
    const lines = watchedItems.map((item: CreditNoteItem) => computeLine(item, digits, taxRates.forItem(item?.itemId)));
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

  const [grossTotal, vat, excise, netTotal, discount, finalTotal] = watchedTotals;

  const onFormSubmit = async (formData: CreditNoteFormData) => {
    try {
      const creditNoteNumber = await reserveCodeIfAuto('credit_note', formData.creditNoteNumber);
      if (creditNoteNumber !== formData.creditNoteNumber) {
        formData.creditNoteNumber = creditNoteNumber ?? '';
        setValue('creditNoteNumber', creditNoteNumber ?? '');
        setCodeLocked(true);
      }
      await createMutation.mutateAsync(formData);
      navigate('/credit-note');
    } catch (error: any) {
      setError('root', { message: error.response?.data?.message || 'Error saving credit note' });
    }
  };

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell icon={FileText} eyebrow="Field Sales · New" title="Add Credit Note" onBack={() => navigate('/credit-note')} onSubmit={handleSubmit(onFormSubmit)}>
      {errors.root && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-4 py-3 text-sm text-red-700 dark:text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            <strong>Error:</strong> {errors.root.message}
          </span>
        </div>
      )}

      <SectionPair>
        <DocSection index={1} title="Reference">
          <div className={fieldGridCls}>
            <ControlledSelect
              control={control}
              name="customerId"
              rules={{ required: 'Customer is required' }}
              label="Customer"
              options={customers}
              placeholder="Select Customer"
              isLoading={optionsLoading}
              loadingMessage="Loading…"
            />
            <ControlledSelect
              control={control}
              name="invoiceId"
              rules={{ required: 'Invoice is required' }}
              label="Invoice"
              options={invoices}
              placeholder="Select Invoice"
              isLoading={optionsLoading}
              loadingMessage="Loading…"
            />
          </div>
        </DocSection>

        <DocSection index={2} title="Document">
          <div className={fieldGridCls}>
            <CodeField
              label="Credit Note Number"
              registration={register('creditNoteNumber')}
              disabled={codeLocked}
              action={
                <OrderCodeSettingsIcon
                  label="Credit Note Number"
                  entityKey="credit_note"
                  value={watch('creditNoteNumber') || ''}
                  onChange={(v) => setValue('creditNoteNumber', v)}
                  onLockChange={setCodeLocked}
                />
              }
            />
            <ControlledDate control={control} name="creditNoteDate" rules={{ required: 'Date is required' }} label="Credit Note Date" />
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
        {fields.map((field, index) => {
          const item = watchedItems?.[index];
          const { net, total, excise, tax } = computeLine(item, digits, taxRates.forItem(item?.itemId));
          return (
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
                <LineFigure value={net} />
              </LineCell>
              {taxRates.hasExcise && (
                <LineCell label="Excise">
                  <LineFigure value={excise} />
                </LineCell>
              )}
              <LineCell label={taxRates.taxCode}>
                <LineFigure value={tax} />
              </LineCell>
              <LineCell label="Total">
                <LineFigure value={total} strong />
              </LineCell>
            </LineStrip>
          );
        })}
        <AddLineButton onClick={() => append({ ...initialItem, id: Date.now().toString() })} disabled={!customerId} disabledHint="Select a customer first" />
      </DocSection>

      <ReceiptRail
        gross={grossTotal}
        discount={discount}
        net={netTotal}
        vat={vat}
        excise={excise}
        taxLabel={taxRates.taxCode}
        taxRate={taxRates.uniformRate}
        taxRows={taxRates.taxRows(watchedItems ?? [], digits)}
        showExcise={taxRates.hasExcise}
        total={finalTotal}
        lineCount={fields.length}
        noteRegister={register('notes')}
      >
        <SaveButton type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Save & Submit'}
        </SaveButton>
        <CancelButton type="button" fullWidth onClick={() => navigate('/credit-note')} disabled={isSubmitting}>
          Cancel
        </CancelButton>
      </ReceiptRail>
    </DocumentShell>
  );
}
