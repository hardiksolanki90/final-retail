import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMerchandiserReplacementList, deleteMerchandiserReplacement, type MerchandiserReplacementFilters } from '../api/MerchandiserReplacementApi';
import { getAllSalesmen } from '../api/SalesmanApi';
import { showToast } from '../lib/toast';
import type { MerchandiserReplacement } from '../types/MerchandiserReplacement';
import type { SalesmanSelectOption } from '../types/Salesman';

interface MerchandiserReplacementContextType {
  data: MerchandiserReplacement[];
  meta: any;
  isLoading: boolean;
  error: Error | null;
  filters: MerchandiserReplacementFilters;
  setFilters: (filters: MerchandiserReplacementFilters) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean;
  setAddDrawerOpen: (open: boolean) => void;
  editingItem: MerchandiserReplacement | null;
  setEditingItem: (item: MerchandiserReplacement | null) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  refetch: () => void;
  salesmanOptions: SalesmanSelectOption[];
  salesmanLoading: boolean;
}

export const MerchandiserReplacementContext = createContext<MerchandiserReplacementContextType | undefined>(undefined);

export default function MerchandiserReplacementProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<MerchandiserReplacementFilters>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MerchandiserReplacement | null>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['merchandiser-replacement-list', currentPage, perPage, filters],
    queryFn: () => getMerchandiserReplacementList(currentPage, perPage, filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesmanData, isLoading: salesmanLoading } = useQuery({
    queryKey: ['salesman-all'],
    queryFn: () => getAllSalesmen(),
    staleTime: 10 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMerchandiserReplacement,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['merchandiser-replacement-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to delete', 'error'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this replacement?')) deleteMutation.mutate(uuid);
  };

  const items = Array.isArray(responseData?.data) ? responseData.data : [];
  const meta = responseData?.meta ?? null;

  const value: MerchandiserReplacementContextType = {
    data: items,
    meta,
    isLoading,
    error: error as Error | null,
    filters,
    setFilters,
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
    salesmanOptions: salesmanData ?? [],
    salesmanLoading,
  };

  return <MerchandiserReplacementContext.Provider value={value}>{children}</MerchandiserReplacementContext.Provider>;
}

export function useMerchandiserReplacement() {
  const context = useContext(MerchandiserReplacementContext);
  if (!context) throw new Error('useMerchandiserReplacement must be used within a MerchandiserReplacementProvider');
  return context;
}
