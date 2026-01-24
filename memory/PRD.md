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

## Huidige Flow

### Klant Boekingsflow (4 stappen)
1. **Probleem** - Beschrijving + Regulier/Spoed keuze
2. **Datum** - Datum en tijdslot selecteren
3. **Adres** - Straat, postcode, plaats
4. **Contact** - Naam, email, telefoon + bevestigen

**Belangrijk**: De klant kiest GEEN monteur. Boekingen komen binnen bij admin.

### Admin Workflow
1. Admin ontvangt email bij nieuwe boeking
2. Admin opent dashboard (`/beheer`)
3. In de Boekingen tab ziet admin alle boekingen met een "Monteur" kolom
4. Boekingen zonder monteur tonen "⚠️ Wijs toe" dropdown
5. Admin selecteert een monteur uit de dropdown
6. Systeem wijst boeking toe + stuurt email naar die specifieke monteur

## Voltooide Features

### Kernfunctionaliteit
- [x] Service pagina's (elektricien, loodgieter, slotenmaker)
- [x] Boekingsflow met 4 stappen (Probleem → Datum → Adres → Contact)
- [x] Spoed vs Regulier prijzen
- [x] Betaling bij de monteur

### Admin Boeking Toewijzing (NIEUW)
- [x] Boekingen komen binnen zonder toegewezen monteur
- [x] Admin Dashboard met "Monteur" kolom
- [x] Dropdown om boeking toe te wijzen aan vakman
- [x] `POST /api/admin/booking/{id}/assign` endpoint
- [x] Email notificatie naar toegewezen monteur

### Gebruikersbeheer
- [x] Klant registratie en login
- [x] Vakman registratie met KVK/BTW/Verzekering
- [x] Dubbele registratie preventie
- [x] Auto-login na vakman registratie
- [x] Wachtwoord vergeten flow
- [x] JWT authenticatie

### Dashboards
- [x] Klant dashboard
- [x] Vakman dashboard (opdrachten, agenda, profiel)
- [x] **Admin dashboard (BEVEILIGD)**
  - Overzicht met statistieken
  - Boekingen beheer + **Monteur toewijzing**
  - Vakmannen beheer (goedkeuren/afwijzen)
  - Reviews beheer
  - Financieel dashboard
  - Marketing dashboard (MOCKED)

### Email Systeem
- [x] Boekingsbevestiging naar klant
- [x] Boekingsnotificatie naar admin
- [x] **Notificatie naar toegewezen monteur** (na admin toewijzing)
- [x] Goedkeuring/afwijzing emails voor vakmannen
- [x] Wachtwoord reset emails

### Beveiliging
- [x] Admin endpoints beveiligd met role-based authenticatie
- [x] Admin link alleen zichtbaar voor admin gebruikers
- [x] JWT token verificatie

## API Endpoints

### Nieuw toegevoegd (deze sessie)
- `POST /api/admin/booking/{booking_id}/assign` - Wijs boeking toe aan vakman (admin only)
  - Request: `{"vakman_id": "uuid"}`
  - Response: `{"message": "...", "vakman_name": "...", "vakman_id": "..."}`
  - Stuurt email naar toegewezen vakman

### Belangrijke endpoints
- `POST /api/bookings` - Maakt boeking aan (ZONDER vakman_id)
- `GET /api/admin/bookings` - Alle boekingen (beveiligd)
- `GET /api/admin/vakmannen` - Alle vakmannen voor toewijzing (beveiligd)

## Database Schema

### bookings collectie
```json
{
  "id": "uuid",
  "vakman_id": "uuid | null",  // null tot admin toewijst
  "vakman_name": "string | null",
  "service_type": "elektricien|loodgieter|slotenmaker",
  "is_emergency": "boolean",
  "customer_name": "string",
  "customer_email": "string",
  "customer_phone": "string",
  "address": "string",
  "postal_code": "string",
  "city": "string",
  "preferred_date": "string",
  "preferred_time": "string",
  "description": "string",
  "price": "float",
  "status": "pending|confirmed|in_progress|completed|cancelled"
}
```

## Test Accounts
- **Admin**: admin@spoeddienst24.nl / Admin2024!
- **Monteur**: monteur@test.nl / Test1234
- **Klant**: klant@test.nl / Test1234

## Openstaande Items

### P1 - Hoog
- [ ] Google Ads API integratie (Marketing dashboard is nu MOCKED)

### P2 - Medium
- [ ] Component refactoring (AdminDashboard.jsx ~1400 regels)
- [ ] server.py opsplitsen in modules

### P3 - Laag (Backlog)
- [ ] Belgische versie (spoeddienst24.be)
- [ ] Native mobiele app

## Laatste Update
- **Datum**: 24 januari 2025
- **Sessie**: Admin boeking toewijzing feature voltooid
- **Verandering**: Klanten kiezen NIET meer zelf een monteur. Admin wijst boekingen toe via dashboard.
- **Tests**: 100% geslaagd (10 backend, frontend verified)
