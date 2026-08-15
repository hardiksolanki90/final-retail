import { createContext, useContext, useState, type ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getInvoiceList,
  deleteInvoice,
  createInvoice,
  updateInvoice,
  getInvoiceDetails,
  getInvoiceSummary,
  updateInvoiceStatus,
  markInvoiceAsPaid,
  bulkUpdateInvoiceStatus,
} from '../api/InvoiceApi';
import { showToast } from '../lib/toast';
import type {
  Invoice,
  InvoiceFormData,
  InvoiceListResponse,
} from '../types/Invoice';
import type { ColumnSearchStates, PaginationData } from '../types/Common';

interface InvoiceContextType {
  // Data
  invoiceData: InvoiceListResponse | undefined;
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
  isInvoiceModalVisible: boolean;
  setIsInvoiceModalVisible: (visible: boolean) => void;
  selectedInvoice: Invoice | null;
  setSelectedInvoice: (invoice: Invoice | null) => void;

  // Drawer state
  isInvoiceDrawerVisible: boolean;
  setIsInvoiceDrawerVisible: (visible: boolean) => void;
  selectedInvoiceForDrawer: Invoice | null;
  openInvoiceDrawer: (invoice: Invoice) => void;
  closeInvoiceDrawer: () => void;

  // Drawer data
  invoiceDetails: Invoice | undefined;
  isLoadingDetails: boolean;
  invoiceSummaryData: unknown;
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
  addInvoice: (data: InvoiceFormData) => Promise<Invoice>;
  isAdding: boolean;
  updateInvoiceData: (uuid: string, data: InvoiceFormData) => Promise<Invoice>;
  isUpdating: boolean;
  deleteInvoiceData: (uuid: string) => void;
  isDeleting: boolean;
  updateStatus: (uuid: string, status: Invoice['status']) => Promise<Invoice>;
  isUpdatingStatus: boolean;
  markAsPaid: (uuid: string, paymentData: any) => Promise<Invoice>;
  isMarkingPaid: boolean;

