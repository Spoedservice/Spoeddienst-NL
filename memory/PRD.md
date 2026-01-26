# SpoedDienst24.nl - Product Requirements Document

## Project Overzicht
Een platform voor het boeken van vakmannen (elektricien, loodgieter, slotenmaker) met focus op spoedklussen, vergelijkbaar met zoofy.nl.

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Email**: aiosmtplib met TransIP SMTP
- **Payments**: Stripe
- **Authenticatie**: JWT
- **Analytics**: Google Analytics + Google Ads Conversion Tracking
- **Email Marketing**: Custom geautomatiseerd systeem

## Code Architectuur

### Backend Structuur
```
/app/backend/
├── server.py              # Hoofdbestand met alle routes
├── config/
│   └── database.py        # DB connectie, JWT config
├── models/
│   └── schemas.py         # Pydantic models
├── services/
│   ├── email.py           # Email service
│   └── email_marketing.py # Email marketing automation (NIEUW)
├── routes/
│   ├── auth.py            # Auth routes
│   └── bookings.py        # Booking routes
├── uploads/               # Uploaded files (photos)
└── .env                   # Environment variables
```

### Frontend Structuur
```
/app/frontend/src/
├── pages/
│   ├── AdminDashboard.jsx    # Admin dashboard
│   ├── VakmanDashboard.jsx   # Vakman dashboard
│   ├── BookingPage.jsx       # Booking form (met conversion tracking)
│   ├── LandingPage.jsx       # Homepage
│   ├── ProblemPage.jsx       # SEO problem pages
│   ├── CityServicePage.jsx   # SEO city pages
│   └── ...
├── components/
│   ├── ui/                   # Shadcn components
│   └── admin/
│       ├── CampaignPlanner.jsx    # Google Ads planner
│       ├── CityPagesOverview.jsx  # City pages for ads + CSV export
│       └── EmailMarketing.jsx     # Email marketing dashboard (NIEUW)
├── data/
│   └── keywordsDatabase.js   # ~1000 keywords database
├── utils/
│   └── googleAdsGenerator.js # Google Ads Editor CSV generator
└── App.js
```

## Geïmplementeerde Features

### Core Features (Compleet)
- ✅ Klant boekingssysteem met foto upload
- ✅ Vakman registratie (KVK, BTW, verzekering)
- ✅ Admin dashboard met booking management
- ✅ Admin wijst boekingen toe aan vakmannen
- ✅ Vakman accepteert/wijst af vanuit dashboard
- ✅ Email notificaties (klant, admin, vakman)
- ✅ Review systeem
- ✅ Premium lidmaatschap (Stripe)
- ✅ Wachtwoord vergeten functionaliteit
- ✅ Role-based access control

### SEO Features (Compleet - 25 Jan 2025)
- ✅ Homepage SEO optimalisatie
  - H1: "24/7 Spoed Loodgieter, Slotenmaker & Elektricien"
  - Meta tags, Open Graph, Schema.org
  - Populaire zoeksuggesties
- ✅ 12 Probleem-pagina's:
  - Loodgieter: /lekkage-spoed, /wc-verstopt-spoed, /riool-verstopt, /afvoer-verstopt
  - Slotenmaker: /buitengesloten, /sleutel-afgebroken, /slot-vervangen, /inbraakschade
  - Elektricien: /stroomstoring, /kortsluiting, /groepenkast-storing, /aardlekschakelaar
- ✅ 120 City-pagina's (40 steden × 3 diensten):
  - /spoed-loodgieter/[stad]
  - /spoed-slotenmaker/[stad]
  - /spoed-elektricien/[stad]

### Google Ads Features (Compleet - 26 Jan 2025)
- ✅ Campagne Planner in Admin Dashboard
- ✅ City Pages Overview voor Google Ads
- ✅ **Google Ads Editor CSV Export** (~2,510 keywords)
- ✅ **Google Ads Conversion Tracking** (`conversion_event_book_appointment`)

