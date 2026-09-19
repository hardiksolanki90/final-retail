import { useEffect } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';
import { Drawer } from '../../components/ui/Drawer';
import { Input } from '../../components/ui/Input';
import { SaveButton, CancelButton } from '../../components/ui/Button';
import type { ConsumerSurveyFormData, SurveyQuestion } from '../../types/Survey';
import type { SelectOption } from '../../components/ui/Select';
import { OrderCodeSettingsIcon } from '../../components/ui/OrderCodeSettingsIcon';

const emptyQuestion: SurveyQuestion = {
  id: '', question: '', questionType: 'text', options: [], required: false,
};

interface ConsumerSurveyAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ConsumerSurveyFormData) => void | Promise<void>;
  initialData?: ConsumerSurveyFormData;
  isLoading?: boolean;
  customers?: SelectOption[];
  merchandisers?: SelectOption[];
}

const defaultValues: ConsumerSurveyFormData = {
  surveyCode: '',
  surveyName: '',
  customerId: '',
  merchandiserId: '',
  date: '',
  questions: [],
  status: 'draft',
};

export function ConsumerSurveyAdd({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading = false,
  customers = [],
  merchandisers = [],
}: ConsumerSurveyAddProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ConsumerSurveyFormData>({ defaultValues });

  const { fields, append, remove } = useFieldArray({ control, name: 'questions' });

  useEffect(() => {
    reset(initialData ?? defaultValues);
  }, [initialData, isOpen, reset]);

  const onFormSubmit = async (data: ConsumerSurveyFormData) => {
    await onSubmit(data);
    onClose();
  };

  const selectClass = 'block w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500';

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? 'Edit Consumer Survey' : 'Add Consumer Survey'}
      width="w-[600px]"
    >
      <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Survey Code</label>
            </div>
            <div className="flex items-center gap-2 relative">
              <Input
                {...register('surveyCode', { required: 'Survey Code is required' })}
                error={errors.surveyCode?.message}
                placeholder="Enter survey code"
                required
              />
              <OrderCodeSettingsIcon label="Survey Code" value={watch('surveyCode') || ''} onChange={(v) => setValue('surveyCode', v)} />
            </div>
          </div>
          <Input
            label="Survey Name"
            {...register('surveyName', { required: 'Survey Name is required' })}
            error={errors.surveyName?.message}
            placeholder="Enter survey name"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Customer <span className="text-red-500">*</span>
            </label>
            <select {...register('customerId', { required: 'Customer is required' })} className={selectClass}>
              <option value="">Select customer</option>
              {customers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.customerId && <p className="text-sm text-red-500 mt-1">{errors.customerId.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Merchandiser <span className="text-red-500">*</span>
            </label>
            <select {...register('merchandiserId', { required: 'Merchandiser is required' })} className={selectClass}>
              <option value="">Select merchandiser</option>
              {merchandisers.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            {errors.merchandiserId && <p className="text-sm text-red-500 mt-1">{errors.merchandiserId.message}</p>}
          </div>
        </div>

        <Input
          label="Date"
          type="date"
          {...register('date', { required: 'Date is required' })}
          error={errors.date?.message}
          required
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select {...register('status')} className={selectClass}>
            <option value="draft">Draft</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3 mt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Questions</label>
            <button
              type="button"
              onClick={() => append({ ...emptyQuestion, id: Date.now().toString() })}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              <Plus className="w-4 h-4" /> Add Question
            </button>
          </div>

          <div className="space-y-3">
            {fields.map((field, index) => {
              const questionType = watch(`questions.${index}.questionType`);
              return (
                <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className="flex-1 space-y-2">
                      <input
                        {...register(`questions.${index}.question`, { required: 'Question text is required' })}
                        placeholder="Question text"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <select {...register(`questions.${index}.questionType`)} className={selectClass}>
                          <option value="text">Text</option>
                          <option value="rating">Rating</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="yes_no">Yes/No</option>
                        </select>
                        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <input type="checkbox" {...register(`questions.${index}.required`)} className="w-4 h-4" />
                          Required
                        </label>
                      </div>
                      {questionType === 'multiple_choice' && (
                        <Controller
                          control={control}
                          name={`questions.${index}.options`}
                          render={({ field: optionsField }) => (
                            <input
                              value={(optionsField.value ?? []).join(', ')}
                              onChange={(e) => optionsField.onChange(
                                e.target.value.split(',').map((o) => o.trim()).filter(Boolean),
                              )}
                              placeholder="Options, comma separated (e.g. Yes, No, Maybe)"
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                          )}
                        />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fields.length > 1 && remove(index)}
                      className="text-gray-400 hover:text-red-500 p-1"
                      disabled={fields.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  {errors.questions?.[index]?.question && (
                    <p className="text-xs text-red-500">{errors.questions[index]?.question?.message}</p>
                  )}
                </div>
              );
            })}
            {fields.length === 0 && (
              <p className="text-sm text-gray-400 dark:text-gray-500">No questions added yet.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <CancelButton onClick={onClose} disabled={isLoading || isSubmitting}>Cancel</CancelButton>
          <SaveButton type="submit" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? 'Saving...' : initialData ? 'Update' : 'Save'}
          </SaveButton>
        </div>
      </form>
    </Drawer>
  );
}