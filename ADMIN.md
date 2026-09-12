# Care Crew Maid — Admin Panel

A full content management system for the site, at **`/admin`**. Everything the public
site shows — copy, services, staff, cities, testimonials, FAQs, colours, fonts, images,
SEO, popups and legal text — is editable from here, and every enquiry the site receives
lands in the leads inbox.

Firebase is the backend: **Firestore** for content and leads, **Auth** for sign-in,
**Storage** for uploaded images.

---

## 1. Set up Firebase (about ten minutes)

1. **Create a project** at [console.firebase.google.com](https://console.firebase.google.com).

2. **Add a Web app** (the `</>` icon). Firebase shows a config object — keep the tab open.

3. **Enable the three services:**
   - *Authentication* → Sign-in method → **Email/Password** → Enable
   - *Firestore Database* → Create database → **Production mode** → pick a region
   - *Storage* → Get started → **Production mode**

4. **Add your credentials.** Copy `.env.example` to `.env` and paste the values in:

   ```bash
   cp .env.example .env
   ```

   ```
   VITE_FIREBASE_API_KEY=AIza…
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
   VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
   VITE_FIREBASE_APP_ID=1:123…:web:abc…
   ```

   Restart `npm run dev` — Vite only reads `.env` at startup.

   > These values are **public by design**. A Firebase web config is visible in every
   > client bundle; it identifies the project, it does not authorise anything. Your data
   > is protected by the security rules in the next step, so do not skip them.

5. **Deploy the security rules — do this before creating your account.**

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase use --add          # pick the project you just created
   npm run deploy:rules
   ```

   Without this, Firestore is either fully locked (nothing works) or fully open
   (anyone can rewrite your site). The rules in `firestore.rules` make site content
   world-readable, leads write-only for the public, and everything else admin-only.

---

## 2. Create your account and claim ownership

1. In the Firebase console: **Authentication → Users → Add user**. Enter your email and a
   strong password.
2. Open **`/admin`** on the site and sign in.
3. The panel detects that no administrator exists yet and offers **Claim ownership**.
   Enter your name and confirm.

That writes your admin record and a one-time marker that closes the door: every later
attempt to claim ownership is refused by the security rules.

> **Do this immediately after deploying the rules.** In the window between the two, any
> account that can sign in could claim ownership.

---

## 3. Import your content

The site ships with all of its content built into the code, so it works with no database
at all. To manage it from the panel, it has to exist *in* the database.

On first sign-in the Overview page shows **Import your site content**. One click copies
the services, staff, cities, testimonials, FAQs, page copy, theme and settings into
Firestore. Existing records are never overwritten.

After importing, Firestore is the source of truth. If it is ever unreachable, the site
silently falls back to the bundled content rather than failing.

---

## What each section does

| Section | What it controls |
| --- | --- |
| **Overview** | Enquiry volume, pipeline, most-requested services and cities, recent leads |
| **Leads** | Every booking and callback request: pipeline status, internal notes, one-tap WhatsApp/call, CSV export |
| **Page copy** | Every headline, paragraph and button label, grouped by section in page order |
| **Content blocks** | Process steps, trust pillars, verification checklist, hero badges, About values |
| **Services / Staff / Cities / Testimonials / FAQs** | Full CRUD with drag-free reordering, publish/unpublish and duplication |
| **Legal pages** | Privacy Policy and Terms, section by section |
| **Theme** | Brand colours, presets, fonts, corner rounding, motion — with live preview and contrast checking |
| **Media** | Image uploads to Firebase Storage, reusable from any image field |
| **Settings** | Contact details, hours, statistics, section visibility, popups, WhatsApp templates, SEO |
| **Team** | Who can sign in, and what they may change |
| **Activity log** | Append-only record of every change: who, what, when |

---

## Roles

| Role | Can do |
| --- | --- |
| **Owner** | Everything, including managing admins and deleting content |
| **Editor** | All content, theme and settings. Cannot manage admins |
| **Staff** | Read and work the leads inbox only |

Roles are enforced by the Firestore security rules as well as by the interface, so a
Staff-role account cannot change content even by calling the database directly.

### Adding someone

The panel grants **access**; it does not create Firebase accounts. Creating one from the
browser would sign you out of your own session — Firebase swaps the active user — and
doing it properly requires the Admin SDK on a server.

1. Firebase console → **Authentication → Users → Add user**
2. Copy the **User UID** Firebase shows
3. Admin panel → **Team → Grant access** → paste the UID, pick a role

---

## How the theme system works

Every brand colour is a CSS custom property (`--c-emerald-700`, `--c-cream-100`, …) that
Tailwind reads through `rgb(var(--c-emerald-700) / <alpha-value>)`. Changing the theme
rewrites those variables at runtime, so the whole site restyles without a rebuild and
opacity modifiers like `bg-emerald-900/15` keep working.

**Simple mode** regenerates a whole scale from one anchor colour, reusing the lightness
curve of the original hand-tuned palette. That is what keeps contrast relationships
intact when the brand colour changes. **Advanced mode** exposes all 27 steps.

The Readability panel checks the eight text pairs that actually carry meaning on the page
and flags anything below WCAG AA before you save.

---

## Deploying

```bash
npm run build
```

`/admin` is a client-side route, so **the host must serve `index.html` for every path**
or a hard refresh on `/admin` returns 404. Configuration is already included for:

- **Firebase Hosting** — `firebase.json` (`npm run deploy:hosting`)
- **Netlify / Cloudflare Pages** — `public/_redirects`
- **Vercel** — `vercel.json`

Set the same `VITE_FIREBASE_*` variables in your host's environment settings — they are
baked in at build time, so a build without them produces a site with no admin panel.

### Before launch

- [ ] Security rules deployed (`npm run deploy:rules`)
- [ ] Ownership claimed, and the account uses a strong password
- [ ] Content imported and reviewed
- [ ] Placeholder statistics replaced with real numbers
- [ ] Placeholder testimonials replaced with real, permitted reviews
- [ ] Privacy Policy and Terms reviewed by a professional, then the draft notice
      switched off under *Legal pages*
- [ ] `Settings → SEO → Allow search engines to index this site` switched **on**
- [ ] `Settings → Business → Website URL` set to the real domain

---

## Troubleshooting

**"Missing or insufficient permissions"**
The rules are not deployed, or your account has no `admins/{uid}` record. Run
`npm run deploy:rules`, then check *Team*.

**The panel shows "Firebase is not configured"**
`.env` is missing, incomplete, or the dev server was not restarted after creating it.
The setup screen lists exactly which variables are missing.

**"Email/password sign-in is switched off"**
Firebase console → Authentication → Sign-in method → enable **Email/Password**.

**Content edits do not appear on the public site**
The public site reads content once per page load (it uses the lightweight Firestore
client, which has no realtime listeners — a deliberate trade that keeps ~110 KB out of
every visitor's download). Reload the page, or switch back to the tab.

**An enquiry never reached the inbox**
Every submission is also written to `localStorage` under `ccm_submissions` as a safety
net, so nothing is lost even if the database write fails. Check the browser console on
the device that submitted it.
