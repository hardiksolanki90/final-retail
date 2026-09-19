import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItemGroupList, createItemGroup, updateItemGroup, deleteItemGroup } from '../api/ItemGroupApi';
import { showToast } from '../lib/toast';

interface ItemGroupContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createItemGroupData: (data: Record<string, any>) => Promise<any>;
  updateItemGroupData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const ItemGroupContext = createContext<ItemGroupContextType | undefined>(undefined);

export default function ItemGroupProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['item-group-list', currentPage, perPage, searchTerm],
    queryFn: () => getItemGroupList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemGroup,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['item-group-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this item group?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createItemGroup(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['item-group-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateItemGroup(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['item-group-list'] }),
  });

  const createItemGroupData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateItemGroupData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: ItemGroupContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createItemGroupData, updateItemGroupData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <ItemGroupContext.Provider value={value}>{children}</ItemGroupContext.Provider>;
}

export function useItemGroup() {
  const context = useContext(ItemGroupContext);
  if (!context) throw new Error('useItemGroup must be used within an ItemGroupProvider');
  return context;
}
