export interface Item {
  id?: number;
  uuid?: string;
  itemCode: string;
  erpCode?: string;
  itemName: string;
  description?: string;
  itemBarcode?: string;
  sku?: string;
  itemCategoryId?: number;
  brandId?: number;
  itemUomId?: number;
  itemPrice: number;
  costPrice?: number;
  priceWithTax?: number;
  profitMargin?: number;
  itemWeight?: number;
  itemShelfLife?: number;
  isTaxApply?: boolean;
  vatPercentage?: number;
  exciseRate?: number;
  volume?: number;
  itemImage?: string;
  status?: boolean;
  lowerUnitItemUpc?: number;
  isNewLaunch?: boolean;
  launchStartDate?: string;
  launchEndDate?: string;
  secondaryUoms?: SecondaryUom[];
  brandName?: string;
  categoryName?: string;
  createdAt?: string;
  updatedAt?: string;
  
  // Relationships
  brand?: Brand;
  itemCategory?: ItemCategory;
  itemUom?: ItemUom;
}

export interface SecondaryUom {
  uomId: number;
  conversionFactor: number;
  price?: number;
  upc?: number;
  isSku?: boolean;
  purchasePrice?: number;
}

export interface ItemUom {
  id?: number;
  uuid?: string;
  name: string;
  code: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemFormData {
  itemCategoryId: number | string;
  brandId?: number | string;
  itemUomId?: number | string;
  itemCode?: string;
  erpCode?: string;
  itemName: string;
  description?: string;
  itemBarcode?: string;
  itemWeight?: number;
  itemShelfLife?: number;
  isTaxApply?: boolean;
  vatPercentage?: number;
  exciseRate?: number;
  sku?: string;
  volume?: number;
  itemPrice: number;
  costPrice?: number;
  itemImage?: string;
  status?: boolean;
  lowerUnitItemUpc?: number;
  isNewLaunch?: boolean;
  launchStartDate?: string;
  launchEndDate?: string;
  secondaryUoms?: SecondaryUom[];
  
  // New Tab Fields
  itemGroupId?: number | string;
  isPromotional?: boolean;
  baseUomPurchasePrice?: number;
  isBaseUomSku?: boolean;
  baseUomUpc?: number;
  baseUomPrice?: number;
  isProductCatalog?: boolean;
  netWeight?: string | number;
  flavor?: string;
  shelfLifeCatalog?: string | number;
  ingredients?: string;
  energy?: string | number;
  fat?: string | number;
  protein?: string | number;
  carbohydrate?: string | number;
  calcium?: string | number;
  sodium?: string | number;
  potassium?: string | number;
  crudeFibre?: string | number;
  vitamin?: string | number;
  catalogImage?: string;
}

export interface ItemListResponse {
  data: Item[];
  meta: {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    has_more_pages: boolean;
    next_page_url?: string;
    prev_page_url?: string;
  };
  message: string;
}

export interface ItemCategory {
  id?: number;
  uuid?: string;
  categoryName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Brand {
  id?: number;
  uuid?: string;
  brandName: string;
  description?: string;
  logoUrl?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ItemWithStock extends Item {
  stock: number;
  isInStock: boolean;
}

export interface ItemSelectOption {
  value: string;
  label: string;
}

export interface ItemFilters {
  search?: string;
  itemCategoryId?: number;
  brandId?: number;
  status?: boolean;
  isNewLaunch?: boolean;
  warehouseId?: number;
}

export interface ItemBulkAction {
  action: 'activate' | 'deactivate' | 'delete';
  uuids: string[];
}
