import { ImageOff, PackageOpen, Pencil } from 'lucide-react';
import type { Item } from '../../types/Item';
import { getItemDetails, getItemList } from '../../api/ItemApi';
import { useMoney } from '../../hooks/Currency/useMoney';
import { useEntityDetail } from '../../hooks/useEntityDetail';
import { Skeleton, SkeletonRegion } from '../../components/ui/skeleton';
import { EntityViewDrawer } from '../shared/RecordView/EntityViewDrawer';
import { InfoSection, PendingValue } from '../shared/RecordView/InfoSection';
import { RecordTable, type RecordColumn } from '../shared/RecordView/RecordTable';
import { StatusPill } from '../shared/RecordView/StatusPill';
import { Layers, PackageSearch, Scale } from 'lucide-react';

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

const fetchItems = async (page: number, search: string, perPage: number) => {
  const res = await getItemList(page, search || undefined, perPage);
  return { items: res.data, hasMore: res.meta.has_more_pages };
};

const itemName = (i: Pick<Item, 'itemName'> & { name?: string }) => i.itemName || i.name || 'Unknown item';
const itemCode = (i: Pick<Item, 'itemCode'> & { code?: string }) => i.itemCode || i.code || '';

interface UomRow {
  key: string;
  uom: string;
  base: boolean;
  upc?: number | null;
  price: number;
  purchase: number;
  sku: boolean;
}

interface ItemViewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** The list row on screen (lean); its full details load here. Null while nothing is selected. */
  data: Item | null;
  /** Another item picked in the left list. */
  onSelect: (item: Item) => void;
  onEdit?: () => void;
  /** The page's own first page of items, reused as the left list's first page (no request); `pageSize` is that page's size, which the left list keeps for later pages. */
  seed?: { items: Item[]; hasMore: boolean } | null;
  pageSize: number;
}

