import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCurrencyList, createCurrency, updateCurrency, deleteCurrency } from '../api/CurrencyApi';
import { showToast } from '../lib/toast';
import { useAuth } from '../context/AuthContext';

interface CurrencyContextType {
  data: any[];
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
  editingItem: any;
  setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  refetch: () => void;
  createCurrencyData: (data: Record<string, any>) => Promise<any>;
  updateCurrencyData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export default function CurrencyProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  // Default currency feeds the global config (document receipts) — refresh it on any change.
  const { refreshConfig } = useAuth();
  const onCurrencyChanged = () => {
    queryClient.invalidateQueries({ queryKey: ['currency-list'] });
    void refreshConfig();
  };

  const {
    data: responseData,
    isLoading,
    error,
    refetch,
  } = useQuery({ queryKey: ['currency-list', currentPage, perPage, searchTerm], queryFn: () => getCurrencyList(currentPage, perPage, searchTerm), staleTime: 5 * 60 * 1000 });

  const deleteMutation = useMutation({
    mutationFn: deleteCurrency,
    onSuccess: onCurrencyChanged,
    onError: (err: Error) => {
      showToast.error(err.message || 'Failed to delete');
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this currency?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({ mutationFn: (data: Record<string, any>) => createCurrency(data), onSuccess: onCurrencyChanged });

  const updateMutation = useMutation({ mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateCurrency(uuid, data), onSuccess: onCurrencyChanged });

  const createCurrencyData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateCurrencyData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: CurrencyContextType = {
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
    createCurrencyData,
    updateCurrencyData,
    isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context) throw new Error('useCurrency must be used within a CurrencyProvider');
  return context;
}
