import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSalesmanList,
  getAllSalesmen,
  searchSalesmen,
  deleteSalesman,
  createSalesman,
  updateSalesman,
  getSalesmanDetails,
  getSalesmanSales,
  getSalesmanLoginHistory,
  bulkActionSalesmen,
  getSalesmanTypes,
  getSalesmanRoles,
  getRoutes,
  getCountries,
  getSupervisorOptions,
} from '../api/SalesmanApi';
import { showToast } from '../lib/toast';
import type {
  Salesman,
  SalesmanFormData,
  SalesmanListResponse,
  SalesmanSalesData,
  SalesmanLoginHistory,
  SalesmanType,
  SalesmanRole,
  SalesmanFilters,
  SalesmanBulkAction,
  SalesmanSelectOption,
  Country,
  Route,
  SupervisorOption,
} from '../types/Salesman';

interface SalesmanContextType {
  // Data
  salesmanData: SalesmanListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search and filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: SalesmanFilters;
  setFilters: (filters: SalesmanFilters) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Modal state
  isSalesmanModalVisible: boolean;
  setIsSalesmanModalVisible: (visible: boolean) => void;
  selectedSalesman: Salesman | null;
  setSelectedSalesman: (salesman: Salesman | null) => void;

  // Drawer state
  isSalesmanDrawerVisible: boolean;
  setIsSalesmanDrawerVisible: (visible: boolean) => void;
  selectedSalesmanForDrawer: Salesman | null;
  openSalesmanDrawer: (salesman: Salesman) => void;
  closeSalesmanDrawer: () => void;

  // Sales data
  salesmanSalesData: SalesmanSalesData | undefined;
  salesDateRange: [string, string];
  setSalesDateRange: (range: [string, string]) => void;
  isLoadingSales: boolean;

  // Login history
  loginHistory: SalesmanLoginHistory[] | undefined;
  isLoadingLoginHistory: boolean;


  // Related data
  salesmanTypes: SalesmanType[];
  salesmanRoles: SalesmanRole[];
  routes: Route[];
  countries: Country[];
  supervisorOptions: SupervisorOption[];
  isLoadingRelatedData: boolean;

  // Additional queries
  allSalesmen: SalesmanSelectOption[] | undefined;

  // Bulk actions
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  handleBulkAction: (action: string) => void;

  // CRUD operations
  addSalesman: (data: SalesmanFormData) => Promise<Salesman>;
  isAdding: boolean;
  updateSalesmanData: (uuid: string, data: SalesmanFormData) => Promise<Salesman>;
  isUpdating: boolean;
  deleteSalesmanData: (uuid: string) => void;
  isDeleting: boolean;

  // Actions
  refetchSalesmen: () => void;
  handleAddSalesmanModal: () => void;
  handleEdit: (salesman: Salesman) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
}

const SalesmanContext = createContext<SalesmanContextType | undefined>(undefined);

export { SalesmanContext };

interface SalesmanProviderProps {
  children: ReactNode;
}

