import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { HierarchicalCreatableSelect } from '../../components/ui/HierarchicalCreatableSelect';
import { useItem } from '../../providers/ItemProvider';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';
import { ItemGroupSelect } from '../../components/shared/ItemGroupSelect';
import { SectionLabel } from '../../components/ui/SectionLabel';
import { TwoOptionToggle } from '../../components/ui/TwoOptionToggle';
import { Plus, Trash2, Upload } from 'lucide-react';
import type { ItemFormData, ItemCategory, Brand, ItemUom } from '../../types/Item';

interface ItemAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ItemFormData) => void | Promise<void>;
  initialData?: ItemFormData;
  isLoading?: boolean;
  categories?: ItemCategory[];
  brands?: Brand[];
  uoms?: ItemUom[];
}

const defaultValues: ItemFormData = {
  itemCategoryId: '',
  brandId: '',
  itemGroupId: '',
  itemUomId: '', // Base UOM
  itemCode: '',
  erpCode: '',
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

export function ItemAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  categories: propCategories = [],
  brands: propBrands = [],
  uoms: propUoms = [],
}: ItemAddProps) {
  const [activeTab, setActiveTab] = useState<'item' | 'uom' | 'catalog'>('item');

  const {
    categories: contextCategories,
    brands: contextBrands,
    uoms: contextUoms,
    createCategoryOption,
    createBrandOption,
  } = useItem();

  const categories = propCategories.length > 0 ? propCategories : contextCategories;
  const brands = propBrands.length > 0 ? propBrands : contextBrands;
  const uoms = propUoms.length > 0 ? propUoms : contextUoms;

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ItemFormData>({ defaultValues });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'secondaryUoms',
  });

  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');

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
    const formData = {
      ...data,
      itemImage: itemImageFile ? itemImageFile.name : data.itemImage,
    };
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

  const addSecondaryUom = () => {
    append({
      uomId: 0,
      conversionFactor: 1,
      price: 0,
      upc: 0,
      isSku: false,
      purchasePrice: 0,
    });
  };

  // Convert options
  const categoryOptions: SelectOption[] = categories.map(cat => ({
    value: cat.id?.toString() || '',
    label: cat.categoryName,
  }));

  const brandOptions: SelectOption[] = brands.map(brand => ({
    value: brand.id?.toString() || '',
    label: brand.brandName,
  }));

  const uomOptions: SelectOption[] = uoms.map(uom => ({
    value: uom.id?.toString() || '',
    label: `${uom.name} (${uom.code})`,
  }));

  return (
    <Drawer
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
                className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${activeTab === tab
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
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Item Code*</label>
                    </div>
                    <div className="flex items-center gap-2 relative">
                      <Input
                        {...register('itemCode', { required: 'Code is required' })}
                        error={errors.itemCode?.message}
                      />
                      <OrderCodeSettingsIcon label="Item Code" value={watch('itemCode') || ''} onChange={(v) => setValue('itemCode', v)} />
                    </div>
                  </div>
                  <Input
                    label="Item Name*"
                    {...register('itemName', { required: 'Name is required' })}
                    error={errors.itemName?.message}
                  />
                  <Input
                    label="Item Description"
                    {...register('description')}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <HierarchicalCreatableSelect
                      label="Category*"
                      value={watch('itemCategoryId')?.toString() || ''}
                      onChange={(value) => setValue('itemCategoryId', value)}
                      options={categoryOptions}
                      placeholder="Select Category"
                      createLabel="Add New Category"
                      onCreate={createCategoryOption}
                      nameField="categoryName"
                      nameLabel="Category Name"
                      parentLabel="Parent Category"
                    />
                    <HierarchicalCreatableSelect
                      label="Brand*"
                      value={watch('brandId')?.toString() || ''}
                      onChange={(value) => setValue('brandId', value)}
                      options={brandOptions}
                      placeholder="Select Brand"
                      createLabel="Add New Brand"
                      onCreate={createBrandOption}
                      nameField="brandName"
                      nameLabel="Brand Name"
                      parentLabel="Parent Brand"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <ItemGroupSelect
                      label="Item Group"
                      value={watch('itemGroupId')?.toString() || ''}
                      onChange={(value) => setValue('itemGroupId', value)}
                      required
                    />
                    <Input
                      label="Item Barcode"
                      {...register('itemBarcode')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Item Weight (KG)"
                      type="number"
                      step="0.001"
                      {...register('itemWeight', { valueAsNumber: true })}
                    />
                    <Input
                      label="Item Shelf Life (Days)"
                      type="number"
                      {...register('itemShelfLife', { valueAsNumber: true })}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Volume (ltr)"
                      type="number"
                      step="0.01"
                      {...register('volume', { valueAsNumber: true })}
                    />
                    <Input
                      label="ERP Code"
                      {...register('erpCode')}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        Is Promotional*
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={watchIsPromotional === true}
                          onChange={(e) => setValue('isPromotional', e.target.checked)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 shadow-sm">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
                        New Launch
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          {...register('isNewLaunch')}
                        />
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
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                  {itemImagePreview && (
                    <div className="mt-4">
                      <img
                        src={itemImagePreview}
                        alt="Preview"
                        className="h-32 w-32 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
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
              <div className="space-y-4">
                <SectionLabel title="Base UOM" />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Base UOM*"
                    value={watch('itemUomId')?.toString() || ''}
                    onChange={(e) => setValue('itemUomId', e.target.value)}
                    options={uomOptions}
                    required
                  />
                  <Input
                    label="Base UOM Purchase Price*"
                    type="number"
                    step="0.01"
                    {...register('baseUomPurchasePrice', { valueAsNumber: true, required: 'Required' })}
                    error={errors.baseUomPurchasePrice?.message}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Base UOM UPC*"
                    type="number"
                    {...register('baseUomUpc', { valueAsNumber: true, required: 'Required' })}
                    error={errors.baseUomUpc?.message}
                  />
                  <Input
                    label="Base UOM Price*"
                    type="number"
                    step="0.01"
                    {...register('baseUomPrice', { valueAsNumber: true, required: 'Required' })}
                    error={errors.baseUomPrice?.message}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock keeping unit</label>
                  <TwoOptionToggle value={watchIsBaseUomSku === true} onChange={(v) => setValue('isBaseUomSku', v)} />
                </div>
              </div>

              {/* Secondary UOM */}
              <div className="space-y-4">
                <SectionLabel
                  title="Secondary UOM"
                  action={
                    <button
                      type="button"
                      onClick={addSecondaryUom}
                      className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add UOM
                    </button>
                  }
                />

                {fields.length === 0 && (
                  <p className="text-sm text-gray-400 dark:text-gray-500 py-2">No secondary UOMs added yet.</p>
                )}

                {fields.map((field, index) => (
                  <div key={field.id} className="relative space-y-4 p-4 border border-gray-200 dark:border-gray-800 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
                        UOM {index + 1}
                      </span>
                      <button type="button" onClick={() => remove(index)} className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Select
                        label="UOM"
                        value={watch(`secondaryUoms.${index}.uomId`)?.toString() || ''}
                        onChange={(e) => setValue(`secondaryUoms.${index}.uomId`, parseInt(e.target.value))}
                        options={uomOptions}
                      />
                      <Input
                        label="UPC"
                        type="number"
                        {...register(`secondaryUoms.${index}.upc`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        {...register(`secondaryUoms.${index}.price`, { valueAsNumber: true })}
                      />
                      <Input
                        label="Purchase Price"
                        type="number"
                        step="0.01"
                        {...register(`secondaryUoms.${index}.purchasePrice`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stock keeping unit</label>
                      <TwoOptionToggle
                        value={watch(`secondaryUoms.${index}.isSku`) === true}
                        onChange={(v) => setValue(`secondaryUoms.${index}.isSku`, v)}
                      />
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

          {/* Product Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8">

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Is Product Catalog*</label>
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