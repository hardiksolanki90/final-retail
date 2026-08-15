import { useState, useCallback } from 'react';
import * as CustomerApi from '../api/CustomerApi';
import type { Customer } from '../types/Customer';
import { handleExport } from '../utils/download';

interface UseCustomersReturn {
  customers: Customer[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  fetchCustomers: (page?: number, search?: string) => Promise<void>;
  deleteCustomer: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  exportCustomers: (format: 'csv' | 'xlsx', filters?: ExportFilters) => Promise<void>;
  refresh: () => Promise<void>;
}

interface ExportFilters {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
}

export function useCustomers(): UseCustomersReturn {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastSearch, setLastSearch] = useState('');

  const fetchCustomers = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);
    setLastSearch(search);

    try {
      const response = await CustomerApi.getCustomerList(page, search);
      setCustomers(response.data || response.customers || []);
      setCurrentPage(response.currentPage || page);
      setTotalPages(response.lastPage || 1);
      setTotal(response.total || 0);
    } catch (err) {
      setError('Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteCustomer = useCallback(async (id: string): Promise<boolean> => {
    try {
      await CustomerApi.deleteCustomer(id);
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting customer:', err);
      return false;
    }
  }, []);

  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      // Assuming there's a bulk delete endpoint
      await Promise.all(ids.map((id) => CustomerApi.deleteCustomer(id)));
      setCustomers((prev) => prev.filter((c) => !ids.includes(c.id)));
      return true;
    } catch (err) {
      console.error('Error bulk deleting customers:', err);
      return false;
    }
  }, []);

  const exportCustomers = useCallback(async (format: 'csv' | 'xlsx', filters?: ExportFilters) => {
    await handleExport(
      () => CustomerApi.exportCustomers(format, filters),
      `customers.${format}`
    );
  }, []);

  const refresh = useCallback(async () => {
    await fetchCustomers(currentPage, lastSearch);
  }, [fetchCustomers, currentPage, lastSearch]);

  return {
    customers,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchCustomers,
    deleteCustomer,
    bulkDelete,
    exportCustomers,
    refresh,
  };
}

export default useCustomers;
