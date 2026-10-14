import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { ShoppingCart, Gift } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { useDocumentNumber } from '../../hooks/CodeSetting/useDocumentNumber';
import { useCreateOrder, useOrderFormOptions, usePdpPromotions } from '../../hooks/useOrderForm';
import { usePdpLinePreview } from '../../hooks/usePdpLinePreview';
import type { PdpPromotion } from '../../types/PdpResolution';
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
import { useMoney } from '../../hooks/Currency/useMoney';
import { computeLine, sumLines } from '../../utils/documentMath';
import { useLineTaxRates } from '../../hooks/Tax/useLineTaxRates';
import { useDocumentEditing } from '../../hooks/useDocumentEditing';
import { documentTypeLabel } from '../../constants/documentTypes';
import { ensureOption, toFormLine } from '../../utils/documentEdit';
import { DocumentEditSkeleton } from '../shared/DocumentForm/EditSkeleton';
import { getOrderDetails } from '../../api/OrderApi';
import type { OrderView } from '../../types/Order';
import { useUpdateDocument } from '../../hooks/useDocumentForm';
import { usePresetCustomer } from '../../hooks/usePresetCustomer';

type OrderItem = { id: string; uuid?: string; itemId: string; uom: string; quantity: number; price: number; discount: number; vat: number; net: number; excise: number; total: number };

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

