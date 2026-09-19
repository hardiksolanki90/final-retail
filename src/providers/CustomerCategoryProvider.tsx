import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerCategoryList,
  createCustomerCategory,
  updateCustomerCategory,
  deleteCustomerCategory,
} from '../api/CustomerApi';
import { showToast } from '../lib/toast';

interface CustomerCategoryContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createCustomerCategoryData: (data: Record<string, any>) => Promise<any>;
  updateCustomerCategoryData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const CustomerCategoryContext = createContext<CustomerCategoryContextType | undefined>(undefined);

export default function CustomerCategoryProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['customer-category-list', currentPage, perPage, searchTerm],
    queryFn: () => getCustomerCategoryList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCustomerCategory,
    onSuccess: () => {
      showToast.success('Customer category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-category-list'] });
    },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this customer category?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createCustomerCategory(data),
    onSuccess: () => {
      showToast.success('Customer category created successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-category-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to create customer category'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateCustomerCategory(uuid, data),
    onSuccess: () => {
      showToast.success('Customer category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['customer-category-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to update customer category'); },
  });

  const createCustomerCategoryData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateCustomerCategoryData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: CustomerCategoryContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createCustomerCategoryData, updateCustomerCategoryData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <CustomerCategoryContext.Provider value={value}>{children}</CustomerCategoryContext.Provider>;
}

export function useCustomerCategory() {
  const context = useContext(CustomerCategoryContext);
  if (!context) throw new Error('useCustomerCategory must be used within a CustomerCategoryProvider');
  return context;
}
