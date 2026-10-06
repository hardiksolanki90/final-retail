/** One partner function (ship-to / sold-to / payer / bill-to). `value` is the customer's uuid, or 'same_as_customer'. */
export interface CustomerPartner {
  value: string;
  label: string;
  /** The partner is the customer itself. */
  isSelf: boolean;
  uuid: string;
  code?: string | null;
  shopName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  fullName?: string;
  email?: string | null;
  phoneNumber?: string | null;
  customerOfficeAddress?: string | null;
  customerOfficeCity?: string | null;
  customerOfficeState?: string | null;
  customerOfficeZipcode?: string | null;
  fullAddress?: string;
  status?: boolean;
}

export interface Customer {
  id?: number;
  uuid?: string;
  code: string;
  shopName: string;
  firstName: string;
  lastName?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  customerOfficeAddress?: string;
  customerOfficeCity?: string;
  customerOfficeState?: string;
  customerOfficeZipcode?: string;
  customerOfficePhone?: string;
  customerOfficeLat?: number;
  customerOfficeLang?: number;
  customerHomeAddress?: string;
  customerHomeLat?: number;
  customerHomeLang?: number;
  fullAddress?: string;
  balance: number;
  creditLimit: number;
  creditDays?: number;
  availableCredit?: number;
  image?: string;
  status: boolean;
  /** The customer can sign in (login enabled on their user). */
  hasLoginAccess?: boolean;
  routeId?: number;
  salesmanId?: number;
  salesOrganisationId?: number;
  countryId?: number;
  regionId?: number;
  shipToPartyId?: number;
  /** Saved partner functions in full: the edit form's dropdown value/label, plus the partner customer's own details. */
  partners?: Partial<Record<'shipTo' | 'soldTo' | 'payer' | 'billTo', CustomerPartner | null>>;
  country?: { id: number; uuid: string; name: string; countryCode?: string } | null;
  region?: { id: number; uuid: string; name: string; code?: string } | null;
  soldToPartyId?: number;
  payerId?: number;
  billToPartyId?: number;
  customerTypeId?: number;
  customerCategoryId?: number;
  customerGroupId?: number;
  channelId?: number;
  paymentTermId?: number;
  createdAt?: string;
  updatedAt?: string;

  // Relationships
  route?: { id: number; uuid: string; name: string };
  salesman?: { id: number; name: string };
  salesOrganisation?: { id: number; uuid: string; name: string };
  customerType?: { id: number; uuid: string; name: string };
  customerCategory?: { id: number; uuid: string; name: string };
  customerGroup?: { id: number; uuid: string; name: string };
  channel?: { id: number; uuid: string; name: string };
  paymentTerm?: { id: number; uuid: string; name: string; days: number };
}

export interface CustomerFormData {
  code?: string;
  shopName?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber?: string;
  customerOfficeAddress?: string;
  customerOfficeCity?: string;
  customerOfficeState?: string;
  customerOfficeZipcode?: string;
  customerOfficePhone?: string;
  customerOfficeLat?: number;
  customerOfficeLang?: number;
  customerHomeAddress?: string;
  customerHomeLat?: number;
  customerHomeLang?: number;
  balance?: number;
  creditLimit?: number;
  creditDays?: number;
  image?: string;
  status?: boolean;
  /** Let the customer sign in with their email; the password is needed when first enabling. */
  enableLogin?: boolean;
  password?: string;
  passwordConfirmation?: string;
  routeId?: number | string;
  salesmanId?: number | string;
  salesOrganisationId?: number | string;
  countryId?: number | string;
  regionId?: number | string;
  shipToPartyId?: number | string;
  soldToPartyId?: number | string;
  payerId?: number | string;
  billToPartyId?: number | string;
  customerTypeId?: number | string;
  customerCategoryId?: number | string;
  customerGroupId?: number | string;
  channelId?: number | string;
  paymentTermId?: number | string;
}

export interface CustomerListResponse {
  data: Customer[];
  meta: { current_page: number; per_page: number; total: number; last_page: number; has_more_pages: boolean; next_page_url?: string; prev_page_url?: string };
  message: string;
}

export interface CustomerSalesData {
  salesData: Array<{ date: string; totalValue: number; orderCount: number }>;
  summary: { totalOrders: number; totalAmount: number; avgOrderValue: number };
}

export interface CustomerType {
  id?: number;
  uuid?: string;
  name: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerCategory {
  id?: number;
  uuid?: string;
  categoryName: string;
  customerCategoryCode?: string;
  parentId?: number | null;
  nodeLevel?: number;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerGroup {
  id?: number;
  uuid?: string;
  groupName: string;
  groupCode?: string;
  type?: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesOrganisation {
  id?: number;
  uuid?: string;
  name: string;
  parentId?: number | null;
  nodeLevel?: number;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Channel {
  id?: number;
  uuid?: string;
  channelName: string;
  parentId?: number | null;
  nodeLevel?: number;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaymentTerm {
  id?: number;
  uuid?: string;
  name: string;
  numberOfDays: number;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Route {
  id?: number;
  uuid?: string;
  routeName: string;
  description?: string;
  status?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomerFilters {
  search?: string;
  routeId?: number;
  salesmanId?: number;
  customerTypeId?: number;
  customerCategoryId?: number;
  channelId?: number;
  status?: boolean;
}

export interface CustomerBulkAction {
  action: 'activate' | 'deactivate' | 'delete';
  uuids: string[];
}

export interface CustomerSelectOption {
  value: string;
  label: string;
  code?: string | null;
}
