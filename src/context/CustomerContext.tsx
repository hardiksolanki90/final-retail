import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerList,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getCustomerDetails,
  getCustomerSales,
  getCustomerSummary,
  bulkUpdateCustomerStatus,
  exportCustomers,
} from '../api/CustomerApi';
import { showToast } from '../lib/toast';
import type {
  Customer,
  CustomerFormData,
  CustomerListResponse,
  CustomerSalesData,
  CustomerSummaryData,
} from '../types/Customer';
import type { ColumnSearchStates, PaginationData } from '../types/Common';

// Segment types for customer details drawer
type CustomerSegment = 'overview' | 'sales' | 'summary' | 'orders' | 'activity';

interface CustomerContextType {
  // Data
  customerData: CustomerListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  pagination: PaginationData | undefined;

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

  // Drawer data
  customerDetails: Customer | undefined;
  isLoadingDetails: boolean;
  customerSalesData: CustomerSalesData | undefined;
  isLoadingSales: boolean;
  customerSummaryData: CustomerSummaryData | undefined;
  isLoadingSummary: boolean;

  // Segment Management (like crickpro-football)
  activeSegment: CustomerSegment;
  setActiveSegment: (segment: CustomerSegment) => void;
  segments: CustomerSegment[];

  // Date range for sales
  dateRange: [string, string];
  setDateRange: (range: [string, string]) => void;
  handleDateRangeChange: (range: [string, string]) => void;

  // Bulk actions
  selectedRowKeys: string[];
  setSelectedRowKeys: (keys: string[]) => void;
  bulkActionValue: string | undefined;
  handleRowSelect: (key: string, checked: boolean) => void;
  handleSelectAll: (checked: boolean) => void;
  handleBulkAction: (action: string) => void;
  handleBulkStatusUpdate: (status: 'active' | 'inactive') => Promise<void>;

  // Column search
  columnSearchStates: ColumnSearchStates;
  handleColumnSearchToggle: (column: string) => void;
  handleColumnSearchChange: (column: string, value: string) => void;
  handleColumnSearchConfirm: (column: string) => void;
  handleColumnSearchClose: (column: string) => void;

  // CRUD operations
  addCustomer: (data: CustomerFormData) => Promise<Customer>;
  isAdding: boolean;
  updateCustomerData: (uuid: string, data: CustomerFormData) => Promise<Customer>;
  isUpdating: boolean;
  deleteCustomerData: (uuid: string) => void;
  isDeleting: boolean;

  // Export
  exportCustomerData: (format: 'csv' | 'xlsx') => Promise<void>;
  isExporting: boolean;

  // Actions
  refetchCustomers: () => void;
  refetchAll: () => Promise<void>;
  handleAddCustomerModal: () => void;
  handleEdit: (customer: Customer) => void;
  handleRowClick: (customer: Customer) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
}

const CustomerContext = createContext<CustomerContextType | undefined>(undefined);

export { CustomerContext };

interface CustomerProviderProps {
  children: ReactNode;
}

