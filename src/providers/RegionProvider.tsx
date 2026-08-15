import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRegionList, createRegion, updateRegion, deleteRegion } from '../api/RegionApi';
import { showToast } from '../lib/toast';

interface RegionContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
}

export const RegionContext = createContext<RegionContextType | undefined>(undefined);

export default function RegionProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['region-list', currentPage, perPage, searchTerm],
    queryFn: () => getRegionList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRegion,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['region-list'] }); },
    onError: (err: Error) => { showToast(err.message || 'Failed to delete', 'error'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this region?')) deleteMutation.mutate(uuid);
  };

  const items = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData?.data?.items) 
       ? responseData.data.items 
       : (Array.isArray(responseData?.data?.data) ? responseData.data.data : []));
  const meta = responseData?.meta ?? responseData?.data ?? (responseData ? { current_page: responseData.current_page, per_page: responseData.per_page, total: responseData.total, last_page: responseData.last_page } : null);

  const value: RegionContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error('useRegion must be used within a RegionProvider');
  return context;
}
