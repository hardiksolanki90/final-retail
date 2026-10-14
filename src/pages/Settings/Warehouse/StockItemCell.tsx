import { useEffect } from 'react';
import { Select } from '../../../components/ui/Select';
import { getStockItemOptions } from '../../../api/StockApi';
import { useInfiniteSelect } from '../../../hooks/useInfiniteSelect';
import type { StockItemOption } from '../../../types/Stock';

interface StockItemCellProps {
  value: string;
  error?: string;
  enabled: boolean;
  onPick: (option: StockItemOption | undefined) => void;
  remember: (options: StockItemOption[]) => void;
}

/** One line's item dropdown: searches the server and loads more as you scroll. */
export function StockItemCell({ value, error, enabled, onPick, remember }: StockItemCellProps) {
  const select = useInfiniteSelect({
    enabled,
    selectedValue: value,
    fetchPage: async (page, search) => {
      const res = await getStockItemOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (option: StockItemOption) => option,
  });

  useEffect(() => remember(select.options as StockItemOption[]), [select.options, remember]);

  return (
    <Select
      value={value}
      onChange={(e) => onPick((select.options as StockItemOption[]).find((option) => String(option.value) === String(e.target.value)))}
      options={select.options}
      isLoading={select.isLoading}
      isLoadingMore={select.isLoadingMore}
      hasMore={select.hasMore}
      onLoadMore={select.onLoadMore}
      onSearchChange={select.onSearchChange}
      placeholder="Select item"
      searchPlaceholder="Search by code or name…"
      error={error}
    />
  );
}
