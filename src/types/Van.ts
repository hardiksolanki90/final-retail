export interface Van {
  id?: number;
  uuid?: string;
  vanCode: string;
  plateNumber: string;
  description: string;
  capacity?: number | null;
  vanTypeId: number;
  vanCategoryId?: number | null;
  status: boolean;
  vanType?: { id: number; uuid: string; name: string } | null;
  vanCategory?: { id: number; uuid: string; name: string } | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface VanFormData {
  vanCode: string;
  plateNumber: string;
  description: string;
  capacity: number | '';
  vanTypeId: number | '';
  vanCategoryId?: number | '';
  status: boolean;
}

export interface VanListResponse {
  data: Van[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
