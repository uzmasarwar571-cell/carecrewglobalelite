import { useState, useEffect, useRef, useCallback } from 'react';

/* ── Media queries ─────────────────────────────────────────── */

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/**
 * True when the visitor has asked the OS to reduce motion, OR when the
 * site owner has switched animation off in the admin theme manager
 * (which sets `data-motion="off"` on <html>).
 */
export function usePrefersReducedMotion() {
  const systemPreference = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [themeDisabled, setThemeDisabled] = useState(
    () => typeof document !== 'undefined' && document.documentElement.dataset.motion === 'off'
  );

  useEffect(() => {
    const root = document.documentElement;
    const read = () => setThemeDisabled(root.dataset.motion === 'off');
    read();
    // The theme can be applied after mount (Firestore load, live preview).
    const observer = new MutationObserver(read);
    observer.observe(root, { attributes: true, attributeFilter: ['data-motion'] });
    return () => observer.disconnect();
  }, []);

  return systemPreference || themeDisabled;
}

/** True on desktop-sized pointers — used to gate the custom cursor. */
export const useIsDesktop = () =>
  useMediaQuery('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

/* ── Scroll ────────────────────────────────────────────────── */

/** Current scroll offset, throttled to animation frames. */
export function useScrollY() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let frame = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        frame = null;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return scrollY;
}

/**
 * Tracks which section is currently in view so the navbar can show an
 * active indicator. Uses IntersectionObserver rather than scroll math.
 */
export function useActiveSection(sectionIds, offset = '-45% 0px -50% 0px') {
  const [active, setActive] = useState(sectionIds[0] ?? '');

  useEffect(() => {
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: offset, threshold: [0, 0.25, 0.5] }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sectionIds, offset]);

  return active;
}

/* ── Body scroll lock (modals) ─────────────────────────────── */

/**
 * Locks background scrolling without the layout shifting sideways
 * when the scrollbar disappears.
 */
export function useLockBodyScroll(locked) {
  useEffect(() => {
    if (!locked) return undefined;

    const { body, documentElement } = document;
    const previousOverflow = body.style.overflow;
    const previousPadding = body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - documentElement.clientWidth;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

    return () => {
      body.style.overflow = previousOverflow;
      body.style.paddingRight = previousPadding;
    };
  }, [locked]);
}

/* ── Counters ──────────────────────────────────────────────── */

/**
 * Counts from 0 to `target` once `active` becomes true.
 * Eases out so the number settles rather than stopping dead.
 */
export function useCountUp(target, active, duration = 1800) {
  const [value, setValue] = useState(0);
  const prefersReduced = usePrefersReducedMotion();

  useEffect(() => {
    if (!active) return undefined;
    if (prefersReduced) {
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration, prefersReduced]);

  return value;
}

/* ── Session flags (popups) ────────────────────────────────── */

/**
 * Remembers, for this browser session only, that something has been
 * shown — so the welcome popup does not reappear on every scroll.
 */
export function useSessionOnce(key) {
  const [used, setUsed] = useState(() => {
    try {
      return window.sessionStorage.getItem(key) === '1';
    } catch {
      return false;
    }
  });

  const markUsed = useCallback(() => {
    setUsed(true);
    try {
      window.sessionStorage.setItem(key, '1');
    } catch {
      /* storage unavailable — popup simply may show again */
    }
  }, [key]);

  return [used, markUsed];
}

/* ── Exit intent ───────────────────────────────────────────── */

/**
 * Fires once when the pointer leaves through the top of the viewport.
 * Desktop only, and never before `delay` has elapsed so it cannot
 * ambush someone who lands and immediately reaches for their tabs.
 */
export function useExitIntent(onTrigger, { enabled = true, delay = 12000 } = {}) {
  const armed = useRef(false);
  const fired = useRef(false);
  const callback = useRef(onTrigger);
  callback.current = onTrigger;

  useEffect(() => {
    if (!enabled) return undefined;

    const armTimer = window.setTimeout(() => {
      armed.current = true;
    }, delay);

    const onMouseOut = (event) => {
      if (!armed.current || fired.current) return;
      if (event.relatedTarget || event.toElement) return;
      if (event.clientY > 8) return;
      fired.current = true;
      callback.current?.();
    };

    document.addEventListener('mouseout', onMouseOut);
    return () => {
      window.clearTimeout(armTimer);
      document.removeEventListener('mouseout', onMouseOut);
    };
  }, [enabled, delay]);
}

/* ── Focus trap (accessible modals) ────────────────────────── */

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Keeps Tab cycling inside an open dialog and restores focus to
 * whatever was focused before it opened.
 */
export function useFocusTrap(containerRef, active) {
  useEffect(() => {
    if (!active) return undefined;

    const previouslyFocused = document.activeElement;
    const node = containerRef.current;
    if (!node) return undefined;

    const focusFirst = () => {
      const targets = node.querySelectorAll(FOCUSABLE);
      const first = targets[0];
      if (first) first.focus();
      else node.focus();
    };

    const raf = requestAnimationFrame(focusFirst);

    const onKeyDown = (event) => {
      if (event.key !== 'Tab') return;
      const targets = Array.from(node.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null || el === document.activeElement
      );
      if (!targets.length) return;

      const first = targets[0];
      const last = targets[targets.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    node.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      node.removeEventListener('keydown', onKeyDown);
      if (previouslyFocused instanceof HTMLElement) previouslyFocused.focus();
    };
  }, [containerRef, active]);
}