  // Actions
  refetchInvoices: () => void;
  handleAddInvoiceModal: () => void;
  handleEdit: (invoice: Invoice) => void;
  handleRowClick: (invoice: Invoice) => void;
  handleDeleteWithConfirmation: (uuid: string) => void;
  handleStatusUpdate: (uuid: string, status: Invoice['status']) => void;
  handleMarkAsPaid: (uuid: string, paymentData: any) => void;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

export { InvoiceContext };

interface InvoiceProviderProps {
  children: ReactNode;
}

export default function InvoiceProvider({ children }: InvoiceProviderProps) {
  const queryClient = useQueryClient();

  // Modal state
  const [isInvoiceModalVisible, setIsInvoiceModalVisible] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Drawer state
  const [isInvoiceDrawerVisible, setIsInvoiceDrawerVisible] = useState(false);
  const [selectedInvoiceForDrawer, setSelectedInvoiceForDrawer] = useState<Invoice | null>(null);

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
    invoiceNumber: { isOpen: false, value: '' },
    customer: { isOpen: false, value: '' },
    order: { isOpen: false, value: '' },
    status: { isOpen: false, value: '' },
  });

  // Tab state
  const [activeTab, setActiveTab] = useState('details');

  // Invoice list query with filters
  const {
    data: invoiceData,
    isLoading,
    error,
    refetch: refetchInvoices,
  } = useQuery({
    queryKey: ['invoice-list', searchTerm, currentPage, perPage, statusFilter, dateFilter],
    queryFn: () => getInvoiceList(currentPage, searchTerm, perPage, {
      status: statusFilter || undefined,
      dateFrom: dateFilter[0],
      dateTo: dateFilter[1],
    }),
    staleTime: 2 * 60 * 1000,
  });

  // Invoice details query
  const { data: invoiceDetails, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['invoice-details', selectedInvoiceForDrawer?.uuid],
    queryFn: () => getInvoiceDetails(selectedInvoiceForDrawer?.uuid!),
    enabled: !!selectedInvoiceForDrawer?.uuid && activeTab === 'details',
    staleTime: 5 * 60 * 1000,
  });

  // Invoice summary query
  const { data: invoiceSummaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['invoice-summary', selectedInvoiceForDrawer?.uuid],
    queryFn: () => getInvoiceSummary(selectedInvoiceForDrawer?.uuid!),
    enabled: !!selectedInvoiceForDrawer?.uuid && activeTab === 'summary',
    staleTime: 2 * 60 * 1000,
  });

  // Mutations
  const addInvoiceMutation = useMutation({
    mutationFn: createInvoice,
    onSuccess: () => {
      showToast.success('Invoice created successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      setIsInvoiceModalVisible(false);
      setSelectedInvoice(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to create invoice');
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: ({ uuid, data }: { uuid: string; data: InvoiceFormData }) =>
      updateInvoice(uuid, data),
    onSuccess: () => {
      showToast.success('Invoice updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      setIsInvoiceModalVisible(false);
      setSelectedInvoice(null);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update invoice');
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: deleteInvoice,
    onSuccess: () => {
      showToast.success('Invoice deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to delete invoice');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ uuid, status }: { uuid: string; status: Invoice['status'] }) =>
      updateInvoiceStatus(uuid, status),
    onSuccess: () => {
      showToast.success('Invoice status updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update invoice status');
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ uuid, paymentData }: { uuid: string; paymentData: any }) =>
      markInvoiceAsPaid(uuid, paymentData),
    onSuccess: () => {
      showToast.success('Invoice marked as paid successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      queryClient.invalidateQueries({ queryKey: ['invoice-details'] });
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to mark invoice as paid');
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: ({ uuids, status }: { uuids: string[]; status: Invoice['status'] }) =>
      bulkUpdateInvoiceStatus(uuids, status),
    onSuccess: () => {
      showToast.success('Invoices updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['invoice-list'] });
      setSelectedRowKeys([]);
    },
    onError: (error: Error) => {
      showToast.error(error.message || 'Failed to update invoices');
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
      showToast.error('Please select invoices first');
      return;
    }

    const statusActions = {
      'approve': 'pending',
      'pay': 'paid',
      'cancel': 'cancelled'
    } as const;

    if (action in statusActions) {
      const status = statusActions[action as keyof typeof statusActions] as Invoice['status'];
      bulkUpdateMutation.mutate({ uuids: selectedRowKeys, status });
    } else {
      showToast.success(`${selectedRowKeys.length} invoice(s) ${action} successfully`);
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
      if (column === 'invoiceNumber') searchQuery = `invoice:${searchValue}`;
      else if (column === 'customer') searchQuery = `customer:${searchValue}`;
      else if (column === 'order') searchQuery = `order:${searchValue}`;
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

  const openInvoiceDrawer = (invoice: Invoice) => {
    setSelectedInvoiceForDrawer(invoice);
    setIsInvoiceDrawerVisible(true);
    setActiveTab('details');
  };

  const closeInvoiceDrawer = () => {
    setSelectedInvoiceForDrawer(null);
    setIsInvoiceDrawerVisible(false);
  };

  const handleAddInvoiceModal = () => {
    setSelectedInvoice(null);
    setIsInvoiceModalVisible(true);
  };

  const handleEdit = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsInvoiceModalVisible(true);
  };

  const handleRowClick = (invoice: Invoice) => {
    openInvoiceDrawer(invoice);
  };

  const handleDeleteWithConfirmation = (uuid: string) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoiceMutation.mutate(uuid);
    }
  };

  const handleStatusUpdate = (uuid: string, status: Invoice['status']) => {
    updateStatusMutation.mutate({ uuid, status });
  };

  const handleMarkAsPaid = (uuid: string, paymentData: any) => {
    markAsPaidMutation.mutate({ uuid, paymentData });
  };

  const addInvoice = async (data: InvoiceFormData) => {
    return await addInvoiceMutation.mutateAsync(data);
  };

  const updateInvoiceData = async (uuid: string, data: InvoiceFormData) => {
    return await updateInvoiceMutation.mutateAsync({ uuid, data });
  };

  const updateStatus = async (uuid: string, status: Invoice['status']) => {
    return await updateStatusMutation.mutateAsync({ uuid, status });
  };

  const markAsPaid = async (uuid: string, paymentData: any) => {
    return await markAsPaidMutation.mutateAsync({ uuid, paymentData });
  };

  const pagination: PaginationData | undefined = invoiceData
    ? {
        total: invoiceData.total,
        currentPage: invoiceData.currentPage,
        perPage: invoiceData.perPage,
        lastPage: invoiceData.lastPage,
        nextPage: invoiceData.nextPage,
        prevPage: invoiceData.prevPage,
      }
    : undefined;

  const value: InvoiceContextType = {
    invoiceData,
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
    isInvoiceModalVisible,
    setIsInvoiceModalVisible,
    selectedInvoice,
    setSelectedInvoice,
    isInvoiceDrawerVisible,
    setIsInvoiceDrawerVisible,
    selectedInvoiceForDrawer,
    openInvoiceDrawer,
    closeInvoiceDrawer,
    invoiceDetails,
    isLoadingDetails,
    invoiceSummaryData,
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
    addInvoice,
    isAdding: addInvoiceMutation.isPending,
    updateInvoiceData,
    isUpdating: updateInvoiceMutation.isPending,
    deleteInvoiceData: (uuid: string) => deleteInvoiceMutation.mutate(uuid),
    isDeleting: deleteInvoiceMutation.isPending,
    updateStatus,
    isUpdatingStatus: updateStatusMutation.isPending,
    markAsPaid,
    isMarkingPaid: markAsPaidMutation.isPending,
    refetchInvoices: () => refetchInvoices(),
    handleAddInvoiceModal,
    handleEdit,
    handleRowClick,
    handleDeleteWithConfirmation,
    handleStatusUpdate,
    handleMarkAsPaid,
  };

  return <InvoiceContext.Provider value={value}>{children}</InvoiceContext.Provider>;
}

export function useInvoice() {
  const context = useContext(InvoiceContext);
  if (context === undefined) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
}