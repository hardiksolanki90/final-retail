import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getReasonList, createReason, updateReason, deleteReason } from '../api/ReasonApi';
import { showToast } from '../lib/toast';

interface ReasonContextType {
  data: any[]; meta: any; isLoading: boolean; error: Error | null;
  searchTerm: string; setSearchTerm: (term: string) => void;
  typeFilter: string; setTypeFilter: (type: string) => void;
  currentPage: number; setCurrentPage: (page: number) => void;
  perPage: number; setPerPage: (perPage: number) => void;
  selectedRowKeys: string[]; setSelectedRowKeys: (keys: string[]) => void;
  addDrawerOpen: boolean; setAddDrawerOpen: (open: boolean) => void;
  editingItem: any; setEditingItem: (item: any) => void;
  handleDeleteWithConfirmation: (uuid: string) => void; refetch: () => void;
  createReasonData: (data: Record<string, any>) => Promise<any>;
  updateReasonData: (uuid: string, data: Record<string, any>) => Promise<any>;
  isSaving: boolean;
}

export const ReasonContext = createContext<ReasonContextType | undefined>(undefined);

export default function ReasonProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [addDrawerOpen, setAddDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { data: responseData, isLoading, error, refetch } = useQuery({
    queryKey: ['reason-list', currentPage, perPage, searchTerm, typeFilter],
    queryFn: () => getReasonList(currentPage, perPage, searchTerm, typeFilter),
    staleTime: 5 * 60 * 1000,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteReason,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['reason-list'] }); },
    onError: (err: Error) => { showToast.error(err.message || 'Failed to delete'); },
  });

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this reason?')) deleteMutation.mutate(uuid);
  };

  const createMutation = useMutation({
    mutationFn: (data: Record<string, any>) => createReason(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reason-list'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: Record<string, any> }) => updateReason(uuid, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['reason-list'] }),
  });

  const createReasonData = (data: Record<string, any>) => createMutation.mutateAsync(data);
  const updateReasonData = (uuid: string, data: Record<string, any>) => updateMutation.mutateAsync({ uuid, data });

  const items = responseData?.data ?? [];
  const meta = responseData?.meta ?? null;

  const value: ReasonContextType = {
    data: items, meta, isLoading, error: error as Error | null,
    searchTerm, setSearchTerm, typeFilter, setTypeFilter, currentPage, setCurrentPage, perPage, setPerPage,
    selectedRowKeys, setSelectedRowKeys, addDrawerOpen, setAddDrawerOpen,
    editingItem, setEditingItem, handleDeleteWithConfirmation, refetch: () => refetch(),
    createReasonData, updateReasonData, isSaving: createMutation.isPending || updateMutation.isPending,
  };

  return <ReasonContext.Provider value={value}>{children}</ReasonContext.Provider>;
}

export function useReason() {
  const context = useContext(ReasonContext);
  if (!context) throw new Error('useReason must be used within a ReasonProvider');
  return context;
}
