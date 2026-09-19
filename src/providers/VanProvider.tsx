import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getVanList, createVan, updateVan, deleteVan } from '../api/VanApi';
import { showToast } from '../lib/toast';

interface VanContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createVanData: (data: Record<string, any>) => Promise<any>;
  updateVanData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const VanContext = createContext<VanContextType | undefined>(undefined);

export default function VanProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['van-list', currentPage, perPage, searchTerm],
    queryFn: () => getVanList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVan,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['van-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this van?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createVan(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['van-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateVan(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['van-list'] }),
  });

  const createVanData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateVanData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: VanContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createVanData, updateVanData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <VanContext.Provider value={value}>{children}</VanContext.Provider>;
}

export function useVan() {
  const context = useContext(VanContext);
  if (!context) throw new Error('useVan must be used within a VanProvider');
  return context;
}
