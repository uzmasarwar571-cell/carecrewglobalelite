# Care Crew Maid

Marketing and lead-generation website for **Care Crew Maid** — professional domestic staff
services in Pakistan (Islamabad, Rawalpindi, Lahore, Karachi).

React + Vite + Tailwind CSS + Framer Motion + Lucide icons, with a full **admin panel and
CMS** at `/admin` backed by Firebase.

The site runs with **no backend at all** — every piece of content ships in the code as a
working default. Connect Firebase and that content becomes editable from the admin panel
instead; if Firebase is ever unreachable, the site quietly falls back to the bundled
content rather than breaking.

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build into /dist
npm run preview  # preview the production build
```

The admin panel lives at **`/admin`**. See **[ADMIN.md](ADMIN.md)** for Firebase setup,
first-run ownership, roles and deployment.

---

## Two ways to edit the site

| | Where | Best for |
| --- | --- | --- |
| **Admin panel** | `/admin` in a browser | Day-to-day editing by the owner. Copy, services, staff, theme, images, SEO, leads |
| **Code defaults** | `src/config/` and `src/data/` | The initial content, and what the site falls back to if Firebase is unavailable |

Both describe the same shape. The panel's *Import content* button copies the code
defaults into Firebase to get started, and each editor has a **Restore defaults** action
that puts the bundled version back.

---

## The three files you will actually edit (without the panel)

### 1. `src/config/business.js` — contact details & stats

Phone, WhatsApp number, email, working hours, social links and the headline statistics all
live here. Change them once and they update everywhere on the site, including the
LocalBusiness structured data used by Google.

```js
phone: '+92 347 5133101',   // shown to customers
phoneDial: '+923475133101', // used in tel: links
whatsapp: '923475133101',   // international format, no + or spaces
email: 'carecrewmaidsagency@gmail.com',
```

> The `stats` array (500+ families, 1,000+ placements, …) is **placeholder data**.
> Replace it with your real numbers, or delete any entry you cannot substantiate.

### 2. `src/config/images.js` — photography

Every photo is referenced from this one file. To use your own:

1. Put the files in `public/images/`
2. Change the URL to `/images/your-file.jpg`

The stock URLs currently in place are **placeholders** showing homes and interiors. They
should be replaced with photographs of your own work before launch.

**On photos of people:** staff cards deliberately use generated monogram tiles rather than
stock photos of models. Stock people read as fake and they misrepresent who will actually
arrive at a customer's door. When you have real, consented photographs, set the `photo`
field on a staff member in `src/data/staff.js` and the card will use it automatically.

### 3. `src/data/*.js` — content

| File | Contains |
| --- | --- |
| `services.js` | The eight services, their descriptions, inclusions and options |
| `cities.js` | Cities and areas served — add one and it appears in the grid, footer and booking form |
| `staff.js` | Example staff profiles (**placeholder** — shaped like a future API response) |
| `testimonials.js` | Customer reviews (**placeholder** — replace with real, permitted reviews) |
| `faqs.js` | FAQ accordion, also feeds FAQPage structured data |
| `content.js` | How-it-works steps, trust pillars, verification steps, values |
| `copy.js` | Every headline, paragraph and button label on the page |
| `legal.js` | Privacy Policy and Terms wording |

Icons are stored as **names** (`'ShieldCheck'`) rather than imported components, so the
same objects round-trip through Firestore unchanged. `src/lib/icons.js` resolves a name
back to a component and is also the list the admin's icon picker offers.

---

## Where enquiries go

Every submission passes through **one file**: `src/services/bookingService.js`.

It writes a flat lead document to the Firestore `leads` collection, which the admin
inbox reads. Two safety properties are deliberate:

- If Firebase is not configured, or the write fails, the submission still **succeeds** for
  the customer and is kept in `localStorage` under `ccm_submissions`. A backend outage must
  never look to a customer like their enquiry vanished.
- The document is **flat**, not nested, because Firestore can only index and query
  top-level fields — the inbox filters on status, city and service.

---

## How content reaches the page

Content lives in module-level **live ES bindings** (`export let services`) rather than in
React context. `src/content/hydrate.js` fetches from Firestore before the first render and
swaps those bindings out, so every component keeps its plain
`import { services } from '../data/services'` and still sees CMS-managed data — with no
prop drilling, no provider wrapping and no flash of placeholder copy.

```
src/content/hydrate.js   fetch → apply to the data modules → notify
src/content/store.js     tells React when to re-render
src/theme/               tokens, colour maths, runtime CSS-variable application
```

Firebase is split by SDK so the marketing site stays light: visitors download the
**Firestore Lite** client (~37 KB gzipped) and never the full SDK, Auth or Storage —
those load only inside `/admin`.

---

## Before you launch

- [ ] Replace `siteUrl` in `src/config/business.js` with your real domain
- [ ] Update the canonical URL and Open Graph URLs in `index.html`
- [ ] Add a 1200×630 share image at `public/og-image.jpg`
- [ ] Update the sitemap URL in `public/robots.txt`
- [ ] Replace the placeholder statistics with real numbers
- [ ] Replace the placeholder testimonials with real reviews
- [ ] Replace the placeholder photography
- [ ] Have the Privacy Policy and Terms reviewed, then replace the text under
      *Content → Legal pages* (or in `src/data/legal.js`) and switch off the draft notice
- [ ] Add your social media links (empty links are hidden automatically, so the footer
      icons only appear once you fill them in)
- [ ] Deploy the Firestore security rules — see [ADMIN.md](ADMIN.md)

### A note on trust claims

The verification copy in `src/data/content.js` describes only checks that are actually
performed: in-person interviews, CNIC verification, experience checks and conduct briefing.
It deliberately avoids claims like "police verified", which carry legal weight in Pakistan.
If you add such a claim, make sure you carry out that process and can evidence it.

---

## Project structure

```
src/
  admin/          The admin panel — lazily loaded, never shipped to visitors
    auth/         Sign-in, first-run ownership, role gating
    data/         Firestore hooks, mutations + audit log, content schemas, seeding
    layout/       Sidebar, top bar, command palette
    pages/        Overview, Leads, Copy, Blocks, Collections, Theme, Media, Settings, Team, Activity
    ui/           Admin-only design system: primitives, overlays, fields, charts
  components/
    booking/      Multi-step booking modal and its steps
    layout/       Navbar, mobile menu, footer, floating CTAs, preloader, cursor
    modals/       Service, staff, callback and legal dialogs
    popups/       Welcome and exit-intent prompts
    ui/           Button, Modal, form fields, Accordion, Avatar, Counter, Reveal, Toasts
  config/         business.js, images.js, settings.js   ← defaults + live bindings
  content/        Firestore hydration and the re-render store
  context/        UIProvider — modal and toast state
  data/           services, cities, staff, testimonials, faqs, content, copy, legal
  hooks/          scroll, media queries, focus trap, count-up, exit intent
  lib/            Firebase clients, Firestore layout, icon registry
  seo/            LocalBusiness + FAQPage structured data, head metadata
  sections/       The homepage sections, in page order
  services/       bookingService.js  ← where enquiries are written
  theme/          Design tokens, colour maths, runtime theming
  utils/          whatsapp, validation, motion variants, deep merge, classnames

firestore.rules   Security rules — deploy these before going live
storage.rules     Upload rules for the media library
firebase.json     Hosting, rules and emulator configuration
```

The admin panel deliberately does **not** reuse the public site's components. Those are
themeable by the very panel you would be fixing them from, so a bad theme could make the
controls unreadable. It has its own small design system built on Tailwind's stock palette,
with a dark-mode switch.

---

## Accessibility & motion

- Semantic landmarks, a skip link, and labelled form fields throughout
- Dialogs trap focus, close on Escape and on backdrop click, and return focus to the trigger
- Inline, screen-reader-announced validation errors — no browser `alert()`
- Every animation respects `prefers-reduced-motion`: movement is replaced with a plain
  fade, counters jump straight to their value, and the preloader is shortened

## Responsive behaviour

Fluid typography and spacing via `clamp()` mean the layout scales continuously rather than
jumping at breakpoints. Verified from 320 px through to ultra-wide with no horizontal
overflow. On phones a fixed bottom bar keeps **WhatsApp · Call · Book Now** within thumb
reach; on desktop the floating WhatsApp button takes over.
