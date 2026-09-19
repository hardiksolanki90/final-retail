import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getItemUomList, createItemUom, updateItemUom, deleteItemUom } from '../api/ItemUomApi';
import { showToast } from '../lib/toast';

interface ItemUomContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createItemUomData: (data: Record<string, any>) => Promise<any>;
  updateItemUomData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const ItemUomContext = createContext<ItemUomContextType | undefined>(undefined);

export default function ItemUomProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['item-uom-list', currentPage, perPage, searchTerm],
    queryFn: () => getItemUomList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteItemUom,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['item-uom-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this UOM?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createItemUom(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['item-uom-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateItemUom(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['item-uom-list'] }),
  });

  const createItemUomData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateItemUomData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: ItemUomContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createItemUomData, updateItemUomData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <ItemUomContext.Provider value={value}>{children}</ItemUomContext.Provider>;
}

export function useItemUom() {
  const context = useContext(ItemUomContext);
  if (!context) throw new Error('useItemUom must be used within an ItemUomProvider');
  return context;
}
