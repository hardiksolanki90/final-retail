import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCreditLimitList, createCreditLimit, updateCreditLimit, deleteCreditLimit } from '../api/CreditLimitApi';
import { getAllSalesmen } from '../api/SalesmanApi';
import { showToast } from '../lib/toast';
import type { CreditLimit } from '../types/CreditLimit';
import type { SalesmanSelectOption } from '../types/Salesman';

interface CreditLimitContextType {
  data: CreditLimit[]; meta: any; isLoading: boolean; error: Error | null;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: CreditLimit | null; setEditingItem: (item: CreditLimit | null) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  salesmanOptions: SalesmanSelectOption[]; salesmanOptionsLoading: boolean;
}

export const CreditLimitContext = createContext<CreditLimitContextType | undefined>(undefined);

export default function CreditLimitProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CreditLimit | null>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['credit-limit-list', currentPage, perPage],
    queryFn: () => getCreditLimitList(currentPage, perPage),
    staleTime: 5 * 60 * 1000,
  });

  const { data: salesmanOptions = [], isLoading: salesmanOptionsLoading } = useQuery({
    queryKey: ['salesmen-all'],
    queryFn: () => getAllSalesmen(),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCreditLimit,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['credit-limit-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to delete', 'error'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this credit limit?')) deleteMutation.mutate(uuid);
  };

  const items = Array.isArray(responseData?.data) ? responseData.data : [];
  const meta = responseData?.meta ?? null;

  const value: CreditLimitContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    salesmanOptions, salesmanOptionsLoading,
  };

  return <CreditLimitContext.Provider value={value}>{children}</CreditLimitContext.Provider>;
}

export function useCreditLimit() {
  const context = useContext(CreditLimitContext);
  if (!context) throw new Error('useCreditLimit must be used within a CreditLimitProvider');
  return context;
}
