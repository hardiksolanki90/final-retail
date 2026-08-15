import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getItemList,
  getAllItems,
  getItemsWithStock,
  searchItems,
  deleteItem,
  createItem,
  updateItem,
  getItemDetails,
  getItemCategories,
  getBrands,
  getItemUoms,
  bulkActionItems,
} from '../api/ItemApi';
import { showToast } from '../lib/toast';
import type {
  Item,
  ItemFormData,
  ItemListResponse,
  ItemCategory,
  Brand,
  ItemUom,
  ItemWithStock,
  ItemFilters,
  ItemBulkAction,
} from '../types/Item';

interface ItemContextType {
  // Data
  itemData: ItemListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search and filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: ItemFilters;
  setFilters: (filters: ItemFilters) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Modal state
  isItemModalVisible: boolean;
  setIsItemModalVisible: (visible: boolean) => void;
  selectedItem: Item | null;
  setSelectedItem: (item: Item | null) => void;

  // CRUD operations
  addItem: (data: ItemFormData) => Promise<Item>;
  isAdding: boolean;
  updateItemData: (uuid: string, data: ItemFormData) => Promise<Item>;
  isUpdating: boolean;
  deleteItemData: (uuid: string) => void;
  isDeleting: boolean;

  // Related data
  categories: ItemCategory[];
  brands: Brand[];
  uoms: ItemUom[];
  isLoadingCategories: boolean;
  isLoadingBrands: boolean;
  isLoadingUoms: boolean;

  // Additional queries
  itemsWithStock: ItemWithStock[] | undefined;
  allItems: any[] | undefined;

  // Actions
  refetchItems: () => void;
  handleAddItemModal: () => void;
  handleEdit: (item: Item) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;

  // Bulk actions
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  handleBulkAction: (action: string) => void;
}

const ItemContext = createContext<ItemContextType | undefined>(undefined);

export { ItemContext };

interface ItemProviderProps {
  children: ReactNode;
}

export default function ItemProvider({ children }: ItemProviderProps) {
  const queryClient = useQueryClient();

  // State
  const [isItemModalVisible, setIsItemModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filters, setFilters] = useState<ItemFilters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

  // Item list query
  const {
    data: itemData,
    isLoading,
    error,
    refetch: refetchItems,
  } = useQuery({
    queryKey: ['item-list', searchTerm, currentPage, perPage, filters],
    queryFn: () => getItemList(currentPage, searchTerm, perPage, filters),
    staleTime: 5 * 60 * 1000,
  });

  // Related data queries
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['item-categories'],
    queryFn: getItemCategories,
    staleTime: 10 * 60 * 1000,
    enabled: isItemModalVisible,
  });

  const { data: brands = [], isLoading: isLoadingBrands } = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    staleTime: 10 * 60 * 1000,
    enabled: isItemModalVisible,
  });

  const { data: uoms = [], isLoading: isLoadingUoms } = useQuery({
    queryKey: ['item-uoms'],
    queryFn: getItemUoms,
    staleTime: 10 * 60 * 1000,
    enabled: isItemModalVisible,
  });

  // All items query (for dropdowns)
  const { data: allItems } = useQuery({
    queryKey: ['all-items', filters],
    queryFn: () => getAllItems(filters),
    staleTime: 10 * 60 * 1000,
    enabled: false, // Only fetch when needed
  });

  // Items with stock query
  const { data: itemsWithStock } = useQuery({
    queryKey: ['items-with-stock', filters.warehouseId],
    queryFn: () => getItemsWithStock(filters.warehouseId),
    staleTime: 5 * 60 * 1000,
    enabled: false, // Only fetch when needed
  });

  // Mutations
  const addItemMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      showToast.success('Item created successfully!');
      queryClient.invalidateQueries({ queryKey: ['item-list'] });
      setIsItemModalVisible(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create item');
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: ItemFormData }) =>
      updateItem(uuid, data),
    onSuccess: () => {
      showToast.success('Item updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['item-list'] });
      setIsItemModalVisible(false);
      setSelectedItem(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update item');
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      showToast.success('Item deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['item-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete item');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: bulkActionItems,
    onSuccess: () => {
      showToast.success('Bulk action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['item-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to complete bulk action');
    },
  });

  // Handlers
  const handleAddItemModal = () => {
    setSelectedItem(null);
    setIsItemModalVisible(true);
  };

  const handleEdit = (item: Item) => {
    setSelectedItem(item);
    setIsItemModalVisible(true);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteItemMutation.mutate(uuid);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select items first');
      return;
    }

    const bulkAction: ItemBulkAction = {
      action: action as 'activate' | 'deactivate' | 'delete',
      uuids: selectedRowKeys,
    };

    bulkActionMutation.mutate(bulkAction);
  };

  const addItem = async (data: ItemFormData) => {
    return await addItemMutation.mutateAsync(data);
  };

  const updateItemData = async (uuid: string, data: ItemFormData) => {
    return await updateItemMutation.mutateAsync({ uuid, data });
  };

  const deleteItemData = (uuid: string) => {
    deleteItemMutation.mutate(uuid);
  };

  const value: ItemContextType = {
    itemData,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    isItemModalVisible,
    setIsItemModalVisible,
    selectedItem,
    setSelectedItem,
    addItem,
    isAdding: addItemMutation.isPending,
    updateItemData,
    isUpdating: updateItemMutation.isPending,
    deleteItemData,
    isDeleting: deleteItemMutation.isPending,
    categories,
    brands,
    uoms,
    isLoadingCategories,
    isLoadingBrands,
    isLoadingUoms,
    itemsWithStock,
    allItems,
    refetchItems: () => refetchItems(),
    handleAddItemModal,
    handleEdit,
    handleDeleteWithConfirmation,
    selectedRowKeys,
    setSelectedRowKeys,
    handleBulkAction,
  };

  return <ItemContext.Provider value={value}>{children}</ItemContext.Provider>;
}

export function useItem() {
  const context = useContext(ItemContext);
  if (context === undefined) {
    throw new Error('useItem must be used within an ItemProvider');
  }
  return context;
}