export function CustomerProvider({ children }: CustomerProviderProps) {
  const queryClient = useQueryClient();

  // Segment management (like crickpro-football PlayerProvider)
  const segments: CustomerSegment[] = ['overview', 'sales', 'summary', 'orders', 'activity'];
  const [activeSegment, setActiveSegment] = useState<CustomerSegment>('overview');

  // Modal state
  const [isCustomerModalVisible, setIsCustomerModalVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Drawer state
  const [isCustomerDrawerVisible, setIsCustomerDrawerVisible] = useState(false);
  const [selectedCustomerForDrawer, setSelectedCustomerForDrawer] = useState<Customer | null>(null);

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkActionValue, setBulkActionValue] = useState<string | undefined>(undefined);

  // Column search
  const [columnSearchStates, setColumnSearchStates] = useState<ColumnSearchStates>({
    code: { isOpen: false, value: '' },
    name: { isOpen: false, value: '' },
    mobile: { isOpen: false, value: '' },
    shopName: { isOpen: false, value: '' },
  });

  // Date range for sales data
  const [dateRange, setDateRange] = useState<[string, string]>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  });

  // Export state
  const [isExporting, setIsExporting] = useState(false);

  // Customer list query
  const {
    data: customerData,
    isLoading,
    error,
    refetch: refetchCustomers,
  } = useQuery({
    queryKey: ['customer-list', searchTerm, currentPage, perPage],
    queryFn: () => getCustomerList(currentPage, searchTerm, perPage),
    staleTime: 5 * 60 * 1000,
  });

  // Customer details query - fetch when on overview segment (like crickpro-football pattern)
  const { data: customerDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['customer-details', selectedCustomerForDrawer?.uuid],
    queryFn: () => getCustomerDetails(selectedCustomerForDrawer?.uuid!),
    enabled: !!selectedCustomerForDrawer?.uuid && activeSegment === 'overview',
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Customer sales query - fetch when on sales segment
  const { data: customerSalesData, isLoading: isLoadingSales } = useQuery({
    queryKey: ['customer-sales', selectedCustomerForDrawer?.uuid, dateRange],
    queryFn: () => getCustomerSales(selectedCustomerForDrawer?.uuid!, dateRange[0], dateRange[1]),
    enabled: !!selectedCustomerForDrawer?.uuid && activeSegment === 'sales',
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Customer summary query - fetch when on summary segment
  const { data: customerSummaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['customer-summary', selectedCustomerForDrawer?.uuid],
    queryFn: () => getCustomerSummary(selectedCustomerForDrawer?.uuid!),
    enabled: !!selectedCustomerForDrawer?.uuid && activeSegment === 'summary',
    staleTime: 2 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
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

  // Refetch all customer-related queries (like crickpro-football pattern)
  const refetchAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['customer-list'] }),
      queryClient.invalidateQueries({ queryKey: ['customer-details', selectedCustomerForDrawer?.uuid] }),
      queryClient.invalidateQueries({ queryKey: ['customer-sales', selectedCustomerForDrawer?.uuid] }),
      queryClient.invalidateQueries({ queryKey: ['customer-summary', selectedCustomerForDrawer?.uuid] }),
    ]);
  };

  // Handlers
  const handleRowSelect = (key: string, checked: boolean) => {
    if (checked) {
      setSelectedRowKeys((prev) => [...prev, key]);
    } else {
      setSelectedRowKeys((prev) => prev.filter((k) => k !== key));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && customerData?.data) {
      setSelectedRowKeys(customerData.data.map((customer) => customer.uuid));
    } else {
      setSelectedRowKeys([]);
    }
  };

  const handleBulkAction = (action: string) => {
    setBulkActionValue(action);
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select customers first');
      return;
    }
    showToast.success(`${selectedRowKeys.length} customer(s) ${action} successfully`);
    setSelectedRowKeys([]);
    setBulkActionValue(undefined);
  };

  const handleBulkStatusUpdate = async (status: 'active' | 'inactive') => {
    if (selectedRowKeys.length === 0) {
      showToast.error('Please select customers first');
      return;
    }
    try {
      await bulkUpdateCustomerStatus(selectedRowKeys, status);
      showToast.success(`${selectedRowKeys.length} customer(s) updated to ${status}`);
      setSelectedRowKeys([]);
      queryClient.invalidateQueries({ queryKey: ['customer-list'] });
    } catch (error) {
      showToast.error('Failed to update customer status');
    }
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
      else if (column === 'mobile') searchQuery = `phone:${searchValue}`;
      else if (column === 'shopName') searchQuery = `shop:${searchValue}`;

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

  const handleDateRangeChange = (range: [string, string]) => {
    setDateRange(range);
  };

  const openCustomerDrawer = (customer: Customer) => {
    setSelectedCustomerForDrawer(customer);
    setIsCustomerDrawerVisible(true);
    setActiveSegment('overview');
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

  const handleRowClick = (customer: Customer) => {
    openCustomerDrawer(customer);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this customer?')) {
      deleteCustomerMutation.mutate(uuid);
    }
  };

  const addCustomer = async (data: CustomerFormData) => {
    return await addCustomerMutation.mutateAsync(data);
  };

  const updateCustomerData = async (uuid: string, data: CustomerFormData) => {
    return await updateCustomerMutation.mutateAsync({ uuid, data });
  };

  const exportCustomerData = async (format: 'csv' | 'xlsx') => {
    setIsExporting(true);
    try {
      const blob = await exportCustomers(format, {
        dateFrom: dateRange[0],
        dateTo: dateRange[1],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `customers.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showToast.success('Export completed successfully!');
    } catch (error) {
      showToast.error('Failed to export customers');
    } finally {
      setIsExporting(false);
    }
  };

  const pagination: PaginationData | undefined = customerData
    ? {
        total: customerData.total,
        currentPage: customerData.currentPage,
        perPage: customerData.perPage,
        lastPage: customerData.lastPage,
        nextPage: customerData.nextPage,
        prevPage: customerData.prevPage,
      }
    : undefined;

  const value: CustomerContextType = {
    // Data
    customerData,
    isLoading,
    error: error as Error | null,

    // Search
    searchTerm,
    setSearchTerm,

    // Pagination
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    pagination,

    // Modal
    isCustomerModalVisible,
    setIsCustomerModalVisible,
    selectedCustomer,
    setSelectedCustomer,

    // Drawer
    isCustomerDrawerVisible,
    setIsCustomerDrawerVisible,
    selectedCustomerForDrawer,
    openCustomerDrawer,
    closeCustomerDrawer,

    // Drawer data
    customerDetails,
    isLoadingDetails,
    customerSalesData,
    isLoadingSales,
    customerSummaryData,
    isLoadingSummary,

    // Segment Management
    activeSegment,
    setActiveSegment,
    segments,

    // Date range
    dateRange,
    setDateRange,
    handleDateRangeChange,

    // Bulk actions
    selectedRowKeys,
    setSelectedRowKeys,
    bulkActionValue,
    handleRowSelect,
    handleSelectAll,
    handleBulkAction,
    handleBulkStatusUpdate,

    // Column search
    columnSearchStates,
    handleColumnSearchToggle,
    handleColumnSearchChange,
    handleColumnSearchConfirm,
    handleColumnSearchClose,

    // CRUD
    addCustomer,
    isAdding: addCustomerMutation.isPending,
    updateCustomerData,
    isUpdating: updateCustomerMutation.isPending,
    deleteCustomerData: (uuid: string) => deleteCustomerMutation.mutate(uuid),
    isDeleting: deleteCustomerMutation.isPending,

    // Export
    exportCustomerData,
    isExporting,

    // Actions
    refetchCustomers: () => refetchCustomers(),
    refetchAll,
    handleAddCustomerModal,
    handleEdit,
    handleRowClick,
    handleDeleteWithConfirmation,
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
