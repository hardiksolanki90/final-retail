import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getOrderList,
  deleteOrder,
  createOrder,
  updateOrder,
  getOrderDetails,
  getOrderSummary,
  updateOrderStatus,
  cancelOrder,
  bulkUpdateOrderStatus,
} from '../api/OrderApi';
import { showToast } from '../lib/toast';
import type {
  Order,
  OrderFormData,
  OrderListResponse,
} from '../types/Order';
import type { ColumnSearchStates, PaginationData } from '../types/Common';

interface OrderContextType {
  // Data
  orderData: OrderListResponse | undefined;
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
  isOrderModalVisible: boolean;
  setIsOrderModalVisible: (visible: boolean) => void;
  selectedOrder: Order | null;
  setSelectedOrder: (order: Order | null) => void;

  // Drawer state
  isOrderDrawerVisible: boolean;
  setIsOrderDrawerVisible: (visible: boolean) => void;
  selectedOrderForDrawer: Order | null;
  openOrderDrawer: (order: Order) => void;
  closeOrderDrawer: () => void;

  // Drawer data
  orderDetails: Order | undefined;
  isLoadingDetails: boolean;
  orderSummaryData: unknown;
  isLoadingSummary: boolean;

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
  addOrder: (data: OrderFormData) => Promise<Order>;
  isAdding: boolean;
  updateOrderData: (uuid: string, data: OrderFormData) => Promise<Order>;
  isUpdating: boolean;
  deleteOrderData: (uuid: string) => void;
  isDeleting: boolean;
  updateStatus: (uuid: string, status: Order['status']) => Promise<Order>;
  isUpdatingStatus: boolean;
  cancelOrderData: (uuid: string, reason?: string) => Promise<Order>;
  isCancelling: boolean;

