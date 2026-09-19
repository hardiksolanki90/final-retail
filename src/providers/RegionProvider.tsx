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
  createRegionData: (data: Record<string, any>) => Promise<any>;
  updateRegionData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
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
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this region?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createRegion(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['region-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateRegion(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['region-list'] }),
  });

  const createRegionData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateRegionData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: RegionContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createRegionData, updateRegionData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <RegionContext.Provider value={value}>{children}</RegionContext.Provider>;
}

export function useRegion() {
  const context = useContext(RegionContext);
  if (!context) throw new Error('useRegion must be used within a RegionProvider');
  return context;
}
