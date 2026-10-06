import axiosInstance from '../lib/axios';

export type DocumentKind = 'delivery' | 'invoice' | 'debit-note';

/** Creates a Delivery / Invoice / Debit Note; the server prices, taxes and numbers every line. */
export const createDocument = async (kind: DocumentKind, payload: Record<string, unknown>): Promise<unknown> => {
  const response = await axiosInstance.post(`/${kind}/add`, payload);
  return response.data.data;
};
