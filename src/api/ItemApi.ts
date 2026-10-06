import axiosInstance from '../lib/axios';
import { queryClient } from '../lib/queryClient';
import { unwrapPaginated, type NormalizedListResponse } from '../lib/paginatedResponse';
import type { Item, ItemFormData, ItemListResponse, ItemCategory, Brand, ItemUom, ItemWithStock, ItemSelectOption, ItemFilters, ItemBulkAction } from '../types/Item';

// Items CRUD Operations
export const getItemList = async (page: number = 1, searchTerm?: string, perPage: number = 15, filters?: ItemFilters): Promise<ItemListResponse> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (searchTerm) {
    params.append('search', searchTerm);
  }

  if (filters?.itemCategoryId) {
    params.append('item_category_id', filters.itemCategoryId.toString());
  }

  if (filters?.brandId) {
    params.append('brand_id', filters.brandId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  if (filters?.isNewLaunch) {
    params.append('is_new_launch', filters.isNewLaunch.toString());
  }

  const response = await axiosInstance.get(`/item/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'items', perPage) as ItemListResponse;
};

export const getAllItems = async (filters?: ItemFilters): Promise<ItemSelectOption[]> => {
  const params = new URLSearchParams();

  if (filters?.itemCategoryId) {
    params.append('item_category_id', filters.itemCategoryId.toString());
  }

  if (filters?.brandId) {
    params.append('brand_id', filters.brandId.toString());
  }

  // item/all: every item as a lean option with its UOMs (item/list is the paginated table feed).
  const response = await axiosInstance.get(`/item/all?${params.toString()}`);
  return (response.data?.data ?? []).map(toItemOption);
};

/** One item/all row → dropdown option: "CODE - name" label and its UOMs (base first). */
const toItemOption = (it: { value: string; label: string; code?: string | null; uoms?: { id: string; code?: string; name?: string; isBase: boolean }[] }): ItemSelectOption => ({
  value: it.value,
  label: [it.code, it.label].filter(Boolean).join(' - '),
  uoms: (it.uoms ?? []).map((u) => ({ value: u.id, label: [u.code, u.name].filter(Boolean).join(' - '), isBase: u.isBase })),
});

/**
 * One searchable page of item options (by code, name or barcode) for a dropdown that loads as it
 * scrolls. Page 1 is shared between every dropdown on a form — one request, cached a minute;
 * item changes invalidate 'item-list', which drops these too.
 */
export const getItemOptions = async (page: number = 1, search?: string, perPage: number = 25): Promise<NormalizedListResponse<ItemSelectOption>> => {
  const params = new URLSearchParams({ page: String(page), per_page: String(perPage) });
  if (search) params.append('search', search);
  const url = `/item/all?${params.toString()}`;

  return queryClient.fetchQuery<NormalizedListResponse<ItemSelectOption>>({
    queryKey: ['item-list', 'options', url],
    queryFn: async () => {
      const res = unwrapPaginated<Parameters<typeof toItemOption>[0]>((await axiosInstance.get(url)).data, 'items', perPage);
      return { ...res, data: res.data.map(toItemOption) };
    },
    staleTime: 60 * 1000,
  });
};

export const getItemsWithStock = async (warehouseId?: number): Promise<ItemWithStock[]> => {
  const params = new URLSearchParams();
  if (warehouseId) {
    params.append('warehouse_id', warehouseId.toString());
  }

  const response = await axiosInstance.get(`/item/with-stock?${params.toString()}`);
  return response.data.data || response.data;
};

export const searchItems = async (searchTerm: string, page: number = 1, perPage: number = 15, filters?: ItemFilters): Promise<ItemListResponse> => {
  const params = new URLSearchParams();
  params.append('search', searchTerm);
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());

  if (filters?.itemCategoryId) {
    params.append('item_category_id', filters.itemCategoryId.toString());
  }

  if (filters?.brandId) {
    params.append('brand_id', filters.brandId.toString());
  }

  if (filters?.status !== undefined) {
    params.append('status', filters.status.toString());
  }

  const response = await axiosInstance.post('/item/search', Object.fromEntries(params));
  return unwrapPaginated(response.data, 'items', perPage) as ItemListResponse;
};

export const getItemDetails = async (uuid: string): Promise<Item> => {
  const response = await axiosInstance.get(`/item/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createItem = async (itemData: ItemFormData): Promise<Item> => {
  const response = await axiosInstance.post('/item/add', itemData);
  return response.data.data || response.data;
};

export const updateItem = async (uuid: string, itemData: ItemFormData): Promise<Item> => {
  const response = await axiosInstance.post(`/item/edit/${uuid}`, itemData);
  return response.data.data || response.data;
};

export const deleteItem = async (uuid: string): Promise<void> => {
  await axiosInstance.post(`/item/delete`, { id: uuid });
};

export const bulkActionItems = async (bulkAction: ItemBulkAction): Promise<void> => {
  await axiosInstance.post('/item/bulk-action', bulkAction);
};

// Item Categories API
export const getItemCategoryList = async (page: number = 1, perPage: number = 15, searchTerm?: string): Promise<any> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-category/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'itemCategories', perPage);
};

export const getItemCategories = async (): Promise<ItemCategory[]> => {
  const response = await axiosInstance.get('/item-category/list?page=1&per_page=1000');
  return response.data.data || response.data;
};

export const getItemCategoryDetails = async (uuid: string): Promise<ItemCategory> => {
  const response = await axiosInstance.get(`/item-category/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createItemCategory = async (data: Partial<ItemCategory>): Promise<ItemCategory> => {
  const response = await axiosInstance.post('/item-category/add', data);
  return response.data.data || response.data;
};

export const updateItemCategory = async (uuid: string, data: Partial<ItemCategory>): Promise<ItemCategory> => {
  const response = await axiosInstance.post(`/item-category/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteItemCategory = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/item-category/delete', { id: uuid });
};

// Brands API
export const getBrandList = async (page: number = 1, perPage: number = 15, searchTerm?: string): Promise<any> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/brand/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'brands', perPage);
};

