import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPerPage?: number;
  total?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  perPage: number;
  totalPages: number;
  total: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  setPage: (page: number) => void;
  setPerPage: (perPage: number) => void;
  setTotal: (total: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
  reset: () => void;
}

export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { initialPage = 1, initialPerPage = 10, total: initialTotal = 0 } = options;

  const [currentPage, setCurrentPage] = useState(initialPage);
  const [perPage, setPerPageState] = useState(initialPerPage);
  const [total, setTotalState] = useState(initialTotal);

  const totalPages = useMemo(() => {
    return Math.ceil(total / perPage) || 1;
  }, [total, perPage]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * perPage;
  }, [currentPage, perPage]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + perPage, total);
  }, [startIndex, perPage, total]);

  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const setPerPage = useCallback((newPerPage: number) => {
    setPerPageState(newPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  }, []);

  const setTotal = useCallback((newTotal: number) => {
    setTotalState(newTotal);
  }, []);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage((prev) => prev + 1);
    }
  }, [hasNextPage]);

  const prevPage = useCallback(() => {
    if (hasPrevPage) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [hasPrevPage]);

  const firstPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  const lastPage = useCallback(() => {
    setCurrentPage(totalPages);
  }, [totalPages]);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPerPageState(initialPerPage);
  }, [initialPage, initialPerPage]);

  return {
    currentPage,
    perPage,
    totalPages,
    total,
    startIndex,
    endIndex,
    hasNextPage,
    hasPrevPage,
    setPage,
    setPerPage,
    setTotal,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,
  };
}

export default usePagination;
