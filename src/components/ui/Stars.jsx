import { Star } from 'lucide-react';
import { cn } from '../../utils/cn';

/** Star rating. The numeric value is exposed to screen readers. */
export function Stars({ rating = 5, className, size = 'h-4 w-4' }) {
  return (
    <div className={cn('flex items-center gap-0.5', className)} aria-label={`${rating} out of 5`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          className={cn(
            size,
            index < rating ? 'fill-gold-400 text-gold-400' : 'fill-transparent text-charcoal-400/35'
          )}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

export default Stars;
