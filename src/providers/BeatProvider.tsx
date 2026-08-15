import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getBeatList,
  deleteBeat,
  createBeat,
  updateBeat,
  getBeatDetails,
  getSalesmenList,
  getAreasList,
  getRoutesList,
  getOutletsList,
} from '../api/BeatApi';
import { showToast } from '../lib/toast';
import type {
  Beat,
  BeatFormData,
  BeatListResponse,
  Salesman,
  Area,
  Route,
  Outlet,
} from '../types/Beat';
import type { ColumnSearchStates, PaginationData } from '../types/Common';

interface BeatContextType {
  // Data
  beatData: BeatListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search and filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  areaFilter: number | undefined;
  setAreaFilter: (areaId: number | undefined) => void;
  routeFilter: number | undefined;
  setRouteFilter: (routeId: number | undefined) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  pagination: PaginationData | undefined;

  // Modal state
  isBeatModalVisible: boolean;
  setIsBeatModalVisible: (visible: boolean) => void;
  selectedBeat: Beat | null;
  setSelectedBeat: (beat: Beat | null) => void;

  // Dropdown data
  salesmen: Salesman[] | undefined;
  areas: Area[] | undefined;
  routes: Route[] | undefined;
  outlets: Outlet[] | undefined;
  isLoadingSalesmen: boolean;
  isLoadingAreas: boolean;
  isLoadingRoutes: boolean;
  isLoadingOutlets: boolean;

  // Bulk actions
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  bulkActionValue: string | undefined;
  handleRowSelect: (key: string, checked: boolean) => void;
  handleBulkAction: (action: string) => void;

  // Column search
  columnSearchStates: ColumnSearchStates;
  handleColumnSearchToggle: (column: string) => void;
  handleColumnSearchChange: (column: string, value: string) => void;
  handleColumnSearchConfirm: (column: string) => void;
  handleColumnSearchClose: (column: string) => void;

  // CRUD operations
  addBeat: (data: BeatFormData) => Promise<Beat>;
  isAdding: boolean;
  updateBeatData: (id: number, data: BeatFormData) => Promise<Beat>;
  isUpdating: boolean;
  deleteBeatData: (id: number) => void;
  isDeleting: boolean;

  // Actions
  refetchBeats: () => void;
  handleAddBeatModal: () => void;
  handleEdit: (beat: Beat) => void;
  handleDeleteWithConfirmation: (id: number) => void;
  refreshRoutes: (areaId: number) => void;
  refreshOutlets: (routeId: number) => void;
}

const BeatContext = createContext<BeatContextType | undefined>(undefined);

export { BeatContext };

interface BeatProviderProps {
  children: ReactNode;
}

