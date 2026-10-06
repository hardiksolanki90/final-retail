import { forwardRef, useEffect, useMemo, useRef, useState, type FormEventHandler, type InputHTMLAttributes, type ReactNode } from 'react';
import { format, parse } from 'date-fns';
import { Banknote, ChevronLeft, DollarSign, Euro, IndianRupee, Info, JapaneseYen, Minus, Plus, PoundSterling, RussianRuble, SwissFranc, Trash2, type LucideIcon } from 'lucide-react';
import { Controller, type Control, type FieldError, type FieldValues, type Path, type RegisterOptions, type UseFormRegisterReturn } from 'react-hook-form';
import { Input } from '../../../components/ui/Input';
import { Select, type SelectOption, type SelectProps } from '../../../components/ui/Select';
import { DatePicker } from '../../../components/ui/DatePicker';
import { useAuth } from '../../../context/AuthContext';
import { baseUomFor, uomsForItem } from '../../../utils/itemUoms';

// Shared "ledger & receipt" kit for the Order / Delivery / Invoice /
// Credit Note / Debit Note Add pages. Layout only — every page keeps its own
// fields, rules, calculations and submit logic.

const mono = 'font-[family-name:var(--font-mono-ui)]';
const eyebrowCls = `text-[10px] uppercase tracking-[0.22em] text-[var(--text-muted)] ${mono}`;
const rise = 'animate-rise motion-reduce:animate-none';
// Literal strings so Tailwind's scanner emits them.
const RISE_DELAY = ['[animation-delay:0ms]', '[animation-delay:60ms]', '[animation-delay:120ms]', '[animation-delay:180ms]', '[animation-delay:240ms]'];

const NUMERIC_COLUMNS = new Set(['Qty', 'Price', 'Discount', 'Net', 'Excise', 'Total']);

/** Field grid inside a section: 2-up on tablet, stacked when sections sit side by side (xl). */
export const fieldGridCls = 'grid gap-4 sm:grid-cols-2 xl:grid-cols-1';

/** Full-row cell below xl (Item). */
export const wideCellCls = 'col-span-2 sm:col-span-4 xl:col-span-1';

