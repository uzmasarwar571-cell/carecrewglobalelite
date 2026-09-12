/**
 * Form validation helpers.
 * Pakistani mobile numbers accepted in the common local formats:
 *   03XX-XXXXXXX · 03XXXXXXXXX · +923XXXXXXXXX · 00923XXXXXXXXX · 923XXXXXXXXX
 */

const digitsOnly = (value = '') => String(value).replace(/\D/g, '');

export function isValidPakistaniPhone(value) {
  const digits = digitsOnly(value);
  // 03XXXXXXXXX  -> 11 digits starting 03
  if (/^03\d{9}$/.test(digits)) return true;
  // 923XXXXXXXXX -> 12 digits starting 923 (covers +92 and 0092 once stripped)
  if (/^923\d{9}$/.test(digits)) return true;
  if (/^00923\d{9}$/.test(digits)) return true;
  return false;
}

/** Normalises any accepted format to 923XXXXXXXXX for storage/sending. */
export function normalisePakistaniPhone(value) {
  const digits = digitsOnly(value);
  if (/^03\d{9}$/.test(digits)) return `92${digits.slice(1)}`;
  if (/^00923\d{9}$/.test(digits)) return digits.slice(2);
  if (/^923\d{9}$/.test(digits)) return digits;
  return digits;
}

export function isValidEmail(value) {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(value).trim());
}

export const isNonEmpty = (value) => String(value ?? '').trim().length > 0;

/** Rejects dates in the past (today is allowed). */
export function isNotPastDate(value) {
  if (!value) return false;
  const picked = new Date(`${value}T00:00:00`);
  if (Number.isNaN(picked.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return picked >= today;
}

/** Today as yyyy-mm-dd, for the date input's `min` attribute. */
export function todayISO() {
  const d = new Date();
  const offset = d.getTimezoneOffset();
  return new Date(d.getTime() - offset * 60000).toISOString().slice(0, 10);
}

/** Human-readable date for the summary screen. */
export function formatDate(value) {
  if (!value) return '';
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/**
 * Validates one step of the booking form.
 * Returns an object of { fieldName: 'error message' }. Empty === valid.
 */
export function validateBookingStep(step, data) {
  const errors = {};

  if (step === 0) {
    if (!isNonEmpty(data.serviceId)) errors.serviceId = 'Please choose the service you need.';
  }

  if (step === 1) {
    if (!isNonEmpty(data.commitment)) errors.commitment = 'Please select full-time or part-time.';
    if (!isNonEmpty(data.residency)) errors.residency = 'Please select live-in or live-out.';
  }

  if (step === 2) {
    if (!isNonEmpty(data.city)) errors.city = 'Please select your city.';
    if (!isNonEmpty(data.area)) errors.area = 'Please tell us your area or sector.';
  }

  if (step === 3) {
    if (!isNonEmpty(data.name)) errors.name = 'Please enter your name.';
    else if (data.name.trim().length < 2) errors.name = 'Please enter your full name.';

    if (!isNonEmpty(data.phone)) errors.phone = 'Please enter your phone number.';
    else if (!isValidPakistaniPhone(data.phone))
      errors.phone = 'Enter a valid Pakistani number, e.g. 0300 1234567.';

    if (isNonEmpty(data.whatsapp) && !isValidPakistaniPhone(data.whatsapp))
      errors.whatsapp = 'Enter a valid Pakistani number, or leave this blank.';

    if (isNonEmpty(data.email) && !isValidEmail(data.email))
      errors.email = 'That email address does not look right.';
  }

  if (step === 4) {
    if (isNonEmpty(data.startDate) && !isNotPastDate(data.startDate))
      errors.startDate = 'Please choose today or a future date.';
  }

  return errors;
}

/** Validates the short callback-request form. */
export function validateCallback(data) {
  const errors = {};
  if (!isNonEmpty(data.name)) errors.name = 'Please enter your name.';
  if (!isNonEmpty(data.phone)) errors.phone = 'Please enter your phone number.';
  else if (!isValidPakistaniPhone(data.phone))
    errors.phone = 'Enter a valid Pakistani number, e.g. 0300 1234567.';
  return errors;
}
