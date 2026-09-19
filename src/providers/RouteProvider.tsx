import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRouteList, createRoute, updateRoute, deleteRoute } from '../api/RouteApi';
import { showToast } from '../lib/toast';

interface RouteContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  areaFilter: string; setAreaFilter: (areaId: string) => void;
  depotFilter: string; setDepotFilter: (depotId: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createRouteData: (data: Record<string, any>) => Promise<any>;
  updateRouteData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const RouteContext = createContext<RouteContextType | undefined>(undefined);

export default function RouteProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState('');
  const [depotFilter, setDepotFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['route-list', currentPage, perPage, searchTerm, areaFilter, depotFilter],
    queryFn: () => getRouteList(currentPage, perPage, searchTerm, areaFilter || undefined, depotFilter || undefined),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRoute,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['route-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this route?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createRoute(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['route-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateRoute(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['route-list'] }),
  });

  const createRouteData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateRouteData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: RouteContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, areaFilter, setAreaFilter, depotFilter, setDepotFilter,
    currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createRouteData, updateRouteData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <RouteContext.Provider value={value}>{children}</RouteContext.Provider>;
}

export function useRoute() {
  const context = useContext(RouteContext);
  if (!context) throw new Error('useRoute must be used within a RouteProvider');
  return context;
}
