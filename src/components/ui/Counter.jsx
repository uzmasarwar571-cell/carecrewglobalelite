import { useRef } from 'react';
import { useInView } from 'framer-motion';
import { useCountUp } from '../../hooks';
import { cn } from '../../utils/cn';

/**
 * Animated statistic. Counts up once, when it scrolls into view.
 * `raw` short-circuits the animation for values like "24/7" that are
 * not really numbers.
 */
export function Counter({ value, suffix = '', label, raw, className }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.5 });
  const count = useCountUp(value, inView && !raw);

  const formatted = raw || `${count.toLocaleString('en-US')}${suffix}`;

  return (
    <div ref={ref} className={cn('text-center', className)}>
      <div className="font-display text-fluid-stat font-semibold text-emerald-800 tabular-nums">
        {formatted}
      </div>
      <div className="mt-1.5 text-fluid-sm font-medium text-charcoal-500">{label}</div>
    </div>
  );
}

export default Counter;
