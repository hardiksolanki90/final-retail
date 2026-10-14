export interface ComplaintFeedback {
  id: number;
  uuid: string;
  complaintId: string;
  title: string;
  type: 'complaint' | 'suggestion';
  description: string;
  date: string;
  routeId: number | null;
  routeCode: string | null;
  routeName: string | null;
  merchandiserId: number;
  merchandiserUuid: string | null;
  merchandiserCode: string | null;
  merchandiserName: string;
  itemId: number | null;
  itemUuid: string | null;
  itemCode: string | null;
  itemName: string | null;
  images: string[];
  createdAt: string;
}

export interface ComplaintFeedbackFormData {
  title: string;
  merchandiserId: string;
  itemId: string;
  type: 'complaint' | 'suggestion';
  description: string;
}

export interface ComplaintFeedbackListParams {
  page?: number;
  perPage?: number;
  search?: string;
  date?: string;
  route?: string;
  complaintId?: string;
  merchandiserName?: string;
  title?: string;
  itemCode?: string;
  itemName?: string;
  type?: '' | 'complaint' | 'suggestion';
}
