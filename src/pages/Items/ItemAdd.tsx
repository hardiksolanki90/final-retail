import { useEffect, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { Select, type SelectOption } from '../../components/ui/Select';
import { SaveButton, CancelButton } from '../../components/ui/Button';
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
  groups?: any[]; // For Item Group
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
  categories = [],
  brands = [],
  uoms = [],
  groups = [],
}: ItemAddProps) {
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

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'secondaryUoms',
  });

  const [itemImageFile, setItemImageFile] = useState<File | null>(null);
  const [itemImagePreview, setItemImagePreview] = useState<string>('');
  
  const [catalogImageFile, setCatalogImageFile] = useState<File | null>(null);
  const [catalogImagePreview, setCatalogImagePreview] = useState<string>('');

  const watchIsProductCatalog = watch('isProductCatalog');
  const watchIsPromotional = watch('isPromotional');
  const watchIsBaseUomSku = watch('isBaseUomSku');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      if (initialData.itemImage) setItemImagePreview(initialData.itemImage);
      if (initialData.catalogImage) setCatalogImagePreview(initialData.catalogImage);
    } else {
      reset(defaultValues);
      setItemImagePreview('');
      setCatalogImagePreview('');
      setItemImageFile(null);
      setCatalogImageFile(null);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ItemFormData) => {
    const formData = {
      ...data,
      itemImage: itemImageFile ? itemImageFile.name : data.itemImage,
      catalogImage: catalogImageFile ? catalogImageFile.name : data.catalogImage,
    };
    await onSubmit(formData);
    onClose();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'item' | 'catalog') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'item') {
          setItemImageFile(file);
          setItemImagePreview(reader.result as string);
        } else {
          setCatalogImageFile(file);
          setCatalogImagePreview(reader.result as string);
        }
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

  const groupOptions: SelectOption[] = groups.map(group => ({
    value: group.id?.toString() || '',
    label: group.name || 'Group',
  }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Item' : 'Add Item'}
      width="w-[900px]"
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
      <form id="item-add-form" onSubmit={handleSubmit(onFormSubmit)} className="flex flex-col h-full bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        
        {/* Tabs Row */}
        <div className="bg-white dark:bg-gray-800 px-6 border-b border-gray-200 dark:border-gray-700">
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
        <div className="flex-1 overflow-y-auto p-6 bg-white dark:bg-gray-800 min-h-full">
          
          {/* Item Tab */}
          {activeTab === 'item' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              
              <div className="grid grid-cols-2 gap-8">
                {/* Left Col */}
                <div className="space-y-4">
                  <Input
                    label="Item Code*"
                    {...register('itemCode', { required: 'Code is required' })}
                    error={errors.itemCode?.message}
                  />
                  <Input
                    label="Item Name*"
                    {...register('itemName', { required: 'Name is required' })}
                    error={errors.itemName?.message}
                  />
                  <Input
                    label="Item Description"
                    {...register('description')}
                    as="textarea"
                    rows={3}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Category*"
                      value={watch('itemCategoryId')?.toString() || ''}
                      onChange={(value) => setValue('itemCategoryId', value)}
                      options={categoryOptions}
                      required
                    />
                    <Select
                      label="Brand*"
                      value={watch('brandId')?.toString() || ''}
                      onChange={(value) => setValue('brandId', value)}
                      options={brandOptions}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Select
                      label="Item Group*"
                      value={watch('itemGroupId')?.toString() || ''}
                      onChange={(value) => setValue('itemGroupId', value)}
                      options={groupOptions}
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Is Promotional*</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="radio" checked={watchIsPromotional === true} onChange={() => setValue('isPromotional', true)} className="text-primary-600 focus:ring-primary-500" /> Yes
                      </label>
                      <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <input type="radio" checked={watchIsPromotional === false} onChange={() => setValue('isPromotional', false)} className="text-primary-600 focus:ring-primary-500" /> No
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2 pt-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                      <input type="checkbox" {...register('isNewLaunch')} className="rounded border-gray-300 text-primary-600 focus:ring-primary-500" />
                      New Launch
                    </label>
                  </div>
                </div>

                {/* Right Col */}
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
                        onChange={(e) => handleImageChange(e, 'item')}
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
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Base UOM*"
                    value={watch('itemUomId')?.toString() || ''}
                    onChange={(value) => setValue('itemUomId', value)}
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

                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Is stock keeping unit ?</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="radio" checked={watchIsBaseUomSku === true} onChange={() => setValue('isBaseUomSku', true)} className="text-primary-600 focus:ring-primary-500" /> Yes
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <input type="radio" checked={watchIsBaseUomSku === false} onChange={() => setValue('isBaseUomSku', false)} className="text-primary-600 focus:ring-primary-500" /> No
                    </label>
                  </div>
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
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 my-6"></div>

              {/* Secondary UOM */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Secondary UOM</h3>
                
                {fields.map((field, index) => (
                  <div key={field.id} className="relative space-y-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-800/50">
                    <div className="absolute top-2 right-2">
                      <button type="button" onClick={() => remove(index)} className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pr-8">
                      <Select
                        label="UOM"
                        value={watch(`secondaryUoms.${index}.uomId`)?.toString() || ''}
                        onChange={(value) => setValue(`secondaryUoms.${index}.uomId`, parseInt(value))}
                        options={uomOptions}
                      />
                      <Input
                        label="UPC"
                        type="number"
                        {...register(`secondaryUoms.${index}.upc`, { valueAsNumber: true })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 pr-8">
                      <Input
                        label="Price"
                        type="number"
                        step="0.01"
                        {...register(`secondaryUoms.${index}.price`, { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Is stock keeping unit ?</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input type="radio" checked={watch(`secondaryUoms.${index}.isSku`) === true} onChange={() => setValue(`secondaryUoms.${index}.isSku`, true)} className="text-primary-600 focus:ring-primary-500" /> Yes
                        </label>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input type="radio" checked={watch(`secondaryUoms.${index}.isSku`) === false} onChange={() => setValue(`secondaryUoms.${index}.isSku`, false)} className="text-primary-600 focus:ring-primary-500" /> No
                        </label>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pr-8">
                      <Input
                        label="Purchase Price"
                        type="number"
                        step="0.01"
                        {...register(`secondaryUoms.${index}.purchasePrice`, { valueAsNumber: true })}
                      />
                    </div>

                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSecondaryUom}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 dark:border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:hover:bg-green-900/50 rounded-md transition-colors w-max mt-4"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>

            </div>
          )}

          {/* Product Catalog Tab */}
          {activeTab === 'catalog' && (
            <div className="space-y-6 max-w-4xl mx-auto pb-8">
              
              <div className="space-y-2 mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Is Product Catalog*</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" checked={watchIsProductCatalog === true} onChange={() => setValue('isProductCatalog', true)} className="text-primary-600 focus:ring-primary-500" /> Yes
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                    <input type="radio" checked={watchIsProductCatalog === false} onChange={() => setValue('isProductCatalog', false)} className="text-primary-600 focus:ring-primary-500" /> No
                  </label>
                </div>
              </div>

              <div className="space-y-4 border-l-2 border-primary-200 dark:border-primary-800 pl-4 py-1">
                <Input label="Net Weight:" {...register('netWeight')} />
                <Input label="Flavor:" {...register('flavor')} />
                <Input label="Shelf Life:" {...register('shelfLifeCatalog')} />
                <Input label="Ingredients:" {...register('ingredients')} />
                <Input label="Energy:" {...register('energy')} />
                <Input label="Fat:" {...register('fat')} />
                <Input label="Protein:" {...register('protein')} />
                <Input label="Carbohydrate:" {...register('carbohydrate')} />
                <Input label="Calcium:" {...register('calcium')} />
                <Input label="Sodium:" {...register('sodium')} />
                <Input label="Potassium:" {...register('potassium')} />
                <Input label="Crude Fibre:" {...register('crudeFibre')} />
                <Input label="Vitamin:" {...register('vitamin')} />
              </div>

              <div className="space-y-4 pt-4">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Image:</h3>
                <div className="flex items-center justify-center w-full max-w-md">
                  <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-600">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Choose file</span> No file chosen
                      </p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'catalog')}
                    />
                  </label>
                </div>
                {catalogImagePreview && (
                  <div className="mt-4">
                    <img
                      src={catalogImagePreview}
                      alt="Catalog preview"
                      className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                )}
              </div>

            </div>
          )}

        </div>
      </form>
    </Drawer>
  );
}