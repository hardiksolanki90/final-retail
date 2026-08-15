type Item = {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  uomId?: string;
  uomName?: string;
  basePrice: number;
  sellingPrice: number;
  costPrice?: number;
  taxRate?: number;
  status: 'Active' | 'Inactive';
  stockQuantity?: number;
  minStock?: number;
  maxStock?: number;
  image?: string;
  organisationId?: string;
  createdAt?: string;
  updatedAt?: string;
};

type ItemListItem = {
  id: string;
  code: string;
  name: string;
  category: string;
  brand: string;
  uom: string;
  price: number;
  stock: number;
  status: 'Active' | 'Inactive';
};

type ItemListResponse = {
  status: string;
  data: ItemListItem[];
  meta: PaginationMeta;
};

type ItemResponse = {
  status: string;
  data: Item;
};

type ItemCategory = {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  status: 'Active' | 'Inactive';
};

type Brand = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  status: 'Active' | 'Inactive';
};

type ItemUom = {
  id: string;
  name: string;
  shortName: string;
  conversionFactor?: number;
};
