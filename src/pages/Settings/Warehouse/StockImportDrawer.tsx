import { useRef, useState } from 'react';
import { Download, FileUp } from 'lucide-react';
import { isAxiosError } from 'axios';
import { Drawer } from '../../../components/ui/Drawer';
import { Input } from '../../../components/ui/Input';
import { Button, CancelButton, SaveButton } from '../../../components/ui/Button';
import { useImportStock } from '../../../hooks/Stock/useStock';
import type { StockImportResult } from '../../../types/Stock';

interface StockImportDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseId: number;
  warehouseName: string;
}

const TEMPLATE = 'item_code,uom_code,quantity\nITM001,PCS,120\nITM002,CTN,10\n';

/** The problems the server found in the file (one per row), or its message. */
const problemsOf = (error: unknown): string[] => (isAxiosError(error) ? (error.response?.data?.errors?.file ?? [error.response?.data?.message ?? 'The file could not be imported.']) : ['The file could not be imported.']);

/** Opening stock from a CSV: check the file first (nothing is written), then import it as one posted entry. */
export function StockImportDrawer({ isOpen, onClose, warehouseId, warehouseName }: StockImportDrawerProps) {
  const { check, run } = useImportStock();
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [checked, setChecked] = useState<StockImportResult | null>(null);
  const [problems, setProblems] = useState<string[]>([]);

  // Every way out clears the form, so the drawer always opens empty.
  const close = () => {
    setFile(null);
    setChecked(null);
    setProblems([]);
    if (input.current) input.current.value = '';
    onClose();
  };

  const args = file ? { warehouseId, entryDate: date, file } : null;
  const pick = (next: File | null) => {
    setFile(next);
    setChecked(null);
    setProblems([]);
  };
  const runCheck = async () => {
    if (!args) return;
    setProblems([]);
    try {
      setChecked((await check.mutateAsync(args)) ?? null);
    } catch (error) {
      setChecked(null);
      setProblems(problemsOf(error));
    }
  };
  const runImport = async () => {
    if (!args) return;
    try {
      await run.mutateAsync(args);
      close();
    } catch (error) {
      setProblems(problemsOf(error));
    }
  };
  const downloadTemplate = () => {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv' }));
    const link = Object.assign(document.createElement('a'), { href: url, download: 'opening-stock-template.csv' });
    link.click();
    URL.revokeObjectURL(url);
  };

  const footer = (
    <div className="flex items-center justify-end gap-3">
      <CancelButton onClick={close} disabled={run.isPending}>Cancel</CancelButton>
      {checked ? <SaveButton type="button" onClick={runImport} disabled={run.isPending}>{run.isPending ? 'Importing…' : `Import ${checked.itemCount} items`}</SaveButton> : <Button type="button" onClick={runCheck} disabled={!file || check.isPending}>{check.isPending ? 'Checking…' : 'Check file'}</Button>}
    </div>
  );

  return (
    <Drawer isOpen={isOpen} onClose={close} title={`Import opening stock — ${warehouseName}`} width="w-[560px]" footer={footer}>
      <div className="space-y-5 p-6">
        <p className="rounded-lg bg-[var(--bg-secondary)] px-4 py-3 text-sm text-[var(--text-secondary)]">
          A CSV with the columns <code>item_code</code>, <code>uom_code</code> (blank = the item's base unit) and <code>quantity</code>. The file is checked first; one bad row rejects the whole file, so nothing is half-loaded.
        </p>
        <Button type="button" variant="outline" size="sm" leftIcon={<Download className="h-4 w-4" />} onClick={downloadTemplate}>Download template</Button>
        <Input label="Date" type="date" value={date} onChange={(e) => { setDate(e.target.value); setChecked(null); }} required />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">CSV file</label>
          <input ref={input} type="file" accept=".csv,text/csv" onChange={(e) => pick(e.target.files?.[0] ?? null)} className="block w-full cursor-pointer rounded-lg border border-[var(--border-color)] bg-[var(--bg-card)] text-sm text-[var(--text-primary)] file:mr-3 file:cursor-pointer file:border-0 file:bg-[var(--bg-secondary)] file:px-4 file:py-2 file:text-sm file:text-[var(--text-primary)]" />
        </div>

        {checked && (
          <div className="flex items-start gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-300">
            <FileUp className="mt-0.5 h-4 w-4 shrink-0" />
            <span>The file is valid: {checked.rowCount} rows for {checked.itemCount} items. Nothing is imported until you confirm.</span>
          </div>
        )}
        {problems.length > 0 && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
            <p className="mb-1 font-semibold">Fix these and check the file again:</p>
            <ul className="max-h-64 list-disc space-y-0.5 overflow-auto pl-5">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul>
          </div>
        )}
      </div>
    </Drawer>
  );
}
