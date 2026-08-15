import { useState, useCallback } from 'react';
import * as OrderApi from '../api/OrderApi';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  date: string;
  items: number;
  amount: number;
  status: string;
}

interface UseOrdersReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
  total: number;
  fetchOrders: (page?: number, search?: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<boolean>;
  bulkDelete: (ids: string[]) => Promise<boolean>;
  updateOrderStatus: (id: string, status: string) => Promise<boolean>;
  refresh: () => Promise<void>;
}

export function useOrders(): UseOrdersReturn {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastSearch, setLastSearch] = useState('');

  const fetchOrders = useCallback(async (page: number = 1, search: string = '') => {
    setLoading(true);
    setError(null);
    setLastSearch(search);

    try {
      const response = await OrderApi.getOrderList(page, search);
      setOrders(response.data || []);
      setCurrentPage(response.meta?.currentPage || page);
      setTotalPages(response.meta?.lastPage || 1);
      setTotal(response.meta?.total || 0);
    } catch (err) {
      setError('Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOrder = useCallback(async (id: string): Promise<boolean> => {
    try {
      await OrderApi.deleteOrder(id);
      setOrders((prev) => prev.filter((o) => o.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting order:', err);
      return false;
    }
  }, []);

  const bulkDelete = useCallback(async (ids: string[]): Promise<boolean> => {
    try {
      await Promise.all(ids.map((id) => OrderApi.deleteOrder(id)));
      setOrders((prev) => prev.filter((o) => !ids.includes(o.id)));
      return true;
    } catch (err) {
      console.error('Error bulk deleting orders:', err);
      return false;
    }
  }, []);

  const updateOrderStatus = useCallback(async (id: string, status: string): Promise<boolean> => {
    try {
      await OrderApi.updateOrderStatus(id, status);
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status } : o))
      );
      return true;
    } catch (err) {
      console.error('Error updating order status:', err);
      return false;
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchOrders(currentPage, lastSearch);
  }, [fetchOrders, currentPage, lastSearch]);

  return {
    orders,
    loading,
    error,
    totalPages,
    currentPage,
    total,
    fetchOrders,
    deleteOrder,
    bulkDelete,
    updateOrderStatus,
    refresh,
  };
}

export default useOrders;
