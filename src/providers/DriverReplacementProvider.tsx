import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDriverReplacementList, createDriverReplacement, updateDriverReplacement, deleteDriverReplacement, type DriverReplacementFilters } from '../api/DriverReplacementApi';
import { getAllSalesmen } from '../api/SalesmanApi';
import { getVanOptions } from '../api/VanApi';
import { getReasonOptions } from '../api/ReasonApi';
import { showToast } from '../lib/toast';
import type { DriverReplacement, DriverReplacementFormData } from '../types/DriverReplacement';

interface DriverReplacementContextType {
  data: DriverReplacement[];
  meta: any;
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  filters: DriverReplacementFilters;
  setFilters: (filters: DriverReplacementFilters) => void;
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean;
  setAddDrawerOpen: (open: boolean) => void;
  editingItem: DriverReplacement | null;
  setEditingItem: (item: DriverReplacement | null) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  refetch: () => void;
  salesmanOptions: { value: number; label: string }[];
  vanOptions: { value: number; label: string }[];
  reasonOptions: { value: number; label: string }[];
  handleCreate: (data: DriverReplacementFormData) => Promise<void>;
  handleUpdate: (uuid: string, data: DriverReplacementFormData) => Promise<void>;
}

export const DriverReplacementContext = createContext<DriverReplacementContextType | undefined>(undefined);

export default function DriverReplacementProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filters, setFilters] = useState<DriverReplacementFilters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DriverReplacement | null>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['driver-replacement-list', currentPage, perPage, filters],
    queryFn: () => getDriverReplacementList(currentPage, perPage, filters),
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesmenRaw = [] } = useQuery({
    queryKey: ['salesmen-all'],
    queryFn: getAllSalesmen,
    staleTime: 10 * 60 * 1000,
  });

  const { data: vanOptions = [] } = useQuery({
    queryKey: ['van-options'],
    queryFn: getVanOptions,
    staleTime: 10 * 60 * 1000,
  });

  const { data: reasonOptions = [] } = useQuery({
    queryKey: ['reason-options'],
    queryFn: getReasonOptions,
    staleTime: 10 * 60 * 1000,
  });

  const salesmanOptions = salesmenRaw.map((s) => ({ value: s.id, label: s.name || s.salesmanCode || '' }));

  const deleteMutation = useMutation({
    mutationFn: deleteDriverReplacement,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver-replacement-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to delete', 'error'); },
  });

  const createMutation = useMutation({
    mutationFn: createDriverReplacement,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver-replacement-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to create', 'error'); throw err; },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: DriverReplacementFormData }) => updateDriverReplacement(uuid, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['driver-replacement-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to update', 'error'); throw err; },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this driver replacement?')) deleteMutation.mutate(uuid);
  };

  const handleCreate = async (data: DriverReplacementFormData) => { await createMutation.mutateAsync(data); };
  const handleUpdate = async (uuid: string, data: DriverReplacementFormData) => { await updateMutation.mutateAsync({ uuid, data }); };

  const items = Array.isArray(responseData?.data) ? responseData.data : [];
  const meta = responseData?.meta ?? null;

  const value: DriverReplacementContextType = {
    data: items,
    meta,
    isLoading,
    error: error as Error | null,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    filters,
    setFilters,
    selectedRowKeys,
    setSelectedRowKeys,
    addDrawerOpen,
    setAddDrawerOpen,
    editingItem,
    setEditingItem,
    handleDeleteWithConfirmation,
    refetch: () => refetch(),
    salesmanOptions,
    vanOptions,
    reasonOptions,
    handleCreate,
    handleUpdate,
  };

  return <DriverReplacementContext.Provider value={value}>{children}</DriverReplacementContext.Provider>;
}

export function useDriverReplacement() {
  const context = useContext(DriverReplacementContext);
  if (!context) throw new Error('useDriverReplacement must be used within a DriverReplacementProvider');
  return context;
}
