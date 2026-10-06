import { useState, useRef, useEffect } from 'react';
import { Drawer } from '../../components/ui/Drawer';
import { ChevronDown, Edit, ImageOff, PackageOpen, Pencil } from 'lucide-react';
import { useMoney } from '../../hooks/Currency/useMoney';
import { useEntityDetail } from '../../hooks/useEntityDetail';
import { getItemDetails } from '../../api/ItemApi';
import { Skeleton, SkeletonRegion } from '../../components/ui/skeleton';

const hasValue = (value: unknown) => value !== undefined && value !== null && value !== '';

type CatalogKey = 'netWeight' | 'flavor' | 'shelfLifeCatalog' | 'ingredients' | 'energy' | 'fat' | 'protein' | 'carbohydrate' | 'calcium' | 'sodium' | 'potassium' | 'crudeFibre' | 'vitamin';

const SPEC_FIELDS: { key: CatalogKey; label: string }[] = [
  { key: 'netWeight', label: 'Net weight' },
  { key: 'flavor', label: 'Flavor' },
  { key: 'shelfLifeCatalog', label: 'Shelf life' },
];

// Energy leads the label (like "Calories"); macros, then minerals & others below a heavy rule.
const MACRO_FIELDS: { key: CatalogKey; label: string }[] = [
  { key: 'fat', label: 'Fat' },
  { key: 'carbohydrate', label: 'Carbohydrate' },
  { key: 'protein', label: 'Protein' },
  { key: 'crudeFibre', label: 'Crude fibre' },
];
const MINERAL_FIELDS: { key: CatalogKey; label: string }[] = [
  { key: 'sodium', label: 'Sodium' },
  { key: 'potassium', label: 'Potassium' },
  { key: 'calcium', label: 'Calcium' },
  { key: 'vitamin', label: 'Vitamin' },
];

const CATALOG_FIELDS: CatalogKey[] = ['ingredients', 'energy', ...[...SPEC_FIELDS, ...MACRO_FIELDS, ...MINERAL_FIELDS].map((f) => f.key)];

// Stands in for a value that comes from the full item record, which is still loading (one 20px text line).
const pending = (
  <div className="flex h-5 items-center">
    <Skeleton className="h-4 w-28" />
  </div>
);

const mono = 'font-[family-name:var(--font-mono-ui)]';
const eyebrowCls = `text-[10px] uppercase tracking-[0.22em] text-gray-400 dark:text-gray-500 ${mono}`;

/** A value or a quiet dash — so a half-filled catalog still reads as one consistent sheet. */
function CatalogValue({ value }: { value: unknown }) {
  return hasValue(value) ? <span className="tabular-nums">{String(value)}</span> : <span className="text-gray-300 dark:text-gray-600">—</span>;
}

