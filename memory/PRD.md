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
│   └── email.py           # Email service
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
│       └── ...
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
  - Campagnes aanmaken per service/stad
  - Keyword management met suggesties
  - Budget tracking
  - Status beheer (Concept, Actief, Gepauzeerd)
- ✅ City Pages Overview voor Google Ads
  - Alle 120 landing page URLs
  - UTM parameter configuratie
  - Kopieer & export functie
- ✅ **Google Ads Editor CSV Export** (NIEUW)
  - ~2,510 keywords totaal
  - Loodgieter: ~879 keywords
  - Slotenmaker: ~788 keywords
  - Elektricien: ~843 keywords
  - 3 campagnes, ~100 advertentiegroepen
  - Phrase match + Exact match keywords
  - Responsive search ads per stad
- ✅ **Google Ads Conversion Tracking** (NIEUW)
  - `conversion_event_book_appointment` event
  - Triggert bij succesvolle boeking
  - Geïntegreerd in BookingPage.jsx

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

### SEO
- GET /api/seo/problems
- GET /api/seo/problems/{slug}
- GET /api/seo/cities
- GET /api/seo/cities/{city}/{service}
- GET /api/seo/services

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://...
DB_NAME=...
JWT_SECRET=... (required, no default)
STRIPE_API_KEY=...
SMTP_HOST=smtp.transip.email
SMTP_PORT=465
SMTP_USER=info@spoeddienst24.nl
SMTP_PASSWORD=...
SMTP_FROM=info@spoeddienst24.nl
FRONTEND_URL=https://spoeddienst24.nl
ADMIN_EMAIL=admin@spoeddienst24.nl
ADMIN_PASSWORD=... (required for admin setup)
CORS_ORIGINS=*
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=https://spoeddienst24.nl
```

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

## Backlog / Future Tasks
- P1: Google Ads API integratie (directe campagne-creatie - vereist Developer Token)
- P2: Campaign Planner data persistent maken in MongoDB
- P2: Code refactoring voltooien (routes extractie)
- P3: Belgische versie (spoeddienst24.be)
- P4: Native mobiele app (iOS/Android)

## Laatste Update
26 januari 2025 - Google Ads Editor CSV Export (~2510 keywords) en Conversion Tracking toegevoegd
