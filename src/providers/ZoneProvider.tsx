import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getZoneList, createZone, updateZone, deleteZone } from '../api/ZoneApi';
import { showToast } from '../lib/toast';

interface ZoneContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createZoneData: (data: Record<string, any>) => Promise<any>;
  updateZoneData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const ZoneContext = createContext<ZoneContextType | undefined>(undefined);

export default function ZoneProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['zone-list', currentPage, perPage, searchTerm],
    queryFn: () => getZoneList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteZone,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['zone-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this zone?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createZone(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zone-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateZone(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['zone-list'] }),
  });

  const createZoneData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateZoneData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: ZoneContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createZoneData, updateZoneData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}

export function useZone() {
  const context = useContext(ZoneContext);
  if (!context) throw new Error('useZone must be used within a ZoneProvider');
  return context;
}
