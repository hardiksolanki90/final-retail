import { useEffect, useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Select, type SelectOption } from './Select';
import { SaveButton, CancelButton } from './Button';
import { OrderCodeSettingsIcon } from './OrderCodeSettingsIcon';
import { showToast } from '../../lib/toast';

export type QuickCreateField =
  | { type: 'text'; name: string; label: string; required?: boolean; maxLength?: number; placeholder?: string; hasCodeSettings?: boolean }
  | { type: 'select'; name: string; label: string; options: SelectOption[]; placeholder?: string }
  | { type: 'toggle'; name: string; label: string }
  | { type: 'number'; name: string; label: string; required?: boolean; placeholder?: string };

export interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: QuickCreateField[];
  onSubmit: (values: Record<string, any>) => Promise<void>;
}

function defaultValuesFor(fields: QuickCreateField[]): Record<string, any> {
  const values: Record<string, any> = {};
  fields.forEach((field) => {
    values[field.name] = field.type === 'toggle' ? true : '';
  });
  return values;
}

/**
 * Generic "create a lookup record without leaving the form" modal — field
 * shape is declarative (QuickCreateField[]), so any Category/Group/Channel-
 * style entity can reuse this instead of each getting its own bespoke modal.
 */
export function QuickCreateModal({ isOpen, onClose, title, fields, onSubmit }: QuickCreateModalProps) {
  const [values, setValues] = useState<Record<string, any>>(() => defaultValuesFor(fields));
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setValues(defaultValuesFor(fields));
      setError(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setValue = (name: string, value: any) => setValues((v) => ({ ...v, [name]: value }));

  const handleSave = async () => {
    const missing = fields.find(
      (field) => field.type === 'text' && field.required && !String(values[field.name] ?? '').trim()
    );
    if (missing) {
      setError(`${missing.label} is required`);
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      await onSubmit(values);
      showToast.success(`${title.replace(/^Add New\s+/i, '')} created successfully`);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <CancelButton onClick={onClose} disabled={isSaving}>
            Cancel
          </CancelButton>
          <SaveButton onClick={handleSave} isLoading={isSaving}>
            Save
          </SaveButton>
        </>
      }
    >
      <div className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">{error}</div>
        )}

        {fields.map((field) => {
          if (field.type === 'text' || field.type === 'number') {
            const inputElement = (
              <Input
                type={field.type}
                label={field.type === 'text' && field.hasCodeSettings ? undefined : `${field.label}${field.required ? '*' : ''}`}
                value={values[field.name] || ''}
                maxLength={field.type === 'text' ? field.maxLength : undefined}
                placeholder={field.placeholder}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            );

            if (field.type === 'text' && field.hasCodeSettings) {
              return (
                <div key={field.name}>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      {field.label}{field.required ? '*' : ''}
                    </label>
                  </div>
                  <div className="flex items-center gap-2 relative">
                    {inputElement}
                    <OrderCodeSettingsIcon 
                      label={field.label} 
                      value={values[field.name] || ''} 
                      onChange={(v) => setValue(field.name, v)} 
                    />
                  </div>
                </div>
              );
            }

            return <div key={field.name}>{inputElement}</div>;
          }

          if (field.type === 'select') {
            return (
              <Select
                key={field.name}
                label={field.label}
                options={field.options}
                placeholder={field.placeholder}
                value={values[field.name] ?? ''}
                onChange={(e) => setValue(field.name, e.target.value)}
              />
            );
          }

          return (
            <div key={field.name} className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{field.label}</span>
              <button
                type="button"
                onClick={() => setValue(field.name, !values[field.name])}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                  values[field.name] ? 'bg-primary-600 dark:bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                    values[field.name] ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          );
        })}
      </div>
    </Modal>
  );
}

export default QuickCreateModal;
