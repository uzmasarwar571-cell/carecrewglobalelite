export const defaultFaqs = [
  {
    id: 'f1',
    question: 'How do I hire a maid through Care Crew?',
    answer:
      'Send us a request through the booking form or message us on WhatsApp with what you need. We will discuss your requirements, share suitable candidates, arrange a meeting, and finalise once you are comfortable.',
  },
  {
    id: 'f2',
    question: 'Do you provide full-time maids?',
    answer:
      'Yes. We arrange both live-in and live-out full-time staff who work a full day, typically six days a week. Exact timings and terms are agreed between you and the staff member before starting.',
  },
  {
    id: 'f3',
    question: 'Do you provide part-time maids?',
    answer:
      'Yes. Part-time help is one of our most requested services — usually two to four hours a day, on the days and timings that suit your household.',
  },
  {
    id: 'f4',
    question: 'Which cities do you serve?',
    answer:
      'We currently serve Islamabad, Rawalpindi, Lahore and Karachi, including the main residential areas in each. If you are outside these cities, message us — we may still be able to help.',
  },
  {
    id: 'f5',
    question: 'Can I request a specific type of maid?',
    answer:
      'Absolutely. You can specify the type of work, preferred experience level, live-in or live-out, language, and gender preference where relevant. The more detail you give us, the better the match.',
  },
  {
    id: 'f6',
    question: 'How are staff selected?',
    answer:
      'We interview candidates, confirm their identity documents, check their previous work experience and references where available, and brief them on professional conduct before recommending them to a household.',
  },
  {
    id: 'f7',
    question: 'Do you provide replacement support?',
    answer:
      'Yes. If a placement does not work out or the staff member leaves early, contact us and we will help arrange a replacement. Specific replacement terms are confirmed with you at the time of booking.',
  },
  {
    id: 'f8',
    question: 'Can I contact you through WhatsApp?',
    answer:
      'Yes, and it is usually the fastest way. Tap any WhatsApp button on this site and it will open a chat with our team with a message already prepared.',
  },
  {
    id: 'f9',
    question: 'How quickly can I get a maid?',
    answer:
      'It depends on the service and your city. Common requests such as part-time cleaning are often arranged within a few days, while specialised roles can take longer to match properly. We would rather take an extra day than send the wrong person.',
  },
  {
    id: 'f10',
    question: 'What information do I need to provide?',
    answer:
      'Your city and area, the type of help you need, your preferred timings and start date, and a contact number. For live-in placements we will also discuss accommodation arrangements with you.',
  },
].map((faq, index) => ({ ...faq, published: true, order: index }));

/* ── Live binding ──────────────────────────────────────────── */

export let faqs = defaultFaqs;

export function applyFaqs(stored) {
  const source = Array.isArray(stored) && stored.length ? stored : defaultFaqs;
  faqs = source
    .filter((faq) => faq.published !== false)
    .slice()
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return faqs;
}

export default faqs;
