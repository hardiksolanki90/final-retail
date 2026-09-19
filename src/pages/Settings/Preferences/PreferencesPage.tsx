import { SlidersHorizontal } from 'lucide-react';

export function PreferencesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 px-6 pt-6">
        <SlidersHorizontal className="w-6 h-6 text-[var(--text-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Preferences</h1>
          <p className="text-[var(--text-secondary)] mt-1">Configure appearance</p>
        </div>
      </div>

      <div className="mx-6 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-10 text-center text-[var(--text-secondary)]">
        Theme settings are coming soon.
      </div>
    </div>
  );
}

export default PreferencesPage;
