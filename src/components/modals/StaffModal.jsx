import { MapPin, Clock, Languages, Briefcase, BadgeCheck, ArrowRight, MessageCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useUI } from '../../context/UIProvider';
import { whatsappMessages } from '../../config/business';
import { openWhatsApp } from '../../utils/whatsapp';

/** Full profile for a staff member. */
export function StaffModal() {
  const { activeStaff, closeStaffDetail, openBooking } = useUI();
  const member = activeStaff;

  const details = member
    ? [
        { icon: Briefcase, label: 'Experience', value: `${member.experienceYears} years` },
        { icon: MapPin, label: 'City', value: member.city },
        { icon: Clock, label: 'Availability', value: member.availability },
        { icon: Languages, label: 'Languages', value: member.languages.join(', ') },
      ]
    : [];

  return (
    <Modal
      open={Boolean(member)}
      onClose={closeStaffDetail}
      size="md"
      labelledBy="staff-modal-title"
      footer={
        <div className="flex flex-col gap-2.5 xs:flex-row">
          <Button className="xs:flex-1" icon={ArrowRight} onClick={() => openBooking()}>
            Request This Profile
          </Button>
          <Button
            variant="whatsapp"
            icon={MessageCircle}
            iconPosition="left"
            onClick={() => member && openWhatsApp(whatsappMessages.staff(member.name, member.role))}
          >
            WhatsApp
          </Button>
        </div>
      }
    >
      {member && (
        <div>
          <div className="flex flex-col gap-4 xs:flex-row xs:items-center">
            <Avatar
              name={member.name}
              photo={member.photo}
              role={member.role}
              ratio="1 / 1"
              className="w-24 shrink-0 rounded-card xs:w-28"
            />
            <div className="min-w-0">
              <h2 id="staff-modal-title" className="text-fluid-h3 font-semibold">
                {member.name}
              </h2>
              <p className="text-fluid-base font-medium text-emerald-700">{member.role}</p>
              {member.verified && (
                <span className="mt-2.5 inline-flex items-center gap-1.5 rounded-pill bg-emerald-700/10 px-2.5 py-1 text-fluid-xs font-bold text-emerald-800">
                  <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
                  Identity verified
                </span>
              )}
            </div>
          </div>

          <p className="mt-5 text-fluid-base leading-relaxed text-charcoal-600">{member.summary}</p>

          <dl className="mt-6 grid gap-3 xs:grid-cols-2">
            {details.map((detail) => (
              <div
                key={detail.label}
                className="rounded-2xl border border-emerald-900/[0.08] bg-cream-100 p-4"
              >
                <dt className="flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-[0.14em] text-charcoal-400">
                  <detail.icon className="h-3.5 w-3.5" aria-hidden="true" />
                  {detail.label}
                </dt>
                <dd className="mt-1.5 text-fluid-sm font-semibold text-emerald-900">{detail.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-6">
            <h3 className="text-fluid-xs font-bold uppercase tracking-[0.14em] text-charcoal-400">
              Skills
            </h3>
            <ul className="mt-2.5 flex flex-wrap gap-2">
              {member.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-pill border border-emerald-900/[0.08] bg-white px-3 py-1.5 text-fluid-sm font-medium text-charcoal-600"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>

          <p className="mt-6 rounded-2xl bg-cream-100 p-4 text-fluid-xs leading-relaxed text-charcoal-500">
            Availability changes daily. Send a request and we will confirm whether this person — or
            someone with a similar profile — is currently free in your area.
          </p>
        </div>
      )}
    </Modal>
  );
}

export default StaffModal;
