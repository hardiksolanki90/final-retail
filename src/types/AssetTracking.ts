export interface AssetTracking {
  id?: string;
  uuid?: string;
  assetCode: string;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  modelName: string;
  barcode: string;
  category: string;
  location: string;
  area: string;
  worker?: string;
  additionalWorker?: string;
  team?: string;
  vendors?: string;
  customerId: string;
  purchaseDate?: string;
  placedInService?: string;
  purchasePrice?: number;
  warrantyExpiration?: string;
  residualPrice?: number;
  usefulLife?: string;
  additionalInformation?: string;
  image?: string;
  status?: 'active' | 'inactive';
  createdAt?: string;
  updatedAt?: string;
}

export interface AssetTrackingFormData {
  assetCode: string;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
  modelName: string;
  barcode: string;
  category: string;
  location: string;
  area: string;
  worker?: string;
  additionalWorker?: string;
  team?: string;
  vendors?: string;
  customerId: string;
  purchaseDate?: string;
  placedInService?: string;
  purchasePrice?: number;
  warrantyExpiration?: string;
  residualPrice?: number;
  usefulLife?: string;
  additionalInformation?: string;
  image?: File | null;
}

export interface AssetTrackingListResponse {
  data: AssetTracking[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