/** Item view: every item on the left; General, Product Catalog and UOM tabs on the right. */
export function ItemViewDrawer({ isOpen, onClose, data, onSelect, onEdit, seed, pageSize }: ItemViewDrawerProps) {
  const { format } = useMoney();
  // The list row is lean — the full item (catalog, weight, group, prices…) comes from the same cache the Edit drawer uses.
  const { data: item, isLoading, isError } = useEntityDetail('item', getItemDetails, data?.uuid);
  const row = data as (Item & { name?: string; code?: string }) | null;
  const title = row ? [itemCode(row), itemName(row)].filter(Boolean).join(' - ') : null;

  // The list row names the item, its category, brand and base unit at once; everything else waits for the full record.
  const baseUom = row?.uoms?.find((u) => u.isBase) ?? row?.uoms?.[0];
  const pend = <PendingValue />;
  const general = (
    <div className="mt-3 space-y-4">
      <InfoSection
        title="General Details"
        rows={[
          { label: 'Item Code', value: item ? item.itemCode : (row && itemCode(row)) || pend },
          { label: 'Item Name', value: item ? item.itemName : (row && itemName(row)) || pend },
          { label: 'Barcode', value: item ? item.itemBarcode : pend },
          { label: 'Description', value: item ? item.description : pend },
          { label: 'Category', value: item ? (item.itemCategory?.categoryName ?? row?.category?.name) : (row?.category?.name ?? pend) },
          { label: 'Brand', value: item ? (item.brand?.brandName ?? row?.brand?.name) : (row?.brand?.name ?? pend) },
          { label: 'Item Group', value: item ? item.itemGroup?.name : pend },
          { label: 'Weight', value: item ? (item.itemWeight != null ? Number(item.itemWeight).toFixed(2) : null) : pend },
          { label: 'Volume', value: item ? (item.volume != null ? Number(item.volume).toFixed(2) : null) : pend },
          { label: 'Shelf Life', value: item ? item.itemShelfLife : pend },
          { label: 'Tax', value: item ? (item.isTaxApply ? 'Tax applicable' : 'Tax exempt') : pend },
          { label: 'Status', value: item ? <StatusPill label={item.status === false ? 'Inactive' : 'Active'} tone={item.status === false ? 'neutral' : 'success'} /> : pend },
        ]}
      />
      <InfoSection
        title="Base UOM"
        rows={[
          {
            label: 'Base UOM',
            value: item ? (item.itemUom ? [item.itemUom.code, item.itemUom.name].filter(Boolean).join(' - ') : null) : baseUom ? [baseUom.code, baseUom.name].filter(Boolean).join(' - ') : pend,
          },
          { label: 'Base UPC', value: item ? (item.baseUomUpc ?? item.lowerUnitItemUpc) : pend },
          { label: 'Base Price', value: item ? format(item.baseUomPrice ?? item.itemPrice) : pend },
          { label: 'Purchase Price', value: item ? format(item.baseUomPurchasePrice ?? item.costPrice) : pend },
        ]}
      />
    </div>
  );

  const uomRows: UomRow[] = item
    ? [
        {
          key: 'base',
          uom: item.itemUom ? [item.itemUom.code, item.itemUom.name].filter(Boolean).join(' - ') : '—',
          base: true,
          upc: item.baseUomUpc ?? item.lowerUnitItemUpc,
          price: item.baseUomPrice ?? item.itemPrice,
          purchase: item.baseUomPurchasePrice ?? item.costPrice ?? 0,
          sku: false,
        },
        ...(item.secondaryUoms ?? []).map((u, i) => ({
          key: `s${i}:${u.uomId}`,
          uom: u.uomName ?? '—',
          base: false,
          upc: u.upc,
          price: u.price ?? 0,
          purchase: u.purchasePrice ?? 0,
          sku: Boolean(u.isSku),
        })),
      ]
    : [];
  const uomColumns: RecordColumn<UomRow>[] = [
    {
      key: 'uom',
      label: 'UOM',
      render: (u) =>
        u.base ? (
          <span className="inline-flex items-center gap-2">
            {u.uom}
            <StatusPill label="Base" tone="accent" />
          </span>
        ) : (
          u.uom
        ),
    },
    { key: 'upc', label: 'UPC', align: 'right', render: (u) => u.upc ?? '—' },
    { key: 'price', label: 'Price', align: 'right', render: (u) => format(u.price) },
    { key: 'purchase', label: 'Purchase Price', align: 'right', render: (u) => format(u.purchase) },
    { key: 'sku', label: 'SKU', render: (u) => (u.sku ? 'Yes' : '—') },
  ];
  const uom = (
    <div className="mt-[17px]">
      <RecordTable columns={uomColumns} rows={uomRows} rowKey={(u) => u.key} isLoading={isLoading} emptyLabel="No units of measure set" />
    </div>
  );

  // Product catalog — a product spec sheet anchored by a nutrition-facts label.
  const catalog = (
    <div className="pt-6">
      {isLoading ? (
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
      ) : isError || !item ? (
        <p className="py-16 text-center text-[var(--rv-secondary)]">Couldn't load the product catalog. Pick the item again to retry.</p>
      ) : !CATALOG_FIELDS.some((key) => hasValue(item[key])) && !item.catalogImage ? (
        <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border-2 border-dashed border-[var(--rv-border)] px-8 py-12 text-center">
          <PackageOpen className="mb-4 h-10 w-10 text-[var(--rv-empty)]" strokeWidth={1.25} />
          <p className={eyebrowCls}>Product catalog</p>
          <h3 className="mt-2 text-xl font-semibold text-[var(--rv-ink)]">No catalog details yet</h3>
          <p className="mt-2 max-w-sm text-[var(--rv-secondary)]">Add the net weight, flavor, ingredients and nutrition values so this item's catalog page is complete.</p>
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-primary-600 px-4 py-2 font-medium text-white transition-colors hover:bg-primary-700"
            >
              <Pencil className="h-4 w-4" /> Add catalog details
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-6">
            <div className="flex gap-5">
              <div className="flex h-36 w-36 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-[var(--rv-border)] bg-[var(--rv-tint)]">
                {item.catalogImage ? (
                  <img src={item.catalogImage} alt={`${item.itemName ?? 'Product'} catalog image`} className="h-full w-full object-contain" />
                ) : (
                  <ImageOff className="h-8 w-8 text-[var(--rv-empty)]" aria-label="No catalog image" />
                )}
              </div>
              <div className="min-w-0 self-center">
                <p className={eyebrowCls}>{item.itemCode}</p>
                <h3 className="mt-1 text-2xl font-bold leading-tight tracking-tight text-[var(--rv-ink)]">{item.itemName}</h3>
                {hasValue(item.flavor) && <span className="mt-3 inline-flex rounded-full bg-[var(--rv-accent-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--rv-accent)]">{item.flavor}</span>}
              </div>
            </div>

            <dl className="grid grid-cols-3 divide-x divide-[var(--rv-border)] rounded-xl border border-[var(--rv-border)]">
              {SPEC_FIELDS.map(({ key, label }) => (
                <div key={key} className="px-4 py-3">
                  <dt className={eyebrowCls}>{label}</dt>
                  <dd className={`mt-1 font-semibold text-[var(--rv-ink)] ${mono}`}>
                    <CatalogValue value={item[key]} />
                  </dd>
                </div>
              ))}
            </dl>

            <div>
              <p className={eyebrowCls}>Ingredients</p>
              <p className="mt-2 leading-relaxed text-[var(--rv-text)]">{hasValue(item.ingredients) ? item.ingredients : <span className="text-[var(--rv-muted)]">No ingredients listed.</span>}</p>
            </div>
          </div>

          <section aria-label="Nutrition facts" className="self-start rounded-lg border-2 border-gray-900 bg-[var(--rv-bg)] p-4 text-[var(--rv-ink)] dark:border-gray-300">
            <h3 className="text-2xl font-extrabold leading-none tracking-tight">Nutrition Facts</h3>
            <p className={`mt-1 text-xs text-[var(--rv-secondary)] ${mono}`}>Per {hasValue(item.netWeight) ? `${item.netWeight} pack` : 'serving'}</p>
            <div className="mt-2 border-t-[10px] border-gray-900 dark:border-gray-300" />
            <div className="flex items-baseline justify-between py-1">
              <span className="text-lg font-extrabold">Energy</span>
              <span className={`text-2xl font-extrabold ${mono}`}>
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
            <p className="pt-2 text-[11px] leading-snug text-[var(--rv-secondary)]">Values as entered in the item catalog. "—" means not provided.</p>
          </section>
        </div>
      )}
    </div>
  );

  return (
    <EntityViewDrawer<Item>
      isOpen={isOpen && Boolean(data)}
      onClose={onClose}
      title={title}
      rail={{
        queryKey: `item-${pageSize}`,
        seed,
        placeholder: 'Search Items',
        fetchPage: (page, search) => fetchItems(page, search, pageSize),
        toCard: (i) => ({ key: i.uuid ?? '', title: itemName(i), subtitle: itemCode(i) || null, amount: i.category?.name ?? null }),
        selectedKey: data?.uuid,
        onSelect,
      }}
      onEdit={onEdit}
      editPermission="item.edit"
      tabs={[
        { key: 'general', label: 'General', icon: PackageSearch, content: general },
        { key: 'uom', label: 'UOM', icon: Scale, content: uom },
        { key: 'catalog', label: 'Product Catalog', icon: Layers, content: catalog },
      ]}
    />
  );
}
