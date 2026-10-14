import axiosInstance from '../lib/axios';

export type DocumentKind = 'order' | 'delivery' | 'invoice' | 'credit-note' | 'debit-note';

/** Creates an Order / Delivery / Invoice / Credit Note / Debit Note; the server prices, taxes and numbers every line. */
export const createDocument = async (kind: DocumentKind, payload: Record<string, unknown>): Promise<unknown> => {
  const response = await axiosInstance.post(`/${kind}/add`, payload);
  return response.data.data;
};

/** Saves changes to a pending document; lines carrying their `uuid` keep the price and tax rates they were first saved with. */
export const updateDocument = async (kind: DocumentKind, uuid: string, payload: Record<string, unknown>): Promise<unknown> => {
  const response = await axiosInstance.post(`/${kind}/edit/${uuid}`, payload);
  return response.data.data;
};
