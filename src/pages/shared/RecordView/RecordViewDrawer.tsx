import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ArrowLeft, ChevronDown, EllipsisVertical, Keyboard, Loader2, type LucideIcon } from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { RecordRail, type RecordRailProps } from './RecordRail';

export interface RecordMenuItem {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
}

export interface RecordAction extends RecordMenuItem {
  icon: LucideIcon;
  /** Running (e.g. building a PDF): the button shows a spinner and ignores clicks. */
  busy?: boolean;
  /** Choices under the chevron half of the button. */
  menu?: RecordMenuItem[];
}

export interface RecordTab {
  key: string;
  label: string;
  icon: LucideIcon;
  content: ReactNode;
}

interface RecordViewDrawerProps<T> {
  isOpen: boolean;
  onClose: () => void;
  /** Record name in the header; a skeleton stands in while it's null. */
  title?: string | null;
  rail: RecordRailProps<T>;
  action?: RecordAction | null;
  /** Kebab menu items (Edit, …); the kebab hides when there are none. */
  menu?: RecordMenuItem[];
  tabs: RecordTab[];
}

const SHORTCUTS = [
  { keys: ['/'], label: 'Search' },
  { keys: ['↑', '↓'], label: 'Previous / next record' },
  { keys: ['Esc'], label: 'Close' },
];

const box = 'rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] shadow-[0_1px_2px_rgb(0_0_0/0.04)]';
const popover = 'absolute right-0 top-full z-20 rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-bg)] py-[3px] shadow-[0_4px_12px_rgb(0_0_0/0.12)]';
const menuItem = 'flex h-10 w-full cursor-pointer items-center gap-2 px-2.5 text-left text-[15px] text-[var(--rv-ink)] hover:bg-[var(--rv-hover)]';

function Menu({ items, onPick }: { items: RecordMenuItem[]; onPick: () => void }) {
  return (
    <div role="menu" className={`${popover} w-[181px]`}>
      {items.map(({ label, icon: Icon, onClick }) => (
        <button
          key={label}
          type="button"
          role="menuitem"
          onClick={() => {
            onPick();
            onClick();
          }}
          className={menuItem}
        >
          {Icon && <Icon className="h-5 w-5 text-[var(--rv-icon)]" />}
          {label}
        </button>
      ))}
    </div>
  );
}

/**
 * Full-screen record view (customer or document): searchable record list on the left; on the right the record's header with its
 * main action (split button), kebab menu and keyboard-shortcut help, then tabs. Esc closes an open menu first, then the view.
 */
