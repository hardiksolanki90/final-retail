import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { RotateCcw, PackageCheck } from 'lucide-react';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { useDocumentNumber } from '../../hooks/CodeSetting/useDocumentNumber';
import { useDocumentFormOptions } from '../../hooks/useDocumentForm';
import { usePdpLinePreview } from '../../hooks/usePdpLinePreview';
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
import { useMoney } from '../../hooks/Currency/useMoney';
import { computeLine, sumLines } from '../../utils/documentMath';
import { useLineTaxRates } from '../../hooks/Tax/useLineTaxRates';
import { useDocumentEditing } from '../../hooks/useDocumentEditing';
import { ensureOption, toFormLine } from '../../utils/documentEdit';
import { DocumentEditSkeleton } from '../shared/DocumentForm/EditSkeleton';
import { usePresetCustomer } from '../../hooks/usePresetCustomer';
import { getItemsByUuids } from '../../api/ItemApi';
import { getOrderDetails, getOrderList } from '../../api/OrderApi';
import type { Order } from '../../types/Order';
import { showToast } from '../../lib/toast';
import axiosInstance from '../../lib/axios';

export type ReturnItem = {
  id: string;
  uuid?: string;
  itemId: string;
  uom: string;
  reason?: string;
  quantity: number;
  price: number;
  discount: number;
  vat: number;
  net: number;
  excise: number;
  total: number;
};

export type ReturnFormFields = {
  returnType: string;
  customerId: string;
  orderId: string;
  salesmanId: string;
  returnNumber: string;
  returnDate: string;
  reason: string;
  notes: string;
  items: ReturnItem[];
  grossTotal: number;
  vat: number;
  excise: number;
  netTotal: number;
  discount: number;
  finalTotal: number;
};

export interface ReturnAddProps {
  isOpen?: boolean;
  onClose?: () => void;
  data?: { initialData?: Partial<ReturnFormFields>; isLoading?: boolean };
  onEvent?: (event: any) => void;
}

const emptyItem: ReturnItem = {
  id: '',
  itemId: '',
  uom: '',
  reason: '',
  quantity: 1,
  price: 0,
  discount: 0,
  vat: 0,
  net: 0,
  excise: 0,
  total: 0,
};

