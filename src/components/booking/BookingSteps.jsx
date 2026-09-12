import { motion } from 'framer-motion';
import { Check, Calendar, MapPin, User, ClipboardList, Sparkles, Info } from 'lucide-react';
import { cn } from '../../utils/cn';
import { bookingServiceOptions } from '../../data/services';
import { cityOptions } from '../../data/cities';
import { Input, Textarea, Select, ChoiceGroup, ChipGroup, Label } from '../ui/Field';
import {
  commitmentOptions,
  residencyOptions,
  experienceOptions,
  genderOptions,
  householdSizeOptions,
  dutyOptions,
} from './bookingConstants';
import { todayISO, formatDate } from '../../utils/validation';

/* ── Step 1: Service ─────────────────────────────────────── */

export function StepService({ data, setField, errors }) {
  return (
    <div>
      <StepIntro
        icon={Sparkles}
        title="What kind of help do you need?"
        subtitle="Pick the closest match — you can add detail in the next steps."
      />

      <div
        role="radiogroup"
        aria-label="Service required"
        aria-invalid={errors.serviceId ? true : undefined}
        className="grid grid-cols-2 gap-2.5 sm:grid-cols-3"
      >
        {bookingServiceOptions.map((option) => {
          const selected = data.serviceId === option.id;
          return (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => setField('serviceId', option.id)}
              className={cn(
                'group relative flex flex-col items-start gap-2.5 rounded-2xl border p-3.5 text-left transition-all duration-300 ease-premium sm:p-4',
                selected
                  ? 'border-emerald-600 bg-emerald-50 shadow-soft'
                  : 'border-emerald-900/12 bg-white hover:border-emerald-600/35 hover:bg-emerald-50/40'
              )}
            >
              <span
                className={cn(
                  'grid h-9 w-9 place-items-center rounded-xl transition-colors duration-300',
                  selected
                    ? 'bg-emerald-700 text-cream-50'
                    : 'bg-emerald-700/[0.07] text-emerald-700'
                )}
              >
                <option.icon className="h-[18px] w-[18px]" aria-hidden="true" />
              </span>
              <span
                className={cn(
                  'text-fluid-sm font-semibold leading-snug',
                  selected ? 'text-emerald-900' : 'text-charcoal-600'
                )}
              >
                {option.name}
              </span>

              {selected && (
                <motion.span
                  layoutId="booking-service-check"
                  className="absolute right-2.5 top-2.5 grid h-5 w-5 place-items-center rounded-full bg-emerald-700 text-cream-50"
                >
                  <Check className="h-3 w-3" strokeWidth={3} aria-hidden="true" />
                </motion.span>
              )}
            </button>
          );
        })}
      </div>

      {errors.serviceId && (
        <p role="alert" className="mt-3 text-fluid-xs font-medium text-red-600">
          {errors.serviceId}
        </p>
      )}
    </div>
  );
}

/* ── Step 2: Requirements ────────────────────────────────── */

export function StepRequirements({ data, setField, toggleDuty, errors }) {
  return (
    <div className="space-y-6">
      <StepIntro
        icon={ClipboardList}
        title="Tell us your requirements"
        subtitle="The more we know, the better the match — and the fewer meetings you sit through."
      />

      <ChoiceGroup
        label="Working arrangement"
        name="commitment"
        value={data.commitment}
        onChange={(value) => setField('commitment', value)}
        options={commitmentOptions}
        error={errors.commitment}
        columns={3}
      />

      <ChoiceGroup
        label="Live-in or live-out?"
        name="residency"
        value={data.residency}
        onChange={(value) => setField('residency', value)}
        options={residencyOptions}
        error={errors.residency}
        columns={3}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Select
          label="Preferred experience"
          value={data.experience}
          onChange={(event) => setField('experience', event.target.value)}
          options={experienceOptions}
        />
        <Select
          label="Household size"
          optional
          placeholder="Select…"
          value={data.householdSize}
          onChange={(event) => setField('householdSize', event.target.value)}
          options={householdSizeOptions}
        />
      </div>

      <ChoiceGroup
        label="Staff gender preference"
        name="genderPreference"
        value={data.genderPreference}
        onChange={(value) => setField('genderPreference', value)}
        options={genderOptions}
        columns={3}
        hint="Many households have a preference for this kind of work. Tell us either way."
      />

      <ChipGroup
        label="Required duties"
        hint="Tap all that apply — optional, but it helps."
        values={data.duties}
        onToggle={toggleDuty}
        options={dutyOptions}
      />

      <Textarea
        label="Anything else we should know?"
        optional
        rows={3}
        placeholder="For example: we have a small dog, or we need someone who can start early mornings."
        value={data.notes}
        onChange={(event) => setField('notes', event.target.value)}
      />
    </div>
  );
}

