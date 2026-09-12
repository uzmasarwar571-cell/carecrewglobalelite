import { trustBadges } from '../data/content';
import { RevealGroup, RevealItem } from '../components/ui/Reveal';

/**
 * Thin reassurance strip directly under the hero — the first thing a
 * sceptical visitor sees after the headline.
 * Scrolls horizontally on very narrow screens rather than wrapping
 * into an awkward two-line grid.
 */
export function TrustBar() {
  return (
    <section aria-label="Our commitments" className="relative z-10 -mt-px border-b border-emerald-900/[0.07] bg-cream-50">
      <div className="container">
        <RevealGroup
          className="no-scrollbar -mx-gutter flex snap-rail items-stretch gap-3 overflow-x-auto px-gutter py-5 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 sm:py-7 lg:grid-cols-4"
          staggerChildren={0.07}
        >
          {trustBadges.map((badge) => (
            <RevealItem
              key={badge.label}
              className="flex min-w-[220px] shrink-0 items-center gap-3 rounded-2xl bg-cream-100/70 px-4 py-3.5 sm:min-w-0 sm:bg-transparent sm:px-0 sm:py-0"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-emerald-700/[0.08] text-emerald-700">
                <badge.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span className="text-fluid-sm font-semibold text-emerald-900">{badge.label}</span>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}

export default TrustBar;
