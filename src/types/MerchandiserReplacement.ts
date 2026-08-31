export interface MerchandiserReplacement {
  id: number;
  uuid: string;
  oldSalesmanId: number;
  newSalesmanId: number;
  type: string;
  addedOn: string;
  createdAt?: string;
  updatedAt?: string;
  oldSalesman?: { id: number; name: string };
  newSalesman?: { id: number; name: string };
}

export interface MerchandiserReplacementFormData {
  oldSalesmanId: number | '';
  newSalesmanId: number | '';
  type: string;
  addedOn: string;
}
