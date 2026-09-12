import { UIProvider } from './context/UIProvider';
import { settings, isSectionVisible } from './config/settings';

import { Preloader } from './components/layout/Preloader';
import { CustomCursor } from './components/layout/CustomCursor';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { FloatingWhatsApp } from './components/layout/FloatingWhatsApp';
import { MobileActionBar } from './components/layout/MobileActionBar';

import { Hero } from './sections/Hero';
import { TrustBar } from './sections/TrustBar';
import { Services } from './sections/Services';
import { HowItWorks } from './sections/HowItWorks';
import { About } from './sections/About';
import { WhyChooseUs } from './sections/WhyChooseUs';
import { Staff } from './sections/Staff';
import { TrustVerification } from './sections/TrustVerification';
import { Testimonials } from './sections/Testimonials';
import { Cities } from './sections/Cities';
import { FAQ } from './sections/FAQ';
import { CTABand } from './sections/CTABand';
import { Contact } from './sections/Contact';

import { BookingModal } from './components/booking/BookingModal';
import { ServiceModal } from './components/modals/ServiceModal';
import { StaffModal } from './components/modals/StaffModal';
import { CallbackModal } from './components/modals/CallbackModal';
import { LegalModal } from './components/modals/LegalModal';
import { WelcomePopup } from './components/popups/WelcomePopup';
import { ExitIntentPopup } from './components/popups/ExitIntentPopup';
import { Toasts } from './components/ui/Toasts';

/**
 * Page order follows the conversion path: what we do → can I trust it
 * → who are they → proof → does it cover me → objections → convert.
 * About sits before the trust sections so credibility is established
 * before the heavier verification detail.
 */
export default function App() {
  // Section order is fixed by the conversion argument above; only
  // visibility is configurable, from the admin panel's Settings page.
  const features = settings.features || {};

  return (
    <UIProvider>
      {features.preloader !== false && <Preloader />}
      {features.customCursor !== false && <CustomCursor />}

      <Navbar />

      <main id="main">
        <Hero />
        {isSectionVisible('trustBar') && <TrustBar />}
        {isSectionVisible('services') && <Services />}
        {isSectionVisible('howItWorks') && <HowItWorks />}
        {isSectionVisible('about') && <About />}
        {isSectionVisible('whyUs') && <WhyChooseUs />}
        {isSectionVisible('staff') && <Staff />}
        {isSectionVisible('trust') && <TrustVerification />}
        {isSectionVisible('testimonials') && <Testimonials />}
        {isSectionVisible('cities') && <Cities />}
        {isSectionVisible('faqs') && <FAQ />}
        {isSectionVisible('ctaBand') && <CTABand />}
        {isSectionVisible('contact') && <Contact />}
      </main>

      <Footer />

      {/* Persistent conversion affordances */}
      {features.floatingWhatsApp !== false && <FloatingWhatsApp />}
      {features.mobileActionBar !== false && <MobileActionBar />}

      {/* Dialogs — mounted once, controlled through UIProvider */}
      <BookingModal />
      <ServiceModal />
      <StaffModal />
      <CallbackModal />
      <LegalModal />
      {settings.popups?.welcome?.enabled !== false && <WelcomePopup />}
      {settings.popups?.exitIntent?.enabled !== false && <ExitIntentPopup />}
      <Toasts />
    </UIProvider>
  );
}
