import { Phone, MessageCircle, Mail, MapPin, Clock, PhoneCall, ArrowUpRight } from 'lucide-react';
import { businessConfig, whatsappMessages } from '../config/business';
import { telHref, mailHref, buildWhatsAppUrl } from '../utils/whatsapp';
import { cities } from '../data/cities';
import { siteCopy } from '../data/copy';
import { useUI } from '../context/UIProvider';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Button } from '../components/ui/Button';
import { Reveal, RevealGroup, RevealItem } from '../components/ui/Reveal';

/** Contact details + the three ways to reach the team. */
export function Contact() {
  const { openCallback, openBooking } = useUI();
  const copy = siteCopy.contact;

  const channels = [
    {
      icon: Phone,
      label: copy.callLabel,
      value: businessConfig.phone,
      href: telHref,
      note: businessConfig.hours?.[0]?.time,
    },
    {
      icon: MessageCircle,
      label: copy.whatsappLabel,
      value: businessConfig.phone,
      href: buildWhatsAppUrl(whatsappMessages.general),
      external: true,
      note: businessConfig.supportNote,
      accent: true,
    },
    {
      icon: Mail,
      label: copy.emailLabel,
      value: businessConfig.email,
      href: mailHref,
      note: copy.emailNote,
    },
  ];

  return (
    <section id="contact" className="section-padding bg-cream-100" aria-labelledby="contact-heading">
      <div className="container">
        <SectionHeading
          id="contact-heading"
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.description}
        />

        {/* ── Channels ─────────────────────────────────── */}
        <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-3 lg:mt-16 lg:gap-5" staggerChildren={0.08}>
          {channels.map((channel) => (
            <RevealItem key={channel.label}>
              <a
                href={channel.href}
                target={channel.external ? '_blank' : undefined}
                rel={channel.external ? 'noopener noreferrer' : undefined}
                className="group flex h-full flex-col rounded-card border border-emerald-900/[0.07] bg-cream-50 p-5 shadow-soft transition-all duration-500 ease-premium hover:-translate-y-1 hover:shadow-lift sm:p-6"
              >
                <div className="flex items-start justify-between gap-3">
                  <span
                    className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl transition-colors duration-500 ease-premium ${
                      channel.accent
                        ? 'bg-whatsapp/10 text-whatsapp group-hover:bg-whatsapp group-hover:text-white'
                        : 'bg-emerald-700/[0.07] text-emerald-700 group-hover:bg-emerald-700 group-hover:text-cream-50'
                    }`}
                  >
                    <channel.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <ArrowUpRight
                    className="h-4 w-4 shrink-0 text-charcoal-400 opacity-0 transition-all duration-300 ease-premium group-hover:translate-x-0.5 group-hover:opacity-100"
                    aria-hidden="true"
                  />
                </div>

                <p className="mt-4 text-fluid-xs font-bold uppercase tracking-[0.14em] text-charcoal-400">
                  {channel.label}
                </p>
                <p className="mt-1.5 break-words text-fluid-h4 font-semibold text-emerald-900">
                  {channel.value}
                </p>
                <p className="mt-2 text-fluid-xs text-charcoal-400">{channel.note}</p>
              </a>
            </RevealItem>
          ))}
        </RevealGroup>

        {/* ── Details panel ────────────────────────────── */}
        <Reveal delay={0.1} className="mt-5">
          <div className="grid gap-6 rounded-panel border border-emerald-900/[0.07] bg-cream-50 p-6 shadow-soft sm:p-8 lg:grid-cols-3 lg:gap-10">
            <div>
              <h3 className="flex items-center gap-2.5 text-fluid-h4 font-semibold">
                <Clock className="h-[18px] w-[18px] text-emerald-700" aria-hidden="true" />
                {copy.hoursTitle}
              </h3>
              <ul className="mt-3.5 space-y-2">
                {(businessConfig.hours || []).map((slot) => (
                  <li key={slot.days} className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 text-fluid-sm">
                    <span className="text-charcoal-500">{slot.days}</span>
                    <span className="font-semibold text-emerald-900">{slot.time}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-fluid-xs text-charcoal-400">{businessConfig.supportNote}</p>
            </div>

            <div>
              <h3 className="flex items-center gap-2.5 text-fluid-h4 font-semibold">
                <MapPin className="h-[18px] w-[18px] text-emerald-700" aria-hidden="true" />
                {copy.areasTitle}
              </h3>
              <ul className="mt-3.5 flex flex-wrap gap-2">
                {cities.map((city) => (
                  <li
                    key={city.id}
                    className="rounded-pill border border-emerald-900/[0.08] bg-cream-100 px-3 py-1.5 text-fluid-xs font-medium text-charcoal-600"
                  >
                    {city.name}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-fluid-xs text-charcoal-400">{copy.areasNote}</p>
            </div>

            <div className="rounded-card bg-emerald-900 p-5">
              <h3 className="text-fluid-h4 font-semibold text-cream-50">{copy.callbackTitle}</h3>
              <p className="mt-2 text-fluid-sm text-cream-200/70">{copy.callbackText}</p>
              <div className="mt-5 space-y-2.5">
                <Button
                  variant="gold"
                  fullWidth
                  icon={PhoneCall}
                  iconPosition="left"
                  onClick={openCallback}
                >
                  {copy.callbackCta}
                </Button>
                <Button variant="onDark" fullWidth onClick={() => openBooking()}>
                  {copy.bookCta}
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export default Contact;
