import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

/**
 * One small store for cross-cutting UI: which modal is open, which
 * service it was opened with, and the toast queue. This is what lets a
 * "Request This Service" button inside a service modal hand off to the
 * booking form with the service already selected.
 */
const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingServiceId, setBookingServiceId] = useState('');
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [activeStaff, setActiveStaff] = useState(null);
  const [legalDoc, setLegalDoc] = useState(null); // 'privacy' | 'terms' | null
  const [exitIntentOpen, setExitIntentOpen] = useState(false);
  const [toasts, setToasts] = useState([]);
  const toastId = useRef(0);

  /** Opens the booking modal, optionally pre-selecting a service. */
  const openBooking = useCallback((serviceId = '') => {
    setBookingServiceId(serviceId);
    setActiveService(null);
    setActiveStaff(null);
    setExitIntentOpen(false);
    setBookingOpen(true);
  }, []);

  const closeBooking = useCallback(() => setBookingOpen(false), []);

  const openCallback = useCallback(() => {
    setActiveService(null);
    setActiveStaff(null);
    setExitIntentOpen(false);
    setCallbackOpen(true);
  }, []);

  const closeCallback = useCallback(() => setCallbackOpen(false), []);

  const openServiceDetail = useCallback((service) => setActiveService(service), []);
  const closeServiceDetail = useCallback(() => setActiveService(null), []);

  const openStaffDetail = useCallback((member) => setActiveStaff(member), []);
  const closeStaffDetail = useCallback(() => setActiveStaff(null), []);

  const openLegal = useCallback((doc) => {
    setActiveService(null);
    setActiveStaff(null);
    setLegalDoc(doc);
  }, []);
  const closeLegal = useCallback(() => setLegalDoc(null), []);

  const openExitIntent = useCallback(() => setExitIntentOpen(true), []);
  const closeExitIntent = useCallback(() => setExitIntentOpen(false), []);

  /**
   * True whenever any dialog owns the screen. Two open dialogs would each
   * save and restore document.body.overflow, and the second restore would
   * put back "hidden" — leaving the page permanently unscrollable. Callers
   * that can open a dialog unprompted (the popups) check this first.
   */
  const anyDialogOpen =
    bookingOpen ||
    callbackOpen ||
    exitIntentOpen ||
    Boolean(activeService) ||
    Boolean(activeStaff) ||
    Boolean(legalDoc);

  const dismissToast = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  /** toast('Saved', 'success') — auto-dismisses after 5s. */
  const toast = useCallback(
    (message, variant = 'info') => {
      toastId.current += 1;
      const id = toastId.current;
      setToasts((current) => [...current, { id, message, variant }]);
      window.setTimeout(() => dismissToast(id), 5000);
      return id;
    },
    [dismissToast]
  );

  const value = useMemo(
    () => ({
      bookingOpen,
      bookingServiceId,
      openBooking,
      closeBooking,
      callbackOpen,
      openCallback,
      closeCallback,
      activeService,
      openServiceDetail,
      closeServiceDetail,
      activeStaff,
      openStaffDetail,
      closeStaffDetail,
      legalDoc,
      openLegal,
      closeLegal,
      exitIntentOpen,
      openExitIntent,
      closeExitIntent,
      anyDialogOpen,
      toasts,
      toast,
      dismissToast,
    }),
    [
      bookingOpen,
      bookingServiceId,
      openBooking,
      closeBooking,
      callbackOpen,
      openCallback,
      closeCallback,
      activeService,
      openServiceDetail,
      closeServiceDetail,
      activeStaff,
      openStaffDetail,
      closeStaffDetail,
      legalDoc,
      openLegal,
      closeLegal,
      exitIntentOpen,
      openExitIntent,
      closeExitIntent,
      anyDialogOpen,
      toasts,
      toast,
      dismissToast,
    ]
  );

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used inside <UIProvider>');
  return context;
}

export default UIProvider;
