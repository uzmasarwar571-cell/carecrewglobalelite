import { useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Check, ChevronDown } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Form primitives with consistent labels, inline errors and focus
 * states. Errors are announced to screen readers and tied to the
 * input via aria-describedby — never a browser alert().
 */

const fieldShell =
  'w-full rounded-2xl border bg-white px-4 text-fluid-base text-charcoal-800 shadow-[0_1px_2px_rgba(11,42,35,0.04)] ' +
  'transition-[border-color,box-shadow] duration-200 placeholder:text-charcoal-400/70 ' +
  'focus:outline-none focus:ring-4 disabled:bg-cream-100 disabled:text-charcoal-400';

const okState =
  'border-emerald-900/12 focus:border-emerald-500 focus:ring-emerald-500/12';
const errState = 'border-red-400 focus:border-red-500 focus:ring-red-500/12';

function ErrorText({ id, message }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          id={id}
          role="alert"
          initial={{ opacity: 0, height: 0, marginTop: 0 }}
          animate={{ opacity: 1, height: 'auto', marginTop: 6 }}
          exit={{ opacity: 0, height: 0, marginTop: 0 }}
          transition={{ duration: 0.2 }}
          className="flex items-start gap-1.5 overflow-hidden text-fluid-xs font-medium text-red-600"
        >
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span>{message}</span>
        </motion.p>
      )}
    </AnimatePresence>
  );
}

export function Label({ htmlFor, children, optional, className }) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn('mb-1.5 block text-fluid-sm font-semibold text-emerald-900', className)}
    >
      {children}
      {optional && <span className="ml-1.5 font-normal text-charcoal-400">(optional)</span>}
    </label>
  );
}

export function Input({ label, error, optional, hint, className, id, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} optional={optional}>
          {label}
        </Label>
      )}
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={cn(error && errorId, hint && hintId) || undefined}
        className={cn(fieldShell, 'h-12', error ? errState : okState)}
        {...props}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-fluid-xs text-charcoal-400">
          {hint}
        </p>
      )}
      <ErrorText id={errorId} message={error} />
    </div>
  );
}

export function Textarea({ label, error, optional, hint, className, id, rows = 3, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} optional={optional}>
          {label}
        </Label>
      )}
      <textarea
        id={inputId}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(fieldShell, 'resize-y py-3 leading-relaxed', error ? errState : okState)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-fluid-xs text-charcoal-400">{hint}</p>}
      <ErrorText id={errorId} message={error} />
    </div>
  );
}

export function Select({ label, error, optional, options = [], placeholder, className, id, ...props }) {
  const autoId = useId();
  const inputId = id || autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={className}>
      {label && (
        <Label htmlFor={inputId} optional={optional}>
          {label}
        </Label>
      )}
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            fieldShell,
            'h-12 cursor-pointer appearance-none pr-11',
            error ? errState : okState
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => {
            const value = typeof option === 'string' ? option : option.value;
            const text = typeof option === 'string' ? option : option.label;
            return (
              <option key={value} value={value}>
                {text}
              </option>
            );
          })}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-charcoal-400"
          aria-hidden="true"
        />
      </div>
      <ErrorText id={errorId} message={error} />
    </div>
  );
}

/**
 * Segmented choice group — used for full-time/part-time, live-in/out
 * and similar binary-ish picks. Rendered as real radios for a11y.
 */
export function ChoiceGroup({ label, name, value, onChange, options, error, columns = 2, hint }) {
  const groupId = useId();
  const errorId = `${groupId}-error`;

  return (
    <fieldset aria-describedby={error ? errorId : undefined}>
      {label && (
        <legend className="mb-2 text-fluid-sm font-semibold text-emerald-900">{label}</legend>
      )}
      {hint && <p className="-mt-1 mb-2 text-fluid-xs text-charcoal-400">{hint}</p>}
      <div
        className={cn(
          'grid gap-2',
          columns === 2 && 'grid-cols-1 xs:grid-cols-2',
          columns === 3 && 'grid-cols-1 xs:grid-cols-2 sm:grid-cols-3'
        )}
      >
        {options.map((option) => {
          const optValue = typeof option === 'string' ? option : option.value;
          const optLabel = typeof option === 'string' ? option : option.label;
          const checked = value === optValue;
          return (
            <label
              key={optValue}
              className={cn(
                'relative flex cursor-pointer items-center gap-2.5 rounded-2xl border px-4 py-3 text-fluid-sm transition-all duration-200 ease-premium',
                'focus-within:ring-4 focus-within:ring-emerald-500/12',
                checked
                  ? 'border-emerald-600 bg-emerald-50 font-semibold text-emerald-900 shadow-soft'
                  : 'border-emerald-900/12 bg-white text-charcoal-600 hover:border-emerald-600/35 hover:bg-emerald-50/40'
              )}
            >
              <input
                type="radio"
                name={name}
                value={optValue}
                checked={checked}
                onChange={() => onChange(optValue)}
                className="sr-only"
              />
              <span
                className={cn(
                  'grid h-5 w-5 shrink-0 place-items-center rounded-full border transition-colors duration-200',
                  checked ? 'border-emerald-700 bg-emerald-700' : 'border-charcoal-400/40 bg-white'
                )}
                aria-hidden="true"
              >
                {checked && <Check className="h-3 w-3 text-cream-50" strokeWidth={3} />}
              </span>
              <span className="min-w-0">{optLabel}</span>
            </label>
          );
        })}
      </div>
      <ErrorText id={errorId} message={error} />
    </fieldset>
  );
}

/** Multi-select chips — used for "required duties". */
export function ChipGroup({ label, values = [], onToggle, options, hint }) {
  return (
    <fieldset>
      {label && (
        <legend className="mb-2 text-fluid-sm font-semibold text-emerald-900">{label}</legend>
      )}
      {hint && <p className="-mt-1 mb-2.5 text-fluid-xs text-charcoal-400">{hint}</p>}
      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const checked = values.includes(option);
          return (
            <label
              key={option}
              className={cn(
                'cursor-pointer rounded-pill border px-3.5 py-2 text-fluid-sm transition-all duration-200 ease-premium',
                'focus-within:ring-4 focus-within:ring-emerald-500/12',
                checked
                  ? 'border-emerald-600 bg-emerald-700 font-semibold text-cream-50'
                  : 'border-emerald-900/12 bg-white text-charcoal-600 hover:border-emerald-600/35 hover:bg-emerald-50'
              )}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(option)}
                className="sr-only"
              />
              {option}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
