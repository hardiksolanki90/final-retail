import axiosInstance from '../lib/axios';

export interface KeyCombination {
  uuid: string;
  name: string | null;
  keys: string[];
}

const KeyCombinationApi = {
  all: async (): Promise<KeyCombination[]> => {
    const response = await axiosInstance.get('/key-combination/all');
    return response.data.data ?? [];
  },

  add: async (data: { name?: string; keys: string[] }): Promise<KeyCombination> => {
    const response = await axiosInstance.post('/key-combination/add', data);
    return response.data.data;
  },
};

export default KeyCombinationApi;
