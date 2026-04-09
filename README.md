# SocialCaution — Personalized Privacy Platform

![SocialCaution Logo](public/socialcaution.png)

**A persona-based privacy platform.** Protecting your digital life, your way.

[![License](https://img.shields.io/badge/license-Proprietary-red.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7.2-purple)](https://vitejs.dev/)

> **Privacy by Design**: Your data never leaves your device. Zero data collection. 100% client-side processing.

---

## Features

### Assessment & Analysis

- **Privacy Exposure Assessment** (`/assessment/exposure`) — Evaluates your digital vulnerability across the services you use. Generates a 0–100 Exposure Score using an 8-factor model. ~8 minutes.
- **Privacy Rights Checkup** (`/assessment/privacy-rights`) — Tests your working knowledge of GDPR, CCPA, PIPEDA, and LGPD so you know which rights to exercise and how. ~7 minutes.
- **9 Privacy Personas** — Client-side persona detection engine maps your answers to one of 9 profiles (Cautious Parent, Digital Novice, Privacy Advocate, Online Shopper, Social Influencer, Private Individual, Concerned Employee, Data Controller, Student). Dashboard recommendations, resources, and tools adapt accordingly.
- **Digital Footprint Analysis** — Aggregates Privacy Exposure Indices from all monitored services into a unified 0–100 Digital Footprint Score with factor-level breakdowns.

### Service Intelligence

- **222-service catalog** — Every service has a computed Privacy Exposure Index (0–100) built from 8 weighted factors: Typical Privacy Risks, Known Privacy Issues, Data Breach History, Regulatory Oversight, Parent Company & Siblings, Data Sensitivity Category, User Control & Privacy by Default, Third-Party Data Sharing.
- **Service Relationship Mapping** — Understand which services share data through parent company relationships and sibling services.
- **Service Monitoring** — Add services to your monitoring list and receive alerts when their privacy posture changes (policy updates, data breaches, regulatory actions).
- **RSS Alert Feed** — Aggregated real-time alerts from multiple open-source privacy feeds, scoped to your monitored services.
- **Trends Tracker** — Privacy regulation timeline and enforcement updates relevant to your monitored services.

### Personalization & Dashboard

- **Adaptive Dashboard** — Personalised recommendations, priority actions, resource list, and quick tools — all computed from your persona, exposure score, and monitored services.
- **Progressive Module Gating** — Advanced modules (Trends Tracker, RSS Alerts, Privacy Radar) unlock after completing both assessments and monitoring ≥ 3 services. New users see a guided "Your next step" prompt instead.
- **Curated Resources** — 100+ privacy guides and educational content selected for your persona and risk level.
- **Interactive Action Planner** — Create, prioritise, and track privacy improvement tasks. Actions are sorted into Critical / Important / Long-term / Quick Wins categories.
- **Quick Wins** — After every assessment, the top 3 immediately actionable steps surface at the top of results so users have instant momentum.

### Privacy Tools (all client-side)

| Tool | Path | What it does |
|------|------|-------------|
| **AI Message Risk Checker** | `/message-checker` | Detects phishing patterns and manipulation signals in emails, SMS, and notifications |
| **Email Header Analyzer** | `/tools/ai/email-analyzer` | Extracts and audits email header metadata for spoofing and routing anomalies |
| **Image Metadata Analyzer** | `/tools/ai/image-analyzer` | Strips and reports EXIF/XMP metadata embedded in photos |
| **Social Profile Verifier** | `/tools/ai/profile-verifier` | Identifies signals of fake or compromised social accounts |
| **Personal Data Inventory** | `/tools/personal-data-inventory` | Track what personal data you share across services |
| **Data Broker Removal** | `/tools/data-broker-removal` | Guided removal requests for major data broker sites |
| **Privacy Assistant Bot** | `/privacy-assistant` | Conversational privacy guidance tailored to your persona |
| **Exposure Report** | `/tools/exposure-report` | Downloadable PDF/CSV summary of your exposure score and monitored services |
| **Privacy Calendar 2026** | `/privacy-calendar` | 12-month privacy improvement journey with monthly themes and weekly tasks |

### Internationalisation

Three languages supported out of the box, with browser-preference detection and localStorage persistence:

- English (`en`) — default, always available synchronously
- French (`fr`)
- Spanish (`es`)

RTL layout hooks are implemented and prepared for Arabic, Hebrew, Farsi, and Urdu.

### Progressive Web App

Fully configured PWA with:

- **4 home-screen shortcuts**: Quick Assessment, Dashboard, Services Catalog, Analyzer
- Offline support via service worker (Workbox)
- **Share target** — accept shared URLs directly from the OS share sheet
- **Protocol handler** — `web+privacy://` links open in the app
- Edge Side Panel support (400 px pinned view)
- Install prompt + update notification built into the app shell

---

## Privacy by Design

Everything listed above runs entirely in your browser. No accounts are required, and personal data never touches a server unless you explicitly opt into the premium encrypted export.

### Free Tier

| Limit | Value |
|-------|-------|
| Assessments per month | 3 |
| Services monitored | up to 5 |
| PDF exports | 1 per month |
| Excel / JSON exports | Not available |
| Cloud sync | None (localStorage only) |
| Accounts required | No |

### Premium Tier ($2.99/month or $24.99/year)

Everything in Free, plus:

- Unlimited assessments
- Unlimited service monitoring
- Full Digital Footprint Analysis (factor-level detail)
- Unlimited PDF, Excel, CSV, and JSON exports
- Optional encrypted cloud sync (AES-256-GCM, client-side encryption — zero-knowledge)
- Multi-device access
- Assessment history and score tracking
- Faster email support
- Early access to new features

### Family Plan *(Coming Soon)*

Planned at $7.99/month — everything in Premium plus shared family dashboard, up to 5 members, child-safety features, family privacy reports.

---

## Architecture

### Frontend

- **React 18.3** + TypeScript 5.9
- **Vite 7.2** — fast HMR, optimised chunk splitting (main bundle ≈ 101 KB uncompressed / ≈ 26 KB gzipped after 70% reduction)
- **Tailwind CSS 3.4** — utility-first responsive design
- **React Router v7.9** — lazy-loaded routes, 40+ paths
- **Zustand 5.0** — lightweight global state (`cautionStore`)
- **Framer Motion 12** — page transitions and micro-interactions
- **Lucide React** — icon library

### State & Storage

- `useLocalStorage` hook — all user state (persona, results, services, profile) persisted to `localStorage` keys:
  - `socialcaution_persona`
  - `socialcaution_results`
  - `socialcaution_services`
  - `socialcaution_profile`
  - `socialcaution_service_notifications`
  - `socialcaution_language`
- **HybridStorageService** — automatically selects localStorage (free) or Supabase (premium) based on subscription tier.

### Backend & Services

- **Supabase** (PostgreSQL) — premium-only encrypted data export
- **Stripe** — subscriptions and one-time purchases, customer portal
- **Netlify Functions** — Stripe webhook handlers, RSS proxy
- **SendGrid** — transactional email (optional)

### Data Pipeline

- **Privacy Exposure Index** (`src/utils/privacyExposureIndex.js`) — 8-factor scoring, methodology v2.5.0
- **PersonaDetectionEngine** (`src/utils/personaDetection.js`) — maps assessment answers to persona profiles entirely in the browser
- **rss-parser** — parses multiple open-source privacy feed URLs
- **jsPDF** — client-side PDF report generation
- **Web Vitals** — Core Web Vitals monitoring

---

## Routes

### Public

| Path | Description |
|------|-------------|
| `/` | Homepage — 3-step journey, trust indicators |
| `/how-it-works` | Step-by-step product guide |
| `/pricing` | Free vs Premium plans (context-aware "Best for your profile" badge) |
| `/faq` | Frequently asked questions |
| `/tutorial` | Interactive onboarding tutorial |
| `/support` | Support & contact |
| `/contact` | Contact form |
| `/download` | PWA install instructions |

### Assessments

| Path | Description |
|------|-------------|
| `/assessment` | Assessment hub — two cards, value hook, collapsible disclaimer |
| `/assessment/exposure` | Privacy Exposure Assessment (~8 min) |
| `/assessment/privacy-rights` | Privacy Rights Checkup (~7 min) |

### Dashboard & Personalisation

| Path | Description |
|------|-------------|
| `/dashboard` or `/my-dashboard` | Personalised dashboard (requires workflow completion) |
| `/persona-selection` | Manual persona selection |
| `/privacy-settings` or `/privacy-focus` | Privacy concern preferences |
| `/settings` | Account settings |
| `/my-services` | Monitored services management |
| `/exposure-dashboard` | Exposure index drilldown |
| `/digital-footprint-analysis` | Digital Footprint Analysis landing page |

### Service Catalog & Monitoring

| Path | Description |
|------|-------------|
| `/service-catalog` | 222-service catalog with "Monitor" CTA, risk badges, filtering |
| `/alerts` | RSS-aggregated live privacy alerts |
| `/trends-tracker` or `/privacy-regulations` | Regulation & enforcement timeline |
| `/privacy-radar` | Real-time privacy monitoring widget |

### Tools & Resources

| Path | Description |
|------|-------------|
| `/toolkit` or `/adaptive-resources` | Personalised privacy toolkit |
| `/privacy-tools` | External tools directory |
| `/message-checker` | AI Message Risk Checker |
| `/tools/message-checker` | Alias |
| `/tools/personal-data-inventory` | Personal Data Inventory |
| `/tools/data-broker-removal` | Data Broker Removal |
| `/tools/exposure-report` | Exposure Report generator |
| `/tools/ai/image-analyzer` | Image Metadata Analyzer |
| `/tools/ai/email-analyzer` | Email Header Analyzer |
| `/tools/ai/profile-verifier` | Social Profile Verifier |
| `/privacy-assistant` | Privacy Assistant Bot |
| `/action-planner` | Interactive Action Planner |
| `/privacy-calendar` | Privacy Calendar 2026 |
| `/privacy-calendar-standalone` | Standalone freemium calendar |

### Premium & Enterprise

| Path | Description |
|------|-------------|
| `/premium/templates` | Premium report templates ($19 one-time) |
| `/services/audit` | Professional privacy audit ($299 one-time) |
| `/enterprise/pricing` | Enterprise plans ($99–custom/month) |
| `/courses` | Privacy courses ($49–$199) |
| `/checkout/success` | Stripe post-checkout handler |

### Legal

`/privacy-policy` · `/terms` · `/cookie-policy` · `/acceptable-use-policy` · `/privacy-exposure-disclaimer`

---

## Project Structure

```
src/
├── components/
│   ├── ai/                     # Client-side AI tools
│   │   ├── AICheckMessagePanel.tsx
│   │   ├── EmailHeaderAnalyzer.tsx
│   │   ├── ImageMetadataAnalyzer.tsx
│   │   └── SocialProfileVerifier.tsx
│   ├── alerts/                 # RSS feed and notification components
│   ├── assessments/            # Assessment flow
│   │   ├── AssessmentRouter.jsx
│   │   ├── AssessmentResults.jsx      # Sticky CTA bar + Quick Wins
│   │   ├── AssessmentStartScreen.jsx
│   │   ├── PrivacyRiskExposure.jsx
│   │   ├── PrivacyRightsCheckup.jsx
│   │   └── SecurityAssessment.jsx
│   ├── common/                 # Shared UI components (20+)
│   ├── dashboard/              # Dashboard subcomponents
│   │   ├── CompactProgressTracker.jsx
│   │   ├── TrendsTrackerModule.jsx
│   │   └── PrivacyRadarWidget.jsx
│   ├── home/                   # Homepage sections
│   │   ├── Hero.jsx            # Single CTA → /service-catalog
│   │   └── WhatYouCanDoSection.jsx   # 3-step How It Works
│   ├── layout/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx          # Legal section de-emphasised
│   │   └── SecondaryNavigationBar.jsx  # Progress bar gated at 0%
│   ├── navigation/
│   ├── pages/
│   │   ├── AssessmentPage.jsx  # Collapsible disclaimer, value hook
│   │   ├── PricingPage.jsx     # Trust banner, Best-for-profile badge
│   │   └── ...
│   ├── subscription/
│   ├── PersonalizedDashboard.jsx  # Progressive module gating
│   ├── ServiceCatalog.jsx         # "Monitor" primary CTA
│   ├── DigitalFootprintAnalysis.jsx
│   ├── WorkflowCompletionGuide.jsx
│   └── ...
├── contexts/
│   ├── TranslationContext.jsx  # i18n: en / fr / es
│   ├── ThemeContext.jsx
│   └── CookieConsentContext.jsx
├── data/
│   ├── serviceCatalog.js       # 222 services
│   ├── serviceCatalogEnhanced.js
│   ├── serviceRiskProfiles.js  # Risk profiles for all 222 services
│   ├── serviceRelationships.js # Parent/sibling data-sharing map
│   ├── personaProfiles.js      # 9 persona definitions
│   ├── personaServiceHints.js
│   ├── resources.js
│   └── tools.js
├── hooks/
│   └── useLocalStorage.js
├── services/
│   └── subscriptionService.js
├── utils/
│   ├── personaDetection.js     # Client-side persona engine
│   ├── privacyExposureIndex.js # 8-factor scoring (v2.5.0)
│   ├── digitalFootprintCalculator.js
│   ├── workflowCheck.js
│   ├── assessmentScoring.js
│   ├── serviceNotifications.js
│   ├── analytics.js
│   └── security.js
└── config/
    └── stripe.ts               # Tier definitions and limits
```

---

## Installation

```bash
git clone https://github.com/Facely1er/socialcaution2026-pro.git
cd socialcaution2026-pro
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Development Scripts

```bash
npm run dev              # Development server with HMR
npm run build            # Production build
npm run preview          # Preview production build locally
npm run test             # Vitest in watch mode
npm run test:run         # Vitest single run
npm run test:coverage    # Test coverage report
npm run lint             # ESLint
npm run type-check       # TypeScript type checking
npm run audit:risk-profiles  # Verify 222/222 services have risk profiles

# Deployment
npm run deploy:production  # lint + type-check + build
npm run deploy:staging
npm run deploy
```

---

## Environment Variables

Create `.env.local` (see `.env.example` for the full template).

### Frontend (`VITE_` prefix — exposed to the browser)

```env
# Analytics (optional)
VITE_REACT_APP_GA_ID=
VITE_REACT_APP_ANALYTICS_ENABLED=true

# Error monitoring (optional)
VITE_REACT_APP_SENTRY_DSN=
VITE_REACT_APP_ERROR_REPORTING_ENABLED=true

# Support
VITE_REACT_APP_SUPPORT_EMAIL=support@ermits.com

# Supabase (premium encrypted export)
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=
VITE_STRIPE_PRICE_PREMIUM=
VITE_STRIPE_PRICE_PREMIUM_ANNUAL=
```

### Backend — Netlify Functions only (no `VITE_` prefix — never exposed to the browser)

```env
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

---

## Deployment

### Netlify (recommended — required for Stripe webhooks)

```bash
npm run deploy:production
```

The `dist/` folder is a complete static site. Any CDN/hosting platform works for the frontend alone (Vercel, Cloudflare Pages, GitHub Pages, AWS S3 + CloudFront).

See [STRIPE_INTEGRATION_COMPLETE.md](STRIPE_INTEGRATION_COMPLETE.md) for Stripe webhook setup.

---

## Security

- **Content Security Policy** headers
- **Input sanitisation** and XSS protection throughout
- **Secure response headers** (`X-Frame-Options`, `X-Content-Type-Options`, etc.)
- Service role keys and Stripe secret keys are **never** exposed to the browser
- All AI tool processing is fully client-side — no user content is transmitted to any server

```bash
npm audit          # Check for vulnerabilities
npm audit fix      # Auto-fix where possible
```

---

## Performance

| Metric | Value |
|--------|-------|
| Main bundle (uncompressed) | ~101 KB |
| Main bundle (gzipped) | ~26 KB |
| Bundle reduction vs baseline | ~70% |
| Route loading | Lazy (all major routes) |
| Offline support | Service worker (Workbox) |
| Core Web Vitals | Monitored via web-vitals |

---

## Testing

```bash
npm run test             # Watch mode (Vitest + React Testing Library)
npm run test:run         # Single run
npm run test:coverage    # Coverage report
```

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| UI framework | React 18.3 + TypeScript 5.9 |
| Build tool | Vite 7.2 |
| Styling | Tailwind CSS 3.4 |
| Routing | React Router v7.9 |
| State | Zustand 5.0 |
| Animations | Framer Motion 12 |
| Icons | Lucide React |
| Testing | Vitest + React Testing Library |
| Database | Supabase (PostgreSQL) — premium only |
| Payments | Stripe |
| Serverless | Netlify Functions |
| Email | SendGrid (optional) |
| RSS | rss-parser |
| PDF | jsPDF |
| Error tracking | Sentry (optional) |
| Analytics | Google Analytics — privacy-enhanced, optional |
| Privacy law basis | GDPR · CCPA · PIPEDA · LGPD |

---

## Contributing

This is a private repository. Contributions are by invitation only.

1. Create a feature branch from `main`: `git checkout -b feature/your-feature`
2. Make changes and add tests
3. Run `npm run lint && npm run test:run`
4. Commit and push, then open a pull request for review

---

## License

Copyright (c) 2026 ERMITS LLC. All rights reserved.

This is proprietary software. No permission is granted to use, copy, modify,
distribute, or sublicense this software without the express prior written
consent of ERMITS LLC. See [LICENSE](LICENSE) for full terms.

For licensing enquiries: legal@ermits.com

---

## Support

- **Email**: support@ermits.com
- **Licensing enquiries**: legal@ermits.com

---

*Your data never leaves your device.* 🛡️
