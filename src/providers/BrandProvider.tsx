import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBrandList,
  createBrand,
  updateBrand,
  deleteBrand,
} from '../api/ItemApi';
import { showToast } from '../lib/toast';

interface BrandContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createBrandData: (data: Record<string, any>) => Promise<any>;
  updateBrandData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const BrandContext = createContext<BrandContextType | undefined>(undefined);

export default function BrandProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['brand-list', currentPage, perPage, searchTerm],
    queryFn: () => getBrandList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      showToast.success('Brand deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['brand-list'] });
    },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this brand?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createBrand(data),
    onSuccess: () => {
      showToast.success('Brand created successfully');
      queryClient.invalidateQueries({ queryKey: ['brand-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to create brand'); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateBrand(uuid, data),
    onSuccess: () => {
      showToast.success('Brand updated successfully');
      queryClient.invalidateQueries({ queryKey: ['brand-list'] });
    },
    onError: (err: any) => { showToast.error(err?.response?.data?.message || 'Failed to update brand'); },
  });

  const createBrandData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateBrandData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData?.data?.items)
       ? responseData.data.items
       : (Array.isArray(responseData?.data?.data) ? responseData.data.data : []));
  const meta = responseData?.meta ?? responseData?.data ?? (responseData ? { current_page: responseData.current_page, per_page: responseData.per_page, total: responseData.total, last_page: responseData.last_page } : null);

  const value: BrandContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createBrandData, updateBrandData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <BrandContext.Provider value={value}>{children}</BrandContext.Provider>;
}

export function useBrand() {
  const context = useContext(BrandContext);
  if (!context) throw new Error('useBrand must be used within a BrandProvider');
  return context;
}
