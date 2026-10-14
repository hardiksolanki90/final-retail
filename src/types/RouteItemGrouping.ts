/** A group as the list shows it. Related records are integer ids plus names; the group itself is addressed by uuid. */
export interface RouteItemGrouping {
  uuid: string;
  code: string;
  name: string;
  status: boolean;
  routeId: number | null;
  routeName: string | null;
  salesmanId: number | null;
  salesmanName: string | null;
  salesmanCode: string | null;
  itemCount: number;
}

export interface RouteItemGroupingItem {
  itemId: number;
  itemCode: string | null;
  itemName: string | null;
}

/** One group with its items. */
export interface RouteItemGroupingDetail extends RouteItemGrouping {
  items: RouteItemGroupingItem[];
}

/** What the add / edit form holds: ids as strings (what the selects hold) and the chosen items with their labels. */
export interface RouteItemGroupingForm {
  code: string;
  name: string;
  routeId: string;
  salesmanId: string;
  status: boolean;
  items: RouteItemGroupingItem[];
}

export interface RouteItemGroupingPayload {
  /** Empty = numbered automatically. */
  code?: string;
  name: string;
  routeId: number | null;
  salesmanId: number | null;
  status: boolean;
  items: { itemId: number }[];
}

export interface RouteItemGroupingListParams {
  page?: number;
  perPage?: number;
  search?: string;
  routeId?: number;
  salesmanId?: number;
  status?: boolean;
}
