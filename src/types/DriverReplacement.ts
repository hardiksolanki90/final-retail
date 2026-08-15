export interface DriverReplacement {
  id: number;
  originalDriverId: string;
  replacementDriverId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'inactive';
}

export interface DriverReplacementFormData {
  originalDriverId: string;
  replacementDriverId: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'active' | 'inactive';
}