export default function SalesmanProvider({ children }: SalesmanProviderProps) {
  const queryClient = useQueryClient();

  // State
  const [isSalesmanModalVisible, setIsSalesmanModalVisible] = useState(false);
  const [selectedSalesman, setSelectedSalesman] = useState<Salesman | null>(null);
  const [isSalesmanDrawerVisible, setIsSalesmanDrawerVisible] = useState(false);
  const [selectedSalesmanForDrawer, setSelectedSalesmanForDrawer] = useState<Salesman | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filters, setFilters] = useState<SalesmanFilters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [salesDateRange, setSalesDateRange] = useState<[string, string]>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  });


  // Salesman list query
  const {
    data: salesmanData,
    isLoading,
    error,
    refetch: refetchSalesmen,
  } = useQuery({
    queryKey: ['salesman-list', searchTerm, currentPage, perPage, filters],
    queryFn: () => getSalesmanList(currentPage, searchTerm, perPage, filters),
    staleTime: 5 * 60 * 1000,
  });

  // Salesman sales data query
  const { data: salesmanSalesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['salesman-sales', selectedSalesmanForDrawer?.uuid, salesDateRange],
    queryFn: () => 
      getSalesmanSales(
        selectedSalesmanForDrawer?.uuid!,
        salesDateRange[0],
        salesDateRange[1]
      ),
    enabled: !!selectedSalesmanForDrawer?.uuid,
    staleTime: 5 * 60 * 1000,
  });

  // Login history query
  const { data: loginHistory, isLoading: isLoadingLoginHistory } = useQuery({
    queryKey: ['salesman-login-history', selectedSalesmanForDrawer?.user?.id],
    queryFn: () => getSalesmanLoginHistory(selectedSalesmanForDrawer?.user?.id!, 20),
    enabled: !!selectedSalesmanForDrawer?.user?.id,
    staleTime: 10 * 60 * 1000,
  });

  // Related data queries
  const { data: salesmanTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['salesman-types'],
    queryFn: getSalesmanTypes,
    staleTime: 10 * 60 * 1000,
    enabled: isSalesmanModalVisible,
  });

  const { data: salesmanRoles = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ['salesman-roles'],
    queryFn: getSalesmanRoles,
    staleTime: 10 * 60 * 1000,
    enabled: isSalesmanModalVisible,
  });

  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes,
    staleTime: 10 * 60 * 1000,
    enabled: isSalesmanModalVisible,
  });

  const { data: countries = [], isLoading: isLoadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 10 * 60 * 1000,
    enabled: isSalesmanModalVisible,
  });

  const { data: supervisorOptions = [], isLoading: isLoadingSupervisors } = useQuery({
    queryKey: ['supervisor-options'],
    queryFn: getSupervisorOptions,
    staleTime: 10 * 60 * 1000,
    enabled: isSalesmanModalVisible,
  });

  // All salesmen query (for dropdowns)
  const { data: allSalesmen } = useQuery({
    queryKey: ['all-salesmen', filters],
    queryFn: () => getAllSalesmen(filters),
    staleTime: 10 * 60 * 1000,
    enabled: false, // Only fetch when needed
  });

  // Mutations
  const addSalesmanMutation = useMutation({
    mutationFn: createSalesman,
    onSuccess: () => {
      showToast.success('Salesman created successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-list'] });
      setIsSalesmanModalVisible(false);
      setSelectedSalesman(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create salesman');
    },
  });

  const updateSalesmanMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: SalesmanFormData }) =>
      updateSalesman(uuid, data),
    onSuccess: () => {
      showToast.success('Salesman updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-list'] });
      setIsSalesmanModalVisible(false);
      setSelectedSalesman(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update salesman');
    },
  });

  const deleteSalesmanMutation = useMutation({
    mutationFn: deleteSalesman,
    onSuccess: () => {
      showToast.success('Salesman deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete salesman');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: bulkActionSalesmen,
    onSuccess: () => {
      showToast.success('Bulk action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['salesman-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to complete bulk action');
    },
  });

  // Handlers
  const openSalesmanDrawer = (salesman: Salesman) => {
    setSelectedSalesmanForDrawer(salesman);
    setIsSalesmanDrawerVisible(true);
  };

  const closeSalesmanDrawer = () => {
    setSelectedSalesmanForDrawer(null);
    setIsSalesmanDrawerVisible(false);
  };

  const handleAddSalesmanModal = () => {
    setSelectedSalesman(null);
    setIsSalesmanModalVisible(true);
  };

  const handleEdit = (salesman: Salesman) => {
    setSelectedSalesman(salesman);
    setIsSalesmanModalVisible(true);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this salesman?')) {
      deleteSalesmanMutation.mutate(uuid);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select salesmen first');
      return;
    }

    const bulkAction: SalesmanBulkAction = {
      action: action as 'activate' | 'deactivate' | 'delete' | 'block' | 'unblock',
      uuids: selectedRowKeys,
    };

    bulkActionMutation.mutate(bulkAction);
  };


  const addSalesman = async (data: SalesmanFormData) => {
    return await addSalesmanMutation.mutateAsync(data);
  };

  const updateSalesmanData = async (uuid: string, data: SalesmanFormData) => {
    return await updateSalesmanMutation.mutateAsync({ uuid, data });
  };

  const deleteSalesmanData = (uuid: string) => {
    deleteSalesmanMutation.mutate(uuid);
  };

  const isLoadingRelatedData = 
    isLoadingTypes ||
    isLoadingRoles ||
    isLoadingRoutes ||
    isLoadingCountries ||
    isLoadingSupervisors;

  const value: SalesmanContextType = {
    salesmanData,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    isSalesmanModalVisible,
    setIsSalesmanModalVisible,
    selectedSalesman,
    setSelectedSalesman,
    isSalesmanDrawerVisible,
    setIsSalesmanDrawerVisible,
    selectedSalesmanForDrawer,
    openSalesmanDrawer,
    closeSalesmanDrawer,
    salesmanSalesData,
    salesDateRange,
    setSalesDateRange,
    isLoadingSales,
    loginHistory,
    isLoadingLoginHistory,
    salesmanTypes,
    salesmanRoles,
    routes,
    countries,
    supervisorOptions,
    isLoadingRelatedData,
    allSalesmen,
    selectedRowKeys,
    setSelectedRowKeys,
    handleBulkAction,
    addSalesman,
    isAdding: addSalesmanMutation.isPending,
    updateSalesmanData,
    isUpdating: updateSalesmanMutation.isPending,
    deleteSalesmanData,
    isDeleting: deleteSalesmanMutation.isPending,
    refetchSalesmen: () => refetchSalesmen(),
    handleAddSalesmanModal,
    handleEdit,
    handleDeleteWithConfirmation,
  };

  return <SalesmanContext.Provider value={value}>{children}</SalesmanContext.Provider>;
}

export function useSalesman() {
  const context = useContext(SalesmanContext);
  if (context === undefined) {
    throw new Error('useSalesman must be used within a SalesmanProvider');
  }
  return context;
}