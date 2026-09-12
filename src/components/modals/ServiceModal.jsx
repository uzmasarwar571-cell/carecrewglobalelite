import { Check, ArrowRight, MessageCircle, Users, Layers, Tag } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { SmartImage } from '../ui/SmartImage';
import { useUI } from '../../context/UIProvider';
import { whatsappMessages } from '../../config/business';
import { openWhatsApp } from '../../utils/whatsapp';

/**
 * Service detail. "Request This Service" closes this and opens the
 * booking form with the service already selected — the handoff the
 * spec calls for.
 */
export function ServiceModal() {
  const { activeService, closeServiceDetail, openBooking } = useUI();
  const service = activeService;

  return (
    <Modal
      open={Boolean(service)}
      onClose={closeServiceDetail}
      size="lg"
      title={service?.name}
      description={service?.summary}
      footer={
        <div className="flex flex-col gap-2.5 xs:flex-row xs:items-center">
          <Button
            className="xs:flex-1"
            icon={ArrowRight}
            onClick={() => service && openBooking(service.id)}
          >
            Request This Service
          </Button>
          <Button
            variant="whatsapp"
            icon={MessageCircle}
            iconPosition="left"
            onClick={() => service && openWhatsApp(whatsappMessages.service(service.name))}
          >
            WhatsApp
          </Button>
        </div>
      }
    >
      {service && (
        <div className="space-y-6">
          <SmartImage
            src={service.image}
            alt=""
            ratio="16 / 9"
            className="rounded-card"
            sizes="(min-width: 640px) 640px, 100vw"
          />

          <p className="text-fluid-base leading-relaxed text-charcoal-600">{service.description}</p>

          {/* What's included */}
          <div>
            <h3 className="flex items-center gap-2 text-fluid-h4 font-semibold">
              <Layers className="h-[18px] w-[18px] text-emerald-700" aria-hidden="true" />
              What's included
            </h3>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {service.includes.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-fluid-sm text-charcoal-600">
                  <span className="mt-0.5 grid h-[18px] w-[18px] shrink-0 place-items-center rounded-full bg-emerald-700/10">
                    <Check className="h-2.5 w-2.5 text-emerald-700" strokeWidth={3.5} aria-hidden="true" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Options */}
          <div>
            <h3 className="flex items-center gap-2 text-fluid-h4 font-semibold">
              <Tag className="h-[18px] w-[18px] text-emerald-700" aria-hidden="true" />
              Available options
            </h3>
            <ul className="mt-3 flex flex-wrap gap-2">
              {service.options.map((option) => (
                <li
                  key={option}
                  className="rounded-pill border border-emerald-900/[0.08] bg-cream-100 px-3 py-1.5 text-fluid-sm font-medium text-charcoal-600"
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>

          {/* Meta */}
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900/[0.08] bg-cream-100 p-4">
              <p className="text-fluid-xs font-bold uppercase tracking-[0.14em] text-charcoal-400">
                Service type
              </p>
              <p className="mt-1.5 text-fluid-sm font-semibold text-emerald-900">
                {service.serviceType}
              </p>
            </div>
            <div className="rounded-2xl border border-emerald-900/[0.08] bg-cream-100 p-4">
              <p className="flex items-center gap-1.5 text-fluid-xs font-bold uppercase tracking-[0.14em] text-charcoal-400">
                <Users className="h-3.5 w-3.5" aria-hidden="true" />
                Suitable for
              </p>
              <p className="mt-1.5 text-fluid-sm font-medium text-charcoal-600">
                {service.suitableFor}
              </p>
            </div>
          </div>

          <p className="text-fluid-xs leading-relaxed text-charcoal-400">
            Terms, timings and charges are confirmed with you before any placement begins. Nothing
            is committed by sending a request.
          </p>
        </div>
      )}
    </Modal>
  );
}

export default ServiceModal;
