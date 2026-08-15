export interface ComplaintFeedback {
  id: string;
  type: 'complaint' | 'feedback';
  customerId: string;
  customerName: string;
  salesmanId: string;
  salesmanName: string;
  orderId?: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
  resolvedBy?: string;
  resolvedDate?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintFeedbackFormData {
  type: 'complaint' | 'feedback';
  customerId: string;
  salesmanId: string;
  orderId?: string;
  subject: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  resolution?: string;
  attachments?: string[];
}
