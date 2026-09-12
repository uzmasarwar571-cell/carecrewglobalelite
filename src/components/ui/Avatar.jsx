import { cn } from '../../utils/cn';
import { SmartImage } from './SmartImage';

/**
 * Staff avatar.
 *
 * When a real photo exists it is used. Otherwise we render a designed
 * monogram rather than a stock photo of an unrelated model — it looks
 * intentional, and it does not misrepresent who will arrive at the
 * customer's door.
 */

// Deterministic palette pick, so a given person always gets the same tile.
const palettes = [
  'from-emerald-700 to-emerald-900',
  'from-emerald-600 to-emerald-800',
  'from-[#3B5D50] to-emerald-900',
  'from-[#4A6357] to-[#22392F]',
  'from-emerald-800 to-[#123028]',
];

const hashIndex = (text, length) => {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) hash = (hash * 31 + text.charCodeAt(i)) % 9973;
  return hash % length;
};

export function Avatar({ name = '', photo, role, size = 'md', className, ratio }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  const palette = palettes[hashIndex(name || 'care', palettes.length)];

  const sizes = {
    sm: 'h-11 w-11 text-fluid-sm',
    md: 'h-14 w-14 text-fluid-h4',
    lg: 'h-20 w-20 text-fluid-h3',
  };

  // Portrait tile variant (staff cards) — fills its container.
  if (ratio) {
    if (photo) {
      return <SmartImage src={photo} alt={`${name}, ${role}`} ratio={ratio} className={className} />;
    }
    return (
      <div
        className={cn(
          'relative grid place-items-center overflow-hidden bg-gradient-to-br',
          palette,
          className
        )}
        style={{ aspectRatio: ratio }}
        role="img"
        aria-label={`${name}${role ? `, ${role}` : ''}`}
      >
        <div className="bg-grain absolute inset-0 opacity-20 mix-blend-overlay" aria-hidden="true" />
        {/* Concentric rings — quiet texture behind the monogram. */}
        <div
          className="absolute inset-0 opacity-[0.18]"
          aria-hidden="true"
          style={{
            backgroundImage:
              'radial-gradient(circle at 50% 42%, transparent 26%, rgba(255,255,255,0.5) 26.4%, transparent 27%), radial-gradient(circle at 50% 42%, transparent 38%, rgba(255,255,255,0.35) 38.4%, transparent 39%)',
          }}
        />
        <span className="relative font-display text-[clamp(2rem,5vw,2.75rem)] font-semibold tracking-tight text-cream-100/95">
          {initials || '·'}
        </span>
      </div>
    );
  }

  // Circular variant (testimonials, compact lists).
  if (photo) {
    return (
      <img
        src={photo}
        alt={`${name}${role ? `, ${role}` : ''}`}
        loading="lazy"
        className={cn('shrink-0 rounded-full object-cover', sizes[size], className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'grid shrink-0 place-items-center rounded-full bg-gradient-to-br font-display font-semibold text-cream-100',
        palette,
        sizes[size],
        className
      )}
      role="img"
      aria-label={`${name}${role ? `, ${role}` : ''}`}
    >
      {initials || '·'}
    </div>
  );
}

export default Avatar;