const defaultValues: ReturnFormFields = {
  returnType: 'Good Return',
  customerId: '',
  orderId: '',
  salesmanId: '',
  returnNumber: '',
  returnDate: new Date().toISOString().split('T')[0],
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

const returnTypeOptions: SelectOption[] = [
  { value: 'Good Return', label: 'Good Return' },
  { value: 'Bad Return', label: 'Bad Return' },
  { value: 'Damaged', label: 'Damaged' },
  { value: 'Expired', label: 'Expired' },
];

export function ReturnAdd({ isOpen, onClose, data, onEvent }: ReturnAddProps = {}) {
  const { customers, salesmen, reasonNames: reasonsFromApi } = useDocumentFormOptions();
  const { known: knownItems, remember: rememberItems } = useKnownItems();
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEdit = Boolean(uuid);
  const preset = usePresetCustomer(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingOrderLines, setIsLoadingOrderLines] = useState(false);

  const { control, register, handleSubmit, setValue, getValues, watch, reset, setError, formState } = useForm<ReturnFormFields>({
    defaultValues: preset ? { ...defaultValues, customerId: preset.id } : defaultValues,
  });

  const { manual: manualNumbering, locked: codeLocked, reserve: reserveNumber } = useDocumentNumber(
    'return',
    (value) => setValue('returnNumber', value, { shouldValidate: true }),
    !isEdit
  );

  const getReturnDetails = async (id: string): Promise<any> => {
    try {
      const response = await axiosInstance.get(`/return/edit/${id}`);
      return response.data?.data || response.data;
    } catch {
      const response = await axiosInstance.get(`/return/view/${id}`);
      return response.data?.data || response.data;
    }
  };

  const { isLoading: loadingSaved, saved } = useDocumentEditing<any, ReturnFormFields>({
    label: 'return',
    uuid,
    fetcher: getReturnDetails,
    toForm: (saved) => ({
      returnType: saved.returnType ?? saved.type ?? 'Good Return',
      customerId: saved.customerId ?? '',
      orderId: saved.orderId ?? saved.orderUuid ?? '',
      salesmanId: saved.salesmanId ?? '',
      returnNumber: saved.returnNumber ?? saved.returnNo ?? '',
      returnDate: saved.returnDate ?? saved.date ?? new Date().toISOString().split('T')[0],
      reason: saved.reason ?? '',
      notes: saved.notes ?? '',
      items: Array.isArray(saved.items) && saved.items.length > 0 ? saved.items.map(toFormLine) : [{ ...emptyItem, id: '1' }],
      grossTotal: saved.totalGross ?? saved.grossTotal ?? 0,
      vat: saved.totalVat ?? saved.vat ?? 0,
      excise: saved.totalExcise ?? saved.excise ?? 0,
      netTotal: saved.totalNet ?? saved.netTotal ?? 0,
      discount: saved.totalDiscountAmount ?? saved.discount ?? 0,
      finalTotal: saved.grandTotal ?? saved.finalTotal ?? saved.amount ?? 0,
    }),
    reset,
    remember: rememberItems,
    listPath: '/return',
  });

  // Apply initialData from props if provided (e.g. for modal usage)
  useEffect(() => {
    if (data?.initialData) {
      reset((prev) => ({ ...prev, ...data.initialData }));
    }
  }, [data?.initialData, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });
  const watchedItems = useWatch({ control, name: 'items' });
  const grossTotal = useWatch({ control, name: 'grossTotal' });
  const vatTotal = useWatch({ control, name: 'vat' });
  const exciseTotal = useWatch({ control, name: 'excise' });
  const netTotal = useWatch({ control, name: 'netTotal' });
  const discountTotal = useWatch({ control, name: 'discount' });
  const finalTotal = useWatch({ control, name: 'finalTotal' });

  const customerId = useWatch({ control, name: 'customerId' });
  const selectedOrderId = useWatch({ control, name: 'orderId' });

  // ── Order options from Order API (filtered by selected customer) ───────────
  const ordersQuery = useQuery({
    queryKey: ['return-order-options', customerId],
    queryFn: async () => {
      try {
        const res = await getOrderList(1, undefined, 100, customerId ? { customerId } : undefined);
        const rows: Order[] = Array.isArray(res?.orders) ? res.orders : Array.isArray(res?.data) ? res.data : Array.isArray(res?.items) ? res.items : [];
        return rows;
      } catch (err) {
        console.error('Failed to load orders for return:', err);
        return [];
      }
    },
    staleTime: 5 * 60 * 1000,
  });

  const orderOptions = useMemo<SelectOption[]>(() => {
    const rows = ordersQuery.data ?? [];
    return rows.map((order) => {
      const num = order.orderNumber || (order.id ? `ORD-${order.id}` : 'Order');
      const cust = order.customer?.name || (order.customer?.firstName ? `${order.customer.firstName} ${order.customer.lastName || ''}`.trim() : '');
      const date = order.orderDate || order.date;
      const parts = [num];
      if (cust && !customerId) parts.push(cust);
      if (date) parts.push(date);
      return {
        value: order.uuid || String(order.id),
        label: parts.join(' — '),
      };
    });
  }, [ordersQuery.data, customerId]);

  // If user picks an order first, auto-fill its customer and salesman
  useEffect(() => {
    if (!selectedOrderId) return;
    const order = ordersQuery.data?.find((o) => (o.uuid || String(o.id)) === selectedOrderId);
    if (order) {
      if (order.customerId && !getValues('customerId')) {
        setValue('customerId', order.customerId);
      }
      if (order.salesmanId && !getValues('salesmanId')) {
        setValue('salesmanId', order.salesmanId);
      }
    }
  }, [selectedOrderId, ordersQuery.data, getValues, setValue]);

  // Load items from the selected order into return line items
  const handleLoadOrderItems = async () => {
    const orderId = getValues('orderId');
    if (!orderId) {
      showToast.error('Please select an order first');
      return;
    }
    setIsLoadingOrderLines(true);
    try {
      const orderDetails = await getOrderDetails(orderId);
      if (orderDetails && Array.isArray(orderDetails.items) && orderDetails.items.length > 0) {
        const itemUuids = [...new Set(orderDetails.items.map((line) => line.itemId).filter(Boolean))];
        if (itemUuids.length > 0) {
          try {
            const itemOptions = await getItemsByUuids(itemUuids);
            rememberItems(itemOptions);
          } catch {
            // non-fatal
          }
        }
        const currentHeaderReason = getValues('reason') || '';
        const mappedLines = orderDetails.items.map((line, idx) => ({
          ...toFormLine(line),
          id: line.uuid || String(idx + 1),
          reason: line.reason || currentHeaderReason,
        }));
        setValue('items', mappedLines);
        showToast.success(`Loaded ${mappedLines.length} item(s) from order`);
      } else {
        showToast.info('The selected order has no items to load');
      }
    } catch (err: any) {
      showToast.error(err?.message || 'Failed to load order items');
    } finally {
      setIsLoadingOrderLines(false);
    }
  };

  const customersWithSaved = ensureOption(
    customers,
    saved?.customerId ?? preset?.id,
    saved ? (saved.customerCode && saved.customerName ? `${saved.customerCode} - ${saved.customerName}` : saved.customerName) : preset?.label
  );
  const ordersWithSaved = ensureOption(orderOptions, saved?.orderId, saved?.orderNumber);
  const salesmenWithSaved = ensureOption(salesmen, saved?.salesmanId, saved?.salesmanName);

  // ── PDP preview ────────────────────────────────────────────────────────────
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

  const handleBack = () => {
    if (onClose) onClose();
    else navigate('/return');
  };

  const onSubmit = async (formData: ReturnFormFields) => {
    setIsSubmitting(true);
    try {
      const returnNumber = isEdit ? formData.returnNumber : await reserveNumber(formData.returnNumber);

      if (!returnNumber || !returnNumber.trim()) {
        setError('returnNumber', { type: 'required', message: 'Return Number is required' });
        setIsSubmitting(false);
        return;
      }

      const payload = {
        returnNumber: returnNumber.trim(),
        returnType: formData.returnType,
        customerId: formData.customerId,
        orderId: formData.orderId || undefined,
        salesmanId: formData.salesmanId || undefined,
        returnDate: formData.returnDate || undefined,
        reason: formData.reason || undefined,
        notes: formData.notes || undefined,
        grossTotal: formData.grossTotal,
        netTotal: formData.netTotal,
        vat: formData.vat,
        excise: formData.excise,
        discount: formData.discount,
        finalTotal: formData.finalTotal,
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({
            uuid: item.uuid,
            itemId: item.itemId,
            itemUomId: item.uom || undefined,
            reason: item.reason || formData.reason || undefined,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
            vat: Number(item.vat) || 0,
            net: Number(item.net) || 0,
            excise: Number(item.excise) || 0,
            total: Number(item.total) || 0,
          })),
      };

      if (isEdit && uuid) {
        await axiosInstance.post(`/return/edit/${uuid}`, payload);
      } else {
        await axiosInstance.post('/return/add', payload);
      }

      onEvent?.({ eventType: isEdit ? 'ReturnUpdated' : 'ReturnCreated', return: payload });
      showToast.success(isEdit ? 'Return updated successfully!' : 'Return created successfully!');

      handleBack();
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || 'Error saving return';
      showToast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isOpen === false) return null;

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell
      icon={RotateCcw}
      eyebrow={isEdit ? 'Returns · Edit' : 'Returns · New'}
      title={isEdit ? 'Edit Return' : 'Add Return'}
      onBack={handleBack}
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
                <ControlledSelect control={control} name="orderId" label="Order" options={ordersWithSaved} placeholder="Select Order (Optional)" />
                <ControlledSelect control={control} name="salesmanId" label="Salesman" options={salesmenWithSaved} placeholder="Select Salesman" />
              </div>
            </DocSection>

            <DocSection index={2} title="Document">
              <div className={fieldGridCls}>
                <CodeField
                  label="Return Number"
                  registration={register('returnNumber', {
                    required: 'Return Number is required',
                    validate: (value) => Boolean(value && value.trim()) || 'Return Number is required',
                  })}
                  required={true}
                  error={formState.errors.returnNumber?.message}
                  disabled={codeLocked || isEdit}
                  action={isEdit ? null : <OrderCodeSettingsIcon label="Return Number" entityKey="return" value={watch('returnNumber') || ''} onChange={(v) => setValue('returnNumber', v, { shouldValidate: true })} />}
                />
                <ControlledSelect
                  control={control}
                  name="returnType"
                  rules={{ required: 'Return Type is required' }}
                  label="Return Type"
                  options={returnTypeOptions}
                  placeholder="Select Return Type"
                />
                <ControlledDate control={control} name="returnDate" rules={{ required: 'Date is required' }} label="Return Date" />
                <ControlledSelect
                  control={control}
                  name="reason"
                  rules={{ required: 'Reason is required' }}
                  label="Reason"
                  options={reasonsFromApi}
                  placeholder="Select Reason"
                />
              </div>
            </DocSection>
          </SectionPair>

          <TaxNotice supported={taxRates.supported} country={taxRates.country} taxCode={taxRates.taxCode} missingRate={taxRates.missingRate} regionAssumed={taxRates.regionAssumed} />

          <DocSection
            index={3}
            title="Items"
            aside={
              selectedOrderId ? (
                <button
                  type="button"
                  onClick={handleLoadOrderItems}
                  disabled={isLoadingOrderLines}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-primary-200 dark:border-primary-800 bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors cursor-pointer"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  {isLoadingOrderLines ? 'Loading items...' : 'Load Items from Order'}
                </button>
              ) : null
            }
            flush
          >
            <LineHeader
              cols={cols}
              labels={['Item', 'UOM', 'Reason', 'Qty', 'Price', 'Discount', 'Net', ...(taxRates.hasExcise ? ['Excise'] : []), taxRates.taxCode, 'Total']}
              numericLabels={[taxRates.taxCode]}
            />
            {fields.map((field, index) => (
              <LineStrip
                key={field.id}
                index={index}
                cols={cols}
                onRemove={() => fields.length > 1 && remove(index)}
                canRemove={fields.length > 1}
              >
                <LineCell label="Item" className={wideCellCls}>
                  <LineItemSelect control={control} name={`items.${index}.itemId`} remember={rememberItems} known={knownItems} disabled={!customerId} />
                </LineCell>
                <LineUomCell control={control} name={`items.${index}.uom`} itemId={watchedItems?.[index]?.itemId} items={knownItems} />
                <LineCell label="Reason">
                  <ControlledSelect control={control} name={`items.${index}.reason`} options={reasonsFromApi} placeholder="Reason" />
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
            <AddLineButton
              onClick={() => append({ ...emptyItem, id: Date.now().toString(), reason: getValues('reason') || '' })}
              disabled={!customerId}
              disabledHint="Select a customer first"
            />
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
            <SaveButton type="submit" fullWidth isLoading={isSubmitting}>
              Save &amp; Submit
            </SaveButton>
            <CancelButton type="button" fullWidth onClick={handleBack}>
              Cancel
            </CancelButton>
          </ReceiptRail>
        </>
      )}
    </DocumentShell>
  );
}
