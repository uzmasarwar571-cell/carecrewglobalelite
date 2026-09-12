import { cn } from '../../utils/cn';
import { Reveal } from './Reveal';

/**
 * Shared section header: small gold eyebrow, display heading, and an
 * optional supporting line. Using one component everywhere is what
 * keeps the vertical rhythm of the page consistent.
 */
export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'center',
  tone = 'light',
  className,
  as: Tag = 'h2',
  id,
}) {
  const isDark = tone === 'dark';

  return (
    <div
      className={cn(
        'max-w-2xl',
        align === 'center' && 'mx-auto text-center',
        align === 'left' && 'text-left',
        className
      )}
    >
      {eyebrow && (
        <Reveal
          as="p"
          className={cn(
            'mb-3 inline-flex items-center gap-2 text-fluid-xs font-bold uppercase tracking-[0.16em]',
            isDark ? 'text-gold-300' : 'text-emerald-600'
          )}
        >
          <span
            className={cn(
              'h-px w-6',
              isDark ? 'bg-gold-300/60' : 'bg-emerald-600/40'
            )}
            aria-hidden="true"
          />
          {eyebrow}
        </Reveal>
      )}

      <Reveal as={Tag} id={id} delay={0.05} className={cn('text-fluid-h2 font-semibold', isDark && 'text-cream-50')}>
        {title}
      </Reveal>

      {description && (
        <Reveal
          as="p"
          delay={0.1}
          className={cn(
            'mt-4 text-fluid-lead',
            isDark ? 'text-cream-200/75' : 'text-charcoal-500'
          )}
        >
          {description}
        </Reveal>
      )}
    </div>
  );
}

export default SectionHeading;
