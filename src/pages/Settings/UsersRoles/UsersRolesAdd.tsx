import { useEffect, useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Check, Inbox, Loader2, ShieldCheck } from 'lucide-react';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { SaveButton, CancelButton } from '../../../components/ui/Button';
import type { UserRoleFormData } from '../../../types/UsersRoles';
import { OrderCodeSettingsIcon } from '../../../components/ui/OrderCodeSettingsIcon';
import { reserveCodeIfAuto } from '../../../api/CodeSettingApi';
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

const monoField = 'font-[family-name:var(--font-mono-ui)] tracking-wide';

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

  const [codeLocked, setCodeLocked] = useState(false);
  const { permissions: permissionCatalog, isLoading: permissionsLoading } = usePermissionCatalog();
  const grantedCount = (watch('permissions') ?? []).length;
  const totalCount = permissionCatalog.length;
  const coveragePct = totalCount > 0 ? Math.round((grantedCount / totalCount) * 100) : 0;

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
      const resolvedCode = await reserveCodeIfAuto('role', data.code);
      if (resolvedCode !== data.code) {
        data.code = resolvedCode ?? '';
        setValue('code', resolvedCode ?? '');
        setCodeLocked(true);
      }

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

  const headerBadge = !permissionsLoading && totalCount > 0 && (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-[var(--bg-secondary)] border border-[var(--border-color)] text-[var(--text-secondary)] ${monoField}`}
    >
      <ShieldCheck className="w-3.5 h-3.5 text-primary-600" strokeWidth={2} />
      {grantedCount}/{totalCount}
    </span>
  );

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Role' : 'Add Role'}
      width="w-[700px]"
      footer={footerContent}
      headerActions={headerBadge}
    >
      <form id="role-form" onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-8">
        {errors.root && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {errors.root.message}
          </div>
        )}

        {/* Role Definition */}
        <div className="space-y-4">
          <p className={`text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${monoField}`}>
            Role Definition
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Input
                  label="Code" required
                  {...register('code')}
                  error={errors.code?.message}
                  placeholder="Auto-generated if empty"
                  className={monoField}
                  disabled={codeLocked}
                />
                <div className="pt-6">
                  <OrderCodeSettingsIcon label="Code" value={watch('code') || ''} onChange={(v) => setValue('code', v)} entityKey="role" onLockChange={setCodeLocked} />
                </div>
              </div>
            </div>

            <Input
              label="Name" required
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
        </div>

        {/* Access Manifest */}
        <div className="space-y-3">
          <div className="flex items-end justify-between gap-4">
            <p className={`text-[11px] uppercase tracking-[0.18em] text-[var(--text-muted)] ${monoField}`}>
              Access Manifest
            </p>
            {!permissionsLoading && totalCount > 0 && (
              <p className={`text-[11px] text-[var(--text-muted)] ${monoField}`}>{coveragePct}% coverage</p>
            )}
          </div>

          {!permissionsLoading && totalCount > 0 && (
            <div className="h-[3px] w-full rounded-full bg-[var(--bg-secondary)] overflow-hidden">
              <div
                className="h-full bg-primary-600 transition-all duration-300 ease-out"
                style={{ width: `${coveragePct}%` }}
              />
            </div>
          )}

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
              const isRowEmpty = (row: ModuleRow) => rowValues(row).every((v) => !has(v));

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
                        <tr className="bg-[var(--bg-secondary)] border-b-2 border-[var(--border-color)]">
                          <th className={`px-4 py-3 text-left text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] w-[30%] ${monoField}`}>
                            Module
                          </th>
                          <th className={`px-4 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] ${monoField}`}>
                            Full Access
                          </th>
                          {ACTIONS.map((action) => (
                            <th
                              key={action}
                              className={`px-4 py-3 text-center text-[11px] uppercase tracking-[0.14em] text-[var(--text-muted)] ${monoField}`}
                            >
                              {ACTION_LABEL[action]}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border-color)]">
                        {permissionsLoading ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-10">
                              <div className="flex items-center justify-center gap-2 text-sm text-[var(--text-muted)]">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className={monoField}>Loading manifest…</span>
                              </div>
                            </td>
                          </tr>
                        ) : moduleRows.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="px-4 py-10">
                              <div className="flex flex-col items-center justify-center gap-2 text-center">
                                <div className="flex items-center justify-center w-9 h-9 rounded-lg border border-dashed border-[var(--border-color)] text-[var(--text-muted)]">
                                  <Inbox className="w-4 h-4" strokeWidth={1.75} />
                                </div>
                                <p className={`text-[11px] uppercase tracking-wider text-[var(--text-secondary)] ${monoField}`}>
                                  No permissions available
                                </p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          moduleRows.map((row) => {
                            const full = isRowFull(row);
                            const empty = isRowEmpty(row);
                            return (
                              <tr key={row.module} className="relative hover:bg-[var(--bg-secondary)] transition-colors">
                                <td className="relative px-4 py-3">
                                  <span
                                    className={`absolute left-0 top-0 bottom-0 w-[3px] transition-colors ${full ? 'bg-primary-600' : empty ? 'bg-transparent' : 'bg-primary-300 dark:bg-primary-800'
                                      }`}
                                  />
                                  <div className="pl-2 leading-tight">
                                    <div className="text-[var(--text-primary)] font-medium">{row.label}</div>
                                    <div className={`text-[10px] text-[var(--text-muted)] ${monoField}`}>{row.module}</div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <button
                                    type="button"
                                    onClick={() => toggleRow(row)}
                                    aria-pressed={full}
                                    className={`inline-flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all active:scale-95 ${full
                                      ? 'bg-primary-600 border-primary-600 text-white'
                                      : 'border-dashed border-gray-300 dark:border-gray-500 text-transparent hover:border-primary-400'
                                      }`}
                                  >
                                    <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                  </button>
                                </td>
                                {ACTIONS.map((action) => {
                                  const value = row.permissions[action];
                                  return (
                                    <td key={action} className="px-4 py-3 text-center">
                                      {value ? (
                                        <button
                                          type="button"
                                          onClick={() => toggleOne(value)}
                                          aria-pressed={has(value)}
                                          title={ACTION_LABEL[action]}
                                          className={`inline-flex items-center justify-center w-6 h-6 rounded-md border-2 transition-all active:scale-95 ${has(value)
                                            ? 'bg-primary-600 border-primary-600 text-white'
                                            : 'border-dashed border-gray-300 dark:border-gray-500 text-transparent hover:border-primary-400'
                                            }`}
                                        >
                                          <Check className="w-3.5 h-3.5" strokeWidth={3} />
                                        </button>
                                      ) : (
                                        <span className="text-[var(--text-muted)]">—</span>
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            }}
          />
        </div>
      </form>
    </Drawer>
  );
}
