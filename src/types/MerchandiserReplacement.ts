export interface MerchandiserReplacement {
  id: number;
  originalMerchandiserId: string;
  replacementMerchandiserId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'inactive';
}

export interface MerchandiserReplacementFormData {
  originalMerchandiserId: string;
  replacementMerchandiserId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'inactive';
}
