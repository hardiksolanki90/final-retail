export interface DriverReplacement {
  id: number;
  uuid: string;
  orderId?: number;
  newSalesmanId?: number;
  oldSalesmanId?: number;
  oldVanId?: number;
  newVanId?: number;
  loginUserId: number;
  reasonId?: number;
  date: string;
  createdAt?: string;
  updatedAt?: string;
  oldSalesman?: { id: number; name: string };
  newSalesman?: { id: number; name: string };
  oldVan?: { id: number; vanCode?: string; plateNumber?: string };
  newVan?: { id: number; vanCode?: string; plateNumber?: string };
  reason?: { id: number; name: string };
}

export interface DriverReplacementFormData {
  oldSalesmanId?: number | '';
  newSalesmanId?: number | '';
  oldVanId?: number | '';
  newVanId?: number | '';
  reasonId?: number | '';
  date: string;
}
