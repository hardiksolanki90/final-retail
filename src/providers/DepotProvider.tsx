import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDepotList, createDepot, updateDepot, deleteDepot } from '../api/DepotApi';
import { showToast } from '../lib/toast';

interface DepotContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  regionFilter: string; setRegionFilter: (regionId: string) => void;
  areaFilter: string; setAreaFilter: (areaId: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createDepotData: (data: Record<string, any>) => Promise<any>;
  updateDepotData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const DepotContext = createContext<DepotContextType | undefined>(undefined);

export default function DepotProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [regionFilter, setRegionFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['depot-list', currentPage, perPage, searchTerm, regionFilter, areaFilter],
    queryFn: () => getDepotList(currentPage, perPage, searchTerm, regionFilter || undefined, areaFilter || undefined),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDepot,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['depot-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this depot?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createDepot(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['depot-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateDepot(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['depot-list'] }),
  });

  const createDepotData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateDepotData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: DepotContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, regionFilter, setRegionFilter, areaFilter, setAreaFilter,
    currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createDepotData, updateDepotData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <DepotContext.Provider value={value}>{children}</DepotContext.Provider>;
}

export function useDepot() {
  const context = useContext(DepotContext);
  if (!context) throw new Error('useDepot must be used within a DepotProvider');
  return context;
}
