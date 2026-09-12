import { motion } from 'framer-motion';
import { MapPin, Clock, Languages, BadgeCheck, ArrowUpRight } from 'lucide-react';
import { staff } from '../data/staff';
import { siteCopy } from '../data/copy';
import { useUI } from '../context/UIProvider';
import { usePrefersReducedMotion } from '../hooks';
import { SectionHeading } from '../components/ui/SectionHeading';
import { Avatar } from '../components/ui/Avatar';
import { Button } from '../components/ui/Button';
import { RevealGroup, RevealItem, Reveal } from '../components/ui/Reveal';

/**
 * Available professionals.
 * Cards scroll horizontally on phones (a 6-card vertical stack would
 * bury the sections below it) and become a grid from `sm` up.
 */
export function Staff() {
  const { openStaffDetail, openBooking } = useUI();
  const copy = siteCopy.staff;

  return (
    <section id="staff" className="section-padding bg-cream-50" aria-labelledby="staff-heading">
      <div className="container">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            id="staff-heading"
            align="left"
            eyebrow={copy.eyebrow}
            title={copy.title}
            description={copy.description}
            className="max-w-2xl"
          />
          <Reveal delay={0.1} className="shrink-0">
            <Button variant="outline" icon={ArrowUpRight} onClick={() => openBooking()}>
              {copy.cta}
            </Button>
          </Reveal>
        </div>

        <RevealGroup
          className="no-scrollbar -mx-gutter mt-10 flex snap-rail gap-4 overflow-x-auto px-gutter pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:px-0 lg:mt-14 lg:grid-cols-3"
          staggerChildren={0.06}
        >
          {staff.map((member) => (
            <StaffCard key={member.id} member={member} onOpen={() => openStaffDetail(member)} />
          ))}
        </RevealGroup>

        <Reveal delay={0.1} className="mt-8">
          <p className="text-center text-fluid-sm text-charcoal-400">{copy.disclaimer}</p>
        </Reveal>
      </div>
    </section>
  );
}

function StaffCard({ member, onOpen }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <RevealItem className="w-[268px] shrink-0 sm:w-auto">
      <motion.div
        whileHover={prefersReduced ? undefined : { y: -6 }}
        transition={{ type: 'spring', stiffness: 320, damping: 26 }}
        className="group flex h-full flex-col overflow-hidden rounded-card border border-emerald-900/[0.07] bg-white shadow-soft transition-shadow duration-500 ease-premium hover:shadow-lift"
      >
        {/* Portrait */}
        <div className="relative overflow-hidden">
          <Avatar
            name={member.name}
            photo={member.photo}
            role={member.role}
            ratio="4 / 3"
            className="transition-transform duration-[900ms] ease-premium group-hover:scale-[1.05]"
          />

          {member.verified && (
            <span className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-pill bg-cream-50/95 px-2.5 py-1 text-[11px] font-bold text-emerald-800 shadow-soft backdrop-blur-sm">
              <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
              Verified
            </span>
          )}

          <span className="absolute bottom-3 left-3 rounded-pill bg-emerald-900/85 px-2.5 py-1 text-[11px] font-semibold text-cream-50 backdrop-blur-sm">
            {member.experienceYears} years experience
          </span>
        </div>

        {/* Body */}
        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-fluid-h4 font-semibold">{member.name}</h3>
          <p className="text-fluid-sm font-medium text-emerald-700">{member.role}</p>

          <ul className="mt-4 space-y-2 text-fluid-sm text-charcoal-500">
            <li className="flex items-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-charcoal-400" aria-hidden="true" />
              {member.city}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="h-4 w-4 shrink-0 text-charcoal-400" aria-hidden="true" />
              {member.availability}
            </li>
            <li className="flex items-center gap-2">
              <Languages className="h-4 w-4 shrink-0 text-charcoal-400" aria-hidden="true" />
              {member.languages.join(', ')}
            </li>
          </ul>

          <div className="mt-5 flex-1" />

          <Button variant="outline" size="sm" fullWidth onClick={onOpen}>
            {siteCopy.staff.cardCta}
          </Button>
        </div>
      </motion.div>
    </RevealItem>
  );
}

export default Staff;
