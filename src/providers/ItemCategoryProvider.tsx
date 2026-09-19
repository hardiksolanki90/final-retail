import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getItemCategoryList,
  createItemCategory,
  updateItemCategory,
  deleteItemCategory,
} from '../api/ItemApi';
import { showToast } from '../lib/toast';

interface ItemCategoryContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createItemCategoryData: (data: Record<string, any>) => Promise<any>;
  updateItemCategoryData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const ItemCategoryContext = createContext<ItemCategoryContextType | undefined>(undefined);

export default function ItemCategoryProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['item-category-list', currentPage, perPage, searchTerm],
    queryFn: () => getItemCategoryList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemCategory,
    onSuccess: () => {
      showToast.success('Item category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['item-category-list'] });
    },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this item category?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createItemCategory(data),
    onSuccess: () => {
      showToast.success('Item category created successfully');
      queryClient.invalidateQueries({ queryKey: ['item-category-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to create item category'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateItemCategory(uuid, data),
    onSuccess: () => {
      showToast.success('Item category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['item-category-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to update item category'); },
  });

  const createItemCategoryData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateItemCategoryData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData?.data?.items)
       ? responseData.data.items
       : (Array.isArray(responseData?.data?.data) ? responseData.data.data : []));
  const meta = responseData?.meta ?? responseData?.data ?? (responseData ? { current_page: responseData.current_page, per_page: responseData.per_page, total: responseData.total, last_page: responseData.last_page } : null);

  const value: ItemCategoryContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createItemCategoryData, updateItemCategoryData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <ItemCategoryContext.Provider value={value}>{children}</ItemCategoryContext.Provider>;
}

export function useItemCategory() {
  const context = useContext(ItemCategoryContext);
  if (!context) throw new Error('useItemCategory must be used within a ItemCategoryProvider');
  return context;
}