### Email Marketing Features (NIEUW - 26 Jan 2025)
- ✅ **Welkomstmail Klant** - Automatisch bij registratie
- ✅ **Welkomstmail Vakman** - Automatisch bij aanmelding
- ✅ **Review Herinnering** - Automatisch X dagen na voltooide klus (instelbaar: 1-7 dagen)
- ✅ **Inactieve Klant Heractivatie** - Automatisch na X dagen inactiviteit (instelbaar: 30-180 dagen)
- ✅ **Seizoenscampagnes** - Handmatig versturen (Winter, Voorjaar, Zomer, Herfst)
- ✅ **Handmatig Emails Versturen** - Naar geselecteerde ontvangers
- ✅ **Templates Beheer** - Onderwerp en HTML aanpassen per email type
- ✅ **Verzendgeschiedenis** - Overzicht van alle verstuurde emails
- ✅ **Statistieken Dashboard** - Totaal verstuurd, succes rate, uitschrijvingen
- ✅ **GDPR Compliant** - Uitschrijflink in alle marketing emails
- ✅ **Email Wachtrij** - Geplande emails worden automatisch verstuurd

## API Endpoints

### Auth
- POST /api/auth/login
- POST /api/auth/register
- POST /api/auth/vakman/register
- POST /api/wachtwoord-vergeten
- POST /api/reset-wachtwoord

### Bookings
- GET /api/bookings
- POST /api/bookings
- POST /api/bookings/upload-photo
- POST /api/bookings/{id}/assign
- POST /api/bookings/{id}/vakman-accept
- POST /api/bookings/{id}/vakman-reject

### Admin
- GET /api/admin/bookings
- GET /api/admin/vakmannen
- GET /api/admin/campaigns
- POST /api/admin/campaigns
- PUT /api/admin/campaigns/{id}
- DELETE /api/admin/campaigns/{id}

### Email Marketing (NIEUW)
- GET /api/admin/email-marketing/statistics
- GET /api/admin/email-marketing/recent
- GET /api/admin/email-marketing/templates
- PUT /api/admin/email-marketing/templates/{type}
- GET /api/admin/email-marketing/campaigns
- PUT /api/admin/email-marketing/campaigns/{type}
- POST /api/admin/email-marketing/send-manual
- POST /api/admin/email-marketing/send-seasonal
- POST /api/admin/email-marketing/process-queue
- GET /api/admin/email-marketing/queue
- GET /api/uitschrijven (public - unsubscribe)

### SEO
- GET /api/seo/problems
- GET /api/seo/problems/{slug}
- GET /api/seo/cities
- GET /api/seo/cities/{city}/{service}
- GET /api/seo/services

## Database Collections

### Email Marketing Collections (NIEUW)
- `email_templates` - Email templates per type
- `email_campaigns` - Campagne-instellingen (triggers, timing)
- `sent_emails` - Verzendgeschiedenis
- `email_preferences` - Uitschrijvingen (GDPR)
- `email_queue` - Geplande emails

## Test Credentials
- **Admin**: admin@spoeddienst24.nl / Casblanca123!
- **Monteur**: monteur@test.nl / Test1234
- **Klant**: klant@test.nl / Test1234

## Deployment Status
- ✅ Backend API health check passed
- ✅ Frontend build successful
- ✅ Database connection working
- ✅ Authentication system working
- ✅ No hardcoded secrets (moved to env)
- ✅ Supervisor configuration present
- ✅ Google Ads tracking geïmplementeerd
- ✅ Email Marketing systeem actief

## Backlog / Future Tasks
- P1: Google Ads API directe integratie (vereist Developer Token)
- P2: Campaign Planner data persistent maken in MongoDB
- P2: Code refactoring voltooien (routes extractie)
- P3: Belgische versie (spoeddienst24.be)
- P4: Native mobiele app (iOS/Android)

## Laatste Update
26 januari 2025 - Email Marketing systeem toegevoegd met automatische en handmatige emails
