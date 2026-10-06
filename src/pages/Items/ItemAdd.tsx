import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { reserveCodeIfAuto } from '../../api/CodeSettingApi';
import { ItemGroupSelect } from '../../components/shared/ItemGroupSelect';
import { ItemCategorySelect } from '../../components/ui/ItemCategorySelect';
import { BrandSelect } from '../../components/ui/BrandSelect';
import { ItemUomSelect } from '../../components/ui/ItemUomSelect';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { TwoOptionToggle } from '../../components/ui/TwoOptionToggle';
import { Plus, Trash2, Upload, Edit } from 'lucide-react';
import type { ItemFormData } from '../../types/Item';
import { FormSkeleton, Skeleton, type FormSkeletonField } from '../../components/ui/skeleton';

// Mirrors the Item tab: code; name; description; category/brand, group/barcode, weight/shelf life, volume; two toggles; image.
const ITEM_TAB_FIELDS: FormSkeletonField[] = ['code', 'input', 'input', ['input', 'input'], ['input', 'input'], ['input', 'input'], ['input'], ['toggle', 'toggle']];
const ITEM_TAB_WIDTHS = ['w-8', 'w-8', 'w-24'];

/** The drawer opens on the Item tab, so that is what the skeleton shows — tab bar included. */
function ItemFormSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex gap-6">
          {ITEM_TAB_WIDTHS.map((w, i) => (
            <div key={i} className="flex h-[46px] items-center">
              <Skeleton className={`h-3.5 ${w}`} />
            </div>
          ))}
        </div>
      </div>
      <div className="space-y-8 bg-white p-6 dark:bg-gray-800">
        <FormSkeleton bare fields={ITEM_TAB_FIELDS} />
        <FormSkeleton bare fields={['upload']} />
      </div>
    </div>
  );
}

interface ItemAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void | Promise<void>;
  initialData?: ItemFormData;
  isLoading?: boolean;
}

const defaultValues: ItemFormData = {
  itemCategoryId: '',
  brandId: '',
  itemGroupId: '',
  itemUomId: '', // Base UOM
  itemCode: '',
  itemName: '',
  description: '',
  itemBarcode: '',
  itemWeight: 0,
  itemShelfLife: 0,
  isTaxApply: false,
  vatPercentage: 0,
  exciseRate: 0,
  sku: '',
  volume: 0,
  itemPrice: 0, // This is mapped as Base UOM Price in the new UI, or general
  costPrice: 0,
  itemImage: '',
  status: true,
  lowerUnitItemUpc: 0,
  isNewLaunch: false,
  isPromotional: false,
  launchStartDate: '',
  launchEndDate: '',
  secondaryUoms: [],
  // UOM Specifics
  baseUomPurchasePrice: 0,
  isBaseUomSku: false,
  baseUomUpc: 0,
  baseUomPrice: 0,
  // Product Catalog Specifics
  isProductCatalog: false,
  netWeight: '',
  flavor: '',
  shelfLifeCatalog: '',
  ingredients: '',
  energy: '',
  fat: '',
  protein: '',
  carbohydrate: '',
  calcium: '',
  sodium: '',
  potassium: '',
  crudeFibre: '',
  vitamin: '',
  catalogImage: '',
};

