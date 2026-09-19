import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { ChevronLeft, Plus, Trash2, SlidersHorizontal } from 'lucide-react';
import { CancelButton, SaveButton } from '../../../components/ui/Button';
import { useWorkFlowFormOptions, useWorkFlowRuleMutations } from '../../../hooks/Preferences/useWorkFlowRules';
import { getWorkFlowRuleDetails } from '../../../api/WorkFlowApi';
import { WORK_FLOW_MODULES, type WorkFlowRuleFormData, type WorkFlowEventTrigger } from '../../../types/WorkFlowRule';

const MODULE_OPTIONS = WORK_FLOW_MODULES.map((m) => ({ value: m, label: m }));

const EVENT_TRIGGER_OPTIONS: { value: WorkFlowEventTrigger; label: string }[] = [
  { value: 'created', label: 'Created' },
  { value: 'edited', label: 'Edited' },
  { value: 'created_or_edited', label: 'Created or Edited' },
  { value: 'deleted', label: 'Deleted' },
];

const DEFAULT_VALUES: WorkFlowRuleFormData = {
  name: '',
  module: '',
  description: '',
  eventTrigger: 'created_or_edited',
  status: true,
  approvers: [{ roleId: '', userId: '' }],
};

export function WorkFlowApprovalAdd() {
  const navigate = useNavigate();
  const { uuid } = useParams<{ uuid: string }>();
  const isEditing = Boolean(uuid);
  const { roleOptions, approverOptions, isLoading: optionsLoading } = useWorkFlowFormOptions();
  const { createMutation, updateMutation } = useWorkFlowRuleMutations();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<WorkFlowRuleFormData>({ defaultValues: DEFAULT_VALUES });

  const { fields, append, remove } = useFieldArray({ control, name: 'approvers' });

  useEffect(() => {
    if (!uuid) return;
    getWorkFlowRuleDetails(uuid).then((rule) => {
      reset({
        name: rule.name,
        module: rule.module,
        description: rule.description ?? '',
        eventTrigger: rule.eventTrigger,
        status: rule.status,
        approvers: rule.approvers.length
          ? rule.approvers.map((a) => ({ roleId: String(a.roleId), userId: String(a.userId) }))
          : DEFAULT_VALUES.approvers,
      });
    });
  }, [uuid, reset]);

  const onSubmit = async (data: WorkFlowRuleFormData) => {
    const payload: WorkFlowRuleFormData = {
      ...data,
      approvers: data.approvers.map((a) => ({ roleId: Number(a.roleId), userId: Number(a.userId) })),
    };

    try {
      if (isEditing && uuid) {
        await updateMutation.mutateAsync({ uuid, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      navigate('/settings/work-flow-approval');
    } catch {
      // toast already shown by the mutation's onError handler
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <button
          type="button"
          onClick={() => navigate('/settings/work-flow-approval')}
          className="flex items-center justify-center w-8 h-8 rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-secondary)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
          <SlidersHorizontal className="w-4 h-4" />
        </div>
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          {isEditing ? 'Edit Workflow Rule' : 'New Workflow Rule'}
        </h1>
      </div>

      <div className="px-6 py-6">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl overflow-hidden shadow-sm">
            <div className="px-6 sm:px-10 py-8 space-y-10 max-w-3xl">
              {/* Section 1 */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">1. Name your workflow</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Give a Name and Description for your workflow</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Workflow Rule Name*</label>
                  <input
                    type="text"
                    {...register('name', { required: 'Workflow Rule Name is required' })}
                    className={`block w-full px-3 py-2 rounded-lg border ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Module*</label>
                  <select
                    {...register('module', { required: 'Module is required' })}
                    className={`block w-full px-3 py-2 rounded-lg border ${errors.module ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none`}
                  >
                    <option value="" disabled hidden>Select module</option>
                    {MODULE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  {errors.module && <p className="mt-1 text-sm text-red-600">{errors.module.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
              </div>

              {/* Section 2 */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">2. Choose when to Trigger</h2>
                  <p className="text-sm text-[var(--text-secondary)]">Specify when to execute the workflow.</p>
                </div>

                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    When should this rule fire?
                  </label>
                  <select
                    {...register('eventTrigger')}
                    className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                  >
                    {EVENT_TRIGGER_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Section 3 */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-semibold text-[var(--text-primary)]">3. Configure multi-level approval with specific approvers</h2>
                </div>

                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-center gap-3">
                      <div className="flex-1">
                        <select
                          {...register(`approvers.${index}.roleId`, { required: true })}
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="" disabled hidden>{optionsLoading ? 'Loading roles...' : 'Select role'}</option>
                          {roleOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex-1">
                        <select
                          {...register(`approvers.${index}.userId`, { required: true })}
                          className="block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none"
                        >
                          <option value="" disabled hidden>{optionsLoading ? 'Loading users...' : 'Select user'}</option>
                          {approverOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => fields.length > 1 && remove(index)}
                        className="flex items-center justify-center w-9 h-9 shrink-0 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => append({ roleId: '', userId: '' })}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 hover:text-red-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New
                </button>
              </div>
            </div>

            <div className="border-t border-[var(--border-color)]" />

            <div className="flex items-center justify-end gap-3 px-6 sm:px-10 py-4 bg-[var(--bg-card)]">
              <CancelButton type="button" onClick={() => navigate('/settings/work-flow-approval')}>
                Cancel
              </CancelButton>
              <SaveButton type="submit" isLoading={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save'}
              </SaveButton>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default WorkFlowApprovalAdd;
