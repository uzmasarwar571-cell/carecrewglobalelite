import { businessConfig } from '../config/business';
import { services } from '../data/services';
import { cities } from '../data/cities';
import { faqs } from '../data/faqs';

/**
 * Builds LocalBusiness + FAQPage structured data from the same config
 * the page renders from, so search results can never disagree with
 * what a visitor actually sees.
 */
function buildLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${businessConfig.siteUrl}/#business`,
    name: businessConfig.name,
    description: businessConfig.description,
    url: businessConfig.siteUrl,
    telephone: businessConfig.phoneDial,
    email: businessConfig.email,
    priceRange: 'PKR',
    address: {
      '@type': 'PostalAddress',
      streetAddress: businessConfig.address.street || undefined,
      addressLocality: businessConfig.address.locality,
      addressRegion: businessConfig.address.region,
      postalCode: businessConfig.address.postalCode || undefined,
      addressCountry: businessConfig.address.country,
    },
    areaServed: cities.map((city) => ({
      '@type': 'City',
      name: city.name,
      containedInPlace: { '@type': 'Country', name: 'Pakistan' },
    })),
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '21:00',
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: 'Sunday',
        opens: '11:00',
        closes: '19:00',
      },
    ],
    sameAs: Object.values(businessConfig.social).filter(Boolean),
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Domestic staff services',
      itemListElement: services.map((service) => ({
        '@type': 'Offer',
        itemOffered: {
          '@type': 'Service',
          name: service.name,
          description: service.summary,
          serviceType: service.serviceType,
        },
      })),
    },
  };
}

function buildFaqPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };
}

/** Injects both graphs as a single <script type="application/ld+json">. */
export function injectStructuredData() {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('ccm-structured-data');
  if (existing) existing.remove();

  const script = document.createElement('script');
  script.id = 'ccm-structured-data';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify([buildLocalBusiness(), buildFaqPage()]);
  document.head.appendChild(script);
}
