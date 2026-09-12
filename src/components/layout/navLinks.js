import { isSectionVisible } from '../../config/settings';

/**
 * Single source of truth for navigation + scroll-spy section ids.
 * `settingsKey` ties a link to the section toggle in the admin panel so
 * hiding a section also removes its nav entry — a link that scrolls
 * nowhere is worse than no link.
 */
const allNavLinks = [
  { id: 'home', label: 'Home' },
  { id: 'services', label: 'Services', settingsKey: 'services' },
  { id: 'how-it-works', label: 'How It Works', settingsKey: 'howItWorks' },
  { id: 'about', label: 'About Us', settingsKey: 'about' },
  { id: 'why-us', label: 'Why Choose Us', settingsKey: 'whyUs' },
  { id: 'faqs', label: 'FAQs', settingsKey: 'faqs' },
  { id: 'contact', label: 'Contact', settingsKey: 'contact' },
];

/** Getter rather than a constant — section visibility is set at runtime. */
export const getNavLinks = () =>
  allNavLinks.filter((link) => !link.settingsKey || isSectionVisible(link.settingsKey));

export const navLinks = allNavLinks;

export const getNavSectionIds = () => getNavLinks().map((link) => link.id);

export const navSectionIds = allNavLinks.map((link) => link.id);

/** Smoothly scrolls to a section, accounting for the sticky navbar. */
export function scrollToSection(id) {
  const target = document.getElementById(id);
  if (!target) return;

  const navHeight =
    parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
      10
    ) || 72;

  const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 8;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
}
