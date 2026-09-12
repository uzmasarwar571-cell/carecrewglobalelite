import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Phone } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useScrollY, useActiveSection, usePrefersReducedMotion } from '../../hooks';
import { useUI } from '../../context/UIProvider';
import { getNavLinks, scrollToSection } from './navLinks';
import { telHref } from '../../utils/whatsapp';
import { businessConfig } from '../../config/business';
import { siteCopy } from '../../data/copy';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { MobileMenu } from './MobileMenu';

/**
 * Sticky navbar. Transparent over the hero, then settles into a glass
 * bar once the user scrolls. The active-section pill follows scroll
 * position via IntersectionObserver rather than scroll maths.
 */
export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollY = useScrollY();
  // Hidden sections drop out of the nav, so scroll-spy must watch the
  // same filtered list. Memoised — useActiveSection re-subscribes on
  // every identity change.
  const links = useMemo(() => getNavLinks(), []);
  const sectionIds = useMemo(() => links.map((link) => link.id), [links]);
  const activeSection = useActiveSection(sectionIds);
  const prefersReduced = usePrefersReducedMotion();
  const { openBooking } = useUI();

  const scrolled = scrollY > 24;

  const handleNavClick = useCallback((event, id) => {
    event.preventDefault();
    scrollToSection(id);
  }, []);

  return (
    <>
      {/* Keyboard users land here first. */}
      <a
        href="#main"
        className="sr-only-focusable fixed left-4 top-4 z-[100] rounded-pill bg-emerald-800 px-5 py-3 text-fluid-sm font-semibold text-cream-50 shadow-lift"
      >
        Skip to content
      </a>

      <motion.header
        initial={prefersReduced ? false : { y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={cn(
          'fixed inset-x-0 top-0 z-[70] transition-[background-color,box-shadow,border-color] duration-500 ease-premium',
          scrolled
            ? 'glass-nav border-b border-emerald-900/[0.07] shadow-[0_2px_20px_-12px_rgba(11,42,35,0.3)]'
            : 'border-b border-transparent bg-transparent'
        )}
        style={{ height: 'var(--nav-height)' }}
      >
        <nav
          className="container flex h-full items-center justify-between gap-3"
          aria-label="Main navigation"
        >
          <Logo
            tone={scrolled ? 'dark' : 'light'}
            compact
            onClick={(event) => handleNavClick(event, 'home')}
          />

          {/* ── Desktop links ─────────────────────────────── */}
          <ul className="hidden items-center lg:flex">
            {links.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <li key={link.id} className="relative">
                  <a
                    href={`#${link.id}`}
                    onClick={(event) => handleNavClick(event, link.id)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'relative block whitespace-nowrap rounded-pill px-2.5 py-2 text-[13px] font-semibold transition-colors duration-300 xl:px-3.5 xl:text-fluid-sm',
                      scrolled
                        ? isActive
                          ? 'text-emerald-800'
                          : 'text-charcoal-600 hover:text-emerald-800'
                        : isActive
                          ? 'text-cream-50'
                          : 'text-cream-100/75 hover:text-cream-50'
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="nav-active-pill"
                        className={cn(
                          'absolute inset-0 -z-10 rounded-pill',
                          scrolled ? 'bg-emerald-900/[0.07]' : 'bg-cream-50/[0.14]'
                        )}
                        transition={
                          prefersReduced
                            ? { duration: 0 }
                            : { type: 'spring', stiffness: 380, damping: 32 }
                        }
                      />
                    )}
                    {link.label}
                  </a>
                </li>
              );
            })}
          </ul>

          {/* ── Desktop actions ───────────────────────────── */}
          <div className="hidden items-center gap-2 lg:flex">
            <a
              href={telHref}
              className={cn(
                'flex items-center gap-2 rounded-pill px-3 py-2 text-[13px] font-semibold transition-colors duration-300 xl:text-fluid-sm',
                scrolled
                  ? 'text-emerald-800 hover:bg-emerald-900/[0.06]'
                  : 'text-cream-100/85 hover:bg-cream-50/10 hover:text-cream-50'
              )}
              aria-label={`Call ${businessConfig.name} on ${businessConfig.phone}`}
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              <span className="hidden xl:inline">{businessConfig.phone}</span>
            </a>

            <Button
              size="sm"
              variant={scrolled ? 'primary' : 'light'}
              onClick={() => openBooking()}
              className="px-5"
            >
              {siteCopy.hero.ctaPrimary}
            </Button>
          </div>

          {/* ── Mobile trigger ────────────────────────────── */}
          <div className="flex items-center gap-2 lg:hidden">
            <Button size="sm" variant={scrolled ? 'primary' : 'light'} onClick={() => openBooking()}>
              Book
            </Button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className={cn(
                'grid h-11 w-11 place-items-center rounded-full border transition-colors duration-300',
                scrolled
                  ? 'border-emerald-900/12 text-emerald-900 hover:bg-emerald-900/[0.06]'
                  : 'border-cream-50/25 text-cream-50 hover:bg-cream-50/10'
              )}
            >
              <Menu className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            onClose={() => setMenuOpen(false)}
            activeSection={activeSection}
            onNavigate={(id) => {
              setMenuOpen(false);
              // Let the menu finish closing before scrolling.
              window.setTimeout(() => scrollToSection(id), 240);
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

export default Navbar;