export function ItemAdd({ isOpen, onClose, onSubmit, initialData, isLoading = false }: ItemAddProps) {
  const [activeTab, setActiveTab] = useState<'item' | 'uom' | 'catalog'>('item');

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({ defaultValues });

  const [codeLocked, setCodeLocked] = useState(false);

  const { fields, append, remove, update } = useFieldArray({ control, name: 'secondaryUoms' });

  const [stagedUom, setStagedUom] = useState<any>({ uomId: 0, conversionFactor: 1, price: 0, upc: 0, isSku: false, purchasePrice: 0, uomName: '' });
  const [editingUomIndex, setEditingUomIndex] = useState<number | null>(null);

  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');

  const savedOptions = useMemo(() => {
    const d = (initialData ?? {}) as any;
    const opt = (value: unknown, label?: string) => (value && label ? { value: String(value), label } : null);
    return {
      category: opt(d.itemCategoryId, d.itemCategory?.categoryName),
      brand: opt(d.brandId, d.brand?.brandName),
      group: opt(d.itemGroupId, d.itemGroup && (d.itemGroup.code ? `${d.itemGroup.code} - ${d.itemGroup.name}` : d.itemGroup.name)),
      uom: opt(d.itemUomId, d.itemUom && `${d.itemUom.name} (${d.itemUom.code})`),
    };
  }, [initialData]);

  const watchIsProductCatalog = watch('isProductCatalog');
  const watchIsPromotional = watch('isPromotional');
  const watchIsBaseUomSku = watch('isBaseUomSku');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.itemImage) setItemImagePreview(initialData.itemImage);
    } else {
      reset(defaultValues);
      setItemImagePreview('');
      setItemImageFile(null);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ItemFormData) => {
    const resolvedCode = await reserveCodeIfAuto('item', data.itemCode);
    if (resolvedCode !== data.itemCode) {
      setValue('itemCode', resolvedCode ?? '');
      setCodeLocked(true);
    }

    const formData = { ...data, itemCode: resolvedCode ?? data.itemCode, itemImage: itemImageFile ? itemImageFile.name : data.itemImage };
    await onSubmit(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setItemImageFile(file);
        setItemImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddStagedUom = () => {
    if (!stagedUom.uomId) {
      return;
    }
    if (editingUomIndex !== null) {
      update(editingUomIndex, stagedUom);
      setEditingUomIndex(null);
    } else {
      append(stagedUom);
    }
    setStagedUom({ uomId: 0, conversionFactor: 1, price: 0, upc: 0, isSku: false, purchasePrice: 0, uomName: '' });
  };

  const handleEditStagedUom = (index: number) => {
    setStagedUom(fields[index]);
    setEditingUomIndex(index);
  };

  return (
    <Drawer
      isLoading={isLoading}
      skeleton={<ItemFormSkeleton />}
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item' : 'Add Item'}
      width="w-[700px]"
      footer={
        <div className="flex justify-end gap-3 flex-1">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>
            Cancel
          </CancelButton>
          <SaveButton form="item-add-form" type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      }
    >
      <form id="item-add-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        {/* Tabs Row */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 overflow-x-auto">
            {['item', 'uom', 'catalog'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab as any)}
                className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab === 'item' ? 'Item' : tab === 'uom' ? 'UOM' : 'Product Catalog'}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="p-6 bg-white dark:bg-gray-800">
          {/* Item Tab */}
          {activeTab === 'item' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 gap-8">
                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Item Code <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <Input {...register('itemCode')} placeholder="Configure the system to auto-generate the code." error={errors.itemCode?.message} disabled={codeLocked} />
                      <OrderCodeSettingsIcon label="Item Code" value={watch('itemCode') || ''} onChange={(v) => setValue('itemCode', v)} entityKey="item" onLockChange={setCodeLocked} />
                    </div>
                  </div>
                  <Input label="Item Name" required {...register('itemName', { required: 'Name is required' })} error={errors.itemName?.message} />
                  <Input label="Item Description" {...register('description')} />

                  <div className="grid grid-cols-2 gap-4">
                    <ItemCategorySelect
                      value={watch('itemCategoryId')?.toString() || ''}
                      onChange={(value) => setValue('itemCategoryId', value)}
                      initialOption={savedOptions.category}
                      error={errors.itemCategoryId?.message}
                    />
                    <BrandSelect value={watch('brandId')?.toString() || ''} onChange={(value) => setValue('brandId', value)} initialOption={savedOptions.brand} error={errors.brandId?.message} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ItemGroupSelect
                      label="Item Group"
                      value={watch('itemGroupId')?.toString() || ''}
                      onChange={(value) => setValue('itemGroupId', value)}
                      initialOption={savedOptions.group}
                      required
                    />
                    <Input label="Item Barcode" {...register('itemBarcode')} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Item Weight (KG)" type="number" step="0.001" {...register('itemWeight', { valueAsNumber: true })} />
                    <Input label="Item Shelf Life (Days)" type="number" {...register('itemShelfLife', { valueAsNumber: true })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Volume (ltr)" type="number" step="0.01" {...register('volume', { valueAsNumber: true })} />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        Is Promotional <span className="text-red-500 font-bold ml-0.5">*</span>
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={watchIsPromotional === true} onChange={(e) => setValue('isPromotional', e.target.checked)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">New Launch</label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" {...register('isNewLaunch')} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Item Image Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Item Image</h3>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-500" />
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">Choose file</span> No file chosen
                        </p>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  {itemImagePreview && (
                    <div className="mt-4">
                      <img src={itemImagePreview} alt="Preview" className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* UOM Tab */}
          {activeTab === 'uom' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              {/* Base UOM */}
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <ItemUomSelect label="Base UOM" value={watch('itemUomId')?.toString() || ''} onChange={(val) => setValue('itemUomId', val)} initialOption={savedOptions.uom} required />
                  <Input
                    label="Base UOM Purchase Price"
                    required
                    type="number"
                    step="0.01"
                    {...register('baseUomPurchasePrice', { valueAsNumber: true, required: 'Required' })}
                    error={errors.baseUomPurchasePrice?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Is stock keeping unit ?</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="baseUomIsSku"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        checked={watchIsBaseUomSku === true}
                        onChange={() => setValue('isBaseUomSku', true)}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="baseUomIsSku"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        checked={watchIsBaseUomSku === false}
                        onChange={() => setValue('isBaseUomSku', false)}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Base UOM UPC" required type="number" {...register('baseUomUpc', { valueAsNumber: true, required: 'Required' })} error={errors.baseUomUpc?.message} />
                  <Input label="Base UOM Price" required type="number" step="0.01" {...register('baseUomPrice', { valueAsNumber: true, required: 'Required' })} error={errors.baseUomPrice?.message} />
                </div>
              </div>

              <hr className="border-gray-200 dark:border-gray-700" />

              {/* Secondary UOM */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Secondary UOM</h3>

                <div className="grid grid-cols-2 gap-4">
                  <ItemUomSelect
                    label="UOM"
                    value={stagedUom.uomId || ''}
                    onChange={(val) => setStagedUom((prev: any) => ({ ...prev, uomId: parseInt(val) }))}
                    onSelectOption={(opt) => setStagedUom((prev: any) => ({ ...prev, uomName: opt.label }))}
                    initialOption={stagedUom.uomId && stagedUom.uomName ? { value: String(stagedUom.uomId), label: stagedUom.uomName } : null}
                  />
                  <Input label="UPC" type="number" value={stagedUom.upc || ''} onChange={(e) => setStagedUom((prev: any) => ({ ...prev, upc: Number(e.target.value) }))} />
                </div>

                <Input label="Price" type="number" step="0.01" value={stagedUom.price || ''} onChange={(e) => setStagedUom((prev: any) => ({ ...prev, price: Number(e.target.value) }))} />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Is stock keeping unit ?</label>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="secUomIsSku"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        checked={stagedUom.isSku === true}
                        onChange={() => setStagedUom((prev: any) => ({ ...prev, isSku: true }))}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">Yes</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="secUomIsSku"
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                        checked={stagedUom.isSku === false}
                        onChange={() => setStagedUom((prev: any) => ({ ...prev, isSku: false }))}
                      />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">No</span>
                    </label>
                  </div>
                </div>

                <Input
                  label="Purchase Price"
                  type="number"
                  step="0.01"
                  value={stagedUom.purchasePrice || ''}
                  onChange={(e) => setStagedUom((prev: any) => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                />

                <div>
                  <button
                    type="button"
                    onClick={handleAddStagedUom}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-md transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {editingUomIndex !== null ? 'Update' : 'Add'}
                  </button>
                </div>

                {/* Table */}
                {fields.length > 0 && (
                  <div className="overflow-x-auto rounded-lg shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mt-6">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">UOM</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">UPC</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Price</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Stock Keeping Unit</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Purchase Price</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                        {fields.map((field: any, idx) => (
                          <tr key={field.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-300">{field.uomName || field.uomId}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{field.upc}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{field.price}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{field.isSku ? 'Yes' : 'No'}</td>
                            <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{field.purchasePrice}</td>
                            <td className="px-4 py-3 text-sm text-right space-x-2 whitespace-nowrap">
                              <button type="button" onClick={() => handleEditStagedUom(idx)} className="text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                                <Edit className="w-4 h-4 inline-block" />
                              </button>
                              <button type="button" onClick={() => remove(idx)} className="text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4 inline-block" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Product Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Is Product Catalog <span className="text-red-500 font-bold ml-0.5">*</span>
                </label>
                <TwoOptionToggle value={watchIsProductCatalog === true} onChange={(v) => setValue('isProductCatalog', v)} />
              </div>

              {watchIsProductCatalog && (
                <div className="space-y-4">
                  <SectionLabel title="Nutritional Information" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="Net Weight" {...register('netWeight')} />
                    <Input label="Flavor" {...register('flavor')} />
                    <Input label="Shelf Life" {...register('shelfLifeCatalog')} />
                    <Input label="Ingredients" {...register('ingredients')} />
                    <Input label="Energy" {...register('energy')} />
                    <Input label="Fat" {...register('fat')} />
                    <Input label="Protein" {...register('protein')} />
                    <Input label="Carbohydrate" {...register('carbohydrate')} />
                    <Input label="Calcium" {...register('calcium')} />
                    <Input label="Sodium" {...register('sodium')} />
                    <Input label="Potassium" {...register('potassium')} />
                    <Input label="Crude Fibre" {...register('crudeFibre')} />
                    <Input label="Vitamin" {...register('vitamin')} />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </form>
    </Drawer>
  );
}
