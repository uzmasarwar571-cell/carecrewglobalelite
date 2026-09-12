/**
 * ─────────────────────────────────────────────────────────────
 *  ADMIN UI PRIMITIVES
 * ─────────────────────────────────────────────────────────────
 *  A small, deliberate component set. The admin intentionally does
 *  NOT reuse the public site's components: those are themeable by
 *  the very panel you would be editing them from, so a bad theme
 *  could make the controls that fix it unreadable.
 *
 *  Everything here is built on Tailwind's stock slate/indigo scale
 *  and supports the dark-mode switch in the top bar.
 * ─────────────────────────────────────────────────────────────
 */

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

/* ── Button ────────────────────────────────────────────────── */

const buttonVariants = {
  primary:
    'bg-indigo-600 text-white shadow-sm hover:bg-indigo-500 active:bg-indigo-700 ' +
    'disabled:bg-indigo-600/50',
  secondary:
    'border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 ' +
    'dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700',
  ghost:
    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100',
  danger: 'bg-rose-600 text-white shadow-sm hover:bg-rose-500 active:bg-rose-700',
  subtle:
    'bg-slate-100 text-slate-700 hover:bg-slate-200 ' +
    'dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700',
};

const buttonSizes = {
  xs: 'h-7 gap-1.5 px-2.5 text-xs',
  sm: 'h-8 gap-1.5 px-3 text-[13px]',
  md: 'h-9 gap-2 px-3.5 text-sm',
  lg: 'h-11 gap-2 px-5 text-sm',
};

export const Button = forwardRef(function Button(
  {
    as: Component = 'button',
    variant = 'secondary',
    size = 'md',
    icon: Icon,
    iconRight: IconRight,
    loading = false,
    disabled,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <Component
      ref={ref}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center rounded-lg font-medium',
        'transition-colors duration-150 focus-visible:outline focus-visible:outline-2',
        'focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
        'disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariants[variant] ?? buttonVariants.secondary,
        buttonSizes[size] ?? buttonSizes.md,
        className
      )}
      {...props}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
      ) : (
        Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
      )}
      {children}
      {IconRight && !loading && <IconRight className="h-4 w-4 shrink-0" aria-hidden="true" />}
    </Component>
  );
});

/** Square icon-only button. `label` becomes the accessible name. */
export const IconButton = forwardRef(function IconButton(
  { icon: Icon, label, size = 'md', variant = 'ghost', className, ...props },
  ref
) {
  const box = { xs: 'h-7 w-7', sm: 'h-8 w-8', md: 'h-9 w-9', lg: 'h-10 w-10' }[size] || 'h-9 w-9';
  return (
    <Button
      ref={ref}
      variant={variant}
      aria-label={label}
      title={label}
      className={cn('!px-0', box, className)}
      {...props}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
    </Button>
  );
});

/* ── Surfaces ──────────────────────────────────────────────── */

export function Card({ className, children, ...props }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm',
        'dark:border-slate-800 dark:bg-slate-900',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, description, actions, className, children }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 border-b border-slate-200 px-5 py-4',
        'dark:border-slate-800',
        className
      )}
    >
      <div className="min-w-0">
        {title && (
          <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
        )}
        {description && (
          <p className="mt-0.5 text-[13px] text-slate-500 dark:text-slate-400">{description}</p>
        )}
        {children}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export const CardBody = ({ className, children }) => (
  <div className={cn('p-5', className)}>{children}</div>
);

/* ── Form controls ─────────────────────────────────────────── */

const controlBase =
  'w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 ' +
  'placeholder:text-slate-400 shadow-sm transition-colors ' +
  'focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ' +
  'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ' +
  'dark:border-slate-700 dark:bg-slate-950/40 dark:text-slate-100 dark:placeholder:text-slate-500 ' +
  'dark:focus:border-indigo-500 dark:disabled:bg-slate-800';

export const Input = forwardRef(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(controlBase, 'h-9', invalid && 'border-rose-400 focus:border-rose-500', className)}
      aria-invalid={invalid || undefined}
      {...props}
    />
  );
});

export const Textarea = forwardRef(function Textarea({ className, rows = 4, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(controlBase, 'resize-y py-2 leading-relaxed', className)}
      {...props}
    />
  );
});

export const Select = forwardRef(function Select({ className, children, ...props }, ref) {
  return (
    <select ref={ref} className={cn(controlBase, 'h-9 pr-8', className)} {...props}>
      {children}
    </select>
  );
});

/** Label + optional hint + error, wrapped around any control. */
export function Field({ label, hint, error, required, htmlFor, className, children }) {
  return (
    <div className={cn('min-w-0', className)}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="mb-1.5 block text-[13px] font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">{error}</p>
      ) : (
        hint && <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  );
}

/** Accessible switch. Controlled only — pass `checked` and `onChange`. */
export function Toggle({ checked, onChange, label, description, disabled, id }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        {label && (
          <label
            htmlFor={id}
            className="block text-[13px] font-medium text-slate-800 dark:text-slate-200"
          >
            {label}
          </label>
        )}
        {description && (
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{description}</p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors duration-200',
          'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500',
          'disabled:cursor-not-allowed disabled:opacity-50',
          checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform duration-200',
            checked ? 'translate-x-[18px]' : 'translate-x-0.5'
          )}
        />
      </button>
    </div>
  );
}

/* ── Feedback ──────────────────────────────────────────────── */

const badgeTones = {
  slate: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  blue: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
  green: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
  amber: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  rose: 'bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-300',
  violet: 'bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300',
  indigo: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300',
};

export function Badge({ tone = 'slate', className, children, dot = false }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium',
        badgeTones[tone] ?? badgeTones.slate,
        className
      )}
    >
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />}
      {children}
    </span>
  );
}

export function Spinner({ className }) {
  return (
    <Loader2
      className={cn('h-5 w-5 animate-spin text-slate-400', className)}
      aria-hidden="true"
    />
  );
}

export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      {Icon && (
        <span className="mb-4 grid h-12 w-12 place-items-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
      )}
      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-[13px] text-slate-500 dark:text-slate-400">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

/** Full-panel loading state that keeps layout height stable. */
export function LoadingPanel({ label = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center gap-3 px-6 py-16 text-sm text-slate-500 dark:text-slate-400">
      <Spinner />
      {label}
    </div>
  );
}

export function Skeleton({ className }) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-slate-200 dark:bg-slate-800', className)}
      aria-hidden="true"
    />
  );
}

/* ── Layout helpers ────────────────────────────────────────── */

export function PageHeader({ title, description, actions, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0">
        {breadcrumb && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {breadcrumb}
          </p>
        )}
        <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-2xl text-[13px] text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, className }) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800',
        className
      )}
      role="tablist"
    >
      {tabs.map((tab) => {
        const active = tab.id === value;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-[13px] font-medium transition-colors',
              active
                ? 'border-indigo-600 text-indigo-700 dark:border-indigo-400 dark:text-indigo-300'
                : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
            )}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={cn(
                  'ml-2 rounded-full px-1.5 py-0.5 text-[11px] font-semibold',
                  active
                    ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300'
                    : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
