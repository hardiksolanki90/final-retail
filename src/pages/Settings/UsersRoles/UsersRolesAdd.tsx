import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { UserRoleFormData } from '../../../types/UsersRoles';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { usePermissionCatalog } from '../../../hooks/UsersRoles/useRoles';

interface UsersRolesAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserRoleFormData) => void | Promise<void>;
  initialData?: UserRoleFormData;
  isLoading?: boolean;
}

const initialFormData: UserRoleFormData = {
  code: '',
  name: '',
  permissions: [],
  description: '',
};

const ACTIONS = ['view', 'create', 'edit', 'delete'] as const;
type Action = (typeof ACTIONS)[number];
const ACTION_LABEL: Record<Action, string> = { view: 'View', create: 'Create', edit: 'Edit', delete: 'Delete' };

interface ModuleRow {
  module: string;
  label: string;
  permissions: Partial<Record<Action, string>>; // action -> full permission value
}

export function UsersRolesAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
}: UsersRolesAddProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    control,
    watch,
    setValue,
  } = useForm<UserRoleFormData>({
    defaultValues: initialFormData,
  });

  const { permissions: permissionCatalog, isLoading: permissionsLoading } = usePermissionCatalog();

  const moduleRows = useMemo<ModuleRow[]>(() => {
    const byModule = new Map<string, ModuleRow>();
    for (const p of permissionCatalog) {
      const action = p.value.split('.').pop() as Action;
      if (!byModule.has(p.module)) {
        byModule.set(p.module, {
          module: p.module,
          label: p.module.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
          permissions: {},
        });
      }
      byModule.get(p.module)!.permissions[action] = p.value;
    }
    return Array.from(byModule.values()).sort((a, b) => a.label.localeCompare(b.label));
  }, [permissionCatalog]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset(initialFormData);
    }
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: UserRoleFormData) => {
    try {
      await onSubmit(data);
      onClose();
    } catch (error: any) {
      setError('root', {
        message: error.response?.data?.message || 'Error saving user role',
      });
    }
  };

  const footerContent = (
    <div className="flex justify-end gap-3">
      <CancelButton onClick={onClose} disabled={isSubmitting || isLoading}>Cancel</CancelButton>
      <SaveButton type="submit" form="role-form" disabled={isSubmitting || isLoading}>
        {isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
      </SaveButton>
    </div>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Role' : 'Add Role'}
      width="w-[900px]"
      footer={footerContent}
    >
      <form id="role-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.root.message}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Input
                label="Code *"
                {...register('code', {
                  required: 'Code is required',
                  validate: (value) => value.trim() !== '' || 'Code cannot be empty',
                })}
                error={errors.code?.message}
                placeholder="Enter role code"
              />
              <div className="pt-6">
                <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} />
              </div>
            </div>
          </div>

          <Input
            label="Name *"
            {...register('name', {
              required: 'Name is required',
              validate: (value) => value.trim() !== '' || 'Name cannot be empty',
            })}
            error={errors.name?.message}
            placeholder="Enter role name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            {...register('description')}
            rows={2}
            className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            placeholder="Enter description"
          />
        </div>

        {/* Permission matrix */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Permissions</label>

          {permissionsLoading ? (
              <p className="text-sm text-[var(--text-muted)]">Loading permissions…</p>
            ) : (
              <Controller
                control={control}
                name="permissions"
                render={({ field }) => {
                  const selected = field.value ?? [];
                  const has = (value?: string) => (value ? selected.includes(value) : false);

                  const toggleOne = (value: string) => {
                    field.onChange(selected.includes(value) ? selected.filter((p) => p !== value) : [...selected, value]);
                  };

                  const rowValues = (row: ModuleRow) => Object.values(row.permissions).filter(Boolean) as string[];
                  const isRowFull = (row: ModuleRow) => rowValues(row).every((v) => has(v));

                  const toggleRow = (row: ModuleRow) => {
                    const values = rowValues(row);
                    const full = isRowFull(row);
                    field.onChange(
                      full
                        ? selected.filter((p) => !values.includes(p))
                        : Array.from(new Set([...selected, ...values]))
                    );
                  };

                  return (
                    <div className="border border-[var(--border-color)] rounded-xl overflow-hidden">
                      <div className="max-h-[420px] overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="sticky top-0 z-10">
                            <tr className="bg-[var(--bg-secondary)] border-b border-[var(--border-color)]">
                              <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--text-primary)] w-[26%]">
                                Module
                              </th>
                              <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">
                                Full Access
                              </th>
                              {ACTIONS.map((action) => (
                                <th key={action} className="px-4 py-3 text-center text-sm font-semibold text-[var(--text-primary)]">
                                  {ACTION_LABEL[action]}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--border-color)]">
                            {moduleRows.map((row) => (
                              <tr key={row.module} className="hover:bg-[var(--bg-secondary)] transition-colors">
                                <td className="px-4 py-3 text-[var(--text-primary)]">{row.label}</td>
                                <td className="px-4 py-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isRowFull(row)}
                                    onChange={() => toggleRow(row)}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                  />
                                </td>
                                {ACTIONS.map((action) => {
                                  const value = row.permissions[action];
                                  return (
                                    <td key={action} className="px-4 py-3 text-center">
                                      {value ? (
                                        <input
                                          type="checkbox"
                                          checked={has(value)}
                                          onChange={() => toggleOne(value)}
                                          className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 cursor-pointer"
                                        />
                                      ) : (
                                        <span className="text-[var(--text-muted)]">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                            {moduleRows.length === 0 && (
                              <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-[var(--text-muted)]">
                                  No permissions available.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                }}
              />
            )}
          </div>
      </form>
    </Drawer>
  );
}