function money(value: number, digits = 2) {
  return (Number(value) || 0).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

// ── Page frame ───────────────────────────────────────────────────────────────

interface DocumentShellProps {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  onBack: () => void;
  onSubmit: FormEventHandler<HTMLFormElement>;
  children: ReactNode;
}

/** Header + form body. `noValidate`: every required field carries an RHF rule, so native bubbles are redundant. */
export function DocumentShell({ icon: Icon, eyebrow, title, onBack, onSubmit, children }: DocumentShellProps) {
  return (
    <div className="min-h-screen bg-[var(--bg-secondary)] dark:bg-[var(--bg-primary)]">
      <header className="flex items-center justify-between gap-4 px-4 sm:px-6 py-4 border-b border-[var(--border-color)] bg-[var(--bg-card)]">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
            <Icon className="w-5 h-5" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className={eyebrowCls}>{eyebrow}</p>
            <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight leading-tight text-[var(--text-primary)] truncate">{title}</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1 shrink-0 px-3 py-1.5 rounded-lg text-sm cursor-pointer text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)] transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
      </header>

      <form onSubmit={onSubmit} noValidate className="px-4 sm:px-6 py-6 space-y-5">
        {children}
      </form>
    </div>
  );
}

/** Two sections side by side from xl, stacked below. */
export function SectionPair({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 xl:grid-cols-2">{children}</div>;
}

interface DocSectionProps {
  index: number;
  title: string;
  aside?: ReactNode;
  /** Children render edge-to-edge (Items). */
  flush?: boolean;
  children?: ReactNode;
}

// No overflow-hidden here: Select / DatePicker popovers must escape the card.
export function DocSection({ index, title, aside, flush = false, children }: DocSectionProps) {
  return (
    <section className={`bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl ${rise} ${RISE_DELAY[index - 1] ?? ''}`}>
      <header className={`flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 ${children ? 'border-b border-[var(--border-color)]' : ''}`}>
        <h2 className={`text-[11px] uppercase tracking-[0.18em] text-[var(--text-secondary)] ${mono}`}>{title}</h2>
        {aside}
      </header>
      {children && <div className={flush ? '' : 'p-5'}>{children}</div>}
    </section>
  );
}

/** Segmented radio group bound to one register()ed field. */
export function TypeSwitch({ label, options, registration }: { label: string; options: SelectOption[]; registration: UseFormRegisterReturn }) {
  return (
    <fieldset>
      <legend className="sr-only">{label}</legend>
      <div className="flex flex-wrap gap-1 p-1 rounded-lg border border-[var(--border-color)] bg-gray-100 dark:bg-gray-900/60">
        {options.map((option) => (
          <label key={option.value} className="cursor-pointer">
            <input type="radio" value={option.value} {...registration} className="peer sr-only" />
            <span className="block px-3.5 py-1.5 rounded-md text-sm font-medium transition-colors text-[var(--text-secondary)] hover:text-[var(--text-primary)] peer-checked:bg-white dark:peer-checked:bg-gray-700 peer-checked:text-primary-700 dark:peer-checked:text-primary-300 peer-checked:shadow-sm peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500">
              {option.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/** Document number with its code-settings action beside the label. */
export function CodeField({
  label,
  action,
  registration,
  disabled = false,
}: {
  label: string;
  action: ReactNode;
  registration: UseFormRegisterReturn;
  /** True once an auto-generated code has been reserved for this document. */
  disabled?: boolean;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        {action}
      </div>
      <Input {...registration} aria-label={label} placeholder="Configure the system to auto-generate the code." disabled={disabled} className={mono} />
    </div>
  );
}

// ── RHF bindings for the shared Select / DatePicker ─────────────────────────

type Rules<T extends FieldValues> = Omit<RegisterOptions<T, Path<T>>, 'valueAsNumber' | 'valueAsDate' | 'setValueAs' | 'disabled'>;

interface ControlledProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  rules?: Rules<T>;
  label?: string;
}

// Some pages use `required: true` (no message) — still say why submit is blocked.
function errorText(error: FieldError | undefined, label?: string) {
  if (!error) return undefined;
  return error.message || `${label ?? 'This field'} is required`;
}

export function ControlledSelect<T extends FieldValues>({
  control,
  name,
  rules,
  label,
  ...selectProps
}: ControlledProps<T> & Omit<SelectProps, 'name' | 'value' | 'onChange' | 'onBlur' | 'label' | 'required'>) {
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <Select
          {...selectProps}
          label={label}
          name={field.name}
          value={String(field.value ?? '')}
          onChange={field.onChange}
          onBlur={field.onBlur}
          required={Boolean(rules?.required)}
          error={errorText(fieldState.error, label)}
        />
      )}
    />
  );
}

interface UomBodyProps {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  name: string;
  options: SelectOption[];
  base: string | undefined;
  itemId: string | undefined;
  error?: string;
}

function LineUomBody({ value, onChange, onBlur, name, options, base, itemId, error }: UomBodyProps) {
  // The UOM must belong to the chosen item: no item → blank; a UOM the item
  // doesn't have (item changed, or none yet) → its base UOM. While the item
  // list is still loading (no options) the saved value is left alone.
  useEffect(() => {
    if (!itemId) {
      if (value) onChange('');
      return;
    }
    if (options.length > 0 && !options.some((o) => String(o.value) === value)) onChange(base ?? '');
  }, [itemId, options, base, value, onChange]);

  return <Select name={name} value={value} onChange={(e) => onChange(e.target.value)} onBlur={onBlur} options={options} placeholder={itemId ? 'UOM' : 'Select item first'} error={error} />;
}

/** UOM cell for a line: offers only the UOMs assigned to the line's item and keeps the value valid. */
export function LineUomCell<T extends FieldValues>({ control, name, itemId, items }: { control: Control<T>; name: Path<T>; itemId: string | undefined; items: SelectOption[] }) {
  const options = useMemo(() => uomsForItem(items, itemId), [items, itemId]);
  const base = baseUomFor(items, itemId);

  return (
    <LineCell label="UOM">
      <Controller
        control={control}
        name={name}
        render={({ field, fieldState }) => (
          <LineUomBody
            name={field.name}
            value={String(field.value ?? '')}
            onChange={field.onChange}
            onBlur={field.onBlur}
            options={options}
            base={base}
            itemId={itemId}
            error={errorText(fieldState.error, 'UOM')}
          />
        )}
      />
    </LineCell>
  );
}

/** Stores `yyyy-MM-dd` (or `HH:mm` when timeOnly) strings, exactly like the native inputs did. */
export function ControlledDate<T extends FieldValues>({ control, name, rules, label, timeOnly = false, placeholderText }: ControlledProps<T> & { timeOnly?: boolean; placeholderText?: string }) {
  const valueFormat = timeOnly ? 'HH:mm' : 'yyyy-MM-dd';
  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <DatePicker
          label={label}
          required={Boolean(rules?.required)}
          selected={field.value ? parse(String(field.value), valueFormat, new Date()) : null}
          onChange={(date) => field.onChange(date ? format(date, valueFormat) : '')}
          showTimeSelectOnly={timeOnly}
          dateFormat={timeOnly ? 'h:mm aa' : undefined}
          placeholderText={placeholderText}
          error={errorText(fieldState.error, label)}
        />
      )}
    />
  );
}

// ── Items ───────────────────────────────────────────────────────────────

export function LineHeader({ cols, labels, numericLabels = [] }: { cols: string; labels: string[]; numericLabels?: string[] }) {
  return (
    <div aria-hidden="true" className={`hidden xl:grid gap-x-2.5 px-5 py-2.5 border-b border-[var(--border-color)] bg-gray-50/70 dark:bg-gray-900/30 ${eyebrowCls} ${cols}`}>
      <span>#</span>
      {labels.map((label) => (
        <span key={label} className={NUMERIC_COLUMNS.has(label) || numericLabels.includes(label) ? 'text-right' : ''}>
          {label}
        </span>
      ))}
      <span />
    </div>
  );
}

interface LineStripProps {
  index: number;
  cols: string;
  onRemove: () => void;
  canRemove: boolean;
  children: ReactNode;
  /** Extra row under the strip (e.g. promotion free goods). */
  below?: ReactNode;
}

/** One ledger line: a single grid row from xl, a wrapped numbered block below. */
export function LineStrip({ index, cols, onRemove, canRemove, children, below }: LineStripProps) {
  const no = String(index + 1).padStart(2, '0');
  const removeButton = (
    <button
      type="button"
      onClick={onRemove}
      disabled={!canRemove}
      aria-label={`Remove line ${no}`}
      className="p-2 rounded-lg cursor-pointer text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-[var(--text-muted)]"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );

  return (
    <div className="border-b border-[var(--border-color)]">
      <div className="flex items-center justify-between px-4 pt-3 xl:hidden">
        <span className={`text-[11px] tracking-[0.18em] text-primary-600 dark:text-primary-400 ${mono}`}>LINE {no}</span>
        {removeButton}
      </div>
      <div className={`grid grid-cols-2 sm:grid-cols-4 gap-x-2.5 gap-y-3 px-4 pt-2 pb-4 xl:px-5 xl:py-3 xl:items-start ${cols}`}>
        <span className={`hidden xl:flex h-[42px] items-center text-xs text-[var(--text-muted)] ${mono}`}>{no}</span>
        {children}
        <div className="hidden xl:flex h-[42px] items-center justify-end">{removeButton}</div>
      </div>
      {below}
    </div>
  );
}

export function LineCell({ label, className = '', children }: { label: string; className?: string; children: ReactNode }) {
  return (
    <div className={`min-w-0 ${className}`}>
      <span className={`block mb-1 xl:sr-only ${eyebrowCls}`}>{label}</span>
      {children}
    </div>
  );
}

type LineNumberInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { locked?: boolean };

/** Right-aligned mono number cell; `locked` = value owned by a pricing/discount plan. */
export const LineNumberInput = forwardRef<HTMLInputElement, LineNumberInputProps>(({ locked = false, className = '', ...props }, ref) => (
  <input
    ref={ref}
    type="number"
    readOnly={locked}
    className={`w-full h-[42px] px-2.5 rounded-lg border text-right text-sm tabular-nums ${mono} transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${
      locked
        ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed'
        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
    } ${className}`}
    {...props}
  />
));
LineNumberInput.displayName = 'LineNumberInput';

const stepBtnCls =
  'flex h-full w-8 shrink-0 items-center justify-center bg-gray-50 dark:bg-gray-700/60 text-gray-700 dark:text-gray-200 transition-colors cursor-pointer hover:bg-primary-100 hover:text-primary-700 dark:hover:bg-primary-900/50 dark:hover:text-primary-200 active:bg-primary-200 dark:active:bg-primary-900/70 focus-visible:outline-none focus-visible:bg-primary-100 dark:focus-visible:bg-primary-900/50 disabled:cursor-not-allowed disabled:text-gray-300 dark:disabled:text-gray-600 disabled:hover:bg-gray-50 dark:disabled:hover:bg-gray-700/60';

/**
 * Quantity cell (minimum 1): [−] value [+] in one bordered box, buttons always visible.
 * Works with react-hook-form's register(): the input stays uncontrolled and a
 * click steps the native value, then fires `input` so the form picks it up.
 */
export const QtyStepper = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>>(({ className = '', min = 1, step = 1, disabled, ...props }, ref) => {
  const inner = useRef<HTMLInputElement | null>(null);
  const [atMin, setAtMin] = useState(false);

  const sync = () => setAtMin(Number(inner.current?.value) <= Number(min));
  useEffect(sync);

  // Typed values below the minimum (or empty) snap back to it.
  const clamp = () => {
    const el = inner.current;
    if (!el || Number(el.value) >= Number(min)) return;
    // Native setter, so React's value tracker sees the change and fires onChange.
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set?.call(el, String(min));
    el.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const bump = (direction: 1 | -1) => {
    const el = inner.current;
    if (!el) return;
    if (direction === 1) el.stepUp();
    else el.stepDown();
    el.dispatchEvent(new Event('input', { bubbles: true }));
    sync();
  };

  return (
    <div
      className={`flex h-[42px] w-full items-stretch overflow-hidden rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-colors focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-500 ${className}`}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-label="Decrease quantity"
        disabled={disabled || atMin}
        onClick={() => bump(-1)}
        className={`${stepBtnCls} border-r border-gray-200 dark:border-gray-700`}
      >
        <Minus className="w-4 h-4" strokeWidth={2.5} />
      </button>
      <input
        ref={(node) => {
          inner.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        type="number"
        min={min}
        step={step}
        disabled={disabled}
        className={`min-w-0 flex-1 bg-transparent px-1 text-center text-sm tabular-nums text-gray-900 dark:text-gray-100 focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none ${mono}`}
        {...props}
        onChange={(e) => {
          props.onChange?.(e);
          sync();
        }}
        onBlur={(e) => {
          clamp();
          props.onBlur?.(e);
          sync();
        }}
      />
      <button type="button" tabIndex={-1} aria-label="Increase quantity" disabled={disabled} onClick={() => bump(1)} className={`${stepBtnCls} border-l border-gray-200 dark:border-gray-700`}>
        <Plus className="w-4 h-4" strokeWidth={2.5} />
      </button>
    </div>
  );
});
QtyStepper.displayName = 'QtyStepper';

/** Computed (read-only) figure: Net / Excise / Tax render as a disabled box like a locked input; Total (strong) stays bold text. */
export function LineFigure({ value, strong = false }: { value: number; strong?: boolean }) {
  const digits = useAuth().currency?.decimalDigits ?? 2;
  return (
    <div
      className={`h-[42px] flex items-center justify-end text-sm tabular-nums ${mono} ${
        strong
          ? 'font-semibold text-[var(--text-primary)]'
          : 'px-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 cursor-not-allowed'
      }`}
    >
      {money(value, digits)}
    </div>
  );
}

export function AddLineButton({ onClick, label = 'Add Item', disabled = false, disabledHint }: { onClick: () => void; label?: string; disabled?: boolean; disabledHint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={disabled ? disabledHint : undefined}
      className="flex w-full items-center justify-center gap-2 py-3 rounded-b-xl cursor-pointer text-sm font-medium text-primary-600 dark:text-primary-400 hover:bg-primary-50/60 dark:hover:bg-primary-900/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-transparent"
    >
      <Plus className="w-4 h-4" /> {disabled && disabledHint ? disabledHint : label}
    </button>
  );
}

// ── Totals ───────────────────────────────────────────────────────────────────

function ReceiptRow({ op, label, value, digits, mark, rule = false }: { op: string; label: string; value: number; digits: number; mark?: ReactNode; rule?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-3 ${rule ? 'pt-2.5 border-t border-dashed border-gray-300 dark:border-gray-600 font-medium' : ''}`}>
      <dt className="flex items-baseline gap-2 text-[var(--text-secondary)]">
        <span aria-hidden="true" className={`w-3 text-center text-[var(--text-muted)] ${mono}`}>
          {op}
        </span>
        {label}
      </dt>
      <dd className={`inline-flex items-center justify-end gap-1 tabular-nums text-[var(--text-primary)] ${mono}`}>
        {mark}
        {money(value, digits)}
      </dd>
    </div>
  );
}

// Currencies with a dedicated lucide glyph; others show the config symbol (e.g. د.إ, KD).
const CURRENCY_ICONS: Record<string, LucideIcon> = { USD: DollarSign, EUR: Euro, GBP: PoundSterling, INR: IndianRupee, JPY: JapaneseYen, CHF: SwissFranc, RUB: RussianRuble };

function CurrencyIcon({ code, symbol, size = 'lg' }: { code: string; symbol?: string | null; size?: 'sm' | 'lg' }) {
  const Icon = CURRENCY_ICONS[code] ?? (symbol ? null : Banknote);
  const lg = size === 'lg';
  return (
    <span aria-hidden="true" className={`shrink-0 ${lg ? 'text-primary-600 dark:text-primary-400' : 'text-[var(--text-muted)]'}`}>
      {Icon ? (
        <Icon className={lg ? 'w-8 h-8' : 'w-3.5 h-3.5'} strokeWidth={lg ? 2.25 : 2} />
      ) : (
        <span dir="auto" className={lg ? 'text-2xl font-semibold' : 'text-xs font-medium'}>
          {symbol}
        </span>
      )}
    </span>
  );
}

/** Banner above the lines when tax can't be fully calculated automatically. */
export function TaxNotice({
  supported,
  country,
  taxCode,
  missingRate,
  regionAssumed = false,
}: {
  supported: boolean;
  country: string | null;
  taxCode: string;
  missingRate: boolean;
  /** The customer's state/province isn't set or recognised (India, Canada). */
  regionAssumed?: boolean;
}) {
  if (supported && !missingRate && !regionAssumed) return null;
  const message = !supported
    ? `Automatic tax rates aren't available for ${country ?? 'this country'} yet. Only items with their own tax rate are taxed.`
    : missingRate
      ? `No ${taxCode} rate is set for some items. Add one in Settings › Taxes, or set the item's own tax rate.`
      : `The customer's state or province isn't set or recognised, so ${taxCode} is calculated as a sale within your own state or province. Update it on the customer.`;
  return (
    <div
      role="status"
      className="flex items-start gap-2 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3 text-sm text-amber-800 dark:text-amber-200"
    >
      <Info className="w-4 h-4 mt-0.5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

interface ReceiptRailProps {
  gross: number;
  discount: number;
  net: number;
  /** Main tax total (VAT/GST…). */
  vat: number;
  excise: number;
  /** Label of the main tax row, e.g. "VAT" / "GST". */
  taxLabel?: string;
  /** Rate shown beside the label when every line shares it, e.g. 5 -> "VAT 5%". */
  taxRate?: number | null;
  /** One row per part of a multi-part tax (CGST 9%, SGST 9%…), shown in place of the single tax row. */
  taxRows?: { label: string; value: number }[];
  /** Show the Excise row (an item has excise). */
  showExcise?: boolean;
  total: number;
  lineCount: number;
  currency?: string;
  /** RHF register() result for customer comments textarea. */
  noteRegister?: UseFormRegisterReturn;
  /** Save / Cancel actions. */
  children: ReactNode;
}

/** Totals as a till slip, in calculation order: Gross − Discount = Net + Excise + Tax. */
export function ReceiptRail({
  gross,
  discount,
  net,
  vat,
  excise,
  taxLabel = 'VAT',
  taxRate = null,
  taxRows = [],
  showExcise = false,
  total,
  lineCount,
  currency,
  noteRegister,
  children,
}: ReceiptRailProps) {
  const globalCurrency = useAuth().currency;
  const resolvedCurrency = currency || globalCurrency?.code || '';
  const digits = globalCurrency?.decimalDigits ?? 2;
  const symbol = currency ? null : globalCurrency?.symbol;
  const rowMark = resolvedCurrency ? <CurrencyIcon code={resolvedCurrency} symbol={symbol} size="sm" /> : undefined;
  return (
    <div className={`flex flex-col-reverse sm:flex-row sm:items-start gap-5 ${rise} ${RISE_DELAY[4]}`}>
      {noteRegister && (
        <div className="w-full sm:flex-1 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl p-5">
          <label className={`block mb-2 ${eyebrowCls}`}>Customer Comments</label>
          <textarea
            {...noteRegister}
            rows={4}
            placeholder="Add notes or comments…"
            className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] resize-none focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
          />
        </div>
      )}
      <div className="w-full sm:w-[40rem] shrink-0 drop-shadow-sm">
        <div className="receipt-edge bg-[var(--bg-card)] border-x border-b border-[var(--border-color)] rounded-b-xl px-6 pt-8 pb-6">
          <div className="flex items-baseline justify-between">
            <p className={eyebrowCls}>Summary</p>
            <p className={`text-[10px] tracking-[0.18em] text-[var(--text-muted)] ${mono}`}>
              {lineCount} {lineCount === 1 ? 'LINE' : 'LINES'}
            </p>
          </div>
          <dl className="mt-5 space-y-3 text-[15px]">
            <ReceiptRow op="" label="Gross Total" value={gross} digits={digits} mark={rowMark} />
            <ReceiptRow op="−" label="Discount" value={discount} digits={digits} mark={rowMark} />
            <ReceiptRow op="=" label="Net Total" value={net} digits={digits} mark={rowMark} rule />
            {(showExcise || excise > 0) && <ReceiptRow op="+" label="Excise" value={excise} digits={digits} mark={rowMark} />}
            {taxRows.length > 1 ? (
              taxRows.map((row) => <ReceiptRow key={row.label} op="+" label={row.label} value={row.value} digits={digits} mark={rowMark} />)
            ) : (
              <ReceiptRow op="+" label={taxRate != null ? `${taxLabel} ${taxRate}%` : taxLabel} value={vat} digits={digits} mark={rowMark} />
            )}
          </dl>
          <div className="mt-5 pt-5 border-t border-dashed border-gray-300 dark:border-gray-600 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="min-w-0">
              <p className={eyebrowCls}>Total{resolvedCurrency ? ` · ${resolvedCurrency}` : ''}</p>
              <p className="mt-1.5 flex items-center gap-2 font-display text-4xl font-bold tracking-tight tabular-nums text-[var(--text-primary)]">
                {resolvedCurrency && <CurrencyIcon code={resolvedCurrency} symbol={symbol} />}
                <span className="min-w-0 break-all">{money(total, digits)}</span>
              </p>
            </div>
            {/* Pages pass Save first; order-2 puts it on the right of Cancel */}
            <div className="grid grid-cols-2 gap-2.5 w-full sm:w-80 shrink-0 [&>*:first-child]:order-2">{children}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
