import { Skeleton } from './Skeleton';

type Control = 'input' | 'date' | 'select' | 'textarea' | 'textarea-sm' | 'code' | 'toggle' | 'file';

/** A titled block (e.g. a "Partner Function" section): a tab-style heading, then its own stack of fields. */
export interface FormSkeletonGroup {
    group: FormSkeletonField[];
}

/**
 * One entry per row of the real form, top to bottom:
 *  - 'input' / 'textarea' — a labelled field (heights match the real controls),
 *  - 'date'               — a date picker field (label sits flush on the control, no gap),
 *  - 'textarea-sm'        — a 3-row textarea with 20px line height (78px),
 *  - 'select'             — a native <select> (3px shorter than an input),
 *  - 'code'               — an input followed by the code-settings gear button,
 *  - 'file'               — a native file input (taller than a text input),
 *  - 'toggle'             — a bordered on/off switch box (no label above it),
 *  - 'check'              — a checkbox with its label,
 *  - 'upload'             — an image heading plus a dashed drop zone,
 *  - 'section'            — a section heading,
 *  - { group: [...] }     — a titled block with its own field stack,
 *  - [a, b, …]            — fields sharing one row (equal columns).
 */
export type FormSkeletonField = Control | 'section' | 'check' | 'upload' | Control[] | FormSkeletonGroup;

// Literal classes so Tailwind can see them.
// A lone field in a row keeps half width (a 2-column row with one cell filled, like "Volume").
const COLS: Record<number, string> = { 1: 'grid-cols-2', 2: 'grid-cols-2', 3: 'grid-cols-3' };
const GAPS = { 4: 'space-y-4', 5: 'space-y-5' } as const;

const CONTROL_HEIGHT: Record<Exclude<Control, 'code' | 'toggle'>, string> = {
    input: 'h-[42px]',
    date: 'h-[42px]',
    select: 'h-[39px]',
    textarea: 'h-[90px]',
    'textarea-sm': 'h-[78px]',
    file: 'h-[48px]',
};

function Field({ control }: { control: Control }) {
    if (control === 'toggle') return <Skeleton className="h-[50px] w-full rounded-lg" />;
    return (
        <div>
            <div className={`flex h-5 items-center ${control === 'date' ? '' : 'mb-1'}`}>
                <Skeleton className="h-3.5 w-24" />
            </div>
            {control === 'code' ? (
                <div className="flex gap-2">
                    <Skeleton className="h-[42px] flex-1 rounded-lg" />
                    <Skeleton className="h-[42px] w-[42px] shrink-0 rounded-lg" />
                </div>
            ) : (
                <Skeleton className={`w-full rounded-lg ${CONTROL_HEIGHT[control]}`} />
            )}
        </div>
    );
}

function renderFields(fields: FormSkeletonField[]) {
    return fields.map((field, i) => {
        if (field === 'check') {
            return (
                <div key={i} className="flex items-start gap-2">
                    <Skeleton className="mt-0.5 h-4 w-4 shrink-0" />
                    {/* A 20px label line plus a two-line 16px hint, as in the real checkbox row (52px). */}
                    <div className="flex-1">
                        <div className="flex h-5 items-center">
                            <Skeleton className="h-3.5 w-3/4" />
                        </div>
                        <div className="flex h-4 items-center">
                            <Skeleton className="h-3 w-full" />
                        </div>
                        <div className="flex h-4 items-center">
                            <Skeleton className="h-3 w-2/3" />
                        </div>
                    </div>
                </div>
            );
        }
        if (field === 'upload') {
            return (
                <div key={i} className="space-y-4">
                    <div className="mb-2 flex h-7 items-center">
                        <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-32 w-full rounded-lg" />
                </div>
            );
        }
        if (field === 'section') {
            // A 25px heading with its own mb-3 — it replaces the stack's 16px gap, so the first field sits 12px below.
            return (
                <div key={i} className="mb-3 flex h-[25px] items-center">
                    <Skeleton className="h-3.5 w-32" />
                </div>
            );
        }
        if (Array.isArray(field)) {
            return (
                <div key={i} className={`grid gap-4 ${COLS[field.length] ?? 'grid-cols-2'}`}>
                    {field.map((control, j) => (
                        <Field key={j} control={control} />
                    ))}
                </div>
            );
        }
        if (typeof field === 'object') {
            return (
                <div key={i}>
                    <div className="mb-6 border-b border-transparent">
                        <div className="flex h-[42px] items-center">
                            <Skeleton className="h-3.5 w-36" />
                        </div>
                    </div>
                    <div className="space-y-4">{renderFields(field.group)}</div>
                </div>
            );
        }
        return <Field key={i} control={field} />;
    });
}

interface FormSkeletonProps {
    fields: FormSkeletonField[];
    /** Vertical gap between rows, in Tailwind steps (4 = 16px, 5 = 20px) — match the real form's `space-y-N`. */
    gap?: keyof typeof GAPS;
    /** No outer padding, for a form whose padding lives on a wrapper the skeleton also draws. */
    bare?: boolean;
}

/** Body of an edit drawer's form while its record loads — same padding and spacing as the real form. */
export function FormSkeleton({ fields, gap = 4, bare = false }: FormSkeletonProps) {
    return <div className={`${GAPS[gap]} ${bare ? '' : 'p-6'}`}>{renderFields(fields)}</div>;
}