const emptyItem: OrderItem = { id: '', itemId: '', uom: '', quantity: 1, price: 0, discount: 0, vat: 0, net: 0, excise: 0, total: 0 };

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
  const { customers, salesmen, paymentTerms } = useOrderFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const createOrder = useCreateOrder();

  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const preset = usePresetCustomer(isEdit);

  const { control, register, handleSubmit, setValue, getValues, watch, reset, formState } = useForm<OrderFormFields>({
    defaultValues: preset ? { ...defaultValues, customerId: preset.id } : defaultValues,
  });
  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber('order', (value) => setValue('orderNumber', value), !isEdit);

  const { isLoading: loadingSaved, saved } = useDocumentEditing<OrderView, OrderFormFields>({
    label: 'order',
    uuid,
    fetcher: getOrderDetails,
    toForm: (saved) => ({
      orderType: documentTypeLabel(saved.orderTypeId) ?? 'Cash',
      customerId: saved.customerId ?? '',
      salesmanId: saved.salesmanId ?? '',
      orderNumber: saved.orderNumber,
      deliveryDate: saved.deliveryDate ?? '',
      paymentTerms: saved.paymentTermId ?? '',
      dueDate: saved.dueDate ?? '',
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
    listPath: '/order',
  });
  const updateDoc = useUpdateDocument('order', 'Order');
  const customersWithSaved = ensureOption(
    customers,
    saved?.customerId ?? preset?.id,
    saved ? (saved.customerCode && saved.customerName ? `${saved.customerCode} - ${saved.customerName}` : saved.customerName) : preset?.label
  );
  const salesmenWithSaved = ensureOption(salesmen, saved?.salesmanId, saved?.salesmanName);
  const paymentTermsWithSaved = ensureOption(paymentTerms, saved?.paymentTermId, saved?.paymentTermName);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const orderTypeOptions: SelectOption[] = [
    { value: 'Cash', label: 'Cash' },
    { value: 'Credit', label: 'Credit' },
    { value: 'Return', label: 'Return' },
    { value: 'Depot', label: 'Depot' },
  ];

  // ── PDP preview ────────────────────────────────────────────────────────────
  const customerId = useWatch({ control, name: 'customerId' });
  usePdpLinePreview({ customerId, fields, watchedItems, setLine: (index, key, value) => setValue(`items.${index}.${key}`, value) });

  // Promotions sum buy qty across lines, so they're previewed for the whole
  // basket (debounced), shown under the last line that fed each one.
  const basketJson = JSON.stringify(
    fields.flatMap((field, index) => {
      const row = watchedItems?.[index];
      const quantity = Number(row?.quantity) || 0;
      return row?.itemId && row?.uom && quantity > 0 ? [{ key: field.id, itemId: row.itemId, itemUomId: row.uom || undefined, quantity, price: Number(row.price) || 0 }] : [];
    })
  );
  const [debouncedBasket, setDebouncedBasket] = useState(basketJson);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedBasket(basketJson), 400);
    return () => clearTimeout(timer);
  }, [basketJson]);
  const promotions = usePdpPromotions(customerId, debouncedBasket);
  const promotionsByLine = useMemo(() => {
    const map: Record<string, PdpPromotion[]> = {};
    promotions.forEach((promotion) => {
      const last = promotion.lineKeys[promotion.lineKeys.length - 1];
      if (last) (map[last] ??= []).push(promotion);
    });
    return map;
  }, [promotions]);

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

  const onSubmit = async (formData: OrderFormFields) => {
    try {
      const orderNumber = isEdit ? formData.orderNumber : await reserveNumber(formData.orderNumber);

      const payload = {
        customerId: formData.customerId,
        orderTypeId: documentTypeId(formData.orderType),
        salesmanId: formData.salesmanId || undefined,
        paymentTermId: formData.paymentTerms || undefined,
        orderNumber: orderNumber || undefined,
        deliveryDate: formData.deliveryDate || undefined,
        dueDate: formData.dueDate || undefined,
        notes: formData.notes || undefined,
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({
            uuid: item.uuid,
            itemId: item.itemId,
            itemUomId: item.uom || undefined,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
          })),
      };
      if (isEdit && uuid) await updateDoc.mutateAsync({ uuid, payload: { ...payload, orderNumber: undefined } });
      else await createOrder.mutateAsync(payload);
      navigate('/order');
    } catch {
      // toast already shown by useCreateOrder's onError
    }
  };

  const cols = lineCols({ reason: false, excise: taxRates.hasExcise });

  return (
    <>
      <DocumentShell
        icon={ShoppingCart}
        eyebrow={isEdit ? 'Field Sales · Edit' : 'Field Sales · New'}
        title={isEdit ? 'Edit Order' : 'Add Order'}
        onBack={() => navigate('/order')}
        onSubmit={handleSubmit(onSubmit)}
      >
        {loadingSaved ? (
          <DocumentEditSkeleton />
        ) : (
          <>
            <DocSection
              index={1}
              title="Order Type"
              aside={<TypeSwitch label="Order Type" options={orderTypeOptions} registration={register('orderType', { required: 'Order Type is required' })} />}
            />

            <SectionPair>
              <DocSection index={2} title="Customer">
                <div className={fieldGridCls}>
                  <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customersWithSaved} placeholder="Select Customer" />
                  <ControlledSelect control={control} name="salesmanId" label="Salesman" options={salesmenWithSaved} placeholder="Select Salesman" />
                </div>
              </DocSection>

              <DocSection index={3} title="Document">
                <div className={fieldGridCls}>
                  <CodeField
                    label="Order Number"
                    registration={register('orderNumber', { validate: (value) => !manualNumbering || Boolean(value) || 'Order Number is required' })}
                    required={manualNumbering}
                    error={formState.errors.orderNumber?.message}
                    disabled={codeLocked || isEdit}
                    action={isEdit ? null : <OrderCodeSettingsIcon label="Order Number" entityKey="order" value={watch('orderNumber') || ''} onChange={(v) => setValue('orderNumber', v)} />}
                  />
                  <ControlledDate control={control} name="deliveryDate" rules={{ required: 'Date is required' }} label="Delivery Date" />
                  <ControlledSelect
                    control={control}
                    name="paymentTerms"
                    rules={{ required: 'Payment Terms is required' }}
                    label="Payment Terms"
                    options={paymentTermsWithSaved}
                    placeholder="Select Payment Terms"
                  />
                  <ControlledDate control={control} name="dueDate" label="Due Date" />
                </div>
              </DocSection>
            </SectionPair>

            <TaxNotice supported={taxRates.supported} country={taxRates.country} taxCode={taxRates.taxCode} missingRate={taxRates.missingRate} regionAssumed={taxRates.regionAssumed} />

            <DocSection index={4} title="Items" flush>
              <LineHeader
                cols={cols}
                labels={['Item', 'UOM', 'Qty', 'Price', 'Discount', 'Net', ...(taxRates.hasExcise ? ['Excise'] : []), taxRates.taxCode, 'Total']}
                numericLabels={[taxRates.taxCode]}
              />
              {fields.map((field, index) => {
                return (
                  <LineStrip
                    key={field.id}
                    index={index}
                    cols={cols}
                    onRemove={() => fields.length > 1 && remove(index)}
                    canRemove={fields.length > 1}
                    below={promotionsByLine[field.id]?.map((promotion) => (
                      <div
                        key={promotion.planName}
                        className="mx-4 xl:ml-[3.625rem] xl:mr-5 mb-3 flex flex-wrap items-center gap-1.5 rounded-lg border border-emerald-200/70 dark:border-emerald-800/50 bg-emerald-50 dark:bg-emerald-900/15 px-3 py-2 text-xs text-emerald-700 dark:text-emerald-400"
                      >
                        <Gift className="w-3.5 h-3.5 shrink-0" />
                        <span>{promotion.offers.length ? 'Free on save:' : `Discount on save: ${promotion.discount}`}</span>
                        {promotion.offers.map((offer, i) => (
                          <span key={i} className="font-medium">
                            {offer.quantity} × {offer.itemName}
                            {offer.itemUomName ? ` (${offer.itemUomName})` : ''}
                            {i < promotion.offers.length - 1 ? ',' : ''}
                          </span>
                        ))}
                        <span className="text-emerald-600/70 dark:text-emerald-400/70">
                          — {promotion.planName}
                          {promotion.lineKeys.length > 1 ? ` (lines ${promotion.lineKeys.map((k) => fields.findIndex((f) => f.id === k) + 1).join(', ')})` : ''}
                        </span>
                      </div>
                    ))}
                  >
                    <LineCell label="Item" className={wideCellCls}>
                      <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} known={knownItems} disabled={!customerId} />
                    </LineCell>
                    <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} />
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
                );
              })}
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
              <SaveButton type="submit" fullWidth isLoading={createOrder.isPending}>
                Save &amp; Submit
              </SaveButton>
              <CancelButton type="button" fullWidth onClick={() => navigate('/order')}>
                Cancel
              </CancelButton>
            </ReceiptRail>
          </>
        )}
      </DocumentShell>
    </>
  );
}
