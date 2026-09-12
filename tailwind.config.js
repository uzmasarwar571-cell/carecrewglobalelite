/**
 * Builds `{ 500: 'rgb(var(--c-name-500) / <alpha-value>)', … }` for a scale.
 * Declaring the stops explicitly (rather than generating them) keeps the
 * class names Tailwind can see identical to what the JIT scanner expects.
 */
const ramp = (name, stops) =>
  Object.fromEntries(stops.map((stop) => [stop, `rgb(var(--c-${name}-${stop}) / <alpha-value>)`]));

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  /**
   * Class-based so the ADMIN panel can offer a dark-mode switch without
   * the public marketing site ever following the visitor's OS setting —
   * the public site is deliberately light-only.
   */
  darkMode: 'class',
  theme: {
    // Full breakpoint ladder: 360px phones -> ultrawide desktops.
    screens: {
      xs: '380px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1800px',
    },
    container: {
      center: true,
      padding: {
        DEFAULT: '1.125rem',
        xs: '1.25rem',
        sm: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      screens: {
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1220px',
        '2xl': '1320px',
        '3xl': '1400px',
      },
    },
    extend: {
      /**
       * Brand colours resolve through CSS custom properties (defined in
       * src/index.css, overwritten at runtime by src/theme/applyTheme.js).
       * The `<alpha-value>` placeholder keeps Tailwind's opacity modifiers
       * working — `bg-emerald-900/15` still does what it always did.
       *
       * The default values of those variables ARE the original palette,
       * so nothing changes visually until the admin theme editor is used.
       */
      colors: {
        // Deep emerald — the brand anchor.
        emerald: ramp('emerald', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        // Warm neutrals.
        cream: ramp('cream', [50, 100, 200, 300, 400]),
        sand: 'rgb(var(--c-sand) / <alpha-value>)',
        // Subtle gold accent — used sparingly.
        gold: ramp('gold', [200, 300, 400, 500, 600]),
        charcoal: ramp('charcoal', [400, 500, 600, 700, 800, 900]),
        whatsapp: 'rgb(var(--c-whatsapp) / <alpha-value>)',
      },
      fontFamily: {
        // Full fallback stacks live inside the variables themselves.
        display: 'var(--font-display)',
        sans: 'var(--font-sans)',
      },
      // Fluid type — scales continuously instead of jumping at breakpoints.
      fontSize: {
        'fluid-xs': ['clamp(0.75rem, 0.73rem + 0.1vw, 0.8125rem)', { lineHeight: '1.5' }],
        'fluid-sm': ['clamp(0.8125rem, 0.79rem + 0.12vw, 0.875rem)', { lineHeight: '1.6' }],
        'fluid-base': ['clamp(0.9375rem, 0.91rem + 0.14vw, 1rem)', { lineHeight: '1.7' }],
        'fluid-lead': ['clamp(1rem, 0.95rem + 0.3vw, 1.1875rem)', { lineHeight: '1.65' }],
        'fluid-h4': ['clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)', { lineHeight: '1.4' }],
        'fluid-h3': ['clamp(1.25rem, 1.13rem + 0.55vw, 1.625rem)', { lineHeight: '1.3' }],
        'fluid-h2': ['clamp(1.75rem, 1.35rem + 1.8vw, 3rem)', { lineHeight: '1.12', letterSpacing: '-0.02em' }],
        'fluid-h1': ['clamp(2.125rem, 1.4rem + 3.2vw, 4rem)', { lineHeight: '1.06', letterSpacing: '-0.025em' }],
        'fluid-stat': ['clamp(1.875rem, 1.4rem + 2.1vw, 3.25rem)', { lineHeight: '1', letterSpacing: '-0.03em' }],
      },
      spacing: {
        section: 'clamp(3.5rem, 2.2rem + 5.5vw, 7.5rem)',
        gutter: 'clamp(1.125rem, 0.8rem + 1.6vw, 2.5rem)',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        panel: 'var(--radius-panel)',
        pill: '999px',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(11, 42, 35, 0.04), 0 8px 24px -12px rgba(11, 42, 35, 0.12)',
        lift: '0 2px 4px rgba(11, 42, 35, 0.04), 0 24px 48px -20px rgba(11, 42, 35, 0.24)',
        glass: '0 1px 0 rgba(255,255,255,0.6) inset, 0 8px 32px -12px rgba(11, 42, 35, 0.18)',
        ring: '0 0 0 1px rgba(15, 58, 48, 0.08)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 240 240' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E\")",
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.9)', opacity: '0.55' },
          '70%': { transform: 'scale(1.6)', opacity: '0' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'shimmer': {
          '100%': { transform: 'translateX(100%)' },
        },
        'float-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'pulse-ring': 'pulse-ring 2.4s cubic-bezier(0.24, 0, 0.38, 1) infinite',
        marquee: 'marquee 38s linear infinite',
        shimmer: 'shimmer 1.8s infinite',
        'float-slow': 'float-slow 7s ease-in-out infinite',
      },
      transitionTimingFunction: {
        premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
