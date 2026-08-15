import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDeliveryList,
  deleteDelivery,
  createDelivery,
  updateDelivery,
  getDeliveryDetails,
  getDeliveryTracking,
  updateDeliveryStatus,
  markDeliveryAsDelivered,
  assignDriver,
  bulkUpdateDeliveryStatus,
} from '../api/DeliveryApi';
import { showToast } from '../lib/toast';
import type {
  Delivery,
  DeliveryFormData,
  DeliveryListResponse,
} from '../types/Delivery';
import type { ColumnSearchStates, PaginationData } from '../types/Common';

interface DeliveryContextType {
  // Data
  deliveryData: DeliveryListResponse | undefined;
  isLoading: boolean;
  error: Error | null;

  // Search
  searchTerm: string;
  setSearchTerm: (term: string) => void;

  // Filters
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  dateFilter: [string, string];
  setDateFilter: (range: [string, string]) => void;

  // Pagination
  currentPage: number;
  perPage: number;
  setCurrentPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  pagination: PaginationData | undefined;

  // Modal state
  isDeliveryModalVisible: boolean;
  setIsDeliveryModalVisible: (visible: boolean) => void;
  selectedDelivery: Delivery | null;
  setSelectedDelivery: (delivery: Delivery | null) => void;

  // Drawer state
  isDeliveryDrawerVisible: boolean;
  setIsDeliveryDrawerVisible: (visible: boolean) => void;
  selectedDeliveryForDrawer: Delivery | null;
  openDeliveryDrawer: (delivery: Delivery) => void;
  closeDeliveryDrawer: () => void;

  // Drawer data
  deliveryDetails: Delivery | undefined;
  isLoadingDetails: boolean;
  deliveryTrackingData: unknown;
  isLoadingTracking: boolean;

  // Tab state
  activeTab: string;
  setActiveTab: (tab: string) => void;
  handleTabChange: (tab: string) => void;

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
  addDelivery: (data: DeliveryFormData) => Promise<Delivery>;
  isAdding: boolean;
  updateDeliveryData: (uuid: string, data: DeliveryFormData) => Promise<Delivery>;
  isUpdating: boolean;
  deleteDeliveryData: (uuid: string) => void;
  isDeleting: boolean;
  updateStatus: (uuid: string, status: Delivery['status']) => Promise<Delivery>;
  isUpdatingStatus: boolean;
  markAsDelivered: (uuid: string, deliveryData: any) => Promise<Delivery>;
  isMarkingDelivered: boolean;
  assignDriverToDelivery: (uuid: string, driverId: string) => Promise<Delivery>;
  isAssigningDriver: boolean;

  // Actions
  refetchDeliveries: () => void;
  handleAddDeliveryModal: () => void;
  handleEdit: (delivery: Delivery) => void;
  handleRowClick: (delivery: Delivery) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  handleStatusUpdate: (uuid: string, status: Delivery['status']) => void;
  handleMarkAsDelivered: (uuid: string, deliveryData: any) => void;
  handleAssignDriver: (uuid: string, driverId: string) => void;
}

const DeliveryContext = createContext<DeliveryContextType | undefined>(undefined);

export { DeliveryContext };

interface DeliveryProviderProps {
  children: ReactNode;
}

