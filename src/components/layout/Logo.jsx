import { cn } from '../../utils/cn';

/**
 * Wordmark + monogram. Pure SVG/CSS so it stays crisp at any size and
 * costs nothing to load.
 */
export function Logo({ tone = 'dark', className, onClick, compact = false }) {
  const isLight = tone === 'light';

  return (
    <a
      href="#home"
      onClick={onClick}
      aria-label="Care Crew Maid — go to top"
      className={cn('group flex items-center gap-2.5', className)}
    >
      {/* Monogram */}
      <span
        className={cn(
          'relative grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-transform duration-500 ease-premium group-hover:rotate-[-6deg] sm:h-10 sm:w-10',
          isLight ? 'bg-cream-50' : 'bg-emerald-800'
        )}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-[22px] sm:w-[22px]" aria-hidden="true">
          {/* House outline with a heart cut into it. */}
          <path
            d="M3.6 10.4 12 3.6l8.4 6.8"
            fill="none"
            stroke={isLight ? '#154C3E' : '#DCC17C'}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M5.6 11.6v7.2a1.2 1.2 0 0 0 1.2 1.2h10.4a1.2 1.2 0 0 0 1.2-1.2v-7.2"
            fill="none"
            stroke={isLight ? '#154C3E' : '#FAF6EF'}
            strokeWidth="1.9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 17.4c-1.9-1.35-3-2.35-3-3.55a1.55 1.55 0 0 1 3-.6 1.55 1.55 0 0 1 3 .6c0 1.2-1.1 2.2-3 3.55Z"
            fill={isLight ? '#154C3E' : '#DCC17C'}
          />
        </svg>
      </span>

      {/* Wordmark */}
      <span className={cn('flex min-w-0 flex-col leading-none', compact && 'hidden xs:flex')}>
        <span
          className={cn(
            'font-display text-[15px] font-semibold tracking-tight sm:text-[17px]',
            isLight ? 'text-cream-50' : 'text-emerald-900'
          )}
        >
          Care Crew <span className={isLight ? 'text-gold-300' : 'text-emerald-600'}>Maid</span>
        </span>
        <span
          className={cn(
            'mt-1 hidden text-[9.5px] font-semibold uppercase tracking-[0.22em] sm:block',
            isLight ? 'text-cream-200/60' : 'text-charcoal-400'
          )}
        >
          Domestic Staff Services
        </span>
      </span>
    </a>
  );
}

export default Logo;
