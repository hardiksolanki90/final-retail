import { useCallback, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { Link2, Truck } from 'lucide-react';
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
import { LineAvailability } from '../shared/DocumentForm/LineAvailability';
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
import { useDocumentFromOrder } from '../../hooks/useDocumentFromOrder';
import { documentTypeLabel } from '../../constants/documentTypes';
import { ensureOption, toFormLine } from '../../utils/documentEdit';
import { DocumentEditSkeleton } from '../shared/DocumentForm/EditSkeleton';
import { getDeliveryDetails } from '../../api/DeliveryApi';
import type { DeliveryView } from '../../types/DocumentView';

type DeliveryItem = {
  id: string;
  uuid?: string;
  itemId: string;
  uom: string;
  quantity: number;
  reason: string;
  price: number;
  excise: number;
  discount: number;
  net: number;
  vat: number;
  total: number;
  /** Free-goods line (from a converted order's free line). */
  isFree?: boolean;
  /** The order line this one was converted from: its item, UOM and price are fixed, only the quantity can change (down to part of it). */
  orderLineUuid?: string;
  orderedQty?: number;
  /** Most this line can take: what is still open on the order line (counting this delivery's own quantity when editing). */
  maxQty?: number;
  /** Discount per unit, so a part quantity carries its share of the order line's discount. */
  unitDiscount?: number;
};

type DeliveryFormFields = {
  deliveryType: string;
  customerId: string;
  warehouse: string;
  deliveryNumber: string;
  deliveryDate: string;
  deliveryTime: string;
  customerNote: string;
  items: DeliveryItem[];
  grossTotal: number;
  discount: number;
  netTotal: number;
  excise: number;
  vat: number;
  finalTotal: number;
};

const emptyItem: DeliveryItem = { id: '', itemId: '', uom: '', quantity: 1, reason: '', price: 0, excise: 0, discount: 0, net: 0, vat: 0, total: 0 };

const defaultValues: DeliveryFormFields = {
  deliveryType: 'Credit',
  customerId: '',
  warehouse: '',
  deliveryNumber: '',
  deliveryDate: new Date().toISOString().split('T')[0],
  deliveryTime: '',
  customerNote: '',
  items: [{ ...emptyItem, id: '1' }],
  grossTotal: 0,
  discount: 0,
  netTotal: 0,
  excise: 0,
  vat: 0,
  finalTotal: 0,
};

export function DeliveryAdd() {
  const { customers, warehouses, reasons } = useDocumentFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const createDelivery = useCreateDocument('delivery', 'Delivery');
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const preset = usePresetCustomer(isEdit);
  // Opened by the Order view's "Convert to Delivery" (?fromOrder=<order uuid>): the form starts filled from that order and the delivery is linked to it.
  const [searchParams] = useSearchParams();
  const fromOrder = (!isEdit && searchParams.get('fromOrder')) || undefined;

  const { control, register, handleSubmit, setValue, getValues, watch, reset, formState } = useForm<DeliveryFormFields>({
    defaultValues: preset ? { ...defaultValues, customerId: preset.id } : defaultValues,
  });
  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber('delivery', (value) => setValue('deliveryNumber', value), !isEdit);

  const { isLoading: loadingSaved, saved } = useDocumentEditing<DeliveryView, DeliveryFormFields>({
    label: 'delivery',
    uuid,
    fetcher: getDeliveryDetails,
    toForm: (saved) => ({
      deliveryType: documentTypeLabel(saved.deliveryTypeId) ?? 'Credit',
      customerId: saved.customerId ?? '',
      warehouse: saved.warehouseId ?? '',
      deliveryNumber: saved.deliveryNumber,
      deliveryDate: saved.deliveryDate ?? '',
      deliveryTime: saved.deliveryTime ?? '',
      customerNote: saved.notes ?? '',
      items: saved.items.map((line) => ({ ...toFormLine(line), unitDiscount: line.orderLineUuid && line.quantity > 0 ? line.discount / line.quantity : undefined })),
      grossTotal: saved.totalGross,
      discount: saved.totalDiscountAmount,
      netTotal: saved.totalNet,
      excise: saved.totalExcise,
      vat: saved.totalVat,
      finalTotal: saved.grandTotal,
    }),
    reset,
    remember: rememberItems,
    listPath: '/delivery',
  });
  // The order's lines still open (an order can be delivered in parts): each starts at its open quantity — lower it to deliver only part;
  // the rest stays open for another delivery. Free-goods lines come too. Item, UOM and price follow the order line (the server re-checks).
  const { order: sourceOrder, isLoading: loadingOrder } = useDocumentFromOrder<DeliveryFormFields>({
    orderUuid: fromOrder,
    fallbackPath: '/order',
    remember: rememberItems,
    reset,
    blockedReason: (order) => (order.items.some((line) => (line.openQty ?? line.quantity) > 0) ? null : 'Everything on this order has already been delivered.'),
    toForm: (order) => {
      const lines = order.items
        .filter((line) => (line.openQty ?? line.quantity) > 0)
        .map((line) => {
          const open = line.openQty ?? line.quantity;
          const unitDiscount = line.quantity > 0 ? line.discount / line.quantity : 0;
          return { ...toFormLine(line), uuid: undefined, quantity: open, discount: unitDiscount * open, unitDiscount, orderLineUuid: line.uuid, orderedQty: line.quantity, maxQty: open };
        });
      return {
        ...defaultValues,
        deliveryType: documentTypeLabel(order.orderTypeId) ?? 'Credit',
        customerId: order.customerId ?? '',
        warehouse: order.warehouseId ?? '',
        // The auto-generated number the form already holds (set by useDocumentNumber) stays.
        deliveryNumber: getValues('deliveryNumber'),
        customerNote: order.notes ?? '',
        items: lines,
      };
    },
  });
  const freeCount = sourceOrder ? sourceOrder.items.filter((line) => line.isFree && (line.openQty ?? line.quantity) > 0).length : 0;
  const partCount = sourceOrder ? sourceOrder.items.filter((line) => (line.openQty ?? line.quantity) < line.quantity).length : 0;
  const updateDoc = useUpdateDocument('delivery', 'Delivery');
  // The saved delivery or the order being converted: names the customer in the dropdown while its option page may not hold them.
  const named = saved ?? sourceOrder;
  const customersWithSaved = ensureOption(
    customers,
    saved?.customerId ?? sourceOrder?.customerId ?? preset?.id,
    named ? (named.customerCode && named.customerName ? `${named.customerCode} - ${named.customerName}` : named.customerName) : preset?.label
  );
  const warehousesWithSaved = ensureOption(warehouses, saved?.warehouseId ?? sourceOrder?.warehouseId, saved?.warehouseName ?? sourceOrder?.warehouseName);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const deliveryTypes: SelectOption[] = [
    { value: 'Credit', label: 'Credit' },
    { value: 'Cash', label: 'Cash' },
    { value: 'Return', label: 'Return' },
    { value: 'Sample', label: 'Sample' },
  ];

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
    // A line converted from an order carries its per-unit share of the order line's discount, so a part quantity isn't over-discounted.
    currentItems.forEach((line, index) => {
      if (line.unitDiscount === undefined) return;
      const share = Number(((Number(line.unitDiscount) || 0) * (Number(line.quantity) || 0)).toFixed(digits));
      if (Number(line.discount) !== share) setValue(`items.${index}.discount`, share);
    });
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

  const onSubmit = async (formData: DeliveryFormFields) => {
    try {
      const deliveryNumber = isEdit ? formData.deliveryNumber : await reserveNumber(formData.deliveryNumber);

      const payload = {
        customerId: formData.customerId,
        deliveryTypeId: documentTypeId(formData.deliveryType),
        warehouseId: formData.warehouse || undefined,
        deliveryNumber: deliveryNumber || undefined,
        deliveryDate: formData.deliveryDate || undefined,
        deliveryTime: formData.deliveryTime || undefined,
        notes: formData.customerNote || undefined,
        // From an order: the link back to it, plus what the delivery form has no field for.
        ...(sourceOrder ? { orderId: sourceOrder.uuid, salesmanId: sourceOrder.salesmanId ?? undefined, paymentTermId: sourceOrder.paymentTermId ?? undefined, routeId: sourceOrder.routeId ?? undefined, dueDate: sourceOrder.dueDate ?? undefined } : {}),
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({
            uuid: item.uuid,
            itemId: item.itemId,
            isFree: item.isFree || undefined,
            orderLineUuid: item.orderLineUuid,
            itemUomId: item.uom || undefined,
            reasonId: item.reason || undefined,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
          })),
      };
      if (isEdit && uuid) await updateDoc.mutateAsync({ uuid, payload: { ...payload, deliveryNumber: undefined } });
      else await createDelivery.mutateAsync(payload);
      navigate('/delivery');
    } catch {
      // toast already shown by useCreateDocument's onError
    }
  };

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell
      icon={Truck}
      eyebrow={isEdit ? 'Field Sales · Edit' : 'Field Sales · New'}
      title={isEdit ? 'Edit Delivery' : 'Add Delivery'}
      onBack={() => navigate('/delivery')}
      onSubmit={handleSubmit(onSubmit)}
    >
      {loadingSaved || loadingOrder ? (
        <DocumentEditSkeleton />
      ) : (
        <>
          {sourceOrder && (
            <div role="status" className="flex items-start gap-3 rounded-lg border border-primary-200 bg-primary-50 px-4 py-3 text-sm text-primary-800 dark:border-primary-900/40 dark:bg-primary-900/10 dark:text-primary-200">
              <Link2 className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Converting order <strong>{sourceOrder.orderNumber}</strong> — its customer, warehouse, notes and {fields.length} {fields.length === 1 ? 'line' : 'lines'} are filled in below, each at the quantity still open. Lower a quantity (or remove a line) to deliver only part: the rest stays open for another delivery
                under this order. Saving links the new delivery to the order.
                {freeCount > 0 && ` ${freeCount} free-item ${freeCount === 1 ? 'line is' : 'lines are'} included at price 0.`}
                {partCount > 0 && ` ${partCount} ${partCount === 1 ? 'line has' : 'lines have'} already been partly delivered.`}
              </p>
            </div>
          )}
          <DocSection index={1} title="Delivery Type" aside={<TypeSwitch label="Delivery Type" options={deliveryTypes} registration={register('deliveryType', { required: true })} />} />

          <SectionPair>
            <DocSection index={2} title="Customer">
              <div className={fieldGridCls}>
                <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customersWithSaved} placeholder="Select Customer" />
                <ControlledSelect control={control} name="warehouse" rules={{ required: true }} label="Warehouse" options={warehousesWithSaved} placeholder="Select Warehouse" />
              </div>
            </DocSection>

            <DocSection index={3} title="Document">
              <div className={fieldGridCls}>
                <CodeField
                  label="Delivery Number"
                  registration={register('deliveryNumber', { validate: (value) => !manualNumbering || Boolean(value) || 'Delivery Number is required' })}
                  required={manualNumbering}
                  error={formState.errors.deliveryNumber?.message}
                  disabled={codeLocked || isEdit}
                  action={isEdit ? null : <OrderCodeSettingsIcon label="Delivery Number" entityKey="delivery" value={watch('deliveryNumber') || ''} onChange={(v) => setValue('deliveryNumber', v)} />}
                />
                <ControlledDate control={control} name="deliveryDate" rules={{ required: true }} label="Delivery Date" />
                <ControlledDate control={control} name="deliveryTime" label="Delivery Time" timeOnly placeholderText="Select time" />
              </div>
            </DocSection>
          </SectionPair>

          <TaxNotice supported={taxRates.supported} country={taxRates.country} taxCode={taxRates.taxCode} missingRate={taxRates.missingRate} regionAssumed={taxRates.regionAssumed} />

          <DocSection index={4} title="Items" flush>
            <LineHeader
              cols={cols}
              labels={['Item', 'UOM', 'Reason', 'Qty', 'Price', 'Discount', 'Net', ...(taxRates.hasExcise ? ['Excise'] : []), taxRates.taxCode, 'Total']}
              numericLabels={[taxRates.taxCode]}
            />
            {fields.map((field, index) => (
              <LineStrip key={field.id} index={index} cols={cols} onRemove={() => fields.length > 1 && remove(index)} canRemove={fields.length > 1} below={<LineAvailability warehouse={watch('warehouse')} item={watchedItems?.[index]?.itemId} uom={watchedItems?.[index]?.uom} quantity={Number(watchedItems?.[index]?.quantity)} />}>
                <LineCell label="Item" className={wideCellCls}>
                  <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} known={knownItems} disabled={!customerId || Boolean(watchedItems?.[index]?.orderLineUuid)} />
                  {watchedItems?.[index]?.orderedQty !== undefined && <span className="mt-1 block text-[11px] text-[var(--text-secondary)]">Ordered {watchedItems?.[index]?.orderedQty} · up to {watchedItems?.[index]?.maxQty} on this delivery</span>}
                  {watchedItems?.[index]?.isFree && <span className="mt-1 inline-block rounded-full bg-green-50 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">Free</span>}
                </LineCell>
                <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} disabled={Boolean(watchedItems?.[index]?.orderLineUuid)} />
                <LineCell label="Reason">
                  <ControlledSelect control={control} name={`items.${index}.reason`} options={reasons} placeholder="Reason" />
                </LineCell>
                <LineCell label="Qty">
                  <QtyStepper aria-label={`Line ${index + 1} quantity`} max={watchedItems?.[index]?.maxQty} {...register(`items.${index}.quantity`, { valueAsNumber: true })} />
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
            noteRegister={register('customerNote')}
          >
            <SaveButton type="submit" fullWidth>
              Save &amp; Submit
            </SaveButton>
            <CancelButton type="button" fullWidth onClick={() => navigate('/delivery')}>
              Cancel
            </CancelButton>
          </ReceiptRail>
        </>
      )}
    </DocumentShell>
  );
}