export default function DeliveryProvider({ children }: DeliveryProviderProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [isDeliveryModalVisible, setIsDeliveryModalVisible] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  // Drawer state
  const [isDeliveryDrawerVisible, setIsDeliveryDrawerVisible] = useState(false);
  const [selectedDeliveryForDrawer, setSelectedDeliveryForDrawer] = useState<Delivery | null>(null);

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<[string, string]>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 7);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  });

  // Bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkActionValue, setBulkActionValue] = useState<string | undefined>(undefined);

  // Column search
  const [columnSearchStates, setColumnSearchStates] = useState<ColumnSearchStates>({
    deliveryNumber: { isOpen: false, value: '' },
    customer: { isOpen: false, value: '' },
    driver: { isOpen: false, value: '' },
    status: { isOpen: false, value: '' },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  // Delivery list query with filters
  const {
    data: deliveryData,
    isLoading,
    error,
    refetch: refetchDeliveries,
  } = useQuery({
    queryKey: ['delivery-list', searchTerm, currentPage, perPage, statusFilter, dateFilter],
    queryFn: () => getDeliveryList(currentPage, searchTerm, perPage, {
      status: statusFilter || undefined,
      dateFrom: dateFilter[0],
      dateTo: dateFilter[1],
    }),
    staleTime: 2 * 60 * 1000,
  });

  // Delivery details query
  const { data: deliveryDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['delivery-details', selectedDeliveryForDrawer?.uuid],
    queryFn: () => getDeliveryDetails(selectedDeliveryForDrawer?.uuid!),
    enabled: !!selectedDeliveryForDrawer?.uuid && activeTab === 'details',
    staleTime: 5 * 60 * 1000,
  });

  // Delivery tracking query
  const { data: deliveryTrackingData, isLoading: isLoadingTracking } = useQuery({
    queryKey: ['delivery-tracking', selectedDeliveryForDrawer?.uuid],
    queryFn: () => getDeliveryTracking(selectedDeliveryForDrawer?.uuid!),
    enabled: !!selectedDeliveryForDrawer?.uuid && activeTab === 'tracking',
    staleTime: 1 * 60 * 1000,
  });

  // Mutations
  const addDeliveryMutation = useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      showToast.success('Delivery created successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      setIsDeliveryModalVisible(false);
      setSelectedDelivery(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create delivery');
    },
  });

  const updateDeliveryMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: DeliveryFormData }) =>
      updateDelivery(uuid, data),
    onSuccess: () => {
      showToast.success('Delivery updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      setIsDeliveryModalVisible(false);
      setSelectedDelivery(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update delivery');
    },
  });

  const deleteDeliveryMutation = useMutation({
    mutationFn: deleteDelivery,
    onSuccess: () => {
      showToast.success('Delivery deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete delivery');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: Delivery['status'] }) =>
      updateDeliveryStatus(uuid, status),
    onSuccess: () => {
      showToast.success('Delivery status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update delivery status');
    },
  });

  const markAsDeliveredMutation = useMutation({
    mutationFn: ({ uuid, deliveryData }: { uuid: string; deliveryData: any }) =>
      markDeliveryAsDelivered(uuid, deliveryData),
    onSuccess: () => {
      showToast.success('Delivery marked as delivered successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to mark delivery as delivered');
    },
  });

  const assignDriverMutation = useMutation({
    mutationFn: ({ uuid, driverId }: { uuid: string; driverId: string }) =>
      assignDriver(uuid, driverId),
    onSuccess: () => {
      showToast.success('Driver assigned successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      queryClient.invalidateQueries({ queryKey: ['delivery-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to assign driver');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ uuids, status }: { uuids: string[]; status: Delivery['status'] }) =>
      bulkUpdateDeliveryStatus(uuids, status),
    onSuccess: () => {
      showToast.success('Deliveries updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['delivery-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update deliveries');
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
      showToast.error('Please select deliveries first');
      return;
    }

    const statusActions = {
      'dispatch': 'in_transit',
      'deliver': 'delivered',
      'fail': 'failed',
      'cancel': 'cancelled'
    } as const;

    if (action in statusActions) {
      const status = statusActions[action as keyof typeof statusActions] as Delivery['status'];
      bulkUpdateMutation.mutate({ uuids: selectedRowKeys, status });
    } else {
      showToast.success(`${selectedRowKeys.length} delivery(deliveries) ${action} successfully`);
      setSelectedRowKeys([]);
    }
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
      if (column === 'deliveryNumber') searchQuery = `delivery:${searchValue}`;
      else if (column === 'customer') searchQuery = `customer:${searchValue}`;
      else if (column === 'driver') searchQuery = `driver:${searchValue}`;
      else if (column === 'status') searchQuery = `status:${searchValue}`;

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

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const openDeliveryDrawer = (delivery: Delivery) => {
    setSelectedDeliveryForDrawer(delivery);
    setIsDeliveryDrawerVisible(true);
    setActiveTab('details');
  };

  const closeDeliveryDrawer = () => {
    setSelectedDeliveryForDrawer(null);
    setIsDeliveryDrawerVisible(false);
  };

  const handleAddDeliveryModal = () => {
    setSelectedDelivery(null);
    setIsDeliveryModalVisible(true);
  };

  const handleEdit = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setIsDeliveryModalVisible(true);
  };

  const handleRowClick = (delivery: Delivery) => {
    openDeliveryDrawer(delivery);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this delivery?')) {
      deleteDeliveryMutation.mutate(uuid);
    }
  };

  const handleStatusUpdate = (uuid: string, status: Delivery['status']) => {
    updateStatusMutation.mutate({ uuid, status });
  };

  const handleMarkAsDelivered = (uuid: string, deliveryData: any) => {
    markAsDeliveredMutation.mutate({ uuid, deliveryData });
  };

  const handleAssignDriver = (uuid: string, driverId: string) => {
    assignDriverMutation.mutate({ uuid, driverId });
  };

  const addDelivery = async (data: DeliveryFormData) => {
    return await addDeliveryMutation.mutateAsync(data);
  };

  const updateDeliveryData = async (uuid: string, data: DeliveryFormData) => {
    return await updateDeliveryMutation.mutateAsync({ uuid, data });
  };

  const updateStatus = async (uuid: string, status: Delivery['status']) => {
    return await updateStatusMutation.mutateAsync({ uuid, status });
  };

  const markAsDelivered = async (uuid: string, deliveryData: any) => {
    return await markAsDeliveredMutation.mutateAsync({ uuid, deliveryData });
  };

  const assignDriverToDelivery = async (uuid: string, driverId: string) => {
    return await assignDriverMutation.mutateAsync({ uuid, driverId });
  };

  const pagination: PaginationData | undefined = deliveryData
    ? {
        total: deliveryData.total,
        currentPage: deliveryData.currentPage,
        perPage: deliveryData.perPage,
        lastPage: deliveryData.lastPage,
        nextPage: deliveryData.nextPage,
        prevPage: deliveryData.prevPage,
      }
    : undefined;

  const value: DeliveryContextType = {
    deliveryData,
    isLoading,
    error: error as Error | null,
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    dateFilter,
    setDateFilter,
    currentPage,
    perPage,
    setCurrentPage,
    setPerPage: (newPerPage: number) => {
      setPerPage(newPerPage);
      setCurrentPage(1);
    },
    pagination,
    isDeliveryModalVisible,
    setIsDeliveryModalVisible,
    selectedDelivery,
    setSelectedDelivery,
    isDeliveryDrawerVisible,
    setIsDeliveryDrawerVisible,
    selectedDeliveryForDrawer,
    openDeliveryDrawer,
    closeDeliveryDrawer,
    deliveryDetails,
    isLoadingDetails,
    deliveryTrackingData,
    isLoadingTracking,
    activeTab,
    setActiveTab,
    handleTabChange,
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
    addDelivery,
    isAdding: addDeliveryMutation.isPending,
    updateDeliveryData,
    isUpdating: updateDeliveryMutation.isPending,
    deleteDeliveryData: (uuid: string) => deleteDeliveryMutation.mutate(uuid),
    isDeleting: deleteDeliveryMutation.isPending,
    updateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
    markAsDelivered,
    isMarkingDelivered: markAsDeliveredMutation.isPending,
    assignDriverToDelivery,
    isAssigningDriver: assignDriverMutation.isPending,
    refetchDeliveries: () => refetchDeliveries(),
    handleAddDeliveryModal,
    handleEdit,
    handleRowClick,
    handleDeleteWithConfirmation,
    handleStatusUpdate,
    handleMarkAsDelivered,
    handleAssignDriver,
  };

  return <DeliveryContext.Provider value={value}>{children}</DeliveryContext.Provider>;
}

export function useDelivery() {
  const context = useContext(DeliveryContext);
  if (context === undefined) {
    throw new Error('useDelivery must be used within a DeliveryProvider');
  }
  return context;
}