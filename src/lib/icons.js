/**
 * ─────────────────────────────────────────────────────────────
 *  ICON REGISTRY
 * ─────────────────────────────────────────────────────────────
 *  Firestore can only store JSON, so content stores icons as a
 *  NAME ('ShieldCheck') and this registry resolves it back to a
 *  React component at render time.
 *
 *  It is also the list the admin panel's icon picker offers, so
 *  adding an icon here makes it available to the CMS immediately.
 * ─────────────────────────────────────────────────────────────
 */

import {
  Home, Clock, ChefHat, Sparkles, Baby, HeartHandshake, Car, Building2,
  ShieldCheck, BadgeCheck, CalendarClock, Eye, Users, Zap, Headphones, MapPin,
  FileSearch, IdCard, Briefcase, Handshake, LifeBuoy, RefreshCw, ClipboardList,
  UserSearch, MessageSquareHeart, Star, Heart, Award, ThumbsUp, CheckCircle2,
  Phone, Mail, MessageCircle, Send, Bell, Calendar, CalendarCheck, Timer,
  Brush, Droplets, WashingMachine, Shirt, UtensilsCrossed, Coffee, Soup,
  Bed, Sofa, Lamp, Wrench, Hammer, Leaf, Sun, Moon, Flower2,
  Stethoscope, Pill, Activity, Accessibility, PersonStanding, Footprints,
  GraduationCap, BookOpen, School, Backpack, Bus, Bike, Plane, Navigation,
  Store, Landmark, Factory, Warehouse, Hotel, DoorOpen, KeyRound, Lock,
  Wallet, CreditCard, Receipt, TrendingUp, BarChart3, Target, Gem, Crown,
  Globe, Compass, Flag, Puzzle, Lightbulb, Rocket, Smile, Gift,
} from 'lucide-react';

/** name → component. Keys are what get written to Firestore. */
export const iconRegistry = {
  Home, Clock, ChefHat, Sparkles, Baby, HeartHandshake, Car, Building2,
  ShieldCheck, BadgeCheck, CalendarClock, Eye, Users, Zap, Headphones, MapPin,
  FileSearch, IdCard, Briefcase, Handshake, LifeBuoy, RefreshCw, ClipboardList,
  UserSearch, MessageSquareHeart, Star, Heart, Award, ThumbsUp, CheckCircle2,
  Phone, Mail, MessageCircle, Send, Bell, Calendar, CalendarCheck, Timer,
  Brush, Droplets, WashingMachine, Shirt, UtensilsCrossed, Coffee, Soup,
  Bed, Sofa, Lamp, Wrench, Hammer, Leaf, Sun, Moon, Flower2,
  Stethoscope, Pill, Activity, Accessibility, PersonStanding, Footprints,
  GraduationCap, BookOpen, School, Backpack, Bus, Bike, Plane, Navigation,
  Store, Landmark, Factory, Warehouse, Hotel, DoorOpen, KeyRound, Lock,
  Wallet, CreditCard, Receipt, TrendingUp, BarChart3, Target, Gem, Crown,
  Globe, Compass, Flag, Puzzle, Lightbulb, Rocket, Smile, Gift,
};

/** Sorted names for the picker UI. */
export const iconNames = Object.keys(iconRegistry).sort();

/**
 * Resolves a stored icon name to a component.
 * Falls back to Sparkles so a typo in the CMS renders something
 * sensible instead of throwing "type is invalid" inside React.
 */
export function resolveIcon(name, fallback = Sparkles) {
  if (!name) return fallback;
  return iconRegistry[name] || fallback;
}

/** Reverse lookup — used when converting bundled defaults to storable JSON. */
export function iconNameOf(component, fallback = 'Sparkles') {
  if (!component) return fallback;
  const entry = Object.entries(iconRegistry).find(([, value]) => value === component);
  return entry ? entry[0] : fallback;
}
