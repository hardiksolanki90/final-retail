import axiosInstance from '../lib/axios';
import type { TaxComponent } from '../utils/documentMath';

export interface ItemTaxRates {
  /** Main tax percent for the item (all parts added); null when no rate is configured. */
  rate: number | null;
  /** The parts of the main tax — CGST + SGST, GST + PST… — empty when no rate. */
  components: TaxComponent[];
  /** Where the rate came from. */
  source: 'tax_table' | 'item' | null;
  exciseRate: number;
  /** Item has tax switched off. */
  exempt: boolean;
}

export interface TaxResolution {
  tax: {
    code: string;
    name: string;
    supported: boolean;
    country: string | null;
    /** The customer's state/province isn't set or recognised, so the organisation's own was assumed. */
    regionAssumed: boolean;
  };
  items: Record<string, ItemTaxRates>;
}

/** Rates a saved line would get for these items (item uuids) and customer (uuid — its state/province decides the tax in India and Canada). The server recomputes on save. */
export const resolveTaxRates = async (itemIds: string[], customerId?: string | null): Promise<TaxResolution> => {
  const response = await axiosInstance.post('/tax/resolve', { items: itemIds, customerId: customerId || undefined });
  return response.data.data;
};
