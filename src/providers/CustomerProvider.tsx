import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCustomerList,
  getAllCustomers,
  deleteCustomer,
  createCustomer,
  updateCustomer,
  getCustomerSales,
  getCustomersBySalesman,
  bulkActionCustomers,
  getCustomerTypes,
  getCustomerCategories,
  createCustomerCategory,
  getCustomerGroups,
  createCustomerGroup,
  getChannels,
  createChannel,
  getSalesOrganisations,
  createSalesOrganisation,
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
  SalesOrganisation,
} from '../types/Customer';
import type { SelectOption } from '../components/ui/Select';

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
  salesOrganisations: SalesOrganisation[];
  paymentTerms: PaymentTerm[];

  // Inline "add new" for Category/Group/Channel dropdowns
  createCustomerCategoryOption: (values: Record<string, any>) => Promise<SelectOption>;
  createCustomerGroupOption: (values: Record<string, any>) => Promise<SelectOption>;
  createChannelOption: (values: Record<string, any>) => Promise<SelectOption>;
  createSalesOrganisationOption: (values: Record<string, any>) => Promise<SelectOption>;
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

  const { data: salesOrganisations = [], isLoading: isLoadingSalesOrganisations } = useQuery({
    queryKey: ['sales-organisations'],
    queryFn: getSalesOrganisations,
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

  // Inline "add new" mutations for the Category/Group/Channel dropdowns'
  // quick-create modals — field set per entity matches its own migration
  // (customer_categories has a code + self-referencing parent; customer_groups
  // has a code + free-text type, no hierarchy; channels has a self-referencing
  // parent, no code). Each invalidates the same query key its list query above
  // uses, so the new option shows up everywhere, not just this form.
  const createCategoryMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      createCustomerCategory({
        categoryName: values.name,
        customerCategoryCode: values.code || undefined,
        parentId: values.parentId ? Number(values.parentId) : undefined,
        nodeLevel: values.nodeLevel ? Number(values.nodeLevel) : undefined,
        status: values.status ?? true,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-categories'] }),
  });

  const createGroupMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      createCustomerGroup({
        groupName: values.name,
        groupCode: values.code || undefined,
        type: values.type || undefined,
        status: values.status ?? true,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['customer-groups'] }),
  });

  const createChannelMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      createChannel({
        channelName: values.name,
        parentId: values.parentId ? Number(values.parentId) : undefined,
        status: values.status ?? true,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['channels'] }),
  });

  const createSalesOrganisationMutation = useMutation({
    mutationFn: (values: Record<string, any>) =>
      createSalesOrganisation({
        name: values.name,
        parentId: values.parentId ? Number(values.parentId) : undefined,
        status: values.status ?? true,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['sales-organisations'] }),
  });

  const createCustomerCategoryOption = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createCategoryMutation.mutateAsync(values);
    return { value: String(created.id ?? ''), label: created.categoryName };
  };

  const createCustomerGroupOption = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createGroupMutation.mutateAsync(values);
    return { value: String(created.id ?? ''), label: created.groupName };
  };

  const createChannelOption = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createChannelMutation.mutateAsync(values);
    return { value: String(created.id ?? ''), label: created.channelName };
  };

  const createSalesOrganisationOption = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createSalesOrganisationMutation.mutateAsync(values);
    return { value: String(created.id ?? ''), label: created.name };
  };

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
    isLoadingSalesOrganisations ||
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
    salesOrganisations,
    paymentTerms,
    routes,
    isLoadingRelatedData,
    createCustomerCategoryOption,
    createCustomerGroupOption,
    createChannelOption,
    createSalesOrganisationOption,
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