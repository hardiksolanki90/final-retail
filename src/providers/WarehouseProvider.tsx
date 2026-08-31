import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWarehouseList, createWarehouse, updateWarehouse, deleteWarehouse } from '../api/WarehouseApi';
import { showToast } from '../lib/toast';
import type { Warehouse, WarehouseFormData } from '../types/Warehouse';

interface WarehouseContextType {
  data: Warehouse[];
  meta: any;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean;
  setAddDrawerOpen: (open: boolean) => void;
  editingItem: Warehouse | null;
  setEditingItem: (item: Warehouse | null) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  refetch: () => void;
  handleCreate: (data: WarehouseFormData) => Promise<void>;
  handleUpdate: (uuid: string, data: WarehouseFormData) => Promise<void>;
}

export const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export default function WarehouseProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Warehouse | null>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['warehouse-list', currentPage, perPage, searchTerm],
    queryFn: () => getWarehouseList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-list'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete', 'error');
    },
  });

  const createMutation = useMutation({
    mutationFn: createWarehouse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-list'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: WarehouseFormData }) => updateWarehouse(uuid, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['warehouse-list'] });
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      deleteMutation.mutate(uuid);
    }
  };

  const handleCreate = async (data: WarehouseFormData) => {
    await createMutation.mutateAsync(data);
  };

  const handleUpdate = async (uuid: string, data: WarehouseFormData) => {
    await updateMutation.mutateAsync({ uuid, data });
  };

  const items = Array.isArray(responseData?.data) ? responseData.data : [];
  const meta = responseData?.meta ?? null;

  const value: WarehouseContextType = {
    data: items,
    meta,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    selectedRowKeys,
    setSelectedRowKeys,
    addDrawerOpen,
    setAddDrawerOpen,
    editingItem,
    setEditingItem,
    handleDeleteWithConfirmation,
    refetch: () => refetch(),
    handleCreate,
    handleUpdate,
  };

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) throw new Error('useWarehouse must be used within a WarehouseProvider');
  return context;
}
