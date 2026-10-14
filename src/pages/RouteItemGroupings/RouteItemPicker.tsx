import { Select } from '../../components/ui/Select';
import { getStockItemOptions } from '../../api/StockApi';
import { useInfiniteSelect } from '../../hooks/useInfiniteSelect';
import type { StockItemOption } from '../../types/Stock';

interface RouteItemPickerProps {
  enabled: boolean;
  onPick: (option: StockItemOption) => void;
}

/** "Add item" dropdown: searches the server, loads more as you scroll, and stays empty after each pick (the picked item moves into the table). Values are item ids, which is what this options call returns. */
export function RouteItemPicker({ enabled, onPick }: RouteItemPickerProps) {
  const select = useInfiniteSelect({
    enabled,
    fetchPage: async (page, search) => {
      const res = await getStockItemOptions(page, search || undefined);
      return { items: res.data, hasMore: res.meta.has_more_pages };
    },
    mapItemToOption: (option: StockItemOption) => option,
  });
  return <Select value="" onChange={(e) => { const option = (select.options as StockItemOption[]).find((o) => String(o.value) === String(e.target.value)); if (option) onPick(option); }} options={select.options} isLoading={select.isLoading} isLoadingMore={select.isLoadingMore} hasMore={select.hasMore} onLoadMore={select.onLoadMore} onSearchChange={select.onSearchChange} placeholder="Search and add an item" searchPlaceholder="Search by code or name…" />;
}