/* ── Step 3: Location ────────────────────────────────────── */

export function StepLocation({ data, setField, errors }) {
  return (
    <div className="space-y-5">
      <StepIntro
        icon={MapPin}
        title="Where do you need the staff?"
        subtitle="We use this to find people who can realistically travel to you."
      />

      <Select
        label="City"
        placeholder="Select your city"
        value={data.city}
        onChange={(event) => setField('city', event.target.value)}
        options={cityOptions}
        error={errors.city}
      />

      <Input
        label="Area or sector"
        placeholder="e.g. F-11, DHA Phase 5, Gulshan-e-Iqbal"
        value={data.area}
        onChange={(event) => setField('area', event.target.value)}
        error={errors.area}
      />

      <Textarea
        label="Full address"
        optional
        rows={2}
        placeholder="House / street details — only needed once a placement is confirmed."
        value={data.address}
        onChange={(event) => setField('address', event.target.value)}
        hint="You can leave this blank for now."
      />
    </div>
  );
}

/* ── Step 4: Contact ─────────────────────────────────────── */

export function StepContact({ data, setField, errors, sameAsPhone, setSameAsPhone }) {
  return (
    <div className="space-y-5">
      <StepIntro
        icon={User}
        title="How should we reach you?"
        subtitle="We only use these details to discuss your request."
      />

      <Input
        label="Full name"
        placeholder="e.g. Ayesha Khan"
        autoComplete="name"
        value={data.name}
        onChange={(event) => setField('name', event.target.value)}
        error={errors.name}
      />

      <Input
        label="Phone number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="0300 1234567"
        value={data.phone}
        onChange={(event) => setField('phone', event.target.value)}
        error={errors.phone}
      />

      <div>
        <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-emerald-900/12 bg-white p-3.5 transition-colors hover:border-emerald-600/35">
          <input
            type="checkbox"
            checked={sameAsPhone}
            onChange={(event) => setSameAsPhone(event.target.checked)}
            className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-emerald-700"
          />
          <span className="text-fluid-sm text-charcoal-600">
            My WhatsApp number is the same as my phone number
          </span>
        </label>

        {!sameAsPhone && (
          <Input
            className="mt-3"
            label="WhatsApp number"
            optional
            type="tel"
            inputMode="tel"
            placeholder="0300 1234567"
            value={data.whatsapp}
            onChange={(event) => setField('whatsapp', event.target.value)}
            error={errors.whatsapp}
          />
        )}
      </div>

      <Input
        label="Email"
        optional
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={data.email}
        onChange={(event) => setField('email', event.target.value)}
        error={errors.email}
      />
    </div>
  );
}

/* ── Step 5: Start date ──────────────────────────────────── */

