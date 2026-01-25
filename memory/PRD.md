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

## Code Architectuur (Na Refactoring)

### Backend Structuur
```
/app/backend/
├── server.py              # Hoofdbestand met alle routes (werkend)
├── server_backup.py       # Backup van originele server.py
├── config/
│   ├── __init__.py
│   └── database.py        # DB connectie, JWT config, auth helpers
├── models/
│   ├── __init__.py
│   └── schemas.py         # Pydantic models (User, Vakman, Booking, etc.)
├── services/
│   ├── __init__.py
│   └── email.py           # Email service functies
├── routes/                # Route bestanden (referentie voor migratie)
│   ├── __init__.py
│   ├── auth.py            # Auth routes (login, register, reset)
│   └── bookings.py        # Booking routes (CRUD, vakman accept)
└── tests/
```

### Frontend Structuur
```
/app/frontend/src/
├── pages/
│   ├── AdminDashboard.jsx
│   ├── VakmanDashboard.jsx
│   ├── BookingPage.jsx
│   └── ...
├── components/
│   ├── ui/                # Shadcn componenten
│   └── admin/             # Admin dashboard componenten
│       ├── index.js
│       ├── adminConstants.js  # Constants, templates, helpers
│       ├── AdminStatsCards.jsx
│       └── AdminTabs.jsx
```

## Huidige Flow

### Klant Boekingsflow (4 stappen)
1. **Probleem** - Beschrijving + Regulier/Spoed
2. **Datum** - Datum en tijdslot
3. **Adres** - Straat, postcode, plaats
4. **Contact** - Naam, email, telefoon

### Admin → Vakman Flow
1. Admin ontvangt boeking (status: `pending`)
2. Admin wijst toe aan vakman (status: `confirmed`)
3. Vakman accepteert (status: `accepted`) of wijst af (terug naar `pending`)
4. Vakman voert klus uit (status: `in_progress` → `completed`)

## Status Flow
```
pending → confirmed → accepted → in_progress → completed
    ↑                    |
    └──── (afwijzing) ───┘
```

## Voltooide Features
- [x] Service pagina's (elektricien, loodgieter, slotenmaker)
- [x] Boekingsflow met 4 stappen
- [x] Admin Dashboard (beveiligd) met toewijzing
- [x] Vakman Dashboard met acceptatie/afwijzing
- [x] Email notificaties (klant, admin, vakman)
- [x] Wachtwoord vergeten flow
- [x] Vakman registratie (KVK/BTW/Verzekering)
- [x] Review systeem
- [x] Premium lidmaatschap (Stripe)

## Refactoring Status

### Voltooid ✅
- [x] Backend: Pydantic models → `/models/schemas.py`
- [x] Backend: Email service → `/services/email.py`
- [x] Backend: Database config → `/config/database.py`
- [x] Backend: Auth routes → `/routes/auth.py` (referentie)
- [x] Backend: Booking routes → `/routes/bookings.py` (referentie)
- [x] Frontend: Admin componenten → `/components/admin/`

### Nog te doen (optioneel)
- [ ] Backend: Routes volledig migreren naar aparte bestanden
- [ ] Frontend: AdminDashboard verder opsplitsen in tab-componenten
- [ ] Backend: Vakman routes naar `/routes/vakmannen.py`
- [ ] Backend: Admin routes naar `/routes/admin.py`

## Test Accounts
- **Admin**: admin@spoeddienst24.nl / Admin2024!
- **Monteur**: monteur@test.nl / Test1234
- **Klant**: klant@test.nl / Test1234

## Openstaande Items
- **P1**: Google Ads API integratie (credentials nodig)
- **P3**: Belgische versie (spoeddienst24.be)

## Laatste Update
- **Datum**: 24 januari 2025
- **Sessie**: Code refactoring - Backend models/services/config + routes referentie bestanden + Frontend admin componenten
- **Status**: Applicatie werkt volledig, refactoring bestanden zijn aangemaakt als referentie