  // Actions
  refetchOrders: () => void;
  handleAddOrderModal: () => void;
  handleEdit: (order: Order) => void;
  handleRowClick: (order: Order) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  handleStatusUpdate: (uuid: string, status: Order['status']) => void;
  handleCancelOrder: (uuid: string, reason?: string) => void;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export { OrderContext };

interface OrderProviderProps {
  children: ReactNode;
}

export default function OrderProvider({ children }: OrderProviderProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [isOrderModalVisible, setIsOrderModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Drawer state
  const [isOrderDrawerVisible, setIsOrderDrawerVisible] = useState(false);
  const [selectedOrderForDrawer, setSelectedOrderForDrawer] = useState<Order | null>(null);

  // Search and pagination
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState<[string, string]>(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - 30);
    return [startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]];
  });

  // Bulk actions
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [bulkActionValue, setBulkActionValue] = useState<string | undefined>(undefined);

  // Column search
  const [columnSearchStates, setColumnSearchStates] = useState<ColumnSearchStates>({
    orderNumber: { isOpen: false, value: '' },
    customer: { isOpen: false, value: '' },
    salesman: { isOpen: false, value: '' },
    status: { isOpen: false, value: '' },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  // Order list query with filters
  const {
    data: orderData,
    isLoading,
    error,
    refetch: refetchOrders,
  } = useQuery({
    queryKey: ['order-list', searchTerm, currentPage, perPage, statusFilter, dateFilter],
    queryFn: () => getOrderList(currentPage, searchTerm, perPage, {
      status: statusFilter || undefined,
      dateFrom: dateFilter[0],
      dateTo: dateFilter[1],
    }),
    staleTime: 2 * 60 * 1000,
  });

  // Order details query
  const { data: orderDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['order-details', selectedOrderForDrawer?.uuid],
    queryFn: () => getOrderDetails(selectedOrderForDrawer?.uuid!),
    enabled: !!selectedOrderForDrawer?.uuid && activeTab === 'details',
    staleTime: 5 * 60 * 1000,
  });

  // Order summary query
  const { data: orderSummaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['order-summary', selectedOrderForDrawer?.uuid],
    queryFn: () => getOrderSummary(selectedOrderForDrawer?.uuid!),
    enabled: !!selectedOrderForDrawer?.uuid && activeTab === 'summary',
    staleTime: 2 * 60 * 1000,
  });

  // Mutations
  const addOrderMutation = useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      showToast.success('Order created successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      setIsOrderModalVisible(false);
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create order');
    },
  });

  const updateOrderMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: OrderFormData }) =>
      updateOrder(uuid, data),
    onSuccess: () => {
      showToast.success('Order updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      setIsOrderModalVisible(false);
      setSelectedOrder(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update order');
    },
  });

  const deleteOrderMutation = useMutation({
    mutationFn: deleteOrder,
    onSuccess: () => {
      showToast.success('Order deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete order');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: Order['status'] }) =>
      updateOrderStatus(uuid, status),
    onSuccess: () => {
      showToast.success('Order status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      queryClient.invalidateQueries({ queryKey: ['order-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update order status');
    },
  });

  const cancelOrderMutation = useMutation({
    mutationFn: ({ uuid, reason }: { uuid: string; reason?: string }) =>
      cancelOrder(uuid, reason),
    onSuccess: () => {
      showToast.success('Order cancelled successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      queryClient.invalidateQueries({ queryKey: ['order-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to cancel order');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ uuids, status }: { uuids: string[]; status: Order['status'] }) =>
      bulkUpdateOrderStatus(uuids, status),
    onSuccess: () => {
      showToast.success('Orders updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['order-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update orders');
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
      showToast.error('Please select orders first');
      return;
    }

    const statusActions = {
      'confirm': 'confirmed',
      'process': 'processing', 
      'ship': 'shipped',
      'deliver': 'delivered',
      'cancel': 'cancelled'
    } as const;

    if (action in statusActions) {
      const status = statusActions[action as keyof typeof statusActions] as Order['status'];
      bulkUpdateMutation.mutate({ uuids: selectedRowKeys, status });
    } else {
      showToast.success(`${selectedRowKeys.length} order(s) ${action} successfully`);
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
      if (column === 'orderNumber') searchQuery = `order:${searchValue}`;
      else if (column === 'customer') searchQuery = `customer:${searchValue}`;
      else if (column === 'salesman') searchQuery = `salesman:${searchValue}`;
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

  const openOrderDrawer = (order: Order) => {
    setSelectedOrderForDrawer(order);
    setIsOrderDrawerVisible(true);
    setActiveTab('details');
  };

  const closeOrderDrawer = () => {
    setSelectedOrderForDrawer(null);
    setIsOrderDrawerVisible(false);
  };

  const handleAddOrderModal = () => {
    setSelectedOrder(null);
    setIsOrderModalVisible(true);
  };

  const handleEdit = (order: Order) => {
    setSelectedOrder(order);
    setIsOrderModalVisible(true);
  };

  const handleRowClick = (order: Order) => {
    openOrderDrawer(order);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      deleteOrderMutation.mutate(uuid);
    }
  };

  const handleStatusUpdate = (uuid: string, status: Order['status']) => {
    updateStatusMutation.mutate({ uuid, status });
  };

  const handleCancelOrder = (uuid: string, reason?: string) => {
    cancelOrderMutation.mutate({ uuid, reason });
  };

  const addOrder = async (data: OrderFormData) => {
    return await addOrderMutation.mutateAsync(data);
  };

  const updateOrderData = async (uuid: string, data: OrderFormData) => {
    return await updateOrderMutation.mutateAsync({ uuid, data });
  };

  const updateStatus = async (uuid: string, status: Order['status']) => {
    return await updateStatusMutation.mutateAsync({ uuid, status });
  };

  const cancelOrderData = async (uuid: string, reason?: string) => {
    return await cancelOrderMutation.mutateAsync({ uuid, reason });
  };

  const pagination: PaginationData | undefined = orderData
    ? {
        total: orderData.total,
        currentPage: orderData.currentPage,
        perPage: orderData.perPage,
        lastPage: orderData.lastPage,
        nextPage: orderData.nextPage,
        prevPage: orderData.prevPage,
      }
    : undefined;

  const value: OrderContextType = {
    orderData,
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
    isOrderModalVisible,
    setIsOrderModalVisible,
    selectedOrder,
    setSelectedOrder,
    isOrderDrawerVisible,
    setIsOrderDrawerVisible,
    selectedOrderForDrawer,
    openOrderDrawer,
    closeOrderDrawer,
    orderDetails,
    isLoadingDetails,
    orderSummaryData,
    isLoadingSummary,
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
    addOrder,
    isAdding: addOrderMutation.isPending,
    updateOrderData,
    isUpdating: updateOrderMutation.isPending,
    deleteOrderData: (uuid: string) => deleteOrderMutation.mutate(uuid),
    isDeleting: deleteOrderMutation.isPending,
    updateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
    cancelOrderData,
    isCancelling: cancelOrderMutation.isPending,
    refetchOrders: () => refetchOrders(),
    handleAddOrderModal,
    handleEdit,
    handleRowClick,
    handleDeleteWithConfirmation,
    handleStatusUpdate,
    handleCancelOrder,
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
}

export function useOrder() {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}