export function StepSchedule({ data, setField, errors }) {
  return (
    <div className="space-y-5">
      <StepIntro
        icon={Calendar}
        title="When would you like to start?"
        subtitle="An approximate date is fine — we will confirm exact timings with you."
      />

      <div>
        <Label htmlFor="booking-start-date" optional>
          Preferred start date
        </Label>
        <input
          id="booking-start-date"
          type="date"
          min={todayISO()}
          value={data.startDate}
          onChange={(event) => setField('startDate', event.target.value)}
          aria-invalid={errors.startDate ? true : undefined}
          className={cn(
            'h-12 w-full rounded-2xl border bg-white px-4 text-fluid-base text-charcoal-800 transition-[border-color,box-shadow] duration-200 focus:outline-none focus:ring-4',
            errors.startDate
              ? 'border-red-400 focus:border-red-500 focus:ring-red-500/12'
              : 'border-emerald-900/12 focus:border-emerald-500 focus:ring-emerald-500/12'
          )}
        />
        {errors.startDate && (
          <p role="alert" className="mt-1.5 text-fluid-xs font-medium text-red-600">
            {errors.startDate}
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'As soon as possible', days: 0 },
          { label: 'Within a week', days: 7 },
          { label: 'Within two weeks', days: 14 },
          { label: 'Next month', days: 30 },
        ].map((option) => (
          <button
            key={option.label}
            type="button"
            onClick={() => {
              if (option.days === 0) {
                setField('startDate', '');
                return;
              }
              const date = new Date();
              date.setDate(date.getDate() + option.days);
              setField('startDate', date.toISOString().slice(0, 10));
            }}
            className="rounded-pill border border-emerald-900/12 bg-white px-3.5 py-2 text-fluid-sm text-charcoal-600 transition-colors duration-200 hover:border-emerald-600/40 hover:bg-emerald-50"
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="flex gap-3 rounded-2xl bg-cream-100 p-4">
        <Info className="mt-0.5 h-[18px] w-[18px] shrink-0 text-emerald-700" aria-hidden="true" />
        <p className="text-fluid-sm text-charcoal-500">
          Leaving this blank tells us you are flexible — which usually means we can match you
          faster.
        </p>
      </div>
    </div>
  );
}

/* ── Step 6: Summary ─────────────────────────────────────── */

export function StepSummary({ data, serviceName }) {
  const rows = [
    {
      heading: 'Service',
      items: [
        ['Service', serviceName],
        ['Arrangement', [data.commitment, data.residency].filter(Boolean).join(' · ') || '—'],
        ['Preferred experience', data.experience || '—'],
        ['Gender preference', data.genderPreference || '—'],
      ],
    },
    {
      heading: 'Location',
      items: [
        ['City', data.city || '—'],
        ['Area', data.area || '—'],
        ...(data.address ? [['Address', data.address]] : []),
      ],
    },
    {
      heading: 'Schedule',
      items: [
        ['Preferred start', data.startDate ? formatDate(data.startDate) : 'As soon as possible'],
        ...(data.householdSize ? [['Household size', data.householdSize]] : []),
      ],
    },
    {
      heading: 'Contact',
      items: [
        ['Name', data.name || '—'],
        ['Phone', data.phone || '—'],
        ...(data.whatsapp && data.whatsapp !== data.phone ? [['WhatsApp', data.whatsapp]] : []),
        ...(data.email ? [['Email', data.email]] : []),
      ],
    },
  ];

  return (
    <div>
      <StepIntro
        icon={Check}
        title="Check your request"
        subtitle="Make sure this looks right — you can go back and change anything."
      />

      <div className="space-y-3">
        {rows.map((group) => (
          <div key={group.heading} className="rounded-2xl border border-emerald-900/[0.08] bg-white p-4">
            <h4 className="text-fluid-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              {group.heading}
            </h4>
            <dl className="mt-3 space-y-2">
              {group.items.map(([term, value]) => (
                <div key={term} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                  <dt className="text-fluid-sm text-charcoal-400">{term}</dt>
                  <dd className="min-w-0 text-right text-fluid-sm font-semibold text-emerald-900">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}

        {data.duties.length > 0 && (
          <div className="rounded-2xl border border-emerald-900/[0.08] bg-white p-4">
            <h4 className="text-fluid-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Required duties
            </h4>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {data.duties.map((duty) => (
                <li
                  key={duty}
                  className="rounded-pill bg-emerald-50 px-2.5 py-1 text-fluid-xs font-medium text-emerald-800"
                >
                  {duty}
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.notes && (
          <div className="rounded-2xl border border-emerald-900/[0.08] bg-white p-4">
            <h4 className="text-fluid-xs font-bold uppercase tracking-[0.14em] text-emerald-700">
              Your notes
            </h4>
            <p className="mt-2 whitespace-pre-line text-fluid-sm text-charcoal-600">{data.notes}</p>
          </div>
        )}
      </div>

      <p className="mt-4 text-fluid-xs leading-relaxed text-charcoal-400">
        By submitting you agree that we may contact you about this request by phone, WhatsApp or
        email. We do not share your details with third parties.
      </p>
    </div>
  );
}

/* ── Shared step header ──────────────────────────────────── */

function StepIntro({ icon: Icon, title, subtitle }) {
  return (
    <div className="mb-5 flex items-start gap-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-emerald-700/[0.08] text-emerald-700">
        <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0">
        <h3 className="text-fluid-h4 font-semibold">{title}</h3>
        <p className="mt-0.5 text-fluid-sm text-charcoal-500">{subtitle}</p>
      </div>
    </div>
  );
}
