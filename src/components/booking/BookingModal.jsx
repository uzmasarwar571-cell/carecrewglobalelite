import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, Send, MessageCircle, PartyPopper, Copy, Check } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useUI } from '../../context/UIProvider';
import { usePrefersReducedMotion } from '../../hooks';
import { getServiceById } from '../../data/services';
import { validateBookingStep } from '../../utils/validation';
import { buildBookingPayload, submitBooking } from '../../services/bookingService';
import { bookingToWhatsAppMessage, openWhatsApp } from '../../utils/whatsapp';
import { steps, initialBookingState } from './bookingConstants';
import {
  StepService,
  StepRequirements,
  StepLocation,
  StepContact,
  StepSchedule,
  StepSummary,
} from './BookingSteps';
import { cn } from '../../utils/cn';
import { EASE } from '../../utils/motion';

/**
 * Multi-step booking request.
 *
 * Each step validates before advancing, so the user never reaches the
 * summary with a broken phone number. Submission goes through
 * services/bookingService.js — the single seam for a future API.
 */
export function BookingModal() {
  const { bookingOpen, bookingServiceId, closeBooking, toast } = useUI();
  const prefersReduced = usePrefersReducedMotion();

  const [stepIndex, setStepIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [data, setData] = useState(initialBookingState);
  const [errors, setErrors] = useState({});
  const [sameAsPhone, setSameAsPhone] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null); // { reference }
  const [copied, setCopied] = useState(false);

  const bodyRef = useRef(null);

  const totalSteps = steps.length;
  const isLastStep = stepIndex === totalSteps - 1;
  const service = getServiceById(data.serviceId);
  const serviceName =
    service?.name || (data.serviceId === 'other' ? 'Something Else' : 'Not selected');

  /* Reset whenever the modal is opened, honouring any pre-selected service. */
  useEffect(() => {
    if (!bookingOpen) return;
    setStepIndex(bookingServiceId ? 1 : 0);
    setDirection(1);
    setData({ ...initialBookingState, serviceId: bookingServiceId || '' });
    setErrors({});
    setSameAsPhone(true);
    setSubmitting(false);
    setResult(null);
    setCopied(false);
  }, [bookingOpen, bookingServiceId]);

  /* Scroll the panel body back to the top on step change. */
  useEffect(() => {
    const node = bodyRef.current?.closest('.scrollbar-slim');
    if (node) node.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }, [stepIndex, prefersReduced]);

  const setField = useCallback((field, value) => {
    setData((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }, []);

  const toggleDuty = useCallback((duty) => {
    setData((current) => ({
      ...current,
      duties: current.duties.includes(duty)
        ? current.duties.filter((item) => item !== duty)
        : [...current.duties, duty],
    }));
  }, []);

  const goNext = useCallback(() => {
    const stepErrors = validateBookingStep(stepIndex, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setDirection(1);
    setStepIndex((index) => Math.min(index + 1, totalSteps - 1));
  }, [stepIndex, data, totalSteps]);

  const goBack = useCallback(() => {
    setErrors({});
    setDirection(-1);
    setStepIndex((index) => Math.max(index - 1, 0));
  }, []);

  const handleSubmit = useCallback(async () => {
  // Re-run every step's validation before hitting the service.
  for (let step = 0; step < totalSteps - 1; step += 1) {
    const stepErrors = validateBookingStep(step, data);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      setDirection(-1);
      setStepIndex(step);
      toast('Some details need fixing before we can send this.', 'error');
      return;
    }
  }

  setSubmitting(true);
  const payload = buildBookingPayload(
    { ...data, whatsapp: sameAsPhone ? data.phone : data.whatsapp },
    serviceName
  );
  const response = await submitBooking(payload);
  setSubmitting(false);

  if (!response.ok) {
    toast(response.error, 'error');
    return;
  }

  // Send the booking details to the business WhatsApp number
  const businessNumber = '923475133101';
  const bookingMessage = bookingToWhatsAppMessage({
    ...data,
    serviceName,
    whatsapp: sameAsPhone ? data.phone : data.whatsapp,
  });

  const encodedMessage = encodeURIComponent(bookingMessage);
  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMessage}`;

  // Open WhatsApp in a new tab (or use window.location for same tab)
  window.open(whatsappUrl, '_blank');

  setResult({ reference: response.reference });
  toast(
    response.warning || 'Request received — we will be in touch shortly.',
    response.warning ? 'info' : 'success'
  );
}, [data, sameAsPhone, serviceName, toast, totalSteps]);


  
  const copyReference = useCallback(async () => {
    if (!result?.reference) return;
    try {
      await navigator.clipboard.writeText(result.reference);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast('Could not copy — please note the reference manually.', 'info');
    }
  }, [result, toast]);

  const slideVariants = useMemo(
    () =>
      prefersReduced
        ? {
            enter: { opacity: 0 },
            center: { opacity: 1 },
            exit: { opacity: 0, position: 'absolute', inset: 0 },
          }
        : {
            enter: (dir) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
            center: { opacity: 1, x: 0 },
            exit: (dir) => ({
              opacity: 0,
              x: dir > 0 ? -40 : 40,
              position: 'absolute',
              inset: 0,
            }),
          },
    [prefersReduced]
  );

  /* ── Success state ───────────────────────────────────── */
  if (result) {
    return (
      <Modal open={bookingOpen} onClose={closeBooking} size="md" labelledBy="booking-success-title">
        <SuccessState
          reference={result.reference}
          onClose={closeBooking}
          onWhatsApp={() =>
            openWhatsApp(
              bookingToWhatsAppMessage({
                ...data,
                serviceName,
                whatsapp: sameAsPhone ? data.phone : data.whatsapp,
              })
            )
          }
          onCopy={copyReference}
          copied={copied}
        />
      </Modal>
    );
  }

  /* ── Form ────────────────────────────────────────────── */
  return (
    <Modal
      open={bookingOpen}
      onClose={closeBooking}
      size="lg"
      title="Book a Maid"
      description={`Step ${stepIndex + 1} of ${totalSteps} — ${steps[stepIndex].label}`}
      footer={
        <div className="flex items-center gap-3">
          {stepIndex > 0 ? (
            <Button variant="ghost" icon={ArrowLeft} iconPosition="left" onClick={goBack} disabled={submitting}>
              Back
            </Button>
          ) : (
            <span className="hidden text-fluid-xs text-charcoal-400 sm:block">
              Takes about a minute
            </span>
          )}

          <div className="ml-auto flex items-center gap-2">
            {isLastStep ? (
              <Button icon={Send} onClick={handleSubmit} loading={submitting}>
                {submitting ? 'Sending…' : 'Submit Request'}
              </Button>
            ) : (
              <Button icon={ArrowRight} onClick={goNext}>
                Continue
              </Button>
            )}
          </div>
        </div>
      }
    >
      {/* Progress */}
      <div className="mb-6">
        <div className="mb-3 hidden items-center justify-between gap-1 sm:flex">
          {steps.map((step, index) => {
            const done = index < stepIndex;
            const current = index === stepIndex;
            return (
              <button
                key={step.key}
                type="button"
                // Only completed steps are navigable — jumping ahead would
                // skip validation.
                disabled={index > stepIndex}
                onClick={() => {
                  setDirection(index > stepIndex ? 1 : -1);
                  setStepIndex(index);
                }}
                className={cn(
                  'flex-1 text-left transition-opacity duration-300',
                  index > stepIndex && 'cursor-default opacity-45'
                )}
              >
                <span
                  className={cn(
                    'block h-1 rounded-full transition-colors duration-500 ease-premium',
                    done || current ? 'bg-emerald-600' : 'bg-emerald-900/10'
                  )}
                />
                <span
                  className={cn(
                    'mt-2 block truncate text-[11px] font-semibold',
                    current ? 'text-emerald-800' : 'text-charcoal-400'
                  )}
                >
                  {step.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* Compact progress on phones */}
        <div className="sm:hidden">
          <div className="flex items-center justify-between text-fluid-xs font-semibold">
            <span className="text-emerald-800">{steps[stepIndex].label}</span>
            <span className="text-charcoal-400">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-emerald-900/10">
            <motion.div
              className="h-full rounded-full bg-emerald-600"
              animate={{ width: `${((stepIndex + 1) / totalSteps) * 100}%` }}
              transition={{ duration: prefersReduced ? 0 : 0.4, ease: EASE }}
            />
          </div>
        </div>
      </div>

      {/* Steps */}
      <div ref={bodyRef} className="relative">
        <AnimatePresence mode="popLayout" custom={direction} initial={false}>
          <motion.div
            key={stepIndex}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: prefersReduced ? 0.18 : 0.32, ease: EASE }}
          >
            {stepIndex === 0 && <StepService data={data} setField={setField} errors={errors} />}
            {stepIndex === 1 && (
              <StepRequirements
                data={data}
                setField={setField}
                toggleDuty={toggleDuty}
                errors={errors}
              />
            )}
            {stepIndex === 2 && <StepLocation data={data} setField={setField} errors={errors} />}
            {stepIndex === 3 && (
              <StepContact
                data={data}
                setField={setField}
                errors={errors}
                sameAsPhone={sameAsPhone}
                setSameAsPhone={setSameAsPhone}
              />
            )}
            {stepIndex === 4 && <StepSchedule data={data} setField={setField} errors={errors} />}
            {stepIndex === 5 && <StepSummary data={data} serviceName={serviceName} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </Modal>
  );
}

/* ── Success ──────────────────────────────────────────────── */

function SuccessState({ reference, onClose, onWhatsApp, onCopy, copied }) {
  const prefersReduced = usePrefersReducedMotion();

  return (
    <div className="py-4 text-center">
      <motion.div
        initial={prefersReduced ? { opacity: 0 } : { scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.05 }}
        className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-700 text-cream-50"
      >
        <PartyPopper className="h-9 w-9" aria-hidden="true" />
      </motion.div>

      {/* Celebratory ring */}
      {!prefersReduced && (
        <motion.span
          className="pointer-events-none mx-auto -mt-20 block h-20 w-20 rounded-full border-2 border-emerald-500"
          initial={{ scale: 1, opacity: 0.7 }}
          animate={{ scale: 1.9, opacity: 0 }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
          aria-hidden="true"
        />
      )}

      <h2 id="booking-success-title" className="mt-6 text-fluid-h2 font-semibold">
        Request Received 🎉
      </h2>
      <p className="mx-auto mt-3 max-w-md text-fluid-base text-charcoal-500">
        Our Care Crew team will contact you shortly to discuss your requirements and share suitable
        candidates.
      </p>

      <button
        type="button"
        onClick={onCopy}
        className="group mx-auto mt-6 inline-flex items-center gap-2.5 rounded-2xl border border-emerald-900/[0.08] bg-cream-100 px-4 py-3 transition-colors duration-200 hover:border-emerald-600/30"
      >
        <span className="text-fluid-xs font-semibold uppercase tracking-[0.14em] text-charcoal-400">
          Reference
        </span>
        <span className="font-mono text-fluid-sm font-bold text-emerald-900">{reference}</span>
        {copied ? (
          <Check className="h-4 w-4 text-emerald-600" aria-hidden="true" />
        ) : (
          <Copy className="h-4 w-4 text-charcoal-400 transition-colors group-hover:text-emerald-700" aria-hidden="true" />
        )}
        <span className="sr-only">{copied ? 'Reference copied' : 'Copy reference'}</span>
      </button>

      <div className="mt-8 flex flex-col gap-3 xs:flex-row xs:justify-center">
        <Button variant="whatsapp" icon={MessageCircle} iconPosition="left" onClick={onWhatsApp}>
          Contact us on WhatsApp
        </Button>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>

      <p className="mt-6 text-fluid-xs text-charcoal-400">
        Sending your details on WhatsApp too usually gets you a faster reply.
      </p>
    </div>
  );
}

export default BookingModal;
