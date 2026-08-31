import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getBeatList, createBeat, updateBeat, deleteBeat } from '../api/BeatApi';
import { showToast } from '../lib/toast';

interface BeatContextType {
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

export const BeatContext = createContext<BeatContextType | undefined>(undefined);

export default function BeatProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['beat-list', currentPage, perPage, searchTerm],
    queryFn: () => getBeatList(currentPage, perPage, searchTerm),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBeat,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
    },
    onError: (err: Error) => {
      showToast(err.message || 'Failed to delete', 'error');
    },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this area?')) {
      deleteMutation.mutate(uuid);
    }
  };

  // Normalize response like RegionProvider
  const items = Array.isArray(responseData?.data)
    ? responseData.data
    : Array.isArray(responseData?.data?.items)
      ? responseData.data.items
      : Array.isArray(responseData?.data?.data)
        ? responseData.data.data
        : [];
  const meta =
    responseData?.meta ??
    responseData?.data ??
    (responseData
      ? {
          current_page: responseData.current_page,
          per_page: responseData.per_page,
          total: responseData.total,
          last_page: responseData.last_page,
        }
      : null);

  const value: BeatContextType = {
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

  return <BeatContext.Provider value={value}>{children}</BeatContext.Provider>;
}

export function useBeat() {
  const context = useContext(BeatContext);
  if (!context) throw new Error('useBeat must be used within a BeatProvider');
  return context;
}