export const getBrands = async (): Promise<Brand[]> => {
  const response = await axiosInstance.get('/brand/list?page=1&per_page=1000');
  return response.data.data || response.data;
};

export const getBrandDetails = async (uuid: string): Promise<Brand> => {
  const response = await axiosInstance.get(`/brand/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createBrand = async (data: Partial<Brand>): Promise<Brand> => {
  const response = await axiosInstance.post('/brand/add', data);
  return response.data.data || response.data;
};

export const updateBrand = async (uuid: string, data: Partial<Brand>): Promise<Brand> => {
  const response = await axiosInstance.post(`/brand/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteBrand = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/brand/delete', { id: uuid });
};

// Item UOM API
export const getItemUomList = async (page: number = 1, perPage: number = 15, searchTerm?: string): Promise<any> => {
  const params = new URLSearchParams();
  params.append('page', page.toString());
  params.append('per_page', perPage.toString());
  if (searchTerm) params.append('search', searchTerm);
  const response = await axiosInstance.get(`/item-uom/list?${params.toString()}`);
  return unwrapPaginated(response.data, 'itemUoms', perPage);
};

export const getItemUoms = async (): Promise<ItemUom[]> => {
  const response = await axiosInstance.get('/item-uom/list?page=1&per_page=1000');
  return response.data.data || response.data;
};

export const getItemUomDetails = async (uuid: string): Promise<ItemUom> => {
  const response = await axiosInstance.get(`/item-uom/edit/${uuid}`);
  return response.data.data || response.data;
};

export const createItemUom = async (data: Partial<ItemUom>): Promise<ItemUom> => {
  const response = await axiosInstance.post('/item-uom/add', data);
  return response.data.data || response.data;
};

export const updateItemUom = async (uuid: string, data: Partial<ItemUom>): Promise<ItemUom> => {
  const response = await axiosInstance.post(`/item-uom/edit/${uuid}`, data);
  return response.data.data || response.data;
};

export const deleteItemUom = async (uuid: string): Promise<void> => {
  await axiosInstance.post('/item-uom/delete', { id: uuid });
};

// Utility Functions
export const exportItems = async (format: 'csv' | 'xlsx'): Promise<Blob> => {
  const response = await axiosInstance.get(`/item/export?format=${format}`, { responseType: 'blob' });
  return response.data;
};
