import { useCallback, useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { Truck } from 'lucide-react';
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

type DeliveryItem = { id: string; itemId: string; uom: string; quantity: number; reason: string; price: number; excise: number; discount: number; net: number; vat: number; total: number };

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
  const [codeLocked, setCodeLocked] = useState(false);

  const { control, register, handleSubmit, setValue, getValues, watch } = useForm<DeliveryFormFields>({ defaultValues });

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

  const onSubmit = async (formData: DeliveryFormFields) => {
    try {
      const deliveryNumber = await reserveCodeIfAuto('delivery', formData.deliveryNumber);
      if (deliveryNumber !== formData.deliveryNumber) {
        setValue('deliveryNumber', deliveryNumber ?? '');
        setCodeLocked(true);
      }

      await createDelivery.mutateAsync({
        customerId: formData.customerId,
        deliveryTypeId: documentTypeId(formData.deliveryType),
        warehouseId: formData.warehouse || undefined,
        deliveryNumber: deliveryNumber || undefined,
        deliveryDate: formData.deliveryDate || undefined,
        deliveryTime: formData.deliveryTime || undefined,
        notes: formData.customerNote || undefined,
        items: formData.items
          .filter((item) => item.itemId)
          .map((item) => ({
            itemId: item.itemId,
            itemUomId: item.uom || undefined,
            reasonId: item.reason || undefined,
            quantity: Number(item.quantity) || 0,
            price: Number(item.price) || 0,
            discount: Number(item.discount) || 0,
          })),
      });
      navigate('/delivery');
    } catch {
      // toast already shown by useCreateDocument's onError
    }
  };

  const cols = lineCols({ reason: true, excise: taxRates.hasExcise });

  return (
    <DocumentShell icon={Truck} eyebrow="Field Sales · New" title="Add Delivery" onBack={() => navigate('/delivery')} onSubmit={handleSubmit(onSubmit)}>
      <DocSection index={1} title="Delivery Type" aside={<TypeSwitch label="Delivery Type" options={deliveryTypes} registration={register('deliveryType', { required: true })} />} />

      <SectionPair>
        <DocSection index={2} title="Customer">
          <div className={fieldGridCls}>
            <ControlledSelect control={control} name="customerId" rules={{ required: 'Customer is required' }} label="Customer" options={customers} placeholder="Select Customer" />
            <ControlledSelect control={control} name="warehouse" rules={{ required: true }} label="Warehouse" options={warehouses} placeholder="Select Warehouse" />
          </div>
        </DocSection>

        <DocSection index={3} title="Document">
          <div className={fieldGridCls}>
            <CodeField
              label="Delivery Number"
              registration={register('deliveryNumber')}
              disabled={codeLocked}
              action={
                <OrderCodeSettingsIcon
                  label="Delivery Number"
                  entityKey="delivery"
                  value={watch('deliveryNumber') || ''}
                  onChange={(v) => setValue('deliveryNumber', v)}
                  onLockChange={setCodeLocked}
                />
              }
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
        noteRegister={register('customerNote')}
      >
        <SaveButton type="submit" fullWidth>
          Save &amp; Submit
        </SaveButton>
        <CancelButton type="button" fullWidth onClick={() => navigate('/delivery')}>
          Cancel
        </CancelButton>
      </ReceiptRail>
    </DocumentShell>
  );
}
