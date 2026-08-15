import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerList,
  getAllCustomers,
  searchCustomers,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getCustomerDetails,
  getCustomerSales,
  getCustomersBySalesman,
  bulkActionCustomers,
  getCustomerTypes,
  getCustomerCategories,
  getCustomerGroups,
  getChannels,
  getPaymentTerms,
  getRoutes,
} from '../api/CustomerApi';
import { showToast } from '../lib/toast';
import type {
  Customer,
  CustomerFormData,
  CustomerListResponse,
  CustomerSalesData,
  CustomerType,
  CustomerCategory,
  CustomerGroup,
  Channel,
  PaymentTerm,
  Route,
  CustomerFilters,
  CustomerBulkAction,
} from '../types/Customer';

interface CustomerContextType {
  // Data
  customerData: CustomerListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search and filters
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filters: CustomerFilters;
  setFilters: (filters: CustomerFilters) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;

  // Modal state
  isCustomerModalVisible: boolean;
  setIsCustomerModalVisible: (visible: boolean) => void;
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;

  // Drawer state
  isCustomerDrawerVisible: boolean;
  setIsCustomerDrawerVisible: (visible: boolean) => void;
  selectedCustomerForDrawer: Customer | null;
  openCustomerDrawer: (customer: Customer) => void;
  closeCustomerDrawer: () => void;

  // Sales data
  customerSalesData: CustomerSalesData | undefined;
  salesDateRange: [string, string];
  setSalesDateRange: (range: [string, string]) => void;
  isLoadingSales: boolean;

  // CRUD operations
  addCustomer: (data: CustomerFormData) => Promise<Customer>;
  isAdding: boolean;
  updateCustomerData: (uuid: string, data: CustomerFormData) => Promise<Customer>;
  isUpdating: boolean;
  deleteCustomerData: (uuid: string) => void;
  isDeleting: boolean;

  // Related data
  customerTypes: CustomerType[];
  customerCategories: CustomerCategory[];
  customerGroups: CustomerGroup[];
  channels: Channel[];
  paymentTerms: PaymentTerm[];
  routes: Route[];
  isLoadingRelatedData: boolean;

  // Additional queries
  allCustomers: any[] | undefined;
  customersBySalesman: Customer[] | undefined;

  // Actions
  refetchCustomers: () => void;
  handleAddCustomerModal: () => void;
  handleEdit: (customer: Customer) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;

