export type WorkFlowEventTrigger = 'created' | 'edited' | 'created_or_edited' | 'deleted';

export const WORK_FLOW_MODULES = [
  'Order', 'Delivery', 'Invoice', 'CreditNote', 'DebitNote',
  'GRN', 'JourneyPlan', 'Customer', 'Item', 'Salesman',
] as const;

export type WorkFlowModule = (typeof WORK_FLOW_MODULES)[number];

export interface WorkFlowRuleApprover {
  roleId: number;
  roleName?: string;
  userId: number;
  userName?: string;
}

export interface WorkFlowRule {
  id: number;
  uuid: string;
  name: string;
  module: string;
  description?: string;
  eventTrigger: WorkFlowEventTrigger;
  status: boolean;
  approvers: WorkFlowRuleApprover[];
}

export interface WorkFlowRuleFormData {
  name: string;
  module: string;
  description?: string;
  eventTrigger: WorkFlowEventTrigger;
  status?: boolean;
  approvers: { roleId: number | string; userId: number | string }[];
}

export interface WorkFlowRuleListResponse {
  data: WorkFlowRule[];
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
}
