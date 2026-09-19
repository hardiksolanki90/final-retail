import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getConsumerSurveyList,
  createConsumerSurvey,
  bulkActionConsumerSurveys,
  getSensorySurveyList,
  createSensorySurvey,
  bulkActionSensorySurveys,
} from '../../api/SurveyApi';
import { getAllSalesmen } from '../../api/SalesmanApi';
import { getAllCustomers } from '../../api/CustomerApi';
import { getAllItems } from '../../api/ItemApi';
import { showToast } from '../../lib/toast';
import type { ConsumerSurveyFormData, SensorySurveyFormData } from '../../types/Survey';

/** Select-option data shared by both survey Add forms. */
export function useSurveyFormOptions() {
  const merchandisersQuery = useQuery({
    queryKey: ['survey-merchandisers'],
    queryFn: () => getAllSalesmen(),
    staleTime: 5 * 60 * 1000,
  });

  const customersQuery = useQuery({
    queryKey: ['survey-customers'],
    queryFn: () => getAllCustomers(),
    staleTime: 5 * 60 * 1000,
  });

  const productsQuery = useQuery({
    queryKey: ['survey-products'],
    queryFn: () => getAllItems(),
    staleTime: 5 * 60 * 1000,
  });

  return {
    // merchandiser_id is a straight FK to users, so the option value must be
    // the salesman's underlying userId, not the SalesmanInfo row's own uuid.
    merchandisers: (merchandisersQuery.data ?? []).map((s) => ({ value: String(s.userId), label: s.name })),
    customers: customersQuery.data ?? [],
    products: productsQuery.data ?? [],
    isLoading: merchandisersQuery.isLoading || customersQuery.isLoading || productsQuery.isLoading,
  };
}

export function useConsumerSurveys(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['consumer-surveys', page, searchTerm],
    queryFn: () => getConsumerSurveyList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: ConsumerSurveyFormData) => createConsumerSurvey(data),
    onSuccess: () => {
      showToast.success('Consumer survey created successfully!');
      queryClient.invalidateQueries({ queryKey: ['consumer-surveys'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create consumer survey');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionConsumerSurveys(uuids, action),
    onSuccess: () => {
      showToast.success('Consumer surveys updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['consumer-surveys'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update consumer surveys');
    },
  });

  return {
    surveys: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    createMutation,
    bulkAction: bulkActionMutation.mutate,
  };
}

export function useSensorySurveys(page: number = 1, searchTerm: string = '') {
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: ['sensory-surveys', page, searchTerm],
    queryFn: () => getSensorySurveyList(page, searchTerm),
    staleTime: 2 * 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: (data: SensorySurveyFormData) => createSensorySurvey(data),
    onSuccess: () => {
      showToast.success('Sensory survey created successfully!');
      queryClient.invalidateQueries({ queryKey: ['sensory-surveys'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to create sensory survey');
    },
  });

  const bulkActionMutation = useMutation({
    mutationFn: ({ uuids, action }: { uuids: string[]; action: 'activate' | 'deactivate' | 'delete' }) =>
      bulkActionSensorySurveys(uuids, action),
    onSuccess: () => {
      showToast.success('Sensory surveys updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['sensory-surveys'] });
    },
    onError: (error: any) => {
      showToast.error(error.response?.data?.message || 'Failed to update sensory surveys');
    },
  });

  return {
    surveys: listQuery.data?.data ?? [],
    total: listQuery.data?.total ?? 0,
    isLoading: listQuery.isLoading,
    createMutation,
    bulkAction: bulkActionMutation.mutate,
  };
}