export function RecordViewDrawer<T>({ isOpen, onClose, title, rail, action, menu = [], tabs }: RecordViewDrawerProps<T>) {
  const [tabKey, setTabKey] = useState(tabs[0]?.key);
  // Every time the view opens it starts on the first tab.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) setTabKey(tabs[0]?.key);
  }
  const [open, setOpen] = useState<'action' | 'menu' | 'keys' | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const activeTab = tabs.find((t) => t.key === tabKey) ?? tabs[0];

  useEffect(() => {
    if (!isOpen) return undefined;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (open) setOpen(null);
      else if (document.activeElement === searchRef.current && searchRef.current?.value) return;
      else onClose();
    };
    const onDown = (e: MouseEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) setOpen(null);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, open, onClose]);

  if (!isOpen) return null;
  const toggle = (which: 'action' | 'menu' | 'keys') => setOpen((current) => (current === which ? null : which));
  const iconBtn = `${box} flex h-10 cursor-pointer items-center justify-center text-[var(--rv-icon)] transition-colors hover:bg-[var(--rv-hover)]`;
  const ActionIcon = action?.busy ? Loader2 : action?.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title ?? 'Record'}
      className="record-view fixed inset-0 z-50 flex bg-[var(--rv-bg)] font-[family-name:var(--rv-font)] text-[15px]/5 text-[var(--rv-text)]"
    >
      <RecordRail {...rail} searchRef={searchRef} />
      <section className="flex min-w-0 flex-1 flex-col pl-[17px] pr-[11px] pt-[10px]">
        <div ref={headerRef} className="flex h-10 shrink-0 items-center gap-4">
          <button type="button" onClick={onClose} aria-label="Back" className="-ml-px shrink-0 cursor-pointer rounded-[4px] text-[var(--rv-ink)] hover:bg-[var(--rv-hover)]">
            <ArrowLeft className="h-[26px] w-[26px]" />
          </button>
          {title ? (
            <h2 title={title} className="min-w-0 truncate text-[21px] font-semibold leading-7 text-[var(--rv-ink)]">
              {title}
            </h2>
          ) : (
            <Skeleton className="h-6 w-44" />
          )}
          <div className="ml-auto flex shrink-0 items-center gap-4">
            {action && ActionIcon && (
              <div className={`relative flex h-10 ${box}`}>
                <button
                  type="button"
                  onClick={action.onClick}
                  disabled={action.busy}
                  className={`flex cursor-pointer items-center gap-0.5 rounded-l-[4px] pl-[7px] text-[var(--rv-secondary)] transition-colors hover:bg-[var(--rv-hover)] disabled:cursor-wait ${action.menu?.length ? 'pr-[34px]' : 'pr-3'}`}
                >
                  <ActionIcon className={`h-[18px] w-[18px] text-[var(--rv-ink)] ${action.busy ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
                {action.menu && action.menu.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => toggle('action')}
                      aria-haspopup="menu"
                      aria-expanded={open === 'action'}
                      aria-label="More actions"
                      className="flex w-[34px] cursor-pointer items-center justify-center rounded-r-[4px] bg-[var(--rv-tint)] text-[var(--rv-ink)] hover:bg-[var(--rv-hover)]"
                    >
                      <ChevronDown className="h-[18px] w-[18px]" />
                    </button>
                    {open === 'action' && <Menu items={action.menu} onPick={() => setOpen(null)} />}
                  </>
                )}
              </div>
            )}
            {action && <span className="ml-0.5 h-[38px] w-px bg-[var(--rv-line)]" aria-hidden />}
            {menu.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => toggle('menu')}
                  aria-haspopup="menu"
                  aria-expanded={open === 'menu'}
                  aria-label="More options"
                  className={`${iconBtn} w-10 ${open === 'menu' ? 'border-[var(--rv-accent-border)] ring-2 ring-[var(--rv-ring)]' : ''}`}
                >
                  <EllipsisVertical className="h-6 w-6" />
                </button>
                {open === 'menu' && <Menu items={menu} onPick={() => setOpen(null)} />}
              </div>
            )}
            <div className="relative ml-px hidden sm:block">
              <button type="button" onClick={() => toggle('keys')} aria-expanded={open === 'keys'} aria-label="Keyboard shortcuts" className={`${iconBtn} w-9`}>
                <Keyboard className="h-4 w-4" />
              </button>
              {open === 'keys' && (
                <div className={`${popover} mt-px w-64 px-[13px] py-2.5`}>
                  <p className="pb-1.5 text-xs font-semibold uppercase tracking-wide text-[var(--rv-muted)]">Keyboard shortcuts</p>
                  {SHORTCUTS.map((s) => (
                    <div key={s.label} className="flex h-8 items-center justify-between text-[var(--rv-ink)]">
                      {s.label}
                      <span className="flex gap-1">
                        {s.keys.map((k) => (
                          <kbd key={k} className="min-w-6 rounded-[4px] border border-[var(--rv-border)] bg-[var(--rv-tint)] px-1.5 text-center text-xs leading-5 text-[var(--rv-secondary)]">
                            {k}
                          </kbd>
                        ))}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div role="tablist" className="mt-[22px] flex shrink-0 gap-[17px] overflow-x-auto border-b border-[var(--rv-line)]">
          {tabs.map(({ key, label, icon: Icon }) => {
            const active = key === activeTab?.key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setTabKey(key)}
                className={`relative flex shrink-0 cursor-pointer items-center gap-[5px] whitespace-nowrap pb-[9px] leading-5 transition-colors ${active ? 'font-semibold text-[var(--rv-accent)]' : 'text-[var(--rv-secondary)] hover:text-[var(--rv-ink)]'}`}
              >
                <Icon className="h-4 w-4" />
                {label}
                {active && <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-t-sm bg-[var(--rv-accent)]" />}
              </button>
            );
          })}
        </div>
        <div role="tabpanel" className="min-h-0 flex-1 overflow-y-auto pb-6">
          {activeTab?.content}
        </div>
      </section>
    </div>
  );
}
