import { forwardRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';
import { usePrefersReducedMotion } from '../../hooks';

/**
 * The one button in the system.
 * Renders as <button>, <a> or a motion element depending on props —
 * so every CTA on the site shares the same states and sizing.
 */

const base =
  'group relative inline-flex items-center justify-center gap-2 rounded-pill font-semibold ' +
  'transition-[background-color,color,box-shadow,border-color,transform] duration-300 ease-premium ' +
  'disabled:cursor-not-allowed disabled:opacity-55 select-none whitespace-nowrap';

const variants = {
  primary:
    'bg-emerald-700 text-cream-50 shadow-soft hover:bg-emerald-800 hover:shadow-lift active:bg-emerald-900',
  gold: 'bg-gold-400 text-emerald-950 shadow-soft hover:bg-gold-300 hover:shadow-lift active:bg-gold-500',
  outline:
    'border border-emerald-900/15 bg-transparent text-emerald-900 hover:border-emerald-700/40 hover:bg-emerald-50',
  light:
    'bg-cream-50 text-emerald-900 shadow-soft hover:bg-white hover:shadow-lift',
  ghost: 'bg-transparent text-emerald-800 hover:bg-emerald-900/[0.06]',
  // Ghost on dark backgrounds. A separate variant rather than a
  // className override — competing Tailwind colour utilities resolve by
  // stylesheet order, not source order, so the override is a coin flip.
  ghostLight: 'bg-transparent text-cream-100/85 hover:bg-cream-50/10 hover:text-cream-50',
  onDark:
    'border border-cream-50/25 bg-cream-50/[0.08] text-cream-50 backdrop-blur-sm hover:border-cream-50/50 hover:bg-cream-50/[0.16]',
  whatsapp: 'bg-whatsapp text-white shadow-soft hover:brightness-95 hover:shadow-lift',
};

const sizes = {
  sm: 'h-10 px-4 text-fluid-sm',
  md: 'h-12 px-5 text-fluid-sm sm:px-6',
  lg: 'h-[52px] px-6 text-fluid-base sm:h-14 sm:px-8',
};

export const Button = forwardRef(function Button(
  {
    as,
    variant = 'primary',
    size = 'md',
    className,
    children,
    fullWidth = false,
    icon: Icon,
    iconPosition = 'right',
    loading = false,
    disabled,
    ...props
  },
  ref
) {
  const prefersReduced = usePrefersReducedMotion();
  const Component = as || 'button';
  // Memoised: motion() returns a new component each call, which would
  // remount the button (and drop focus) on every render.
  const MotionComponent = useMemo(
    () => (Component === 'button' ? motion.button : Component === 'a' ? motion.a : motion(Component)),
    [Component]
  );

  const isDisabled = disabled || loading;

  return (
    <MotionComponent
      ref={ref}
      className={cn(
        base,
        variants[variant] ?? variants.primary,
        sizes[size] ?? sizes.md,
        fullWidth && 'w-full',
        className
      )}
      whileHover={prefersReduced || isDisabled ? undefined : { y: -2 }}
      whileTap={prefersReduced || isDisabled ? undefined : { y: 0, scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 420, damping: 28 }}
      disabled={Component === 'button' ? isDisabled : undefined}
      aria-busy={loading || undefined}
      aria-disabled={Component !== 'button' && isDisabled ? true : undefined}
      {...props}
    >
      {loading && (
        <span
          className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {!loading && Icon && iconPosition === 'left' && (
        <Icon className="h-[1.05em] w-[1.05em] shrink-0" aria-hidden="true" />
      )}
      <span className="truncate">{children}</span>
      {!loading && Icon && iconPosition === 'right' && (
        <Icon
          className="h-[1.05em] w-[1.05em] shrink-0 transition-transform duration-300 ease-premium group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      )}
    </MotionComponent>
  );
});

export default Button;