export default function BeatProvider({ children }: BeatProviderProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [isBeatModalVisible, setIsBeatModalVisible] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<Beat | null>(null);

  // Search and filters
  const [searchTerm, setSearchTerm] = useState('');
  const [areaFilter, setAreaFilter] = useState<number | undefined>(undefined);
  const [routeFilter, setRouteFilter] = useState<number | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkActionValue, setBulkActionValue] = useState<string | undefined>(undefined);

  // Column search
  const [columnSearchStates, setColumnSearchStates] = useState<ColumnSearchStates>({
    code: { isOpen: false, value: '' },
    name: { isOpen: false, value: '' },
    salesman: { isOpen: false, value: '' },
    area: { isOpen: false, value: '' },
    route: { isOpen: false, value: '' },
  });

  // Beat list query
  const {
    data: beatData,
    isLoading,
    error,
    refetch: refetchBeats,
  } = useQuery({
    queryKey: ['beat-list', searchTerm, currentPage, perPage, areaFilter, routeFilter],
    queryFn: () => getBeatList(currentPage, searchTerm, perPage, areaFilter, routeFilter),
    staleTime: 5 * 60 * 1000,
  });

  // Dropdown data queries
  const { data: salesmen, isLoading: isLoadingSalesmen } = useQuery({
    queryKey: ['salesmen-list'],
    queryFn: getSalesmenList,
    staleTime: 30 * 60 * 1000,
  });

  const { data: areas, isLoading: isLoadingAreas } = useQuery({
    queryKey: ['areas-list'],
    queryFn: getAreasList,
    staleTime: 30 * 60 * 1000,
  });

  const { data: routes, isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes-list', areaFilter],
    queryFn: () => getRoutesList(areaFilter),
    enabled: !!areaFilter,
    staleTime: 10 * 60 * 1000,
  });

  const { data: outlets, isLoading: isLoadingOutlets } = useQuery({
    queryKey: ['outlets-list', routeFilter],
    queryFn: () => getOutletsList(routeFilter),
    enabled: !!routeFilter,
    staleTime: 10 * 60 * 1000,
  });

  // Mutations
  const addBeatMutation = useMutation({
    mutationFn: createBeat,
    onSuccess: () => {
      showToast.success('Beat created successfully!');
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      setIsBeatModalVisible(false);
      setSelectedBeat(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create beat');
    },
  });

  const updateBeatMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BeatFormData }) =>
      updateBeat(id, data),
    onSuccess: () => {
      showToast.success('Beat updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
      setIsBeatModalVisible(false);
      setSelectedBeat(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update beat');
    },
  });

  const deleteBeatMutation = useMutation({
    mutationFn: deleteBeat,
    onSuccess: () => {
      showToast.success('Beat deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['beat-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete beat');
    },
  });

  // Handlers
  const handleRowSelect = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, key]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkActionValue(action);
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select beats first');
      return;
    }
    showToast.success(`${selectedRowKeys.length} beat(s) ${action} successfully`);
    setSelectedRowKeys([]);
    setBulkActionValue(undefined);
  };

  const handleColumnSearchToggle = (column: string) => {
    setColumnSearchStates((prev) => ({
      ...prev,
      [column]: {
        ...prev[column],
        isOpen: !prev[column].isOpen,
        value: prev[column].isOpen ? '' : prev[column].value,
      },
    }));
  };

  const handleColumnSearchChange = (column: string, value: string) => {
    setColumnSearchStates((prev) => ({
      ...prev,
      [column]: { ...prev[column], value },
    }));
  };

  const handleColumnSearchConfirm = (column: string) => {
    const searchValue = columnSearchStates[column].value.trim();
    if (searchValue) {
      let searchQuery = '';
      if (column === 'code') searchQuery = `code:${searchValue}`;
      else if (column === 'name') searchQuery = `name:${searchValue}`;
      else if (column === 'salesman') searchQuery = `salesman:${searchValue}`;
      else if (column === 'area') searchQuery = `area:${searchValue}`;
      else if (column === 'route') searchQuery = `route:${searchValue}`;

      setSearchTerm(searchQuery);
      setCurrentPage(1);
      setColumnSearchStates((prev) => ({
        ...prev,
        [column]: { ...prev[column], isOpen: false },
      }));
    }
  };

  const handleColumnSearchClose = (column: string) => {
    setColumnSearchStates((prev) => ({
      ...prev,
      [column]: { isOpen: false, value: '' },
    }));
  };

  const handleAddBeatModal = () => {
    setSelectedBeat(null);
    setIsBeatModalVisible(true);
  };

  const handleEdit = (beat: Beat) => {
    setSelectedBeat(beat);
    setIsBeatModalVisible(true);
  };

  const handleDeleteWithConfirmation = (id: number) => {
    if (window.confirm('Are you sure you want to delete this beat?')) {
      deleteBeatMutation.mutate(id);
    }
  };

  const refreshRoutes = (areaId: number) => {
    setAreaFilter(areaId);
    setRouteFilter(undefined);
    queryClient.invalidateQueries({ queryKey: ['routes-list', areaId] });
  };

  const refreshOutlets = (routeId: number) => {
    setRouteFilter(routeId);
    queryClient.invalidateQueries({ queryKey: ['outlets-list', routeId] });
  };

  const addBeat = async (data: BeatFormData) => {
    return await addBeatMutation.mutateAsync(data);
  };

  const updateBeatData = async (id: number, data: BeatFormData) => {
    return await updateBeatMutation.mutateAsync({ id, data });
  };

  const pagination: PaginationData | undefined = beatData
    ? {
        total: beatData.total,
        currentPage: beatData.currentPage,
        perPage: beatData.perPage,
        lastPage: beatData.lastPage,
        nextPage: beatData.nextPage,
        prevPage: beatData.prevPage,
      }
    : undefined;

  const value: BeatContextType = {
    beatData,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    areaFilter,
    setAreaFilter,
    routeFilter,
    setRouteFilter,
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    pagination,
    isBeatModalVisible,
    setIsBeatModalVisible,
    selectedBeat,
    setSelectedBeat,
    salesmen,
    areas,
    routes,
    outlets,
    isLoadingSalesmen,
    isLoadingAreas,
    isLoadingRoutes,
    isLoadingOutlets,
    selectedRowKeys,
    setSelectedRowKeys,
    bulkActionValue,
    handleRowSelect,
    handleBulkAction,
    columnSearchStates,
    handleColumnSearchToggle,
    handleColumnSearchChange,
    handleColumnSearchConfirm,
    handleColumnSearchClose,
    addBeat,
    isAdding: addBeatMutation.isPending,
    updateBeatData,
    isUpdating: updateBeatMutation.isPending,
    deleteBeatData: (id: number) => deleteBeatMutation.mutate(id),
    isDeleting: deleteBeatMutation.isPending,
    refetchBeats: () => refetchBeats(),
    handleAddBeatModal,
    handleEdit,
    handleDeleteWithConfirmation,
    refreshRoutes,
    refreshOutlets,
  };

  return <BeatContext.Provider value={value}>{children}</BeatContext.Provider>;
}

export function useBeat() {
  const context = useContext(BeatContext);
  if (context === undefined) {
    throw new Error('useBeat must be used within a BeatProvider');
  }
  return context;
}