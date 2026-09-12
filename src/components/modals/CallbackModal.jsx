import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PhoneCall, Send, Check, MessageCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Field';
import { useUI } from '../../context/UIProvider';
import { usePrefersReducedMotion } from '../../hooks';
import { validateCallback } from '../../utils/validation';
import { submitCallback } from '../../services/bookingService';
import { whatsappMessages } from '../../config/business';
import { openWhatsApp } from '../../utils/whatsapp';
import { timeSlotOptions } from '../booking/bookingConstants';

/** Short "call me back" form — three fields, minimal friction. */
export function CallbackModal() {
  const { callbackOpen, closeCallback, toast } = useUI();
  const prefersReduced = usePrefersReducedMotion();

  const [form, setForm] = useState({ name: '', phone: '', preferredTime: 'Any time' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!callbackOpen) return;
    setForm({ name: '', phone: '', preferredTime: 'Any time' });
    setErrors({});
    setSubmitting(false);
    setDone(false);
  }, [callbackOpen]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formErrors = validateCallback(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setSubmitting(true);
    const response = await submitCallback(form);
    setSubmitting(false);

    if (!response.ok) {
      toast(response.error, 'error');
      return;
    }

    setDone(true);
    toast('Callback requested — we will ring you shortly.', 'success');
  };

  return (
    <Modal
      open={callbackOpen}
      onClose={closeCallback}
      size="sm"
      title={done ? undefined : 'Request a Callback'}
      description={done ? undefined : 'Leave your number and we will call you back.'}
      labelledBy={done ? 'callback-done-title' : undefined}
    >
      {done ? (
        <div className="py-4 text-center">
          <motion.div
            initial={prefersReduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
            className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-700 text-cream-50"
          >
            <Check className="h-8 w-8" strokeWidth={2.5} aria-hidden="true" />
          </motion.div>

          <h2 id="callback-done-title" className="mt-5 text-fluid-h3 font-semibold">
            We'll call you back
          </h2>
          <p className="mx-auto mt-2.5 max-w-sm text-fluid-sm text-charcoal-500">
            Thanks {form.name.split(' ')[0]} — our team will ring you on{' '}
            <span className="font-semibold text-emerald-900">{form.phone}</span>
            {form.preferredTime !== 'Any time' && (
              <>
                {' '}
                during <span className="font-semibold text-emerald-900">{form.preferredTime.toLowerCase()}</span>
              </>
            )}
            .
          </p>

          <div className="mt-7 flex flex-col gap-2.5 xs:flex-row xs:justify-center">
            <Button
              variant="whatsapp"
              icon={MessageCircle}
              iconPosition="left"
              onClick={() => openWhatsApp(whatsappMessages.callback)}
            >
              WhatsApp instead
            </Button>
            <Button variant="outline" onClick={closeCallback}>
              Close
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-start gap-3.5 rounded-2xl bg-cream-100 p-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-700/[0.08] text-emerald-700">
              <PhoneCall className="h-[18px] w-[18px]" aria-hidden="true" />
            </span>
            <p className="text-fluid-sm text-charcoal-500">
              No sales calls — just a short conversation about what you need.
            </p>
          </div>

          <Input
            label="Your name"
            placeholder="e.g. Ayesha Khan"
            autoComplete="name"
            value={form.name}
            onChange={(event) => setField('name', event.target.value)}
            error={errors.name}
          />

          <Input
            label="Phone number"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0300 1234567"
            value={form.phone}
            onChange={(event) => setField('phone', event.target.value)}
            error={errors.phone}
          />

          <Select
            label="Preferred time"
            value={form.preferredTime}
            onChange={(event) => setField('preferredTime', event.target.value)}
            options={timeSlotOptions}
          />

          <Button type="submit" fullWidth icon={Send} loading={submitting}>
            {submitting ? 'Sending…' : 'Request Callback'}
          </Button>

          <p className="text-center text-fluid-xs text-charcoal-400">
            We only use your number to contact you about this request.
          </p>
        </form>
      )}
    </Modal>
  );
}

export default CallbackModal;
