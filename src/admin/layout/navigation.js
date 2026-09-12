/**
 * The admin panel's navigation tree.
 *
 * `capability` gates a section against the signed-in admin's role
 * (see `can()` in src/lib/collections.js), so a Staff-role account
 * simply never sees the content or settings sections.
 */

import {
  LayoutDashboard,
  Inbox,
  FileText,
  Layers,
  Briefcase,
  Users,
  MapPin,
  Quote,
  HelpCircle,
  Palette,
  Image,
  Settings,
  Scale,
  UserCog,
  History,
} from 'lucide-react';
import { CONTENT_COLLECTIONS } from '../../lib/collections';

export const navigation = [
  {
    title: null,
    items: [
      { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true, capability: 'leads' },
      { to: '/admin/leads', label: 'Leads', icon: Inbox, capability: 'leads', badge: 'newLeads' },
    ],
  },
  {
    title: 'Content',
    items: [
      { to: '/admin/copy', label: 'Page copy', icon: FileText, capability: 'content' },
      { to: '/admin/blocks', label: 'Content blocks', icon: Layers, capability: 'content' },
      {
        to: `/admin/collections/${CONTENT_COLLECTIONS.services}`,
        label: 'Services',
        icon: Briefcase,
        capability: 'content',
      },
      {
        to: `/admin/collections/${CONTENT_COLLECTIONS.staff}`,
        label: 'Staff profiles',
        icon: Users,
        capability: 'content',
      },
      {
        to: `/admin/collections/${CONTENT_COLLECTIONS.cities}`,
        label: 'Cities',
        icon: MapPin,
        capability: 'content',
      },
      {
        to: `/admin/collections/${CONTENT_COLLECTIONS.testimonials}`,
        label: 'Testimonials',
        icon: Quote,
        capability: 'content',
      },
      {
        to: `/admin/collections/${CONTENT_COLLECTIONS.faqs}`,
        label: 'FAQs',
        icon: HelpCircle,
        capability: 'content',
      },
      { to: '/admin/legal', label: 'Legal pages', icon: Scale, capability: 'content' },
    ],
  },
  {
    title: 'Appearance',
    items: [
      { to: '/admin/theme', label: 'Theme', icon: Palette, capability: 'theme' },
      { to: '/admin/media', label: 'Media', icon: Image, capability: 'media' },
    ],
  },
  {
    title: 'Administration',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: Settings, capability: 'settings' },
      { to: '/admin/team', label: 'Team', icon: UserCog, capability: 'admins' },
      { to: '/admin/activity', label: 'Activity log', icon: History, capability: 'settings' },
    ],
  },
];

/** Flattened list, used by the command palette. */
export const allNavItems = navigation.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.title || 'General' }))
);
