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
    onError: (err: Error) => { showToast(err.message || 'Failed to delete', 'error'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this zone?')) deleteMutation.mutate(uuid);
  };

  const items = Array.isArray(responseData?.data)
    ? responseData.data
    : (Array.isArray(responseData?.data?.items) 
       ? responseData.data.items 
       : (Array.isArray(responseData?.data?.data) ? responseData.data.data : []));
  const meta = responseData?.meta ?? responseData?.data ?? (responseData ? { current_page: responseData.current_page, per_page: responseData.per_page, total: responseData.total, last_page: responseData.last_page } : null);

  const value: ZoneContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
  };

  return <ZoneContext.Provider value={value}>{children}</ZoneContext.Provider>;
}

export function useZone() {
  const context = useContext(ZoneContext);
  if (!context) throw new Error('useZone must be used within a ZoneProvider');
  return context;
}