/** Thick / thin rules are the whole design language of a nutrition label. */
function NutritionRow({ label, value, strong = false, indent = false }: { label: string; value: unknown; strong?: boolean; indent?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 border-t border-gray-900/80 dark:border-gray-300/60 py-1.5 ${indent ? 'pl-4' : ''}`}>
      <span className={strong ? 'font-bold' : 'font-medium text-gray-700 dark:text-gray-300'}>{label}</span>
      <span className={`${mono} text-[13px] ${strong ? 'font-bold' : ''}`}>
        <CatalogValue value={value} />
      </span>
    </div>
  );
}

interface ItemViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any | null; // using any since type Item from List is limited currently
  onEdit?: () => void;
}

export function ItemViewDrawer({ isOpen, onClose, data, onEdit }: ItemViewDrawerProps) {
  const { format } = useMoney();
  // The list row is lean — the full item (catalog, weight, group, prices…) comes from the same cache the Edit drawer uses.
  const { data: item, isLoading: itemLoading, isError: itemFailed } = useEntityDetail('item', getItemDetails, data?.uuid);
  const [activeTab, setActiveTab] = useState('general');
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(event.target as Node)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tabs = [
    { id: 'general', label: 'General' },
    { id: 'catalog', label: 'Product Catalog' },
    { id: 'uom', label: 'UOM' },
  ];

  if (!data) return null;

  const displayName = data.itemName || data.name || 'Unknown Item';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={displayName}
      width="w-[70%]"
      headerActions={
        <div className="flex items-center gap-2">
          {onEdit && (
            <button onClick={onEdit} className="p-2 cursor-pointer border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
          )}
          <div className="relative" ref={moreRef}>
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300"
            >
              More <ChevronDown className="w-4 h-4" />
            </button>
            {isMoreOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-10 overflow-hidden">
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setIsMoreOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  Inactive
                </button>
              </div>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800">
        {/* Tabs Row */}
        <div className="px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex gap-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-600 text-primary-600 dark:text-primary-400 dark:border-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 overflow-y-auto">
          {/* General Tab */}
          {activeTab === 'general' && (
            <div className="p-8 max-w-4xl">
              <div className="grid grid-cols-2 gap-x-12 gap-y-6">
                {/* Left Column Details */}
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Item code</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.itemCode || data.code || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item name</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.itemName || data.name || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item barcode</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item?.itemBarcode || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item description</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item?.description || data.description || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item Weight</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item?.itemWeight != null ? Number(item.itemWeight).toFixed(2) : '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item Shelf life</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : (item?.itemShelfLife ?? '—')}</div>

                    <div className="text-gray-500 dark:text-gray-400">Item Group</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item?.itemGroup?.name || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Category</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.category?.name || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Brand</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{data.brand?.name || '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Volume</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item?.volume != null ? Number(item.volume).toFixed(2) : '—'}</div>

                    <div className="text-gray-500 dark:text-gray-400">Tax status</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : item ? (item.isTaxApply ? 'Tax applicable' : 'Tax exempt') : '—'}</div>
                  </div>
                </div>

                {/* Right Column: Base UOM */}
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Base UOM</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-gray-500 dark:text-gray-400">Base UOM</div>
                    <div className="font-semibold text-gray-900 dark:text-white">
                      {itemLoading ? pending : item?.itemUom ? [item.itemUom.code, item.itemUom.name].filter(Boolean).join(' - ') : '—'}
                    </div>

                    <div className="text-gray-500 dark:text-gray-400">Base UPC</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : (item?.baseUomUpc ?? item?.lowerUnitItemUpc ?? '—')}</div>

                    <div className="text-gray-500 dark:text-gray-400">Base Price</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : format(item?.baseUomPrice ?? item?.itemPrice ?? data.itemPrice ?? data.price)}</div>

                    <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                    <div className="font-semibold text-gray-900 dark:text-white">{itemLoading ? pending : format(item?.baseUomPurchasePrice ?? item?.costPrice ?? data.costPrice)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* UOM Tab */}
          {activeTab === 'uom' && (
            <div className="p-8 max-w-4xl">
              <div className="space-y-8">
                {/* Secondary UOMs Block 1 */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    Secondary UOMs
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">2</span>
                  </h3>
                  <div className="grid grid-cols-2 col-span-2 gap-12 text-sm pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-500 dark:text-gray-400">Item UOM</div>
                      <div className="font-semibold text-gray-900 dark:text-white">OT</div>

                      <div className="text-gray-500 dark:text-gray-400">Item UPC</div>
                      <div className="font-semibold text-gray-900 dark:text-white">6</div>

                      <div className="text-gray-500 dark:text-gray-400">Item Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{format(0)}</div>

                      <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{format(0)}</div>
                    </div>
                  </div>
                </div>

                {/* Secondary UOMs Block 2 */}
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    Secondary UOMs
                    <span className="bg-primary-600 text-white text-xs px-2 py-0.5 rounded-full font-medium">3</span>
                  </h3>
                  <div className="grid grid-cols-2 gap-12 text-sm pl-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-gray-500 dark:text-gray-400">Item UOM</div>
                      <div className="font-semibold text-gray-900 dark:text-white">CT</div>

                      <div className="text-gray-500 dark:text-gray-400">Item UPC</div>
                      <div className="font-semibold text-gray-900 dark:text-white">24</div>

                      <div className="text-gray-500 dark:text-gray-400">Item Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{format(0)}</div>

                      <div className="text-gray-500 dark:text-gray-400">Purchase Price</div>
                      <div className="font-semibold text-gray-900 dark:text-white">{format(0)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Product Catalog Tab — a product spec sheet anchored by a nutrition-facts label */}
          {activeTab === 'catalog' && (
            <div className="p-6 sm:p-8">
              {itemLoading ? (
                <SkeletonRegion label="Loading product catalog" className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
                  <div className="space-y-6">
                    <div className="flex gap-5">
                      <Skeleton className="h-36 w-36 shrink-0 rounded-xl" />
                      <div className="flex-1 space-y-3 self-center">
                        <Skeleton className="h-2.5 w-20" />
                        <Skeleton className="h-7 w-3/4" />
                        <Skeleton className="h-5 w-24 rounded-full" />
                      </div>
                    </div>
                    <Skeleton className="h-[74px] w-full rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-2.5 w-20" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-5/6" />
                    </div>
                  </div>
                  <Skeleton className="h-[26rem] w-full self-start rounded-lg" />
                </SkeletonRegion>
              ) : itemFailed || !item ? (
                <p className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">Couldn't load the product catalog. Close and reopen the item to try again.</p>
              ) : !CATALOG_FIELDS.some((key) => hasValue(item[key])) && !item.catalogImage ? (
                /* Empty: a ghost of the label it will become, and one clear next step */
                <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-700 px-8 py-12 text-center">
                  <div className="relative mb-6 w-40 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 p-3 text-left" aria-hidden="true">
                    <div className="h-2.5 w-24 rounded-sm bg-gray-300 dark:bg-gray-600" />
                    <div className="mt-2 h-1.5 border-t-4 border-gray-300 dark:border-gray-600" />
                    {[70, 85, 55, 75].map((w, i) => (
                      <div key={i} className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 py-1.5">
                        <div className="h-1.5 rounded-sm bg-gray-200 dark:bg-gray-700" style={{ width: `${w}%` }} />
                        <div className="h-1.5 w-4 rounded-sm bg-gray-200 dark:bg-gray-700" />
                      </div>
                    ))}
                    <PackageOpen className="absolute -right-4 -bottom-4 h-9 w-9 rounded-full bg-primary-600 p-2 text-white shadow-md" />
                  </div>
                  <p className={eyebrowCls}>Product catalog</p>
                  <h3 className="mt-2 font-display text-xl font-bold tracking-tight text-gray-900 dark:text-white">No catalog details yet</h3>
                  <p className="mt-2 max-w-sm text-sm text-gray-500 dark:text-gray-400">Add the net weight, flavor, ingredients and nutrition values so this item's catalog page is complete.</p>
                  {onEdit && (
                    <button
                      type="button"
                      onClick={onEdit}
                      className="mt-6 inline-flex items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" /> Add catalog details
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
                  {/* Left: the product itself */}
                  <div className="space-y-6">
                    <div className="flex gap-5">
                      <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                        {item.catalogImage ? (
                          <img src={item.catalogImage} alt={`${item.itemName ?? 'Product'} catalog image`} className="h-full w-full object-contain" />
                        ) : (
                          <ImageOff className="h-8 w-8 text-gray-300 dark:text-gray-600" aria-label="No catalog image" />
                        )}
                      </div>
                      <div className="min-w-0 self-center">
                        <p className={eyebrowCls}>{item.itemCode || data.code}</p>
                        <h3 className="mt-1 font-display text-2xl font-bold leading-tight tracking-tight text-gray-900 dark:text-white">{item.itemName || data.name}</h3>
                        {hasValue(item.flavor) && (
                          <span className="mt-3 inline-flex rounded-full bg-primary-50 dark:bg-primary-900/30 px-2.5 py-0.5 text-xs font-medium text-primary-700 dark:text-primary-300">
                            {item.flavor}
                          </span>
                        )}
                      </div>
                    </div>

                    <dl className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-700 rounded-xl border border-gray-200 dark:border-gray-700">
                      {SPEC_FIELDS.map(({ key, label }) => (
                        <div key={key} className="px-4 py-3">
                          <dt className={eyebrowCls}>{label}</dt>
                          <dd className={`mt-1 text-sm font-semibold text-gray-900 dark:text-white ${mono}`}>
                            <CatalogValue value={item[key]} />
                          </dd>
                        </div>
                      ))}
                    </dl>

                    <div>
                      <p className={eyebrowCls}>Ingredients</p>
                      <p className="mt-2 text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                        {hasValue(item.ingredients) ? item.ingredients : <span className="text-gray-400 dark:text-gray-500">No ingredients listed.</span>}
                      </p>
                    </div>
                  </div>

                  {/* Right: the nutrition-facts label */}
                  <section
                    aria-label="Nutrition facts"
                    className="self-start rounded-lg border-2 border-gray-900 dark:border-gray-300 bg-white dark:bg-gray-900 p-4 text-sm text-gray-900 dark:text-gray-100"
                  >
                    <h3 className="font-display text-2xl font-extrabold leading-none tracking-tight">Nutrition Facts</h3>
                    <p className={`mt-1 text-xs text-gray-500 dark:text-gray-400 ${mono}`}>Per {hasValue(item.netWeight) ? `${item.netWeight} pack` : 'serving'}</p>
                    <div className="mt-2 border-t-[10px] border-gray-900 dark:border-gray-300" />
                    <div className="flex items-baseline justify-between py-1">
                      <span className="font-display text-lg font-extrabold">Energy</span>
                      <span className={`font-display text-2xl font-extrabold ${mono}`}>
                        <CatalogValue value={item.energy} />
                      </span>
                    </div>
                    <div className="border-t-4 border-gray-900 dark:border-gray-300" />
                    {MACRO_FIELDS.map(({ key, label }, i) => (
                      <NutritionRow key={key} label={label} value={item[key]} strong={i < 3} indent={key === 'crudeFibre'} />
                    ))}
                    <div className="mt-1 border-t-[6px] border-gray-900 dark:border-gray-300" />
                    {MINERAL_FIELDS.map(({ key, label }) => (
                      <NutritionRow key={key} label={label} value={item[key]} />
                    ))}
                    <div className="border-t-4 border-gray-900 dark:border-gray-300" />
                    <p className="pt-2 text-[11px] leading-snug text-gray-500 dark:text-gray-400">Values as entered in the item catalog. "—" means not provided.</p>
                  </section>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Drawer>
  );
}