  // Bulk actions
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  handleBulkAction: (action: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export { CustomerContext };

interface CustomerProviderProps {
  children: ReactNode;
}

export default function CustomerProvider({ children }: CustomerProviderProps) {
  const queryClient = useQueryClient();

  // State
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerDrawerVisible, setIsCustomerDrawerVisible] = useState(false);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [filters, setFilters] = useState<CustomerFilters>({});
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [salesDateRange, setSalesDateRange] = useState<[string, string]>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  });

  // Customer list query
  const {
    data: customerData,
    isLoading,
    error,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ['customer-list', searchTerm, currentPage, perPage, filters],
    queryFn: () => getCustomerList(currentPage, searchTerm, perPage, filters),
    staleTime: 5 * 60 * 1000,
  });

  // Customer sales data query
  const { data: customerSalesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['customer-sales', selectedCustomerForDrawer?.uuid, salesDateRange],
    queryFn: () => 
      getCustomerSales(
        selectedCustomerForDrawer?.uuid!,
        salesDateRange[0],
        salesDateRange[1]
      ),
    enabled: !!selectedCustomerForDrawer?.uuid,
    staleTime: 5 * 60 * 1000,
  });

  // Related data queries
  const { data: customerTypes = [], isLoading: isLoadingTypes } = useQuery({
    queryKey: ['customer-types'],
    queryFn: getCustomerTypes,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  const { data: customerCategories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['customer-categories'],
    queryFn: getCustomerCategories,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  const { data: customerGroups = [], isLoading: isLoadingGroups } = useQuery({
    queryKey: ['customer-groups'],
    queryFn: getCustomerGroups,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  const { data: channels = [], isLoading: isLoadingChannels } = useQuery({
    queryKey: ['channels'],
    queryFn: getChannels,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  const { data: paymentTerms = [], isLoading: isLoadingPaymentTerms } = useQuery({
    queryKey: ['payment-terms'],
    queryFn: getPaymentTerms,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  const { data: routes = [], isLoading: isLoadingRoutes } = useQuery({
    queryKey: ['routes'],
    queryFn: getRoutes,
    staleTime: 10 * 60 * 1000,
    enabled: isCustomerModalVisible,
  });

  // All customers query (for dropdowns)
  const { data: allCustomers } = useQuery({
    queryKey: ['all-customers', filters],
    queryFn: () => getAllCustomers(filters),
    staleTime: 10 * 60 * 1000,
    enabled: false, // Only fetch when needed
  });

  // Customers by salesman query
  const { data: customersBySalesman } = useQuery({
    queryKey: ['customers-by-salesman', filters.salesmanId],
    queryFn: () => getCustomersBySalesman(filters.salesmanId!),
    enabled: !!filters.salesmanId,
    staleTime: 5 * 60 * 1000,
  });

  // Mutations
  const addCustomerMutation = useMutation({
    mutationFn: createCustomer,
    onSuccess: () => {
      showToast.success('Customer created successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-list'] });
      setIsCustomerModalVisible(false);
      setSelectedCustomer(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create customer');
    },
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: CustomerFormData }) =>
      updateCustomer(uuid, data),
    onSuccess: () => {
      showToast.success('Customer updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-list'] });
      setIsCustomerModalVisible(false);
      setSelectedCustomer(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update customer');
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: deleteCustomer,
    onSuccess: () => {
      showToast.success('Customer deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete customer');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: bulkActionCustomers,
    onSuccess: () => {
      showToast.success('Bulk action completed successfully!');
      queryClient.invalidateQueries({ queryKey: ['customer-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to complete bulk action');
    },
  });

  // Handlers
  const openCustomerDrawer = (customer: Customer) => {
    setSelectedCustomerForDrawer(customer);
    setIsCustomerDrawerVisible(true);
  };

  const closeCustomerDrawer = () => {
    setSelectedCustomerForDrawer(null);
    setIsCustomerDrawerVisible(false);
  };

  const handleAddCustomerModal = () => {
    setSelectedCustomer(null);
    setIsCustomerModalVisible(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsCustomerModalVisible(true);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomerMutation.mutate(uuid);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select customers first');
      return;
    }

    const bulkAction: CustomerBulkAction = {
      action: action as 'activate' | 'deactivate' | 'delete',
      uuids: selectedRowKeys,
    };

    bulkActionMutation.mutate(bulkAction);
  };

  const addCustomer = async (data: CustomerFormData) => {
    return await addCustomerMutation.mutateAsync(data);
  };

  const updateCustomerData = async (uuid: string, data: CustomerFormData) => {
    return await updateCustomerMutation.mutateAsync({ uuid, data });
  };

  const deleteCustomerData = (uuid: string) => {
    deleteCustomerMutation.mutate(uuid);
  };

  const isLoadingRelatedData = 
    isLoadingTypes ||
    isLoadingCategories ||
    isLoadingGroups ||
    isLoadingChannels ||
    isLoadingPaymentTerms ||
    isLoadingRoutes;

  const value: CustomerContextType = {
    customerData,
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
    isCustomerModalVisible,
    setIsCustomerModalVisible,
    selectedCustomer,
    setSelectedCustomer,
    isCustomerDrawerVisible,
    setIsCustomerDrawerVisible,
    selectedCustomerForDrawer,
    openCustomerDrawer,
    closeCustomerDrawer,
    customerSalesData,
    salesDateRange,
    setSalesDateRange,
    isLoadingSales,
    addCustomer,
    isAdding: addCustomerMutation.isPending,
    updateCustomerData,
    isUpdating: updateCustomerMutation.isPending,
    deleteCustomerData,
    isDeleting: deleteCustomerMutation.isPending,
    customerTypes,
    customerCategories,
    customerGroups,
    channels,
    paymentTerms,
    routes,
    isLoadingRelatedData,
    allCustomers,
    customersBySalesman,
    refetchCustomers: () => refetchCustomers(),
    handleAddCustomerModal,
    handleEdit,
    handleDeleteWithConfirmation,
    selectedRowKeys,
    setSelectedRowKeys,
    handleBulkAction,
  };

  return <CustomerContext.Provider value={value}>{children}</CustomerContext.Provider>;
}

export function useCustomer() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
}