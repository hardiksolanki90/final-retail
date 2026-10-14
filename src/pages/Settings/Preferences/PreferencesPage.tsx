import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Boxes, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { Skeleton } from '../../../components/ui/skeleton';
import { Input } from '../../../components/ui/Input';
import { SaveButton } from '../../../components/ui/Button';
import { useStockSettings } from '../../../hooks/Stock/useStock';

interface StockLevelsForm {
  lowStockQty: string;
  mediumStockQty: string;
}

export function PreferencesPage() {
  const { hasPermission } = useAuth();
  const { settings, isLoading, update } = useStockSettings();
  const canEdit = hasPermission('preferences.edit');
  const allowed = settings?.allowNegativeStock ?? false;
  const { register, handleSubmit, reset, getValues, formState: { errors, isDirty } } = useForm<StockLevelsForm>({ defaultValues: { lowStockQty: '', mediumStockQty: '' } });

  useEffect(() => {
    if (settings) reset({ lowStockQty: String(Number(settings.lowStockQty)), mediumStockQty: String(Number(settings.mediumStockQty)) });
  }, [settings, reset]);

  const saveLevels = handleSubmit((form) => update.mutate({ lowStockQty: form.lowStockQty, mediumStockQty: form.mediumStockQty }));

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-6 pt-6">
        <SlidersHorizontal className="w-6 h-6 text-[var(--text-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preferences</h1>
          <p className="text-[var(--text-secondary)] mt-1">Organisation-wide rules</p>
        </div>
      </div>

      <section className="mx-6 rounded-xl border border-[var(--border-color)] bg-[var(--bg-card)] p-6">
        <div className="mb-4 flex items-center gap-2">
          <Boxes className="h-5 w-5 text-[var(--text-primary)]" />
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Stock</h2>
        </div>
        {isLoading ? (
          <Skeleton className="h-14 w-full" />
        ) : (
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="font-medium text-[var(--text-primary)]">Allow negative stock</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">When off, a document or stock entry that would take a warehouse below zero is refused. Turn it on only if you must keep selling before stock is booked in.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={allowed}
              aria-label="Allow negative stock"
              disabled={!canEdit || update.isPending}
              onClick={() => update.mutate({ allowNegativeStock: !allowed })}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800 ${allowed ? 'cursor-pointer bg-primary-600 dark:bg-primary-500' : 'cursor-pointer bg-gray-300 dark:bg-gray-600'}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${allowed ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        )}
        {!isLoading && (
          <form onSubmit={saveLevels} className="mt-6 border-t border-[var(--border-color)] pt-6">
            <p className="font-medium text-[var(--text-primary)]">Stock level indicator</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">The Stock tab flags an item as Low at or below the first quantity, Medium at or below the second, and Good above it. Quantities are in the item's base unit.</p>
            <div className="mt-4 grid max-w-xl grid-cols-2 gap-4">
              <Input label="Low at or below" type="number" step="any" min="0" disabled={!canEdit} error={errors.lowStockQty?.message} {...register('lowStockQty', { required: 'Enter a quantity', validate: (value) => Number(value) >= 0 || 'Cannot be below 0' })} />
              <Input label="Medium at or below" type="number" step="any" min="0" disabled={!canEdit} error={errors.mediumStockQty?.message} {...register('mediumStockQty', { required: 'Enter a quantity', validate: (value) => Number(value) >= Number(getValues('lowStockQty')) || 'Cannot be below the low level' })} />
            </div>
            {canEdit && <div className="mt-4"><SaveButton type="submit" disabled={!isDirty || update.isPending}>{update.isPending ? 'Saving…' : 'Save levels'}</SaveButton></div>}
          </form>
        )}
      </section>
    </div>
  );
}

export default PreferencesPage;
