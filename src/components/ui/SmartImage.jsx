import { useState, useRef, useEffect, useCallback } from 'react';
import { cn } from '../../utils/cn';

/**
 * Image with a shimmer placeholder, native lazy loading and a graceful
 * fallback. If a photo fails to load — offline, blocked host, or a URL
 * the owner has not replaced yet — the layout holds its shape and shows
 * a brand-toned panel instead of a broken-image icon.
 *
 * `fetchpriority` is spelled lowercase deliberately: React 18 only maps
 * the camelCase form from 19 onwards, and would drop it with a console
 * warning rather than write the attribute.
 */
export function SmartImage({
  src,
  alt = '',
  className,
  imgClassName,
  ratio = '4 / 3',
  priority = false,
  sizes = '100vw',
  ...props
}) {
  const [status, setStatus] = useState('loading');
  const imgRef = useRef(null);

  const handleLoad = useCallback(() => setStatus('loaded'), []);
  const handleError = useCallback(() => setStatus('error'), []);

  /**
   * A cached image can finish decoding before React attaches onLoad,
   * so the event never fires and the image would stay at opacity-0
   * forever. Check the element's own state once it is mounted.
   */
  useEffect(() => {
    const node = imgRef.current;
    if (!node) return;
    if (node.complete) {
      setStatus(node.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [src]);

  return (
    <div
      className={cn('relative overflow-hidden bg-cream-200', className)}
      style={{ aspectRatio: ratio }}
    >
      {status === 'loading' && <div className="skeleton absolute inset-0" aria-hidden="true" />}

      {status !== 'error' ? (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          sizes={sizes}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchpriority={priority ? 'high' : 'auto'}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            'h-full w-full object-cover transition-opacity duration-700 ease-premium',
            status === 'loaded' ? 'opacity-100' : 'opacity-0',
            imgClassName
          )}
          {...props}
        />
      ) : (
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-100 via-cream-200 to-sand"
          role="img"
          aria-label={alt}
        >
          <div className="bg-grain absolute inset-0 opacity-[0.15] mix-blend-multiply" />
        </div>
      )}
    </div>
  );
}

export default SmartImage;
