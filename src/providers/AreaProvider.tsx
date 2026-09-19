import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAreaList, deleteArea } from '../api/AreaApi';
import { showToast } from '../lib/toast';

interface AreaContextType {
  data: any[];
  meta: any;
  isLoading: boolean;
  error: Error | null;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  perPage: number;
  setPerPage: (perPage: number) => void;
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean;
  setAddDrawerOpen: (open: boolean) => void;
  editingItem: any;
  setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  refetch: () => void;
}

export const AreaContext = createContext<AreaContextType | undefined>(undefined);

export default function AreaProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['area-list', currentPage, perPage, searchTerm],
    queryFn: () => getAreaList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArea,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['area-list'] });
      queryClient.invalidateQueries({ queryKey: ['area-all'] });
    },
    onError: (err: Error) => {
      showToast.error(err.message || 'Failed to delete');
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      deleteMutation.mutate(uuid);
    }
  };

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: AreaContextType = {
    data: items,
    meta,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    currentPage,
    setCurrentPage,
    perPage,
    setPerPage,
    selectedRowKeys,
    setSelectedRowKeys,
    addDrawerOpen,
    setAddDrawerOpen,
    editingItem,
    setEditingItem,
    handleDeleteWithConfirmation,
    refetch: () => refetch(),
  };

  return <AreaContext.Provider value={value}>{children}</AreaContext.Provider>;
}

export function useArea() {
  const context = useContext(AreaContext);
  if (!context) throw new Error('useArea must be used within an AreaProvider');
  return context;
}
