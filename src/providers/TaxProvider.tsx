import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTaxList, createTax, updateTax, deleteTax } from '../api/TaxApi';
import { showToast } from '../lib/toast';

interface TaxContextType {
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
  createTaxData: (data: Record<string, any>) => Promise<any>;
  updateTaxData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const TaxContext = createContext<TaxContextType | undefined>(undefined);

export default function TaxProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['tax-list', currentPage, perPage, searchTerm],
    queryFn: () => getTaxList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTax,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-list'] });
    },
    onError: (err: Error) => {
      showToast.error(err.message || 'Failed to delete');
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this tax?')) {
      deleteMutation.mutate(uuid);
    }
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createTax(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tax-list'] }); },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to create tax'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateTax(uuid, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['tax-list'] }); },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to update tax'); },
  });

  const createTaxData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateTaxData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: TaxContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createTaxData, updateTaxData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <TaxContext.Provider value={value}>{children}</TaxContext.Provider>;
}

export function useTax() {
  const context = useContext(TaxContext);
  if (!context) throw new Error('useTax must be used within a TaxProvider');
  return context;
}
