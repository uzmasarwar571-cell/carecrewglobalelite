import { motion } from 'framer-motion';
import {
  MessageCircle,
  Phone,
  Mail,
  MapPin,
  ArrowUpRight,
  Facebook,
  Instagram,
  Linkedin,
  ArrowUp,
} from 'lucide-react';
import { businessConfig, whatsappMessages } from '../../config/business';
import { openWhatsApp, telHref, mailHref } from '../../utils/whatsapp';
import { services } from '../../data/services';
import { cities } from '../../data/cities';
import { navLinks, scrollToSection } from './navLinks';
import { useUI } from '../../context/UIProvider';
import { Logo } from './Logo';
import { Button } from '../ui/Button';
import { Reveal } from '../ui/Reveal';

export function Footer() {
  const { openBooking, openServiceDetail, openLegal } = useUI();
  const year = new Date().getFullYear();

  const handleNav = (event, id) => {
    event.preventDefault();
    scrollToSection(id);
  };

  const socials = [
    { key: 'facebook', label: 'Facebook', icon: Facebook },
    { key: 'instagram', label: 'Instagram', icon: Instagram },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  ].filter((social) => businessConfig.social[social.key]);

  return (
    <footer className="relative overflow-hidden bg-emerald-950 text-cream-100">
      {/* Ambient wash */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(60% 40% at 15% 0%, rgba(44,125,99,0.28) 0%, rgba(6,26,22,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="container relative">
        {/* ── Top: brand + WhatsApp CTA ─────────────────── */}
        <div className="flex flex-col gap-8 border-b border-cream-50/[0.08] py-12 lg:flex-row lg:items-center lg:justify-between lg:py-14">
          <Reveal className="max-w-xl">
            <Logo tone="light" />
            <p className="mt-5 text-fluid-base leading-relaxed text-cream-200/70">
              Professional domestic staff services in Pakistan. We match families and businesses
              with reliable, carefully screened household help — and stay available after the
              placement is made.
            </p>
          </Reveal>

          <Reveal delay={0.08} className="shrink-0">
            <div className="flex flex-col gap-3 xs:flex-row lg:flex-col xl:flex-row">
              <Button size="lg" variant="gold" onClick={() => openBooking()} icon={ArrowUpRight}>
                Book a Maid
              </Button>
              <Button
                size="lg"
                variant="whatsapp"
                icon={MessageCircle}
                iconPosition="left"
                onClick={() => openWhatsApp(whatsappMessages.general)}
              >
                WhatsApp Us
              </Button>
            </div>
          </Reveal>
        </div>

        {/* ── Link columns ──────────────────────────────── */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 py-12 sm:grid-cols-3 lg:grid-cols-12 lg:gap-8">
          <div className="col-span-2 sm:col-span-1 lg:col-span-3">
            <FooterHeading>Explore</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              {navLinks.map((link) => (
                <li key={link.id}>
                  <FooterLink href={`#${link.id}`} onClick={(event) => handleNav(event, link.id)}>
                    {link.label}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <FooterHeading>Services</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              {services.slice(0, 6).map((service) => (
                <li key={service.id}>
                  <FooterLink
                    href="#services"
                    onClick={(event) => {
                      event.preventDefault();
                      openServiceDetail(service);
                    }}
                  >
                    {service.name}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Cities</FooterHeading>
            <ul className="mt-4 space-y-2.5">
              {cities.map((city) => (
                <li key={city.id}>
                  <FooterLink href="#cities" onClick={(event) => handleNav(event, 'cities')}>
                    {city.name}
                  </FooterLink>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-2 sm:col-span-3 lg:col-span-4">
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="mt-4 space-y-3.5">
              <li>
                <a
                  href={telHref}
                  className="group flex items-start gap-3 text-cream-200/75 transition-colors hover:text-cream-50"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                  <span className="text-fluid-sm font-medium">{businessConfig.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={mailHref}
                  className="group flex items-start gap-3 text-cream-200/75 transition-colors hover:text-cream-50"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                  <span className="break-all text-fluid-sm font-medium">{businessConfig.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-cream-200/75">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-gold-300" aria-hidden="true" />
                <span className="text-fluid-sm">
                  {cities.map((city) => city.name).join(' · ')}
                </span>
              </li>
            </ul>

            <div className="mt-6 rounded-2xl border border-cream-50/[0.08] bg-cream-50/[0.04] p-4">
              <p className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-gold-300">
                Working hours
              </p>
              {businessConfig.hours.map((slot) => (
                <p key={slot.days} className="mt-1.5 text-fluid-sm text-cream-200/70">
                  <span className="text-cream-100">{slot.days}</span> · {slot.time}
                </p>
              ))}
            </div>

            {socials.length > 0 && (
              <div className="mt-6 flex items-center gap-2.5">
                {socials.map((social) => (
                  <a
                    key={social.key}
                    href={businessConfig.social[social.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${businessConfig.name} on ${social.label}`}
                    className="grid h-10 w-10 place-items-center rounded-full border border-cream-50/15 text-cream-200/70 transition-all duration-300 hover:border-gold-300/50 hover:text-gold-300"
                  >
                    <social.icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────── */}
        <div className="flex flex-col gap-4 border-t border-cream-50/[0.08] py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-fluid-xs text-cream-200/45">
            © {year} {businessConfig.name}. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <FooterLink
              href="#privacy"
              small
              onClick={(event) => {
                event.preventDefault();
                openLegal('privacy');
              }}
            >
              Privacy Policy
            </FooterLink>
            <FooterLink
              href="#terms"
              small
              onClick={(event) => {
                event.preventDefault();
                openLegal('terms');
              }}
            >
              Terms &amp; Conditions
            </FooterLink>
            <motion.button
              type="button"
              onClick={() => scrollToSection('home')}
              whileHover={{ y: -2 }}
              className="flex items-center gap-1.5 text-fluid-xs font-semibold text-cream-200/60 transition-colors hover:text-gold-300"
            >
              Back to top
              <ArrowUp className="h-3.5 w-3.5" aria-hidden="true" />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Breathing room above the mobile action bar. */}
      <div className="h-[var(--mobile-bar)] lg:hidden" aria-hidden="true" />
    </footer>
  );
}

function FooterHeading({ children }) {
  return (
    <h3 className="text-fluid-xs font-bold uppercase tracking-[0.16em] text-cream-50">{children}</h3>
  );
}

function FooterLink({ href, onClick, children, small }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className={`group inline-flex items-center gap-1 text-cream-200/65 transition-colors duration-200 hover:text-gold-300 ${
        small ? 'text-fluid-xs' : 'text-fluid-sm'
      }`}
    >
      <span className="border-b border-transparent transition-colors duration-200 group-hover:border-gold-300/40">
        {children}
      </span>
    </a>
  );
}

export default Footer;
