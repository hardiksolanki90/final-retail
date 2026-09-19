import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreatableSelect } from '../ui/CreatableSelect';
import { getAllItemGroups, createItemGroup } from '../../api/ItemGroupApi';
import type { SelectOption } from '../ui/Select';

interface ItemGroupSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export function ItemGroupSelect({ label = 'Item Group', value, onChange, error, required }: ItemGroupSelectProps) {
  const queryClient = useQueryClient();

  const { data: groups = [] } = useQuery({
    queryKey: ['item-groups'],
    queryFn: getAllItemGroups,
    staleTime: 10 * 60 * 1000,
  });

  const groupOptions: SelectOption[] = groups.map(group => ({
    value: group.id?.toString() || '',
    label: group.code ? `${group.code} - ${group.name}` : group.name || 'Group',
  }));

  const createGroupMutation = useMutation({
    mutationFn: (values: Record<string, any>) => createItemGroup({
        code: values.code,
        name: values.name,
        status: values.status ?? true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['item-groups'] });
    },
  });

  const handleCreateOption = async (values: Record<string, any>): Promise<SelectOption> => {
    const created = await createGroupMutation.mutateAsync(values);
    const data = created.data || created;
    return { 
        value: data.id?.toString() || '', 
        label: data.code ? `${data.code} - ${data.name}` : data.name || values.name 
    };
  };

  return (
    <CreatableSelect
      label={required ? `${label}*` : label}
      value={value}
      onChange={onChange}
      options={groupOptions}
      placeholder="Select Item Group"
      createLabel="Add New Group"
      onCreate={handleCreateOption}
      fields={[
        { type: 'text', name: 'code', label: 'Group Code', required: true, hasCodeSettings: true },
        { type: 'text', name: 'name', label: 'Group Name', required: true },
        { type: 'toggle', name: 'status', label: 'Active' },
      ]}
      error={error}
    />
  );
}
